#!/usr/bin/env python3
"""
Data quality validation for companies table.
KOR-128: 필수 필드 체크, URL 유효성, 중복 탐지, fill rate 리포트.

Usage:
  python3 scripts/validate-data.py [--output report.json] [--check-urls] [--concurrency 5]
"""
import argparse
import json
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

SCRIPT_DIR = Path(__file__).parent
PROJECT_ROOT = SCRIPT_DIR.parent
ENV_FILE = PROJECT_ROOT / ".env.local"

REQUIRED_FIELDS = ["name", "slug", "category"]
OPTIONAL_FIELDS = [
    "description", "website", "phone", "email", "address",
    "city", "province", "tags", "products", "certifications",
    "buyer_category", "packaging_form", "founded_year",
    "is_verified",
]
URL_TIMEOUT = 8
BROWSER_UA = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/125.0.0.0 Safari/537.36"
)


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
    supabase_url = env.get("NEXT_PUBLIC_SUPABASE_URL", "")
    service_role_key = env.get("SUPABASE_SERVICE_ROLE_KEY", "")
    if not supabase_url:
        sys.exit("ERROR: NEXT_PUBLIC_SUPABASE_URL not in .env.local")
    if not service_role_key:
        sys.exit("ERROR: SUPABASE_SERVICE_ROLE_KEY not in .env.local")
    return supabase_url, service_role_key


# ── Supabase ─────────────────────────────────────────────────────────────────────

def supabase_get(path, supabase_url, service_role_key):
    req = urllib.request.Request(
        f"{supabase_url}{path}",
        headers={
            "Authorization": f"Bearer {service_role_key}",
            "apikey": service_role_key,
            "Content-Type": "application/json",
        },
    )
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.status, json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode()


def fetch_all_companies(supabase_url, service_role_key):
    all_companies = []
    fields = ",".join(["id", "slug", "name", "category", "description", "website",
                       "phone", "email", "address", "city", "province", "tags",
                       "products", "certifications", "buyer_category", "packaging_form",
                       "founded_year", "is_verified"])
    page_size = 1000
    offset = 0
    while True:
        status, data = supabase_get(
            f"/rest/v1/companies?select={fields}&limit={page_size}&offset={offset}&order=name.asc",
            supabase_url,
            service_role_key,
        )
        if status != 200 or not isinstance(data, list):
            print(f"ERROR fetching companies: {status} {data}")
            break
        all_companies.extend(data)
        if len(data) < page_size:
            break
        offset += page_size
    return all_companies


# ── URL Validation ───────────────────────────────────────────────────────────────

def check_url(url: str) -> dict:
    if not url:
        return {"ok": False, "status": "missing"}
    try:
        parsed = urllib.parse.urlparse(url)
        if not parsed.scheme or not parsed.netloc:
            return {"ok": False, "status": "invalid_url"}
    except Exception:
        return {"ok": False, "status": "invalid_url"}

    def _head(u):
        req = urllib.request.Request(u, method="HEAD", headers={"User-Agent": BROWSER_UA})
        with urllib.request.urlopen(req, timeout=URL_TIMEOUT) as resp:
            return resp.status, resp.geturl()

    def _get(u):
        req = urllib.request.Request(u, headers={"User-Agent": BROWSER_UA})
        with urllib.request.urlopen(req, timeout=URL_TIMEOUT) as resp:
            return resp.status, resp.geturl()

    try:
        status, final_url = _head(url)
        ok = status < 400
        return {"ok": ok, "status": status, "final_url": final_url}
    except urllib.error.HTTPError as e:
        if e.code in (405, 403):
            # Retry with GET
            try:
                status, final_url = _get(url)
                return {"ok": status < 500, "status": status, "final_url": final_url}
            except Exception as e2:
                return {"ok": False, "status": str(e2)[:80]}
        return {"ok": False, "status": e.code}
    except Exception as e:
        if "urlopen" in str(type(e).__name__).lower() or "timeout" in str(e).lower():
            return {"ok": False, "status": "timeout"}
        if "invalid" in str(e).lower():
            return {"ok": False, "status": "invalid_url"}
        return {"ok": False, "status": str(e)[:80]}


# ── Duplicate Detection ──────────────────────────────────────────────────────────

def normalize_name(name: str) -> str:
    name = re.sub(r"\(주\)|\(유\)|주식회사|유한회사|㈜", "", name or "")
    return re.sub(r"\s+", "", name).strip().lower()


def bigrams(s: str) -> set:
    return set(s[i:i + 2] for i in range(len(s) - 1)) if len(s) > 1 else set(s)


def name_similarity(a: str, b: str) -> float:
    na, nb = normalize_name(a), normalize_name(b)
    if na == nb:
        return 1.0
    bg_a, bg_b = bigrams(na), bigrams(nb)
    if not bg_a or not bg_b:
        return 0.0
    union = bg_a | bg_b
    inter = bg_a & bg_b
    return len(inter) / len(union)


def find_duplicates(companies: list, name_threshold: float = 0.85) -> list:
    duplicates = []
    for i, c1 in enumerate(companies):
        for j, c2 in enumerate(companies):
            if j <= i:
                continue
            sim = name_similarity(c1.get("name", ""), c2.get("name", ""))
            if sim >= name_threshold:
                # Also compare address as extra signal
                addr1 = normalize_name(c1.get("address", "") or "")
                addr2 = normalize_name(c2.get("address", "") or "")
                addr_sim = name_similarity(addr1, addr2) if addr1 and addr2 else 0.0
                duplicates.append({
                    "company_a": {"id": c1["id"], "name": c1.get("name"), "slug": c1.get("slug")},
                    "company_b": {"id": c2["id"], "name": c2.get("name"), "slug": c2.get("slug")},
                    "name_similarity": round(sim, 3),
                    "address_similarity": round(addr_sim, 3),
                })
    return duplicates


# ── Fill Rate ────────────────────────────────────────────────────────────────────

def is_filled(value) -> bool:
    if value is None:
        return False
    if isinstance(value, (list, dict)):
        return len(value) > 0
    if isinstance(value, bool):
        return True
    return bool(str(value).strip())


def compute_fill_rate(companies: list) -> dict:
    if not companies:
        return {}
    total = len(companies)
    fields = REQUIRED_FIELDS + OPTIONAL_FIELDS
    fill_counts = {f: 0 for f in fields}
    for c in companies:
        for f in fields:
            if is_filled(c.get(f)):
                fill_counts[f] += 1
    return {f: {"count": fill_counts[f], "rate": round(fill_counts[f] / total * 100, 1)}
            for f in fields}


# ── Main ─────────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Data quality validator for companies")
    parser.add_argument("--output", default="data-quality-report.json", help="Output JSON file path")
    parser.add_argument("--check-urls", action="store_true", help="Validate website URLs (slow)")
    parser.add_argument("--concurrency", type=int, default=5, help="URL check concurrency")
    args = parser.parse_args()

    supabase_url, service_role_key = get_config()

    print("Fetching companies from Supabase...")
    companies = fetch_all_companies(supabase_url, service_role_key)
    print(f"  {len(companies)} companies loaded")

    report = {
        "generated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "total_companies": len(companies),
        "required_field_issues": [],
        "url_check": {"enabled": args.check_urls, "results": []},
        "duplicates": [],
        "fill_rate": {},
    }

    # 1. Required field check
    print("\nChecking required fields...")
    for c in companies:
        missing = [f for f in REQUIRED_FIELDS if not is_filled(c.get(f))]
        if missing:
            report["required_field_issues"].append({
                "id": c["id"],
                "name": c.get("name"),
                "slug": c.get("slug"),
                "missing_fields": missing,
            })
    print(f"  {len(report['required_field_issues'])} companies with missing required fields")

    # 2. URL validation
    if args.check_urls:
        companies_with_url = [c for c in companies if c.get("website")]
        print(f"\nChecking {len(companies_with_url)} website URLs (concurrency={args.concurrency})...")
        url_results = []
        with ThreadPoolExecutor(max_workers=args.concurrency) as executor:
            future_to_company = {
                executor.submit(check_url, c["website"]): c
                for c in companies_with_url
            }
            done = 0
            for future in as_completed(future_to_company):
                c = future_to_company[future]
                result = future.result()
                url_results.append({
                    "id": c["id"],
                    "name": c.get("name"),
                    "url": c.get("website"),
                    **result,
                })
                done += 1
                icon = "OK" if result["ok"] else "FAIL"
                print(f"  [{done}/{len(companies_with_url)}] [{icon}] {c.get('name')} | {result['status']}")
        report["url_check"]["results"] = url_results
        ok_count = sum(1 for r in url_results if r.get("ok"))
        print(f"  {ok_count}/{len(url_results)} URLs reachable")
    else:
        print("\nURL check skipped (use --check-urls to enable)")

    # 3. Duplicate detection
    print("\nRunning duplicate detection...")
    report["duplicates"] = find_duplicates(companies)
    print(f"  {len(report['duplicates'])} potential duplicate pairs found")

    # 4. Fill rate
    print("\nCalculating fill rate...")
    report["fill_rate"] = compute_fill_rate(companies)
    for field, info in report["fill_rate"].items():
        prefix = "[REQUIRED]" if field in REQUIRED_FIELDS else "          "
        print(f"  {prefix} {field:30s}: {info['rate']:5.1f}% ({info['count']}/{len(companies)})")

    # Write report
    output_path = Path(args.output)
    output_path.write_text(json.dumps(report, ensure_ascii=False, indent=2))
    print(f"\nReport saved to: {output_path}")

    # Summary
    issues = len(report["required_field_issues"])
    dups = len(report["duplicates"])
    print(f"\nSummary: {issues} field issues, {dups} duplicate pairs")
    if issues > 0 or dups > 0:
        sys.exit(1)


if __name__ == "__main__":
    main()
