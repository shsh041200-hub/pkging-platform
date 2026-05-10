import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Design Preview — 메인페이지 3-Direction Prototype | Packlinx',
  robots: { index: false, follow: false },
}

const DIRECTIONS = [
  {
    slug: 'main-v1',
    label: 'V1 — Stripe-style 명료성',
    benchmark: 'stripe.com',
    density: 'LOW',
    densityColor: 'bg-blue-100 text-blue-700',
    description:
      '넓은 white space, 단일 CTA, 카테고리 chip, 가이드 카드 3개. 구매자가 "무엇을 할 수 있나"를 1초에 파악. 신뢰는 vendor count + 검증 배지로만 표현.',
    tradeoff: '정보 밀도가 낮아 반복 구매자에게는 클릭 depth가 생김. 한국 B2B 구매자 "많이 보임 = 신뢰" 기대와 다소 간극.',
    persona: {
      firstVisit: '✅ 즉시 이해 — 사이트 목적 명확',
      repeat: '⚠️ 카테고리 chip 1click → 검색',
      vendor: '⚠️ fold 밖 — scroll 필요',
    },
  },
  {
    slug: 'main-v2',
    label: 'V2 — 한국 신뢰-시그널 밀도',
    benchmark: '다나와 · 오늘의집 above-fold',
    density: 'HIGH',
    densityColor: 'bg-orange-100 text-orange-700',
    description:
      '검색바 + vendor count + 인증 배지 2~3 + 최근 업데이트 timestamp + 12칸 카테고리 그리드. "많이 보임 = 신뢰" 한국 B2B 휴리스틱 대응. 첫 인상에 플랫폼 규모와 신뢰를 동시에 전달.',
    tradeoff: '화면 밀도가 높아 first-visit 구매자가 압도될 수 있음. 모바일에서 스크롤 피로도 유의.',
    persona: {
      firstVisit: '✅ 규모·신뢰 즉시 전달',
      repeat: '✅ 카테고리 12칸 즉시 접근',
      vendor: '✅ fold 안 — "업체 등록" 노출',
    },
  },
  {
    slug: 'main-v3',
    label: 'V3 — Discovery-first 디렉토리',
    benchmark: 'thomasnet.com · houzz.com pro',
    density: 'MEDIUM',
    densityColor: 'bg-green-100 text-green-700',
    description:
      'Hero 자체가 카테고리 그리드. 얇은 검색바 위에, 아래에 "이번 주 검증된 vendor" 피드 + 가이드·방법론 블록. 탐색형 구매자에게 최적화.',
    tradeoff: '검색이 secondary → 검색 의도로 방문한 구매자는 낯설 수 있음. 카테고리 아키텍처가 명확해야 함.',
    persona: {
      firstVisit: '✅ 카테고리 구조로 즉시 탐색',
      repeat: '✅ 카테고리 직접 진입 1click',
      vendor: '⚠️ 검색바 위 좁은 배너로 노출',
    },
  },
]

const PERSONAS = [
  {
    icon: '🧑‍💼',
    name: '구매자 first-visit',
    mission: '"사이트가 뭐고 / vendor 어떻게 찾고 / 신뢰 가능?" 10초 판단',
  },
  {
    icon: '🔄',
    name: '구매자 repeat',
    mission: '카테고리 즉시 진입 1 click 이내',
  },
  {
    icon: '🏭',
    name: 'Vendor self-claim',
    mission: '"내 회사 등록/수정" 진입 fold 안',
  },
]

export default function DesignPreviewIndexPage() {
  return (
    <div className="max-w-5xl mx-auto px-5 sm:px-8 py-10 sm:py-16">
      {/* Title */}
      <div className="mb-10">
        <p className="text-[11px] font-semibold tracking-widest uppercase text-stripe-purple mb-3">
          PACAA-491 · 보드 검토용 prototype
        </p>
        <h1 className="text-[28px] sm:text-[36px] font-light text-heading-deep-navy leading-[1.15] tracking-[-0.5px] mb-4">
          메인페이지 3-Direction Prototype
        </h1>
        <p className="text-[15px] text-gray-500 leading-relaxed max-w-2xl">
          세 방향의 design space를 Chrome에서 직접 비교하세요.
          보드 선택 후 production swap은 별도 Phase 2 child로 진행합니다.
        </p>
      </div>

      {/* 3 Direction cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
        {DIRECTIONS.map((d) => (
          <Link
            key={d.slug}
            href={`/design-preview/${d.slug}`}
            className="group flex flex-col bg-white border border-border-v04 rounded-xl p-6 hover:border-stripe-purple/30 hover:shadow-[var(--shadow-elevated-v04)] transition-all duration-200"
          >
            <div className="flex items-center justify-between mb-3">
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${d.densityColor}`}>
                밀도 {d.density}
              </span>
              <svg className="w-4 h-4 text-gray-300 group-hover:text-stripe-purple transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <h2 className="text-[15px] font-semibold text-heading-deep-navy mb-1 group-hover:text-stripe-purple transition-colors">
              {d.label}
            </h2>
            <p className="text-[11px] text-gray-400 mb-3">benchmark: {d.benchmark}</p>
            <p className="text-[13px] text-gray-600 leading-relaxed flex-1">{d.description}</p>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-[11px] text-amber-600 leading-relaxed">
                <span className="font-semibold">Tradeoff:</span> {d.tradeoff}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* Persona mission 10초 self-assessment */}
      <section className="mb-12">
        <h2 className="text-[18px] font-light text-heading-deep-navy tracking-[-0.3px] mb-2">
          페르소나 × 10초 Mission 자가 평가
        </h2>
        <p className="text-[13px] text-gray-400 mb-5">각 안이 10초 안에 미션을 충족하는지 평가.</p>

        {/* Personas description */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          {PERSONAS.map((p) => (
            <div key={p.name} className="bg-white border border-border-v04 rounded-lg p-4">
              <div className="text-xl mb-2">{p.icon}</div>
              <p className="text-[13px] font-semibold text-gray-800 mb-1">{p.name}</p>
              <p className="text-[12px] text-gray-500">{p.mission}</p>
            </div>
          ))}
        </div>

        {/* Assessment table */}
        <div className="overflow-x-auto">
          <table className="w-full text-[13px] border-collapse">
            <thead>
              <tr className="border-b border-border-v04">
                <th className="text-left py-3 pr-4 text-[11px] font-semibold text-gray-400 uppercase tracking-widest w-1/4">페르소나</th>
                {DIRECTIONS.map((d) => (
                  <th key={d.slug} className="text-left py-3 pr-4 font-semibold text-gray-700">
                    <Link href={`/design-preview/${d.slug}`} className="hover:text-stripe-purple transition-colors">
                      {d.label.split(' — ')[0]}
                    </Link>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border-v04">
                <td className="py-3 pr-4 text-[12px] text-gray-500">🧑‍💼 구매자 first-visit</td>
                {DIRECTIONS.map((d) => (
                  <td key={d.slug} className="py-3 pr-4 text-[12px]">{d.persona.firstVisit}</td>
                ))}
              </tr>
              <tr className="border-b border-border-v04">
                <td className="py-3 pr-4 text-[12px] text-gray-500">🔄 구매자 repeat</td>
                {DIRECTIONS.map((d) => (
                  <td key={d.slug} className="py-3 pr-4 text-[12px]">{d.persona.repeat}</td>
                ))}
              </tr>
              <tr>
                <td className="py-3 pr-4 text-[12px] text-gray-500">🏭 Vendor self-claim</td>
                {DIRECTIONS.map((d) => (
                  <td key={d.slug} className="py-3 pr-4 text-[12px]">{d.persona.vendor}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Interaction state matrix */}
      <section className="mb-12">
        <h2 className="text-[18px] font-light text-heading-deep-navy tracking-[-0.3px] mb-2">
          인터랙션 상태 매트릭스
        </h2>
        <p className="text-[13px] text-gray-400 mb-5">6종 상태 모두 V04 토큰으로 적용됨.</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { state: 'hover', desc: 'border-stripe-purple/30 + shadow', example: 'bg-white hover:border-stripe-purple/30' },
            { state: 'focus', desc: 'ring-stripe-purple-ring (3px)', example: 'focus-visible:ring-stripe-purple' },
            { state: 'active', desc: 'bg-stripe-purple text-white', example: 'bg-stripe-purple text-white' },
            { state: 'error', desc: 'border-red-400 text-red-600', example: 'border-red-400 bg-red-50' },
            { state: 'loading', desc: 'opacity-50 cursor-wait skeleton', example: 'animate-pulse bg-gray-100' },
            { state: 'empty', desc: '정중·정보적 카피 + 카테고리 재진입', example: 'text-gray-500 bg-gray-50' },
          ].map((s) => (
            <div key={s.state} className="bg-white border border-border-v04 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[11px] font-semibold bg-stripe-purple/8 text-stripe-purple px-2 py-0.5 rounded uppercase">
                  {s.state}
                </span>
              </div>
              <p className="text-[12px] text-gray-600">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Info hierarchy note */}
      <section className="bg-stripe-purple/4 border border-stripe-purple/15 rounded-xl p-6 mb-8">
        <h2 className="text-[15px] font-semibold text-heading-deep-navy mb-3">정보 위계 캡처 계획</h2>
        <p className="text-[13px] text-gray-600 leading-relaxed mb-3">
          각 variant 페이지에서 Chrome DevTools → Device Emulator → 360px (모바일) / 1280px (데스크톱) 두 뷰포트 캡처.
          viewport 1/2/3 fold line 기준으로 무엇이 보이는지 검토.
        </p>
        <ul className="text-[12px] text-gray-500 space-y-1">
          <li>• Viewport 1 (above fold): 검색바 + hero copy + 핵심 CTA</li>
          <li>• Viewport 2: 카테고리 그리드 / 신뢰 시그널</li>
          <li>• Viewport 3: 가이드 카드 / vendor 피드 / 방법론</li>
        </ul>
      </section>
    </div>
  )
}
