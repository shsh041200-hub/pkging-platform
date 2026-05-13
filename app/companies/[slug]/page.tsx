import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Suspense } from 'react'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { PacklinxLogo } from '@/components/PacklinxLogo'
import { SiteHeader } from '@/components/SiteHeader'
import { CompanyDetailCTA } from '@/components/CompanyDetailCTA'
import { BusinessRegistrationInfo } from '@/components/BusinessRegistrationInfo'
import {
  CATEGORY_LABELS,
  INDUSTRY_CATEGORY_LABELS,
  INDUSTRY_CATEGORY_ICONS,
  CERTIFICATION_TYPES,
  CERTIFICATION_CATEGORY_LABELS,
  PRINT_METHOD_LABELS,
  PRICE_TIER_LABELS,
  REUSE_MODEL_LABELS,
  type Category,
  type IndustryCategory,
  type CertificationCategory,
  type Portfolio,
  type PrintMethod,
  type PriceTier,
  type ReuseModel,
} from '@/types'
import { CompanyViewTracker } from './CompanyViewTracker'
import { OwnerControls } from './OwnerControls'
import { CompanyIcon } from '@/components/CompanyIcon'
import { CertBadge } from '@/components/CertBadge'
import { VerificationRevokedBanner } from '@/components/VerificationRevokedBanner'
import { simplifyCompanyName } from '@/lib/simplify-company-name'
import AddToCompareButton from '@/app/components/AddToCompareButton'
import CompareCart from '@/app/components/CompareCart'
import { VerifiedTooltip } from '@/components/VerifiedTooltip'
import { VendorDirectoryDisclaimer } from '@/components/VendorDirectoryDisclaimer'

type Props = {
  params: Promise<{ slug: string }>
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.packlinx.com'

// PACAA-248: Reverted PACAA-228 ISR to fix Korean-slug 500 errors.
// ISR + non-ASCII path segments causes Next.js cache-key collisions → 500.
// Page is now fully dynamic; OwnerControls client-side fetch pattern retained.

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug: rawSlug } = await params
  const slug = decodeURIComponent(rawSlug)
  const supabase = await createClient()
  const { data: company } = await supabase
    .from('companies')
    .select('name, description, category, phone, products, founded_year')
    .eq('slug', slug)
    .eq('is_hidden', false)
    .single()

  if (!company) return { title: '업체를 찾을 수 없습니다' }

  const title = company.name
  const categoryLabel = CATEGORY_LABELS[company.category as Category] ?? company.category
  const productList = Array.isArray(company.products) && (company.products as string[]).length > 0
    ? (company.products as string[]).slice(0, 3).join(', ')
    : null
  const descParts: string[] = [`${categoryLabel} 패키징 전문`]
  if (productList) descParts.push(`취급: ${productList}`)
  if (company.founded_year) descParts.push(`설립 ${company.founded_year as number}년`)
  if (company.phone) descParts.push(company.phone as string)
  const description = `${company.name} — ${descParts.join(' · ')}`

  return {
    title,
    description,
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

// Related guides by industry category (static mapping)
const RELATED_GUIDES: Record<string, Array<{ slug: string; title: string; icon: string }>> = {
  'food-beverage': [
    { slug: 'food-packaging-materials', title: '식품 포장재 소재 선택 가이드', icon: '🥡' },
    { slug: 'eco-friendly-packaging', title: '친환경 포장재 전환 가이드', icon: '🌿' },
    { slug: 'flexible-packaging-guide', title: '연포장재 완전 가이드', icon: '📦' },
  ],
  'ecommerce-shipping': [
    { slug: 'small-quantity-custom-box', title: '소량 맞춤 박스 제작 가이드', icon: '📦' },
    { slug: 'corrugated-box-supplier-selection', title: '골판지 박스 업체 선정 가이드', icon: '🏭' },
    { slug: 'shipping-box-pricing', title: '택배박스 가격 비교 가이드', icon: '💰' },
  ],
  'cosmetics-beauty': [
    { slug: 'cosmetic-packaging-box', title: '화장품 패키징 박스 가이드', icon: '💄' },
    { slug: 'flexible-packaging-guide', title: '연포장재 완전 가이드', icon: '📦' },
    { slug: 'label-printing-guide', title: '라벨 인쇄 완전 가이드', icon: '🖨️' },
  ],
  'pharma-health': [
    { slug: 'packaging-material-complete-guide', title: '포장재 소재 완전 가이드', icon: '📋' },
    { slug: 'label-printing-guide', title: '라벨 인쇄 완전 가이드', icon: '🖨️' },
    { slug: 'plastic-container-guide', title: '플라스틱 용기 선택 가이드', icon: '🧴' },
  ],
  'electronics-industrial': [
    { slug: 'electronics-packaging-design', title: '전자제품 포장 설계 가이드', icon: '⚡' },
    { slug: 'packaging-tape-comparison', title: '포장 테이프 비교 가이드', icon: '🔧' },
    { slug: 'packaging-material-complete-guide', title: '포장재 소재 완전 가이드', icon: '📋' },
  ],
}

function resolveCertification(raw: string) {
  return CERTIFICATION_TYPES.find(
    (c) => c.id === raw || c.aliases.some((a) => a.toLowerCase() === raw.toLowerCase()),
  ) ?? null
}

function getPortfolioImageUrl(rawUrl: string) {
  if (!rawUrl) return rawUrl
  if (rawUrl.includes('/storage/v1/object/public/')) return `${rawUrl}?width=800&format=webp`
  return rawUrl
}

export default async function CompanyPage({ params }: Props) {
  const { slug: rawSlug } = await params
  const slug = decodeURIComponent(rawSlug)
  const supabase = await createClient()

  const { data: company } = await supabase
    .from('companies')
    .select('*')
    .eq('slug', slug)
    .eq('is_hidden', false)
    .single()

  if (!company) notFound()

  const [portfoliosResult, similarCompaniesResult] = await Promise.all([
    supabase
      .from('company_portfolios')
      .select('id, title, description, image_url, display_order, category_tag')
      .eq('company_id', company.id)
      .order('display_order', { ascending: true }),
    supabase.rpc('get_similar_companies', {
      target_company_id: company.id,
      result_limit: 6,
    }),
  ])

  const portfolios = portfoliosResult.data
  const similarCompanies = (similarCompaniesResult.data ?? []) as Array<{
    id: string; slug: string; name: string; description: string | null;
    icon_url: string | null; category: string; industry_categories: string[];
    is_verified: boolean; similarity_score: number;
  }>

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
    ...(company.phone && { telephone: company.phone }),
    ...(company.email && { email: company.email }),
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

  const hasWebsite = !!company.website
  const hasPhone = !!company.phone
  const hasEmail = !!company.email
  const hasAnyContact = hasWebsite || hasPhone || hasEmail

  const relatedGuides = primaryIndustry ? (RELATED_GUIDES[primaryIndustry] ?? []) : []

  const rawCanonical = `${siteUrl}/companies/${slug}`

  return (
    <>
      {/* raw UTF-8 canonical — Next metadata API re-encodes Korean; JSX href passes through verbatim */}
      <link rel="canonical" href={rawCanonical} />
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

      <div className="min-h-screen bg-neutral-50">
        <SiteHeader />

        {/* LC §5-B 박탈 배너 — is_verified=false AND reason=audit_2026Q2_evidence_missing 인 경우만 표시 (PACAA-532) */}
        {company.is_verified === false && company.verification_revoked_reason === 'audit_2026Q2_evidence_missing' && (
          <VerificationRevokedBanner
            slug={slug}
            companyId={company.id}
            revokedAt={company.verification_revoked_at}
            reason={company.verification_revoked_reason}
          />
        )}

        {/* Breadcrumb — V1: Packlinx › {category} › {company} with chevron separators */}
        <div className="max-w-[800px] mx-auto px-4 sm:px-6 pt-5 pb-0">
          <div className="flex items-center gap-2 text-sm text-body-secondary">
            <Link href="/" className="text-stripe-purple hover:text-stripe-purple-hover transition-colors">Packlinx</Link>
            <span className="text-neutral-300">›</span>
            {primaryIndustry && (
              <>
                <Link
                  href={`/categories/${primaryIndustry}`}
                  className="text-stripe-purple hover:text-stripe-purple-hover transition-colors"
                >
                  {INDUSTRY_CATEGORY_LABELS[primaryIndustry]}
                </Link>
                <span className="text-neutral-300">›</span>
              </>
            )}
            <span className="text-neutral-400 truncate max-w-[200px]">{company.name}</span>
          </div>
        </div>

        <main className="max-w-[800px] mx-auto px-4 sm:px-6 pt-4 pb-28 md:pb-16 space-y-4">

          {/* ═══ HERO CARD — V1 redesign ═══
              1. CTA 버튼을 hero 상단 오른쪽으로 (모바일 fold 위로)
              2. Stats row를 identity 아래 별도 섹션으로 분리해 스캔 쉽게
              3. trust signal (data source, verification) hero 내 하단에 compact하게
          */}
          <div className="bg-white border border-border-v04 rounded-xl overflow-hidden" style={{ boxShadow: 'var(--shadow-elevated-v04)' }}>
            <div className="p-5 sm:p-7">
              <div className="flex items-start justify-between gap-3 mb-4">
                {/* Left: icon + name + badges */}
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <CompanyIcon
                    iconUrl={company.icon_url ?? null}
                    name={company.name}
                    category={company.category}
                    size="lg"
                    linkUrl={company.website ?? null}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <h1 className="text-[22px] sm:text-[26px] heading-display text-heading-deep-navy tracking-[-0.02em] leading-tight">
                        {company.name}
                      </h1>
                      <AddToCompareButton slug={slug} name={company.name} />
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] font-semibold text-body-secondary bg-neutral-100 px-2 py-0.5 rounded">
                        {CATEGORY_LABELS[company.category as Category]}
                      </span>
                      {company.founded_year && (
                        <span className="text-[11px] font-medium text-body-secondary bg-neutral-100 px-2 py-0.5 rounded">
                          {new Date().getFullYear() - (company.founded_year as number)}년 전통
                        </span>
                      )}
                      {company.is_verified && <VerifiedTooltip />}
                    </div>
                    {/* Cert badges — inline, top 3 */}
                    {hasCertifications && (
                      <div className="flex flex-wrap items-center gap-1 mt-2">
                        {certItems.slice(0, 3).map(({ raw }, i) => (
                          <CertBadge key={i} cert={raw} variant="compact" />
                        ))}
                        {certItems.length > 3 && (
                          <span className="text-[11px] text-neutral-400">+{certItems.length - 3}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: primary CTA (desktop only) — 모바일은 sticky bottom bar 사용 */}
                {hasAnyContact && (
                  <div className="hidden sm:flex flex-col gap-2 shrink-0">
                    {hasWebsite && (
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 text-[13px] font-semibold text-white bg-stripe-purple hover:bg-stripe-purple-hover px-4 py-2.5 rounded-lg transition-colors whitespace-nowrap"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        웹사이트 방문
                      </a>
                    )}
                    {hasPhone && (
                      <a
                        href={`tel:${company.phone}`}
                        className="inline-flex items-center justify-center gap-1.5 text-[13px] font-semibold text-stripe-purple border border-stripe-purple-ring bg-stripe-purple-soft hover:bg-stripe-purple-tint px-4 py-2.5 rounded-lg transition-colors whitespace-nowrap"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        {company.phone}
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* Core commerce stats — brand-50 scan-friendly row */}
              {hasCoreCommerce && (
                <div className="grid grid-cols-3 gap-2.5 mb-4">
                  {(company.moq_value != null || company.min_order_quantity) && (
                    <div className="bg-brand-50 border border-brand-100 rounded-lg p-3 text-center">
                      <p className="text-[9px] font-semibold text-brand-700 uppercase tracking-widest mb-1">최소주문</p>
                      {moqValue != null ? (
                        <p className="text-[16px] font-bold text-heading-deep-navy tracking-tight leading-tight">
                          {moqValue}<span className="text-[11px] font-medium text-body-secondary ml-0.5">{moqUnit}</span>
                        </p>
                      ) : (
                        <p className="text-[14px] font-bold text-heading-deep-navy tracking-tight">{company.min_order_quantity}</p>
                      )}
                    </div>
                  )}
                  {(company.lead_time_standard_days != null || company.lead_time_express_days != null) && (
                    <div className="bg-brand-50 border border-brand-100 rounded-lg p-3 text-center">
                      <p className="text-[9px] font-semibold text-brand-700 uppercase tracking-widest mb-1">납기</p>
                      <p className="text-[16px] font-bold text-heading-deep-navy tracking-tight leading-tight">
                        {leadTimeDays}<span className="text-[11px] font-medium text-body-secondary ml-0.5">일</span>
                      </p>
                    </div>
                  )}
                  {company.sample_available != null && (
                    <div className="bg-brand-50 border border-brand-100 rounded-lg p-3 text-center">
                      <p className="text-[9px] font-semibold text-brand-700 uppercase tracking-widest mb-1">샘플</p>
                      <p className={`text-[13px] font-bold tracking-tight leading-tight ${company.sample_available ? 'text-emerald-700' : 'text-body-secondary'}`}>
                        {company.sample_available ? '가능' : '확인 필요'}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Additional info — compact inline grid */}
              {hasAdditionalInfo && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-4 p-3.5 bg-neutral-50 border border-neutral-100 rounded-lg">
                  {company.print_method && (
                    <div>
                      <p className="text-[9px] font-semibold text-neutral-400 uppercase tracking-wider mb-0.5">인쇄 방식</p>
                      <p className="text-[12px] font-semibold text-neutral-700">
                        {PRINT_METHOD_LABELS[company.print_method as PrintMethod] ?? company.print_method}
                      </p>
                    </div>
                  )}
                  {company.price_tier && (
                    <div>
                      <p className="text-[9px] font-semibold text-neutral-400 uppercase tracking-wider mb-0.5">가격대</p>
                      <p className="text-[12px] font-semibold text-neutral-700">
                        {PRICE_TIER_LABELS[company.price_tier as PriceTier]}
                      </p>
                    </div>
                  )}
                  {company.cold_packaging_available && (
                    <div>
                      <p className="text-[9px] font-semibold text-neutral-400 uppercase tracking-wider mb-0.5">특수 포장</p>
                      <span className="text-[11px] font-semibold text-teal-700">보냉 포장 가능</span>
                    </div>
                  )}
                  {company.cold_retention_hours != null && (
                    <div>
                      <p className="text-[9px] font-semibold text-neutral-400 uppercase tracking-wider mb-0.5">보냉 유지</p>
                      <p className="text-[12px] font-semibold text-neutral-700">{company.cold_retention_hours as number}시간</p>
                    </div>
                  )}
                  {company.dry_ice_available != null && (
                    <div>
                      <p className="text-[9px] font-semibold text-neutral-400 uppercase tracking-wider mb-0.5">드라이아이스</p>
                      <span className={`text-[11px] font-semibold ${company.dry_ice_available ? 'text-teal-700' : 'text-body-secondary'}`}>
                        {company.dry_ice_available ? '취급 가능' : '미취급'}
                      </span>
                    </div>
                  )}
                  {company.reuse_model && (
                    <div>
                      <p className="text-[9px] font-semibold text-neutral-400 uppercase tracking-wider mb-0.5">박스 재사용</p>
                      <p className="text-[12px] font-semibold text-neutral-700">
                        {REUSE_MODEL_LABELS[company.reuse_model as ReuseModel] ?? company.reuse_model}
                      </p>
                    </div>
                  )}
                  {company.spec_sheet_available != null && (
                    <div>
                      <p className="text-[9px] font-semibold text-neutral-400 uppercase tracking-wider mb-0.5">규격서</p>
                      <span className={`text-[11px] font-semibold ${company.spec_sheet_available ? 'text-teal-700' : 'text-body-secondary'}`}>
                        {company.spec_sheet_available ? '발행 가능' : '미지원'}
                      </span>
                    </div>
                  )}
                  {company.seasonal_packaging_available && (
                    <div>
                      <p className="text-[9px] font-semibold text-neutral-400 uppercase tracking-wider mb-0.5">계절 대응</p>
                      <span className="text-[11px] font-semibold text-teal-700">계절별 포장</span>
                    </div>
                  )}
                </div>
              )}

              {/* Trust signal — data source + verification */}
              <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-neutral-100">
                {company.data_source && DATA_SOURCE_LABELS[company.data_source as string] && (
                  <span className="inline-flex items-center gap-1.5 text-[11px] text-body-secondary bg-neutral-50 border border-neutral-100 px-2.5 py-1 rounded-full">
                    <svg className="w-3 h-3 shrink-0 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {DATA_SOURCE_LABELS[company.data_source as string]}
                  </span>
                )}
                {company.is_verified && company.verified_at && (
                  <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full">
                    <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Packlinx 검증 완료 · {new Date(company.verified_at).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' })}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* ═══ CONTACT CARD — V1: 연락처를 별도 카드로 분리 ═══ */}
          {hasAnyContact && (
            <div className="bg-white border border-border-v04 rounded-xl p-5">
              <h2 className="text-[13px] font-semibold text-heading-deep-navy mb-3">연락처</h2>
              <Suspense fallback={null}>
                <CompanyDetailCTA
                  companyId={company.id}
                  companyName={company.name}
                  website={company.website ?? null}
                  iconUrl={company.icon_url ?? null}
                  kakaoUrl={null}
                  phone={company.phone ?? null}
                  email={company.email ?? null}
                />
              </Suspense>
            </div>
          )}

          {/* Company Description */}
          {company.description && (
            <div className="bg-white border border-border-v04 rounded-xl p-5 sm:p-7">
              <h2 className="text-[13px] font-semibold text-heading-deep-navy mb-3">업체 소개</h2>
              <p className="text-[14px] text-body-secondary leading-[1.9] whitespace-pre-line">
                {company.description}
              </p>
            </div>
          )}

          {/* Products + Certifications — combined card */}
          {((company.products && (company.products as string[]).length > 0) || hasCertifications) ? (
            <div className="bg-white border border-border-v04 rounded-xl p-5">
              {company.products && (company.products as string[]).length > 0 && (
                <div className={hasCertifications ? 'mb-5 pb-5 border-b border-neutral-100' : ''}>
                  <h2 className="text-[13px] font-semibold text-heading-deep-navy mb-3">취급 제품</h2>
                  <div className="flex flex-wrap gap-2">
                    {(company.products as string[]).map((product: string, i: number) => (
                      <span key={i} className="text-[12px] font-medium bg-neutral-100 text-neutral-700 px-3 py-1.5 rounded">
                        {product}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {hasCertifications ? (
                <div>
                  <h2 className="text-[13px] font-semibold text-heading-deep-navy mb-3">보유 인증</h2>
                  {Object.entries(certsByCategory).map(([cat, items]) => (
                    <div key={cat} className="mb-4 last:mb-0">
                      <p className="text-[9px] font-semibold text-neutral-400 uppercase tracking-widest mb-2">
                        {CERTIFICATION_CATEGORY_LABELS[cat as CertificationCategory]}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {items.map(({ raw }, i) => (
                          <CertBadge key={i} cert={raw} variant="full" />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <OwnerControls
                  companyId={company.id}
                  slug={slug}
                  variant={{
                    kind: 'cert-cta',
                    withTopBorder: !!(company.products && (company.products as string[]).length > 0),
                  }}
                />
              )}
            </div>
          ) : (
            <OwnerControls
              companyId={company.id}
              slug={slug}
              variant={{ kind: 'cert-cta', withTopBorder: false, standaloneCard: true }}
            />
          )}

          {/* Portfolio Gallery */}
          {hasPortfolios && (
            <div className="bg-white border border-border-v04 rounded-xl p-5">
              <h2 className="text-[13px] font-semibold text-heading-deep-navy mb-3">포트폴리오</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {(portfolios as Portfolio[]).map((item) => (
                  item.image_url && (
                    <div key={item.id} className="relative aspect-square rounded-lg overflow-hidden bg-neutral-100 group">
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
            <div className="bg-white border border-border-v04 rounded-xl p-5">
              <h2 className="text-[13px] font-semibold text-heading-deep-navy mb-3">서비스 역량</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {(company.service_capabilities as string[]).map((cap: string, i: number) => (
                  <div key={i} className="flex items-center gap-2 text-[12px] text-neutral-700 bg-neutral-50 border border-neutral-100 rounded-lg px-3 py-2.5">
                    <svg className="w-3.5 h-3.5 text-stripe-purple shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {cap}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Target Industries + Key Clients */}
          {(hasTargetIndustries || hasKeyClients) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {hasTargetIndustries && (
                <div className="bg-white border border-border-v04 rounded-xl p-5">
                  <h2 className="text-[13px] font-semibold text-heading-deep-navy mb-3">주요 납품 산업</h2>
                  <div className="flex flex-wrap gap-2">
                    {(company.target_industries as string[]).map((ind: string, i: number) => (
                      <span key={i} className="text-[12px] font-medium bg-neutral-100 text-neutral-500 px-3 py-1.5 rounded">
                        {ind}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {hasKeyClients && (
                <div className="bg-white border border-border-v04 rounded-xl p-5">
                  <h2 className="text-[13px] font-semibold text-heading-deep-navy mb-3">주요 납품처</h2>
                  <div className="flex flex-wrap gap-2">
                    {(company.key_clients as string[]).map((client: string, i: number) => (
                      <span key={i} className="text-[12px] font-medium bg-white text-neutral-500 border border-border-v04 px-3 py-1.5 rounded">
                        {client}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Similar Companies */}
          {!!company.similar_optout_at && (
            <OwnerControls
              companyId={company.id}
              slug={slug}
              variant={{ kind: 'similar-optout-on' }}
            />
          )}
          {!company.similar_optout_at && similarCompanies.length > 0 && (
            <div className="bg-white border border-border-v04 rounded-xl p-5">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-[13px] font-semibold text-heading-deep-navy">비슷한 업체</h2>
                <div className="flex items-center gap-3">
                  <OwnerControls
                    companyId={company.id}
                    slug={slug}
                    variant={{ kind: 'similar-optout-off' }}
                  />
                  {industryCats[0] && (
                    <Link
                      href={`/categories/${industryCats[0]}`}
                      className="text-[12px] text-stripe-purple hover:text-stripe-purple-hover font-medium transition-colors inline-flex items-center gap-1"
                    >
                      전체 보기
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  )}
                </div>
              </div>
              <p className="text-[11px] text-neutral-400 mb-3">
                ※ 같은 산업카테고리 기준 자동 노출 · Packlinx의 추천·인증을 의미하지 않음
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {similarCompanies.map((rel) => (
                  <Link
                    key={rel.id}
                    href={`/companies/${rel.slug}`}
                    className="group flex items-center gap-2.5 p-3 rounded-lg border border-neutral-100 hover:border-stripe-purple-ring hover:bg-stripe-purple-soft transition-all"
                  >
                    <CompanyIcon
                      iconUrl={rel.icon_url ?? null}
                      name={rel.name}
                      category={rel.industry_categories?.[0] ?? rel.category}
                      size="sm"
                      linkUrl={null}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-semibold text-neutral-900 group-hover:text-stripe-purple transition-colors line-clamp-1">
                        {simplifyCompanyName(rel.name)}
                      </p>
                      {rel.description && (
                        <p className="text-[11px] text-neutral-400 line-clamp-1 mt-0.5">{rel.description}</p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* ═══ RELATED GUIDES — V1 신규: 구매자 다음 행동으로 가이드 노출 ═══ */}
          {relatedGuides.length > 0 && (
            <div className="bg-white border border-border-v04 rounded-xl p-5">
              <h2 className="text-[13px] font-semibold text-heading-deep-navy mb-1">이 업체와 관련된 가이드</h2>
              <p className="text-[11px] text-neutral-400 mb-3">구매 결정 전 읽어보면 좋은 Packlinx 실무 가이드</p>
              <div className="flex flex-col gap-2">
                {relatedGuides.map((guide) => (
                  <Link
                    key={guide.slug}
                    href={`/guides/${guide.slug}`}
                    className="group flex items-center gap-3 p-3.5 rounded-lg border border-neutral-100 hover:border-stripe-purple-ring hover:bg-stripe-purple-soft transition-all"
                  >
                    <span className="text-[20px] shrink-0">{guide.icon}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-medium text-neutral-800 group-hover:text-stripe-purple transition-colors">
                        {guide.title}
                      </p>
                    </div>
                    <svg className="w-4 h-4 text-neutral-300 group-hover:text-stripe-purple shrink-0 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-neutral-100">
                <Link href="/guides" className="text-[12px] text-stripe-purple hover:text-stripe-purple-hover font-medium transition-colors">
                  전체 가이드 보기 →
                </Link>
              </div>
            </div>
          )}

          {/* Category links */}
          {industryCats.length > 0 && (
            <div className="bg-white border border-border-v04 rounded-xl p-5">
              <h2 className="text-[13px] font-semibold text-heading-deep-navy mb-3">
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
                      className="inline-flex items-center gap-1.5 text-[13px] font-medium text-stripe-purple bg-stripe-purple-soft hover:bg-stripe-purple-tint px-3 py-2 rounded-lg transition-colors"
                    >
                      <span>{INDUSTRY_CATEGORY_ICONS[catKey]}</span>
                      <span>{catLabel} 업체 보기</span>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}

          {/* Vendor Directory Disclaimer — Legal §5-A (PACAA-591) */}
          <div className="border-t border-neutral-100 pt-5 text-center">
            <VendorDirectoryDisclaimer />
          </div>

          {/* AI Disclaimer */}
          <div className="border-t border-neutral-100 pt-5 text-center">
            <p className="text-[12px] text-neutral-400 leading-relaxed max-w-lg mx-auto">
              본 업체 정보의 일부(업체 소개, 서비스 역량, 납품 산업, 납품처)는
              공개 자료를 기반으로 AI가 생성한 참고 정보이며, 실제와 다를 수 있습니다.
              정확한 정보는 업체에 직접 문의해주세요.
            </p>
            <div className="mt-2">
              <a
                href={`mailto:rpdla041200@gmail.com?subject=${encodeURIComponent('업체 정보 수정 요청: ' + company.name)}`}
                className="text-[12px] text-neutral-400 hover:text-neutral-600 underline underline-offset-2 transition-colors"
              >
                정보 수정 요청 →
              </a>
            </div>
          </div>
        </main>

        {/* ═══ STICKY MOBILE CTA — V1 신규: 모바일 fold 문제 해결 ═══
            데스크탑에서는 hidden. 모바일에서 항상 하단 고정.
        */}
        {hasAnyContact && (
          <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-neutral-200 px-4 py-3 safe-area-pb">
            <div className="flex gap-2.5">
              {hasWebsite ? (
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 text-[14px] font-semibold text-white bg-stripe-purple hover:bg-stripe-purple-hover py-3.5 rounded-xl transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  웹사이트 방문
                </a>
              ) : hasPhone ? (
                <a
                  href={`tel:${company.phone}`}
                  className="flex-1 flex items-center justify-center gap-2 text-[14px] font-semibold text-white bg-stripe-purple hover:bg-stripe-purple-hover py-3.5 rounded-xl transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {company.phone}
                </a>
              ) : null}
              {hasPhone && hasWebsite && (
                <a
                  href={`tel:${company.phone}`}
                  className="inline-flex items-center justify-center w-14 text-stripe-purple border border-stripe-purple-ring bg-stripe-purple-soft hover:bg-stripe-purple-tint py-3.5 rounded-xl transition-colors shrink-0"
                  aria-label="전화 문의"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </a>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="border-t border-white/[0.06] bg-[#0F172A]">
          <div className="max-w-[800px] mx-auto px-4 sm:px-6 py-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-col gap-2">
                <PacklinxLogo variant="dark" layout="horizontal" />
                <p className="text-[12px] text-slate-400">
                  © 2026 PACKLINX. 업체 정보는 공개 출처(공공데이터 포털, 업체 웹사이트 등)에서 자동 수집되었습니다.
                </p>
                <p className="text-[12px] text-slate-400">
                  정보 정정·삭제·처리정지 요청 (「개인정보 보호법」 §39-3):&nbsp;
                  <a href="/opt-out" className="underline hover:text-slate-200 transition-colors">packlinx.com/opt-out</a>
                  &nbsp;또는&nbsp;
                  <a href="mailto:rpdla041200@gmail.com" className="underline hover:text-slate-200 transition-colors">rpdla041200@gmail.com</a>
                </p>
                <BusinessRegistrationInfo theme="dark" />
              </div>
              <div className="flex flex-wrap gap-4 text-[12px] text-slate-400">
                <a href="https://keywords.packlinx.com/keywords" className="hover:text-slate-200 transition-colors">키워드 디렉터리</a>
                <Link href="/privacy" className="hover:text-slate-200 transition-colors">개인정보처리방침</Link>
                <Link href="/terms" className="hover:text-slate-200 transition-colors">이용약관</Link>
                <Link href="/opt-out?type=takedown" className="hover:text-slate-200 transition-colors">권리침해 신고</Link>
                <Link href="/faq#what-is-jeongbo-deungrok" className="hover:text-slate-200 transition-colors">Packlinx 자체 등록 기준 안내</Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
      <CompareCart />
    </>
  )
}
