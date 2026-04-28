-- 048_category_consolidation.sql
-- PACAA-17: Consolidate IndustryCategory from 8 → 5 (kebab-case)
--
-- Removes: eco-special, fresh_produce_packaging, print_design_services
-- Adds boolean columns for downstream queries:
--   is_eco                  (vendors that had eco-special)
--   is_print_design_service (vendors that had print_design_services)
-- Absorbs fresh_produce_packaging → food-beverage

-- Step 1: Add boolean columns
ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS is_eco boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_print_design_service boolean NOT NULL DEFAULT false;

-- Step 2: Mark vendors before removing array entries
UPDATE companies
SET is_eco = true
WHERE 'eco-special' = ANY(industry_categories);

UPDATE companies
SET is_print_design_service = true
WHERE 'print_design_services' = ANY(industry_categories);

-- Step 3: Absorb fresh_produce_packaging → food-beverage
-- Add food-beverage if not already present, then remove fresh_produce_packaging
UPDATE companies
SET industry_categories = array_append(
  array_remove(industry_categories, 'fresh_produce_packaging'),
  'food-beverage'
)
WHERE 'fresh_produce_packaging' = ANY(industry_categories)
  AND NOT 'food-beverage' = ANY(industry_categories);

UPDATE companies
SET industry_categories = array_remove(industry_categories, 'fresh_produce_packaging')
WHERE 'fresh_produce_packaging' = ANY(industry_categories);

-- Step 4: Remove eco-special and print_design_services from industry_categories
UPDATE companies
SET industry_categories = array_remove(industry_categories, 'eco-special')
WHERE 'eco-special' = ANY(industry_categories);

UPDATE companies
SET industry_categories = array_remove(industry_categories, 'print_design_services')
WHERE 'print_design_services' = ANY(industry_categories);

-- Step 5: Create indexes for the new boolean columns
CREATE INDEX IF NOT EXISTS idx_companies_is_eco ON companies (is_eco) WHERE is_eco = true;
CREATE INDEX IF NOT EXISTS idx_companies_is_print_design_service ON companies (is_print_design_service) WHERE is_print_design_service = true;
