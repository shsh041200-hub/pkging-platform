'use client'

import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'

interface DailyLead {
  date: string
  count: number
}

interface CategoryLead {
  category: string
  count: number
}

interface CompanyRank {
  name: string
  slug: string
  lead_count: number
  response_rate: number | null
}

interface DashboardData {
  monthly_leads: number
  response_rate: number | null
  avg_response_time_hours: number | null
  daily_leads: DailyLead[]
  category_distribution: CategoryLead[]
  top_companies: CompanyRank[]
}

export function DashboardClient({ data }: { data: DashboardData }) {
  const {
    monthly_leads,
    response_rate,
    avg_response_time_hours,
    daily_leads,
    category_distribution,
    top_companies,
  } = data

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">월별 리드 수</p>
          <p className="text-[32px] font-extrabold text-gray-900 tracking-[-0.03em]">{monthly_leads.toLocaleString()}</p>
          <p className="text-[12px] text-gray-400 mt-1">이번 달 견적 요청</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">응답률</p>
          <p className="text-[32px] font-extrabold text-gray-900 tracking-[-0.03em]">
            {response_rate != null ? `${Math.round(response_rate)}%` : '—'}
          </p>
          <p className="text-[12px] text-gray-400 mt-1">견적 요청 응답 비율</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">평균 응답시간</p>
          <p className="text-[32px] font-extrabold text-gray-900 tracking-[-0.03em]">
            {avg_response_time_hours != null ? `${Math.round(avg_response_time_hours)}h` : '—'}
          </p>
          <p className="text-[12px] text-gray-400 mt-1">업체 평균 응답 시간</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Daily leads line chart */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="text-[13px] font-semibold text-gray-700 uppercase tracking-wider mb-5">일별 리드 추이</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={daily_leads} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: '#9ca3af' }}
                tickFormatter={(v: string) => v.slice(5)}
              />
              <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
                labelStyle={{ color: '#374151', fontWeight: 600 }}
              />
              <Line
                type="monotone"
                dataKey="count"
                name="리드"
                stroke="#005EFF"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Category distribution bar chart */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="text-[13px] font-semibold text-gray-700 uppercase tracking-wider mb-5">카테고리 분포</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={category_distribution} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="category" tick={{ fontSize: 10, fill: '#9ca3af' }} />
              <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
                labelStyle={{ color: '#374151', fontWeight: 600 }}
              />
              <Bar dataKey="count" name="리드 수" fill="#005EFF" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top companies table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-[13px] font-semibold text-gray-700 uppercase tracking-wider">업체별 리드 랭킹</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">업체명</th>
                <th className="text-right px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">리드 수</th>
                <th className="text-right px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">응답률</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {top_companies.map((co, i) => (
                <tr key={co.slug} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <span className="w-5 h-5 rounded-full bg-gray-100 text-[11px] font-bold text-gray-500 flex items-center justify-center flex-shrink-0">
                        {i + 1}
                      </span>
                      <a
                        href={`/companies/${co.slug}`}
                        className="font-medium text-gray-900 hover:text-[#005EFF] transition-colors"
                      >
                        {co.name}
                      </a>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-right font-semibold text-gray-900">{co.lead_count.toLocaleString()}</td>
                  <td className="px-5 py-3.5 text-right text-gray-500">
                    {co.response_rate != null ? `${Math.round(co.response_rate)}%` : '—'}
                  </td>
                </tr>
              ))}
              {top_companies.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-5 py-10 text-center text-gray-400 text-[13px]">
                    데이터가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
