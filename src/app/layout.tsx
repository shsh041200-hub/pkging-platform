import type { Metadata } from 'next'
import localFont from 'next/font/local'
import { Suspense } from 'react'
import { PageViewTracker } from '@/components/PageViewTracker'
import './globals.css'

const pretendard = localFont({
  src: '../../public/fonts/PretendardVariable.woff2',
  display: 'swap',
  weight: '100 900',
  variable: '--font-pretendard',
  fallback: [
    '-apple-system',
    'BlinkMacSystemFont',
    'Apple SD Gothic Neo',
    'Malgun Gothic',
    'sans-serif',
  ],
})

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://packlinx.com'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: '전국 패키징 업체 찾기 — B2B 포장재 플랫폼 | Packlinx',
    template: '%s | Packlinx',
  },
  description: '국내 1,396개 패키징 업체를 무료로 검색·비교하세요. 식품·화장품·이커머스·친환경 포장재 B2B 플랫폼 Packlinx.',
  keywords: '패키징, 포장재, 박스, 식품포장, 친환경포장, 산업용포장, Packlinx, packlinx',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.svg',
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: '전국 패키징 업체 찾기 — B2B 포장재 플랫폼 | Packlinx',
    description: '국내 1,396개 패키징 업체를 무료로 검색·비교하세요. 식품·화장품·이커머스·친환경 포장재 B2B 플랫폼 Packlinx.',
    url: siteUrl,
    siteName: 'Packlinx',
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '전국 패키징 업체 찾기 — B2B 포장재 플랫폼 | Packlinx',
    description: '국내 1,396개 패키징 업체를 무료로 검색·비교하세요. 식품·화장품·이커머스·친환경 포장재 B2B 플랫폼 Packlinx.',
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
    <html lang="ko" className={`h-full ${pretendard.variable}`}>
      <body className="min-h-full flex flex-col antialiased">
        <Suspense fallback={null}>
          <PageViewTracker />
        </Suspense>
        {children}
      </body>
    </html>
  )
}
