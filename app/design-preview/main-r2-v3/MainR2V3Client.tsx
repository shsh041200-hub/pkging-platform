'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { PacklinxLogo } from '@/components/PacklinxLogo'
import { BusinessRegistrationInfo } from '@/components/BusinessRegistrationInfo'

const CATEGORIES = [
  {
    id: 'food-beverage',
    label: '식품·음료',
    href: '/categories/food-beverage',
    count: 320,
    sub: ['식품 용기', '음료 캔·병', '냉동 포장'],
  },
  {
    id: 'ecommerce-delivery',
    label: '이커머스·배송',
    href: '/categories/ecommerce-delivery',
    count: 280,
    sub: ['택배 박스', '완충재', '마감 테이프'],
  },
  {
    id: 'cosmetics-beauty',
    label: '화장품·뷰티',
    href: '/categories/cosmetics-beauty',
    count: 210,
    sub: ['화장품 용기', '파우치·튜브', '리필 팩'],
  },
  {
    id: 'pharma-health',
    label: '의약·건강',
    href: '/categories/pharma-health',
    count: 195,
    sub: ['의약품 패키지', '건강식품 케이스', '멸균 포장'],
  },
  {
    id: 'electronics-industrial',
    label: '전자·산업',
    href: '/categories/electronics-industrial',
    count: 175,
    sub: ['전자부품 트레이', '산업용 완충', '정전기 방지'],
  },
]

const VENDOR_PREVIEWS: Record<string, { name: string; category: string }[]> = {
  'food-beverage': [
    { name: '한국포장산업', category: '식품 용기' },
    { name: '서울팩', category: '음료 캔·병' },
    { name: '그린패키지', category: '냉동 포장' },
    { name: '대한식품포장', category: '식품 용기' },
    { name: '우리패키징', category: '식품 용기' },
    { name: '친환경팩코리아', category: '냉동 포장' },
  ],
  'ecommerce-delivery': [
    { name: '스마트박스', category: '택배 박스' },
    { name: '이커머스포장', category: '완충재' },
    { name: '배송솔루션', category: '마감 테이프' },
    { name: '박스마트', category: '택배 박스' },
    { name: '에코배송팩', category: '택배 박스' },
    { name: '플러스완충재', category: '완충재' },
  ],
  'cosmetics-beauty': [
    { name: '뷰티팩코리아', category: '화장품 용기' },
    { name: '코스팩', category: '파우치·튜브' },
    { name: '럭셔리패키지', category: '화장품 용기' },
    { name: '에코뷰티팩', category: '리필 팩' },
    { name: '코스메틱박스', category: '화장품 용기' },
    { name: '뷰티솔루션팩', category: '파우치·튜브' },
  ],
  'pharma-health': [
    { name: '메디팩', category: '의약품 패키지' },
    { name: '헬스케어포장', category: '건강식품 케이스' },
    { name: '클린팩코리아', category: '멸균 포장' },
    { name: '파마패키지', category: '의약품 패키지' },
    { name: '헬스팩', category: '건강식품 케이스' },
    { name: '스테릴팩', category: '멸균 포장' },
  ],
  'electronics-industrial': [
    { name: '전자부품팩', category: '전자부품 트레이' },
    { name: '산업포장솔루션', category: '산업용 완충' },
    { name: '안티스태틱팩', category: '정전기 방지' },
    { name: '테크팩코리아', category: '전자부품 트레이' },
    { name: '인더스트리팩', category: '산업용 완충' },
    { name: 'ESD포장', category: '정전기 방지' },
  ],
}

const GUIDES = [
  { slug: 'packaging-vendor-selection', title: '패키징 업체 선정 완전 가이드', readMin: 8 },
  { slug: 'eco-packaging-basics', title: '친환경 패키지 소재 입문', readMin: 6 },
  { slug: 'small-lot-packaging', title: '소량 발주 패키징 전략', readMin: 5 },
]

export default function MainR2V3Client() {
  const [activeCat, setActiveCat] = useState('food-beverage')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const activeCategory = CATEGORIES.find((c) => c.id === activeCat) ?? CATEGORIES[0]
  const vendors = VENDOR_PREVIEWS[activeCat] ?? []

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header — v3 treatment: transparent → brand-50 fade on scroll (sticky) */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-brand-50 border-b border-brand-200 shadow-sm' : 'bg-transparent border-b border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <PacklinxLogo variant="light" />
            <span className="hidden sm:inline text-neutral-500 text-[11px] font-medium tracking-widest uppercase">패키징 업체 검색 플랫폼</span>
          </Link>
          <nav className="flex items-center gap-2 sm:gap-4">
            {/* Mobile: sidebar toggle */}
            <button
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden text-neutral-600 hover:text-brand-700 p-2 rounded-lg transition-colors"
              aria-label="카테고리 열기"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <Link href="/categories" className="hidden lg:block text-neutral-600 hover:text-brand-700 text-sm font-medium transition-colors">
              카테고리
            </Link>
            <Link href="/guides" className="text-neutral-600 hover:text-brand-700 text-sm font-medium transition-colors">
              가이드
            </Link>
            <Link
              href="/companies"
              className="text-sm font-medium px-3.5 py-2 bg-brand-700 text-white rounded-full hover:bg-brand-800 transition-colors"
            >
              업체 검색
            </Link>
          </nav>
        </div>
      </header>

      {/* Preview banner */}
      <div className="bg-brand-50 border-b border-brand-200 px-4 py-2 text-center text-[11px] text-brand-700 font-medium flex items-center justify-center gap-3">
        <span>DESIGN PREVIEW r2-v3 — Sidebar Directory — noindex</span>
        <Link href="/design-preview/r2" className="underline hover:no-underline">3안 비교 →</Link>
      </div>

      {/* Mobile: collapsible category drawer */}
      {sidebarOpen && (
        <div className="lg:hidden bg-white border-b border-border-v04 shadow-sm">
          <div className="max-w-7xl mx-auto px-5 py-4">
            <p className="text-[11px] font-semibold tracking-widest uppercase text-brand-500 mb-3">카테고리</p>
            {/* Mobile chip carousel */}
            <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => { setActiveCat(cat.id); setSidebarOpen(false) }}
                  className={`flex-shrink-0 text-[13px] font-medium px-3.5 py-2 rounded-full border transition-colors ${
                    activeCat === cat.id
                      ? 'bg-brand-700 text-white border-brand-700'
                      : 'bg-white text-neutral-700 border-neutral-200 hover:border-brand-300'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex max-w-7xl mx-auto w-full px-5 sm:px-8 py-8 gap-8">

        {/* ── Left sidebar: 240px sticky ── */}
        <aside className="hidden lg:flex flex-col w-60 flex-shrink-0">
          <div className="sticky top-24">
            <p className="text-[11px] font-semibold tracking-widest uppercase text-brand-500 mb-3 px-3">카테고리</p>
            <nav className="flex flex-col gap-0.5">
              {CATEGORIES.map((cat) => (
                <div key={cat.id}>
                  <button
                    type="button"
                    onClick={() => setActiveCat(cat.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-[14px] font-medium transition-colors flex items-center justify-between group ${
                      activeCat === cat.id
                        ? 'bg-brand-50 text-brand-700'
                        : 'text-neutral-700 hover:bg-neutral-100 hover:text-heading-deep-navy'
                    }`}
                  >
                    <span>{cat.label}</span>
                    <span className="text-[11px] text-neutral-400">{cat.count}</span>
                  </button>
                  {/* Sub-items for active category */}
                  {activeCat === cat.id && (
                    <div className="ml-3 mt-0.5 mb-1 flex flex-col gap-0.5">
                      {cat.sub.map((s) => (
                        <Link
                          key={s}
                          href={cat.href}
                          className="px-3 py-1.5 text-[12px] text-body-secondary hover:text-brand-700 transition-colors rounded-lg hover:bg-brand-50"
                        >
                          {s}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {/* Vendor registration in sidebar */}
            <div className="mt-6 p-4 bg-brand-50 border border-brand-100 rounded-xl">
              <p className="text-[12px] font-semibold text-brand-700 mb-1">업체 등록</p>
              <p className="text-[11px] text-body-secondary mb-3 leading-relaxed">무료로 업체 정보를 등록하세요.</p>
              <Link
                href="/companies"
                className="block text-center text-[12px] font-medium px-3 py-2 bg-brand-700 text-white rounded-lg hover:bg-brand-800 transition-colors"
              >
                지금 등록 →
              </Link>
            </div>
          </div>
        </aside>

        {/* ── Right main pane ── */}
        <main className="flex-1 min-w-0">

          {/* Slim hero */}
          <section className="mb-8">
            <h1 className="text-[28px] sm:text-[36px] font-light text-heading-deep-navy leading-[1.15] tracking-[-0.8px] mb-3">
              패키징 업체 검색 플랫폼
            </h1>
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center mb-3">
              <div className="flex gap-0 flex-1 max-w-lg">
                <input
                  type="search"
                  placeholder="업체명, 소재, 용도 검색…"
                  className="flex-1 h-10 px-3.5 text-[14px] border border-brand-200 border-r-0 rounded-l-lg focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 placeholder:text-neutral-400 bg-white"
                />
                <button
                  type="button"
                  className="h-10 px-4 bg-brand-700 hover:bg-brand-800 text-white text-[13px] font-medium rounded-r-lg transition-colors"
                >
                  검색
                </button>
              </div>
              <p className="text-[13px] text-body-secondary">
                <span className="font-semibold text-heading-deep-navy">1,380개</span> 등록
              </p>
            </div>
          </section>

          {/* Vendor preview — active category */}
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-[16px] font-semibold text-heading-deep-navy">{activeCategory.label}</h2>
                <span className="text-[11px] text-neutral-400">{activeCategory.count}개</span>
              </div>
              <Link
                href={activeCategory.href}
                className="text-[12px] text-brand-600 hover:text-brand-700 font-medium transition-colors"
              >
                전체 보기 →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {vendors.map((v) => (
                <Link
                  key={v.name}
                  href={`/companies?category=${activeCat}`}
                  className="group flex items-center gap-3 bg-white border border-border-v04 rounded-xl px-4 py-3.5 hover:border-brand-300 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-brand-50 border border-brand-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-[12px] font-bold text-brand-600">{v.name[0]}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium text-heading-deep-navy group-hover:text-brand-700 transition-colors truncate">
                      {v.name}
                    </p>
                    <p className="text-[11px] text-neutral-400 truncate">{v.category}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* ── Guide section — visually separated from category/vendor area ── */}
          {/* separation: border-t divider (b) + neutral-50 rounded wash (c) + eyebrow label (d) */}
          <section className="mt-6 pt-6 border-t border-neutral-200">
            <div className="bg-neutral-50 rounded-2xl p-5 sm:p-6">
              {/* eyebrow */}
              <p className="text-[10px] font-semibold tracking-widest uppercase text-neutral-400 mb-1.5">
                패키징 노하우
              </p>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[16px] font-semibold text-heading-deep-navy">패키징 가이드</h2>
                <Link href="/guides" className="text-[12px] text-brand-600 hover:text-brand-700 font-medium transition-colors">
                  전체 보기 →
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {GUIDES.map((g) => (
                  <Link
                    key={g.slug}
                    href={`/guides/${g.slug}`}
                    className="group flex flex-col bg-white border border-border-v04 rounded-xl p-4 hover:border-brand-300 hover:shadow-[var(--shadow-elevated-v04)] transition-all duration-200"
                  >
                    <h3 className="text-[13px] font-semibold text-heading-deep-navy group-hover:text-brand-700 transition-colors leading-snug mb-2">
                      {g.title}
                    </h3>
                    <div className="mt-auto flex items-center gap-1 text-[11px] text-neutral-400">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {g.readMin}분
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-border-v04 bg-white mt-auto">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-col gap-2">
              <PacklinxLogo variant="light" layout="horizontal" />
              <p className="text-[12px] text-body-secondary leading-relaxed">
                © 2026 PACKLINX. 본 서비스의 업체 정보는 공개된 출처에서 자동 수집되었습니다.<br className="hidden sm:inline" />
                정보 오류·삭제 요청: rpdla041200@gmail.com
              </p>
              <BusinessRegistrationInfo theme="light" />
            </div>
            <div className="flex flex-wrap gap-5 text-[12px] text-body-secondary">
              <Link href="/guides" className="hover:text-heading-deep-navy transition-colors">패키징 가이드</Link>
              <Link href="/privacy" className="hover:text-heading-deep-navy transition-colors">개인정보처리방침</Link>
              <Link href="/terms" className="hover:text-heading-deep-navy transition-colors">이용약관</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
