'use client'

import Link from 'next/link'
import { CATEGORIES, SAMPLE_VENDORS, SAMPLE_GUIDES, VENDOR_COUNT } from '../main-r3/_shared'

export function MainR3V02Client() {
  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Header */}
      <header className="bg-white sticky top-0 z-50 border-b border-neutral-200">
        <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between">
          <Link href="/design-preview/main-r3" className="text-neutral-900 font-semibold tracking-tight text-lg">Packlinx</Link>
          <nav className="flex items-center gap-4 text-sm text-neutral-600">
            <Link href="#" className="hover:text-neutral-900 transition-colors">카테고리</Link>
            <Link href="#" className="hover:text-neutral-900 transition-colors">가이드</Link>
            <Link href="#" className="text-brand-500 border border-brand-200 px-3 py-1.5 rounded hover:bg-brand-500/[0.05] transition-colors">업체 등록</Link>
          </nav>
        </div>
      </header>

      {/* Hero — dual split */}
      <section className="bg-neutral-50 border-b border-neutral-200">
        <div className="max-w-6xl mx-auto px-5 py-16 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Left: search */}
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase text-brand-500 mb-4">포장재 업체 검색 플랫폼</p>
            <h1 className="text-[36px] sm:text-[44px] font-light text-neutral-900 leading-[1.1] tracking-[-0.04em] mb-4">
              포장재 파트너,<br />지금 바로 찾으세요
            </h1>
            <p className="text-[15px] text-neutral-500 mb-8 leading-relaxed">
              전국 {VENDOR_COUNT} 패키징 업체를 한눈에.<br />카테고리·소재·지역별 무료 검색.
            </p>
            <form className="flex rounded-lg overflow-hidden border border-neutral-200 shadow-md bg-white focus-within:border-brand-500 transition-shadow">
              <input
                type="search"
                placeholder="업체명, 제품, 소재로 검색..."
                className="flex-1 px-4 py-3.5 text-[14px] text-neutral-900 placeholder:text-neutral-500/60 focus:outline-none bg-white"
              />
              <button
                type="submit"
                className="bg-brand-500 hover:bg-brand-600 text-white font-medium px-5 py-3 transition-colors flex-shrink-0 text-sm"
              >
                검색
              </button>
            </form>
            <p className="mt-4 text-xs text-neutral-500">
              {VENDOR_COUNT}개 업체 등록 · 무료 이용
            </p>
          </div>

          {/* Right: 2×4 category grid */}
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase text-neutral-500 mb-4">카테고리 둘러보기</p>
            <div className="grid grid-cols-2 gap-2.5">
              {CATEGORIES.map((cat) => (
                <Link
                  key={cat.label}
                  href={cat.href}
                  className="group border border-neutral-200 rounded-lg p-3.5 bg-white hover:border-brand-500/40 hover:shadow-sm transition-all"
                >
                  <div className="w-7 h-7 rounded bg-brand-500/[0.08] mb-2 flex items-center justify-center">
                    <div className="w-3 h-3 rounded-sm bg-brand-500/40" />
                  </div>
                  <p className="text-[13px] font-semibold text-neutral-900 group-hover:text-brand-500 transition-colors">{cat.label}</p>
                  <p className="text-[11px] text-neutral-500 mt-0.5">{cat.sub}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Vendor cards */}
      <section className="max-w-6xl mx-auto px-5 py-16">
        <h2 className="text-xl font-light text-neutral-900 tracking-[-0.02em] mb-8">
          최근 등록 업체
          <Link href="/" className="ml-4 text-[13px] text-brand-500 font-normal">전체 보기 →</Link>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SAMPLE_VENDORS.slice(0, 3).map((v) => (
            <Link
              key={v.name}
              href={v.href}
              className="group border border-neutral-200 rounded-lg p-5 bg-white hover:border-brand-500/30 hover:shadow-md transition-all"
            >
              <div className="w-9 h-9 rounded bg-brand-500/[0.08] flex items-center justify-center mb-3">
                <span className="text-brand-500 font-semibold text-sm">{v.name[0]}</span>
              </div>
              <h3 className="font-semibold text-neutral-900 text-[15px] mb-1">{v.name}</h3>
              <p className="text-[13px] text-neutral-500">{v.category}</p>
              <p className="text-[12px] text-neutral-500/70 mt-1">{v.region}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Guides */}
      <section className="border-t border-neutral-200 bg-neutral-50">
        <div className="max-w-6xl mx-auto px-5 py-16">
          <h2 className="text-xl font-light text-neutral-900 tracking-[-0.02em] mb-8">
            포장재 가이드
            <Link href="/guides" className="ml-4 text-[13px] text-brand-500 font-normal">전체 보기 →</Link>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {SAMPLE_GUIDES.slice(0, 2).map((g) => (
              <Link
                key={g.title}
                href={g.href}
                className="group border border-neutral-200 rounded-lg p-5 bg-white hover:border-brand-500/20 transition-colors"
              >
                <span className="text-[11px] font-medium text-brand-500 bg-brand-500/[0.06] px-2.5 py-1 rounded mb-3 inline-block">{g.category}</span>
                <h3 className="text-[14px] font-medium text-neutral-900 leading-snug group-hover:text-brand-500 transition-colors">{g.title}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-neutral-50 border-t border-neutral-200 text-neutral-500 text-xs py-8 px-5">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <span className="text-neutral-900 font-semibold">Packlinx</span>
          <span>© 2026 PACKLINX. 업체 정보는 공개된 출처에서 수집되었습니다.</span>
          <Link href="/design-preview/main-r3" className="text-brand-500 hover:text-neutral-900 transition-colors">← r3 비교 목록</Link>
        </div>
      </footer>
    </div>
  )
}
