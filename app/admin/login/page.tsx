import type { Metadata } from 'next'
import AdminLoginForm from './AdminLoginForm'

export const metadata: Metadata = {
  title: 'Admin 로그인 — Packlinx',
  robots: { index: false, follow: false },
}

type Props = {
  searchParams: Promise<{ redirect?: string }>
}

export default async function AdminLoginPage({ searchParams }: Props) {
  const params = await searchParams
  const redirectTo = typeof params.redirect === 'string' && params.redirect.startsWith('/admin')
    ? params.redirect
    : '/admin/disputes'

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-xl border border-slate-200 p-8" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <div className="mb-6 text-center">
            <span className="text-xs font-bold text-[#533afd] tracking-widest uppercase">Packlinx</span>
            <h1 className="text-lg font-bold text-slate-900 mt-1">Admin 로그인</h1>
            <p className="text-xs text-slate-400 mt-1">내부 관리자 전용</p>
          </div>

          <AdminLoginForm redirectTo={redirectTo} />
        </div>
      </div>
    </div>
  )
}
