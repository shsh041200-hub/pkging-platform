#!/usr/bin/env node
/**
 * Seed packaging companies into Supabase DB.
 * Requires: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY in .env.local
 *
 * Usage:
 *   SUPABASE_SERVICE_ROLE_KEY=<key> NEXT_PUBLIC_SUPABASE_URL=https://... node scripts/seed-companies.mjs
 *
 *   Or: source .env.local && node scripts/seed-companies.mjs
 */
import { createClient } from '@supabase/supabase-js'
import { readFile } from 'fs/promises'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Load .env.local if env vars not set
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  try {
    const env = await readFile(join(__dirname, '..', '.env.local'), 'utf8')
    for (const line of env.split('\n')) {
      const [key, ...rest] = line.split('=')
      if (key && rest.length) process.env[key.trim()] = rest.join('=').trim()
    }
  } catch {}
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ Missing env vars: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  console.error('   Set SUPABASE_SERVICE_ROLE_KEY in .env.local (from Supabase dashboard → Settings → API)')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
})

/**
 * All companies — categories use the post-migration enum values
 * (paper, plastic, metal, flexible, eco, glass).
 * KOR-47: fixed category mismatches, added flexible/glass companies,
 * mapped buyer_category + packaging_form + tags.
 */
const companies = [
  // ── 지류/종이 (paper) ─────────────────────────────────────────────────────
  {
    slug: 'box4u-corrugated', name: '박스포유', category: 'paper', subcategory: '골판지/택배',
    description: '1976년 창업 골판지 상자 전문 제조기업. 택배박스, 농산물박스, 이삿짐박스 등 모든 골판지 박스를 자체 생산.',
    province: '경기도', city: '부천시', phone: '032-000-7001',
    email: 'cs@box4u.co.kr', website: 'https://www.box4u.co.kr',
    products: ['택배박스', '농산물박스', '이삿짐박스', '골판지 박스'],
    certifications: ['ISO 9001', 'FSC 인증'], is_verified: true,
    tags: ['ecommerce'], buyer_category: 'ecommerce_shipping', packaging_form: 'box_case',
  },
  {
    slug: 'boxin-package', name: '박스인', category: 'paper', subcategory: '인쇄/단상자',
    description: '공장 직영 패키지 제작 전문업체. 싸바리박스, 단상자, 칼라박스, 합지박스, 화장품박스 자체 생산.',
    province: '서울특별시', city: '중구', phone: '02-000-7002',
    email: 'info@boxin.co.kr', website: 'https://boxin.co.kr',
    products: ['싸바리박스', '단상자', '칼라박스', '합지박스', '화장품박스'],
    certifications: ['ISO 9001'], is_verified: true,
    tags: ['cosmetic'], buyer_category: 'cosmetics_beauty', packaging_form: 'box_case',
  },
  {
    slug: 'boxkorea-corrugated', name: '박스코리아', category: 'paper', subcategory: '도매/유통',
    description: '골판지·종이박스 전문 도매 유통 기업. 대량 주문 특가, 전국 당일 출고 가능.',
    province: '경기도', city: '김포시', phone: '031-000-7003',
    website: 'https://boxcorea.co.kr',
    products: ['골판지박스', '택배박스', '포장박스', '종이상자'],
    certifications: [], is_verified: false,
    tags: ['ecommerce'], buyer_category: 'ecommerce_shipping', packaging_form: 'box_case',
  },
  {
    slug: 'boxne-paper-pack', name: '박스네', category: 'paper', subcategory: '쇼핑백/맞춤제작',
    description: '30년 경력 종이박스·쇼핑백 맞춤 제작 전문. 컬러박스, 단상자, 싸바리, 카톤박스 전 품목 제작.',
    province: '서울특별시', city: '마포구', phone: '02-000-7004',
    email: 'order@boxne.co.kr', website: 'https://www.boxne.co.kr',
    products: ['컬러박스', '단상자', '쇼핑백', '카톤박스', '싸바리'],
    certifications: ['ISO 9001', 'FSC 인증'], is_verified: true,
    tags: ['design_service'], buyer_category: 'corporate_gift', packaging_form: 'box_case',
  },
  {
    slug: 'boxmga-package', name: '박스명가', category: 'paper', subcategory: '프리미엄/화장품',
    description: 'FSC 인증 취득 패키지 제작업체. 단상자·골판지박스·합지박스·싸바리박스·화장품박스 전문.',
    province: '경기도', city: '광명시', phone: '02-000-7005',
    email: 'hello@boxmga.com', website: 'https://www.boxmga.com',
    products: ['단상자', '골판지박스', '합지박스', '싸바리박스', '화장품박스'],
    certifications: ['FSC 인증', 'ISO 14001'], is_verified: true,
    tags: ['cosmetic'], buyer_category: 'cosmetics_beauty', packaging_form: 'box_case',
  },
  {
    slug: 'boxvill-pack', name: '박스마을', category: 'paper', subcategory: '원스톱/부자재',
    description: '주문 제작 박스부터 포장 부자재까지 원스톱 공급. 소량·대량 주문 모두 지원.',
    province: '경기도', city: '성남시', phone: '031-000-7006',
    email: 'cs@boxvill.com', website: 'https://boxvill.com',
    products: ['주문제작박스', '포장 부자재', '테이프', '완충재'],
    certifications: [], is_verified: false,
    tags: ['ecommerce'], buyer_category: 'ecommerce_shipping', packaging_form: 'box_case',
  },
  {
    slug: 'boxmoa-corrugated', name: '박스모아', category: 'paper', subcategory: '골판지/OEM',
    description: '골판지박스 전문 제조기업. 소량 맞춤 제작부터 대량 OEM까지 가능.',
    province: '인천광역시', city: '계양구', phone: '032-000-7007',
    website: 'https://www.boxmoa.com',
    products: ['골판지박스', '택배박스', '과일박스', 'OEM 박스'],
    certifications: [], is_verified: false,
    tags: ['ecommerce'], buyer_category: 'ecommerce_shipping', packaging_form: 'box_case',
  },
  {
    slug: 'caseman-package', name: '대흥사', category: 'paper', subcategory: '전통/다품목',
    description: '박스제작 40년 전통 기업. 싸바리박스·단상자·칼라박스·골판지 패키지 전 품목 자체 제작.',
    province: '서울특별시', city: '영등포구', phone: '02-000-7008',
    email: 'info@caseman.kr', website: 'https://caseman.kr',
    products: ['싸바리박스', '단상자', '칼라박스', '골판지박스'],
    certifications: ['ISO 9001'], is_verified: true,
    tags: [], buyer_category: 'ecommerce_shipping', packaging_form: 'box_case',
  },
  {
    slug: 'wj-package', name: 'WJ패키지', category: 'paper', subcategory: '봉투/쇼핑백',
    description: '식품봉투·택배봉투·쇼핑백 등 포장자재 인쇄제작 전문. 기성품 다량 보유·즉납 가능.',
    province: '서울특별시', city: '강서구', phone: '02-000-7009',
    email: 'cs@wjpackage.com', website: 'https://wjpackage.com',
    products: ['식품봉투', '택배봉투', '쇼핑백', '인쇄 포장재'],
    certifications: [], is_verified: false,
    tags: ['food_grade'], buyer_category: 'food_beverage', packaging_form: 'shopping_bag',
  },
  {
    slug: 'pojangland-paper', name: '포장랜드', category: 'paper', subcategory: '비닐/봉투',
    description: '비닐·종이·PVC·지퍼백 포장 패키지 맞춤제작 전문몰. 소량도 빠른 생산.',
    province: '경기도', city: '안양시', phone: '031-000-7010',
    email: 'info@pojangland.co.kr', website: 'https://pojangland.co.kr',
    products: ['비닐봉투', '종이봉투', 'PVC 포장', '지퍼백'],
    certifications: [], is_verified: false,
    tags: [], buyer_category: 'ecommerce_shipping', packaging_form: 'pouch_bag',
  },
  {
    slug: 'seoul-pack-solution', name: '서울포장', category: 'paper', subcategory: '포장솔루션',
    description: '국내 중견 포장 솔루션 기업. 포장용기·배달용기·식품용기 분야 다양한 포장 방법 제안.',
    province: '서울특별시', city: '강남구', phone: '02-000-7011',
    email: 'contact@spack.co.kr', website: 'https://spack.co.kr',
    products: ['포장용기', '배달용기', '일회용기', '쇼핑백'],
    certifications: ['ISO 9001'], is_verified: true,
    tags: ['food_grade'], buyer_category: 'food_beverage', packaging_form: 'box_case',
  },
  {
    slug: 'chakanpack-eco', name: '착한포장', category: 'paper', subcategory: '선물박스/친환경',
    description: '공장 직영 자체 생산 포장재 전문. 환경 부담 최소화 소재 중심 선물박스·쇼핑백 제작.',
    province: '경기도', city: '화성시', phone: '031-000-7012',
    website: 'https://m.chakanpack.com',
    products: ['선물박스', '쇼핑백', '친환경 포장지', '리본'],
    certifications: ['친환경 우수 제품 인증'], is_verified: false,
    tags: [], buyer_category: 'corporate_gift', packaging_form: 'box_case',
  },
  {
    slug: 'papercups-korea', name: '대한종이컵', category: 'paper', subcategory: '종이컵',
    description: '종이컵·종이 식품 용기 전문 생산 기업. 고속 윤전 설비 보유, 대량 납품 특화.',
    province: '충청남도', city: '아산시', phone: '041-000-8006',
    website: 'https://www.papercups.co.kr',
    products: ['종이컵', '종이 도시락', '종이 냉면기', '종이 면기'],
    certifications: ['ISO 9001', 'HACCP 인증'], is_verified: true,
    tags: ['food_grade'], buyer_category: 'food_beverage', packaging_form: 'bottle_container',
  },

  // ── 플라스틱 (plastic) ─────────────────────────────────────────────────────
  {
    slug: 'sunpack-food-container', name: '선팩', category: 'plastic', subcategory: '일회용기',
    description: '일회용 식품 포장용기 전문 기업. PP·PS·PET 등 다양한 소재의 식품 용기 제조·판매.',
    province: '경기도', city: '용인시', phone: '031-000-8001',
    email: 'info@sunpack.kr', website: 'https://sunpack.kr',
    products: ['PP 트레이', 'PS 용기', 'PET 도시락', '뚜껑형 용기'],
    certifications: ['HACCP 인증', '식품위생법 적합'], is_verified: true,
    tags: ['food_grade'], buyer_category: 'food_beverage', packaging_form: 'bottle_container',
  },
  {
    slug: 'modenpack-food', name: '모든팩', category: 'plastic', subcategory: '고기능/밀폐',
    description: '식품포장용기 전문기업. 밀폐용기·찜기·냉동용기 등 고기능 식품 용기 제조.',
    province: '경기도', city: '이천시', phone: '031-000-8002',
    website: 'https://modenpack.com',
    products: ['밀폐용기', '찜기', '냉동용기', '전자레인지용 용기'],
    certifications: ['HACCP 인증'], is_verified: false,
    tags: ['food_grade'], buyer_category: 'food_beverage', packaging_form: 'bottle_container',
  },
  {
    slug: 'yonggiyo-food', name: '용기는요기', category: 'plastic', subcategory: '카페/배달',
    description: '일회용 식품 포장용기 전문 제작·판매. 카페·배달 전문 용기 선두 공급사.',
    province: '서울특별시', city: '송파구', phone: '02-000-8003',
    email: 'hello@yonggiyo.com', website: 'https://yonggiyo.com',
    products: ['카페용 컵', '배달 용기', '아이스크림 컵', '소스컵'],
    certifications: ['식품위생법 적합'], is_verified: true,
    tags: ['food_grade'], buyer_category: 'food_beverage', packaging_form: 'bottle_container',
  },
  {
    slug: 'packmall-foodpack', name: '포장가게', category: 'plastic', subcategory: '종합/실링',
    description: '일회용기·친환경 포장용기 전문몰. 엔터팩 OEM 제조사 운영, 실링기·밀폐용기·종이컵 취급.',
    province: '경기도', city: '시흥시', phone: '031-000-8005',
    email: 'cs@packmall.co.kr', website: 'https://packmall.co.kr',
    products: ['일회용기', '종이컵', '실링 필름', '밀폐용기'],
    certifications: ['HACCP 인증'], is_verified: false,
    tags: ['food_grade'], buyer_category: 'food_beverage', packaging_form: 'bottle_container',
  },
  {
    slug: 'cncairkorea-pack', name: '씨앤씨코리아', category: 'plastic', subcategory: '공기완충/에어팩',
    description: '앞선 기술력의 포장 솔루션 전문 국내 기업. 에어쿠션·에어팩 등 공기 완충 포장재 선도.',
    province: '경기도', city: '군포시', phone: '031-000-9001',
    email: 'info@cncairkorea.com', website: 'https://cncairkorea.com',
    products: ['에어쿠션', '에어팩', '버블랩', '에어캡'],
    certifications: ['ISO 9001', 'KC 인증'], is_verified: true,
    tags: ['industrial'], buyer_category: 'ecommerce_shipping', packaging_form: 'cushioning',
  },
  {
    slug: 'dkpnc-container', name: '대경피앤씨', category: 'plastic', subcategory: 'PET/PP/HDPE',
    description: '용기 제조 분야 선도 기업. PET·PP·HDPE 용기 및 뚜껑 일괄 생산, 식품·화장품·의약품 납품.',
    province: '경기도', city: '화성시', phone: '031-000-0101',
    email: 'info@dkpnc.com', website: 'http://www.dkpnc.com',
    products: ['PET 용기', 'PP 용기', 'HDPE 용기', '용기 뚜껑'],
    certifications: ['ISO 9001', 'HACCP 인증'], is_verified: true,
    tags: ['food_grade'], buyer_category: 'food_beverage', packaging_form: 'bottle_container',
  },
  {
    slug: 'splatech-plastic', name: '새한프라텍', category: 'plastic', subcategory: '사출성형/트레이',
    description: '플라스틱 사출 성형 전문. 자동차·가전·산업용 플라스틱 부품 포장 트레이 제작.',
    province: '경기도', city: '안산시', phone: '031-000-0102',
    website: 'http://www.splatech.com',
    products: ['사출 트레이', '플라스틱 부품 트레이', 'PP 팔레트', '산업용 용기'],
    certifications: ['ISO 9001', 'ISO 14001'], is_verified: false,
    tags: ['industrial'], buyer_category: 'industrial_b2b', packaging_form: 'cushioning',
  },
  {
    slug: 'freecos-plastic', name: '프리코스', category: 'plastic', subcategory: '화장품용기',
    description: '뷰티·화장품 용기 전문 플라스틱 제조사. 크림 자, 펌프 보틀, 튜브 전 품목 생산.',
    province: '인천광역시', city: '부평구', phone: '032-000-0103',
    email: 'cs@freecos.net', website: 'https://www.freecos.net',
    products: ['크림 자', '펌프 보틀', '화장품 튜브', '에어리스 용기'],
    certifications: ['ISO 9001', 'ISO 22716'], is_verified: true,
    tags: ['cosmetic'], buyer_category: 'cosmetics_beauty', packaging_form: 'bottle_container',
  },
  {
    slug: 'tpm-korea-plastic', name: '사장님상회', category: 'plastic', subcategory: '식품용기/테이크아웃',
    description: '소상공인·외식업 맞춤 패키징 솔루션. PET·PP 식품 용기 및 테이크아웃 포장재 공급.',
    province: '서울특별시', city: '구로구', phone: '02-000-0104',
    email: 'help@tpmkorea.kr', website: 'https://tpmkorea.kr',
    products: ['테이크아웃 용기', 'PET 투명 용기', 'PP 식품 용기', '소스컵'],
    certifications: ['식품위생법 적합'], is_verified: false,
    tags: ['food_grade'], buyer_category: 'food_beverage', packaging_form: 'bottle_container',
  },
  {
    slug: 'gyeonggi-plastic-mold', name: '경기플라스틱몰드', category: 'plastic', subcategory: '산업트레이/반도체',
    description: '산업용 플라스틱 성형 전문. 반도체·자동차·전자 부품 전용 트레이 및 캐리어 생산.',
    province: '경기도', city: '수원시', phone: '031-000-0105',
    products: ['반도체 트레이', '자동차 부품 트레이', '전자 부품 캐리어', 'ESD 트레이'],
    certifications: ['ISO 9001', 'ESD 인증'], is_verified: true,
    tags: ['industrial'], buyer_category: 'industrial_b2b', packaging_form: 'cushioning',
  },

  // ── 금속 (metal) ──────────────────────────────────────────────────────────
  {
    slug: 'sama-aluminium-pack', name: '삼아알미늄', category: 'metal', subcategory: '알루미늄포일',
    description: '1969년 창업 국내 알루미늄 포일·연포장 선도 기업. FSC·ISO 인증 보유, 식품·의약·산업 전 산업 납품.',
    province: '경기도', city: '군포시', phone: '031-000-0201',
    email: 'ir@sam-a.co.kr',
    products: ['알루미늄 포일', '식품용 알루미늄 백', '의약용 알루미늄 포장', '산업용 알루미늄 롤'],
    certifications: ['ISO 9001', 'ISO 22000', 'BRC 인증'], is_verified: true,
    tags: ['food_grade'], buyer_category: 'food_beverage', packaging_form: 'can_tin',
  },
  {
    slug: 'daegu-metal-can', name: '대구메탈캔', category: 'metal', subcategory: '식품/음료캔',
    description: '대구·경북권 금속 캔 전문 제조사. 식품·음료·화학 산업용 금속 캔 맞춤 제작.',
    province: '대구광역시', city: '서구', phone: '053-000-0202',
    products: ['알루미늄 캔', '주석 식품 캔', '금속 뚜껑', '화학용 드럼'],
    certifications: ['KS 표시 인증', 'ISO 9001'], is_verified: false,
    tags: ['industrial'], buyer_category: 'industrial_b2b', packaging_form: 'can_tin',
  },
  {
    slug: 'gyeonggi-steel-drum', name: '경기스틸드럼', category: 'metal', subcategory: '드럼/화학',
    description: '국내 최대 스틸 드럼 전문 제조사 중 하나. 오픈헤드·클로즈드헤드 드럼 전 규격 생산.',
    province: '경기도', city: '오산시', phone: '031-000-0203',
    email: 'sales@ksdrum.co.kr',
    products: ['스틸 드럼 18L', '스틸 드럼 200L', '오픈헤드 드럼', 'UN 인증 드럼'],
    certifications: ['UN 위험물 포장 인증', 'ISO 9001'], is_verified: true,
    tags: ['industrial'], buyer_category: 'industrial_b2b', packaging_form: 'can_tin',
  },
  {
    slug: 'jeonbuk-tin-case', name: '전북틴케이스', category: 'metal', subcategory: '틴케이스/선물',
    description: '틴케이스·금속 선물 포장 ODM 전문. 지역 특산물·식품 브랜딩 패키지 맞춤 제작.',
    province: '전라북도', city: '익산시', phone: '063-000-0204',
    products: ['원형 틴케이스', '사각 틴박스', '힌지형 캔', '엠보싱 틴'],
    certifications: ['KS 표시 인증'], is_verified: false,
    tags: [], buyer_category: 'corporate_gift', packaging_form: 'can_tin',
  },

  // ── 연포장 (flexible) ─────────────────────────────────────────────────────
  {
    slug: 'youlchon-food-pack', name: '율촌화학', category: 'flexible', subcategory: '연포장/필름',
    description: '국내 대표 연포장 전문 기업. 식품·의약품용 복합 필름 및 파우치 제조. 라미네이트 튜브 생산.',
    province: '경기도', city: '안성시', phone: '031-000-8004',
    email: 'ir@youlchon.com', website: 'https://www.youlchon.com',
    products: ['복합 필름', '진공 파우치', '레토르트 파우치', '스탠딩 파우치', '라미네이트 튜브'],
    certifications: ['ISO 22000', 'HACCP 인증', 'BRC 인증', 'ISO 9001'], is_verified: true,
    tags: ['food_grade'], buyer_category: 'food_beverage', packaging_form: 'pouch_bag',
  },
  {
    slug: 'gyeongnam-fresh-food-pack', name: '경남신선팩', category: 'flexible', subcategory: '신선/냉동',
    description: '신선식품 및 냉장·냉동 포장재 전문. 남부권 농수산 유통 특화 포장재 공급사.',
    province: '경상남도', city: '김해시', phone: '055-000-8007',
    products: ['냉동 포장재', '신선 트레이', '아이스팩', '진공 필름'],
    certifications: ['HACCP 인증'], is_verified: false,
    tags: ['food_grade'], buyer_category: 'food_beverage', packaging_form: 'stretch_film',
  },
  {
    slug: 'hongjin-pack', name: '홍진포장', category: 'flexible', subcategory: '필름/포장지',
    description: '대한민국 대표 포장지 전문 제조기업. OPP·CPP·PE 필름 포장지 자체 생산.',
    province: '경기도', city: '의왕시', phone: '031-000-9002',
    email: 'biz@hjpack.net', website: 'https://www.hjpack.net',
    products: ['OPP 포장지', 'CPP 포장지', 'PE 필름', '스트레치 필름'],
    certifications: ['ISO 9001'], is_verified: true,
    tags: ['industrial'], buyer_category: 'industrial_b2b', packaging_form: 'stretch_film',
  },
  {
    slug: 'daehung-pojang', name: '대흥포장', category: 'flexible', subcategory: '물류/스트레치',
    description: '산업용 포장재 전문 제조·판매. 스트레치 필름·방청지·에어캡 등 물류 포장재 전 품목 공급.',
    province: '경기도', city: '안산시', phone: '031-000-9003',
    website: 'https://www.pojang.co.kr',
    products: ['스트레치 필름', '방청지', '에어캡', '파레트 랩'],
    certifications: ['ISO 9001'], is_verified: false,
    tags: ['industrial'], buyer_category: 'industrial_b2b', packaging_form: 'stretch_film',
  },
  {
    slug: 'dongil-aluminum-foil', name: '동일알루미늄', category: 'flexible', subcategory: '알루미늄연포장',
    description: '알루미늄 포일 연포장 전문 기업. 식품·의약·화학 산업용 알루미늄 연포장재 생산.',
    province: '경기도', city: '시흥시', phone: '031-000-9004',
    email: 'sales@dongilal.com', website: 'https://dongilal.com',
    products: ['알루미늄 포일', '알루미늄 파우치', '연포장 필름', '알루미늄 백'],
    certifications: ['ISO 9001', 'ISO 22000'], is_verified: true,
    tags: ['industrial', 'food_grade'], buyer_category: 'food_beverage', packaging_form: 'pouch_bag',
  },
  {
    slug: 'busan-stretch-pack', name: '부산스트레치팩', category: 'flexible', subcategory: '물류소모품',
    description: '부산·경남권 물류 포장재 전문 공급사. 스트레치 필름·PP 밴드·물류 소모품 대량 유통.',
    province: '부산광역시', city: '강서구', phone: '051-000-9005',
    products: ['스트레치 필름', 'PP 밴드', '테이프', '파렛트'],
    certifications: [], is_verified: false,
    tags: ['industrial'], buyer_category: 'industrial_b2b', packaging_form: 'stretch_film',
  },
  {
    slug: 'dongwon-systems', name: '동원시스템즈', category: 'flexible', subcategory: '종합패키징',
    description: '1980년 설립 종합 패키징 전문 기업. 연포장재·알루미늄박·PET병·캔 등 포장재 전 분야 제조. 약 30개국 수출.',
    province: '서울특별시', city: '서초구', phone: '02-589-3079',
    website: 'https://www.dongwonsystems.com',
    products: ['연포장 필름', '알루미늄박', 'PET병', '알루미늄 캔', '스틸 캔'],
    certifications: ['ISO 9001', 'ISO 14001'], is_verified: true,
    tags: ['food_grade'], buyer_category: 'food_beverage', packaging_form: 'pouch_bag',
    founded_year: 1980,
  },
  {
    slug: 'myungji-pnp', name: '명지피앤피', category: 'flexible', subcategory: '파우치/지속가능',
    description: '1988년 설립 연포장 전문 기업. 친환경 모노소재 PE 파우치, 고차단 필름, 식품 포장재 제조.',
    province: '경기도', city: '화성시', phone: '031-355-5811',
    website: 'https://mjpnp.co.kr',
    products: ['모노소재 PE 파우치', '식품 포장 필름', '레토르트 파우치', '고차단 필름'],
    certifications: ['ISO 9001'], is_verified: true,
    tags: ['food_grade'], buyer_category: 'food_beverage', packaging_form: 'pouch_bag',
    founded_year: 1988,
  },
  {
    slug: 'handoo-package', name: '한두패키지', category: 'flexible', subcategory: '그라비어/플렉소',
    description: '1986년 설립 연포장 인쇄·가공 전문 기업. 그라비어·플렉소 인쇄, 친환경 포장재 R&D 역량 보유.',
    province: '인천광역시', city: '남동구', phone: '032-814-1511',
    website: 'https://www.handoo.co.kr',
    products: ['그라비어 인쇄 필름', '플렉소 인쇄 필름', '친환경 포장재', '기능성 필름'],
    certifications: ['ISO 9001', 'ISO 14001'], is_verified: true,
    tags: [], buyer_category: 'food_beverage', packaging_form: 'pouch_bag',
    founded_year: 1986,
  },
  {
    slug: 'heesung-polymer', name: '희성폴리머', category: 'flexible', subcategory: '연포장필름/방수포',
    description: '40년 이상 기술 축적 연포장·산업필름 전문 기업. 레토르트 파우치, 고차단 필름, 방수포 등 생산.',
    province: '서울특별시', city: '중구', phone: '02-6960-0900',
    website: 'https://hspd.co.kr',
    products: ['레토르트 파우치', '고차단 필름', 'LID 필름', '리필백', '방수포'],
    certifications: ['ISO 9001'], is_verified: true,
    tags: ['food_grade'], buyer_category: 'food_beverage', packaging_form: 'pouch_bag',
    founded_year: 1960,
  },
  {
    slug: 'cnk-propack', name: '씨앤케이프로팩', category: 'flexible', subcategory: '맞춤파우치',
    description: '2001년 설립 연포장 토탈 솔루션 기업. 레토르트·전자레인지·지퍼·스파우트 파우치 등 맞춤 제작.',
    province: '서울특별시', city: '성동구', phone: '02-3444-5928',
    website: 'https://ckpropack.com',
    products: ['레토르트 파우치', '전자레인지 파우치', '지퍼 파우치', '스파우트 파우치', '마스크팩 파우치'],
    certifications: [], is_verified: true,
    tags: ['food_grade', 'cosmetic'], buyer_category: 'food_beverage', packaging_form: 'pouch_bag',
    founded_year: 2001,
  },
  {
    slug: 'korpack-corp', name: '코리아팩', category: 'flexible', subcategory: '프리메이드파우치',
    description: '1992년 설립 연포장재 글로벌 공급 기업. 프리메이드 파우치·스파우트 파우치 등 30년 이상 해외 수출.',
    province: '경기도', city: '성남시', phone: '031-713-3160',
    website: 'https://www.korpack.co.kr',
    products: ['프리메이드 파우치', '스파우트 파우치', '레토르트 파우치', '커피 포드'],
    certifications: [], is_verified: true,
    tags: ['food_grade'], buyer_category: 'food_beverage', packaging_form: 'pouch_bag',
    founded_year: 1992,
  },

  // ── 유리 (glass) ──────────────────────────────────────────────────────────
  {
    slug: 'osung-package-glass', name: '오성패키지', category: 'glass', subcategory: '유리병/PET',
    description: '유리병 용기 전문업체. 식품병·음료병·주류병·PET·트라이탄 용기 등 다양한 유리 용기 생산·판매.',
    province: '경기도', city: '남양주시', phone: '02-475-7411',
    email: 'osungp@nate.com', website: 'https://osungp.com',
    products: ['식품 유리병', '음료 유리병', '주류 유리병', 'PET 용기', '트라이탄 용기'],
    certifications: [], is_verified: true,
    tags: ['food_grade'], buyer_category: 'food_beverage', packaging_form: 'bottle_container',
  },
  {
    slug: 'kyungjin-glass', name: '경진기업', category: 'glass', subcategory: '유리병/PET병',
    description: '유리병·PET병 직접 제조 전문업체. 음료·소스·꿀·제약 용기 등 고중량 품질 유리병 생산.',
    province: '경기도', city: '남양주시', phone: '1588-1223',
    website: 'https://kjpt.co.kr',
    products: ['음료 유리병', '소스 유리병', '꿀병', '제약 유리병', 'PET병'],
    certifications: [], is_verified: true,
    tags: ['food_grade'], buyer_category: 'food_beverage', packaging_form: 'bottle_container',
  },
  {
    slug: 'mirkorea-glass', name: '미르코리아', category: 'glass', subcategory: '유리병/도매',
    description: '유리병·페트병·유리컵 전문 도매몰. 식품 저장 용기, 음료 용기, 화장품 용기 등 종합 유리 용기 도매.',
    province: '경기도', city: '파주시', phone: '031-000-4001',
    website: 'https://www.mirkorea.kr',
    products: ['잼 유리병', '꿀 유리병', '음료 유리병', '와인병', '유리컵'],
    certifications: [], is_verified: true,
    tags: ['food_grade'], buyer_category: 'food_beverage', packaging_form: 'bottle_container',
  },
  {
    slug: 'onepackage-glass', name: '원패키지', category: 'glass', subcategory: '유리병/제약',
    description: '유리병 전문 쇼핑몰. 유리 용기, 제약 용기, 식품 용기, 주류·음료 용기, 화장품 용기 도매.',
    province: '경기도', city: '여주시', phone: '1833-9161',
    website: 'https://bottlemall.co.kr',
    products: ['제약 유리병', '식품 유리병', '와인병', '허브병', '화장품 유리 용기'],
    certifications: [], is_verified: true,
    tags: ['pharma'], buyer_category: 'health_medical', packaging_form: 'bottle_container',
  },
  {
    slug: 'damsang-glass', name: '담상', category: 'glass', subcategory: '유리용기/인쇄',
    description: '유리병·유리컵 인쇄 도매 전문. 맥주잔·와인잔·소주잔 등 음용 유리 및 저장 용기, 레이저 인쇄 서비스 제공.',
    province: '충청북도', city: '진천군', phone: '070-4307-3617',
    website: 'https://damsang.com',
    products: ['맥주잔', '와인잔', '잼병', '꿀병', '유리컵 레이저 인쇄'],
    certifications: [], is_verified: true,
    tags: [], buyer_category: 'food_beverage', packaging_form: 'bottle_container',
  },
  {
    slug: 'glassdomae-bottle', name: '병도매닷컴', category: 'glass', subcategory: '유리병/PET병',
    description: '유리병·PET병·패키지 전문 도매몰. 꿀병, 기름병, 디스펜서, 미스트, 식품병, 포장 박스, 라벨 종합 취급.',
    province: '경기도', city: '고양시', phone: '070-5001-0456',
    website: 'https://www.glassdomae.com',
    products: ['꿀 유리병', '기름 유리병', '디스펜서', 'PET병', '포장 라벨'],
    certifications: [], is_verified: true,
    tags: ['food_grade'], buyer_category: 'food_beverage', packaging_form: 'bottle_container',
  },

  // ── 친환경 (eco) ──────────────────────────────────────────────────────────
  {
    slug: 'dongsong-ecoviva', name: '동성케미컬', category: 'eco', subcategory: '생분해/완충재',
    description: '에코비바(ECOVIVA®) 브랜드로 생분해 포장재 선도. 에어캡·비드폼·멀티레이어 필름 등 친환경 완충재 생산.',
    province: '경기도', city: '평택시', phone: '031-000-0301',
    email: 'eco@dongsong.com',
    products: ['에코비바 에어캡', '생분해 비드폼', '친환경 멀티레이어 필름', '생분해 완충재'],
    certifications: ['OK Compost 인증', 'ISO 14001', 'GRS 인증'], is_verified: true,
    tags: [], buyer_category: 'ecommerce_shipping', packaging_form: 'cushioning',
  },
  {
    slug: 'bgfecosolution', name: 'BGF에코솔루션', category: 'eco', subcategory: 'PLA/바이오플라스틱',
    description: '국내 친환경 생분해 플라스틱·바이오플라스틱 선도 제조사. PLA 폼 시트·용기 독점 생산.',
    province: '경기도', city: '용인시', phone: '031-000-0302',
    email: 'info@bgfecosolution.com', website: 'http://www.bgfecosolution.com',
    products: ['PLA 폼 시트', '생분해 용기', 'PLA 트레이', '바이오 필름'],
    certifications: ['OK Compost 인증', 'ISO 14001', 'GRS 인증'], is_verified: true,
    tags: ['food_grade'], buyer_category: 'food_beverage', packaging_form: 'bottle_container',
  },
  {
    slug: 'caretbio-eco', name: '칼렛바이오', category: 'eco', subcategory: '식물성소재',
    description: '식물성 소재 기반 친환경 포장재 제작 기업. ESG 경영 기업 패키징 컨설팅 및 맞춤 제작.',
    province: '서울특별시', city: '서초구', phone: '02-000-0303',
    email: 'hello@caretbio.com', website: 'https://shop.caretbio.com',
    products: ['식물성 비닐백', '생분해 포장지', '친환경 테이프', '대나무 완충재'],
    certifications: ['OK Compost 인증', 'GRS 인증'], is_verified: true,
    tags: [], buyer_category: 'corporate_gift', packaging_form: 'pouch_bag',
  },
  {
    slug: 'cj-phact-eco', name: 'CJ제일제당 바이오소재', category: 'eco', subcategory: 'PHA/바이오소재',
    description: 'PHA 기반 생분해 소재 브랜드 PHACT® 운영. 식품·의약·물류 산업 친환경 포장재 솔루션.',
    province: '서울특별시', city: '중구', phone: '02-000-0304',
    email: 'phact@cj.net', website: 'https://www.cj.co.kr',
    products: ['PHA 필름', 'PHA 파우치', '생분해 포장재', '친환경 복합 필름'],
    certifications: ['OK Compost 인증', 'ISO 14001', 'ISO 9001'], is_verified: true,
    tags: ['food_grade'], buyer_category: 'food_beverage', packaging_form: 'pouch_bag',
  },
  {
    slug: 'gyeonggi-eco-bag', name: '경기에코백', category: 'eco', subcategory: '재생지/쇼핑백',
    description: '재생지·친환경 소재 쇼핑백 전문 제조사. 기업 친환경 캠페인 패키징 ODM 서비스 제공.',
    province: '경기도', city: '고양시', phone: '031-000-0305',
    products: ['재생지 쇼핑백', 'FSC 쇼핑백', '코튼 가방', '친환경 캐리어백'],
    certifications: ['FSC 인증', 'GRS 인증'], is_verified: false,
    tags: [], buyer_category: 'corporate_gift', packaging_form: 'shopping_bag',
  },
  {
    slug: 'jeju-bamboo-pack', name: '제주대나무팩', category: 'eco', subcategory: '천연소재/관광',
    description: '대나무·왕겨 등 자연 소재 기반 친환경 포장재. 제주 관광·특산물 브랜드 포장 납품 특화.',
    province: '제주특별자치도', city: '서귀포시', phone: '064-000-0306',
    products: ['대나무 완충재', '왕겨 포장재', '자연 소재 선물 박스', '친환경 쇼핑백'],
    certifications: ['친환경 우수 제품 인증'], is_verified: false,
    tags: [], buyer_category: 'corporate_gift', packaging_form: 'cushioning',
  },
  {
    slug: 'seoul-recycled-pack', name: '서울재활용팩', category: 'eco', subcategory: '재활용/ESG',
    description: '100% 재활용 소재 기반 포장재 전문 제조사. 대기업 ESG 조달 협력사 등록.',
    province: '서울특별시', city: '노원구', phone: '02-000-0307',
    email: 'esg@recycledpack.kr',
    products: ['재활용 골판지', '재생 쇼핑백', 'PCR 플라스틱 용기', '리사이클 완충재'],
    certifications: ['GRS 인증', 'ISO 14001'], is_verified: true,
    tags: [], buyer_category: 'ecommerce_shipping', packaging_form: 'cushioning',
  },
]

async function run() {
  console.log(`\n🔍 Checking existing companies...`)
  const { data: existing } = await supabase.from('companies').select('slug')
  const existingSlugs = new Set((existing || []).map(c => c.slug))
  console.log(`   Found ${existingSlugs.size} existing companies.`)

  const toInsert = companies.filter(c => !existingSlugs.has(c.slug))
  console.log(`   ${toInsert.length} new companies to insert (${companies.length - toInsert.length} skipped as duplicates).\n`)

  if (toInsert.length === 0) {
    console.log('✅ All companies already exist. Nothing to insert.')
    return
  }

  const BATCH = 10
  let inserted = 0

  for (let i = 0; i < toInsert.length; i += BATCH) {
    const batch = toInsert.slice(i, i + BATCH)
    const { error } = await supabase.from('companies').insert(batch)
    if (error) {
      console.error(`❌ Batch ${Math.floor(i / BATCH) + 1} error:`, error.message)
    } else {
      inserted += batch.length
      console.log(`   ✓ Inserted batch ${Math.floor(i / BATCH) + 1} (${batch.length} companies)`)
    }
  }

  const { count } = await supabase
    .from('companies')
    .select('*', { count: 'exact', head: true })

  console.log(`\n✅ Done! Inserted ${inserted} companies. Total in DB: ${count}`)
}

run().catch(err => {
  console.error('Fatal:', err.message)
  process.exit(1)
})
