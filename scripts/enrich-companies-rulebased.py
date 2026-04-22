#!/usr/bin/env python3
"""
Rule-based company profile enrichment.
KOR-117: 458개 업체 프로필 필드를 기존 데이터 기반으로 일괄 강화.

No external AI API needed — uses deterministic rules + Korean B2B templates.
"""
import json
import re
import sys
import urllib.request
import urllib.error
import urllib.parse
from pathlib import Path

SCRIPT_DIR = Path(__file__).parent
PROJECT_ROOT = SCRIPT_DIR.parent
ENV_FILE = PROJECT_ROOT / ".env.local"

# ── Config ──────────────────────────────────────────────────────────────────────

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
    if not url:
        sys.exit("ERROR: NEXT_PUBLIC_SUPABASE_URL not in .env.local")
    if not key:
        sys.exit("ERROR: SUPABASE_SERVICE_ROLE_KEY not in .env.local")
    return url, key


# ── Supabase ────────────────────────────────────────────────────────────────────

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


# ── Enrichment Mappings ─────────────────────────────────────────────────────────

CATEGORY_KO = {
    "paper": "지류/종이",
    "plastic": "플라스틱",
    "metal": "금속",
    "flexible": "연포장",
    "eco": "친환경",
    "glass": "유리",
}

TAG_KO = {
    "food_grade": "식품등급",
    "industrial": "산업용",
    "cosmetic": "화장품",
    "pharma": "제약",
    "design_service": "디자인서비스",
    "ecommerce": "이커머스",
}

CATEGORY_TARGET_INDUSTRIES = {
    "paper": ["이커머스/온라인쇼핑", "식품/농산물", "생활용품", "화장품/뷰티"],
    "plastic": ["식품/음료", "화장품/뷰티", "생활용품", "전자제품"],
    "metal": ["식품/음료 제조", "화학/산업소재", "의약/제약", "물류/유통"],
    "flexible": ["식품/음료", "제약/의료", "화장품/뷰티", "산업자재"],
    "eco": ["친환경 브랜드", "식품/음료", "화장품/뷰티", "ESG 경영 기업"],
    "glass": ["화장품/뷰티", "식품/음료", "제약/의료", "프리미엄 브랜드"],
}

TAG_TARGET_INDUSTRIES = {
    "food_grade": ["식품 제조업", "외식/프랜차이즈", "농수산물 유통", "배달/케이터링"],
    "industrial": ["제조업", "물류/유통", "자동차/부품", "전자/반도체"],
    "cosmetic": ["화장품 브랜드", "뷰티/스킨케어", "OEM/ODM 제조", "K-뷰티 수출"],
    "pharma": ["제약/의약품", "의료기기", "건강기능식품", "바이오텍"],
    "design_service": ["브랜드 기업", "스타트업", "프리미엄 소비재", "선물/기념품"],
    "ecommerce": ["온라인 쇼핑몰", "D2C 브랜드", "구독 서비스", "소셜 커머스"],
}

CATEGORY_KEY_CLIENTS = {
    "paper": ["이커머스 셀러", "식품/농산물 유통사", "소비재 브랜드"],
    "plastic": ["식품 제조업체", "화장품 브랜드사", "생활용품 기업"],
    "metal": ["식음료 제조 대기업", "화학/의약 기업", "산업재 유통사"],
    "flexible": ["식품/음료 제조사", "제약회사", "생활용품 기업"],
    "eco": ["ESG 경영 대기업", "친환경 브랜드", "유기농 식품업체"],
    "glass": ["프리미엄 화장품 브랜드", "주류/음료 제조사", "제약회사"],
}

TAG_KEY_CLIENTS = {
    "food_grade": ["식품 대기업", "프랜차이즈 본사", "농수산물 유통사"],
    "industrial": ["제조업 대기업", "물류 기업", "산업자재 유통사"],
    "cosmetic": ["화장품 브랜드사", "뷰티 스타트업", "OEM/ODM 기업"],
    "pharma": ["제약 대기업", "의료기기 업체", "건강기능식품 제조사"],
    "design_service": ["브랜드 마케팅 기업", "프리미엄 소비재 브랜드"],
    "ecommerce": ["이커머스 셀러", "D2C 브랜드", "온라인 유통사"],
}

# Product keyword → service capability mapping
CAPABILITY_KEYWORDS = {
    "맞춤": "맞춤 제작",
    "주문제작": "맞춤 제작",
    "소량": "소량 생산 가능",
    "대량": "대량 생산 체계",
    "OEM": "OEM 생산",
    "ODM": "ODM 설계/생산",
    "인쇄": "인쇄/디자인 서비스",
    "칼라": "컬러 인쇄",
    "컬러": "컬러 인쇄",
    "디자인": "패키지 디자인",
    "친환경": "친환경 소재 제공",
    "생분해": "생분해 소재 전문",
    "재활용": "재활용 소재 사용",
    "FSC": "FSC 인증 소재",
    "HACCP": "HACCP 위생 기준 충족",
    "ISO": "국제 품질 인증 보유",
    "식품": "식품 안전 포장",
    "진공": "진공 포장 기술",
    "냉동": "냉동/냉장 포장 솔루션",
    "실링": "실링/밀봉 기술",
    "사출": "사출 성형 기술",
    "전국": "전국 배송 지원",
    "당일": "당일 출고 가능",
    "즉납": "재고 기성품 즉납",
    "수출": "해외 수출 실적",
    "컨설팅": "포장 컨설팅",
    "원스톱": "원스톱 포장 솔루션",
    "자체 생산": "자체 공장 생산",
    "공장 직영": "공장 직영 운영",
}

CERT_CAPABILITIES = {
    "ISO 9001": "국제 품질경영 인증",
    "ISO 14001": "환경경영 인증",
    "ISO 22000": "식품안전경영 인증",
    "ISO 22716": "화장품 GMP 인증",
    "HACCP": "HACCP 위생관리",
    "FSC": "FSC 산림 인증",
    "BRC": "BRC 글로벌 식품안전 인증",
    "GRS": "GRS 재활용 인증",
    "OK Compost": "OK Compost 퇴비화 인증",
    "KC": "KC 안전 인증",
    "KS": "KS 한국산업표준",
    "ESD": "ESD 정전기 방지 인증",
    "UN 위험물": "UN 위험물 포장 인증",
}


def extract_founded_year(desc):
    if not desc:
        return None
    m = re.search(r'(\d{4})년\s*(창[업립]|설립|개업)', desc)
    if m:
        year = int(m.group(1))
        if 1950 <= year <= 2025:
            return year
    m = re.search(r'(창[업립]|설립)\s*(\d{4})년?', desc)
    if m:
        year = int(m.group(2))
        if 1950 <= year <= 2025:
            return year
    return None


def infer_min_order_quantity(c):
    desc = (c.get("description") or "")
    products_text = " ".join(c.get("products") or [])
    text = f"{desc} {products_text}"

    if any(kw in text for kw in ["소량", "소량 주문", "낱개"]):
        return "소량 주문 가능"
    if any(kw in text for kw in ["맞춤 제작", "주문 제작", "맞춤제작"]):
        return "맞춤 제작 (협의)"
    if any(kw in text for kw in ["대량", "대량 납품", "대량 주문"]):
        return "대량 주문 특화 (협의)"
    if "도매" in text:
        return "도매 단위 (협의)"
    return None


def build_service_capabilities(c):
    caps = set()
    desc = (c.get("description") or "")
    products = c.get("products") or []
    certs = c.get("certifications") or []
    all_text = f"{desc} {' '.join(products)}"

    for keyword, cap in CAPABILITY_KEYWORDS.items():
        if keyword in all_text:
            caps.add(cap)

    for cert in certs:
        for cert_key, cap in CERT_CAPABILITIES.items():
            if cert_key.lower() in cert.lower():
                caps.add(cap)

    category = c.get("category", "")
    if category == "paper":
        caps.add("종이/지류 패키징")
    elif category == "plastic":
        caps.add("플라스틱 성형/가공")
    elif category == "metal":
        caps.add("금속 포장재 제조")
    elif category == "flexible":
        caps.add("연포장/필름 제조")
    elif category == "eco":
        caps.add("친환경 포장 솔루션")
    elif category == "glass":
        caps.add("유리 용기 제조")

    return list(caps)[:6] if caps else [f"{CATEGORY_KO.get(category, '포장')} 전문 제조"]


def build_target_industries(c):
    category = c.get("category", "")
    tags = c.get("tags") or []

    industries = set()
    for tag in tags:
        for ind in TAG_TARGET_INDUSTRIES.get(tag, []):
            industries.add(ind)

    if not industries:
        for ind in CATEGORY_TARGET_INDUSTRIES.get(category, []):
            industries.add(ind)

    return list(industries)[:4] if industries else ["포장재 필요 전 산업"]


def build_key_clients(c):
    category = c.get("category", "")
    tags = c.get("tags") or []

    clients = set()
    for tag in tags:
        for cl in TAG_KEY_CLIENTS.get(tag, []):
            clients.add(cl)

    if not clients:
        for cl in CATEGORY_KEY_CLIENTS.get(category, []):
            clients.add(cl)

    return list(clients)[:4] if clients else ["포장재 바이어"]


def build_description(c):
    name = c.get("name", "업체")
    old_desc = (c.get("description") or "").strip()
    products = c.get("products") or []
    certs = c.get("certifications") or []
    category = c.get("category", "")
    tags = c.get("tags") or []
    cat_ko = CATEGORY_KO.get(category, "포장")

    products_str = ", ".join(products[:4]) if products else f"{cat_ko} 제품"
    certs_str = ", ".join(certs[:3]) if certs else ""

    tag_descriptions = []
    for tag in tags:
        if tag in TAG_KO:
            tag_descriptions.append(TAG_KO[tag])

    tag_str = "/".join(tag_descriptions[:2]) if tag_descriptions else ""

    strength = ""
    if certs:
        strength = f" {certs_str} 인증을 보유하고 있어 품질과 안전성이 검증되었습니다."
    elif any(kw in old_desc for kw in ["전문", "선도", "대표"]):
        strength = f" 업계에서 검증된 전문성을 바탕으로 안정적인 공급이 가능합니다."
    else:
        strength = f" 다양한 고객의 포장 니즈에 맞춘 솔루션을 제공합니다."

    buyer_fit = ""
    if "food_grade" in tags:
        buyer_fit = "식품/음료 제조업체, 외식 프랜차이즈 등 식품 안전이 중요한 바이어에게 적합합니다."
    elif "cosmetic" in tags:
        buyer_fit = "화장품 브랜드, 뷰티 스타트업 등 프리미엄 패키징이 필요한 바이어에게 적합합니다."
    elif "industrial" in tags:
        buyer_fit = "제조업, 물류 기업 등 산업용 대량 포장이 필요한 바이어에게 적합합니다."
    elif "pharma" in tags:
        buyer_fit = "제약사, 의료기기 업체 등 엄격한 포장 규격이 필요한 바이어에게 적합합니다."
    elif "ecommerce" in tags:
        buyer_fit = "이커머스 셀러, D2C 브랜드 등 배송 포장이 필요한 바이어에게 적합합니다."
    elif "design_service" in tags:
        buyer_fit = "브랜드 리뉴얼, 신제품 런칭 등 맞춤 패키지 디자인이 필요한 바이어에게 적합합니다."
    elif category == "eco":
        buyer_fit = "ESG 경영, 친환경 브랜딩을 추구하는 기업에게 적합한 파트너입니다."
    elif category == "paper":
        buyer_fit = "택배/이커머스, 식품, 화장품 등 종이 기반 포장이 필요한 바이어에게 적합합니다."
    elif category == "metal":
        buyer_fit = "식음료, 화학, 산업재 등 금속 용기/포장이 필요한 바이어에게 적합합니다."
    else:
        buyer_fit = f"{cat_ko} 포장재가 필요한 다양한 산업의 바이어에게 적합합니다."

    sentence1 = f"{name}은(는) {products_str} 등을 전문으로 하는 {cat_ko} 분야 패키징 업체입니다."
    if tag_str:
        sentence1 = f"{name}은(는) {tag_str} 분야에 특화된 {cat_ko} 패키징 업체로, {products_str} 등을 취급합니다."

    return f"{sentence1}{strength} {buyer_fit}"


def enrich_company(c):
    return {
        "description": build_description(c),
        "service_capabilities": build_service_capabilities(c),
        "target_industries": build_target_industries(c),
        "key_clients": build_key_clients(c),
        "founded_year": extract_founded_year(c.get("description")),
        "min_order_quantity": infer_min_order_quantity(c),
    }


# ── Main ────────────────────────────────────────────────────────────────────────

def main():
    url, key = get_config()

    print("Fetching all companies...")
    companies = supabase_get(
        "/rest/v1/companies?select=id,name,description,products,certifications,category,tags,website&order=id.asc&limit=10000",
        url, key
    )
    print(f"Total: {len(companies)}")

    success = 0
    fail = 0

    for i, c in enumerate(companies):
        enrichment = enrich_company(c)

        safe = {}
        for field in ("description", "service_capabilities", "target_industries",
                      "key_clients", "founded_year", "min_order_quantity"):
            if enrichment.get(field) is not None:
                safe[field] = enrichment[field]

        if not safe:
            continue

        cid = c["id"]
        path = f"/rest/v1/companies?id=eq.{cid}"
        status, err = supabase_patch(path, safe, url, key)

        if status in (200, 201, 204):
            success += 1
        else:
            fail += 1
            print(f"  FAIL [{c['name'][:25]}]: {status} {err}")

        if (i + 1) % 50 == 0:
            print(f"  Progress: {i+1}/{len(companies)} (success={success}, fail={fail})")

    print(f"\n=== Done ===")
    print(f"  Success: {success}")
    print(f"  Failed:  {fail}")

    # Verify
    print("\nVerifying fill rates...")
    rows = supabase_get(
        "/rest/v1/companies?select=id,description,service_capabilities,target_industries,key_clients,founded_year,min_order_quantity&limit=10000",
        url, key
    )
    total = len(rows)
    for field in ("description", "service_capabilities", "target_industries",
                  "key_clients", "founded_year", "min_order_quantity"):
        filled = sum(1 for r in rows if r.get(field) not in (None, "", [], {}))
        pct = filled / total * 100 if total else 0
        print(f"  {field}: {filled}/{total} ({pct:.1f}%)")

    # Sample
    sample = [r for r in rows if r.get("service_capabilities")][:5]
    print(f"\n=== Sample ({len(sample)}) ===")
    for r in sample:
        print(f"\n  desc: {str(r.get('description',''))[:120]}")
        print(f"  caps: {r.get('service_capabilities')}")
        print(f"  inds: {r.get('target_industries')}")
        print(f"  clients: {r.get('key_clients')}")
        print(f"  year: {r.get('founded_year')} | moq: {r.get('min_order_quantity')}")


if __name__ == "__main__":
    main()
