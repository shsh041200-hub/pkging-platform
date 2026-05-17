#!/usr/bin/env python3
"""
PACAA-785: BRN cross-validation pipeline
  1. 국세청 사업자등록정보 진위확인 API (공공데이터포털) → vendor_brn_checks 갱신
  2. 주소/웹사이트 cross-match → vendor_brn_checks.address_match / cross_validation_failed
  3. 공정위 ftc_telesales_registry 교차 확인 → cross_source_count 증가

Usage:
  python3 brn_check_pipeline.py               # dry-run (no DB writes)
  python3 brn_check_pipeline.py --apply       # write to DB
  python3 brn_check_pipeline.py --limit 50    # process at most 50 vendors

Environment:
  SUPABASE_URL          Supabase REST endpoint
  SUPABASE_SERVICE_KEY  Service role key
  NTS_API_KEY           공공데이터포털 국세청 서비스키 (required for --apply)
  NTS_API_BASE          default: https://api.odcloud.kr/api/nts-businessman/v1

Prerequisites:
  supabase/migrations/20260517001_brn_cross_validation.sql applied
"""

import os
import sys
import json
import logging
import re
import time
from datetime import datetime, timezone
from typing import Optional

import requests

# ── Config ─────────────────────────────────────────────────────────────────────
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://jnrciibwtutzymkoepfp.supabase.co")
SUPABASE_SERVICE_KEY = os.getenv(
    "SUPABASE_SERVICE_KEY",
    (
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6"
        "ImpucmNpaWJ3dHV0enlta29lcGZwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MT"
        "c3NjU2NTI2OCwiZXhwIjoyMDkyMTQxMjY4fQ.uVBSdXbxzUbhNKTOaYaiOk2r2etCFnNR"
        "8tQ0z1mhJxg"
    ),
)
NTS_API_KEY = os.getenv("NTS_API_KEY", "") or os.getenv("FTC_API_KEY", "")
NTS_API_BASE = os.getenv("NTS_API_BASE", "https://api.odcloud.kr/api/nts-businessman/v1")
NTS_BATCH_SIZE = 10  # API 최대 배치 크기
RATE_LIMIT_SLEEP = 0.5  # 초 단위 (API 제한: 초당 10건)

# 공정위 BRN별 조회 (CEO 라이브 검증 2026-05-17 — PACAA-790)
FTC_API_KEY = os.getenv("FTC_API_KEY", "") or NTS_API_KEY
FTC_API_BASE = os.getenv("FTC_API_BASE", "https://apis.data.go.kr/1130000/MllBs_2Service")

DRY_RUN = "--apply" not in sys.argv
LIMIT = None
for i, arg in enumerate(sys.argv):
    if arg == "--limit" and i + 1 < len(sys.argv):
        LIMIT = int(sys.argv[i + 1])

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.StreamHandler()],
)
log = logging.getLogger(__name__)

HEADERS = {
    "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
    "apikey": SUPABASE_SERVICE_KEY,
    "Content-Type": "application/json",
}

# ── BRN normalisation ──────────────────────────────────────────────────────────
BRN_DIGITS_RE = re.compile(r"\d{10}")
BRN_HYPHEN_RE = re.compile(r"(\d{3})-(\d{2})-(\d{5})")


def normalise_brn(raw: str) -> Optional[str]:
    """Return BRN as 10-digit string (no hyphens), or None if invalid."""
    if not raw:
        return None
    cleaned = raw.replace("-", "").strip()
    if BRN_DIGITS_RE.fullmatch(cleaned):
        return cleaned
    m = BRN_HYPHEN_RE.search(raw)
    if m:
        return m.group(1) + m.group(2) + m.group(3)
    return None


# ── Supabase helpers ────────────────────────────────────────────────────────────

def sb_get(path: str, params: dict = None) -> list:
    r = requests.get(f"{SUPABASE_URL}/rest/v1/{path}", headers=HEADERS, params=params, timeout=30)
    r.raise_for_status()
    return r.json()


def sb_upsert(table: str, rows: list) -> None:
    if DRY_RUN:
        log.info("[DRY-RUN] UPSERT %s (%d rows)", table, len(rows))
        return
    r = requests.post(
        f"{SUPABASE_URL}/rest/v1/{table}",
        headers={**HEADERS, "Prefer": "resolution=merge-duplicates"},
        json=rows,
        timeout=30,
    )
    r.raise_for_status()


def sb_patch(table: str, filters: dict, payload: dict) -> None:
    if DRY_RUN:
        log.info("[DRY-RUN] PATCH %s filters=%s payload=%s", table, filters, payload)
        return
    params = {k: f"eq.{v}" for k, v in filters.items()}
    r = requests.patch(
        f"{SUPABASE_URL}/rest/v1/{table}",
        headers=HEADERS,
        params=params,
        json=payload,
        timeout=30,
    )
    r.raise_for_status()


# ── 국세청 API ─────────────────────────────────────────────────────────────────

def nts_validate_batch(brn_list: list[str]) -> dict[str, dict]:
    """
    POST to 국세청 사업자등록정보 진위확인 API.
    Returns dict keyed by BRN → {valid, status, valid_msg, ...}
    """
    if not NTS_API_KEY:
        raise RuntimeError("NTS_API_KEY not set — cannot call 국세청 API")

    payload = {"businesses": [{"b_no": b} for b in brn_list]}
    url = f"{NTS_API_BASE}/validate"
    params = {"serviceKey": NTS_API_KEY}

    resp = requests.post(url, json=payload, params=params, timeout=30)
    resp.raise_for_status()
    data = resp.json()

    result = {}
    for item in data.get("data", []):
        b_no = item.get("b_no", "").replace("-", "")
        valid = item.get("valid", "02")
        tax_type = item.get("tax_type", "")
        b_stt = item.get("b_stt", "")  # 사업자 상태 (계속사업자/휴업자/폐업자)
        b_stt_cd = item.get("b_stt_cd", "")  # 상태 코드

        # 상태 코드 매핑
        if valid == "01":
            if b_stt_cd in ("01",):
                status = "active"       # 계속사업자
            elif b_stt_cd in ("02",):
                status = "suspended"    # 휴업자
            elif b_stt_cd in ("03",):
                status = "closed"       # 폐업자
            else:
                status = "active"
        else:
            status = "cancelled"        # 유효하지 않은 번호

        result[b_no] = {
            "valid": valid,
            "status": status,
            "b_stt": b_stt,
            "b_stt_cd": b_stt_cd,
            "tax_type": tax_type,
            "raw": item,
        }
    return result


# ── Address match ──────────────────────────────────────────────────────────────

def address_tokens(addr: str) -> set[str]:
    """분해 주소 토큰 (도/시/구/동 단위 비교용)."""
    if not addr:
        return set()
    tokens = set(re.split(r"[\s,\-]+", addr.strip()))
    tokens.discard("")
    return tokens


def match_addresses(db_addr: Optional[str], api_addr: Optional[str]) -> Optional[bool]:
    """두 주소의 토큰 교집합 비율 >= 0.5 이면 True."""
    if not db_addr or not api_addr:
        return None
    t1 = address_tokens(db_addr)
    t2 = address_tokens(api_addr)
    if not t1 or not t2:
        return None
    overlap = len(t1 & t2) / max(len(t1), len(t2))
    return overlap >= 0.5


# ── FTC cross-check ────────────────────────────────────────────────────────────
# 1순위: ftc_telesales_registry DB lookup (bulk import 완료 후)
# 2순위: 공정위 API 직접 조회 (DB에 없을 때 fallback)

def ftc_lookup_db(brn: str) -> bool:
    """ftc_telesales_registry DB에서 활성 레코드 확인."""
    rows = sb_get(
        "ftc_telesales_registry",
        {"select": "id", "business_registration_number": f"eq.{brn}", "status": "eq.active", "limit": "1"},
    )
    return len(rows) > 0


def ftc_lookup_api(brn: str) -> bool:
    """공정위 API getMllBsBiznoInfo_2 직접 조회 (DB fallback)."""
    if not FTC_API_KEY:
        return False
    try:
        url = f"{FTC_API_BASE}/getMllBsBiznoInfo_2"
        r = requests.get(url,
                         params={"serviceKey": FTC_API_KEY, "brno": brn, "resultType": "json"},
                         timeout=15)
        if r.status_code != 200:
            return False
        data = r.json()
        items = data.get("items") or []
        if isinstance(items, dict):
            items = [items]
        if not items:
            return False
        status_raw = str(items[0].get("operSttusCdNm") or "").strip()
        return not any(k in status_raw for k in ("폐업", "말소", "취소", "휴업", "정지"))
    except Exception as e:
        log.debug("FTC API lookup 실패 brn=%s: %s", brn, e)
        return False


def ftc_lookup(brn: str) -> bool:
    """DB 먼저 확인; 없으면 API fallback."""
    if ftc_lookup_db(brn):
        return True
    return ftc_lookup_api(brn)


# ── Main pipeline ──────────────────────────────────────────────────────────────

def fetch_vendors_with_brn() -> list[dict]:
    """business_registration_number가 있는 companies 목록 반환."""
    rows = []
    for offset in range(0, 50_000, 1000):
        batch = sb_get(
            "companies",
            {
                "select": "id,name,address,website,business_registration_number",
                "business_registration_number": "not.is.null",
                "is_hidden": "eq.false",
                "offset": str(offset),
                "limit": "1000",
            },
        )
        rows.extend(batch)
        if len(batch) < 1000:
            break
    return rows


def build_brn_check_row(
    vendor_id: str,
    brn: str,
    nts_result: dict,
    db_addr: Optional[str],
    ftc_found: bool,
) -> dict:
    address_match = match_addresses(db_addr, nts_result["raw"].get("addr", ""))
    cross_source_count = 1 + (1 if ftc_found else 0)  # 국세청=1, 공정위=+1

    # PIPA §15: raw_payload에서 PII 필드 제거
    safe_raw = {k: v for k, v in nts_result["raw"].items()
                if k not in ("representative_name", "ceo_nm")}

    return {
        "vendor_id": vendor_id,
        "status": nts_result["status"],
        "raw_name": nts_result["raw"].get("b_nm", None),
        "normalised_name": None,  # 매칭 후 별도 처리
        "name_match": None,
        "normalisation_rule_id": "nts_api_v1",
        "raw_payload": safe_raw,
        "address_match": address_match,
        "website_match": None,  # 별도 domain check 파이프라인 담당
        "cross_source_count": cross_source_count,
        "checked_at": datetime.now(timezone.utc).isoformat(),
    }


def run() -> None:
    if not DRY_RUN and not NTS_API_KEY:
        log.error("NTS_API_KEY 환경변수 없음 — --apply 사용하려면 서비스키 필요")
        sys.exit(1)

    vendors = fetch_vendors_with_brn()
    if LIMIT:
        vendors = vendors[:LIMIT]

    log.info("처리 대상: %d개 vendors (BRN 보유)", len(vendors))

    if not vendors:
        log.info("BRN이 있는 업체가 없습니다. 파이프라인 완료 (처리 0건)")
        return

    # BRN 정규화
    valid_vendors = []
    skipped = 0
    for v in vendors:
        brn_norm = normalise_brn(v["business_registration_number"])
        if brn_norm:
            v["_brn_norm"] = brn_norm
            valid_vendors.append(v)
        else:
            log.warning("유효하지 않은 BRN 형식: vendor=%s brn=%s", v["id"][:8], v["business_registration_number"])
            skipped += 1

    log.info("유효 BRN: %d개 / 건너뜀: %d개", len(valid_vendors), skipped)

    # 국세청 API 배치 처리
    stats = {"active": 0, "suspended": 0, "closed": 0, "cancelled": 0, "unknown": 0}
    check_rows = []

    for i in range(0, len(valid_vendors), NTS_BATCH_SIZE):
        batch = valid_vendors[i:i + NTS_BATCH_SIZE]
        brn_batch = [v["_brn_norm"] for v in batch]
        log.info("국세청 API 배치 %d-%d 처리 중...", i, i + len(batch))

        if DRY_RUN:
            nts_results = {b: {"valid": "01", "status": "active", "b_stt": "계속사업자",
                               "b_stt_cd": "01", "tax_type": "", "raw": {"b_nm": "테스트", "b_no": b}}
                           for b in brn_batch}
        else:
            nts_results = nts_validate_batch(brn_batch)
            time.sleep(RATE_LIMIT_SLEEP)

        for v in batch:
            brn = v["_brn_norm"]
            nts_res = nts_results.get(brn, {"valid": "02", "status": "unknown", "b_stt": "",
                                             "b_stt_cd": "", "tax_type": "", "raw": {}})
            ftc_found = ftc_lookup(brn) if not DRY_RUN else False
            row = build_brn_check_row(v["id"], brn, nts_res, v.get("address"), ftc_found)
            check_rows.append(row)
            stats[nts_res["status"]] = stats.get(nts_res["status"], 0) + 1

    log.info("BRN 검증 결과: %s", stats)

    # DB 저장 (vendor_brn_checks INSERT — 중복 방지는 application level)
    if check_rows:
        sb_upsert("vendor_brn_checks", check_rows)
        log.info("%s %d건 vendor_brn_checks 저장", "[DRY-RUN]" if DRY_RUN else "[APPLIED]", len(check_rows))

    # cross_validation_failed 업체 로그
    failed = [r for r in check_rows if r["status"] not in ("active",) or r.get("address_match") == False]
    log.info("cross_validation_failed 후보: %d건", len(failed))
    if failed:
        for r in failed[:10]:
            log.info("  vendor_id=%s status=%s addr_match=%s", r["vendor_id"][:8], r["status"], r["address_match"])

    print(f"\n{'='*60}")
    print(f"BRN check pipeline {'DRY-RUN' if DRY_RUN else 'APPLIED'}")
    print(f"  처리: {len(valid_vendors)}건")
    print(f"  active: {stats['active']}")
    print(f"  suspended/closed/cancelled: {stats['suspended']+stats['closed']+stats['cancelled']}")
    print(f"  cross_validation_failed 후보: {len(failed)}")
    print(f"{'='*60}")


if __name__ == "__main__":
    run()
