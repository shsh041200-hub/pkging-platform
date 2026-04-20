import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'BOXTER — 국내 B2B 포장업체 디렉토리',
  description: '전국 패키징 업체를 한눈에. 식품·산업용·친환경 포장재 B2B 파트너 찾기.',
  keywords: '패키징, 포장재, 박스, 식품포장, 친환경포장, 산업용포장, BOXTER, 박스터',
  icons: {
    icon: '/boxter-favicon.svg',
  },
  openGraph: {
    title: 'BOXTER',
    description: '국내 B2B 포장업체 디렉토리',
    siteName: 'BOXTER',
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
