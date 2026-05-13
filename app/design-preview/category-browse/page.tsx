import type { Metadata } from 'next'
import Link from 'next/link'
import {
  INDUSTRY_CATEGORIES,
  INDUSTRY_CATEGORY_LABELS,
  INDUSTRY_CATEGORY_ICONS,
  type IndustryCategory,
} from '@/types'

export const metadata: Metadata = {
  title: 'category-browse — 5 variants (PACAA-611)',
  robots: { index: false, follow: false },
}

// ── Mock data — production values from companies table query (approx) ──────
const CATEGORY_COUNT: Record<IndustryCategory, number> = {
  'food-beverage': 248,
  'ecommerce-shipping': 196,
  'cosmetics-beauty': 132,
  'pharma-health': 84,
  'electronics-industrial': 71,
  'label-sticker': 0,
  'printing-postprocess': 0,
  'packaging-accessories': 0,
  'packaging-machinery': 0,
}

const CATEGORY_MATERIALS: Record<IndustryCategory, string[]> = {
  'food-beverage': ['종이', '필름', '플라스틱', '친환경'],
  'ecommerce-shipping': ['골판지', '완충재', '테이프', '에어캡'],
  'cosmetics-beauty': ['유리', '플라스틱', '라벨', '튜브'],
  'pharma-health': ['블리스터', '병', '캡슐', '필름'],
  'electronics-industrial': ['EPP', '진공포장', '강화골판지', '트레이'],
  'label-sticker': ['감열지', 'PP라벨', '방수', '바코드'],
  'printing-postprocess': ['오프셋', '디지털', '코팅', '형압'],
  'packaging-accessories': ['OPP테이프', '에어캡', 'PP밴드', '완충재'],
  'packaging-machinery': ['충전기', '밀봉기', '수축기', '팔레타이저'],
}

const CATEGORY_CERTS: Record<IndustryCategory, number> = {
  'food-beverage': 38,
  'ecommerce-shipping': 12,
  'cosmetics-beauty': 21,
  'pharma-health': 27,
  'electronics-industrial': 9,
  'label-sticker': 0,
  'printing-postprocess': 0,
  'packaging-accessories': 0,
  'packaging-machinery': 0,
}

const CATEGORY_VERIFIED: Record<IndustryCategory, number> = {
  'food-beverage': 142,
  'ecommerce-shipping': 88,
  'cosmetics-beauty': 76,
  'pharma-health': 54,
  'electronics-industrial': 31,
  'label-sticker': 0,
  'printing-postprocess': 0,
  'packaging-accessories': 0,
  'packaging-machinery': 0,
}

const VENDOR_LOGOS: Record<IndustryCategory, string[]> = {
  'food-beverage': ['풀무원', '농심', 'CJ', '오뚜기', '대상'],
  'ecommerce-shipping': ['쿠팡', '한진', 'CJ대한', '롯데택배', '우체국'],
  'cosmetics-beauty': ['아모레', 'LG생건', '코스맥스', '한국콜마', '에이블씨'],
  'pharma-health': ['종근당', '유한양행', '동아', 'GC녹십자', '한미'],
  'electronics-industrial': ['삼성', 'LG', 'SK', '현대모비스', '한화'],
  'label-sticker': [],
  'printing-postprocess': [],
  'packaging-accessories': [],
  'packaging-machinery': [],
}

function VariantHeader({ idx, name, sub }: { idx: number; name: string; sub: string }) {
  return (
    <div className="mb-6">
      <div className="flex items-baseline gap-3">
        <span className="text-[11px] font-mono font-semibold text-stripe-purple bg-stripe-purple/8 px-2 py-0.5 rounded">
          안 {idx}
        </span>
        <h3 className="text-lg font-semibold text-heading-deep-navy tracking-[-0.02em]">{name}</h3>
      </div>
      <p className="text-[13px] text-neutral-500 mt-1.5">{sub}</p>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────
// 안 1 — Vendor-logo preview tiles
// 카드 안에 상위 업체 로고 4~5개 작은 텍스트 칩으로 미리보기. 글자 추가 없이 시각 정보 밀도 향상.
// ─────────────────────────────────────────────────────────────────────────
function Variant1() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {INDUSTRY_CATEGORIES.map((cat) => (
        <Link
          key={cat}
          href={`/categories/${cat}`}
          className="group border border-border-v04 rounded-lg p-4 bg-white hover:border-stripe-purple/30 hover:shadow-[rgba(83,58,253,0.06)_0px_4px_12px] transition-all flex flex-col"
        >
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-9 h-9 rounded-lg bg-stripe-purple/6 flex items-center justify-center group-hover:bg-stripe-purple/10 transition-colors">
              <span className="text-base">{INDUSTRY_CATEGORY_ICONS[cat]}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold text-heading-deep-navy group-hover:text-stripe-purple transition-colors truncate">
                {INDUSTRY_CATEGORY_LABELS[cat]}
              </p>
              <p className="text-[11px] text-neutral-500">{CATEGORY_COUNT[cat]}개</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-1 mt-auto pt-2 border-t border-neutral-100">
            {VENDOR_LOGOS[cat].slice(0, 4).map((v) => (
              <span
                key={v}
                className="text-[10px] font-medium text-neutral-500 bg-neutral-50 border border-neutral-100 px-1.5 py-0.5 rounded"
              >
                {v}
              </span>
            ))}
            <span className="text-[10px] font-medium text-neutral-400 px-1.5 py-0.5">
              +{CATEGORY_COUNT[cat] - 4}
            </span>
          </div>
        </Link>
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────
// 안 2 — Bento (asymmetric featured)
// 식품·음료 큰 카드 + 4개 작은 카드. 빈 공간 채우면서 시각 위계 부여.
// ─────────────────────────────────────────────────────────────────────────
function Variant2() {
  const [hero, ...rest] = INDUSTRY_CATEGORIES
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 auto-rows-[140px]">
      <Link
        href={`/categories/${hero}`}
        className="group sm:col-span-2 sm:row-span-2 border border-border-v04 rounded-xl p-5 bg-gradient-to-br from-stripe-purple/8 via-white to-white hover:border-stripe-purple/40 transition-all flex flex-col justify-between"
      >
        <div className="flex items-start justify-between">
          <div className="w-14 h-14 rounded-xl bg-stripe-purple/10 flex items-center justify-center">
            <span className="text-3xl">{INDUSTRY_CATEGORY_ICONS[hero]}</span>
          </div>
          <span className="text-[11px] font-semibold text-stripe-purple bg-white border border-stripe-purple/20 px-2 py-0.5 rounded-full">
            가장 많이 찾는
          </span>
        </div>
        <div>
          <p className="text-[18px] font-bold text-heading-deep-navy group-hover:text-stripe-purple transition-colors">
            {INDUSTRY_CATEGORY_LABELS[hero]}
          </p>
          <div className="flex items-center gap-3 mt-2 text-[12px] text-neutral-600">
            <span>
              <b className="text-heading-deep-navy">{CATEGORY_COUNT[hero]}</b>개
            </span>
            <span className="text-neutral-300">·</span>
            <span>
              인증 <b className="text-heading-deep-navy">{CATEGORY_CERTS[hero]}</b>개
            </span>
            <span className="text-neutral-300">·</span>
            <span>
              검증 <b className="text-heading-deep-navy">{CATEGORY_VERIFIED[hero]}</b>
            </span>
          </div>
          <div className="flex flex-wrap gap-1 mt-3">
            {CATEGORY_MATERIALS[hero].map((m) => (
              <span key={m} className="text-[11px] text-stripe-purple bg-stripe-purple/6 px-2 py-0.5 rounded-full font-medium">
                {m}
              </span>
            ))}
          </div>
        </div>
      </Link>
      {rest.map((cat) => (
        <Link
          key={cat}
          href={`/categories/${cat}`}
          className="group border border-border-v04 rounded-xl p-4 bg-white hover:border-stripe-purple/30 hover:shadow-[rgba(83,58,253,0.06)_0px_4px_12px] transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xl">{INDUSTRY_CATEGORY_ICONS[cat]}</span>
            <span className="text-[11px] font-semibold text-neutral-400 tabular-nums">{CATEGORY_COUNT[cat]}</span>
          </div>
          <div>
            <p className="text-[13px] font-semibold text-heading-deep-navy group-hover:text-stripe-purple transition-colors leading-tight">
              {INDUSTRY_CATEGORY_LABELS[cat]}
            </p>
            <div className="flex gap-1 mt-1.5">
              {CATEGORY_MATERIALS[cat].slice(0, 2).map((m) => (
                <span key={m} className="text-[10px] text-neutral-500 bg-neutral-50 px-1.5 py-0.5 rounded font-medium">
                  {m}
                </span>
              ))}
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────
// 안 3 — Chip-rich horizontal rows
// 가로로 넓은 카드, 1열 스택. 카드 하나당 정보 면적 크게 — 칩 4개 + 카운트 + 인증.
// ─────────────────────────────────────────────────────────────────────────
function Variant3() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {INDUSTRY_CATEGORIES.map((cat) => (
        <Link
          key={cat}
          href={`/categories/${cat}`}
          className="group border border-border-v04 rounded-lg p-4 bg-white hover:border-stripe-purple/30 hover:shadow-[rgba(83,58,253,0.06)_0px_4px_12px] transition-all flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-lg bg-stripe-purple/6 flex items-center justify-center flex-shrink-0 group-hover:bg-stripe-purple/10 transition-colors">
            <span className="text-2xl">{INDUSTRY_CATEGORY_ICONS[cat]}</span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-2">
              <p className="text-[14px] font-semibold text-heading-deep-navy group-hover:text-stripe-purple transition-colors truncate">
                {INDUSTRY_CATEGORY_LABELS[cat]}
              </p>
              <span className="text-[11px] text-neutral-500 tabular-nums flex-shrink-0">
                {CATEGORY_COUNT[cat]}개
              </span>
              <span className="text-[10px] text-success-700 bg-success-50 border border-success-200 px-1.5 py-0 rounded font-medium flex-shrink-0">
                인증 {CATEGORY_CERTS[cat]}
              </span>
            </div>
            <div className="flex flex-wrap gap-1 mt-1.5">
              {CATEGORY_MATERIALS[cat].map((m) => (
                <span key={m} className="text-[11px] text-neutral-600 bg-neutral-50 border border-neutral-100 px-1.5 py-0.5 rounded font-medium">
                  {m}
                </span>
              ))}
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────
// 안 4 — Stat-dense (numbers-first)
// 큰 숫자가 시각 중심. 카운트가 정보, 글자 추가 없음.
// ─────────────────────────────────────────────────────────────────────────
function Variant4() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
      {INDUSTRY_CATEGORIES.map((cat) => {
        const verifiedPct = Math.round((CATEGORY_VERIFIED[cat] / CATEGORY_COUNT[cat]) * 100)
        return (
          <Link
            key={cat}
            href={`/categories/${cat}`}
            className="group border border-border-v04 rounded-lg p-4 bg-white hover:border-stripe-purple/30 hover:shadow-[rgba(83,58,253,0.06)_0px_4px_12px] transition-all flex flex-col"
          >
            <div className="flex items-start justify-between mb-3">
              <span className="text-xl">{INDUSTRY_CATEGORY_ICONS[cat]}</span>
              <span className="text-[10px] font-semibold text-stripe-purple bg-stripe-purple/6 px-1.5 py-0.5 rounded tabular-nums">
                ✓ {verifiedPct}%
              </span>
            </div>
            <div className="flex items-baseline gap-1 leading-none">
              <span className="text-[32px] font-bold text-heading-deep-navy group-hover:text-stripe-purple transition-colors tracking-tight tabular-nums">
                {CATEGORY_COUNT[cat]}
              </span>
              <span className="text-[12px] text-neutral-400">개</span>
            </div>
            <p className="text-[12px] font-medium text-neutral-600 mt-1 leading-tight">
              {INDUSTRY_CATEGORY_LABELS[cat]}
            </p>
            <div className="mt-3 pt-3 border-t border-neutral-100 flex items-center gap-1.5 tabular-nums">
              <div className="flex-1 h-1 rounded-full bg-neutral-100 overflow-hidden">
                <div
                  className="h-full bg-stripe-purple/70"
                  style={{ width: `${verifiedPct}%` }}
                />
              </div>
              <span className="text-[10px] font-medium text-neutral-400">
                인증 {CATEGORY_CERTS[cat]}
              </span>
            </div>
          </Link>
        )
      })}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────
// 안 5 — Image-first / atmospheric
// 큰 그라데이션 배경 + 큰 아이콘 중심 + 작은 카운트 배지. 분위기 중심.
// ─────────────────────────────────────────────────────────────────────────
function Variant5() {
  const gradients: Record<IndustryCategory, string> = {
    'food-beverage': 'from-orange-50 via-amber-50 to-rose-50',
    'ecommerce-shipping': 'from-sky-50 via-blue-50 to-indigo-50',
    'cosmetics-beauty': 'from-pink-50 via-fuchsia-50 to-purple-50',
    'pharma-health': 'from-emerald-50 via-teal-50 to-cyan-50',
    'electronics-industrial': 'from-slate-100 via-zinc-100 to-stone-100',
    'label-sticker': 'from-blue-50 via-sky-50 to-cyan-50',
    'printing-postprocess': 'from-violet-50 via-purple-50 to-fuchsia-50',
    'packaging-accessories': 'from-orange-50 via-amber-50 to-yellow-50',
    'packaging-machinery': 'from-green-50 via-emerald-50 to-teal-50',
  }
  const ringColors: Record<IndustryCategory, string> = {
    'food-beverage': 'hover:ring-orange-200',
    'ecommerce-shipping': 'hover:ring-sky-200',
    'cosmetics-beauty': 'hover:ring-pink-200',
    'pharma-health': 'hover:ring-emerald-200',
    'electronics-industrial': 'hover:ring-slate-200',
    'label-sticker': 'hover:ring-blue-200',
    'printing-postprocess': 'hover:ring-violet-200',
    'packaging-accessories': 'hover:ring-orange-200',
    'packaging-machinery': 'hover:ring-green-200',
  }
  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
      {INDUSTRY_CATEGORIES.map((cat) => (
        <Link
          key={cat}
          href={`/categories/${cat}`}
          className={`group relative aspect-[5/6] rounded-xl bg-gradient-to-br ${gradients[cat]} overflow-hidden ring-1 ring-black/5 ${ringColors[cat]} hover:ring-2 hover:shadow-lg transition-all flex flex-col justify-between p-4`}
        >
          <span className="absolute top-3 right-3 text-[10px] font-semibold text-heading-deep-navy bg-white/80 backdrop-blur-sm px-2 py-0.5 rounded-full tabular-nums shadow-sm">
            {CATEGORY_COUNT[cat]}개
          </span>
          <div className="flex-1 flex items-center justify-center">
            <span className="text-6xl drop-shadow-sm group-hover:scale-110 transition-transform duration-300">
              {INDUSTRY_CATEGORY_ICONS[cat]}
            </span>
          </div>
          <div>
            <p className="text-[14px] font-bold text-heading-deep-navy leading-tight">
              {INDUSTRY_CATEGORY_LABELS[cat]}
            </p>
            <div className="flex gap-1 mt-1.5">
              {CATEGORY_MATERIALS[cat].slice(0, 2).map((m) => (
                <span key={m} className="text-[10px] text-heading-deep-navy/70 bg-white/60 px-1.5 py-0.5 rounded font-medium">
                  {m}
                </span>
              ))}
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────
// Current (baseline reference)
// ─────────────────────────────────────────────────────────────────────────
function Current() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {INDUSTRY_CATEGORIES.map((cat) => (
        <Link
          key={cat}
          href={`/categories/${cat}`}
          className="group border border-border-v04 rounded-lg p-4 bg-white hover:border-stripe-purple/30 transition-all text-center"
        >
          <div className="w-10 h-10 rounded-lg bg-stripe-purple/6 mx-auto mb-3 flex items-center justify-center">
            <span className="text-lg">{INDUSTRY_CATEGORY_ICONS[cat]}</span>
          </div>
          <p className="text-[13px] font-semibold text-heading-deep-navy">
            {INDUSTRY_CATEGORY_LABELS[cat]}
          </p>
          <p className="text-[11px] text-neutral-500 mt-0.5">{CATEGORY_COUNT[cat]}개</p>
        </Link>
      ))}
    </div>
  )
}

export default function Page() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="bg-white border-b border-border-v04 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-5 py-4">
          <p className="text-[11px] font-mono font-semibold text-stripe-purple uppercase tracking-widest">
            PACAA-611 · design preview
          </p>
          <h1 className="text-xl font-semibold text-heading-deep-navy tracking-[-0.02em] mt-1">
            카테고리별 업체 둘러보기 — 개선안 5가지
          </h1>
          <p className="text-[13px] text-neutral-500 mt-1">
            현재 안 대비 빈 공간을 줄이고 시각 정보 밀도를 높였습니다. 글자 추가 최소화, 숫자·칩·로고 위주.
          </p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-5 py-10 space-y-14 pb-24">
        <section>
          <div className="mb-6">
            <div className="flex items-baseline gap-3">
              <span className="text-[11px] font-mono font-semibold text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded">
                현재
              </span>
              <h3 className="text-lg font-semibold text-heading-deep-navy tracking-[-0.02em]">
                현재 메인페이지
              </h3>
            </div>
            <p className="text-[13px] text-neutral-500 mt-1.5">
              아이콘 + 라벨 + 카운트. 빈 공간이 있고 카테고리 간 차이가 안 드러남.
            </p>
          </div>
          <Current />
        </section>

        <hr className="border-border-v04" />

        <section>
          <VariantHeader
            idx={1}
            name="대표 업체 미리보기"
            sub="카드 안에 상위 업체 4개 칩으로 미리보기. 글자 추가 없이 '누가 있는지' 한 줄로 노출."
          />
          <Variant1 />
        </section>

        <section>
          <VariantHeader
            idx={2}
            name="벤또(Bento) — 1개 강조"
            sub="가장 큰 카테고리(식품·음료)를 2x2 hero 로 강조. 빈 공간을 위계로 채움."
          />
          <Variant2 />
        </section>

        <section>
          <VariantHeader
            idx={3}
            name="가로 칩 카드 (소재 노출)"
            sub="2열 가로 카드. 카드 하나당 면적이 넓고 소재 4개 칩 + 인증 수 즉시 가시화."
          />
          <Variant3 />
        </section>

        <section>
          <VariantHeader
            idx={4}
            name="숫자 중심 — Stat 카드"
            sub="큰 숫자를 시각 중심에. 검증 비율 progress + 인증 카운트로 글자 없이 정보 밀도 ↑."
          />
          <Variant4 />
        </section>

        <section>
          <VariantHeader
            idx={5}
            name="이미지 우선 — 분위기 타일"
            sub="카테고리별 그라데이션 + 큰 아이콘. 카운트는 작은 배지. 시각/감성 중심, 텍스트 최소."
          />
          <Variant5 />
        </section>
      </main>
    </div>
  )
}
