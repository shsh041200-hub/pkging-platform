'use client'

import Link from 'next/link'
import { CATEGORIES, SAMPLE_VENDORS, SAMPLE_GUIDES, VENDOR_COUNT } from '../main-r3/_shared'

export function MainR3V08Client() {
  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Header — minimal, white */}
      <header className="bg-white sticky top-0 z-50 border-b border-[#e5edf5]">
        <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between">
          <Link href="/design-preview/main-r3" className="text-[#061b31] font-semibold tracking-tight text-lg">Packlinx</Link>
          <nav className="flex items-center gap-5 text-sm text-[#64748d]">
            <Link href="#" className="hover:text-[#061b31] transition-colors">카테고리</Link>
            <Link href="#" className="hover:text-[#061b31] transition-colors">가이드</Link>
          </nav>
        </div>
      </header>

      {/* Hero — full-screen white, massive centered type */}
      <section className="bg-white min-h-[70vh] flex items-center justify-center px-5 py-24 border-b border-[#e5edf5]">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-[48px] sm:text-[64px] lg:text-[72px] font-light text-[#061b31] leading-[1.05] tracking-[-0.05em] mb-8">
            포장재 파트너를<br />찾는 가장 빠른 방법
          </h1>
          <p className="text-lg text-[#64748d] leading-relaxed mb-12 max-w-lg mx-auto">
            전국 {VENDOR_COUNT} 패키징 업체를 무료로 검색하고<br />내 제품에 맞는 파트너를 찾으세요.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/"
              className="bg-[#533afd] hover:bg-[#4434d4] text-white px-8 py-3.5 rounded font-medium text-base transition-colors shadow-[rgba(83,58,253,0.25)_0px_8px_24px_-8px]"
            >
              포장재 업체 찾기
            </Link>
            <Link
              href="#"
              className="border border-[#b9b9f9] text-[#533afd] px-8 py-3.5 rounded font-medium text-base hover:bg-[rgba(83,58,253,0.03)] transition-colors"
            >
              업체로 등록하기 →
            </Link>
          </div>
          <div className="mt-16 flex items-center justify-center gap-8 text-sm text-[#64748d]">
            <div className="text-center">
              <p className="text-2xl font-light text-[#061b31] tracking-[-0.03em]">{VENDOR_COUNT}</p>
              <p className="text-xs mt-1">등록 업체</p>
            </div>
            <div className="w-px h-8 bg-[#e5edf5]" />
            <div className="text-center">
              <p className="text-2xl font-light text-[#061b31] tracking-[-0.03em]">12</p>
              <p className="text-xs mt-1">포장 카테고리</p>
            </div>
            <div className="w-px h-8 bg-[#e5edf5]" />
            <div className="text-center">
              <p className="text-2xl font-light text-[#061b31] tracking-[-0.03em]">무료</p>
              <p className="text-xs mt-1">검색·비교</p>
            </div>
          </div>
        </div>
      </section>

      {/* Category card section */}
      <section className="bg-[#f6f9fc] border-b border-[#e5edf5]">
        <div className="max-w-6xl mx-auto px-5 py-20">
          <h2 className="text-[32px] font-light text-[#061b31] tracking-[-0.03em] mb-12 text-center">
            어떤 포장재를 찾으세요?
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.label}
                href={cat.href}
                className="group border border-[#e5edf5] rounded-lg p-5 bg-white text-center hover:border-[#533afd]/30 hover:shadow-[rgba(50,50,93,0.25)_0px_15px_35px_-15px,rgba(0,0,0,0.1)_0px_5px_10px_-5px] transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-[rgba(83,58,253,0.06)] mx-auto mb-3 flex items-center justify-center group-hover:bg-[rgba(83,58,253,0.10)] transition-colors">
                  <div className="w-5 h-5 rounded bg-[#533afd]/30 group-hover:bg-[#533afd]/50 transition-colors" />
                </div>
                <p className="text-[13px] font-semibold text-[#061b31] group-hover:text-[#533afd] transition-colors">{cat.label}</p>
                <p className="text-[11px] text-[#64748d] mt-1">{cat.sub}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Vendor cards */}
      <section className="max-w-6xl mx-auto px-5 py-20">
        <h2 className="text-[32px] font-light text-[#061b31] tracking-[-0.03em] mb-12">
          등록 업체 예시
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {SAMPLE_VENDORS.slice(0, 3).map((v) => (
            <Link
              key={v.name}
              href={v.href}
              className="group border border-[#e5edf5] rounded-lg p-6 bg-white hover:border-[#533afd]/30 hover:shadow-[rgba(50,50,93,0.25)_0px_15px_35px_-15px] transition-all"
            >
              <div className="w-10 h-10 rounded-lg bg-[rgba(83,58,253,0.08)] flex items-center justify-center mb-4">
                <span className="text-[#533afd] font-bold text-base">{v.name[0]}</span>
              </div>
              <h3 className="font-semibold text-[#061b31] text-[16px] mb-2">{v.name}</h3>
              <p className="text-[13px] text-[#64748d] mb-1">{v.category}</p>
              <p className="text-[12px] text-[#64748d]/60">{v.region}</p>
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
