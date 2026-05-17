import type { Metadata } from 'next'
import { SiteHeader } from '@/components/SiteHeader'
import { TermsNoticeFooterLine } from '@/components/TermsNoticeFooterLine'
import { BusinessRegistrationInfo } from '@/components/BusinessRegistrationInfo'
import Link from 'next/link'
import DisputeForm from './DisputeForm'

export const metadata: Metadata = {
  title: '분류 이의제기',
  description: 'Packlinx에 등록된 업체 분류 정보에 이의가 있으시면 이 채널을 통해 정정을 요청하실 수 있습니다.',
  robots: { index: false, follow: false },
}

type Props = {
  searchParams: Promise<{ vendor_id?: string; vendor_name?: string }>
}

export default async function VendorDisputePage({ searchParams }: Props) {
  const params = await searchParams
  const initialVendorId = typeof params.vendor_id === 'string' ? params.vendor_id : undefined
  const initialVendorName = typeof params.vendor_name === 'string'
    ? decodeURIComponent(params.vendor_name)
    : undefined

  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10 pb-16">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">분류 이의제기</h1>
          <p className="text-sm text-slate-500 leading-relaxed">
            Packlinx에 표시된 업체 분류 정보에 이의가 있으시거나 정보가 부정확한 경우 이 채널을 통해 정정을 요청하실 수 있습니다.
            접수 후 영업일 기준 <strong className="text-slate-700">14일</strong> 이내 1차 회신,{' '}
            <strong className="text-slate-700">30일</strong> 이내 최종 처분을 안내드립니다.
          </p>
        </div>

        {/* 이메일 백업 채널 안내 */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8 text-sm text-amber-800">
          <p className="font-medium mb-1">이메일로 직접 이의제기하실 수 있습니다</p>
          <p>
            <a
              href="mailto:vendor-support@packlinx.com"
              className="underline font-medium"
            >
              vendor-support@packlinx.com
            </a>
            으로 업체명·사유·연락처를 보내주시면 동일하게 처리해 드립니다.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <DisputeForm
            initialVendorId={initialVendorId}
            initialVendorName={initialVendorName}
          />
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <TermsNoticeFooterLine theme="light" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-wrap gap-4 text-xs text-slate-400 justify-center mb-3">
            <Link href="/" className="hover:text-slate-600">홈</Link>
            <Link href="/privacy" className="hover:text-slate-600">개인정보처리방침</Link>
            <Link href="/terms" className="hover:text-slate-600">이용약관</Link>
            <Link href="/opt-out" className="hover:text-slate-600">정보 삭제·수정 요청</Link>
            <Link href="/vendor/dispute" className="hover:text-slate-600 font-medium text-slate-600">분류 이의제기</Link>
          </div>
          <div className="flex justify-center">
            <BusinessRegistrationInfo theme="light" />
          </div>
        </div>
      </footer>
    </div>
  )
}
