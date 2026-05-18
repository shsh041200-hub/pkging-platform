#!/usr/bin/env python3
"""
PACAA-825 v4 — Web-search-first website enrichment via Naver webkr + Kakao Daum + Haiku LLM judge.

Architecture (board directive 965f8c68, 2026-05-18; updated per board comment 7e4ca4c4):
  1. Search primitives (dual web index):
     - Naver Web Search API /v1/search/webkr.json  (Naver index)
     - Kakao Daum Web Search  /v2/search/web        (Daum/Kakao index)
     - Query: company name ONLY. Address is a VERIFICATION SIGNAL, not a search axis.
     - Rationale: Local APIs (v2/v3) return map-DB entries, not official websites.
       Web search APIs index the actual web. Dual sources improve coverage.
  2. Candidate pool: webkr top-10 + kakao top-10 → deduplicate → blacklist → bigram → top-5
  3. Page meta fetch: first 8KB of each candidate URL for title/description/og tags
  4. LLM judge (Claude Haiku 4.5): verifies candidate using company name +
     address as a post-hoc verification fact (not a search filter).
  5. Accept threshold: LLM confidence >= 0.7

Deprecates: naver_website_enrich.py (v2, Naver Local), naver_website_enrich_v3.py (v3, multi-API)

Source: vendor_candidates WHERE data_source='naver_local' AND website IS NULL
Target: companies.website UPDATE (idempotent — skip rows where website IS NOT NULL)

Usage:
  python3 scripts/naver_website_enrich_v4.py               # dry-run (0 mutations)
  python3 scripts/naver_website_enrich_v4.py --limit 30    # first 30 only
  python3 scripts/naver_website_enrich_v4.py --limit 100
  python3 scripts/naver_website_enrich_v4.py --live        # apply DB updates
  python3 scripts/naver_website_enrich_v4.py --out runs/v4_dry_30.json --limit 30
  python3 scripts/naver_website_enrich_v4.py --no-llm      # skip LLM judge (heuristic only)
  python3 scripts/naver_website_enrich_v4.py --no-kakao    # skip Kakao Daum search
"""
import argparse
import json
import os
import re
import sys
import time
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

# ── Supabase config ────────────────────────────────────────────────────────────
SUPABASE_URL = os.environ.get(
    "SUPABASE_URL", "https://jnrciibwtutzymkoepfp.supabase.co"
)
SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_KEY", "")

# ── Naver Web Search (webkr) config ────────────────────────────────────────────
NAVER_WEBKR_URL = "https://openapi.naver.com/v1/search/webkr.json"
WEBKR_DISPLAY = 10  # fetch top-10 web results per query

# ── Kakao Daum Web Search config ───────────────────────────────────────────────
KAKAO_WEB_URL = "https://dapi.kakao.com/v2/search/web"
KAKAO_DISPLAY = 10  # fetch top-10 Daum web results per query

TOP_N_CANDIDATES = 5  # evaluate up to top-5 after filtering (combined pool)
RATE_DELAY = 0.25  # 4 req/sec — within free quota (25k/day)
PAGE_SIZE = 1000

# ── LLM config ─────────────────────────────────────────────────────────────────
HAIKU_MODEL = "claude-haiku-4-5-20251001"
LLM_CONFIDENCE_THRESHOLD = 0.7
PAGE_META_FETCH_BYTES = 8192  # first 8KB — enough for <head> meta tags
PAGE_META_TIMEOUT = 8  # seconds (overridable via --page-timeout)

# ── Token usage counter (accumulates across all LLM calls in one run) ──────────
_llm_token_counter: dict[str, int] = {"input": 0, "output": 0}

# ── Category fallback keywords ─────────────────────────────────────────────────
# Used ONLY as a last-resort query augment when company name alone yields 0 valid candidates.
# Address is never added to the search query.
CATEGORY_FALLBACKS = ["포장", "박스"]

# ── Host blacklist (~80 domains — v2 base + web-specific additions) ────────────
# Domains that are never official company websites (SNS, portals, aggregators, marketplaces).
HOST_BLACKLIST: set[str] = {
    # Social media
    "instagram.com", "www.instagram.com",
    "facebook.com", "www.facebook.com", "m.facebook.com",
    "twitter.com", "www.twitter.com", "x.com",
    "tiktok.com", "www.tiktok.com",
    "linkedin.com", "www.linkedin.com",
    "band.us",
    "youtube.com", "www.youtube.com", "youtu.be",
    "pinterest.com", "www.pinterest.com",
    # Naver properties
    "blog.naver.com", "m.blog.naver.com",
    "cafe.naver.com",
    "post.naver.com",
    "naver.com", "map.naver.com", "search.naver.com",
    "smartstore.naver.com",
    "shopping.naver.com",
    "place.naver.com",
    # Kakao properties
    "kakao.com", "pf.kakao.com", "talk.kakao.com",
    "map.kakao.com", "place.kakao.com",
    # Korean portals / aggregators
    "daum.net", "m.daum.net",
    "nate.com",
    "zum.com",
    # Marketplaces / e-commerce
    "coupang.com", "www.coupang.com",
    "gmarket.co.kr", "www.gmarket.co.kr",
    "auction.co.kr", "www.auction.co.kr",
    "11st.co.kr", "www.11st.co.kr",
    "interpark.com", "www.interpark.com",
    "lotteon.com", "www.lotteon.com",
    "ssg.com", "www.ssg.com",
    "wemakeprice.com", "www.wemakeprice.com",
    "tmon.co.kr", "www.tmon.co.kr",
    "ohou.se",
    # Business directories (we ARE the directory)
    "biz.naver.com",
    "kbid.or.kr",
    "comwel.or.kr",
    "jobkorea.co.kr", "www.jobkorea.co.kr",
    "saramin.co.kr", "www.saramin.co.kr",
    "wanted.co.kr", "www.wanted.co.kr",
    "albamon.com",
    "nicebizmap.co.kr",
    "bizno.net",
    "findcompany.co.kr",
    "thinkpool.com",
    "kisline.com",
    "cretop.com",
    # News / media
    "naver.com",  # duplicate but harmless
    "chosun.com", "donga.com", "joongang.co.kr", "hani.co.kr",
    "yonhapnews.co.kr", "yna.co.kr",
    "khan.co.kr",
    # Government / public bodies (not vendor sites)
    "korea.kr", "moel.go.kr", "smba.go.kr", "kbiz.or.kr",
    # Business registry / directory sites (these list companies, not the companies' own sites)
    "moneypin.biz",
    "114.co.kr", "www.114.co.kr",
    "nicebiz.or.kr",
    "kisvalue.com",
    "therich.io",
    "catchsecu.com",
    "korea724.info",
    # Job / HR sites
    "incruit.com", "www.incruit.com",
    "jobplanet.co.kr", "www.jobplanet.co.kr",
    # Our own domain — packlinx.com/companies/* pages are our directory, not vendor sites
    "packlinx.com", "www.packlinx.com", "keywords.packlinx.com",
    # News / media
    "kdpress.co.kr", "www.kdpress.co.kr",
    "jbnews.com", "www.jbnews.com",
    "kookje.co.kr",
    # Other
    "starbucks.co.kr", "www.starbucks.co.kr",
    "abcmart.co.kr", "www.abcmart.co.kr",
    "wikipedia.org", "www.wikipedia.org", "ko.wikipedia.org",
    "namuwiki.kr", "namu.wiki",
}


def _supabase_headers() -> dict:
    return {
        "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
        "apikey": SUPABASE_SERVICE_KEY,
        "Content-Type": "application/json",
    }


def fetch_candidates(limit: int | None = None) -> list[dict]:
    """Fetch naver_local vendor_candidates with missing website (all pages)."""
    candidates: list[dict] = []
    offset = 0
    while True:
        params = urllib.parse.urlencode({
            "source_attribution->>data_source": "eq.naver_local",
            "source_attribution->>website": "is.null",
            "select": "id,business_name,address_raw,source_attribution",
            "limit": PAGE_SIZE,
            "offset": offset,
        })
        req = urllib.request.Request(
            f"{SUPABASE_URL}/rest/v1/vendor_candidates?{params}",
            headers={**_supabase_headers(), "Prefer": "count=exact"},
        )
        with urllib.request.urlopen(req, timeout=30) as r:
            batch = json.loads(r.read().decode("utf-8"))
        if not batch:
            break
        candidates.extend(batch)
        if limit and len(candidates) >= limit:
            candidates = candidates[:limit]
            break
        if len(batch) < PAGE_SIZE:
            break
        offset += PAGE_SIZE
    return candidates


def naver_webkr_search(
    query: str, client_id: str, client_secret: str, display: int = WEBKR_DISPLAY
) -> list[dict]:
    """
    Call Naver Web Search API (webkr); return normalized items list.
    Each item: {title, link, description, source}.
    NOTE: address is never included in query — it is a verification signal only.
    """
    params = urllib.parse.urlencode({
        "query": query,
        "display": display,
        "start": 1,
        "sort": "sim",
    })
    req = urllib.request.Request(
        f"{NAVER_WEBKR_URL}?{params}",
        headers={
            "X-Naver-Client-Id": client_id,
            "X-Naver-Client-Secret": client_secret,
            "User-Agent": "PacklinxEnrichBot/4.0",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as r:
            data = json.loads(r.read().decode("utf-8"))
        return [
            {"title": i.get("title", ""), "link": i.get("link", ""),
             "description": i.get("description", ""), "source": "naver"}
            for i in data.get("items", [])
        ]
    except Exception as e:
        print(f"  [webkr] query='{query}': {e}", file=sys.stderr)
        return []


def kakao_web_search(
    query: str, kakao_key: str, size: int = KAKAO_DISPLAY
) -> list[dict]:
    """
    Call Kakao Daum Web Search API; return normalized items list.
    Each item: {title, link, description, source}.
    NOTE: address is never included in query — it is a verification signal only.
    """
    if not kakao_key:
        return []
    params = urllib.parse.urlencode({
        "query": query,
        "size": size,
        "page": 1,
        "sort": "accuracy",
    })
    req = urllib.request.Request(
        f"{KAKAO_WEB_URL}?{params}",
        headers={
            "Authorization": f"KakaoAK {kakao_key}",
            "User-Agent": "PacklinxEnrichBot/4.0",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as r:
            data = json.loads(r.read().decode("utf-8"))
        return [
            {"title": d.get("title", ""), "link": d.get("url", ""),
             "description": d.get("contents", ""), "source": "kakao"}
            for d in data.get("documents", [])
        ]
    except Exception as e:
        print(f"  [kakao] query='{query}': {e}", file=sys.stderr)
        return []


def strip_html(text: str) -> str:
    """Remove HTML tags (Naver wraps match terms in <b>)."""
    return re.sub(r"<[^>]+>", "", text).strip()


def bigram_overlap(a: str, b: str) -> float:
    """Character bigram overlap ratio: |A∩B| / |A|. Returns 0 if A empty."""
    a = re.sub(r"\s+", "", a)
    b = re.sub(r"\s+", "", b)
    if len(a) < 2:
        return 1.0 if a in b else 0.0
    a_grams = {a[i: i + 2] for i in range(len(a) - 1)}
    b_grams = {b[i: i + 2] for i in range(len(b) - 1)}
    if not a_grams:
        return 0.0
    return len(a_grams & b_grams) / len(a_grams)


def is_name_relevant(vendor_name: str, result_title: str) -> tuple[bool, float, str]:
    """
    Heuristic relevance guard (v2 logic, adapted for webkr).
    Returns (is_relevant, overlap_score, reason).
    """
    clean = strip_html(result_title)
    v = vendor_name.strip()
    t = clean.strip()

    if v in t:
        return True, 1.0, f"substring_match: '{v}' in '{t}'"
    if t in v and len(t) >= 2:
        return True, 1.0, f"substring_match: '{t}' in '{v}'"

    overlap = bigram_overlap(v, t)
    if overlap >= 0.40:  # slightly looser than v2 (0.50) — webkr titles vary more
        return True, overlap, f"bigram_overlap={overlap:.2f}: '{v}' ↔ '{t}'"

    return False, overlap, f"relevance_fail: bigram={overlap:.2f}, '{v}' ↔ '{t}'"


def sanitize_url(raw: str) -> str | None:
    """Sanitize and validate a URL. Returns None if invalid."""
    url = raw.strip()
    url = url.replace("&amp;", "&").replace("&lt;", "<").replace("&gt;", ">")
    if not url.startswith(("http://", "https://")):
        return None
    if re.search(r"<[^>]+>", url):
        return None
    if len(url) > 500:
        return None
    return url


def get_host(url: str) -> str:
    """Extract lowercase netloc from URL."""
    try:
        return urllib.parse.urlparse(url).netloc.lower()
    except Exception:
        return ""


def is_blacklisted(url: str) -> tuple[bool, str]:
    """Check if URL host is in HOST_BLACKLIST."""
    host = get_host(url)
    if host in HOST_BLACKLIST:
        return True, f"blacklist_host: {host}"
    for bl in HOST_BLACKLIST:
        if host.endswith("." + bl):
            return True, f"blacklist_subdomain: {host} matches {bl}"
    return False, ""


def fetch_page_meta(url: str) -> dict:
    """
    Fetch page title/description/og from HTML HEAD (first PAGE_META_FETCH_BYTES bytes).
    Returns dict with keys: title, description, og_title, og_description.
    Falls back to empty strings on any error.
    """
    result = {"title": "", "description": "", "og_title": "", "og_description": ""}
    try:
        req = urllib.request.Request(
            url,
            headers={
                "User-Agent": (
                    "Mozilla/5.0 (compatible; PacklinxBot/1.0; "
                    "+https://packlinx.com)"
                ),
                "Accept": "text/html",
                "Accept-Language": "ko,en;q=0.9",
            },
        )
        with urllib.request.urlopen(req, timeout=PAGE_META_TIMEOUT) as r:
            raw = r.read(PAGE_META_FETCH_BYTES).decode("utf-8", errors="replace")
    except Exception:
        return result

    def _meta(pattern: str) -> str:
        m = re.search(pattern, raw, re.IGNORECASE | re.DOTALL)
        return strip_html(m.group(1)) if m else ""

    result["title"] = _meta(r"<title[^>]*>(.*?)</title>")
    result["description"] = _meta(
        r'<meta\s+name=["\']description["\']\s+content=["\'](.*?)["\']'
    ) or _meta(r'<meta\s+content=["\'](.*?)["\']\s+name=["\']description["\']')
    result["og_title"] = _meta(
        r'<meta\s+property=["\']og:title["\']\s+content=["\'](.*?)["\']'
    )
    result["og_description"] = _meta(
        r'<meta\s+property=["\']og:description["\']\s+content=["\'](.*?)["\']'
    )
    return result


def llm_judge(
    vendor_name: str,
    vendor_address: str,
    url: str,
    page_meta: dict,
    webkr_description: str,
    anthropic_key: str,
) -> tuple[str, float, str]:
    """
    Claude Haiku 4.5 judge: is this page the official website for vendor_name?

    Verification signal: vendor_address is injected as a post-hoc fact to help
    the LLM confirm identity. It is NOT used as a search filter.

    Returns: (verdict "Y"/"N"/"SKIP", confidence 0.0-1.0, reasoning)
    """
    if not anthropic_key:
        return "SKIP", 0.0, "no_api_key"

    page_title = page_meta.get("og_title") or page_meta.get("title") or ""
    page_desc = (
        page_meta.get("og_description")
        or page_meta.get("description")
        or webkr_description
        or ""
    )

    prompt = (
        f"아래 정보를 보고 판단하세요.\n\n"
        f"검색 대상 회사: **{vendor_name}**\n"
        f"검증 단서 (주소): {vendor_address}\n\n"
        f"후보 페이지:\n"
        f"- URL: {url}\n"
        f"- 페이지 제목: {page_title[:200] or '(없음)'}\n"
        f"- 페이지 설명: {page_desc[:400] or '(없음)'}\n\n"
        f"이 페이지가 '{vendor_name}'의 공식 웹사이트입니까?\n"
        f"페이지에 위 주소 또는 사업자번호 등 회사 고유 정보가 등장하면 가중치를 높여주세요.\n\n"
        f"답변 형식 (한 줄, 이 형식만 사용):\n"
        f"VERDICT: Y|N  CONFIDENCE: 0.00  REASON: 한 줄 근거"
    )

    try:
        import anthropic

        client = anthropic.Anthropic(api_key=anthropic_key)
        msg = client.messages.create(
            model=HAIKU_MODEL,
            max_tokens=128,
            messages=[{"role": "user", "content": prompt}],
        )
        raw_text = msg.content[0].text.strip()
        _llm_token_counter["input"] += getattr(msg.usage, "input_tokens", 0)
        _llm_token_counter["output"] += getattr(msg.usage, "output_tokens", 0)
    except Exception as e:
        return "SKIP", 0.0, f"api_error: {e}"

    # Parse structured response
    v_match = re.search(r"VERDICT:\s*(Y|N)", raw_text, re.IGNORECASE)
    c_match = re.search(r"CONFIDENCE:\s*([0-9.]+)", raw_text, re.IGNORECASE)
    r_match = re.search(r"REASON:\s*(.+)$", raw_text, re.IGNORECASE | re.MULTILINE)

    verdict = (v_match.group(1).upper() if v_match else "N")
    try:
        confidence = float(c_match.group(1)) if c_match else 0.0
    except ValueError:
        confidence = 0.0
    reasoning = r_match.group(1).strip() if r_match else raw_text[:120]

    return verdict, confidence, reasoning


def patch_company_website(company_id: str, url: str) -> bool:
    """UPDATE companies.website for a single company (idempotent guard: is.null)."""
    body = json.dumps({"website": url}).encode("utf-8")
    params = urllib.parse.urlencode({"id": f"eq.{company_id}", "website": "is.null"})
    req = urllib.request.Request(
        f"{SUPABASE_URL}/rest/v1/companies?{params}",
        data=body,
        method="PATCH",
        headers={**_supabase_headers(), "Prefer": "return=minimal"},
    )
    try:
        with urllib.request.urlopen(req, timeout=15) as r:
            return r.status in (200, 204)
    except Exception as e:
        print(f"  [patch] company {company_id}: {e}", file=sys.stderr)
        return False


def search_with_fallbacks(
    name: str,
    client_id: str,
    client_secret: str,
    kakao_key: str = "",
    use_kakao: bool = True,
) -> tuple[list[dict], str]:
    """
    Search Naver webkr + Kakao Daum web with company name only.
    Merges results (dedup by URL), preserving order (Naver first, then Kakao-only).
    If no valid candidates, retry with category keyword augment.
    Address is NEVER in the query — it is a verification signal only.
    Returns (merged_items, query_used).
    """
    def _merge(naver: list[dict], kakao: list[dict]) -> list[dict]:
        seen: set[str] = set()
        merged: list[dict] = []
        for item in naver + kakao:
            url = item.get("link", "")
            if url and url not in seen:
                seen.add(url)
                merged.append(item)
        return merged

    # Primary: name only, both sources
    naver_items = naver_webkr_search(name, client_id, client_secret)
    time.sleep(RATE_DELAY)
    kakao_items = kakao_web_search(name, kakao_key) if use_kakao else []
    if kakao_items:
        time.sleep(RATE_DELAY)

    items = _merge(naver_items, kakao_items)
    if items:
        return items, name

    # Fallback: name + packaging keyword
    for kw in CATEGORY_FALLBACKS:
        fallback_q = f"{name} {kw}"
        naver_items = naver_webkr_search(fallback_q, client_id, client_secret)
        time.sleep(RATE_DELAY)
        kakao_items = kakao_web_search(fallback_q, kakao_key) if use_kakao else []
        if kakao_items:
            time.sleep(RATE_DELAY)
        items = _merge(naver_items, kakao_items)
        if items:
            return items, fallback_q

    return [], name


def enrich_one(
    vc: dict,
    client_id: str,
    client_secret: str,
    anthropic_key: str,
    kakao_key: str = "",
    use_llm: bool = True,
    use_kakao: bool = True,
) -> dict:
    """Process a single vendor candidate. Returns audit record dict."""
    name: str = (vc.get("business_name") or "").strip()
    addr: str = (vc.get("address_raw") or "").strip()
    attr: dict = vc.get("source_attribution") or {}
    company_id: str | None = attr.get("packlinx_id")

    record: dict = {
        "candidate_id": vc["id"],
        "company_id": company_id,
        "name": name,
        "address": addr,
        "found_url": None,
        "search_query": None,
        "source": "webkr",
        "webkr_title": None,
        "webkr_description": None,
        "page_title": None,
        "llm_verdict": None,
        "llm_confidence": None,
        "llm_reasoning": None,
        "status": None,
        "reject_reason": None,
        "candidates_tried": 0,
    }

    # 1. Dual web search — name only (address NOT in query per board directive)
    # Sources: Naver webkr + Kakao Daum, merged, deduped by URL
    items, query_used = search_with_fallbacks(
        name, client_id, client_secret, kakao_key=kakao_key, use_kakao=use_kakao
    )
    record["search_query"] = query_used

    if not items:
        record["status"] = "no_api_result"
        record["reject_reason"] = "webkr_returned_empty"
        return record

    # 2. Filter candidates: blacklist → heuristic → top-N
    valid_candidates: list[dict] = []
    for item in items:
        raw_link = item.get("link", "") or ""
        url = sanitize_url(raw_link)
        if not url:
            continue
        blacklisted, _ = is_blacklisted(url)
        if blacklisted:
            continue
        raw_title = item.get("title", "") or ""
        relevant, overlap, _ = is_name_relevant(name, raw_title)
        if not relevant:
            continue
        valid_candidates.append({
            "url": url,
            "title": strip_html(raw_title),
            "description": strip_html(item.get("description", "") or ""),
            "overlap": overlap,
        })
        if len(valid_candidates) >= TOP_N_CANDIDATES:
            break

    if not valid_candidates:
        record["status"] = "rejected_all_candidates"
        record["reject_reason"] = "all_candidates_filtered"
        return record

    record["candidates_tried"] = len(valid_candidates)
    record["webkr_title"] = valid_candidates[0]["title"]
    record["webkr_description"] = valid_candidates[0]["description"]

    # 3. LLM judge: evaluate candidates in order, accept first passing one
    best_url: str | None = None
    best_verdict = "N"
    best_confidence = 0.0
    best_reasoning = ""
    best_page_title = ""

    for cand in valid_candidates:
        url = cand["url"]
        # Fetch page meta (title/og/description from HTML head)
        page_meta = fetch_page_meta(url)
        page_title = page_meta.get("og_title") or page_meta.get("title") or cand["title"]

        if use_llm and anthropic_key:
            verdict, confidence, reasoning = llm_judge(
                name, addr, url, page_meta, cand["description"], anthropic_key
            )
        else:
            # Heuristic-only mode: accept top candidate if heuristic passes
            verdict = "Y"
            confidence = cand["overlap"]
            reasoning = f"heuristic_only: bigram={cand['overlap']:.2f}"

        if verdict == "Y" and confidence >= LLM_CONFIDENCE_THRESHOLD:
            best_url = url
            best_verdict = verdict
            best_confidence = confidence
            best_reasoning = reasoning
            best_page_title = page_title
            break
        # Keep best non-accepted for audit trail
        if confidence > best_confidence:
            best_confidence = confidence
            best_verdict = verdict
            best_reasoning = reasoning
            best_page_title = page_title
            best_url = url if verdict != "N" else best_url

    record["page_title"] = best_page_title
    record["llm_verdict"] = best_verdict
    record["llm_confidence"] = best_confidence
    record["llm_reasoning"] = best_reasoning

    if best_url and best_verdict == "Y" and best_confidence >= LLM_CONFIDENCE_THRESHOLD:
        record["found_url"] = best_url
        record["status"] = "dry_match"
        record["reject_reason"] = None
    else:
        record["status"] = "rejected_llm"
        record["reject_reason"] = (
            f"llm_confidence={best_confidence:.2f}<{LLM_CONFIDENCE_THRESHOLD} "
            f"verdict={best_verdict}"
        )

    return record


def main() -> int:
    parser = argparse.ArgumentParser(
        description="PACAA-825 v4 web-search-first website enrichment (webkr + Haiku)"
    )
    parser.add_argument(
        "--live", action="store_true",
        help="Execute DB mutations (default: dry-run, 0 mutations)"
    )
    parser.add_argument(
        "--limit", type=int, default=None,
        help="Process only first N vendors (sampling)"
    )
    parser.add_argument(
        "--out", default=None,
        help="Path to write JSON audit trail"
    )
    parser.add_argument(
        "--no-llm", action="store_true",
        help="Skip LLM judge — heuristic-only mode (for cost baseline)"
    )
    parser.add_argument(
        "--no-kakao", action="store_true",
        help="Skip Kakao Daum search — Naver webkr only"
    )
    parser.add_argument(
        "--exclude-names", nargs="*", default=[],
        metavar="NAME",
        help="Vendor names to skip (FP exclusion list)"
    )
    parser.add_argument(
        "--page-timeout", type=int, default=None,
        help="Override PAGE_META_TIMEOUT in seconds (default: 8)"
    )
    args = parser.parse_args()

    EXCLUDE_NAMES: set[str] = set(args.exclude_names or [])
    use_llm = not args.no_llm
    use_kakao = not args.no_kakao

    # Allow CLI override for page fetch timeout (useful for faster sampling runs)
    if args.page_timeout:
        global PAGE_META_TIMEOUT
        PAGE_META_TIMEOUT = args.page_timeout

    client_id = os.environ.get("NAVER_CLIENT_ID", "")
    client_secret = os.environ.get("NAVER_CLIENT_SECRET", "")
    # Try ENRICHMENT_ANTHROPIC_API_KEY first (adapter-injected name), fall back to ANTHROPIC_API_KEY
    anthropic_key = (
        os.environ.get("ENRICHMENT_ANTHROPIC_API_KEY")
        or os.environ.get("ANTHROPIC_API_KEY")
        or ""
    )
    kakao_key = os.environ.get("KAKAO_REST_API_KEY", "")

    if not client_id or not client_secret:
        print("ERROR: NAVER_CLIENT_ID / NAVER_CLIENT_SECRET not set", file=sys.stderr)
        sys.exit(1)

    if use_llm and not anthropic_key:
        print(
            "WARNING: ENRICHMENT_ANTHROPIC_API_KEY / ANTHROPIC_API_KEY not set — "
            "LLM judge disabled (heuristic only).",
            file=sys.stderr,
        )
        use_llm = False

    if use_kakao and not kakao_key:
        print("INFO: KAKAO_REST_API_KEY not set — Naver webkr only.", file=sys.stderr)
        use_kakao = False

    mode = "LIVE" if args.live else "DRY-RUN"
    sources = "webkr+kakao" if use_kakao else "webkr-only"
    llm_mode = f"LLM+heuristic [{sources}]" if use_llm else f"heuristic-only [{sources}]"
    print(f"=== PACAA-825 v4 website enrichment [{mode}] [{llm_mode}] ===")
    print(f"  NOTE: Address is a VERIFICATION signal, NOT a search axis.")
    if not args.live:
        print("  DRY-RUN: 0 mutations. Pass --live to commit.")

    # 1. Fetch candidates
    print("Fetching vendor_candidates from Supabase...", end=" ", flush=True)
    try:
        candidates = fetch_candidates(limit=args.limit)
    except Exception as e:
        print(f"\nERROR fetching candidates: {e}", file=sys.stderr)
        sys.exit(1)
    print(f"{len(candidates)} vendors loaded.")

    if not candidates:
        print("No candidates to process — exiting.")
        return 0

    # 2. Enrich each
    results: list[dict] = []
    counters: dict[str, int] = {
        "dry_match": 0,
        "no_api_result": 0,
        "rejected_all_candidates": 0,
        "rejected_llm": 0,
        "updated": 0,
        "update_failed": 0,
        "excluded_fp": 0,
        "llm_calls": 0,
    }

    for i, vc in enumerate(candidates, 1):
        name_key = (vc.get("business_name") or "").strip()
        if name_key in EXCLUDE_NAMES:
            rec = {
                "candidate_id": vc["id"],
                "company_id": (vc.get("source_attribution") or {}).get("packlinx_id"),
                "name": name_key,
                "address": vc.get("address_raw", ""),
                "status": "excluded_fp",
                "reject_reason": "manual_fp_exclusion",
            }
            results.append(rec)
            print(f"  [{i:3d}/{len(candidates)}] {name_key[:20]:<20s}  [excluded_fp]")
            counters["excluded_fp"] += 1
            continue

        rec = enrich_one(
            vc, client_id, client_secret, anthropic_key,
            kakao_key=kakao_key, use_llm=use_llm, use_kakao=use_kakao
        )
        counters[rec["status"]] = counters.get(rec["status"], 0) + 1
        if rec.get("llm_verdict") and rec["llm_verdict"] not in ("SKIP", None):
            counters["llm_calls"] += 1

        if args.live and rec["status"] == "dry_match":
            cid = rec.get("company_id")
            url = rec["found_url"]
            if cid and url:
                ok = patch_company_website(cid, url)
                rec["status"] = "updated" if ok else "update_failed"
                counters["updated" if ok else "update_failed"] = (
                    counters.get("updated" if ok else "update_failed", 0) + 1
                )
            else:
                rec["status"] = "skipped_no_company_id"

        results.append(rec)

        url_display = rec.get("found_url") or f"[{rec['status']}]"
        reason_display = (
            f" ← {rec['reject_reason'][:60]}" if rec.get("reject_reason") else ""
        )
        llm_display = ""
        if rec.get("llm_verdict") and rec["llm_verdict"] != "SKIP":
            llm_display = f" [LLM={rec['llm_verdict']} {rec.get('llm_confidence',0):.2f}]"
        print(
            f"  [{i:3d}/{len(candidates)}] {name_key[:20]:<20s}"
            f"  {str(url_display)[:50]:<50s}{llm_display}{reason_display}"
        )

    # 3. Summary
    matched = counters.get("dry_match", 0) + counters.get("updated", 0)
    total = len(candidates)
    v3_baseline = 16.7  # v3 Naver Local top-3 result (PACAA-786 30-sample)

    print(f"\n{'='*72}")
    print(f"=== 결과 요약 [{mode}] [{llm_mode}] ===")
    print(f"Total processed         : {total}")
    print(f"Matched (URL accepted)  : {matched}  ({matched/total*100:.1f}%)")
    print(f"  └ v3 baseline (16.7%) : {'BEAT' if matched/total*100 > v3_baseline else 'MISS'}")
    print(f"  └ rejected (all cand) : {counters.get('rejected_all_candidates', 0)}")
    print(f"  └ rejected (LLM)      : {counters.get('rejected_llm', 0)}")
    print(f"  └ no API result       : {counters.get('no_api_result', 0)}")
    if use_llm:
        print(f"LLM judge calls         : {counters.get('llm_calls', 0)}")
    if args.live:
        print(f"DB updated              : {counters.get('updated', 0)}")
        print(f"DB update failed        : {counters.get('update_failed', 0)}")
    print(f"{'='*72}")

    # 4. Audit trail
    if args.out:
        out_path = Path(args.out)
        out_path.parent.mkdir(parents=True, exist_ok=True)
        audit = {
            "run_at": datetime.now(timezone.utc).isoformat(),
            "pacaa": "PACAA-825",
            "script": "naver_website_enrich_v4.py",
            "mode": mode,
            "llm_mode": llm_mode,
            "model": HAIKU_MODEL if use_llm else "none",
            "total": total,
            "matched": matched,
            "match_rate_pct": round(matched / total * 100, 1) if total else 0,
            "v3_baseline_pct": v3_baseline,
            "counters": counters,
            "token_usage": {
                "input_tokens": _llm_token_counter["input"],
                "output_tokens": _llm_token_counter["output"],
                # Haiku 4.5 pricing: $0.80/1M input, $4.00/1M output
                "estimated_cost_usd": round(
                    _llm_token_counter["input"] / 1_000_000 * 0.80
                    + _llm_token_counter["output"] / 1_000_000 * 4.00,
                    5,
                ),
            },
            "config": {
                "top_n_candidates": TOP_N_CANDIDATES,
                "webkr_display": WEBKR_DISPLAY,
                "kakao_display": KAKAO_DISPLAY,
                "llm_threshold": LLM_CONFIDENCE_THRESHOLD,
                "llm_enabled": use_llm,
                "kakao_enabled": use_kakao,
                "address_in_query": False,  # board directive 965f8c68 — address = verification only
            },
            "records": results,
        }
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump(audit, f, ensure_ascii=False, indent=2)
        print(f"Audit trail → {out_path}")

    return 0


if __name__ == "__main__":
    sys.exit(main())
