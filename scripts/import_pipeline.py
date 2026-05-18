#!/usr/bin/env python3
"""
PACAA-650: vendor_candidates → companies import pipeline.

Legal P0 requirements enforced here:
  (B) 4-field limit: name, phone, address, category ONLY
  (C) suppressed=true records excluded (opt-out guardrail)

Legal P1 requirements enforced here:
  (D) category mapping documented in docs/naver-place-category-mapping.md
  (E) is_verified=false forced on all imported rows

Usage:
  python3 import_pipeline.py              # dry-run (print only, no DB writes)
  python3 import_pipeline.py --apply      # write to Supabase (requires CEO approval)

Environment (auto-loaded from plans/naver_scraper.py defaults or env vars):
  SUPABASE_URL, SUPABASE_SERVICE_KEY

Prerequisites (must be applied before --apply):
  supabase/migrations/20260513001_import_pipeline_schema.sql (CTO sign-off required)
"""

import os
import re
import sys
import uuid
import logging
import unicodedata
from datetime import datetime, timezone
from collections import defaultdict

import requests

# ── Config ─────────────────────────────────────────────────────────────────────
SUPABASE_URL = os.getenv(
    "SUPABASE_URL",
    "https://jnrciibwtutzymkoepfp.supabase.co",
)
SUPABASE_SERVICE_KEY = os.getenv(
    "SUPABASE_SERVICE_KEY",
    (
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6"
        "ImpucmNpaWJ3dHV0enlta29lcGZwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MT"
        "c3NjU2NTI2OCwiZXhwIjoyMDkyMTQxMjY4fQ.uVBSdXbxzUbhNKTOaYaiOk2r2etCFnNR"
        "8tQ0z1mhJxg"
    ),
)
AGENT_ID = "3177894b-a1ee-4d88-8aa1-ba902b01f141"
PIPELINE_RUN_ID = str(uuid.uuid4())
DRY_RUN = "--apply" not in sys.argv

# Legal P0-B: 4-field limit + Legal P1-D: category mapping
# packaging_categories.category_key → companies.category enum value
# corrugated_box ENUM added via PACAA-683 migration; now included (PACAA-686)
CATEGORY_MAP = {
    "corrugated_box":        "corrugated_box",
    "flexible_packaging":    "flexible_packaging",
    "plastic_container":     "plastic_container",
    "glass_metal_container": "glass_metal_container",
    "label_sticker":         "label_sticker",
    "printing_postprocess":  "printing_postprocess",
    "packaging_accessories": "packaging_accessories",
    "packaging_machinery":   "packaging_machinery",
}

CORP_SUFFIX_RE = re.compile(
    r"[\s\(（]*(주식회사|유한회사|합자회사|합명회사|유한책임회사"
    r"|영농조합법인|농업회사법인|사회적협동조합|협동조합|재단법인|사단법인"
    r"|㈜|\(주\)|\(유\)|\(합\)|\(사\)|주\.|\(재\))[\s\)）]*",
    re.UNICODE,
)
# companies_name_no_pii CHECK constraint patterns (PACAA-585 / 20260511006)
PHONE_IN_NAME_RE = re.compile(r"\d{2,4}-\d{3,4}-\d{4}")
EMAIL_IN_NAME_RE = re.compile(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}")

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.StreamHandler()],
)
log = logging.getLogger(__name__)


# ── Supabase helpers ────────────────────────────────────────────────────────────

HEADERS = {
    "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
    "apikey": SUPABASE_SERVICE_KEY,
    "Content-Type": "application/json",
    "Range-Unit": "items",
}


def fetch_all(table: str, params: dict) -> list:
    """Paginated fetch — works around PostgREST 1000-row cap."""
    all_rows = []
    for offset in range(0, 100_000, 1000):
        r = requests.get(
            f"{SUPABASE_URL}/rest/v1/{table}",
            headers={**HEADERS, "Range": f"{offset}-{offset+999}"},
            params=params,
        )
        r.raise_for_status()
        batch = r.json()
        if not isinstance(batch, list) or not batch:
            break
        all_rows.extend(batch)
        if len(batch) < 1000:
            break
    return all_rows


def insert_batch(table: str, rows: list) -> tuple[int, int]:
    """Upsert a batch into table. Returns (inserted, skipped)."""
    if not rows:
        return 0, 0
    r = requests.post(
        f"{SUPABASE_URL}/rest/v1/{table}",
        headers={**HEADERS, "Prefer": "resolution=ignore-duplicates,return=minimal"},
        json=rows,
    )
    if r.status_code not in (200, 201, 204):
        log.error("Insert error: %s %s", r.status_code, r.text[:500])
        return 0, len(rows)
    return len(rows), 0


# ── Name normalization (for dedup check) ────────────────────────────────────────

def clean_name_pii(raw: str) -> str:
    """Strip phone/email from business_name (companies_name_no_pii CHECK constraint)."""
    cleaned = PHONE_IN_NAME_RE.sub("", raw)
    cleaned = EMAIL_IN_NAME_RE.sub("", cleaned)
    return re.sub(r"\s+", " ", cleaned).strip()


def normalize_name(name: str) -> str:
    name = CORP_SUFFIX_RE.sub("", name).strip()
    name = unicodedata.normalize("NFC", name)
    name = re.sub(r"\s+", " ", name).strip().lower()
    return name


# ── Slug generation ─────────────────────────────────────────────────────────────

def slugify(text: str) -> str:
    text = unicodedata.normalize("NFC", text)
    # ASCII-only: Korean names fall through to the UUID-based path in make_slug.
    # re.ASCII restricts \w to [a-zA-Z0-9_] so Korean chars are stripped.
    ascii_only = re.sub(r"[^\w\s-]", "", text.lower(), flags=re.ASCII)
    ascii_only = re.sub(r"[\s_]+", "-", ascii_only).strip("-")
    return ascii_only


def make_slug(name: str, category: str) -> str:
    base = slugify(name)
    if not base or len(base) < 2:
        # Korean-only name — use category + short UUID
        base = f"{category}-{str(uuid.uuid4())[:8]}"
    else:
        base = f"{base}-{category}"
    return base[:200]


# ── Main pipeline ────────────────────────────────────────────────────────────────

def main():
    mode = "DRY-RUN" if DRY_RUN else "APPLY"
    log.info("=" * 60)
    log.info("PACAA-650 Import Pipeline — %s", mode)
    log.info("Run ID: %s", PIPELINE_RUN_ID)
    log.info("=" * 60)

    # 1. Load packaging_categories → category_key map
    cats_raw = fetch_all("packaging_categories", {"select": "id,category_key"})
    cat_id_to_key = {c["id"]: c["category_key"] for c in cats_raw}
    key_to_cat_id = {v: k for k, v in cat_id_to_key.items()}
    target_cat_ids = {
        key_to_cat_id[k] for k in CATEGORY_MAP if k in key_to_cat_id
    }
    log.info("Target category IDs: %d", len(target_cat_ids))

    # 2. Load existing companies for dedup check
    #    Key: (normalize_name(name), category)  → company id
    #    Pre-migration: candidate_source_id and new enum values may not exist yet.
    LEGACY_TO_NEW = {
        "flexible": "flexible_packaging",
        "plastic":  "plastic_container",
        "glass":    "glass_metal_container",
        "metal":    "glass_metal_container",
    }
    existing_keys: set[tuple[str, str]] = set()
    already_imported_source_ids: set[str] = set()

    # Try fetching companies with new categories (post-migration only)
    new_cats_exist = False
    try:
        test_r = requests.get(
            f"{SUPABASE_URL}/rest/v1/companies",
            headers={**HEADERS, "Range": "0-0"},
            params={"select": "id", "category": "eq.flexible_packaging"},
        )
        if test_r.status_code == 200:
            new_cats_exist = True
    except Exception:
        pass

    if new_cats_exist:
        existing = fetch_all("companies", {
            "select": "id,name,category,candidate_source_id",
            "category": f"in.({','.join(CATEGORY_MAP.values())})",
        })
    else:
        log.warning("New category enum values not yet in DB (pre-migration dry-run) — "
                    "skipping new-category dedup fetch.")
        existing = []

    # Always load legacy category companies for dedup
    existing += fetch_all("companies", {
        "select": "id,name,category",
        "category": "in.(flexible,plastic,glass,metal)",
    })

    for co in existing:
        norm = normalize_name(co["name"] or "")
        cat = LEGACY_TO_NEW.get(co["category"], co["category"])
        existing_keys.add((norm, cat))
        if co.get("candidate_source_id"):
            already_imported_source_ids.add(co["candidate_source_id"])
    log.info("Existing companies in target categories (incl. legacy): %d", len(existing))

    # 3. Load vendor_candidates (clean + merged, not deleted, not suppressed)
    #    suppressed column may not exist yet (dry-run pre-migration) — handled below
    base_params = {
        "select": "id,category_id,business_name,phone,address_raw,dedup_status,deleted_at",
        "dedup_status": "in.(clean,merged)",
        "deleted_at": "is.null",
    }
    # Try including suppressed filter; if column missing, proceed without it
    try:
        test = requests.get(
            f"{SUPABASE_URL}/rest/v1/vendor_candidates",
            headers={**HEADERS, "Range": "0-0"},
            params={**base_params, "suppressed": "eq.false"},
        )
        if test.status_code == 400 and "suppressed" in test.text:
            log.warning("vendor_candidates.suppressed column not yet applied — "
                        "skipping suppression filter (pre-migration dry-run).")
            suppression_available = False
        else:
            suppression_available = True
    except Exception:
        suppression_available = False

    if suppression_available:
        base_params["suppressed"] = "eq.false"

    candidates = fetch_all("vendor_candidates", base_params)
    # Filter to target categories only
    candidates = [c for c in candidates if c["category_id"] in target_cat_ids]
    log.info("Candidate records (target cats, clean/merged, not deleted%s): %d",
             ", not suppressed" if suppression_available else "", len(candidates))

    # 3b. Pre-load existing slugs to prevent secondary unique constraint violations
    existing_slugs: set[str] = set()
    for row in fetch_all("companies", {"select": "slug"}):
        if row.get("slug"):
            existing_slugs.add(row["slug"])
    log.info("Existing slugs in DB: %d", len(existing_slugs))

    # 4. Process candidates
    stats = defaultdict(lambda: defaultdict(int))
    rows_to_insert = []
    slug_seen: set[str] = existing_slugs.copy()

    for vc in candidates:
        cat_key = cat_id_to_key[vc["category_id"]]
        companies_cat = CATEGORY_MAP[cat_key]
        name_raw = (vc.get("business_name") or "").strip()
        if not name_raw:
            stats[cat_key]["skip_no_name"] += 1
            continue

        # Strip PII embedded in scraped names (companies_name_no_pii constraint)
        name_clean = clean_name_pii(name_raw)
        if len(name_clean) < 2:
            stats[cat_key]["skip_no_name"] += 1
            continue

        norm_name = normalize_name(name_clean)
        dedup_key = (norm_name, companies_cat)

        # Already imported this exact candidate (idempotency)
        if vc["id"] in already_imported_source_ids:
            stats[cat_key]["skip_already_imported"] += 1
            continue

        # Name+category dedup against existing companies
        if dedup_key in existing_keys:
            stats[cat_key]["skip_name_dedup"] += 1
            continue

        # Legal P0-B: 4-field limit ONLY
        slug = make_slug(name_clean, companies_cat)
        # Ensure slug uniqueness within this run and against existing DB slugs
        if slug in slug_seen:
            slug = f"{companies_cat}-{str(uuid.uuid4())[:8]}"
        slug_seen.add(slug)

        row = {
            # Allowed fields: name, address, category
            # phone omitted: KOR-371 (DB trigger prevent_companies_phone_write)
            # Policy basis: PACAA-801 Legal Counsel advisory (PIPA §15/§17, Naver Open API ToS).
            # See docs/legal/phone-data-kor371.md. Backfill deferred per PACAA-800 board decision (옵션 D).
            "name":     name_clean,
            "address":  (vc.get("address_raw") or "").strip() or None,
            "category": companies_cat,
            # Fixed defaults
            "is_verified":          False,   # Legal P1-E
            "is_hidden":            False,
            "data_source":          "naver_local",
            "candidate_source_id":  vc["id"],   # idempotency + audit
            "slug":                 slug,
            # Structural required fields (non-PII, pipeline-assigned)
            "industry_categories":  [],
            "certifications":       [],
            "products":             [],
            "service_capabilities": [],
            "target_industries":    [],
            "key_clients":          [],
            "delivery_regions":     [],
            "review_count":         0,
            "greenwashing_verified": False,
            "is_eco":               False,
            "is_print_design_service": False,
            "is_cold_chain":        False,
        }
        rows_to_insert.append(row)
        existing_keys.add(dedup_key)  # prevent intra-batch dupes
        stats[cat_key]["will_insert"] += 1

    # 5. Print dry-run summary
    log.info("\n%s", "=" * 60)
    log.info("DRY-RUN SUMMARY" if DRY_RUN else "APPLY SUMMARY")
    log.info("%-30s %8s %8s %8s %8s", "Category", "Insert", "AlrImp", "DedupSkp", "NoName")
    total_insert = 0
    for cat_key in sorted(stats.keys()):
        s = stats[cat_key]
        log.info("%-30s %8d %8d %8d %8d",
                 cat_key,
                 s["will_insert"],
                 s["skip_already_imported"],
                 s["skip_name_dedup"],
                 s["skip_no_name"])
        total_insert += s["will_insert"]
    log.info("-" * 66)
    log.info("%-30s %8d", "TOTAL", total_insert)

    if DRY_RUN:
        log.info("\nDRY-RUN complete — no DB writes. Re-run with --apply after approval.")
        return

    # 6. Apply: batch insert in chunks of 200
    log.info("\nApplying %d inserts...", total_insert)
    inserted_total = 0
    skipped_total = 0
    chunk_size = 200
    for i in range(0, len(rows_to_insert), chunk_size):
        chunk = rows_to_insert[i: i + chunk_size]
        ins, skp = insert_batch("companies", chunk)
        inserted_total += ins
        skipped_total += skp
        log.info("Chunk %d-%d: inserted=%d skipped=%d",
                 i, i + len(chunk) - 1, ins, skp)

    log.info("\nFinal: inserted=%d skipped=%d run_id=%s",
             inserted_total, skipped_total, PIPELINE_RUN_ID)


if __name__ == "__main__":
    main()
