import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '패키징 플랫폼 — 전국 패키징 업체 디렉토리',
  description: '전국 패키징 업체를 한눈에. 산업용·식품등급·지류·친환경 등 카테고리별 검색.',
  keywords: '패키징, 포장재, 박스, 식품포장, 친환경포장, 산업용포장',
  openGraph: {
    title: '패키징 플랫폼',
    description: '전국 패키징 업체 디렉토리',
    locale: 'ko_KR',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className="h-full">
      <body className="min-h-full flex flex-col antialiased bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  )
}
