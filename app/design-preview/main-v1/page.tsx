import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import {
  INDUSTRY_CATEGORIES,
  INDUSTRY_CATEGORY_LABELS,
  INDUSTRY_CATEGORY_ICONS,
} from '@/types'

export const metadata: Metadata = {
  title: '[Preview V1] Stripe-style 명료성 — Packlinx',
  robots: { index: false, follow: false },
}

const GUIDE_CARDS = [
  {
    slug: 'packaging-material-complete-guide',
    title: '패키징 소재 완벽 가이드',
    summary: '종이·플라스틱·금속·유리 소재별 특성 비교. 업체 선정 전 필독.',
    tag: '소재',
  },
  {
    slug: 'food-packaging-materials',
    title: '식품 포장재 소재 선택 가이드',
    summary: '식품 안전 인증 기준, 소재별 적합성, HACCP 적합 vendor 체크리스트.',
    tag: '식품',
  },
  {
    slug: 'eco-friendly-packaging',
    title: '친환경 포장재 선택 가이드',
    summary: 'FSC·GRS·OK Compost 인증 기준과 친환경 vendor 선정 기준.',
    tag: '친환경',
  },
]

const CATEGORY_CHIPS = INDUSTRY_CATEGORIES.slice(0, 5)

export default async function MainV1Page() {
  const supabase = await createClient()
  const { count: totalCount } = await supabase.from('companies').select('*', { count: 'exact', head: true })

  const buildYear = new Date().getFullYear()
  const buildMonth = new Date().getMonth() + 1

  return (
    <div className="min-h-screen bg-white">
      {/* Hero — Stripe-style: generous white space, single CTA */}
      <section className="px-5 sm:px-8 pt-16 sm:pt-24 pb-14 sm:pb-20 flex flex-col items-center text-center border-b border-border-v04">
        <div className="max-w-2xl mx-auto w-full">
          {/* Trust pill */}
          <div className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-widest uppercase text-stripe-purple bg-stripe-purple/8 border border-stripe-purple/15 px-3 py-1.5 rounded-full mb-7">
            <span className="w-1.5 h-1.5 bg-stripe-purple rounded-full" aria-hidden="true" />
            {buildYear}년 {buildMonth}월 기준 {totalCount?.toLocaleString()}개 업체 검증
          </div>

          {/* H1 */}
          <h1 className="text-[30px] sm:text-[42px] font-light text-heading-deep-navy leading-[1.13] tracking-[-0.8px] mb-5">
            패키징에 필요한 모든 업체,<br />
            여기서 한 번에 찾으세요
          </h1>
          <p className="text-[15px] sm:text-[16px] text-gray-500 leading-relaxed max-w-[480px] mx-auto mb-8">
            박스·인쇄·친환경 소재까지 — 국내 최대 패키징 B2B 디렉터리에서
            내 제품에 딱 맞는 파트너를 찾으세요.
          </p>

          {/* Search bar — single primary CTA */}
          <form method="GET" action="/" className="flex rounded-xl overflow-hidden border border-gray-200 shadow-sm focus-within:border-stripe-purple focus-within:shadow-[0_0_0_3px_var(--color-stripe-purple-ring)] transition-shadow max-w-[560px] mx-auto">
            <input
              name="q"
              placeholder="업체명, 제품, 인증으로 검색..."
              className="flex-1 px-5 py-3.5 text-[15px] text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none"
            />
            <button
              type="submit"
              className="bg-stripe-purple hover:bg-stripe-purple-hover text-white font-semibold px-6 py-3 transition-colors text-sm flex-shrink-0 m-1.5 rounded-lg focus-visible:outline-2 focus-visible:outline-stripe-purple"
            >
              검색
            </button>
          </form>

          {/* Minimal trust line */}
          <p className="mt-3 text-[12px] text-gray-400">
            무료 이용 ·{' '}
            <Link href="/guides/packaging-material-complete-guide" className="text-stripe-purple hover:underline">
              어떻게 검증하나요?
            </Link>
          </p>
        </div>
      </section>

      {/* Category chips — 8칸 (5 industries + 3 service types) */}
      <section className="px-5 sm:px-8 py-10 sm:py-14 border-b border-border-v04">
        <div className="max-w-3xl mx-auto">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest text-center mb-6">
            카테고리별로 탐색
          </p>
          {/* Industry categories */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-3">
            {CATEGORY_CHIPS.map((cat) => (
              <Link
                key={cat}
                href={`/categories/${cat}`}
                className="group flex items-center gap-2.5 bg-white border border-border-v04 rounded-lg px-4 py-3 hover:border-stripe-purple/30 hover:bg-stripe-purple/4 transition-all duration-150 focus-visible:outline-2 focus-visible:outline-stripe-purple"
              >
                <span className="text-lg flex-shrink-0" aria-hidden="true">{INDUSTRY_CATEGORY_ICONS[cat]}</span>
                <div className="min-w-0 text-left">
                  <span className="text-[13px] font-semibold text-gray-900 group-hover:text-stripe-purple transition-colors block leading-tight">
                    {INDUSTRY_CATEGORY_LABELS[cat]}
                  </span>
                </div>
              </Link>
            ))}
            {/* Service categories to fill to 8 */}
            <Link
              href="/services/printing-design"
              className="group flex items-center gap-2.5 bg-white border border-border-v04 rounded-lg px-4 py-3 hover:border-stripe-purple/30 hover:bg-stripe-purple/4 transition-all duration-150 focus-visible:outline-2 focus-visible:outline-stripe-purple"
            >
              <span className="text-lg flex-shrink-0" aria-hidden="true">🖨️</span>
              <div className="min-w-0 text-left">
                <span className="text-[13px] font-semibold text-gray-900 group-hover:text-stripe-purple transition-colors block leading-tight">
                  인쇄·디자인
                </span>
              </div>
            </Link>
            <Link
              href="/?cert=eco_friendly"
              className="group flex items-center gap-2.5 bg-white border border-border-v04 rounded-lg px-4 py-3 hover:border-stripe-purple/30 hover:bg-stripe-purple/4 transition-all duration-150 focus-visible:outline-2 focus-visible:outline-stripe-purple"
            >
              <span className="text-lg flex-shrink-0" aria-hidden="true">🌿</span>
              <div className="min-w-0 text-left">
                <span className="text-[13px] font-semibold text-gray-900 group-hover:text-stripe-purple transition-colors block leading-tight">
                  친환경 인증
                </span>
              </div>
            </Link>
            <Link
              href="/?cold=true"
              className="group flex items-center gap-2.5 bg-white border border-border-v04 rounded-lg px-4 py-3 hover:border-stripe-purple/30 hover:bg-stripe-purple/4 transition-all duration-150 focus-visible:outline-2 focus-visible:outline-stripe-purple"
            >
              <span className="text-lg flex-shrink-0" aria-hidden="true">🧊</span>
              <div className="min-w-0 text-left">
                <span className="text-[13px] font-semibold text-gray-900 group-hover:text-stripe-purple transition-colors block leading-tight">
                  보냉 포장
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Guide cards — 3개 */}
      <section className="px-5 sm:px-8 py-10 sm:py-14 border-b border-border-v04">
        <div className="max-w-3xl mx-auto">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest text-center mb-6">
            패키징 실무 가이드
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {GUIDE_CARDS.map((g) => (
              <Link
                key={g.slug}
                href={`/guides/${g.slug}`}
                className="group flex flex-col bg-white border border-border-v04 rounded-xl p-5 hover:border-stripe-purple/30 hover:shadow-[var(--shadow-elevated-v04)] transition-all duration-200 focus-visible:outline-2 focus-visible:outline-stripe-purple"
              >
                <span className="text-[11px] font-semibold text-stripe-purple bg-stripe-purple/8 px-2 py-0.5 rounded self-start mb-3">
                  {g.tag}
                </span>
                <h3 className="text-[14px] font-semibold text-heading-deep-navy group-hover:text-stripe-purple transition-colors leading-snug mb-2">
                  {g.title}
                </h3>
                <p className="text-[12px] text-gray-500 leading-relaxed flex-1">
                  {g.summary}
                </p>
                <span className="mt-3 text-[12px] text-stripe-purple font-medium group-hover:underline">
                  읽기 →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Vendor self-register CTA */}
      <section className="px-5 sm:px-8 py-10 sm:py-14">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 bg-stripe-purple/4 border border-stripe-purple/15 rounded-xl px-6 py-6">
          <div>
            <p className="text-[14px] font-semibold text-heading-deep-navy mb-1">내 회사를 등록하고 싶으신가요?</p>
            <p className="text-[13px] text-gray-500">패키징 업체라면 무료로 등록·관리하세요.</p>
          </div>
          <Link
            href="/opt-out?type=register"
            className="flex-shrink-0 bg-stripe-purple hover:bg-stripe-purple-hover text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors focus-visible:outline-2 focus-visible:outline-stripe-purple"
          >
            업체 등록 →
          </Link>
        </div>
      </section>

      {/* Mobile viewport label (dev only) */}
      <div className="fixed bottom-4 left-4 text-[10px] font-mono bg-black/70 text-white px-2 py-1 rounded pointer-events-none z-50 sm:hidden" aria-hidden="true">
        360px · V1
      </div>
      <div className="fixed bottom-4 left-4 text-[10px] font-mono bg-black/70 text-white px-2 py-1 rounded pointer-events-none z-50 hidden sm:block" aria-hidden="true">
        ≥640px · V1
      </div>
    </div>
  )
}
