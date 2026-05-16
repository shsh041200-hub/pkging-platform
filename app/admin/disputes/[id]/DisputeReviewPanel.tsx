'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateDispute } from '../actions'

type DisputeStatus = '접수' | '검토중' | '정정완료' | '유지'

type Props = {
  disputeId: string
  currentStatus: DisputeStatus
  currentNote: string | null
  currentAfterClassification: string | null
}

const STATUS_OPTIONS: { value: DisputeStatus; label: string; color: string }[] = [
  { value: '접수', label: '접수', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { value: '검토중', label: '검토중', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { value: '정정완료', label: '정정완료', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { value: '유지', label: '유지 (원안 유지)', color: 'bg-slate-50 text-slate-600 border-slate-200' },
]

export default function DisputeReviewPanel({
  disputeId,
  currentStatus,
  currentNote,
  currentAfterClassification,
}: Props) {
  const router = useRouter()
  const [status, setStatus] = useState<DisputeStatus>(currentStatus)
  const [adminNote, setAdminNote] = useState(currentNote ?? '')
  const [afterClassification, setAfterClassification] = useState(currentAfterClassification ?? '')
  const [resolvedBy, setResolvedBy] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSave() {
    setError(null)
    setSuccess(false)
    setLoading(true)

    try {
      const result = await updateDispute({
        id: disputeId,
        status,
        admin_note: adminNote || null,
        after_classification: afterClassification || null,
        resolved_by: resolvedBy || null,
      })

      if (result.error) {
        setError(result.error)
        return
      }
      setSuccess(true)
      router.refresh()
    } catch {
      setError('처리 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-5">
      {success && (
        <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">
          저장되었습니다.
        </div>
      )}
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">상태 변경</label>
        <div className="grid grid-cols-2 gap-2">
          {STATUS_OPTIONS.map(opt => (
            <label
              key={opt.value}
              className={`flex items-center gap-2 cursor-pointer border rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                status === opt.value ? opt.color + ' border-2' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
              }`}
            >
              <input
                type="radio"
                name="status"
                value={opt.value}
                checked={status === opt.value}
                onChange={() => setStatus(opt.value)}
                className="sr-only"
              />
              {opt.label}
            </label>
          ))}
        </div>
      </div>

      {status === '정정완료' && (
        <div>
          <label htmlFor="after_classification" className="block text-sm font-semibold text-slate-700 mb-1">
            정정 후 분류
          </label>
          <input
            id="after_classification"
            type="text"
            value={afterClassification}
            onChange={e => setAfterClassification(e.target.value)}
            placeholder="예: 포장재 인쇄 / 모델 B"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#533afd]/40 focus:border-[#533afd]"
          />
        </div>
      )}

      <div>
        <label htmlFor="admin_note" className="block text-sm font-semibold text-slate-700 mb-1">
          어드민 메모
          <span className="ml-1 text-xs font-normal text-slate-400">(내부용)</span>
        </label>
        <textarea
          id="admin_note"
          rows={3}
          value={adminNote}
          onChange={e => setAdminNote(e.target.value)}
          placeholder="검토 내용, 처분 근거 등을 기록하세요."
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#533afd]/40 focus:border-[#533afd] resize-none"
        />
      </div>

      <div>
        <label htmlFor="resolved_by" className="block text-sm font-semibold text-slate-700 mb-1">
          처리자
        </label>
        <input
          id="resolved_by"
          type="text"
          value={resolvedBy}
          onChange={e => setResolvedBy(e.target.value)}
          placeholder="처리자 이름"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#533afd]/40 focus:border-[#533afd]"
        />
      </div>

      <button
        onClick={handleSave}
        disabled={loading}
        className="w-full rounded-lg bg-[#533afd] hover:bg-[#4434d4] text-white font-semibold py-3 text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? '저장 중...' : '처분 저장'}
      </button>
    </div>
  )
}
