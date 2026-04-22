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

  const now = new Date()
  const selectedMonth = month ?? `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  // Fetch dashboard data from backend API if available, otherwise build from DB
  let dashboardData: {
    monthly_leads: number
    daily_leads: Array<{ date: string; count: number }>
    category_distribution: Array<{ category: string; count: number }>
    top_companies: Array<{ name: string; slug: string; lead_count: number }>
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
    dashboardData = {
      monthly_leads: 0,
      daily_leads: [],
      category_distribution: [],
      top_companies: [],
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
