import type { Metadata } from 'next'
import Link from 'next/link'
import { PacklinxLogo } from '@/components/PacklinxLogo'
import { BusinessRegistrationInfo } from '@/components/BusinessRegistrationInfo'

export const metadata: Metadata = {
  title: 'Design Preview r2 — 메인페이지 3-Direction v2 | Packlinx',
  robots: { index: false, follow: false },
}

const DIRECTIONS = [
  {
    slug: 'main-r2-v1',
    label: 'r2-v1 — Editorial Asymmetric',
    benchmark: 'linear.app · ft.com · nytimes.com B2B',
    shape: 'asymmetric',
    shapeDesc: '60/40 split',
    description:
      '좌 60% 대형 헤드라인 + 검색 / 우 40% 카테고리 링크 + vendor 수. 한 화면 한 메시지. 아래 가이드 3칸 가로.',
    tradeoff: '정보 밀도 낮음 — repeat 구매자는 카테고리까지 1단계 추가 클릭.',
    headerTreatment: 'border-bottom 1px brand-300 + logo brand-800',
    persona: {
      firstVisit: '✅ 1초 파악 — h1이 페이지 목적 선언',
      repeat: '⚠️ 카테고리 링크 → 1click',
      vendor: '⚠️ 등록 CTA → scroll',
    },
    mobileReflow: 'hero 60/40 → 세로 스택 (불가피). h1 먼저, 카테고리 바로 아래.',
    wireframe: `
┌─────────────────────────────────────────────┐
│ HEADER (brand-300 bottom border)            │
├─────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐   │
│  │  60% LEFT PANE  │  │  40% RIGHT      │   │
│  │  eyebrow        │  │  Category A     │   │
│  │  BIG H1         │  │  Category B     │   │
│  │  subline        │  │  Category C     │   │
│  │  [  SEARCH  ]   │  │  Category D     │   │
│  │                 │  │  Category E     │   │
│  └─────────────────┘  │  1,380개 업체   │   │
│                       └─────────────────┘   │
│  ┌──────┐ ┌──────┐ ┌──────┐  ← 3 guides    │
│  │guide1│ │guide2│ │guide3│                 │
│  └──────┘ └──────┘ └──────┘                 │
└─────────────────────────────────────────────┘`,
  },
  {
    slug: 'main-r2-v2',
    label: 'r2-v2 — Bento Modular',
    benchmark: 'apple.com bento · vercel.com ship · raycast.com',
    shape: 'bento',
    shapeDesc: '5칸 asymmetric grid',
    description:
      '상단 검색바 + count → bento 5칸 비대칭 그리드. 큰 칸 카테고리 5개, 중간 칸 가이드·검증 정보, 작은 칸 vendor 등록 CTA.',
    tradeoff: '그리드 칸 수가 많아 모바일 reflow 설계 필요. first-visit에 구조 파악 시간 +2초.',
    headerTreatment: 'header bg brand-50 wash + footer bg brand-900 dark',
    persona: {
      firstVisit: '✅ 전체 구조 scan 10초',
      repeat: '✅ 카테고리 큰 칸 바로 클릭',
      vendor: '✅ 작은 칸 등록 CTA fold 안',
    },
    mobileReflow: 'bento → 2-col (중간 크기 칸) → 1-col (small 칸). 큰 칸이 항상 1등.',
    wireframe: `
┌─────────────────────────────────────────────┐
│ HEADER (bg brand-50 wash)                   │
├─────────────────────────────────────────────┤
│  [ __________ 검색어 입력 __________ ]  1,380개 │
│  ┌──────────────┬──────┬──────┐             │
│  │ 2×2 BIG      │ G1   │ G2   │             │
│  │ 카테고리 5개  ├──────┤      │             │
│  │ + 1,380개    │ 검증? │      │             │
│  ├──────────────┤ link ├──────┤             │
│  │ Guide 2 feat │      │ CTA  │             │
│  └──────────────┴──────┴──────┘             │
├─────────────────────────────────────────────┤
│ FOOTER (bg brand-900 dark)                  │
└─────────────────────────────────────────────┘`,
  },
  {
    slug: 'main-r2-v3',
    label: 'r2-v3 — Sidebar Directory',
    benchmark: 'linear.app docs · notion.so · stripe.com docs',
    shape: 'sidebar',
    shapeDesc: '240px sticky sidebar + main pane',
    description:
      '좌측 240px sticky 카테고리 사이드바 + 우측 메인 패인. 슬림 hero → vendor 6개 preview → 가이드 3개 가로.',
    tradeoff: '데스크톱 전용 느낌 위험. 모바일 drawer 구현 필수. 디렉토리형 탐색에 최적.',
    headerTreatment: 'header transparent → scroll brand-50 fade (sticky, use client)',
    persona: {
      firstVisit: '✅ 좌측 카테고리로 즉시 탐색',
      repeat: '✅ 사이드바 카테고리 direct click',
      vendor: '⚠️ main pane 하단 가이드 옆',
    },
    mobileReflow: '사이드바 → 상단 collapsible drawer + 카테고리 chip 가로 carousel.',
    wireframe: `
┌─────────────────────────────────────────────┐
│ HEADER (transparent → brand-50 on scroll)   │
├──────────┬──────────────────────────────────┤
│  SIDEBAR │  MAIN PANE                       │
│  240px   │  h1 + 검색 + 1,380개             │
│  sticky  │  ──────────────────────────      │
│  Cat A   │  vendor 6개 (이름+카테고리)        │
│  Cat B   │  ──────────────────────────      │
│  Cat C   │  Guide ▪ Guide ▪ Guide           │
│  Cat D   │                                  │
│  Cat E   │                                  │
└──────────┴──────────────────────────────────┘`,
  },
]

export default function R2IndexPage() {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      {/* Header */}
      <header className="bg-neutral-900 sticky top-0 z-50 border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <PacklinxLogo variant="dark" />
            <span className="hidden sm:inline text-neutral-400 text-[11px] font-medium tracking-widest uppercase">패키징 업체 검색 플랫폼</span>
          </Link>
          <nav className="flex items-center gap-3">
            <Link href="/categories" className="text-neutral-200 hover:text-white text-sm font-medium px-3.5 py-2 border border-white/[0.15] hover:border-white/[0.30] rounded-full transition-colors">카테고리</Link>
            <Link href="/guides" className="text-neutral-200 hover:text-white text-sm font-medium px-3.5 py-2 border border-white/[0.15] hover:border-white/[0.30] rounded-full transition-colors">가이드</Link>
          </nav>
        </div>
      </header>

      {/* Preview banner */}
      <div className="bg-brand-50 border-b border-brand-200 px-4 py-2.5 text-center text-[12px] text-brand-800 font-medium">
        🎨 DESIGN PREVIEW r2 — noindex · 보드 검토용 · PACAA-492
      </div>

      <main className="flex-1 max-w-6xl mx-auto px-5 sm:px-8 py-10 sm:py-16 w-full">
        {/* Title */}
        <div className="mb-10">
          <p className="text-[11px] font-semibold tracking-widest uppercase text-stripe-purple mb-3">
            PACAA-492 · r2 · 보드 v3 피드백 반영
          </p>
          <h1 className="text-[28px] sm:text-[36px] font-light text-heading-deep-navy leading-[1.15] tracking-[-0.5px] mb-4">
            메인페이지 3-Direction r2 Prototype
          </h1>
          <p className="text-[15px] text-body-secondary leading-relaxed max-w-2xl">
            색 단순화(monochrome stripe-purple + neutral) · 별점·인증 badge 제거 · 비대칭/모듈 레이아웃 3안.
            보드 선택 후 production swap은 별도 Phase 2 child.
          </p>
        </div>

        {/* Changes from r1 */}
        <div className="bg-brand-50 border border-brand-200 rounded-xl p-5 mb-10 text-[13px]">
          <p className="font-semibold text-brand-800 mb-2">r1 대비 변경 사항 (보드 v3 피드백 반영)</p>
          <ul className="text-brand-700 space-y-1">
            <li>✅ 색 단순화 — amber/blue/green/yellow 제거, stripe-purple + neutral만</li>
            <li>✅ 별점·star rating 완전 제거</li>
            <li>✅ 인증 badge 시각화 제거 → 1줄 텍스트만</li>
            <li>✅ AnimatedCounter 제거 → inline 수치 1회</li>
            <li>✅ &quot;최근 검증된 vendor&quot; live feed 제거</li>
            <li>✅ 레이아웃 수직 stack 탈피 — 3안 모두 비대칭/분할/모듈</li>
            <li>✅ 헤더/푸터 글로벌 CSS 색 연동 (3안 각기 다른 처리)</li>
          </ul>
        </div>

        {/* 3 Direction cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          {DIRECTIONS.map((d) => (
            <Link
              key={d.slug}
              href={`/design-preview/${d.slug}`}
              className="group flex flex-col bg-white border border-border-v04 rounded-xl p-6 hover:border-stripe-purple/30 hover:shadow-[var(--shadow-elevated-v04)] transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-stripe-purple/8 text-stripe-purple uppercase tracking-wide">
                  {d.shapeDesc}
                </span>
                <svg className="w-4 h-4 text-neutral-300 group-hover:text-stripe-purple transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <h2 className="text-[15px] font-semibold text-heading-deep-navy mb-1 group-hover:text-stripe-purple transition-colors">
                {d.label}
              </h2>
              <p className="text-[11px] text-neutral-400 mb-3">benchmark: {d.benchmark}</p>
              <p className="text-[13px] text-body-secondary leading-relaxed flex-1">{d.description}</p>
              <div className="mt-4 pt-4 border-t border-neutral-100">
                <p className="text-[11px] text-neutral-500 leading-relaxed">
                  <span className="font-semibold">헤더:</span> {d.headerTreatment}
                </p>
                <p className="text-[11px] text-neutral-500 leading-relaxed mt-1">
                  <span className="font-semibold">Tradeoff:</span> {d.tradeoff}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* Persona × 10초 Mission */}
        <section className="mb-12">
          <h2 className="text-[20px] font-light text-heading-deep-navy tracking-[-0.3px] mb-1">
            페르소나 × 10초 Mission 자가 평가
          </h2>
          <p className="text-[13px] text-body-secondary mb-6">각 안이 10초 안에 미션을 충족하는지 평가.</p>
          <div className="overflow-x-auto">
            <table className="w-full text-[13px] border-collapse">
              <thead>
                <tr className="border-b border-border-v04">
                  <th className="text-left py-3 pr-4 text-[11px] font-semibold text-neutral-400 uppercase tracking-widest min-w-[160px]">페르소나 / 미션</th>
                  {DIRECTIONS.map((d) => (
                    <th key={d.slug} className="text-left py-3 pr-4 font-semibold text-heading-deep-navy min-w-[160px]">
                      <Link href={`/design-preview/${d.slug}`} className="hover:text-stripe-purple transition-colors">
                        {d.label.split(' — ')[0]}
                      </Link>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border-v04">
                  <td className="py-3 pr-4 text-[12px] text-body-secondary">
                    🧑‍💼 구매자 first-visit<br />
                    <span className="text-[11px] text-neutral-400">"목적·vendor·신뢰 10초 판단"</span>
                  </td>
                  {DIRECTIONS.map((d) => (
                    <td key={d.slug} className="py-3 pr-4 text-[12px]">{d.persona.firstVisit}</td>
                  ))}
                </tr>
                <tr className="border-b border-border-v04">
                  <td className="py-3 pr-4 text-[12px] text-body-secondary">
                    🔄 구매자 repeat<br />
                    <span className="text-[11px] text-neutral-400">"카테고리 1click 진입"</span>
                  </td>
                  {DIRECTIONS.map((d) => (
                    <td key={d.slug} className="py-3 pr-4 text-[12px]">{d.persona.repeat}</td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3 pr-4 text-[12px] text-body-secondary">
                    🏭 Vendor self-claim<br />
                    <span className="text-[11px] text-neutral-400">"등록/수정 fold 안"</span>
                  </td>
                  {DIRECTIONS.map((d) => (
                    <td key={d.slug} className="py-3 pr-4 text-[12px]">{d.persona.vendor}</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Layout shape diagrams */}
        <section className="mb-12">
          <h2 className="text-[20px] font-light text-heading-deep-navy tracking-[-0.3px] mb-1">
            Layout Shape 도식
          </h2>
          <p className="text-[13px] text-body-secondary mb-6">3안 wireframe — 비대칭/bento/sidebar 구조 비교.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {DIRECTIONS.map((d) => (
              <div key={d.slug} className="bg-white border border-border-v04 rounded-xl p-5">
                <h3 className="text-[13px] font-semibold text-heading-deep-navy mb-3">{d.label.split(' — ')[1]}</h3>
                <pre className="text-[10px] text-body-secondary font-mono leading-[1.4] overflow-x-auto whitespace-pre">
                  {d.wireframe.trim()}
                </pre>
                <p className="text-[11px] text-body-secondary mt-3 leading-relaxed">
                  <span className="font-semibold">모바일 reflow:</span> {d.mobileReflow}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Interaction states */}
        <section className="mb-8">
          <h2 className="text-[20px] font-light text-heading-deep-navy tracking-[-0.3px] mb-1">
            인터랙션 상태 6종
          </h2>
          <p className="text-[13px] text-body-secondary mb-5">인증·별점 micro-interaction 제거, V04 토큰 유지.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { state: 'hover', desc: 'border-stripe-purple/30 + shadow-elevated-v04' },
              { state: 'focus', desc: 'ring-stripe-purple-ring 3px outline' },
              { state: 'active', desc: 'bg-stripe-purple text-white' },
              { state: 'error', desc: 'border-error-600 text-error-600 (form only)' },
              { state: 'loading', desc: 'opacity-50 cursor-wait + skeleton pulse' },
              { state: 'empty', desc: '정중한 카피 + 카테고리 재진입 링크' },
            ].map((s) => (
              <div key={s.state} className="bg-white border border-border-v04 rounded-lg p-4">
                <span className="text-[11px] font-semibold bg-stripe-purple/8 text-stripe-purple px-2 py-0.5 rounded uppercase inline-block mb-2">
                  {s.state}
                </span>
                <p className="text-[12px] text-body-secondary">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border-v04 bg-white mt-auto">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-col gap-1.5">
              <PacklinxLogo variant="light" layout="horizontal" />
              <p className="text-[12px] text-body-secondary">© 2026 PACKLINX. 보드 검토용 preview — noindex.</p>
              <BusinessRegistrationInfo theme="light" />
            </div>
            <div className="flex gap-4 text-[12px] text-body-secondary">
              <Link href="/design-preview/main-r2-v1" className="hover:text-heading-deep-navy transition-colors">r2-v1 Editorial</Link>
              <Link href="/design-preview/main-r2-v2" className="hover:text-heading-deep-navy transition-colors">r2-v2 Bento</Link>
              <Link href="/design-preview/main-r2-v3" className="hover:text-heading-deep-navy transition-colors">r2-v3 Sidebar</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
