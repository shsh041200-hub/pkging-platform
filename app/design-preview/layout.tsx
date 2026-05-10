import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import Link from 'next/link'
import { PacklinxLogo } from '@/components/PacklinxLogo'
import { BusinessRegistrationInfo } from '@/components/BusinessRegistrationInfo'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function DesignPreviewLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#F9FAFB]">
      {/* Header — same as production */}
      <header className="bg-[#0F172A] sticky top-0 z-50 border-b border-white/[0.06]">
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

      {/* Design preview banner */}
      <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 text-center text-[12px] text-amber-800 font-medium flex items-center justify-center gap-3">
        <span>🎨 DESIGN PREVIEW — noindex · 보드 검토용</span>
        <Link href="/design-preview" className="underline hover:no-underline text-amber-700">3안 비교 인덱스 →</Link>
      </div>

      <main className="flex-1">
        {children}
      </main>

      {/* Footer — same as production */}
      <footer className="border-t border-white/[0.06] bg-[#0F172A] mt-auto">
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
            <div className="flex flex-wrap gap-5 text-[12px] text-slate-400">
              <Link href="/guides" className="hover:text-slate-200 transition-colors">패키징 가이드</Link>
              <Link href="/privacy" className="hover:text-slate-200 transition-colors">개인정보처리방침</Link>
              <Link href="/terms" className="hover:text-slate-200 transition-colors">이용약관</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
