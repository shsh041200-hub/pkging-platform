-- Add similar_optout_at column to companies table.
-- Company owners can opt out of appearing in other companies' "similar companies" lists.

ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS similar_optout_at timestamptz DEFAULT NULL;

COMMENT ON COLUMN companies.similar_optout_at IS 'Set when company owner opts out of similar-companies exposure';

-- Recreate get_similar_companies RPC with opt-out filter.
-- Opted-out companies (similar_optout_at IS NOT NULL) are excluded from candidate results.
CREATE OR REPLACE FUNCTION get_similar_companies(
  target_company_id uuid,
  result_limit int DEFAULT 6
)
RETURNS TABLE (
  id uuid,
  slug text,
  name text,
  description text,
  icon_url text,
  category text,
  industry_categories text[],
  is_verified boolean,
  similarity_score double precision
)
LANGUAGE sql STABLE
AS $$
  WITH target AS (
    SELECT
      c.id,
      c.slug,
      c.category,
      c.industry_categories,
      c.buyer_category,
      c.packaging_form,
      c.is_verified
    FROM companies c
    WHERE c.id = target_company_id
  ),
  scored AS (
    SELECT
      c.id,
      c.slug,
      c.name,
      c.description,
      c.icon_url,
      c.category::text,
      c.industry_categories,
      c.is_verified,
      (
        -- Signal 1: Industry categories Jaccard similarity (0.45)
        0.45 * CASE
          WHEN COALESCE(array_length(c.industry_categories, 1), 0) = 0
               AND COALESCE(array_length(t.industry_categories, 1), 0) = 0
          THEN 0
          WHEN COALESCE(array_length(c.industry_categories, 1), 0) = 0
               OR COALESCE(array_length(t.industry_categories, 1), 0) = 0
          THEN 0
          ELSE (
            SELECT COUNT(*)::double precision FROM (
              SELECT unnest(c.industry_categories)
              INTERSECT
              SELECT unnest(t.industry_categories)
            ) _i
          ) / (
            SELECT COUNT(*)::double precision FROM (
              SELECT unnest(c.industry_categories)
              UNION
              SELECT unnest(t.industry_categories)
            ) _u
          )
        END
        -- Signal 2: Same top-level packaging category (0.20)
        + CASE WHEN c.category = t.category THEN 0.20 ELSE 0 END
        -- Signal 3: Buyer category match — only when both populated (0.15)
        + CASE
            WHEN c.buyer_category IS NOT NULL
                 AND t.buyer_category IS NOT NULL
                 AND c.buyer_category = t.buyer_category
            THEN 0.15
            ELSE 0
          END
        -- Signal 4: Packaging form match — only when both populated (0.10)
        + CASE
            WHEN c.packaging_form IS NOT NULL
                 AND t.packaging_form IS NOT NULL
                 AND c.packaging_form = t.packaging_form
            THEN 0.10
            ELSE 0
          END
        -- Signal 5: Verified status match (0.10)
        + CASE WHEN c.is_verified = t.is_verified THEN 0.10 ELSE 0 END
      )::double precision AS similarity_score
    FROM companies c
    CROSS JOIN target t
    WHERE c.id != target_company_id
      AND c.slug != t.slug
      AND NOT COALESCE(c.is_hidden, false)
      AND c.similar_optout_at IS NULL
  )
  SELECT s.id, s.slug, s.name, s.description, s.icon_url,
         s.category, s.industry_categories, s.is_verified,
         s.similarity_score
  FROM scored s
  WHERE s.similarity_score > 0
  ORDER BY s.similarity_score DESC, s.is_verified DESC, s.name ASC
  LIMIT result_limit;
$$;
