import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { PacklinxLogo } from '@/components/PacklinxLogo'
import { BusinessRegistrationInfo } from '@/components/BusinessRegistrationInfo'
import MatchClient, { type MatchVendor } from './MatchClient'

export const revalidate = 300

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.packlinx.com'

export const metadata: Metadata = {
  title: '포장재 업체 찾기 — 사양 매칭 | Packlinx',
  description:
    '업종·소재·포장형태·지역을 선택하면 조건에 맞는 패키징 업체 목록을 바로 확인할 수 있습니다. 개인정보 수집 없이 업체 공개 정보만 제공합니다.',
  alternates: { canonical: `${siteUrl}/match` },
  openGraph: {
    title: '포장재 업체 찾기 — 사양 매칭 | Packlinx',
    description:
      '업종·소재·포장형태·지역으로 조건에 맞는 포장재 업체를 찾아보세요. 거래 중개 없이 공개 사업자 정보만 제공합니다.',
    url: `${siteUrl}/match`,
    siteName: 'Packlinx',
    locale: 'ko_KR',
    type: 'website',
  },
  robots: { index: true, follow: true },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SearchResultsPage',
  name: '포장재 업체 사양 매칭',
  description: '사양·카테고리·지역으로 패키징 업체를 직접 찾는 디렉토리 검색 도구.',
  url: `${siteUrl}/match`,
  inLanguage: 'ko',
  isPartOf: { '@type': 'WebSite', url: siteUrl, name: 'Packlinx' },
}

export default async function MatchPage() {
  const supabase = await createClient()

  const { data: rows } = await supabase
    .from('companies')
    .select(
      'id, slug, name, industry_categories, material_type, packaging_form, delivery_regions, province, city, phone, email, website, created_at',
    )
    .order('created_at', { ascending: false })

  const vendors: MatchVendor[] = (rows ?? []).map((r) => ({
    id: r.id as string,
    slug: r.slug as string,
    name: r.name as string,
    industry_categories: (r.industry_categories as MatchVendor['industry_categories']) ?? [],
    material_type: (r.material_type as MatchVendor['material_type']) ?? null,
    packaging_form: (r.packaging_form as string | null) ?? null,
    delivery_regions: (r.delivery_regions as string[]) ?? [],
    province: r.province as string | null,
    city: r.city as string | null,
    phone: r.phone as string | null,
    email: r.email as string | null,
    website: r.website as string | null,
    created_at: r.created_at as string,
  }))

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Header */}
      <header className="bg-white sticky top-0 z-50 border-b border-[#e5edf5]">
        <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <PacklinxLogo variant="light" />
          </Link>
          <nav className="flex items-center gap-4 text-sm text-neutral-500">
            <Link href="/" className="hover:text-[#061b31] transition-colors">
              전체 업체
            </Link>
            <Link href="/categories" className="hover:text-[#061b31] transition-colors">
              카테고리
            </Link>
            <Link href="/compare" className="hover:text-[#061b31] transition-colors">
              비교하기
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <div className="bg-white border-b border-[#e5edf5]">
        <div className="max-w-4xl mx-auto px-5 py-10">
          <h1
            className="text-[28px] sm:text-[36px] font-[300] text-[#061b31] tracking-tight leading-tight mb-2"
            style={{ fontFeatureSettings: '"ss01"', letterSpacing: '-0.64px' }}
          >
            포장재 업체 찾기
          </h1>
          <p className="text-[15px] text-[#64748d] leading-relaxed">
            사양·카테고리·지역을 선택하면 조건에 맞는 업체 목록을 바로 확인할 수 있습니다.
            <br />
            Packlinx는 거래를 중개하지 않습니다. 업체 공개 사업자 정보만 제공합니다.
          </p>
        </div>
      </div>

      {/* Main content — client component handles form + filtering */}
      <main className="flex-1">
        <MatchClient vendors={vendors} />
      </main>

      {/* Footer */}
      <footer className="bg-[#1c1e54] text-white mt-auto">
        <div className="max-w-6xl mx-auto px-5 py-10 flex flex-col gap-6">
          <PacklinxLogo variant="dark" />
          <BusinessRegistrationInfo theme="dark" />
          <div className="text-[11px] text-slate-500 space-x-4">
            <Link href="/privacy" className="hover:text-slate-300 transition-colors">
              개인정보처리방침
            </Link>
            <Link href="/terms" className="hover:text-slate-300 transition-colors">
              이용약관
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
