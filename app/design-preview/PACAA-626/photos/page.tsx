import Image from 'next/image'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'PACAA-626 홈 Hero 실사 사진 후보 3종',
  robots: { index: false, follow: false },
}

const VARIANTS = [
  {
    id: 'A',
    label: 'A: Industrial Trust',
    labelKo: '전문성·신뢰감',
    subtitle: '한국 패키징 공장 작업장',
    src: '/images/ai/phase2/hero-photo-A.webp',
  },
  {
    id: 'B',
    label: 'B: Design Gallery',
    labelKo: '디자인 갤러리',
    subtitle: '포장 제품 스튜디오 진열',
    src: '/images/ai/phase2/hero-photo-B.webp',
  },
  {
    id: 'C',
    label: 'C: Craft Lifestyle',
    labelKo: '크래프트 감성',
    subtitle: '디자이너 책상 close-up',
    src: '/images/ai/phase2/hero-photo-C.webp',
  },
]

const TOTAL_COUNT = 1380

function HeroMockup({
  variant,
}: {
  variant: (typeof VARIANTS)[number]
}) {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm">
      {/* Variant label bar */}
      <div className="bg-neutral-900 px-5 py-3 flex items-center gap-3">
        <span className="font-mono text-sm text-brand-300 font-bold">{variant.id}</span>
        <span className="text-white font-semibold text-sm">{variant.label}</span>
        <span className="text-neutral-400 text-xs">({variant.labelKo})</span>
        <span className="text-neutral-500 text-xs ml-auto">{variant.subtitle}</span>
      </div>

      {/* Hero mockup — same layout as live HomeHero */}
      <div className="relative w-full overflow-hidden" style={{ height: '480px' }}>
        <Image
          src={variant.src}
          alt={variant.label}
          fill
          className="object-cover object-center"
          sizes="100vw"
        />
        {/* Gradient overlay identical to live HomeHero */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/70 to-transparent" />
        <div className="relative z-10 max-w-6xl mx-auto h-full flex items-center px-8">
          <div className="max-w-xl">
            <h1 className="text-[28px] sm:text-5xl font-light text-heading-deep-navy leading-tight tracking-tight mb-4">
              포장재 파트너를<br />찾고 계신가요?
            </h1>
            <p className="text-neutral-600 mb-2 text-sm sm:text-base">
              상황을 선택하면 맞춤 결과를 안내해 드립니다.
            </p>
            <p className="text-xs sm:text-sm text-neutral-400">
              {TOTAL_COUNT.toLocaleString()}개 업체 등록됨 · 무료 이용
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PhotoCandidatesPreview() {
  return (
    <div className="bg-neutral-100 min-h-screen pb-20">
      {/* Header */}
      <header className="bg-neutral-900 text-white px-6 py-8 mb-10">
        <div className="max-w-6xl mx-auto">
          <p className="text-xs font-mono text-brand-300 mb-2">
            PACAA-640 / design-preview / photos
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold">
            홈 Hero 실사 사진 후보 3종
          </h1>
          <p className="mt-3 text-neutral-300 text-sm max-w-3xl">
            현재 AI 일러스트(phase1)를 실사 사진으로 교체하기 위한 후보 3종입니다.
            각 후보는 실제 홈 페이지 hero 레이아웃(480px, 좌측 gradient overlay, 동일 카피)으로 표시됩니다.
            아래에서 원하는 후보를 선택해 주세요.
          </p>
        </div>
      </header>

      {/* Variant list */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col gap-10">
        {VARIANTS.map((v) => (
          <HeroMockup key={v.id} variant={v} />
        ))}
      </div>

      {/* Selection prompt */}
      <footer className="mt-16 px-6 py-8 bg-neutral-900 text-neutral-300 text-sm">
        <div className="max-w-6xl mx-auto">
          <p className="font-semibold text-white mb-2">
            마음에 드는 후보를 코멘트로 알려주세요
          </p>
          <p>
            예: &ldquo;A 선택&rdquo; / &ldquo;B가 좋은데 색조를 더 차갑게&rdquo; / &ldquo;전부 마음에 안 듦 — 방향 재논의&rdquo;
          </p>
        </div>
      </footer>
    </div>
  )
}
