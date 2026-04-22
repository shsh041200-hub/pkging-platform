-- KOR-253: 산업 카테고리 6→8개 확장
-- Adds fresh_produce_packaging and print_design_services to industry_categories (text[]).
-- No ALTER TYPE needed — industry_categories is already text[].

-- =====================================================================
-- 1. fresh_produce_packaging — 농산물·신선 포장
--    Keywords defined by CMO in KOR-252:
--    신선, 신선식품, 콜드체인, 냉장, 냉동, 농산물, 청과, 산지, 보냉,
--    CA포장, MAP포장, 저온유통, 진공포장, 신선도유지, 에어캡포장, 스티로폼박스
-- =====================================================================

UPDATE companies
SET industry_categories = array_append(industry_categories, 'fresh_produce_packaging')
WHERE (
  COALESCE(description, '') ILIKE ANY(ARRAY[
    '%신선식품%', '%콜드체인%', '%냉장%', '%냉동%', '%농산물%',
    '%청과%', '%산지%', '%보냉%', '%CA포장%', '%MAP포장%',
    '%저온유통%', '%진공포장%', '%신선도유지%', '%에어캡포장%', '%스티로폼박스%',
    '%신선 포장%', '%신선포장%'
  ])
)
AND NOT ('fresh_produce_packaging' = ANY(COALESCE(industry_categories, '{}')));

-- =====================================================================
-- 2. print_design_services — 인쇄·디자인 서비스
--    Keywords defined by CMO in KOR-252:
--    인쇄, 디자인, 그래픽디자인, 패키지디자인, 인쇄소, 소량인쇄,
--    라벨인쇄, 스티커인쇄, 박스디자인, 포장디자인, 레이저인쇄,
--    오프셋인쇄, 디지털인쇄, 인쇄제작, 포장인쇄
--    Also catches companies already tagged as design_service.
-- =====================================================================

UPDATE companies
SET industry_categories = array_append(industry_categories, 'print_design_services')
WHERE (
  'design_service' = ANY(COALESCE(tags, '{}'))
  OR COALESCE(description, '') ILIKE ANY(ARRAY[
    '%그래픽디자인%', '%패키지디자인%', '%인쇄소%', '%소량인쇄%',
    '%라벨인쇄%', '%스티커인쇄%', '%박스디자인%', '%포장디자인%',
    '%레이저인쇄%', '%오프셋인쇄%', '%디지털인쇄%', '%인쇄제작%', '%포장인쇄%'
  ])
)
AND NOT ('print_design_services' = ANY(COALESCE(industry_categories, '{}')));

-- =====================================================================
-- Down migration (reverse if needed):
-- UPDATE companies
--   SET industry_categories = array_remove(industry_categories, 'fresh_produce_packaging');
-- UPDATE companies
--   SET industry_categories = array_remove(industry_categories, 'print_design_services');
-- =====================================================================
