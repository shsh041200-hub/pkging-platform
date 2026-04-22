import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { BoxterLogo } from '@/components/BoxterLogo'
import { DELIVERY_REGIONS } from '@/types'

export const metadata: Metadata = {
  title: '업체 관리 — 관리자',
  robots: { index: false, follow: false },
}

export default async function AdminCompaniesPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/')

  const { data: companies } = await supabase
    .from('companies')
    .select('id, slug, name, delivery_regions')
    .order('name')

  const allCount = DELIVERY_REGIONS.length

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <header className="bg-[#0A0F1E] sticky top-0 z-50 border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <BoxterLogo variant="dark" size="sm" />
          </Link>
          <Link
            href="/admin/dashboard"
            className="text-white/50 text-[12px] font-medium hover:text-white/80 transition-colors"
          >
            ← 대시보드
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-5 sm:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-[24px] font-bold text-gray-900 tracking-[-0.025em]">업체 관리</h1>
          <p className="text-[14px] text-gray-500 mt-1">
            배달 가능 지역 등 업체 정보를 편집합니다.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                    업체명
                  </th>
                  <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                    배달 가능 지역
                  </th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(companies ?? []).map((co) => {
                  const regions = (co.delivery_regions as string[] | null) ?? []
                  const regionLabel =
                    regions.length === 0
                      ? '미설정'
                      : regions.length >= allCount
                      ? '전국 배송'
                      : `${regions.length}개 지역`
                  const labelColor =
                    regions.length === 0
                      ? 'text-gray-400'
                      : 'text-gray-600'

                  return (
                    <tr key={co.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3.5 font-medium text-gray-900">{co.name}</td>
                      <td className={`px-5 py-3.5 ${labelColor}`}>{regionLabel}</td>
                      <td className="px-5 py-3.5 text-right">
                        <Link
                          href={`/admin/companies/${co.slug}/edit`}
                          className="text-[12px] font-semibold text-[#005EFF] hover:underline"
                        >
                          편집
                        </Link>
                      </td>
                    </tr>
                  )
                })}
                {(companies ?? []).length === 0 && (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-5 py-10 text-center text-gray-400 text-[13px]"
                    >
                      등록된 업체가 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
