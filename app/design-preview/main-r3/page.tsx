import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'r3 메인페이지 10 variant 비교',
  robots: { index: false, follow: false },
}

const VARIANTS = [
  {
    id: 'v01',
    label: 'V01 검색 게이트웨이',
    axis: 'search-prominent',
    diff: '검색 플랫폼 본질에 가장 충실. 첫 인상부터 "포장재 업체 검색창"임을 명확히 전달.',
    difficulty: 'low',
    href: '/design-preview/main-r3-v01',
    cmoPick: 1,
  },
  {
    id: 'v02',
    label: 'V02 검색 + 카테고리 듀얼 히어로',
    axis: 'search-prominent',
    diff: '검색과 카테고리 브라우즈를 fold 위에 동시 제공. 검색 의도 유저·탐색 유저 모두 수용.',
    difficulty: 'low',
    href: '/design-preview/main-r3-v02',
    cmoPick: null,
  },
  {
    id: 'v03',
    label: 'V03 타이핑 플레이스홀더 검색 히어로',
    axis: 'search-prominent',
    diff: '검색 의도를 platform이 먼저 제안. 처음 방문하는 바이어가 즉시 공감 가능.',
    difficulty: 'mid',
    href: '/design-preview/main-r3-v03',
    cmoPick: null,
  },
  {
    id: 'v04',
    label: 'V04 콘텐츠 + 카테고리 에디토리얼',
    axis: 'content/learning lead',
    diff: '콘텐츠를 진입점으로 삼아 SEO 트래픽 유입 → vendor profile 전환. 검색 의도 없는 유저 대응.',
    difficulty: 'low',
    href: '/design-preview/main-r3-v04',
    cmoPick: null,
  },
  {
    id: 'v05',
    label: 'V05 상황별 온보딩 플로우',
    axis: 'content/learning lead',
    diff: '바이어 상황을 platform이 먼저 파악. 첫 방문 전환율 최적화.',
    difficulty: 'mid',
    href: '/design-preview/main-r3-v05',
    cmoPick: null,
  },
  {
    id: 'v06',
    label: 'V06 업체 카드 쇼케이스 그리드',
    axis: 'vendor showcase lead',
    diff: '"여기에 업체들이 있다"는 사실을 fold 위에서 즉시 증명. 빈 directory가 아님을 시각 보장.',
    difficulty: 'low',
    href: '/design-preview/main-r3-v06',
    cmoPick: 2,
  },
  {
    id: 'v07',
    label: 'V07 업체 통계 + 디렉토리 매트릭스',
    axis: 'vendor showcase lead',
    diff: '규모와 신뢰를 숫자로 먼저 전달. 한국 B2B 의사결정자가 "얼마나 많이 있는지" 즉시 확인 가능.',
    difficulty: 'low',
    href: '/design-preview/main-r3-v07',
    cmoPick: null,
  },
  {
    id: 'v08',
    label: 'V08 미니멀 에디토리얼 (Stripe 톤)',
    axis: 'minimal/editorial',
    diff: '극도로 클린한 첫인상. 정보 노이즈 0. 브랜드 성숙도를 레이아웃 여백으로 전달.',
    difficulty: 'low',
    href: '/design-preview/main-r3-v08',
    cmoPick: null,
  },
  {
    id: 'v09',
    label: 'V09 다크 미니멀 (Linear 톤)',
    axis: 'minimal/editorial',
    diff: '한국 포장재 B2B 업계에서 다크 테마 메인 = 즉각적 시각 차별화. 프리미엄 플랫폼 이미지 선점.',
    difficulty: 'mid',
    href: '/design-preview/main-r3-v09',
    cmoPick: 3,
  },
  {
    id: 'v10',
    label: 'V10 한국 B2B 정공법',
    axis: '한국 B2B emulation',
    diff: '한국 B2B 구매 담당자에게 가장 친숙한 레이아웃. 학습 곡선 0. 신뢰감·정보 밀도 균형.',
    difficulty: 'low',
    href: '/design-preview/main-r3-v10',
    cmoPick: null,
  },
]

const DIFF_COLOR: Record<string, string> = {
  low: 'bg-slate-100 text-slate-600',
  mid: 'bg-[rgba(83,58,253,0.08)] text-[#533afd]',
}

export default function R3IndexPage() {
  return (
    <div className="min-h-screen bg-[#f6f9fc] font-sans">
      {/* Header */}
      <header className="bg-[#061b31] sticky top-0 z-50 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between">
          <span className="text-white font-semibold tracking-tight text-lg">Packlinx</span>
          <Link href="/" className="text-[#b9b9f9] text-sm hover:text-white transition-colors">← 실제 사이트</Link>
        </div>
      </header>

      {/* Index hero */}
      <section className="bg-[#061b31] border-b border-white/10 px-5 py-16 text-center">
        <p className="text-xs font-semibold tracking-widest uppercase text-[#b9b9f9] mb-4">INTERNAL PREVIEW ONLY · noindex</p>
        <h1 className="text-[32px] sm:text-[40px] font-light text-white leading-[1.1] tracking-[-0.04em] mb-4">
          r3 메인페이지 10 variant 비교
        </h1>
        <p className="text-[15px] text-slate-400 max-w-xl mx-auto">
          각 카드 클릭하여 라이브 보기 → 1개 선택<br />
          CMO 권장 Top-3: V01 (1위) · V06 (2위) · V09 (3위)
        </p>
      </section>

      {/* Variant grid — 3×4 */}
      <main className="max-w-6xl mx-auto px-5 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {VARIANTS.map((v) => (
            <Link
              key={v.id}
              href={v.href}
              className="group relative bg-white border border-[#e5edf5] rounded-xl overflow-hidden hover:border-[#533afd]/40 hover:shadow-[rgba(83,58,253,0.10)_0px_12px_32px] transition-all"
            >
              {/* iframe thumbnail */}
              <div className="relative w-full h-40 bg-[#f6f9fc] border-b border-[#e5edf5] overflow-hidden">
                <iframe
                  src={v.href}
                  className="absolute top-0 left-0 w-[1280px] h-[800px] pointer-events-none"
                  style={{ transform: 'scale(0.234375)', transformOrigin: 'top left' }}
                  loading="lazy"
                  tabIndex={-1}
                  aria-hidden="true"
                  title={`${v.label} 미리보기`}
                />
                {/* CMO pick badge */}
                {v.cmoPick && (
                  <div className="absolute top-2 right-2 bg-[#533afd] text-white text-[10px] font-semibold px-2 py-0.5 rounded-full z-10">
                    CMO {v.cmoPick}위 픽
                  </div>
                )}
              </div>

              {/* Card info */}
              <div className="p-5">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h2 className="text-[15px] font-semibold text-[#061b31] group-hover:text-[#533afd] transition-colors leading-snug">
                    {v.label}
                  </h2>
                  <span className={`flex-shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded uppercase tracking-wide ${DIFF_COLOR[v.difficulty]}`}>
                    {v.difficulty}
                  </span>
                </div>
                <p className="text-[11px] font-medium text-[#533afd] bg-[rgba(83,58,253,0.06)] px-2 py-0.5 rounded inline-block mb-3">
                  {v.axis}
                </p>
                <p className="text-[12px] text-[#64748d] leading-relaxed">{v.diff}</p>
              </div>

              {/* Hover CTA */}
              <div className="absolute inset-0 bg-[rgba(83,58,253,0.02)] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </Link>
          ))}
        </div>
      </main>

      {/* Footer note */}
      <footer className="border-t border-[#e5edf5] bg-white px-5 py-8 text-center">
        <p className="text-xs text-[#64748d]">
          이 페이지는 보드 픽을 위한 내부 비교용입니다. noindex 적용 · 외부 미공개
        </p>
      </footer>
    </div>
  )
}
