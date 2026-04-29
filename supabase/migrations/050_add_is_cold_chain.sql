-- 050_add_is_cold_chain.sql
-- PACAA-19: Add is_cold_chain boolean for fresh/cold-chain facet filter
--
-- Backfill: vendors with cold_packaging_available = true
-- (these are the former fresh_produce_packaging vendors absorbed into food-beverage in 048)

ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS is_cold_chain boolean NOT NULL DEFAULT false;

UPDATE companies
SET is_cold_chain = true
WHERE cold_packaging_available = true;

CREATE INDEX IF NOT EXISTS idx_companies_is_cold_chain ON companies (is_cold_chain) WHERE is_cold_chain = true;
