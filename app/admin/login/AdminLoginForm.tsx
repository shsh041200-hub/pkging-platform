'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Props = {
  redirectTo: string
}

export default function AdminLoginForm({ redirectTo }: Props) {
  const router = useRouter()
  const [secret, setSecret] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? '인증 실패')
        return
      }
      router.push(redirectTo)
      router.refresh()
    } catch {
      setError('네트워크 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="secret" className="block text-sm font-medium text-slate-700 mb-1">
          Admin 비밀번호
        </label>
        <input
          id="secret"
          type="password"
          required
          autoFocus
          value={secret}
          onChange={e => setSecret(e.target.value)}
          placeholder="ADMIN_SECRET"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#533afd]/40 focus:border-[#533afd]"
        />
      </div>

      <button
        type="submit"
        disabled={loading || secret.length === 0}
        className="w-full rounded-lg bg-[#533afd] hover:bg-[#4434d4] text-white font-semibold py-2.5 text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? '확인 중...' : '로그인'}
      </button>
    </form>
  )
}
