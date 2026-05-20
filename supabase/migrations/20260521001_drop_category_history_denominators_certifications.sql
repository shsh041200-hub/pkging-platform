-- PACAA-953 Phase 3 PR-1: Drop 3 migration-legacy tables
-- Backup: runs/supabase_drop_backup_<table>_2026-05-21.sql.gz
-- FK order: category_denominator_history (FK→category_denominators) dropped first,
--           then category_denominators (has trg_category_denominators_updated_at trigger),
--           then company_certifications (FK→companies, 0 rows).
-- All tables confirmed code-ref=0, no active reads/writes (PACAA-953 Phase 1 audit).

-- 1. Drop history first (FK dependency on category_denominators)
DROP TABLE IF EXISTS category_denominator_history CASCADE;

-- 2. Drop denominators (trigger dropped automatically with CASCADE)
DROP TABLE IF EXISTS category_denominators CASCADE;

-- 3. Drop certifications (0 rows, never populated)
DROP TABLE IF EXISTS company_certifications CASCADE;
