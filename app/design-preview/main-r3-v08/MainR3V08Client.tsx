'use client'

import Link from 'next/link'
import { CATEGORIES, SAMPLE_VENDORS, SAMPLE_GUIDES, VENDOR_COUNT } from '../main-r3/_shared'

export function MainR3V08Client() {
  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Header — minimal, white */}
      <header className="bg-white sticky top-0 z-50 border-b border-neutral-200">
        <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between">
          <Link href="/design-preview/main-r3" className="text-neutral-900 font-semibold tracking-tight text-lg">Packlinx</Link>
          <nav className="flex items-center gap-5 text-sm text-neutral-500">
            <Link href="#" className="hover:text-neutral-900 transition-colors">카테고리</Link>
            <Link href="#" className="hover:text-neutral-900 transition-colors">가이드</Link>
          </nav>
        </div>
      </header>

      {/* Hero — full-screen white, massive centered type */}
      <section className="bg-white min-h-[70vh] flex items-center justify-center px-5 py-24 border-b border-neutral-200">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-[48px] sm:text-[64px] lg:text-[72px] font-light text-neutral-900 leading-[1.05] tracking-[-0.05em] mb-8">
            포장재 파트너를<br />찾는 가장 빠른 방법
          </h1>
          <p className="text-lg text-neutral-500 leading-relaxed mb-12 max-w-lg mx-auto">
            전국 {VENDOR_COUNT} 패키징 업체를 무료로 검색하고<br />내 제품에 맞는 파트너를 찾으세요.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/"
              className="bg-brand-500 hover:bg-brand-600 text-white px-8 py-3.5 rounded font-medium text-base transition-colors shadow-md"
            >
              포장재 업체 찾기
            </Link>
            <Link
              href="#"
              className="border border-brand-200 text-brand-500 px-8 py-3.5 rounded font-medium text-base hover:bg-brand-500/[0.03] transition-colors"
            >
              업체로 등록하기 →
            </Link>
          </div>
          <div className="mt-16 flex items-center justify-center gap-8 text-sm text-neutral-500">
            <div className="text-center">
              <p className="text-2xl font-light text-neutral-900 tracking-[-0.03em]">{VENDOR_COUNT}</p>
              <p className="text-xs mt-1">등록 업체</p>
            </div>
            <div className="w-px h-8 bg-neutral-100" />
            <div className="text-center">
              <p className="text-2xl font-light text-neutral-900 tracking-[-0.03em]">12</p>
              <p className="text-xs mt-1">포장 카테고리</p>
            </div>
            <div className="w-px h-8 bg-neutral-100" />
            <div className="text-center">
              <p className="text-2xl font-light text-neutral-900 tracking-[-0.03em]">무료</p>
              <p className="text-xs mt-1">검색·비교</p>
            </div>
          </div>
        </div>
      </section>

      {/* Category card section */}
      <section className="bg-neutral-50 border-b border-neutral-200">
        <div className="max-w-6xl mx-auto px-5 py-20">
          <h2 className="text-[32px] font-light text-neutral-900 tracking-[-0.03em] mb-12 text-center">
            어떤 포장재를 찾으세요?
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.label}
                href={cat.href}
                className="group border border-neutral-200 rounded-lg p-5 bg-white text-center hover:border-brand-500/30 hover:shadow-lg transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-brand-500/[0.06] mx-auto mb-3 flex items-center justify-center group-hover:bg-brand-500/10 transition-colors">
                  <div className="w-5 h-5 rounded bg-brand-500/30 group-hover:bg-brand-500/50 transition-colors" />
                </div>
                <p className="text-[13px] font-semibold text-neutral-900 group-hover:text-brand-500 transition-colors">{cat.label}</p>
                <p className="text-[11px] text-neutral-500 mt-1">{cat.sub}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Vendor cards */}
      <section className="max-w-6xl mx-auto px-5 py-20">
        <h2 className="text-[32px] font-light text-neutral-900 tracking-[-0.03em] mb-12">
          등록 업체 예시
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {SAMPLE_VENDORS.slice(0, 3).map((v) => (
            <Link
              key={v.name}
              href={v.href}
              className="group border border-neutral-200 rounded-lg p-6 bg-white hover:border-brand-500/30 hover:shadow-md transition-all"
            >
              <div className="w-10 h-10 rounded-lg bg-brand-500/[0.08] flex items-center justify-center mb-4">
                <span className="text-brand-500 font-bold text-base">{v.name[0]}</span>
              </div>
              <h3 className="font-semibold text-neutral-900 text-[16px] mb-2">{v.name}</h3>
              <p className="text-[13px] text-neutral-500 mb-1">{v.category}</p>
              <p className="text-[12px] text-neutral-500/60">{v.region}</p>
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
