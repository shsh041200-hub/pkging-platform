import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'
import { INDUSTRY_CATEGORIES } from '@/types'
import { PRODUCT_SLUGS } from '@/data/productGuide'
import { SERVICE_SLUGS } from '@/data/serviceGuide'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://packlinx.com'

  const supabase = await createClient()

  const { data: companies } = await supabase
    .from('companies')
    .select('slug, updated_at')
    .order('updated_at', { ascending: false })
    .range(0, 49999)

  const { data: guidePosts } = await supabase
    .from('blog_posts')
    .select('slug, published_at')
    .eq('status', 'published')
    .eq('content_type', 'guide')
    .order('published_at', { ascending: false })

  const companyUrls: MetadataRoute.Sitemap = (companies ?? []).map((c) => ({
    url: `${baseUrl}/companies/${c.slug}`,
    lastModified: c.updated_at,
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  const categoryUrls: MetadataRoute.Sitemap = INDUSTRY_CATEGORIES.map((key) => ({
    url: `${baseUrl}/categories/${key}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  const productUrls: MetadataRoute.Sitemap = PRODUCT_SLUGS.map((slug) => ({
    url: `${baseUrl}/products/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  const serviceUrls: MetadataRoute.Sitemap = SERVICE_SLUGS.map((slug) => ({
    url: `${baseUrl}/services/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  const guideUrls: MetadataRoute.Sitemap = (guidePosts ?? []).map((p) => ({
    url: `${baseUrl}/guides/${p.slug}`,
    lastModified: p.published_at,
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/guides`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.7 },
    ...categoryUrls,
    ...productUrls,
    ...serviceUrls,
    ...companyUrls,
    ...guideUrls,
  ]
}
