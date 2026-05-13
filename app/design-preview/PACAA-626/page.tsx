import Image from 'next/image'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'PACAA-626 Hero Layout Variants',
  robots: { index: false, follow: false },
}

const SITUATIONS = [
  { title: '처음 구매', desc: '포장재를 처음 알아보고 있어요', link: '/guides', cta: '입문 가이드 →' },
  { title: '공급사 변경', desc: '기존 업체를 바꾸고 싶어요', link: '/match', cta: '업체 비교 →' },
  { title: '대량 견적', desc: '대량 주문 업체가 필요해요', link: '/?moq=moq_5000', cta: '대량 검색 →' },
]

function VariantLabel({ id, title, summary }: { id: string; title: string; summary: string }) {
  return (
    <div className="border-b-2 border-brand-500 bg-white px-6 py-4">
      <div className="max-w-6xl mx-auto flex items-baseline gap-4">
        <span className="text-sm font-mono text-brand-500">{id}</span>
        <h2 className="text-xl font-semibold text-neutral-900">{title}</h2>
        <p className="text-sm text-neutral-500 ml-auto">{summary}</p>
      </div>
    </div>
  )
}

export default function HeroVariantsPreview() {
  return (
    <div className="bg-neutral-100 min-h-screen pb-20">
      <header className="bg-neutral-900 text-white px-6 py-8 mb-12">
        <div className="max-w-6xl mx-auto">
          <p className="text-xs font-mono text-brand-300 mb-2">PACAA-626 / design-preview</p>
          <h1 className="text-3xl font-bold">홈 + 매칭 Hero — 레이아웃 시안 3종</h1>
          <p className="mt-3 text-neutral-300 text-sm max-w-3xl">
            현재 라이브 = 작은 16:7 카드에 일러스트가 박혀있음 (좁은 max-w-xl). 보드 피드백: &ldquo;광범위 + 레이아웃 형식&rdquo;.
            아래 3가지 variant 비교 후 선호 안 알려주세요. 같은 일러스트 5장은 그대로 재사용.
          </p>
        </div>
      </header>

      {/* ====== HOME HERO ====== */}
      <section className="mb-16">
        <div className="max-w-6xl mx-auto px-6 mb-6">
          <h2 className="text-2xl font-bold text-neutral-900">홈 Hero (`/`)</h2>
        </div>

        {/* Variant A — Full-width edge-to-edge background */}
        <VariantLabel id="A" title="Full-width 배경" summary="일러스트가 100vw 가득, 카피는 absolute overlay" />
        <div className="bg-white border-b border-neutral-200">
          <div className="relative w-full overflow-hidden" style={{ height: '480px' }}>
            <Image
              src="/images/ai/phase1/home-hero.webp"
              alt=""
              fill
              className="object-cover object-center"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/70 to-transparent" />
            <div className="relative z-10 max-w-6xl mx-auto h-full flex items-center px-8">
              <div className="max-w-xl">
                <h1 className="text-5xl font-light text-heading-deep-navy leading-tight tracking-tight mb-4">
                  포장재 파트너를<br />찾고 계신가요?
                </h1>
                <p className="text-neutral-600 mb-6">상황을 선택하면 맞춤 결과를 안내해 드립니다.</p>
                <p className="text-sm text-neutral-400 mb-8">1,380개 업체 등록됨 · 무료 이용</p>
                <div className="flex gap-3">
                  {SITUATIONS.map((s) => (
                    <a key={s.title} href={s.link} className="px-5 py-3 bg-brand-500 text-white rounded-lg text-sm font-medium hover:bg-brand-600">
                      {s.title}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Variant B — Split 2-column (text left, illustration right) */}
        <div className="mt-12">
          <VariantLabel id="B" title="Split 2단" summary="좌 카피, 우 일러스트가 hero 영역 풀하이트" />
          <div className="bg-gradient-to-br from-brand-50 to-white">
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 px-6 py-16 items-center" style={{ minHeight: '520px' }}>
              <div>
                <h1 className="text-5xl font-light text-heading-deep-navy leading-tight tracking-tight mb-4">
                  포장재 파트너를<br />찾고 계신가요?
                </h1>
                <p className="text-neutral-600 mb-6">상황을 선택하면 맞춤 결과를 안내해 드립니다.</p>
                <p className="text-sm text-neutral-400 mb-6">1,380개 업체 등록됨 · 무료 이용</p>
                <div className="flex flex-col gap-3">
                  {SITUATIONS.map((s) => (
                    <a key={s.title} href={s.link} className="flex items-center justify-between border border-neutral-200 bg-white rounded-xl px-5 py-4 hover:border-brand-500 hover:shadow-sm transition">
                      <div>
                        <div className="font-medium text-neutral-900">{s.title}</div>
                        <div className="text-sm text-neutral-500">{s.desc}</div>
                      </div>
                      <span className="text-brand-500 text-sm">{s.cta}</span>
                    </a>
                  ))}
                </div>
              </div>
              <div className="relative w-full" style={{ aspectRatio: '4/3' }}>
                <Image src="/images/ai/phase1/home-hero.webp" alt="" fill className="object-contain" />
              </div>
            </div>
          </div>
        </div>

        {/* Variant C — Centered copy with floating decorative illustration */}
        <div className="mt-12">
          <VariantLabel id="C" title="중앙 카피 + 광역 배경 그라데이션" summary="카피 중앙, 일러스트는 hero 전체 영역의 부드러운 배경+포지셔닝, 더 광범위한 분위기" />
          <div className="relative bg-gradient-to-b from-brand-100 via-brand-50 to-white overflow-hidden">
            <div className="absolute inset-0 opacity-40">
              <div className="absolute -top-20 -right-32 w-[700px] h-[700px]">
                <Image src="/images/ai/phase1/home-hero.webp" alt="" fill className="object-contain" />
              </div>
              <div className="absolute -bottom-32 -left-20 w-[500px] h-[500px] rotate-180 opacity-60">
                <Image src="/images/ai/phase1/home-hero.webp" alt="" fill className="object-contain" />
              </div>
            </div>
            <div className="relative z-10 max-w-4xl mx-auto px-6 py-24 text-center">
              <h1 className="text-6xl font-light text-heading-deep-navy leading-tight tracking-tight mb-4">
                포장재 파트너를<br />찾고 계신가요?
              </h1>
              <p className="text-neutral-600 mb-2">상황을 선택하면 맞춤 결과를 안내해 드립니다.</p>
              <p className="text-sm text-neutral-400 mb-10">1,380개 업체 등록됨 · 무료 이용</p>
              <div className="flex flex-wrap justify-center gap-3">
                {SITUATIONS.map((s) => (
                  <a key={s.title} href={s.link} className="px-6 py-3 bg-white border border-neutral-200 rounded-full text-sm font-medium hover:border-brand-500 hover:shadow-sm transition">
                    {s.title}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====== MATCH HERO ====== */}
      <section>
        <div className="max-w-6xl mx-auto px-6 mb-6">
          <h2 className="text-2xl font-bold text-neutral-900">매칭 Hero (`/match`)</h2>
        </div>

        {/* Match Variant A — Full-width */}
        <VariantLabel id="A" title="Full-width 배경" summary="일러스트가 hero 영역 풀, 카피 overlay" />
        <div className="bg-white border-b border-neutral-200">
          <div className="relative w-full overflow-hidden" style={{ height: '420px' }}>
            <Image src="/images/ai/phase1/match-hero.webp" alt="" fill className="object-cover" priority />
            <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/60 to-transparent" />
            <div className="relative z-10 max-w-6xl mx-auto h-full flex items-center px-8">
              <div className="max-w-xl">
                <h1 className="text-4xl font-light text-heading-deep-navy leading-tight mb-3">
                  포장재 업체를<br />비교해 보세요
                </h1>
                <p className="text-neutral-600 mb-6">우리 회사와 맞는 업체를 1:1 으로 빠르게 비교합니다.</p>
                <a href="/match" className="inline-block px-6 py-3 bg-brand-500 text-white rounded-lg font-medium hover:bg-brand-600">매칭 시작</a>
              </div>
            </div>
          </div>
        </div>

        {/* Match Variant B — Split */}
        <div className="mt-12">
          <VariantLabel id="B" title="Split 2단" summary="좌 카피+CTA, 우 매칭 일러스트 풀" />
          <div className="bg-gradient-to-br from-brand-50 to-white">
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-8 px-6 py-16 items-center" style={{ minHeight: '460px' }}>
              <div className="md:col-span-2">
                <h1 className="text-4xl font-light text-heading-deep-navy leading-tight mb-3">
                  포장재 업체를<br />비교해 보세요
                </h1>
                <p className="text-neutral-600 mb-6">우리 회사와 맞는 업체를 1:1 으로 빠르게 비교합니다.</p>
                <a href="/match" className="inline-block px-6 py-3 bg-brand-500 text-white rounded-lg font-medium hover:bg-brand-600">매칭 시작</a>
              </div>
              <div className="md:col-span-3 relative w-full" style={{ aspectRatio: '16/10' }}>
                <Image src="/images/ai/phase1/match-hero.webp" alt="" fill className="object-contain" />
              </div>
            </div>
          </div>
        </div>

        {/* Match Variant C — Layered backdrop */}
        <div className="mt-12">
          <VariantLabel id="C" title="중앙 카피 + 광역 배경" summary="일러스트가 hero 영역 전체 배경으로 부드럽게 펼침" />
          <div className="relative bg-gradient-to-b from-brand-100 via-brand-50 to-white overflow-hidden">
            <div className="absolute inset-0 opacity-50">
              <div className="absolute inset-0">
                <Image src="/images/ai/phase1/match-hero.webp" alt="" fill className="object-cover object-center" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-b from-brand-50/0 via-brand-50/30 to-white" />
            </div>
            <div className="relative z-10 max-w-3xl mx-auto px-6 py-24 text-center">
              <h1 className="text-5xl font-light text-heading-deep-navy leading-tight mb-3">
                포장재 업체를<br />비교해 보세요
              </h1>
              <p className="text-neutral-600 mb-8">우리 회사와 맞는 업체를 1:1 으로 빠르게 비교합니다.</p>
              <a href="/match" className="inline-block px-6 py-3 bg-brand-500 text-white rounded-lg font-medium hover:bg-brand-600">매칭 시작</a>
            </div>
          </div>
        </div>
      </section>

      <footer className="mt-20 px-6 py-8 bg-neutral-900 text-neutral-300 text-sm">
        <div className="max-w-6xl mx-auto">
          <p className="font-medium text-white mb-2">선호하는 variant 를 코멘트로 알려주세요</p>
          <p>예: &ldquo;홈 = B, 매칭 = C&rdquo; / &ldquo;둘 다 A 인데 일러스트 위치 조정&rdquo; / &ldquo;전부 마음에 안 듦 — 다른 방향&rdquo;</p>
        </div>
      </footer>
    </div>
  )
}
