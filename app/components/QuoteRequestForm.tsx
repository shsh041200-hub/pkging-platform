'use client'

import { useState, useRef } from 'react'
import type { CompanyFull } from '@/lib/compare-data'

type Props = {
  companies: CompanyFull[]
}

export default function QuoteRequestForm({ companies }: Props) {
  const [email, setEmail] = useState('')
  const [company, setCompany] = useState('')
  const [requirements, setRequirements] = useState('')
  const [deadline, setDeadline] = useState('')
  const [consentCollection, setConsentCollection] = useState(false)
  const [consentThirdParty, setConsentThirdParty] = useState(false)
  const [showCollection, setShowCollection] = useState(false)
  const [showThirdParty, setShowThirdParty] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const honeyRef = useRef<HTMLInputElement>(null)

  if (companies.length === 0) return null

  const vendorNames = companies.map((c) => c.name)
  const vendorIds = companies.map((c) => c.id)
  const today = new Date().toISOString().split('T')[0]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (requirements.trim().length < 10) {
      setError('수량·요구사항을 10자 이상 입력해 주세요.')
      return
    }
    if (!consentCollection) {
      setError('개인정보 수집·이용 동의가 필요합니다.')
      return
    }
    if (!consentThirdParty) {
      setError('개인정보 제3자 제공 동의가 필요합니다.')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/quote-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendorIds,
          buyerEmail: email.trim(),
          buyerCompany: company.trim() || undefined,
          requirements: requirements.trim(),
          deadlineDate: deadline || undefined,
          consentCollection: true,
          consentThirdParty: true,
          _honey: honeyRef.current?.value ?? '',
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError((data as { error?: string }).error ?? '요청 중 오류가 발생했습니다. 다시 시도해 주세요.')
        return
      }
      setSuccess(true)
    } catch {
      setError('네트워크 오류가 발생했습니다. 다시 시도해 주세요.')
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <section
        aria-label="견적 요청 완료"
        className="mt-8 mb-4 rounded-lg border border-[#e5edf5] bg-white p-8 text-center"
        style={{ boxShadow: 'rgba(50,50,93,0.15) 0px 8px 24px -8px' }}
      >
        <div
          className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#f0eeff]"
          aria-hidden="true"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M5 13l4 4L19 7" stroke="#533afd" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h2
          className="mb-2 text-lg font-light text-[#061b31]"
          style={{ fontFeatureSettings: '"ss01"', letterSpacing: '-0.22px' }}
        >
          견적 요청이 전송되었습니다
        </h2>
        <p className="text-sm text-[#64748d]">
          선택하신 {companies.length}개 업체에 견적 요청이 전달되었습니다.
          <br />
          담당자가 이메일 <strong className="text-[#273951]">{email}</strong>로 연락드릴 예정입니다.
        </p>
      </section>
    )
  }

  return (
    <section
      aria-label="견적 요청 폼"
      className="mt-8 mb-4 overflow-hidden rounded-lg border border-[#e5edf5] bg-white"
      style={{ boxShadow: 'rgba(50,50,93,0.15) 0px 8px 24px -8px' }}
    >
      <div className="border-b border-[#e5edf5] px-6 py-5">
        <h2
          className="text-[1.25rem] font-light text-[#061b31]"
          style={{ fontFeatureSettings: '"ss01"', letterSpacing: '-0.22px' }}
        >
          선택한 업체에 한번에 견적 요청하기
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 p-6" noValidate>
        {/* Honeypot — bots fill this; real users never see it */}
        <input
          ref={honeyRef}
          name="_honey"
          type="text"
          tabIndex={-1}
          aria-hidden="true"
          autoComplete="off"
          className="absolute h-0 w-0 opacity-0 pointer-events-none"
        />

        {/* Vendor chips — §17 requires provider identification at top */}
        <div>
          <p className="mb-2 text-xs font-medium text-[#273951]">요청 대상 업체</p>
          <ul className="flex flex-wrap gap-2" aria-label="선택된 업체 목록">
            {companies.map((c) => (
              <li key={c.id}>
                <span className="inline-block rounded border border-[#d6d9fc] bg-[#f0eeff] px-3 py-1.5 text-xs text-[#533afd]">
                  {c.name}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Email (required) */}
        <div>
          <label htmlFor="qrf-email" className="mb-1.5 block text-sm font-medium text-[#273951]">
            이메일{' '}
            <span className="text-red-500" aria-label="필수">
              *
            </span>
          </label>
          <input
            id="qrf-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="buyer@company.com"
            className="w-full rounded border border-[#e5edf5] px-3 py-2 text-sm text-[#061b31] placeholder-[#64748d] focus:border-[#533afd] focus:outline-none focus:ring-1 focus:ring-[#533afd]"
          />
        </div>

        {/* Company name (optional) */}
        <div>
          <label htmlFor="qrf-company" className="mb-1.5 block text-sm font-medium text-[#273951]">
            회사명{' '}
            <span className="text-xs text-[#64748d]">(선택)</span>
          </label>
          <input
            id="qrf-company"
            type="text"
            autoComplete="organization"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="(주)팩클린"
            className="w-full rounded border border-[#e5edf5] px-3 py-2 text-sm text-[#061b31] placeholder-[#64748d] focus:border-[#533afd] focus:outline-none focus:ring-1 focus:ring-[#533afd]"
          />
        </div>

        {/* Requirements textarea (required, min 10 chars) */}
        <div>
          <label htmlFor="qrf-requirements" className="mb-1.5 block text-sm font-medium text-[#273951]">
            수량 및 요구사항{' '}
            <span className="text-red-500" aria-label="필수">
              *
            </span>{' '}
            <span className="text-xs text-[#64748d]">(최소 10자)</span>
          </label>
          <textarea
            id="qrf-requirements"
            required
            minLength={10}
            maxLength={2000}
            rows={4}
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
            placeholder="필요한 포장재 종류, 수량, 사이즈, 소재 등을 적어 주세요."
            className="w-full resize-y rounded border border-[#e5edf5] px-3 py-2 text-sm text-[#061b31] placeholder-[#64748d] focus:border-[#533afd] focus:outline-none focus:ring-1 focus:ring-[#533afd]"
          />
          <p className="mt-1 text-right text-xs text-[#64748d]">{requirements.length}/2000</p>
        </div>

        {/* Deadline (optional) */}
        <div>
          <label htmlFor="qrf-deadline" className="mb-1.5 block text-sm font-medium text-[#273951]">
            납기 희망일{' '}
            <span className="text-xs text-[#64748d]">(선택)</span>
          </label>
          <input
            id="qrf-deadline"
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            min={today}
            className="w-full rounded border border-[#e5edf5] px-3 py-2 text-sm text-[#061b31] focus:border-[#533afd] focus:outline-none focus:ring-1 focus:ring-[#533afd]"
          />
        </div>

        {/* PIPA consent block — 묶음 금지 §22(3): two independent checkboxes */}
        <fieldset className="rounded-lg border border-[#e5edf5] p-4 space-y-4">
          <legend className="px-1 text-xs font-medium text-[#273951]">개인정보 동의 (각 항목 필수)</legend>

          {/* Consent 1: 수집·이용 §15 */}
          <div>
            <label className="flex cursor-pointer items-start gap-2.5">
              <input
                type="checkbox"
                checked={consentCollection}
                onChange={(e) => setConsentCollection(e.target.checked)}
                className="mt-0.5 h-4 w-4 flex-shrink-0 accent-[#533afd]"
                aria-describedby="consent-collection-text"
              />
              <span className="text-sm leading-snug text-[#273951]">
                <span className="font-medium">[필수]</span> 개인정보 수집·이용 동의
                <span className="ml-1 text-xs text-[#64748d]">(개인정보보호법 §15)</span>
              </span>
            </label>
            <div className="mt-2 pl-6">
              <button
                type="button"
                onClick={() => setShowCollection((v) => !v)}
                aria-expanded={showCollection}
                aria-controls="consent-collection-text"
                className="text-xs text-[#533afd] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#533afd] rounded"
              >
                {showCollection ? '▲ 전문 접기' : '▼ 전문 보기'}
              </button>
              {showCollection && (
                <div
                  id="consent-collection-text"
                  className="mt-2 rounded border border-[#e5edf5] bg-[#f8fafc] p-3 text-xs leading-relaxed text-[#64748d]"
                >
                  <strong className="text-[#273951]">개인정보 수집·이용 동의 (§15)</strong>
                  <br />
                  <br />
                  <strong>수집 항목:</strong> 이메일, 회사명(선택), 수량·요구사항, 납기 희망일
                  <br />
                  <strong>수집 목적:</strong> 포장재 견적 요청 중개 서비스 제공
                  <br />
                  <strong>보유 기간:</strong> 서비스 제공 완료 후 3년 (전자상거래법 §6 기준)
                  <br />
                  <br />
                  귀하는 본 동의를 거부할 권리가 있으나, 거부 시 견적 요청 서비스 이용이 불가합니다.
                </div>
              )}
            </div>
          </div>

          {/* Consent 2: 제3자 제공 §17 — vendor names listed per §17 requirement */}
          <div>
            <label className="flex cursor-pointer items-start gap-2.5">
              <input
                type="checkbox"
                checked={consentThirdParty}
                onChange={(e) => setConsentThirdParty(e.target.checked)}
                className="mt-0.5 h-4 w-4 flex-shrink-0 accent-[#533afd]"
                aria-describedby="consent-third-party-text"
              />
              <span className="text-sm leading-snug text-[#273951]">
                <span className="font-medium">[필수]</span> 개인정보 제3자 제공 동의
                <span className="ml-1 text-xs text-[#64748d]">(개인정보보호법 §17)</span>
              </span>
            </label>
            <div className="mt-2 pl-6">
              <button
                type="button"
                onClick={() => setShowThirdParty((v) => !v)}
                aria-expanded={showThirdParty}
                aria-controls="consent-third-party-text"
                className="text-xs text-[#533afd] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#533afd] rounded"
              >
                {showThirdParty ? '▲ 전문 접기' : '▼ 전문 보기'}
              </button>
              {showThirdParty && (
                <div
                  id="consent-third-party-text"
                  className="mt-2 rounded border border-[#e5edf5] bg-[#f8fafc] p-3 text-xs leading-relaxed text-[#64748d]"
                >
                  <strong className="text-[#273951]">개인정보 제3자 제공 동의 (§17)</strong>
                  <br />
                  <br />
                  <strong>제공받는 자:</strong> {vendorNames.join(', ')}
                  <br />
                  <strong>제공 항목:</strong> 이메일, 회사명(선택), 수량·요구사항, 납기 희망일
                  <br />
                  <strong>제공 목적:</strong> 견적 문의 회신 및 영업 연락
                  <br />
                  <strong>보유 기간:</strong> 제공 목적 달성 후 즉시 파기 (최대 3년)
                  <br />
                  <br />
                  귀하는 본 동의를 거부할 권리가 있으나, 거부 시 선택하신 업체에 견적 요청이 전달되지 않습니다.
                </div>
              )}
            </div>
          </div>
        </fieldset>

        {/* 통신판매중개자 고지문 §20 */}
        <p className="rounded border border-[#e5edf5] bg-[#f8fafc] p-3 text-xs leading-relaxed text-[#64748d]">
          Packlinx는 통신판매중개자로서 견적 의뢰의 당사자가 아닙니다. 견적 계약 및 거래는 구매자와 판매자 간에
          직접 이루어지며, Packlinx는 이에 대한 책임을 지지 않습니다. (전자상거래법 §20)
        </p>

        {/* Error message */}
        {error && (
          <p
            role="alert"
            className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600"
          >
            {error}
          </p>
        )}

        {/* Submit CTA — #533afd per DESIGN.md */}
        <button
          type="submit"
          disabled={submitting || !consentCollection || !consentThirdParty}
          className="w-full rounded bg-[#533afd] px-4 py-2.5 text-base font-normal text-white transition-colors hover:bg-[#4434d4] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#533afd]"
          style={{ fontFeatureSettings: '"ss01"' }}
        >
          {submitting ? '전송 중...' : `${companies.length}개 업체에 견적 요청하기`}
        </button>
      </form>
    </section>
  )
}
