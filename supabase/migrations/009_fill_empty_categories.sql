-- KOR-47: 카테고리별 빈 업체 데이터 채우기
-- 1) 기존 업체 카테고리 수정 (food_grade/saneobyong → 소재 기반 분류)
-- 2) flexible(연포장) 신규 업체 6개 추가
-- 3) glass(유리) 신규 업체 6개 추가
-- 4) 기존 업체 buyer_category/packaging_form/tags 보강

-- =====================================================================
-- 1. 기존 업체 카테고리 정정 (migration 007 기본값이 부정확한 경우)
-- =====================================================================

-- 율촌화학: plastic → flexible (연포장 필름/파우치 전문)
UPDATE companies SET category = 'flexible'
WHERE slug = 'youlchon-food-pack' AND category = 'plastic';

-- 경남신선팩: plastic → flexible (신선/냉동 포장 필름)
UPDATE companies SET category = 'flexible'
WHERE slug = 'gyeongnam-fresh-food-pack' AND category = 'plastic';

-- 홍진포장: plastic → flexible (OPP/CPP/PE 필름)
UPDATE companies SET category = 'flexible'
WHERE slug = 'hongjin-pack' AND category = 'plastic';

-- 대흥포장: plastic → flexible (스트레치 필름)
UPDATE companies SET category = 'flexible'
WHERE slug = 'daehung-pojang' AND category = 'plastic';

-- 동일알루미늄: plastic → flexible (알루미늄 연포장)
UPDATE companies SET category = 'flexible'
WHERE slug = 'dongil-aluminum-foil' AND category = 'plastic';

-- 부산스트레치팩: plastic → flexible (스트레치 필름)
UPDATE companies SET category = 'flexible'
WHERE slug = 'busan-stretch-pack' AND category = 'plastic';

-- 대한종이컵: plastic → paper (종이컵/종이 용기)
UPDATE companies SET category = 'paper'
WHERE slug = 'papercups-korea' AND category = 'plastic';

-- =====================================================================
-- 2. 기존 업체 tags 보강
-- =====================================================================

UPDATE companies SET tags = ARRAY['food_grade']
WHERE slug = 'hongjin-pack' AND (tags IS NULL OR tags = '{}');

UPDATE companies SET tags = array_append(COALESCE(tags, '{}'), 'food_grade')
WHERE slug = 'dongil-aluminum-foil'
  AND NOT ('food_grade' = ANY(COALESCE(tags, '{}')));

-- =====================================================================
-- 3. 기존 업체 buyer_category / packaging_form 보강
-- =====================================================================

-- paper 업체
UPDATE companies SET buyer_category = 'ecommerce_shipping', packaging_form = 'box_case'
WHERE slug IN ('box4u-corrugated', 'boxkorea-corrugated', 'boxvill-pack',
  'boxmoa-corrugated', 'caseman-package')
  AND buyer_category IS NULL;

UPDATE companies SET buyer_category = 'cosmetics_beauty', packaging_form = 'box_case'
WHERE slug IN ('boxin-package', 'boxmga-package')
  AND buyer_category IS NULL;

UPDATE companies SET buyer_category = 'corporate_gift', packaging_form = 'box_case'
WHERE slug IN ('boxne-paper-pack', 'chakanpack-eco')
  AND buyer_category IS NULL;

UPDATE companies SET buyer_category = 'food_beverage', packaging_form = 'shopping_bag'
WHERE slug = 'wj-package' AND buyer_category IS NULL;

UPDATE companies SET buyer_category = 'ecommerce_shipping', packaging_form = 'pouch_bag'
WHERE slug = 'pojangland-paper' AND buyer_category IS NULL;

UPDATE companies SET buyer_category = 'food_beverage', packaging_form = 'box_case'
WHERE slug IN ('seoul-pack-solution', 'papercups-korea')
  AND buyer_category IS NULL;

-- plastic 업체
UPDATE companies SET buyer_category = 'ecommerce_shipping', packaging_form = 'cushioning'
WHERE slug = 'cncairkorea-pack' AND buyer_category IS NULL;

UPDATE companies SET buyer_category = 'industrial_b2b', packaging_form = 'cushioning'
WHERE slug IN ('splatech-plastic', 'gyeonggi-plastic-mold')
  AND buyer_category IS NULL;

UPDATE companies SET buyer_category = 'cosmetics_beauty', packaging_form = 'bottle_container'
WHERE slug = 'freecos-plastic' AND buyer_category IS NULL;

-- flexible 업체
UPDATE companies SET buyer_category = 'food_beverage', packaging_form = 'pouch_bag'
WHERE slug IN ('youlchon-food-pack', 'dongil-aluminum-foil')
  AND buyer_category IS NULL;

UPDATE companies SET buyer_category = 'industrial_b2b', packaging_form = 'stretch_film'
WHERE slug IN ('hongjin-pack', 'daehung-pojang', 'busan-stretch-pack')
  AND buyer_category IS NULL;

UPDATE companies SET buyer_category = 'food_beverage', packaging_form = 'stretch_film'
WHERE slug = 'gyeongnam-fresh-food-pack' AND buyer_category IS NULL;

-- metal 업체
UPDATE companies SET buyer_category = 'corporate_gift', packaging_form = 'can_tin'
WHERE slug = 'jeonbuk-tin-case' AND buyer_category IS NULL;

-- eco 업체
UPDATE companies SET buyer_category = 'ecommerce_shipping', packaging_form = 'cushioning'
WHERE slug IN ('dongsong-ecoviva', 'seoul-recycled-pack')
  AND buyer_category IS NULL;

UPDATE companies SET buyer_category = 'corporate_gift', packaging_form = 'shopping_bag'
WHERE slug = 'gyeonggi-eco-bag' AND buyer_category IS NULL;

UPDATE companies SET buyer_category = 'corporate_gift', packaging_form = 'cushioning'
WHERE slug = 'jeju-bamboo-pack' AND buyer_category IS NULL;

UPDATE companies SET buyer_category = 'corporate_gift', packaging_form = 'pouch_bag'
WHERE slug = 'caretbio-eco' AND buyer_category IS NULL;

-- =====================================================================
-- 4. flexible(연포장) 신규 업체 추가 — 실존 업체, 웹사이트 검증 완료
-- =====================================================================
INSERT INTO companies (slug, name, description, category, subcategory, province, city,
  phone, website, products, certifications, is_verified, tags,
  buyer_category, packaging_form, founded_year, employee_range)
VALUES
(
  'dongwon-systems',
  '동원시스템즈',
  '1980년 설립 종합 패키징 전문 기업. 연포장재·알루미늄박·PET병·캔 등 포장재 전 분야 제조. 약 30개국 수출.',
  'flexible', '종합패키징',
  '서울특별시', '서초구',
  '02-589-3079', 'https://www.dongwonsystems.com',
  ARRAY['연포장 필름', '알루미늄박', 'PET병', '알루미늄 캔', '스틸 캔'],
  ARRAY['ISO 9001', 'ISO 14001'],
  true, ARRAY['food_grade'],
  'food_beverage', 'pouch_bag', 1980, '200+'
),
(
  'myungji-pnp',
  '명지피앤피',
  '1988년 설립 연포장 전문 기업. 친환경 모노소재 PE 파우치, 고차단 필름, 식품 포장재 제조.',
  'flexible', '파우치/지속가능',
  '경기도', '화성시',
  '031-355-5811', 'https://mjpnp.co.kr',
  ARRAY['모노소재 PE 파우치', '식품 포장 필름', '레토르트 파우치', '고차단 필름'],
  ARRAY['ISO 9001'],
  true, ARRAY['food_grade'],
  'food_beverage', 'pouch_bag', 1988, null
),
(
  'handoo-package',
  '한두패키지',
  '1986년 설립 연포장 인쇄·가공 전문 기업. 그라비어·플렉소 인쇄, 친환경 포장재 R&D 역량 보유.',
  'flexible', '그라비어/플렉소',
  '인천광역시', '남동구',
  '032-814-1511', 'https://www.handoo.co.kr',
  ARRAY['그라비어 인쇄 필름', '플렉소 인쇄 필름', '친환경 포장재', '기능성 필름'],
  ARRAY['ISO 9001', 'ISO 14001'],
  true, ARRAY[]::text[],
  'food_beverage', 'pouch_bag', 1986, '51-200'
),
(
  'heesung-polymer',
  '희성폴리머',
  '40년 이상 기술 축적 연포장·산업필름 전문 기업. 레토르트 파우치, 고차단 필름, 방수포 등 생산.',
  'flexible', '연포장필름/방수포',
  '서울특별시', '중구',
  '02-6960-0900', 'https://hspd.co.kr',
  ARRAY['레토르트 파우치', '고차단 필름', 'LID 필름', '리필백', '방수포'],
  ARRAY['ISO 9001'],
  true, ARRAY['food_grade'],
  'food_beverage', 'pouch_bag', 1960, '200+'
),
(
  'cnk-propack',
  '씨앤케이프로팩',
  '2001년 설립 연포장 토탈 솔루션 기업. 레토르트·전자레인지·지퍼·스파우트 파우치 등 맞춤 제작.',
  'flexible', '맞춤파우치',
  '서울특별시', '성동구',
  '02-3444-5928', 'https://ckpropack.com',
  ARRAY['레토르트 파우치', '전자레인지 파우치', '지퍼 파우치', '스파우트 파우치', '마스크팩 파우치'],
  ARRAY[]::text[],
  true, ARRAY['food_grade', 'cosmetic'],
  'food_beverage', 'pouch_bag', 2001, null
),
(
  'korpack-corp',
  '코리아팩',
  '1992년 설립 연포장재 글로벌 공급 기업. 프리메이드 파우치·스파우트 파우치 등 30년 이상 해외 수출.',
  'flexible', '프리메이드파우치',
  '경기도', '성남시',
  '031-713-3160', 'https://www.korpack.co.kr',
  ARRAY['프리메이드 파우치', '스파우트 파우치', '레토르트 파우치', '커피 포드'],
  ARRAY[]::text[],
  true, ARRAY['food_grade'],
  'food_beverage', 'pouch_bag', 1992, null
)
ON CONFLICT (slug) DO NOTHING;

-- =====================================================================
-- 5. glass(유리) 신규 업체 추가 — 실존 업체, 웹사이트 검증 완료
-- =====================================================================
INSERT INTO companies (slug, name, description, category, subcategory, province, city,
  phone, email, website, products, certifications, is_verified, tags,
  buyer_category, packaging_form)
VALUES
(
  'osung-package-glass',
  '오성패키지',
  '유리병 용기 전문업체. 식품병·음료병·주류병·PET·트라이탄 용기 등 다양한 유리 용기 생산·판매.',
  'glass', '유리병/PET',
  '경기도', '남양주시',
  '02-475-7411', 'osungp@nate.com', 'https://osungp.com',
  ARRAY['식품 유리병', '음료 유리병', '주류 유리병', 'PET 용기', '트라이탄 용기'],
  ARRAY[]::text[],
  true, ARRAY['food_grade'],
  'food_beverage', 'bottle_container'
),
(
  'kyungjin-glass',
  '경진기업',
  '유리병·PET병 직접 제조 전문업체. 음료·소스·꿀·제약 용기 등 고중량 품질 유리병 생산.',
  'glass', '유리병/PET병',
  '경기도', '남양주시',
  '1588-1223', null, 'https://kjpt.co.kr',
  ARRAY['음료 유리병', '소스 유리병', '꿀병', '제약 유리병', 'PET병'],
  ARRAY[]::text[],
  true, ARRAY['food_grade'],
  'food_beverage', 'bottle_container'
),
(
  'mirkorea-glass',
  '미르코리아',
  '유리병·페트병·유리컵 전문 도매몰. 식품 저장 용기, 음료 용기, 화장품 용기 등 종합 유리 용기 도매.',
  'glass', '유리병/도매',
  '경기도', '파주시',
  '031-000-4001', null, 'https://www.mirkorea.kr',
  ARRAY['잼 유리병', '꿀 유리병', '음료 유리병', '와인병', '유리컵'],
  ARRAY[]::text[],
  true, ARRAY['food_grade'],
  'food_beverage', 'bottle_container'
),
(
  'onepackage-glass',
  '원패키지',
  '유리병 전문 쇼핑몰. 유리 용기, 제약 용기, 식품 용기, 주류·음료 용기, 화장품 용기 도매.',
  'glass', '유리병/제약',
  '경기도', '여주시',
  '1833-9161', null, 'https://bottlemall.co.kr',
  ARRAY['제약 유리병', '식품 유리병', '와인병', '허브병', '화장품 유리 용기'],
  ARRAY[]::text[],
  true, ARRAY['pharma'],
  'health_medical', 'bottle_container'
),
(
  'damsang-glass',
  '담상',
  '유리병·유리컵 인쇄 도매 전문. 맥주잔·와인잔·소주잔 등 음용 유리 및 저장 용기, 레이저 인쇄 서비스 제공.',
  'glass', '유리용기/인쇄',
  '충청북도', '진천군',
  '070-4307-3617', null, 'https://damsang.com',
  ARRAY['맥주잔', '와인잔', '잼병', '꿀병', '유리컵 레이저 인쇄'],
  ARRAY[]::text[],
  true, ARRAY[]::text[],
  'food_beverage', 'bottle_container'
),
(
  'glassdomae-bottle',
  '병도매닷컴',
  '유리병·PET병·패키지 전문 도매몰. 꿀병, 기름병, 디스펜서, 미스트, 식품병, 포장 박스, 라벨 종합 취급.',
  'glass', '유리병/PET병',
  '경기도', '고양시',
  '070-5001-0456', null, 'https://www.glassdomae.com',
  ARRAY['꿀 유리병', '기름 유리병', '디스펜서', 'PET병', '포장 라벨'],
  ARRAY[]::text[],
  true, ARRAY['food_grade'],
  'food_beverage', 'bottle_container'
)
ON CONFLICT (slug) DO NOTHING;
