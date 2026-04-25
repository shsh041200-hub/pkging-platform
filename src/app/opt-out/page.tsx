import Link from 'next/link'
import type { Metadata } from 'next'
import { PacklinxLogo } from '@/components/PacklinxLogo'
import OptOutForm from './OptOutForm'
import { TermsNoticeFooterLine } from '@/components/TermsNoticeFooterLine'
import { BusinessRegistrationInfo } from '@/components/BusinessRegistrationInfo'

export const metadata: Metadata = {
  title: '정보 삭제·수정·권리침해 신고 — Packlinx',
  description: 'Packlinx에 등록된 업체 정보의 삭제·수정 요청 또는 권리침해(임시조치) 신고를 접수할 수 있습니다.',
}

type Props = {
  searchParams: Promise<{ type?: string }>
}

function resolveInitialType(raw: string | undefined): 'delete' | 'update' | 'takedown' | undefined {
  if (raw === 'delete' || raw === 'update' || raw === 'takedown') return raw
  return undefined
}

export default async function OptOutPage({ searchParams }: Props) {
  const params = await searchParams
  const initialType = resolveInitialType(params.type)
  const isTakedownMode = initialType === 'takedown'

  return (
    <div className="min-h-screen bg-slate-50">
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

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10 pb-16">
        {isTakedownMode ? (
          <>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">권리침해 신고</h1>
            <p className="text-sm text-slate-500 mb-8">
              정보통신망법 제44조의2에 따른 권리침해 임시조치를 신청하실 수 있습니다.
              신고 접수 후 24시간 이내에 임시조치(비공개) 여부를 결정하고, 30일 이내에 종결 결과를 안내드립니다.
            </p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">정보 삭제·수정 요청</h1>
            <p className="text-sm text-slate-500 mb-8">
              Packlinx에 등록된 귀사 정보의 삭제 또는 수정을 요청하실 수 있습니다.
              접수 후 10영업일 이내에 처리 결과를 이메일로 안내드립니다.
            </p>
          </>
        )}

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8 text-sm text-amber-800">
          <p className="font-medium mb-1">이메일로 직접 요청하실 수 있습니다</p>
          <p>
            <a href="mailto:legal@pkging.kr" className="underline font-medium">
              legal@pkging.kr
            </a>
            으로 업체명과 요청 내용을 보내주시면 동일하게 처리해 드립니다.
          </p>
        </div>

        <OptOutForm initialType={initialType} />
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <TermsNoticeFooterLine theme="light" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-wrap gap-4 text-xs text-slate-400 justify-center mb-3">
            <Link href="/" className="hover:text-slate-600">홈</Link>
            <Link href="/privacy" className="hover:text-slate-600">개인정보처리방침</Link>
            <Link href="/terms" className="hover:text-slate-600">이용약관</Link>
            <Link href="/opt-out" className="hover:text-slate-600 font-medium text-slate-600">정보 삭제·수정 요청</Link>
            <Link href="/opt-out?type=takedown" className="hover:text-slate-600">권리침해 신고</Link>
          </div>
          <div className="flex justify-center">
            <BusinessRegistrationInfo theme="light" />
          </div>
        </div>
      </footer>
    </div>
  )
}
