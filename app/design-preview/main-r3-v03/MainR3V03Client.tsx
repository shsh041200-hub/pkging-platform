'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { CATEGORIES, SAMPLE_VENDORS, SAMPLE_GUIDES, VENDOR_COUNT } from '../main-r3/_shared'

const PLACEHOLDERS = [
  '골판지 상자 업체를 찾고 있나요?',
  '완충재 공급사가 필요하신가요?',
  '식품 포장재 업체를 검색해보세요',
  '친환경 포장재 파트너를 찾으세요',
  '라벨·스티커 인쇄 업체 검색',
]

const POPULAR_TAGS = ['골판지 상자', '비닐 봉투', '완충재', '식품 포장', '친환경 포장', '라벨 스티커', '보냉 포장', '소량 제작']

export function MainR3V03Client() {
  const [placeholderIdx, setPlaceholderIdx] = useState(0)
  const [fade, setFade] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false)
      setTimeout(() => {
        setPlaceholderIdx((i) => (i + 1) % PLACEHOLDERS.length)
        setFade(true)
      }, 300)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

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

      {/* Hero — animated placeholder search */}
      <section className="bg-white border-b border-[#e5edf5] py-24 px-5">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-[44px] sm:text-[56px] font-light text-[#061b31] leading-[1.05] tracking-[-0.05em] mb-10">
            원하는 포장재 업체를<br />지금 바로 찾으세요
          </h1>

          {/* Animated search bar */}
          <div className="relative">
            <form className="flex rounded-xl overflow-hidden border-2 border-[#533afd]/20 shadow-[rgba(83,58,253,0.12)_0px_8px_24px] bg-white focus-within:border-[#533afd] transition-all">
              <div className="flex-1 relative">
                <input
                  type="search"
                  className="w-full px-5 py-4 text-[15px] text-[#061b31] placeholder:text-transparent focus:outline-none bg-white"
                  aria-label="포장재 업체 검색"
                />
                <span
                  className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-[15px] text-[#64748d]/60 transition-opacity duration-300 whitespace-nowrap overflow-hidden"
                  style={{ opacity: fade ? 1 : 0 }}
                  aria-hidden="true"
                >
                  {PLACEHOLDERS[placeholderIdx]}
                </span>
              </div>
              <button
                type="submit"
                className="bg-[#533afd] hover:bg-[#4434d4] text-white font-medium px-7 py-4 transition-colors flex-shrink-0"
              >
                검색
              </button>
            </form>
          </div>

          {/* Popular tags */}
          <div className="mt-8">
            <p className="text-xs font-semibold tracking-widest uppercase text-[#64748d]/60 mb-3">인기 검색어</p>
            <div className="flex flex-wrap justify-center gap-2">
              {POPULAR_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  className="text-[13px] text-[#061b31] border border-[#e5edf5] bg-[#f6f9fc] px-3.5 py-1.5 rounded-full hover:border-[#533afd]/40 hover:text-[#533afd] hover:bg-[rgba(83,58,253,0.04)] transition-all"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Category browse */}
          <div className="mt-8 flex flex-wrap justify-center gap-2">
            {CATEGORIES.slice(0, 5).map((cat) => (
              <Link
                key={cat.label}
                href={cat.href}
                className="text-[12px] font-medium text-[#533afd] underline underline-offset-2 hover:no-underline"
              >
                {cat.label} →
              </Link>
            ))}
          </div>

          <p className="mt-6 text-xs text-[#64748d]">{VENDOR_COUNT}개 업체 등록 · 무료 이용</p>
        </div>
      </section>

      {/* Vendor cards */}
      <section className="max-w-6xl mx-auto px-5 py-16">
        <h2 className="text-xl font-light text-[#061b31] tracking-[-0.02em] mb-8">
          최근 등록 업체
          <Link href="/" className="ml-4 text-[13px] text-[#533afd] font-normal">전체 보기 →</Link>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SAMPLE_VENDORS.slice(0, 4).map((v) => (
            <Link
              key={v.name}
              href={v.href}
              className="group border border-[#e5edf5] rounded-lg p-4 bg-white hover:border-[#533afd]/30 hover:shadow-[rgba(83,58,253,0.08)_0px_8px_20px] transition-all"
            >
              <div className="w-8 h-8 rounded bg-[rgba(83,58,253,0.08)] flex items-center justify-center mb-3">
                <span className="text-[#533afd] font-semibold text-sm">{v.name[0]}</span>
              </div>
              <h3 className="font-semibold text-[#061b31] text-[14px] mb-1">{v.name}</h3>
              <p className="text-[12px] text-[#64748d]">{v.category}</p>
              <p className="text-[11px] text-[#64748d]/60 mt-1">{v.region}</p>
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
          <div className="max-w-2xl">
            <Link
              href={SAMPLE_GUIDES[0].href}
              className="group flex items-start gap-4 border border-[#e5edf5] rounded-lg p-5 bg-white hover:border-[#533afd]/20 transition-colors"
            >
              <div className="flex-1">
                <span className="text-[11px] font-medium text-[#533afd] bg-[rgba(83,58,253,0.06)] px-2.5 py-1 rounded mb-3 inline-block">{SAMPLE_GUIDES[0].category}</span>
                <h3 className="text-[14px] font-medium text-[#061b31] group-hover:text-[#533afd] transition-colors leading-snug">{SAMPLE_GUIDES[0].title}</h3>
              </div>
              <span className="text-[#533afd] text-lg mt-1">→</span>
            </Link>
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
