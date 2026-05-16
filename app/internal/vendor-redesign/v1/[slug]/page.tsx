import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import {
  CATEGORY_LABELS,
  INDUSTRY_CATEGORY_LABELS,
  INDUSTRY_CATEGORY_ICONS,
  CERTIFICATION_TYPES,
  type Category,
  type IndustryCategory,
} from '@/types'
import { VendorModelBadge } from './VendorModelBadge'
import { VendorTradingBox } from './VendorTradingBox'

export const metadata: Metadata = {
  title: '[내부] 업체 상세 V1 — VendorModel Badge + TradingBox',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

// ── VendorModel type (shared with child components) ──────────────────────────
// 1차 신호: vendor_telesales_checks.result
//   found → 'B', not_found → 'A', exempt → 'unknown'
// BE 파이프라인(PACAA-XXX) 완료 후 실데이터 wire-up PR 별도 예정.
export type VendorModel = 'A' | 'B' | 'unknown'

function resolveCertLabel(raw: string): string {
  const found = CERTIFICATION_TYPES.find(
    (c) => c.id === raw || c.aliases.some((a) => a.toLowerCase() === raw.toLowerCase()),
  )
  return found?.label ?? raw
}

type Props = {
  params: Promise<{ slug: string }>
}

export default async function VendorDetailV1({ params }: Props) {
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
    .select('id, title, image_url, display_order')
    .eq('company_id', company.id)
    .order('display_order', { ascending: true })
    .limit(3)

  // ── VendorModel calculation ────────────────────────────────────────────────
  // Mock: 'A' until BE telesales pipeline (vendor_telesales_checks) is wired.
  // Wire-up PR: query vendor_telesales_checks with service-role client,
  //   map found→'B', not_found→'A', exempt→'unknown'.
  // Cast prevents TS narrowing — remove cast when real query is in place.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
  const vendorModel = 'A' as VendorModel

  // ── Derived data ──────────────────────────────────────────────────────────
  const industryCats = (company.industry_categories as string[] | null) ?? []
  const certifications = (company.certifications as string[] | null) ?? []
  const serviceCapabilities = (company.service_capabilities as string[] | null) ?? []
  const products = (company.products as string[] | null) ?? []
  const primaryIndustry = industryCats[0] as IndustryCategory | undefined

  const categoryLabel =
    (primaryIndustry ? INDUSTRY_CATEGORY_LABELS[primaryIndustry] : null) ??
    CATEGORY_LABELS[company.category as Category] ??
    (company.category as string)

  const hasPhone = !!company.phone
  const hasEmail = !!company.email
  const hasWebsite = !!company.website

  const heroPortfolio = portfolios?.[0]

  return (
    <div className="min-h-screen bg-neutral-50">

      {/* Internal preview banner */}
      <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-center">
        <p className="text-[12px] font-medium text-amber-700">
          내부 미리보기 — noindex 적용됨 · PACAA-749 V1 VendorModel Badge+TradingBox
          {' · '}vendorModel: <code className="font-mono bg-amber-100 px-1 rounded">{vendorModel}</code>
          {' '}(mock — BE 파이프라인 완료 후 실데이터 연결)
        </p>
      </div>

      {/* Nav */}
      <nav className="border-b border-neutral-100 bg-white sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="text-[15px] font-semibold tracking-tight text-stripe-purple">
            Packlinx
          </Link>
          <div className="flex items-center gap-6 text-[13px] text-neutral-500">
            <Link href="/companies" className="hover:text-neutral-900 transition-colors">업체 찾기</Link>
            <Link href="/guides" className="hover:text-neutral-900 transition-colors">구매 가이드</Link>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-28">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-[12px] text-neutral-400 mb-6" aria-label="경로">
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
          <span className="text-neutral-600 truncate max-w-[180px]">{company.name as string}</span>
        </nav>

        {/* ── Two-column layout ── */}
        <div className="lg:grid lg:grid-cols-[1fr_300px] lg:gap-8 lg:items-start">

          {/* ── LEFT COLUMN ── */}
          <div className="space-y-5">

            {/* Hero card */}
            <div className="bg-white border border-border-v04 rounded-2xl overflow-hidden"
              style={{ boxShadow: 'var(--shadow-elevated-v04)' }}>

              {/* Hero image */}
              {heroPortfolio?.image_url ? (
                <div className="relative w-full" style={{ aspectRatio: '16/7' }}>
                  <Image
                    src={`${heroPortfolio.image_url}?width=1200&format=webp`}
                    alt={heroPortfolio.title || (company.name as string)}
                    fill
                    sizes="(max-width: 1024px) 100vw, 760px"
                    className="object-cover"
                    priority
                  />
                </div>
              ) : (
                <div className="w-full bg-gradient-to-br from-neutral-100 to-neutral-50 flex items-center justify-center"
                  style={{ aspectRatio: '16/7', minHeight: '160px' }}>
                  <span className="text-[64px] sm:text-[96px] opacity-30 select-none">
                    {primaryIndustry ? (INDUSTRY_CATEGORY_ICONS[primaryIndustry] ?? '📦') : '📦'}
                  </span>
                </div>
              )}

              {/* Identity strip */}
              <div className="px-5 sm:px-6 py-4">
                {/* Name + badge row */}
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h1 className="text-[22px] sm:text-[26px] font-semibold text-heading-deep-navy tracking-[-0.02em] leading-tight">
                    {company.name as string}
                  </h1>
                  {company.is_verified && (
                    <span className="shrink-0 inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-full">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      인증업체
                    </span>
                  )}
                </div>

                {/* VendorModel badge — legal item 2 (i) tooltip baked inside */}
                <div className="mb-3">
                  <VendorModelBadge model={vendorModel} />
                </div>

                {company.description && (
                  <p className="text-[14px] text-body-secondary leading-snug line-clamp-2 mb-3">
                    {company.description as string}
                  </p>
                )}

                {/* Chips */}
                <div className="flex flex-wrap gap-1.5">
                  {industryCats.map((cat) => (
                    <span key={cat}
                      className="inline-flex items-center gap-1 text-[12px] font-medium text-stripe-purple bg-[#eef0ff] px-2.5 py-1 rounded-full">
                      <span aria-hidden="true">{INDUSTRY_CATEGORY_ICONS[cat as IndustryCategory] ?? '📦'}</span>
                      {INDUSTRY_CATEGORY_LABELS[cat as IndustryCategory] ?? cat}
                    </span>
                  ))}
                  {serviceCapabilities.slice(0, 4).map((cap) => (
                    <span key={cap}
                      className="text-[12px] font-medium text-neutral-600 bg-neutral-100 px-2.5 py-1 rounded-full">
                      {cap}
                    </span>
                  ))}
                  {certifications.slice(0, 3).map((cert) => (
                    <span key={cert}
                      className="text-[12px] font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                      {resolveCertLabel(cert)}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Mobile: TradingBox */}
            <div className="lg:hidden">
              <VendorTradingBox
                model={vendorModel}
                phone={(company.phone as string | null) ?? null}
                email={(company.email as string | null) ?? null}
                website={(company.website as string | null) ?? null}
                vendorName={company.name as string}
              />
            </div>

            {/* Key facts */}
            {(company.moq_value != null || company.lead_time_standard_days != null || company.sample_available != null) && (
              <div className="bg-white border border-border-v04 rounded-2xl p-5 sm:p-6"
                style={{ boxShadow: 'var(--shadow-card-v04)' }}>
                <h2 className="text-[11px] font-semibold text-neutral-400 uppercase tracking-widest mb-3">주요 정보</h2>
                <div className="grid grid-cols-3 gap-3">
                  {company.moq_value != null && (
                    <div className="bg-brand-50 border border-brand-100 rounded-xl p-3 text-center">
                      <p className="text-[9px] font-semibold text-brand-700 uppercase tracking-widest mb-1">최소주문</p>
                      <p className="text-[18px] font-bold text-heading-deep-navy leading-tight">
                        {Number(company.moq_value).toLocaleString()}
                        <span className="text-[11px] font-medium text-body-secondary ml-0.5">
                          {(company.moq_unit as string | null) ?? '개'}
                        </span>
                      </p>
                    </div>
                  )}
                  {company.lead_time_standard_days != null && (
                    <div className="bg-brand-50 border border-brand-100 rounded-xl p-3 text-center">
                      <p className="text-[9px] font-semibold text-brand-700 uppercase tracking-widest mb-1">납기</p>
                      <p className="text-[18px] font-bold text-heading-deep-navy leading-tight">
                        {company.lead_time_standard_days as number}
                        <span className="text-[11px] font-medium text-body-secondary ml-0.5">일</span>
                      </p>
                    </div>
                  )}
                  {company.sample_available != null && (
                    <div className="bg-brand-50 border border-brand-100 rounded-xl p-3 text-center">
                      <p className="text-[9px] font-semibold text-brand-700 uppercase tracking-widest mb-1">샘플</p>
                      <p className={`text-[13px] font-bold leading-tight ${company.sample_available ? 'text-emerald-700' : 'text-body-secondary'}`}>
                        {company.sample_available ? '가능' : '확인 필요'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* About */}
            {(company.description || products.length > 0) && (
              <div className="bg-white border border-border-v04 rounded-2xl p-5 sm:p-6"
                style={{ boxShadow: 'var(--shadow-card-v04)' }}>
                <h2 className="text-[16px] font-semibold text-heading-deep-navy tracking-[-0.01em] mb-3">업체 소개</h2>
                {company.description && (
                  <p className="text-[14px] text-body-secondary leading-relaxed">
                    {company.description as string}
                  </p>
                )}
                {products.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {products.map((p: string) => (
                      <span key={p} className="text-[12px] font-medium text-neutral-700 bg-neutral-100 px-2.5 py-1 rounded-lg border border-neutral-200">
                        {p}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>

          {/* ── RIGHT COLUMN (desktop sticky sidebar) ── */}
          <div className="hidden lg:block">
            <div className="sticky top-20 space-y-4">

              {/* Company identity mini-card */}
              <div className="bg-white border border-border-v04 rounded-2xl p-5"
                style={{ boxShadow: 'var(--shadow-elevated-v04)' }}>
                <div className="flex items-center gap-3 mb-4">
                  {company.icon_url ? (
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-neutral-100 bg-white shrink-0">
                      <Image
                        src={company.icon_url as string}
                        alt={`${company.name as string} 로고`}
                        fill
                        className="object-contain p-1"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-stripe-purple/20 to-stripe-purple/5 flex items-center justify-center border border-stripe-purple-ring/30 shrink-0">
                      <span className="text-xl font-semibold text-stripe-purple">
                        {(company.name as string).charAt(0)}
                      </span>
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-[15px] font-semibold text-heading-deep-navy leading-tight truncate">
                      {company.name as string}
                    </p>
                    <p className="text-[12px] text-neutral-400">{categoryLabel}</p>
                  </div>
                </div>

                {/* Contact facts */}
                <div className="space-y-1.5 text-[13px] text-neutral-600 mb-4">
                  {company.founded_year && (
                    <div className="flex items-center gap-2">
                      <svg className="w-3.5 h-3.5 text-neutral-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>설립 {company.founded_year as number}년</span>
                    </div>
                  )}
                  {company.address && (
                    <div className="flex items-start gap-2">
                      <svg className="w-3.5 h-3.5 text-neutral-300 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-neutral-500 text-[12px] leading-snug">{company.address as string}</span>
                    </div>
                  )}
                </div>

                {/* Desktop: TradingBox replaces old CTA buttons */}
                <VendorTradingBox
                  model={vendorModel}
                  phone={(company.phone as string | null) ?? null}
                  email={(company.email as string | null) ?? null}
                  website={(company.website as string | null) ?? null}
                  vendorName={company.name as string}
                />
              </div>
            </div>
          </div>

        </div>

        {/* ── Page footer — legal items 3 & 4 ──────────────────────────────── */}
        <footer className="mt-16 pt-6 border-t border-neutral-200 space-y-2">
          {/* Legal item 3: 분류 출처 표기 */}
          <p className="text-[11px] text-neutral-400 text-center leading-relaxed">
            분류 근거: 공정위 통신판매사업자 공시 + vendor 자가신고
          </p>
          {/* Legal item 4: Model B §20① 통신판매중개자 고지
              NOTE: 현재 사이트 공통 footer 에 §20① 통신판매중개자 면책 고지 미포함 확인됨.
              (terms/page.tsx 에만 존재) → 본 이슈에 별도 보고 포함. */}
          {vendorModel === 'B' && (
            <p className="text-[11px] text-neutral-400 text-center leading-relaxed">
              Packlinx는 「전자상거래 등에서의 소비자보호에 관한 법률」 제20조의
              통신판매중개자에 해당하지 않습니다.
            </p>
          )}
          <p className="text-[11px] text-neutral-300 text-center">
            <Link href="/terms" className="hover:text-neutral-500 transition-colors underline underline-offset-2">이용약관</Link>
            {' · '}
            <Link href="/privacy" className="hover:text-neutral-500 transition-colors underline underline-offset-2">개인정보처리방침</Link>
          </p>
        </footer>

      </main>

      {/* ── Mobile sticky CTA bar ── */}
      {(hasPhone || hasEmail || hasWebsite) && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-border-v04 px-4 py-3"
          style={{ boxShadow: '0 -4px 16px rgba(50,50,93,0.08)' }}>
          <div className="flex gap-2">
            {vendorModel === 'B' && (
              <a
                href={hasWebsite ? (company.website as string) : hasPhone ? `tel:${company.phone as string}` : `mailto:${company.email as string}`}
                target={hasWebsite ? '_blank' : undefined}
                rel={hasWebsite ? 'noopener noreferrer' : undefined}
                className="flex-1 flex items-center justify-center gap-1.5 text-[14px] font-semibold text-white bg-emerald-700 hover:bg-emerald-800 py-3 rounded-xl transition-colors"
              >
                샘플 신청
              </a>
            )}
            <a
              href={hasPhone ? `tel:${company.phone as string}` : hasEmail ? `mailto:${company.email as string}` : (company.website as string)}
              target={!hasPhone && !hasEmail ? '_blank' : undefined}
              rel={!hasPhone && !hasEmail ? 'noopener noreferrer' : undefined}
              className={`flex items-center justify-center gap-1.5 text-[14px] font-semibold py-3 rounded-xl transition-colors ${
                vendorModel === 'B'
                  ? 'w-14 border border-stripe-purple-ring text-stripe-purple bg-stripe-purple-soft hover:bg-stripe-purple-tint'
                  : 'flex-1 text-white bg-stripe-purple hover:bg-stripe-purple-hover'
              }`}
            >
              {vendorModel === 'B' ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-label="견적 문의">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              ) : '견적 문의'}
            </a>
          </div>
        </div>
      )}

    </div>
  )
}
