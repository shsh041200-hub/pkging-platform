-- PACAA-953 Phase 3 PR-2: Drop 3 migration-legacy tables
-- Backup: runs/supabase_drop_backup_<table>_2026-05-21.sql.gz
-- All tables: 0 rows, code-ref=0 (PACAA-953 Phase 1 audit).
-- vendor_contact_checks and vendor_domain_checks have FK→companies but are being dropped,
-- so CASCADE is safe (no dependent tables reference these).

-- 1. Drop crawl_ai_usage (0 rows, planned-but-unused)
DROP TABLE IF EXISTS crawl_ai_usage CASCADE;

-- 2. Drop vendor_contact_checks (FK→companies.id, 0 rows, evidence schema stub)
DROP TABLE IF EXISTS vendor_contact_checks CASCADE;

-- 3. Drop vendor_domain_checks (FK→companies.id, 0 rows, evidence schema stub)
DROP TABLE IF EXISTS vendor_domain_checks CASCADE;
