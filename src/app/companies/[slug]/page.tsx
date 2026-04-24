import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Suspense } from 'react'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { PacklinxLogo } from '@/components/PacklinxLogo'
import { CompanyDetailCTA } from '@/components/CompanyDetailCTA'
import {
  CATEGORY_LABELS,
  TAG_LABELS,
  INDUSTRY_CATEGORY_LABELS,
  INDUSTRY_CATEGORY_ICONS,
  CERTIFICATION_TYPES,
  CERTIFICATION_CATEGORY_LABELS,
  PRINT_METHOD_LABELS,
  PRICE_TIER_LABELS,
  REUSE_MODEL_LABELS,
  type Category,
  type CompanyTag,
  type IndustryCategory,
  type CertificationCategory,
  type Portfolio,
  type PrintMethod,
  type PriceTier,
  type ReuseModel,
} from '@/types'
import { CompanyViewTracker } from './CompanyViewTracker'
import { CompanyIcon } from '@/components/CompanyIcon'
import { CertificationCTABanner } from '@/components/CertificationCTABanner'
import { CertBadge } from '@/components/CertBadge'
import { simplifyCompanyName } from '@/lib/simplify-company-name'

type Props = {
  params: Promise<{ slug: string }>
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://packlinx.com'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug: rawSlug } = await params
  const slug = decodeURIComponent(rawSlug)
  const supabase = await createClient()
  const { data: company } = await supabase
    .from('companies')
    .select('name, description, category')
    .eq('slug', slug)
    .single()

  if (!company) return { title: '업체를 찾을 수 없습니다' }

  const title = `${company.name} — Packlinx`
  const description = company.description ?? `${company.name} 패키징 업체 상세 정보`

  return {
    title,
    description,
    alternates: {
      canonical: `/companies/${slug}`,
    },
    openGraph: {
      title: company.name,
      description,
      url: `${siteUrl}/companies/${slug}`,
      type: 'profile',
    },
    twitter: {
      card: 'summary',
      title: company.name,
      description,
    },
  }
}

const DATA_SOURCE_LABELS: Record<string, string> = {
  naver_local: '출처: 네이버 지역 검색',
  public_data_portal: '출처: 공공데이터 포털',
  website_crawl: '출처: 업체 웹사이트',
}

function resolveCertification(raw: string) {
  const found = CERTIFICATION_TYPES.find(
    (c) => c.id === raw || c.aliases.some((a) => a.toLowerCase() === raw.toLowerCase()),
  )
  return found ?? null
}

export default async function CompanyPage({ params }: Props) {
  const { slug: rawSlug } = await params
  const slug = decodeURIComponent(rawSlug)
  const supabase = await createClient()

  const { data: company } = await supabase
    .from('companies')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!company) notFound()

  const { data: { user } } = await supabase.auth.getUser()
  let isOwner = false
  if (user) {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('company_id')
      .eq('id', user.id)
      .single()
    isOwner = profile?.company_id === company.id
  }

  const { data: portfolios } = await supabase
    .from('company_portfolios')
    .select('id, title, description, image_url, display_order, category_tag')
    .eq('company_id', company.id)
    .order('display_order', { ascending: true })

  const industryCatsForQuery = (company.industry_categories as string[] | null) ?? []
  const primaryCatForRelated = industryCatsForQuery[0] as IndustryCategory | undefined

  const relatedCompaniesData = primaryCatForRelated
    ? await supabase
        .from('companies')
        .select('id, slug, name, description, icon_url, category, industry_categories, is_verified')
        .contains('industry_categories', [primaryCatForRelated])
        .neq('id', company.id)
        .order('is_verified', { ascending: false })
        .order('name')
        .limit(6)
    : { data: null }
  const relatedCompanies = relatedCompaniesData.data ?? []

  const companyJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${siteUrl}/companies/${slug}`,
    name: company.name,
    ...(company.description ? { description: company.description } : {}),
    url: `${siteUrl}/companies/${slug}`,
    ...(company.icon_url ? { image: company.icon_url } : {}),
    ...(company.website && { sameAs: [company.website] }),
    ...(company.founded_year && { foundingDate: String(company.founded_year) }),
  }

  const industryCats = (company.industry_categories as string[] | null) ?? []
  const primaryIndustry = industryCats[0] as IndustryCategory | undefined
  const breadcrumbCategoryName = primaryIndustry
    ? INDUSTRY_CATEGORY_LABELS[primaryIndustry]
    : (CATEGORY_LABELS[company.category as Category] ?? company.category)
  const breadcrumbCategoryUrl = primaryIndustry
    ? `${siteUrl}/categories/${primaryIndustry}`
    : `${siteUrl}/?category=${company.category}`
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Packlinx',
        item: siteUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: breadcrumbCategoryName,
        item: breadcrumbCategoryUrl,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: company.name,
        item: `${siteUrl}/companies/${slug}`,
      },
    ],
  }

  const hasCoreCommerce =
    company.moq_value != null ||
    !!company.min_order_quantity ||
    company.lead_time_standard_days != null ||
    company.lead_time_express_days != null ||
    company.sample_available != null

  const hasAdditionalInfo =
    !!company.founded_year ||
    !!company.print_method ||
    !!company.cold_packaging_available ||
    !!company.price_tier ||
    company.cold_retention_hours != null ||
    company.dry_ice_available != null ||
    !!company.reuse_model ||
    company.spec_sheet_available != null ||
    !!company.seasonal_packaging_available

  const hasServiceCapabilities = company.service_capabilities && company.service_capabilities.length > 0
  const hasKeyClients = company.key_clients && company.key_clients.length > 0
  const hasTargetIndustries = company.target_industries && company.target_industries.length > 0
  const hasTags = company.tags && company.tags.length > 0
  const hasCertifications = company.certifications && company.certifications.length > 0
  const hasPortfolios = portfolios && portfolios.length > 0

  const certItems = hasCertifications
    ? (company.certifications as string[]).map((raw) => ({
        raw,
        resolved: resolveCertification(raw),
      }))
    : []

  const certsByCategory = certItems.reduce<Record<CertificationCategory, typeof certItems>>((acc, item) => {
    const cat = item.resolved?.category ?? 'general'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(item)
    return acc
  }, {} as Record<CertificationCategory, typeof certItems>)

  const moqValue = company.moq_value != null ? Number(company.moq_value).toLocaleString() : null
  const moqUnit = (company.moq_unit as string | null) ?? '개'
  const leadTimeDays = company.lead_time_standard_days ?? company.lead_time_express_days

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''

  function getPortfolioImageUrl(rawUrl: string) {
    if (!rawUrl) return rawUrl
    if (rawUrl.includes('/storage/v1/object/public/')) {
      return `${rawUrl}?width=800&format=webp`
    }
    return rawUrl
  }

  void supabaseUrl

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(companyJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* Track company_view on mount */}
      <Suspense fallback={null}>
        <CompanyViewTracker companyId={company.id} />
      </Suspense>

      {/* Header */}
      <header className="bg-white sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <PacklinxLogo variant="light" />
            <span className="hidden sm:inline text-gray-300 text-[11px] font-medium tracking-widest uppercase">전국 패키징 파트너, 한 번에</span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/blog" className="text-gray-500 hover:text-gray-900 text-[13px] font-medium transition-colors">
              가이드
            </Link>
          </nav>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="max-w-[800px] mx-auto px-4 sm:px-6 pt-5 pb-0">
        <Link href="/" className="text-sm text-[#005EFF] hover:text-[#0047CC] inline-flex items-center gap-1 transition-colors">
          ← 목록으로
        </Link>
      </div>

      <main className="max-w-[800px] mx-auto px-4 sm:px-6 pt-5 pb-20 md:pb-16 space-y-4">
        {/* Company Hero Card */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 sm:p-7 xl:p-10">
          <div className="flex items-start gap-4 mb-6">
            <CompanyIcon
              iconUrl={company.icon_url ?? null}
              name={company.name}
              category={company.category}
              size="lg"
              linkUrl={company.website ?? null}
            />

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <h1 className="text-[28px] font-bold text-gray-900 tracking-[-0.025em] leading-tight">{company.name}</h1>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-gray-100 text-gray-600 text-[11px] font-medium px-2.5 py-1 rounded">
                  {CATEGORY_LABELS[company.category as Category]}
                </span>
                {company.founded_year && (
                  <span className="text-[12px] font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                    {new Date().getFullYear() - (company.founded_year as number)}년 전통
                  </span>
                )}
              </div>
              {/* Inline cert badges — top 3 */}
              {hasCertifications && (
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  {certItems.slice(0, 3).map(({ raw }, i) => (
                    <CertBadge key={i} cert={raw} variant="compact" />
                  ))}
                  {certItems.length > 3 && (
                    <span className="text-[11px] text-gray-400">+{certItems.length - 3}</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Tags */}
          {hasTags && (
            <div className="flex flex-wrap gap-1.5 mb-6">
              {(company.tags as string[]).map((t: string) => (
                <Link
                  key={t}
                  href={`/?tag=${t}`}
                  className="text-[12px] bg-gray-100 text-gray-600 px-2.5 py-1 rounded hover:bg-gray-200 transition-colors"
                >
                  {TAG_LABELS[t as CompanyTag] ?? t}
                </Link>
              ))}
            </div>
          )}

          {/* 1단: 핵심 거래 정보 — MOQ, 납기, 샘플 */}
          {hasCoreCommerce && (
            <div className="mb-4">
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">핵심 거래 정보</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {(company.moq_value != null || company.min_order_quantity) && (
                  <div className="bg-[#0a0f1e]/[0.03] border border-[#0a0f1e]/[0.08] rounded-lg p-3.5 text-center">
                    <p className="text-[10px] font-semibold text-[#0a0f1e]/40 uppercase tracking-wider mb-1">최소주문량</p>
                    {moqValue != null ? (
                      <p className="text-[18px] font-bold text-[#0a0f1e] tracking-tight">
                        {moqValue}<span className="text-[13px] font-medium text-gray-500 ml-0.5">{moqUnit}</span>
                      </p>
                    ) : (
                      <p className="text-[15px] font-bold text-[#0a0f1e] tracking-tight">{company.min_order_quantity}</p>
                    )}
                  </div>
                )}
                {(company.lead_time_standard_days != null || company.lead_time_express_days != null) && (
                  <div className="bg-[#0a0f1e]/[0.03] border border-[#0a0f1e]/[0.08] rounded-lg p-3.5 text-center">
                    <p className="text-[10px] font-semibold text-[#0a0f1e]/40 uppercase tracking-wider mb-1">납기</p>
                    <p className="text-[18px] font-bold text-[#0a0f1e] tracking-tight">
                      {leadTimeDays}<span className="text-[13px] font-medium text-gray-500 ml-0.5">일</span>
                    </p>
                  </div>
                )}
                {company.sample_available != null && (
                  <div className="bg-[#0a0f1e]/[0.03] border border-[#0a0f1e]/[0.08] rounded-lg p-3.5 text-center">
                    <p className="text-[10px] font-semibold text-[#0a0f1e]/40 uppercase tracking-wider mb-1">샘플</p>
                    <p className="text-[16px] font-bold text-[#0a0f1e] tracking-tight">
                      {company.sample_available ? '가능' : '확인 필요'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 2단: 추가 정보 — 설립연도, 인쇄방식, 가격대, 보냉 등 */}
          {hasAdditionalInfo && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6 p-3.5 bg-gray-50 border border-gray-100 rounded-lg">
              {company.founded_year && (
                <div>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">설립연도</p>
                  <p className="text-[13px] font-semibold text-gray-600">{company.founded_year as number}년</p>
                </div>
              )}
              {company.print_method && (
                <div>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">인쇄 방식</p>
                  <p className="text-[13px] font-semibold text-gray-600">
                    {PRINT_METHOD_LABELS[company.print_method as PrintMethod] ?? company.print_method}
                  </p>
                </div>
              )}
              {company.price_tier && (
                <div>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">가격대</p>
                  <p className="text-[13px] font-semibold text-gray-600">
                    {PRICE_TIER_LABELS[company.price_tier as PriceTier]}
                  </p>
                </div>
              )}
              {company.cold_packaging_available && (
                <div>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">특수 포장</p>
                  <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-teal-700 bg-teal-50 border border-teal-200 px-2.5 py-1 rounded">
                    보냉 포장 가능
                  </span>
                </div>
              )}
              {company.cold_retention_hours != null && (
                <div>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">보냉 유지</p>
                  <p className="text-[13px] font-semibold text-gray-600">{company.cold_retention_hours as number}시간</p>
                </div>
              )}
              {company.dry_ice_available != null && (
                <div>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">드라이아이스</p>
                  <span className={`inline-flex items-center gap-1 text-[12px] font-semibold px-2.5 py-1 rounded border ${
                    company.dry_ice_available ? 'text-teal-700 bg-teal-50 border-teal-200' : 'text-gray-500 bg-gray-50 border-gray-200'
                  }`}>
                    {company.dry_ice_available ? '취급 가능' : '미취급'}
                  </span>
                </div>
              )}
              {company.reuse_model && (
                <div>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">박스 재사용</p>
                  <p className="text-[13px] font-semibold text-gray-600">
                    {REUSE_MODEL_LABELS[company.reuse_model as ReuseModel] ?? company.reuse_model}
                  </p>
                </div>
              )}
              {company.spec_sheet_available != null && (
                <div>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">규격서 발행</p>
                  <span className={`inline-flex items-center gap-1 text-[12px] font-semibold px-2.5 py-1 rounded border ${
                    company.spec_sheet_available ? 'text-teal-700 bg-teal-50 border-teal-200' : 'text-gray-500 bg-gray-50 border-gray-200'
                  }`}>
                    {company.spec_sheet_available ? '발행 가능' : '미지원'}
                  </span>
                </div>
              )}
              {company.seasonal_packaging_available && (
                <div>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">계절 대응</p>
                  <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-teal-700 bg-teal-50 border border-teal-200 px-2.5 py-1 rounded">
                    계절별 포장 대응
                  </span>
                </div>
              )}
            </div>
          )}

          {/* CTA — full-width branded buttons */}
          <div className="pt-5 border-t border-gray-100">
            <Suspense fallback={null}>
              <CompanyDetailCTA
                companyId={company.id}
                companyName={company.name}
                website={company.website ?? null}
                iconUrl={company.icon_url ?? null}
                kakaoUrl={(company as Record<string, unknown>).kakao_url as string | null ?? null}
              />
            </Suspense>
          </div>

          {/* Data Source Badge */}
          {company.data_source && DATA_SOURCE_LABELS[company.data_source as string] && (
            <div className="pt-3 mt-1 flex">
              <span className="inline-flex items-center gap-1 text-[11px] text-gray-400 bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-full">
                <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {DATA_SOURCE_LABELS[company.data_source as string]}
              </span>
            </div>
          )}
        </div>

        {/* Company Description — no left border */}
        {company.description && (
          <div className="bg-white border border-gray-200 rounded-xl p-6 sm:p-8">
            <h2 className="text-[14px] font-semibold text-gray-800 mb-3">
              업체 소개
            </h2>
            <div>
              <p className="text-[15px] text-gray-700 leading-[1.8] whitespace-pre-line">
                {company.description}
              </p>
            </div>
          </div>
        )}

        {/* 취급 제품 + 보유 인증 — 하나의 카드로 통합 */}
        {(company.products && (company.products as string[]).length > 0) || hasCertifications || isOwner ? (
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            {/* 취급 제품 */}
            {company.products && (company.products as string[]).length > 0 && (
              <>
                <h2 className="text-[14px] font-semibold text-gray-800 mb-3">취급 제품</h2>
                <div className="flex flex-wrap gap-2 mb-5">
                  {(company.products as string[]).map((product: string, i: number) => (
                    <span
                      key={i}
                      className="text-[12px] font-medium bg-gray-100 text-gray-700 px-3 py-1.5 rounded"
                    >
                      {product}
                    </span>
                  ))}
                </div>
              </>
            )}

            {/* 보유 인증 */}
            {hasCertifications ? (
              <div className={company.products && (company.products as string[]).length > 0 ? 'border-t border-gray-100 pt-5' : ''}>
                <h2 className="text-[14px] font-semibold text-gray-800 mb-3">보유 인증</h2>
                {Object.entries(certsByCategory).map(([cat, items]) => {
                  const catKey = cat as CertificationCategory
                  return (
                    <div key={cat} className="mb-4 last:mb-0">
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">
                        {CERTIFICATION_CATEGORY_LABELS[catKey]}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {items.map(({ raw }, i) => (
                          <CertBadge key={i} cert={raw} variant="full" />
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : isOwner ? (
              <div className={company.products && (company.products as string[]).length > 0 ? 'border-t border-gray-100 pt-5' : ''}>
                <CertificationCTABanner companyId={company.id} />
              </div>
            ) : null}
          </div>
        ) : null}

        {/* Portfolio Gallery */}
        {hasPortfolios && (
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h2 className="text-[14px] font-semibold text-gray-800 mb-3">
              포트폴리오
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {(portfolios as Portfolio[]).map((item) => (
                item.image_url && (
                  <div key={item.id} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 group">
                    <Image
                      src={getPortfolioImageUrl(item.image_url)}
                      alt={item.title || '포트폴리오 이미지'}
                      fill
                      sizes="(max-width: 640px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {item.category_tag && (
                      <div className="absolute top-2 left-2 z-10">
                        <span className="text-[11px] font-semibold text-white bg-black/50 backdrop-blur-sm px-2 py-0.5 rounded">
                          {item.category_tag}
                        </span>
                      </div>
                    )}
                    {item.title && (
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                        <p className="text-white text-[12px] font-medium line-clamp-2">{item.title}</p>
                      </div>
                    )}
                  </div>
                )
              ))}
            </div>
          </div>
        )}

        {/* Service Capabilities — neutral gray */}
        {hasServiceCapabilities && (
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h2 className="text-[14px] font-semibold text-gray-800 mb-3">
              서비스 역량
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(company.service_capabilities as string[]).map((cap: string, i: number) => (
                <div
                  key={i}
                  className="flex items-center gap-2 text-[13px] text-gray-700 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2.5"
                >
                  <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {cap}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Target Industries + Key Clients grid */}
        {(hasTargetIndustries || hasKeyClients) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {hasTargetIndustries && (
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <h2 className="text-[14px] font-semibold text-gray-800 mb-3">
                  주요 납품 산업
                </h2>
                <div className="flex flex-wrap gap-2">
                  {(company.target_industries as string[]).map((ind: string, i: number) => (
                    <span
                      key={i}
                      className="text-[12px] font-medium bg-gray-100 text-gray-500 px-3 py-1.5 rounded"
                    >
                      {ind}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {hasKeyClients && (
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <h2 className="text-[14px] font-semibold text-gray-800 mb-3">
                  주요 납품처
                </h2>
                <div className="flex flex-wrap gap-2">
                  {(company.key_clients as string[]).map((client: string, i: number) => (
                    <span
                      key={i}
                      className="text-[12px] font-medium bg-white text-gray-500 border border-gray-200 px-3 py-1.5 rounded"
                    >
                      {client}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Related Companies — same primary category */}
        {relatedCompanies.length > 0 && primaryCatForRelated && (
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[14px] font-semibold text-gray-800">
                관련 업체
              </h2>
              <Link
                href={`/categories/${primaryCatForRelated}`}
                className="text-[12px] text-[#005EFF] hover:text-[#0047CC] font-medium transition-colors"
              >
                전체 보기 →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {relatedCompanies.map((rel) => (
                <Link
                  key={rel.id}
                  href={`/companies/${rel.slug}`}
                  className="group flex flex-col gap-1.5 p-3 rounded-lg border border-gray-100 hover:border-gray-300 hover:shadow-sm transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <CompanyIcon
                      iconUrl={rel.icon_url ?? null}
                      name={rel.name}
                      category={(rel.industry_categories as string[] | null)?.[0] ?? rel.category}
                      size="sm"
                      linkUrl={null}
                    />
                    <span className="text-[13px] font-semibold text-gray-900 group-hover:text-[#005EFF] transition-colors line-clamp-1">
                      {simplifyCompanyName(rel.name)}
                    </span>
                  </div>
                  {rel.description && (
                    <p className="text-[12px] text-gray-500 leading-relaxed line-clamp-2 pl-0.5">
                      {rel.description}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Category links — same industry category pages */}
        {industryCats.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h2 className="text-[14px] font-semibold text-gray-800 mb-4">
              같은 카테고리의 다른 업체 보기
            </h2>
            <div className="flex flex-wrap gap-2">
              {industryCats.map((cat) => {
                const catKey = cat as IndustryCategory
                const catLabel = INDUSTRY_CATEGORY_LABELS[catKey]
                if (!catLabel) return null
                return (
                  <Link
                    key={cat}
                    href={`/categories/${cat}`}
                    className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#005EFF] bg-[#EBF2FF] hover:bg-[#dbeafe] px-3 py-2 rounded-lg transition-colors"
                  >
                    <span>{INDUSTRY_CATEGORY_ICONS[catKey]}</span>
                    <span>{catLabel} 업체 보기</span>
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        {/* AI Disclaimer */}
        <div className="border-t border-gray-100 pt-5 text-center">
          <p className="text-[12px] text-gray-400 leading-relaxed max-w-lg mx-auto">
            본 업체 정보의 일부(업체 소개, 서비스 역량, 납품 산업, 납품처)는
            공개 자료를 기반으로 AI가 생성한 참고 정보이며, 실제와 다를 수 있습니다.
            정확한 정보는 업체에 직접 문의해주세요.
          </p>
          <div className="mt-2">
            <a
              href={`mailto:privacy@pkging.kr?subject=${encodeURIComponent('업체 정보 수정 요청: ' + company.name)}`}
              className="text-[12px] text-gray-400 hover:text-gray-600 underline underline-offset-2 transition-colors"
            >
              정보 수정 요청 →
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white py-8">
        <div className="max-w-[800px] mx-auto px-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-col gap-2">
              <PacklinxLogo variant="light" layout="horizontal" />
              <p className="text-[12px] text-gray-400">
                © 2026 PACKLINX. 업체 정보는 공개 출처에서 자동 수집되었습니다.
                정보 오류·삭제 요청: privacy@pkging.kr
              </p>
            </div>
            <div className="flex gap-4 text-[12px] text-gray-400">
              <Link href="/privacy" className="hover:text-gray-600 transition-colors">개인정보처리방침</Link>
              <Link href="/terms" className="hover:text-gray-600 transition-colors">이용약관</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
