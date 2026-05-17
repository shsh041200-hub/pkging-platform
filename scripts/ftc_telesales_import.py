#!/usr/bin/env python3
"""
PACAA-785: 공정위 통신판매업 신고 데이터 import pipeline
  - 공공데이터포털 API (15098445) 또는 Excel 파일 → ftc_telesales_registry upsert
  - 월 1회 cron 실행 권장 (routine trigger 별도)

Usage:
  python3 ftc_telesales_import.py               # dry-run (API 호출, DB 미저장)
  python3 ftc_telesales_import.py --apply       # DB 저장
  python3 ftc_telesales_import.py --file <xlsx> # Excel 파일에서 import (API 대신)

Environment:
  SUPABASE_URL          Supabase REST endpoint
  SUPABASE_SERVICE_KEY  Service role key
  FTC_API_KEY           공공데이터포털 서비스키 (API 모드 시 필요)
  FTC_API_BASE          default: https://api.odcloud.kr/api/15070068/v1

Prerequisites:
  supabase/migrations/20260517001_brn_cross_validation.sql applied (ftc_telesales_registry)
"""

import os
import sys
import json
import logging
import re
import time
import uuid
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
# 공정위 통신판매업자 API — data.go.kr 기관명: 공정거래위원회
# API ID: 15070068 (통신판매사업자 등록 현황)
FTC_API_KEY = os.getenv("FTC_API_KEY", "")
FTC_API_BASE = os.getenv("FTC_API_BASE", "https://api.odcloud.kr/api/15070068/v1")
FTC_PAGE_SIZE = 1000
RATE_LIMIT_SLEEP = 0.3

DRY_RUN = "--apply" not in sys.argv
FILE_MODE = None
for i, arg in enumerate(sys.argv):
    if arg == "--file" and i + 1 < len(sys.argv):
        FILE_MODE = sys.argv[i + 1]

BATCH_ID = f"ftc_{datetime.now(timezone.utc).strftime('%Y%m%d_%H%M%S')}"

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
BRN_HYPHEN_RE = re.compile(r"(\d{3})-(\d{2})-(\d{5})")
BRN_DIGITS_RE = re.compile(r"\d{10}")


def normalise_brn(raw: str) -> Optional[str]:
    if not raw:
        return None
    cleaned = str(raw).replace("-", "").strip()
    if BRN_DIGITS_RE.fullmatch(cleaned):
        return cleaned
    m = BRN_HYPHEN_RE.search(str(raw))
    if m:
        return m.group(1) + m.group(2) + m.group(3)
    return None


# ── Supabase helpers ────────────────────────────────────────────────────────────

def sb_upsert_batch(rows: list) -> None:
    if DRY_RUN:
        return
    for i in range(0, len(rows), 500):
        batch = rows[i:i + 500]
        r = requests.post(
            f"{SUPABASE_URL}/rest/v1/ftc_telesales_registry",
            headers={**HEADERS, "Prefer": "resolution=merge-duplicates,return=minimal"},
            json=batch,
            timeout=60,
        )
        r.raise_for_status()


# ── FTC API fetch ──────────────────────────────────────────────────────────────

def fetch_ftc_api_page(page: int) -> dict:
    params = {
        "serviceKey": FTC_API_KEY,
        "page": page,
        "perPage": FTC_PAGE_SIZE,
    }
    r = requests.get(f"{FTC_API_BASE}/uddi:4a84cc2c-89f1-44ff-a75c-d4ea21044c48",
                     params=params, timeout=60)
    r.raise_for_status()
    return r.json()


def fetch_all_ftc_api() -> list[dict]:
    log.info("공정위 API 전체 fetch 시작...")
    page = 1
    total_rows = []
    while True:
        log.info("  page %d 처리 중...", page)
        data = fetch_ftc_api_page(page)
        rows = data.get("data", [])
        if not rows:
            break
        total_rows.extend(rows)
        if len(rows) < FTC_PAGE_SIZE:
            break
        page += 1
        time.sleep(RATE_LIMIT_SLEEP)
    log.info("공정위 API 총 %d건 수집", len(total_rows))
    return total_rows


def parse_ftc_row(raw_row: dict) -> Optional[dict]:
    """공정위 API 응답 행 → ftc_telesales_registry row 변환."""
    # 컬럼명은 공정위 API 실제 필드명에 따라 조정 필요
    brn_raw = raw_row.get("사업자등록번호") or raw_row.get("business_registration_number") or ""
    brn = normalise_brn(brn_raw)
    if not brn:
        return None

    business_name = (
        raw_row.get("상호명") or raw_row.get("쇼핑몰명") or raw_row.get("업체명") or ""
    ).strip()
    if not business_name:
        return None

    reg_no = (raw_row.get("신고번호") or raw_row.get("registration_number") or "").strip() or None

    status_raw = (raw_row.get("영업상태") or raw_row.get("상태") or "active").strip()
    if "폐업" in status_raw or "말소" in status_raw:
        status = "cancelled"
    elif "휴업" in status_raw or "정지" in status_raw:
        status = "suspended"
    else:
        status = "active"

    registered_at_raw = raw_row.get("신고일자") or raw_row.get("등록일") or None
    registered_at = None
    if registered_at_raw:
        try:
            registered_at = str(registered_at_raw)[:10]
        except Exception:
            pass

    # PIPA §15: 대표자명은 raw_payload에만 저장, representative_name 컬럼에는 저장 안 함
    safe_raw = {k: v for k, v in raw_row.items() if "대표자" not in str(k) and "연락처" not in str(k)}

    return {
        "business_registration_number": brn,
        "registration_number": reg_no,
        "business_name": business_name,
        "representative_name": None,  # PIPA — 미저장
        "status": status,
        "address": (raw_row.get("주소") or raw_row.get("소재지") or "").strip() or None,
        "registered_at": registered_at,
        "import_batch_id": BATCH_ID,
        "raw_payload": safe_raw,
    }


# ── Excel file mode ────────────────────────────────────────────────────────────

def fetch_from_excel(file_path: str) -> list[dict]:
    try:
        import openpyxl
    except ImportError:
        log.error("openpyxl 필요: pip install openpyxl")
        sys.exit(1)

    wb = openpyxl.load_workbook(file_path, read_only=True, data_only=True)
    ws = wb.active
    rows = list(ws.iter_rows(values_only=True))
    if not rows:
        return []

    headers = [str(h).strip() for h in rows[0]]
    data = []
    for row in rows[1:]:
        raw = dict(zip(headers, row))
        data.append(raw)
    wb.close()
    log.info("Excel에서 %d행 로드 (헤더 제외)", len(data))
    return data


# ── Main ────────────────────────────────────────────────────────────────────────

def run() -> None:
    if not DRY_RUN and not FTC_API_KEY and not FILE_MODE:
        log.error("FTC_API_KEY 또는 --file <xlsx> 필요")
        sys.exit(1)

    # 데이터 수집
    if FILE_MODE:
        raw_rows = fetch_from_excel(FILE_MODE)
    elif DRY_RUN and not FTC_API_KEY:
        log.info("[DRY-RUN] API 키 없음 — 샘플 3건으로 로직 검증")
        raw_rows = [
            {"사업자등록번호": "123-45-67890", "상호명": "테스트 포장", "신고번호": "2024-서울강남-00001",
             "영업상태": "정상", "주소": "서울시 강남구", "신고일자": "2024-01-15"},
            {"사업자등록번호": "234-56-78901", "상호명": "박스마트", "신고번호": "2024-경기-00002",
             "영업상태": "폐업", "주소": "경기도 성남시", "신고일자": "2023-06-01"},
            {"사업자등록번호": "invalid_brn",  "상호명": "BRN오류업체", "신고번호": None,
             "영업상태": "정상", "주소": "부산시", "신고일자": None},
        ]
    else:
        raw_rows = fetch_all_ftc_api()

    # 파싱 + 검증
    parsed = []
    skipped = 0
    for row in raw_rows:
        result = parse_ftc_row(row)
        if result:
            parsed.append(result)
        else:
            skipped += 1

    log.info("파싱 결과: %d건 유효 / %d건 건너뜀 (BRN 오류/이름 없음)", len(parsed), skipped)

    # 상태별 통계
    from collections import Counter
    status_counts = Counter(r["status"] for r in parsed)
    log.info("상태별: %s", dict(status_counts))

    # DB upsert
    if parsed:
        sb_upsert_batch(parsed)
        log.info("%s %d건 ftc_telesales_registry 저장",
                 "[DRY-RUN]" if DRY_RUN else "[APPLIED]", len(parsed))

    print(f"\n{'='*60}")
    print(f"FTC telesales import {'DRY-RUN' if DRY_RUN else 'APPLIED'}")
    print(f"  총 수집: {len(raw_rows)}건")
    print(f"  저장: {len(parsed)}건  |  건너뜀: {skipped}건")
    print(f"  active: {status_counts.get('active', 0)}")
    print(f"  cancelled/suspended: {status_counts.get('cancelled', 0) + status_counts.get('suspended', 0)}")
    print(f"  batch_id: {BATCH_ID}")
    print(f"{'='*60}")


if __name__ == "__main__":
    run()
