-- PACAA-585 Step 2: companies.name PII 패턴 audit
-- Supabase SQL Editor (또는 psql)에서 실행 → 결과를 CEO 에게 보고 후 Step 3(redact) 진행.
-- 읽기 전용 쿼리 — 데이터 변경 없음.

SELECT
  id,
  slug,
  name,
  length(name) AS name_len,
  CASE
    WHEN name ~ '\d{2,4}-\d{3,4}-\d{4}' THEN 'PHONE'
    WHEN name LIKE '%@%'                 THEN 'EMAIL'
    WHEN name ~ '[가-힣]{2,4}\s+\d'      THEN 'NAME+NUM'
    ELSE 'LONG'
  END AS pii_pattern
FROM companies
WHERE
      name ~ '\d{2,4}-\d{3,4}-\d{4}'   -- 전화번호 패턴
   OR name LIKE '%@%'                   -- 이메일
   OR name ~ '[가-힣]{2,4}\s+\d'        -- 한글 이름 + 숫자
   OR length(name) > 50                 -- 비정상적으로 긴 이름
ORDER BY pii_pattern, length(name) DESC;
