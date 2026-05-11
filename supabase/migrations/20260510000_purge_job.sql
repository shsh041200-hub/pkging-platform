-- PACAA-384: quote_requests 자동 파기 잡 — pg_cron + purge function
-- Applied to production via Supabase Management API on 2026-05-09 (PACAA-384).
-- pg_cron extension must be enabled in Supabase Dashboard before this runs.
-- Safe to re-run: cron.unschedule + DROP FUNCTION IF EXISTS at top.
-- Schedule: daily 02:00 UTC (= 11:00 KST). PIPA §39-3 — 파기 의무 30일 이내.

BEGIN;

-- Purge function: DELETE expired rows, log count
CREATE OR REPLACE FUNCTION public.purge_expired_quote_requests()
  RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  WITH deleted AS (
    DELETE FROM public.quote_requests
    WHERE expires_at < now()
    RETURNING id
  )
  SELECT COUNT(*) INTO deleted_count FROM deleted;

  IF deleted_count > 0 THEN
    INSERT INTO public.quote_requests_purge_log (purged_count)
    VALUES (deleted_count);
  END IF;
END;
$$;

-- Register cron job (idempotent: IF EXISTS guard required — cron.unschedule raises on missing job in pg_cron 1.6)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'purge-expired-quote-requests') THEN
    PERFORM cron.unschedule('purge-expired-quote-requests');
  END IF;
END
$$;
SELECT cron.schedule(
  'purge-expired-quote-requests',
  '0 2 * * *',
  'SELECT public.purge_expired_quote_requests();'
);

COMMIT;
