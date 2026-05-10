'use client'

import Link from 'next/link'
import { CATEGORIES, SAMPLE_VENDORS, SAMPLE_GUIDES, VENDOR_COUNT } from '../main-r3/_shared'

const FEATURES = [
  {
    title: '업체 검색',
    desc: '카테고리·소재·지역별 업체를 빠르게 검색하세요.',
    icon: (
      <svg className="w-6 h-6 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
  },
  {
    title: '조건 비교',
    desc: 'MOQ·납기·인증 조건을 업체별로 한눈에 비교하세요.',
    icon: (
      <svg className="w-6 h-6 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    title: '업체 문의',
    desc: '관심 업체의 홈페이지로 바로 연결되어 편리하게 문의하세요.',
    icon: (
      <svg className="w-6 h-6 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
      </svg>
    ),
  },
]

export function MainR3V10Client() {
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

      {/* Hero — split layout (Korean B2B) */}
      <section className="bg-neutral-50 border-b border-neutral-200">
        <div className="max-w-6xl mx-auto px-5 py-16 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Left: bold Korean headline + CTAs */}
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase text-brand-500 mb-4">포장재 B2B 디렉토리 플랫폼</p>
            <h1 className="text-[36px] sm:text-[46px] font-bold text-neutral-900 leading-[1.15] tracking-[-0.03em] mb-5">
              포장재 파트너,<br />지금 무료로<br />찾아보세요
            </h1>
            <p className="text-base text-neutral-500 leading-relaxed mb-8">
              전국 {VENDOR_COUNT} 패키징 업체를 카테고리별로 비교하고<br />
              내 제품에 딱 맞는 파트너를 빠르게 찾으세요.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/"
                className="bg-brand-500 hover:bg-brand-600 text-white px-7 py-3.5 rounded font-semibold text-[15px] transition-colors shadow-md text-center"
              >
                지금 업체 찾기
              </Link>
              <Link
                href="#"
                className="border border-brand-200 text-brand-500 px-7 py-3.5 rounded font-semibold text-[15px] hover:bg-brand-500/[0.04] transition-colors text-center"
              >
                업체로 등록하기
              </Link>
            </div>
          </div>

          {/* Right: category visual + trust indicator */}
          <div>
            {/* Trust indicator */}
            <div className="bg-brand-500 text-white rounded-xl p-4 mb-4 flex items-center justify-between">
              <div>
                <p className="text-[28px] font-light tracking-[-0.03em]">{VENDOR_COUNT}</p>
                <p className="text-[13px] text-brand-200 mt-0.5">등록 업체 수</p>
              </div>
              <div className="w-px h-10 bg-white/20" />
              <div>
                <p className="text-[28px] font-light tracking-[-0.03em]">12</p>
                <p className="text-[13px] text-brand-200 mt-0.5">포장 카테고리</p>
              </div>
              <div className="w-px h-10 bg-white/20" />
              <div>
                <p className="text-[28px] font-light tracking-[-0.03em]">무료</p>
                <p className="text-[13px] text-brand-200 mt-0.5">검색·비교</p>
              </div>
            </div>

            {/* Category grid preview */}
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.slice(0, 4).map((cat) => (
                <Link
                  key={cat.label}
                  href={cat.href}
                  className="group border border-neutral-200 rounded-lg p-3.5 bg-white hover:border-brand-500/30 transition-all flex items-center gap-2.5"
                >
                  <div className="w-8 h-8 rounded bg-brand-500/[0.08] flex items-center justify-center flex-shrink-0 group-hover:bg-brand-500/[0.12] transition-colors">
                    <div className="w-3 h-3 rounded-sm bg-brand-500/30" />
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-neutral-900 group-hover:text-brand-500 transition-colors">{cat.label}</p>
                    <p className="text-[11px] text-neutral-500">{cat.sub}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Feature icon cards */}
      <section className="max-w-6xl mx-auto px-5 py-16">
        <h2 className="text-xl font-light text-neutral-900 tracking-[-0.02em] text-center mb-10">Packlinx 이렇게 활용하세요</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="border border-neutral-200 rounded-xl p-6 bg-white text-center"
            >
              <div className="w-12 h-12 rounded-xl bg-brand-500/[0.08] mx-auto mb-4 flex items-center justify-center">
                {f.icon}
              </div>
              <h3 className="text-[16px] font-semibold text-neutral-900 mb-2">{f.title}</h3>
              <p className="text-[13px] text-neutral-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Category directory */}
      <section className="border-t border-neutral-200 bg-neutral-50">
        <div className="max-w-6xl mx-auto px-5 py-16">
          <h2 className="text-xl font-light text-neutral-900 tracking-[-0.02em] mb-8">
            카테고리별 업체 찾기
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.label}
                href={cat.href}
                className="group border border-neutral-200 rounded-lg px-4 py-3 bg-white hover:border-brand-500/30 hover:shadow-sm transition-all flex items-center justify-between"
              >
                <div>
                  <p className="text-[13px] font-semibold text-neutral-900 group-hover:text-brand-500 transition-colors">{cat.label}</p>
                  <p className="text-[11px] text-neutral-500 mt-0.5">{cat.sub}</p>
                </div>
                <span className="text-neutral-500/40 group-hover:text-brand-500 transition-colors text-sm">→</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Guide content */}
      <section className="border-t border-neutral-200 bg-white">
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
