-- PACAA-754 — vendor 이의제기 채널 schema (Legal SLA PACAA-750 spec)
-- Applied: 2026-05-16
-- Purpose: dispute submission audit trail (5-year retention) + classification change log.
-- Rollback: see rollback section at bottom.

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. vendor_classification_disputes — 이의제기 접수 + 처리 기록
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS vendor_classification_disputes (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- 접수번호 (사람이 읽을 수 있는 식별자): DISP-YYYYMMDD-NNNN
  receipt_number        TEXT UNIQUE NOT NULL,
  -- vendor 식별 (slug 기반 — vendor 테이블 참조는 선택적)
  vendor_id             UUID REFERENCES companies(id) ON DELETE SET NULL,
  vendor_name           TEXT NOT NULL,
  business_reg_number   TEXT,          -- 사업자등록번호 (입력한 경우)
  -- 제출자 연락처
  contact_name          TEXT NOT NULL,
  contact_email         TEXT NOT NULL,
  contact_phone         TEXT,
  -- 분쟁 사유 분류
  reason_code           TEXT NOT NULL CHECK (reason_code IN (
                          'classification_error',   -- 분류 오류
                          'info_inaccurate',         -- 정보 부정확
                          'delete_request',          -- 삭제 요청
                          'other'                    -- 기타
                        )),
  reason_detail         TEXT,          -- 상세 사유 (자유 입력)
  -- 제출 채널
  channel               TEXT NOT NULL DEFAULT 'form' CHECK (channel IN ('form', 'email')),
  -- 첨부파일 메모 (실제 파일은 이메일로 수신, URL 저장)
  attachment_note       TEXT,
  -- 처리 상태
  status                TEXT NOT NULL DEFAULT '접수' CHECK (status IN (
                          '접수',
                          '검토중',
                          '정정완료',
                          '유지'
                        )),
  -- 처리 전후 분류 기록
  before_classification TEXT,
  after_classification  TEXT,
  -- 어드민 메모
  admin_note            TEXT,
  -- 처리자
  resolved_by           TEXT,
  -- 타임스탬프
  submitted_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  first_replied_at      TIMESTAMPTZ,   -- SLA 14영업일 기준
  resolved_at           TIMESTAMPTZ,   -- SLA 30영업일 기준
  -- 5년 보존 정책: 이 시점 이후 익명화
  anonymize_after       TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '5 years'),
  -- 익명화 완료 여부
  anonymized_at         TIMESTAMPTZ
);

COMMENT ON TABLE vendor_classification_disputes IS
  'PACAA-754: vendor 분류 이의제기 접수 테이블. 5년 보존 후 익명화 (vendor_id=NULL, 나머지 통계용 보존).';

COMMENT ON COLUMN vendor_classification_disputes.receipt_number IS
  '사람이 읽을 수 있는 접수번호. 형식: DISP-YYYYMMDD-NNNN. vendor 확인 이메일에 포함.';

COMMENT ON COLUMN vendor_classification_disputes.anonymize_after IS
  'PIPA §15 준수: 5년 보존 후 vendor_id를 NULL로 설정, 연락처 정보 삭제. 통계 집계 데이터(reason_code, status)는 보존.';

-- receipt_number 생성 함수 (DISP-YYYYMMDD-NNNN)
CREATE OR REPLACE FUNCTION generate_dispute_receipt_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  date_part TEXT := to_char(now(), 'YYYYMMDD');
  seq_val   BIGINT;
  prefix    TEXT := 'DISP-' || date_part || '-';
BEGIN
  SELECT COUNT(*) + 1
    INTO seq_val
    FROM vendor_classification_disputes
   WHERE receipt_number LIKE prefix || '%';
  RETURN prefix || lpad(seq_val::TEXT, 4, '0');
END;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. vendor_classification_audit — 분류 변경 이력 (admin 처분 결과)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS vendor_classification_audit (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id         UUID REFERENCES companies(id) ON DELETE SET NULL,
  dispute_id        UUID REFERENCES vendor_classification_disputes(id) ON DELETE SET NULL,
  -- 변경 전후 분류
  before_model      TEXT,
  after_model       TEXT,
  -- 변경 사유 (dispute 처분 / 관리자 직접 수정 등)
  reason            TEXT,
  -- 변경자
  changed_by        TEXT NOT NULL,
  changed_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE vendor_classification_audit IS
  'PACAA-754: vendor 분류 변경 이력. admin 처분 + 직접 수정 모두 기록. 5년 보존.';

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. 인덱스
-- ─────────────────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_disputes_status
  ON vendor_classification_disputes(status);

CREATE INDEX IF NOT EXISTS idx_disputes_vendor_id
  ON vendor_classification_disputes(vendor_id);

CREATE INDEX IF NOT EXISTS idx_disputes_submitted_at
  ON vendor_classification_disputes(submitted_at DESC);

CREATE INDEX IF NOT EXISTS idx_classification_audit_vendor
  ON vendor_classification_audit(vendor_id);

CREATE INDEX IF NOT EXISTS idx_classification_audit_dispute
  ON vendor_classification_audit(dispute_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. RLS — anon는 insert 전용(form 제출), service role만 조회/수정
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE vendor_classification_disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_classification_audit   ENABLE ROW LEVEL SECURITY;

-- anon/authenticated: insert only (form submission via API route with service client)
-- service role bypasses RLS by default — admin API uses service client.

-- ─────────────────────────────────────────────────────────────────────────────
-- ROLLBACK
-- DROP TABLE IF EXISTS vendor_classification_audit;
-- DROP TABLE IF EXISTS vendor_classification_disputes;
-- DROP FUNCTION IF EXISTS generate_dispute_receipt_number();
-- ─────────────────────────────────────────────────────────────────────────────
