#!/usr/bin/env python3
"""
Convert crawl_jobs results into companies table records.
KOR-128: crawl_jobs.extracted JSON → companies INSERT + crawl_jobs 상태 done 업데이트.

Reads crawl_jobs with status=pending and non-null extracted JSON (from naver or other sources),
converts to companies format, deduplicates, inserts new companies, and links back.

Usage:
  python3 scripts/crawl-to-companies.py [--dry-run] [--source naver_local] [--limit 100]
"""
import argparse
import hashlib
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

# Category mapping from Korean category strings to DB enum
CATEGORY_KEYWORDS = {
    "eco": ["친환경", "생분해", "바이오", "재활용", "재생", "eco", "fsc", "환경", "대나무"],
    "metal": ["알루미늄", "금속", "스틸", "철", "캔", "드럼", "틴", "포일"],
    "plastic": ["플라스틱", "pet", "pp", "pe", "pvc", "hdpe", "사출", "용기", "pla", "화장품용기"],
    "flexible": ["연포장", "라미네이트", "필름", "파우치", "스트레치", "방청", "비닐"],
    "glass": ["유리", "glass"],
    "paper": ["박스", "상자", "종이", "골판지", "택배", "쇼핑백", "패키징", "포장지", "라벨", "인쇄", "봉투"],
}
DEFAULT_CATEGORY = "paper"


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


# ── Supabase helpers ─────────────────────────────────────────────────────────────

def supabase_request(method, path, supabase_url, service_role_key, data=None, params=None, prefer="return=representation"):
    url = f"{supabase_url}{path}"
    if params:
        query = "&".join(f"{k}={urllib.parse.quote(str(v))}" for k, v in params.items())
        url = f"{url}?{query}"
    headers = {
        "Authorization": f"Bearer {service_role_key}",
        "apikey": service_role_key,
        "Content-Type": "application/json",
        "Prefer": prefer,
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


def fetch_pending_crawl_jobs(supabase_url, service_role_key, source_filter=None, limit=500):
    """Fetch crawl_jobs where extracted is not null (naver results ready to process)."""
    path = (
        f"/rest/v1/crawl_jobs"
        f"?select=id,url,extracted,status"
        f"&extracted=not.is.null"
        f"&status=eq.pending"
        f"&limit={limit}"
        f"&order=created_at.asc"
    )
    if source_filter:
        # Filter by source in extracted JSON
        path += f"&extracted->>'source'=eq.{source_filter}"
    status, data = supabase_request("GET", path, supabase_url, service_role_key)
    if status != 200:
        print(f"ERROR fetching crawl_jobs: {status} {data}")
        return []
    return data if isinstance(data, list) else []


def fetch_existing_slugs(supabase_url, service_role_key):
    """Return set of all existing company slugs."""
    slugs = set()
    offset = 0
    page_size = 1000
    while True:
        status, data = supabase_request(
            "GET",
            f"/rest/v1/companies?select=slug&limit={page_size}&offset={offset}",
            supabase_url,
            service_role_key,
        )
        if status != 200 or not isinstance(data, list):
            break
        slugs.update(r["slug"] for r in data if r.get("slug"))
        if len(data) < page_size:
            break
        offset += page_size
    return slugs


def fetch_existing_company_names(supabase_url, service_role_key):
    """Return list of (id, name) for duplicate name check."""
    names = []
    offset = 0
    page_size = 1000
    while True:
        status, data = supabase_request(
            "GET",
            f"/rest/v1/companies?select=id,name&limit={page_size}&offset={offset}",
            supabase_url,
            service_role_key,
        )
        if status != 200 or not isinstance(data, list):
            break
        names.extend(data)
        if len(data) < page_size:
            break
        offset += page_size
    return names


# ── Slug generation ──────────────────────────────────────────────────────────────

LEGAL_ENTITY_RE = re.compile(r"\(주\)|\(유\)|주식회사|유한회사|㈜|\(주\)")
SLUG_SAFE_RE = re.compile(r"[^\w가-힣\-]")
HANGEUL_RE = re.compile(r"[가-힣]")

# Hangeul initial consonant map for romanization
CHOSUNG = [
    "g", "gg", "n", "d", "dd", "r", "m", "b", "bb",
    "s", "ss", "", "j", "jj", "ch", "k", "t", "p", "h",
]
JUNGSUNG = [
    "a", "ae", "ya", "yae", "eo", "e", "yeo", "ye", "o",
    "wa", "wae", "oe", "yo", "u", "wo", "we", "wi", "yu", "eu", "ui", "i",
]
JONGSUNG = [
    "", "g", "gg", "gs", "n", "nj", "nh", "d", "l",
    "lg", "lm", "lb", "ls", "lt", "lp", "lh", "m", "b", "bs",
    "s", "ss", "ng", "j", "ch", "k", "t", "p", "h",
]

def hangeul_to_roman(text: str) -> str:
    result = []
    for char in text:
        code = ord(char) - 0xAC00
        if 0 <= code <= 11171:
            cho = code // (21 * 28)
            jung = (code % (21 * 28)) // 28
            jong = code % 28
            result.append(CHOSUNG[cho] + JUNGSUNG[jung] + JONGSUNG[jong])
        elif char.isascii():
            result.append(char)
        else:
            result.append("")
    return "".join(result)


def make_slug(name: str, existing_slugs: set) -> str:
    # Strip legal entities
    clean = LEGAL_ENTITY_RE.sub("", name).strip()
    # Romanize Korean
    romanized = hangeul_to_roman(clean)
    # Keep alphanumeric and hyphens
    slug = re.sub(r"[^a-z0-9\-]", "-", romanized.lower())
    slug = re.sub(r"-+", "-", slug).strip("-")[:50]

    if not slug:
        # Fallback: use name hash
        slug = "co-" + hashlib.md5(name.encode()).hexdigest()[:8]

    # Ensure uniqueness
    base = slug
    counter = 2
    while slug in existing_slugs:
        slug = f"{base}-{counter}"
        counter += 1
    return slug


# ── Category inference ───────────────────────────────────────────────────────────

def infer_category(extracted: dict) -> str:
    text = " ".join([
        extracted.get("name", ""),
        extracted.get("category_kor", ""),
        extracted.get("description", ""),
    ]).lower()
    scores = {cat: 0 for cat in CATEGORY_KEYWORDS}
    for cat, kws in CATEGORY_KEYWORDS.items():
        for kw in kws:
            if kw in text:
                scores[cat] += 1
    best = max(scores, key=scores.get)
    return best if scores[best] > 0 else DEFAULT_CATEGORY


# ── Address parsing ──────────────────────────────────────────────────────────────

PROVINCE_MAP = {
    "서울": "서울특별시", "부산": "부산광역시", "대구": "대구광역시",
    "인천": "인천광역시", "광주": "광주광역시", "대전": "대전광역시",
    "울산": "울산광역시", "세종": "세종특별자치시", "경기": "경기도",
    "강원": "강원도", "충북": "충청북도", "충남": "충청남도",
    "전북": "전라북도", "전남": "전라남도", "경북": "경상북도",
    "경남": "경상남도", "제주": "제주특별자치도",
}

def parse_address(address: str) -> tuple[str | None, str | None]:
    """Extract province and city from Korean address string."""
    if not address:
        return None, None
    province = None
    city = None
    for short, full in PROVINCE_MAP.items():
        if short in address or full in address:
            province = full
            break
    # Try to extract city (시/군/구 following province keyword)
    city_match = re.search(r"([가-힣]+(?:시|군|구))", address)
    if city_match:
        city = city_match.group(1)
    return province, city


# ── Name dedup ───────────────────────────────────────────────────────────────────

def normalize_name(name: str) -> str:
    name = LEGAL_ENTITY_RE.sub("", name or "")
    return re.sub(r"\s+", "", name).strip().lower()


def bigrams(s: str) -> set:
    return set(s[i:i + 2] for i in range(len(s) - 1)) if len(s) > 1 else set(s)


def is_duplicate_name(candidate: str, existing_names: list, threshold: float = 0.85) -> bool:
    norm = normalize_name(candidate)
    for entry in existing_names:
        norm_e = normalize_name(entry.get("name", ""))
        if norm == norm_e:
            return True
        bg_c, bg_e = bigrams(norm), bigrams(norm_e)
        if bg_c and bg_e:
            sim = len(bg_c & bg_e) / len(bg_c | bg_e)
            if sim >= threshold:
                return True
    return False


# ── Transform crawl job extracted → company record ───────────────────────────────

def extracted_to_company(extracted: dict, slug: str) -> dict:
    name = extracted.get("name", "").strip()
    address = extracted.get("address", "")
    province, city = parse_address(address)
    phone = extracted.get("phone", "")
    category = infer_category(extracted)
    website = extracted.get("link", "")

    # Only use link if it's a real company homepage (not naver.com)
    if website and "naver.com" in website:
        website = None

    return {
        "name": name,
        "slug": slug,
        "category": category,
        "address": address or None,
        "province": province,
        "city": city,
        "phone": phone or None,
        "website": website or None,
        "is_verified": False,
        "tags": [],
        "products": [],
        "certifications": [],
        "created_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "updated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    }


# ── Main ─────────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Convert crawl_jobs to company records")
    parser.add_argument("--dry-run", action="store_true", help="Do not write to DB")
    parser.add_argument("--source", default="naver_local", help="Filter by extracted.source")
    parser.add_argument("--limit", type=int, default=500, help="Max crawl_jobs to process")
    args = parser.parse_args()

    supabase_url, service_role_key = get_config()

    print(f"Loading pending crawl_jobs (source={args.source}, limit={args.limit})...")
    jobs = fetch_pending_crawl_jobs(supabase_url, service_role_key, source_filter=None, limit=args.limit)
    # Filter by source in Python (Supabase jsonb ->> filter syntax may vary)
    if args.source:
        jobs = [j for j in jobs if (j.get("extracted") or {}).get("source") == args.source]
    print(f"  {len(jobs)} jobs to process")

    if not jobs:
        print("No pending jobs found. Done.")
        return

    print("Loading existing company slugs and names...")
    existing_slugs = fetch_existing_slugs(supabase_url, service_role_key)
    existing_names = fetch_existing_company_names(supabase_url, service_role_key)
    print(f"  {len(existing_slugs)} slugs, {len(existing_names)} company names loaded")

    inserted = 0
    skipped_dup = 0
    failed = 0

    for job in jobs:
        extracted = job.get("extracted") or {}
        job_id = job["id"]
        name = extracted.get("name", "").strip()

        if not name:
            print(f"  [SKIP] job {job_id}: no name in extracted")
            skipped_dup += 1
            continue

        # Duplicate check
        if is_duplicate_name(name, existing_names):
            print(f"  [DUP]  {name}")
            # Mark job as skipped
            if not args.dry_run:
                supabase_request(
                    "PATCH",
                    f"/rest/v1/crawl_jobs?id=eq.{job_id}",
                    supabase_url,
                    service_role_key,
                    data={"status": "skipped", "error": "duplicate name", "updated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())},
                    prefer="return=minimal",
                )
            skipped_dup += 1
            continue

        slug = make_slug(name, existing_slugs)
        company = extracted_to_company(extracted, slug)

        print(f"  [ADD]  {name} | {slug} | {company['category']} | {company.get('province', '?')}")

        if not args.dry_run:
            # Insert company
            status, result = supabase_request(
                "POST",
                "/rest/v1/companies",
                supabase_url,
                service_role_key,
                data=company,
            )
            if status in (200, 201) and isinstance(result, list) and result:
                company_id = result[0]["id"]
                inserted += 1
                existing_slugs.add(slug)
                existing_names.append({"id": company_id, "name": name})
                # Mark crawl_job as done + link company_id
                supabase_request(
                    "PATCH",
                    f"/rest/v1/crawl_jobs?id=eq.{job_id}",
                    supabase_url,
                    service_role_key,
                    data={
                        "status": "done",
                        "company_id": company_id,
                        "updated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                    },
                    prefer="return=minimal",
                )
            else:
                print(f"    ERROR inserting {name}: {status} {str(result)[:200]}")
                failed += 1
        else:
            inserted += 1
            existing_slugs.add(slug)
            existing_names.append({"id": "dry-run", "name": name})

    print(f"\n{'='*60}")
    print(f"Results:")
    print(f"  Inserted      : {inserted}")
    print(f"  Skipped (dup) : {skipped_dup}")
    print(f"  Failed        : {failed}")
    if args.dry_run:
        print("  (dry-run: nothing written to DB)")


if __name__ == "__main__":
    main()
