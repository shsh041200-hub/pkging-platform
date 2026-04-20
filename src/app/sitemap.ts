import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://packlinx.com'

  const supabase = await createClient()
  const { data: companies } = await supabase
    .from('companies')
    .select('slug, updated_at')
    .order('updated_at', { ascending: false })

  const companyUrls: MetadataRoute.Sitemap = (companies ?? []).map((c) => ({
    url: `${baseUrl}/companies/${c.slug}`,
    lastModified: c.updated_at,
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    ...companyUrls,
  ]
}
