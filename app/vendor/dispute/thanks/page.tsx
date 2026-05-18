import type { Metadata } from 'next'
import Link from 'next/link'
import { SiteHeader } from '@/components/SiteHeader'

export const metadata: Metadata = {
  title: '이의제기 접수 완료',
  robots: { index: false, follow: false },
}

type Props = {
  searchParams: Promise<{ receipt?: string }>
}

export default async function DisputeThanksPage({ searchParams }: Props) {
  const params = await searchParams
  const receipt = typeof params.receipt === 'string' ? params.receipt : null

  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader />

      <main className="max-w-xl mx-auto px-4 sm:px-6 py-16 text-center">
        <div className="bg-white rounded-xl border border-slate-200 p-8 sm:p-10" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <div className="w-14 h-14 bg-emerald-50 border border-emerald-200 rounded-full flex items-center justify-center mx-auto mb-5">
            <svg className="w-7 h-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-xl font-bold text-slate-900 mb-2">이의제기가 접수되었습니다</h1>

          {receipt && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 mb-5 mt-4">
              <p className="text-xs text-slate-400 mb-1">접수번호</p>
              <p className="text-lg font-bold text-[#533afd] tracking-wide">{receipt}</p>
              <p className="text-xs text-slate-400 mt-1">증빙 서류 이메일 제목에 이 번호를 포함해 주세요</p>
            </div>
          )}

          <p className="text-sm text-slate-500 leading-relaxed mb-6">
            입력하신 이메일로 접수 확인을 보내드립니다.
            담당팀이 검토 후 영업일 기준 <strong className="text-slate-700">14일</strong> 이내 1차 회신,{' '}
            <strong className="text-slate-700">30일</strong> 이내 최종 처분 결과를 안내드립니다.
          </p>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 text-left">
            <p className="text-xs font-semibold text-amber-700 mb-1">증빙 서류 제출</p>
            <p className="text-xs text-amber-700 leading-relaxed">
              통신판매업 신고증 등 증빙 서류는{' '}
              <a
                href={`mailto:vendor-support@packlinx.com?subject=${encodeURIComponent(`[이의제기 서류] ${receipt ?? ''}`)}`}
                className="underline font-medium"
              >
                vendor-support@packlinx.com
              </a>
              으로 보내주세요. 이메일 제목에 접수번호 <strong>{receipt}</strong>를 포함해 주시면 빠른 처리가 됩니다.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/"
              className="flex-1 text-center text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 py-2.5 rounded-lg transition-colors"
            >
              홈으로
            </Link>
            <Link
              href="/vendor/dispute"
              className="flex-1 text-center text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 py-2.5 rounded-lg transition-colors"
            >
              추가 이의제기
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
