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

  const { data: reviews } = await supabase
    .from('reviews')
    .select('id, rating, content, created_at')
    .eq('company_id', company.id)
    .order('created_at', { ascending: false })
    .limit(10)

  const { data: portfolios } = await supabase
    .from('company_portfolios')
    .select('id, title, description, image_url, display_order, category_tag')
    .eq('company_id', company.id)
    .order('display_order', { ascending: true })

  const avgRating =
    reviews && reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : null

  // Rating distribution (5 → 1)
  const ratingDist: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  if (reviews) {
    for (const r of reviews) {
      if (r.rating >= 1 && r.rating <= 5) ratingDist[r.rating]++
    }
  }
  const maxDist = Math.max(...Object.values(ratingDist), 1)

  const companyJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: company.name,
    description: company.description ?? '',
    url: `${siteUrl}/companies/${slug}`,
    ...(company.website && { sameAs: [company.website] }),
    ...(company.founded_year && { foundingDate: String(company.founded_year) }),
    ...(avgRating && { aggregateRating: { '@type': 'AggregateRating', ratingValue: avgRating, reviewCount: reviews?.length ?? 0 } }),
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

  const hasExpandedInfo = company.founded_year || company.min_order_quantity || company.moq_value != null || company.lead_time_standard_days != null || company.print_method || company.sample_available != null || company.cold_packaging_available || company.price_tier || company.cold_retention_hours != null || company.dry_ice_available != null || company.reuse_model || company.spec_sheet_available != null || company.seasonal_packaging_available
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

  // Group certs by category for display
  const certsByCategory = certItems.reduce<Record<CertificationCategory, typeof certItems>>((acc, item) => {
    const cat = item.resolved?.category ?? 'general'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(item)
    return acc
  }, {} as Record<CertificationCategory, typeof certItems>)

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''

  function getPortfolioImageUrl(rawUrl: string) {
    if (!rawUrl) return rawUrl
    // Apply Supabase image transform for webp conversion
    if (rawUrl.includes('/storage/v1/object/public/')) {
      return `${rawUrl}?width=800&format=webp`
    }
    return rawUrl
  }

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
        <div className="bg-white border border-gray-200 rounded-xl p-6 sm:p-10">
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
                  <span className="text-[12px] text-gray-400">est. {company.founded_year}</span>
                )}
                {avgRating && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-gray-900">{avgRating}</span>
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(n => (
                        <div key={n} className={`w-2.5 h-2.5 rounded-sm ${n <= Math.round(Number(avgRating)) ? 'bg-amber-400' : 'bg-gray-200'}`} />
                      ))}
                    </div>
                    <span className="text-[12px] text-gray-400">{reviews?.length}개 리뷰</span>
                  </div>
                )}
              </div>
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

          {/* Expanded Info Grid */}
          {hasExpandedInfo && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 border border-gray-100 rounded-lg">
              {company.founded_year && (
                <div>
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">설립연도</p>
                  <p className="text-[14px] font-semibold text-gray-700">{company.founded_year}년</p>
                </div>
              )}
              {(company.moq_value != null || company.min_order_quantity) && (
                <div>
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">최소 주문량 (MOQ)</p>
                  <p className="text-[14px] font-semibold text-gray-700">
                    {company.moq_value != null
                      ? `${Number(company.moq_value).toLocaleString()} ${company.moq_unit ?? '개'}`
                      : company.min_order_quantity
                    }
                  </p>
                </div>
              )}
              {(company.lead_time_standard_days != null || company.lead_time_express_days != null) && (
                <div>
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">납기</p>
                  <p className="text-[14px] font-semibold text-gray-700">
                    {company.lead_time_standard_days != null && company.lead_time_express_days != null
                      ? `기본 ${company.lead_time_standard_days}일 / 급행 ${company.lead_time_express_days}일`
                      : company.lead_time_standard_days != null
                        ? `기본 ${company.lead_time_standard_days}일`
                        : `급행 ${company.lead_time_express_days}일`
                    }
                  </p>
                </div>
              )}
              {company.print_method && (
                <div>
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">인쇄 방식</p>
                  <p className="text-[14px] font-semibold text-gray-700">
                    {PRINT_METHOD_LABELS[company.print_method as PrintMethod] ?? company.print_method}
                  </p>
                </div>
              )}
              {company.sample_available != null && (
                <div>
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">샘플</p>
                  <p className="text-[14px] font-semibold text-gray-700">
                    {company.sample_available
                      ? `샘플 가능${company.sample_cost ? ` (${company.sample_cost})` : ''}`
                      : '확인 필요'
                    }
                  </p>
                </div>
              )}
              {company.cold_packaging_available && (
                <div>
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">특수 포장</p>
                  <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-teal-700 bg-teal-50 border border-teal-200 px-2.5 py-1 rounded">
                    보냉 포장 가능
                  </span>
                </div>
              )}
              {company.price_tier && (
                <div>
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">가격대</p>
                  <p className="text-[14px] font-semibold text-gray-700">
                    {PRICE_TIER_LABELS[company.price_tier as PriceTier]}
                  </p>
                </div>
              )}
              {company.cold_retention_hours != null && (
                <div>
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">보냉 유지</p>
                  <p className="text-[14px] font-semibold text-gray-700">{company.cold_retention_hours}시간</p>
                </div>
              )}
              {company.dry_ice_available != null && (
                <div>
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">드라이아이스</p>
                  <span className={`inline-flex items-center gap-1 text-[13px] font-semibold px-2.5 py-1 rounded border ${
                    company.dry_ice_available ? 'text-teal-700 bg-teal-50 border-teal-200' : 'text-gray-500 bg-gray-50 border-gray-200'
                  }`}>
                    {company.dry_ice_available ? '취급 가능' : '미취급'}
                  </span>
                </div>
              )}
              {company.reuse_model && (
                <div>
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">박스 재사용</p>
                  <p className="text-[14px] font-semibold text-gray-700">
                    {REUSE_MODEL_LABELS[company.reuse_model as ReuseModel] ?? company.reuse_model}
                  </p>
                </div>
              )}
              {company.spec_sheet_available != null && (
                <div>
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">규격서 발행</p>
                  <span className={`inline-flex items-center gap-1 text-[13px] font-semibold px-2.5 py-1 rounded border ${
                    company.spec_sheet_available ? 'text-teal-700 bg-teal-50 border-teal-200' : 'text-gray-500 bg-gray-50 border-gray-200'
                  }`}>
                    {company.spec_sheet_available ? '발행 가능' : '미지원'}
                  </span>
                </div>
              )}
              {company.seasonal_packaging_available && (
                <div>
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">계절 대응</p>
                  <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-teal-700 bg-teal-50 border border-teal-200 px-2.5 py-1 rounded">
                    계절별 포장 대응
                  </span>
                </div>
              )}
            </div>
          )}

          {/* CTA */}
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

        {/* Company Description */}
        {company.description && (
          <div className="bg-white border border-gray-200 rounded-xl p-6 sm:p-8">
            <h2 className="text-[13px] font-semibold text-gray-700 uppercase tracking-wider mb-4">
              업체 소개
            </h2>
            <div className="border-l-2 border-[#005EFF]/20 pl-5">
              <p className="text-[15px] text-gray-700 leading-[1.8] whitespace-pre-line">
                {company.description}
              </p>
            </div>
          </div>
        )}

        {/* Products section */}
        {company.products && company.products.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h2 className="text-[13px] font-semibold text-gray-700 uppercase tracking-wider mb-3">
              취급 제품
            </h2>
            <div className="flex flex-wrap gap-2">
              {company.products.map((product: string, i: number) => (
                <span
                  key={i}
                  className="text-[12px] font-medium bg-gray-100 text-gray-700 px-3 py-1.5 rounded"
                >
                  {product}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Certifications — badge UI with category color coding */}
        {hasCertifications ? (
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h2 className="text-[13px] font-semibold text-gray-700 uppercase tracking-wider mb-4">
              보유 인증
            </h2>
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
          <CertificationCTABanner companyId={company.id} />
        ) : null}

        {/* Portfolio Gallery */}
        {hasPortfolios && (
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h2 className="text-[13px] font-semibold text-gray-700 uppercase tracking-wider mb-4">
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

        {/* Service Capabilities */}
        {hasServiceCapabilities && (
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h2 className="text-[13px] font-semibold text-gray-700 uppercase tracking-wider mb-4">
              서비스 역량
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(company.service_capabilities as string[]).map((cap: string, i: number) => (
                <div
                  key={i}
                  className="flex items-center gap-2 text-[13px] text-[#005EFF] bg-[#EBF2FF] rounded-lg px-3 py-2.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#005EFF] flex-shrink-0" />
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
                <h2 className="text-[13px] font-semibold text-gray-700 uppercase tracking-wider mb-3">
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
                <h2 className="text-[13px] font-semibold text-gray-700 uppercase tracking-wider mb-3">
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

        {/* Reviews */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[13px] font-semibold text-gray-700 uppercase tracking-wider">
              바이어 리뷰
            </h2>
            {avgRating && (
              <div className="flex items-center gap-2">
                <span className="text-[28px] font-extrabold text-gray-900 tracking-[-0.03em]">{avgRating}</span>
                <div>
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map(n => (
                      <div key={n} className={`w-3 h-3 rounded-sm ${n <= Math.round(Number(avgRating)) ? 'bg-amber-400' : 'bg-gray-200'}`} />
                    ))}
                  </div>
                  <div className="text-[12px] text-gray-400 mt-0.5">{reviews?.length}개 리뷰</div>
                </div>
              </div>
            )}
          </div>

          {/* Rating distribution histogram */}
          {reviews && reviews.length > 0 && (
            <div className="mb-5 space-y-1.5">
              {[5, 4, 3, 2, 1].map((star) => (
                <div key={star} className="flex items-center gap-2">
                  <span className="text-[11px] text-gray-400 w-4 text-right flex-shrink-0">{star}</span>
                  <svg className="w-3 h-3 text-amber-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full"
                      style={{ width: `${(ratingDist[star] / maxDist) * 100}%` }}
                    />
                  </div>
                  <span className="text-[11px] text-gray-400 w-4 flex-shrink-0">{ratingDist[star]}</span>
                </div>
              ))}
            </div>
          )}

          {reviews && reviews.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {reviews.map((review) => (
                <div key={review.id} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(n => (
                        <div key={n} className={`w-2.5 h-2.5 rounded-sm ${n <= review.rating ? 'bg-amber-400' : 'bg-gray-200'}`} />
                      ))}
                    </div>
                    <span className="text-[12px] text-gray-400">
                      {new Date(review.created_at).toLocaleDateString('ko-KR')}
                    </span>
                  </div>
                  {review.content && (
                    <p className="text-[13px] text-gray-600 leading-relaxed">{review.content}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <p className="text-[13px] text-gray-400">아직 리뷰가 없습니다.</p>
            </div>
          )}
        </div>

        {/* Related Categories */}
        {industryCats.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h2 className="text-[13px] font-semibold text-gray-700 uppercase tracking-wider mb-4">
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
