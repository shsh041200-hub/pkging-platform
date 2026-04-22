#!/usr/bin/env python3
"""
KOR-221: Fetch and cache company favicons into Supabase Storage.

Fetches favicon for each company with a website but no icon_url.
Priority order: /favicon.ico → <link rel="icon"> → Google Favicon API.
Respects robots.txt: skips domain if /favicon.ico is disallowed.

Usage:
    python3 scripts/fetch-company-icons.py [--dry-run] [--limit N]
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
REQUEST_DELAY = 0.5  # 2 req/sec max
FETCH_TIMEOUT = 8


# ── HTML icon link parser ──────────────────────────────────────────────────────

class IconLinkParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.icon_url: str | None = None

    def handle_starttag(self, tag, attrs):
        if tag != "link" or self.icon_url:
            return
        attr = dict(attrs)
        rel = attr.get("rel", "")
        href = attr.get("href", "").strip()
        if href and any(r in rel.lower() for r in ("icon", "shortcut")):
            self.icon_url = href


# ── SSL context that tolerates self-signed certs ──────────────────────────────

_SSL_CTX = ssl.create_default_context()
_SSL_CTX.check_hostname = False
_SSL_CTX.verify_mode = ssl.CERT_NONE


def _opener():
    handler = urllib.request.HTTPSHandler(context=_SSL_CTX)
    return urllib.request.build_opener(handler)


OPENER = _opener()


def fetch_url(url: str, timeout: int = FETCH_TIMEOUT) -> bytes | None:
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "packlinx-icon-bot/1.0"})
        with OPENER.open(req, timeout=timeout) as r:
            return r.read()
    except Exception:
        return None


# ── robots.txt helpers ─────────────────────────────────────────────────────────

def check_robots_allowed(domain_url: str) -> bool:
    """Return False if /favicon.ico is disallowed for * in robots.txt."""
    robots_url = domain_url.rstrip("/") + "/robots.txt"
    rp = urllib.robotparser.RobotFileParser()
    rp.set_url(robots_url)
    try:
        rp.read()
    except Exception:
        return True  # no robots.txt → allowed
    return rp.can_fetch("*", domain_url.rstrip("/") + "/favicon.ico")


# ── Domain extraction ──────────────────────────────────────────────────────────

def domain_root(website: str) -> str:
    parsed = urllib.parse.urlparse(website)
    scheme = parsed.scheme or "https"
    netloc = parsed.netloc or parsed.path.split("/")[0]
    return f"{scheme}://{netloc}"


# ── Favicon fetch strategies ───────────────────────────────────────────────────

def try_favicon_ico(domain_root_url: str) -> bytes | None:
    return fetch_url(domain_root_url.rstrip("/") + "/favicon.ico")


def try_html_link(domain_root_url: str) -> bytes | None:
    html = fetch_url(domain_root_url)
    if not html:
        return None
    try:
        text = html.decode("utf-8", errors="replace")
    except Exception:
        return None
    parser = IconLinkParser()
    parser.feed(text[:8192])  # only parse <head>
    if not parser.icon_url:
        return None
    icon_href = parser.icon_url
    if icon_href.startswith("//"):
        icon_href = "https:" + icon_href
    elif icon_href.startswith("/"):
        icon_href = domain_root_url.rstrip("/") + icon_href
    elif not icon_href.startswith("http"):
        icon_href = domain_root_url.rstrip("/") + "/" + icon_href
    return fetch_url(icon_href)


def try_google_favicon(website: str) -> bytes | None:
    parsed = urllib.parse.urlparse(website)
    domain = parsed.netloc or parsed.path.split("/")[0]
    url = f"https://www.google.com/s2/favicons?domain={urllib.parse.quote(domain)}&sz=64"
    data = fetch_url(url)
    # Google returns a 16×16 grey placeholder for unknown domains — filter it out
    if data and len(data) < 200:
        return None
    return data


def is_valid_icon(data: bytes | None) -> bool:
    if not data or len(data) < 50:
        return False
    # Accept PNG, JPEG, GIF, WebP, ICO magic bytes
    magic = data[:8]
    if magic[:4] == b"\x00\x00\x01\x00":  # ICO
        return True
    if magic[:8] == b"\x89PNG\r\n\x1a\n":  # PNG
        return True
    if magic[:2] == b"\xff\xd8":  # JPEG
        return True
    if magic[:6] in (b"GIF87a", b"GIF89a"):  # GIF
        return True
    if magic[:4] == b"RIFF" and data[8:12] == b"WEBP":  # WebP
        return True
    return False


# ── Supabase REST helpers ──────────────────────────────────────────────────────

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


def get_companies(limit: int | None) -> list[dict]:
    params = "select=id,slug,website&website=not.is.null&icon_url=is.null&order=id"
    if limit:
        params += f"&limit={limit}"
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
        public_url = f"{SUPABASE_URL}/storage/v1/object/public/{BUCKET}/{company_id}.png"
        return public_url
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


# ── Main pipeline ──────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true", help="Fetch icons but do not write to DB/Storage")
    parser.add_argument("--limit", type=int, default=None, help="Max companies to process")
    args = parser.parse_args()

    companies = get_companies(args.limit)
    total = len(companies)
    print(f"Companies to process: {total}")

    success = 0
    skip_robots = 0
    skip_no_icon = 0
    errors = 0

    for i, company in enumerate(companies, 1):
        website = company["website"]
        cid = company["id"]
        slug = company["slug"]
        print(f"[{i}/{total}] {slug} ({website})")

        try:
            root = domain_root(website)

            # robots.txt check
            if not check_robots_allowed(root):
                print("  → skip: robots.txt disallows /favicon.ico")
                skip_robots += 1
                time.sleep(REQUEST_DELAY)
                continue

            # Strategy 1: favicon.ico
            icon_data = try_favicon_ico(root)
            if is_valid_icon(icon_data):
                print("  → favicon.ico ✓")
            else:
                # Strategy 2: <link rel="icon"> in HTML
                icon_data = try_html_link(root)
                if is_valid_icon(icon_data):
                    print("  → HTML <link rel=icon> ✓")
                else:
                    # Strategy 3: Google Favicon API
                    icon_data = try_google_favicon(website)
                    if is_valid_icon(icon_data):
                        print("  → Google Favicon API ✓")
                    else:
                        print("  → skip: no valid icon found")
                        skip_no_icon += 1
                        time.sleep(REQUEST_DELAY)
                        continue

            if args.dry_run:
                print(f"  [DRY-RUN] would upload {len(icon_data)} bytes and update DB")
                success += 1
            else:
                public_url = upload_icon(cid, icon_data)
                if not public_url:
                    print("  → error: storage upload failed")
                    errors += 1
                elif not update_company_icon(cid, public_url):
                    print("  → error: DB update failed")
                    errors += 1
                else:
                    print(f"  → saved: {public_url}")
                    success += 1

        except Exception as exc:
            print(f"  → error: {exc}")
            errors += 1

        time.sleep(REQUEST_DELAY)

    print(f"\n{'[DRY-RUN] ' if args.dry_run else ''}Results:")
    print(f"  Success  : {success}")
    print(f"  Skip (robots): {skip_robots}")
    print(f"  Skip (no icon): {skip_no_icon}")
    print(f"  Errors   : {errors}")
    print(f"  Total    : {total}")


if __name__ == "__main__":
    main()
