-- Additional seed data: 18 more companies across all categories and regions
insert into companies (slug, name, description, category, subcategory, province, city, phone, email, website, products, certifications, is_verified) values

-- 산업용 (saneobyong) — 3개 추가
(
  'busan-industrial-pack',
  '부산산업포장',
  '부산항 물류 특화 대형 산업용 포장재 제조. 중공업·해양 산업 납품 이력 다수.',
  'saneobyong',
  '중공업/해양',
  '부산광역시', '사하구', '051-000-1001', 'info@bip.co.kr', 'https://bip.co.kr',
  ARRAY['중포장 골판지', '방청 포장재', '목재 크레이트', '스트레치 필름'],
  ARRAY['KS Q ISO 9001', 'AEO 인증'],
  true
),
(
  'daejeon-tech-packaging',
  '대전테크패키징',
  '반도체·전자 부품 정밀 포장 전문. ESD 방지 포장재 국내 점유율 상위권.',
  'saneobyong',
  '정밀/전자',
  '대전광역시', '유성구', '042-000-1002', 'sales@dtpack.kr', null,
  ARRAY['ESD 방지 백', '거품 완충재', '정밀 부품 트레이', '클린룸 포장재'],
  ARRAY['KS Q ISO 9001', 'ESD 인증'],
  true
),
(
  'gangwon-forest-pack',
  '강원포레스트팩',
  '목재 및 천연 소재 기반 산업용 패키징. 강원 임산자원 활용 친환경 산업포장.',
  'saneobyong',
  '목재/천연',
  '강원도', '춘천시', '033-000-1003', null, null,
  ARRAY['원목 팔레트', '목재 포장 상자', '왕겨 완충재'],
  ARRAY['산림청 인증'],
  false
),

-- 식품등급 (food_grade) — 3개 추가
(
  'gyeonggi-food-pack',
  '경기푸드팩',
  '수도권 최대 식품 포장재 공급사. HACCPㆍ식품위생법 기준 충족 제품 전문.',
  'food_grade',
  '가공식품',
  '경기도', '평택시', '031-000-2001', 'order@kfoodpack.kr', 'https://kfoodpack.kr',
  ARRAY['식품용 PP 트레이', 'MAP 포장재', '실링 필름', '냉동식품 박스'],
  ARRAY['HACCP 인증', 'ISO 22000', '식품위생법 적합'],
  true
),
(
  'jeonnam-fresh-pack',
  '전남프레시팩',
  '남도 농수산물 신선식품 포장 특화. 저온 유통 포장재 및 산지 직납 서비스.',
  'food_grade',
  '신선/농수산',
  '전라남도', '목포시', '061-000-2002', null, null,
  ARRAY['스티로폼 박스', '아이스팩 세트', '진공 필름', '그물망 포장'],
  ARRAY['HACCP 인증'],
  false
),
(
  'jeju-organic-pack',
  '제주오가닉팩',
  '제주산 유기농 식품 전용 친환경 포장재. 감귤·흑돼지 브랜드 포장 제작 경험 풍부.',
  'food_grade',
  '유기농/로컬',
  '제주특별자치도', '제주시', '064-000-2003', 'hello@jejupack.kr', 'https://jejupack.kr',
  ARRAY['친환경 식품 박스', '제주 브랜드 쇼핑백', '무독성 완충재'],
  ARRAY['유기가공식품 인증', 'HACCP 인증'],
  true
),

-- 지류 (jiryu) — 3개 추가
(
  'gyeonggi-paper-box',
  '경기페이퍼박스',
  '파주·일산 출판·인쇄 단지 인근 지류 패키징 전문. 다양한 판형 맞춤 제작.',
  'jiryu',
  '인쇄/출판',
  '경기도', '파주시', '031-000-3001', 'cs@kpbox.kr', null,
  ARRAY['단상자', '조립식 박스', '인쇄 포장지', '카탈로그 박스'],
  ARRAY['FSC 인증'],
  true
),
(
  'busan-luxury-paper',
  '부산럭셔리페이퍼',
  '프리미엄 브랜드 종이 포장재 ODM. 고급 텍스처 용지·특수 코팅 전문.',
  'jiryu',
  '명품/프리미엄',
  '부산광역시', '해운대구', '051-000-3002', 'biz@busanluxpack.com', 'https://busanluxpack.com',
  ARRAY['리본 선물박스', '자개 문양 포장지', '금박 쇼핑백', '서랍형 박스'],
  ARRAY['ISO 9001'],
  true
),
(
  'daegu-paper-craft',
  '대구페이퍼크래프트',
  '섬유·패션 브랜드 대상 감성 지류 패키징. 환경 인쇄 잉크 사용으로 VOC 저감.',
  'jiryu',
  '패션/라이프스타일',
  '대구광역시', '달서구', '053-000-3003', null, null,
  ARRAY['패션 쇼핑백', '행택', '티슈 페이퍼', '친환경 리본'],
  ARRAY['친환경 인쇄 인증'],
  false
),

-- 플라스틱 (plastic) — 2개 추가
(
  'gwangju-pet-tech',
  '광주PET테크',
  '음료·식품용 PET 용기 전문 제조사. 경량화 설계로 플라스틱 사용량 20% 절감.',
  'plastic',
  'PET',
  '광주광역시', '광산구', '062-000-4001', 'pettech@gjpack.kr', 'https://gjpack.kr',
  ARRAY['PET 생수병', 'PET 주스 용기', '투명 PET 트레이'],
  ARRAY['KS 표시 인증', 'ISO 9001'],
  true
),
(
  'chungbuk-pp-industry',
  '충북PP산업',
  'PP 사출 및 압출 성형 전문. 자동차·가전 부품 포장용 커스텀 트레이 제작.',
  'plastic',
  'PP/사출',
  '충청북도', '청주시', '043-000-4002', null, null,
  ARRAY['PP 컨테이너', '사출 트레이', 'PP 팔레트', '분리수거 박스'],
  ARRAY['ISO 14001'],
  false
),

-- 금속 (metal) — 4개 추가 (현재 0개이므로 집중 확충)
(
  'incheon-metal-can',
  '인천메탈캔',
  '국내 1위 금속 캔 전문 제조사. 음료·식품·화학 산업용 금속 캔 풀라인업.',
  'metal',
  '음료/식품캔',
  '인천광역시', '서구', '032-000-5001', 'sales@metalcan.co.kr', 'https://metalcan.co.kr',
  ARRAY['알루미늄 음료캔', '주석 식품캔', '뚜껑형 금속 캔', '산업용 드럼'],
  ARRAY['KS Q ISO 9001', 'BRC 식품 포장 인증'],
  true
),
(
  'seoul-steel-pack',
  '서울스틸팩',
  '스틸 드럼 및 금속 컨테이너 전문. 화학·도료·윤활유 산업 납품 이력 15년.',
  'metal',
  '드럼/컨테이너',
  '서울특별시', '금천구', '02-000-5002', 'info@steelpack.kr', null,
  ARRAY['스틸 드럼 200L', '금속 컨테이너', '클로즈드헤드 드럼', '부속 피팅'],
  ARRAY['UN 위험물 포장 인증', 'ISO 9001'],
  true
),
(
  'ulsan-aluminum-tech',
  '울산알루미늄테크',
  '자동차·방산 산업용 알루미늄 포장재 전문. 경량 고강도 구조 설계.',
  'metal',
  '알루미늄/방산',
  '울산광역시', '북구', '052-000-5003', 'biz@ualutech.kr', 'https://ualutech.kr',
  ARRAY['알루미늄 케이스', '방진 금속 박스', '알루미늄 팔레트', '클린룸 알루미늄 트레이'],
  ARRAY['방산품질보증인증', 'ISO 9001', 'ISO 14001'],
  true
),
(
  'gyeongnam-tin-pack',
  '경남틴팩',
  '틴케이스 및 금속 선물 포장 전문. 식품·차류·특산물 브랜딩 맞춤 제작.',
  'metal',
  '틴케이스/선물',
  '경상남도', '진주시', '055-000-5004', null, null,
  ARRAY['원형 틴케이스', '사각 틴박스', '힌지형 금속 캔', '엠보싱 틴'],
  ARRAY['KS 표시 인증'],
  false
),

-- 친환경 (eco) — 3개 추가
(
  'jeonbuk-eco-pack',
  '전북에코팩',
  '100% 재생 원료 기반 친환경 포장재 전문. 기업 ESG 패키징 컨설팅 서비스 제공.',
  'eco',
  '재생/업사이클',
  '전라북도', '전주시', '063-000-6001', 'eco@jbpack.kr', 'https://jbpack.kr',
  ARRAY['재생지 박스', '업사이클 쇼핑백', '대나무 완충재', '식물성 테이프'],
  ARRAY['GRS(글로벌재활용표준) 인증', 'FSC 인증', 'ISO 14001'],
  true
),
(
  'gyeongbuk-natural-pack',
  '경북내추럴팩',
  '마·짚·왕겨 등 국산 천연 소재 활용 친환경 포장. 전통 소재와 현대 물류의 융합.',
  'eco',
  '천연/전통소재',
  '경상북도', '안동시', '054-000-6002', null, null,
  ARRAY['한지 포장지', '왕겨 완충재', '마 망사 포장', '볏짚 완충 트레이'],
  ARRAY['친환경 우수 제품 인증'],
  false
),
(
  'gangwon-bio-pack',
  '강원바이오팩',
  '옥수수·사탕수수 기반 생분해성 포장재 R&D 및 양산. 국내 PLA 포장재 선도 기업.',
  'eco',
  '생분해/바이오',
  '강원도', '원주시', '033-000-6003', 'r&d@gangwonbio.kr', 'https://gangwonbio.kr',
  ARRAY['PLA 트레이', '생분해 비닐백', '옥수수 전분 완충재', '바이오 테이프'],
  ARRAY['OK Compost 인증', 'ISO 14001', 'GRS 인증'],
  true
);
