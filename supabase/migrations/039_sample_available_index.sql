-- Migration 039: Partial index for sample_available filter
-- Supports the ?sample=true API filter without a full table scan.
-- The field itself was added in migration 028_buyer_criteria_fields.sql.

-- ── UP ──────────────────────────────────────────────────────────────────────

-- Partial index: only true rows are ever queried via the filter
CREATE INDEX IF NOT EXISTS idx_companies_sample_available
  ON companies (sample_available) WHERE sample_available = true;

-- ── DOWN ────────────────────────────────────────────────────────────────────
-- To revert:
--
-- DROP INDEX IF EXISTS idx_companies_sample_available;
