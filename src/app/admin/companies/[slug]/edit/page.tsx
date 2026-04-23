import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { PacklinxLogo } from '@/components/PacklinxLogo'
import type { DeliveryRegion } from '@/types'
import { CompanyDeliveryEditClient } from './CompanyDeliveryEditClient'

export const metadata: Metadata = {
  title: '배달 지역 편집 — 관리자',
  robots: { index: false, follow: false },
}

type PageProps = { params: Promise<{ slug: string }> }

export default async function CompanyDeliveryEditPage({ params }: PageProps) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/')

  const { data: company } = await supabase
    .from('companies')
    .select('id, slug, name, delivery_regions')
    .eq('slug', slug)
    .single()

  if (!company) notFound()

  const initialRegions = ((company.delivery_regions as string[] | null) ?? []) as DeliveryRegion[]

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <header className="bg-[#0A0F1E] sticky top-0 z-50 border-b border-white/[0.06]">
        <div className="max-w-4xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <PacklinxLogo variant="dark" />
          </Link>
          <Link
            href="/admin/companies"
            className="text-white/50 text-[12px] font-medium hover:text-white/80 transition-colors"
          >
            ← 업체 목록
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-5 sm:px-8 py-10">
        <div className="mb-6">
          <p className="text-[12px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
            관리자 편집
          </p>
          <h1 className="text-[22px] font-bold text-gray-900 tracking-[-0.025em]">
            {company.name}
          </h1>
          <p className="text-[13px] text-gray-500 mt-0.5">배달 가능 지역 설정</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 md:p-8">
          <CompanyDeliveryEditClient
            companyId={company.id}
            initialRegions={initialRegions}
          />
        </div>
      </main>
    </div>
  )
}
