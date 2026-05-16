import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { SiteHeader } from '@/components/SiteHeader'
import {
  CATEGORY_LABELS,
  INDUSTRY_CATEGORY_LABELS,
  INDUSTRY_CATEGORY_ICONS,
  CERTIFICATION_TYPES,
  type Category,
  type IndustryCategory,
} from '@/types'
import { HeroCarousel } from './HeroCarousel'
import { GalleryLightbox } from './GalleryLightbox'

export const metadata: Metadata = {
  title: '[미리보기] 업체 상세 V2 — Portfolio-first',
  robots: { index: false, follow: false },
}

// Prevent static generation — this is a dynamic internal preview
export const dynamic = 'force-dynamic'

type Props = {
  params: Promise<{ slug: string }>
}

function resolveCertLabel(raw: string): string {
  const found = CERTIFICATION_TYPES.find(
    (c) => c.id === raw || c.aliases.some((a) => a.toLowerCase() === raw.toLowerCase()),
  )
  return found?.label ?? raw
}

function getOptimizedUrl(url: string) {
  if (!url) return url
  if (url.includes('/storage/v1/object/public/')) return `${url}?width=1200&format=webp`
  return url
}

export default async function VendorDetailV2({ params }: Props) {
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
    .select('id, title, description, image_url, display_order, category_tag')
    .eq('company_id', company.id)
    .order('display_order', { ascending: true })

  const allPortfolios = portfolios ?? []

  // Hero: up to 6 images from portfolios
  const heroImages = allPortfolios
    .filter((p) => !!p.image_url)
    .slice(0, 6)
    .map((p) => ({
      url: getOptimizedUrl(p.image_url!),
      title: p.title,
      alt: p.title ?? `${company.name} 작업물`,
    }))

  // Gallery: all portfolios (up to 16 slots)
  const galleryItems = allPortfolios.slice(0, 16).map((p) => ({
    id: p.id,
    url: p.image_url ? getOptimizedUrl(p.image_url) : '',
    title: p.title,
    description: p.description,
    category_tag: p.category_tag,
  }))

  const industryCats = (company.industry_categories as string[] | null) ?? []
  const certifications = (company.certifications as string[] | null) ?? []
  const serviceCapabilities = (company.service_capabilities as string[] | null) ?? []

  const hasPhone = !!company.phone
  const hasEmail = !!company.email
  const hasWebsite = !!company.website
  const hasAnyContact = hasPhone || hasEmail || hasWebsite

  const foundedYearsAgo = company.founded_year
    ? new Date().getFullYear() - (company.founded_year as number)
    : null

  return (
    <div className="min-h-screen bg-neutral-50">
      <SiteHeader />

      {/* Internal preview banner */}
      <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-center">
        <p className="text-[12px] font-medium text-amber-700">
          내부 미리보기 — noindex 적용됨 · PACAA-739 리뉴얼안 V2
        </p>
      </div>

      {/* Breadcrumb */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-4 pb-0">
        <nav className="flex items-center gap-1.5 text-[13px] text-neutral-500" aria-label="경로">
          <Link href="/" className="hover:text-stripe-purple transition-colors">Packlinx</Link>
          <span className="text-neutral-300">›</span>
          {industryCats[0] && (
            <>
              <Link
                href={`/categories/${industryCats[0]}`}
                className="hover:text-stripe-purple transition-colors"
              >
                {INDUSTRY_CATEGORY_LABELS[industryCats[0] as IndustryCategory] ?? industryCats[0]}
              </Link>
              <span className="text-neutral-300">›</span>
            </>
          )}
          <span className="text-neutral-400 truncate max-w-[180px]">{company.name}</span>
        </nav>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-4 pb-20">

        {/* ── Two-column desktop layout ── */}
        <div className="lg:grid lg:grid-cols-[1fr_300px] lg:gap-8 lg:items-start">

          {/* ──── LEFT COLUMN ──── */}
          <div className="space-y-5">

            {/* ═══ HERO CAROUSEL ═══ */}
            <div className="bg-white border border-border-v04 rounded-2xl overflow-hidden"
              style={{ boxShadow: 'var(--shadow-elevated-v04)' }}>
              <HeroCarousel images={heroImages} vendorName={company.name} />

              {/* Identity strip below hero image */}
              <div className="px-5 sm:px-6 py-4">

                {/* Company name + verified */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h1 className="text-[22px] sm:text-[26px] font-semibold text-heading-deep-navy tracking-[-0.02em] leading-tight">
                      {company.name}
                    </h1>
                    {company.description && (
                      <p className="text-[14px] text-body-secondary mt-1 leading-snug line-clamp-2">
                        {company.description}
                      </p>
                    )}
                  </div>
                  {company.is_verified && (
                    <span className="shrink-0 inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-full">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      인증업체
                    </span>
                  )}
                </div>

                {/* Specialty chips */}
                <div className="flex flex-wrap gap-1.5">
                  {industryCats.map((cat) => (
                    <span key={cat}
                      className="inline-flex items-center gap-1 text-[12px] font-medium text-stripe-purple bg-[#eef0ff] px-2.5 py-1 rounded-full">
                      <span>{INDUSTRY_CATEGORY_ICONS[cat as IndustryCategory] ?? '📦'}</span>
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
                  {foundedYearsAgo && (
                    <span className="text-[12px] font-medium text-neutral-500 bg-neutral-100 px-2.5 py-1 rounded-full">
                      {foundedYearsAgo}년 업력
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* ── Mobile profile card (shown below hero on mobile) ── */}
            <div className="lg:hidden">
              <ProfileCard company={company} hasAnyContact={hasAnyContact} />
            </div>

            {/* ═══ KEY STATS ═══ */}
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
                        <span className="text-[11px] font-medium text-body-secondary ml-0.5">{(company.moq_unit as string | null) ?? '개'}</span>
                      </p>
                    </div>
                  )}
                  {company.lead_time_standard_days != null && (
                    <div className="bg-brand-50 border border-brand-100 rounded-xl p-3 text-center">
                      <p className="text-[9px] font-semibold text-brand-700 uppercase tracking-widest mb-1">납기</p>
                      <p className="text-[18px] font-bold text-heading-deep-navy leading-tight">
                        {company.lead_time_standard_days}
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

            {/* ═══ RECENT WORK GALLERY ═══ */}
            <div className="bg-white border border-border-v04 rounded-2xl p-5 sm:p-6"
              style={{ boxShadow: 'var(--shadow-card-v04)' }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[16px] font-semibold text-heading-deep-navy tracking-[-0.01em]">최근 작업</h2>
                {galleryItems.length > 0 && (
                  <span className="text-[12px] text-neutral-400">{galleryItems.length}개</span>
                )}
              </div>
              <GalleryLightbox items={galleryItems} />
            </div>

            {/* ═══ ABOUT ═══ */}
            {company.description && (
              <div className="bg-white border border-border-v04 rounded-2xl p-5 sm:p-6"
                style={{ boxShadow: 'var(--shadow-card-v04)' }}>
                <h2 className="text-[16px] font-semibold text-heading-deep-navy tracking-[-0.01em] mb-3">업체 소개</h2>
                <p className="text-[14px] text-body-secondary leading-relaxed">{company.description}</p>

                {/* Key clients */}
                {company.key_clients && (company.key_clients as string[]).length > 0 && (
                  <div className="mt-4 pt-4 border-t border-neutral-100">
                    <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-widest mb-2">주요 거래처</p>
                    <div className="flex flex-wrap gap-2">
                      {(company.key_clients as string[]).map((client) => (
                        <span key={client} className="text-[12px] text-neutral-600 bg-neutral-50 border border-neutral-200 px-2.5 py-1 rounded">
                          {client}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Target industries */}
                {company.target_industries && (company.target_industries as string[]).length > 0 && (
                  <div className="mt-3 pt-3 border-t border-neutral-100">
                    <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-widest mb-2">주요 납품 업종</p>
                    <div className="flex flex-wrap gap-2">
                      {(company.target_industries as string[]).map((ind) => (
                        <span key={ind} className="text-[12px] text-neutral-600 bg-neutral-50 border border-neutral-200 px-2.5 py-1 rounded">
                          {ind}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ═══ REVIEWS ═══ */}
            <div className="bg-white border border-border-v04 rounded-2xl p-5 sm:p-6"
              style={{ boxShadow: 'var(--shadow-card-v04)' }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[16px] font-semibold text-heading-deep-navy tracking-[-0.01em]">후기</h2>
                <div className="flex items-center gap-1 text-[13px] text-neutral-400">
                  <svg className="w-4 h-4 text-neutral-300" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span>데이터 없음</span>
                </div>
              </div>

              {/* Empty state — no fake reviews */}
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="w-14 h-14 rounded-full bg-neutral-100 flex items-center justify-center mb-4">
                  <svg className="w-7 h-7 text-neutral-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <p className="text-[14px] font-medium text-neutral-600">아직 등록된 후기가 없습니다</p>
                <p className="text-[12px] text-neutral-400 mt-1 mb-5">
                  이 업체와 거래한 경험이 있다면 첫 번째 후기를 남겨주세요
                </p>
                <button
                  disabled
                  className="inline-flex items-center gap-2 text-[13px] font-semibold text-stripe-purple border border-stripe-purple-ring bg-stripe-purple-soft px-4 py-2.5 rounded-lg opacity-60 cursor-not-allowed"
                  title="후기 기능 준비 중"
                >
                  첫 후기 작성하기
                </button>
                <p className="text-[11px] text-neutral-300 mt-2">후기 기능 준비 중</p>
              </div>
            </div>

          </div>

          {/* ──── RIGHT COLUMN (Desktop sticky sidebar) ──── */}
          <div className="hidden lg:block">
            <div className="sticky top-6 space-y-4">
              <ProfileCard company={company} hasAnyContact={hasAnyContact} />
            </div>
          </div>

        </div>
      </main>

      {/* Mobile sticky CTA bar */}
      {hasAnyContact && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-border-v04 px-4 py-3 safe-area-inset-bottom"
          style={{ boxShadow: '0 -4px 16px rgba(50,50,93,0.08)' }}>
          <div className="flex gap-2">
            {hasWebsite && (
              <a href={company.website}
                target="_blank" rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-1.5 text-[14px] font-semibold text-white bg-stripe-purple hover:bg-stripe-purple-hover py-3 rounded-xl transition-colors">
                웹사이트 방문
              </a>
            )}
            {hasPhone && (
              <a href={`tel:${company.phone}`}
                className="flex-1 flex items-center justify-center gap-1.5 text-[14px] font-semibold text-stripe-purple border border-stripe-purple-ring bg-stripe-purple-soft py-3 rounded-xl transition-colors">
                전화 문의
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Shared profile card (used in both mobile + desktop) ── */
function ProfileCard({
  company,
  hasAnyContact,
}: {
  company: Record<string, unknown>
  hasAnyContact: boolean
}) {
  const hasPhone = !!company.phone
  const hasEmail = !!company.email
  const hasWebsite = !!company.website
  const categoryLabel = CATEGORY_LABELS[company.category as Category] ?? (company.category as string)

  return (
    <div className="bg-white border border-border-v04 rounded-2xl overflow-hidden"
      style={{ boxShadow: 'var(--shadow-elevated-v04)' }}>

      {/* Header */}
      <div className="p-5 border-b border-neutral-100">
        {/* Icon / logo */}
        <div className="flex items-center gap-3 mb-3">
          {company.icon_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={company.icon_url as string}
              alt={`${company.name as string} 로고`}
              className="w-12 h-12 rounded-xl object-contain border border-neutral-100 bg-white"
            />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-stripe-purple/20 to-stripe-purple/5 flex items-center justify-center border border-stripe-purple-ring/30">
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

        {/* Quick stats */}
        <div className="space-y-1.5 text-[13px] text-neutral-600">
          {!!company.founded_year && (
            <div className="flex items-center gap-2">
              <svg className="w-3.5 h-3.5 text-neutral-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>설립 {company.founded_year as number}년</span>
            </div>
          )}
          {!!company.address && (
            <div className="flex items-start gap-2">
              <svg className="w-3.5 h-3.5 text-neutral-300 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-neutral-500 text-[12px] leading-snug">{company.address as string}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <svg className="w-3.5 h-3.5 text-neutral-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-neutral-400 text-[12px]">평균 응답 시간 — 데이터 없음</span>
          </div>
        </div>
      </div>

      {/* CTA buttons */}
      {hasAnyContact && (
        <div className="p-4 space-y-2">
          {hasWebsite && (
            <a href={company.website as string}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full text-[14px] font-semibold text-white bg-stripe-purple hover:bg-stripe-purple-hover py-2.5 rounded-xl transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              웹사이트 방문
            </a>
          )}
          {hasPhone && (
            <a href={`tel:${company.phone as string}`}
              className="flex items-center justify-center gap-2 w-full text-[14px] font-semibold text-stripe-purple border border-stripe-purple-ring bg-stripe-purple-soft hover:bg-stripe-purple-tint py-2.5 rounded-xl transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              {company.phone as string}
            </a>
          )}
          {hasEmail && (
            <a href={`mailto:${company.email as string}`}
              className="flex items-center justify-center gap-2 w-full text-[13px] font-medium text-neutral-600 border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 py-2.5 rounded-xl transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              이메일 문의
            </a>
          )}
        </div>
      )}

      {/* Disclaimer */}
      <div className="px-4 pb-4 pt-0">
        <p className="text-[10px] text-neutral-300 text-center leading-relaxed">
          본 페이지는 공개 정보를 기반으로 제공됩니다
        </p>
      </div>
    </div>
  )
}
