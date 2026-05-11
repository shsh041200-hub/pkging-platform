-- PACAA-585 Step 4: companies.name PII 패턴 거부 CHECK constraint
-- NOT VALID: 기존 row 검증 건너뜀 — 신규 INSERT/UPDATE 만 차단.
-- 기존 오염 레코드(dongyangmogjae 포함) Step 2/3 정리 후
--   ALTER TABLE companies VALIDATE CONSTRAINT companies_name_no_pii;
-- 로 전체 검증 완료.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'companies_name_no_pii'
      AND conrelid = 'companies'::regclass
  ) THEN
    ALTER TABLE companies
      ADD CONSTRAINT companies_name_no_pii CHECK (
        name !~ '\d{2,4}-\d{3,4}-\d{4}'  -- 전화번호 패턴
        AND name NOT LIKE '%@%'           -- 이메일
      ) NOT VALID;
    RAISE NOTICE '[PACAA-585 Step4] companies_name_no_pii CHECK constraint added (NOT VALID)';
  ELSE
    RAISE NOTICE '[PACAA-585 Step4] companies_name_no_pii already exists — skipped';
  END IF;
END$$;
