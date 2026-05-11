import type { Metadata } from 'next'
import Link from 'next/link'
import { PacklinxLogo } from '@/components/PacklinxLogo'
import { BusinessRegistrationInfo } from '@/components/BusinessRegistrationInfo'
import {
  INDUSTRY_CATEGORIES,
  INDUSTRY_CATEGORY_LABELS,
  INDUSTRY_CATEGORY_DESCRIPTIONS,
  INDUSTRY_CATEGORY_ICONS,
  type IndustryCategory,
} from '@/types'
import { createClient } from '@/lib/supabase/server'

export const revalidate = 300

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.packlinx.com'

export const metadata: Metadata = {
  title: '패키징 카테고리 — 전국 포장재 업체 분야별 검색',
  description:
    '식품·이커머스·화장품·의약·전자 등 분야별 전국 패키징 업체를 한눈에 비교하세요. Packlinx 카테고리 디렉토리.',
  alternates: { canonical: `${siteUrl}/categories` },
  openGraph: {
    title: '패키징 카테고리 — 전국 포장재 업체 분야별 검색',
    description:
      '식품·이커머스·화장품·의약·전자 등 분야별 전국 패키징 업체를 한눈에 비교하세요. Packlinx 카테고리 디렉토리.',
    url: `${siteUrl}/categories`,
    siteName: 'Packlinx',
    locale: 'ko_KR',
    type: 'website',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: '패키징 카테고리',
  description: '분야별 전국 패키징 업체 디렉토리',
  url: `${siteUrl}/categories`,
  inLanguage: 'ko',
  isPartOf: { '@type': 'WebSite', url: siteUrl, name: 'Packlinx' },
}

export default async function CategoriesIndexPage() {
  const supabase = await createClient()

  // Category counts
  const categoryCountResults = await Promise.all(
    INDUSTRY_CATEGORIES.map((cat) =>
      supabase
        .from('companies')
        .select('*', { count: 'exact', head: true })
        .contains('industry_categories', [cat])
    )
  )

  const categoryCounts: Record<string, number> = {}
  INDUSTRY_CATEGORIES.forEach((cat, i) => {
    categoryCounts[cat] = categoryCountResults[i].count ?? 0
  })

  // Top 3 vendor names per category for preview chips
  const topVendorResults = await Promise.all(
    INDUSTRY_CATEGORIES.map((cat) =>
      supabase
        .from('companies')
        .select('name')
        .contains('industry_categories', [cat])
        .order('is_verified', { ascending: false })
        .order('cert_count', { ascending: false })
        .order('name', { ascending: true })
        .limit(3)
    )
  )

  const topVendors: Record<string, string[]> = {}
  INDUSTRY_CATEGORIES.forEach((cat, i) => {
    topVendors[cat] = (topVendorResults[i].data ?? []).map((c) => c.name)
  })

  const activeCategories = INDUSTRY_CATEGORIES.filter((cat) => categoryCounts[cat] > 0)
  const emptyCategories = INDUSTRY_CATEGORIES.filter((cat) => categoryCounts[cat] === 0)
  const totalVendors = Object.values(categoryCounts).reduce((sum, n) => sum + n, 0)

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Header — V05 white style */}
      <header className="bg-white sticky top-0 z-50 border-b border-border-v04">
        <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <PacklinxLogo variant="light" />
          </Link>
          <nav className="flex items-center gap-4 text-sm text-neutral-500">
            <Link href="/" className="hover:text-heading-deep-navy transition-colors">
              전체 업체 보기
            </Link>
            <Link
              href="/categories"
              aria-current="page"
              className="text-heading-deep-navy font-semibold"
            >
              카테고리
            </Link>
            <Link href="/guides" className="hover:text-heading-deep-navy transition-colors">
              가이드
            </Link>
          </nav>
        </div>
      </header>

      {/* Page hero */}
      <section className="bg-white border-b border-border-v04 px-5 py-14 sm:py-20">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-[32px] sm:text-[44px] font-light text-heading-deep-navy leading-[1.1] tracking-[-0.03em] mb-4">
            분야별 패키징 업체 찾기
          </h1>
          <p className="text-[15px] text-neutral-500 leading-relaxed mb-3">
            카테고리를 선택해 내 제품에 맞는 업체를 빠르게 탐색하세요.
          </p>
          <p className="text-[13px] text-neutral-400">
            {totalVendors.toLocaleString()}개 업체 · {activeCategories.length}개 분야 · 무료 이용
          </p>
        </div>
      </section>

      {/* Category grid */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-5 sm:px-8 py-12">

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {activeCategories.map((cat) => {
            const count = categoryCounts[cat]
            const vendors = topVendors[cat] ?? []
            const isThin = count > 0 && count < 10

            return (
              <Link
                key={cat}
                href={`/categories/${cat}`}
                className="group bg-white border border-border-v04 rounded-xl p-6 hover:border-stripe-purple/30 hover:shadow-[rgba(83,58,253,0.06)_0px_4px_16px] transition-all duration-200 flex flex-col gap-4"
              >
                {/* Icon + count row */}
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-xl bg-stripe-purple/6 flex items-center justify-center group-hover:bg-stripe-purple/10 transition-colors flex-shrink-0">
                    <span className="text-2xl leading-none">{INDUSTRY_CATEGORY_ICONS[cat as IndustryCategory]}</span>
                  </div>
                  <span className="text-[12px] font-semibold text-neutral-400 tabular-nums mt-1">
                    {count.toLocaleString()}개 업체
                  </span>
                </div>

                {/* Label + description */}
                <div>
                  <h2 className="text-[16px] font-semibold text-heading-deep-navy group-hover:text-stripe-purple transition-colors leading-snug mb-1.5">
                    {INDUSTRY_CATEGORY_LABELS[cat as IndustryCategory]}
                  </h2>
                  <p className="text-[13px] text-neutral-500 leading-relaxed">
                    {INDUSTRY_CATEGORY_DESCRIPTIONS[cat as IndustryCategory]}
                  </p>
                </div>

                {/* Vendor preview chips */}
                {vendors.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-auto pt-2 border-t border-border-v04">
                    {vendors.map((name) => (
                      <span
                        key={name}
                        className="text-[11px] text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-md truncate max-w-[120px]"
                      >
                        {name}
                      </span>
                    ))}
                    {isThin && (
                      <span className="text-[11px] text-neutral-400 italic self-center ml-0.5">
                        소규모 분야
                      </span>
                    )}
                  </div>
                )}

                {/* CTA arrow */}
                <div className="flex items-center gap-1 text-[13px] font-medium text-neutral-400 group-hover:text-stripe-purple transition-colors mt-auto">
                  <span>업체 보기</span>
                  <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            )
          })}
        </div>

        {/* Empty categories — polite treatment */}
        {emptyCategories.length > 0 && (
          <div className="mt-8 border border-border-v04 rounded-xl bg-white px-6 py-5">
            <p className="text-[13px] text-neutral-400 leading-relaxed">
              <span className="font-medium text-neutral-500">등록 예정 분야:</span>{' '}
              {emptyCategories
                .map((cat) => INDUSTRY_CATEGORY_LABELS[cat as IndustryCategory])
                .join(', ')}
              {' — 업체 등록 후 노출됩니다.'}
            </p>
          </div>
        )}

        {/* Back to full search */}
        <div className="mt-10 flex items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-stripe-purple hover:bg-stripe-purple-hover text-white text-[14px] font-medium px-5 py-2.5 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            업체명·제품으로 직접 검색
          </Link>
          <Link
            href="/guides"
            className="inline-flex items-center gap-2 border border-border-v04 bg-white hover:border-stripe-purple/30 text-heading-deep-navy text-[14px] font-medium px-5 py-2.5 rounded-lg transition-colors"
          >
            포장재 가이드 보기
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] bg-slate-900 mt-auto">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-col gap-2">
              <PacklinxLogo variant="dark" layout="horizontal" />
              <p className="text-[12px] text-slate-400 leading-relaxed">
                © 2026 PACKLINX. 본 서비스의 업체 정보는 공개된 출처에서 자동 수집되었습니다.<br className="hidden sm:inline" />
                정보 오류·삭제 요청: rpdla041200@gmail.com
              </p>
              <BusinessRegistrationInfo theme="dark" />
            </div>
            <div className="flex flex-wrap gap-5 text-[12px] text-slate-400">
              <a href="https://keywords.packlinx.com/keywords" className="hover:text-slate-200 transition-colors">키워드 디렉터리</a>
              <Link href="/guides" className="hover:text-slate-200 transition-colors">패키징 가이드</Link>
              <Link href="/privacy" className="hover:text-slate-200 transition-colors">개인정보처리방침</Link>
              <Link href="/terms" className="hover:text-slate-200 transition-colors">이용약관</Link>
              <Link href="/opt-out?type=takedown" className="hover:text-slate-200 transition-colors">권리침해 신고</Link>
              <Link href="/faq#what-is-jeongbo-deungrok" className="hover:text-slate-200 transition-colors">Packlinx 자체 등록 기준 안내</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
