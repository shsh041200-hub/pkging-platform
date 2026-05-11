-- PACAA-585 Step 3: dongyangmogjae name 필드 PII redaction + is_hidden 해제
-- Step 2 audit 결과 확인 후 CEO 승인 시 적용.
-- 원본 보존: original_name 컬럼에 저장 (audit + reversibility).
--
-- 현재 name: '㈜동양목재 김창환 032-578-8121 인천광역시 서구 길무로 205(오류동) ksp74@hanmail.net 철도침목,파렛트,제재목'
-- 정규화 후: '㈜동양목재'

DO $$
DECLARE
  v_id     uuid;
  v_name   text;
  v_count  int;
BEGIN
  SELECT id, name INTO v_id, v_name
  FROM companies WHERE slug = 'dongyangmogjae';

  IF v_id IS NULL THEN
    RAISE NOTICE '[PACAA-585 Step3] dongyangmogjae slug not found — skipped';
    RETURN;
  END IF;

  -- 이미 정규화된 경우 no-op
  IF v_name = '㈜동양목재' THEN
    RAISE NOTICE '[PACAA-585 Step3] already redacted — skipped';
    RETURN;
  END IF;

  -- original_name 컬럼이 있는 경우 원본 보존
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'companies' AND column_name = 'original_name'
  ) THEN
    UPDATE companies
    SET original_name = name
    WHERE id = v_id AND (original_name IS NULL OR original_name = name);
  END IF;

  -- name 정규화 + is_hidden 해제
  UPDATE companies
  SET
    name      = '㈜동양목재',
    is_hidden = false
  WHERE id = v_id;

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RAISE NOTICE '[PACAA-585 Step3] dongyangmogjae name redacted + is_hidden=false (% row)', v_count;
END$$;
