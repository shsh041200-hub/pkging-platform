'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type RequestType = 'delete' | 'update' | 'takedown' | ''

type FormState = {
  company_name: string
  request_type: RequestType
  requester_name: string
  requester_email: string
  reason: string
  takedown_url: string
}

const REQUEST_TYPE_LABELS: Record<Exclude<RequestType, ''>, string> = {
  delete: '정보 삭제',
  update: '정보 수정',
  takedown: '권리침해 신고 (정보통신망법 임시조치 요청)',
}

type Props = {
  initialType?: 'delete' | 'update' | 'takedown'
}

export default function OptOutForm({ initialType }: Props) {
  const router = useRouter()
  const [form, setForm] = useState<FormState>({
    company_name: '',
    request_type: initialType ?? '',
    requester_name: '',
    requester_email: '',
    reason: '',
    takedown_url: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isTakedown = form.request_type === 'takedown'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!form.request_type) {
      setError('요청 유형을 선택해 주세요.')
      return
    }

    if (isTakedown && !form.takedown_url.trim()) {
      setError('신고 대상 페이지 URL을 입력해 주세요.')
      return
    }

    if (isTakedown && !form.reason.trim()) {
      setError('권리침해 사유를 입력해 주세요.')
      return
    }

    setLoading(true)
    try {
      const body: Record<string, string | null> = {
        company_name: form.company_name,
        request_type: form.request_type,
        requester_name: form.requester_name,
        requester_email: form.requester_email,
        reason: form.reason || null,
      }
      if (isTakedown) {
        body.takedown_url = form.takedown_url
      }

      const res = await fetch('/api/opt-out-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? '오류가 발생했습니다. 다시 시도해 주세요.')
        return
      }
      router.push('/opt-out/thanks')
    } catch {
      setError('네트워크 오류가 발생했습니다. 다시 시도해 주세요.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="company_name" className="block text-sm font-medium text-slate-700 mb-1">
          업체명 <span className="text-red-500">*</span>
        </label>
        <input
          id="company_name"
          type="text"
          required
          value={form.company_name}
          onChange={e => setForm(f => ({ ...f, company_name: e.target.value }))}
          placeholder="예: (주)한국포장"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <fieldset>
        <legend className="block text-sm font-medium text-slate-700 mb-2">
          요청 유형 <span className="text-red-500">*</span>
        </legend>
        <div className="flex flex-col gap-3">
          {(['delete', 'update', 'takedown'] as const).map(type => (
            <label key={type} className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="radio"
                name="request_type"
                value={type}
                required
                checked={form.request_type === type}
                onChange={() => setForm(f => ({ ...f, request_type: type }))}
                className="mt-0.5 accent-[#0F172A]"
              />
              <span className={`text-sm ${type === 'takedown' ? 'text-slate-800 font-medium' : 'text-slate-700'}`}>
                {REQUEST_TYPE_LABELS[type]}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {isTakedown && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 space-y-4">
          <p className="text-xs text-amber-800 leading-relaxed">
            정보통신망법 제44조의2에 따른 권리침해 임시조치를 요청합니다.
            신고 접수 후 24시간 이내에 임시조치(비공개) 여부를 결정하고, 30일 이내에 종결 결과를 안내드립니다.
          </p>

          <div>
            <label htmlFor="takedown_url" className="block text-sm font-medium text-slate-700 mb-1">
              신고 대상 페이지 URL <span className="text-red-500">*</span>
            </label>
            <input
              id="takedown_url"
              type="url"
              required={isTakedown}
              value={form.takedown_url}
              onChange={e => setForm(f => ({ ...f, takedown_url: e.target.value }))}
              placeholder="https://packlinx.com/companies/..."
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="reason_takedown" className="block text-sm font-medium text-slate-700 mb-1">
              권리침해 사유 <span className="text-red-500">*</span>
            </label>
            <textarea
              id="reason_takedown"
              rows={4}
              required={isTakedown}
              value={form.reason}
              onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
              placeholder="어떤 권리(저작권, 명예훼손 등)가 어떻게 침해되었는지 구체적으로 기재해 주세요."
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div className="rounded-md bg-white border border-amber-200 px-3 py-2.5 text-xs text-slate-600">
            <p className="font-medium text-slate-700 mb-0.5">권리 입증 자료 첨부</p>
            <p>
              권리 입증 자료(저작권 등록증, 계약서 등)는{' '}
              <a href="mailto:legal@pkging.kr" className="underline font-medium">legal@pkging.kr</a>
              {' '}로 이메일 첨부하여 보내주세요.
              이메일 제목에 신청인 이름과 신고 대상 URL을 포함해 주시면 빠른 처리가 가능합니다.
            </p>
          </div>
        </div>
      )}

      {!isTakedown && (
        <div>
          <label htmlFor="reason" className="block text-sm font-medium text-slate-700 mb-1">
            사유
            <span className="ml-1 text-xs font-normal text-slate-400">(선택)</span>
          </label>
          <textarea
            id="reason"
            rows={4}
            value={form.reason}
            onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
            placeholder="삭제 또는 수정을 요청하시는 이유나 내용을 기재해 주세요."
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>
      )}

      <div>
        <label htmlFor="requester_name" className="block text-sm font-medium text-slate-700 mb-1">
          요청자 이름 <span className="text-red-500">*</span>
        </label>
        <input
          id="requester_name"
          type="text"
          required
          value={form.requester_name}
          onChange={e => setForm(f => ({ ...f, requester_name: e.target.value }))}
          placeholder="홍길동"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="requester_email" className="block text-sm font-medium text-slate-700 mb-1">
          연락처 이메일 <span className="text-red-500">*</span>
        </label>
        <input
          id="requester_email"
          type="email"
          required
          value={form.requester_email}
          onChange={e => setForm(f => ({ ...f, requester_email: e.target.value }))}
          placeholder="your@email.com"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-[#0F172A] text-white font-medium py-2.5 text-sm hover:bg-slate-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? '처리 중...' : isTakedown ? '권리침해 신고 제출' : '요청 제출'}
        </button>
      </div>

      <p className="text-xs text-slate-400 text-center">
        제출하신 정보는 요청 처리 목적으로만 사용되며, 처리 완료 후 파기됩니다.
      </p>
    </form>
  )
}
