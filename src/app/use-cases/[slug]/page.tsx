import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { PacklinxLogo } from '@/components/PacklinxLogo'
import { WebsiteFavicon } from '@/components/WebsiteFavicon'
import { simplifyCompanyName } from '@/lib/simplify-company-name'
import {
  INDUSTRY_CATEGORY_LABELS,
  MATERIAL_TYPE_LABELS,
  type MaterialType,
  type UseCaseTag,
} from '@/types'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://packlinx.com'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('use_case_tags')
    .select('seo_slug')
    .not('seo_slug', 'is', null)

  return (data ?? [])
    .filter((row): row is { seo_slug: string } => typeof row.seo_slug === 'string')
    .map((row) => ({ slug: row.seo_slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug: rawSlug } = await params
  const slug = decodeURIComponent(rawSlug)
  const supabase = await createClient()

  const { data: tag } = await supabase
    .from('use_case_tags')
    .select('seo_title, seo_description, seo_slug, label, seo_h1')
    .eq('seo_slug', slug)
    .single()

  if (!tag) return { title: '용도별 포장 업체 찾기 — Packlinx' }

  const title = tag.seo_title ?? `${tag.label} 포장 업체 찾기 — Packlinx`
  const description = tag.seo_description ?? `${tag.label} 전문 포장 업체를 Packlinx에서 찾아보세요.`

  return {
    title,
    description,
    alternates: { canonical: `${siteUrl}/use-cases/${tag.seo_slug}` },
    openGraph: {
      title,
      description,
      url: `${siteUrl}/use-cases/${tag.seo_slug}`,
      siteName: 'Packlinx',
      type: 'website',
    },
  }
}

export default async function UseCaseLandingPage({ params }: Props) {
  const { slug: rawSlug } = await params
  const slug = decodeURIComponent(rawSlug)
  const supabase = await createClient()

  const { data: tag } = await supabase
    .from('use_case_tags')
    .select('id, slug, label, description, parent_industry, seo_title, seo_description, seo_slug, seo_h1, icon, sort_order')
    .eq('seo_slug', slug)
    .single()

  if (!tag) notFound()

  const useCaseTag = tag as UseCaseTag

  const { data: companies } = await supabase
    .from('companies')
    .select('id, slug, name, description, material_type, is_verified, website, icon_url, service_capabilities, founded_year')
    .contains('use_case_tags', [useCaseTag.slug])
    .order('is_verified', { ascending: false })
    .order('name')

  const categoryLabel = INDUSTRY_CATEGORY_LABELS[useCaseTag.parent_industry]
  const categoryPath = `/categories/${useCaseTag.parent_industry}?use-case=${useCaseTag.slug}`

  const pageTitle = useCaseTag.seo_title ?? `${useCaseTag.label} 포장 업체 찾기`
  const pageH1 = useCaseTag.seo_h1 ?? pageTitle
  const pageDescription = useCaseTag.seo_description ?? useCaseTag.description ?? `${useCaseTag.label} 전문 포장 업체를 Packlinx에서 찾아보세요.`

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Packlinx', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: categoryLabel, item: `${siteUrl}/categories/${useCaseTag.parent_industry}` },
      { '@type': 'ListItem', position: 3, name: useCaseTag.label, item: `${siteUrl}/use-cases/${slug}` },
    ],
  }

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: pageTitle,
    description: pageDescription,
    url: `${siteUrl}/use-cases/${slug}`,
    numberOfItems: companies?.length ?? 0,
    itemListElement: (companies ?? []).map((co, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      item: {
        '@type': 'LocalBusiness',
        name: co.name,
        url: `${siteUrl}/companies/${co.slug}`,
      },
    })),
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />

      {/* Header */}
      <header className="bg-white sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <PacklinxLogo variant="light" />
            <span className="hidden sm:inline text-gray-300 text-[11px] font-medium tracking-widest uppercase">전국 패키징 파트너, 한 번에</span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/guides" className="text-gray-500 hover:text-gray-900 text-[13px] font-medium transition-colors">
              가이드
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-[#F8FAFC] bg-dot-grid border-b border-gray-100 pt-12 pb-14 sm:pt-16 sm:pb-18 px-5">
        <div className="max-w-3xl mx-auto">
          <nav className="text-sm text-gray-400 mb-6">
            <Link href="/" className="hover:text-gray-600 transition-colors">홈</Link>
            <span className="mx-2">&rsaquo;</span>
            <Link href={`/categories/${useCaseTag.parent_industry}`} className="hover:text-gray-600 transition-colors">
              {categoryLabel}
            </Link>
            <span className="mx-2">&rsaquo;</span>
            <span className="text-gray-700 font-medium">{useCaseTag.label}</span>
          </nav>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">{useCaseTag.icon}</span>
            <h1 className="text-[32px] sm:text-[42px] font-extrabold text-gray-900 leading-[1.1] tracking-[-0.04em]">
              {pageH1}
            </h1>
          </div>
          {pageDescription && (
            <p className="text-gray-500 text-[16px] leading-relaxed max-w-lg font-normal">
              {pageDescription}
            </p>
          )}
          {companies != null && (
            <p className="text-[13px] text-[#C2410C] font-semibold mt-3">
              {companies.length.toLocaleString()}개 업체
            </p>
          )}
        </div>
      </section>

      {/* Company Grid */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-gray-500">
            <span className="font-semibold text-gray-900">{companies?.length ?? 0}</span>개 업체
          </p>
        </div>

        {companies && companies.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {companies.map((company) => (
              <article
                key={company.id}
                className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-gray-300 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08),0_2px_4px_rgba(0,0,0,0.04)] hover:-translate-y-px transition-all duration-200 group relative"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3.5">
                    <div className="flex flex-wrap gap-1.5">
                      {company.material_type && (
                        <span className="text-[11px] font-medium bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
                          {MATERIAL_TYPE_LABELS[company.material_type as MaterialType]}
                        </span>
                      )}
                    </div>
                  </div>

                  <h2 className="text-base font-bold text-gray-900 mb-1 leading-snug tracking-[-0.02em] line-clamp-1" title={company.name}>
                    <Link
                      href={`/companies/${company.slug}`}
                      className="after:absolute after:inset-0 after:content-['']"
                    >
                      {simplifyCompanyName(company.name)}
                    </Link>
                  </h2>

                  <p className="text-[13px] text-gray-500 leading-relaxed line-clamp-2 mb-3">
                    {company.description ?? ''}
                  </p>

                  {(company.service_capabilities as string[] | null)?.length ? (
                    <div className="mb-3 flex flex-wrap gap-1">
                      {(company.service_capabilities as string[]).slice(0, 3).map((cap, i) => (
                        <span key={i} className="text-[11px] font-medium bg-[#EFF6FF] text-[#2563EB] px-2 py-0.5 rounded">
                          {cap}
                        </span>
                      ))}
                    </div>
                  ) : null}

                  <div className="border-t border-gray-100 pt-3.5 flex items-center justify-between gap-2">
                    {company.website ? (
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="relative z-10 text-[12px] text-gray-400 hover:text-gray-600 flex items-center gap-1.5 transition-colors min-w-0"
                      >
                        <WebsiteFavicon iconUrl={company.icon_url ?? null} className="w-4 h-4" />
                        <span className="truncate max-w-[130px]">
                          {company.website.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}
                        </span>
                      </a>
                    ) : (
                      <span className="text-[12px] text-gray-300">&mdash;</span>
                    )}
                    <span className="text-[11px] text-gray-400 flex-shrink-0">
                      {company.founded_year ? `est. ${company.founded_year}` : ''}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="text-center py-24">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="text-gray-600 font-semibold mb-1.5 text-[15px]">업체를 수집 중입니다</p>
            <p className="text-gray-400 text-sm mb-5">해당 용도의 포장 업체를 지속적으로 확보하고 있습니다.</p>
            <Link href={`/categories/${useCaseTag.parent_industry}`} className="text-sm text-gray-900 font-medium hover:underline underline-offset-4">
              전체 {categoryLabel} 업체 보기 &rarr;
            </Link>
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 pb-8">
        <div className="bg-white border border-gray-200 rounded-xl p-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-[13px] text-gray-400 mb-1">관련 카테고리</p>
            <p className="text-[15px] font-semibold text-gray-900">전체 {categoryLabel} 업체 보기</p>
          </div>
          <Link
            href={categoryPath}
            className="flex-shrink-0 px-5 py-2.5 bg-[#C2410C] text-white text-[13px] font-semibold rounded-lg hover:bg-[#9A3412] transition-colors"
          >
            전체 {categoryLabel} 업체 보기 →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white mt-auto py-8">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-col gap-2">
              <PacklinxLogo variant="light" layout="horizontal" />
              <p className="text-[12px] text-gray-400 leading-relaxed">
                &copy; 2026 PACKLINX. 본 서비스의 업체 정보는 공개된 출처에서 자동 수집되었습니다.<br className="hidden sm:inline" />
                정보 오류·삭제 요청: privacy@pkging.kr
              </p>
            </div>
            <div className="flex gap-5 text-[12px] text-gray-400">
              <Link href="/guides" className="hover:text-gray-600 transition-colors">패키징 가이드</Link>
              <Link href="/privacy" className="hover:text-gray-600 transition-colors">개인정보처리방침</Link>
              <Link href="/terms" className="hover:text-gray-600 transition-colors">이용약관</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
