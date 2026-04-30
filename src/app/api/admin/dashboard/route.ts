import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function lastDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate()
}

export async function GET(request: NextRequest) {
  // Auth: require admin role
  const authClient = await createClient()
  const {
    data: { user },
  } = await authClient.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
  }

  const { data: profile } = await authClient
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const now = new Date()

  // Support ?month=YYYY-MM (page's format) and fall back to ?from/?to
  let from: string
  let to: string

  const monthParam = searchParams.get('month')
  if (monthParam && /^\d{4}-\d{2}$/.test(monthParam)) {
    const [yearStr, moStr] = monthParam.split('-')
    const year = parseInt(yearStr, 10)
    const month = parseInt(moStr, 10)
    from = `${monthParam}-01`
    to = `${monthParam}-${String(lastDayOfMonth(year, month)).padStart(2, '0')}`
  } else {
    const defaultFrom = new Date(now.getFullYear(), now.getMonth(), 1)
    const defaultTo = now
    from = searchParams.get('from') ?? toISODate(defaultFrom)
    to = searchParams.get('to') ?? toISODate(defaultTo)
  }

  const supabase = createServiceClient()

  // ── 1. Fetch all kakao_click events in range ──
  const { data: eventsRaw } = await supabase
    .from('conversion_events')
    .select('created_at, company_id')
    .in('event_type', ['kakao_click'])
    .gte('created_at', `${from}T00:00:00Z`)
    .lte('created_at', `${to}T23:59:59Z`)

  const events = eventsRaw ?? []

  // ── 2. monthly_leads: total count for selected period ──
  const monthly_leads = events.length

  // ── 3. daily_leads: day-by-day counts ──
  const dailyMap: Record<string, number> = {}
  for (const row of events) {
    const day = (row.created_at as string).slice(0, 10) // YYYY-MM-DD
    dailyMap[day] = (dailyMap[day] ?? 0) + 1
  }
  const daily_leads = Object.entries(dailyMap)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date))

  // ── 4. Leads by company (for category + top companies) ──
  const companyLeadCount: Record<string, number> = {}
  for (const row of events) {
    if (!row.company_id) continue
    const id = row.company_id as string
    companyLeadCount[id] = (companyLeadCount[id] ?? 0) + 1
  }

  const companyIds = Object.keys(companyLeadCount)

  let companyMeta: Record<string, { name: string; slug: string; category: string }> = {}
  if (companyIds.length > 0) {
    const { data: companies } = await supabase
      .from('companies')
      .select('id, name, slug, category')
      .in('id', companyIds)
    for (const c of companies ?? []) {
      companyMeta[c.id] = {
        name: c.name as string,
        slug: c.slug as string,
        category: c.category as string,
      }
    }
  }

  // ── 5. category_distribution: array sorted by count desc ──
  const categoryMap: Record<string, number> = {}
  for (const [companyId, count] of Object.entries(companyLeadCount)) {
    const cat = companyMeta[companyId]?.category ?? 'unknown'
    categoryMap[cat] = (categoryMap[cat] ?? 0) + count
  }
  const category_distribution = Object.entries(categoryMap)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count)

  // ── 6. top_companies: top 20 with name, slug, lead_count ──
  const top_companies = Object.entries(companyLeadCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 20)
    .map(([id, count]) => ({
      name: companyMeta[id]?.name ?? id,
      slug: companyMeta[id]?.slug ?? id,
      lead_count: count,
    }))

  return NextResponse.json({
    monthly_leads,
    daily_leads,
    category_distribution,
    top_companies,
  })
}
