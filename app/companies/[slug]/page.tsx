import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Suspense } from 'react'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { createSupabaseServer } from '@/lib/supabase-server'
import { PacklinxLogo } from '@/components/PacklinxLogo'
import { SiteHeader } from '@/components/SiteHeader'
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
import { VendorModelBadge } from '@/app/internal/vendor-redesign/v1/[slug]/VendorModelBadge'
import { VendorTradingBox } from '@/app/internal/vendor-redesign/v1/[slug]/VendorTradingBox'
import type { VendorModel } from '@/app/internal/vendor-redesign/v1/[slug]/VendorModelBadge'

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

function InfoBox({ label, value, highlight }: { label: string; value: React.ReactNode; highlight?: boolean }) {
  return (
    <div className={`rounded-lg border p-3 text-center ${highlight ? 'bg-emerald-50 border-emerald-200' : 'bg-neutral-50 border-neutral-200'}`}>
      <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-400 mb-1">{label}</p>
      <div className={`text-[14px] font-bold tracking-tight leading-tight ${highlight ? 'text-emerald-700' : 'text-[#061b31]'}`}>
        {value}
      </div>
    </div>
  )
}

function EmptyField({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 text-[12px] text-neutral-400 bg-neutral-50 border border-dashed border-neutral-200 rounded-lg px-3 py-2">
      <svg className="w-3.5 h-3.5 shrink-0 text-neutral-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 12H4" />
      </svg>
      <span>{label}: <span className="font-medium text-neutral-400">정보 미제공</span></span>
    </div>
  )
}

function resolveVendorModel(result: string | null | undefined): VendorModel {
  if (result === 'found') return 'B'
  if (result === 'not_found') return 'A'
  return 'unknown'
}

export default async function CompanyPage({ params }: Props) {
  const { slug: rawSlug } = await params
  const slug = decodeURIComponent(rawSlug)
  const supabase = await createClient()
  const supabaseAdmin = createSupabaseServer()

  const { data: company } = await supabase
    .from('companies')
    .select('*')
    .eq('slug', slug)
    .eq('is_hidden', false)
    .single()

  if (!company) notFound()

  const [portfoliosResult, similarCompaniesResult, telesalesResult] = await Promise.all([
    supabase
      .from('company_portfolios')
      .select('id, title, description, image_url, display_order, category_tag')
      .eq('company_id', company.id)
      .order('display_order', { ascending: true }),
    supabase.rpc('get_similar_companies', {
      target_company_id: company.id,
      result_limit: 6,
    }),
    supabaseAdmin
      .from('vendor_telesales_checks')
      .select('result')
      .eq('vendor_id', company.id as string)
      .order('checked_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])

  const portfolios = portfoliosResult.data
  const similarCompanies = (similarCompaniesResult.data ?? []) as Array<{
    id: string; slug: string; name: string; description: string | null;
    icon_url: string | null; category: string; industry_categories: string[];
    is_verified: boolean; similarity_score: number;
  }>

  const vendorModel = resolveVendorModel(telesalesResult.data?.result)

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
  const categoryLabel = primaryIndustry
    ? INDUSTRY_CATEGORY_LABELS[primaryIndustry]
    : (CATEGORY_LABELS[company.category as Category] ?? company.category)
  const breadcrumbCategoryName = categoryLabel
  const breadcrumbCategoryUrl = primaryIndustry
    ? `${siteUrl}/categories/${primaryIndustry}`
    : `${siteUrl}/?category=${company.category}`
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Packlinx', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: breadcrumbCategoryName, item: breadcrumbCategoryUrl },
      { '@type': 'ListItem', position: 3, name: company.name, item: `${siteUrl}/companies/${slug}` },
    ],
  }

  const certItems = ((company.certifications as string[] | null) ?? []).map((raw) => ({
    raw,
    resolved: resolveCertification(raw),
  }))
  const hasCertifications = certItems.length > 0

  const certsByCategory = certItems.reduce<Record<CertificationCategory, typeof certItems>>((acc, item) => {
    const cat = item.resolved?.category ?? 'general'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(item)
    return acc
  }, {} as Record<CertificationCategory, typeof certItems>)

  const yearsInBusiness = company.founded_year
    ? new Date().getFullYear() - (company.founded_year as number)
    : null
  const moqValue = company.moq_value != null ? Number(company.moq_value).toLocaleString() : null
  const moqUnit = (company.moq_unit as string | null) ?? '개'
  const hasPortfolios = !!(portfolios && portfolios.length > 0)
  const hasServiceCapabilities = Array.isArray(company.service_capabilities) && company.service_capabilities.length > 0
  const hasWebsite = !!company.website
  const hasPhone = !!company.phone
  const hasEmail = !!company.email

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

      <div className="min-h-screen bg-[#f8f9fa]">
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

        {/* Breadcrumb */}
        <div className="max-w-[1100px] mx-auto px-4 sm:px-6 pt-4 pb-0">
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

        {/* ════ MAIN LAYOUT: Left content + Right sticky RFQ ════ */}
        <div className="max-w-[1100px] mx-auto px-4 sm:px-6 pt-5 pb-20">
          <div className="lg:grid lg:grid-cols-[1fr_320px] lg:gap-6">

            {/* ════ LEFT COLUMN ════ */}
            <div className="space-y-4 min-w-0">

              {/* ── HERO CARD ── */}
              <div className="bg-white border border-[#e5edf5] rounded-xl overflow-hidden" style={{ boxShadow: '0 2px 8px rgba(50,50,93,0.08), 0 1px 3px rgba(0,0,0,0.06)' }}>
                {/* Photo strip */}
                {hasPortfolios && (
                  <div className="h-[180px] sm:h-[220px] bg-neutral-100 overflow-hidden relative">
                    <div className="grid grid-cols-3 h-full gap-0.5">
                      {(portfolios as Portfolio[]).slice(0, 3).map((p, i) =>
                        p.image_url ? (
                          <div key={p.id} className="relative overflow-hidden">
                            <Image
                              src={getPortfolioImageUrl(p.image_url)}
                              alt={p.title ?? '업체 사진'}
                              fill
                              sizes="(max-width:640px) 33vw, 220px"
                              className="object-cover"
                              priority={i === 0}
                            />
                          </div>
                        ) : null
                      )}
                      {(portfolios as Portfolio[]).length < 3 &&
                        Array.from({ length: 3 - Math.min((portfolios as Portfolio[]).length, 3) }).map((_, i) => (
                          <div key={i} className="bg-neutral-100" />
                        ))
                      }
                    </div>
                    {(portfolios as Portfolio[]).length > 3 && (
                      <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm text-white text-[11px] font-semibold px-2 py-1 rounded">
                        +{(portfolios as Portfolio[]).length - 3}장 더
                      </div>
                    )}
                  </div>
                )}

                <div className="p-5 sm:p-6">
                  {/* Company identity row */}
                  <div className="flex items-start gap-4 mb-5">
                    <CompanyIcon
                      iconUrl={company.icon_url ?? null}
                      name={company.name}
                      category={company.category}
                      size="lg"
                      linkUrl={company.website ?? null}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h1 className="text-[24px] sm:text-[28px] font-bold text-[#061b31] tracking-tight leading-tight">
                          {company.name}
                        </h1>
                        <AddToCompareButton slug={slug} name={company.name} />
                        {company.packlinx_verified && <VerifiedTooltip />}
                      </div>
                      <p className="text-[13px] text-neutral-500 font-medium">{categoryLabel}</p>
                      {/* VendorModel badge — legal item 2(i) tooltip baked inside */}
                      <div className="mt-1.5">
                        <VendorModelBadge model={vendorModel} />
                      </div>
                    </div>
                  </div>

                  {/* Hard data boxes */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
                    <InfoBox
                      label="업력"
                      value={yearsInBusiness != null ? <>{yearsInBusiness}<span className="text-[11px] font-medium text-neutral-500 ml-0.5">년</span></> : '정보 미제공'}
                    />
                    <InfoBox
                      label="보유 인증"
                      value={certItems.length > 0 ? <>{certItems.length}<span className="text-[11px] font-medium text-neutral-500 ml-0.5">건</span></> : '없음'}
                    />
                    <InfoBox
                      label="최소주문(MOQ)"
                      value={moqValue != null ? <>{moqValue}<span className="text-[11px] font-medium text-neutral-500 ml-0.5">{moqUnit}</span></> : '문의'}
                    />
                    <InfoBox
                      label="샘플"
                      value={
                        company.sample_available === true
                          ? <span className="text-emerald-700">가능</span>
                          : company.sample_available === false
                          ? '불가'
                          : '확인 필요'
                      }
                    />
                  </div>

                  {/* Registration box */}
                  <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4 mb-5">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-3">사업자 정보 (공개 등록 기준)</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <p className="text-[10px] font-semibold text-neutral-400 mb-0.5">사업자등록번호</p>
                        {company.business_registration_number
                          ? <p className="text-[13px] font-bold text-[#061b31]">{company.business_registration_number as string}</p>
                          : <p className="text-[12px] text-neutral-400 italic">정보 미제공</p>
                        }
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold text-neutral-400 mb-0.5">통신판매업 신고번호</p>
                        {company.telesales_registration_number
                          ? <p className="text-[13px] font-bold text-[#061b31]">{company.telesales_registration_number as string}</p>
                          : <p className="text-[12px] text-neutral-400 italic">정보 미제공</p>
                        }
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold text-neutral-400 mb-0.5">설립연도</p>
                        {company.founded_year
                          ? <p className="text-[13px] font-bold text-[#061b31]">{company.founded_year as number}년</p>
                          : <p className="text-[12px] text-neutral-400 italic">정보 미제공</p>
                        }
                      </div>
                    </div>
                  </div>

                  {/* Company description */}
                  {company.description && (
                    <p className="text-[14px] text-neutral-600 leading-[1.85] whitespace-pre-line">
                      {company.description}
                    </p>
                  )}

                  {/* Trust signal — data source */}
                  {company.data_source && DATA_SOURCE_LABELS[company.data_source as string] && (
                    <div className="mt-4 pt-3 border-t border-neutral-100">
                      <span className="inline-flex items-center gap-1.5 text-[11px] text-body-secondary bg-neutral-50 border border-neutral-100 px-2.5 py-1 rounded-full">
                        <svg className="w-3 h-3 shrink-0 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {DATA_SOURCE_LABELS[company.data_source as string]}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* ── CERTIFICATIONS ── */}
              <div className="bg-white border border-[#e5edf5] rounded-xl p-5" style={{ boxShadow: '0 1px 4px rgba(50,50,93,0.06)' }}>
                <h2 className="text-[14px] font-bold text-[#061b31] mb-1">보유 인증 · 특허</h2>
                <p className="text-[11px] text-neutral-400 mb-4">국내 공인 인증 기준 (KS/KC/ISO 등) — 실제 보유분만 표기</p>
                {hasCertifications ? (
                  <>
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
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2.5 bg-neutral-50 border border-dashed border-neutral-200 rounded-lg p-4 mb-3">
                      <svg className="w-4 h-4 text-neutral-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                      </svg>
                      <p className="text-[12px] text-neutral-400">현재 등록된 인증 정보가 없습니다. 업체 문의 시 확인하세요.</p>
                    </div>
                    <OwnerControls
                      companyId={company.id}
                      slug={slug}
                      variant={{ kind: 'cert-cta', withTopBorder: false }}
                    />
                  </>
                )}
              </div>

              {/* ── PRODUCTION CAPACITY / FACILITY TABLE ── */}
              <div className="bg-white border border-[#e5edf5] rounded-xl p-5" style={{ boxShadow: '0 1px 4px rgba(50,50,93,0.06)' }}>
                <h2 className="text-[14px] font-bold text-[#061b31] mb-1">생산 역량 · 시설 정보</h2>
                <p className="text-[11px] text-neutral-400 mb-4">수량·납기 기준 정보 (없는 항목은 정보 미제공으로 표기)</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {company.moq_value != null || company.min_order_quantity ? (
                    <div className="bg-neutral-50 border border-neutral-200 rounded-lg px-4 py-3">
                      <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-1">최소 주문 수량</p>
                      <p className="text-[14px] font-bold text-[#061b31]">
                        {moqValue != null ? `${moqValue} ${moqUnit}` : (company.min_order_quantity as string)}
                      </p>
                    </div>
                  ) : (
                    <EmptyField label="최소 주문 수량" />
                  )}

                  {company.lead_time_standard_days != null ? (
                    <div className="bg-neutral-50 border border-neutral-200 rounded-lg px-4 py-3">
                      <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-1">표준 납기</p>
                      <p className="text-[14px] font-bold text-[#061b31]">{company.lead_time_standard_days as number}일</p>
                    </div>
                  ) : (
                    <EmptyField label="납기" />
                  )}

                  {company.lead_time_express_days != null && (
                    <div className="bg-neutral-50 border border-neutral-200 rounded-lg px-4 py-3">
                      <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-1">특급 납기</p>
                      <p className="text-[14px] font-bold text-[#061b31]">{company.lead_time_express_days as number}일</p>
                    </div>
                  )}

                  {company.print_method && (
                    <div className="bg-neutral-50 border border-neutral-200 rounded-lg px-4 py-3">
                      <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-1">인쇄 방식</p>
                      <p className="text-[14px] font-bold text-[#061b31]">
                        {PRINT_METHOD_LABELS[company.print_method as PrintMethod] ?? company.print_method as string}
                      </p>
                    </div>
                  )}

                  {company.price_tier && (
                    <div className="bg-neutral-50 border border-neutral-200 rounded-lg px-4 py-3">
                      <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-1">가격대</p>
                      <p className="text-[14px] font-bold text-[#061b31]">
                        {PRICE_TIER_LABELS[company.price_tier as PriceTier]}
                      </p>
                    </div>
                  )}

                  {company.cold_packaging_available && (
                    <div className="bg-neutral-50 border border-neutral-200 rounded-lg px-4 py-3">
                      <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-1">특수 포장</p>
                      <p className="text-[14px] font-bold text-teal-700">보냉 포장 가능</p>
                    </div>
                  )}

                  {company.cold_retention_hours != null && (
                    <div className="bg-neutral-50 border border-neutral-200 rounded-lg px-4 py-3">
                      <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-1">보냉 유지</p>
                      <p className="text-[14px] font-bold text-[#061b31]">{company.cold_retention_hours as number}시간</p>
                    </div>
                  )}

                  {company.dry_ice_available != null && (
                    <div className="bg-neutral-50 border border-neutral-200 rounded-lg px-4 py-3">
                      <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-1">드라이아이스</p>
                      <p className={`text-[14px] font-bold ${company.dry_ice_available ? 'text-teal-700' : 'text-neutral-500'}`}>
                        {company.dry_ice_available ? '취급 가능' : '미취급'}
                      </p>
                    </div>
                  )}

                  {company.reuse_model && (
                    <div className="bg-neutral-50 border border-neutral-200 rounded-lg px-4 py-3">
                      <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-1">박스 재사용</p>
                      <p className="text-[14px] font-bold text-[#061b31]">
                        {REUSE_MODEL_LABELS[company.reuse_model as ReuseModel] ?? company.reuse_model as string}
                      </p>
                    </div>
                  )}

                  {company.spec_sheet_available != null ? (
                    <div className="bg-neutral-50 border border-neutral-200 rounded-lg px-4 py-3">
                      <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-1">규격서 발행</p>
                      <p className={`text-[14px] font-bold ${company.spec_sheet_available ? 'text-emerald-700' : 'text-neutral-500'}`}>
                        {company.spec_sheet_available ? '가능' : '미지원'}
                      </p>
                    </div>
                  ) : (
                    <EmptyField label="규격서 발행" />
                  )}
                </div>
              </div>

              {/* ── SERVICE CAPABILITIES ── */}
              {hasServiceCapabilities && (
                <div className="bg-white border border-[#e5edf5] rounded-xl p-5" style={{ boxShadow: '0 1px 4px rgba(50,50,93,0.06)' }}>
                  <h2 className="text-[14px] font-bold text-[#061b31] mb-4">서비스 역량</h2>
                  <div className="grid grid-cols-2 gap-2">
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

              {/* ── PORTFOLIO GALLERY ── */}
              {hasPortfolios && (
                <div className="bg-white border border-[#e5edf5] rounded-xl p-5" style={{ boxShadow: '0 1px 4px rgba(50,50,93,0.06)' }}>
                  <h2 className="text-[14px] font-bold text-[#061b31] mb-4">제품 · 시설 사진</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {(portfolios as Portfolio[]).map((item) =>
                      item.image_url ? (
                        <div key={item.id} className="relative aspect-square rounded-lg overflow-hidden bg-neutral-100 group">
                          <Image
                            src={getPortfolioImageUrl(item.image_url)}
                            alt={item.title ?? '제품 이미지'}
                            fill
                            sizes="(max-width:640px) 50vw, 33vw"
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          {item.category_tag && (
                            <div className="absolute top-2 left-2">
                              <span className="text-[10px] font-semibold text-white bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded">
                                {item.category_tag}
                              </span>
                            </div>
                          )}
                        </div>
                      ) : null
                    )}
                  </div>
                </div>
              )}

              {/* ── PRODUCTS ── */}
              {company.products && (company.products as string[]).length > 0 && (
                <div className="bg-white border border-[#e5edf5] rounded-xl p-5" style={{ boxShadow: '0 1px 4px rgba(50,50,93,0.06)' }}>
                  <h2 className="text-[14px] font-bold text-[#061b31] mb-4">취급 제품 · 품목</h2>
                  <div className="flex flex-wrap gap-2">
                    {(company.products as string[]).map((product: string, i: number) => (
                      <span key={i} className="text-[12px] font-medium bg-neutral-100 text-neutral-700 px-3 py-1.5 rounded-md border border-neutral-200">
                        {product}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* ── CATALOG / MATERIALS REQUEST ── */}
              <div className="bg-white border border-[#e5edf5] rounded-xl p-5" style={{ boxShadow: '0 1px 4px rgba(50,50,93,0.06)' }}>
                <h2 className="text-[14px] font-bold text-[#061b31] mb-2">카탈로그 · 자료 요청</h2>
                <p className="text-[12px] text-neutral-500 mb-4">현재 PDF 카탈로그를 보유한 업체의 경우 담당자가 이메일로 전송해드립니다.</p>
                <div className="flex items-center gap-2.5 bg-neutral-50 border border-dashed border-neutral-300 rounded-lg p-4">
                  <svg className="w-5 h-5 text-neutral-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <div>
                    <p className="text-[12px] font-semibold text-neutral-600">자료 요청은 하단 문의 채널을 이용하세요</p>
                    <p className="text-[11px] text-neutral-400 mt-0.5">이메일로 "카탈로그 요청" 메시지를 보내주세요.</p>
                  </div>
                </div>
              </div>

              {/* ── KEY CLIENTS / TARGET INDUSTRIES ── */}
              {((company.key_clients && (company.key_clients as string[]).length > 0) || (company.target_industries && (company.target_industries as string[]).length > 0)) && (
                <div className="bg-white border border-[#e5edf5] rounded-xl p-5" style={{ boxShadow: '0 1px 4px rgba(50,50,93,0.06)' }}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {company.target_industries && (company.target_industries as string[]).length > 0 && (
                      <div>
                        <h2 className="text-[14px] font-bold text-[#061b31] mb-3">주요 납품 산업</h2>
                        <div className="flex flex-wrap gap-2">
                          {(company.target_industries as string[]).map((ind: string, i: number) => (
                            <span key={i} className="text-[12px] font-medium bg-neutral-100 text-neutral-500 px-3 py-1.5 rounded-md">
                              {ind}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {company.key_clients && (company.key_clients as string[]).length > 0 && (
                      <div>
                        <h2 className="text-[14px] font-bold text-[#061b31] mb-3">주요 납품처</h2>
                        <div className="flex flex-wrap gap-2">
                          {(company.key_clients as string[]).map((client: string, i: number) => (
                            <span key={i} className="text-[12px] font-medium bg-white text-neutral-500 border border-[#e5edf5] px-3 py-1.5 rounded-md">
                              {client}
                            </span>
                          ))}
                        </div>
                        <p className="text-[10px] text-[#6B7280] mt-2">
                          본 정보는 업체 자기신고이며 Packlinx가 검증하지 않았습니다.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── SIMILAR COMPANIES ── */}
              {!!company.similar_optout_at && (
                <OwnerControls
                  companyId={company.id}
                  slug={slug}
                  variant={{ kind: 'similar-optout-on' }}
                />
              )}
              {!company.similar_optout_at && similarCompanies.length > 0 && (
                <div className="bg-white border border-[#e5edf5] rounded-xl p-5" style={{ boxShadow: '0 1px 4px rgba(50,50,93,0.06)' }}>
                  <div className="flex items-center justify-between mb-1">
                    <h2 className="text-[13px] font-semibold text-[#061b31]">비슷한 업체</h2>
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
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

              {/* ── RELATED GUIDES ── */}
              {relatedGuides.length > 0 && (
                <div className="bg-white border border-[#e5edf5] rounded-xl p-5" style={{ boxShadow: '0 1px 4px rgba(50,50,93,0.06)' }}>
                  <h2 className="text-[13px] font-semibold text-[#061b31] mb-1">이 업체와 관련된 가이드</h2>
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

              {/* ── CATEGORY LINKS ── */}
              {industryCats.length > 0 && (
                <div className="bg-white border border-[#e5edf5] rounded-xl p-5" style={{ boxShadow: '0 1px 4px rgba(50,50,93,0.06)' }}>
                  <h2 className="text-[13px] font-semibold text-[#061b31] mb-3">
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
            </div>

            {/* ════ RIGHT COLUMN — Sticky RFQ Panel ════ */}
            <div className="hidden lg:block">
              <div className="sticky top-24 space-y-3">
                {/* Main contact card */}
                <div className="bg-white border border-[#e5edf5] rounded-xl p-5" style={{ boxShadow: '0 4px 16px rgba(50,50,93,0.12), 0 1px 3px rgba(0,0,0,0.08)' }}>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-[15px] font-bold text-[#061b31]">견적·문의 채널</h3>
                    {company.is_verified && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">검증완료</span>
                    )}
                  </div>

                  {/* VendorTradingBox — model-specific CTA + copy */}
                  <div className="mb-3">
                    <VendorTradingBox
                      model={vendorModel}
                      phone={(company.phone as string | null) ?? null}
                      email={(company.email as string | null) ?? null}
                      website={(company.website as string | null) ?? null}
                      vendorName={company.name as string}
                    />
                  </div>

                  <div className="space-y-2.5">
                    {hasWebsite && (
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 w-full bg-[#533afd] hover:bg-[#4434d4] text-white font-bold text-[13px] px-4 py-3.5 rounded-xl transition-colors"
                      >
                        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        웹사이트 바로가기
                      </a>
                    )}

                    {hasPhone && (
                      <a
                        href={`tel:${company.phone}`}
                        className="flex items-center gap-3 w-full bg-white hover:bg-neutral-50 text-[#061b31] font-semibold text-[13px] px-4 py-3.5 rounded-xl border border-[#e5edf5] transition-colors"
                      >
                        <svg className="w-4 h-4 shrink-0 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        {company.phone}
                      </a>
                    )}

                    {hasEmail && (
                      <a
                        href={`mailto:${company.email}?subject=${encodeURIComponent(`[Packlinx] ${company.name} 견적 문의`)}`}
                        className="flex items-center gap-3 w-full bg-white hover:bg-neutral-50 text-[#061b31] font-semibold text-[13px] px-4 py-3.5 rounded-xl border border-[#e5edf5] transition-colors"
                      >
                        <svg className="w-4 h-4 shrink-0 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        이메일 문의
                      </a>
                    )}

                    {/* Fallback if no contacts */}
                    {!hasWebsite && !hasPhone && !hasEmail && (
                      <div className="text-center py-4">
                        <p className="text-[12px] text-neutral-400">연락처 정보가 등록되지 않았습니다</p>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-neutral-100">
                    <p className="text-[11px] text-neutral-400 text-center leading-relaxed">
                      견적 요청 시 <strong>업체명·필요 수량·납기</strong>를 함께 알려주시면<br />
                      빠른 답변을 받을 수 있습니다
                    </p>
                  </div>
                </div>

                {/* Hard data quick summary */}
                <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-3">업체 요약 정보</p>
                  <dl className="space-y-2">
                    <div className="flex justify-between text-[12px]">
                      <dt className="text-neutral-400">카테고리</dt>
                      <dd className="font-semibold text-neutral-700 text-right">{categoryLabel}</dd>
                    </div>
                    <div className="flex justify-between text-[12px]">
                      <dt className="text-neutral-400">설립</dt>
                      <dd className="font-semibold text-neutral-700">
                        {company.founded_year ? `${company.founded_year as number}년` : '정보 미제공'}
                      </dd>
                    </div>
                    <div className="flex justify-between text-[12px]">
                      <dt className="text-neutral-400">인증 수</dt>
                      <dd className="font-semibold text-neutral-700">{certItems.length}건</dd>
                    </div>
                    <div className="flex justify-between text-[12px]">
                      <dt className="text-neutral-400">샘플 가능</dt>
                      <dd className={`font-semibold ${company.sample_available ? 'text-emerald-700' : 'text-neutral-500'}`}>
                        {company.sample_available === true ? '가능' : company.sample_available === false ? '불가' : '확인 필요'}
                      </dd>
                    </div>
                    {company.is_verified && (
                      <div className="flex justify-between text-[12px]">
                        <dt className="text-neutral-400">Packlinx 검증</dt>
                        <dd className="font-semibold text-emerald-700">완료</dd>
                      </div>
                    )}
                  </dl>
                </div>

                {/* Legal item 3: 분류 출처 표기 (PACAA-749) */}
                <p className="text-[10px] text-neutral-400 text-center leading-relaxed px-1 border-t border-neutral-100 pt-2">
                  분류 근거: 공정위 통신판매사업자 공시 + vendor 자가신고
                </p>

                {/* Legal item 4: Model B §20① 통신판매중개자 고지 (PACAA-749) */}
                {vendorModel === 'B' && (
                  <p className="text-[10px] text-neutral-400 text-center leading-relaxed px-1">
                    Packlinx는 「전자상거래 등에서의 소비자보호에 관한 법률」 제20조의
                    통신판매중개자에 해당하지 않습니다.
                  </p>
                )}

                {/* PACAA-754: 분류 정정 요청 링크 */}
                <div className="pt-2 border-t border-neutral-100 text-center">
                  <Link
                    href={`/vendor/dispute?vendor_id=${encodeURIComponent(company.id as string)}&vendor_name=${encodeURIComponent(company.name as string)}`}
                    className="text-[10px] text-neutral-400 hover:text-[#533afd] hover:underline transition-colors"
                  >
                    분류 정정 요청
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Mobile sticky CTA (vendor-model-aware) ── */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-neutral-200 px-4 py-3">
          <div className="flex gap-2">
            {vendorModel === 'B' && (hasWebsite || hasPhone) && (
              <a
                href={hasWebsite ? (company.website as string) : `tel:${company.phone as string}`}
                target={hasWebsite ? '_blank' : undefined}
                rel={hasWebsite ? 'noopener noreferrer' : undefined}
                className="flex-1 flex items-center justify-center gap-2 text-[14px] font-bold text-white bg-emerald-700 hover:bg-emerald-800 py-3.5 rounded-xl transition-colors"
              >
                샘플 신청
              </a>
            )}
            {(hasPhone || hasEmail || hasWebsite) && (
              <a
                href={
                  hasPhone ? `tel:${company.phone as string}`
                  : hasEmail ? `mailto:${company.email as string}?subject=${encodeURIComponent(`[Packlinx] ${company.name as string} 견적 문의`)}`
                  : (company.website as string)
                }
                target={(!hasPhone && !hasEmail && hasWebsite) ? '_blank' : undefined}
                rel={(!hasPhone && !hasEmail && hasWebsite) ? 'noopener noreferrer' : undefined}
                className={`flex items-center justify-center gap-2 text-[14px] font-bold py-3.5 rounded-xl transition-colors ${
                  vendorModel === 'B'
                    ? 'w-14 text-[#533afd] border border-[#533afd]/25 bg-[#533afd]/5'
                    : 'flex-1 text-white bg-[#533afd] hover:bg-[#4434d4]'
                }`}
                aria-label={vendorModel === 'B' ? '견적 문의' : undefined}
              >
                {vendorModel === 'B' ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                ) : '견적 문의'}
              </a>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-white/[0.06] bg-[#0F172A]">
          <div className="max-w-[1100px] mx-auto px-4 sm:px-6 py-8">
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
