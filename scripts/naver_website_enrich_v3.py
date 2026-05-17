#!/usr/bin/env python3
"""
PACAA-786 v3 — Multi-API enrichment + LLM judge

Changes from v2:
  W1 fix: top-3 Naver results (was items[0] only)
  NEW: Kakao Local Search API as second source
  NEW: LLM judge (Claude Haiku) — page-level meta verification
  W2 fix: dynamic bigram threshold (≤2 syllables → 1.0, ≥4 → 0.5)
  W4 fix: extended host blacklist (~80 domains)

Source: vendor_candidates WHERE data_source='naver_local' AND website IS NULL
Target: companies.website UPDATE (idempotent — skip rows where website IS NOT NULL)

Usage:
  python3 scripts/naver_website_enrich_v3.py                     # dry-run
  python3 scripts/naver_website_enrich_v3.py --limit 30
  python3 scripts/naver_website_enrich_v3.py --out runs/v3_YYYYMMDD.json
  python3 scripts/naver_website_enrich_v3.py --live --out runs/v3_live.json

Env vars required:
  NAVER_CLIENT_ID, NAVER_CLIENT_SECRET   — Naver Open API credentials
Optional:
  KAKAO_REST_API_KEY                     — Kakao Developers REST key
  ANTHROPIC_API_KEY                      — Claude Haiku judge (skip if absent)
  SUPABASE_URL, SUPABASE_SERVICE_KEY     — DB connection (falls back to hardcoded)
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

# ── Supabase config ──────────────────────────────────────────────────────────
SUPABASE_URL = os.environ.get(
    "SUPABASE_URL", "https://jnrciibwtutzymkoepfp.supabase.co"
)
SUPABASE_SERVICE_KEY = os.environ.get(
    "SUPABASE_SERVICE_KEY",
    (
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6"
        "ImpucmNpaWJ3dHV0enlta29lcGZwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MT"
        "c3NjU2NTI2OCwiZXhwIjoyMDkyMTQxMjY4fQ.uVBSdXbxzUbhNKTOaYaiOk2r2etCFnNR"
        "8tQ0z1mhJxg"
    ),
)

NAVER_LOCAL_URL = "https://openapi.naver.com/v1/search/local.json"
KAKAO_LOCAL_URL = "https://dapi.kakao.com/v2/local/search/keyword.json"
ANTHROPIC_MESSAGES_URL = "https://api.anthropic.com/v1/messages"

RATE_DELAY = 0.25   # Naver: 4 req/s (25k/day quota)
KAKAO_DELAY = 0.25  # Kakao: same conservative rate
LLM_DELAY = 0.10    # Haiku is fast
PAGE_SIZE = 1000
TOP_N = 3           # W1 fix: consider top-3 results per API

# ── Extended host blacklist (W4 fix: ~80 domains) ────────────────────────────
HOST_BLACKLIST: set[str] = {
    # SNS
    "instagram.com", "www.instagram.com",
    "facebook.com", "www.facebook.com", "m.facebook.com",
    "twitter.com", "www.twitter.com", "x.com",
    "youtube.com", "www.youtube.com", "youtu.be",
    "tiktok.com", "www.tiktok.com",
    "linkedin.com", "www.linkedin.com",
    "band.us",
    # Naver services
    "blog.naver.com", "m.blog.naver.com",
    "cafe.naver.com",
    "post.naver.com",
    "smartstore.naver.com",
    "storefarm.naver.com",
    "naver.com",
    "map.naver.com",
    "place.naver.com",
    "search.naver.com",
    # Kakao / Daum
    "kakao.com", "pf.kakao.com",
    "daum.net",
    "nate.com",
    # E-commerce / marketplace
    "coupang.com", "www.coupang.com",
    "gmarket.co.kr",
    "auction.co.kr",
    "11st.co.kr",
    "interpark.com",
    "wemakeprice.com",
    "tmon.co.kr",
    "iherb.com",
    "danawa.com",
    "38.co.kr",
    "daangn.com",
    # Job sites
    "jobkorea.co.kr",
    "saramin.co.kr",
    "incruit.com",
    "jobplanet.co.kr",
    "jobploy.kr",
    "wanted.co.kr",
    "jumpit.co.kr",
    "albamon.com",
    "work.go.kr",
    "career.co.kr",
    "hireplus.co.kr",
    # News / media
    "hankyung.com",
    "chosun.com",
    "joins.com",
    "joongang.co.kr",
    "yna.co.kr",
    "newsis.com",
    "news1.kr",
    "mt.co.kr",
    "etnews.com",
    "zdnet.co.kr",
    "kgindustrynews.com",
    "ebn.co.kr",
    "fnnews.com",
    "heraldcorp.com",
    "moneys.co.kr",
    # Business directories / info sites
    "bizno.net",
    "nicebizmap.co.kr",
    "123company.co.kr",
    "114.co.kr",
    "watchout.co.kr",
    "yellowpages.co.kr",
    "cominfo.co.kr",
    "dnb.co.kr",
    "findcompany.kr",
    "placeview.co.kr",
    "myfactory.co.kr",
    "hometax.go.kr",
    "nts.go.kr",
    "bizok.incheon.go.kr",
    "bizok.or.kr",
    # Government / association
    "kotra.or.kr",
    "kita.net",
    "smba.go.kr",
    "semas.or.kr",
    "koreanpackaging.or.kr",
    "kpma.or.kr",
    "kcipa.or.kr",
    "bcca.or.kr",
    "kfpa.or.kr",
    "kopa.or.kr",
    "gimpocci.net",
    # Report / research / academic
    "reportworld.co.kr",
    "dbpia.co.kr",
    "riss.kr",
    "happycampus.com",
    "kci.go.kr",
    # Forum / community
    "clien.net",
    "ppomppu.co.kr",
    "ruliweb.com",
    "dcinside.com",
    # Brand names unlikely to be packaging vendors
    "starbucks.co.kr",
    "abcmart.co.kr",
    # Misc known FP hosts
    "weseb.com",
    "google.com",
    "google.co.kr",
}

# URL path patterns indicating directory listing (not company's own site)
DIR_PATH_PATTERN = re.compile(
    r"/(company|biz|place|firm|vendor|member|company_info|shop/[0-9]|brand/[0-9]|profile/[0-9])"
    r"|/[0-9]{5,}$"
)


# ── Supabase helpers ──────────────────────────────────────────────────────────

def _sb_headers() -> dict:
    return {
        "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
        "apikey": SUPABASE_SERVICE_KEY,
        "Content-Type": "application/json",
    }


def fetch_candidates(limit: int | None = None) -> list[dict]:
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
            headers={**_sb_headers(), "Prefer": "count=exact"},
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


def patch_company_website(company_id: str, url: str) -> bool:
    body = json.dumps({"website": url}).encode("utf-8")
    params = urllib.parse.urlencode({"id": f"eq.{company_id}", "website": "is.null"})
    req = urllib.request.Request(
        f"{SUPABASE_URL}/rest/v1/companies?{params}",
        data=body,
        method="PATCH",
        headers={**_sb_headers(), "Prefer": "return=minimal"},
    )
    try:
        with urllib.request.urlopen(req, timeout=15) as r:
            return r.status in (200, 204)
    except Exception as e:
        print(f"  [patch] company {company_id}: {e}", file=sys.stderr)
        return False


# ── Naver Local API ───────────────────────────────────────────────────────────

def naver_local_search(query: str, client_id: str, client_secret: str) -> list[dict]:
    """Call Naver Local Search API; return up to TOP_N items."""
    params = urllib.parse.urlencode({
        "query": query,
        "display": TOP_N,
        "start": 1,
    })
    req = urllib.request.Request(
        f"{NAVER_LOCAL_URL}?{params}",
        headers={
            "X-Naver-Client-Id": client_id,
            "X-Naver-Client-Secret": client_secret,
            "User-Agent": "PacklinxEnrichBot/3.0",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as r:
            data = json.loads(r.read().decode("utf-8"))
        return data.get("items", [])[:TOP_N]
    except Exception as e:
        print(f"  [naver] query='{query}': {e}", file=sys.stderr)
        return []


# ── Kakao Local API ───────────────────────────────────────────────────────────

def kakao_local_search(query: str, rest_key: str) -> list[dict]:
    """Call Kakao Local Keyword Search API; return up to TOP_N documents."""
    params = urllib.parse.urlencode({"query": query, "size": TOP_N})
    req = urllib.request.Request(
        f"{KAKAO_LOCAL_URL}?{params}",
        headers={
            "Authorization": f"KakaoAK {rest_key}",
            "User-Agent": "PacklinxEnrichBot/3.0",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as r:
            data = json.loads(r.read().decode("utf-8"))
        return data.get("documents", [])[:TOP_N]
    except Exception as e:
        print(f"  [kakao] query='{query}': {e}", file=sys.stderr)
        return []


def kakao_extract_website(place_url: str) -> str | None:
    """
    Fetch Kakao place detail page and extract the company's own homepage URL.
    Kakao place pages embed homepage URLs as 'homepageUrl' in a JSON block.
    """
    try:
        req = urllib.request.Request(
            place_url,
            headers={"User-Agent": "Mozilla/5.0 (compatible; PacklinxEnrichBot/3.0)"},
        )
        with urllib.request.urlopen(req, timeout=10) as r:
            raw = r.read(65536)
        html = raw.decode("utf-8", errors="replace")
        # JSON blob: {"homepageUrl":"https://..."}
        m = re.search(r'"homepageUrl"\s*:\s*"([^"]+)"', html)
        if m:
            return m.group(1)
        # Fallback: <a ... class="..link_homepage.."> or data-url
        m2 = re.search(
            r'class="[^"]*link_homepage[^"]*"[^>]+href="([^"]+)"', html
        )
        if m2:
            return m2.group(1)
        return None
    except Exception:
        return None


# ── Text / URL helpers ────────────────────────────────────────────────────────

def strip_html(text: str) -> str:
    return re.sub(r"<[^>]+>", "", text).strip()


def count_korean_syllables(text: str) -> int:
    """Count hangul syllable blocks (U+AC00..U+D7A3)."""
    return sum(1 for c in text if "가" <= c <= "힣")


def dynamic_bigram_threshold(vendor_name: str) -> float:
    """
    W2 fix: dynamic threshold based on syllable count.
    ≤2 syllables → 1.0 (strict exact), 3 syllables → 0.75, ≥4 → 0.5
    """
    s = count_korean_syllables(vendor_name.strip())
    if s <= 2:
        return 1.0
    if s >= 4:
        return 0.5
    return 0.75  # 3 syllables


def bigram_overlap(a: str, b: str) -> float:
    a = re.sub(r"\s+", "", a)
    b = re.sub(r"\s+", "", b)
    if len(a) < 2:
        return 1.0 if a in b else 0.0
    a_grams = {a[i: i + 2] for i in range(len(a) - 1)}
    b_grams = {b[i: i + 2] for i in range(len(b) - 1)}
    if not a_grams:
        return 0.0
    return len(a_grams & b_grams) / len(a_grams)


def is_name_relevant(vendor_name: str, result_title: str) -> tuple[bool, str]:
    """
    W2 fix: relevance guard with dynamic threshold.
    Returns (is_relevant, reason_string).
    """
    clean = strip_html(result_title)
    v = vendor_name.strip()
    t = clean.strip()

    if v in t:
        return True, f"substring_match: '{v}' in '{t}'"
    if t in v and len(t) >= 2:
        return True, f"substring_match: '{t}' in '{v}'"

    overlap = bigram_overlap(v, t)
    threshold = dynamic_bigram_threshold(v)
    if overlap >= threshold:
        return True, f"bigram_overlap={overlap:.2f}≥{threshold}: '{v}' ↔ '{t}'"

    return False, f"relevance_fail: bigram={overlap:.2f}<{threshold}, '{v}' ↔ '{t}'"


def sanitize_url(raw: str) -> str | None:
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
    try:
        return urllib.parse.urlparse(url).netloc.lower()
    except Exception:
        return ""


def is_blacklisted(url: str) -> tuple[bool, str]:
    host = get_host(url)
    if host in HOST_BLACKLIST:
        return True, f"blacklist_host: {host}"
    for bl in HOST_BLACKLIST:
        if host.endswith("." + bl):
            return True, f"blacklist_subdomain: {host} matches {bl}"
    # W4: directory path patterns
    parsed_path = urllib.parse.urlparse(url).path
    if DIR_PATH_PATTERN.search(parsed_path):
        return True, f"dir_path_pattern: {parsed_path[:60]}"
    return False, ""


def address_fragment(address_raw: str | None) -> str:
    if not address_raw:
        return ""
    parts = address_raw.split()
    return " ".join(parts[:2]) if len(parts) >= 2 else (parts[0] if parts else "")


# ── Page meta fetch ───────────────────────────────────────────────────────────

def fetch_page_meta(url: str, timeout: int = 8) -> dict:
    """
    Fetch URL and extract <title>, meta description, og:site_name.
    Returns dict with keys: title, description, og_site_name, fetch_error.
    """
    meta = {"title": "", "description": "", "og_site_name": "", "fetch_error": ""}
    try:
        req = urllib.request.Request(
            url,
            headers={
                "User-Agent": "Mozilla/5.0 (compatible; PacklinxEnrichBot/3.0)",
                "Accept-Language": "ko-KR,ko;q=0.9",
            },
        )
        with urllib.request.urlopen(req, timeout=timeout) as r:
            raw = r.read(65536)
    except Exception as e:
        meta["fetch_error"] = f"{type(e).__name__}: {str(e)[:80]}"
        return meta

    for enc in ("utf-8", "euc-kr", "cp949"):
        try:
            html = raw.decode(enc)
            break
        except Exception:
            continue
    else:
        html = raw.decode("utf-8", errors="replace")

    # <title>
    m = re.search(r"<title[^>]*>(.*?)</title>", html, re.DOTALL | re.IGNORECASE)
    if m:
        meta["title"] = re.sub(r"\s+", " ", strip_html(m.group(1))).strip()[:120]

    # og:title fallback
    if not meta["title"]:
        m2 = re.search(
            r'<meta[^>]+property=["\']og:title["\'][^>]+content=["\']([^"\']+)["\']',
            html, re.IGNORECASE,
        )
        if m2:
            meta["title"] = m2.group(1).strip()[:120]

    # meta description
    m3 = re.search(
        r'<meta[^>]+name=["\']description["\'][^>]+content=["\']([^"\']+)["\']',
        html, re.IGNORECASE,
    )
    if m3:
        meta["description"] = m3.group(1).strip()[:200]

    # og:site_name
    m4 = re.search(
        r'<meta[^>]+property=["\']og:site_name["\'][^>]+content=["\']([^"\']+)["\']',
        html, re.IGNORECASE,
    )
    if m4:
        meta["og_site_name"] = m4.group(1).strip()[:80]

    return meta


# ── LLM judge (Claude Haiku) ─────────────────────────────────────────────────

def llm_judge_website(
    name: str, addr: str, url: str, meta: dict, api_key: str
) -> dict:
    """
    Ask Claude Haiku to judge if this page is the official website of the company.
    Returns {"verdict": "Y"|"N"|"SKIP", "confidence": float, "reasoning": str}.
    """
    if not api_key:
        return {"verdict": "SKIP", "confidence": 0.0, "reasoning": "no_api_key"}

    prompt = (
        f"이 페이지가 회사 '{name}' (주소: {addr or '미상'}) 의 공식 웹사이트인가?\n\n"
        f"URL: {url}\n"
        f"페이지 메타 정보:\n"
        f"- title: {meta.get('title') or 'N/A'}\n"
        f"- description: {meta.get('description') or 'N/A'}\n"
        f"- og:site_name: {meta.get('og_site_name') or 'N/A'}\n\n"
        "한 줄로만 답해줘: Y 또는 N, 공백, 신뢰도 0.0~1.0 (예: Y 0.9 또는 N 0.1)"
    )

    payload = json.dumps({
        "model": "claude-haiku-4-5-20251001",
        "max_tokens": 50,
        "messages": [{"role": "user", "content": prompt}],
    }).encode("utf-8")

    req = urllib.request.Request(
        ANTHROPIC_MESSAGES_URL,
        data=payload,
        headers={
            "x-api-key": api_key,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            resp = json.loads(r.read().decode("utf-8"))
        text = resp["content"][0]["text"].strip()
        m = re.match(r"([YN])\s+([0-9]*\.?[0-9]+)", text, re.IGNORECASE)
        if m:
            verdict = m.group(1).upper()
            confidence = min(1.0, float(m.group(2)))
            return {"verdict": verdict, "confidence": confidence, "reasoning": text}
        return {"verdict": "SKIP", "confidence": 0.0, "reasoning": f"parse_fail: {text[:80]}"}
    except Exception as e:
        return {"verdict": "SKIP", "confidence": 0.0, "reasoning": f"api_error: {str(e)[:80]}"}


# ── Core enrichment logic ─────────────────────────────────────────────────────

def _build_candidate_list(
    name: str,
    addr: str,
    naver_items: list[dict],
    kakao_docs: list[dict],
) -> list[dict]:
    """
    Combine Naver + Kakao results into a ranked candidate list.
    Each entry: {url, source, naver_title, naver_address, rank}
    """
    candidates = []

    # Naver items (top-3)
    for rank, item in enumerate(naver_items[:TOP_N]):
        raw_link = item.get("link", "") or ""
        url = sanitize_url(raw_link)
        if not url:
            continue
        candidates.append({
            "url": url,
            "source": "naver",
            "naver_title": strip_html(item.get("title", "")),
            "naver_address": item.get("roadAddress", "") or item.get("address", ""),
            "rank": rank,
        })

    # Kakao documents (top-3) — requires extra place-page fetch for website
    for rank, doc in enumerate(kakao_docs[:TOP_N]):
        place_url = doc.get("place_url", "")
        if place_url:
            website = kakao_extract_website(place_url)
            if website:
                url = sanitize_url(website)
                if url:
                    candidates.append({
                        "url": url,
                        "source": "kakao",
                        "naver_title": doc.get("place_name", ""),
                        "naver_address": doc.get("road_address_name", "") or doc.get("address_name", ""),
                        "rank": rank,
                    })

    return candidates


def enrich_one_v3(
    vc: dict,
    client_id: str,
    client_secret: str,
    kakao_key: str,
    anthropic_key: str,
    llm_threshold: float = 0.7,
) -> dict:
    """
    Process a single vendor candidate with v3 logic.
    Returns an audit record dict compatible with O1 audit schema.
    """
    name: str = vc.get("business_name", "") or ""
    addr: str = vc.get("address_raw", "") or ""
    attr: dict = vc.get("source_attribution") or {}
    company_id: str | None = attr.get("packlinx_id")

    record: dict = {
        "candidate_id": vc["id"],
        "company_id": company_id,
        "name": name,
        "address": addr,
        "found_url": None,
        "source": None,
        "naver_title": None,
        "naver_address": None,
        "llm_verdict": None,
        "llm_confidence": None,
        "llm_reasoning": None,
        "status": None,
        "reject_reason": None,
        "candidates_tried": 0,
        "page_title": None,
    }

    # 1. Naver Local — top-3
    naver_items = naver_local_search(name, client_id, client_secret)
    time.sleep(RATE_DELAY)

    # Retry with address fragment if no results
    if not naver_items and addr:
        frag = address_fragment(addr)
        if frag:
            naver_items = naver_local_search(f"{name} {frag}", client_id, client_secret)
            time.sleep(RATE_DELAY)

    # 2. Kakao Local — top-3 (only if key is set)
    kakao_docs: list[dict] = []
    if kakao_key:
        kakao_docs = kakao_local_search(name, kakao_key)
        time.sleep(KAKAO_DELAY)

    if not naver_items and not kakao_docs:
        record["status"] = "no_api_result"
        record["reject_reason"] = "both_apis_returned_empty"
        return record

    # 3. Build candidate list
    candidates = _build_candidate_list(name, addr, naver_items, kakao_docs)
    record["candidates_tried"] = len(candidates)

    if not candidates:
        record["status"] = "no_valid_url"
        record["reject_reason"] = "all_candidates_had_invalid_urls"
        return record

    # 4. Evaluate each candidate
    best_record: dict | None = None
    best_confidence: float = -1.0

    for cand in candidates:
        url = cand["url"]
        cand_title = cand["naver_title"]

        # Blacklist check
        blacklisted, bl_reason = is_blacklisted(url)
        if blacklisted:
            continue

        # Name relevance check (dynamic threshold)
        relevant, rel_reason = is_name_relevant(name, cand_title)
        if not relevant:
            continue

        # Fetch page meta for LLM judge
        meta = fetch_page_meta(url)
        if meta["fetch_error"] and not meta["title"]:
            # Network failure and no title — skip
            continue

        # LLM judge (if API key available)
        llm = llm_judge_website(name, addr, url, meta, anthropic_key)
        time.sleep(LLM_DELAY)

        if llm["verdict"] == "N" and llm["confidence"] >= 0.8:
            # High-confidence rejection
            continue

        # Score: LLM Y confidence if available, else name-relevance proxy
        if llm["verdict"] == "Y":
            score = llm["confidence"]
        elif llm["verdict"] == "SKIP":
            # No LLM — use bigram overlap as proxy score
            score = bigram_overlap(name, strip_html(cand_title))
        else:
            score = 1.0 - llm["confidence"]  # N with low confidence

        if score > best_confidence:
            best_confidence = score
            best_record = {
                "found_url": url,
                "source": cand["source"],
                "naver_title": cand_title,
                "naver_address": cand["naver_address"],
                "llm_verdict": llm["verdict"],
                "llm_confidence": llm["confidence"],
                "llm_reasoning": llm["reasoning"],
                "page_title": meta["title"],
            }

    if best_record is None:
        # Try last-resort: store first Naver item info even if we can't accept
        if naver_items:
            item0 = naver_items[0]
            record["naver_title"] = strip_html(item0.get("title", ""))
            record["naver_address"] = item0.get("roadAddress", "") or item0.get("address", "")
        record["status"] = "rejected_all_candidates"
        record["reject_reason"] = "no_candidate_passed_filters"
        return record

    # LLM threshold gate (only enforced when LLM is available)
    if anthropic_key and best_record["llm_verdict"] == "Y" and best_confidence < llm_threshold:
        record.update(best_record)
        record["status"] = "rejected_llm_low_confidence"
        record["reject_reason"] = f"llm_confidence={best_confidence:.2f}<{llm_threshold}"
        return record

    # Accept
    record.update(best_record)
    record["status"] = "dry_match"
    record["reject_reason"] = None
    return record


# ── Main ──────────────────────────────────────────────────────────────────────

def main() -> int:
    parser = argparse.ArgumentParser(
        description="PACAA-786 v3 naver_local + Kakao + LLM website enrichment"
    )
    parser.add_argument("--live", action="store_true",
                        help="Execute DB mutations (default: dry-run, 0 mutations)")
    parser.add_argument("--limit", type=int, default=None,
                        help="Process only first N vendors")
    parser.add_argument("--out", default=None,
                        help="Path to write JSON audit trail")
    parser.add_argument("--llm-threshold", type=float, default=0.7,
                        help="Minimum LLM confidence to accept URL (default 0.7)")
    parser.add_argument("--no-llm", action="store_true",
                        help="Disable LLM judge (use only rule-based filters)")
    args = parser.parse_args()

    client_id = os.environ.get("NAVER_CLIENT_ID", "")
    client_secret = os.environ.get("NAVER_CLIENT_SECRET", "")
    kakao_key = os.environ.get("KAKAO_REST_API_KEY", "")
    anthropic_key = "" if args.no_llm else os.environ.get("ANTHROPIC_API_KEY", "")

    if not client_id or not client_secret:
        print("ERROR: NAVER_CLIENT_ID / NAVER_CLIENT_SECRET not set", file=sys.stderr)
        sys.exit(1)

    mode = "LIVE" if args.live else "DRY-RUN"
    print(f"=== PACAA-786 v3 naver_local website enrichment [{mode}] ===")
    print(f"  Naver Local: ENABLED (top-{TOP_N})")
    print(f"  Kakao Local: {'ENABLED' if kakao_key else 'DISABLED (KAKAO_REST_API_KEY not set)'}")
    print(f"  LLM judge:  {'ENABLED (Haiku)' if anthropic_key else 'DISABLED (ANTHROPIC_API_KEY not set)'}")
    if not args.live:
        print("  DRY-RUN: 0 DB mutations. Pass --live to commit.")

    print("Fetching vendor_candidates from Supabase...", end=" ", flush=True)
    candidates = fetch_candidates(limit=args.limit)
    print(f"{len(candidates)} vendors loaded.")

    results: list[dict] = []
    counters: dict[str, int] = {}

    for i, vc in enumerate(candidates, 1):
        rec = enrich_one_v3(
            vc, client_id, client_secret, kakao_key, anthropic_key,
            llm_threshold=args.llm_threshold,
        )

        if args.live and rec["status"] == "dry_match":
            cid = rec.get("company_id")
            url = rec["found_url"]
            if cid and url:
                ok = patch_company_website(cid, url)
                rec["status"] = "updated" if ok else "update_failed"

        counters[rec["status"]] = counters.get(rec["status"], 0) + 1
        results.append(rec)

        url_display = rec["found_url"] or f"[{rec['status']}]"
        llm_tag = ""
        if rec.get("llm_verdict") and rec["llm_verdict"] != "SKIP":
            llm_tag = f" LLM={rec['llm_verdict']}{rec['llm_confidence']:.1f}"
        src_tag = f"[{rec['source']}]" if rec.get("source") else ""
        reason = (
            f" ← {rec['reject_reason'][:50]}" if rec.get("reject_reason") else ""
        )
        print(
            f"  [{i:3d}/{len(candidates)}] {vc.get('business_name', '')[:20]:<20s}"
            f"  {url_display[:45]:<45s}{src_tag}{llm_tag}{reason}"
        )

    # Summary
    matched = counters.get("dry_match", 0) + counters.get("updated", 0)
    total = len(candidates)
    if total == 0:
        print("No candidates to process.")
        return 0

    print(f"\n{'='*72}")
    print(f"=== 결과 요약 [{mode}] ===")
    print(f"Total processed              : {total}")
    print(f"Matched (URL accepted)       : {matched}  ({matched/total*100:.1f}%)")
    for k, v in sorted(counters.items()):
        print(f"  [{k:35s}]: {v}")
    if args.live:
        print(f"DB updated                   : {counters.get('updated', 0)}")
        print(f"DB update failed             : {counters.get('update_failed', 0)}")
    # Cost estimate (Haiku 4.5: $0.80/1M input, $4.00/1M output)
    haiku_calls = sum(1 for r in results if r.get("llm_verdict") and r["llm_verdict"] != "SKIP")
    if haiku_calls:
        est_input_tokens = haiku_calls * 1000
        est_output_tokens = haiku_calls * 100
        est_cost = (est_input_tokens / 1_000_000) * 0.80 + (est_output_tokens / 1_000_000) * 4.00
        print(f"\nLLM judge calls this run     : {haiku_calls}")
        print(f"Estimated Haiku cost (batch) : ${est_cost:.4f}")
        monthly_vendors = 2500  # approximate active vendor count
        monthly_cost = (monthly_vendors * 1000 / 1_000_000) * 0.80 + (monthly_vendors * 100 / 1_000_000) * 4.00
        print(f"Monthly cost estimate (2.5k) : ${monthly_cost:.4f}  (≤ $5 budget ✓)")
    print(f"{'='*72}")

    if args.out:
        out_path = Path(args.out)
        out_path.parent.mkdir(parents=True, exist_ok=True)
        audit = {
            "run_at": datetime.now(timezone.utc).isoformat(),
            "script": "naver_website_enrich_v3.py",
            "pacaa": "PACAA-786",
            "mode": mode,
            "total": total,
            "matched": matched,
            "counters": counters,
            "llm_judge_calls": haiku_calls if haiku_calls else 0,
            "config": {
                "top_n": TOP_N,
                "kakao_enabled": bool(kakao_key),
                "llm_enabled": bool(anthropic_key),
                "llm_threshold": args.llm_threshold,
            },
            "records": results,
        }
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump(audit, f, ensure_ascii=False, indent=2)
        print(f"Audit trail → {out_path}")

    return 0


if __name__ == "__main__":
    sys.exit(main())
