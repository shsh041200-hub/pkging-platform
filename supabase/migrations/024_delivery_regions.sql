-- KOR-263: Add delivery_regions column for region-based facet filtering.
-- Concept: delivery_regions = areas a company can deliver to (not HQ location).
-- Phase 1 uses 17 metropolitan 시·도 level regions + '전국' for nationwide.

-- 1. Add delivery_regions column (text array, default empty)
ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS delivery_regions text[] DEFAULT '{}';

-- 2. GIN index for efficient overlap/contains queries
CREATE INDEX IF NOT EXISTS idx_companies_delivery_regions
  ON companies USING GIN (delivery_regions);

-- Down migration:
-- DROP INDEX IF EXISTS idx_companies_delivery_regions;
-- ALTER TABLE companies DROP COLUMN IF EXISTS delivery_regions;
