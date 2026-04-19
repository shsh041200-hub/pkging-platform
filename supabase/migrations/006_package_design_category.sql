-- KOR-24: 패키지 디자인 카테고리 추가 + 고품질 업체 데이터 확장

-- 1. 새 카테고리 타입 추가
ALTER TYPE category_type ADD VALUE IF NOT EXISTS 'package_design';

-- 2. 패키지 디자인 전문 업체 10개 추가
insert into companies (slug, name, description, category, subcategory, province, city, phone, email, website, products, certifications, is_verified)
values

-- ============================================================
-- 패키지 디자인 (package_design) — 10개
-- 브랜드 패키징 디자인 에이전시 / 패키지 디자인 전문 스튜디오
-- ============================================================
(
  'studio-pact-design',
  '스튜디오팩트',
  '식품·화장품·뷰티 브랜드 패키지 디자인 전문 스튜디오. 브랜드 아이덴티티 개발부터 양산 인쇄 감리까지 원스톱 제공.',
  'package_design', '브랜드/뷰티',
  '서울특별시', '마포구',
  '02-000-1101', 'hello@studiopact.kr', 'https://studiopact.kr',
  ARRAY['브랜드 패키지 디자인', '라벨 디자인', '식품 패키징 디자인', '화장품 패키징'],
  ARRAY['디자인등록특허', 'BX 컨설팅'],
  true
),
(
  'packing-story-design',
  '패킹스토리',
  '스타트업·중소기업 전용 패키지 디자인 플랫폼. 소량 맞춤 패키징 디자인 + 인쇄 연계 서비스.',
  'package_design', '스타트업/중소기업',
  '서울특별시', '성동구',
  '02-000-1102', 'hello@packingstory.co.kr', 'https://packingstory.co.kr',
  ARRAY['소량 패키지 디자인', '박스 디자인', '브랜드 패키징', '인쇄 연계'],
  ARRAY[],
  false
),
(
  'orangedesign-packaging',
  '오렌지디자인',
  '30년 경력 패키지 디자인 전문기업. 식품·음료·제약·화장품 전 분야 패키징 디자인 및 제작 총괄.',
  'package_design', '식품/음료/제약',
  '서울특별시', '강남구',
  '02-000-1103', 'biz@orangedesign.co.kr', 'https://orangedesign.co.kr',
  ARRAY['식품 패키지 디자인', '음료 레이블 디자인', '제약 포장 디자인', '패키징 컨설팅'],
  ARRAY['ISO 9001', '한국디자인진흥원 우수기업'],
  true
),
(
  'bdesign-brand-package',
  '비디자인',
  '브랜드 중심 패키지 디자인 에이전시. D2C·이커머스 브랜드의 언박싱 경험 설계 특화.',
  'package_design', '이커머스/D2C',
  '서울특별시', '용산구',
  '02-000-1104', 'project@bdesign.kr', 'https://bdesign.kr',
  ARRAY['D2C 패키지 디자인', '언박싱 디자인', '이커머스 박스 디자인', '브랜드 아이덴티티'],
  ARRAY[],
  true
),
(
  'greenpack-design-studio',
  '그린팩디자인',
  '친환경 소재 기반 패키지 디자인 전문 스튜디오. FSC·생분해 소재 적용 패키징 디자인 및 친환경 인증 취득 지원.',
  'package_design', '친환경/지속가능',
  '경기도', '파주시',
  '031-000-1105', 'eco@greenpackdesign.kr', null,
  ARRAY['친환경 패키지 디자인', 'FSC 소재 패키징', '생분해 라벨 디자인', '지속가능 브랜딩'],
  ARRAY['FSC 인증', 'ISO 14001'],
  true
),
(
  'daegu-designpack',
  '대구디자인팩',
  '대구·경북권 로컬 브랜드 패키지 디자인 전문사. 지역 농수특산물·전통주·식품 패키징 디자인 특화.',
  'package_design', '로컬브랜드/특산물',
  '대구광역시', '중구',
  '053-000-1106', 'hello@designpack.kr', null,
  ARRAY['특산물 패키지 디자인', '전통주 라벨 디자인', '선물 패키징 디자인', '지역 브랜딩'],
  ARRAY[],
  false
),
(
  'busan-creative-pack',
  '부산크리에이티브팩',
  '부산 기반 종합 패키지 디자인 회사. 제조업·수출 기업 대상 글로벌 패키징 디자인 및 다국어 라벨 제작.',
  'package_design', '글로벌/수출',
  '부산광역시', '해운대구',
  '051-000-1107', 'global@creativepack.kr', 'https://creativepack.kr',
  ARRAY['글로벌 패키지 디자인', '다국어 라벨 디자인', '수출용 패키징', '브랜드 패키지'],
  ARRAY['ISO 9001'],
  true
),
(
  'forma-packaging-design',
  '포르마패키징',
  '프리미엄 화장품·뷰티·라이프스타일 브랜드 패키지 디자인. 리테일 POP 및 디스플레이 패키징 설계 포함.',
  'package_design', '프리미엄/코스메틱',
  '서울특별시', '강남구',
  '02-000-1108', 'studio@forma-pkg.kr', 'https://forma-pkg.kr',
  ARRAY['코스메틱 패키지 디자인', '프리미엄 박스 디자인', 'POP 디스플레이 디자인', '뷰티 브랜딩'],
  ARRAY['한국디자인진흥원 우수기업'],
  true
),
(
  'gwangju-craft-pack',
  '광주크래프트팩',
  '광주·전남 로컬 푸드 브랜드 전문 패키지 디자인사. 전통 한지·한국적 패턴 적용 패키징 디자인 강점.',
  'package_design', '한국전통/크래프트',
  '광주광역시', '동구',
  '062-000-1109', null, null,
  ARRAY['한국 전통 패키지 디자인', '한지 포장 디자인', '전통주 라벨', '전통 선물 패키징'],
  ARRAY[],
  false
),
(
  'designfarm-packaging',
  '디자인팜',
  '농식품·건강기능식품·HMR 전문 패키지 디자인 에이전시. 유통 채널별(백화점·편의점·온라인) 패키징 전략 설계.',
  'package_design', '농식품/HMR',
  '경기도', '성남시',
  '031-000-1110', 'farm@designfarm.kr', 'https://designfarm.kr',
  ARRAY['농식품 패키지 디자인', 'HMR 포장 디자인', '건강기능식품 패키징', '유통채널별 패키징'],
  ARRAY['ISO 9001', '한국디자인진흥원 우수기업'],
  true
)

ON CONFLICT (slug) DO NOTHING;
