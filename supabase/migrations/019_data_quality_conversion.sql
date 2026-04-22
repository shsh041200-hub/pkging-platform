-- KOR-188: Data quality improvements + conversion tracking tables
-- 1. company_portfolios table
-- 2. conversion_events table
-- 3. Companies aggregate columns (review_count, avg_rating)
-- 4. Companies certifications GIN index
-- 5. quote_requests response tracking columns
-- 6. reviews composite index
-- 7. Review aggregate sync trigger

-- ─────────────────────────────────────────────
-- 1. company_portfolios
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS company_portfolios (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id    UUID        NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  title         TEXT        NOT NULL,
  description   TEXT,
  image_url     TEXT,
  display_order INT         NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_company_portfolios_company
  ON company_portfolios (company_id, display_order);

ALTER TABLE company_portfolios ENABLE ROW LEVEL SECURITY;

-- Public can read portfolios (anonymous buyers browsing supplier profiles)
DROP POLICY IF EXISTS "portfolios_public_read" ON company_portfolios;
CREATE POLICY "portfolios_public_read" ON company_portfolios
  FOR SELECT USING (true);

-- Only service_role can insert/update/delete (bypasses RLS)
DROP POLICY IF EXISTS "portfolios_service_manage" ON company_portfolios;
CREATE POLICY "portfolios_service_manage" ON company_portfolios
  FOR ALL TO authenticated USING (false) WITH CHECK (false);

-- NOTE: Create the 'portfolios' Supabase Storage bucket manually in the dashboard:
--   Bucket name: portfolios
--   Public access: enabled (public read)
--   File size limit: 10 MB
--   Allowed MIME types: image/jpeg, image/png, image/webp

-- ─────────────────────────────────────────────
-- 2. conversion_events
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS conversion_events (
  id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type         TEXT        NOT NULL,
  company_id         UUID        REFERENCES companies(id) ON DELETE SET NULL,
  session_id         TEXT        NOT NULL,
  industry_category  TEXT,
  material_type      TEXT,
  referrer_path      TEXT,
  metadata           JSONB       NOT NULL DEFAULT '{}',
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_conversion_events_company
  ON conversion_events (company_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_conversion_events_type
  ON conversion_events (event_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_conversion_events_session
  ON conversion_events (session_id);

ALTER TABLE conversion_events ENABLE ROW LEVEL SECURITY;

-- Only service_role can access (no public read — raw events are internal data)
DROP POLICY IF EXISTS "events_service_only" ON conversion_events;
CREATE POLICY "events_service_only" ON conversion_events
  FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);

-- ─────────────────────────────────────────────
-- 3. Companies: aggregate columns
-- ─────────────────────────────────────────────
ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS review_count INT  NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS avg_rating   REAL;

-- ─────────────────────────────────────────────
-- 4. Companies: certifications GIN index
-- ─────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_companies_certifications
  ON companies USING GIN (certifications);

-- ─────────────────────────────────────────────
-- 5. quote_requests: response tracking columns
-- ─────────────────────────────────────────────
ALTER TABLE quote_requests
  ADD COLUMN IF NOT EXISTS responded_at          TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS response_status       TEXT NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS response_time_minutes INT;

-- ─────────────────────────────────────────────
-- 6. reviews: composite index for aggregate queries
-- ─────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_reviews_company_rating
  ON reviews (company_id, rating);

-- ─────────────────────────────────────────────
-- 7. Review aggregate sync trigger
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION sync_company_review_stats()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  v_company_id UUID;
BEGIN
  -- Determine affected company from old or new row
  IF TG_OP = 'DELETE' THEN
    v_company_id := OLD.company_id;
  ELSE
    v_company_id := NEW.company_id;
  END IF;

  UPDATE companies
  SET
    review_count = (SELECT COUNT(*)         FROM reviews WHERE company_id = v_company_id),
    avg_rating   = (SELECT AVG(rating::REAL) FROM reviews WHERE company_id = v_company_id)
  WHERE id = v_company_id;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_review_stats ON reviews;
CREATE TRIGGER trg_sync_review_stats
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW EXECUTE FUNCTION sync_company_review_stats();

-- Backfill existing review stats
UPDATE companies c
SET
  review_count = sub.cnt,
  avg_rating   = sub.avg_r
FROM (
  SELECT company_id, COUNT(*) AS cnt, AVG(rating::REAL) AS avg_r
  FROM reviews
  GROUP BY company_id
) sub
WHERE c.id = sub.company_id;
