import { MetadataRoute } from 'next'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { INDUSTRY_CATEGORIES } from '@/types'
import { PRODUCT_SLUGS } from '@/data/productGuide'
import { SERVICE_SLUGS } from '@/data/serviceGuide'

// Build-time / static-generation context — cannot use the cookie-based
// SSR client. Use a plain anon client; sitemap reads only public rows.
function createClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } },
  )
}

// Google sitemap limits: 50,000 URLs and 50 MB per file. Index 0 holds
// static + categories + products + services + guides; index >=1 holds
// companies in 50k-slug chunks. PACAA-117.
const COMPANIES_PER_SITEMAP = 50_000
const SUPABASE_PAGE_SIZE = 1_000

const baseUrl = () =>
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://packlinx.com'

async function getCompanyCount(): Promise<number> {
  const supabase = createClient()
  const { count, error } = await supabase
    .from('companies')
    .select('id', { count: 'exact', head: true })
  if (error || count === null) {
    console.error('[sitemap] company count failed', error)
    return 0
  }
  return count
}

async function fetchCompanySlice(
  offset: number,
  limit: number,
): Promise<Array<{ slug: string; updated_at: string | null }>> {
  const supabase = createClient()
  const out: Array<{ slug: string; updated_at: string | null }> = []
  let cursor = offset
  const end = offset + limit
  while (cursor < end) {
    const pageEnd = Math.min(cursor + SUPABASE_PAGE_SIZE, end) - 1
    const { data, error } = await supabase
      .from('companies')
      .select('slug, updated_at')
      .order('updated_at', { ascending: false })
      .range(cursor, pageEnd)
    if (error) {
      console.error('[sitemap] company page failed', { cursor, pageEnd, error })
      break
    }
    if (!data || data.length === 0) break
    out.push(...data)
    if (data.length < pageEnd - cursor + 1) break
    cursor += data.length
  }
  return out
}

export async function generateSitemaps() {
  const total = await getCompanyCount()
  const companyShards = Math.max(1, Math.ceil(total / COMPANIES_PER_SITEMAP))
  // id 0 = static; id 1..companyShards = company chunks.
  return Array.from({ length: companyShards + 1 }, (_, i) => ({ id: i }))
}

async function staticSitemap(): Promise<MetadataRoute.Sitemap> {
  const root = baseUrl()
  const supabase = createClient()
  const { data: guidePosts } = await supabase
    .from('blog_posts')
    .select('slug, published_at')
    .eq('status', 'published')
    .eq('content_type', 'guide')
    .order('published_at', { ascending: false })
    .range(0, SUPABASE_PAGE_SIZE - 1)

  const categoryUrls: MetadataRoute.Sitemap = INDUSTRY_CATEGORIES.map((key) => ({
    url: `${root}/categories/${key}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))
  const productUrls: MetadataRoute.Sitemap = PRODUCT_SLUGS.map((slug) => ({
    url: `${root}/products/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))
  const serviceUrls: MetadataRoute.Sitemap = SERVICE_SLUGS.map((slug) => ({
    url: `${root}/services/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))
  const guideUrls: MetadataRoute.Sitemap = (guidePosts ?? []).map((p) => ({
    url: `${root}/guides/${p.slug}`,
    lastModified: p.published_at ?? undefined,
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  return [
    { url: root, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${root}/guides`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.7 },
    ...categoryUrls,
    ...productUrls,
    ...serviceUrls,
    ...guideUrls,
  ]
}

async function companySitemap(shardIndex: number): Promise<MetadataRoute.Sitemap> {
  const root = baseUrl()
  const offset = shardIndex * COMPANIES_PER_SITEMAP
  const companies = await fetchCompanySlice(offset, COMPANIES_PER_SITEMAP)
  return companies.map((c) => ({
    url: `${root}/companies/${c.slug}`,
    lastModified: c.updated_at ?? undefined,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))
}

export default async function sitemap({
  id,
}: {
  id: number
}): Promise<MetadataRoute.Sitemap> {
  if (id === 0) return staticSitemap()
  return companySitemap(id - 1)
}
