import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { BoxterLogo } from '@/components/BoxterLogo'
import { DashboardClient } from './DashboardClient'

export const metadata: Metadata = {
  title: '관리자 대시보드 — BOXTER',
  robots: { index: false, follow: false },
}

type SearchParams = Promise<{ month?: string }>

export default async function AdminDashboardPage({ searchParams }: { searchParams: SearchParams }) {
  const { month } = await searchParams
  const supabase = await createClient()

  // Auth check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/')

  // Determine date range (current month or selected month)
  const now = new Date()
  const selectedMonth = month ?? `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const [year, mon] = selectedMonth.split('-').map(Number)
  const startDate = new Date(year, mon - 1, 1).toISOString()
  const endDate = new Date(year, mon, 0, 23, 59, 59).toISOString()

  // Fetch dashboard data from backend API if available, otherwise build from DB
  let dashboardData: {
    monthly_leads: number
    response_rate: number | null
    avg_response_time_hours: number | null
    daily_leads: Array<{ date: string; count: number }>
    category_distribution: Array<{ category: string; count: number }>
    top_companies: Array<{ name: string; slug: string; lead_count: number; response_rate: number | null }>
  }

  try {
    const apiRes = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/api/admin/dashboard?month=${selectedMonth}`,
      { headers: { 'x-internal': '1' }, cache: 'no-store' },
    )
    if (apiRes.ok) {
      dashboardData = await apiRes.json()
    } else {
      throw new Error('API not ready')
    }
  } catch {
    // Fallback: build from DB directly until Backend API is live
    const { count: monthlyLeads } = await supabase
      .from('quote_requests')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startDate)
      .lte('created_at', endDate)

    const { data: topRaw } = await supabase
      .from('quote_requests')
      .select('company_id, companies(name, slug)')
      .gte('created_at', startDate)
      .lte('created_at', endDate)

    // Aggregate top companies
    const countMap: Record<string, { name: string; slug: string; count: number }> = {}
    for (const row of topRaw ?? []) {
      const co = row.companies as unknown as { name: string; slug: string } | null
      if (!co || !row.company_id) continue
      if (!countMap[row.company_id]) countMap[row.company_id] = { name: co.name, slug: co.slug, count: 0 }
      countMap[row.company_id].count++
    }
    const top_companies = Object.values(countMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
      .map((c) => ({ name: c.name, slug: c.slug, lead_count: c.count, response_rate: null }))

    // Daily leads (simplified — group by day)
    const { data: dailyRaw } = await supabase
      .from('quote_requests')
      .select('created_at')
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .order('created_at')

    const dailyMap: Record<string, number> = {}
    for (const row of dailyRaw ?? []) {
      const day = row.created_at.slice(0, 10)
      dailyMap[day] = (dailyMap[day] ?? 0) + 1
    }
    const daily_leads = Object.entries(dailyMap).map(([date, count]) => ({ date, count }))

    dashboardData = {
      monthly_leads: monthlyLeads ?? 0,
      response_rate: null,
      avg_response_time_hours: null,
      daily_leads,
      category_distribution: [],
      top_companies,
    }
  }

  // Month picker: generate last 12 months
  const monthOptions: string[] = []
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    monthOptions.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Header */}
      <header className="bg-[#0A0F1E] sticky top-0 z-50 border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <BoxterLogo variant="dark" size="sm" />
          </Link>
          <span className="text-white/50 text-[12px] font-medium">관리자 대시보드</span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-5 sm:px-8 py-8">
        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-[24px] font-bold text-gray-900 tracking-[-0.025em]">리드 분석 대시보드</h1>
            <p className="text-[14px] text-gray-500 mt-1">{selectedMonth} 기준</p>
          </div>

          {/* Month picker */}
          <form method="GET" action="/admin/dashboard">
            <select
              name="month"
              defaultValue={selectedMonth}
              onChange={(e) => {
                // Progressive enhancement — form submit on change
                e.currentTarget.form?.submit()
              }}
              className="h-10 px-3 text-[13px] border border-gray-200 rounded-lg focus:outline-none focus:border-[#005EFF] focus:ring-1 focus:ring-[#005EFF]/20 transition-colors bg-white"
            >
              {monthOptions.map((m) => {
                const [y, mo] = m.split('-')
                return (
                  <option key={m} value={m}>
                    {y}년 {Number(mo)}월
                  </option>
                )
              })}
            </select>
          </form>
        </div>

        <DashboardClient data={dashboardData} />
      </main>
    </div>
  )
}
