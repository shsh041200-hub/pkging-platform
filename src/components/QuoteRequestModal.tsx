'use client'

import { useState, useEffect, useRef } from 'react'
import { useTrackEvent } from '@/hooks/useTrackEvent'

type Props = {
  companyId: string
  companyName: string
  isOpen: boolean
  onClose: () => void
}

const PACKAGING_TYPES = [
  '박스/케이스', '파우치/백', '병/용기', '튜브', '캔/틴',
  '쇼핑백', '완충재', '필름', '라벨/스티커', '테이프',
]

const QUANTITY_OPTIONS = [
  '100개 미만', '100~500개', '500~1,000개',
  '1,000~5,000개', '5,000~10,000개', '10,000개 이상',
]

export function QuoteRequestModal({ companyId, companyName, isOpen, onClose }: Props) {
  const { track } = useTrackEvent()
  const [form, setForm] = useState({
    contactName: '',
    phone: '',
    packagingType: '',
    quantity: '',
    companyName: '',
    details: '',
    desiredDelivery: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  useEffect(() => {
    if (!isOpen) {
      setSuccess(false)
      setError('')
      setForm({ contactName: '', phone: '', packagingType: '', quantity: '', companyName: '', details: '', desiredDelivery: '' })
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.contactName || !form.phone || !form.packagingType || !form.quantity) return
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/quote-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId, ...form }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        setError(data?.error ?? '요청 처리 중 오류가 발생했습니다.')
        return
      }
      track('quote_submit', companyId)
      setSuccess(true)
      setTimeout(() => { onClose() }, 2000)
    } catch {
      setError('네트워크 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm px-4 pb-4 sm:pb-0"
    >
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <div>
            <p className="text-[11px] text-gray-400 font-medium">견적 요청</p>
            <h2 className="text-[16px] font-bold text-gray-900">{companyName}</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {success ? (
          <div className="flex flex-col items-center justify-center py-16 px-6">
            <div className="w-14 h-14 bg-green-50 border border-green-200 rounded-full flex items-center justify-center mb-4">
              <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-[16px] font-semibold text-gray-900 mb-1">견적 요청이 전송되었습니다</p>
            <p className="text-[13px] text-gray-500">담당자가 확인 후 연락드립니다.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="overflow-y-auto flex-1">
            <div className="px-6 py-5 space-y-4">
              {/* Required fields */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">
                    담당자명 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.contactName}
                    onChange={e => setForm(f => ({ ...f, contactName: e.target.value }))}
                    className="w-full h-10 px-3 text-[13px] border border-gray-200 rounded-lg focus:outline-none focus:border-[#005EFF] focus:ring-1 focus:ring-[#005EFF]/20 transition-colors"
                    placeholder="홍길동"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">
                    연락처 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    className="w-full h-10 px-3 text-[13px] border border-gray-200 rounded-lg focus:outline-none focus:border-[#005EFF] focus:ring-1 focus:ring-[#005EFF]/20 transition-colors"
                    placeholder="010-0000-0000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">
                  포장 유형 <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={form.packagingType}
                  onChange={e => setForm(f => ({ ...f, packagingType: e.target.value }))}
                  className="w-full h-10 px-3 text-[13px] border border-gray-200 rounded-lg focus:outline-none focus:border-[#005EFF] focus:ring-1 focus:ring-[#005EFF]/20 transition-colors bg-white"
                >
                  <option value="">선택하세요</option>
                  {PACKAGING_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">
                  예상 수량 <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={form.quantity}
                  onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))}
                  className="w-full h-10 px-3 text-[13px] border border-gray-200 rounded-lg focus:outline-none focus:border-[#005EFF] focus:ring-1 focus:ring-[#005EFF]/20 transition-colors bg-white"
                >
                  <option value="">선택하세요</option>
                  {QUANTITY_OPTIONS.map(q => <option key={q} value={q}>{q}</option>)}
                </select>
              </div>

              {/* Optional fields */}
              <div className="border-t border-gray-100 pt-4">
                <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-3">선택 사항</p>
                <div className="space-y-3">
                  <div>
                    <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">회사명</label>
                    <input
                      type="text"
                      value={form.companyName}
                      onChange={e => setForm(f => ({ ...f, companyName: e.target.value }))}
                      className="w-full h-10 px-3 text-[13px] border border-gray-200 rounded-lg focus:outline-none focus:border-[#005EFF] focus:ring-1 focus:ring-[#005EFF]/20 transition-colors"
                      placeholder="(주)회사명"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">희망 납기</label>
                    <input
                      type="date"
                      value={form.desiredDelivery}
                      onChange={e => setForm(f => ({ ...f, desiredDelivery: e.target.value }))}
                      className="w-full h-10 px-3 text-[13px] border border-gray-200 rounded-lg focus:outline-none focus:border-[#005EFF] focus:ring-1 focus:ring-[#005EFF]/20 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">
                      상세 요청사항
                      <span className="font-normal text-gray-400 ml-1">(최대 500자)</span>
                    </label>
                    <textarea
                      value={form.details}
                      onChange={e => setForm(f => ({ ...f, details: e.target.value }))}
                      maxLength={500}
                      rows={3}
                      className="w-full px-3 py-2.5 text-[13px] border border-gray-200 rounded-lg focus:outline-none focus:border-[#005EFF] focus:ring-1 focus:ring-[#005EFF]/20 transition-colors resize-none leading-relaxed"
                      placeholder="재질, 사이즈, 인쇄 방식, 수량 등 구체적인 내용을 입력해주세요."
                    />
                    <p className="text-[11px] text-gray-400 text-right mt-0.5">{form.details.length}/500</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 pb-6 flex-shrink-0">
              {error && (
                <p className="text-[13px] text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 mb-3">{error}</p>
              )}
              <button
                type="submit"
                disabled={submitting || !form.contactName || !form.phone || !form.packagingType || !form.quantity}
                className="w-full h-12 bg-[#005EFF] hover:bg-[#0047CC] disabled:opacity-50 disabled:cursor-not-allowed text-white text-[15px] font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    전송 중...
                  </>
                ) : '견적 요청하기'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
