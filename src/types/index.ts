export type Category =
  | 'saneobyong'
  | 'food_grade'
  | 'jiryu'
  | 'plastic'
  | 'metal'
  | 'eco'
  | 'package_design'

export const CATEGORY_LABELS: Record<Category, string> = {
  saneobyong: '산업용',
  food_grade: '식품등급',
  jiryu: '지류',
  plastic: '플라스틱',
  metal: '금속',
  eco: '친환경',
  package_design: '패키지 디자인',
}

export interface Company {
  id: string
  slug: string
  name: string
  description: string | null
  category: Category
  subcategory: string | null
  address: string | null
  city: string | null
  province: string | null
  phone: string | null
  email: string | null
  website: string | null
  logo_url: string | null
  products: string[]
  certifications: string[]
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
