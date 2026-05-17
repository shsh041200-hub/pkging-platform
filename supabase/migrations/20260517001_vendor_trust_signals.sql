-- PACAA-768: Vendor trust signal fields
-- Applied after: Legal Counsel clearance (PACAA-770)
-- Purpose: Add trust signal columns to companies table for vendor profile display.
--
-- Field status at time of writing (2026-05-17):
--   founded_year         — already exists (no-op)
--   certifications       — already exists as text[] (no-op; structured variant tracked separately)
--   key_clients          — already exists as text[] (serves as notable_clients equivalent)
--   business_registration_number  — new (P1)
--   packlinx_verified             — new (P1)
--   telecom_sales_registration_number — new (P2)
--   notable_clients               — new (P2, self-reported; key_clients stores same concept)
--   founder_attestation           — new (P3)
--
-- Rollback:
--   ALTER TABLE companies DROP COLUMN IF EXISTS business_registration_number;
--   ALTER TABLE companies DROP COLUMN IF EXISTS packlinx_verified;
--   ALTER TABLE companies DROP COLUMN IF EXISTS telecom_sales_registration_number;
--   ALTER TABLE companies DROP COLUMN IF EXISTS notable_clients;
--   ALTER TABLE companies DROP COLUMN IF EXISTS founder_attestation;

-- ─────────────────────────────────────────────────────────────────────────────
-- P1 fields
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS business_registration_number TEXT,
  ADD COLUMN IF NOT EXISTS packlinx_verified             BOOLEAN NOT NULL DEFAULT FALSE;

COMMENT ON COLUMN companies.business_registration_number IS
  '사업자등록번호. 국세청 API 검증 시 vendor_brn_checks 테이블에 evidence 기록. PIPA §15 — 공개 노출 전 Legal Counsel 자문 필수 (PACAA-770).';

COMMENT ON COLUMN companies.packlinx_verified IS
  'Packlinx 운영팀이 직접 확인한 업체 여부. is_verified(LC evidence 기반 자동화)와 별개로 수동 운영팀 확인 플래그.';

-- ─────────────────────────────────────────────────────────────────────────────
-- P2 fields
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS telecom_sales_registration_number TEXT,
  ADD COLUMN IF NOT EXISTS notable_clients                   JSONB;

COMMENT ON COLUMN companies.telecom_sales_registration_number IS
  '통신판매업 신고번호. vendor_telesales_checks에 evidence 연계. 통신판매업 §13 — 공개 노출 전 Legal Counsel 자문 필수 (PACAA-770).';

COMMENT ON COLUMN companies.notable_clients IS
  '주요 납품처 목록 (업체 자기신고). 형식: text[] 호환 JSONB. 기존 key_clients(text[])와 병행 운영하다가 데이터 이관 후 단일화 예정.';

-- ─────────────────────────────────────────────────────────────────────────────
-- P3 fields
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS founder_attestation JSONB;

COMMENT ON COLUMN companies.founder_attestation IS
  '대표자 정보 정확성 보증. 형식: {"attested": boolean, "attested_at": timestamptz}. 대표자 본인이 보증 서명 시 기록.';
