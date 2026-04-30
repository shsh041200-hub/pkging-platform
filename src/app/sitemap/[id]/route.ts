import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { INDUSTRY_CATEGORIES } from '@/types'
import { PRODUCT_SLUGS } from '@/data/productGuide'
import { SERVICE_SLUGS } from '@/data/serviceGuide'

// PACAA-116 sitemap shard.
// Emits raw UTF-8 URLs (no percent-encoding) per the canonical ADR. Only
// XML-special characters (& < > " ') are escaped. Korean characters in path
// segments are passed through as raw UTF-8 bytes.

export const dynamic = 'force-dynamic'
export const revalidate = 3600

const COMPANIES_PER_SITEMAP = 50_000
const SUPABASE_PAGE_SIZE = 1_000

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

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

type Entry = { url: string; lastmod?: string; changefreq?: string; priority?: number }

function renderUrlset(entries: Entry[]): string {
  const body = entries
    .map((e) => {
      const parts = [`    <loc>${escapeXml(e.url)}</loc>`]
      if (e.lastmod) parts.push(`    <lastmod>${e.lastmod}</lastmod>`)
      if (e.changefreq) parts.push(`    <changefreq>${e.changefreq}</changefreq>`)
      if (e.priority !== undefined) parts.push(`    <priority>${e.priority}</priority>`)
      return `  <url>\n${parts.join('\n')}\n  </url>`
    })
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`
}

async function staticEntries(): Promise<Entry[]> {
  const root = siteUrl()
  const { data: guidePosts } = await supabase()
    .from('blog_posts')
    .select('slug, published_at')
    .eq('status', 'published')
    .eq('content_type', 'guide')
    .order('published_at', { ascending: false })
    .range(0, SUPABASE_PAGE_SIZE - 1)

  const now = new Date().toISOString()
  const out: Entry[] = [
    { url: root, lastmod: now, changefreq: 'daily', priority: 1 },
    { url: `${root}/guides`, lastmod: now, changefreq: 'daily', priority: 0.7 },
  ]
  for (const key of INDUSTRY_CATEGORIES) {
    out.push({ url: `${root}/categories/${key}`, lastmod: now, changefreq: 'weekly', priority: 0.8 })
  }
  for (const slug of PRODUCT_SLUGS) {
    out.push({ url: `${root}/products/${slug}`, lastmod: now, changefreq: 'weekly', priority: 0.7 })
  }
  for (const slug of SERVICE_SLUGS) {
    out.push({ url: `${root}/services/${slug}`, lastmod: now, changefreq: 'weekly', priority: 0.7 })
  }
  for (const p of guidePosts ?? []) {
    out.push({
      url: `${root}/guides/${p.slug}`,
      lastmod: p.published_at ?? now,
      changefreq: 'weekly',
      priority: 0.6,
    })
  }
  return out
}

async function companyEntries(shardIndex: number): Promise<Entry[]> {
  const root = siteUrl()
  const offset = shardIndex * COMPANIES_PER_SITEMAP
  const limit = COMPANIES_PER_SITEMAP
  const out: Entry[] = []
  let cursor = offset
  const end = offset + limit
  while (cursor < end) {
    const pageEnd = Math.min(cursor + SUPABASE_PAGE_SIZE, end) - 1
    const { data, error } = await supabase()
      .from('companies')
      .select('slug, updated_at')
      .order('updated_at', { ascending: false })
      .range(cursor, pageEnd)
    if (error) {
      console.error('[sitemap-shard] page failed', { cursor, pageEnd, error })
      break
    }
    if (!data || data.length === 0) break
    for (const c of data) {
      out.push({
        url: `${root}/companies/${c.slug}`,
        lastmod: c.updated_at ?? undefined,
        changefreq: 'weekly',
        priority: 0.7,
      })
    }
    if (data.length < pageEnd - cursor + 1) break
    cursor += data.length
  }
  return out
}

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await ctx.params
  const id = Number.parseInt(idStr, 10)
  if (!Number.isInteger(id) || id < 0) {
    return new Response('not found', { status: 404 })
  }
  const entries = id === 0 ? await staticEntries() : await companyEntries(id - 1)
  return new Response(renderUrlset(entries), {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
