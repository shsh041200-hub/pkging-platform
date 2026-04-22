-- Remove employee_range column: board decision to not expose employee count publicly.
ALTER TABLE companies DROP COLUMN IF EXISTS employee_range;

-- Down migration:
-- ALTER TABLE companies ADD COLUMN IF NOT EXISTS employee_range text;
