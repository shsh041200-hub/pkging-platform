-- PACAA-650 Phase 1 — import pipeline schema prep
-- Applied: pending CTO sign-off
-- Purpose: (1) extend category_type enum for 7 new packaging categories,
--          (2) add vendor_candidates.suppressed for Legal P0 opt-out guardrail,
--          (3) add companies.candidate_source_id for idempotency + audit trail.
--
-- Legal basis: PACAA-648 (Legal Counsel) — import limited to 4 fields,
--              suppressed flag enforced at import time.
--
-- Rollback: see section at bottom.
--
-- IMPORTANT: ALTER TYPE ADD VALUE cannot run inside a multi-statement
-- transaction in Postgres < 12. Supabase runs Postgres 15+ so this is safe.
-- If applied via db-migrate.mjs the entire file runs as one migration unit.

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Extend category_type enum — 7 new packaging categories
--    Mapping: packaging_categories.category_key → companies.category
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TYPE category_type ADD VALUE IF NOT EXISTS 'flexible_packaging';
ALTER TYPE category_type ADD VALUE IF NOT EXISTS 'plastic_container';
ALTER TYPE category_type ADD VALUE IF NOT EXISTS 'glass_metal_container';
ALTER TYPE category_type ADD VALUE IF NOT EXISTS 'label_sticker';
ALTER TYPE category_type ADD VALUE IF NOT EXISTS 'printing_postprocess';
ALTER TYPE category_type ADD VALUE IF NOT EXISTS 'packaging_accessories';
ALTER TYPE category_type ADD VALUE IF NOT EXISTS 'packaging_machinery';

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. vendor_candidates.suppressed — Legal P0 opt-out guardrail
--    When true: record is excluded from all future import runs.
--    Set by: manual review of opt_out_requests (type='delete').
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE vendor_candidates
  ADD COLUMN IF NOT EXISTS suppressed BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN vendor_candidates.suppressed IS
  'PIPA §38 opt-out: when true, this candidate is excluded from import pipeline.'
  ' Set manually after verifying opt_out_requests. Never auto-reset.';

CREATE INDEX IF NOT EXISTS vendor_candidates_suppressed_idx
  ON vendor_candidates(suppressed) WHERE suppressed = true;

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. companies.candidate_source_id — import idempotency + audit trail
--    FK to vendor_candidates.id so each imported row is traceable.
--    UNIQUE constraint enforces 1-to-1: one candidate → at most one company row.
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS candidate_source_id UUID REFERENCES vendor_candidates(id) ON DELETE SET NULL;

COMMENT ON COLUMN companies.candidate_source_id IS
  'Source vendor_candidates.id for rows imported via the PACAA-650 pipeline.'
  ' NULL for manually entered or legacy companies. UNIQUE: one candidate → one company.';

CREATE UNIQUE INDEX IF NOT EXISTS companies_candidate_source_id_uniq
  ON companies(candidate_source_id) WHERE candidate_source_id IS NOT NULL;

-- ─────────────────────────────────────────────────────────────────────────────
-- ROLLBACK
-- ─────────────────────────────────────────────────────────────────────────────
-- NOTE: Postgres does not support removing enum values once added (one-way door).
-- Rollback can only remove the new columns:
--
-- DROP INDEX IF EXISTS companies_candidate_source_id_uniq;
-- ALTER TABLE companies DROP COLUMN IF EXISTS candidate_source_id;
-- DROP INDEX IF EXISTS vendor_candidates_suppressed_idx;
-- ALTER TABLE vendor_candidates DROP COLUMN IF EXISTS suppressed;
--
-- To undo enum values: requires pg_catalog manipulation or recreating the type
-- (high-risk). Do NOT add these values if unsure — this is a one-way door.
