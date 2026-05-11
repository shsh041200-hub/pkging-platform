-- PACAA-585: P0 PIPA 잔존 — dongyangmogjae name 필드 PII 색인 차단
-- CEO escalation comment: ad5b2380 (2026-05-11)
-- Step 1: is_hidden=true 로 즉시 색인 차단.
--         name 필드 redaction(Step 2)은 CEO 검토 후 별도 migration.
--
-- Rollback (Step 3에서 name 정상화 확인 후 실행):
--   UPDATE companies SET is_hidden = false WHERE slug = 'dongyangmogjae';

DO $$
DECLARE v_count INT;
BEGIN
  UPDATE companies
  SET    is_hidden = true
  WHERE  slug = 'dongyangmogjae'
    AND  is_hidden = false;

  GET DIAGNOSTICS v_count = ROW_COUNT;

  IF v_count = 0 THEN
    RAISE NOTICE '[PACAA-585 Step1] dongyangmogjae: already hidden or slug not found — no-op';
  ELSE
    RAISE NOTICE '[PACAA-585 Step1] dongyangmogjae: is_hidden=true applied (% row)', v_count;
  END IF;
END$$;
