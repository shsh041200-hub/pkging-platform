'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type ReasonCode = 'classification_error' | 'info_inaccurate' | 'delete_request' | 'other' | ''

const REASON_LABELS: Record<Exclude<ReasonCode, ''>, string> = {
  classification_error: '분류 오류 (잘못된 카테고리로 분류됨)',
  info_inaccurate: '정보 부정확 (잘못된 정보가 표시됨)',
  delete_request: '삭제 요청 (업체 정보 삭제 희망)',
  other: '기타',
}

type FormState = {
  vendor_name: string
  business_reg_number: string
  contact_name: string
  contact_email: string
  contact_phone: string
  reason_code: ReasonCode
  reason_detail: string
}

type Props = {
  initialVendorId?: string
  initialVendorName?: string
}

export default function DisputeForm({ initialVendorId, initialVendorName }: Props) {
  const router = useRouter()
  const [form, setForm] = useState<FormState>({
    vendor_name: initialVendorName ?? '',
    business_reg_number: '',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    reason_code: '',
    reason_detail: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!form.reason_code) {
      setError('이의제기 사유를 선택해 주세요.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/disputes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendor_name: form.vendor_name,
          business_reg_number: form.business_reg_number || null,
          contact_name: form.contact_name,
          contact_email: form.contact_email,
          contact_phone: form.contact_phone || null,
          reason_code: form.reason_code,
          reason_detail: form.reason_detail || null,
          vendor_id: initialVendorId ?? null,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? '오류가 발생했습니다. 다시 시도해 주세요.')
        return
      }
      router.push(`/vendor/dispute/thanks?receipt=${encodeURIComponent(data.receipt_number ?? '')}`)
    } catch {
      setError('네트워크 오류가 발생했습니다. 다시 시도해 주세요.')
    } finally {
      setLoading(false)
    }
  }

  function field(id: keyof FormState, value: string) {
    setForm(f => ({ ...f, [id]: value }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </div>
      )}

      {/* ── 식별 정보 ── */}
      <section>
        <h2 className="text-sm font-semibold text-slate-700 mb-4 pb-2 border-b border-slate-100">
          업체 식별 정보
        </h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="vendor_name" className="block text-sm font-medium text-slate-700 mb-1">
              업체명 <span className="text-red-500">*</span>
            </label>
            <input
              id="vendor_name"
              type="text"
              required
              value={form.vendor_name}
              onChange={e => field('vendor_name', e.target.value)}
              placeholder="예: (주)한국포장"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#533afd]/40 focus:border-[#533afd]"
            />
          </div>

          <div>
            <label htmlFor="business_reg_number" className="block text-sm font-medium text-slate-700 mb-1">
              사업자등록번호
              <span className="ml-1 text-xs font-normal text-slate-400">(선택 — 정확한 식별에 도움)</span>
            </label>
            <input
              id="business_reg_number"
              type="text"
              value={form.business_reg_number}
              onChange={e => field('business_reg_number', e.target.value)}
              placeholder="123-45-67890"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#533afd]/40 focus:border-[#533afd]"
            />
          </div>
        </div>
      </section>

      {/* ── 담당자 연락처 ── */}
      <section>
        <h2 className="text-sm font-semibold text-slate-700 mb-4 pb-2 border-b border-slate-100">
          담당자 연락처
        </h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="contact_name" className="block text-sm font-medium text-slate-700 mb-1">
              담당자 이름 <span className="text-red-500">*</span>
            </label>
            <input
              id="contact_name"
              type="text"
              required
              value={form.contact_name}
              onChange={e => field('contact_name', e.target.value)}
              placeholder="홍길동"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#533afd]/40 focus:border-[#533afd]"
            />
          </div>

          <div>
            <label htmlFor="contact_email" className="block text-sm font-medium text-slate-700 mb-1">
              이메일 <span className="text-red-500">*</span>
            </label>
            <input
              id="contact_email"
              type="email"
              required
              value={form.contact_email}
              onChange={e => field('contact_email', e.target.value)}
              placeholder="your@email.com"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#533afd]/40 focus:border-[#533afd]"
            />
            <p className="mt-1 text-xs text-slate-400">접수 확인 이메일이 발송됩니다.</p>
          </div>

          <div>
            <label htmlFor="contact_phone" className="block text-sm font-medium text-slate-700 mb-1">
              연락처 전화번호
              <span className="ml-1 text-xs font-normal text-slate-400">(선택)</span>
            </label>
            <input
              id="contact_phone"
              type="tel"
              value={form.contact_phone}
              onChange={e => field('contact_phone', e.target.value)}
              placeholder="010-1234-5678"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#533afd]/40 focus:border-[#533afd]"
            />
          </div>
        </div>
      </section>

      {/* ── 이의제기 내용 ── */}
      <section>
        <h2 className="text-sm font-semibold text-slate-700 mb-4 pb-2 border-b border-slate-100">
          이의제기 내용
        </h2>
        <div className="space-y-4">
          <fieldset>
            <legend className="block text-sm font-medium text-slate-700 mb-3">
              사유 <span className="text-red-500">*</span>
            </legend>
            <div className="space-y-3">
              {(Object.entries(REASON_LABELS) as [Exclude<ReasonCode, ''>, string][]).map(([code, label]) => (
                <label key={code} className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="radio"
                    name="reason_code"
                    value={code}
                    required
                    checked={form.reason_code === code}
                    onChange={() => setForm(f => ({ ...f, reason_code: code }))}
                    className="mt-0.5 accent-[#533afd]"
                  />
                  <span className="text-sm text-slate-700 group-hover:text-slate-900 transition-colors">
                    {label}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <div>
            <label htmlFor="reason_detail" className="block text-sm font-medium text-slate-700 mb-1">
              상세 내용
              <span className="ml-1 text-xs font-normal text-slate-400">(선택 — 구체적으로 기재할수록 빠른 처리가 가능합니다)</span>
            </label>
            <textarea
              id="reason_detail"
              rows={4}
              value={form.reason_detail}
              onChange={e => field('reason_detail', e.target.value)}
              placeholder="예) 현재 '골판지 제조'로 분류되어 있으나 실제 업종은 '포장재 인쇄'입니다."
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#533afd]/40 focus:border-[#533afd] resize-none"
            />
          </div>
        </div>
      </section>

      {/* ── 첨부파일 안내 ── */}
      <div className="rounded-lg bg-slate-50 border border-slate-200 p-4">
        <p className="text-xs font-semibold text-slate-600 mb-1">첨부파일 (통신판매업 신고증 등)</p>
        <p className="text-xs text-slate-500 leading-relaxed">
          증빙 서류는{' '}
          <a
            href="mailto:vendor-support@packlinx.com"
            className="font-medium text-[#533afd] hover:underline"
          >
            vendor-support@packlinx.com
          </a>
          으로 이메일 첨부하여 보내주세요.
          이메일 제목에 업체명과 아래에서 발급되는 <strong>접수번호</strong>를 포함해 주시면 빠른 처리가 가능합니다.
        </p>
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-[#533afd] hover:bg-[#4434d4] text-white font-semibold py-3 text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? '제출 중...' : '이의제기 접수'}
        </button>
      </div>

      <p className="text-xs text-slate-400 text-center">
        접수 후 영업일 기준 14일 이내 1차 회신, 30일 이내 최종 처분을 안내드립니다.
        제출하신 정보는 이의제기 처리 목적으로만 사용됩니다.
      </p>
    </form>
  )
}
