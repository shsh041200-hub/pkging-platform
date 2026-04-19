import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-[#0d1d2e] sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-white font-bold text-lg tracking-wide">
              PKGING
            </Link>
            <span className="text-slate-600 text-sm">|</span>
            <span className="text-slate-300 text-sm font-medium">어드민</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link
              href="/admin/companies"
              className="text-slate-300 text-sm hover:text-white transition-colors font-medium"
            >
              업체 관리
            </Link>
            <Link
              href="/admin/crawl"
              className="text-slate-300 text-sm hover:text-white transition-colors font-medium"
            >
              크롤링
            </Link>
            <Link href="/" className="text-slate-500 text-sm hover:text-slate-300 transition-colors">
              사이트 보기
            </Link>
          </nav>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">{children}</main>
    </div>
  )
}
