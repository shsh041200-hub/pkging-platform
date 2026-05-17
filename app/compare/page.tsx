import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getCompaniesBySlugs, computeCompleteness } from '@/lib/compare-data'
import { PacklinxLogo } from '@/components/PacklinxLogo'
import { SiteHeader } from '@/components/SiteHeader'
import CompareCart from '@/app/components/CompareCart'
import CompareTable from './CompareTable'

export const dynamic = 'force-dynamic'

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.packlinx.com').replace(/\/$/, '')

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Packlinx', item: siteUrl },
    { '@type': 'ListItem', position: 2, name: '비교', item: `${siteUrl}/compare` },
  ],
}

type Props = { searchParams: Promise<{ ids?: string }> }

export const metadata: Metadata = {
  title: '벤더 비교',
}

export default async function ComparePage({ searchParams }: Props) {
  const { ids } = await searchParams
  const slugs = ids
    ? ids.split(',').map((s) => decodeURIComponent(s.trim())).filter(Boolean).slice(0, 3)
    : []

  // 2-way comparison: redirect to canonical SEO URL (/compare/a-vs-b)
  if (slugs.length === 2) {
    const [a, b] = slugs.sort()
    redirect(`/compare/${a}-vs-${b}`)
  }

  const companies = await getCompaniesBySlugs(slugs)
  const completeness = companies.map(computeCompleteness)

  if (companies.length === 0) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />
        <SiteHeader />

        <main className="max-w-2xl mx-auto px-5 py-16 text-center">
          <Link href="/" className="text-sm text-stripe-purple hover:underline mb-6 inline-block">← 홈으로</Link>
          <h1 className="text-xl font-bold text-gray-900 mb-3">비교할 벤더를 선택해 주세요</h1>
          <p className="text-gray-500 text-sm">
            카테고리 페이지에서 벤더 카드의 <strong>+ 비교</strong> 버튼을 눌러 추가하세요.
          </p>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <SiteHeader />

      {/* Breadcrumb */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-5 pb-0">
        <div className="flex items-center gap-2 text-sm text-body-secondary">
          <Link href="/" className="text-stripe-purple hover:text-stripe-purple-hover transition-colors">Packlinx</Link>
          <span className="text-neutral-300">›</span>
          <span className="text-neutral-400">비교</span>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-4 pb-28 md:pb-12">

        {/* Hero band */}
        <div className="bg-white border border-border-v04 rounded-xl p-5 sm:p-7 mb-5" style={{ boxShadow: 'var(--shadow-elevated-v04)' }}>
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-[22px] sm:text-[26px] heading-display text-heading-deep-navy tracking-[-0.02em] leading-tight mb-1">
                벤더 비교 <span className="text-neutral-400 font-light text-lg">({companies.length}개)</span>
              </h1>
              <p className="text-sm text-body-secondary">
                {companies.every((c) => c.is_verified) ? '모든 업체 정보 등록 ✓' : '패키징 업체 상세 비교'}
              </p>
            </div>

            {/* Desktop CTAs */}
            <div className="hidden sm:flex flex-col gap-2 shrink-0 min-w-[200px]">
              {companies.map((c, i) => c.website ? (
                <a
                  key={c.slug}
                  href={c.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center justify-between gap-2 text-[13px] font-semibold px-3.5 py-2.5 rounded-lg transition-colors ${
                    i === 0
                      ? 'text-white bg-stripe-purple hover:bg-stripe-purple-hover'
                      : 'text-stripe-purple border border-stripe-purple-ring bg-stripe-purple-soft hover:bg-stripe-purple-tint'
                  }`}
                >
                  <span className="truncate max-w-[120px]">{c.name}</span>
                  <span className={`text-[11px] whitespace-nowrap ${i === 0 ? 'text-white/70' : 'text-stripe-purple/70'}`}>문의하기 ↗</span>
                </a>
              ) : null)}
            </div>
          </div>

          {/* Key stats — brand-50 accent */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-5">
            {companies.map((c) => (
              <div key={c.slug} className="bg-brand-50 border border-brand-100 rounded-lg px-3 py-2.5 text-center">
                <p className="text-[9px] font-semibold text-brand-700 uppercase tracking-widest mb-1 truncate">{c.name}</p>
                {c.moq_value != null && (
                  <p className="text-[15px] font-bold text-heading-deep-navy leading-tight">
                    {c.moq_value.toLocaleString('ko-KR')}
                    <span className="text-[11px] font-normal text-body-secondary ml-0.5">{c.moq_unit}</span>
                  </p>
                )}
                <p className="text-[10px] text-body-secondary mt-0.5">최소주문량</p>
              </div>
            ))}
            {companies.map((c) => (
              <div key={`${c.slug}-lead`} className="bg-neutral-100 border border-neutral-200 rounded-lg px-3 py-2.5 text-center">
                <p className="text-[9px] font-semibold text-neutral-500 uppercase tracking-widest mb-1 truncate">{c.name}</p>
                {c.lead_time_standard_days != null && (
                  <p className="text-[15px] font-bold text-heading-deep-navy leading-tight">
                    {c.lead_time_standard_days}
                    <span className="text-[11px] font-normal text-body-secondary ml-0.5">일</span>
                  </p>
                )}
                <p className="text-[10px] text-body-secondary mt-0.5">표준 납기</p>
              </div>
            ))}
          </div>
        </div>

        <CompareTable companies={companies} completeness={completeness} />

        <footer className="mt-5 rounded-xl border border-border-v04 bg-neutral-50 px-4 py-3 text-xs leading-relaxed text-body-secondary">
          Packlinx는 패키징 업체에 대한 공개 정보를 정리해 제공하는 디렉토리 서비스입니다. 거래·견적 의뢰는 직접 중개하지 않으며, 업체 연락은 각 업체의 공식 채널을 이용해 주세요.
        </footer>
      </main>

      {/* Mobile sticky CTA */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-neutral-200 px-4 py-3 safe-area-pb">
        <div className="flex gap-2.5">
          {companies.map((c, i) => c.website ? (
            <a
              key={c.slug}
              href={c.website}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex-1 flex items-center justify-center gap-1.5 text-[13px] font-semibold py-3.5 rounded-xl transition-colors ${
                i === 0
                  ? 'text-white bg-stripe-purple hover:bg-stripe-purple-hover'
                  : 'text-stripe-purple border border-stripe-purple-ring bg-stripe-purple-soft hover:bg-stripe-purple-tint'
              }`}
            >
              {c.name} 문의
            </a>
          ) : null)}
        </div>
      </div>

      <CompareCart />
    </div>
  )
}
