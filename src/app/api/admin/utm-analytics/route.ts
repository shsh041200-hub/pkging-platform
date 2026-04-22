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
    return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const now = new Date()
  const defaultFrom = new Date(now.getFullYear(), now.getMonth() - 2, 1)
  const defaultTo = now

  const from = toISODate(parseDate(searchParams.get('from'), defaultFrom))
  const to = toISODate(parseDate(searchParams.get('to'), defaultTo))

  const supabase = createServiceClient()

  // ── 1. Naver Blog page_view sessions ──
  const { data: pageViewsRaw } = await supabase
    .from('conversion_events')
    .select('session_id, utm_campaign, created_at')
    .eq('event_type', 'page_view')
    .eq('utm_source', 'naver_blog')
    .gte('created_at', `${from}T00:00:00Z`)
    .lte('created_at', `${to}T23:59:59Z`)

  const rows = pageViewsRaw ?? []

  // Distinct sessions total
  const distinctSessions = new Set(rows.map((r) => r.session_id))
  const totalSessions = distinctSessions.size

  // Monthly distinct sessions
  const sessionsByMonthMap: Record<string, Set<string>> = {}
  for (const row of rows) {
    const month = (row.created_at as string).slice(0, 7)
    if (!sessionsByMonthMap[month]) sessionsByMonthMap[month] = new Set()
    sessionsByMonthMap[month].add(row.session_id as string)
  }
  const monthlySessions = Object.entries(sessionsByMonthMap)
    .map(([month, sessions]) => ({ month, sessions: sessions.size }))
    .sort((a, b) => a.month.localeCompare(b.month))

  // Sessions by utm_campaign (post ranking)
  const campaignSessionMap: Record<string, Set<string>> = {}
  for (const row of rows) {
    const campaign = (row.utm_campaign as string | null) ?? '(없음)'
    if (!campaignSessionMap[campaign]) campaignSessionMap[campaign] = new Set()
    campaignSessionMap[campaign].add(row.session_id as string)
  }

  // ── 2. Naver Blog kakao_click conversions ──
  const { data: clicksRaw } = await supabase
    .from('conversion_events')
    .select('session_id, utm_campaign')
    .eq('event_type', 'kakao_click')
    .eq('utm_source', 'naver_blog')
    .gte('created_at', `${from}T00:00:00Z`)
    .lte('created_at', `${to}T23:59:59Z`)

  const clickRows = clicksRaw ?? []
  const totalKakaoClicks = clickRows.length

  // Clicks by campaign
  const campaignClickMap: Record<string, number> = {}
  for (const row of clickRows) {
    const campaign = (row.utm_campaign as string | null) ?? '(없음)'
    campaignClickMap[campaign] = (campaignClickMap[campaign] ?? 0) + 1
  }

  // Build post ranking (top 20)
  const postRanking = Object.entries(campaignSessionMap)
    .map(([campaign, sessions]) => ({
      campaign,
      sessions: sessions.size,
      clicks: campaignClickMap[campaign] ?? 0,
      conversionRate: sessions.size > 0 ? (campaignClickMap[campaign] ?? 0) / sessions.size : 0,
    }))
    .sort((a, b) => b.sessions - a.sessions)
    .slice(0, 20)

  const conversionRate = totalSessions > 0 ? totalKakaoClicks / totalSessions : 0

  return NextResponse.json({
    period: { from, to },
    totalSessions,
    totalKakaoClicks,
    conversionRate,
    monthlySessions,
    postRanking,
  })
}
