#!/usr/bin/env python3
"""
Filter CSV companies data and register to Supabase.
KOR-29: 크롤링 CSV 데이터 필터링 및 Supabase 업체 등록
"""
import csv
import re
import sys
import json
import time
import urllib.request
import urllib.parse
import urllib.error
from collections import defaultdict

# ── Config ─────────────────────────────────────────────────────────────────────
SUPABASE_URL = "https://jnrciibwtutzymkoepfp.supabase.co"
SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpucmNpaWJ3dHV0enlta29lcGZwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjU2NTI2OCwiZXhwIjoyMDkyMTQxMjY4fQ.uVBSdXbxzUbhNKTOaYaiOk2r2etCFnNR8tQ0z1mhJxg"
CSV_PATH = "/tmp/companies.csv"

# ── Filtering helpers ──────────────────────────────────────────────────────────
NEWS_NAME_PATTERNS = [
    '머니투데이', '뽐뿌', '코스인코리아', '코스인', '뉴스', '미디어', '신문',
    '매거진', '나무위키', '위키', '아시아경제', '헤럴드', '조선일보', '중앙일보',
    '동아일보', '한국경제', '매일경제', '경향신문', '한겨레', '서울경제',
    '파이낸셜', '연합뉴스', '이데일리', '뉴시스', '채널A', 'mbn', 'jtbc',
    '블로그', '카페', '커뮤니티', '포럼', '갤러리', '쇼핑몰 총집합',
]

NEWS_ARTICLE_PATH_PATTERNS = [
    r'/news/', r'/article', r'/\d{4}/\d{2}/\d{2}/', r'/\d{13,}',
    r'/view/', r'/bbs/', r'/board/', r'[?&]no=\d+', r'/post/',
]

NEWS_DOMAINS = [
    'mt.co.kr', 'cosinkorea.com', 'cosmorning.com', 'naver.com/news',
    'ppomppu.co.kr', 'dcinside.com', 'clien.net', 'ruliweb.com',
    'namu.wiki', 'kin.naver.com',
]


def is_news_article_url(url: str) -> bool:
    parsed = urllib.parse.urlparse(url)
    domain = parsed.netloc.lower()
    path = parsed.path.lower() + '?' + parsed.query.lower()
    if any(d in domain for d in NEWS_DOMAINS):
        return True
    if any(re.search(p, path) for p in NEWS_ARTICLE_PATH_PATTERNS):
        return True
    return False


def is_news_media_name(name: str) -> bool:
    return any(p in name for p in NEWS_NAME_PATTERNS)


# ── Company name cleaning ──────────────────────────────────────────────────────
TITLE_NOISE = re.compile(
    r'(\s*[|\-–]\s*.*$|'           # Everything after | or -
    r'\s*<[^>]+>\s*$|'             # HTML tags at end
    r'\s+홈페이지에\s+오신\s+것을.*$|'
    r'\s*::\s+.*$|'
    r'\s+공식\s*(사이트|홈페이지).*$)',
    re.DOTALL
)

COMPANY_SUFFIX = re.compile(
    r'^(주식회사\s*|㈜\s*|(주)\s*|\(주\)\s*)',
    re.IGNORECASE
)

def clean_name(raw: str) -> str:
    name = raw.strip()
    # Remove everything after title separators
    name = TITLE_NOISE.sub('', name).strip()
    # Normalize parenthetical company types
    name = name.replace('㈜', '(주)')
    # Remove leading 주식회사/(주) for slug generation but keep in name
    return name if name else raw.strip()


# ── Slug generation ────────────────────────────────────────────────────────────
def make_slug(name: str, phone: str) -> str:
    # Use last 4 digits of phone as disambiguator
    digits = re.sub(r'\D', '', phone)
    suffix = digits[-4:] if len(digits) >= 4 else digits
    # Transliterate Korean name characters roughly via hash
    import hashlib
    name_hash = hashlib.md5(name.encode()).hexdigest()[:6]
    safe_name = re.sub(r'[^\w]', '-', name)[:30].strip('-').lower()
    return f"{safe_name}-{suffix}" if safe_name else f"co-{name_hash}-{suffix}"


# ── Category mapping ───────────────────────────────────────────────────────────
CATEGORY_KEYWORDS = {
    'eco': ['친환경', '생분해', '바이오', '재활용', '재생', 'eco', 'FSC', '환경', '대나무', '왕겨'],
    'food_grade': ['식품', '일회용기', '도시락', '종이컵', '카페', '배달', '냉동', '냉장', 'HACCP',
                   '진공포장', '레토르트', '파우치', '음료캔', '캔음료'],
    'metal': ['알루미늄', '금속', '스틸', '철', '캔', '드럼', '틴', '포일'],
    'plastic': ['플라스틱', 'PET', 'PP', 'PE', 'PVC', 'HDPE', '사출', '용기', 'PLA', '화장품용기'],
    'saneobyong': ['산업용', '완충재', '에어캡', '버블', '스트레치', '필름', '방청', '물류', '파레트',
                   '파렛트', '알루미늄포일', '연포장', '라미네이트'],
    'jiryu': ['박스', '상자', '종이', '단상자', '골판지', '택배', '쇼핑백', '패키징', '포장지',
              '라벨', '인쇄', '봉투', '쇼핑',],
}

VALID_CATEGORIES = ['eco', 'food_grade', 'metal', 'plastic', 'saneobyong', 'jiryu']

def map_category(keyword: str, name: str, description: str) -> str:
    text = f"{keyword} {name} {description}".lower()
    scores = {cat: 0 for cat in VALID_CATEGORIES}
    for cat, kws in CATEGORY_KEYWORDS.items():
        for kw in kws:
            if kw.lower() in text:
                scores[cat] += 1
    best = max(scores, key=scores.get)
    return best if scores[best] > 0 else 'jiryu'  # default


# ── Phone normalization ────────────────────────────────────────────────────────
def normalize_phone(phone: str) -> str:
    return re.sub(r'[\s\-\.\(\)]', '', phone).strip()


# ── Address parsing ────────────────────────────────────────────────────────────
PROVINCES = [
    '서울특별시', '부산광역시', '대구광역시', '인천광역시', '광주광역시', '대전광역시',
    '울산광역시', '세종특별자치시', '경기도', '강원도', '충청북도', '충청남도',
    '전라북도', '전라남도', '경상북도', '경상남도', '제주특별자치도',
    '서울', '부산', '대구', '인천', '광주', '대전', '울산', '세종', '경기',
    '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주',
]

PROVINCE_MAP = {
    '서울': '서울특별시', '부산': '부산광역시', '대구': '대구광역시',
    '인천': '인천광역시', '광주': '광주광역시', '대전': '대전광역시',
    '울산': '울산광역시', '세종': '세종특별자치시', '경기': '경기도',
    '강원': '강원도', '충북': '충청북도', '충남': '충청남도',
    '전북': '전라북도', '전남': '전라남도', '경북': '경상북도',
    '경남': '경상남도', '제주': '제주특별자치도',
}

def parse_address(addr: str):
    province = ''
    city = ''
    for p in PROVINCES:
        if addr.startswith(p):
            province = PROVINCE_MAP.get(p, p)
            rest = addr[len(p):].strip()
            # Extract city (next word before space)
            city_match = re.match(r'^([^\s]+)', rest)
            if city_match:
                city = city_match.group(1)
            break
    return province, city


# ── Main ───────────────────────────────────────────────────────────────────────
def load_and_filter():
    with open(CSV_PATH, 'r', encoding='utf-8-sig') as f:
        reader = csv.DictReader(f)
        rows = list(reader)

    print(f"Total CSV rows: {len(rows)}")

    filtered = []
    skipped_news = 0
    skipped_no_phone = 0
    skipped_no_contact = 0

    for r in rows:
        name = r.get('업체명', '').strip()
        phone = r.get('전화번호', '').strip()
        address = r.get('주소', '').strip()
        website = r.get('웹사이트_URL', '').strip()

        # Skip news/media names
        if is_news_media_name(name):
            skipped_news += 1
            continue

        # Skip news article URLs (but keep company sites even if news-ish path)
        if is_news_article_url(website) and not address:
            skipped_news += 1
            continue

        # Must have phone
        if not phone:
            skipped_no_phone += 1
            continue

        # Must have address OR real website
        if not address and (not website or is_news_article_url(website)):
            skipped_no_contact += 1
            continue

        filtered.append(r)

    print(f"Skipped news/media: {skipped_news}")
    print(f"Skipped no phone: {skipped_no_phone}")
    print(f"Skipped no contact: {skipped_no_contact}")
    print(f"After filter: {len(filtered)}")
    return filtered


def deduplicate(rows):
    by_phone = defaultdict(list)
    for r in rows:
        phone = normalize_phone(r.get('전화번호', ''))
        by_phone[phone].append(r)

    merged = []
    for phone, group in by_phone.items():
        # Pick best record: prefer one with address
        best = max(group, key=lambda r: (
            bool(r.get('주소', '').strip()),
            bool(r.get('이메일', '').strip()),
            bool(r.get('소개글', '').strip()),
            len(r.get('소개글', '')),
        ))
        # Merge keywords from all duplicates
        all_keywords = set()
        all_images = set()
        for r in group:
            for kw in r.get('검색키워드', '').split(','):
                k = kw.strip()
                if k:
                    all_keywords.add(k)
            img = r.get('대표이미지_URL', '').strip()
            if img:
                all_images.add(img)

        best['_merged_keywords'] = list(all_keywords)
        best['_merged_images'] = list(all_images)
        merged.append(best)

    print(f"After dedup: {len(merged)} unique companies")
    return merged


def to_supabase_record(r):
    name_raw = r.get('업체명', '').strip()
    name = clean_name(name_raw)
    phone_raw = r.get('전화번호', '').strip()
    phone = normalize_phone(phone_raw)
    address = r.get('주소', '').strip()
    website = r.get('웹사이트_URL', '').strip()

    # Clean website URL (remove tracking params)
    if website and '?' in website:
        parsed = urllib.parse.urlparse(website)
        # Keep only clean URLs without tracking params
        clean_qs = {k: v for k, v in urllib.parse.parse_qs(parsed.query).items()
                    if not k.startswith('srs') and k not in ('utm_source', 'utm_medium', 'utm_campaign')}
        website = urllib.parse.urlunparse(parsed._replace(query=urllib.parse.urlencode(clean_qs, doseq=True)))

    province, city = parse_address(address)
    description = r.get('소개글', '').strip()
    keywords = r.get('_merged_keywords', []) or [k.strip() for k in r.get('검색키워드', '').split(',') if k.strip()]
    image_url = (r.get('_merged_images') or [r.get('대표이미지_URL', '').strip()])[0] if True else ''
    image_url = image_url.strip() if isinstance(image_url, str) else ''

    category = map_category(
        ' '.join(keywords),
        name,
        description,
    )

    slug = make_slug(name, phone)

    record = {
        'slug': slug,
        'name': name,
        'description': description[:1000] if description else None,
        'category': category,
        'subcategory': keywords[0] if keywords else None,
        'address': address if address else None,
        'city': city if city else None,
        'province': province if province else None,
        'phone': phone_raw,  # Keep formatted phone
        'email': r.get('이메일', '').strip() or None,
        'website': website if website and not is_news_article_url(website) else None,
        'logo_url': image_url if image_url else None,
        'products': keywords[:10],
        'certifications': [],
        'is_verified': False,
    }
    return record


def supabase_request(method, path, data=None):
    url = f"{SUPABASE_URL}{path}"
    headers = {
        'Authorization': f'Bearer {SERVICE_ROLE_KEY}',
        'apikey': SERVICE_ROLE_KEY,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal',
    }
    body = json.dumps(data).encode() if data else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            content = resp.read().decode()
            return resp.status, content
    except urllib.error.HTTPError as e:
        content = e.read().decode()
        return e.code, content


def get_existing_slugs():
    status, content = supabase_request('GET', '/rest/v1/companies?select=slug&limit=10000')
    if status == 200:
        data = json.loads(content)
        return {r['slug'] for r in data}
    print(f"Warning: could not fetch existing slugs ({status}): {content[:200]}")
    return set()


def insert_batch(records):
    status, content = supabase_request('POST', '/rest/v1/companies', records)
    return status, content


def main():
    rows = load_and_filter()
    rows = deduplicate(rows)

    records = [to_supabase_record(r) for r in rows]

    print(f"\nFetching existing companies from Supabase...")
    existing = get_existing_slugs()
    print(f"Existing: {len(existing)}")

    to_insert = [rec for rec in records if rec['slug'] not in existing]
    print(f"New to insert: {len(to_insert)}")

    if not to_insert:
        print("Nothing to insert.")
        return

    # Show sample
    print("\nSample records to insert:")
    for rec in to_insert[:5]:
        print(f"  [{rec['category']}] {rec['name']} | {rec['phone']} | {rec['city']}")

    # Insert in batches of 50
    BATCH = 50
    total_inserted = 0
    errors = 0

    for i in range(0, len(to_insert), BATCH):
        batch = to_insert[i:i+BATCH]
        status, content = insert_batch(batch)
        if status in (200, 201):
            total_inserted += len(batch)
            print(f"  ✓ Batch {i//BATCH + 1}: inserted {len(batch)} records")
        else:
            errors += len(batch)
            print(f"  ✗ Batch {i//BATCH + 1} error ({status}): {content[:300]}")
            # Try one by one for error batch
            if len(batch) > 1:
                print("    Retrying one by one...")
                for rec in batch:
                    s2, c2 = insert_batch([rec])
                    if s2 in (200, 201):
                        total_inserted += 1
                        errors -= 1
                    else:
                        print(f"    ✗ {rec['name']}: {c2[:150]}")

    print(f"\n✅ Done: inserted {total_inserted}, errors {errors}")


if __name__ == '__main__':
    main()
