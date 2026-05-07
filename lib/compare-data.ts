import { createClient } from '@/lib/supabase/server'

export type CompanyFull = {
  id: string
  slug: string
  name: string
  city: string | null
  province: string | null
  website: string | null
  logo_url: string | null
  icon_url: string | null
  is_verified: boolean
  founded_year: number | null
  material_type: string | null
  packaging_form: string | null
  industry_categories: string[]
  certifications: string[]
  cert_count: number
  service_capabilities: string[]
  print_method: string | null
  moq_value: number | null
  moq_unit: string | null
  lead_time_standard_days: number | null
  lead_time_express_days: number | null
  price_tier: string | null
  sample_available: boolean | null
  cold_packaging_available: boolean
  greenwashing_verified: boolean
  reuse_model: string | null
  avg_rating: number | null
  review_count: number
}

export type CompareCartItem = {
  slug: string
  name: string
}

export const COMPARE_CART_KEY = 'packlinx_compare_cart'
export const COMPARE_MAX = 3

// ── Client-side cart helpers (safe in SSR) ────────────────────────────────────

export function getCartItems(): CompareCartItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(COMPARE_CART_KEY)
    return raw ? (JSON.parse(raw) as CompareCartItem[]) : []
  } catch {
    return []
  }
}

export function setCartItems(items: CompareCartItem[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(COMPARE_CART_KEY, JSON.stringify(items))
  window.dispatchEvent(new Event('compare-cart-updated'))
}

export function addToCart(item: CompareCartItem): boolean {
  const current = getCartItems()
  if (current.length >= COMPARE_MAX) return false
  if (current.some((c) => c.slug === item.slug)) return true
  setCartItems([...current, item])
  return true
}

export function removeFromCart(slug: string): void {
  setCartItems(getCartItems().filter((c) => c.slug !== slug))
}

export function isInCart(slug: string): boolean {
  return getCartItems().some((c) => c.slug === slug)
}

// ── Server-side data fetching ─────────────────────────────────────────────────

export async function getCompaniesBySlugs(slugs: string[]): Promise<CompanyFull[]> {
  if (!slugs.length) return []
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('companies')
    .select(
      `id, slug, name, city, province, website, logo_url, icon_url, is_verified,
       founded_year, material_type, packaging_form, industry_categories,
       certifications, cert_count, service_capabilities, print_method,
       moq_value, moq_unit, lead_time_standard_days, lead_time_express_days,
       price_tier, sample_available, cold_packaging_available,
       greenwashing_verified, reuse_model, avg_rating, review_count`,
    )
    .in('slug', slugs)
    .eq('is_hidden', false)

  if (error) {
    console.error('[compare-data] Supabase error:', error)
    return []
  }

  const bySlug = Object.fromEntries((data ?? []).map((c: CompanyFull) => [c.slug, c]))
  return slugs.map((s) => bySlug[s]).filter(Boolean) as CompanyFull[]
}
