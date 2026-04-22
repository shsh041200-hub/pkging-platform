#!/usr/bin/env python3
"""
Fetch and cache company favicons into Supabase Storage.

Priority chain:
  1. <link rel="icon" sizes="..."> (largest)
  2. <link rel="apple-touch-icon">
  3. <link rel="shortcut icon">
  4. <meta property="og:image"> (fallback)
  5. /favicon.ico (if robots.txt allows)
  6. Google Favicon API

Usage:
    python3 scripts/fetch-company-icons.py [--dry-run] [--limit N] [--website DOMAIN]
"""
import argparse
import json
import re
import ssl
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
import urllib.robotparser
from collections import Counter
from datetime import datetime, timezone
from html.parser import HTMLParser

SUPABASE_URL = "https://jnrciibwtutzymkoepfp.supabase.co"
SERVICE_ROLE_KEY = (
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"
    ".eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpucmNpaWJ3dHV0enlta29lcGZwIiwi"
    "cm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjU2NTI2OCwiZXhwIjoyMDky"
    "MTQxMjY4fQ.uVBSdXbxzUbhNKTOaYaiOk2r2etCFnNR8tQ0z1mhJxg"
)
BUCKET = "company-icons"
REQUEST_DELAY = 0.5
FETCH_TIMEOUT = 10


# ── HTML parser: collects ALL icon-related tags ──────────────────────────────

class IconCollector(HTMLParser):
    """Collects icon candidates from HTML <head>."""

    def __init__(self):
        super().__init__()
        self.icons: list[dict] = []
        self.apple_touch_icons: list[dict] = []
        self.shortcut_icons: list[dict] = []
        self.og_image: str | None = None
        self._in_head = False
        self._past_body = False

    def handle_starttag(self, tag, attrs):
        if tag == "head":
            self._in_head = True
            return
        if tag == "body":
            self._past_body = True
            return
        if self._past_body:
            return

        attr = dict(attrs)

        if tag == "link":
            rel = attr.get("rel", "").lower()
            href = attr.get("href", "").strip()
            if not href:
                return

            if "apple-touch-icon" in rel:
                sizes = _parse_size(attr.get("sizes", ""))
                self.apple_touch_icons.append({"href": href, "size": sizes})
            elif "shortcut" in rel and "icon" in rel:
                self.shortcut_icons.append({"href": href})
            elif "icon" in rel:
                sizes = _parse_size(attr.get("sizes", ""))
                self.icons.append({"href": href, "size": sizes})

        elif tag == "meta" and not self.og_image:
            prop = attr.get("property", "").lower()
            content = attr.get("content", "").strip()
            if prop == "og:image" and content:
                self.og_image = content

    def handle_endtag(self, tag):
        if tag == "head":
            self._in_head = False


def _parse_size(sizes_str: str) -> int:
    """Extract max dimension from sizes attribute like '32x32' or '180x180'."""
    if not sizes_str or sizes_str.lower() == "any":
        return 0
    m = re.search(r"(\d+)x(\d+)", sizes_str, re.I)
    if m:
        return max(int(m.group(1)), int(m.group(2)))
    return 0


# ── SSL context ──────────────────────────────────────────────────────────────

_SSL_CTX = ssl.create_default_context()
_SSL_CTX.check_hostname = False
_SSL_CTX.verify_mode = ssl.CERT_NONE


def _opener():
    handler = urllib.request.HTTPSHandler(context=_SSL_CTX)
    return urllib.request.build_opener(handler)


OPENER = _opener()


def _encode_idn_url(url: str) -> str:
    """Encode IDN (Internationalized Domain Name) URLs to punycode."""
    parsed = urllib.parse.urlparse(url)
    netloc = parsed.netloc or parsed.path.split("/")[0]
    try:
        encoded_netloc = netloc.encode("idna").decode("ascii")
    except (UnicodeError, UnicodeDecodeError):
        parts = netloc.split(".")
        encoded_parts = []
        for part in parts:
            try:
                encoded_parts.append(part.encode("idna").decode("ascii"))
            except (UnicodeError, UnicodeDecodeError):
                encoded_parts.append(part)
        encoded_netloc = ".".join(encoded_parts)
    if encoded_netloc == netloc:
        return url
    scheme = parsed.scheme or "https"
    path = parsed.path or ""
    query = f"?{parsed.query}" if parsed.query else ""
    return f"{scheme}://{encoded_netloc}{path}{query}"


def fetch_url(url: str, timeout: int = FETCH_TIMEOUT) -> tuple[bytes | None, str | None]:
    """Returns (data, error_reason). error_reason is None on success."""
    try:
        url = _encode_idn_url(url)
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (compatible; packlinx-bot/2.0)"})
        with OPENER.open(req, timeout=timeout) as r:
            return r.read(), None
    except urllib.error.HTTPError as e:
        return None, f"http_{e.code}"
    except urllib.error.URLError as e:
        reason = str(e.reason)
        if "ssl" in reason.lower() or "certificate" in reason.lower():
            return None, "ssl_error"
        if "timeout" in reason.lower() or "timed out" in reason.lower():
            return None, "timeout"
        return None, f"url_error:{reason[:80]}"
    except TimeoutError:
        return None, "timeout"
    except Exception as e:
        return None, f"error:{type(e).__name__}"


# ── robots.txt ───────────────────────────────────────────────────────────────

_robots_cache: dict[str, bool] = {}


def is_favicon_ico_allowed(domain_url: str) -> bool:
    """Check if /favicon.ico is allowed by robots.txt. Cached per domain."""
    if domain_url in _robots_cache:
        return _robots_cache[domain_url]
    robots_url = domain_url.rstrip("/") + "/robots.txt"
    rp = urllib.robotparser.RobotFileParser()
    rp.set_url(robots_url)
    try:
        rp.read()
    except Exception:
        _robots_cache[domain_url] = True
        return True
    allowed = rp.can_fetch("*", domain_url.rstrip("/") + "/favicon.ico")
    _robots_cache[domain_url] = allowed
    return allowed


# ── Domain extraction ────────────────────────────────────────────────────────

def domain_root(website: str) -> str:
    url = _encode_idn_url(website)
    parsed = urllib.parse.urlparse(url)
    scheme = parsed.scheme or "https"
    netloc = parsed.netloc or parsed.path.split("/")[0]
    return f"{scheme}://{netloc}"


def resolve_href(href: str, base_url: str) -> str:
    """Resolve a potentially relative href against the base URL."""
    if href.startswith("//"):
        return "https:" + href
    if href.startswith("/"):
        return base_url.rstrip("/") + href
    if href.startswith("http"):
        return href
    return base_url.rstrip("/") + "/" + href


# ── Icon validation ──────────────────────────────────────────────────────────

def is_valid_icon(data: bytes | None) -> bool:
    if not data or len(data) < 30:
        return False
    magic = data[:8]
    if magic[:4] == b"\x00\x00\x01\x00":  # ICO
        return True
    if magic[:8] == b"\x89PNG\r\n\x1a\n":  # PNG
        return True
    if magic[:2] == b"\xff\xd8":  # JPEG
        return True
    if magic[:6] in (b"GIF87a", b"GIF89a"):  # GIF
        return True
    if magic[:4] == b"RIFF" and len(data) > 12 and data[8:12] == b"WEBP":  # WebP
        return True
    # SVG (may start with BOM, whitespace, or XML declaration)
    text_start = data[:200].lstrip(b"\xef\xbb\xbf \t\r\n")
    if text_start[:5] == b"<?xml" or text_start[:4] == b"<svg":
        return True
    return False


# ── Fetch strategies ─────────────────────────────────────────────────────────

def fetch_icon_from_html(domain_root_url: str) -> tuple[bytes | None, str, str | None]:
    """
    Fetch HTML page and try icons in priority order.
    Returns (data, strategy_name, error_reason).
    """
    html_data, err = fetch_url(domain_root_url)
    if not html_data:
        return None, "html_fetch", err

    try:
        text = html_data.decode("utf-8", errors="replace")
    except Exception:
        return None, "html_decode", "decode_error"

    collector = IconCollector()
    collector.feed(text[:32768])

    # Priority 1: <link rel="icon"> sorted by size (largest first)
    candidates = sorted(collector.icons, key=lambda x: x["size"], reverse=True)
    for c in candidates:
        url = resolve_href(c["href"], domain_root_url)
        data, err = fetch_url(url)
        if is_valid_icon(data):
            label = f"link_icon_{c['size']}px" if c["size"] else "link_icon"
            return data, label, None

    # Priority 2: <link rel="apple-touch-icon">
    apple_sorted = sorted(collector.apple_touch_icons, key=lambda x: x["size"], reverse=True)
    for c in apple_sorted:
        url = resolve_href(c["href"], domain_root_url)
        data, err = fetch_url(url)
        if is_valid_icon(data):
            return data, "apple_touch_icon", None

    # Priority 3: <link rel="shortcut icon">
    for c in collector.shortcut_icons:
        url = resolve_href(c["href"], domain_root_url)
        data, err = fetch_url(url)
        if is_valid_icon(data):
            return data, "shortcut_icon", None

    # Priority 4: <meta property="og:image">
    if collector.og_image:
        url = resolve_href(collector.og_image, domain_root_url)
        data, err = fetch_url(url)
        if is_valid_icon(data):
            return data, "og_image", None

    found_tags = len(candidates) + len(apple_sorted) + len(collector.shortcut_icons) + (1 if collector.og_image else 0)
    if found_tags == 0:
        return None, "html_no_tags", "no_icon_tags_in_html"
    return None, "html_tags_invalid", "icon_tags_found_but_images_invalid"


def fetch_favicon_ico(domain_root_url: str) -> tuple[bytes | None, str | None]:
    url = domain_root_url.rstrip("/") + "/favicon.ico"
    data, err = fetch_url(url)
    if is_valid_icon(data):
        return data, None
    return None, err or "invalid_image"


def fetch_google_favicon(website: str) -> tuple[bytes | None, str | None]:
    parsed = urllib.parse.urlparse(website)
    domain = parsed.netloc or parsed.path.split("/")[0]
    url = f"https://www.google.com/s2/favicons?domain={urllib.parse.quote(domain)}&sz=64"
    data, err = fetch_url(url)
    if not data:
        return None, err
    if len(data) < 200:
        return None, "google_placeholder"
    if is_valid_icon(data):
        return data, None
    return None, "google_invalid"


# ── Supabase REST helpers ────────────────────────────────────────────────────

def supabase_request(method: str, path: str, data=None, extra_headers=None):
    url = f"{SUPABASE_URL}{path}"
    headers = {
        "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
        "apikey": SERVICE_ROLE_KEY,
        "Content-Type": "application/json",
    }
    if extra_headers:
        headers.update(extra_headers)
    body = json.dumps(data).encode() if data and isinstance(data, (dict, list)) else data
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as r:
            return r.status, r.read()
    except urllib.error.HTTPError as e:
        return e.code, e.read()


def get_companies(limit: int | None, website_filter: str | None = None) -> list[dict]:
    params = "select=id,slug,website&website=not.is.null&icon_url=is.null&order=id"
    if limit:
        params += f"&limit={limit}"
    if website_filter:
        params += f"&website=like.*{urllib.parse.quote(website_filter)}*"
    status, body = supabase_request("GET", f"/rest/v1/companies?{params}")
    if status != 200:
        print(f"ERROR fetching companies: {status} {body[:200]}", file=sys.stderr)
        sys.exit(1)
    return json.loads(body)


def upload_icon(company_id: str, icon_data: bytes) -> str | None:
    path = f"/storage/v1/object/{BUCKET}/{company_id}.png"
    status, body = supabase_request(
        "POST",
        path,
        data=icon_data,
        extra_headers={
            "Content-Type": "image/png",
            "x-upsert": "true",
        },
    )
    if status in (200, 201):
        return f"{SUPABASE_URL}/storage/v1/object/public/{BUCKET}/{company_id}.png"
    print(f"  Storage upload error {status}: {body[:200]}")
    return None


def update_company_icon(company_id: str, icon_url: str) -> bool:
    now = datetime.now(timezone.utc).isoformat()
    data = {"icon_url": icon_url, "icon_fetched_at": now}
    status, body = supabase_request(
        "PATCH",
        f"/rest/v1/companies?id=eq.{company_id}",
        data=data,
        extra_headers={"Prefer": "return=minimal"},
    )
    return status in (200, 204)


# ── Main pipeline ────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--limit", type=int, default=None)
    parser.add_argument("--website", type=str, default=None, help="Filter by website domain substring")
    args = parser.parse_args()

    companies = get_companies(args.limit, args.website)
    total = len(companies)
    print(f"Companies to process: {total}")
    if total == 0:
        return

    success = 0
    errors = 0
    failure_reasons: Counter = Counter()
    results: list[dict] = []

    for i, company in enumerate(companies, 1):
        website = company["website"]
        cid = company["id"]
        slug = company["slug"]
        print(f"[{i}/{total}] {slug} ({website})")

        try:
            root = domain_root(website)
            icon_data = None
            strategy = None

            # Strategies 1-4: HTML-based (link icons, apple-touch, shortcut, og:image)
            icon_data, strategy, html_err = fetch_icon_from_html(root)

            # Strategy 5: /favicon.ico (only if HTML strategies failed and robots allows)
            if not icon_data:
                if is_favicon_ico_allowed(root):
                    icon_data, fav_err = fetch_favicon_ico(root)
                    if icon_data:
                        strategy = "favicon_ico"
                else:
                    fav_err = "robots_disallowed"

            # Strategy 6: Google Favicon API
            if not icon_data:
                icon_data, google_err = fetch_google_favicon(website)
                if icon_data:
                    strategy = "google_api"

            if not icon_data:
                reason = html_err or fav_err or google_err or "unknown"
                print(f"  → SKIP: {reason} (html={html_err}, favicon.ico={fav_err}, google={google_err})")
                failure_reasons[reason] += 1
                results.append({"slug": slug, "website": website, "status": "skip", "reason": reason})
                time.sleep(REQUEST_DELAY)
                continue

            print(f"  → FOUND via {strategy} ({len(icon_data)} bytes)")

            if args.dry_run:
                print(f"  [DRY-RUN] would upload and update DB")
                success += 1
                results.append({"slug": slug, "website": website, "status": "success", "strategy": strategy})
            else:
                public_url = upload_icon(cid, icon_data)
                if not public_url:
                    print("  → ERROR: storage upload failed")
                    errors += 1
                    failure_reasons["upload_failed"] += 1
                    results.append({"slug": slug, "website": website, "status": "error", "reason": "upload_failed"})
                elif not update_company_icon(cid, public_url):
                    print("  → ERROR: DB update failed")
                    errors += 1
                    failure_reasons["db_update_failed"] += 1
                    results.append({"slug": slug, "website": website, "status": "error", "reason": "db_update_failed"})
                else:
                    print(f"  → SAVED: {public_url}")
                    success += 1
                    results.append({"slug": slug, "website": website, "status": "success", "strategy": strategy})

        except Exception as exc:
            print(f"  → ERROR: {exc}")
            errors += 1
            failure_reasons[f"exception:{type(exc).__name__}"] += 1
            results.append({"slug": slug, "website": website, "status": "error", "reason": str(exc)[:100]})

        time.sleep(REQUEST_DELAY)

    # Summary
    prefix = "[DRY-RUN] " if args.dry_run else ""
    print(f"\n{prefix}Results:")
    print(f"  Success: {success}")
    print(f"  Errors:  {errors}")
    print(f"  Skipped: {total - success - errors}")
    print(f"  Total:   {total}")

    if failure_reasons:
        print(f"\n{prefix}Failure breakdown:")
        for reason, count in failure_reasons.most_common():
            print(f"  {reason}: {count}")

    # Write detailed report
    report_path = f"scripts/icon-fetch-report-{datetime.now().strftime('%Y%m%dT%H%M%S')}.json"
    report = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "dry_run": args.dry_run,
        "total": total,
        "success": success,
        "errors": errors,
        "skipped": total - success - errors,
        "failure_breakdown": dict(failure_reasons.most_common()),
        "details": results,
    }
    with open(report_path, "w") as f:
        json.dump(report, f, indent=2, ensure_ascii=False)
    print(f"\nDetailed report: {report_path}")


if __name__ == "__main__":
    main()
