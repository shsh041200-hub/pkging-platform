#!/usr/bin/env python3
"""
Normalize company website URLs to root domain.
- Company-owned domains: strip path/query/fragment → scheme://host/
- Social media / directory platforms: keep as-is (path IS the identifier)
- Invalid URLs (e.g. http://전화): set to null
"""

import json
import os
import sys
from urllib.parse import urlparse

import requests

SUPABASE_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL") or os.environ.get("SUPABASE_URL")
SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SERVICE_KEY:
    print("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
    sys.exit(1)

HEADERS = {
    "apikey": SERVICE_KEY,
    "Authorization": f"Bearer {SERVICE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=minimal",
}

PLATFORM_DOMAINS = {
    "instagram.com", "www.instagram.com",
    "youtube.com", "www.youtube.com",
    "pf.kakao.com",
    "band.us", "www.band.us",
    "ok114.co.kr", "www.ok114.co.kr",
    "kppca.org", "www.kppca.org",
}

INVALID_PATTERNS = ["전화"]


def is_platform_url(parsed):
    host = parsed.netloc.lower()
    return host in PLATFORM_DOMAINS


def is_invalid_url(url):
    for pat in INVALID_PATTERNS:
        if pat in url:
            return True
    parsed = urlparse(url)
    if not parsed.scheme or parsed.scheme not in ("http", "https"):
        return True
    if not parsed.netloc or "." not in parsed.netloc:
        return True
    return False


def normalize_to_root(url):
    parsed = urlparse(url)
    return f"{parsed.scheme}://{parsed.netloc}/"


def needs_normalization(url):
    parsed = urlparse(url)
    return not (parsed.path in ("", "/") and not parsed.query and not parsed.fragment)


def fetch_companies():
    resp = requests.get(
        f"{SUPABASE_URL}/rest/v1/companies",
        params={"select": "id,name,website", "website": "not.is.null", "order": "name"},
        headers={"apikey": SERVICE_KEY, "Authorization": f"Bearer {SERVICE_KEY}"},
    )
    resp.raise_for_status()
    return resp.json()


def update_company(company_id, new_website):
    body = {"website": new_website}
    resp = requests.patch(
        f"{SUPABASE_URL}/rest/v1/companies?id=eq.{company_id}",
        headers=HEADERS,
        json=body,
    )
    resp.raise_for_status()


def main():
    dry_run = "--dry-run" in sys.argv
    companies = fetch_companies()
    print(f"Total companies with website: {len(companies)}")

    to_normalize = []
    to_nullify = []
    skipped_platform = []
    already_root = []

    for c in companies:
        url = c["website"]
        if is_invalid_url(url):
            to_nullify.append(c)
            continue

        parsed = urlparse(url)
        if is_platform_url(parsed):
            skipped_platform.append(c)
            continue

        if needs_normalization(url):
            to_normalize.append((c, normalize_to_root(url)))
        else:
            already_root.append(c)

    print(f"\nAlready root: {len(already_root)}")
    print(f"Will normalize to root: {len(to_normalize)}")
    print(f"Skipped (platform URLs, path is identifier): {len(skipped_platform)}")
    print(f"Will set to null (invalid): {len(to_nullify)}")

    if skipped_platform:
        print("\n--- Skipped platform URLs ---")
        for c in skipped_platform:
            print(f"  {c['name']}: {c['website']}")

    if to_nullify:
        print("\n--- Will nullify (invalid) ---")
        for c in to_nullify:
            print(f"  {c['name']}: {c['website']}")

    if to_normalize:
        print("\n--- Will normalize ---")
        for c, new_url in to_normalize:
            print(f"  {c['name']}: {c['website']} → {new_url}")

    if dry_run:
        print("\n[DRY RUN] No changes made.")
        return

    print("\n--- Applying changes ---")

    updated = 0
    nullified = 0

    for c, new_url in to_normalize:
        try:
            update_company(c["id"], new_url)
            updated += 1
            print(f"  ✓ Normalized: {c['name']}")
        except Exception as e:
            print(f"  ✗ FAILED {c['name']}: {e}")

    for c in to_nullify:
        try:
            update_company(c["id"], None)
            nullified += 1
            print(f"  ✓ Nullified: {c['name']}")
        except Exception as e:
            print(f"  ✗ FAILED {c['name']}: {e}")

    print(f"\nDone: {updated} normalized, {nullified} nullified, {len(skipped_platform)} skipped (platform)")


if __name__ == "__main__":
    main()
