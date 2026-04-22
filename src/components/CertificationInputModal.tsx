'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  CERTIFICATION_TYPES,
  CERTIFICATION_CATEGORY_LABELS,
  type CertificationCategory,
} from '@/types'

const CERT_CATEGORY_ORDER: CertificationCategory[] = [
  'quality',
  'food_safety',
  'environmental',
  'pharma',
  'general',
]

const certsByCategory = CERT_CATEGORY_ORDER.reduce<
  Record<CertificationCategory, typeof CERTIFICATION_TYPES>
>((acc, cat) => {
  acc[cat] = CERTIFICATION_TYPES.filter((c) => c.category === cat)
  return acc
}, {} as Record<CertificationCategory, typeof CERTIFICATION_TYPES>)

interface Props {
  companyId: string
  onClose: () => void
}

const UI_TEXT = {
  title: '인증 추가',
  certTypeLabel: '인증 종류',
  certTypePlaceholder: '인증을 선택하세요',
  certNumberLabel: '인증번호 (선택사항)',
  certNumberPlaceholder: '예: ISO9001-2024-KR-001234',
  submit: '인증 추가',
  submitting: '추가 중...',
  cancel: '취소',
  successMessage: '인증이 성공적으로 추가되었습니다.',
  requiredError: '인증 종류를 선택해주세요.',
  serverError: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
  descriptionHint: '인증을 추가하면 검색 결과 상단에 노출되어 더 많은 바이어에게 노출됩니다.',
} as const

export function CertificationInputModal({ companyId, onClose }: Props) {
  const router = useRouter()
  const [certType, setCertType] = useState('')
  const [certNumber, setCertNumber] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!certType) {
      setError(UI_TEXT.requiredError)
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/companies/${companyId}/certifications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ certType, certNumber: certNumber.trim() || undefined }),
      })

      if (!res.ok) {
        const json = await res.json().catch(() => null)
        const msg = (json?.error?.message as string | undefined) ?? UI_TEXT.serverError
        setError(msg)
        return
      }

      setSubmitted(true)
      router.refresh()
      setTimeout(() => onClose(), 1200)
    } catch {
      setError(UI_TEXT.serverError)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cert-modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="relative w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl p-6 sm:p-8 z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 id="cert-modal-title" className="text-[17px] font-bold text-gray-900">
              {UI_TEXT.title}
            </h2>
            <p className="text-[12px] text-gray-500 mt-0.5 leading-relaxed">
              {UI_TEXT.descriptionHint}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="ml-4 flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="닫기"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {submitted ? (
          <div className="py-6 text-center">
            <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-[14px] font-medium text-gray-900">{UI_TEXT.successMessage}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Cert type select */}
            <div>
              <label htmlFor="cert-type" className="block text-[12px] font-semibold text-gray-700 mb-1.5">
                {UI_TEXT.certTypeLabel}
                <span className="text-red-500 ml-0.5">*</span>
              </label>
              <select
                id="cert-type"
                value={certType}
                onChange={(e) => { setCertType(e.target.value); setError(null) }}
                className="w-full text-[14px] text-gray-900 border border-gray-200 rounded-lg px-3.5 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-[#005EFF]/30 focus:border-[#005EFF] transition-colors appearance-none"
                disabled={isSubmitting}
              >
                <option value="" disabled>{UI_TEXT.certTypePlaceholder}</option>
                {CERT_CATEGORY_ORDER.map((cat) => {
                  const certs = certsByCategory[cat]
                  if (!certs || certs.length === 0) return null
                  return (
                    <optgroup key={cat} label={CERTIFICATION_CATEGORY_LABELS[cat]}>
                      {certs.map((c) => (
                        <option key={c.id} value={c.id}>{c.label}</option>
                      ))}
                    </optgroup>
                  )
                })}
              </select>
            </div>

            {/* Cert number input */}
            <div>
              <label htmlFor="cert-number" className="block text-[12px] font-semibold text-gray-700 mb-1.5">
                {UI_TEXT.certNumberLabel}
              </label>
              <input
                id="cert-number"
                type="text"
                value={certNumber}
                onChange={(e) => setCertNumber(e.target.value)}
                placeholder={UI_TEXT.certNumberPlaceholder}
                maxLength={100}
                className="w-full text-[14px] text-gray-900 border border-gray-200 rounded-lg px-3.5 py-2.5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#005EFF]/30 focus:border-[#005EFF] transition-colors"
                disabled={isSubmitting}
              />
            </div>

            {/* Error */}
            {error && (
              <p className="text-[12px] text-red-600 flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {error}
              </p>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 text-[14px] font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg px-4 py-2.5 transition-colors"
                disabled={isSubmitting}
              >
                {UI_TEXT.cancel}
              </button>
              <button
                type="submit"
                className="flex-1 text-[14px] font-semibold text-white bg-[#005EFF] hover:bg-[#0047CC] disabled:opacity-50 disabled:cursor-not-allowed rounded-lg px-4 py-2.5 transition-colors flex items-center justify-center gap-2"
                disabled={isSubmitting}
              >
                {isSubmitting && (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                )}
                {isSubmitting ? UI_TEXT.submitting : UI_TEXT.submit}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
