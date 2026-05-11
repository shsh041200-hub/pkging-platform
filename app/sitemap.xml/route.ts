import { createClient } from '@supabase/supabase-js'

// PACAA-578: /sitemap.xml is the sitemap-index root.
// It lists /sitemap/0 (content shard) and /sitemap/1..N (company shards).
// Individual shards are served by app/sitemaps/[id]/route.ts via the
// /sitemap/:id → /sitemaps/:id rewrite in next.config.ts (PACAA-360).

export const revalidate = 3600

const COMPANIES_PER_SITEMAP = 50_000

function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.packlinx.com').replace(/\/$/, '')
}

function supabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } },
  )
}

export async function GET() {
  const root = siteUrl()

  const { count } = await supabase()
    .from('companies')
    .select('*', { count: 'exact', head: true })

  const companyCount = count ?? 0
  // Always include at least 1 company shard even when count=0 so the index
  // is stable while the DB is empty during bootstrapping.
  const companyShards = Math.max(1, Math.ceil(companyCount / COMPANIES_PER_SITEMAP))

  // Shard 0 = all static + content + keyword pages
  // Shard 1..N = company pages
  const shardIds = [0, ...Array.from({ length: companyShards }, (_, i) => i + 1)]

  const now = new Date().toISOString()
  const entries = shardIds
    .map(
      (id) =>
        `  <sitemap>\n    <loc>${root}/sitemap/${id}</loc>\n    <lastmod>${now}</lastmod>\n  </sitemap>`,
    )
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</sitemapindex>
`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
