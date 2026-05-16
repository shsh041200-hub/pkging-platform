import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase/service'
import DisputeReviewPanel from './DisputeReviewPanel'

export const metadata: Metadata = {
  title: '이의제기 상세 — Packlinx Admin',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

type Props = {
  params: Promise<{ id: string }>
}

const REASON_LABELS: Record<string, string> = {
  classification_error: '분류 오류 (잘못된 카테고리로 분류됨)',
  info_inaccurate: '정보 부정확 (잘못된 정보가 표시됨)',
  delete_request: '삭제 요청 (업체 정보 삭제 희망)',
  other: '기타',
}

function DaysBadge({ submittedAt, status }: { submittedAt: string; status: string }) {
  if (status === '정정완료' || status === '유지') {
    return <span className="text-xs text-slate-400">처리완료</span>
  }
  const days = Math.floor((Date.now() - new Date(submittedAt).getTime()) / (1000 * 60 * 60 * 24))
  const color = days >= 30 ? 'text-red-600 font-bold' : days >= 14 ? 'text-orange-600 font-semibold' : 'text-slate-500'
  return <span className={`text-xs ${color}`}>D+{days}일 경과</span>
}

export default async function AdminDisputeDetailPage({ params }: Props) {
  const adminSecret = process.env.ADMIN_SECRET
  if (!adminSecret) notFound()

  const { id } = await params

  const supabase = createServiceClient()
  const { data: dispute, error } = await supabase
    .from('vendor_classification_disputes')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !dispute) notFound()

  // Fetch audit log for this dispute
  const { data: auditLog } = await supabase
    .from('vendor_classification_audit')
    .select('*')
    .eq('dispute_id', id)
    .order('changed_at', { ascending: false })

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
          <Link href="/admin/disputes" className="text-sm text-slate-400 hover:text-slate-600 transition-colors">
            ← 이의제기 목록
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-sm font-semibold text-slate-700 font-mono">{dispute.receipt_number}</span>
          <span className="ml-auto text-xs bg-amber-100 text-amber-700 font-semibold px-2 py-1 rounded">
            ADMIN INTERNAL
          </span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid lg:grid-cols-[1fr_340px] gap-5">

          {/* ── LEFT: 이의제기 상세 ── */}
          <div className="space-y-4">

            {/* 접수 정보 */}
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-lg font-bold text-slate-900 font-mono">{dispute.receipt_number}</h1>
                  <div className="flex items-center gap-3 mt-1">
                    <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${
                      dispute.status === '접수' ? 'bg-blue-50 text-blue-700' :
                      dispute.status === '검토중' ? 'bg-amber-50 text-amber-700' :
                      dispute.status === '정정완료' ? 'bg-emerald-50 text-emerald-700' :
                      'bg-slate-100 text-slate-500'
                    }`}>
                      {dispute.status}
                    </span>
                    <DaysBadge submittedAt={dispute.submitted_at} status={dispute.status} />
                  </div>
                </div>
                <p className="text-xs text-slate-400">
                  {new Date(dispute.submitted_at).toLocaleString('ko-KR')}
                </p>
              </div>

              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">업체명</dt>
                  <dd className="font-semibold text-slate-900">{dispute.vendor_name}</dd>
                  {dispute.business_reg_number && (
                    <dd className="text-xs text-slate-400 mt-0.5">사업자: {dispute.business_reg_number}</dd>
                  )}
                </div>

                <div>
                  <dt className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">담당자</dt>
                  <dd className="font-medium text-slate-700">{dispute.contact_name}</dd>
                  <dd className="text-xs text-slate-400 mt-0.5">
                    <a href={`mailto:${dispute.contact_email}`} className="hover:underline">{dispute.contact_email}</a>
                  </dd>
                  {dispute.contact_phone && (
                    <dd className="text-xs text-slate-400 mt-0.5">{dispute.contact_phone}</dd>
                  )}
                </div>

                <div>
                  <dt className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">이의제기 사유</dt>
                  <dd className="font-medium text-slate-700">{REASON_LABELS[dispute.reason_code] ?? dispute.reason_code}</dd>
                </div>

                <div>
                  <dt className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">접수 채널</dt>
                  <dd className="font-medium text-slate-700">{dispute.channel === 'form' ? '웹 폼' : '이메일'}</dd>
                </div>
              </dl>

              {dispute.reason_detail && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">상세 내용</p>
                  <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">{dispute.reason_detail}</p>
                </div>
              )}
            </div>

            {/* SLA 타임라인 */}
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <h2 className="text-sm font-bold text-slate-700 mb-4">SLA 타임라인</h2>
              <div className="space-y-3">
                {[
                  {
                    label: '접수',
                    time: dispute.submitted_at,
                    done: true,
                    note: null,
                  },
                  {
                    label: '1차 회신 (SLA: 14영업일)',
                    time: dispute.first_replied_at,
                    done: !!dispute.first_replied_at,
                    note: !dispute.first_replied_at ? '미완료' : null,
                  },
                  {
                    label: '최종 처분 (SLA: 30영업일)',
                    time: dispute.resolved_at,
                    done: !!dispute.resolved_at,
                    note: !dispute.resolved_at ? '미완료' : null,
                  },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className={`mt-0.5 w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                      item.done ? 'bg-emerald-500 border-emerald-500' : 'bg-white border-slate-300'
                    }`} />
                    <div>
                      <p className="text-xs font-semibold text-slate-700">{item.label}</p>
                      {item.time ? (
                        <p className="text-xs text-slate-400">{new Date(item.time).toLocaleString('ko-KR')}</p>
                      ) : (
                        <p className="text-xs text-slate-300">{item.note}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Audit log */}
            {auditLog && auditLog.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <h2 className="text-sm font-bold text-slate-700 mb-4">분류 변경 이력</h2>
                <div className="space-y-3">
                  {auditLog.map(log => (
                    <div key={log.id} className="text-xs border border-slate-100 rounded-lg px-3 py-2.5">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-slate-700">{log.changed_by}</span>
                        <span className="text-slate-400">{new Date(log.changed_at).toLocaleString('ko-KR')}</span>
                      </div>
                      <p className="text-slate-500">
                        <span className="line-through text-red-400">{log.before_model ?? '(없음)'}</span>
                        {' → '}
                        <span className="text-emerald-600 font-medium">{log.after_model ?? '(없음)'}</span>
                      </p>
                      {log.reason && <p className="text-slate-400 mt-1">{log.reason}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Admin note display */}
            {dispute.admin_note && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-xs font-semibold text-amber-700 mb-1">어드민 메모</p>
                <p className="text-sm text-amber-800 whitespace-pre-line">{dispute.admin_note}</p>
                {dispute.resolved_by && (
                  <p className="text-xs text-amber-600 mt-2">처리자: {dispute.resolved_by}</p>
                )}
              </div>
            )}
          </div>

          {/* ── RIGHT: 처분 패널 ── */}
          <div className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-xl p-5 lg:sticky lg:top-20">
              <h2 className="text-sm font-bold text-slate-700 mb-4">처분 입력</h2>
              <DisputeReviewPanel
                disputeId={id}
                currentStatus={dispute.status}
                currentNote={dispute.admin_note}
                currentAfterClassification={dispute.after_classification}
              />
            </div>

            {/* 연락처 빠른 링크 */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-500">
              <p className="font-semibold text-slate-600 mb-2">vendor 연락처</p>
              <a href={`mailto:${dispute.contact_email}?subject=[Packlinx] 이의제기 검토 결과 안내 (${dispute.receipt_number})`}
                className="block text-[#533afd] hover:underline mb-1"
              >
                📧 {dispute.contact_email}
              </a>
              {dispute.contact_phone && (
                <a href={`tel:${dispute.contact_phone}`} className="block text-slate-600">
                  📞 {dispute.contact_phone}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
