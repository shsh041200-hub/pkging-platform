-- KOR-354: Korean search quality improvement
-- Adds: synonym table, weighted search_vector (GENERATED STORED), GIN index,
--       scored search_companies_korean RPC with synonym expansion.
--
-- Before: simple ilike on name+description only, no relevance ranking.
-- After:  tsvector weights A-D across 4 fields, synonym expansion, relevance score.

-- ── UP ──────────────────────────────────────────────────────────────────────

-- 1. Korean packaging domain synonym table
--    Maps a canonical search term to its common synonyms / alternate spellings.
CREATE TABLE IF NOT EXISTS korean_search_synonyms (
  term       TEXT        PRIMARY KEY,
  synonyms   TEXT[]      NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO korean_search_synonyms (term, synonyms) VALUES
  ('박스',     ARRAY['상자', '케이스', '컨테이너']),
  ('상자',     ARRAY['박스', '케이스']),
  ('택배',     ARRAY['배송', '배달', '운송', '물류']),
  ('포장',     ARRAY['패키지', '패키징', '포장재']),
  ('골판지',   ARRAY['골지', '코루게이트', '종이박스', '크라프트지']),
  ('지류',     ARRAY['종이', '페이퍼', '골판지', '크라프트']),
  ('비닐',     ARRAY['PE봉투', '폴리에틸렌', '봉투', '비닐백']),
  ('봉투',     ARRAY['비닐봉투', '백', '봉지', '파우치']),
  ('파우치',   ARRAY['봉투', '백', '스탠딩파우치', '지퍼백']),
  ('플라스틱', ARRAY['수지', 'PP', 'PE', 'PET', 'PVC']),
  ('친환경',   ARRAY['에코', '재활용', '생분해', '그린포장']),
  ('에코',     ARRAY['친환경', '재활용', '생분해']),
  ('식품',     ARRAY['식품용', '식품포장', '푸드', 'HACCP']),
  ('완충재',   ARRAY['에어캡', '뽁뽁이', '버블랩', '에어팩', '쿠션']),
  ('에어캡',   ARRAY['완충재', '뽁뽁이', '버블랩', '에어팩']),
  ('테이프',   ARRAY['접착테이프', 'OPP테이프', '포장테이프', '박스테이프']),
  ('라벨',     ARRAY['스티커', '레이블', '라벨지', '점착라벨']),
  ('쇼핑백',   ARRAY['쇼핑가방', '종이가방', '선물백', '쇼핑봉투']),
  ('캔',       ARRAY['금속캔', '알루미늄캔', '틴캔', '통조림캔']),
  ('병',       ARRAY['유리병', '페트병', '플라스틱병']),
  ('수축필름', ARRAY['열수축', '슈링크', 'PVC필름', '수축포장']),
  ('완충',     ARRAY['완충재', '에어캡', '뽁뽁이', '버블랩', '충격흡수']),
  ('인쇄',     ARRAY['프린팅', '오프셋인쇄', '디지털인쇄', '라벨인쇄']),
  ('스티커',   ARRAY['라벨', '레이블', '점착지', '라벨스티커']),
  ('필름',     ARRAY['수축필름', 'OPP', 'CPP', '연포장', '랩필름'])
ON CONFLICT (term) DO UPDATE SET synonyms = EXCLUDED.synonyms;

-- 2. Weighted tsvector column
--    Weight A: name (highest — exact brand/company name matches)
--    Weight B: products, subcategory (direct product listing)
--    Weight D: description (context — lower weight than specific product terms)
--
--    English-coded columns (material_type slug, packaging_form enum, industry_categories slug)
--    are omitted because Korean users don't search using those coded values.
--
--    Note: GENERATED ALWAYS AS cannot be used because to_tsvector is STABLE not IMMUTABLE;
--    using explicit column + trigger instead.
ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Build helper function (IMMUTABLE-safe: called from trigger, not generated col)
CREATE OR REPLACE FUNCTION companies_build_search_vector(
  p_name        text,
  p_subcategory text,
  p_products    text[],
  p_description text
) RETURNS tsvector LANGUAGE sql IMMUTABLE AS $$
  SELECT
    setweight(to_tsvector('simple', COALESCE(p_name,        '')), 'A') ||
    setweight(to_tsvector('simple', COALESCE(p_subcategory, '')), 'B') ||
    setweight(to_tsvector('simple', array_to_string(COALESCE(p_products, '{}'), ' ')), 'B') ||
    setweight(to_tsvector('simple', COALESCE(p_description, '')), 'D')
$$;

-- Trigger to keep search_vector current on every insert/update
CREATE OR REPLACE FUNCTION trg_companies_search_vector()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.search_vector := companies_build_search_vector(
    NEW.name, NEW.subcategory, NEW.products, NEW.description
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS companies_search_vector_trig ON companies;
CREATE TRIGGER companies_search_vector_trig
  BEFORE INSERT OR UPDATE OF name, subcategory, products, description
  ON companies
  FOR EACH ROW
  EXECUTE FUNCTION trg_companies_search_vector();

-- Back-fill existing rows
UPDATE companies
SET search_vector = companies_build_search_vector(name, subcategory, products, description);

-- 3. GIN index for fast tsvector lookups
CREATE INDEX IF NOT EXISTS idx_companies_search_vector
  ON companies USING GIN (search_vector);

-- 4. Scored Korean search RPC
--    Algorithm:
--      a) Look up synonyms for the exact query term.
--      b) Build a tsquery (OR over original + synonyms).
--      c) Match via tsvector OR ilike on name/description (ilike catches compound words).
--      d) Score = ts_rank_cd * 10 + name_ilike_bonus(5) + verified_bonus(3) + cert_boost.
--      e) Apply optional structured filters (industry, material_type, etc.).
--      f) Return rows with total_count window so the caller can paginate.
CREATE OR REPLACE FUNCTION search_companies_korean(
  p_query         text,
  p_limit         integer  DEFAULT 20,
  p_offset        integer  DEFAULT 0,
  p_industry      text     DEFAULT NULL,
  p_material_type text     DEFAULT NULL,
  p_packaging_form text    DEFAULT NULL,
  p_category      text     DEFAULT NULL,
  p_tag           text     DEFAULT NULL,
  p_use_case      text     DEFAULT NULL,
  p_certification text     DEFAULT NULL
) RETURNS TABLE (
  id                   uuid,
  slug                 text,
  name                 text,
  description          text,
  category             text,
  industry_categories  text[],
  material_type        text,
  packaging_form       text,
  subcategory          text,
  tags                 text[],
  use_case_tags        text[],
  is_verified          boolean,
  cert_count           integer,
  founded_year         integer,
  min_order_quantity   text,
  service_capabilities text[],
  target_industries    text[],
  products             text[],
  certifications       text[],
  rank                 real,
  total_count          bigint
) LANGUAGE plpgsql STABLE SECURITY DEFINER AS $$
DECLARE
  v_synonyms  text[];
  v_all_terms text[];
  v_ts_str    text;
  v_tsquery   tsquery;
BEGIN
  -- Expand to synonyms
  SELECT COALESCE(kss.synonyms, ARRAY[]::text[])
    INTO v_synonyms
    FROM korean_search_synonyms kss
   WHERE kss.term = p_query;

  v_all_terms := ARRAY[p_query] || COALESCE(v_synonyms, ARRAY[]::text[]);

  -- Build tsquery: term1 | term2 | ...
  SELECT string_agg(t, ' | ')
    INTO v_ts_str
    FROM unnest(v_all_terms) AS t;

  BEGIN
    v_tsquery := to_tsquery('simple', v_ts_str);
  EXCEPTION WHEN OTHERS THEN
    v_tsquery := plainto_tsquery('simple', p_query);
  END;

  RETURN QUERY
  WITH matched AS (
    SELECT
      c.id,
      c.slug,
      c.name,
      c.description,
      c.category::text                                                  AS category,
      c.industry_categories,
      c.material_type,
      c.packaging_form::text                                            AS packaging_form,
      c.subcategory,
      c.tags,
      c.use_case_tags,
      c.is_verified,
      c.cert_count,
      c.founded_year,
      c.min_order_quantity,
      c.service_capabilities,
      c.target_industries,
      c.products,
      c.certifications,
      (
        ts_rank_cd(c.search_vector, v_tsquery, 32) * 10.0
        + CASE WHEN c.name        ILIKE '%' || p_query || '%' THEN 5.0 ELSE 0.0 END
        + CASE WHEN c.is_verified THEN 3.0 ELSE 0.0 END
        + LEAST(COALESCE(c.cert_count, 0)::real / 5.0, 2.0)
      )::real                                                           AS computed_rank
    FROM companies c
    WHERE
      c.is_hidden = FALSE
      AND (
        c.search_vector @@ v_tsquery
        OR c.name        ILIKE '%' || p_query || '%'
        OR c.description ILIKE '%' || p_query || '%'
        OR EXISTS (
          SELECT 1 FROM unnest(v_all_terms) AS s(term)
          WHERE c.name        ILIKE '%' || s.term || '%'
             OR c.description ILIKE '%' || s.term || '%'
        )
      )
      -- Structured filters (all optional)
      AND (p_industry       IS NULL OR c.industry_categories @> ARRAY[p_industry])
      AND (p_material_type  IS NULL OR c.material_type = p_material_type)
      AND (p_packaging_form IS NULL OR c.packaging_form::text = p_packaging_form)
      AND (p_category       IS NULL OR c.category::text = p_category)
      AND (p_tag            IS NULL OR c.tags @> ARRAY[p_tag])
      AND (p_use_case       IS NULL OR c.use_case_tags @> ARRAY[p_use_case])
      AND (p_certification  IS NULL OR c.certifications && ARRAY[p_certification])
  )
  SELECT
    m.id, m.slug, m.name, m.description, m.category,
    m.industry_categories, m.material_type, m.packaging_form,
    m.subcategory, m.tags, m.use_case_tags, m.is_verified, m.cert_count,
    m.founded_year, m.min_order_quantity, m.service_capabilities,
    m.target_industries, m.products, m.certifications,
    m.computed_rank                                                     AS rank,
    COUNT(*) OVER ()                                                    AS total_count
  FROM matched m
  ORDER BY m.computed_rank DESC, m.name
  LIMIT  p_limit
  OFFSET p_offset;
END;
$$;

-- Grant RPC access to public roles
GRANT EXECUTE ON FUNCTION search_companies_korean TO anon, authenticated;

-- ── DOWN ────────────────────────────────────────────────────────────────────
-- REVOKE EXECUTE ON FUNCTION search_companies_korean FROM anon, authenticated;
-- DROP FUNCTION  IF EXISTS search_companies_korean;
-- DROP TRIGGER   IF EXISTS companies_search_vector_trig ON companies;
-- DROP FUNCTION  IF EXISTS trg_companies_search_vector;
-- DROP FUNCTION  IF EXISTS companies_build_search_vector;
-- DROP INDEX     IF EXISTS idx_companies_search_vector;
-- ALTER TABLE companies DROP COLUMN IF EXISTS search_vector;
-- DROP TABLE     IF EXISTS korean_search_synonyms;
