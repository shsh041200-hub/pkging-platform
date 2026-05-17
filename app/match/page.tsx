import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { PacklinxLogo } from '@/components/PacklinxLogo'
import { SiteHeader } from '@/components/SiteHeader'
import { BusinessRegistrationInfo } from '@/components/BusinessRegistrationInfo'
import MatchClient, { type MatchVendor } from './MatchClient'

export const revalidate = 300

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.packlinx.com'

export const metadata: Metadata = {
  title: '포장재 업체 비교 — 기존 업체보다 더 나은 곳 찾기',
  description:
    '현재 거래 중인 포장재 업체와 새 업체를 1:1로 비교해보세요. 가격·MOQ·납기·인증·지역 기준으로 더 나은 업체를 추천합니다.',
  alternates: { canonical: `${siteUrl}/match` },
  openGraph: {
    title: '포장재 업체 비교 — 기존 업체보다 더 나은 곳 찾기 | Packlinx',
    description:
      '기존 업체와 1:1 비교로 더 나은 포장재 공급사를 찾아보세요. 거래 중개 없이 공개 사업자 정보만 제공합니다.',
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
  name: '포장재 업체 1:1 비교 매칭',
  description: '기존 거래 업체와 새로운 포장재 공급사를 가격·MOQ·납기·인증·지역 기준으로 직접 비교.',
  url: `${siteUrl}/match`,
  inLanguage: 'ko',
  isPartOf: { '@type': 'WebSite', url: siteUrl, name: 'Packlinx' },
}

export default async function MatchPage() {
  const supabase = await createClient()

  const { data: rows } = await supabase
    .from('companies')
    .select(
      'id, slug, name, industry_categories, material_type, packaging_form, delivery_regions, province, city, phone, email, website, moq_value, moq_unit, min_order_quantity, lead_time_standard_days, lead_time_express_days, certifications, created_at',
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
    moq_value: r.moq_value as number | null,
    moq_unit: r.moq_unit as string | null,
    min_order_quantity: r.min_order_quantity as string | null,
    lead_time_standard_days: r.lead_time_standard_days as number | null,
    lead_time_express_days: r.lead_time_express_days as number | null,
    certifications: (r.certifications as string[]) ?? [],
    created_at: r.created_at as string,
  }))

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <SiteHeader />

      {/* Hero — Variant C: 광역 배경 그라데이션 + 중앙 카피 */}
      <div className="relative bg-gradient-to-b from-brand-100 via-brand-50 to-white overflow-hidden">
        <div className="absolute inset-0 opacity-50">
          <div className="absolute inset-0">
            <Image
              src="/images/ai/phase1/match-hero.webp"
              alt="포장재 공급업체 매칭 일러스트"
              fill
              className="object-cover object-center"
              priority
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-brand-50/0 via-brand-50/30 to-white" />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto px-6 py-16 sm:py-24 text-center">
          <h1 className="text-[28px] sm:text-5xl font-light text-heading-deep-navy leading-tight tracking-tight mb-3">
            더 나은 포장재 업체 찾기
          </h1>
          <p className="text-[15px] text-neutral-600 leading-relaxed">
            지금 거래 중인 업체를 입력하면, 더 나은 업체 Top 3를 바로 비교해드립니다.<br />
            Packlinx는 거래를 중개하지 않습니다. 업체 공개 사업자 정보만 제공합니다.
          </p>
        </div>
      </div>

      {/* Main content */}
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
