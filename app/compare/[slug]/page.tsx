import { notFound, permanentRedirect } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getCompaniesBySlugs, computeCompleteness } from '@/lib/compare-data'
import CompareCart from '@/app/components/CompareCart'
import CompareTable from '../CompareTable'
import { PacklinxLogo } from '@/components/PacklinxLogo'
import { SiteHeader } from '@/components/SiteHeader'
import { BusinessRegistrationInfo } from '@/components/BusinessRegistrationInfo'

export const revalidate = 3600

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.packlinx.com'

type Props = { params: Promise<{ slug: string }> }

/**
 * Parses "slugA-vs-slugB" by trying each -vs- split point and verifying both
 * halves exist in DB. Handles slugs that themselves contain "-vs-".
 */
async function parseVsSlug(segment: string): Promise<[string, string] | null> {
  const parts = segment.split('-vs-')
  if (parts.length < 2) return null

  for (let i = 0; i < parts.length - 1; i++) {
    const slugA = parts.slice(0, i + 1).join('-vs-')
    const slugB = parts.slice(i + 1).join('-vs-')
    const companies = await getCompaniesBySlugs([slugA, slugB])
    if (
      companies.length === 2 &&
      companies.some((c) => c.slug === slugA) &&
      companies.some((c) => c.slug === slugB)
    ) {
      return [slugA, slugB]
    }
  }
  return null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const decoded = decodeURIComponent(slug)
  const parsed = await parseVsSlug(decoded)
  if (!parsed) return { title: '비교 페이지를 찾을 수 없습니다' }

  const [slugA, slugB] = parsed
  const [canonA, canonB] = [slugA, slugB].sort()
  const companies = await getCompaniesBySlugs([canonA, canonB])
  if (companies.length < 2) return { title: '비교 페이지를 찾을 수 없습니다' }

  const [compA, compB] = [
    companies.find((c) => c.slug === canonA)!,
    companies.find((c) => c.slug === canonB)!,
  ]

  // Use absolute title to bypass root layout's "%s | Packlinx" template — the
  // page-level title already ends with "| Packlinx" and the template would
  // double the brand suffix.
  const titleAbsolute = `${compA.name} vs ${compB.name} — 패키징 업체 비교 | Packlinx`
  const ogTitle = titleAbsolute
  const description = `${compA.name}과 ${compB.name}를 한눈에 비교하세요. 최소주문수량, 납기, 인증, 가격 등 18가지 항목을 비교해 최적의 포장 업체를 선택하세요.`
  const canonicalUrl = `${siteUrl}/compare/${canonA}-vs-${canonB}`

  return {
    title: { absolute: titleAbsolute },
    description,
    robots: { index: true, follow: true },
    openGraph: {
      title: ogTitle,
      description,
      url: canonicalUrl,
      type: 'website',
    },
    alternates: {
      canonical: canonicalUrl,
      languages: { 'ko-KR': canonicalUrl, 'x-default': canonicalUrl },
    },
  }
}

export default async function CompareSlugPage({ params }: Props) {
  const { slug } = await params
  const decoded = decodeURIComponent(slug)
  const parsed = await parseVsSlug(decoded)
  if (!parsed) notFound()

  const [slugA, slugB] = parsed
  const [canonA, canonB] = [slugA, slugB].sort()

  // Permanent redirect: enforce alphabetical slug order for canonical URL
  if (slugA !== canonA || slugB !== canonB) {
    permanentRedirect(`/compare/${canonA}-vs-${canonB}`)
  }

  const companies = await getCompaniesBySlugs([canonA, canonB])
  if (companies.length < 2) notFound()

  const completeness = companies.map(computeCompleteness)
  const [compA, compB] = [
    companies.find((c) => c.slug === canonA)!,
    companies.find((c) => c.slug === canonB)!,
  ]
  const orderedCompanies = [compA, compB]

  const hasWebsiteA = !!compA.website
  const hasWebsiteB = !!compB.website

  const canonicalUrl = `${siteUrl}/compare/${canonA}-vs-${canonB}`
  const compareJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': canonicalUrl,
    url: canonicalUrl,
    name: `${compA.name} vs ${compB.name} — 패키징 업체 비교`,
    inLanguage: 'ko',
    about: [
      {
        '@type': 'Organization',
        name: compA.name,
        url: compA.website ?? `${siteUrl}/companies/${canonA}`,
      },
      {
        '@type': 'Organization',
        name: compB.name,
        url: compB.website ?? `${siteUrl}/companies/${canonB}`,
      },
    ],
    isPartOf: { '@type': 'WebSite', name: 'Packlinx', url: siteUrl },
  }

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${compA.name} vs ${compB.name} 비교`,
    description: `${compA.name}과 ${compB.name}를 한눈에 비교하세요. 최소주문수량, 납기, 인증, 가격 등 18가지 항목 비교.`,
    url: canonicalUrl,
    numberOfItems: 2,
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: compA.name,
        url: `${siteUrl}/companies/${compA.slug}`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: compB.name,
        url: `${siteUrl}/companies/${compB.slug}`,
      },
    ],
  }

  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Packlinx',
    url: siteUrl,
    logo: `${siteUrl}/packlinx-logo-light.svg`,
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Packlinx', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: '비교', item: `${siteUrl}/compare` },
      {
        '@type': 'ListItem',
        position: 3,
        name: `${compA.name} vs ${compB.name}`,
        item: canonicalUrl,
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(compareJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <div className="min-h-screen bg-neutral-50">

        <SiteHeader />

        {/* V05 breadcrumb with chevron */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-5 pb-0">
          <div className="flex items-center gap-2 text-sm text-body-secondary">
            <Link href="/" className="text-stripe-purple hover:text-stripe-purple-hover transition-colors">Packlinx</Link>
            <span className="text-neutral-300">›</span>
            <span className="text-neutral-400">비교</span>
          </div>
        </div>

        <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-4 pb-28 md:pb-12">

          {/* Hero card — title + fold-above CTA + key-stat grid */}
          <div className="bg-white border border-border-v04 rounded-xl p-5 sm:p-7 mb-5" style={{ boxShadow: 'var(--shadow-elevated-v04)' }}>
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h1 className="text-[22px] sm:text-[26px] heading-display text-heading-deep-navy tracking-[-0.02em] leading-tight mb-1">
                  {compA.name} <span className="text-neutral-400 font-light">vs</span> {compB.name}
                </h1>
                <p className="text-sm text-body-secondary">
                  {compA.is_verified && compB.is_verified ? '두 업체 모두 정보 등록 완료 ✓' : '패키징 업체 상세 비교'}
                </p>
              </div>

              {/* Desktop fold-above CTA */}
              {(hasWebsiteA || hasWebsiteB) && (
                <div className="hidden sm:flex flex-col gap-2 shrink-0 min-w-[200px]">
                  {hasWebsiteA && (
                    <a
                      href={compA.website!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between gap-2 text-[13px] font-semibold text-white bg-stripe-purple hover:bg-stripe-purple-hover px-3.5 py-2.5 rounded-lg transition-colors"
                    >
                      <span className="truncate max-w-[120px]">{compA.name}</span>
                      <span className="text-white/70 text-[11px] whitespace-nowrap">문의하기 ↗</span>
                    </a>
                  )}
                  {hasWebsiteB && (
                    <a
                      href={compB.website!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between gap-2 text-[13px] font-semibold text-stripe-purple border border-stripe-purple-ring bg-stripe-purple-soft hover:bg-stripe-purple-tint px-3.5 py-2.5 rounded-lg transition-colors"
                    >
                      <span className="truncate max-w-[120px]">{compB.name}</span>
                      <span className="text-stripe-purple/70 text-[11px] whitespace-nowrap">문의하기 ↗</span>
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Brand-50 key-stat grid — MOQ + 납기 */}
            {(compA.moq_value != null || compB.moq_value != null || compA.lead_time_standard_days != null || compB.lead_time_standard_days != null) && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-5">
                {[compA, compB].map((c) => (
                  <div key={`${c.slug}-moq`} className="bg-brand-50 border border-brand-100 rounded-lg px-3 py-2.5 text-center">
                    <p className="text-[9px] font-semibold text-brand-700 uppercase tracking-widest mb-1 truncate">{c.name}</p>
                    {c.moq_value != null ? (
                      <p className="text-[15px] font-bold text-heading-deep-navy leading-tight">
                        {c.moq_value.toLocaleString('ko-KR')}
                        <span className="text-[11px] font-normal text-body-secondary ml-0.5">{c.moq_unit ?? ''}</span>
                      </p>
                    ) : (
                      <p className="text-[15px] font-bold text-neutral-300 leading-tight">—</p>
                    )}
                    <p className="text-[10px] text-body-secondary mt-0.5">최소주문량</p>
                  </div>
                ))}
                {[compA, compB].map((c) => (
                  <div key={`${c.slug}-lead`} className="bg-neutral-100 border border-neutral-200 rounded-lg px-3 py-2.5 text-center">
                    <p className="text-[9px] font-semibold text-neutral-500 uppercase tracking-widest mb-1 truncate">{c.name}</p>
                    {c.lead_time_standard_days != null ? (
                      <p className="text-[15px] font-bold text-heading-deep-navy leading-tight">
                        {c.lead_time_standard_days}
                        <span className="text-[11px] font-normal text-body-secondary ml-0.5">일</span>
                      </p>
                    ) : (
                      <p className="text-[15px] font-bold text-neutral-300 leading-tight">—</p>
                    )}
                    <p className="text-[10px] text-body-secondary mt-0.5">표준 납기</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <CompareTable companies={orderedCompanies} completeness={completeness} />

          <footer className="mt-5 rounded-xl border border-border-v04 bg-neutral-50 px-4 py-3 text-xs leading-relaxed text-body-secondary">
            Packlinx는 패키징 업체에 대한 공개 정보를 정리해 제공하는 디렉토리 서비스입니다. 거래·견적 의뢰는 직접 중개하지 않으며, 업체 연락은 각 업체의 공식 채널을 이용해 주세요.
          </footer>
        </main>

        {/* V05 mobile sticky CTA */}
        {(hasWebsiteA || hasWebsiteB) && (
          <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-neutral-200 px-4 py-3 safe-area-pb">
            <div className="flex gap-2.5">
              {hasWebsiteA && (
                <a
                  href={compA.website!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center text-[13px] font-semibold text-white bg-stripe-purple hover:bg-stripe-purple-hover py-3.5 rounded-xl transition-colors"
                >
                  {compA.name} 문의
                </a>
              )}
              {hasWebsiteB && (
                <a
                  href={compB.website!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center text-[13px] font-semibold text-stripe-purple border border-stripe-purple-ring bg-stripe-purple-soft hover:bg-stripe-purple-tint py-3.5 rounded-xl transition-colors"
                >
                  {compB.name} 문의
                </a>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="border-t border-white/[0.06] bg-[#0F172A]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-col gap-2">
                <PacklinxLogo variant="dark" layout="horizontal" />
                <p className="text-[12px] text-slate-400">
                  © 2026 PACKLINX. 업체 정보는 공개 출처에서 자동 수집되었습니다.
                </p>
                <BusinessRegistrationInfo theme="dark" />
              </div>
              <div className="flex flex-wrap gap-4 text-[12px] text-slate-400">
                <Link href="/privacy" className="hover:text-slate-200 transition-colors">개인정보처리방침</Link>
                <Link href="/terms" className="hover:text-slate-200 transition-colors">이용약관</Link>
                <Link href="/opt-out?type=takedown" className="hover:text-slate-200 transition-colors">권리침해 신고</Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
      <CompareCart />
    </>
  )
}
