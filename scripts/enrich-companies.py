#!/usr/bin/env python3
"""
Enrich company profiles using Claude API.
KOR-121: 458개 업체의 빈 프로필 필드를 일괄 강화.

Reads credentials from .env.local in the project root.
Requires ANTHROPIC_API_KEY environment variable (for --claude mode, default).

Modes:
  --claude           Use Claude API (default, requires ANTHROPIC_API_KEY)
  --from-json FILE   Apply pre-generated enrichment JSON file to Supabase
  --generate         Generate enrichment using built-in rules (no API key needed)
  --validate         Only run fill-rate validation report
"""
import argparse
import json
import os
import re
import sys
import time
import urllib.request
import urllib.error
from pathlib import Path

# ── Config ──────────────────────────────────────────────────────────────────────
SCRIPT_DIR = Path(__file__).parent
PROJECT_ROOT = SCRIPT_DIR.parent
ENV_FILE = PROJECT_ROOT / ".env.local"

BATCH_SIZE = 5
MAX_RETRIES = 3
CLAUDE_MODEL = "claude-sonnet-4-6"


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
    supabase_url = env.get("NEXT_PUBLIC_SUPABASE_URL", "")
    service_role_key = env.get("SUPABASE_SERVICE_ROLE_KEY", "")
    anthropic_key = os.environ.get("ANTHROPIC_API_KEY", "")

    if not supabase_url:
        sys.exit("ERROR: NEXT_PUBLIC_SUPABASE_URL not found in .env.local")
    if not service_role_key:
        sys.exit("ERROR: SUPABASE_SERVICE_ROLE_KEY not found in .env.local")
    if not anthropic_key:
        sys.exit("ERROR: ANTHROPIC_API_KEY environment variable not set")

    return supabase_url, service_role_key, anthropic_key


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
        "Prefer": "return=minimal",
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


import urllib.parse


def fetch_all_companies(supabase_url, service_role_key):
    """Fetch all companies with existing data for enrichment."""
    all_companies = []
    page_size = 1000
    offset = 0

    while True:
        path = (
            f"/rest/v1/companies"
            f"?select=id,name,description,products,certifications,category,tags,website"
            f"&limit={page_size}&offset={offset}"
            f"&order=id.asc"
        )
        status, content = supabase_request("GET", path, supabase_url, service_role_key)
        if status != 200:
            print(f"ERROR fetching companies (status {status}): {content[:300]}")
            break
        batch = json.loads(content)
        if not batch:
            break
        all_companies.extend(batch)
        if len(batch) < page_size:
            break
        offset += page_size

    return all_companies


def update_company(company_id, enrichment, supabase_url, service_role_key):
    """PATCH a single company with enrichment data."""
    path = f"/rest/v1/companies?id=eq.{company_id}"
    # Never touch address/phone/email - only update enrichment fields
    safe_update = {}
    allowed_fields = {
        "description", "service_capabilities", "target_industries",
        "key_clients", "founded_year", "min_order_quantity"
    }
    for field in allowed_fields:
        if field in enrichment and enrichment[field] is not None:
            safe_update[field] = enrichment[field]

    if not safe_update:
        return False, "no fields to update"

    status, content = supabase_request(
        "PATCH", path, supabase_url, service_role_key, data=safe_update
    )
    if status in (200, 201, 204):
        return True, "ok"
    return False, f"status={status} {content[:200]}"


# ── Claude API helpers ────────────────────────────────────────────────────────────
SYSTEM_PROMPT = """당신은 한국 B2B 패키징 산업 전문가입니다.
주어진 업체 데이터(이름, 소개글, 제품군, 인증, 카테고리, 태그, 웹사이트)를 분석하여
B2B 바이어가 업체를 평가하는 데 필요한 정보를 생성합니다.

반드시 지켜야 할 규칙:
1. 주소, 전화번호, 이메일은 절대 건드리지 않습니다.
2. 확실하지 않은 정보는 null을 반환합니다. 허위 정보 생성 금지.
3. key_clients는 실제 기업명이 아닌 산업 유형으로만 (예: "식품 대기업", "화장품 브랜드사").
4. 모든 텍스트 필드는 한국어로 작성합니다.
5. 응답은 반드시 유효한 JSON만 반환합니다 (설명이나 마크다운 없이)."""

USER_PROMPT_TEMPLATE = """다음 {count}개 업체에 대해 아래 필드를 생성해 주세요.
각 업체의 id를 key로 하는 JSON 객체로 응답하세요.

필드 설명:
- description: B2B 바이어 관점 2-3문장 (이 업체가 뭘 하는지, 뭘 잘하는지, 누가 이용하면 좋은지). 한국어.
- service_capabilities: text[] — 제품/인증 기반 서비스 역량 (3-6개, 한글 짧은 구문)
- target_industries: text[] — 주요 타겟 산업군 (2-4개, 한글)
- key_clients: text[] — 대표 납품처 유형 (실제 기업명 X, 산업 유형으로, 2-4개)
- founded_year: integer | null — 소개글에서 연도 추출 가능하면 숫자(예: 1995), 아니면 null
- min_order_quantity: string | null — 소량/맞춤/MOQ 언급 있으면 추론, 없으면 null

업체 데이터:
{companies_json}

응답 예시 형식:
{{
  "업체-uuid-1": {{
    "description": "...",
    "service_capabilities": ["역량1", "역량2"],
    "target_industries": ["산업1", "산업2"],
    "key_clients": ["유형1", "유형2"],
    "founded_year": 2000,
    "min_order_quantity": null
  }},
  "업체-uuid-2": {{ ... }}
}}"""


def call_claude(batch, anthropic_key, retry=0):
    """Call Claude API for a batch of companies and return enrichment dict."""
    companies_data = []
    for c in batch:
        companies_data.append({
            "id": c["id"],
            "name": c.get("name", ""),
            "description": c.get("description", "") or "",
            "products": c.get("products", []) or [],
            "certifications": c.get("certifications", []) or [],
            "category": c.get("category", "") or "",
            "tags": c.get("tags", []) or [],
            "website": c.get("website", "") or "",
        })

    user_content = USER_PROMPT_TEMPLATE.format(
        count=len(batch),
        companies_json=json.dumps(companies_data, ensure_ascii=False, indent=2)
    )

    payload = {
        "model": CLAUDE_MODEL,
        "max_tokens": 4096,
        "system": SYSTEM_PROMPT,
        "messages": [{"role": "user", "content": user_content}],
    }

    url = "https://api.anthropic.com/v1/messages"
    headers = {
        "x-api-key": anthropic_key,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
    }
    body = json.dumps(payload).encode()
    req = urllib.request.Request(url, data=body, headers=headers, method="POST")

    try:
        with urllib.request.urlopen(req, timeout=120) as resp:
            result = json.loads(resp.read().decode())
            text = result["content"][0]["text"].strip()
            # Strip markdown code fences if present
            text = re.sub(r"^```(?:json)?\s*", "", text)
            text = re.sub(r"\s*```$", "", text)
            return json.loads(text)
    except urllib.error.HTTPError as e:
        err_body = e.read().decode()
        if e.code == 529 or e.code == 429:
            # Rate limit or overload — back off
            wait = (2 ** retry) * 5
            print(f"  Rate limited (HTTP {e.code}), waiting {wait}s...")
            time.sleep(wait)
            if retry < MAX_RETRIES:
                return call_claude(batch, anthropic_key, retry + 1)
        raise RuntimeError(f"Claude API HTTP {e.code}: {err_body[:300]}")
    except (json.JSONDecodeError, KeyError, IndexError) as e:
        if retry < MAX_RETRIES:
            wait = (2 ** retry) * 3
            print(f"  Parse error ({e}), retrying in {wait}s...")
            time.sleep(wait)
            return call_claude(batch, anthropic_key, retry + 1)
        raise RuntimeError(f"Failed to parse Claude response after {MAX_RETRIES} retries: {e}")


# ── Validation query ──────────────────────────────────────────────────────────────
def check_fill_rates(supabase_url, service_role_key):
    """Check how many companies have each enrichment field filled."""
    fields = [
        "description", "service_capabilities", "target_industries",
        "key_clients", "founded_year", "min_order_quantity"
    ]

    path = "/rest/v1/companies?select=id,description,service_capabilities,target_industries,key_clients,founded_year,min_order_quantity&limit=10000"
    status, content = supabase_request("GET", path, supabase_url, service_role_key)
    if status != 200:
        print(f"ERROR checking fill rates: {status} {content[:200]}")
        return

    rows = json.loads(content)
    total = len(rows)
    print(f"\n=== Fill Rate Report ({total} companies) ===")
    for field in fields:
        filled = sum(1 for r in rows if r.get(field) not in (None, "", [], {}))
        pct = (filled / total * 100) if total else 0
        print(f"  {field}: {filled}/{total} ({pct:.1f}%)")

    return rows


def print_sample(rows, n=5):
    """Print sample companies for quality check."""
    sample = [r for r in rows if r.get("service_capabilities")][:n]
    print(f"\n=== Sample Quality Check ({len(sample)} companies) ===")
    for r in sample:
        print(f"\n[{r.get('id','?')[:8]}...]")
        print(f"  description:          {str(r.get('description',''))[:120]}")
        print(f"  service_capabilities: {r.get('service_capabilities')}")
        print(f"  target_industries:    {r.get('target_industries')}")
        print(f"  key_clients:          {r.get('key_clients')}")
        print(f"  founded_year:         {r.get('founded_year')}")
        print(f"  min_order_quantity:   {r.get('min_order_quantity')}")


# ── Rule-based enrichment (no API key required) ────────────────────────────────────
CATEGORY_CAPABILITIES = {
    "plastic": ["플라스틱 용기 제조", "사출성형 가공", "PET/PP 용기 생산", "맞춤형 용기 설계"],
    "paper": ["종이 패키징 제작", "골판지 박스 생산", "소량·대량 맞춤 제작", "인쇄 및 디자인 서비스"],
    "food_grade": ["식품 등급 포장재 생산", "위생 포장 솔루션", "식품 안전 규격 준수"],
    "eco": ["친환경 포장재 제조", "생분해 소재 적용", "탄소 절감 패키징"],
    "glass": ["유리 용기 제조", "식품·음료용 유리병 생산", "리사이클 가능 포장"],
    "flexible": ["연포장 필름 제조", "비닐·파우치 생산", "식품·산업용 필름 공급"],
    "metal": ["금속 캔 제조", "알루미늄 용기 생산", "스틸·브리키 패키징"],
    "saneobyong": ["산업용 포장재 공급", "완충재·에어캡 생산", "물류 포장 솔루션"],
    "jiryu": ["일반 포장재 공급", "다품종 포장 솔루션", "택배·유통 포장"],
}
CATEGORY_INDUSTRIES = {
    "plastic": ["화장품 및 뷰티", "식품·음료", "의약품·헬스케어"],
    "paper": ["식품·음료", "이커머스·물류", "소비재 브랜드"],
    "food_grade": ["식품·음료", "외식·카페", "간편식·HMR"],
    "eco": ["친환경 브랜드", "식품·음료", "유통·리테일"],
    "glass": ["음료·주류", "식품·소스류", "화장품"],
    "flexible": ["식품·가공식품", "의약품", "산업재"],
    "metal": ["음료·주류", "식품 제조", "산업재"],
    "saneobyong": ["제조업·산업재", "전자·반도체", "물류·유통"],
    "jiryu": ["이커머스·물류", "소비재 브랜드", "유통·도소매"],
}
CATEGORY_CLIENTS = {
    "plastic": ["화장품 브랜드사", "식품 제조기업", "생활용품 기업"],
    "paper": ["식품 대기업", "이커머스 플랫폼", "소비재 브랜드사"],
    "food_grade": ["외식 프랜차이즈", "식품 대기업", "카페 체인"],
    "eco": ["친환경 소비재 브랜드", "식품 대기업", "유통 대형마트"],
    "glass": ["음료·주류 기업", "소스·조미료 제조사", "화장품 브랜드"],
    "flexible": ["식품 가공업체", "의약품 제조사", "산업재 기업"],
    "metal": ["음료 제조사", "수산·통조림 업체", "화학·산업재 기업"],
    "saneobyong": ["제조·수출 기업", "전자 부품 업체", "글로벌 물류사"],
    "jiryu": ["이커머스 셀러", "소비재 유통사", "중소 브랜드사"],
}
TAG_CAPABILITY_EXTRAS = {
    "food_grade": ["HACCP 인증 포장", "식품 위생 관리"],
    "industrial": ["산업용 대량 납품", "수출 포장 가능"],
    "eco": ["친환경 인증 소재", "생분해 옵션"],
}
TAG_INDUSTRY_EXTRAS = {
    "food_grade": ["외식·카페"],
    "industrial": ["제조업·산업재"],
}


def _extract_founded_year(text):
    if not text:
        return None
    for p in [
        r'(?:19|20)\d{2}년\s*(?:설립|창립|창업|부터|에\s*설립)',
        r'(?:설립|창립|창업|since)\s*(?:19|20)\d{2}',
        r'(?:19|20)\d{2}년\s*(?:에|부터)\s*(?:시작|운영|서비스)',
    ]:
        m = re.search(p, text)
        if m:
            ym = re.search(r'((?:19|20)\d{2})', m.group())
            if ym:
                return int(ym.group(1))
    return None


def _extract_moq(text, products):
    combined = (text or "") + " " + " ".join(products or [])
    m = re.search(r'(\d+(?:,\d+)?)\s*개\s*(?:부터|이상|~)', combined)
    if m:
        return f"{m.group(1).replace(',','')}개 이상"
    if "소량" in combined:
        return "소량 주문 가능"
    if "맞춤 제작" in combined or "맞춤제작" in combined:
        return "맞춤 주문 가능"
    if "대량" in combined:
        return "대량 주문 전문"
    return None


def _rule_based_enrichment(company):
    cat = company.get("category", "jiryu") or "jiryu"
    products = company.get("products", []) or []
    tags = company.get("tags", []) or []
    desc = company.get("description", "") or ""

    caps = list(CATEGORY_CAPABILITIES.get(cat, CATEGORY_CAPABILITIES["jiryu"]))
    for tag in tags:
        for e in TAG_CAPABILITY_EXTRAS.get(tag, []):
            if e not in caps:
                caps.append(e)
    for p in products[:2]:
        if len(p) > 4 and p not in caps:
            caps.append(p)
    caps = caps[:6]

    industries = list(CATEGORY_INDUSTRIES.get(cat, CATEGORY_INDUSTRIES["jiryu"]))
    for tag in tags:
        for e in TAG_INDUSTRY_EXTRAS.get(tag, []):
            if e not in industries:
                industries.append(e)
    industries = industries[:4]

    clients = list(CATEGORY_CLIENTS.get(cat, CATEGORY_CLIENTS["jiryu"]))[:4]

    result = {
        "service_capabilities": caps,
        "target_industries": industries,
        "key_clients": clients,
    }
    yr = _extract_founded_year(desc)
    if yr:
        result["founded_year"] = yr
    moq = _extract_moq(desc, products)
    if moq:
        result["min_order_quantity"] = moq
    return result


def apply_enrichments(enrichments, companies, supabase_url, service_role_key):
    success_count = 0
    fail_count = 0
    skip_count = 0
    failed_ids = []

    for company in companies:
        cid = company["id"]
        enrichment = enrichments.get(cid)
        if not enrichment:
            skip_count += 1
            continue
        ok, msg = update_company(cid, enrichment, supabase_url, service_role_key)
        if ok:
            success_count += 1
        else:
            print(f"  FAIL update {company.get('name','?')[:30]}: {msg}")
            fail_count += 1
            failed_ids.append(cid)

    return success_count, fail_count, skip_count, failed_ids


# ── Main ──────────────────────────────────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser(description="Enrich company profiles")
    mode_group = parser.add_mutually_exclusive_group()
    mode_group.add_argument("--claude", action="store_true", default=False,
                            help="Use Claude API (requires ANTHROPIC_API_KEY)")
    mode_group.add_argument("--from-json", metavar="FILE",
                            help="Apply pre-generated enrichment from JSON file")
    mode_group.add_argument("--generate", action="store_true",
                            help="Generate enrichment using built-in rules (no API key)")
    mode_group.add_argument("--validate", action="store_true",
                            help="Only run fill-rate validation report")
    args = parser.parse_args()

    env = load_env()
    supabase_url = env.get("NEXT_PUBLIC_SUPABASE_URL", "")
    service_role_key = env.get("SUPABASE_SERVICE_ROLE_KEY", "")
    if not supabase_url or not service_role_key:
        sys.exit("ERROR: Missing Supabase credentials in .env.local")

    if args.validate:
        rows = check_fill_rates(supabase_url, service_role_key)
        if rows:
            print_sample(rows)
        return

    print("Fetching all companies from Supabase...")
    companies = fetch_all_companies(supabase_url, service_role_key)
    print(f"Total companies: {len(companies)}")

    to_enrich = [
        c for c in companies
        if not c.get("service_capabilities") or not c.get("target_industries")
    ]
    print(f"Companies needing enrichment: {len(to_enrich)}")

    if not to_enrich:
        print("All companies already enriched!")
        check_fill_rates(supabase_url, service_role_key)
        return

    if args.from_json:
        # Apply pre-generated enrichment from a JSON file
        json_path = Path(args.from_json)
        if not json_path.exists():
            sys.exit(f"ERROR: File not found: {json_path}")
        print(f"Loading enrichment data from {json_path}...")
        with open(json_path) as f:
            enrichments = json.load(f)
        print(f"Applying enrichment to {len(to_enrich)} companies...")
        success, fail, skip, failed_ids = apply_enrichments(
            enrichments, to_enrich, supabase_url, service_role_key
        )

    elif args.generate:
        # Generate and apply using built-in rules
        print("Generating enrichment using built-in rules...")
        enrichments = {c["id"]: _rule_based_enrichment(c) for c in to_enrich}
        print(f"Applying enrichment to {len(to_enrich)} companies...")
        success, fail, skip, failed_ids = apply_enrichments(
            enrichments, to_enrich, supabase_url, service_role_key
        )

    else:
        # Default: Claude API mode
        anthropic_key = os.environ.get("ANTHROPIC_API_KEY", env.get("ANTHROPIC_API_KEY", ""))
        if not anthropic_key:
            sys.exit("ERROR: ANTHROPIC_API_KEY not set. Use --generate for rule-based enrichment.")

        success_count = 0
        fail_count = 0
        skip_count = 0
        failed_ids = []
        total_batches = (len(to_enrich) + BATCH_SIZE - 1) // BATCH_SIZE
        print(f"Processing {total_batches} batches of {BATCH_SIZE} via Claude API...\n")

        for batch_idx in range(0, len(to_enrich), BATCH_SIZE):
            batch = to_enrich[batch_idx: batch_idx + BATCH_SIZE]
            batch_num = batch_idx // BATCH_SIZE + 1
            print(f"Batch {batch_num}/{total_batches}: {[c['name'][:20] for c in batch]}")
            try:
                enrichments = call_claude(batch, anthropic_key)
            except RuntimeError as e:
                print(f"  ERROR calling Claude: {e}")
                for c in batch:
                    fail_count += 1
                    failed_ids.append(c["id"])
                continue
            for company in batch:
                cid = company["id"]
                enrichment = enrichments.get(cid)
                if not enrichment:
                    print(f"  WARN: no enrichment for {company['name'][:30]}")
                    skip_count += 1
                    continue
                ok, msg = update_company(cid, enrichment, supabase_url, service_role_key)
                if ok:
                    success_count += 1
                else:
                    print(f"  FAIL update {company['name'][:30]}: {msg}")
                    fail_count += 1
                    failed_ids.append(cid)
            if batch_idx + BATCH_SIZE < len(to_enrich):
                time.sleep(1)

        success, fail, skip = success_count, fail_count, skip_count

    print(f"\n=== Enrichment Complete ===")
    print(f"  Success: {success}")
    print(f"  Failed:  {fail}")
    print(f"  Skipped: {skip}")
    if failed_ids:
        print(f"  Failed IDs: {failed_ids[:10]}{'...' if len(failed_ids) > 10 else ''}")

    rows = check_fill_rates(supabase_url, service_role_key)
    if rows:
        print_sample(rows)


if __name__ == "__main__":
    main()
