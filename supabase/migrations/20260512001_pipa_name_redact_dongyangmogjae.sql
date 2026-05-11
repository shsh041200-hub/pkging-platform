-- PACAA-585 Step 3: dongyangmogjae name PII redaction + is_hidden 해제
-- Audit run (pipa-name-audit-25679020680, 2026-05-12):
--   dongyangmogjae: PHONE+EMAIL 패턴 확인 — 유일한 실제 PII 레코드.
-- Original name preserved in GitHub Actions artifact 6922282991 + git history.
--
-- 처리 정책:
--   seutateubagseu-pulpilmeonteu-3pl-jungangsenteo → false positive (사업명), 변경 없음
--   gwangmyeongmogjae-2gongjang                   → false positive (사업명), 변경 없음
--   dongyangmogjae → "㈜동양목재" 정규화 + is_hidden=false 복원

DO $$
DECLARE
  v_id    uuid;
  v_name  text;
  v_count int;
BEGIN
  SELECT id, name INTO v_id, v_name
  FROM companies
  WHERE slug = 'dongyangmogjae';

  IF v_id IS NULL THEN
    RAISE NOTICE '[PACAA-585 Step3] dongyangmogjae slug not found — skipped';
    RETURN;
  END IF;

  IF v_name = '㈜동양목재' THEN
    RAISE NOTICE '[PACAA-585 Step3] name already redacted — skipped';
    RETURN;
  END IF;

  -- name 정규화 + is_hidden 해제 (P0 임시 차단 해제)
  UPDATE companies
  SET
    name      = '㈜동양목재',
    is_hidden = false
  WHERE id = v_id;

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RAISE NOTICE '[PACAA-585 Step3] dongyangmogjae: name redacted + is_hidden=false (% row)', v_count;
END$$;
