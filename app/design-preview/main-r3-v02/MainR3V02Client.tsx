'use client'

import Link from 'next/link'
import { CATEGORIES, SAMPLE_VENDORS, SAMPLE_GUIDES, VENDOR_COUNT } from '../main-r3/_shared'

export function MainR3V02Client() {
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

      {/* Hero — dual split */}
      <section className="bg-[#f6f9fc] border-b border-[#e5edf5]">
        <div className="max-w-6xl mx-auto px-5 py-16 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Left: search */}
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase text-[#533afd] mb-4">포장재 업체 검색 플랫폼</p>
            <h1 className="text-[36px] sm:text-[44px] font-light text-[#061b31] leading-[1.1] tracking-[-0.04em] mb-4">
              포장재 파트너,<br />지금 바로 찾으세요
            </h1>
            <p className="text-[15px] text-[#64748d] mb-8 leading-relaxed">
              전국 {VENDOR_COUNT} 패키징 업체를 한눈에.<br />카테고리·소재·지역별 무료 검색.
            </p>
            <form className="flex rounded-lg overflow-hidden border border-[#e5edf5] shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.1)_0px_3px_7px_-3px] bg-white focus-within:border-[#533afd] transition-shadow">
              <input
                type="search"
                placeholder="업체명, 제품, 소재로 검색..."
                className="flex-1 px-4 py-3.5 text-[14px] text-[#061b31] placeholder:text-[#64748d]/60 focus:outline-none bg-white"
              />
              <button
                type="submit"
                className="bg-[#533afd] hover:bg-[#4434d4] text-white font-medium px-5 py-3 transition-colors flex-shrink-0 text-sm"
              >
                검색
              </button>
            </form>
            <p className="mt-4 text-xs text-[#64748d]">
              {VENDOR_COUNT}개 업체 등록 · 무료 이용
            </p>
          </div>

          {/* Right: 2×4 category grid */}
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase text-[#64748d] mb-4">카테고리 둘러보기</p>
            <div className="grid grid-cols-2 gap-2.5">
              {CATEGORIES.map((cat) => (
                <Link
                  key={cat.label}
                  href={cat.href}
                  className="group border border-[#e5edf5] rounded-lg p-3.5 bg-white hover:border-[#533afd]/40 hover:shadow-[rgba(83,58,253,0.08)_0px_4px_12px] transition-all"
                >
                  <div className="w-7 h-7 rounded bg-[rgba(83,58,253,0.08)] mb-2 flex items-center justify-center">
                    <div className="w-3 h-3 rounded-sm bg-[#533afd]/40" />
                  </div>
                  <p className="text-[13px] font-semibold text-[#061b31] group-hover:text-[#533afd] transition-colors">{cat.label}</p>
                  <p className="text-[11px] text-[#64748d] mt-0.5">{cat.sub}</p>
                </Link>
              ))}
            </div>
          </div>
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
