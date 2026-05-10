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
import { AnimatedCounter } from './AnimatedCounter'

export const metadata: Metadata = {
  title: '[Preview V2] 한국 신뢰-시그널 밀도 — Packlinx',
  robots: { index: false, follow: false },
}

// ── Certification level system (3 levels) ──────────────────────────────
const CERT_LEVELS = {
  premium: {
    label: '우수 Vendor',
    stars: 3,
    color: 'text-amber-700 bg-amber-50 border-amber-300',
    dot: 'bg-amber-400',
    tooltip: '3년 이상 거래 실적 + 품질 인증 2개 이상 보유 업체',
  },
  verified: {
    label: '실적 인증',
    stars: 2,
    color: 'text-blue-700 bg-blue-50 border-blue-300',
    dot: 'bg-blue-400',
    tooltip: '1년 이상 거래 실적 + 공인 품질 인증 1개 이상 확인',
  },
  basic: {
    label: '사업자 확인',
    stars: 1,
    color: 'text-gray-600 bg-gray-50 border-gray-300',
    dot: 'bg-gray-400',
    tooltip: '사업자등록번호 및 대표자 정보 공식 확인 완료',
  },
} as const

type CertLevel = keyof typeof CERT_LEVELS

// ── Sample vendor data (8–10 placeholders, single source of truth) ────
interface SampleVendor {
  id: number
  name: string
  initial: string
  categoryKey: typeof INDUSTRY_CATEGORIES[number]
  certs: string[]
  level: CertLevel
  verified: string
  region: string
}

const SAMPLE_VENDORS: SampleVendor[] = [
  { id: 1, name: '한국친환경포장',    initial: '한', categoryKey: 'food-beverage',          certs: ['HACCP', 'FSC'],       level: 'premium',  verified: '2026-05', region: '경기 시흥' },
  { id: 2, name: '에코팩코리아',      initial: '에', categoryKey: 'food-beverage',          certs: ['FSC', 'ISO 14001'],   level: 'premium',  verified: '2026-05', region: '인천 남동' },
  { id: 3, name: '스마트배송박스',    initial: '스', categoryKey: 'ecommerce-shipping',     certs: ['ISO 9001'],           level: 'verified', verified: '2026-05', region: '경기 부천' },
  { id: 4, name: '코스팩',            initial: '코', categoryKey: 'cosmetics-beauty',       certs: ['ISO 22716', 'GMP'],   level: 'premium',  verified: '2026-05', region: '서울 영등포' },
  { id: 5, name: '뷰티포장공방',      initial: '뷰', categoryKey: 'cosmetics-beauty',       certs: ['GMP'],                level: 'verified', verified: '2026-05', region: '경기 수원' },
  { id: 6, name: '팜박스',            initial: '팜', categoryKey: 'pharma-health',          certs: ['GMP', 'KFDA'],        level: 'premium',  verified: '2026-04', region: '충북 청주' },
  { id: 7, name: '산업포장KR',        initial: '산', categoryKey: 'electronics-industrial', certs: ['ISO 9001'],           level: 'verified', verified: '2026-04', region: '경남 창원' },
  { id: 8, name: '그린팩솔루션',      initial: '그', categoryKey: 'food-beverage',          certs: ['친환경인증'],          level: 'basic',    verified: '2026-05', region: '전남 나주' },
  { id: 9, name: '이커박스플러스',    initial: '이', categoryKey: 'ecommerce-shipping',     certs: ['ISO 14001'],          level: 'verified', verified: '2026-05', region: '경기 용인' },
  { id: 10, name: '헬스팩코리아',     initial: '헬', categoryKey: 'pharma-health',          certs: ['KFDA', 'ISO 13485'],  level: 'premium',  verified: '2026-05', region: '서울 강남' },
]

// ── Certification badge with tooltip ─────────────────────────────────
function CertBadge({ certKey, label }: { certKey: CertLevel; label: string }) {
  const cfg = CERT_LEVELS[certKey]
  return (
    <div className="relative group/badge inline-flex flex-shrink-0">
      <div className={`flex items-center gap-1 border rounded-md px-2 py-0.5 text-[10px] font-semibold cursor-default select-none ${cfg.color}`}>
        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} aria-hidden="true" />
        {label}
      </div>
      {/* Tooltip */}
      <div
        role="tooltip"
        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-20 opacity-0 group-hover/badge:opacity-100 transition-opacity duration-150 pointer-events-none"
      >
        <div className="bg-gray-900 text-white text-[11px] leading-snug px-2.5 py-1.5 rounded-lg whitespace-nowrap max-w-[200px] shadow-lg">
          <span className="font-semibold block mb-0.5">{cfg.label}</span>
          {cfg.tooltip}
        </div>
        <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-900" />
      </div>
    </div>
  )
}

// ── Star level indicator ────────────────────────────────────────────
function StarLevel({ level }: { level: CertLevel }) {
  const cfg = CERT_LEVELS[level]
  return (
    <div className="relative group/star inline-flex flex-shrink-0">
      <div className="flex items-center gap-0.5 cursor-default">
        {[1, 2, 3].map((n) => (
          <svg
            key={n}
            className={`w-3 h-3 transition-colors ${
              n <= cfg.stars ? 'text-amber-400' : 'text-gray-200'
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      {/* Level tooltip */}
      <div
        role="tooltip"
        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 z-20 opacity-0 group-hover/star:opacity-100 transition-opacity duration-150 pointer-events-none"
      >
        <div className="bg-gray-900 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap">
          {cfg.label}
        </div>
        <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-3 border-x-transparent border-t-3 border-t-gray-900" />
      </div>
    </div>
  )
}

// ── Logo placeholder SVG ─────────────────────────────────────────────
function LogoPlaceholder({ initial, size = 40 }: { initial: string; size?: number }) {
  return (
    <div
      className="rounded-lg bg-stripe-purple/8 border border-stripe-purple/10 flex items-center justify-center flex-shrink-0"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <span className="text-stripe-purple font-bold" style={{ fontSize: size * 0.38 }}>
        {initial}
      </span>
    </div>
  )
}

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
  const count = totalCount ?? 0

  /* 12-cell grid: 5 industry + 5 materials + 2 specials */
  const materialSlots = MATERIAL_TYPES.slice(0, 5)

  /* Category quick-trust line: top 3 by count */
  const topCategories = [...INDUSTRY_CATEGORIES]
    .sort((a, b) => (categoryCounts[b] ?? 0) - (categoryCounts[a] ?? 0))
    .slice(0, 3)

  return (
    <div className="min-h-screen bg-[#F8FAFC]">

      {/* ── Mobile-only search bar (검색 최우선 — mobile 360px) ──────── */}
      <div className="sm:hidden bg-white border-b border-border-v04 px-4 py-3 sticky top-0 z-30 shadow-[var(--shadow-xs)]">
        <form method="GET" action="/" className="flex rounded-lg overflow-hidden border border-gray-200 focus-within:border-stripe-purple focus-within:shadow-[0_0_0_3px_var(--color-stripe-purple-ring)] transition-shadow">
          <input
            name="q"
            placeholder="업체·제품·인증 검색..."
            className="flex-1 px-4 py-2.5 text-[14px] text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none"
          />
          <button
            type="submit"
            className="bg-stripe-purple hover:bg-stripe-purple-hover active:scale-[0.97] text-white font-semibold px-4 py-2 transition-all text-[13px] flex-shrink-0 m-1 rounded-md focus-visible:outline-2 focus-visible:outline-stripe-purple"
          >
            검색
          </button>
        </form>
      </div>

      {/* ── Hero: count + badges + search (desktop) ─────────────────── */}
      <section className="bg-white border-b border-border-v04 px-5 sm:px-8 pt-8 pb-8">
        <div className="max-w-4xl mx-auto">

          {/* Trust stats bar */}
          <div className="flex flex-wrap items-start sm:items-center gap-3 mb-6">

            {/* Animated vendor count */}
            <div className="flex items-center gap-3 bg-stripe-purple/8 border border-stripe-purple/15 rounded-xl px-4 py-3 shadow-[var(--shadow-xs)]">
              <div>
                <div className="flex items-end gap-1">
                  <AnimatedCounter
                    target={count}
                    className="text-[28px] sm:text-[32px] font-bold text-stripe-purple tabular-nums leading-none"
                  />
                  <span className="text-[13px] font-semibold text-stripe-purple/70 pb-0.5">개</span>
                </div>
                <p className="text-[10px] text-stripe-purple/60 mt-0.5">
                  {buildYear}년 {buildMonth}월 기준 검증 완료
                </p>
              </div>
              {/* Weekly new count */}
              <div className="border-l border-stripe-purple/15 pl-3 hidden sm:block">
                <p className="text-[18px] font-bold text-stripe-purple tabular-nums">+23</p>
                <p className="text-[10px] text-stripe-purple/60">이번 주 신규</p>
              </div>
            </div>

            {/* Trust badges — icon + level + tooltip */}
            <CertBadge certKey="premium" label="우수 Vendor 인증제" />
            <CertBadge certKey="verified" label="HACCP / ISO 9001" />
            <CertBadge certKey="basic" label="FSC / GMP" />

            {/* Verification link */}
            <Link
              href="/guides/packaging-material-complete-guide"
              className="text-[11px] text-gray-400 hover:text-stripe-purple transition-colors underline underline-offset-2 ml-auto hidden sm:block focus-visible:outline-2 focus-visible:outline-stripe-purple rounded"
            >
              어떻게 검증하나요? →
            </Link>
          </div>

          {/* H1 */}
          <h1 className="text-[24px] sm:text-[32px] font-bold text-heading-deep-navy leading-[1.15] tracking-[-0.5px] mb-2">
            전국 패키징 업체,<br className="hidden sm:block" /> 한 곳에서 비교하세요
          </h1>
          <p className="text-[14px] sm:text-[15px] text-gray-500 mb-6 leading-relaxed max-w-[560px]">
            식품·화장품·이커머스·친환경 포장재 —{' '}
            <span className="font-medium text-gray-700">
              {topCategories.map((c) => INDUSTRY_CATEGORY_LABELS[c].replace(' 포장', '')).join(', ')} 등
            </span>{' '}
            B2B 구매 담당자를 위한 검증된 디렉터리
          </p>

          {/* Desktop search bar */}
          <form method="GET" action="/" className="hidden sm:flex rounded-xl overflow-hidden border border-gray-200 shadow-sm focus-within:border-stripe-purple focus-within:shadow-[0_0_0_3px_var(--color-stripe-purple-ring)] transition-shadow max-w-[640px]">
            <input
              name="q"
              placeholder="업체명, 제품, 인증으로 검색..."
              className="flex-1 px-5 py-3.5 text-[15px] text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none"
            />
            <button
              type="submit"
              className="bg-stripe-purple hover:bg-stripe-purple-hover active:scale-[0.97] text-white font-semibold px-6 py-3 transition-all text-sm flex-shrink-0 m-1.5 rounded-lg focus-visible:outline-2 focus-visible:outline-stripe-purple"
            >
              검색
            </button>
          </form>

          {/* Mobile verification link */}
          <Link
            href="/guides/packaging-material-complete-guide"
            className="sm:hidden text-[12px] text-gray-400 hover:text-stripe-purple transition-colors underline underline-offset-2 mt-4 inline-block"
          >
            검증 방법론 확인 →
          </Link>
        </div>
      </section>

      {/* ── Category grid 12칸 ────────────────────────────────────────── */}
      <section className="px-5 sm:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">업종별 탐색</p>
            <Link href="/categories" className="text-[11px] text-stripe-purple hover:underline focus-visible:outline-2 focus-visible:outline-stripe-purple rounded">전체 보기 →</Link>
          </div>

          {/* Row 1: Industry 5 + 인쇄·디자인 = 6칸 (mobile: 2-col snap) */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-2">
            {INDUSTRY_CATEGORIES.map((cat) => (
              <Link
                key={cat}
                href={`/categories/${cat}`}
                className="group flex flex-col items-center text-center bg-white border border-border-v04 rounded-xl px-2 py-3.5 hover:border-stripe-purple/40 hover:bg-stripe-purple/4 hover:shadow-[var(--shadow-card)] active:scale-[0.97] transition-all duration-150 focus-visible:outline-2 focus-visible:outline-stripe-purple"
              >
                <span className="text-xl mb-1.5" aria-hidden="true">{INDUSTRY_CATEGORY_ICONS[cat]}</span>
                <span className="text-[11px] font-semibold text-gray-800 group-hover:text-stripe-purple transition-colors leading-tight block">
                  {INDUSTRY_CATEGORY_LABELS[cat].replace(' 포장', '')}
                </span>
                <span className="text-[10px] text-gray-400 mt-1 tabular-nums">
                  {(categoryCounts[cat] ?? 0).toLocaleString()}개
                </span>
              </Link>
            ))}
            <Link
              href="/services/printing-design"
              className="group flex flex-col items-center text-center bg-white border border-border-v04 rounded-xl px-2 py-3.5 hover:border-stripe-purple/40 hover:bg-stripe-purple/4 hover:shadow-[var(--shadow-card)] active:scale-[0.97] transition-all duration-150 focus-visible:outline-2 focus-visible:outline-stripe-purple"
            >
              <span className="text-xl mb-1.5" aria-hidden="true">🖨️</span>
              <span className="text-[11px] font-semibold text-gray-800 group-hover:text-stripe-purple transition-colors leading-tight block">
                인쇄·디자인
              </span>
              <span className="text-[10px] text-gray-400 mt-1">서비스</span>
            </Link>
          </div>

          {/* Row 2: Material 5 + 보냉·특수 = 6칸 */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {materialSlots.map((mat) => (
              <Link
                key={mat}
                href={`/?material=${mat}`}
                className="group flex flex-col items-center text-center bg-white border border-border-v04 rounded-xl px-2 py-3.5 hover:border-stripe-purple/40 hover:bg-stripe-purple/4 hover:shadow-[var(--shadow-card)] active:scale-[0.97] transition-all duration-150 focus-visible:outline-2 focus-visible:outline-stripe-purple"
              >
                <span className="text-xl mb-1.5" aria-hidden="true">📦</span>
                <span className="text-[11px] font-semibold text-gray-800 group-hover:text-stripe-purple transition-colors leading-tight block">
                  {MATERIAL_TYPE_LABELS[mat]}
                </span>
                <span className="text-[10px] text-gray-400 mt-1">소재별</span>
              </Link>
            ))}
            <Link
              href="/?cold=true"
              className="group flex flex-col items-center text-center bg-white border border-border-v04 rounded-xl px-2 py-3.5 hover:border-stripe-purple/40 hover:bg-stripe-purple/4 hover:shadow-[var(--shadow-card)] active:scale-[0.97] transition-all duration-150 focus-visible:outline-2 focus-visible:outline-stripe-purple"
            >
              <span className="text-xl mb-1.5" aria-hidden="true">🧊</span>
              <span className="text-[11px] font-semibold text-gray-800 group-hover:text-stripe-purple transition-colors leading-tight block">
                보냉·특수
              </span>
              <span className="text-[10px] text-gray-400 mt-1">조건별</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Certification filter quick-access ───────────────────────── */}
      <section className="px-5 sm:px-8 py-5 border-t border-border-v04 bg-white">
        <div className="max-w-4xl mx-auto">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">인증·조건 필터</p>
          <div className="flex flex-wrap gap-2">
            {[
              { href: '/?cert=iso9001',     label: 'ISO 9001',    color: 'bg-blue-50 text-blue-700 border-blue-200 hover:border-blue-400 hover:bg-blue-100' },
              { href: '/?cert=haccp',       label: 'HACCP',       color: 'bg-green-50 text-green-700 border-green-200 hover:border-green-400 hover:bg-green-100' },
              { href: '/?cert=fsc',         label: 'FSC',         color: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:border-emerald-400 hover:bg-emerald-100' },
              { href: '/?cert=iso14001',    label: 'ISO 14001',   color: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:border-emerald-400 hover:bg-emerald-100' },
              { href: '/?cert=gmp',         label: 'GMP',         color: 'bg-purple-50 text-purple-700 border-purple-200 hover:border-purple-400 hover:bg-purple-100' },
              { href: '/?cert=kfda',        label: '식약처 인증', color: 'bg-purple-50 text-purple-700 border-purple-200 hover:border-purple-400 hover:bg-purple-100' },
              { href: '/?cert=eco_friendly',label: '친환경 인증', color: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:border-emerald-400 hover:bg-emerald-100' },
              { href: '/?sample=true',      label: '샘플 제작',   color: 'bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-400 hover:bg-gray-100' },
            ].map((c) => (
              <Link
                key={c.href}
                href={c.href}
                className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-[12px] font-semibold border transition-all active:scale-[0.96] focus-visible:outline-2 focus-visible:outline-stripe-purple ${c.color}`}
              >
                {c.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Sample vendor feed (8-10 real placeholders) ─────────────── */}
      <section className="px-5 sm:px-8 py-8 border-t border-border-v04">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" aria-hidden="true" />
              <p className="text-[13px] font-bold text-gray-800">최근 검증된 업체</p>
            </div>
            <span className="text-[11px] text-gray-400">
              마지막 업데이트: {buildYear}년 {buildMonth}월
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {SAMPLE_VENDORS.map((v) => (
              <div
                key={v.id}
                className="group flex items-center gap-3 bg-white border border-border-v04 rounded-xl px-4 py-3.5 hover:border-stripe-purple/30 hover:shadow-[var(--shadow-card-hover)] transition-all duration-200 cursor-default"
              >
                <LogoPlaceholder initial={v.initial} size={40} />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-[14px] font-semibold text-heading-deep-navy truncate leading-tight">
                      {v.name}
                    </p>
                    <StarLevel level={v.level} />
                  </div>
                  <p className="text-[11px] text-gray-400 truncate">
                    {INDUSTRY_CATEGORY_ICONS[v.categoryKey]} {INDUSTRY_CATEGORY_LABELS[v.categoryKey]} · {v.region}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                  <div className="flex gap-1 flex-wrap justify-end">
                    {v.certs.slice(0, 2).map((cert) => (
                      <span
                        key={cert}
                        className="text-[10px] font-semibold text-green-700 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded"
                      >
                        {cert}
                      </span>
                    ))}
                  </div>
                  <span className="text-[10px] text-gray-300 tabular-nums">{v.verified} 검증</span>
                </div>
              </div>
            ))}
          </div>

          {/* Empty state (shown when 0 results — design-documented) */}
          <div className="hidden mt-4 py-8 text-center border border-dashed border-gray-200 rounded-xl bg-white" aria-hidden="true">
            <p className="text-[14px] text-gray-400 mb-1">아직 검증된 업체가 없습니다</p>
            <p className="text-[12px] text-gray-300">곧 업데이트될 예정입니다</p>
          </div>

          <p className="text-[11px] text-gray-300 mt-3">
            * 위 목록은 디자인 검토용 샘플 데이터입니다. 실제 서비스에서는 검증 업체 데이터가 자동 표시됩니다.
          </p>
        </div>
      </section>

      {/* ── Guide mini-cards ─────────────────────────────────────────── */}
      <section className="px-5 sm:px-8 py-8 border-t border-border-v04 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">구매 가이드</p>
            <Link href="/guides" className="text-[11px] text-stripe-purple hover:underline focus-visible:outline-2 focus-visible:outline-stripe-purple rounded">전체 보기 →</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { slug: 'packaging-material-complete-guide', title: '패키징 소재 완벽 가이드', tag: '소재', summary: '종이·플라스틱·금속·유리 소재별 특성 비교' },
              { slug: 'food-packaging-materials',          title: '식품 포장재 선택 가이드',  tag: '식품', summary: 'HACCP 적합 vendor 체크리스트 포함' },
              { slug: 'eco-friendly-packaging',            title: '친환경 포장재 가이드',     tag: '친환경', summary: 'FSC·GRS·OK Compost 인증 기준 완전 정리' },
            ].map((g) => (
              <Link
                key={g.slug}
                href={`/guides/${g.slug}`}
                className="group flex flex-col bg-[#F8FAFC] border border-border-v04 rounded-xl p-4 hover:border-stripe-purple/30 hover:bg-white hover:shadow-[var(--shadow-card)] active:scale-[0.98] transition-all duration-200 focus-visible:outline-2 focus-visible:outline-stripe-purple"
              >
                <span className="text-[10px] font-bold text-stripe-purple bg-stripe-purple/8 border border-stripe-purple/15 px-2 py-0.5 rounded-md self-start mb-2.5">
                  {g.tag}
                </span>
                <p className="text-[13px] font-semibold text-heading-deep-navy group-hover:text-stripe-purple transition-colors leading-snug mb-1.5">
                  {g.title}
                </p>
                <p className="text-[11px] text-gray-400 leading-relaxed flex-1">{g.summary}</p>
                <span className="mt-3 text-[11px] text-stripe-purple font-semibold group-hover:underline underline-offset-2">
                  읽기 →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Recent update timestamp ──────────────────────────────────── */}
      <section className="px-5 sm:px-8 py-5 border-t border-border-v04">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-2.5">
              {['ISO 9001 인증 업체 8개 추가', 'HACCP 식품 포장 15개 업데이트', '이커머스 배송박스 신규 12개'].map((item) => (
                <div key={item} className="flex items-center gap-1.5 bg-white border border-border-v04 rounded-lg px-3 py-2">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0" aria-hidden="true" />
                  <span className="text-[11px] text-gray-600">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Vendor register CTA ──────────────────────────────────────── */}
      <section className="px-5 sm:px-8 py-8 border-t border-border-v04 bg-white">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-stripe-purple/8 border border-stripe-purple/15 flex items-center justify-center flex-shrink-0" aria-hidden="true">
              <span className="text-stripe-purple text-lg">🏭</span>
            </div>
            <div>
              <p className="text-[14px] font-bold text-heading-deep-navy">패키징 업체이신가요?</p>
              <p className="text-[12px] text-gray-400 mt-0.5">무료로 등록하고 구매 담당자와 직접 연결하세요.</p>
            </div>
          </div>
          <Link
            href="/opt-out?type=register"
            className="flex-shrink-0 bg-stripe-purple hover:bg-stripe-purple-hover active:scale-[0.97] text-white font-bold px-5 py-2.5 rounded-lg text-[13px] transition-all shadow-sm hover:shadow-[var(--shadow-card)] focus-visible:outline-2 focus-visible:outline-stripe-purple"
          >
            업체 등록 →
          </Link>
        </div>
      </section>

      {/* ── Interaction state reference (design QA only) ─────────────── */}
      <section className="px-5 sm:px-8 py-6 border-t border-border-v04 bg-[#F0F4FF]">
        <div className="max-w-4xl mx-auto">
          <p className="text-[10px] font-bold text-stripe-purple uppercase tracking-widest mb-3">
            [Design QA] 인터랙션 상태 매트릭스
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
            {[
              { state: 'Hover', desc: 'border stripe-purple/40 + shadow-card + bg-stripe-purple/4', class: 'border-stripe-purple/40 bg-stripe-purple/4 shadow-[var(--shadow-card)]' },
              { state: 'Focus', desc: 'ring 3px stripe-purple-ring (focus-visible)', class: 'outline outline-2 outline-stripe-purple' },
              { state: 'Active', desc: 'scale-[0.97] transition-transform', class: 'scale-95' },
              { state: 'Loading', desc: 'animate-pulse bg-gray-100 skeleton', class: 'animate-pulse bg-gray-100' },
              { state: 'Empty', desc: '텍스트 카피: "아직 검증된 업체가 없습니다"', class: 'border-dashed' },
              { state: 'Error', desc: 'border-red-300 text-red-600 (search invalid)', class: 'border-red-300' },
            ].map((s) => (
              <div key={s.state} className={`border rounded-lg px-3 py-2 bg-white ${s.class}`}>
                <span className="font-bold text-gray-700 block">{s.state}</span>
                <span className="text-gray-400 leading-snug">{s.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Viewport label (dev only) */}
      <div className="fixed bottom-4 right-4 text-[10px] font-mono bg-black/70 text-white px-2 py-1 rounded pointer-events-none z-50 sm:hidden" aria-hidden="true">
        360px · V2 Polish
      </div>
      <div className="fixed bottom-4 right-4 text-[10px] font-mono bg-black/70 text-white px-2 py-1 rounded pointer-events-none z-50 hidden sm:block" aria-hidden="true">
        ≥640px · V2 Polish
      </div>
    </div>
  )
}
