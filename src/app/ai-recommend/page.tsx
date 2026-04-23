import type { Metadata } from 'next'
import Link from 'next/link'
import { BoxterLogo } from '@/components/BoxterLogo'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://packlinx.com'

export const metadata: Metadata = {
  title: 'AI 패키징 추천',
  description: '업종, 소재, 수량 조건을 입력하면 AI가 최적의 패키징 업체를 추천해드립니다. 전국 패키징 파트너를 한 번에 찾아보세요.',
  alternates: { canonical: `${siteUrl}/ai-recommend` },
  openGraph: {
    title: 'AI 패키징 추천 | BOXTER',
    description: '업종, 소재, 수량 조건을 입력하면 AI가 최적의 패키징 업체를 추천해드립니다.',
    url: `${siteUrl}/ai-recommend`,
    type: 'website',
  },
}

export default function AiRecommendPage() {
  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Header */}
      <header className="bg-white sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <BoxterLogo variant="light" size="sm" />
            <span className="hidden sm:inline text-gray-300 text-[11px] font-medium tracking-widest uppercase">전국 패키징 파트너, 한 번에</span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/blog" className="text-gray-500 hover:text-gray-900 text-[13px] font-medium transition-colors">
              가이드
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-[#F8FAFC] border-b border-gray-100 pt-12 pb-14 sm:pt-16 sm:pb-18 px-5">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-[#EBF2FF] text-[#005EFF] text-[11px] font-semibold px-3 py-1.5 rounded-full mb-6 tracking-wide uppercase">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            AI 기반 추천
          </div>
          <h1 className="text-[32px] sm:text-[42px] font-extrabold text-gray-900 leading-[1.1] tracking-[-0.04em] mb-4">
            AI 패키징 추천
          </h1>
          <p className="text-gray-500 text-[16px] leading-relaxed max-w-lg mx-auto">
            업종, 소재, 수량 조건을 알려주시면 AI가 전국 패키징 업체 중 가장 적합한 파트너를 추천해 드립니다.
          </p>
        </div>
      </section>

      {/* Coming Soon Placeholder */}
      <section className="max-w-2xl mx-auto px-5 sm:px-8 py-16 text-center">
        <div className="bg-white border border-gray-200 rounded-2xl p-10 sm:p-14">
          <div className="w-14 h-14 bg-[#EBF2FF] rounded-xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-7 h-7 text-[#005EFF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h2 className="text-[20px] font-bold text-gray-900 mb-3 tracking-[-0.02em]">
            서비스 준비 중입니다
          </h2>
          <p className="text-gray-500 text-[14px] leading-relaxed mb-8 max-w-sm mx-auto">
            AI 패키징 추천 서비스가 곧 출시됩니다. 지금은 카테고리별 업체 목록에서 파트너를 찾아보세요.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-[13px] font-semibold rounded-lg hover:bg-gray-800 transition-colors"
            >
              전체 업체 보기
            </Link>
            <Link
              href="/categories/food-beverage"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-gray-200 text-gray-700 text-[13px] font-semibold rounded-lg hover:bg-gray-50 transition-colors"
            >
              카테고리별 탐색
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white mt-auto py-8">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-[12px] text-gray-400 leading-relaxed">
              &copy; 2026 BOXTER. 본 서비스의 업체 정보는 공개된 출처에서 자동 수집되었습니다.<br className="hidden sm:inline" />
              정보 오류·삭제 요청: privacy@pkging.kr
            </p>
            <div className="flex gap-5 text-[12px] text-gray-400">
              <Link href="/blog" className="hover:text-gray-600 transition-colors">패키징 가이드</Link>
              <Link href="/privacy" className="hover:text-gray-600 transition-colors">개인정보처리방침</Link>
              <Link href="/terms" className="hover:text-gray-600 transition-colors">이용약관</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
