import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { LogoGrid } from './LogoGrid';

export const metadata: Metadata = {
  title: 'Packlinx 로고 시안 프리뷰 (로컬 전용)',
  robots: { index: false, follow: false },
};

const UI_TEXT = {
  heading: 'Packlinx 로고 시안 10개',
  subheading: '보드 확정용 로컬 프리뷰 — 프로덕션 배포 금지',
  notice: '이 페이지는 NEXT_PUBLIC_ENABLE_LOGO_PREVIEW=true 환경 변수가 설정된 경우에만 접근 가능합니다. 로고 확정 후 별도 이슈에서 프로덕션에 반영됩니다.',
  instructions: '각 카드 우상단의 토글로 다크 배경을 미리볼 수 있습니다.',
} as const;

export default function LogoPreviewPage() {
  if (process.env.NEXT_PUBLIC_ENABLE_LOGO_PREVIEW !== 'true') {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 mb-4">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-xs font-medium text-amber-700">{UI_TEXT.subheading}</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{UI_TEXT.heading}</h1>
          <p className="text-sm text-gray-500 max-w-2xl">{UI_TEXT.notice}</p>
          <p className="text-xs text-gray-400 mt-2">{UI_TEXT.instructions}</p>
        </div>

        {/* Logo grid */}
        <LogoGrid />
      </div>
    </main>
  );
}
