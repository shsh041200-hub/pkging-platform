-- PACAA-354 / PACAA-322 Phase 1: quote_requests 테이블 + 파기 로그
-- Applied to production via Supabase Management API on 2026-05-09 (PACAA-354).
-- expires_at uses BEFORE INSERT/UPDATE trigger instead of GENERATED ALWAYS AS:
--   Postgres rejects TIMESTAMPTZ + INTERVAL as STABLE (not IMMUTABLE) in generation
--   expressions (42P17). Trigger provides identical semantic guarantee.
-- Safe to re-run: DROP IF EXISTS CASCADE at top.

BEGIN;

-- Drop old table from KOR-138/KOR-191 (0 rows, no dependencies)
DROP TABLE IF EXISTS public.quote_requests CASCADE;
DROP TABLE IF EXISTS public.quote_requests_purge_log CASCADE;

-- Main table
CREATE TABLE public.quote_requests (
  id                    UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_ids            UUID[]       NOT NULL,
  buyer_email           TEXT         NOT NULL,
  buyer_company         TEXT,
  quantity_desc         TEXT,
  deadline_date         DATE,
  requirements          TEXT,
  status                TEXT         NOT NULL DEFAULT 'pending',
  consent_collection    BOOLEAN      NOT NULL,
  consent_collection_at TIMESTAMPTZ  NOT NULL,
  consent_third_party   BOOLEAN      NOT NULL,
  consent_third_party_at TIMESTAMPTZ NOT NULL,
  ip_hash               TEXT,
  expires_at            TIMESTAMPTZ  NOT NULL,
  created_at            TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- expires_at trigger (replaces GENERATED ALWAYS AS — see header comment)
CREATE OR REPLACE FUNCTION set_quote_request_expires_at()
  RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.expires_at := NEW.consent_collection_at + INTERVAL '1 year';
  RETURN NEW;
END;
$$;

CREATE TRIGGER quote_requests_set_expires_at
  BEFORE INSERT OR UPDATE ON public.quote_requests
  FOR EACH ROW EXECUTE FUNCTION set_quote_request_expires_at();

-- updated_at trigger (reuses existing set_updated_at from 20260501_keyword_pages.sql)
CREATE TRIGGER quote_requests_updated_at
  BEFORE UPDATE ON public.quote_requests
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Indexes
CREATE INDEX ON public.quote_requests (created_at DESC);
CREATE INDEX ON public.quote_requests (status);
CREATE INDEX ON public.quote_requests (expires_at);

-- RLS
ALTER TABLE public.quote_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public insert"   ON public.quote_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "service select"  ON public.quote_requests FOR SELECT USING (auth.role() = 'service_role');
CREATE POLICY "service update"  ON public.quote_requests FOR UPDATE USING (auth.role() = 'service_role');

-- Purge log (파기 일시 + 건수만 보존, 개인정보 미포함 — PIPA §39-3)
CREATE TABLE public.quote_requests_purge_log (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  purged_count  INTEGER     NOT NULL,
  purged_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.quote_requests_purge_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service select" ON public.quote_requests_purge_log FOR SELECT USING (auth.role() = 'service_role');

COMMIT;
