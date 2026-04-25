'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type FormState = {
  company_name: string
  request_type: 'delete' | 'update' | ''
  requester_name: string
  requester_email: string
  reason: string
}

export default function OptOutForm() {
  const router = useRouter()
  const [form, setForm] = useState<FormState>({
    company_name: '',
    request_type: '',
    requester_name: '',
    requester_email: '',
    reason: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!form.request_type) {
      setError('요청 유형을 선택해 주세요.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/opt-out-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
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
        <div className="flex gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="request_type"
              value="delete"
              required
              checked={form.request_type === 'delete'}
              onChange={() => setForm(f => ({ ...f, request_type: 'delete' }))}
              className="accent-[#0F172A]"
            />
            <span className="text-sm text-slate-700">정보 삭제</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="request_type"
              value="update"
              checked={form.request_type === 'update'}
              onChange={() => setForm(f => ({ ...f, request_type: 'update' }))}
              className="accent-[#0F172A]"
            />
            <span className="text-sm text-slate-700">정보 수정</span>
          </label>
        </div>
      </fieldset>

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

      <div className="pt-2">
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-[#0F172A] text-white font-medium py-2.5 text-sm hover:bg-slate-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? '처리 중...' : '요청 제출'}
        </button>
      </div>

      <p className="text-xs text-slate-400 text-center">
        제출하신 정보는 요청 처리 목적으로만 사용되며, 처리 완료 후 파기됩니다.
      </p>
    </form>
  )
}
