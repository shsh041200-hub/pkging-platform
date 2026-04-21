import type { Metadata } from 'next'
import './globals.css'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://packlinx.com'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'BOXTER — 국내 B2B 포장업체 디렉토리',
    template: '%s | BOXTER',
  },
  description: '전국 패키징 업체를 한눈에. 식품·산업용·친환경 포장재 B2B 파트너 찾기.',
  keywords: '패키징, 포장재, 박스, 식품포장, 친환경포장, 산업용포장, BOXTER, 박스터, packlinx',
  icons: {
    icon: '/boxter-favicon.svg',
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'BOXTER — 국내 B2B 포장업체 디렉토리',
    description: '전국 패키징 업체를 한눈에. 식품·산업용·친환경 포장재 B2B 파트너 찾기.',
    url: siteUrl,
    siteName: 'BOXTER',
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BOXTER — 국내 B2B 포장업체 디렉토리',
    description: '전국 패키징 업체를 한눈에. 식품·산업용·친환경 포장재 B2B 파트너 찾기.',
  },
  verification: {
    google: '_GGnVSZzAe6F2EM9dnt4z7PIMimex08aUukQZzAxN7c',
    other: {
      'naver-site-verification': '61dbcdceef233109c8f6544378cd3884448d161e',
    },
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className="h-full">
      <body className="min-h-full flex flex-col antialiased">
        {children}
      </body>
    </html>
  )
}
