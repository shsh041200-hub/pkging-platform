import type { Metadata } from 'next'
import Link from 'next/link'
import { PacklinxLogo } from '@/components/PacklinxLogo'
import { BusinessRegistrationInfo } from '@/components/BusinessRegistrationInfo'
import { listKeywordIndex } from '@/lib/keyword-data'

export const revalidate = 86400

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.packlinx.com'

export const metadata: Metadata = {
  title: '패키징 키워드 디렉터리 — 업체 검색 | Packlinx',
  description: '골판지박스, 택배박스, 비닐봉투, 화장품 용기 등 50개 패키징 키워드별 전문 업체 목록을 확인하세요.',
  alternates: { canonical: `${siteUrl}/keywords` },
  openGraph: {
    title: '패키징 키워드 디렉터리 | Packlinx',
    description: '50개 패키징 키워드별 전문 업체 목록',
    url: `${siteUrl}/keywords`,
    siteName: 'Packlinx',
    locale: 'ko_KR',
    type: 'website',
  },
}

export default async function KeywordsIndexPage() {
  const keywords = await listKeywordIndex()

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-neutral-900 sticky top-0 z-50 border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <PacklinxLogo variant="dark" />
            <span className="hidden sm:inline text-slate-400 text-[11px] font-medium tracking-widest uppercase">패키징 업체 검색 플랫폼</span>
          </Link>
          <nav className="flex items-center gap-3">
            <Link
              href="/categories"
              className="flex items-center gap-1.5 text-slate-200 hover:text-white text-sm font-medium px-3.5 py-2 border border-white/[0.15] hover:border-white/[0.30] hover:bg-white/[0.06] rounded-full transition-colors"
            >
              카테고리
            </Link>
            <Link
              href="/guides"
              className="flex items-center gap-1.5 text-slate-200 hover:text-white text-sm font-medium px-3.5 py-2 border border-white/[0.15] hover:border-white/[0.30] hover:bg-white/[0.06] rounded-full transition-colors"
            >
              가이드
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-neutral-900 border-b border-white/[0.06] py-12 px-5 sm:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-[28px] sm:text-[36px] font-bold text-white leading-tight tracking-[-0.02em] mb-3">
            패키징 키워드 디렉터리
          </h1>
          <p className="text-slate-400 text-[15px] leading-relaxed">
            골판지박스·택배박스부터 화장품 용기·포장기계까지 — 검색 키워드별 전문 업체 목록
          </p>
        </div>
      </section>

      {/* Keyword grid */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-5 sm:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {keywords.map(({ slug, titleKo }) => (
            <Link
              key={slug}
              href={`/keywords/${slug}`}
              className="group flex items-center justify-between bg-white border border-gray-200 rounded-xl px-5 py-3.5 hover:border-stripe-purple/40 hover:shadow-[0_4px_16px_var(--color-stripe-purple-tint)] transition-all duration-150"
            >
              <span className="text-[14px] font-medium text-gray-800 group-hover:text-stripe-purple transition-colors leading-snug">
                {titleKo}
              </span>
              <svg className="w-4 h-4 text-gray-300 group-hover:text-stripe-purple flex-shrink-0 ml-3 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-[13px] text-gray-400 mb-4">더 많은 업체를 찾고 계신가요?</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-stripe-purple hover:bg-stripe-purple-hover text-white font-semibold px-6 py-3 rounded-lg text-[14px] transition-colors"
          >
            전체 업체 검색하기
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] bg-neutral-900 mt-auto">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-col gap-2">
              <PacklinxLogo variant="dark" layout="horizontal" />
              <p className="text-[12px] text-slate-400 leading-relaxed">
                © 2026 PACKLINX. 본 서비스의 업체 정보는 공개된 출처에서 자동 수집되었습니다.<br className="hidden sm:inline" />
                정보 오류·삭제 요청: rpdla041200@gmail.com
              </p>
              <BusinessRegistrationInfo theme="dark" />
            </div>
            <div className="flex gap-5 text-[12px] text-slate-400">
              <Link href="/guides" className="hover:text-slate-200 transition-colors">패키징 가이드</Link>
              <Link href="/privacy" className="hover:text-slate-200 transition-colors">개인정보처리방침</Link>
              <Link href="/terms" className="hover:text-slate-200 transition-colors">이용약관</Link>
              <Link href="/opt-out?type=takedown" className="hover:text-slate-200 transition-colors">권리침해 신고</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
