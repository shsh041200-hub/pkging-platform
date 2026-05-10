-- PACAA-466: 견적 의뢰 기능 폐지에 따른 schema 폐기 (board ask_user_questions 4e6ebe22 → drop_now).
-- pre-drop audit: quote_requests 0 rows, purge_log 2 entries (cron 시동 로그, 모두 purged_count=0).
-- Order: cron.unschedule → DROP FUNCTION purge → DROP TABLE purge_log → DROP TABLE quote_requests CASCADE → DROP FUNCTION expires_at.
-- Safe to re-run: DROP IF EXISTS + 조건부 unschedule.

BEGIN;

-- 1) Stop daily purge cron (function will be dropped next).
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'purge-expired-quote-requests') THEN
    PERFORM cron.unschedule('purge-expired-quote-requests');
  END IF;
END
$$;

-- 2) Purge function — no longer needed (no table to purge).
DROP FUNCTION IF EXISTS public.purge_expired_quote_requests();

-- 3) Purge log — historical only, polled 0 rows. Drop with table.
DROP TABLE IF EXISTS public.quote_requests_purge_log CASCADE;

-- 4) Main table — CASCADE drops triggers (quote_requests_set_expires_at, quote_requests_updated_at).
DROP TABLE IF EXISTS public.quote_requests CASCADE;

-- 5) Trigger function — orphaned after table drop.
DROP FUNCTION IF EXISTS public.set_quote_request_expires_at();

COMMIT;
