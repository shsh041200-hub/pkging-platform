import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import {
  INDUSTRY_CATEGORIES,
  INDUSTRY_CATEGORY_LABELS,
  INDUSTRY_CATEGORY_ICONS,
  MATERIAL_TYPES,
  MATERIAL_TYPE_LABELS,
} from '@/types'

export const metadata: Metadata = {
  title: '[Preview V2] 한국 신뢰-시그널 밀도 — Packlinx',
  robots: { index: false, follow: false },
}

const TRUST_BADGES = [
  { label: 'ISO 9001', desc: '품질경영', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { label: 'HACCP', desc: '식품안전', color: 'bg-green-50 text-green-700 border-green-200' },
  { label: 'FSC', desc: '친환경', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
]

export default async function MainV2Page() {
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

  /* 12-cell grid: 5 industry + 5 materials + 2 specials */
  const materialSlots = MATERIAL_TYPES.slice(0, 5)

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Hero — compact, info-dense above-fold */}
      <section className="bg-white border-b border-border-v04 px-5 sm:px-8 pt-8 pb-8">
        <div className="max-w-4xl mx-auto">
          {/* Top stats bar */}
          <div className="flex flex-wrap items-center gap-3 mb-5">
            {/* Vendor count — prominent */}
            <div className="flex items-center gap-2 bg-stripe-purple/8 border border-stripe-purple/15 rounded-lg px-3.5 py-2">
              <span className="text-[20px] sm:text-[24px] font-semibold text-stripe-purple tabular-nums">
                {totalCount?.toLocaleString()}
              </span>
              <div>
                <p className="text-[11px] font-semibold text-stripe-purple leading-tight">개 업체</p>
                <p className="text-[10px] text-gray-400">{buildYear}년 {buildMonth}월 기준 검증</p>
              </div>
            </div>

            {/* Trust badges */}
            {TRUST_BADGES.map((b) => (
              <div
                key={b.label}
                className={`flex items-center gap-1.5 border rounded-lg px-3 py-2 ${b.color}`}
              >
                <span className="text-[13px] font-bold leading-none">{b.label}</span>
                <span className="text-[10px] font-medium opacity-70">{b.desc}</span>
              </div>
            ))}

            {/* Verification link */}
            <Link
              href="/guides/packaging-material-complete-guide"
              className="text-[11px] text-gray-400 hover:text-stripe-purple underline ml-auto hidden sm:block"
            >
              어떻게 검증하나요? →
            </Link>
          </div>

          {/* H1 */}
          <h1 className="text-[22px] sm:text-[28px] font-semibold text-heading-deep-navy leading-[1.2] tracking-[-0.4px] mb-3">
            전국 패키징 업체, 한 곳에서 비교하세요
          </h1>
          <p className="text-[13px] sm:text-[14px] text-gray-500 mb-5 leading-relaxed">
            식품·화장품·이커머스·친환경 포장재 — B2B 구매 담당자를 위한 검증된 디렉터리
          </p>

          {/* Search bar */}
          <form method="GET" action="/" className="flex rounded-xl overflow-hidden border border-gray-200 shadow-sm focus-within:border-stripe-purple focus-within:shadow-[0_0_0_3px_var(--color-stripe-purple-ring)] transition-shadow max-w-[640px]">
            <input
              name="q"
              placeholder="업체명, 제품, 인증으로 검색..."
              className="flex-1 px-4 py-3 text-[14px] text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none"
            />
            <button
              type="submit"
              className="bg-stripe-purple hover:bg-stripe-purple-hover text-white font-semibold px-5 py-2.5 transition-colors text-sm flex-shrink-0 m-1.5 rounded-lg focus-visible:outline-2 focus-visible:outline-stripe-purple"
            >
              검색
            </button>
          </form>
        </div>
      </section>

      {/* Category grid 12칸 */}
      <section className="px-5 sm:px-8 py-7">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">업종별 탐색</p>
            <Link href="/categories" className="text-[11px] text-stripe-purple hover:underline">전체 보기 →</Link>
          </div>
          {/* Row 1: Industry categories (5칸) + 인쇄·디자인 (1칸) = 6칸 */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-2">
            {INDUSTRY_CATEGORIES.map((cat) => (
              <Link
                key={cat}
                href={`/categories/${cat}`}
                className="group flex flex-col items-center text-center bg-white border border-border-v04 rounded-lg px-2 py-3 hover:border-stripe-purple/30 hover:bg-stripe-purple/4 transition-all duration-150 focus-visible:outline-2 focus-visible:outline-stripe-purple"
              >
                <span className="text-xl mb-1" aria-hidden="true">{INDUSTRY_CATEGORY_ICONS[cat]}</span>
                <span className="text-[11px] font-semibold text-gray-800 group-hover:text-stripe-purple transition-colors leading-tight">
                  {INDUSTRY_CATEGORY_LABELS[cat]}
                </span>
                <span className="text-[10px] text-gray-400 mt-0.5">{categoryCounts[cat]}개</span>
              </Link>
            ))}
            <Link
              href="/services/printing-design"
              className="group flex flex-col items-center text-center bg-white border border-border-v04 rounded-lg px-2 py-3 hover:border-stripe-purple/30 hover:bg-stripe-purple/4 transition-all duration-150 focus-visible:outline-2 focus-visible:outline-stripe-purple"
            >
              <span className="text-xl mb-1" aria-hidden="true">🖨️</span>
              <span className="text-[11px] font-semibold text-gray-800 group-hover:text-stripe-purple transition-colors leading-tight">
                인쇄·디자인
              </span>
              <span className="text-[10px] text-gray-400 mt-0.5">서비스</span>
            </Link>
          </div>
          {/* Row 2: Material types (5칸) + 보냉·특수 (1칸) = 6칸 */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {materialSlots.map((mat) => (
              <Link
                key={mat}
                href={`/?material=${mat}`}
                className="group flex flex-col items-center text-center bg-white border border-border-v04 rounded-lg px-2 py-3 hover:border-stripe-purple/30 hover:bg-stripe-purple/4 transition-all duration-150 focus-visible:outline-2 focus-visible:outline-stripe-purple"
              >
                <span className="text-xl mb-1" aria-hidden="true">📦</span>
                <span className="text-[11px] font-semibold text-gray-800 group-hover:text-stripe-purple transition-colors leading-tight">
                  {MATERIAL_TYPE_LABELS[mat]}
                </span>
                <span className="text-[10px] text-gray-400 mt-0.5">소재별</span>
              </Link>
            ))}
            <Link
              href="/?cold=true"
              className="group flex flex-col items-center text-center bg-white border border-border-v04 rounded-lg px-2 py-3 hover:border-stripe-purple/30 hover:bg-stripe-purple/4 transition-all duration-150 focus-visible:outline-2 focus-visible:outline-stripe-purple"
            >
              <span className="text-xl mb-1" aria-hidden="true">🧊</span>
              <span className="text-[11px] font-semibold text-gray-800 group-hover:text-stripe-purple transition-colors leading-tight">
                보냉·특수
              </span>
              <span className="text-[10px] text-gray-400 mt-0.5">조건별</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Certification filters quick-access */}
      <section className="px-5 sm:px-8 py-5 border-t border-border-v04">
        <div className="max-w-4xl mx-auto">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-3">인증·조건 필터</p>
          <div className="flex flex-wrap gap-2">
            {[
              { href: '/?cert=iso9001', label: 'ISO 9001', color: 'bg-blue-50 text-blue-700 border-blue-200 hover:border-blue-400' },
              { href: '/?cert=haccp', label: 'HACCP', color: 'bg-green-50 text-green-700 border-green-200 hover:border-green-400' },
              { href: '/?cert=fsc', label: 'FSC', color: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:border-emerald-400' },
              { href: '/?cert=iso14001', label: 'ISO 14001', color: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:border-emerald-400' },
              { href: '/?cert=gmp', label: 'GMP', color: 'bg-purple-50 text-purple-700 border-purple-200 hover:border-purple-400' },
              { href: '/?cert=kfda', label: '식약처 인증', color: 'bg-purple-50 text-purple-700 border-purple-200 hover:border-purple-400' },
              { href: '/?cert=eco_friendly', label: '친환경 인증', color: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:border-emerald-400' },
              { href: '/?sample=true', label: '샘플 제작', color: 'bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-400' },
            ].map((c) => (
              <Link
                key={c.href}
                href={c.href}
                className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-[12px] font-semibold border transition-all ${c.color} focus-visible:outline-2 focus-visible:outline-stripe-purple`}
              >
                {c.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Recent update + guide section */}
      <section className="px-5 sm:px-8 py-7 border-t border-border-v04 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">최근 업데이트</p>
            <span className="text-[11px] text-gray-400">
              업체 정보 마지막 검증: {buildYear}년 {buildMonth}월
            </span>
          </div>
          <div className="flex flex-wrap gap-3 mb-8">
            {['ISO 9001 인증 업체 8개 추가', 'HACCP 인증 식품 포장 업체 업데이트', '이커머스 배송박스 신규 15개 업체'].map((item, i) => (
              <div key={i} className="flex items-center gap-2 bg-gray-50 border border-border-v04 rounded-lg px-3.5 py-2.5">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0" aria-hidden="true" />
                <span className="text-[12px] text-gray-700">{item}</span>
              </div>
            ))}
          </div>

          {/* Guide mini-cards */}
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-3">구매 가이드</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { slug: 'packaging-material-complete-guide', title: '소재 완벽 가이드', tag: '소재' },
              { slug: 'food-packaging-materials', title: '식품 포장재 선택', tag: '식품' },
              { slug: 'eco-friendly-packaging', title: '친환경 포장재', tag: '친환경' },
            ].map((g) => (
              <Link
                key={g.slug}
                href={`/guides/${g.slug}`}
                className="group flex items-center gap-3 bg-gray-50 border border-border-v04 rounded-lg px-4 py-3 hover:border-stripe-purple/30 hover:bg-stripe-purple/4 transition-all focus-visible:outline-2 focus-visible:outline-stripe-purple"
              >
                <span className="text-[10px] font-semibold text-stripe-purple bg-stripe-purple/8 border border-stripe-purple/15 px-2 py-0.5 rounded flex-shrink-0">
                  {g.tag}
                </span>
                <span className="text-[13px] font-semibold text-gray-800 group-hover:text-stripe-purple transition-colors">
                  {g.title}
                </span>
                <svg className="w-4 h-4 text-gray-300 group-hover:text-stripe-purple ml-auto flex-shrink-0 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Vendor register CTA — fold 안 */}
      <section className="px-5 sm:px-8 py-6 border-t border-border-v04">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <span className="text-xl" aria-hidden="true">🏭</span>
            <div>
              <p className="text-[13px] font-semibold text-gray-800">패키징 업체이신가요?</p>
              <p className="text-[12px] text-gray-400">무료로 업체를 등록하고 구매자와 연결하세요.</p>
            </div>
          </div>
          <Link
            href="/opt-out?type=register"
            className="flex-shrink-0 bg-stripe-purple hover:bg-stripe-purple-hover text-white font-semibold px-4 py-2 rounded-lg text-[13px] transition-colors focus-visible:outline-2 focus-visible:outline-stripe-purple"
          >
            업체 등록 →
          </Link>
        </div>
      </section>

      {/* Mobile viewport label (dev only) */}
      <div className="fixed bottom-4 left-4 text-[10px] font-mono bg-black/70 text-white px-2 py-1 rounded pointer-events-none z-50 sm:hidden" aria-hidden="true">
        360px · V2
      </div>
      <div className="fixed bottom-4 left-4 text-[10px] font-mono bg-black/70 text-white px-2 py-1 rounded pointer-events-none z-50 hidden sm:block" aria-hidden="true">
        ≥640px · V2
      </div>
    </div>
  )
}
