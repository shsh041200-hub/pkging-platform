#!/usr/bin/env python3
"""
B2B directory crawler for Korean packaging companies.
KOR-183: B2B 디렉토리 포장재 업체 크롤러 구현.

Targets:
  tradekorea  - tradekorea.com  (KITA-operated B2B marketplace, packaging category)
  koreannet   - koreannet.or.kr (GS1Korea barcode DB — best-effort, limited public data)

Requirements:
  pip install -r scripts/requirements.txt   (httpx, beautifulsoup4)

Setup:
  .env.local must contain:
    NEXT_PUBLIC_SUPABASE_URL
    SUPABASE_SERVICE_ROLE_KEY

Usage:
  python3 scripts/crawl-b2b-directories.py [--dry-run] [--directory NAME] [--limit N]

Directory names (--directory filter):
  tradekorea  - tradekorea.com packaging company search
  koreannet   - koreannet.or.kr product DB (extracts brand/company names)
"""
import argparse
import json
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

import httpx
from bs4 import BeautifulSoup

SCRIPT_DIR = Path(__file__).parent
PROJECT_ROOT = SCRIPT_DIR.parent
ENV_FILE = PROJECT_ROOT / ".env.local"

REQUEST_DELAY = 1.5
REQUEST_TIMEOUT = 20

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "ko-KR,ko;q=0.9,en;q=0.8",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
}


# ── Env / Config ─────────────────────────────────────────────────────────────

def load_env() -> dict:
    env = {}
    if ENV_FILE.exists():
        for line in ENV_FILE.read_text().splitlines():
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, _, v = line.partition("=")
                env[k.strip()] = v.strip()
    return env


def get_config() -> tuple[str, str]:
    env = load_env()
    supabase_url = env.get("NEXT_PUBLIC_SUPABASE_URL", "")
    service_role_key = env.get("SUPABASE_SERVICE_ROLE_KEY", "")
    if not supabase_url:
        sys.exit("ERROR: NEXT_PUBLIC_SUPABASE_URL not found in .env.local")
    if not service_role_key:
        sys.exit("ERROR: SUPABASE_SERVICE_ROLE_KEY not found in .env.local")
    return supabase_url, service_role_key


# ── Supabase helpers ──────────────────────────────────────────────────────────

def supabase_request(
    method: str,
    path: str,
    supabase_url: str,
    service_role_key: str,
    data: dict | None = None,
) -> tuple[int, object]:
    url = f"{supabase_url}{path}"
    headers = {
        "Authorization": f"Bearer {service_role_key}",
        "apikey": service_role_key,
        "Content-Type": "application/json",
        "Prefer": "return=representation",
    }
    body = json.dumps(data).encode() if data else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            content = resp.read().decode()
            return resp.status, json.loads(content) if content else []
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode()


def fetch_existing_company_names(supabase_url: str, service_role_key: str) -> list[str]:
    names = []
    offset = 0
    while True:
        status, data = supabase_request(
            "GET",
            f"/rest/v1/companies?select=name&limit=1000&offset={offset}",
            supabase_url,
            service_role_key,
        )
        if status != 200 or not isinstance(data, list):
            break
        names.extend(r["name"] for r in data if r.get("name"))
        if len(data) < 1000:
            break
        offset += 1000
    return names


def fetch_existing_crawl_urls(supabase_url: str, service_role_key: str) -> set[str]:
    urls: set[str] = set()
    offset = 0
    while True:
        status, data = supabase_request(
            "GET",
            f"/rest/v1/crawl_jobs?select=url&limit=1000&offset={offset}",
            supabase_url,
            service_role_key,
        )
        if status != 200 or not isinstance(data, list):
            break
        urls.update(r["url"] for r in data if r.get("url"))
        if len(data) < 1000:
            break
        offset += 1000
    return urls


# ── Dedup helpers ─────────────────────────────────────────────────────────────

LEGAL_RE = re.compile(r"\(주\)|\(유\)|주식회사|유한회사|㈜|\(사\)|사단법인|협동조합|Co\.,?\s*Ltd\.?|Inc\.?|Corp\.?", re.I)


def normalize_name(name: str) -> str:
    name = LEGAL_RE.sub("", name or "")
    return re.sub(r"\s+", "", name).strip().lower()


def bigrams(s: str) -> set:
    return set(s[i:i + 2] for i in range(len(s) - 1)) if len(s) > 1 else set(s)


def is_duplicate_name(candidate: str, existing: list[str], threshold: float = 0.85) -> bool:
    norm = normalize_name(candidate)
    if not norm:
        return False
    for existing_name in existing:
        norm_e = normalize_name(existing_name)
        if norm == norm_e:
            return True
        bg_c, bg_e = bigrams(norm), bigrams(norm_e)
        if bg_c and bg_e:
            sim = len(bg_c & bg_e) / len(bg_c | bg_e)
            if sim >= threshold:
                return True
    return False


# ── HTTP fetch helpers ────────────────────────────────────────────────────────

def fetch_page(
    client: httpx.Client,
    url: str,
    method: str = "GET",
    data: dict | None = None,
    extra_headers: dict | None = None,
) -> BeautifulSoup | None:
    try:
        if method == "POST" and data:
            resp = client.post(url, data=data, timeout=REQUEST_TIMEOUT,
                               follow_redirects=True, headers=extra_headers or {})
        else:
            resp = client.get(url, timeout=REQUEST_TIMEOUT,
                              follow_redirects=True, headers=extra_headers or {})
        resp.raise_for_status()
        return BeautifulSoup(resp.text, "html.parser")
    except Exception as e:
        print(f"  [FETCH ERROR] {url}: {e}")
        return None


def clean_text(element) -> str:
    if element is None:
        return ""
    text = element.get_text(separator=" ")
    return re.sub(r"\s+", " ", text).strip()


def clean_phone(phone: str) -> str:
    phone = re.sub(r"[^\d\-\(\)\+\s]", "", phone or "")
    return re.sub(r"\s+", " ", phone).strip()


def clean_url(url: str) -> str:
    url = (url or "").strip()
    if url and not url.startswith(("http://", "https://")):
        url = "https://" + url
    return url


# ── 1. TradeKorea (tradekorea.com) ────────────────────────────────────────────
# KITA-operated B2B marketplace. Search via AJAX endpoint with packaging category.
# Company list: search_ajax.do with search_c_collection=company, category 20^2033.
# Company detail: /companies/detail.do?businessno=XXXXX — has address in .pd_company_box.
# Phone/website not exposed to unauthenticated users.

TRADEKOREA_BASE = "https://www.tradekorea.com"
TRADEKOREA_SEARCH_URL = f"{TRADEKOREA_BASE}/total_search/search_ajax.do"
TRADEKOREA_DETAIL_URL = f"{TRADEKOREA_BASE}/companies/detail.do"

# Packaging-related category IDs on tradekorea.com
TRADEKOREA_CATEGORIES = [
    ("20^2033", "Packaging"),
    ("20^2033^2033300", "Cosmetics Packaging"),
    ("20^2033^2033301", "Food Packaging"),
    ("20^2033^2033305", "Packaging Supplies"),
    ("20^2033^2033306", "Pharmaceutical Packaging"),
    ("20^2033^2033307", "Special Purpose Packaging"),
]

TRADEKOREA_AJAX_HEADERS = {
    **HEADERS,
    "Accept": "text/html,*/*",
    "X-Requested-With": "XMLHttpRequest",
    "Referer": f"{TRADEKOREA_BASE}/total_search/search.do",
}


def _tradekorea_search_page(client: httpx.Client, category: str, start_count: int) -> list[dict]:
    """Fetch one page of company results from tradekorea search AJAX."""
    data = {
        "search_realQuery": "",
        "search_reQuery": "",
        "search_collection": "company",
        "search_c_collection": "company",
        "search_sortField": "RANK/DESC",
        "search_searchField": "",
        "search_startDate": "",
        "search_endDate": "",
        "search_certificate": "",
        "search_nation": "KR",
        "search_biztype": "",
        "search_category": category,
        "search_grade": "",
        "search_years": "",
        "search_price": "",
        "search_list": "",
        "search_startCount": str(start_count),
        "search_viewCount": "20",
        "sel_collection": "company",
        "search_query": "packaging",
    }
    soup = fetch_page(client, TRADEKOREA_SEARCH_URL, method="POST", data=data,
                      extra_headers=TRADEKOREA_AJAX_HEADERS)
    if soup is None:
        return []

    results = []
    name_elems = soup.find_all("a", class_="item_name")
    for elem in name_elems:
        href = elem.get("href", "")
        # Strip highlighted spans and get clean company name
        for span in elem.find_all("span"):
            span.replace_with(span.get_text())
        name = clean_text(elem)
        if not name:
            continue
        businessno = ""
        m = re.search(r"businessno=(\d+)", href)
        if m:
            businessno = m.group(1)
        detail_url = f"{TRADEKOREA_DETAIL_URL}?businessno={businessno}" if businessno else ""
        results.append({"name": name, "businessno": businessno, "detail_url": detail_url})
    return results


def _tradekorea_fetch_detail(client: httpx.Client, businessno: str) -> dict:
    """Fetch company detail page and extract address."""
    url = f"{TRADEKOREA_DETAIL_URL}?businessno={businessno}"
    soup = fetch_page(client, url)
    info: dict[str, str] = {}
    if soup is None:
        return info

    box = soup.find("ul", class_="pd_company_box")
    if not box:
        return info

    items = box.find_all("li")
    for item in items:
        subtitle = item.find("strong", class_="pd_company_subtit")
        desc = item.find("p", class_="pd_company_desc")
        if not subtitle:
            continue
        label = clean_text(subtitle).lower()
        value = clean_text(desc) if desc else ""
        if "address" in label:
            info["address"] = value
        elif "phone" in label or "tel" in label:
            info["phone"] = clean_phone(value)
        elif "homepage" in label or "website" in label or "web" in label:
            info["website"] = clean_url(value)

    # Also check homepageBox for external website link
    homepage_box = soup.find("div", class_="homepageBox")
    if homepage_box and not info.get("website"):
        link = homepage_box.find("a")
        if link:
            href = link.get("href", "")
            if href and "tradekorea.com" not in href:
                info["website"] = clean_url(href)

    return info


def crawl_tradekorea(client: httpx.Client, limit: int | None = None) -> list[dict]:
    directory_name = "TradeKorea"
    results: list[dict] = []
    seen_businessnos: set[str] = set()
    print(f"\n[TRADEKOREA] Crawling {directory_name} (tradekorea.com)...")

    # Collect companies across all packaging subcategories
    for category, cat_name in TRADEKOREA_CATEGORIES:
        if limit and len(results) >= limit:
            break
        print(f"  Category: {cat_name} ({category})")
        start_count = 0
        page_num = 0
        while True:
            if limit and len(results) >= limit:
                break
            page_num += 1
            companies = _tradekorea_search_page(client, category, start_count)
            if not companies:
                break
            for company in companies:
                if limit and len(results) >= limit:
                    break
                bn = company["businessno"]
                if bn and bn in seen_businessnos:
                    continue
                if bn:
                    seen_businessnos.add(bn)
                results.append(company)
            # Each page has 20 results; stop if we got fewer
            if len(companies) < 20:
                break
            start_count += 20
            time.sleep(REQUEST_DELAY)

        time.sleep(REQUEST_DELAY)

    print(f"  Found {len(results)} unique companies in listings")

    # Enrich with detail page info (address)
    enriched: list[dict] = []
    for i, company in enumerate(results):
        if limit and i >= limit:
            break
        bn = company.get("businessno", "")
        name = company["name"]
        detail_url = company.get("detail_url", "")

        detail: dict[str, str] = {}
        if bn:
            detail = _tradekorea_fetch_detail(client, bn)
            time.sleep(REQUEST_DELAY)

        enriched.append({
            "name": name,
            "address": detail.get("address", ""),
            "phone": detail.get("phone", ""),
            "website": detail.get("website", ""),
            "source": "b2b_directory",
            "directory_name": directory_name,
            "crawl_url": detail_url,
        })
        status_str = f"addr={'YES' if detail.get('address') else 'no'}"
        print(f"  [{i+1}] {name[:50]} ({status_str})")

    print(f"  => {len(enriched)} companies collected from {directory_name}")
    return enriched


# ── 2. KoreanNet (koreannet.or.kr) ────────────────────────────────────────────
# GS1Korea barcode product DB. Not a B2B company directory — provides product
# listings with brand/company names as product owners. Search for packaging-related
# product names to find companies that manufacture packaging materials.
# Contact details (address, phone) are not publicly available.

KOREANNET_BASE = "http://www.koreannet.or.kr"
KOREANNET_SEARCH_URL = f"{KOREANNET_BASE}/front/allproduct/prodSrchList.do"

KOREANNET_SEARCH_TERMS = [
    "포장재",
    "포장용기",
    "포장박스",
    "골판지",
    "완충재",
    "포장필름",
]


def _koreannet_parse_product_list(soup: BeautifulSoup) -> list[dict]:
    """Extract product items from koreannet search results."""
    products = []
    good_list = soup.find("ul", class_="good_list")
    if not good_list:
        return products

    for item in good_list.find_all("li"):
        gtin_div = item.find(class_="num")
        name_div = item.find(class_="nm")
        cate_div = item.find(class_="cate")
        if not name_div:
            continue
        gtin = clean_text(gtin_div)
        product_name = clean_text(name_div)
        category = clean_text(cate_div)
        if gtin:
            products.append({"gtin": gtin, "product_name": product_name, "category": category})
    return products


def _extract_brand_from_product(product_name: str) -> str:
    """
    Best-effort extraction of company/brand from Korean product name.
    Many Korean products include brand in the name (e.g. '삼성 포장재').
    Returns empty string when no clear brand is identifiable.
    """
    # Strip common filler words and units
    name = re.sub(r"\d+\s*(g|kg|ml|L|매|개|장|롤|묶음|set|SET)\b", "", product_name)
    name = name.strip()
    # If the first token looks like a brand (Korean word, no product descriptors), return it
    tokens = name.split()
    if tokens and len(tokens[0]) >= 2 and re.match(r"^[가-힣a-zA-Z]+$", tokens[0]):
        return tokens[0]
    return ""


def crawl_koreannet(client: httpx.Client, limit: int | None = None) -> list[dict]:
    directory_name = "KoreanNet"
    results: list[dict] = []
    seen_brands: set[str] = set()
    print(f"\n[KOREANNET] Crawling {directory_name} (koreannet.or.kr)...")
    print("  Note: This site is a GS1Korea barcode product DB, not a B2B company directory.")
    print("  Extracting brand/company names from packaging product listings.")

    for term in KOREANNET_SEARCH_TERMS:
        if limit and len(results) >= limit:
            break
        print(f"  Search term: {term!r}")

        for page_num in range(1, 6):  # max 5 pages per term
            if limit and len(results) >= limit:
                break
            soup = fetch_page(
                client,
                KOREANNET_SEARCH_URL,
                method="POST",
                data={"searchText": term, "pageNum": str(page_num)},
            )
            if soup is None:
                break

            # Check total count
            cnt_div = soup.find(class_="cnt")
            if page_num == 1 and cnt_div:
                print(f"    Total results: {clean_text(cnt_div)}")

            products = _koreannet_parse_product_list(soup)
            if not products:
                break

            for product in products:
                brand = _extract_brand_from_product(product["product_name"])
                if not brand or brand in seen_brands:
                    continue
                # Only include if the brand name looks like a company (not a generic word)
                if len(brand) < 2 or brand in ("포장", "박스", "필름", "용기", "완충", "골판지"):
                    continue
                seen_brands.add(brand)
                crawl_url = (
                    f"{KOREANNET_SEARCH_URL}?searchText={urllib.parse.quote(brand)}"
                )
                results.append({
                    "name": brand,
                    "address": "",
                    "phone": "",
                    "website": "",
                    "source": "b2b_directory",
                    "directory_name": directory_name,
                    "crawl_url": crawl_url,
                })
                count_str = len(results)
                print(f"    [{count_str}] Brand: {brand} (from: {product['product_name'][:40]})")

            if len(products) < 10:
                break
            time.sleep(REQUEST_DELAY)

        time.sleep(REQUEST_DELAY)

    print(f"  => {len(results)} brand names collected from {directory_name}")
    if len(results) == 0:
        print("  (Expected: koreannet.or.kr has limited public B2B packaging company data)")
    return results


# ── DB insert ─────────────────────────────────────────────────────────────────

def insert_crawl_job(
    supabase_url: str,
    service_role_key: str,
    company: dict,
    existing_names: list[str],
    existing_urls: set[str],
    dry_run: bool,
) -> str:
    """Returns: 'inserted', 'dup_name', 'dup_url', 'no_name', 'error'"""
    name = company.get("name", "").strip()
    if not name:
        return "no_name"

    crawl_url = company.get("crawl_url", "")

    if is_duplicate_name(name, existing_names):
        return "dup_name"

    if crawl_url and crawl_url in existing_urls:
        return "dup_url"

    extracted = {
        "name": name,
        "address": company.get("address") or None,
        "phone": company.get("phone") or None,
        "website": company.get("website") or None,
        "source": "b2b_directory",
        "directory_name": company.get("directory_name", ""),
    }

    if not dry_run:
        status, result = supabase_request(
            "POST",
            "/rest/v1/crawl_jobs",
            supabase_url,
            service_role_key,
            data={"url": crawl_url or name, "status": "pending", "extracted": extracted},
        )
        if status not in (200, 201):
            print(f"    DB ERROR {status}: {str(result)[:200]}")
            return "error"

    existing_names.append(name)
    if crawl_url:
        existing_urls.add(crawl_url)
    return "inserted"


# ── Main ──────────────────────────────────────────────────────────────────────

CRAWLERS = {
    "tradekorea": crawl_tradekorea,
    "koreannet": crawl_koreannet,
}


def main() -> None:
    parser = argparse.ArgumentParser(description="B2B directory packaging company crawler (KOR-183)")
    parser.add_argument("--dry-run", action="store_true", help="Do not write to DB")
    parser.add_argument(
        "--directory",
        choices=list(CRAWLERS.keys()),
        help="Crawl only the specified directory (default: all)",
    )
    parser.add_argument("--limit", type=int, help="Max companies per directory")
    args = parser.parse_args()

    supabase_url, service_role_key = get_config()

    print("Loading existing data from DB...")
    existing_names = fetch_existing_company_names(supabase_url, service_role_key)
    existing_urls = fetch_existing_crawl_urls(supabase_url, service_role_key)
    print(f"  {len(existing_names)} existing companies, {len(existing_urls)} crawl URLs")

    active_crawlers = (
        {args.directory: CRAWLERS[args.directory]}
        if args.directory
        else CRAWLERS
    )

    total_stats: dict[str, int] = {
        "found": 0,
        "inserted": 0,
        "dup_name": 0,
        "dup_url": 0,
        "no_name": 0,
        "error": 0,
    }

    with httpx.Client(headers=HEADERS, follow_redirects=True) as client:
        for key, crawler_fn in active_crawlers.items():
            companies = crawler_fn(client, limit=args.limit)
            print(f"\n  Inserting {len(companies)} companies from [{key}]...")

            for company in companies:
                total_stats["found"] += 1
                outcome = insert_crawl_job(
                    supabase_url,
                    service_role_key,
                    company,
                    existing_names,
                    existing_urls,
                    dry_run=args.dry_run,
                )
                total_stats[outcome] = total_stats.get(outcome, 0) + 1
                if outcome == "dup_name":
                    print(f"    [DUP]  {company.get('name', '')[:50]}")
                elif outcome == "no_name":
                    print(f"    [SKIP] no name: {str(company)[:80]}")

    print(f"\n{'='*60}")
    print("Summary:")
    print(f"  Found        : {total_stats['found']}")
    print(f"  Inserted     : {total_stats['inserted']}")
    print(f"  Dup name     : {total_stats['dup_name']}")
    print(f"  Dup URL      : {total_stats['dup_url']}")
    print(f"  No name      : {total_stats['no_name']}")
    print(f"  Errors       : {total_stats.get('error', 0)}")
    if args.dry_run:
        print("  (dry-run: nothing written to DB)")


if __name__ == "__main__":
    main()
