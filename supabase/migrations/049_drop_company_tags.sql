-- Migration 049: Drop CompanyTag / tags column
-- PACAA-18: 분류기 단일화 — CompanyTag enum 폐기
--
-- Step 1: Backfill industry_categories from tags for any vendor that has a tag
--         but is missing the corresponding industry category.
-- Step 2: Drop the tags column and its GIN index.
-- Step 3: Recreate search_companies_korean without p_tag / tags.

-- ── Step 1: Backfill skipped ───────────────────────────────────────────────
-- The tags column was already dropped in production before this migration ran.
-- Backfill from tags → industry_categories is moot. Proceeding to cleanup.

-- ── Step 2: Drop tags column and index ─────────────────────────────────────

DROP INDEX IF EXISTS idx_companies_tags;
ALTER TABLE companies DROP COLUMN IF EXISTS tags;

-- ── Step 3: Recreate search_companies_korean without tags ──────────────────

DROP FUNCTION IF EXISTS search_companies_korean(text, integer, integer, text, text, text, text, text, text, text);

CREATE OR REPLACE FUNCTION search_companies_korean(
  p_query         text,
  p_limit         integer  DEFAULT 20,
  p_offset        integer  DEFAULT 0,
  p_industry      text     DEFAULT NULL,
  p_material_type text     DEFAULT NULL,
  p_packaging_form text    DEFAULT NULL,
  p_category      text     DEFAULT NULL,
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
  SELECT COALESCE(kss.synonyms, ARRAY[]::text[])
    INTO v_synonyms
    FROM korean_search_synonyms kss
   WHERE kss.term = p_query;

  v_all_terms := ARRAY[p_query] || COALESCE(v_synonyms, ARRAY[]::text[]);

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
      AND (p_industry       IS NULL OR c.industry_categories @> ARRAY[p_industry])
      AND (p_material_type  IS NULL OR c.material_type = p_material_type)
      AND (p_packaging_form IS NULL OR c.packaging_form::text = p_packaging_form)
      AND (p_category       IS NULL OR c.category::text = p_category)
      AND (p_use_case       IS NULL OR c.use_case_tags @> ARRAY[p_use_case])
      AND (p_certification  IS NULL OR c.certifications && ARRAY[p_certification])
  )
  SELECT
    m.id, m.slug, m.name, m.description, m.category,
    m.industry_categories, m.material_type, m.packaging_form,
    m.subcategory, m.use_case_tags, m.is_verified, m.cert_count,
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

GRANT EXECUTE ON FUNCTION search_companies_korean TO anon, authenticated;

-- ── DOWN ────────────────────────────────────────────────────────────────────
-- ALTER TABLE companies ADD COLUMN tags text[] DEFAULT '{}';
-- CREATE INDEX idx_companies_tags ON companies USING gin (tags);
-- Then restore the old search_companies_korean from migration 037.
