import type { Metadata } from 'next'
import Link from 'next/link'
import { PacklinxLogo } from '@/components/PacklinxLogo'
import { BusinessRegistrationInfo } from '@/components/BusinessRegistrationInfo'

export const metadata: Metadata = {
  title: 'r2-v1 Editorial Asymmetric — 메인페이지 Design Preview | Packlinx',
  robots: { index: false, follow: false },
}

const CATEGORIES = [
  { label: '식품·음료', href: '/categories/food-beverage', count: '320개' },
  { label: '이커머스·배송', href: '/categories/ecommerce-delivery', count: '280개' },
  { label: '화장품·뷰티', href: '/categories/cosmetics-beauty', count: '210개' },
  { label: '의약·건강', href: '/categories/pharma-health', count: '195개' },
  { label: '전자·산업', href: '/categories/electronics-industrial', count: '175개' },
]

const GUIDES = [
  {
    slug: 'packaging-vendor-selection',
    title: '패키징 업체 선정 완전 가이드',
    desc: '사업자등록 확인부터 샘플 발주까지 7단계',
    readMin: 8,
  },
  {
    slug: 'eco-packaging-basics',
    title: '친환경 패키지 소재 입문',
    desc: 'FSC 인증지·생분해 필름·재생 플라스틱 비교',
    readMin: 6,
  },
  {
    slug: 'small-lot-packaging',
    title: '소량 발주 패키징 전략',
    desc: '100개 이하 발주 시 단가·납기·품질 체크리스트',
    readMin: 5,
  },
]

export default function MainR2V1Page() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header — v1 treatment: bottom 1px brand-300 border + logo brand-800 */}
      <header className="bg-white sticky top-0 z-50 border-b border-brand-300">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            {/* Logo with brand-800 color treatment */}
            <div className="text-brand-800">
              <PacklinxLogo variant="light" />
            </div>
          </Link>
          <nav className="flex items-center gap-2 sm:gap-4">
            <Link href="/categories" className="text-neutral-600 hover:text-brand-700 text-sm font-medium transition-colors">
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
        <span>DESIGN PREVIEW r2-v1 — Editorial Asymmetric — noindex</span>
        <Link href="/design-preview/r2" className="underline hover:no-underline">3안 비교 →</Link>
      </div>

      <main className="flex-1">
        {/* ── Hero: 60/40 asymmetric split ── */}
        <section className="max-w-7xl mx-auto px-5 sm:px-8 pt-14 pb-12 sm:pt-20 sm:pb-16">
          <div className="flex flex-col lg:flex-row lg:items-start lg:gap-16">

            {/* Left 60% — headline + search */}
            <div className="flex-1 lg:max-w-[58%]">
              <p className="text-[11px] font-semibold tracking-widest uppercase text-brand-600 mb-4">
                패키징 업체 검색 플랫폼
              </p>
              <h1 className="text-[36px] sm:text-[52px] lg:text-[60px] font-light text-heading-deep-navy leading-[1.1] tracking-[-1.5px] mb-5">
                패키징 업체,<br />
                한 곳에서 찾으세요
              </h1>
              <p className="text-[16px] sm:text-[18px] text-body-secondary leading-relaxed mb-8 max-w-lg">
                사업자등록번호 검증된 업체 포함. 식품·이커머스·화장품·의약·전자 전 분야.
              </p>

              {/* Search bar inline */}
              <div className="flex gap-0 max-w-lg">
                <input
                  type="search"
                  placeholder="업체명, 소재, 용도 검색…"
                  className="flex-1 h-12 px-4 text-[15px] border border-brand-200 border-r-0 rounded-l-lg focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 placeholder:text-neutral-400 bg-white"
                />
                <button
                  type="button"
                  className="h-12 px-5 bg-brand-700 hover:bg-brand-800 text-white text-[14px] font-medium rounded-r-lg transition-colors"
                >
                  검색
                </button>
              </div>
            </div>

            {/* Right 40% — categories + vendor count */}
            <div className="mt-10 lg:mt-0 lg:flex-shrink-0 lg:w-[38%]">
              {/* Vendor count — big city-name style */}
              <div className="mb-6">
                <span className="text-[64px] sm:text-[80px] font-light text-brand-800 leading-none tracking-[-2px]">
                  1,380
                </span>
                <p className="text-[13px] text-body-secondary mt-1">개 검증된 패키징 업체</p>
              </div>

              {/* Category links */}
              <ul className="space-y-1">
                {CATEGORIES.map((cat) => (
                  <li key={cat.href}>
                    <Link
                      href={cat.href}
                      className="group flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-brand-50 transition-colors"
                    >
                      <span className="text-[15px] font-medium text-heading-deep-navy group-hover:text-brand-700 transition-colors">
                        {cat.label}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[12px] text-neutral-400">{cat.count}</span>
                        <svg className="w-4 h-4 text-neutral-300 group-hover:text-brand-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    href="/categories"
                    className="flex items-center gap-1.5 py-2.5 px-3 text-[13px] text-brand-600 hover:text-brand-700 font-medium transition-colors"
                  >
                    전체 카테고리 보기
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="border-t border-border-v04" />
        </div>

        {/* ── Guide cards: 3-col horizontal ── */}
        <section className="max-w-7xl mx-auto px-5 sm:px-8 py-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[18px] font-medium text-heading-deep-navy tracking-[-0.3px]">
              패키징 가이드
            </h2>
            <Link href="/guides" className="text-[13px] text-brand-600 hover:text-brand-700 font-medium transition-colors">
              전체 보기 →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {GUIDES.map((g) => (
              <Link
                key={g.slug}
                href={`/guides/${g.slug}`}
                className="group flex flex-col bg-white border border-border-v04 rounded-xl p-5 hover:border-brand-300 hover:shadow-[var(--shadow-elevated-v04)] transition-all duration-200"
              >
                <h3 className="text-[14px] font-semibold text-heading-deep-navy mb-2 group-hover:text-brand-700 transition-colors leading-snug">
                  {g.title}
                </h3>
                <p className="text-[13px] text-body-secondary leading-relaxed flex-1">{g.desc}</p>
                <div className="mt-4 flex items-center gap-1.5 text-[11px] text-neutral-400">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {g.readMin}분 읽기
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Vendor registration CTA — minimal */}
        <section className="max-w-7xl mx-auto px-5 sm:px-8 pb-16">
          <div className="border border-brand-200 rounded-xl p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-brand-50">
            <div>
              <p className="text-[15px] font-medium text-heading-deep-navy mb-1">패키징 업체이신가요?</p>
              <p className="text-[13px] text-body-secondary">무료로 업체 정보를 등록하고 구매자에게 노출되세요.</p>
            </div>
            <Link
              href="/companies"
              className="flex-shrink-0 text-[13px] font-medium px-4 py-2.5 bg-brand-700 text-white rounded-lg hover:bg-brand-800 transition-colors"
            >
              업체 등록 →
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border-v04 bg-white">
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
