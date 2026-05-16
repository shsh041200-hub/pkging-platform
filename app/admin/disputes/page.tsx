import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase/service'

export const metadata: Metadata = {
  title: '이의제기 큐 — Packlinx Admin',
  robots: { index: false, follow: false },
}

// Internal admin page — protected by ADMIN_SECRET env var.
// This page is SSR (no static export) to always show fresh queue data.
export const dynamic = 'force-dynamic'

type SearchParams = {
  status?: string
  page?: string
}

type Props = {
  searchParams: Promise<SearchParams>
}

const STATUS_LABELS: Record<string, string> = {
  '접수': '접수',
  '검토중': '검토중',
  '정정완료': '정정완료',
  '유지': '유지',
}

const REASON_LABELS: Record<string, string> = {
  classification_error: '분류 오류',
  info_inaccurate: '정보 부정확',
  delete_request: '삭제 요청',
  other: '기타',
}

function slaStatus(submittedAt: string, status: string): { label: string; color: string } {
  if (status === '정정완료' || status === '유지') {
    return { label: '처리완료', color: 'text-slate-400' }
  }
  const submitted = new Date(submittedAt)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - submitted.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays >= 30) return { label: `D+${diffDays} ⚠️ SLA 초과`, color: 'text-red-600 font-semibold' }
  if (diffDays >= 14) return { label: `D+${diffDays} ⚠️ 1차회신 초과`, color: 'text-orange-600 font-semibold' }
  if (diffDays >= 10) return { label: `D+${diffDays} 회신 임박`, color: 'text-amber-600 font-medium' }
  return { label: `D+${diffDays}`, color: 'text-slate-500' }
}

export default async function AdminDisputesPage({ searchParams }: Props) {
  const adminSecret = process.env.ADMIN_SECRET
  if (!adminSecret) notFound()

  const params = await searchParams
  const statusFilter = params.status ?? 'all'
  const page = parseInt(params.page ?? '1', 10)
  const limit = 20
  const offset = (page - 1) * limit

  const supabase = createServiceClient()
  let query = supabase
    .from('vendor_classification_disputes')
    .select('*', { count: 'exact' })
    .order('submitted_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (statusFilter !== 'all') {
    query = query.eq('status', statusFilter)
  }

  const { data: disputes, count, error } = await query

  if (error) {
    console.error('[admin/disputes] fetch error:', error)
  }

  const total = count ?? 0
  const totalPages = Math.ceil(total / limit)

  // SLA counts for dashboard
  const { data: allOpen } = await supabase
    .from('vendor_classification_disputes')
    .select('submitted_at, status')
    .in('status', ['접수', '검토중'])

  const now = new Date()
  const overdueCount = (allOpen ?? []).filter(d => {
    const days = Math.floor((now.getTime() - new Date(d.submitted_at).getTime()) / (1000 * 60 * 60 * 24))
    return days >= 14
  }).length

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-sm font-bold text-[#533afd]">Packlinx</Link>
            <span className="text-slate-300">/</span>
            <span className="text-sm font-semibold text-slate-700">이의제기 관리</span>
          </div>
          <span className="text-xs bg-amber-100 text-amber-700 font-semibold px-2 py-1 rounded">
            ADMIN INTERNAL
          </span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">

        {/* SLA 대시보드 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: '전체', value: total.toString(), color: 'text-slate-700' },
            { label: '미처리 (접수+검토중)', value: (allOpen?.length ?? 0).toString(), color: 'text-[#533afd]' },
            { label: 'SLA 초과 / 임박', value: overdueCount.toString(), color: overdueCount > 0 ? 'text-red-600' : 'text-slate-400' },
            { label: 'SLA 기준', value: '14일/30일', color: 'text-slate-500' },
          ].map(stat => (
            <div key={stat.label} className="bg-white border border-slate-200 rounded-xl px-4 py-3">
              <p className="text-xs text-slate-400 mb-1">{stat.label}</p>
              <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* 필터 탭 */}
        <div className="flex gap-1.5 mb-5 bg-white border border-slate-200 rounded-xl p-1.5 w-fit">
          {['all', ...Object.keys(STATUS_LABELS)].map(s => (
            <Link
              key={s}
              href={`/admin/disputes?status=${s}`}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                statusFilter === s
                  ? 'bg-[#533afd] text-white'
                  : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              {s === 'all' ? '전체' : STATUS_LABELS[s]}
            </Link>
          ))}
        </div>

        {/* 이의제기 목록 */}
        {!disputes || disputes.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-10 text-center">
            <p className="text-slate-400 text-sm">이의제기 건이 없습니다.</p>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-xs text-slate-400 font-semibold uppercase tracking-wide">
                    <th className="text-left px-4 py-3">접수번호</th>
                    <th className="text-left px-4 py-3">업체명</th>
                    <th className="text-left px-4 py-3">사유</th>
                    <th className="text-left px-4 py-3">상태</th>
                    <th className="text-left px-4 py-3">SLA</th>
                    <th className="text-left px-4 py-3">접수일</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {disputes.map((dispute, i) => {
                    const sla = slaStatus(dispute.submitted_at, dispute.status)
                    return (
                      <tr
                        key={dispute.id}
                        className={`border-b border-slate-50 hover:bg-slate-50 transition-colors ${i % 2 === 0 ? '' : 'bg-slate-50/40'}`}
                      >
                        <td className="px-4 py-3">
                          <span className="font-mono text-xs text-[#533afd] font-semibold">
                            {dispute.receipt_number}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium text-slate-800 text-sm">{dispute.vendor_name}</p>
                            {dispute.business_reg_number && (
                              <p className="text-xs text-slate-400">{dispute.business_reg_number}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-500">
                          {REASON_LABELS[dispute.reason_code] ?? dispute.reason_code}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${
                            dispute.status === '접수' ? 'bg-blue-50 text-blue-700' :
                            dispute.status === '검토중' ? 'bg-amber-50 text-amber-700' :
                            dispute.status === '정정완료' ? 'bg-emerald-50 text-emerald-700' :
                            'bg-slate-100 text-slate-500'
                          }`}>
                            {dispute.status}
                          </span>
                        </td>
                        <td className={`px-4 py-3 text-xs ${sla.color}`}>
                          {sla.label}
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-400">
                          {new Date(dispute.submitted_at).toLocaleDateString('ko-KR')}
                        </td>
                        <td className="px-4 py-3">
                          <Link
                            href={`/admin/disputes/${dispute.id}`}
                            className="text-xs font-semibold text-[#533afd] hover:underline whitespace-nowrap"
                          >
                            검토 →
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between">
                <p className="text-xs text-slate-400">{total}건 중 {offset + 1}–{Math.min(offset + limit, total)}건</p>
                <div className="flex gap-2">
                  {page > 1 && (
                    <Link
                      href={`/admin/disputes?status=${statusFilter}&page=${page - 1}`}
                      className="text-xs font-semibold text-slate-600 hover:text-[#533afd] transition-colors"
                    >
                      ← 이전
                    </Link>
                  )}
                  {page < totalPages && (
                    <Link
                      href={`/admin/disputes?status=${statusFilter}&page=${page + 1}`}
                      className="text-xs font-semibold text-slate-600 hover:text-[#533afd] transition-colors"
                    >
                      다음 →
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
