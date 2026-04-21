-- KOR-151: 카테고리 개선 — 업종별 6개 + 소재 필터 6개, 다중 매핑 지원

-- 1. Add new columns
ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS industry_categories text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS material_type text;

-- 2. Migrate category → material_type
UPDATE companies SET material_type = CASE category::text
  WHEN 'paper'    THEN 'paper-corrugated'
  WHEN 'plastic'  THEN 'plastic-container'
  WHEN 'flexible' THEN 'film-pouch'
  WHEN 'metal'    THEN 'glass-metal'
  WHEN 'glass'    THEN 'glass-metal'
  WHEN 'eco'      THEN 'eco-material'
  ELSE 'paper-corrugated'
END
WHERE material_type IS NULL;

-- 3. Multi-map industry_categories based on all available signals
UPDATE companies SET industry_categories = (
  SELECT array_agg(DISTINCT cat) FROM unnest(ARRAY[
    -- Food & beverage
    CASE WHEN (
      buyer_category::text = 'food_beverage' OR
      'food_grade' = ANY(COALESCE(tags, '{}')) OR
      COALESCE(description, '') ILIKE ANY(ARRAY['%식품%', '%음료%', '%냉동%', '%HACCP%', '%haccp%', '%밀키트%', '%농산물%', '%수산물%'])
    ) THEN 'food-beverage' END,

    -- Ecommerce & shipping
    CASE WHEN (
      buyer_category::text IN ('ecommerce_shipping', 'home_living', 'fashion_apparel', 'corporate_gift') OR
      'ecommerce' = ANY(COALESCE(tags, '{}')) OR
      COALESCE(description, '') ILIKE ANY(ARRAY['%이커머스%', '%택배%', '%배송%', '%온라인%', '%쇼핑%', '%박스%', '%골판지%']) OR
      category::text = 'paper'
    ) THEN 'ecommerce-shipping' END,

    -- Cosmetics & beauty
    CASE WHEN (
      buyer_category::text = 'cosmetics_beauty' OR
      'cosmetic' = ANY(COALESCE(tags, '{}')) OR
      COALESCE(description, '') ILIKE ANY(ARRAY['%화장품%', '%뷰티%', '%코스메틱%', '%스킨케어%', '%향수%'])
    ) THEN 'cosmetics-beauty' END,

    -- Pharma & health
    CASE WHEN (
      buyer_category::text = 'health_medical' OR
      'pharma' = ANY(COALESCE(tags, '{}')) OR
      COALESCE(description, '') ILIKE ANY(ARRAY['%의약%', '%제약%', '%건강%', '%의료%', '%GMP%', '%건강기능%'])
    ) THEN 'pharma-health' END,

    -- Electronics & industrial
    CASE WHEN (
      buyer_category::text IN ('electronics_tech', 'industrial_b2b') OR
      'industrial' = ANY(COALESCE(tags, '{}')) OR
      COALESCE(description, '') ILIKE ANY(ARRAY['%전자%', '%산업%', '%부품%', '%공업%', '%방청%', '%ESD%', '%팔레트%'])
    ) THEN 'electronics-industrial' END,

    -- Eco & special
    CASE WHEN (
      category::text = 'eco' OR
      COALESCE(description, '') ILIKE ANY(ARRAY['%친환경%', '%생분해%', '%재활용%', '%FSC%', '%fsc%', '%PLA%', '%업사이클%', '%GRS%'])
    ) THEN 'eco-special' END
  ]) AS cat
  WHERE cat IS NOT NULL
);

-- 4. Ensure every company has at least one industry category
UPDATE companies SET industry_categories = ARRAY['ecommerce-shipping']
WHERE industry_categories = '{}' OR industry_categories IS NULL;

-- 5. Indexes for new columns
CREATE INDEX IF NOT EXISTS idx_companies_industry_categories ON companies USING GIN (industry_categories);
CREATE INDEX IF NOT EXISTS idx_companies_material_type ON companies (material_type);
