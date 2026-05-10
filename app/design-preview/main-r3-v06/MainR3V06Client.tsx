'use client'

import Link from 'next/link'
import { useState } from 'react'
import { CATEGORIES, SAMPLE_VENDORS, SAMPLE_GUIDES, VENDOR_COUNT } from '../main-r3/_shared'

export function MainR3V06Client() {
  const [activeFilter, setActiveFilter] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Header */}
      <header className="bg-[#061b31] sticky top-0 z-50 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between">
          <Link href="/design-preview/main-r3" className="text-white font-semibold tracking-tight text-lg">Packlinx</Link>
          <nav className="flex items-center gap-4 text-sm text-slate-300">
            <Link href="#" className="hover:text-white transition-colors">카테고리</Link>
            <Link href="#" className="hover:text-white transition-colors">가이드</Link>
            <Link href="#" className="text-white border border-white/20 px-3 py-1.5 rounded hover:bg-white/10 transition-colors">업체 등록</Link>
          </nav>
        </div>
      </header>

      {/* Hero — vendor grid in fold */}
      <section className="bg-white border-b border-[#e5edf5]">
        <div className="max-w-6xl mx-auto px-5 pt-16 pb-0">
          {/* Headline */}
          <div className="max-w-xl mb-10">
            <h1 className="text-[42px] sm:text-[52px] font-light text-[#061b31] leading-[1.1] tracking-[-0.04em] mb-4">
              전국 패키징 업체,<br />한눈에 비교하세요
            </h1>
            <p className="text-base text-[#64748d] mb-6">
              {VENDOR_COUNT}개 등록 업체 · 카테고리·소재별 검색 · 무료
            </p>
            <Link
              href="/"
              className="inline-block bg-[#533afd] hover:bg-[#4434d4] text-white px-6 py-3 rounded font-medium text-sm transition-colors"
            >
              전체 업체 보기 →
            </Link>
          </div>

          {/* Filter tabs */}
          <div className="flex gap-1 overflow-x-auto scrollbar-none border-b border-[#e5edf5] -mx-5 px-5">
            <button
              type="button"
              onClick={() => setActiveFilter(null)}
              className={`flex-shrink-0 px-4 py-2.5 text-[13px] font-medium transition-all border-b-2 ${
                !activeFilter ? 'border-[#533afd] text-[#533afd]' : 'border-transparent text-[#64748d] hover:text-[#061b31]'
              }`}
            >
              전체
            </button>
            {CATEGORIES.slice(0, 6).map((cat) => (
              <button
                key={cat.label}
                type="button"
                onClick={() => setActiveFilter(cat.label === activeFilter ? null : cat.label)}
                className={`flex-shrink-0 px-4 py-2.5 text-[13px] font-medium transition-all border-b-2 whitespace-nowrap ${
                  activeFilter === cat.label ? 'border-[#533afd] text-[#533afd]' : 'border-transparent text-[#64748d] hover:text-[#061b31]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Vendor card grid — enters fold immediately */}
        <div className="max-w-6xl mx-auto px-5 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SAMPLE_VENDORS.map((v) => (
              <Link
                key={v.name}
                href={v.href}
                className="group border border-[#e5edf5] rounded-xl p-6 bg-white hover:border-[#533afd]/30 hover:shadow-[rgba(50,50,93,0.25)_0px_30px_45px_-30px,rgba(0,0,0,0.1)_0px_18px_36px_-18px] hover:-translate-y-px transition-all"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-[rgba(83,58,253,0.08)] flex items-center justify-center flex-shrink-0">
                    <span className="text-[#533afd] font-bold text-base">{v.name[0]}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#061b31] text-[15px] leading-snug">{v.name}</h3>
                    <p className="text-[12px] text-[#64748d]">{v.region}</p>
                  </div>
                </div>
                <div className="border-t border-[#e5edf5] pt-3">
                  <span className="text-[12px] font-medium text-[#533afd] bg-[rgba(83,58,253,0.06)] px-2.5 py-1 rounded">
                    {v.category}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Guide content */}
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
