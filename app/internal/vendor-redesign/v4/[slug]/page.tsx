import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import {
  CATEGORY_LABELS,
  INDUSTRY_CATEGORY_LABELS,
  CERTIFICATION_TYPES,
  PRINT_METHOD_LABELS,
  PRICE_TIER_LABELS,
  type Category,
  type IndustryCategory,
  type PrintMethod,
  type PriceTier,
} from '@/types'

type Props = {
  params: Promise<{ slug: string }>
}

export const metadata: Metadata = {
  title: 'V4 Vendor Detail — Internal Preview',
  robots: { index: false, follow: false },
}

// Category illustration SVGs (fallback when no hero image)
const CATEGORY_ILLUSTRATIONS: Record<string, string> = {
  'packaging-machinery': '🏭',
  'food-beverage': '🍱',
  'ecommerce-shipping': '📦',
  'cosmetics-beauty': '💄',
  'pharma-health': '💊',
  'electronics-industrial': '⚙️',
  'label-sticker': '🏷️',
  'printing-postprocess': '🖨️',
  'packaging-accessories': '🔧',
}

function resolveCertificationLabel(raw: string): string {
  const found = CERTIFICATION_TYPES.find(
    (c) => c.id === raw || c.aliases.some((a) => a.toLowerCase() === raw.toLowerCase()),
  )
  return found ? found.label : raw
}

export default async function VendorDetailV4({ params }: Props) {
  const { slug: rawSlug } = await params
  const slug = decodeURIComponent(rawSlug)
  const supabase = await createClient()

  const { data: company } = await supabase
    .from('companies')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!company) notFound()

  const { data: portfolios } = await supabase
    .from('company_portfolios')
    .select('id, title, description, image_url, display_order')
    .eq('company_id', company.id)
    .order('display_order', { ascending: true })
    .limit(3)

  const industryCats = (company.industry_categories as string[] | null) ?? []
  const primaryIndustry = industryCats[0] as IndustryCategory | undefined
  const categoryLabel =
    (primaryIndustry ? INDUSTRY_CATEGORY_LABELS[primaryIndustry] : null) ??
    CATEGORY_LABELS[company.category as Category] ??
    company.category
  const categoryEmoji = primaryIndustry ? (CATEGORY_ILLUSTRATIONS[primaryIndustry] ?? '🏭') : '📦'

  const products = (company.products as string[] | null) ?? []
  const certifications = (company.certifications as string[] | null) ?? []
  const serviceCapabilities = (company.service_capabilities as string[] | null) ?? []
  const keyClients = (company.key_clients as string[] | null) ?? []

  const hasWebsite = !!company.website
  const hasPhone = !!company.phone
  const hasEmail = !!company.email

  const moqValue = company.moq_value != null ? Number(company.moq_value).toLocaleString() : null
  const moqUnit = (company.moq_unit as string | null) ?? '개'

  const heroPortfolio = portfolios?.[0]

  // Key facts list — filter to only available data, show up to 8
  type KeyFact = { label: string; value: string; accent?: boolean }
  const keyFacts: KeyFact[] = []

  keyFacts.push({ label: '분류', value: categoryLabel, accent: true })

  if (company.founded_year) {
    const yearsOld = new Date().getFullYear() - (company.founded_year as number)
    keyFacts.push({ label: '설립연도', value: `${company.founded_year as number}년 (${yearsOld}년 전통)` })
  }

  if (company.address || company.region) {
    keyFacts.push({ label: '소재지', value: (company.address as string | null) ?? (company.region as string) })
  }

  if (certifications.length > 0) {
    keyFacts.push({
      label: '보유 인증',
      value: certifications.slice(0, 3).map(resolveCertificationLabel).join(', ') + (certifications.length > 3 ? ` 외 ${certifications.length - 3}건` : ''),
    })
  }

  if (moqValue != null) {
    keyFacts.push({ label: '최소주문', value: `${moqValue} ${moqUnit}` })
  } else if (company.min_order_quantity) {
    keyFacts.push({ label: '최소주문', value: company.min_order_quantity as string })
  }

  if (company.lead_time_standard_days != null || company.lead_time_express_days != null) {
    const days = company.lead_time_standard_days ?? company.lead_time_express_days
    keyFacts.push({ label: '납기', value: `${days as number}일` })
  }

  if (company.price_tier) {
    keyFacts.push({ label: '가격대', value: PRICE_TIER_LABELS[company.price_tier as PriceTier] ?? company.price_tier })
  }

  if (company.print_method) {
    keyFacts.push({ label: '인쇄 방식', value: PRINT_METHOD_LABELS[company.print_method as PrintMethod] ?? company.print_method })
  }

  if (company.sample_available != null) {
    keyFacts.push({ label: '샘플', value: company.sample_available ? '가능' : '확인 필요' })
  }

  if (company.is_verified) {
    keyFacts.push({ label: '인증 상태', value: 'Packlinx 검증 완료', accent: true })
  }

  // Ensure we have at least 6 — pad with category if needed
  if (keyFacts.length < 6 && products.length > 0) {
    keyFacts.splice(2, 0, { label: '주력 제품', value: products.slice(0, 3).join(', ') })
  }

  // Tagline: short one-liner derived from description or products
  const tagline = company.description
    ? (company.description as string).split('.')[0].trim().slice(0, 60) + ((company.description as string).split('.')[0].trim().length > 60 ? '…' : '')
    : products.length > 0
    ? `${products.slice(0, 2).join(', ')} 전문 제조·공급사`
    : `${categoryLabel} 전문 업체`

  return (
    <div className="min-h-screen bg-white">
      {/* ── Noindex label (dev only) ── */}
      <div className="bg-neutral-900 text-neutral-400 text-[11px] font-mono text-center py-1.5 tracking-widest uppercase">
        Internal Preview — PACAA-741 V4 Redesign · noindex
      </div>

      {/* ── Site nav (minimal) ── */}
      <nav className="border-b border-neutral-100 bg-white sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 h-14 flex items-center justify-between">
          <Link href="/" className="text-[15px] font-semibold tracking-tight" style={{ color: '#533afd' }}>
            Packlinx
          </Link>
          <div className="flex items-center gap-6 text-[13px] text-neutral-500">
            <Link href="/companies" className="hover:text-neutral-900 transition-colors">업체 찾기</Link>
            <Link href="/guides" className="hover:text-neutral-900 transition-colors">구매 가이드</Link>
          </div>
        </div>
      </nav>

      {/* ── Hero section ── */}
      <section className="max-w-6xl mx-auto px-6 sm:px-8 pt-12 pb-0">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-[12px] text-neutral-400 mb-8">
          <Link href="/" className="hover:text-neutral-600 transition-colors">Packlinx</Link>
          <span>·</span>
          {primaryIndustry && (
            <>
              <Link href={`/categories/${primaryIndustry}`} className="hover:text-neutral-600 transition-colors">
                {INDUSTRY_CATEGORY_LABELS[primaryIndustry]}
              </Link>
              <span>·</span>
            </>
          )}
          <span className="text-neutral-600">{company.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-12 lg:gap-16 items-start">
          {/* ─── LEFT: Identity + hero ─── */}
          <div>
            {/* Category chip */}
            <div className="inline-flex items-center gap-1.5 text-[12px] font-semibold tracking-wide uppercase mb-4 px-3 py-1 rounded-full border"
              style={{ color: '#533afd', borderColor: 'rgba(83,58,253,0.2)', background: 'rgba(83,58,253,0.04)' }}>
              <span>{categoryEmoji}</span>
              <span>{categoryLabel}</span>
            </div>

            {/* Vendor name */}
            <h1 className="text-[36px] sm:text-[48px] font-light tracking-[-0.03em] leading-[1.08] text-[#061b31] mb-4">
              {company.name}
            </h1>

            {/* Tagline */}
            <p className="text-[17px] sm:text-[19px] text-neutral-500 font-light leading-relaxed mb-6 max-w-xl">
              {tagline}
            </p>

            {/* Meta row: founded / location */}
            <div className="flex flex-wrap items-center gap-4 text-[13px] text-neutral-400 mb-10">
              {company.founded_year && (
                <span className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  설립 {company.founded_year as number}년
                </span>
              )}
              {(company.address || company.region) && (
                <span className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {(company.address as string | null) ?? (company.region as string)}
                </span>
              )}
              {company.is_verified && (
                <span className="flex items-center gap-1.5 font-medium" style={{ color: '#16A34A' }}>
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Packlinx 검증
                </span>
              )}
            </div>

            {/* Hero image / illustration */}
            <div className="relative rounded-2xl overflow-hidden bg-neutral-50 border border-neutral-100 mb-12"
              style={{ aspectRatio: '16/7', minHeight: '200px' }}>
              {heroPortfolio?.image_url ? (
                <Image
                  src={`${heroPortfolio.image_url}?width=1200&format=webp`}
                  alt={heroPortfolio.title || company.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 780px"
                  className="object-cover"
                  priority
                />
              ) : company.icon_url ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-32 h-32 sm:w-48 sm:h-48 opacity-20">
                    <Image
                      src={company.icon_url}
                      alt={company.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-[80px] sm:text-[120px] select-none leading-none opacity-40">{categoryEmoji}</span>
                  </div>
                </div>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                  <span className="text-[80px] sm:text-[120px] select-none leading-none opacity-30">{categoryEmoji}</span>
                  <p className="text-[13px] text-neutral-400">{categoryLabel} 전문 업체</p>
                </div>
              )}
            </div>

            {/* ─── Info blocks ─── */}

            {/* Block 1: 업체 소개 */}
            {company.description && (
              <div className="mb-12">
                <h2 className="text-[13px] font-semibold uppercase tracking-widest text-neutral-400 mb-4">업체 소개</h2>
                <p className="text-[16px] sm:text-[17px] text-neutral-700 leading-[1.85] font-light whitespace-pre-line">
                  {company.description}
                </p>
              </div>
            )}

            {/* Block 2: 주력 제품 및 서비스 */}
            {(products.length > 0 || serviceCapabilities.length > 0) && (
              <div className="mb-12">
                <h2 className="text-[13px] font-semibold uppercase tracking-widest text-neutral-400 mb-4">주력 제품 및 서비스</h2>
                {products.length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {products.map((product: string, i: number) => (
                        <span key={i}
                          className="text-[13px] font-medium px-3 py-1.5 rounded-lg border border-neutral-200 text-neutral-700 bg-white">
                          {product}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {serviceCapabilities.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-4">
                    {serviceCapabilities.map((cap: string, i: number) => (
                      <div key={i} className="flex items-center gap-2.5 text-[14px] text-neutral-600">
                        <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: '#533afd' }} />
                        {cap}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Block 3: 거래 조건 */}
            {(moqValue != null || company.min_order_quantity || company.lead_time_standard_days != null || company.sample_available != null) && (
              <div className="mb-12">
                <h2 className="text-[13px] font-semibold uppercase tracking-widest text-neutral-400 mb-4">거래 조건</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {(moqValue != null || company.min_order_quantity) && (
                    <div>
                      <p className="text-[12px] text-neutral-400 mb-1">최소 주문 수량</p>
                      <p className="text-[22px] font-light text-[#061b31] tracking-tight">
                        {moqValue != null ? `${moqValue} ${moqUnit}` : (company.min_order_quantity as string)}
                      </p>
                    </div>
                  )}
                  {(company.lead_time_standard_days != null || company.lead_time_express_days != null) && (
                    <div>
                      <p className="text-[12px] text-neutral-400 mb-1">표준 납기</p>
                      <p className="text-[22px] font-light text-[#061b31] tracking-tight">
                        {(company.lead_time_standard_days ?? company.lead_time_express_days) as number}일
                      </p>
                    </div>
                  )}
                  {company.sample_available != null && (
                    <div>
                      <p className="text-[12px] text-neutral-400 mb-1">샘플 제공</p>
                      <p className={`text-[16px] font-medium tracking-tight ${company.sample_available ? 'text-emerald-700' : 'text-neutral-500'}`}>
                        {company.sample_available ? '가능' : '확인 필요'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Block 4: 주요 납품처 */}
            {keyClients.length > 0 && (
              <div className="mb-12">
                <h2 className="text-[13px] font-semibold uppercase tracking-widest text-neutral-400 mb-4">주요 납품처</h2>
                <div className="flex flex-wrap gap-2">
                  {keyClients.map((client: string, i: number) => (
                    <span key={i} className="text-[13px] text-neutral-600 px-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-lg">
                      {client}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Certifications */}
            {certifications.length > 0 && (
              <div className="mb-12">
                <h2 className="text-[13px] font-semibold uppercase tracking-widest text-neutral-400 mb-4">보유 인증</h2>
                <div className="flex flex-wrap gap-2">
                  {certifications.map((cert: string, i: number) => (
                    <span key={i}
                      className="inline-flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 rounded-lg border"
                      style={{ color: '#533afd', borderColor: 'rgba(83,58,253,0.2)', background: 'rgba(83,58,253,0.04)' }}>
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      {resolveCertificationLabel(cert)}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ─── RIGHT: Key facts sidebar + CTA ─── */}
          <div className="lg:sticky lg:top-[72px]">
            {/* Company icon */}
            {company.icon_url && (
              <div className="flex items-center gap-3 mb-6">
                <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-neutral-200 bg-white shrink-0">
                  <Image src={company.icon_url} alt={company.name} fill className="object-contain p-1" />
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-[#061b31]">{company.name}</p>
                  <p className="text-[12px] text-neutral-400">{categoryLabel}</p>
                </div>
              </div>
            )}

            {/* CTA buttons */}
            <div className="flex flex-col gap-2.5 mb-8">
              {hasWebsite && (
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 text-[14px] font-semibold text-white py-3.5 px-5 rounded-xl transition-all hover:brightness-90 active:scale-[0.99]"
                  style={{ background: '#533afd' }}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  웹사이트 방문하기
                </a>
              )}
              {hasPhone && (
                <a
                  href={`tel:${company.phone}`}
                  className="flex items-center justify-center gap-2 text-[14px] font-semibold py-3.5 px-5 rounded-xl border transition-all hover:bg-neutral-50"
                  style={{ color: '#533afd', borderColor: 'rgba(83,58,253,0.25)' }}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {company.phone}
                </a>
              )}
              {hasEmail && !hasWebsite && !hasPhone && (
                <a
                  href={`mailto:${company.email}`}
                  className="flex items-center justify-center gap-2 text-[14px] font-semibold text-white py-3.5 px-5 rounded-xl transition-all hover:brightness-90"
                  style={{ background: '#533afd' }}
                >
                  이메일 문의
                </a>
              )}
            </div>

            {/* Key facts */}
            <div className="border border-neutral-200 rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-neutral-100">
                <h3 className="text-[12px] font-semibold uppercase tracking-widest text-neutral-400">핵심 정보</h3>
              </div>
              <div className="divide-y divide-neutral-100">
                {keyFacts.slice(0, 8).map((fact, i) => (
                  <div key={i} className="flex items-start gap-3 px-5 py-3.5">
                    <span className="text-[12px] text-neutral-400 shrink-0 pt-0.5 min-w-[56px]">{fact.label}</span>
                    <span className={`text-[13px] font-medium leading-snug ${fact.accent ? '' : 'text-[#061b31]'}`}
                      style={fact.accent ? { color: '#533afd' } : undefined}>
                      {fact.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Data source note */}
            {company.data_source && (
              <p className="text-[11px] text-neutral-300 text-center mt-4 leading-relaxed">
                {company.data_source === 'naver_local' ? '출처: 네이버 지역 검색' :
                 company.data_source === 'public_data_portal' ? '출처: 공공데이터 포털' :
                 company.data_source === 'website_crawl' ? '출처: 업체 웹사이트' :
                 '공개 출처 자동 수집'}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ── CTA banner (above footer) ── */}
      <section className="mt-20 mb-0 border-t border-neutral-100">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 py-16 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <p className="text-[22px] sm:text-[28px] font-light tracking-tight text-[#061b31] mb-1">
              {company.name}에 문의하시겠어요?
            </p>
            <p className="text-[14px] text-neutral-400">지금 바로 연락해 견적·납기·샘플을 확인하세요.</p>
          </div>
          {hasWebsite ? (
            <a
              href={company.website}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 flex items-center gap-2 text-[14px] font-semibold text-white py-3.5 px-7 rounded-xl transition-all hover:brightness-90 whitespace-nowrap"
              style={{ background: '#533afd' }}
            >
              웹사이트 방문하기
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          ) : hasPhone ? (
            <a
              href={`tel:${company.phone}`}
              className="shrink-0 flex items-center gap-2 text-[14px] font-semibold text-white py-3.5 px-7 rounded-xl transition-all hover:brightness-90 whitespace-nowrap"
              style={{ background: '#533afd' }}
            >
              전화 문의
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          ) : null}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-neutral-100 bg-neutral-50">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-[13px] font-semibold" style={{ color: '#533afd' }}>Packlinx</p>
            <p className="text-[11px] text-neutral-400 mt-1">
              한국 패키징 업체 디렉터리 · 공개 출처 자동 수집 데이터
            </p>
          </div>
          <div className="flex flex-wrap gap-4 text-[12px] text-neutral-400">
            <Link href="/privacy" className="hover:text-neutral-600 transition-colors">개인정보처리방침</Link>
            <Link href="/terms" className="hover:text-neutral-600 transition-colors">이용약관</Link>
            <Link href="/opt-out" className="hover:text-neutral-600 transition-colors">정보 수정 요청</Link>
          </div>
        </div>
      </footer>

      {/* ── Mobile sticky CTA ── */}
      {(hasWebsite || hasPhone) && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-neutral-200 px-4 py-3">
          <div className="flex gap-2.5">
            {hasWebsite && (
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 text-[14px] font-semibold text-white py-3.5 rounded-xl transition-all"
                style={{ background: '#533afd' }}
              >
                웹사이트 방문
              </a>
            )}
            {hasPhone && (
              <a
                href={`tel:${company.phone}`}
                className={`flex items-center justify-center gap-2 text-[14px] font-semibold py-3.5 rounded-xl border transition-all ${hasWebsite ? 'w-14' : 'flex-1'}`}
                style={{ color: '#533afd', borderColor: 'rgba(83,58,253,0.25)' }}
                aria-label={hasWebsite ? '전화 문의' : undefined}
              >
                {hasWebsite ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {company.phone}
                  </>
                )}
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
