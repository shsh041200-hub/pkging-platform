-- KOR-41: 카테고리 체계 개편 + 업체 정보 모델 확장

-- =====================================================================
-- 1. 새로운 category_type enum 생성 (소재/유형 기반 2축 구조)
-- =====================================================================
CREATE TYPE category_type_new AS ENUM (
  'paper',    -- 지류/종이 (기존 jiryu)
  'plastic',  -- 플라스틱
  'metal',    -- 금속
  'flexible', -- 연포장 (신규)
  'eco',      -- 친환경
  'glass'     -- 유리 (향후 확장)
);

-- =====================================================================
-- 2. tags 컬럼 추가 (기능/서비스 태그)
-- =====================================================================
ALTER TABLE companies ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';

-- =====================================================================
-- 3. 기존 카테고리 → tags 마이그레이션 (기존 데이터 보존)
-- =====================================================================

-- saneobyong → industrial 태그
UPDATE companies
SET tags = array_append(COALESCE(tags, '{}'), 'industrial')
WHERE category::text = 'saneobyong'
  AND NOT ('industrial' = ANY(COALESCE(tags, '{}')));

-- food_grade → food_grade 태그
UPDATE companies
SET tags = array_append(COALESCE(tags, '{}'), 'food_grade')
WHERE category::text = 'food_grade'
  AND NOT ('food_grade' = ANY(COALESCE(tags, '{}')));

-- package_design → design_service 태그
UPDATE companies
SET tags = array_append(COALESCE(tags, '{}'), 'design_service')
WHERE category::text = 'package_design'
  AND NOT ('design_service' = ANY(COALESCE(tags, '{}')));

-- =====================================================================
-- 4. 새 category 컬럼 추가 후 데이터 마이그레이션
-- =====================================================================
ALTER TABLE companies ADD COLUMN category_new category_type_new;

UPDATE companies SET category_new =
  CASE category::text
    WHEN 'jiryu'          THEN 'paper'::category_type_new
    WHEN 'plastic'        THEN 'plastic'::category_type_new
    WHEN 'metal'          THEN 'metal'::category_type_new
    WHEN 'eco'            THEN 'eco'::category_type_new
    WHEN 'saneobyong'     THEN 'plastic'::category_type_new
    WHEN 'food_grade'     THEN 'plastic'::category_type_new
    WHEN 'package_design' THEN 'paper'::category_type_new
    ELSE                       'plastic'::category_type_new
  END;

ALTER TABLE companies ALTER COLUMN category_new SET NOT NULL;

-- =====================================================================
-- 5. 구 category 컬럼 교체
-- =====================================================================
ALTER TABLE companies DROP COLUMN category;
ALTER TABLE companies RENAME COLUMN category_new TO category;

DROP TYPE category_type;
ALTER TYPE category_type_new RENAME TO category_type;

-- 인덱스 재생성
CREATE INDEX IF NOT EXISTS idx_companies_category ON companies (category);

-- =====================================================================
-- 6. tags 인덱스
-- =====================================================================
CREATE INDEX IF NOT EXISTS idx_companies_tags ON companies USING gin (tags);

-- =====================================================================
-- 7. 업체 정보 확장 컬럼 추가
-- =====================================================================
ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS founded_year integer,
  ADD COLUMN IF NOT EXISTS employee_range text CHECK (
    employee_range IS NULL OR employee_range IN ('1-10', '11-50', '51-200', '200+')
  ),
  ADD COLUMN IF NOT EXISTS min_order_quantity text,
  ADD COLUMN IF NOT EXISTS service_capabilities text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS target_industries text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS key_clients text[] DEFAULT '{}';

-- =====================================================================
-- 8. 검색용 description trigram 인덱스 추가 (이름은 이미 존재)
-- =====================================================================
CREATE INDEX IF NOT EXISTS idx_companies_description_trgm
  ON companies USING gin (description gin_trgm_ops);
