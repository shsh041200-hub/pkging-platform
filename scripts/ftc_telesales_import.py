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
# API ID: 15126311 (통신판매사업자 등록현황 제공 서비스, 활용신청 562건)
# 이전 15070068은 404 — 2026-05-17 CEO 보드 확인으로 15126311로 수정
FTC_API_KEY = os.getenv("FTC_API_KEY", "")
FTC_API_BASE = os.getenv("FTC_API_BASE", "https://api.odcloud.kr/api/15126311/v1")
# FTC_API_ENDPOINT_PATH: data.go.kr 활용가이드(15126311/openapi.do)에서 확인한 경로.
# 설정 없으면 자동 탐색(probe) 모드 실행.
FTC_API_ENDPOINT_PATH = os.getenv("FTC_API_ENDPOINT_PATH", "")
FTC_PAGE_SIZE = 1000
RATE_LIMIT_SLEEP = 0.3

DRY_RUN = "--apply" not in sys.argv
PROBE_MODE = "--probe" in sys.argv  # endpoint 탐색 후 schema 출력
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


# ── FTC API endpoint discovery ────────────────────────────────────────────────
# odcloud 15126311의 UDDI/경로는 data.go.kr 활용가이드에서만 확인 가능.
# FTC_API_ENDPOINT_PATH 설정 시 직접 사용; 미설정 시 알려진 패턴을 탐색.

_FTC_ENDPOINT_CACHE: str = ""

KNOWN_UDDI_CANDIDATES = [
    # 15126311 데이터셋에서 확인된 UDDI (활용가이드 기준, 보드 확인 필요)
    # FTC_API_ENDPOINT_PATH 환경변수로 주입하는 것이 권장
    "uddi:7f3038d2-f2e0-4793-a6cd-7ecf7f3c38dc",
    "uddi:4a84cc2c-89f1-44ff-a75c-d4ea21044c48",  # 이전 15070068 UDDI (혹시 재사용 가능성)
    "uddi:e38e4b66-d2af-4fe4-83ba-6e0b3bb1b0a0",
    "uddi:c7c28aad-be92-4a29-a4f7-9a8d41e82bc7",
]


def probe_ftc_endpoint() -> str:
    """FTC_API_ENDPOINT_PATH 미설정 시 알려진 UDDI를 탐색해 동작하는 경로 반환."""
    global _FTC_ENDPOINT_CACHE
    if _FTC_ENDPOINT_CACHE:
        return _FTC_ENDPOINT_CACHE

    if FTC_API_ENDPOINT_PATH:
        _FTC_ENDPOINT_CACHE = f"{FTC_API_BASE}/{FTC_API_ENDPOINT_PATH}"
        log.info("FTC endpoint (환경변수): %s", _FTC_ENDPOINT_CACHE)
        return _FTC_ENDPOINT_CACHE

    import urllib.parse
    key_enc = urllib.parse.quote(FTC_API_KEY, safe="")
    for uddi in KNOWN_UDDI_CANDIDATES:
        url = f"{FTC_API_BASE}/{uddi}"
        try:
            r = requests.get(url, params={"serviceKey": FTC_API_KEY, "page": 1, "perPage": 1}, timeout=15)
            if r.status_code == 200:
                _FTC_ENDPOINT_CACHE = url
                log.info("FTC endpoint 발견: %s", url)
                return url
            log.debug("  probe %s → %d", uddi, r.status_code)
        except Exception as e:
            log.debug("  probe %s error: %s", uddi, e)

    raise RuntimeError(
        "공정위 API 엔드포인트를 찾을 수 없습니다.\n"
        "data.go.kr/data/15126311/openapi.do 활용가이드에서 UDDI를 확인하고 "
        "FTC_API_ENDPOINT_PATH 환경변수에 설정하세요.\n"
        "예: FTC_API_ENDPOINT_PATH=uddi:xxxx-xxxx-xxxx"
    )


# ── FTC API fetch ──────────────────────────────────────────────────────────────

def fetch_ftc_api_page(page: int) -> dict:
    endpoint = probe_ftc_endpoint()
    r = requests.get(
        endpoint,
        params={"serviceKey": FTC_API_KEY, "page": page, "perPage": FTC_PAGE_SIZE},
        timeout=60,
    )
    r.raise_for_status()
    return r.json()


def fetch_all_ftc_api() -> list[dict]:
    log.info("공정위 API 전체 fetch 시작 (base: %s)...", FTC_API_BASE)
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


def _first(row: dict, *keys: str) -> str:
    """주어진 키 순서대로 첫 번째 비어있지 않은 값 반환."""
    for k in keys:
        v = row.get(k)
        if v is not None and str(v).strip():
            return str(v).strip()
    return ""


def parse_ftc_row(raw_row: dict) -> Optional[dict]:
    """공정위 API 응답 행 → ftc_telesales_registry row 변환.

    15126311 데이터셋 실제 필드명은 활용가이드 확인 필요.
    다중 필드명 후보로 유연하게 파싱 (15070068/15126311 양쪽 대응).
    """
    # BRN — 가장 중요한 키
    brn_raw = _first(
        raw_row,
        "사업자등록번호", "사업자 등록번호", "business_registration_number",
        "bsns_no", "businessNo",
    )
    brn = normalise_brn(brn_raw)
    if not brn:
        return None

    # 상호명
    business_name = _first(
        raw_row,
        "상호명", "상호", "쇼핑몰명", "업체명", "법인명", "사업자명",
        "business_name", "shopNm", "companyNm",
    )
    if not business_name:
        return None

    # 신고번호
    reg_no = _first(
        raw_row,
        "신고번호", "통신판매신고번호", "registration_number",
        "dclaraNo", "mailOrderNo",
    ) or None

    # 영업상태
    status_raw = _first(
        raw_row,
        "영업상태", "상태", "운영여부", "status", "bsnsSttusCd",
    )
    if "폐업" in status_raw or "말소" in status_raw or "취소" in status_raw:
        status = "cancelled"
    elif "휴업" in status_raw or "정지" in status_raw:
        status = "suspended"
    else:
        status = "active"

    # 신고일자
    registered_at_raw = _first(
        raw_row,
        "신고일자", "신고일", "등록일", "등록연월일",
        "dclaraDe", "registDt",
    )
    registered_at = None
    if registered_at_raw:
        try:
            registered_at = str(registered_at_raw)[:10].replace("/", "-")
        except Exception:
            pass

    # 주소
    address = _first(
        raw_row,
        "주소", "소재지", "사업장 주소", "소재지주소", "addr", "address",
    ) or None

    # PIPA §15: 대표자명·연락처·개인정보 필드 raw_payload에서 제거
    PII_FIELDS = {"대표자", "대표자명", "연락처", "전화번호", "휴대폰", "핸드폰", "이메일", "이메일주소"}
    safe_raw = {
        k: v for k, v in raw_row.items()
        if not any(pii in str(k) for pii in PII_FIELDS)
    }

    return {
        "business_registration_number": brn,
        "registration_number": reg_no,
        "business_name": business_name,
        "representative_name": None,  # PIPA — 미저장
        "status": status,
        "address": address,
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
    # --probe 모드: 엔드포인트 탐색 + 첫 행 schema 출력
    if PROBE_MODE:
        if not FTC_API_KEY:
            log.error("--probe 는 FTC_API_KEY 필요")
            sys.exit(1)
        try:
            endpoint = probe_ftc_endpoint()
            r = requests.get(endpoint, params={"serviceKey": FTC_API_KEY, "page": 1, "perPage": 3}, timeout=30)
            data = r.json()
            print(f"엔드포인트: {endpoint}")
            print(f"totalCount: {data.get('totalCount')}")
            if data.get("data"):
                import json
                print("첫 행 키:", list(data["data"][0].keys()))
                print("첫 행 샘플:", json.dumps(data["data"][0], ensure_ascii=False, indent=2)[:500])
        except Exception as e:
            print(f"probe 실패: {e}")
        return

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
