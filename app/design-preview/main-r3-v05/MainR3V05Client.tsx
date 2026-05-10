'use client'

import Link from 'next/link'
import { useState } from 'react'
import { CATEGORIES, SAMPLE_GUIDES } from '../main-r3/_shared'

const SITUATIONS = [
  {
    id: 'first',
    title: '처음 구매',
    desc: '포장재를 처음 알아보고 있어요',
    detail: '포장재 종류와 업체 선정 기준부터 알아보세요.',
    link: '/?industry=corrugated',
    linkLabel: '입문 가이드 보기 →',
  },
  {
    id: 'switch',
    title: '공급사 변경',
    desc: '기존 업체를 바꾸고 싶어요',
    detail: '더 나은 조건의 업체를 비교하고 검색하세요.',
    link: '/',
    linkLabel: '업체 비교하기 →',
  },
  {
    id: 'bulk',
    title: '대량 견적',
    desc: '대량 주문 업체가 필요해요',
    detail: 'MOQ·납기 조건으로 필터링된 대량 공급 업체를 찾으세요.',
    link: '/?moq=1000',
    linkLabel: '대량 업체 검색 →',
  },
]

export function MainR3V05Client() {
  const [selected, setSelected] = useState<string | null>(null)

  const selectedSit = SITUATIONS.find((s) => s.id === selected)

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Header */}
      <header className="bg-white sticky top-0 z-50 border-b border-[#e5edf5]">
        <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between">
          <Link href="/design-preview/main-r3" className="text-[#061b31] font-semibold tracking-tight text-lg">Packlinx</Link>
          <nav className="flex items-center gap-4 text-sm text-[#64748d]">
            <Link href="/" className="hover:text-[#061b31] transition-colors">전체 업체 보기</Link>
            <Link href="#" className="hover:text-[#061b31] transition-colors">가이드</Link>
            <Link href="#" className="text-white bg-[#533afd] hover:bg-[#4434d4] px-3.5 py-1.5 rounded transition-colors font-medium text-sm">업체 등록</Link>
          </nav>
        </div>
      </header>

      {/* Hero — situation selection */}
      <section className="bg-[#f6f9fc] border-b border-[#e5edf5] py-20 px-5">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-[40px] sm:text-[52px] font-light text-[#061b31] leading-[1.1] tracking-[-0.04em] mb-4">
            포장재 파트너를<br />찾고 계신가요?
          </h1>
          <p className="text-base text-[#64748d] mb-12">상황을 선택하면 맞춤 결과를 안내해 드립니다.</p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
            {SITUATIONS.map((sit) => (
              <button
                key={sit.id}
                type="button"
                onClick={() => setSelected(sit.id === selected ? null : sit.id)}
                className={`group border-2 rounded-xl p-6 text-left transition-all ${
                  selected === sit.id
                    ? 'border-[#533afd] bg-[rgba(83,58,253,0.04)] shadow-[rgba(83,58,253,0.15)_0px_8px_24px]'
                    : 'border-[#e5edf5] bg-white hover:border-[#533afd]/40 hover:shadow-[rgba(83,58,253,0.06)_0px_4px_12px]'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg mb-4 flex items-center justify-center transition-colors ${
                  selected === sit.id ? 'bg-[#533afd]' : 'bg-[rgba(83,58,253,0.08)] group-hover:bg-[rgba(83,58,253,0.12)]'
                }`}>
                  <div className={`w-4 h-4 rounded ${selected === sit.id ? 'bg-white' : 'bg-[#533afd]/40'}`} />
                </div>
                <h3 className={`text-[17px] font-semibold mb-2 transition-colors ${
                  selected === sit.id ? 'text-[#533afd]' : 'text-[#061b31]'
                }`}>
                  {sit.title}
                </h3>
                <p className="text-[13px] text-[#64748d] leading-relaxed">{sit.desc}</p>
              </button>
            ))}
          </div>

          {/* Selected situation CTA */}
          {selectedSit && (
            <div className="mt-8 border border-[#533afd]/20 rounded-xl bg-white p-6 text-left flex items-center justify-between gap-4 animate-[fadeIn_0.2s_ease]">
              <div>
                <p className="text-sm font-semibold text-[#061b31] mb-1">{selectedSit.title} — 맞춤 안내</p>
                <p className="text-[13px] text-[#64748d]">{selectedSit.detail}</p>
              </div>
              <Link
                href={selectedSit.link}
                className="flex-shrink-0 bg-[#533afd] hover:bg-[#4434d4] text-white px-5 py-2.5 rounded text-sm font-medium transition-colors"
              >
                {selectedSit.linkLabel}
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Category browse */}
      <section className="max-w-6xl mx-auto px-5 py-16">
        <h2 className="text-xl font-light text-[#061b31] tracking-[-0.02em] mb-8">
          카테고리별 업체 둘러보기
          <Link href="/" className="ml-4 text-[13px] text-[#533afd] font-normal">전체 보기 →</Link>
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.label}
              href={cat.href}
              className="group border border-[#e5edf5] rounded-lg p-4 bg-white hover:border-[#533afd]/30 hover:shadow-[rgba(83,58,253,0.06)_0px_4px_12px] transition-all text-center"
            >
              <div className="w-10 h-10 rounded-lg bg-[rgba(83,58,253,0.06)] mx-auto mb-3 flex items-center justify-center group-hover:bg-[rgba(83,58,253,0.10)] transition-colors">
                <div className="w-4 h-4 rounded bg-[#533afd]/30" />
              </div>
              <p className="text-[13px] font-semibold text-[#061b31] group-hover:text-[#533afd] transition-colors">{cat.label}</p>
              <p className="text-[11px] text-[#64748d] mt-0.5">{cat.sub}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Guides */}
      <section className="border-t border-[#e5edf5] bg-[#f6f9fc]">
        <div className="max-w-6xl mx-auto px-5 py-16">
          <h2 className="text-xl font-light text-[#061b31] tracking-[-0.02em] mb-8">
            포장재 가이드
            <Link href="/guides" className="ml-4 text-[13px] text-[#533afd] font-normal">전체 보기 →</Link>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {SAMPLE_GUIDES.slice(0, 2).map((g) => (
              <Link
                key={g.title}
                href={g.href}
                className="group border border-[#e5edf5] rounded-lg p-5 bg-white hover:border-[#533afd]/20 transition-colors"
              >
                <span className="text-[11px] font-medium text-[#533afd] bg-[rgba(83,58,253,0.06)] px-2.5 py-1 rounded mb-3 inline-block">{g.category}</span>
                <h3 className="text-[14px] font-medium text-[#061b31] leading-snug group-hover:text-[#533afd] transition-colors">{g.title}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-[#061b31] text-slate-400 text-xs py-8 px-5">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <span className="text-white font-semibold">Packlinx</span>
          <span>© 2026 PACKLINX. 업체 정보는 공개된 출처에서 수집되었습니다.</span>
          <Link href="/design-preview/main-r3" className="text-[#b9b9f9] hover:text-white transition-colors">← r3 비교 목록</Link>
        </div>
      </footer>
    </div>
  )
}
