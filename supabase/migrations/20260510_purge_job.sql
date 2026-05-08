BEGIN;

-- ──────────────────────────────────────────────────────────────────────────────
-- PACAA-384 — PIPA §39-3 자동 파기 잡
-- pg_cron 활성화 + 매일 02:00 UTC 만료 레코드 삭제
-- ──────────────────────────────────────────────────────────────────────────────

-- 1. Enable pg_cron (Supabase Free 지원; superuser 권한으로 실행)
CREATE EXTENSION IF NOT EXISTS pg_cron;

GRANT USAGE ON SCHEMA cron TO postgres;

-- 2. Purge function — DELETE + log in one atomic CTE
CREATE OR REPLACE FUNCTION public.purge_expired_quote_requests()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  WITH deleted AS (
    DELETE FROM public.quote_requests
    WHERE expires_at < now()
    RETURNING id
  )
  INSERT INTO public.quote_requests_purge_log (purged_count)
  SELECT count(*) FROM deleted;
END;
$$;

-- 3. Schedule: 매일 02:00 UTC (idempotent — 기존 job 있으면 제거 후 재등록)
DO $$
BEGIN
  PERFORM cron.unschedule('purge-expired-quote-requests');
EXCEPTION WHEN OTHERS THEN
  NULL;
END;
$$;

SELECT cron.schedule(
  'purge-expired-quote-requests',
  '0 2 * * *',
  $$SELECT public.purge_expired_quote_requests();$$
);

COMMIT;
