#!/usr/bin/env node
// PACAA-117 sitemap ↔ DB parity check.
// Compares the count of /companies/* URLs in the live sitemap-index against
// the number of vendor rows in Supabase. Exits non-zero on mismatch.
//
// Usage:
//   SUPABASE_URL=...  SUPABASE_SERVICE_ROLE_KEY=... \
//   SITE_URL=https://packlinx.com \
//   node scripts/sitemap-parity.mjs
//
// Wire into cron after each deploy. Alert on non-zero exit.

import { createClient } from '@supabase/supabase-js'

const SITE = (process.env.SITE_URL ?? 'https://packlinx.com').replace(/\/$/, '')
const SUPABASE_URL = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
// Use anon key by default — matches the RLS-filtered view the sitemap route sees.
// Pass SUPABASE_SERVICE_ROLE_KEY only if you intentionally want the total (RLS-bypassed) count.
const SUPABASE_KEY =
  process.env.SUPABASE_ANON_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('SUPABASE_URL and SUPABASE_ANON_KEY (or SERVICE_ROLE_KEY) required')
  process.exit(2)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

async function dbVendorCount() {
  const { count, error } = await supabase
    .from('companies')
    .select('id', { count: 'exact', head: true })
  if (error) throw error
  return count ?? 0
}

async function fetchText(url) {
  const r = await fetch(url, { headers: { 'user-agent': 'pacaa-117-parity' } })
  if (!r.ok) throw new Error(`${r.status} ${r.statusText} for ${url}`)
  return r.text()
}

function extractAll(xml, tag) {
  const re = new RegExp(`<${tag}>([^<]+)</${tag}>`, 'g')
  const out = []
  let m
  while ((m = re.exec(xml)) !== null) out.push(m[1].trim())
  return out
}

async function sitemapCompanyUrls() {
  const indexXml = await fetchText(`${SITE}/sitemap.xml`)
  const childUrls = extractAll(indexXml, 'loc')
  const children = childUrls.length > 0 ? childUrls : [`${SITE}/sitemap.xml`]
  const seen = new Set()
  for (const child of children) {
    const xml = await fetchText(child)
    const locs = extractAll(xml, 'loc')
    for (const loc of locs) {
      // Match /companies/ path regardless of www vs non-www host variant.
      if (/\/companies\//.test(loc)) {
        seen.add(loc)
      }
    }
  }
  return seen.size
}

async function main() {
  const [db, sm] = await Promise.all([dbVendorCount(), sitemapCompanyUrls()])
  const ok = db === sm
  console.log(JSON.stringify({ db, sitemap: sm, ok, drift: sm - db }, null, 2))
  if (!ok) {
    console.error(`PARITY FAIL: DB=${db} sitemap=${sm} drift=${sm - db}`)
    process.exit(1)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(2)
})
