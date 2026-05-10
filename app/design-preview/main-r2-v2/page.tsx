import type { Metadata } from 'next'
import Link from 'next/link'
import { PacklinxLogo } from '@/components/PacklinxLogo'
import { BusinessRegistrationInfo } from '@/components/BusinessRegistrationInfo'

export const metadata: Metadata = {
  title: 'r2-v2 Bento Modular — 메인페이지 Design Preview | Packlinx',
  robots: { index: false, follow: false },
}

const CATEGORIES = [
  { label: '식품·음료', href: '/categories/food-beverage', count: 320 },
  { label: '이커머스·배송', href: '/categories/ecommerce-delivery', count: 280 },
  { label: '화장품·뷰티', href: '/categories/cosmetics-beauty', count: 210 },
  { label: '의약·건강', href: '/categories/pharma-health', count: 195 },
  { label: '전자·산업', href: '/categories/electronics-industrial', count: 175 },
]

export default function MainR2V2Page() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header — v2 treatment: bg brand-50 wash */}
      <header className="bg-brand-50 sticky top-0 z-50 border-b border-brand-200">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <PacklinxLogo variant="light" />
            <span className="hidden sm:inline text-brand-600 text-[11px] font-medium tracking-widest uppercase">패키징 업체 검색 플랫폼</span>
          </Link>
          <nav className="flex items-center gap-2 sm:gap-4">
            <Link href="/categories" className="text-brand-700 hover:text-brand-800 text-sm font-medium transition-colors">
              카테고리
            </Link>
            <Link href="/guides" className="text-brand-700 hover:text-brand-800 text-sm font-medium transition-colors">
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
        <span>DESIGN PREVIEW r2-v2 — Bento Modular — noindex</span>
        <Link href="/design-preview/r2" className="underline hover:no-underline">3안 비교 →</Link>
      </div>

      <main className="flex-1 bg-neutral-50">
        {/* ── Slim search + count bar ── */}
        <section className="bg-white border-b border-border-v04">
          <div className="max-w-7xl mx-auto px-5 sm:px-8 py-8">
            <h1 className="text-[22px] sm:text-[28px] font-light text-heading-deep-navy tracking-[-0.5px] mb-4">
              패키징 업체를 찾고 있나요?
            </h1>
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
              <div className="flex gap-0 flex-1 max-w-2xl">
                <input
                  type="search"
                  placeholder="업체명, 소재, 용도 검색…"
                  className="flex-1 h-11 px-4 text-[14px] border border-brand-200 border-r-0 rounded-l-lg focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 placeholder:text-neutral-400 bg-white"
                />
                <button
                  type="button"
                  className="h-11 px-5 bg-brand-700 hover:bg-brand-800 text-white text-[13px] font-medium rounded-r-lg transition-colors"
                >
                  검색
                </button>
              </div>
              <p className="text-[13px] text-body-secondary sm:flex-shrink-0">
                <span className="font-semibold text-heading-deep-navy">1,380개</span> 패키징 업체 등록
              </p>
            </div>
          </div>
        </section>

        {/* ── Bento grid ── */}
        <section className="max-w-7xl mx-auto px-5 sm:px-8 py-8">
          {/*
            Desktop grid (≥ lg): 3 cols, auto rows
              - Big cell: col-span-2, row-span-2 (categories)
              - Cell G1: col 3 row 1 (guide 1)
              - Cell Verify: col 3 row 2 (검증 안내)
              - Cell Guide2: col 1 row 3 (guide 2 featured)
              - Cell CTA: col 2-3 row 3 (vendor registration)
            Tablet (sm-lg): 2 cols
            Mobile: 1 col
          */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-auto">

            {/* ── BIG CELL (col-span-2 row-span-2): Categories + count ── */}
            <div className="sm:col-span-2 lg:col-span-2 lg:row-span-2 bg-white border border-border-v04 rounded-2xl p-6 sm:p-8 flex flex-col">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <p className="text-[11px] font-semibold tracking-widest uppercase text-brand-500 mb-1">카테고리</p>
                  <p className="text-[28px] sm:text-[36px] font-light text-heading-deep-navy leading-none tracking-[-1px]">
                    1,380<span className="text-[16px] sm:text-[20px] font-normal text-body-secondary ml-1.5">개 업체</span>
                  </p>
                </div>
                <Link href="/categories" className="text-[12px] text-brand-600 hover:text-brand-700 font-medium transition-colors flex-shrink-0 mt-1">
                  전체 보기 →
                </Link>
              </div>
              <ul className="flex flex-col gap-1 flex-1">
                {CATEGORIES.map((cat) => (
                  <li key={cat.href}>
                    <Link
                      href={cat.href}
                      className="group flex items-center justify-between py-3 px-3 rounded-xl hover:bg-brand-50 transition-colors"
                    >
                      <span className="text-[15px] sm:text-[16px] font-medium text-heading-deep-navy group-hover:text-brand-700 transition-colors">
                        {cat.label}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[12px] text-neutral-400">{cat.count}개</span>
                        <svg className="w-4 h-4 text-neutral-300 group-hover:text-brand-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* ── CELL G1: Guide 1 featured ── */}
            <Link
              href="/guides/packaging-vendor-selection"
              className="group bg-white border border-border-v04 rounded-2xl p-5 flex flex-col hover:border-brand-300 hover:shadow-[var(--shadow-elevated-v04)] transition-all duration-200"
            >
              <p className="text-[10px] font-semibold tracking-widest uppercase text-brand-500 mb-2">가이드</p>
              <h3 className="text-[15px] font-semibold text-heading-deep-navy group-hover:text-brand-700 transition-colors leading-snug mb-2">
                패키징 업체 선정 완전 가이드
              </h3>
              <p className="text-[12px] text-body-secondary leading-relaxed flex-1">
                사업자등록 확인부터 샘플 발주까지 7단계
              </p>
              <div className="mt-4 flex items-center gap-1 text-[11px] text-neutral-400">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                8분 읽기
              </div>
            </Link>

            {/* ── CELL Verify: 검증 안내 ── */}
            <div className="bg-brand-50 border border-brand-100 rounded-2xl p-5 flex flex-col">
              <p className="text-[10px] font-semibold tracking-widest uppercase text-brand-500 mb-2">검증 방법</p>
              <h3 className="text-[14px] font-semibold text-heading-deep-navy mb-2 leading-snug">
                어떻게 검증하나요?
              </h3>
              <p className="text-[12px] text-body-secondary leading-relaxed flex-1">
                사업자등록번호 검증된 업체 포함. 공개된 출처에서 자동 수집 후 확인.
              </p>
              <Link
                href="/guides/packaging-vendor-selection"
                className="mt-4 text-[12px] text-brand-600 hover:text-brand-700 font-medium transition-colors"
              >
                검증 과정 알아보기 →
              </Link>
            </div>

            {/* ── CELL Guide2: Guide 2 small ── */}
            <Link
              href="/guides/eco-packaging-basics"
              className="group bg-white border border-border-v04 rounded-2xl p-5 flex flex-col hover:border-brand-300 hover:shadow-[var(--shadow-elevated-v04)] transition-all duration-200"
            >
              <p className="text-[10px] font-semibold tracking-widest uppercase text-brand-500 mb-2">가이드</p>
              <h3 className="text-[14px] font-semibold text-heading-deep-navy group-hover:text-brand-700 transition-colors leading-snug mb-2">
                친환경 패키지 소재 입문
              </h3>
              <p className="text-[12px] text-body-secondary leading-relaxed flex-1">
                FSC 인증지·생분해 필름·재생 플라스틱 비교
              </p>
              <div className="mt-3 flex items-center gap-1 text-[11px] text-neutral-400">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                6분 읽기
              </div>
            </Link>

            {/* ── CELL CTA: Vendor registration ── */}
            <div className="sm:col-span-1 lg:col-span-2 bg-brand-700 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold tracking-widest uppercase text-brand-200 mb-1">업체 등록</p>
                <h3 className="text-[15px] font-semibold text-white mb-1">패키징 업체이신가요?</h3>
                <p className="text-[12px] text-brand-200 leading-relaxed">
                  무료로 업체 정보를 등록하고 구매자에게 노출되세요.
                </p>
              </div>
              <Link
                href="/companies"
                className="flex-shrink-0 text-[13px] font-medium px-4 py-2.5 bg-white text-brand-700 rounded-lg hover:bg-brand-50 transition-colors"
              >
                지금 등록하기 →
              </Link>
            </div>

          </div>
        </section>
      </main>

      {/* Footer — v2 treatment: bg brand-900 dark */}
      <footer className="bg-brand-900 mt-auto">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-col gap-2">
              <PacklinxLogo variant="dark" layout="horizontal" />
              <p className="text-[12px] text-brand-300 leading-relaxed">
                © 2026 PACKLINX. 본 서비스의 업체 정보는 공개된 출처에서 자동 수집되었습니다.<br className="hidden sm:inline" />
                정보 오류·삭제 요청: rpdla041200@gmail.com
              </p>
              <BusinessRegistrationInfo theme="dark" />
            </div>
            <div className="flex flex-wrap gap-5 text-[12px] text-brand-300">
              <Link href="/guides" className="hover:text-white transition-colors">패키징 가이드</Link>
              <Link href="/privacy" className="hover:text-white transition-colors">개인정보처리방침</Link>
              <Link href="/terms" className="hover:text-white transition-colors">이용약관</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
