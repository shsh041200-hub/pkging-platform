'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

const SITUATIONS = [
  {
    id: 'first',
    title: '처음 구매',
    desc: '포장재를 처음 알아보고 있어요',
    detail: '포장재 종류와 업체 선정 기준부터 알아보세요.',
    link: '/guides',
    linkLabel: '입문 가이드 보기 →',
  },
  {
    id: 'switch',
    title: '공급사 변경',
    desc: '기존 업체를 바꾸고 싶어요',
    detail: '더 나은 조건의 업체를 비교하고 검색하세요.',
    link: '/match',
    linkLabel: '업체 비교하기 →',
  },
  {
    id: 'bulk',
    title: '대량 견적',
    desc: '대량 주문 업체가 필요해요',
    detail: 'MOQ·납기 조건으로 필터링된 대량 공급 업체를 찾으세요.',
    link: '/?moq=moq_5000',
    linkLabel: '대량 업체 검색 →',
  },
]

export function HomeHero({ totalCount }: { totalCount?: number | null }) {
  const [selected, setSelected] = useState<string | null>(null)
  const selectedSit = SITUATIONS.find((s) => s.id === selected)

  return (
    <section className="bg-neutral-50 border-b border-border-v04 py-20 px-5">
      <div className="max-w-3xl mx-auto text-center">
        <div className="relative w-full max-w-xl mx-auto mb-10 rounded-2xl overflow-hidden" style={{ aspectRatio: '16/7' }}>
          <Image
            src="/images/ai/phase1/home-hero.webp"
            alt="한국 패키징 업체 매칭 일러스트"
            fill
            className="object-cover"
            priority
          />
        </div>
        <h1 className="text-[40px] sm:text-[52px] font-light text-heading-deep-navy leading-[1.1] tracking-[-0.04em] mb-4">
          포장재 파트너를<br />찾고 계신가요?
        </h1>
        <p className="text-base text-neutral-500 mb-2">
          상황을 선택하면 맞춤 결과를 안내해 드립니다.
        </p>
        {totalCount != null && (
          <p className="text-[13px] text-neutral-400 mb-12">
            {totalCount.toLocaleString()}개 업체 등록됨 · 무료 이용
          </p>
        )}
        {totalCount == null && <div className="mb-12" />}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
          {SITUATIONS.map((sit) => (
            <button
              key={sit.id}
              type="button"
              onClick={() => setSelected(sit.id === selected ? null : sit.id)}
              className={`group border-2 rounded-xl p-6 text-left transition-all ${
                selected === sit.id
                  ? 'border-stripe-purple bg-stripe-purple/4 shadow-[rgba(83,58,253,0.15)_0px_8px_24px]'
                  : 'border-border-v04 bg-white hover:border-stripe-purple/40 hover:shadow-[rgba(83,58,253,0.06)_0px_4px_12px]'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-lg mb-4 flex items-center justify-center transition-colors ${
                  selected === sit.id
                    ? 'bg-stripe-purple'
                    : 'bg-stripe-purple/8 group-hover:bg-stripe-purple/12'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded ${
                    selected === sit.id ? 'bg-white' : 'bg-stripe-purple/40'
                  }`}
                />
              </div>
              <h3
                className={`text-[17px] font-semibold mb-2 transition-colors ${
                  selected === sit.id ? 'text-stripe-purple' : 'text-heading-deep-navy'
                }`}
              >
                {sit.title}
              </h3>
              <p className="text-[13px] text-neutral-500 leading-relaxed">{sit.desc}</p>
            </button>
          ))}
        </div>

        {selectedSit && (
          <div className="mt-8 border border-stripe-purple/20 rounded-xl bg-white p-6 text-left flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-heading-deep-navy mb-1">
                {selectedSit.title} — 맞춤 안내
              </p>
              <p className="text-[13px] text-neutral-500">{selectedSit.detail}</p>
            </div>
            <Link
              href={selectedSit.link}
              className="flex-shrink-0 bg-stripe-purple hover:bg-stripe-purple-hover text-white px-5 py-2.5 rounded text-sm font-medium transition-colors"
            >
              {selectedSit.linkLabel}
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
