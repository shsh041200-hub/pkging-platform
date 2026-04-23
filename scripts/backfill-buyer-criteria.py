#!/usr/bin/env python3
"""
Backfill buyer criteria fields on companies table.
KOR-320: Rule-based Phase 1 — fills lead_time, print_method, cold_packaging,
sample_available, moq_value from existing data + industry defaults.

Usage:
  python3 scripts/backfill-buyer-criteria.py --dry-run   # preview changes
  python3 scripts/backfill-buyer-criteria.py              # apply changes
"""
import argparse
import json
import sys
import urllib.request
import urllib.error
import urllib.parse
from pathlib import Path

SCRIPT_DIR = Path(__file__).parent
PROJECT_ROOT = SCRIPT_DIR.parent
ENV_FILE = PROJECT_ROOT / ".env.local"

MOQ_TEXT_MAP = {
    "소량 주문 가능": 100,
    "대량 주문 특화 (협의)": 5000,
    "도매 단위 (협의)": 1000,
    "맞춤 제작 (협의)": 500,
}

PRINT_METHOD_BY_CATEGORY = {
    "paper": "offset",
    "plastic": "mixed",
    "flexible": "mixed",
    "eco": "offset",
    "metal": "offset",
}

COLD_KEYWORDS = ["냉동", "냉장", "보냉", "신선", "cold", "냉동/냉장"]

LEAD_TIME_BY_CATEGORY = {
    "paper": 7,
    "plastic": 10,
    "flexible": 10,
    "eco": 14,
    "metal": 14,
    "glass": 14,
}


def load_env():
    env = {}
    if ENV_FILE.exists():
        for line in ENV_FILE.read_text().splitlines():
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, _, v = line.partition("=")
                env[k.strip()] = v.strip()
    return env


def get_config():
    env = load_env()
    url = env.get("NEXT_PUBLIC_SUPABASE_URL", "")
    key = env.get("SUPABASE_SERVICE_ROLE_KEY", "")
    if not url:
        sys.exit("ERROR: NEXT_PUBLIC_SUPABASE_URL not in .env.local")
    if not key:
        sys.exit("ERROR: SUPABASE_SERVICE_ROLE_KEY not in .env.local")
    return url, key


def supabase_get(path, url, key):
    req = urllib.request.Request(
        f"{url}{path}",
        headers={
            "Authorization": f"Bearer {key}",
            "apikey": key,
            "Content-Type": "application/json",
        },
    )
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode())


def supabase_patch(path, data, url, key):
    body = json.dumps(data).encode()
    req = urllib.request.Request(
        f"{url}{path}",
        data=body,
        headers={
            "Authorization": f"Bearer {key}",
            "apikey": key,
            "Content-Type": "application/json",
            "Prefer": "return=minimal",
        },
        method="PATCH",
    )
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.status, ""
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode()[:200]


def fetch_all_companies(url, key):
    """Fetch all companies handling Supabase 1000-row limit."""
    all_companies = []
    offset = 0
    page_size = 1000
    fields = "id,name,category,description,products,min_order_quantity,service_capabilities,moq_value,print_method,cold_packaging_available,sample_available,lead_time_standard_days"
    while True:
        path = f"/rest/v1/companies?select={fields}&order=id&offset={offset}&limit={page_size}"
        batch = supabase_get(path, url, key)
        all_companies.extend(batch)
        if len(batch) < page_size:
            break
        offset += page_size
    return all_companies


def has_cold_keywords(company):
    text_parts = [
        company.get("name") or "",
        company.get("description") or "",
        " ".join(company.get("products") or []),
        " ".join(company.get("service_capabilities") or []),
    ]
    combined = " ".join(text_parts).lower()
    return any(kw in combined for kw in COLD_KEYWORDS)


def has_printing_capability(company):
    caps = company.get("service_capabilities") or []
    name = company.get("name") or ""
    return any("인쇄" in c for c in caps) or "인쇄" in name


def has_small_order_capability(company):
    moq_text = company.get("min_order_quantity") or ""
    caps = company.get("service_capabilities") or []
    return moq_text == "소량 주문 가능" or any("소량" in c for c in caps)


def compute_updates(company):
    updates = {}
    cat = company.get("category") or ""

    if company.get("moq_value") is None:
        moq_text = company.get("min_order_quantity") or ""
        mapped = MOQ_TEXT_MAP.get(moq_text)
        if mapped is not None:
            updates["moq_value"] = mapped

    if company.get("print_method") is None:
        pm = PRINT_METHOD_BY_CATEGORY.get(cat)
        if pm:
            updates["print_method"] = pm

    if company.get("cold_packaging_available") is None:
        updates["cold_packaging_available"] = has_cold_keywords(company)

    if company.get("sample_available") is None and has_small_order_capability(company):
        updates["sample_available"] = True

    if company.get("lead_time_standard_days") is None:
        lt = LEAD_TIME_BY_CATEGORY.get(cat)
        if lt:
            updates["lead_time_standard_days"] = lt

    return updates


def main():
    parser = argparse.ArgumentParser(description="Backfill buyer criteria fields")
    parser.add_argument("--dry-run", action="store_true", help="Preview changes without applying")
    args = parser.parse_args()

    url, key = get_config()
    print("Fetching all companies...")
    companies = fetch_all_companies(url, key)
    print(f"  Total: {len(companies)}")

    stats = {
        "moq_value": 0,
        "print_method": 0,
        "cold_packaging_available": 0,
        "cold_packaging_true": 0,
        "sample_available": 0,
        "lead_time_standard_days": 0,
        "skipped": 0,
    }
    updates_plan = []

    for c in companies:
        updates = compute_updates(c)
        if not updates:
            stats["skipped"] += 1
            continue
        updates_plan.append((c["id"], c["name"], updates))
        for field in updates:
            if field == "cold_packaging_available" and updates[field]:
                stats["cold_packaging_true"] += 1
            if field in stats:
                stats[field] += 1

    print(f"\n=== Backfill Plan ===")
    print(f"  moq_value:               {stats['moq_value']:>5} companies")
    print(f"  print_method:            {stats['print_method']:>5} companies")
    print(f"  cold_packaging_available:{stats['cold_packaging_available']:>5} companies ({stats['cold_packaging_true']} true, {stats['cold_packaging_available'] - stats['cold_packaging_true']} false)")
    print(f"  sample_available:        {stats['sample_available']:>5} companies")
    print(f"  lead_time_standard_days: {stats['lead_time_standard_days']:>5} companies")
    print(f"  no changes needed:       {stats['skipped']:>5} companies")
    print(f"  total to update:         {len(updates_plan):>5} companies")

    fill_rates = {
        "moq_value": (stats["moq_value"] + sum(1 for c in companies if c.get("moq_value") is not None)) / len(companies) * 100,
        "print_method": (stats["print_method"] + sum(1 for c in companies if c.get("print_method") is not None)) / len(companies) * 100,
        "cold_packaging_available": (stats["cold_packaging_available"] + sum(1 for c in companies if c.get("cold_packaging_available") is not None)) / len(companies) * 100,
        "sample_available": (stats["sample_available"] + sum(1 for c in companies if c.get("sample_available") is not None)) / len(companies) * 100,
        "lead_time_standard_days": (stats["lead_time_standard_days"] + sum(1 for c in companies if c.get("lead_time_standard_days") is not None)) / len(companies) * 100,
    }
    print(f"\n=== Projected Fill Rates ===")
    for field, rate in fill_rates.items():
        marker = "✓" if rate >= 50 else "✗"
        print(f"  {marker} {field}: {rate:.1f}%")

    fields_above_50 = sum(1 for r in fill_rates.values() if r >= 50)
    print(f"\n  Fields ≥50%: {fields_above_50}/5 (target: ≥3)")

    if args.dry_run:
        print("\n[DRY RUN] No changes applied. Sample updates:")
        for cid, name, upd in updates_plan[:5]:
            print(f"  {name}: {upd}")
        return

    print(f"\nApplying {len(updates_plan)} updates...")
    success = 0
    errors = 0
    for i, (cid, name, updates) in enumerate(updates_plan):
        encoded_id = urllib.parse.quote(cid)
        status, err = supabase_patch(
            f"/rest/v1/companies?id=eq.{encoded_id}",
            updates,
            url,
            key,
        )
        if 200 <= status < 300:
            success += 1
        else:
            errors += 1
            if errors <= 5:
                print(f"  ERROR [{status}] {name}: {err}")

        if (i + 1) % 100 == 0:
            print(f"  Progress: {i+1}/{len(updates_plan)} ({success} ok, {errors} err)")

    print(f"\n=== Done ===")
    print(f"  Success: {success}")
    print(f"  Errors:  {errors}")


if __name__ == "__main__":
    main()
