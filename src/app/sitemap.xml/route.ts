import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// PACAA-116 / PACAA-117 sitemap index.
// Custom route handler instead of `app/sitemap.ts` because Next.js's
// MetadataRoute.Sitemap pipes every URL through `new URL()`, which
// percent-encodes Korean path segments — directly violating the canonical
// policy ADR (canonical = raw UTF-8).
//
// We emit the index here and shard children under /sitemap-N.xml. Each child
// holds up to COMPANIES_PER_SITEMAP company URLs (well below the Google 50k
// per-sitemap limit) plus index 0 for static URLs.

export const dynamic = 'force-dynamic'
export const revalidate = 3600

const COMPANIES_PER_SITEMAP = 50_000

function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://packlinx.com').replace(/\/$/, '')
}

function supabase() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } },
  )
}

async function getCompanyCount(): Promise<number> {
  const { count, error } = await supabase()
    .from('companies')
    .select('id', { count: 'exact', head: true })
  if (error || count === null) {
    console.error('[sitemap-index] count failed', error)
    return 0
  }
  return count
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export async function GET() {
  const root = siteUrl()
  const total = await getCompanyCount()
  const shards = Math.max(1, Math.ceil(total / COMPANIES_PER_SITEMAP))
  const now = new Date().toISOString()

  // index 0 = static; index 1..shards = company chunks.
  const ids = [0, ...Array.from({ length: shards }, (_, i) => i + 1)]
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${ids
  .map(
    (id) =>
      `  <sitemap><loc>${escapeXml(`${root}/sitemap/${id}`)}</loc><lastmod>${now}</lastmod></sitemap>`,
  )
  .join('\n')}
</sitemapindex>
`
  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
