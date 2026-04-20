-- KOR-45: 바이어 중심 카테고리 분류 체계 구현 (3-Level Navigation)
-- Based on KOR-44 proposal: 제품 유형 → 포장 형태 → 소재/특성

-- =====================================================================
-- 1. Level 1: buyer_category enum (제품 유형)
-- =====================================================================
CREATE TYPE buyer_category_type AS ENUM (
  'food_beverage',      -- 식품 & 음료
  'cosmetics_beauty',   -- 화장품 & 뷰티
  'fashion_apparel',    -- 패션 & 의류
  'electronics_tech',   -- 전자제품 & IT
  'health_medical',     -- 건강 & 의료
  'home_living',        -- 생활용품 & 홈
  'ecommerce_shipping', -- 이커머스 & 배송
  'corporate_gift',     -- 기업 & 브랜드 선물
  'industrial_b2b'      -- 산업재 & B2B
);

-- =====================================================================
-- 2. Level 2: packaging_form enum (포장 형태)
-- =====================================================================
CREATE TYPE packaging_form_type AS ENUM (
  'box_case',       -- 박스 / 케이스
  'pouch_bag',      -- 파우치 / 백
  'bottle_container', -- 병 / 용기
  'tube',           -- 튜브
  'can_tin',        -- 캔 / 틴
  'shopping_bag',   -- 쇼핑백 / 캐리어백
  'cushioning',     -- 완충재 / 보호재
  'stretch_film',   -- 스트레치 / 필름
  'label_sticker',  -- 라벨 / 스티커
  'tape_sealing'    -- 테이프 / 밀봉재
);

-- =====================================================================
-- 3. Add new columns to companies table
-- =====================================================================
ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS buyer_category buyer_category_type,
  ADD COLUMN IF NOT EXISTS packaging_form packaging_form_type;

-- =====================================================================
-- 4. Migrate existing data: tags → buyer_category
-- Priority: specific tags take precedence, then material-based fallback
-- =====================================================================

-- food_grade tag → food_beverage
UPDATE companies
SET buyer_category = 'food_beverage'
WHERE 'food_grade' = ANY(COALESCE(tags, '{}'))
  AND buyer_category IS NULL;

-- cosmetic tag → cosmetics_beauty
UPDATE companies
SET buyer_category = 'cosmetics_beauty'
WHERE 'cosmetic' = ANY(COALESCE(tags, '{}'))
  AND buyer_category IS NULL;

-- pharma tag → health_medical
UPDATE companies
SET buyer_category = 'health_medical'
WHERE 'pharma' = ANY(COALESCE(tags, '{}'))
  AND buyer_category IS NULL;

-- ecommerce tag → ecommerce_shipping
UPDATE companies
SET buyer_category = 'ecommerce_shipping'
WHERE 'ecommerce' = ANY(COALESCE(tags, '{}'))
  AND buyer_category IS NULL;

-- industrial tag → industrial_b2b
UPDATE companies
SET buyer_category = 'industrial_b2b'
WHERE 'industrial' = ANY(COALESCE(tags, '{}'))
  AND buyer_category IS NULL;

-- design_service tag → corporate_gift (브랜드 패키징)
UPDATE companies
SET buyer_category = 'corporate_gift'
WHERE 'design_service' = ANY(COALESCE(tags, '{}'))
  AND buyer_category IS NULL;

-- material-based fallback for remaining
UPDATE companies
SET buyer_category = CASE category::text
  WHEN 'glass'    THEN 'cosmetics_beauty'::buyer_category_type
  WHEN 'metal'    THEN 'industrial_b2b'::buyer_category_type
  ELSE                 'ecommerce_shipping'::buyer_category_type
END
WHERE buyer_category IS NULL;

-- =====================================================================
-- 5. Migrate packaging_form from material (best-effort heuristic)
-- =====================================================================

-- flexible → pouch_bag
UPDATE companies
SET packaging_form = 'pouch_bag'
WHERE category::text = 'flexible'
  AND packaging_form IS NULL;

-- metal → can_tin
UPDATE companies
SET packaging_form = 'can_tin'
WHERE category::text = 'metal'
  AND packaging_form IS NULL;

-- glass → bottle_container
UPDATE companies
SET packaging_form = 'bottle_container'
WHERE category::text = 'glass'
  AND packaging_form IS NULL;

-- paper + ecommerce tag → box_case
UPDATE companies
SET packaging_form = 'box_case'
WHERE category::text = 'paper'
  AND 'ecommerce' = ANY(COALESCE(tags, '{}'))
  AND packaging_form IS NULL;

-- paper (remaining) → box_case
UPDATE companies
SET packaging_form = 'box_case'
WHERE category::text = 'paper'
  AND packaging_form IS NULL;

-- plastic + cosmetic → bottle_container
UPDATE companies
SET packaging_form = 'bottle_container'
WHERE category::text = 'plastic'
  AND 'cosmetic' = ANY(COALESCE(tags, '{}'))
  AND packaging_form IS NULL;

-- plastic (remaining) → pouch_bag
UPDATE companies
SET packaging_form = 'pouch_bag'
WHERE category::text = 'plastic'
  AND packaging_form IS NULL;

-- =====================================================================
-- 6. Indexes for new columns
-- =====================================================================
CREATE INDEX IF NOT EXISTS idx_companies_buyer_category ON companies (buyer_category);
CREATE INDEX IF NOT EXISTS idx_companies_packaging_form ON companies (packaging_form);
