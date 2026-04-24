import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'
import { INDUSTRY_CATEGORIES } from '@/types'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://packlinx.com'

  const supabase = await createClient()

  const { data: companies } = await supabase
    .from('companies')
    .select('slug, updated_at')
    .order('updated_at', { ascending: false })

  const { data: blogPosts } = await supabase
    .from('blog_posts')
    .select('slug, published_at, content_type')
    .eq('status', 'published')
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

  const blogPostUrls: MetadataRoute.Sitemap = (blogPosts ?? []).map((p) => {
    const basePath = p.content_type === 'guide' ? 'guides' : 'blog'
    return {
      url: `${baseUrl}/${basePath}/${p.slug}`,
      lastModified: p.published_at,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }
  })

  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.7 },
    { url: `${baseUrl}/guides`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.7 },
    ...categoryUrls,
    ...companyUrls,
    ...blogPostUrls,
  ]
}
