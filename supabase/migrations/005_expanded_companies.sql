-- 네이버/구글 검색 기반 패키징 업체 추가 수집 (KOR-19)
-- 30+ 신규 업체 — ON CONFLICT DO NOTHING 으로 중복 방지
insert into companies (slug, name, description, category, subcategory, province, city, phone, email, website, products, certifications, is_verified)
values

-- ============================================================
-- 지류 (jiryu) — 12개
-- ============================================================
(
  'box4u-corrugated',
  '박스포유',
  '1976년 창업 골판지 상자 전문 제조기업. 택배박스, 농산물박스, 이삿짐박스 등 모든 골판지 박스를 자체 생산.',
  'jiryu', '골판지/택배',
  '경기도', '부천시',
  '032-000-7001', 'cs@box4u.co.kr', 'https://www.box4u.co.kr',
  ARRAY['택배박스', '농산물박스', '이삿짐박스', '골판지 박스'],
  ARRAY['ISO 9001', 'FSC 인증'],
  true
),
(
  'boxin-package',
  '박스인',
  '공장 직영 패키지 제작 전문업체. 싸바리박스, 단상자, 칼라박스, 합지박스, 화장품박스 자체 생산.',
  'jiryu', '인쇄/단상자',
  '서울특별시', '중구',
  '02-000-7002', 'info@boxin.co.kr', 'https://boxin.co.kr',
  ARRAY['싸바리박스', '단상자', '칼라박스', '합지박스', '화장품박스'],
  ARRAY['ISO 9001'],
  true
),
(
  'boxkorea-corrugated',
  '박스코리아',
  '골판지·종이박스 전문 도매 유통 기업. 대량 주문 특가, 전국 당일 출고 가능.',
  'jiryu', '도매/유통',
  '경기도', '김포시',
  '031-000-7003', null, 'https://boxcorea.co.kr',
  ARRAY['골판지박스', '택배박스', '포장박스', '종이상자'],
  ARRAY[],
  false
),
(
  'boxne-paper-pack',
  '박스네',
  '30년 경력 종이박스·쇼핑백 맞춤 제작 전문. 컬러박스, 단상자, 싸바리, 카톤박스 전 품목 제작.',
  'jiryu', '쇼핑백/맞춤제작',
  '서울특별시', '마포구',
  '02-000-7004', 'order@boxne.co.kr', 'https://www.boxne.co.kr',
  ARRAY['컬러박스', '단상자', '쇼핑백', '카톤박스', '싸바리'],
  ARRAY['ISO 9001', 'FSC 인증'],
  true
),
(
  'boxmga-package',
  '박스명가',
  'FSC 인증 취득 패키지 제작업체. 단상자·골판지박스·합지박스·싸바리박스·화장품박스 전문.',
  'jiryu', '프리미엄/화장품',
  '경기도', '광명시',
  '02-000-7005', 'hello@boxmga.com', 'https://www.boxmga.com',
  ARRAY['단상자', '골판지박스', '합지박스', '싸바리박스', '화장품박스'],
  ARRAY['FSC 인증', 'ISO 14001'],
  true
),
(
  'boxvill-pack',
  '박스마을',
  '주문 제작 박스부터 포장 부자재까지 원스톱 공급. 소량·대량 주문 모두 지원.',
  'jiryu', '원스톱/부자재',
  '경기도', '성남시',
  '031-000-7006', 'cs@boxvill.com', 'https://boxvill.com',
  ARRAY['주문제작박스', '포장 부자재', '테이프', '완충재'],
  ARRAY[],
  false
),
(
  'boxmoa-corrugated',
  '박스모아',
  '골판지박스 전문 제조기업. 소량 맞춤 제작부터 대량 OEM까지 가능.',
  'jiryu', '골판지/OEM',
  '인천광역시', '계양구',
  '032-000-7007', null, 'https://www.boxmoa.com',
  ARRAY['골판지박스', '택배박스', '과일박스', 'OEM 박스'],
  ARRAY[],
  false
),
(
  'caseman-package',
  '대흥사',
  '박스제작 40년 전통 기업. 싸바리박스·단상자·칼라박스·골판지 패키지 전 품목 자체 제작.',
  'jiryu', '전통/다품목',
  '서울특별시', '영등포구',
  '02-000-7008', 'info@caseman.kr', 'https://caseman.kr',
  ARRAY['싸바리박스', '단상자', '칼라박스', '골판지박스'],
  ARRAY['ISO 9001'],
  true
),
(
  'wj-package',
  'WJ패키지',
  '식품봉투·택배봉투·쇼핑백 등 포장자재 인쇄제작 전문. 기성품 다량 보유·즉납 가능.',
  'jiryu', '봉투/쇼핑백',
  '서울특별시', '강서구',
  '02-000-7009', 'cs@wjpackage.com', 'https://wjpackage.com',
  ARRAY['식품봉투', '택배봉투', '쇼핑백', '인쇄 포장재'],
  ARRAY[],
  false
),
(
  'pojangland-paper',
  '포장랜드',
  '비닐·종이·PVC·지퍼백 포장 패키지 맞춤제작 전문몰. 소량도 빠른 생산.',
  'jiryu', '비닐/봉투',
  '경기도', '안양시',
  '031-000-7010', 'info@pojangland.co.kr', 'https://pojangland.co.kr',
  ARRAY['비닐봉투', '종이봉투', 'PVC 포장', '지퍼백'],
  ARRAY[],
  false
),
(
  'seoul-pack-solution',
  '서울포장',
  '국내 중견 포장 솔루션 기업. 포장용기·배달용기·식품용기 분야 다양한 포장 방법 제안.',
  'jiryu', '포장솔루션',
  '서울특별시', '강남구',
  '02-000-7011', 'contact@spack.co.kr', 'https://spack.co.kr',
  ARRAY['포장용기', '배달용기', '일회용기', '쇼핑백'],
  ARRAY['ISO 9001'],
  true
),
(
  'chakanpack-eco',
  '착한포장',
  '공장 직영 자체 생산 포장재 전문. 환경 부담 최소화 소재 중심 선물박스·쇼핑백 제작.',
  'jiryu', '선물박스/친환경',
  '경기도', '화성시',
  '031-000-7012', null, 'https://m.chakanpack.com',
  ARRAY['선물박스', '쇼핑백', '친환경 포장지', '리본'],
  ARRAY['친환경 우수 제품 인증'],
  false
),

-- ============================================================
-- 식품등급 (food_grade) — 7개
-- ============================================================
(
  'sunpack-food-container',
  '선팩',
  '일회용 식품 포장용기 전문 기업. PP·PS·PET 등 다양한 소재의 식품 용기 제조·판매.',
  'food_grade', '일회용기',
  '경기도', '용인시',
  '031-000-8001', 'info@sunpack.kr', 'https://sunpack.kr',
  ARRAY['PP 트레이', 'PS 용기', 'PET 도시락', '뚜껑형 용기'],
  ARRAY['HACCP 인증', '식품위생법 적합'],
  true
),
(
  'modenpack-food',
  '모든팩',
  '식품포장용기 전문기업. 밀폐용기·찜기·냉동용기 등 고기능 식품 용기 제조.',
  'food_grade', '고기능/밀폐',
  '경기도', '이천시',
  '031-000-8002', null, 'https://modenpack.com',
  ARRAY['밀폐용기', '찜기', '냉동용기', '전자레인지용 용기'],
  ARRAY['HACCP 인증'],
  false
),
(
  'yonggiyo-food',
  '용기는요기',
  '일회용 식품 포장용기 전문 제작·판매. 카페·배달 전문 용기 선두 공급사.',
  'food_grade', '카페/배달',
  '서울특별시', '송파구',
  '02-000-8003', 'hello@yonggiyo.com', 'https://yonggiyo.com',
  ARRAY['카페용 컵', '배달 용기', '아이스크림 컵', '소스컵'],
  ARRAY['식품위생법 적합'],
  true
),
(
  'youlchon-food-pack',
  '율촌화학',
  '국내 대표 연포장 전문 기업. 식품·의약품용 복합 필름 및 파우치 제조 대기업 계열사.',
  'food_grade', '연포장/필름',
  '경기도', '안성시',
  '031-000-8004', 'ir@youlchon.com', 'https://www.youlchon.com',
  ARRAY['복합 필름', '진공 파우치', '레토르트 파우치', '스탠딩 파우치'],
  ARRAY['ISO 22000', 'HACCP 인증', 'BRC 인증', 'ISO 9001'],
  true
),
(
  'packmall-foodpack',
  '포장가게',
  '일회용기·친환경 포장용기 전문몰. 엔터팩 OEM 제조사 운영, 실링기·밀폐용기·종이컵 취급.',
  'food_grade', '종합/실링',
  '경기도', '시흥시',
  '031-000-8005', 'cs@packmall.co.kr', 'https://packmall.co.kr',
  ARRAY['일회용기', '종이컵', '실링 필름', '밀폐용기'],
  ARRAY['HACCP 인증'],
  false
),
(
  'papercups-korea',
  '대한종이컵',
  '종이컵·종이 식품 용기 전문 생산 기업. 고속 윤전 설비 보유, 대량 납품 특화.',
  'food_grade', '종이컵',
  '충청남도', '아산시',
  '041-000-8006', null, 'https://www.papercups.co.kr',
  ARRAY['종이컵', '종이 도시락', '종이 냉면기', '종이 면기'],
  ARRAY['ISO 9001', 'HACCP 인증'],
  true
),
(
  'gyeongnam-fresh-food-pack',
  '경남신선팩',
  '신선식품 및 냉장·냉동 포장재 전문. 남부권 농수산 유통 특화 포장재 공급사.',
  'food_grade', '신선/냉동',
  '경상남도', '김해시',
  '055-000-8007', null, null,
  ARRAY['냉동 포장재', '신선 트레이', '아이스팩', '진공 필름'],
  ARRAY['HACCP 인증'],
  false
),

-- ============================================================
-- 산업용 (saneobyong) — 5개
-- ============================================================
(
  'cncairkorea-pack',
  '씨앤씨코리아',
  '앞선 기술력의 포장 솔루션 전문 국내 기업. 에어쿠션·에어팩 등 공기 완충 포장재 선도.',
  'saneobyong', '공기완충/에어팩',
  '경기도', '군포시',
  '031-000-9001', 'info@cncairkorea.com', 'https://cncairkorea.com',
  ARRAY['에어쿠션', '에어팩', '버블랩', '에어캡'],
  ARRAY['ISO 9001', 'KC 인증'],
  true
),
(
  'hongjin-pack',
  '홍진포장',
  '대한민국 대표 포장지 전문 제조기업. OPP·CPP·PE 필름 포장지 자체 생산.',
  'saneobyong', '필름/포장지',
  '경기도', '의왕시',
  '031-000-9002', 'biz@hjpack.net', 'https://www.hjpack.net',
  ARRAY['OPP 포장지', 'CPP 포장지', 'PE 필름', '스트레치 필름'],
  ARRAY['ISO 9001'],
  true
),
(
  'daehung-pojang',
  '대흥포장',
  '산업용 포장재 전문 제조·판매. 스트레치 필름·방청지·에어캡 등 물류 포장재 전 품목 공급.',
  'saneobyong', '물류/스트레치',
  '경기도', '안산시',
  '031-000-9003', null, 'https://www.pojang.co.kr',
  ARRAY['스트레치 필름', '방청지', '에어캡', '파레트 랩'],
  ARRAY['ISO 9001'],
  false
),
(
  'dongil-aluminum-foil',
  '동일알루미늄',
  '알루미늄 포일 연포장 전문 기업. 식품·의약·화학 산업용 알루미늄 연포장재 생산.',
  'saneobyong', '알루미늄연포장',
  '경기도', '시흥시',
  '031-000-9004', 'sales@dongilal.com', 'https://dongilal.com',
  ARRAY['알루미늄 포일', '알루미늄 파우치', '연포장 필름', '알루미늄 백'],
  ARRAY['ISO 9001', 'ISO 22000'],
  true
),
(
  'busan-stretch-pack',
  '부산스트레치팩',
  '부산·경남권 물류 포장재 전문 공급사. 스트레치 필름·PP 밴드·물류 소모품 대량 유통.',
  'saneobyong', '물류소모품',
  '부산광역시', '강서구',
  '051-000-9005', null, null,
  ARRAY['스트레치 필름', 'PP 밴드', '테이프', '파렛트'],
  ARRAY[],
  false
),

-- ============================================================
-- 플라스틱 (plastic) — 5개
-- ============================================================
(
  'dkpnc-container',
  '대경피앤씨',
  '용기 제조 분야 선도 기업. PET·PP·HDPE 용기 및 뚜껑 일괄 생산, 식품·화장품·의약품 납품.',
  'plastic', 'PET/PP/HDPE',
  '경기도', '화성시',
  '031-000-0101', 'info@dkpnc.com', 'https://www.dkpnc.com',
  ARRAY['PET 용기', 'PP 용기', 'HDPE 용기', '용기 뚜껑'],
  ARRAY['ISO 9001', 'HACCP 인증'],
  true
),
(
  'splatech-plastic',
  '새한프라텍',
  '플라스틱 사출 성형 전문. 자동차·가전·산업용 플라스틱 부품 포장 트레이 제작.',
  'plastic', '사출성형/트레이',
  '경기도', '안산시',
  '031-000-0102', null, 'http://www.splatech.com',
  ARRAY['사출 트레이', '플라스틱 부품 트레이', 'PP 팔레트', '산업용 용기'],
  ARRAY['ISO 9001', 'ISO 14001'],
  false
),
(
  'freecos-plastic',
  '프리코스',
  '뷰티·화장품 용기 전문 플라스틱 제조사. 크림 자, 펌프 보틀, 튜브 전 품목 생산.',
  'plastic', '화장품용기',
  '인천광역시', '부평구',
  '032-000-0103', 'cs@freecos.net', 'https://www.freecos.net',
  ARRAY['크림 자', '펌프 보틀', '화장품 튜브', '에어리스 용기'],
  ARRAY['ISO 9001', 'ISO 22716'],
  true
),
(
  'tpm-korea-plastic',
  '사장님상회',
  '소상공인·외식업 맞춤 패키징 솔루션. PET·PP 식품 용기 및 테이크아웃 포장재 공급.',
  'plastic', '식품용기/테이크아웃',
  '서울특별시', '구로구',
  '02-000-0104', 'help@tpmkorea.kr', 'https://tpmkorea.kr',
  ARRAY['테이크아웃 용기', 'PET 투명 용기', 'PP 식품 용기', '소스컵'],
  ARRAY['식품위생법 적합'],
  false
),
(
  'gyeonggi-plastic-mold',
  '경기플라스틱몰드',
  '산업용 플라스틱 성형 전문. 반도체·자동차·전자 부품 전용 트레이 및 캐리어 생산.',
  'plastic', '산업트레이/반도체',
  '경기도', '수원시',
  '031-000-0105', null, null,
  ARRAY['반도체 트레이', '자동차 부품 트레이', '전자 부품 캐리어', 'ESD 트레이'],
  ARRAY['ISO 9001', 'ESD 인증'],
  true
),

-- ============================================================
-- 금속 (metal) — 4개
-- ============================================================
(
  'sama-aluminium-pack',
  '삼아알미늄',
  '1969년 창업 국내 알루미늄 포일·연포장 선도 기업. FSC·ISO 인증 보유, 식품·의약·산업 전 산업 납품.',
  'metal', '알루미늄포일',
  '경기도', '군포시',
  '031-000-0201', 'ir@sam-a.co.kr', null,
  ARRAY['알루미늄 포일', '식품용 알루미늄 백', '의약용 알루미늄 포장', '산업용 알루미늄 롤'],
  ARRAY['ISO 9001', 'ISO 22000', 'BRC 인증'],
  true
),
(
  'daegu-metal-can',
  '대구메탈캔',
  '대구·경북권 금속 캔 전문 제조사. 식품·음료·화학 산업용 금속 캔 맞춤 제작.',
  'metal', '식품/음료캔',
  '대구광역시', '서구',
  '053-000-0202', null, null,
  ARRAY['알루미늄 캔', '주석 식품 캔', '금속 뚜껑', '화학용 드럼'],
  ARRAY['KS 표시 인증', 'ISO 9001'],
  false
),
(
  'gyeonggi-steel-drum',
  '경기스틸드럼',
  '국내 최대 스틸 드럼 전문 제조사 중 하나. 오픈헤드·클로즈드헤드 드럼 전 규격 생산.',
  'metal', '드럼/화학',
  '경기도', '오산시',
  '031-000-0203', 'sales@ksdrum.co.kr', null,
  ARRAY['스틸 드럼 18L', '스틸 드럼 200L', '오픈헤드 드럼', 'UN 인증 드럼'],
  ARRAY['UN 위험물 포장 인증', 'ISO 9001'],
  true
),
(
  'jeonbuk-tin-case',
  '전북틴케이스',
  '틴케이스·금속 선물 포장 ODM 전문. 지역 특산물·식품 브랜딩 패키지 맞춤 제작.',
  'metal', '틴케이스/선물',
  '전라북도', '익산시',
  '063-000-0204', null, null,
  ARRAY['원형 틴케이스', '사각 틴박스', '힌지형 캔', '엠보싱 틴'],
  ARRAY['KS 표시 인증'],
  false
),

-- ============================================================
-- 친환경 (eco) — 7개
-- ============================================================
(
  'dongsong-ecoviva',
  '동성케미컬',
  '에코비바(ECOVIVA®) 브랜드로 생분해 포장재 선도. 에어캡·비드폼·멀티레이어 필름 등 친환경 완충재 생산.',
  'eco', '생분해/완충재',
  '경기도', '평택시',
  '031-000-0301', 'eco@dongsong.com', 'http://www.plastics.kr',
  ARRAY['에코비바 에어캡', '생분해 비드폼', '친환경 멀티레이어 필름', '생분해 완충재'],
  ARRAY['OK Compost 인증', 'ISO 14001', 'GRS 인증'],
  true
),
(
  'bgfecosolution',
  'BGF에코솔루션',
  '국내 친환경 생분해 플라스틱·바이오플라스틱 선도 제조사. PLA 폼 시트·용기 독점 생산.',
  'eco', 'PLA/바이오플라스틱',
  '경기도', '용인시',
  '031-000-0302', 'info@bgfecosolution.com', 'http://www.bgfecosolution.com',
  ARRAY['PLA 폼 시트', '생분해 용기', 'PLA 트레이', '바이오 필름'],
  ARRAY['OK Compost 인증', 'ISO 14001', 'GRS 인증'],
  true
),
(
  'caretbio-eco',
  '칼렛바이오',
  '식물성 소재 기반 친환경 포장재 제작 기업. ESG 경영 기업 패키징 컨설팅 및 맞춤 제작.',
  'eco', '식물성소재',
  '서울특별시', '서초구',
  '02-000-0303', 'hello@caretbio.com', 'https://shop.caretbio.com',
  ARRAY['식물성 비닐백', '생분해 포장지', '친환경 테이프', '대나무 완충재'],
  ARRAY['OK Compost 인증', 'GRS 인증'],
  true
),
(
  'cj-phact-eco',
  'CJ제일제당 바이오소재',
  'PHA 기반 생분해 소재 브랜드 PHACT® 운영. 식품·의약·물류 산업 친환경 포장재 솔루션.',
  'eco', 'PHA/바이오소재',
  '서울특별시', '중구',
  '02-000-0304', 'phact@cj.net', 'https://www.cj.co.kr',
  ARRAY['PHA 필름', 'PHA 파우치', '생분해 포장재', '친환경 복합 필름'],
  ARRAY['OK Compost 인증', 'ISO 14001', 'ISO 9001'],
  true
),
(
  'gyeonggi-eco-bag',
  '경기에코백',
  '재생지·친환경 소재 쇼핑백 전문 제조사. 기업 친환경 캠페인 패키징 ODM 서비스 제공.',
  'eco', '재생지/쇼핑백',
  '경기도', '고양시',
  '031-000-0305', null, null,
  ARRAY['재생지 쇼핑백', 'FSC 쇼핑백', '코튼 가방', '친환경 캐리어백'],
  ARRAY['FSC 인증', 'GRS 인증'],
  false
),
(
  'jeju-bamboo-pack',
  '제주대나무팩',
  '대나무·왕겨 등 자연 소재 기반 친환경 포장재. 제주 관광·특산물 브랜드 포장 납품 특화.',
  'eco', '천연소재/관광',
  '제주특별자치도', '서귀포시',
  '064-000-0306', null, null,
  ARRAY['대나무 완충재', '왕겨 포장재', '자연 소재 선물 박스', '친환경 쇼핑백'],
  ARRAY['친환경 우수 제품 인증'],
  false
),
(
  'seoul-recycled-pack',
  '서울재활용팩',
  '100% 재활용 소재 기반 포장재 전문 제조사. 대기업 ESG 조달 협력사 등록.',
  'eco', '재활용/ESG',
  '서울특별시', '노원구',
  '02-000-0307', 'esg@recycledpack.kr', null,
  ARRAY['재활용 골판지', '재생 쇼핑백', 'PCR 플라스틱 용기', '리사이클 완충재'],
  ARRAY['GRS 인증', 'ISO 14001'],
  true
)

ON CONFLICT (slug) DO NOTHING;
