-- PACAA-585 Step 4: companies_name_no_pii CHECK constraint VALIDATE
-- 선결: 20260512001_pipa_name_redact_dongyangmogjae.sql 적용 후 실행해야 함.
-- dongyangmogjae name 정규화 완료 시 constraint 위반 row 없음 → VALIDATE 안전.
--
-- VALIDATE 이유: NOT VALID constraint 는 기존 row 를 검증하지 않음.
--   VALIDATE 후 신규 + 기존 전체 row 가 phone/email 패턴 없음이 보장됨.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'companies_name_no_pii'
      AND conrelid = 'companies'::regclass
      AND NOT convalidated
  ) THEN
    ALTER TABLE companies VALIDATE CONSTRAINT companies_name_no_pii;
    RAISE NOTICE '[PACAA-585 Step4] companies_name_no_pii constraint VALIDATED';
  ELSE
    RAISE NOTICE '[PACAA-585 Step4] constraint already valid or not found — skipped';
  END IF;
END$$;
