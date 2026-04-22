// ── Primary L1: Industry categories (multi-mapped, 업종별 대분류) ──

export type IndustryCategory =
  | 'food-beverage'
  | 'ecommerce-shipping'
  | 'cosmetics-beauty'
  | 'pharma-health'
  | 'electronics-industrial'
  | 'eco-special'

export const INDUSTRY_CATEGORIES: IndustryCategory[] = [
  'food-beverage',
  'ecommerce-shipping',
  'cosmetics-beauty',
  'pharma-health',
  'electronics-industrial',
  'eco-special',
]

export const INDUSTRY_CATEGORY_LABELS: Record<IndustryCategory, string> = {
  'food-beverage':          '식품·음료 포장',
  'ecommerce-shipping':     '이커머스·배송 포장',
  'cosmetics-beauty':       '화장품·뷰티 포장',
  'pharma-health':          '의약·건강 포장',
  'electronics-industrial': '전자·산업 포장',
  'eco-special':            '친환경·특수 포장',
}

export const INDUSTRY_CATEGORY_DESCRIPTIONS: Record<IndustryCategory, string> = {
  'food-beverage':          '식품, 음료, 냉동식품용 포장재 및 용기',
  'ecommerce-shipping':     '박스, 완충재, 테이프, 배송 포장',
  'cosmetics-beauty':       '스킨케어, 메이크업, 헤어케어 포장',
  'pharma-health':          '의약품, 건강기능식품, 의료기기 포장',
  'electronics-industrial': '전자제품, 부품, 산업재 보호 포장',
  'eco-special':            '친환경, 생분해, 특수 공정 포장',
}

export const INDUSTRY_CATEGORY_ICONS: Record<IndustryCategory, string> = {
  'food-beverage':          '🍱',
  'ecommerce-shipping':     '📦',
  'cosmetics-beauty':       '💄',
  'pharma-health':          '💊',
  'electronics-industrial': '⚙️',
  'eco-special':            '🌿',
}

// ── Primary L2: Material filter (소재 필터) ──

export type MaterialType =
  | 'paper-corrugated'
  | 'plastic-container'
  | 'film-pouch'
  | 'glass-metal'
  | 'label-print'
  | 'eco-material'

export const MATERIAL_TYPES: MaterialType[] = [
  'paper-corrugated',
  'plastic-container',
  'film-pouch',
  'glass-metal',
  'label-print',
  'eco-material',
]

export const MATERIAL_TYPE_LABELS: Record<MaterialType, string> = {
  'paper-corrugated':  '종이·골판지',
  'plastic-container': '플라스틱·용기',
  'film-pouch':        '필름·파우치',
  'glass-metal':       '유리·금속',
  'label-print':       '라벨·인쇄물',
  'eco-material':      '친환경 소재',
}

// ── Legacy types (kept for crawler/classifier backward compat) ──

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

export const CATEGORY_TO_MATERIAL: Record<Category, MaterialType> = {
  paper:    'paper-corrugated',
  plastic:  'plastic-container',
  flexible: 'film-pouch',
  metal:    'glass-metal',
  glass:    'glass-metal',
  eco:      'eco-material',
}

// ── Certification taxonomy (canonical IDs for filtering) ──

export type CertificationCategory = 'quality' | 'food_safety' | 'environmental' | 'pharma' | 'general'

export interface CertificationType {
  id: string
  label: string
  category: CertificationCategory
  aliases: string[]
}

export const CERTIFICATION_CATEGORY_LABELS: Record<CertificationCategory, string> = {
  quality: '품질',
  food_safety: '식품안전',
  environmental: '환경',
  pharma: '제약',
  general: '일반',
}

export const CERTIFICATION_TYPES: CertificationType[] = [
  { id: 'iso9001',       label: 'ISO 9001',       category: 'quality',       aliases: ['ISO 9001', 'iso9001', 'ISO9001'] },
  { id: 'iso14001',      label: 'ISO 14001',      category: 'environmental', aliases: ['ISO 14001', 'iso14001', 'ISO14001'] },
  { id: 'iso22000',      label: 'ISO 22000',      category: 'food_safety',   aliases: ['ISO 22000', 'iso22000', 'ISO22000'] },
  { id: 'iso22716',      label: 'ISO 22716',      category: 'quality',       aliases: ['ISO 22716', 'iso22716', 'ISO22716'] },
  { id: 'haccp',         label: 'HACCP',           category: 'food_safety',   aliases: ['HACCP', 'HACCP 인증', 'haccp'] },
  { id: 'gmp',           label: 'GMP',             category: 'pharma',        aliases: ['GMP', 'gmp', 'GMP 인증'] },
  { id: 'fsc',           label: 'FSC',             category: 'environmental', aliases: ['FSC', 'FSC 인증', 'fsc'] },
  { id: 'grs',           label: 'GRS',             category: 'environmental', aliases: ['GRS', 'GRS 인증', 'grs'] },
  { id: 'ok_compost',    label: 'OK Compost',      category: 'environmental', aliases: ['OK Compost', 'OK Compost 인증', 'ok compost'] },
  { id: 'eco_friendly',  label: '친환경 인증',     category: 'environmental', aliases: ['친환경 인증', '친환경', '에코인증'] },
  { id: 'food_hygiene',  label: '식품위생법 적합', category: 'food_safety',   aliases: ['식품위생법 적합', '식품위생법', '식품위생'] },
  { id: 'kfda',          label: '식약처 인증',     category: 'pharma',        aliases: ['식약처 인증', '식약처', 'KFDA'] },
  { id: 'kc',            label: 'KC 인증',         category: 'general',       aliases: ['KC 인증', 'KC', 'kc'] },
  { id: 'food_grade',    label: '식품등급',         category: 'food_safety',   aliases: ['식품등급', '식품 등급', 'food grade'] },
]

// ── Company interface ──

export interface Company {
  id: string
  slug: string
  name: string
  description: string | null
  category: Category
  subcategory: string | null
  tags: string[]
  industry_categories: IndustryCategory[]
  material_type: MaterialType | null
  buyer_category: string | null
  packaging_form: string | null
  city: string | null
  province: string | null
  website: string | null
  logo_url: string | null
  icon_url: string | null
  products: string[]
  certifications: string[]
  founded_year: number | null
  min_order_quantity: string | null
  service_capabilities: string[]
  target_industries: string[]
  key_clients: string[]
  review_count: number
  avg_rating: number | null
  is_verified: boolean
  created_at: string
  updated_at: string
}

export interface Portfolio {
  id: string
  company_id: string
  title: string
  description: string | null
  image_url: string | null
  display_order: number
  created_at: string
  updated_at: string
}

export interface ConversionEvent {
  id: string
  event_type: string
  company_id: string | null
  session_id: string | null
  industry_category: string | null
  material_type: string | null
  referrer_path: string | null
  metadata: Record<string, unknown>
  created_at: string
}

export interface BlogPost {
  id: string
  slug: string
  title: string
  excerpt: string | null
  body: string | null
  cover_image_url: string | null
  og_image_url: string | null
  category: IndustryCategory | null
  status: 'draft' | 'published'
  author: string
  meta_title: string | null
  meta_description: string | null
  published_at: string | null
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
