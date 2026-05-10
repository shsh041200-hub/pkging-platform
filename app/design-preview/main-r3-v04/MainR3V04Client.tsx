'use client'

import Link from 'next/link'
import { CATEGORIES, SAMPLE_VENDORS, SAMPLE_GUIDES } from '../main-r3/_shared'

export function MainR3V04Client() {
  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Header */}
      <header className="bg-white sticky top-0 z-50 border-b border-neutral-200">
        <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between">
          <Link href="/design-preview/main-r3" className="text-neutral-900 font-semibold tracking-tight text-lg">Packlinx</Link>
          <nav className="flex items-center gap-4 text-sm text-neutral-500">
            <Link href="#" className="hover:text-neutral-900 transition-colors">카테고리</Link>
            <Link href="#" className="hover:text-neutral-900 transition-colors">가이드</Link>
            <Link href="/" className="text-brand-500 border border-brand-200 px-3.5 py-1.5 rounded hover:bg-brand-500/[0.05] transition-colors font-medium">
              업체 찾기 →
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero — editorial featured guide */}
      <section className="border-b border-neutral-200 bg-white">
        <div className="max-w-6xl mx-auto px-5 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Featured guide — large */}
            <div className="lg:col-span-2">
              <p className="text-xs font-semibold tracking-widest uppercase text-brand-500 mb-4">추천 가이드</p>
              <Link
                href={SAMPLE_GUIDES[0].href}
                className="group block border border-neutral-200 rounded-xl overflow-hidden bg-neutral-50 hover:border-brand-500/30 hover:shadow-lg transition-all"
              >
                <div className="bg-brand-500/[0.06] border-b border-neutral-200 h-48 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-xl border border-brand-200 bg-white flex items-center justify-center mx-auto mb-3 shadow-sm">
                      <div className="w-8 h-8 rounded bg-brand-500/[0.12]" />
                    </div>
                    <span className="text-[12px] text-brand-500 font-medium">{SAMPLE_GUIDES[0].category}</span>
                  </div>
                </div>
                <div className="p-6">
                  <h2 className="text-[22px] font-semibold text-neutral-900 leading-snug tracking-[-0.02em] group-hover:text-brand-500 transition-colors mb-3">
                    {SAMPLE_GUIDES[0].title}
                  </h2>
                  <p className="text-[14px] text-neutral-500 leading-relaxed mb-4">
                    올바른 포장재 업체 선정은 제품 품질과 브랜드 이미지에 직결됩니다. 핵심 기준 5가지를 체크하세요.
                  </p>
                  <span className="text-[13px] font-medium text-brand-500">가이드 읽기 →</span>
                </div>
              </Link>
            </div>

            {/* Category chips sidebar */}
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase text-neutral-500 mb-4">카테고리 둘러보기</p>
              <div className="space-y-2">
                {CATEGORIES.map((cat) => (
                  <Link
                    key={cat.label}
                    href={cat.href}
                    className="flex items-center justify-between border border-neutral-200 rounded-lg px-4 py-3 bg-white hover:border-brand-500/30 hover:text-brand-500 transition-all group"
                  >
                    <div>
                      <p className="text-[13px] font-medium text-neutral-900 group-hover:text-brand-500 transition-colors">{cat.label}</p>
                      <p className="text-[11px] text-neutral-500">{cat.sub}</p>
                    </div>
                    <span className="text-neutral-500/40 group-hover:text-brand-500 transition-colors">→</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Guide grid 2×3 */}
      <section className="max-w-6xl mx-auto px-5 py-16">
        <h2 className="text-xl font-light text-neutral-900 tracking-[-0.02em] mb-8">
          최근 가이드
          <Link href="/guides" className="ml-4 text-[13px] text-brand-500 font-normal">전체 보기 →</Link>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SAMPLE_GUIDES.map((g) => (
            <Link
              key={g.title}
              href={g.href}
              className="group border border-neutral-200 rounded-lg p-5 bg-white hover:border-brand-500/20 transition-colors"
            >
              <span className="text-[11px] font-medium text-brand-500 bg-brand-500/[0.06] px-2.5 py-1 rounded mb-3 inline-block">{g.category}</span>
              <h3 className="text-[14px] font-medium text-neutral-900 leading-snug group-hover:text-brand-500 transition-colors">{g.title}</h3>
            </Link>
          ))}
          <Link
            href="/guides"
            className="border border-dashed border-brand-200 rounded-lg p-5 flex items-center justify-center text-[13px] text-brand-500 hover:bg-brand-500/[0.03] transition-colors"
          >
            가이드 더 보기 →
          </Link>
        </div>
      </section>

      {/* Directory CTA */}
      <section className="border-t border-neutral-200 bg-brand-500/[0.04]">
        <div className="max-w-6xl mx-auto px-5 py-12 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-[22px] font-light text-neutral-900 tracking-[-0.02em] mb-2">
              포장재 업체를 직접 검색하시겠어요?
            </h3>
            <p className="text-[14px] text-neutral-500">전국 1,300+ 업체를 카테고리·소재·지역별로 필터링하세요.</p>
          </div>
          <Link
            href="/"
            className="flex-shrink-0 bg-brand-500 hover:bg-brand-600 text-white px-6 py-3 rounded font-medium text-sm transition-colors"
          >
            업체 검색하기 →
          </Link>
        </div>
      </section>

      {/* Popular categories with vendors */}
      <section className="max-w-6xl mx-auto px-5 py-16">
        <h2 className="text-xl font-light text-neutral-900 tracking-[-0.02em] mb-8">인기 카테고리 업체</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {SAMPLE_VENDORS.slice(0, 3).map((v) => (
            <Link
              key={v.name}
              href={v.href}
              className="group border border-neutral-200 rounded-lg p-4 bg-white hover:border-brand-500/30 transition-all"
            >
              <div className="w-8 h-8 rounded bg-brand-500/[0.08] flex items-center justify-center mb-3">
                <span className="text-brand-500 font-semibold text-sm">{v.name[0]}</span>
              </div>
              <h3 className="font-medium text-neutral-900 text-[14px] mb-1">{v.name}</h3>
              <p className="text-[12px] text-neutral-500">{v.category}</p>
            </Link>
          ))}
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
