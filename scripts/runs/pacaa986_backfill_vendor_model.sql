-- PACAA-986: backfill vendor_model from vendor_telesales_checks
--
-- Prerequisites:
--   Migration 20260524001_vendor_model_column.sql already applied.
--   CTO review + Legal Counsel sign-off obtained.
--
-- Idempotency: WHERE c.vendor_model IS NULL ensures safe re-run.
-- Source: vendor_telesales_checks — most recent check per vendor.
-- Expected counts: found ~1,156 · not_found ~1,611 (total N=2,767)
--
-- Dry-run first: uncomment the SELECT block, comment out the UPDATE+COMMIT.

BEGIN;

-- ── Dry-run verification (run before UPDATE) ─────────────────────────────────
-- SELECT
--   latest.result,
--   COUNT(*) AS company_count
-- FROM (
--   SELECT DISTINCT ON (vendor_id)
--     vendor_id,
--     result
--   FROM vendor_telesales_checks
--   WHERE result IN ('found', 'not_found', 'exempt')
--   ORDER BY vendor_id, checked_at DESC
-- ) latest
-- JOIN companies c ON c.id = latest.vendor_id
-- WHERE c.vendor_model IS NULL
-- GROUP BY latest.result
-- ORDER BY latest.result;
-- ─────────────────────────────────────────────────────────────────────────────

UPDATE companies c
SET
  vendor_model        = latest.result,
  vendor_model_source = 'name_match_provisional'
FROM (
  SELECT DISTINCT ON (vendor_id)
    vendor_id,
    result
  FROM vendor_telesales_checks
  WHERE result IN ('found', 'not_found', 'exempt')
  ORDER BY vendor_id, checked_at DESC
) latest
WHERE c.id = latest.vendor_id
  AND c.vendor_model IS NULL;

-- ── Post-run count ────────────────────────────────────────────────────────────
SELECT
  vendor_model,
  vendor_model_source,
  COUNT(*) AS n
FROM companies
WHERE vendor_model IS NOT NULL
GROUP BY vendor_model, vendor_model_source
ORDER BY vendor_model;

COMMIT;
