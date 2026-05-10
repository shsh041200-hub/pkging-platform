import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import {
  INDUSTRY_CATEGORIES,
  INDUSTRY_CATEGORY_LABELS,
  INDUSTRY_CATEGORY_ICONS,
  INDUSTRY_CATEGORY_DESCRIPTIONS,
} from '@/types'

export const metadata: Metadata = {
  title: '[Preview V3] Discovery-first 디렉토리 — Packlinx',
  robots: { index: false, follow: false },
}

const CATEGORY_COLORS: Record<string, string> = {
  'food-beverage':          'from-green-50 to-white border-green-200 hover:border-green-400',
  'ecommerce-shipping':     'from-blue-50 to-white border-blue-200 hover:border-blue-400',
  'cosmetics-beauty':       'from-pink-50 to-white border-pink-200 hover:border-pink-400',
  'pharma-health':          'from-purple-50 to-white border-purple-200 hover:border-purple-400',
  'electronics-industrial': 'from-gray-50 to-white border-gray-200 hover:border-gray-400',
}

const VERIFIED_VENDORS = [
  { name: '삼성포장', category: '이커머스·배송 포장', cert: 'ISO 9001', verified: '2026-05' },
  { name: '한국친환경포장', category: '식품·음료 포장', cert: 'FSC 인증', verified: '2026-05' },
  { name: '코스팩', category: '화장품·뷰티 포장', cert: 'ISO 22716', verified: '2026-05' },
]

const METHODOLOGY_STEPS = [
  { step: '01', title: '공개 출처 수집', desc: '사업자등록·공식 웹사이트·인증기관 데이터베이스에서 업체 정보를 수집합니다.' },
  { step: '02', title: '인증 교차 검증', desc: '인증서 유효기간·발급기관을 교차 확인, 만료 인증은 표시를 제거합니다.' },
  { step: '03', title: '정기 업데이트', desc: '매월 업체 정보를 재검증하여 최신 상태를 유지합니다.' },
]

export default async function MainV3Page() {
  const supabase = await createClient()

  const [{ count: totalCount }, ...categoryCountResults] = await Promise.all([
    supabase.from('companies').select('*', { count: 'exact', head: true }),
    ...INDUSTRY_CATEGORIES.map((cat) =>
      supabase.from('companies').select('*', { count: 'exact', head: true }).contains('industry_categories', [cat])
    ),
  ])

  const categoryCounts: Record<string, number> = {}
  INDUSTRY_CATEGORIES.forEach((cat, i) => {
    categoryCounts[cat] = categoryCountResults[i].count ?? 0
  })

  const buildYear = new Date().getFullYear()
  const buildMonth = new Date().getMonth() + 1

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Slim search bar + trust line */}
      <section className="bg-white border-b border-border-v04 px-5 sm:px-8 py-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center gap-3">
          <form method="GET" action="/" className="flex-1 flex rounded-lg overflow-hidden border border-gray-200 focus-within:border-stripe-purple focus-within:shadow-[0_0_0_3px_var(--color-stripe-purple-ring)] transition-shadow max-w-[560px]">
            <input
              name="q"
              placeholder="업체명, 제품, 인증으로 검색..."
              className="flex-1 px-4 py-2.5 text-[14px] text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none"
            />
            <button
              type="submit"
              className="bg-stripe-purple hover:bg-stripe-purple-hover text-white font-semibold px-4 py-2 transition-colors text-[13px] flex-shrink-0 m-1 rounded-md focus-visible:outline-2 focus-visible:outline-stripe-purple"
            >
              검색
            </button>
          </form>
          <div className="flex items-center gap-3 text-[12px] text-gray-400 flex-shrink-0">
            <span className="font-semibold text-gray-700">{totalCount?.toLocaleString()}개</span>
            <span>{buildYear}년 {buildMonth}월 기준 검증</span>
            <span>·</span>
            <Link href="/guides/packaging-material-complete-guide" className="text-stripe-purple hover:underline">
              검증 방법론 →
            </Link>
          </div>
        </div>
      </section>

      {/* Hero = Category grid (primary surface) */}
      <section className="px-5 sm:px-8 pt-8 pb-6">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-[22px] sm:text-[30px] font-light text-heading-deep-navy leading-[1.2] tracking-[-0.4px] mb-2">
            어떤 포장재를 찾고 계신가요?
          </h1>
          <p className="text-[13px] text-gray-400 mb-6">업종을 선택하면 맞는 업체 목록으로 이동합니다.</p>

          {/* Large category tiles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {INDUSTRY_CATEGORIES.map((cat) => (
              <Link
                key={cat}
                href={`/categories/${cat}`}
                className={`group relative flex flex-col bg-gradient-to-b ${CATEGORY_COLORS[cat]} border rounded-xl p-5 transition-all duration-200 hover:shadow-[var(--shadow-elevated-v04)] hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-stripe-purple`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl" aria-hidden="true">{INDUSTRY_CATEGORY_ICONS[cat]}</span>
                  <span className="text-[12px] font-semibold text-gray-500 tabular-nums">
                    {(categoryCounts[cat] ?? 0).toLocaleString()}개 업체
                  </span>
                </div>
                <h2 className="text-[16px] font-semibold text-heading-deep-navy group-hover:text-stripe-purple transition-colors mb-1">
                  {INDUSTRY_CATEGORY_LABELS[cat]}
                </h2>
                <p className="text-[12px] text-gray-500 leading-relaxed flex-1">
                  {INDUSTRY_CATEGORY_DESCRIPTIONS[cat]}
                </p>
                <div className="mt-3 flex items-center gap-1 text-[12px] font-medium text-stripe-purple opacity-0 group-hover:opacity-100 transition-opacity">
                  업체 보기
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
            {/* Printing & design as 6th tile */}
            <Link
              href="/services/printing-design"
              className="group relative flex flex-col bg-gradient-to-b from-slate-50 to-white border border-slate-200 hover:border-slate-400 rounded-xl p-5 transition-all duration-200 hover:shadow-[var(--shadow-elevated-v04)] hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-stripe-purple"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl" aria-hidden="true">🖨️</span>
                <span className="text-[12px] font-semibold text-gray-500">서비스</span>
              </div>
              <h2 className="text-[16px] font-semibold text-heading-deep-navy group-hover:text-stripe-purple transition-colors mb-1">
                인쇄·디자인 서비스
              </h2>
              <p className="text-[12px] text-gray-500 leading-relaxed flex-1">
                패키지 인쇄·디자인, 소량 맞춤 인쇄, 브랜드 패키징 전문 업체
              </p>
              <div className="mt-3 flex items-center gap-1 text-[12px] font-medium text-stripe-purple opacity-0 group-hover:opacity-100 transition-opacity">
                업체 보기
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* "이번 주 검증된 vendor" live feed */}
      <section className="px-5 sm:px-8 py-6 border-t border-border-v04">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" aria-hidden="true" />
              <p className="text-[13px] font-semibold text-gray-800">이번 주 검증된 vendor</p>
            </div>
            <Link href="/" className="text-[11px] text-stripe-purple hover:underline">전체 목록 →</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {VERIFIED_VENDORS.map((v) => (
              <div
                key={v.name}
                className="flex items-center gap-3 bg-white border border-border-v04 rounded-lg px-4 py-3"
              >
                <div className="w-8 h-8 bg-stripe-purple/8 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-stripe-purple font-bold text-[13px]">{v.name[0]}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-gray-800 truncate">{v.name}</p>
                  <p className="text-[11px] text-gray-400 truncate">{v.category}</p>
                </div>
                <span className="text-[10px] font-semibold text-green-700 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded flex-shrink-0">
                  {v.cert}
                </span>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-gray-300 mt-3">
            * 이 목록은 샘플 데이터입니다. 실제 서비스에서는 최신 검증 업체가 자동 표시됩니다.
          </p>
        </div>
      </section>

      {/* Vendor register — fold 안 */}
      <section className="px-5 sm:px-8 py-4 border-t border-border-v04 bg-stripe-purple/4">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <p className="text-[13px] text-gray-700">
            <span className="font-semibold">패키징 업체이신가요?</span>
            {' '}— 무료로 등록하면 구매자에게 직접 노출됩니다.
          </p>
          <Link
            href="/opt-out?type=register"
            className="flex-shrink-0 border border-stripe-purple text-stripe-purple hover:bg-stripe-purple hover:text-white font-semibold px-4 py-2 rounded-lg text-[13px] transition-colors focus-visible:outline-2 focus-visible:outline-stripe-purple"
          >
            업체 등록 →
          </Link>
        </div>
      </section>

      {/* Guide + methodology block */}
      <section className="px-5 sm:px-8 py-8 border-t border-border-v04 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {/* Guides */}
            <div>
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-4">패키징 실무 가이드</p>
              <div className="space-y-3">
                {[
                  { slug: 'packaging-material-complete-guide', title: '패키징 소재 완벽 가이드', tag: '소재' },
                  { slug: 'food-packaging-materials', title: '식품 포장재 소재 선택', tag: '식품' },
                  { slug: 'eco-friendly-packaging', title: '친환경 포장재 가이드', tag: '친환경' },
                ].map((g) => (
                  <Link
                    key={g.slug}
                    href={`/guides/${g.slug}`}
                    className="group flex items-center gap-3 p-3 rounded-lg hover:bg-stripe-purple/4 transition-all focus-visible:outline-2 focus-visible:outline-stripe-purple"
                  >
                    <span className="text-[10px] font-semibold text-stripe-purple bg-stripe-purple/8 border border-stripe-purple/15 px-2 py-0.5 rounded flex-shrink-0">
                      {g.tag}
                    </span>
                    <span className="text-[13px] font-semibold text-gray-800 group-hover:text-stripe-purple transition-colors flex-1">
                      {g.title}
                    </span>
                    <svg className="w-4 h-4 text-gray-300 group-hover:text-stripe-purple flex-shrink-0 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                ))}
                <Link href="/guides" className="text-[12px] text-stripe-purple hover:underline pl-3">전체 가이드 보기 →</Link>
              </div>
            </div>

            {/* Methodology */}
            <div>
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-4">검증 방법론</p>
              <div className="space-y-4">
                {METHODOLOGY_STEPS.map((s) => (
                  <div key={s.step} className="flex gap-3">
                    <span className="text-[11px] font-bold text-stripe-purple bg-stripe-purple/8 rounded px-2 py-0.5 self-start flex-shrink-0">
                      {s.step}
                    </span>
                    <div>
                      <p className="text-[13px] font-semibold text-gray-800 mb-0.5">{s.title}</p>
                      <p className="text-[12px] text-gray-500 leading-relaxed">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile viewport label (dev only) */}
      <div className="fixed bottom-4 left-4 text-[10px] font-mono bg-black/70 text-white px-2 py-1 rounded pointer-events-none z-50 sm:hidden" aria-hidden="true">
        360px · V3
      </div>
      <div className="fixed bottom-4 left-4 text-[10px] font-mono bg-black/70 text-white px-2 py-1 rounded pointer-events-none z-50 hidden sm:block" aria-hidden="true">
        ≥640px · V3
      </div>
    </div>
  )
}
