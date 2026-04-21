#!/usr/bin/env python3
"""
Naver Search API crawler for packaging companies.
KOR-128: 네이버 검색 API(지역 검색)로 포장 업체 발굴 후 crawl_jobs에 저장.

Requirements in .env.local:
  NAVER_CLIENT_ID=<your-client-id>
  NAVER_CLIENT_SECRET=<your-client-secret>
  NEXT_PUBLIC_SUPABASE_URL=<url>
  SUPABASE_SERVICE_ROLE_KEY=<key>

Usage:
  python3 scripts/crawl-naver.py [--dry-run] [--display 5]
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

SCRIPT_DIR = Path(__file__).parent
PROJECT_ROOT = SCRIPT_DIR.parent
ENV_FILE = PROJECT_ROOT / ".env.local"

NAVER_LOCAL_API = "https://openapi.naver.com/v1/search/local.json"
SEARCH_KEYWORDS = [
    "포장 제조",
    "패키징 업체",
    "박스 제조",
    "비닐 포장",
    "식품 포장재",
    "골판지 제조",
    "플라스틱 포장",
    "친환경 포장재",
    "종이봉투 제조",
    "포장 인쇄",
]
DISPLAY_PER_QUERY = 5
REQUEST_DELAY = 1.1  # seconds between Naver API calls
MAX_RETRIES = 3


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
    naver_client_id = env.get("NAVER_CLIENT_ID", "")
    naver_client_secret = env.get("NAVER_CLIENT_SECRET", "")

    if not supabase_url:
        sys.exit("ERROR: NEXT_PUBLIC_SUPABASE_URL not found in .env.local")
    if not service_role_key:
        sys.exit("ERROR: SUPABASE_SERVICE_ROLE_KEY not found in .env.local")
    if not naver_client_id:
        sys.exit("ERROR: NAVER_CLIENT_ID not found in .env.local")
    if not naver_client_secret:
        sys.exit("ERROR: NAVER_CLIENT_SECRET not found in .env.local")

    return supabase_url, service_role_key, naver_client_id, naver_client_secret


# ── Supabase helpers ─────────────────────────────────────────────────────────────

def supabase_request(method, path, supabase_url, service_role_key, data=None, params=None):
    url = f"{supabase_url}{path}"
    if params:
        query = "&".join(f"{k}={urllib.parse.quote(str(v))}" for k, v in params.items())
        url = f"{url}?{query}"
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
        content = e.read().decode()
        return e.code, content


def fetch_existing_company_names(supabase_url, service_role_key):
    """Fetch all existing company names for duplicate detection."""
    names = []
    offset = 0
    page_size = 1000
    while True:
        status, data = supabase_request(
            "GET",
            f"/rest/v1/companies?select=name&limit={page_size}&offset={offset}",
            supabase_url,
            service_role_key,
        )
        if status != 200 or not isinstance(data, list):
            break
        names.extend(r["name"] for r in data if r.get("name"))
        if len(data) < page_size:
            break
        offset += page_size
    return names


def fetch_existing_crawl_urls(supabase_url, service_role_key):
    """Fetch all URLs already in crawl_jobs to skip re-queuing."""
    urls = set()
    offset = 0
    page_size = 1000
    while True:
        status, data = supabase_request(
            "GET",
            f"/rest/v1/crawl_jobs?select=url&limit={page_size}&offset={offset}",
            supabase_url,
            service_role_key,
        )
        if status != 200 or not isinstance(data, list):
            break
        urls.update(r["url"] for r in data if r.get("url"))
        if len(data) < page_size:
            break
        offset += page_size
    return urls


# ── Name similarity ──────────────────────────────────────────────────────────────

def normalize_name(name: str) -> str:
    """Strip legal suffixes and whitespace for comparison."""
    name = re.sub(r"\(주\)|\(유\)|주식회사|유한회사|㈜", "", name)
    name = re.sub(r"\s+", "", name).strip()
    return name.lower()


def is_duplicate_name(candidate: str, existing_names: list[str], threshold: float = 0.8) -> bool:
    """Simple character overlap ratio for Korean name similarity."""
    norm_candidate = normalize_name(candidate)
    for existing in existing_names:
        norm_existing = normalize_name(existing)
        if norm_candidate == norm_existing:
            return True
        # Jaccard similarity on character bigrams
        def bigrams(s):
            return set(s[i:i+2] for i in range(len(s) - 1)) if len(s) > 1 else set(s)
        bg_c = bigrams(norm_candidate)
        bg_e = bigrams(norm_existing)
        if bg_c and bg_e:
            union = bg_c | bg_e
            inter = bg_c & bg_e
            sim = len(inter) / len(union)
            if sim >= threshold:
                return True
    return False


# ── Naver API ────────────────────────────────────────────────────────────────────

def naver_local_search(keyword: str, client_id: str, client_secret: str, display: int = 5):
    """Call Naver local search API, return list of items."""
    params = urllib.parse.urlencode({"query": keyword, "display": display, "sort": "random"})
    url = f"{NAVER_LOCAL_API}?{params}"
    req = urllib.request.Request(url, headers={
        "X-Naver-Client-Id": client_id,
        "X-Naver-Client-Secret": client_secret,
    })
    for attempt in range(MAX_RETRIES):
        try:
            with urllib.request.urlopen(req, timeout=10) as resp:
                data = json.loads(resp.read().decode())
                return data.get("items", [])
        except urllib.error.HTTPError as e:
            if e.code == 429:
                wait = 2 ** attempt
                print(f"  Rate limited, waiting {wait}s...")
                time.sleep(wait)
            else:
                print(f"  Naver API error {e.code} for '{keyword}': {e.read().decode()[:200]}")
                return []
        except Exception as e:
            print(f"  Request error for '{keyword}': {e}")
            return []
    return []


def strip_html(text: str) -> str:
    return re.sub(r"<[^>]+>", "", text).strip()


def extract_homepage(link: str) -> str | None:
    """Extract base homepage URL from a Naver place link or item link."""
    if not link:
        return None
    parsed = urllib.parse.urlparse(link)
    # Naver place URLs are not company homepages
    if "naver.com" in parsed.netloc:
        return None
    return f"{parsed.scheme}://{parsed.netloc}"


# ── Main ─────────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Naver Search API company crawler")
    parser.add_argument("--dry-run", action="store_true", help="Print results, do not write to DB")
    parser.add_argument("--display", type=int, default=DISPLAY_PER_QUERY, help="Results per keyword")
    args = parser.parse_args()

    supabase_url, service_role_key, naver_id, naver_secret = get_config()

    print("Loading existing companies for duplicate detection...")
    existing_names = fetch_existing_company_names(supabase_url, service_role_key)
    print(f"  {len(existing_names)} existing companies loaded")

    print("Loading existing crawl_jobs URLs...")
    existing_urls = fetch_existing_crawl_urls(supabase_url, service_role_key)
    print(f"  {len(existing_urls)} URLs already queued")

    total_found = 0
    total_inserted = 0
    total_skipped_dup = 0
    total_skipped_url = 0

    for keyword in SEARCH_KEYWORDS:
        print(f"\nSearching: '{keyword}'...")
        items = naver_local_search(keyword, naver_id, naver_secret, display=args.display)
        print(f"  {len(items)} results")

        for item in items:
            name = strip_html(item.get("title", ""))
            address = strip_html(item.get("roadAddress", "") or item.get("address", ""))
            telephone = strip_html(item.get("telephone", ""))
            category_kor = strip_html(item.get("category", ""))
            link = item.get("link", "")
            map_x = item.get("mapx", "")
            map_y = item.get("mapy", "")

            total_found += 1

            # Skip if name is a duplicate of existing company
            if is_duplicate_name(name, existing_names):
                total_skipped_dup += 1
                print(f"  [SKIP-DUP] {name}")
                continue

            # Use Naver place URL as the crawl target (no direct homepage → use place page)
            crawl_url = link if link else f"https://map.naver.com/v5/search/{urllib.parse.quote(name)}"

            if crawl_url in existing_urls:
                total_skipped_url += 1
                print(f"  [SKIP-URL] {name} (already queued)")
                continue

            extracted = {
                "name": name,
                "address": address,
                "phone": telephone,
                "category_kor": category_kor,
                "link": link,
                "map_x": map_x,
                "map_y": map_y,
                "search_keyword": keyword,
                "source": "naver_local",
            }

            print(f"  [ADD] {name} | {address or '주소없음'} | {telephone or '전화없음'}")

            if not args.dry_run:
                status, result = supabase_request(
                    "POST",
                    "/rest/v1/crawl_jobs",
                    supabase_url,
                    service_role_key,
                    data={"url": crawl_url, "status": "pending", "extracted": extracted},
                )
                if status in (200, 201):
                    total_inserted += 1
                    existing_urls.add(crawl_url)
                    existing_names.append(name)
                else:
                    print(f"    ERROR inserting: {result}")
            else:
                total_inserted += 1

        time.sleep(REQUEST_DELAY)

    print(f"\n{'='*60}")
    print(f"Results:")
    print(f"  Total found   : {total_found}")
    print(f"  Inserted      : {total_inserted}")
    print(f"  Skipped (dup) : {total_skipped_dup}")
    print(f"  Skipped (url) : {total_skipped_url}")
    if args.dry_run:
        print("  (dry-run: nothing written to DB)")


if __name__ == "__main__":
    main()
