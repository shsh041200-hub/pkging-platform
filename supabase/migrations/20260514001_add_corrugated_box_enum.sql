-- PACAA-682: Add corrugated_box to category_type ENUM
--
-- Purpose: corrugated_box was omitted from PACAA-650 (20260513001) when 7 other
--          categories were added. This caused SG-1 corrugated_box coverage = 0%
--          because no company can have category='corrugated_box' without this value.
--
-- Downstream: after this migration runs, two follow-up operations are required:
--   1. Reclassify 39 existing `paper` companies → corrugated_box (PACAA-682 Step 3)
--   2. Import 878 vendor_candidates with corrugated_box category (PACAA-682 Step 5)
--   3. Update keyword_pages.category for corrugated slugs: paper → corrugated_box (Step 4)
--
-- CTO sign-off required before applying: ALTER TYPE ADD VALUE is irreversible
-- (cannot be removed without recreating the ENUM + dependent columns).
--
-- Rollback: not directly reversible via DROP; see below.
-- Safe to apply: IF NOT EXISTS prevents double-application.

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Add corrugated_box to category_type enum
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TYPE category_type ADD VALUE IF NOT EXISTS 'corrugated_box';

-- ─────────────────────────────────────────────────────────────────────────────
-- Verification (run after applying — should return 1 row)
-- SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid
-- WHERE t.typname = 'category_type' AND e.enumlabel = 'corrugated_box';
-- ─────────────────────────────────────────────────────────────────────────────

-- ─────────────────────────────────────────────────────────────────────────────
-- ROLLBACK NOTE
-- ALTER TYPE ADD VALUE is a one-way door in Postgres. To "undo":
--   1. UPDATE companies SET category = 'paper' WHERE category = 'corrugated_box';
--   2. Recreate category_type without 'corrugated_box' using a 3-step procedure:
--      a. ALTER TABLE companies ALTER COLUMN category TYPE text USING category::text;
--      b. DROP TYPE category_type;
--      c. CREATE TYPE category_type AS ENUM (...all values except corrugated_box...);
--      d. ALTER TABLE companies ALTER COLUMN category TYPE category_type USING category::category_type;
--   This is disruptive — applies ONLY after full data rollback of Step 3.
-- ─────────────────────────────────────────────────────────────────────────────
