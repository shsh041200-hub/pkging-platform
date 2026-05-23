-- PACAA-986: companies.vendor_model nullable TEXT + vendor_model_source provisional flag
-- Board approval: f5501a60 (Option A, 2026-05-24)
-- Legal Counsel: REQUIRED before merge (Surface 2 — PIPA §15·§17), child issue created.
-- CTO review: REQUIRED before merge.
--
-- Purpose: denormalize telesales check result into companies for
--   (1) page-load efficiency — eliminate per-vendor subquery to vendor_telesales_checks,
--   (2) structured vendor model signal available at import time.
--
-- Reversibility: two-way door.
--   Rollback:
--     ALTER TABLE companies DROP COLUMN IF EXISTS vendor_model_source;
--     ALTER TABLE companies DROP COLUMN IF EXISTS vendor_model;
--
-- DO NOT apply without CTO review + Legal Counsel sign-off.

BEGIN;

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. vendor_model — denormalized telesales check result
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS vendor_model TEXT
    CHECK (vendor_model IN ('found', 'not_found', 'exempt'));

COMMENT ON COLUMN companies.vendor_model IS
  'Denormalized from vendor_telesales_checks.result.'
  ' found = 통신판매업 신고 확인 (B형: 소량·샘플 가능),'
  ' not_found = 미신고 (A형: 기업 전용),'
  ' exempt = 통신판매업 신고 면제 (제조업 등).'
  ' NULL = 아직 점검하지 않음.'
  ' Source reliability tracked in vendor_model_source.'
  ' PIPA Surface 2 자문 필수 (PACAA-986-legal).';

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. vendor_model_source — how the value was determined (provisional marker)
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS vendor_model_source TEXT
    CHECK (vendor_model_source IN (
      'name_match_provisional',
      'brn_verified',
      'self_reported'
    ));

COMMENT ON COLUMN companies.vendor_model_source IS
  'How vendor_model was determined.'
  ' name_match_provisional = PACAA-748 name-matching pipeline, BRN unverified (lower confidence).'
  ' brn_verified = matched via BRN against 공정거래위원회 registry (high confidence).'
  ' self_reported = vendor self-claim, not independently verified.'
  ' NULL when vendor_model IS NULL.';

-- ─────────────────────────────────────────────────────────────────────────────
-- ROLLBACK
-- ─────────────────────────────────────────────────────────────────────────────
-- ALTER TABLE companies DROP COLUMN IF EXISTS vendor_model_source;
-- ALTER TABLE companies DROP COLUMN IF EXISTS vendor_model;

COMMIT;
