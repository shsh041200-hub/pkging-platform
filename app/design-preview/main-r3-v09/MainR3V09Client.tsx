'use client'

import Link from 'next/link'
import { CATEGORIES, SAMPLE_VENDORS, SAMPLE_GUIDES, VENDOR_COUNT } from '../main-r3/_shared'

export function MainR3V09Client() {
  return (
    <div className="min-h-screen font-sans">
      {/* Header — dark */}
      <header className="sticky top-0 z-50 border-b border-white/[0.08]" style={{ background: '#0f0f10' }}>
        <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between">
          <Link href="/design-preview/main-r3" className="text-white font-semibold tracking-tight text-lg">Packlinx</Link>
          <nav className="flex items-center gap-4 text-sm text-slate-400">
            <Link href="#" className="hover:text-white transition-colors">카테고리</Link>
            <Link href="#" className="hover:text-white transition-colors">가이드</Link>
            <Link href="#" className="text-white border border-white/20 px-3 py-1.5 rounded hover:bg-white/10 transition-colors">업체 등록</Link>
          </nav>
        </div>
      </header>

      {/* Dark hero — full-screen */}
      <section
        className="relative min-h-[80vh] flex items-center justify-center px-5 py-24 border-b border-white/[0.08]"
        style={{ background: '#0f0f10' }}
      >
        {/* Subtle grain texture overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.025]"
          style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")',
          }}
          aria-hidden="true"
        />
        {/* Subtle purple glow */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at center, rgba(83,58,253,0.12) 0%, transparent 70%)' }}
          aria-hidden="true"
        />

        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <p className="text-xs font-semibold tracking-widest uppercase text-[#b9b9f9] mb-6">포장재 업체 검색 플랫폼</p>
          <h1 className="text-[44px] sm:text-[60px] font-light text-white leading-[1.05] tracking-[-0.05em] mb-8">
            포장재 파트너를<br />지금 찾으세요
          </h1>

          {/* Embedded search */}
          <form className="flex rounded-xl overflow-hidden border border-white/20 bg-white/[0.06] backdrop-blur-sm focus-within:border-[#533afd]/60 focus-within:bg-white/[0.08] transition-all mb-8">
            <input
              type="search"
              placeholder="업체명, 제품, 소재로 검색..."
              className="flex-1 px-5 py-4 text-[15px] text-white placeholder:text-slate-500 focus:outline-none bg-transparent"
            />
            <button
              type="submit"
              className="bg-white text-[#061b31] hover:bg-white/90 font-medium px-6 py-4 transition-colors flex-shrink-0 text-sm m-1 rounded-lg"
            >
              검색
            </button>
          </form>

          {/* Category chips — light outline on dark */}
          <div className="flex flex-wrap justify-center gap-2">
            {CATEGORIES.slice(0, 6).map((cat) => (
              <Link
                key={cat.label}
                href={cat.href}
                className="text-[13px] text-slate-300 border border-white/20 px-3.5 py-1.5 rounded-full hover:border-[#b9b9f9] hover:text-white hover:bg-white/[0.05] transition-all"
              >
                {cat.label}
              </Link>
            ))}
            <Link
              href="/"
              className="text-[13px] text-[#b9b9f9] border border-[#533afd]/40 bg-[rgba(83,58,253,0.08)] px-3.5 py-1.5 rounded-full hover:bg-[rgba(83,58,253,0.15)] transition-all"
            >
              카테고리 둘러보기
            </Link>
          </div>

          <p className="mt-8 text-xs text-slate-500">{VENDOR_COUNT}개 업체 등록 · 무료</p>
        </div>
      </section>

      {/* Light section — vendor cards */}
      <section className="bg-white border-b border-[#e5edf5]">
        <div className="max-w-6xl mx-auto px-5 py-20">
          <h2 className="text-xl font-light text-[#061b31] tracking-[-0.02em] mb-8">
            등록 업체 둘러보기
            <Link href="/" className="ml-4 text-[13px] text-[#533afd] font-normal">전체 보기 →</Link>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SAMPLE_VENDORS.slice(0, 6).map((v) => (
              <Link
                key={v.name}
                href={v.href}
                className="group border border-[#e5edf5] rounded-xl p-5 bg-white hover:border-[#533afd]/30 hover:shadow-[rgba(83,58,253,0.08)_0px_12px_32px] transition-all"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-lg bg-[rgba(83,58,253,0.08)] flex items-center justify-center flex-shrink-0">
                    <span className="text-[#533afd] font-bold text-sm">{v.name[0]}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#061b31] text-[14px] leading-snug">{v.name}</h3>
                    <p className="text-[11px] text-[#64748d]">{v.region}</p>
                  </div>
                </div>
                <span className="text-[12px] font-medium text-[#533afd] bg-[rgba(83,58,253,0.06)] px-2.5 py-1 rounded">
                  {v.category}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Guide content */}
      <section className="bg-[#f6f9fc]">
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

      <footer className="text-slate-400 text-xs py-8 px-5 border-t border-white/[0.08]" style={{ background: '#0f0f10' }}>
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <span className="text-white font-semibold">Packlinx</span>
          <span>© 2026 PACKLINX. 업체 정보는 공개된 출처에서 수집되었습니다.</span>
          <Link href="/design-preview/main-r3" className="text-[#b9b9f9] hover:text-white transition-colors">← r3 비교 목록</Link>
        </div>
      </footer>
    </div>
  )
}
