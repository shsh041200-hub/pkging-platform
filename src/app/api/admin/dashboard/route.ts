import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

function parseDate(value: string | null, fallback: Date): Date {
  if (!value) return fallback
  const d = new Date(value)
  return isNaN(d.getTime()) ? fallback : d
}

function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10)
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

  // Period params
  const { searchParams } = new URL(request.url)
  const now = new Date()
  const defaultFrom = new Date(now.getFullYear(), now.getMonth() - 2, 1) // 3 months back
  const defaultTo = now

  const from = toISODate(parseDate(searchParams.get('from'), defaultFrom))
  const to = toISODate(parseDate(searchParams.get('to'), defaultTo))

  const supabase = createServiceClient()

  // ── 1. Monthly lead counts (quote_submit + kakao_click) ──
  const { data: monthlyLeadsRaw } = await supabase
    .from('conversion_events')
    .select('created_at, event_type')
    .in('event_type', ['quote_submit', 'kakao_click'])
    .gte('created_at', `${from}T00:00:00Z`)
    .lte('created_at', `${to}T23:59:59Z`)

  const monthlyLeads: Record<string, number> = {}
  for (const row of monthlyLeadsRaw ?? []) {
    const month = row.created_at.slice(0, 7) // YYYY-MM
    monthlyLeads[month] = (monthlyLeads[month] ?? 0) + 1
  }

  // ── 2. Leads by company ──
  const { data: leadsByCompanyRaw } = await supabase
    .from('conversion_events')
    .select('company_id')
    .in('event_type', ['quote_submit', 'kakao_click'])
    .gte('created_at', `${from}T00:00:00Z`)
    .lte('created_at', `${to}T23:59:59Z`)
    .not('company_id', 'is', null)

  const leadsByCompany: Record<string, number> = {}
  for (const row of leadsByCompanyRaw ?? []) {
    const id = row.company_id as string
    leadsByCompany[id] = (leadsByCompany[id] ?? 0) + 1
  }

  // Resolve company names (no PII — aggregate only)
  const companyIds = Object.keys(leadsByCompany)
  let companyNames: Record<string, string> = {}
  if (companyIds.length > 0) {
    const { data: companies } = await supabase
      .from('companies')
      .select('id, name, category')
      .in('id', companyIds)
    for (const c of companies ?? []) {
      companyNames[c.id] = c.name
    }
  }

  const leadsByCompanyList = Object.entries(leadsByCompany)
    .map(([id, count]) => ({ companyId: id, name: companyNames[id] ?? id, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20)

  // ── 3. Leads by category ──
  const { data: leadsByCategoryRaw } = await supabase
    .from('conversion_events')
    .select('company_id')
    .in('event_type', ['quote_submit', 'kakao_click'])
    .gte('created_at', `${from}T00:00:00Z`)
    .lte('created_at', `${to}T23:59:59Z`)
    .not('company_id', 'is', null)

  // Join category from company data we already fetched
  const categoryLeads: Record<string, number> = {}
  const companyCategory: Record<string, string> = {}
  for (const c of (await supabase.from('companies').select('id, category').in('id', companyIds)).data ?? []) {
    companyCategory[c.id] = c.category as string
  }
  for (const row of leadsByCategoryRaw ?? []) {
    const cat = companyCategory[row.company_id as string] ?? 'unknown'
    categoryLeads[cat] = (categoryLeads[cat] ?? 0) + 1
  }

  // ── 4. Quote request response rate + average response time ──
  const { data: quoteStats } = await supabase
    .from('quote_requests')
    .select('response_status, response_time_minutes')
    .gte('created_at', `${from}T00:00:00Z`)
    .lte('created_at', `${to}T23:59:59Z`)

  const totalQuotes = quoteStats?.length ?? 0
  const respondedQuotes = quoteStats?.filter(q => q.response_status === 'responded') ?? []
  const responseRate = totalQuotes > 0 ? respondedQuotes.length / totalQuotes : null

  const responseTimes = respondedQuotes
    .map(q => q.response_time_minutes)
    .filter((v): v is number => typeof v === 'number')
  const avgResponseMinutes =
    responseTimes.length > 0
      ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
      : null

  // ── 5. Conversion funnel (view → modal_open → submit) ──
  const { data: funnelRaw } = await supabase
    .from('conversion_events')
    .select('event_type')
    .in('event_type', ['company_view', 'quote_modal_open', 'quote_submit'])
    .gte('created_at', `${from}T00:00:00Z`)
    .lte('created_at', `${to}T23:59:59Z`)

  const funnelCounts: Record<string, number> = {
    company_view: 0,
    quote_modal_open: 0,
    quote_submit: 0,
  }
  for (const row of funnelRaw ?? []) {
    funnelCounts[row.event_type] = (funnelCounts[row.event_type] ?? 0) + 1
  }

  return NextResponse.json({
    period: { from, to },
    monthlyLeads,
    leadsByCompany: leadsByCompanyList,
    leadsByCategory: categoryLeads,
    quoteRequests: {
      total: totalQuotes,
      responded: respondedQuotes.length,
      responseRate,
      avgResponseMinutes,
    },
    conversionFunnel: funnelCounts,
  })
}
