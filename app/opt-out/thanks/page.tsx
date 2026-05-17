import Link from 'next/link'
import type { Metadata } from 'next'
import { PacklinxLogo } from '@/components/PacklinxLogo'
import { SiteHeader } from '@/components/SiteHeader'
import { BusinessRegistrationInfo } from '@/components/BusinessRegistrationInfo'

export const metadata: Metadata = {
  title: '요청 접수 완료',
  robots: { index: false, follow: false },
}

export default function OptOutThanksPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <SiteHeader />

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
            className="inline-block rounded-lg bg-neutral-900 text-white font-medium px-6 py-2.5 text-sm hover:bg-neutral-800 transition-colors"
          >
            홈으로 돌아가기
          </Link>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-wrap gap-4 text-xs text-slate-400 justify-center mb-3">
            <Link href="/" className="hover:text-slate-600">홈</Link>
            <Link href="/privacy" className="hover:text-slate-600">개인정보처리방침</Link>
            <Link href="/terms" className="hover:text-slate-600">이용약관</Link>
            <Link href="/opt-out" className="hover:text-slate-600">정보 삭제·수정 요청</Link>
            <Link href="/opt-out?type=takedown" className="hover:text-slate-600">권리침해 신고</Link>
            <Link href="/faq#what-is-jeongbo-deungrok" className="hover:text-slate-600">Packlinx 자체 등록 기준 안내</Link>
          </div>
          <div className="flex justify-center">
            <BusinessRegistrationInfo theme="light" />
          </div>
        </div>
      </footer>
    </div>
  )
}
