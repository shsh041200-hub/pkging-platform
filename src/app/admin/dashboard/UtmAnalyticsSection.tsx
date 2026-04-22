'use client'

import {
  LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'

interface MonthlySession {
  month: string
  sessions: number
}

interface PostRank {
  campaign: string
  sessions: number
  clicks: number
  conversionRate: number
}

export interface UtmAnalyticsData {
  period: { from: string; to: string }
  totalSessions: number
  totalKakaoClicks: number
  conversionRate: number
  monthlySessions: MonthlySession[]
  postRanking: PostRank[]
}

export function UtmAnalyticsSection({ data }: { data: UtmAnalyticsData }) {
  const {
    totalSessions,
    totalKakaoClicks,
    conversionRate,
    monthlySessions,
    postRanking,
  } = data

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <h2 className="text-[18px] font-bold text-gray-900 tracking-[-0.025em]">네이버 블로그 UTM 분석</h2>
        <span className="px-2 py-0.5 text-[11px] font-semibold text-green-700 bg-green-50 border border-green-100 rounded-full">
          naver_blog
        </span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">유입 세션 수</p>
          <p className="text-[32px] font-extrabold text-gray-900 tracking-[-0.03em]">
            {totalSessions.toLocaleString()}
          </p>
          <p className="text-[12px] text-gray-400 mt-1">page_view distinct session</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">카카오 문의 수</p>
          <p className="text-[32px] font-extrabold text-gray-900 tracking-[-0.03em]">
            {totalKakaoClicks.toLocaleString()}
          </p>
          <p className="text-[12px] text-gray-400 mt-1">kakao_click 이벤트</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">세션 전환율</p>
          <p className="text-[32px] font-extrabold text-[#005EFF] tracking-[-0.03em]">
            {(conversionRate * 100).toFixed(1)}%
          </p>
          <p className="text-[12px] text-gray-400 mt-1">카카오 문의 / 유입 세션</p>
        </div>
      </div>

      {/* Monthly sessions chart */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h3 className="text-[13px] font-semibold text-gray-700 uppercase tracking-wider mb-5">월별 유입 세션 추이</h3>
        {monthlySessions.length === 0 ? (
          <p className="text-[13px] text-gray-400 py-8 text-center">데이터가 없습니다.</p>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={monthlySessions} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 10, fill: '#9ca3af' }}
                tickFormatter={(v: string) => {
                  const [y, m] = v.split('-')
                  return `${y.slice(2)}년 ${Number(m)}월`
                }}
              />
              <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
                labelStyle={{ color: '#374151', fontWeight: 600 }}
                formatter={(v) => [`${Number(v).toLocaleString()}세션`, '유입 세션']}
                labelFormatter={(label) => {
                  const str = String(label)
                  const [y, m] = str.split('-')
                  return `${y}년 ${Number(m)}월`
                }}
              />
              <Line
                type="monotone"
                dataKey="sessions"
                name="유입 세션"
                stroke="#005EFF"
                strokeWidth={2}
                dot={{ r: 3, fill: '#005EFF' }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Post ranking table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-[13px] font-semibold text-gray-700 uppercase tracking-wider">포스트별 유입 순위</h3>
          <p className="text-[12px] text-gray-400 mt-0.5">utm_campaign 기준</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">포스트 (캠페인)</th>
                <th className="text-right px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">유입 세션</th>
                <th className="text-right px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">문의</th>
                <th className="text-right px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">전환율</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {postRanking.map((post, i) => (
                <tr key={post.campaign} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <span className="w-5 h-5 rounded-full bg-gray-100 text-[11px] font-bold text-gray-500 flex items-center justify-center flex-shrink-0">
                        {i + 1}
                      </span>
                      <span className="font-medium text-gray-900 truncate max-w-[200px]" title={post.campaign}>
                        {post.campaign}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-right font-semibold text-gray-900">
                    {post.sessions.toLocaleString()}
                  </td>
                  <td className="px-4 py-3.5 text-right text-gray-700">
                    {post.clicks.toLocaleString()}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <span
                      className={`font-semibold ${
                        post.conversionRate >= 0.1
                          ? 'text-green-600'
                          : post.conversionRate >= 0.05
                          ? 'text-blue-600'
                          : 'text-gray-500'
                      }`}
                    >
                      {(post.conversionRate * 100).toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
              {postRanking.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-10 text-center text-gray-400 text-[13px]">
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
