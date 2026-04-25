#!/usr/bin/env python3
"""
Backfill subcategory for print_design_services companies.
KOR-550: Applies detectPrintDesignSubtype() logic to existing vendors
         that have industry_categories containing 'print_design_services'
         but subcategory IS NULL.

Usage:
  python3 scripts/backfill-print-design-subtypes.py --dry-run   # preview
  python3 scripts/backfill-print-design-subtypes.py              # apply
"""
import argparse
import json
import sys
import urllib.request
import urllib.error
from pathlib import Path

SCRIPT_DIR = Path(__file__).parent
PROJECT_ROOT = SCRIPT_DIR.parent
ENV_FILE = PROJECT_ROOT / ".env.local"

# Mirror of PRINT_DESIGN_SUBTYPE_RULES in src/lib/crawler/classifier.ts
PRINT_DESIGN_SUBTYPE_RULES = [
    {
        "subtype": "package-printing",
        "keywords": ["패키지인쇄", "박스인쇄", "골판지인쇄", "단상자인쇄", "박스제작", "패키지 인쇄", "박스 인쇄", "포장박스 인쇄", "포장인쇄"],
    },
    {
        "subtype": "label-sticker",
        "keywords": ["라벨인쇄", "스티커인쇄", "라벨 인쇄", "스티커 인쇄", "라벨제작", "스티커제작", "바코드라벨", "바코드 라벨", "라벨지", "제품라벨"],
    },
    {
        "subtype": "brochure-catalog",
        "keywords": ["브로셔", "카탈로그", "리플릿", "팸플릿", "전단지", "브로셔인쇄", "카탈로그인쇄", "리플릿인쇄", "팸플릿인쇄"],
    },
    {
        "subtype": "business-stationery",
        "keywords": ["명함", "봉투인쇄", "레터헤드", "사무인쇄", "명함인쇄", "명함제작", "사무용 인쇄", "사무 인쇄"],
    },
    {
        "subtype": "signage-display",
        "keywords": ["현수막", "배너", "대형출력", "사인물", "간판", "X배너", "롤업배너", "현수막인쇄", "배너인쇄", "대형 인쇄", "실사출력"],
    },
    {
        "subtype": "package-design",
        "keywords": ["패키지 디자인", "패키징 디자인", "박스 디자인", "포장 디자인", "패키지디자인", "패키징디자인", "박스디자인", "포장디자인", "브랜딩 디자인", "라벨 디자인"],
    },
    {
        "subtype": "finishing-postpress",
        "keywords": ["후가공", "형압", "박가공", "에폭시", "특수인쇄", "코팅", "라미네이팅", "UV코팅", "에폭시가공", "형광인쇄", "금박", "은박", "음각", "양각"],
    },
]

VALID_SUBTYPES = {r["subtype"] for r in PRINT_DESIGN_SUBTYPE_RULES}


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
        return e.code, e.read().decode()[:300]


def build_company_text(company):
    parts = [
        company.get("name") or "",
        company.get("description") or "",
        " ".join(company.get("products") or []),
        " ".join(company.get("service_capabilities") or []),
    ]
    return " ".join(p for p in parts if p)


def detect_print_design_subtype(text):
    """Mirror of detectPrintDesignSubtype() in src/lib/crawler/classifier.ts"""
    scores = {}
    for rule in PRINT_DESIGN_SUBTYPE_RULES:
        score = sum(1 for kw in rule["keywords"] if kw in text)
        if score > 0:
            scores[rule["subtype"]] = score

    if not scores:
        return None

    winner = max(scores, key=lambda s: scores[s])
    return winner if winner in VALID_SUBTYPES else None


def fetch_print_design_companies(url, key):
    """Fetch all companies with print_design_services in industry_categories."""
    all_companies = []
    offset = 0
    page_size = 1000
    fields = "id,name,description,products,service_capabilities,subcategory"
    while True:
        path = (
            f"/rest/v1/companies"
            f"?select={fields}"
            f"&industry_categories=cs.%7Bprint_design_services%7D"
            f"&order=id"
            f"&offset={offset}&limit={page_size}"
        )
        batch = supabase_get(path, url, key)
        all_companies.extend(batch)
        if len(batch) < page_size:
            break
        offset += page_size
    return all_companies


def main():
    parser = argparse.ArgumentParser(description="Backfill print_design_services subcategory")
    parser.add_argument("--dry-run", action="store_true", help="Preview without writing")
    args = parser.parse_args()

    url, key = get_config()

    print("Fetching print_design_services companies...")
    companies = fetch_print_design_companies(url, key)
    print(f"  Total: {len(companies)}")

    null_count = sum(1 for c in companies if c.get("subcategory") is None)
    already_set = len(companies) - null_count
    print(f"  Already has subcategory: {already_set}")
    print(f"  Needs backfill (NULL): {null_count}")

    # Only process rows with NULL subcategory (idempotent)
    targets = [c for c in companies if c.get("subcategory") is None]

    subtype_distribution = {}
    unmatched = []
    updates = []

    for company in targets:
        text = build_company_text(company)
        subtype = detect_print_design_subtype(text)
        if subtype:
            subtype_distribution[subtype] = subtype_distribution.get(subtype, 0) + 1
            updates.append((company["id"], company["name"], subtype))
        else:
            unmatched.append(company["name"])

    # Summary
    print(f"\n=== Classification Results ===")
    print(f"Matched:   {len(updates)}/{null_count}")
    print(f"Unmatched: {len(unmatched)}/{null_count} (will remain NULL)")
    print()

    print("Subtype distribution:")
    for subtype, count in sorted(subtype_distribution.items(), key=lambda x: -x[1]):
        print(f"  {subtype}: {count}")

    if unmatched:
        print(f"\nUnmatched companies ({len(unmatched)}):")
        for name in unmatched:
            print(f"  - {name}")

    if args.dry_run:
        print("\n[DRY RUN] No changes written.")
        return

    # Apply updates
    print(f"\nApplying {len(updates)} updates...")
    ok = 0
    errors = 0
    for company_id, company_name, subtype in updates:
        status, err = supabase_patch(
            f"/rest/v1/companies?id=eq.{company_id}",
            {"subcategory": subtype},
            url,
            key,
        )
        if status in (200, 204):
            ok += 1
            print(f"  ✓ {company_name} → {subtype}")
        else:
            errors += 1
            print(f"  ✗ {company_name}: HTTP {status} — {err}")

    print(f"\nDone: {ok} updated, {errors} errors, {len(unmatched)} skipped (no match).")

    if ok > 0:
        print("\nVerification: re-fetching to confirm...")
        refreshed = fetch_print_design_companies(url, key)
        still_null = sum(1 for c in refreshed if c.get("subcategory") is None)
        print(f"  print_design_services companies: {len(refreshed)}")
        print(f"  Still NULL subcategory: {still_null}")
        by_subtype = {}
        for c in refreshed:
            st = c.get("subcategory") or "(null)"
            by_subtype[st] = by_subtype.get(st, 0) + 1
        print("  Distribution after backfill:")
        for k, v in sorted(by_subtype.items(), key=lambda x: -x[1]):
            print(f"    {k}: {v}")


if __name__ == "__main__":
    main()
