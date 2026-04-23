-- Add price_tier column to companies table
-- Represents the general pricing tier of a packaging supplier

ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS price_tier TEXT
    CHECK (price_tier IN ('budget', 'mid', 'premium', 'negotiable'));

-- Down migration:
-- ALTER TABLE companies DROP COLUMN IF EXISTS price_tier;
