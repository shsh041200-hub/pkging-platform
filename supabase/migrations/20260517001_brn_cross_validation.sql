-- PACAA-785: BRN PRIMARY KEY 화 + 공공데이터 cross-validation 스키마
-- Gate: CTO sign-off required before applying (schema change)
-- Gate: Legal Counsel sign-off required (Surface 2 — vendor_* 컬럼 추가)
-- Applied: (pending approval)
--
-- Changes:
--   1. companies.business_registration_number — UNIQUE 제약 추가 (이미 존재하는 컬럼)
--   2. vendor_candidates.business_registration_number — 스테이징 레코드 BRN 저장용
--   3. vendor_brn_checks — cross-validation 결과 필드 추가
--   4. ftc_telesales_registry — 공정위 통신판매업 신고 참조 테이블 (신규)
--
-- Rollback: see bottom of file

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. companies.business_registration_number — UNIQUE constraint
-- ─────────────────────────────────────────────────────────────────────────────
-- 현재 모두 NULL이므로 UNIQUE는 NULL 중복 허용(PostgreSQL 기본 동작)으로 안전하게 추가 가능.
-- 실 데이터 채워질 때 중복 방지가 주목적.

CREATE UNIQUE INDEX IF NOT EXISTS companies_brn_unique_idx
  ON companies(business_registration_number)
  WHERE business_registration_number IS NOT NULL;

COMMENT ON COLUMN companies.business_registration_number IS
  'PRIMARY identification key — 국세청 BRN (사업자등록번호) 10자리 (하이픈 없이). '
  'UNIQUE partial index 로 NOT NULL 값에만 중복 방지 적용.';

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. vendor_candidates — BRN 컬럼 추가 (스테이징 → companies 매칭 키)
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE vendor_candidates
  ADD COLUMN IF NOT EXISTS business_registration_number TEXT;

COMMENT ON COLUMN vendor_candidates.business_registration_number IS
  'PACAA-785: 수집 시 발견된 사업자등록번호. NULL 허용 (공개되지 않은 업체 다수). '
  'import_pipeline 에서 companies.business_registration_number 와 BRN-first join 에 사용.';

CREATE INDEX IF NOT EXISTS vendor_candidates_brn_idx
  ON vendor_candidates(business_registration_number)
  WHERE business_registration_number IS NOT NULL;

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. vendor_brn_checks — cross-validation 결과 필드 추가
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE vendor_brn_checks
  ADD COLUMN IF NOT EXISTS brn_verified        BOOLEAN
    GENERATED ALWAYS AS (status = 'active') STORED,
  ADD COLUMN IF NOT EXISTS address_match       BOOLEAN,
  ADD COLUMN IF NOT EXISTS website_match       BOOLEAN,
  ADD COLUMN IF NOT EXISTS cross_source_count  SMALLINT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS cross_validation_failed BOOLEAN
    GENERATED ALWAYS AS (
      status IN ('suspended', 'closed', 'cancelled', 'unknown')
      OR (address_match IS NOT NULL AND address_match = false)
    ) STORED;

COMMENT ON COLUMN vendor_brn_checks.brn_verified IS
  'PACAA-785: status=''active'' 여부 computed. audit JSON 의 brn_verified 필드 소스.';
COMMENT ON COLUMN vendor_brn_checks.address_match IS
  'PACAA-785: 국세청 반환 주소와 companies.address 일치 여부. NULL=미검증.';
COMMENT ON COLUMN vendor_brn_checks.website_match IS
  'PACAA-785: 국세청/공정위 반환 웹사이트와 companies.website 일치 여부. NULL=미검증.';
COMMENT ON COLUMN vendor_brn_checks.cross_source_count IS
  'PACAA-785: 동일 BRN을 확인한 독립 소스 수 (국세청=1, 공정위=+1 등).';
COMMENT ON COLUMN vendor_brn_checks.cross_validation_failed IS
  'PACAA-785: BRN 비활성 또는 주소 불일치 → audit cross_validation_failed 플래그 소스.';

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. ftc_telesales_registry — 공정위 통신판매업 신고 참조 테이블
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS ftc_telesales_registry (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- 사업자등록번호 10자리 (하이픈 없이) — 검색 키
  business_registration_number TEXT NOT NULL,
  -- 통신판매업 신고 번호 (예: 2023-서울강남-12345)
  registration_number TEXT,
  -- 상호명 (공정위 원본)
  business_name       TEXT NOT NULL,
  -- 대표자 성명 (Legal P0-B 4필드 외 — 저장하되 외부 API 미노출)
  representative_name TEXT,
  -- 영업 상태: 'active' | 'cancelled' | 'suspended'
  status              TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'cancelled', 'suspended')),
  -- 소재지 (주소)
  address             TEXT,
  -- 신고 연월 (공정위 데이터 기준)
  registered_at       DATE,
  -- 데이터 수집 배치 식별자
  import_batch_id     TEXT NOT NULL,
  -- 공정위 원본 행 전체 (감사 목적)
  raw_payload         JSONB,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS ftc_telesales_registry_brn_regnr_idx
  ON ftc_telesales_registry(business_registration_number, registration_number)
  WHERE registration_number IS NOT NULL;

CREATE INDEX IF NOT EXISTS ftc_telesales_registry_brn_idx
  ON ftc_telesales_registry(business_registration_number);

CREATE INDEX IF NOT EXISTS ftc_telesales_registry_batch_idx
  ON ftc_telesales_registry(import_batch_id);

COMMENT ON TABLE ftc_telesales_registry IS
  'PACAA-785: 공정위 통신판매업 신고 참조 데이터 (월 1회 이상 업데이트). '
  'vendor_telesales_checks 의 result=''found'' 근거 소스.';

ALTER TABLE ftc_telesales_registry ENABLE ROW LEVEL SECURITY;

-- vendor_telesales_checks 에 registry FK 추가
ALTER TABLE vendor_telesales_checks
  ADD COLUMN IF NOT EXISTS ftc_registry_id UUID REFERENCES ftc_telesales_registry(id) ON DELETE SET NULL;

COMMENT ON COLUMN vendor_telesales_checks.ftc_registry_id IS
  'PACAA-785: result=''found'' 인 경우 매칭된 ftc_telesales_registry 레코드 FK.';

-- ─────────────────────────────────────────────────────────────────────────────
-- ROLLBACK
-- ─────────────────────────────────────────────────────────────────────────────
-- DROP INDEX IF EXISTS companies_brn_unique_idx;
-- ALTER TABLE vendor_candidates DROP COLUMN IF EXISTS business_registration_number;
-- DROP INDEX IF EXISTS vendor_candidates_brn_idx;
-- ALTER TABLE vendor_brn_checks
--   DROP COLUMN IF EXISTS brn_verified,
--   DROP COLUMN IF EXISTS address_match,
--   DROP COLUMN IF EXISTS website_match,
--   DROP COLUMN IF EXISTS cross_source_count,
--   DROP COLUMN IF EXISTS cross_validation_failed;
-- ALTER TABLE vendor_telesales_checks DROP COLUMN IF EXISTS ftc_registry_id;
-- DROP TABLE IF EXISTS ftc_telesales_registry;
