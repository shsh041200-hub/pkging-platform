'use client'

import Link from 'next/link'
import { CATEGORIES, SAMPLE_VENDORS, SAMPLE_GUIDES, VENDOR_COUNT } from '../main-r3/_shared'

export function MainR3V01Client() {
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

      {/* Hero — search prominent */}
      <section className="bg-[#f6f9fc] border-b border-[#e5edf5] py-20 px-5">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-xs font-semibold tracking-widest uppercase text-[#533afd] mb-4">포장재 업체 검색 플랫폼</p>
          <h1 className="text-[42px] sm:text-[52px] font-light text-[#061b31] leading-[1.1] tracking-[-0.04em] mb-4">
            포장재 업체,<br />바로 여기서 찾으세요
          </h1>
          <p className="text-base text-[#64748d] mb-10 leading-relaxed">
            전국 {VENDOR_COUNT} 패키징 업체를 카테고리별로 비교하고<br />내 제품에 맞는 파트너를 찾으세요.
          </p>

          {/* Search bar */}
          <form className="flex rounded-lg overflow-hidden border border-[#e5edf5] shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.1)_0px_3px_7px_-3px] bg-white focus-within:border-[#533afd] focus-within:shadow-[rgba(83,58,253,0.15)_0px_6px_12px_-2px,rgba(0,0,0,0.1)_0px_3px_7px_-3px] transition-shadow">
            <input
              type="search"
              placeholder="업체명, 제품, 소재로 검색..."
              className="flex-1 px-5 py-4 text-[15px] text-[#061b31] placeholder:text-[#64748d]/60 focus:outline-none bg-white"
            />
            <button
              type="submit"
              className="bg-[#533afd] hover:bg-[#4434d4] text-white font-medium px-6 py-4 transition-colors flex-shrink-0 text-sm"
            >
              검색하기
            </button>
          </form>

          {/* Category chips */}
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {CATEGORIES.slice(0, 6).map((cat) => (
              <Link
                key={cat.label}
                href={cat.href}
                className="text-[13px] text-[#533afd] border border-[#b9b9f9] bg-white px-3.5 py-1.5 rounded-full hover:bg-[rgba(83,58,253,0.05)] transition-colors"
              >
                {cat.label}
              </Link>
            ))}
          </div>

          {/* Count banner */}
          <p className="mt-6 text-xs text-[#64748d]">
            현재 <span className="font-semibold text-[#061b31]">{VENDOR_COUNT}</span>개 업체 등록 · 무료 이용
          </p>
        </div>
      </section>

      {/* Vendor cards */}
      <section className="max-w-6xl mx-auto px-5 py-16">
        <h2 className="text-xl font-light text-[#061b31] tracking-[-0.02em] mb-8">
          최근 등록 업체
          <Link href="/" className="ml-4 text-[13px] text-[#533afd] font-normal">전체 보기 →</Link>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SAMPLE_VENDORS.slice(0, 3).map((v) => (
            <Link
              key={v.name}
              href={v.href}
              className="group border border-[#e5edf5] rounded-lg p-5 bg-white hover:border-[#533afd]/30 hover:shadow-[rgba(83,58,253,0.08)_0px_8px_20px] transition-all"
            >
              <div className="w-9 h-9 rounded bg-[rgba(83,58,253,0.08)] flex items-center justify-center mb-3">
                <span className="text-[#533afd] font-semibold text-sm">{v.name[0]}</span>
              </div>
              <h3 className="font-semibold text-[#061b31] text-[15px] mb-1">{v.name}</h3>
              <p className="text-[13px] text-[#64748d]">{v.category}</p>
              <p className="text-[12px] text-[#64748d]/70 mt-1">{v.region}</p>
            </Link>
          ))}
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

      {/* Footer */}
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
