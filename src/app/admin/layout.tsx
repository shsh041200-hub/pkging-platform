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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-xl font-bold text-blue-600">
              📦 패키징 플랫폼
            </Link>
            <span className="text-gray-300">|</span>
            <span className="text-sm font-medium text-gray-700">어드민</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link
              href="/admin/companies"
              className="text-sm text-gray-600 hover:text-blue-600 font-medium"
            >
              업체 관리
            </Link>
            <Link href="/" className="text-sm text-gray-500 hover:text-gray-800">
              사이트 보기
            </Link>
          </nav>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
    </div>
  )
}
