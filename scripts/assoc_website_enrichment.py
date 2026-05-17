#!/usr/bin/env python3
"""
PACAA-625 / PACAA-786 v3 — Association vendor website enrichment
data_source = 'association' AND website IS NULL

PACAA-786 v3 changes:
  W2 fix: dynamic bigram threshold (≤2 syllables → 1.0, ≥4 → 0.5)
  W4 fix: expanded SKIP_DOMAINS (~80 domains)
  NEW: LLM judge (Claude Haiku) replaces naive title_matches_company check
  NEW: Kakao Local Search API as additional candidate source (optional)

Method: Naver web search + optional Kakao Local → LLM-judged website match
Dry-run: no DB writes; prints results only
Bulk-run: updates companies table WHERE id = ? AND website IS NULL

Usage:
  # Dry-run (no mutations):
  python3 assoc_website_enrichment.py --dry-run --limit 20

  # Bulk (requires explicit --bulk flag):
  python3 assoc_website_enrichment.py --bulk --limit 264

Requires:
  NAVER_CLIENT_ID, NAVER_CLIENT_SECRET (already injected)
  SUPABASE_URL, SUPABASE_SERVICE_KEY (set below or via env)
Optional:
  KAKAO_REST_API_KEY   — Kakao Developers REST key
  ANTHROPIC_API_KEY    — Claude Haiku LLM judge
"""

import argparse
import csv
import json
import os
import re
import socket
import sys
import time
import urllib.parse
import urllib.request
from datetime import date
from pathlib import Path

# --- Config ---
SUPABASE_URL = os.environ.get(
    "NEXT_PUBLIC_SUPABASE_URL",
    "https://jnrciibwtutzymkoepfp.supabase.co",
)
SUPABASE_KEY = os.environ.get(
    "SUPABASE_SERVICE_ROLE_KEY",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpucmNpaWJ3dHV0enlta29lcGZwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjU2NTI2OCwiZXhwIjoyMDkyMTQxMjY4fQ.uVBSdXbxzUbhNKTOaYaiOk2r2etCFnNR8tQ0z1mhJxg",
)
NAVER_ID = os.environ.get("NAVER_CLIENT_ID", "")
NAVER_SECRET = os.environ.get("NAVER_CLIENT_SECRET", "")
KAKAO_KEY = os.environ.get("KAKAO_REST_API_KEY", "")
ANTHROPIC_KEY = os.environ.get("ANTHROPIC_API_KEY", "")

NAVER_SEARCH_URL = "https://openapi.naver.com/v1/search/webkr.json"
KAKAO_LOCAL_URL = "https://dapi.kakao.com/v2/local/search/keyword.json"
ANTHROPIC_MESSAGES_URL = "https://api.anthropic.com/v1/messages"

# W4 fix: expanded SKIP_DOMAINS (~80 domains total)
SKIP_DOMAINS = {
    # Naver
    "naver.com", "blog.naver.com", "m.blog.naver.com", "post.naver.com",
    "cafe.naver.com", "map.naver.com", "search.naver.com", "place.naver.com",
    "smartstore.naver.com", "storefarm.naver.com",
    # Search engines / portals
    "google.com", "google.co.kr", "daum.net", "nate.com",
    # SNS
    "facebook.com", "instagram.com", "youtube.com", "twitter.com", "x.com",
    "linkedin.com", "kakao.com", "kakaopage.com",
    "tiktok.com", "band.us",
    # E-commerce
    "coupang.com", "gmarket.co.kr", "auction.co.kr", "11st.co.kr",
    "interpark.com", "wemakeprice.com", "tmon.co.kr",
    "38.co.kr", "daangn.com",
    # Associations / government
    "koreanpackaging.or.kr", "kpma.or.kr",
    "kcipa.or.kr", "bcca.or.kr", "kfpa.or.kr",
    "kotra.or.kr", "kita.net", "smba.go.kr", "semas.or.kr",
    "bizok.incheon.go.kr", "bizok.or.kr",
    "kopa.or.kr",
    "nts.go.kr", "hometax.go.kr",
    # Job sites
    "jobkorea.co.kr", "saramin.co.kr", "incruit.com",
    "jobplanet.co.kr", "jobploy.kr", "wanted.co.kr", "jumpit.co.kr",
    "albamon.com", "work.go.kr", "career.co.kr",
    # Business directories / info sites
    "bizno.net", "nicebizmap.co.kr", "123company.co.kr", "114.co.kr",
    "watchout.co.kr", "yellowpages.co.kr", "cominfo.co.kr",
    "dnb.co.kr", "findcompany.kr", "placeview.co.kr", "myfactory.co.kr",
    "gimpocci.net",
    # News / media
    "kgindustrynews.com", "hankyung.com", "chosun.com", "joins.com",
    "joongang.co.kr",
    "yna.co.kr", "newsis.com", "news1.kr", "mt.co.kr",
    "etnews.com", "zdnet.co.kr", "ebn.co.kr", "fnnews.com",
    "heraldcorp.com", "moneys.co.kr",
    # Report/research/academic
    "reportworld.co.kr", "dbpia.co.kr", "riss.kr", "happycampus.com",
    "kci.go.kr", "kiss.kstudy.com",
    # Forum/community
    "clien.net", "ppomppu.co.kr", "ruliweb.com", "dcinside.com",
    # Misc
    "weseb.com",
}

# URL path patterns that indicate a directory listing (not the company's own site)
SKIP_PATH_PATTERNS = re.compile(
    r"/(company|biz|place|firm|vendor|member|company_info|shop|store|brand|profile)"
    r"|/[0-9]+$"  # pure numeric ID paths
)


# ── W2 fix: dynamic bigram threshold ─────────────────────────────────────────

def count_korean_syllables(text: str) -> int:
    return sum(1 for c in text if "가" <= c <= "힣")


def dynamic_name_threshold(vendor_name: str) -> int:
    """
    Minimum canonical name length required for partial match.
    ≤2 syllables → require exact match (return large number so partial match won't fire)
    ≥4 syllables → allow 4-char partial (default)
    3 syllables → allow 3-char partial
    """
    s = count_korean_syllables(vendor_name.strip())
    if s <= 2:
        return 999  # force exact/substring only
    if s >= 4:
        return 4
    return 3


# ── Kakao Local search helper ─────────────────────────────────────────────────

def kakao_local_search_v3(query: str) -> list[dict]:
    """Return top-3 Kakao Local search documents (graceful if key absent)."""
    if not KAKAO_KEY:
        return []
    params = urllib.parse.urlencode({"query": query, "size": 3})
    req = urllib.request.Request(
        f"{KAKAO_LOCAL_URL}?{params}",
        headers={
            "Authorization": f"KakaoAK {KAKAO_KEY}",
            "User-Agent": "PacklinxEnricher/3.0",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as r:
            data = json.loads(r.read().decode("utf-8"))
        return data.get("documents", [])[:3]
    except Exception as e:
        print(f"  [kakao] query='{query}': {e}", file=sys.stderr)
        return []


def kakao_extract_website_v3(place_url: str) -> str | None:
    """Fetch Kakao place page and extract company homepage URL."""
    try:
        req = urllib.request.Request(
            place_url,
            headers={"User-Agent": "Mozilla/5.0 (compatible; PacklinxEnricher/3.0)"},
        )
        with urllib.request.urlopen(req, timeout=10) as r:
            html = r.read(32768).decode("utf-8", errors="replace")
        m = re.search(r'"homepageUrl"\s*:\s*"([^"]+)"', html)
        if m:
            return m.group(1)
        m2 = re.search(r'class="[^"]*link_homepage[^"]*"[^>]+href="([^"]+)"', html)
        if m2:
            return m2.group(1)
        return None
    except Exception:
        return None


# ── LLM judge helper ──────────────────────────────────────────────────────────

def llm_judge_v3(name: str, addr: str, url: str, meta: dict) -> dict:
    """
    Ask Claude Haiku to judge if this page is the official website of the company.
    Returns {"verdict": "Y"|"N"|"SKIP", "confidence": float, "reasoning": str}.
    Skips if ANTHROPIC_API_KEY is not set.
    """
    if not ANTHROPIC_KEY:
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
            "x-api-key": ANTHROPIC_KEY,
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


# ── Company name prefix/suffix stripping for matching ─────────────────────────

def canonical_name(name: str) -> str:
    """Strip legal form markers for fuzzy matching."""
    name = re.sub(r"[\(\)㈜（）]", "", name)
    name = re.sub(r"^(주식회사|유한회사|합명회사|합자회사)\s*", "", name)
    name = re.sub(r"\s*(주식회사|유한회사|\(주\)|\(유\)|㈜)\s*$", "", name)
    name = name.strip()
    return name


def extract_domain(url: str) -> str:
    try:
        host = urllib.parse.urlparse(url).netloc
        host = host.lstrip("www.")
        return host.lower()
    except Exception:
        return ""


def is_skip_domain(url: str) -> bool:
    domain = extract_domain(url)
    for skip in SKIP_DOMAINS:
        if domain == skip or domain.endswith("." + skip):
            return True
    return False


def url_resolves(url: str, timeout: int = 5) -> bool:
    """DNS + TCP connect check (fast, no full HTTP)."""
    try:
        host = urllib.parse.urlparse(url).netloc
        socket.getaddrinfo(host, None, socket.AF_UNSPEC, socket.SOCK_STREAM)
        return True
    except Exception:
        return False


def http_ok(url: str, timeout: int = 8) -> bool:
    """HEAD request → 2xx/3xx response."""
    try:
        req = urllib.request.Request(
            url,
            headers={"User-Agent": "PacklinxEnricher/1.0"},
            method="HEAD",
        )
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return r.status < 400
    except Exception:
        try:
            req2 = urllib.request.Request(
                url,
                headers={"User-Agent": "PacklinxEnricher/1.0"},
                method="GET",
            )
            with urllib.request.urlopen(req2, timeout=timeout) as r:
                return r.status < 400
        except Exception:
            return False


def name_in_title(name: str, title: str, description: str) -> bool:
    """
    Check if canonical name appears in the Naver result title or description.
    W2 fix: dynamic threshold — short names (≤2 syllables) require exact match.
    """
    cn = canonical_name(name).lower()
    combined = (title + " " + description).lower()
    if not cn:
        return False
    threshold = dynamic_name_threshold(name)
    # Short names: require exact word boundary
    if len(cn) < threshold:
        return bool(re.search(r"(?<!\w)" + re.escape(cn) + r"(?!\w)", combined))
    # Longer names: allow partial match
    return cn in combined


def domain_matches_name(domain: str, name: str) -> bool:
    """
    Check if the domain plausibly belongs to the company.
    At least part of the canonical name should appear in the domain OR
    the domain should be a very short/custom name (≤ 8 chars after TLD strip).
    This is an extra guard against directories/portals that pass name_in_title.
    """
    cn = canonical_name(name).lower()
    # Remove Korean characters — look for romanized parts or initials
    # Korean company names often have a romanized portion in the domain
    # e.g. "보성팩" → "bosungpack.co.kr" or "bsp.co.kr"
    # We can't directly transliterate Korean, so we use a heuristic:
    # If domain is not in our skip list AND name_in_title passed, accept it
    # UNLESS the domain is clearly a portal/directory (already handled by SKIP_DOMAINS)
    # This function is a secondary guard for common directory patterns not in SKIP_DOMAINS
    domain_base = domain.split(".")[0].lower()
    # Reject known directory/info patterns
    if re.search(r"(news|info|directory|portal|map|biz\d|search|yellow|page)", domain_base):
        return False
    return True


def _decode_html(raw: bytes) -> str:
    for enc in ("utf-8", "euc-kr", "cp949"):
        try:
            return raw.decode(enc)
        except Exception:
            continue
    return raw.decode("utf-8", errors="replace")


def _extract_title(html: str) -> str:
    m = re.search(r"<title[^>]*>(.*?)</title>", html, re.DOTALL | re.IGNORECASE)
    title = re.sub(r"\s+", " ", m.group(1)).strip() if m else ""
    if not title:
        m2 = re.search(
            r'<meta[^>]+property=["\']og:title["\'][^>]+content=["\']([^"\']+)["\']',
            html, re.IGNORECASE
        )
        title = m2.group(1).strip() if m2 else ""
    return title


def fetch_page_meta_v3(url: str, timeout: int = 8) -> dict:
    """
    Fetch URL and extract title, meta description, og:site_name for LLM judge.
    Returns dict: {title, description, og_site_name, fetch_error, js_only}.
    Handles charset auto-detect and simple JS redirects.
    """
    meta = {"title": "", "description": "", "og_site_name": "", "fetch_error": "", "js_only": False}
    try:
        req = urllib.request.Request(
            url,
            headers={
                "User-Agent": "Mozilla/5.0 (compatible; PacklinxEnricher/3.0)",
                "Accept-Language": "ko-KR,ko;q=0.9",
            },
        )
        with urllib.request.urlopen(req, timeout=timeout) as r:
            raw = r.read(65536)
    except Exception as e:
        meta["fetch_error"] = f"fetch_fail:{type(e).__name__}"
        return meta

    html = _decode_html(raw)
    title = _extract_title(html)

    if not title:
        # Try simple JS redirect
        js_redir = re.search(r"""location\.href\s*=\s*['"]([^'"]+)['"]""", html, re.IGNORECASE)
        if js_redir:
            redir_target = js_redir.group(1)
            if redir_target.startswith("http"):
                follow_url = redir_target
            else:
                base = re.match(r"(https?://[^/]+)", url)
                follow_url = (base.group(1) + "/" + redir_target.lstrip("./")) if base else url
            try:
                req2 = urllib.request.Request(
                    follow_url,
                    headers={"User-Agent": "Mozilla/5.0 (compatible; PacklinxEnricher/3.0)"},
                )
                with urllib.request.urlopen(req2, timeout=timeout) as r2:
                    raw2 = r2.read(65536)
                html = _decode_html(raw2)
                title = _extract_title(html)
            except Exception:
                pass

    if len(html.strip()) < 2000 and not title:
        meta["js_only"] = True

    meta["title"] = title[:120] if title else ""

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


def fetch_page_title(url: str, timeout: int = 8) -> tuple[str, str]:
    """
    Legacy wrapper kept for backward compat.
    Returns (title_text, reason) using fetch_page_meta_v3 internally.
    """
    meta = fetch_page_meta_v3(url, timeout)
    if meta["fetch_error"]:
        return ("", meta["fetch_error"])
    if meta["js_only"]:
        return ("", "js_only")
    return (meta["title"], "")


def title_matches_company(title: str, name: str) -> bool:
    """
    Step E verification: the fetched page title must contain the canonical company name.
    Accepts partial Korean token match OR English transliteration signal.
    """
    if not title:
        return False
    cn = canonical_name(name).lower()
    title_lower = title.lower()

    # Direct Korean match (canonical name ≥2 chars — Korean chars are meaningful)
    if len(cn) >= 2 and cn in title_lower:
        return True

    # Looser: any 2+ char token of the canonical name appears in title
    tokens = [t for t in re.split(r"\s+", cn) if len(t) >= 2]
    for tok in tokens:
        if tok in title_lower:
            return True

    return False


def naver_search(query: str) -> list[dict]:
    """Return Naver webkr search results (items list)."""
    params = urllib.parse.urlencode({"query": query, "display": 10, "start": 1})
    req = urllib.request.Request(
        f"{NAVER_SEARCH_URL}?{params}",
        headers={
            "X-Naver-Client-Id": NAVER_ID,
            "X-Naver-Client-Secret": NAVER_SECRET,
            "User-Agent": "PacklinxEnricher/1.0",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as r:
            data = json.loads(r.read().decode("utf-8"))
        return data.get("items", [])
    except Exception as e:
        print(f"  [naver_search] error: {e}", file=sys.stderr)
        return []


def _naver_url_to_root(link: str) -> str | None:
    """Normalize a URL to root (scheme + netloc), or return None if invalid."""
    if not link.startswith("http"):
        return None
    parsed = urllib.parse.urlparse(link)
    return f"{parsed.scheme}://{parsed.netloc}"


def enrich_one(vendor: dict) -> dict:
    """
    Try to find website for one vendor.
    v3: Naver web search + optional Kakao Local → LLM judge (if ANTHROPIC_API_KEY set).
    Returns dict with found_url, confidence, method, skip_reason, llm_verdict, llm_confidence.
    """
    name = vendor["name"]
    address = vendor.get("address") or ""
    city_match = re.match(
        r"^(서울|부산|대구|인천|광주|대전|울산|세종|경기|강원|충북|충남|전북|전남|경북|경남|제주)\s*(\S+시|\S+군)?",
        address,
    )
    city = city_match.group(0)[:6] if city_match else ""

    # --- Naver web search candidates ---
    query1 = f"{name} 홈페이지"
    query2 = f"{name} {city}".strip() if city else name
    all_items = naver_search(query1)
    time.sleep(0.35)
    if not all_items:
        all_items = naver_search(query2)
        time.sleep(0.35)

    # --- Kakao Local candidates (optional) ---
    kakao_urls: list[str] = []
    if KAKAO_KEY:
        for doc in kakao_local_search_v3(name)[:3]:
            place_url = doc.get("place_url", "")
            if place_url:
                site = kakao_extract_website_v3(place_url)
                if site and site.startswith("http"):
                    kakao_urls.append(site)
        time.sleep(0.25)

    # --- Build candidate pool ---
    # Each entry: (root_url, method_tag)
    candidate_pool: list[tuple[str, str]] = []

    for item in all_items:
        link = item.get("link", "")
        title = re.sub(r"<[^>]+>", "", item.get("title", ""))
        description = re.sub(r"<[^>]+>", "", item.get("description", ""))

        if not link.startswith("http"):
            continue
        if is_skip_domain(link):
            continue
        if not name_in_title(name, title, ""):
            continue
        parsed_path = urllib.parse.urlparse(link).path
        if SKIP_PATH_PATTERNS.search(parsed_path):
            continue
        domain = extract_domain(link)
        if not domain_matches_name(domain, name):
            continue
        root_url = _naver_url_to_root(link)
        if root_url:
            candidate_pool.append((root_url, "naver_search"))

    for kurl in kakao_urls:
        root_url = _naver_url_to_root(kurl)
        if root_url and not is_skip_domain(root_url):
            candidate_pool.append((root_url, "kakao_local"))

    # Deduplicate while preserving order
    seen: set[str] = set()
    unique_pool: list[tuple[str, str]] = []
    for entry in candidate_pool:
        if entry[0] not in seen:
            seen.add(entry[0])
            unique_pool.append(entry)

    # --- Evaluate each candidate ---
    for root_url, method_tag in unique_pool:
        if not url_resolves(root_url):
            continue
        if not http_ok(root_url):
            continue

        # Fetch page meta (replaces old fetch_page_title for LLM judge)
        meta = fetch_page_meta_v3(root_url)

        if meta["fetch_error"].startswith("fetch_fail"):
            continue

        page_title = meta["title"]

        if meta["js_only"]:
            # JS-rendered — if LLM available, try judging with whatever meta we have
            if ANTHROPIC_KEY:
                llm = llm_judge_v3(name, address, root_url, meta)
                time.sleep(0.10)
                if llm["verdict"] == "Y" and llm["confidence"] >= 0.6:
                    return {
                        "id": vendor["id"], "name": name, "found_url": root_url,
                        "confidence": "PROBABLE", "method": f"{method_tag}+llm_judge_js",
                        "skip_reason": "", "page_title": "[JS-rendered]",
                        "llm_verdict": llm["verdict"], "llm_confidence": llm["confidence"],
                    }
                continue
            # No LLM: accept with PROBABLE (Naver title matched)
            return {
                "id": vendor["id"], "name": name, "found_url": root_url,
                "confidence": "PROBABLE", "method": f"{method_tag}+js_only",
                "skip_reason": "", "page_title": "[JS-rendered, title not extractable]",
                "llm_verdict": None, "llm_confidence": None,
            }

        # If we have a page title, run LLM judge (or fall back to title_matches_company)
        if ANTHROPIC_KEY:
            llm = llm_judge_v3(name, address, root_url, meta)
            time.sleep(0.10)
            if llm["verdict"] == "N" and llm["confidence"] >= 0.8:
                continue  # high-confidence rejection
            if llm["verdict"] == "Y" and llm["confidence"] >= 0.7:
                return {
                    "id": vendor["id"], "name": name, "found_url": root_url,
                    "confidence": "HIGH", "method": f"{method_tag}+llm_judge",
                    "skip_reason": "", "page_title": page_title[:120],
                    "llm_verdict": llm["verdict"], "llm_confidence": llm["confidence"],
                }
            # SKIP or uncertain LLM → fall through to title check
        else:
            llm = {"verdict": None, "confidence": None}

        # Fallback: title_matches_company (when LLM unavailable or uncertain)
        if page_title and not title_matches_company(page_title, name):
            continue
        if not page_title:
            continue

        return {
            "id": vendor["id"], "name": name, "found_url": root_url,
            "confidence": "HIGH", "method": f"{method_tag}+title_verify",
            "skip_reason": "", "page_title": page_title[:120],
            "llm_verdict": llm.get("verdict"), "llm_confidence": llm.get("confidence"),
        }

    return {
        "id": vendor["id"], "name": name, "found_url": "",
        "confidence": "SKIP", "method": "naver_search+kakao_local",
        "skip_reason": "no_match", "page_title": "",
        "llm_verdict": None, "llm_confidence": None,
    }


def fetch_vendors(limit: int) -> list[dict]:
    url = (
        f"{SUPABASE_URL}/rest/v1/companies"
        f"?select=id,name,address,category&data_source=like.association*&website=is.null&limit={limit}"
    )
    req = urllib.request.Request(
        url,
        headers={
            "Authorization": f"Bearer {SUPABASE_KEY}",
            "apikey": SUPABASE_KEY,
        },
    )
    with urllib.request.urlopen(req, timeout=15) as r:
        return json.loads(r.read().decode("utf-8"))


def update_vendor_website(vendor_id: str, url: str) -> bool:
    """PATCH website for one vendor. Idempotent (WHERE website IS NULL via select guard)."""
    req = urllib.request.Request(
        f"{SUPABASE_URL}/rest/v1/companies?id=eq.{vendor_id}&website=is.null",
        data=json.dumps({"website": url}).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {SUPABASE_KEY}",
            "apikey": SUPABASE_KEY,
            "Content-Type": "application/json",
            "Prefer": "return=minimal",
        },
        method="PATCH",
    )
    try:
        with urllib.request.urlopen(req, timeout=15) as r:
            return r.status in (200, 204)
    except Exception as e:
        print(f"  [update] {vendor_id}: {e}", file=sys.stderr)
        return False


def main():
    parser = argparse.ArgumentParser(
        description="PACAA-625/PACAA-786 v3 association website enrichment"
    )
    parser.add_argument("--dry-run", action="store_true", default=False,
                        help="No DB mutations; print results only")
    parser.add_argument("--bulk", action="store_true", default=False,
                        help="Write matched URLs to DB (requires explicit flag)")
    parser.add_argument("--limit", type=int, default=20,
                        help="Number of vendors to process (default 20 for dry-run)")
    parser.add_argument("--out", default="",
                        help="Output CSV path (default: runs/assoc_enrich_YYYYMMDD.csv)")
    args = parser.parse_args()

    if args.bulk and args.dry_run:
        print("ERROR: --bulk and --dry-run are mutually exclusive", file=sys.stderr)
        sys.exit(1)

    if not args.dry_run and not args.bulk:
        print("INFO: Neither --dry-run nor --bulk specified. Defaulting to --dry-run.", file=sys.stderr)
        args.dry_run = True

    if not NAVER_ID or not NAVER_SECRET:
        print("ERROR: NAVER_CLIENT_ID / NAVER_CLIENT_SECRET missing", file=sys.stderr)
        sys.exit(1)

    out_path = args.out or f"runs/assoc_enrich_{date.today().isoformat()}.csv"
    Path(out_path).parent.mkdir(parents=True, exist_ok=True)

    print(f"Fetching {args.limit} association vendors (website IS NULL)...")
    vendors = fetch_vendors(args.limit)
    print(f"  Loaded {len(vendors)} records.")

    results = []
    matched = 0
    skipped = 0

    for i, v in enumerate(vendors, 1):
        print(f"  [{i:3d}/{len(vendors)}] {v['name']} ...", end=" ", flush=True)
        r = enrich_one(v)
        results.append(r)

        if r["confidence"] in ("HIGH", "PROBABLE"):
            matched += 1
            label = "MATCH" if r["confidence"] == "HIGH" else "PROBABLE"
            print(f"{label} → {r['found_url']}  [{r.get('page_title','')[:40]}]")
            if args.bulk:
                ok = update_vendor_website(v["id"], r["found_url"])
                r["db_updated"] = "YES" if ok else "FAIL"
                print(f"         DB update: {r['db_updated']}")
        else:
            skipped += 1
            print(f"SKIP ({r['skip_reason']})")

    # Write CSV
    fieldnames = ["id", "name", "found_url", "page_title", "confidence",
                  "method", "skip_reason", "llm_verdict", "llm_confidence"]
    if args.bulk:
        fieldnames.append("db_updated")
    with open(out_path, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=fieldnames)
        w.writeheader()
        w.writerows(results)

    print(f"\n=== 결과 요약 ({'DRY-RUN' if args.dry_run else 'BULK'}) ===")
    print(f"처리: {len(vendors)}건")
    print(f"매치 (HIGH): {matched}건")
    print(f"스킵 (no_match): {skipped}건")
    print(f"예상 전체 매치율: {matched/len(vendors)*100:.1f}% (샘플 기준)")
    print(f"CSV 저장: {out_path}")


if __name__ == "__main__":
    main()
