// Level 3: 소재/유형 (기존 구조 보존 — DB category 컬럼)
export type Category =
  | 'paper'
  | 'plastic'
  | 'metal'
  | 'flexible'
  | 'eco'
  | 'glass'

export const CATEGORY_LABELS: Record<Category, string> = {
  paper:    '지류/종이',
  plastic:  '플라스틱',
  metal:    '금속',
  flexible: '연포장',
  eco:      '친환경',
  glass:    '유리',
}

// Level 3: 기능/서비스 태그 (기존 구조 보존)
export type CompanyTag =
  | 'food_grade'
  | 'industrial'
  | 'cosmetic'
  | 'pharma'
  | 'design_service'
  | 'ecommerce'

export const TAG_LABELS: Record<CompanyTag, string> = {
  food_grade:     '식품등급',
  industrial:     '산업용',
  cosmetic:       '화장품',
  pharma:         '제약',
  design_service: '디자인',
  ecommerce:      '이커머스',
}

// Level 1: 제품 유형 (바이어 중심 1차 분류)
export type BuyerCategory =
  | 'food_beverage'
  | 'cosmetics_beauty'
  | 'fashion_apparel'
  | 'electronics_tech'
  | 'health_medical'
  | 'home_living'
  | 'ecommerce_shipping'
  | 'corporate_gift'
  | 'industrial_b2b'

export const BUYER_CATEGORY_LABELS: Record<BuyerCategory, string> = {
  food_beverage:      '식품 & 음료',
  cosmetics_beauty:   '화장품 & 뷰티',
  fashion_apparel:    '패션 & 의류',
  electronics_tech:   '전자제품 & IT',
  health_medical:     '건강 & 의료',
  home_living:        '생활용품 & 홈',
  ecommerce_shipping: '이커머스 & 배송',
  corporate_gift:     '기업 & 브랜드 선물',
  industrial_b2b:     '산업재 & B2B',
}

export const BUYER_CATEGORY_DESCRIPTIONS: Record<BuyerCategory, string> = {
  food_beverage:      '스낵, 음료, 밀키트, 농산물 등 식음료 제품 포장',
  cosmetics_beauty:   '스킨케어, 화장품, 향수, 헤어케어 포장 솔루션',
  fashion_apparel:    '의류, 신발, 주얼리, 가방 포장',
  electronics_tech:   '전자기기, 액세서리, 부품 보호 포장',
  health_medical:     '의약품, 의료기기, 건강보조제 포장',
  home_living:        '주방, 생활소품, 반려동물용품 포장',
  ecommerce_shipping: '온라인 쇼핑몰, 택배, 콜드체인 패키징',
  corporate_gift:     '기업 브랜디드, 선물세트, 행사 패키징',
  industrial_b2b:     '부품, 원자재, 산업용 보호 포장',
}

// Level 2: 포장 형태 (2차 분류)
export type PackagingForm =
  | 'box_case'
  | 'pouch_bag'
  | 'bottle_container'
  | 'tube'
  | 'can_tin'
  | 'shopping_bag'
  | 'cushioning'
  | 'stretch_film'
  | 'label_sticker'
  | 'tape_sealing'

export const PACKAGING_FORM_LABELS: Record<PackagingForm, string> = {
  box_case:          '박스 / 케이스',
  pouch_bag:         '파우치 / 백',
  bottle_container:  '병 / 용기',
  tube:              '튜브',
  can_tin:           '캔 / 틴',
  shopping_bag:      '쇼핑백',
  cushioning:        '완충재 / 보호재',
  stretch_film:      '스트레치 / 필름',
  label_sticker:     '라벨 / 스티커',
  tape_sealing:      '테이프 / 밀봉재',
}

// Level 1 → Level 2 추천 매핑 (동적 필터링용)
export const BUYER_CATEGORY_PACKAGING_FORMS: Record<BuyerCategory, PackagingForm[]> = {
  food_beverage:      ['pouch_bag', 'box_case', 'bottle_container', 'can_tin', 'label_sticker', 'stretch_film'],
  cosmetics_beauty:   ['bottle_container', 'tube', 'box_case', 'pouch_bag', 'label_sticker'],
  fashion_apparel:    ['shopping_bag', 'box_case', 'pouch_bag', 'label_sticker'],
  electronics_tech:   ['box_case', 'cushioning', 'stretch_film', 'tape_sealing'],
  health_medical:     ['bottle_container', 'tube', 'box_case', 'pouch_bag', 'label_sticker'],
  home_living:        ['box_case', 'pouch_bag', 'shopping_bag', 'cushioning'],
  ecommerce_shipping: ['box_case', 'shopping_bag', 'cushioning', 'tape_sealing', 'stretch_film'],
  corporate_gift:     ['box_case', 'shopping_bag', 'pouch_bag', 'label_sticker'],
  industrial_b2b:     ['box_case', 'cushioning', 'stretch_film', 'tape_sealing', 'can_tin'],
}

export interface Company {
  id: string
  slug: string
  name: string
  description: string | null
  category: Category
  subcategory: string | null
  tags: string[]
  buyer_category: BuyerCategory | null
  packaging_form: PackagingForm | null
  address?: string | null
  city: string | null
  province: string | null
  phone: string | null
  email?: string | null
  website: string | null
  logo_url: string | null
  products: string[]
  certifications: string[]
  founded_year: number | null
  employee_range: '1-10' | '11-50' | '51-200' | '200+' | null
  min_order_quantity: string | null
  service_capabilities: string[]
  target_industries: string[]
  key_clients: string[]
  is_verified: boolean
  created_at: string
  updated_at: string
}

export interface Review {
  id: string
  company_id: string
  user_id: string
  rating: number
  content: string
  created_at: string
}

export interface UserProfile {
  id: string
  role: 'buyer' | 'supplier' | 'admin'
  company_id: string | null
  display_name: string | null
  created_at: string
}
