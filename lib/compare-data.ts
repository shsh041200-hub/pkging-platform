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

/**
 * Returns all (slug, name) pairs for verified companies, used in sitemap generation.
 * Capped at 100 to keep pair combinations manageable (≤ 4950 pairs max).
 */
export async function listVerifiedCompanyStubs(): Promise<{ slug: string; name: string }[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('companies')
    .select('slug, name')
    .eq('is_verified', true)
    .eq('is_hidden', false)
    .limit(100)
  if (error) {
    console.error('[compare-data] listVerifiedCompanyStubs error:', error)
    return []
  }
  return (data ?? []) as { slug: string; name: string }[]
}

/** Returns 0–100 representing how many of the 18 compare fields are filled. */
export function computeCompleteness(c: CompanyFull): number {
  const filled = [
    !!(c.city || c.province),
    c.founded_year != null,
    true, // is_verified: non-nullable boolean — always data-present
    (c.industry_categories?.length ?? 0) > 0,
    c.material_type != null,
    c.packaging_form != null,
    (c.certifications?.length ?? 0) > 0,
    (c.service_capabilities?.length ?? 0) > 0,
    c.print_method != null,
    c.moq_value != null,
    c.lead_time_standard_days != null,
    c.lead_time_express_days != null,
    c.price_tier != null,
    c.sample_available != null,
    true, // cold_packaging_available: non-nullable boolean
    true, // greenwashing_verified: non-nullable boolean
    c.reuse_model != null,
    c.avg_rating != null,
  ].filter(Boolean).length
  return Math.round((filled / 18) * 100)
}
