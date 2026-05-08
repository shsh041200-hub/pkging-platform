BEGIN;

-- Drop orphan KOR-138 schema (0 rows, KOR-191 removed feature, replacing with PACAA-322 schema)
DROP TABLE IF EXISTS public.quote_requests CASCADE;

-- ──────────────────────────────────────────────────────────────────────────────
-- 1. quote_requests (PACAA-322 plan v2)
-- ──────────────────────────────────────────────────────────────────────────────
CREATE TABLE public.quote_requests (
  id                       UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_ids               UUID[]      NOT NULL,
  buyer_email              TEXT        NOT NULL,
  buyer_company            TEXT,
  quantity_desc            TEXT,
  deadline_date            DATE,
  requirements             TEXT,
  status                   TEXT        NOT NULL DEFAULT 'pending'
                             CHECK (status IN ('pending', 'sent', 'closed')),
  consent_collection       BOOLEAN     NOT NULL,
  consent_collection_at    TIMESTAMPTZ NOT NULL,
  consent_third_party      BOOLEAN     NOT NULL,
  consent_third_party_at   TIMESTAMPTZ NOT NULL,
  ip_hash                  TEXT,
  -- expires_at: consent_collection_at + 1 year. Maintained by trigger because
  -- TIMESTAMPTZ + INTERVAL is STABLE (DST/timezone-dependent), not IMMUTABLE,
  -- so Postgres rejects it as a GENERATED expression.
  expires_at               TIMESTAMPTZ NOT NULL,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX quote_requests_created_at_idx ON public.quote_requests (created_at DESC);
CREATE INDEX quote_requests_status_idx     ON public.quote_requests (status);
CREATE INDEX quote_requests_expires_at_idx ON public.quote_requests (expires_at);

CREATE OR REPLACE FUNCTION public.quote_requests_set_expires_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.expires_at := NEW.consent_collection_at + INTERVAL '1 year';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER quote_requests_set_expires_at
  BEFORE INSERT OR UPDATE OF consent_collection_at ON public.quote_requests
  FOR EACH ROW EXECUTE FUNCTION public.quote_requests_set_expires_at();

CREATE TRIGGER quote_requests_updated_at
  BEFORE UPDATE ON public.quote_requests
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.quote_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can insert quote_requests"
  ON public.quote_requests FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role can select quote_requests"
  ON public.quote_requests FOR SELECT
  TO service_role
  USING (true);

CREATE POLICY "Service role can update quote_requests"
  ON public.quote_requests FOR UPDATE
  TO service_role
  USING (true);

-- ──────────────────────────────────────────────────────────────────────────────
-- 2. quote_requests_purge_log
-- ──────────────────────────────────────────────────────────────────────────────
CREATE TABLE public.quote_requests_purge_log (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  purged_count INTEGER     NOT NULL DEFAULT 0,
  purged_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.quote_requests_purge_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage purge_log"
  ON public.quote_requests_purge_log FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- pg_cron job deferred to follow-up (extension not enabled on this project; CTO decision: pg_cron vs Edge Function)

COMMIT;
