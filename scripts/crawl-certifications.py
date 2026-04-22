#!/usr/bin/env python3
"""
Rule-based certification keyword crawler for company homepages.
KOR-278: Scan registered company websites and extract certification keywords
using regex patterns only (no LLM).

Outputs CSV: company_id, company_name, cert_type, cert_id, matched_text, source_url, context

Usage:
  python3 scripts/crawl-certifications.py [--dry-run] [--limit N] [--delay 1.5]

Requirements (.env.local):
  NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
"""
import argparse
import csv
import json
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime
from pathlib import Path
from urllib.robotparser import RobotFileParser

try:
    import httpx
    from bs4 import BeautifulSoup
except ImportError:
    sys.exit("ERROR: pip install httpx beautifulsoup4  (see requirements.txt)")

SCRIPT_DIR = Path(__file__).parent
PROJECT_ROOT = SCRIPT_DIR.parent
ENV_FILE = PROJECT_ROOT / ".env.local"

USER_AGENT = "PacklinxCertBot/1.0 (+https://packlinx.com; certification-index)"
REQUEST_TIMEOUT = 15
DEFAULT_DELAY = 1.5

# ── Certification patterns ────────────────────────────────────────────────────
# Each entry: (cert_id, label, list of regex patterns)
# Patterns are case-insensitive by default.
CERT_PATTERNS = [
    ("haccp", "HACCP", [
        r"\bHACCP\b",
        r"\bHACCP\s*인증\b",
        r"해썹\s*인증?",
    ]),
    ("iso9001", "ISO 9001", [
        r"\bISO\s*9001\b",
        r"\bISO\s*9001:\d{4}\b",
    ]),
    ("iso14001", "ISO 14001", [
        r"\bISO\s*14001\b",
        r"\bISO\s*14001:\d{4}\b",
    ]),
    ("iso22000", "ISO 22000", [
        r"\bISO\s*22000\b",
        r"\bISO\s*22000:\d{4}\b",
    ]),
    ("iso22716", "ISO 22716", [
        r"\bISO\s*22716\b",
    ]),
    ("gmp", "GMP", [
        r"\bGMP\b(?!\s*\d)",
        r"\bGMP\s*인증\b",
        r"우수\s*제조\s*관리\s*기준",
    ]),
    ("fsc", "FSC", [
        r"\bFSC\b(?!\s*\d)",
        r"\bFSC\s*인증\b",
        r"\bFSC[-\s]?COC\b",
        r"\bFSC[-\s]?FM\b",
    ]),
    ("grs", "GRS", [
        r"\bGRS\b(?!\s*\d)",
        r"\bGRS\s*인증\b",
        r"글로벌\s*재활용\s*표준",
    ]),
    ("ok_compost", "OK Compost", [
        r"\bOK\s*Compost\b",
    ]),
    ("eco_friendly", "친환경 인증", [
        r"친환경\s*인증",
        r"환경\s*표지\s*인증",
        r"녹색\s*인증",
        r"\bGreen\s*Cert",
    ]),
    ("food_hygiene", "식품위생법 적합", [
        r"식품위생법\s*적합",
        r"식품위생\s*인증",
    ]),
    ("kfda", "식약처 인증", [
        r"식약처\s*인증",
        r"식약청\s*인증",
        r"\bKFDA\b",
    ]),
    ("kc", "KC 인증", [
        r"\bKC\s*인증\b",
        r"\bKC\s*마크\b",
    ]),
    ("food_grade", "식품등급", [
        r"식품\s*등급",
        r"식품용\s*인증",
    ]),
    # Additional types from ticket (beyond CERTIFICATION_TYPES)
    ("ks", "KS 인증", [
        r"\bKS\s*인증\b",
        r"\bKS\s*마크\b",
        r"한국\s*산업\s*표준",
        r"\bKS\s*[A-Z]\s*\d{4}\b",
    ]),
    ("fda", "FDA", [
        r"\bFDA\b(?!\s*\d)",
        r"\bFDA\s*인증\b",
        r"\bFDA\s*등록\b",
        r"\bFDA\s*승인\b",
    ]),
    ("pefc", "PEFC", [
        r"\bPEFC\b",
        r"\bPEFC\s*인증\b",
    ]),
    ("brc", "BRC", [
        r"\bBRC\b(?!\s*\d)",
        r"\bBRC\s*인증\b",
        r"\bBRCGS\b",
    ]),
    ("sqs", "SQF", [
        r"\bSQF\b",
        r"\bSQF\s*인증\b",
    ]),
    ("ce", "CE 인증", [
        r"\bCE\s*인증\b",
        r"\bCE\s*마크\b",
        r"\bCE\s*마킹\b",
    ]),
]

COMPILED_PATTERNS = []
for cert_id, label, patterns in CERT_PATTERNS:
    compiled = [re.compile(p, re.IGNORECASE) for p in patterns]
    COMPILED_PATTERNS.append((cert_id, label, compiled))


# ── Config ────────────────────────────────────────────────────────────────────

def load_env():
    env = {}
    if ENV_FILE.exists():
        for line in ENV_FILE.read_text().splitlines():
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                k, _, v = line.partition('=')
                env[k.strip()] = v.strip()
    return env


def get_config():
    env = load_env()
    url = env.get("NEXT_PUBLIC_SUPABASE_URL", "")
    key = env.get("SUPABASE_SERVICE_ROLE_KEY", "")
    if not url or not key:
        sys.exit("ERROR: NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not in .env.local")
    return url, key


# ── Supabase ──────────────────────────────────────────────────────────────────

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


# ── robots.txt ────────────────────────────────────────────────────────────────

_robots_cache: dict[str, RobotFileParser | None] = {}


def check_robots_txt(target_url: str) -> bool:
    parsed = urllib.parse.urlparse(target_url)
    base = f"{parsed.scheme}://{parsed.netloc}"
    if base in _robots_cache:
        rp = _robots_cache[base]
        if rp is None:
            return True
        return rp.can_fetch(USER_AGENT, target_url)

    robots_url = f"{base}/robots.txt"
    rp = RobotFileParser()
    rp.set_url(robots_url)
    try:
        rp.read()
        _robots_cache[base] = rp
        return rp.can_fetch(USER_AGENT, target_url)
    except Exception:
        _robots_cache[base] = None
        return True


# ── Page fetching ─────────────────────────────────────────────────────────────

def fetch_page(url: str, client: httpx.Client) -> str | None:
    if not check_robots_txt(url):
        return None

    try:
        resp = client.get(url, follow_redirects=True, timeout=REQUEST_TIMEOUT)
        if resp.status_code != 200:
            return None
        content_type = resp.headers.get("content-type", "")
        if "text/html" not in content_type and "application/xhtml" not in content_type:
            return None
        return resp.text
    except Exception:
        return None


def extract_text_from_html(html: str) -> str:
    soup = BeautifulSoup(html, "html.parser")
    for tag in soup(["script", "style", "noscript", "iframe"]):
        tag.decompose()
    return soup.get_text(separator=" ", strip=True)


# ── Certification extraction ──────────────────────────────────────────────────

def extract_certifications(text: str, source_url: str) -> list[dict]:
    results = []
    seen_ids = set()

    for cert_id, label, patterns in COMPILED_PATTERNS:
        for pattern in patterns:
            match = pattern.search(text)
            if match and cert_id not in seen_ids:
                seen_ids.add(cert_id)
                start = max(0, match.start() - 40)
                end = min(len(text), match.end() + 40)
                context = text[start:end].strip()
                context = re.sub(r'\s+', ' ', context)

                results.append({
                    "cert_id": cert_id,
                    "cert_label": label,
                    "matched_text": match.group(),
                    "source_url": source_url,
                    "context": context,
                })
                break

    return results


# ── Subpage discovery ─────────────────────────────────────────────────────────

CERT_PAGE_KEYWORDS = [
    "인증", "certif", "quality", "about", "소개", "회사소개",
    "company", "intro", "연혁", "history",
]


def find_cert_subpages(html: str, base_url: str) -> list[str]:
    soup = BeautifulSoup(html, "html.parser")
    parsed_base = urllib.parse.urlparse(base_url)
    base_domain = parsed_base.netloc
    candidates = []

    for a_tag in soup.find_all("a", href=True):
        href = a_tag["href"]
        link_text = a_tag.get_text(strip=True).lower()
        href_lower = href.lower()

        is_relevant = any(kw in link_text or kw in href_lower for kw in CERT_PAGE_KEYWORDS)
        if not is_relevant:
            continue

        full_url = urllib.parse.urljoin(base_url, href)
        parsed = urllib.parse.urlparse(full_url)
        if parsed.netloc != base_domain:
            continue
        if parsed.scheme not in ("http", "https"):
            continue
        if full_url not in candidates and full_url != base_url:
            candidates.append(full_url)

    return candidates[:5]


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Crawl company homepages for certification keywords")
    parser.add_argument("--dry-run", action="store_true", help="Print results without writing CSV")
    parser.add_argument("--limit", type=int, default=0, help="Limit number of companies to crawl (0=all)")
    parser.add_argument("--delay", type=float, default=DEFAULT_DELAY, help="Delay between requests in seconds")
    parser.add_argument("--output", type=str, default="", help="Output CSV path (default: auto-generated)")
    args = parser.parse_args()

    sb_url, sb_key = get_config()

    print("Fetching companies with website URLs...")
    companies = supabase_get(
        "/rest/v1/companies?select=id,name,website,certifications"
        "&website=not.is.null&website=neq.&order=id.asc&limit=10000",
        sb_url, sb_key,
    )
    print(f"Total companies with websites: {len(companies)}")

    if args.limit > 0:
        companies = companies[:args.limit]
        print(f"Limited to first {args.limit}")

    timestamp = datetime.now().strftime("%Y%m%dT%H%M%S")
    output_path = args.output or str(SCRIPT_DIR / f"cert-crawl-results-{timestamp}.csv")

    all_results = []
    stats = {"total": len(companies), "crawled": 0, "blocked_robots": 0,
             "fetch_failed": 0, "certs_found": 0, "companies_with_certs": 0}

    client = httpx.Client(
        headers={"User-Agent": USER_AGENT, "Accept-Language": "ko-KR,ko;q=0.9,en;q=0.8"},
        follow_redirects=True,
        timeout=REQUEST_TIMEOUT,
    )

    try:
        for i, company in enumerate(companies):
            cid = company["id"]
            name = company["name"]
            website = company["website"].strip()

            if not website.startswith(("http://", "https://")):
                website = "http://" + website

            print(f"[{i+1}/{len(companies)}] {name[:30]} — {website[:60]}")

            html = fetch_page(website, client)
            if html is None:
                if not check_robots_txt(website):
                    stats["blocked_robots"] += 1
                    print(f"  ⏭ robots.txt denied")
                else:
                    stats["fetch_failed"] += 1
                    print(f"  ✗ fetch failed")
                time.sleep(args.delay)
                continue

            stats["crawled"] += 1
            page_text = extract_text_from_html(html)
            company_certs = extract_certifications(page_text, website)

            subpages = find_cert_subpages(html, website)
            for sub_url in subpages:
                time.sleep(args.delay * 0.5)
                sub_html = fetch_page(sub_url, client)
                if sub_html:
                    sub_text = extract_text_from_html(sub_html)
                    sub_certs = extract_certifications(sub_text, sub_url)
                    existing_ids = {c["cert_id"] for c in company_certs}
                    for cert in sub_certs:
                        if cert["cert_id"] not in existing_ids:
                            company_certs.append(cert)
                            existing_ids.add(cert["cert_id"])

            if company_certs:
                stats["companies_with_certs"] += 1
                stats["certs_found"] += len(company_certs)
                for cert in company_certs:
                    cert["company_id"] = cid
                    cert["company_name"] = name
                    all_results.append(cert)
                    print(f"  ✓ {cert['cert_label']} — \"{cert['matched_text']}\"")
            else:
                print(f"  — no certifications found")

            time.sleep(args.delay)

    except KeyboardInterrupt:
        print("\n\nInterrupted — saving partial results...")
    finally:
        client.close()

    print(f"\n{'='*60}")
    print(f"Crawl complete")
    print(f"  Companies total:     {stats['total']}")
    print(f"  Successfully crawled: {stats['crawled']}")
    print(f"  Blocked by robots:   {stats['blocked_robots']}")
    print(f"  Fetch failed:        {stats['fetch_failed']}")
    print(f"  Companies with certs: {stats['companies_with_certs']}")
    print(f"  Total cert matches:  {stats['certs_found']}")

    if not args.dry_run and all_results:
        with open(output_path, "w", newline="", encoding="utf-8-sig") as f:
            writer = csv.DictWriter(f, fieldnames=[
                "company_id", "company_name", "cert_id", "cert_label",
                "matched_text", "source_url", "context",
            ])
            writer.writeheader()
            writer.writerows(all_results)
        print(f"\nCSV written: {output_path} ({len(all_results)} rows)")
    elif args.dry_run:
        print(f"\n[DRY RUN] Would write {len(all_results)} rows to CSV")
    else:
        print("\nNo results to write.")


if __name__ == "__main__":
    main()
