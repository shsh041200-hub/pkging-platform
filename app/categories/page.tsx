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

  const categoryCountResults = await Promise.all(
    INDUSTRY_CATEGORIES.map((cat) =>
      supabase.from('companies').select('*', { count: 'exact', head: true }).contains('industry_categories', [cat])
    )
  )

  const categoryCounts: Record<string, number> = {}
  INDUSTRY_CATEGORIES.forEach((cat, i) => {
    categoryCounts[cat] = categoryCountResults[i].count ?? 0
  })

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Header */}
      <header className="bg-[#0F172A] sticky top-0 z-50 border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <PacklinxLogo variant="dark" />
            <span className="hidden sm:inline text-slate-400 text-[11px] font-medium tracking-widest uppercase">패키징 업체 검색 플랫폼</span>
          </Link>
          <nav className="flex items-center gap-3">
            <Link
              href="/categories"
              aria-current="page"
              className="flex items-center gap-1.5 text-white text-sm font-semibold px-3.5 py-2 border border-white/[0.30] bg-white/[0.08] rounded-full focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-white/40 focus-visible:ring-offset-[#0F172A]"
            >
              <svg className="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
              </svg>
              카테고리
            </Link>
            <Link
              href="/services/printing-design"
              className="flex items-center gap-1.5 text-slate-200 hover:text-white text-sm font-medium px-3.5 py-2 border border-white/[0.15] hover:border-white/[0.30] hover:bg-white/[0.06] rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-white/40 focus-visible:ring-offset-[#0F172A]"
            >
              <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18.25 7.034l-.057-.022M6.75 7.034c-.018-.007-.036-.014-.057-.022" />
              </svg>
              인쇄·디자인
            </Link>
            <Link
              href="/guides"
              className="flex items-center gap-1.5 text-slate-200 hover:text-white text-sm font-medium px-3.5 py-2 border border-white/[0.15] hover:border-white/[0.30] hover:bg-white/[0.06] rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-white/40 focus-visible:ring-offset-[#0F172A]"
            >
              <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
              가이드
            </Link>
          </nav>
        </div>
      </header>

      {/* Page hero */}
      <section className="bg-white border-b border-gray-100 px-5 sm:px-8 py-10 sm:py-14">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-[28px] sm:text-[36px] font-extrabold text-[#0F172A] leading-tight tracking-[-0.02em] mb-3">
            분야별 패키징 업체 찾기
          </h1>
          <p className="text-[15px] text-[#64748B] leading-relaxed">
            카테고리를 선택해 내 제품에 맞는 업체를 빠르게 탐색하세요.
          </p>
        </div>
      </section>

      {/* Category grid */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-5 sm:px-8 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {INDUSTRY_CATEGORIES.filter((cat) => categoryCounts[cat] > 0).map((cat) => (
            <Link
              key={cat}
              href={`/categories/${cat}`}
              className="group flex items-start gap-4 bg-white border border-gray-200 rounded-xl px-5 py-5 hover:border-[#C2410C]/30 hover:bg-[#FFF7ED] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] transition-all duration-150"
            >
              <span className="text-[28px] leading-none flex-shrink-0 mt-0.5">{INDUSTRY_CATEGORY_ICONS[cat as IndustryCategory]}</span>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2 flex-wrap">
                  <span className="text-[16px] font-bold text-gray-900 group-hover:text-[#C2410C] transition-colors leading-tight">
                    {INDUSTRY_CATEGORY_LABELS[cat as IndustryCategory]}
                  </span>
                  <span className="text-[12px] font-medium text-gray-400 flex-shrink-0">
                    {categoryCounts[cat].toLocaleString()}개
                  </span>
                </div>
                <p className="text-[13px] text-gray-500 leading-relaxed mt-1">
                  {INDUSTRY_CATEGORY_DESCRIPTIONS[cat as IndustryCategory]}
                </p>
              </div>
              <svg className="w-5 h-5 text-gray-300 group-hover:text-[#C2410C] flex-shrink-0 self-center transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            업체명이나 제품으로 직접 검색하기
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] bg-[#0F172A] mt-auto">
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
            <div className="flex gap-5 text-[12px] text-slate-400">
              <Link href="/guides" className="hover:text-slate-200 transition-colors">패키징 가이드</Link>
              <Link href="/privacy" className="hover:text-slate-200 transition-colors">개인정보처리방침</Link>
              <Link href="/terms" className="hover:text-slate-200 transition-colors">이용약관</Link>
              <Link href="/opt-out?type=takedown" className="hover:text-slate-200 transition-colors">권리침해 신고</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
