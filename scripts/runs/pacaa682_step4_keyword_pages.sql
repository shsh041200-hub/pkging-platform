-- PACAA-682 Step 4: Update keyword_pages category column
-- Corrected mapping: paper → corrugated_box (corrugated slugs)
-- Corrected mapping: paper → label_sticker (sticker/label slugs)
-- REQUIRES: companies with corrugated_box/label_sticker categories to exist first
-- REQUIRES: CEO approval before running
-- Idempotency: WHERE category='paper' guard prevents double-run

BEGIN;

-- 4a: corrugated_box keyword pages (3 clear corrugated slugs)
UPDATE keyword_pages SET category = 'corrugated_box'
WHERE slug IN (
  '골판지박스-제작',
  '택배박스-제작',
  '택배박스-가격',
  '택배박스-도매'
)
AND category = 'paper';
-- Expected: 4 rows updated

-- 4b: label_sticker keyword pages (8 sticker/label slugs)
UPDATE keyword_pages SET category = 'label_sticker'
WHERE slug IN (
  '라벨-스티커-제작',
  '스티커-인쇄-업체',
  '의류-라벨-제작',
  '소량-스티커-제작',
  '방수-스티커-제작',
  '홀로그램-스티커-제작',
  '스티커-제작',
  '스티커-주문제작'
)
AND category = 'paper';
-- Expected: 8 rows updated

-- Verification:
-- SELECT slug, category FROM keyword_pages WHERE slug IN (
--   '골판지박스-제작','택배박스-제작','택배박스-가격','택배박스-도매',
--   '라벨-스티커-제작','스티커-인쇄-업체','의류-라벨-제작','소량-스티커-제작',
--   '방수-스티커-제작','홀로그램-스티커-제작','스티커-제작','스티커-주문제작'
-- );
-- Expected: 4 corrugated_box + 8 label_sticker

ROLLBACK; -- Change to COMMIT after CEO approval
