import type { Metadata } from 'next'
import Link from 'next/link'
import { SiteHeader } from '@/components/SiteHeader'
import { PacklinxLogo } from '@/components/PacklinxLogo'
import { BusinessRegistrationInfo } from '@/components/BusinessRegistrationInfo'

export const revalidate = 86400

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.packlinx.com').replace(/\/$/, '')
const canonicalUrl = `${siteUrl}/blog`

export const metadata: Metadata = {
  title: '패키징 블로그 — 트렌드·실무 인사이트 | Packlinx',
  description: '2026 패키징 트렌드, RFQ 견적 요청 가이드 등 포장재 구매 담당자를 위한 실무 인사이트.',
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: '패키징 블로그 | Packlinx',
    description: '포장재 구매 담당자를 위한 패키징 트렌드·실무 인사이트',
    url: canonicalUrl,
    siteName: 'Packlinx',
    locale: 'ko_KR',
    type: 'website',
  },
}

const POSTS = [
  {
    slug: '2026-korea-packaging-trends',
    title: '2026 한국 패키징 트렌드: 구매 담당자가 알아야 할 7가지 변화',
    description: 'EPR 규제 강화·친환경 전환·스마트 패키징·이커머스 포장 변화·원자재 가격 대응 전략을 구매 담당자 시각에서 정리합니다.',
    date: '2026-05-07',
    readingTime: '8분',
  },
  {
    slug: 'packaging-rfq-guide',
    title: '포장 업체 견적 요청 완전 가이드 — RFQ 준비부터 업체 선정까지 (2026)',
    description: '포장재 견적 요청(RFQ) 전 꼭 알아야 할 7가지 — 수량·소재·납기 정보 준비법부터 복수 업체 비교 선정 기준까지',
    date: '2026-05-08',
    readingTime: '7분',
  },
]

const collectionJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Blog',
  '@id': canonicalUrl,
  name: '패키징 블로그',
  description: '포장재 구매 담당자를 위한 패키징 트렌드·실무 인사이트',
  url: canonicalUrl,
  inLanguage: 'ko',
  isPartOf: { '@type': 'WebSite', name: 'Packlinx', url: siteUrl },
  blogPost: POSTS.map((p) => ({
    '@type': 'BlogPosting',
    headline: p.title,
    description: p.description,
    url: `${siteUrl}/blog/${p.slug}`,
    datePublished: p.date,
    inLanguage: 'ko',
    author: { '@type': 'Organization', name: 'Packlinx', url: siteUrl },
  })),
}

export default function BlogIndexPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      <SiteHeader />

      {/* Hero */}
      <section className="bg-neutral-900 border-b border-white/[0.06] py-12 px-5 sm:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-[28px] sm:text-[36px] font-bold text-white leading-tight tracking-[-0.02em] mb-3">
            패키징 블로그
          </h1>
          <p className="text-slate-400 text-[15px] leading-relaxed">
            포장재 구매 담당자를 위한 트렌드 분석·실무 가이드·업체 선정 인사이트
          </p>
        </div>
      </section>

      {/* Post list */}
      <main className="flex-1 max-w-3xl mx-auto w-full px-5 sm:px-8 py-12">
        <div className="space-y-5">
          {POSTS.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group block bg-white border border-gray-200 rounded-xl px-6 py-5 hover:border-stripe-purple/40 hover:shadow-[0_4px_16px_var(--color-stripe-purple-tint)] transition-all duration-150"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="text-[16px] font-semibold text-gray-900 group-hover:text-stripe-purple transition-colors leading-snug mb-2">
                    {post.title}
                  </h2>
                  <p className="text-[13px] text-gray-500 leading-relaxed line-clamp-2">
                    {post.description}
                  </p>
                  <div className="flex items-center gap-3 mt-3">
                    <span className="text-[12px] text-gray-400">{post.date}</span>
                    <span className="text-gray-300">·</span>
                    <span className="text-[12px] text-gray-400">읽는 시간 {post.readingTime}</span>
                  </div>
                </div>
                <svg
                  className="w-5 h-5 text-gray-300 group-hover:text-stripe-purple flex-shrink-0 mt-1 transition-colors"
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-[13px] text-gray-400 mb-4">패키징 업체를 찾고 계신가요?</p>
          <Link
            href="/categories"
            className="inline-flex items-center gap-2 bg-stripe-purple hover:bg-stripe-purple-hover text-white font-semibold px-6 py-3 rounded-lg text-[14px] transition-colors"
          >
            업체 카테고리 보기
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] bg-neutral-900 mt-auto">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-col gap-2">
              <PacklinxLogo variant="dark" layout="horizontal" />
              <p className="text-[12px] text-slate-400 leading-relaxed">
                © 2026 PACKLINX. 본 서비스의 업체 정보는 공개된 출처에서 자동 수집되었습니다.<br className="hidden sm:inline" />
                정보 오류·삭제 요청: rpdla041200@gmail.com
              </p>
              <BusinessRegistrationInfo theme="dark" />
            </div>
            <div className="flex gap-5 text-[12px] text-slate-400">
              <Link href="/guides" className="hover:text-slate-200 transition-colors">패키징 가이드</Link>
              <Link href="/privacy" className="hover:text-slate-200 transition-colors">개인정보처리방침</Link>
              <Link href="/terms" className="hover:text-slate-200 transition-colors">이용약관</Link>
              <Link href="/opt-out?type=takedown" className="hover:text-slate-200 transition-colors">권리침해 신고</Link>
              <Link href="/faq#what-is-jeongbo-deungrok" className="hover:text-slate-200 transition-colors">Packlinx 자체 등록 기준 안내</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
