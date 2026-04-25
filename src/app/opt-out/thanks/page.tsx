import Link from 'next/link'
import type { Metadata } from 'next'
import { PacklinxLogo } from '@/components/PacklinxLogo'

export const metadata: Metadata = {
  title: '요청 접수 완료 — Packlinx',
}

export default function OptOutThanksPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-[#0F172A] sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <PacklinxLogo variant="dark" />
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/guides" className="text-white/70 hover:text-white text-[13px] font-medium transition-colors">
              가이드
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-4xl mb-4">✓</div>
          <h1 className="text-2xl font-bold text-slate-900 mb-3">요청이 접수되었습니다</h1>
          <p className="text-sm text-slate-600 mb-6">
            정보 삭제·수정 요청이 성공적으로 접수되었습니다.
            10영업일 이내에 입력하신 이메일로 처리 결과를 안내드리겠습니다.
          </p>
          <Link
            href="/"
            className="inline-block rounded-lg bg-[#0F172A] text-white font-medium px-6 py-2.5 text-sm hover:bg-slate-700 transition-colors"
          >
            홈으로 돌아가기
          </Link>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-wrap gap-4 text-xs text-slate-400 justify-center">
          <Link href="/" className="hover:text-slate-600">홈</Link>
          <Link href="/privacy" className="hover:text-slate-600">개인정보처리방침</Link>
          <Link href="/terms" className="hover:text-slate-600">이용약관</Link>
          <Link href="/opt-out" className="hover:text-slate-600">정보 삭제·수정 요청</Link>
        </div>
      </footer>
    </div>
  )
}
