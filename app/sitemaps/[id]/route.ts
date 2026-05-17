import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { INDUSTRY_CATEGORIES } from '@/types'
import { PRODUCT_SLUGS } from '@/data/productGuide'
import { SERVICE_SLUGS } from '@/data/serviceGuide'
import { ALL_GUIDE_SLUGS } from '@/lib/guide-data'
import { listKeywordSlugs } from '@/lib/keyword-data'

// PACAA-116 sitemap shard.
// Emits raw UTF-8 URLs per the canonical ADR (2026-04-30) for vendor company
// pages. Only XML-special characters (& < > " ') are escaped.
// EXCEPTION — keyword pages (PACAA-731): slugs are percent-encoded with
// encodeURIComponent so GSC can match the sitemap <loc> to crawled URLs.
// Keyword pages are a separate feature created after the ADR; the vendor
// company URL pool remains raw UTF-8 as decided.
//
// Moved from app/sitemap/[id]/ to app/sitemaps/[id]/ to avoid Next.js
// internal metadata routing conflict with app/sitemap.ts (PACAA-360).
// A rewrite in next.config.js maps /sitemap/:id → /sitemaps/:id so the
// public URL /sitemap/0, /sitemap/1 etc. remains unchanged.
//
// PACAA-578: shard 0 is now the single content shard (static + guides +
// keywords + compare). Vendor company pages live in shards 1..N.
// /sitemap.xml is the <sitemapindex> root (app/sitemap.xml/route.ts).

export const revalidate = 3600
export const dynamicParams = true

// PACAA-228: declare empty static params so Next.js classifies unknown shard
// IDs as ISR-on-demand rather than fully-dynamic on every request.
export async function generateStaticParams() {
  return []
}

const COMPANIES_PER_SITEMAP = 50_000
const SUPABASE_PAGE_SIZE = 1_000

// Blog posts that live at /blog/<slug> (not guides).
const BLOG_POST_SLUGS = [
  { slug: 'packaging-rfq-guide', lastmod: '2026-05-08' },
  { slug: '2026-korea-packaging-trends', lastmod: '2026-05-07' },
]

function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.packlinx.com').replace(/\/$/, '')
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
  const now = new Date().toISOString()

  // DB guides: exclude slugs already covered by ALL_GUIDE_SLUGS to avoid duplicates.
  const staticGuideSet = new Set<string>(ALL_GUIDE_SLUGS)
  const { data: guidePosts } = await supabase()
    .from('blog_posts')
    .select('slug, published_at')
    .eq('status', 'published')
    .eq('content_type', 'guide')
    .order('published_at', { ascending: false })
    .range(0, SUPABASE_PAGE_SIZE - 1)

  const out: Entry[] = [
    // Core navigation
    { url: root, lastmod: now, changefreq: 'daily', priority: 1 },
    { url: `${root}/categories`, lastmod: now, changefreq: 'weekly', priority: 0.9 },
    { url: `${root}/guides`, lastmod: now, changefreq: 'daily', priority: 0.7 },
    { url: `${root}/keywords`, lastmod: now, changefreq: 'daily', priority: 0.8 },
    { url: `${root}/faq`, lastmod: now, changefreq: 'monthly', priority: 0.5 },
    { url: `${root}/match`, lastmod: now, changefreq: 'weekly', priority: 0.7 },
    { url: `${root}/terms`, lastmod: now, changefreq: 'yearly', priority: 0.3 },
  ]

  // Category pages
  for (const key of INDUSTRY_CATEGORIES) {
    out.push({ url: `${root}/categories/${key}`, lastmod: now, changefreq: 'weekly', priority: 0.8 })
  }

  // Product + service guide landing pages
  for (const slug of PRODUCT_SLUGS) {
    out.push({ url: `${root}/products/${slug}`, lastmod: now, changefreq: 'weekly', priority: 0.7 })
  }
  for (const slug of SERVICE_SLUGS) {
    out.push({ url: `${root}/services/${slug}`, lastmod: now, changefreq: 'weekly', priority: 0.7 })
  }

  // All guide slugs (static + dynamic) from the single source of truth
  for (const slug of ALL_GUIDE_SLUGS) {
    out.push({ url: `${root}/guides/${slug}`, lastmod: now, changefreq: 'monthly', priority: 0.7 })
  }

  // DB guides not already in ALL_GUIDE_SLUGS
  for (const p of guidePosts ?? []) {
    if (staticGuideSet.has(p.slug)) continue
    out.push({
      url: `${root}/guides/${p.slug}`,
      lastmod: p.published_at ?? now,
      changefreq: 'weekly',
      priority: 0.6,
    })
  }

  // Blog posts at /blog/<slug>
  for (const post of BLOG_POST_SLUGS) {
    out.push({ url: `${root}/blog/${post.slug}`, lastmod: post.lastmod, changefreq: 'monthly', priority: 0.8 })
  }

  // Keyword landing pages — PACAA-731: percent-encode slug so GSC URL inspection
  // can match the sitemap <loc> to the crawled URL (Korean chars → %xx form).
  const keywordSlugs = await listKeywordSlugs()
  for (const slug of keywordSlugs) {
    out.push({ url: `${root}/keywords/${encodeURIComponent(slug)}`, lastmod: now, changefreq: 'daily', priority: 0.8 })
  }

  // Use-case landing pages — PACAA-794
  const { data: useCaseTags } = await supabase()
    .from('use_case_tags')
    .select('seo_slug')
    .not('seo_slug', 'is', null)
  for (const tag of useCaseTags ?? []) {
    if (typeof tag.seo_slug === 'string') {
      out.push({ url: `${root}/use-cases/${encodeURIComponent(tag.seo_slug)}`, lastmod: now, changefreq: 'weekly', priority: 0.7 })
    }
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

// PACAA-348: compare pair sitemap entries.
// Cap policy (CEO-approved 2026-05-08, PACAA-666 fix: removed is_verified filter):
//   - Per category: top-5 by avg_rating DESC → 5×5 = 25 pairs (≤125 total for 5 categories).
//   - If a category has ≤5 vendors, list ALL pairs (no cap).
//   - Pairs are deduplicated across categories (slug-pair key, alphabetically sorted).
//   - Trigger: when total compare URLs reach 500+, open a new PACAA issue to upgrade
//     cap to top-10×10 and consider a separate compare shard.
const COMPARE_TOP_N = 5

async function compareEntries(): Promise<Entry[]> {
  const root = siteUrl()
  const { data, error } = await supabase()
    .from('companies')
    .select('slug, industry_categories, avg_rating')
    .eq('is_hidden', false)
    .not('industry_categories', 'is', null)

  if (error || !data) {
    console.error('[sitemap-shard] compareEntries failed', error)
    return []
  }

  // Group all non-hidden vendors by category
  const byCategory = new Map<string, { slug: string; avg_rating: number | null }[]>()
  for (const cat of INDUSTRY_CATEGORIES) {
    byCategory.set(cat, [])
  }
  for (const company of data) {
    const cats = (company.industry_categories ?? []) as string[]
    for (const cat of cats) {
      const arr = byCategory.get(cat)
      if (arr) arr.push({ slug: company.slug, avg_rating: company.avg_rating ?? null })
    }
  }

  const seen = new Set<string>()
  const out: Entry[] = []
  const now = new Date().toISOString()

  for (const vendors of byCategory.values()) {
    // If >5 vendors in category, take top-N by avg_rating DESC (nulls last)
    const topVendors =
      vendors.length > COMPARE_TOP_N
        ? [...vendors]
            .sort((a, b) => {
              if (a.avg_rating == null && b.avg_rating == null) return 0
              if (a.avg_rating == null) return 1
              if (b.avg_rating == null) return -1
              return b.avg_rating - a.avg_rating
            })
            .slice(0, COMPARE_TOP_N)
        : vendors

    for (let i = 0; i < topVendors.length; i++) {
      for (let j = i + 1; j < topVendors.length; j++) {
        const [a, b] = [topVendors[i].slug, topVendors[j].slug].sort()
        const key = `${a}|${b}`
        if (seen.has(key)) continue
        seen.add(key)
        out.push({
          url: `${root}/compare/${a}-vs-${b}`,
          lastmod: now,
          changefreq: 'weekly',
          priority: 0.7,
        })
      }
    }
  }

  return out
}

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await ctx.params
  const id = Number.parseInt(idStr, 10)
  if (!Number.isInteger(id) || id < 0) {
    return new Response('not found', { status: 404 })
  }

  let entries: Entry[]
  if (id === 0) {
    const [staticE, compareE] = await Promise.all([staticEntries(), compareEntries()])
    entries = [...staticE, ...compareE]
  } else {
    entries = await companyEntries(id - 1)
  }

  return new Response(renderUrlset(entries), {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
