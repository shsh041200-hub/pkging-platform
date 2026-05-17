#!/usr/bin/env python3
"""
PACAA-785: 공정위 통신판매업 신고 데이터 import pipeline
  API: 행정안전부 공통 게이트웨이 (apis.data.go.kr/1130000/MllBs_2Service)
  CEO 라이브 검증 2026-05-17 — PACAA-790 closeout 인풋 반영

Operations:
  /getMllBsInfo_2          → 전체 목록 bulk import (pageNo + numOfRows)
  /getMllBsBiznoInfo_2     → BRN별 조회 (cross-validation 핵심)
  총 2,609,017건 (2026-05-17 기준)

Response schema (확정):
  brno        → business_registration_number
  bzmnNm      → business_name
  prmmiMnno   → registration_number (통신판매업 신고번호)
  operSttusCdNm → status 원문 ("정상영업" | "폐업" 등)
  lctnAddr/rnAddr → address
  dclrDate    → registered_at (YYYYMMDD)
  rprsvNm, rprsvEmladr → 마스킹 제공, PIPA §15 — 저장 안 함

Usage:
  python3 ftc_telesales_import.py                 # dry-run (샘플 3건)
  python3 ftc_telesales_import.py --apply         # 전체 bulk import to DB
  python3 ftc_telesales_import.py --probe         # API 연결 확인 + 첫 행 출력
  python3 ftc_telesales_import.py --brn-lookup <BRN>  # BRN 단건 조회
  python3 ftc_telesales_import.py --file <xlsx>   # Excel 파일 import

Environment:
  SUPABASE_URL, SUPABASE_SERVICE_KEY
  FTC_API_KEY   data.go.kr 공통 서비스키 (NTS_API_KEY 와 동일)
  FTC_API_BASE  default: https://apis.data.go.kr/1130000/MllBs_2Service

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
# data.go.kr 공통 서비스키 — NTS_API_KEY 와 동일 (CEO 확인 2026-05-17)
FTC_API_KEY = os.getenv("FTC_API_KEY", "") or os.getenv("NTS_API_KEY", "")
# 행정안전부 게이트웨이 (odcloud 아님 — PACAA-790 CEO 라이브 검증)
FTC_API_BASE = os.getenv("FTC_API_BASE", "https://apis.data.go.kr/1130000/MllBs_2Service")
FTC_PAGE_SIZE = 1000
RATE_LIMIT_SLEEP = 0.2  # 일일 트래픽 10,000 — 페이지당 0.2초

DRY_RUN = "--apply" not in sys.argv
PROBE_MODE = "--probe" in sys.argv
BRN_LOOKUP = None
FILE_MODE = None
for i, arg in enumerate(sys.argv):
    if arg == "--brn-lookup" and i + 1 < len(sys.argv):
        BRN_LOOKUP = sys.argv[i + 1]
    if arg == "--file" and i + 1 < len(sys.argv):
        FILE_MODE = sys.argv[i + 1]

BATCH_ID = f"ftc_{datetime.now(timezone.utc).strftime('%Y%m%d_%H%M%S')}"

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.StreamHandler()],
)
log = logging.getLogger(__name__)

SB_HEADERS = {
    "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
    "apikey": SUPABASE_SERVICE_KEY,
    "Content-Type": "application/json",
}

# ── BRN normalisation ──────────────────────────────────────────────────────────
BRN_HYPHEN_RE = re.compile(r"(\d{3})-(\d{2})-(\d{5})")
BRN_DIGITS_RE = re.compile(r"\d{10}")


def normalise_brn(raw) -> Optional[str]:
    if not raw:
        return None
    cleaned = str(raw).replace("-", "").strip()
    if BRN_DIGITS_RE.fullmatch(cleaned):
        return cleaned
    m = BRN_HYPHEN_RE.search(str(raw))
    if m:
        return m.group(1) + m.group(2) + m.group(3)
    return None


# ── 공정위 API helpers ─────────────────────────────────────────────────────────

def ftc_get(operation: str, extra_params: dict, timeout: int = 30) -> dict:
    """행정안전부 게이트웨이 GET 요청."""
    url = f"{FTC_API_BASE}/{operation}"
    params = {"serviceKey": FTC_API_KEY, "resultType": "json", **extra_params}
    r = requests.get(url, params=params, timeout=timeout)
    r.raise_for_status()
    return r.json()


def _extract_items(data: dict) -> list[dict]:
    """응답에서 items 추출 (dict 단건 → list 자동 변환)."""
    items = data.get("items") or []
    if isinstance(items, dict):
        items = [items]
    return items


def ftc_get_total_count() -> int:
    data = ftc_get("getMllBsInfo_2", {"pageNo": 1, "numOfRows": 1})
    return int(data.get("totalCount", 0))


def ftc_fetch_page(page_no: int, num_rows: int = FTC_PAGE_SIZE) -> list[dict]:
    """getMllBsInfo_2 — 전체 목록 bulk fetch."""
    data = ftc_get("getMllBsInfo_2", {"pageNo": page_no, "numOfRows": num_rows})
    return _extract_items(data)


def ftc_lookup_by_brn(brn: str) -> Optional[dict]:
    """getMllBsBiznoInfo_2 — BRN별 단건 조회. 미등록 시 None."""
    try:
        data = ftc_get("getMllBsBiznoInfo_2", {"brno": brn})
        items = _extract_items(data)
        return items[0] if items else None
    except Exception as e:
        log.debug("FTC BRN lookup 실패 brn=%s: %s", brn, e)
        return None


# ── 응답 행 → DB row 변환 ──────────────────────────────────────────────────────
# 확정 필드 매핑 (CEO 라이브 검증):
#   brno        → business_registration_number
#   bzmnNm      → business_name
#   prmmiMnno   → registration_number
#   operSttusCdNm → status source
#   lctnAddr/rnAddr → address
#   dclrDate    → registered_at (YYYYMMDD → YYYY-MM-DD)
#   rprsvNm, rprsvEmladr, chrgDeptTelno → PII, raw_payload 제외

PII_KEYS = frozenset({"rprsvNm", "rprsvEmladr", "chrgDeptTelno"})


def api_item_to_row(item: dict) -> Optional[dict]:
    brn = normalise_brn(item.get("brno", ""))
    if not brn:
        return None

    business_name = (item.get("bzmnNm") or "").strip()
    if not business_name:
        return None

    reg_no = (item.get("prmmiMnno") or "").strip() or None

    status_raw = (item.get("operSttusCdNm") or "정상영업").strip()
    if any(k in status_raw for k in ("폐업", "말소", "취소")):
        status = "cancelled"
    elif any(k in status_raw for k in ("휴업", "정지")):
        status = "suspended"
    else:
        status = "active"

    address = (item.get("lctnAddr") or item.get("rnAddr") or "").strip() or None

    raw_date = str(item.get("dclrDate") or "").strip()
    registered_at = (
        f"{raw_date[:4]}-{raw_date[4:6]}-{raw_date[6:8]}" if len(raw_date) == 8 else None
    )

    safe_raw = {k: v for k, v in item.items() if k not in PII_KEYS}

    return {
        "business_registration_number": brn,
        "registration_number": reg_no,
        "business_name": business_name,
        "representative_name": None,  # PIPA §15 — 마스킹 제공이나 미저장
        "status": status,
        "address": address,
        "registered_at": registered_at,
        "import_batch_id": BATCH_ID,
        "raw_payload": safe_raw,
    }


# ── Supabase upsert ────────────────────────────────────────────────────────────

def sb_upsert_batch(rows: list) -> None:
    if DRY_RUN:
        return
    for i in range(0, len(rows), 500):
        r = requests.post(
            f"{SUPABASE_URL}/rest/v1/ftc_telesales_registry",
            headers={**SB_HEADERS, "Prefer": "resolution=merge-duplicates,return=minimal"},
            json=rows[i:i + 500],
            timeout=60,
        )
        r.raise_for_status()


# ── Excel file mode ────────────────────────────────────────────────────────────

def fetch_from_excel(file_path: str) -> list[dict]:
    try:
        import openpyxl
    except ImportError:
        log.error("pip install openpyxl 필요")
        sys.exit(1)
    wb = openpyxl.load_workbook(file_path, read_only=True, data_only=True)
    ws = wb.active
    rows = list(ws.iter_rows(values_only=True))
    if not rows:
        return []
    headers = [str(h).strip() for h in rows[0]]
    data = [dict(zip(headers, row)) for row in rows[1:]]
    wb.close()
    log.info("Excel %d행 로드", len(data))
    return data


# ── Excel row → DB row (공정위 Excel 필드명 별도 매핑) ─────────────────────────

def excel_item_to_row(item: dict) -> Optional[dict]:
    """Excel 다운로드 행 변환 — API 필드명과 다를 수 있어 별도 파서."""
    for brn_key in ("사업자등록번호", "사업자 등록번호", "brno"):
        if item.get(brn_key):
            brn = normalise_brn(item[brn_key])
            if brn:
                break
    else:
        return None

    business_name = ""
    for nm_key in ("상호명", "상호", "쇼핑몰명", "업체명", "bzmnNm"):
        if item.get(nm_key):
            business_name = str(item[nm_key]).strip()
            break
    if not business_name:
        return None

    reg_no = None
    for reg_key in ("신고번호", "통신판매업신고번호", "prmmiMnno"):
        if item.get(reg_key):
            reg_no = str(item[reg_key]).strip() or None
            break

    status_raw = str(item.get("영업상태") or item.get("operSttusCdNm") or "정상영업").strip()
    if any(k in status_raw for k in ("폐업", "말소", "취소")):
        status = "cancelled"
    elif any(k in status_raw for k in ("휴업", "정지")):
        status = "suspended"
    else:
        status = "active"

    address = str(item.get("주소") or item.get("소재지") or item.get("lctnAddr") or "").strip() or None

    raw_date = str(item.get("신고일자") or item.get("dclrDate") or "").strip().replace("-", "").replace("/", "")
    registered_at = (
        f"{raw_date[:4]}-{raw_date[4:6]}-{raw_date[6:8]}" if len(raw_date) == 8 else None
    )

    PII_EXCEL = {"대표자", "대표자명", "연락처", "전화번호", "이메일"}
    safe_raw = {k: v for k, v in item.items() if not any(p in str(k) for p in PII_EXCEL)}

    return {
        "business_registration_number": brn,
        "registration_number": reg_no,
        "business_name": business_name,
        "representative_name": None,
        "status": status,
        "address": address,
        "registered_at": registered_at,
        "import_batch_id": BATCH_ID,
        "raw_payload": safe_raw,
    }


# ── Main ────────────────────────────────────────────────────────────────────────

def run() -> None:
    # --probe: API 연결 확인 + 첫 행 schema 출력
    if PROBE_MODE:
        if not FTC_API_KEY:
            log.error("FTC_API_KEY (또는 NTS_API_KEY) 필요")
            sys.exit(1)
        total = ftc_get_total_count()
        items = ftc_fetch_page(1, 3)
        print(f"API 연결 OK  |  총 건수: {total:,}")
        if items:
            print("응답 키:", list(items[0].keys()))
            print("첫 행:", json.dumps(items[0], ensure_ascii=False, indent=2)[:600])
        return

    # --brn-lookup: 단건 BRN 조회
    if BRN_LOOKUP:
        if not FTC_API_KEY:
            log.error("FTC_API_KEY 필요")
            sys.exit(1)
        brn = normalise_brn(BRN_LOOKUP)
        if not brn:
            log.error("유효하지 않은 BRN: %s", BRN_LOOKUP)
            sys.exit(1)
        result = ftc_lookup_by_brn(brn)
        if result:
            print(json.dumps(result, ensure_ascii=False, indent=2))
        else:
            print(f"BRN {brn}: 공정위 통신판매업 미등록")
        return

    # bulk import
    if not DRY_RUN and not FTC_API_KEY and not FILE_MODE:
        log.error("FTC_API_KEY 또는 --file <xlsx> 필요")
        sys.exit(1)

    if FILE_MODE:
        raw_items = fetch_from_excel(FILE_MODE)
        converter = excel_item_to_row
    elif DRY_RUN and not FTC_API_KEY:
        log.info("[DRY-RUN] 키 없음 — 내부 샘플 3건으로 파싱 로직 검증")
        raw_items = [
            {"brno": "1208147521", "bzmnNm": "주식회사카카오", "prmmiMnno": "2015-제주아라-0032",
             "operSttusCdNm": "정상영업", "lctnAddr": "제주특별자치도 제주시", "dclrDate": "20120418"},
            {"brno": "2348100695", "bzmnNm": "테스트포장", "prmmiMnno": "2024-서울강남-00001",
             "operSttusCdNm": "폐업", "lctnAddr": "서울시 강남구", "dclrDate": "20240101"},
            {"brno": "invalid_brn", "bzmnNm": "BRN오류", "operSttusCdNm": "정상영업"},
        ]
        converter = api_item_to_row
    else:
        total = ftc_get_total_count()
        log.info("공정위 총 %s건. 일일 한도 10,000 — 페이지당 %.1fs", f"{total:,}", RATE_LIMIT_SLEEP)
        raw_items = []
        total_pages = (total + FTC_PAGE_SIZE - 1) // FTC_PAGE_SIZE
        for page_no in range(1, total_pages + 1):
            if page_no % 50 == 0:
                log.info("  %d/%d 페이지 (%d건)...", page_no, total_pages, len(raw_items))
            items = ftc_fetch_page(page_no)
            raw_items.extend(items)
            if len(items) < FTC_PAGE_SIZE:
                break
            time.sleep(RATE_LIMIT_SLEEP)
        converter = api_item_to_row

    parsed = []
    skipped = 0
    for item in raw_items:
        row = converter(item)
        if row:
            parsed.append(row)
        else:
            skipped += 1

    log.info("파싱: %d건 유효 / %d건 건너뜀 (BRN 없음/상호 없음)", len(parsed), skipped)

    from collections import Counter
    status_counts = Counter(r["status"] for r in parsed)

    if parsed:
        sb_upsert_batch(parsed)
        log.info("%s %d건 ftc_telesales_registry 저장",
                 "[DRY-RUN]" if DRY_RUN else "[APPLIED]", len(parsed))

    print(f"\n{'='*60}")
    print(f"FTC telesales import {'DRY-RUN' if DRY_RUN else 'APPLIED'}")
    print(f"  수집: {len(raw_items)}건  |  저장: {len(parsed)}건  |  건너뜀: {skipped}건")
    print(f"  active: {status_counts.get('active', 0)}")
    print(f"  cancelled/suspended: {status_counts.get('cancelled', 0) + status_counts.get('suspended', 0)}")
    print(f"  batch_id: {BATCH_ID}")
    print(f"{'='*60}")


if __name__ == "__main__":
    run()
