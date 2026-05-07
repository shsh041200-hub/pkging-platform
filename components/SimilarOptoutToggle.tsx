'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface SimilarOptoutToggleProps {
  companyId: string
  initialOptedOut: boolean
}

const TEXTS = {
  optOutButton: '이 노출 끄기',
  confirmMsg: '비슷한 업체 섹션이 숨겨지고, 다른 업체 페이지에서도 귀사가 제외됩니다. 계속하시겠습니까?',
  confirmYes: '확인',
  confirmCancel: '취소',
  offStateMsg: '비슷한 업체 노출이 꺼져 있습니다.',
  reEnableButton: '다시 켜기',
  errorMsg: '요청 중 오류가 발생했습니다. 다시 시도해 주세요.',
} as const

export function SimilarOptoutToggle({ companyId, initialOptedOut }: SimilarOptoutToggleProps) {
  const router = useRouter()
  const [optedOut, setOptedOut] = useState(initialOptedOut)
  const [loading, setLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function callApi(enable: boolean) {
    setLoading(true)
    setError(null)
    const prev = optedOut
    setOptedOut(enable)
    try {
      const res = await fetch(`/api/companies/${companyId}/similar-optout`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: enable }),
      })
      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error((json as { error?: { message?: string } }).error?.message ?? '오류 발생')
      }
      router.refresh()
    } catch (err) {
      setOptedOut(prev)
      setError(err instanceof Error ? err.message : TEXTS.errorMsg)
    } finally {
      setLoading(false)
      setShowConfirm(false)
    }
  }

  if (optedOut) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-[13px] text-slate-500">{TEXTS.offStateMsg}</p>
          <button
            onClick={() => callApi(false)}
            disabled={loading}
            className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-[#C2410C] text-white text-[13px] font-medium hover:bg-[#9a3008] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '처리 중...' : TEXTS.reEnableButton}
          </button>
        </div>
        {error && (
          <p className="mt-2 text-[12px] text-red-600">{error}</p>
        )}
      </div>
    )
  }

  return (
    <div>
      {showConfirm ? (
        <div className="mt-2 text-[12px] text-slate-600 bg-slate-50 border border-slate-200 rounded-lg p-3">
          <p className="mb-2">{TEXTS.confirmMsg}</p>
          <div className="flex gap-2">
            <button
              onClick={() => callApi(true)}
              disabled={loading}
              className="px-3 py-1 rounded bg-[#C2410C] text-white text-[12px] font-medium hover:bg-[#9a3008] transition-colors disabled:opacity-50"
            >
              {loading ? '처리 중...' : TEXTS.confirmYes}
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              disabled={loading}
              className="px-3 py-1 rounded bg-white border border-slate-300 text-slate-600 text-[12px] font-medium hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              {TEXTS.confirmCancel}
            </button>
          </div>
          {error && (
            <p className="mt-2 text-red-600">{error}</p>
          )}
        </div>
      ) : (
        <button
          onClick={() => setShowConfirm(true)}
          className="text-[11px] text-slate-400 hover:text-slate-600 transition-colors underline-offset-2 hover:underline"
        >
          {TEXTS.optOutButton}
        </button>
      )}
    </div>
  )
}
