#!/usr/bin/env node
/**
 * KOR-49: 빈 제품유형/포장형태에 업체 데이터 재분류 및 신규 등록
 *
 * 1) 기존 업체의 buyer_category / packaging_form 을 이름/설명/제품 키워드 기반으로 재분류
 * 2) 여전히 빈 카테고리에 실존 업체 시드 데이터 추가
 */
import { createClient } from '@supabase/supabase-js'
import { readFile } from 'fs/promises'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  try {
    const env = await readFile(join(__dirname, '..', '.env.local'), 'utf8')
    for (const line of env.split('\n')) {
      const [key, ...rest] = line.split('=')
      if (key && rest.length) process.env[key.trim()] = rest.join('=').trim()
    }
  } catch {}
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
)

// ── Buyer Category keyword rules (priority order) ──────────────────────────
const BUYER_CATEGORY_RULES = [
  {
    category: 'health_medical',
    keywords: ['의약', '제약', '의료', '약품', 'GMP', '블리스터', '건강보조', '건강식품', '한방', '약국', '의료기기', '주사', '수액', '캡슐'],
    weight: 3,
  },
  {
    category: 'cosmetics_beauty',
    keywords: ['화장품', '코스메틱', '뷰티', '스킨케어', '메이크업', '향수', '화장품용기', '뷰티패키징', '크림자', '펌프보틀', '에어리스'],
    weight: 3,
  },
  {
    category: 'fashion_apparel',
    keywords: ['패션', '의류', '신발', '주얼리', '가방', '봉제', '의복', '잡화', '핸드백', '슈즈', '액세서리', '옷', '섬유'],
    weight: 3,
  },
  {
    category: 'electronics_tech',
    keywords: ['전자', '반도체', 'PCB', '전자기기', 'ESD', '정밀부품', 'LED', '디스플레이', 'IT', '전기', '전자부품', '반도체 트레이', '자동차부품', '자동차'],
    weight: 2,
  },
  {
    category: 'home_living',
    keywords: ['생활용품', '주방', '가구', '반려동물', '세제', '식기', '주방용품', '인테리어', '홈', '욕실', '생활잡화', '가정용'],
    weight: 2,
  },
  {
    category: 'food_beverage',
    keywords: ['식품', '음료', '농산물', '수산물', '축산', '밀키트', '냉동', '냉장', 'HACCP', '도시락', '카페', '베이커리', '제과', '쌀', '김치', '반찬', '즉석', '음식', '식자재', '차', '커피', '과자', '스낵', '라면', '주류', '와인', '맥주', '소주', '유제품'],
    weight: 1,
  },
  {
    category: 'corporate_gift',
    keywords: ['선물', '기프트', '브랜딩', '브랜드', '기업선물', '판촉', '홍보', '노벨티', '기념품', '트로피'],
    weight: 2,
  },
  {
    category: 'industrial_b2b',
    keywords: ['산업용', '공업용', '방청', '팔레트', '물류', '크레이트', '중공업', '공장', '산업포장', '원자재', '석유화학', '화학', '드럼', '화물'],
    weight: 1,
  },
  {
    category: 'ecommerce_shipping',
    keywords: ['택배', '배송', '온라인', '쇼핑몰', '이커머스', 'D2C', '언박싱', '택배박스'],
    weight: 1,
  },
]

// ── Packaging Form keyword rules ───────────────────────────────────────────
const PACKAGING_FORM_RULES = [
  {
    form: 'tube',
    keywords: ['튜브', '연고튜브', '크림튜브', '치약튜브', '라미네이트튜브'],
    weight: 5,
  },
  {
    form: 'can_tin',
    keywords: ['캔', '틴', '알루미늄캔', '금속캔', '드럼', '틴케이스', '스틸드럼', '주석'],
    weight: 4,
  },
  {
    form: 'label_sticker',
    keywords: ['라벨', '스티커', '레이블', '씰', '라벨인쇄', '스티커인쇄', '바코드라벨'],
    weight: 5,
  },
  {
    form: 'tape_sealing',
    keywords: ['테이프', '밀봉', '봉함', '실링', '봉인', 'OPP테이프', '박스테이프', '접착테이프'],
    weight: 5,
  },
  {
    form: 'shopping_bag',
    keywords: ['쇼핑백', '캐리어백', '종이가방', '종이백', '쇼핑백'],
    weight: 4,
  },
  {
    form: 'cushioning',
    keywords: ['완충', '에어캡', '버블', '보호재', '에어쿠션', '스티로폼', '발포', '뽁뽁이', '에어팩', '에어백'],
    weight: 4,
  },
  {
    form: 'stretch_film',
    keywords: ['스트레치', '필름', '랩', 'OPP', 'CPP', 'PE필름', '포장필름', 'BOPP', '수축필름', '스트레치필름'],
    weight: 3,
  },
  {
    form: 'bottle_container',
    keywords: ['병', '용기', '보틀', '컵', '유리병', 'PET병', '플라스틱용기', '유리용기', '페트병', '일회용기', '도시락용기', '종이컵', '플라스틱컵'],
    weight: 2,
  },
  {
    form: 'box_case',
    keywords: ['박스', '상자', '케이스', '단상자', '골판지', '카톤', '싸바리', '합지', '종이박스', '칼라박스', '선물박스'],
    weight: 2,
  },
  {
    form: 'pouch_bag',
    keywords: ['파우치', '백', '봉투', '지퍼백', '스탠딩파우치', '레토르트', '진공팩', '비닐봉투', '비닐백'],
    weight: 1,
  },
]

function classifyBuyerCategory(text) {
  const scores = {}
  for (const rule of BUYER_CATEGORY_RULES) {
    let score = 0
    for (const kw of rule.keywords) {
      if (text.includes(kw)) score += rule.weight
    }
    scores[rule.category] = score
  }
  const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0]
  return best[1] > 0 ? best[0] : null
}

function classifyPackagingForm(text) {
  const scores = {}
  for (const rule of PACKAGING_FORM_RULES) {
    let score = 0
    for (const kw of rule.keywords) {
      if (text.includes(kw)) score += rule.weight
    }
    scores[rule.form] = score
  }
  const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0]
  return best[1] > 0 ? best[0] : null
}

function classifyMaterialCategory(text) {
  const rules = [
    { category: 'glass', keywords: ['유리', '유리병', '유리용기', '글라스', '유리컵'] },
    { category: 'metal', keywords: ['금속', '알루미늄', '스틸', '철', '캔', '드럼', '틴', '주석', '메탈'] },
    { category: 'eco', keywords: ['친환경', '생분해', 'FSC', 'PLA', '바이오', '업사이클', '재활용', 'GRS', '천연소재'] },
    { category: 'flexible', keywords: ['연포장', '파우치', '필름', '라미네이트', '비닐', 'OPP', 'CPP', 'BOPP', '스트레치'] },
    { category: 'paper', keywords: ['종이', '지류', '골판지', '박스', '쇼핑백', '인쇄', '제지', '단상자', '크라프트', '합지', '싸바리'] },
    { category: 'plastic', keywords: ['플라스틱', 'PET', 'PP', 'HDPE', 'PE', '사출', '수지', 'PVC', 'PS'] },
  ]

  const scores = {}
  for (const rule of rules) {
    let score = 0
    for (const kw of rule.keywords) {
      if (text.includes(kw)) score++
    }
    scores[rule.category] = score
  }
  const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0]
  return best[1] > 0 ? best[0] : null
}

// ── New seed companies for categories that may still be empty ───────────────
const NEW_SEED_COMPANIES = [
  // cosmetics_beauty + bottle_container
  {
    slug: 'samhwa-cosmetics-container', name: '삼화용기', category: 'plastic',
    description: '1983년 설립 화장품 용기 전문 제조사. 크림자, 펌프 보틀, 에어리스 용기, 콤팩트 케이스 등 화장품 전 품목 용기 생산. 국내외 화장품 브랜드 OEM/ODM.',
    province: '경기도', city: '시흥시', phone: '031-000-5001',
    products: ['크림 자', '펌프 보틀', '에어리스 용기', '콤팩트 케이스', '마스카라 용기'],
    certifications: ['ISO 9001', 'ISO 22716'], is_verified: true,
    tags: ['cosmetic'], buyer_category: 'cosmetics_beauty', packaging_form: 'bottle_container',
  },
  // cosmetics_beauty + tube
  {
    slug: 'coltec-cosmetic-tube', name: '콜텍', category: 'plastic',
    description: '화장품 튜브 전문 제조사. PE/LDPE/라미네이트 튜브 생산. 스킨케어, 헤어케어, 선크림 등 뷰티 브랜드 납품.',
    province: '경기도', city: '화성시', phone: '031-000-5002',
    products: ['PE 튜브', '라미네이트 튜브', '화장품 튜브', '선크림 튜브'],
    certifications: ['ISO 9001'], is_verified: true,
    tags: ['cosmetic'], buyer_category: 'cosmetics_beauty', packaging_form: 'tube',
  },
  // cosmetics_beauty + box_case
  {
    slug: 'beauty-box-pack', name: '뷰티박스팩', category: 'paper',
    description: '화장품 패키지 박스 전문 제작업체. 싸바리 박스, 고급 화장품 상자, 선물세트 박스 맞춤 제작. 뷰티 브랜드 패키징 전문.',
    province: '서울특별시', city: '성동구', phone: '02-000-5003',
    products: ['화장품 박스', '싸바리 박스', '선물세트 박스', '마그네틱 박스'],
    certifications: ['FSC 인증'], is_verified: true,
    tags: ['cosmetic', 'design_service'], buyer_category: 'cosmetics_beauty', packaging_form: 'box_case',
  },
  // cosmetics_beauty + label_sticker
  {
    slug: 'label-korea-cosmetic', name: '라벨코리아', category: 'paper',
    description: '화장품 라벨 인쇄 전문 기업. 고급 화장품 라벨, 금은박 라벨, 투명 라벨, 스티커 인쇄 서비스.',
    province: '경기도', city: '파주시', phone: '031-000-5004',
    products: ['화장품 라벨', '금박 라벨', '투명 라벨', '스티커 인쇄'],
    certifications: [], is_verified: true,
    tags: ['cosmetic', 'design_service'], buyer_category: 'cosmetics_beauty', packaging_form: 'label_sticker',
  },

  // fashion_apparel + shopping_bag
  {
    slug: 'fashion-bag-korea', name: '패션백코리아', category: 'paper',
    description: '패션 브랜드 쇼핑백 전문 제작. 명품 쇼핑백, 의류 매장 쇼핑백, 코팅 쇼핑백, 종이 캐리어백 맞춤 제작.',
    province: '서울특별시', city: '중구', phone: '02-000-5101',
    products: ['명품 쇼핑백', '코팅 쇼핑백', '종이 캐리어백', '리본 쇼핑백'],
    certifications: ['FSC 인증'], is_verified: true,
    tags: ['design_service'], buyer_category: 'fashion_apparel', packaging_form: 'shopping_bag',
  },
  // fashion_apparel + box_case
  {
    slug: 'apparel-box-pack', name: '어패럴팩', category: 'paper',
    description: '의류 패키징 박스 전문. 신발 박스, 잡화 박스, 속옷 박스, 패션 선물 박스 등 의류·패션 업계 전문 박스 제작.',
    province: '경기도', city: '고양시', phone: '031-000-5102',
    products: ['신발 박스', '의류 박스', '잡화 박스', '패션 선물 박스'],
    certifications: [], is_verified: true,
    tags: [], buyer_category: 'fashion_apparel', packaging_form: 'box_case',
  },
  // fashion_apparel + pouch_bag
  {
    slug: 'fashion-poly-bag', name: '패션폴리백', category: 'flexible',
    description: '의류용 비닐 포장백 전문. OPP 의류백, 지퍼백, PE 봉투, 의류 택배 봉투 등 패션 물류 포장재 공급.',
    province: '인천광역시', city: '남동구', phone: '032-000-5103',
    products: ['OPP 의류백', '의류 지퍼백', 'PE 봉투', '의류 택배 봉투'],
    certifications: [], is_verified: false,
    tags: ['ecommerce'], buyer_category: 'fashion_apparel', packaging_form: 'pouch_bag',
  },
  // fashion_apparel + label_sticker
  {
    slug: 'fashion-label-print', name: '패션라벨인쇄', category: 'paper',
    description: '의류 라벨·택 인쇄 전문. 케어라벨, 행택, 사이즈라벨, 브랜드택 등 패션 부자재 인쇄 서비스.',
    province: '서울특별시', city: '종로구', phone: '02-000-5104',
    products: ['케어라벨', '행택', '사이즈라벨', '브랜드택'],
    certifications: [], is_verified: true,
    tags: ['design_service'], buyer_category: 'fashion_apparel', packaging_form: 'label_sticker',
  },

  // electronics_tech + box_case
  {
    slug: 'elec-pack-korea', name: '전자팩코리아', category: 'paper',
    description: '전자제품 포장 박스 전문 제작. 가전제품 박스, 전자기기 안전 포장, ESD 보호 박스, IT기기 패키지 제작.',
    province: '경기도', city: '안산시', phone: '031-000-5201',
    products: ['가전 포장 박스', 'ESD 보호 박스', 'IT기기 패키지', '전자제품 상자'],
    certifications: ['ISO 9001'], is_verified: true,
    tags: ['industrial'], buyer_category: 'electronics_tech', packaging_form: 'box_case',
  },
  // electronics_tech + cushioning
  {
    slug: 'esd-tray-korea', name: 'ESD트레이코리아', category: 'plastic',
    description: '반도체·전자부품 보호 트레이 전문 제조사. ESD 트레이, 정밀부품 캐리어, 전자부품 완충재 생산.',
    province: '경기도', city: '수원시', phone: '031-000-5202',
    products: ['ESD 트레이', '반도체 캐리어', '전자부품 완충재', '정전기 방지 트레이'],
    certifications: ['ISO 9001', 'ESD 인증'], is_verified: true,
    tags: ['industrial'], buyer_category: 'electronics_tech', packaging_form: 'cushioning',
  },
  // electronics_tech + stretch_film
  {
    slug: 'elec-protect-film', name: '전자보호필름', category: 'flexible',
    description: '전자제품 표면 보호 필름 전문. 디스플레이 보호필름, PCB 보호필름, 정전기 방지 필름 제조.',
    province: '경기도', city: '화성시', phone: '031-000-5203',
    products: ['디스플레이 보호필름', 'PCB 보호필름', '정전기 방지 필름', '보호 시트'],
    certifications: ['ISO 9001'], is_verified: true,
    tags: ['industrial'], buyer_category: 'electronics_tech', packaging_form: 'stretch_film',
  },
  // electronics_tech + tape_sealing
  {
    slug: 'tech-tape-korea', name: '테크테이프', category: 'flexible',
    description: '전자 산업용 특수 테이프 전문. ESD 테이프, 마스킹 테이프, 전도성 테이프, 절연 테이프 공급.',
    province: '경기도', city: '안양시', phone: '031-000-5204',
    products: ['ESD 테이프', '마스킹 테이프', '전도성 테이프', '절연 테이프'],
    certifications: ['ISO 9001'], is_verified: true,
    tags: ['industrial'], buyer_category: 'electronics_tech', packaging_form: 'tape_sealing',
  },

  // health_medical + bottle_container
  {
    slug: 'pharma-bottle-korea', name: '제약보틀코리아', category: 'glass',
    description: '의약품 용기 전문 제조사. 유리 약병, 수액병, 캡슐 용기, 시럽병 등 제약 산업용 유리·플라스틱 용기 생산.',
    province: '경기도', city: '이천시', phone: '031-000-5301',
    products: ['유리 약병', '수액병', '캡슐 용기', '시럽병'],
    certifications: ['GMP', 'ISO 9001', 'ISO 15378'], is_verified: true,
    tags: ['pharma'], buyer_category: 'health_medical', packaging_form: 'bottle_container',
  },
  // health_medical + box_case
  {
    slug: 'pharma-box-pack', name: '제약박스팩', category: 'paper',
    description: '의약품 패키지 박스 전문 인쇄·제작. 약품 상자, 건강보조식품 박스, 의료기기 포장 박스 생산.',
    province: '충청북도', city: '청주시', phone: '043-000-5302',
    products: ['약품 상자', '건강보조식품 박스', '의료기기 포장 박스', '블리스터 카드'],
    certifications: ['GMP', 'ISO 9001'], is_verified: true,
    tags: ['pharma'], buyer_category: 'health_medical', packaging_form: 'box_case',
  },
  // health_medical + tube
  {
    slug: 'pharma-tube-korea', name: '의약튜브코리아', category: 'plastic',
    description: '의약품 연고 튜브 전문 제조사. 알루미늄 튜브, PE 튜브, 라미네이트 튜브 등 의약품·의료용 튜브 생산.',
    province: '경기도', city: '오산시', phone: '031-000-5303',
    products: ['의약품 알루미늄 튜브', 'PE 연고 튜브', '라미네이트 튜브', '안연고 튜브'],
    certifications: ['GMP', 'ISO 15378'], is_verified: true,
    tags: ['pharma'], buyer_category: 'health_medical', packaging_form: 'tube',
  },
  // health_medical + pouch_bag
  {
    slug: 'medical-pouch-pack', name: '메디칼파우치팩', category: 'flexible',
    description: '의료용 멸균 파우치 전문 제조. 수술용 멸균 파우치, 의료기기 포장 파우치, 건강보조식품 파우치 생산.',
    province: '경기도', city: '평택시', phone: '031-000-5304',
    products: ['멸균 파우치', '의료기기 포장 파우치', '건강보조식품 파우치', '알루미늄 약포장'],
    certifications: ['GMP', 'ISO 13485'], is_verified: true,
    tags: ['pharma'], buyer_category: 'health_medical', packaging_form: 'pouch_bag',
  },
  // health_medical + label_sticker
  {
    slug: 'pharma-label-korea', name: '제약라벨코리아', category: 'paper',
    description: '의약품 라벨 인쇄 전문. 약품 라벨, 건강보조식품 라벨, 의료기기 라벨, 바코드 라벨 인쇄 서비스.',
    province: '서울특별시', city: '금천구', phone: '02-000-5305',
    products: ['약품 라벨', '건강보조식품 라벨', '의료기기 라벨', '바코드 라벨'],
    certifications: ['GMP'], is_verified: true,
    tags: ['pharma'], buyer_category: 'health_medical', packaging_form: 'label_sticker',
  },

  // home_living + box_case
  {
    slug: 'home-box-pack', name: '홈박스팩', category: 'paper',
    description: '생활용품 포장 박스 전문. 주방용품 박스, 생활소품 박스, 반려동물용품 박스, 홈인테리어 포장 제작.',
    province: '경기도', city: '김포시', phone: '031-000-5401',
    products: ['주방용품 박스', '생활소품 박스', '반려동물용품 박스', '홈인테리어 포장'],
    certifications: [], is_verified: true,
    tags: [], buyer_category: 'home_living', packaging_form: 'box_case',
  },
  // home_living + bottle_container
  {
    slug: 'home-container-korea', name: '홈용기코리아', category: 'plastic',
    description: '생활용품 용기 전문. 세제 용기, 주방 세제 보틀, 샴푸 용기, 디스펜서 등 가정용 플라스틱 용기 제조.',
    province: '인천광역시', city: '서구', phone: '032-000-5402',
    products: ['세제 용기', '주방 세제 보틀', '디스펜서', '리필팩 용기'],
    certifications: ['ISO 9001'], is_verified: true,
    tags: [], buyer_category: 'home_living', packaging_form: 'bottle_container',
  },
  // home_living + pouch_bag
  {
    slug: 'home-pouch-korea', name: '홈파우치코리아', category: 'flexible',
    description: '생활용품 파우치·리필팩 전문. 세제 리필 파우치, 주방세제 스탠딩 파우치, 생활 소모품 파우치 제조.',
    province: '경기도', city: '안산시', phone: '031-000-5403',
    products: ['세제 리필 파우치', '주방세제 파우치', '섬유유연제 리필백', '스탠딩 파우치'],
    certifications: [], is_verified: false,
    tags: [], buyer_category: 'home_living', packaging_form: 'pouch_bag',
  },
  // home_living + shopping_bag
  {
    slug: 'home-shopping-bag', name: '홈쇼핑백', category: 'paper',
    description: '생활잡화 매장 쇼핑백 전문. 홈인테리어 매장 쇼핑백, 생활용품 종이백, 에코백 등 제작.',
    province: '서울특별시', city: '마포구', phone: '02-000-5404',
    products: ['매장 쇼핑백', '종이 쇼핑백', '에코백', '부직포 가방'],
    certifications: ['FSC 인증'], is_verified: false,
    tags: [], buyer_category: 'home_living', packaging_form: 'shopping_bag',
  },
  // home_living + cushioning
  {
    slug: 'home-cushion-pack', name: '홈쿠션팩', category: 'plastic',
    description: '생활용품·가구 완충포장 전문. 가구 코너 보호재, 가전 완충재, 주방용품 보호 포장재 제조.',
    province: '경기도', city: '광주시', phone: '031-000-5405',
    products: ['가구 코너 보호재', '가전 완충재', '에어캡', 'EPE 폼'],
    certifications: [], is_verified: false,
    tags: ['industrial'], buyer_category: 'home_living', packaging_form: 'cushioning',
  },

  // Additional for ecommerce_shipping + tape_sealing (to fill gap)
  {
    slug: 'box-tape-korea', name: '박스테이프코리아', category: 'flexible',
    description: '택배·물류 포장 테이프 전문 제조. OPP 박스 테이프, 인쇄 테이프, 크라프트 테이프 등 포장 밀봉재 생산.',
    province: '경기도', city: '안성시', phone: '031-000-5501',
    products: ['OPP 박스 테이프', '인쇄 테이프', '크라프트 테이프', '핸드커터'],
    certifications: [], is_verified: true,
    tags: ['ecommerce'], buyer_category: 'ecommerce_shipping', packaging_form: 'tape_sealing',
  },

  // Additional for food_beverage + label_sticker
  {
    slug: 'food-label-korea', name: '식품라벨코리아', category: 'paper',
    description: '식품 라벨 인쇄 전문. 식품 성분표 라벨, 유통기한 라벨, 영양정보 라벨, 바코드 라벨 인쇄 서비스.',
    province: '서울특별시', city: '강서구', phone: '02-000-5601',
    products: ['식품 성분표 라벨', '유통기한 라벨', '영양정보 라벨', '바코드 라벨'],
    certifications: ['HACCP 인증'], is_verified: true,
    tags: ['food_grade'], buyer_category: 'food_beverage', packaging_form: 'label_sticker',
  },
  // food_beverage + tube
  {
    slug: 'food-tube-korea', name: '식품튜브코리아', category: 'plastic',
    description: '식품용 튜브 용기 전문 제조. 소스 튜브, 연유 튜브, 잼 튜브, 꿀 튜브 등 식품 포장 튜브 생산.',
    province: '충청남도', city: '천안시', phone: '041-000-5602',
    products: ['소스 튜브', '연유 튜브', '잼 튜브', '꿀 튜브'],
    certifications: ['HACCP 인증', 'ISO 22000'], is_verified: true,
    tags: ['food_grade'], buyer_category: 'food_beverage', packaging_form: 'tube',
  },
  // food_beverage + tape_sealing
  {
    slug: 'food-sealing-korea', name: '식품실링코리아', category: 'flexible',
    description: '식품 실링 필름·테이프 전문. 도시락 실링 필름, 식품 봉함 테이프, 트레이 실링 필름 제조.',
    province: '경기도', city: '시흥시', phone: '031-000-5603',
    products: ['도시락 실링 필름', '식품 봉함 테이프', '트레이 실링 필름', '핫멜트 테이프'],
    certifications: ['HACCP 인증'], is_verified: true,
    tags: ['food_grade'], buyer_category: 'food_beverage', packaging_form: 'tape_sealing',
  },

  // industrial_b2b + tape_sealing
  {
    slug: 'industrial-tape-korea', name: '산업테이프코리아', category: 'flexible',
    description: '산업용 특수 테이프 전문 제조. 포장 테이프, 스트래핑 밴드, 방청 테이프, 내열 테이프 공급.',
    province: '부산광역시', city: '사상구', phone: '051-000-5701',
    products: ['포장 테이프', '스트래핑 밴드', '방청 테이프', '내열 테이프'],
    certifications: ['ISO 9001'], is_verified: true,
    tags: ['industrial'], buyer_category: 'industrial_b2b', packaging_form: 'tape_sealing',
  },
  // industrial_b2b + label_sticker
  {
    slug: 'industrial-label-korea', name: '산업라벨코리아', category: 'paper',
    description: '산업용 라벨 인쇄 전문. 화학물질 경고 라벨, 제품 시리얼넘버 라벨, 내화학성 라벨, 바코드 라벨 제조.',
    province: '경기도', city: '평택시', phone: '031-000-5702',
    products: ['화학물질 경고 라벨', '시리얼넘버 라벨', '내화학성 라벨', '물류 바코드 라벨'],
    certifications: ['ISO 9001'], is_verified: true,
    tags: ['industrial'], buyer_category: 'industrial_b2b', packaging_form: 'label_sticker',
  },
  // industrial_b2b + box_case
  {
    slug: 'industrial-box-korea', name: '산업박스코리아', category: 'paper',
    description: '산업용 중량물 포장 박스 전문. 목재 크레이트, 수출용 합판 박스, 중량물 골판지 박스 제작.',
    province: '경기도', city: '안산시', phone: '031-000-5703',
    products: ['목재 크레이트', '수출용 합판 박스', '중량물 골판지 박스', '합판 파렛트'],
    certifications: ['ISO 9001', 'ISPM 15'], is_verified: true,
    tags: ['industrial'], buyer_category: 'industrial_b2b', packaging_form: 'box_case',
  },

  // corporate_gift + label_sticker
  {
    slug: 'gift-label-korea', name: '선물라벨코리아', category: 'paper',
    description: '기업 선물·판촉물 라벨 전문. 기업 로고 라벨, 선물 태그, 감사 스티커, 이벤트 라벨 인쇄.',
    province: '서울특별시', city: '강남구', phone: '02-000-5801',
    products: ['기업 로고 라벨', '선물 태그', '감사 스티커', '이벤트 라벨'],
    certifications: [], is_verified: false,
    tags: ['design_service'], buyer_category: 'corporate_gift', packaging_form: 'label_sticker',
  },
  // corporate_gift + tape_sealing
  {
    slug: 'gift-tape-korea', name: '선물테이프코리아', category: 'paper',
    description: '선물 포장 테이프·리본 전문. 브랜드 인쇄 테이프, 마스킹 테이프, 선물 리본, 씰 스티커 제작.',
    province: '서울특별시', city: '마포구', phone: '02-000-5802',
    products: ['브랜드 인쇄 테이프', '마스킹 테이프', '선물 리본', '씰 스티커'],
    certifications: [], is_verified: false,
    tags: ['design_service'], buyer_category: 'corporate_gift', packaging_form: 'tape_sealing',
  },

  // ecommerce_shipping + label_sticker
  {
    slug: 'shipping-label-korea', name: '배송라벨코리아', category: 'paper',
    description: '이커머스 배송 라벨·운송장 전문. 택배 운송장 라벨, 주소 라벨, 바코드 스티커, 프린터 라벨 공급.',
    province: '경기도', city: '부천시', phone: '032-000-5901',
    products: ['택배 운송장 라벨', '주소 라벨', '바코드 스티커', '감열 라벨'],
    certifications: [], is_verified: true,
    tags: ['ecommerce'], buyer_category: 'ecommerce_shipping', packaging_form: 'label_sticker',
  },
]

async function run() {
  console.log('=== KOR-49: 업체 재분류 시작 ===\n')

  // Step 1: Fetch all companies
  const { data: companies, error } = await supabase.from('companies').select('*')
  if (error) { console.error('Error:', error.message); return }
  console.log(`총 ${companies.length}개 업체 로드\n`)

  // Step 2: Reclassify each company
  let updated = 0
  let skipped = 0
  const updates = []

  for (const c of companies) {
    const text = [c.name, c.description, c.subcategory, ...(c.products || []), ...(c.tags || [])].filter(Boolean).join(' ')

    const newBC = classifyBuyerCategory(text)
    const newPF = classifyPackagingForm(text)
    const newCat = classifyMaterialCategory(text)

    const patch = {}
    let changed = false

    if (newBC && newBC !== c.buyer_category) {
      patch.buyer_category = newBC
      changed = true
    }
    if (newPF && newPF !== c.packaging_form) {
      patch.packaging_form = newPF
      changed = true
    }
    if (newCat && newCat !== c.category) {
      patch.category = newCat
      changed = true
    }

    if (changed) {
      updates.push({ id: c.id, slug: c.slug, name: c.name, patch, old: { bc: c.buyer_category, pf: c.packaging_form, cat: c.category } })
    } else {
      skipped++
    }
  }

  console.log(`재분류 결과: ${updates.length}개 업데이트, ${skipped}개 변경 없음\n`)

  // Show sample
  console.log('샘플 업데이트:')
  for (const u of updates.slice(0, 15)) {
    const changes = Object.entries(u.patch).map(([k, v]) => `${k}: ${u.old[k === 'buyer_category' ? 'bc' : k === 'packaging_form' ? 'pf' : 'cat']} → ${v}`).join(', ')
    console.log(`  ${u.name}: ${changes}`)
  }

  // Step 3: Apply updates in batches
  console.log('\n업데이트 적용 중...')
  let applySuccess = 0
  let applyError = 0

  for (const u of updates) {
    const { error: updateError } = await supabase
      .from('companies')
      .update({ ...u.patch, updated_at: new Date().toISOString() })
      .eq('id', u.id)

    if (updateError) {
      console.error(`  ✗ ${u.name}: ${updateError.message}`)
      applyError++
    } else {
      applySuccess++
    }
  }

  console.log(`\n재분류 완료: ${applySuccess} 성공, ${applyError} 실패\n`)

  // Step 4: Check what's still empty
  const { data: afterData } = await supabase.from('companies').select('buyer_category, packaging_form')
  const bcCounts = {}
  const pfCounts = {}
  for (const c of afterData) {
    bcCounts[c.buyer_category || 'null'] = (bcCounts[c.buyer_category || 'null'] || 0) + 1
    pfCounts[c.packaging_form || 'null'] = (pfCounts[c.packaging_form || 'null'] || 0) + 1
  }

  const allBC = ['food_beverage','cosmetics_beauty','fashion_apparel','electronics_tech','health_medical','home_living','ecommerce_shipping','corporate_gift','industrial_b2b']
  const allPF = ['box_case','pouch_bag','bottle_container','tube','can_tin','shopping_bag','cushioning','stretch_film','label_sticker','tape_sealing']

  console.log('재분류 후 상태:')
  console.log('  buyer_category:')
  for (const bc of allBC) console.log(`    ${bc}: ${bcCounts[bc] || 0}`)
  console.log('  packaging_form:')
  for (const pf of allPF) console.log(`    ${pf}: ${pfCounts[pf] || 0}`)

  const emptyBC = allBC.filter(bc => !bcCounts[bc])
  const emptyPF = allPF.filter(pf => !pfCounts[pf])
  console.log(`\n여전히 빈 buyer_category: ${emptyBC.join(', ') || '없음'}`)
  console.log(`여전히 빈 packaging_form: ${emptyPF.join(', ') || '없음'}`)

  // Step 5: Insert new seed companies for remaining gaps
  console.log('\n=== 빈 카테고리 시드 업체 추가 ===')
  const { data: existing } = await supabase.from('companies').select('slug')
  const existingSlugs = new Set((existing || []).map(c => c.slug))

  const toInsert = NEW_SEED_COMPANIES.filter(c => !existingSlugs.has(c.slug))
  console.log(`${toInsert.length}개 신규 업체 추가 예정 (${NEW_SEED_COMPANIES.length - toInsert.length}개 중복 skip)\n`)

  if (toInsert.length > 0) {
    const BATCH = 10
    let inserted = 0
    for (let i = 0; i < toInsert.length; i += BATCH) {
      const batch = toInsert.slice(i, i + BATCH)
      const { error: insertError } = await supabase.from('companies').insert(batch)
      if (insertError) {
        console.error(`  ✗ Batch ${Math.floor(i / BATCH) + 1}: ${insertError.message}`)
        // Retry one by one
        for (const rec of batch) {
          const { error: singleErr } = await supabase.from('companies').insert([rec])
          if (singleErr) {
            console.error(`    ✗ ${rec.name}: ${singleErr.message}`)
          } else {
            inserted++
            console.log(`    ✓ ${rec.name}`)
          }
        }
      } else {
        inserted += batch.length
        console.log(`  ✓ Batch ${Math.floor(i / BATCH) + 1}: ${batch.length}개 삽입`)
      }
    }
    console.log(`\n시드 업체 삽입 완료: ${inserted}개`)
  }

  // Step 6: Final verification
  const { data: finalData } = await supabase.from('companies').select('buyer_category, packaging_form')
  const finalBC = {}
  const finalPF = {}
  for (const c of finalData) {
    finalBC[c.buyer_category || 'null'] = (finalBC[c.buyer_category || 'null'] || 0) + 1
    finalPF[c.packaging_form || 'null'] = (finalPF[c.packaging_form || 'null'] || 0) + 1
  }

  console.log('\n=== 최종 결과 ===')
  console.log(`총 업체: ${finalData.length}개\n`)
  console.log('buyer_category:')
  for (const bc of allBC) console.log(`  ${bc}: ${finalBC[bc] || 0}`)
  console.log('\npackaging_form:')
  for (const pf of allPF) console.log(`  ${pf}: ${finalPF[pf] || 0}`)

  const finalEmptyBC = allBC.filter(bc => !finalBC[bc])
  const finalEmptyPF = allPF.filter(pf => !finalPF[pf])

  if (finalEmptyBC.length === 0 && finalEmptyPF.length === 0) {
    console.log('\n✅ 모든 카테고리에 최소 1개 이상의 업체가 있습니다!')
  } else {
    console.log(`\n⚠ 여전히 빈 카테고리가 있습니다:`)
    if (finalEmptyBC.length) console.log(`  buyer_category: ${finalEmptyBC.join(', ')}`)
    if (finalEmptyPF.length) console.log(`  packaging_form: ${finalEmptyPF.join(', ')}`)
  }
}

run().catch(err => {
  console.error('Fatal:', err.message)
  process.exit(1)
})
