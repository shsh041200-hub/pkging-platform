import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { PacklinxLogo } from '@/components/PacklinxLogo'
import {
  INDUSTRY_CATEGORIES,
  INDUSTRY_CATEGORY_LABELS,
  type IndustryCategory,
  type BlogPost,
} from '@/types'
import { createClient } from '@/lib/supabase/server'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://packlinx.com'

export const metadata: Metadata = {
  title: '패키징 완전 가이드 — 소재별·용도별 심층 가이드 | Packlinx',
  description: '종이, 플라스틱, 친환경 포장재까지 — 소재별·용도별로 깊이 있는 패키징 가이드를 제공합니다.',
  alternates: { canonical: '/guides' },
  openGraph: {
    title: '패키징 완전 가이드 — 소재별·용도별 심층 가이드 | Packlinx',
    description: '종이, 플라스틱, 친환경 포장재까지 — 소재별·용도별로 깊이 있는 패키징 가이드를 제공합니다.',
    url: `${siteUrl}/guides`,
    type: 'website',
  },
}

const guidesJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Blog',
  name: '패키징 완전 가이드',
  description: '종이, 플라스틱, 친환경 포장재까지 — 소재별·용도별로 깊이 있는 패키징 가이드를 제공합니다.',
  url: `${siteUrl}/guides`,
  publisher: {
    '@type': 'Organization',
    name: 'Packlinx',
    url: siteUrl,
  },
  inLanguage: 'ko',
}

type Props = {
  searchParams: Promise<{ category?: string }>
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const GUIDE_CATEGORIES: Array<{ key: string; label: string }> = [
  { key: 'all', label: '전체' },
  ...INDUSTRY_CATEGORIES.map((k) => ({ key: k, label: INDUSTRY_CATEGORY_LABELS[k] })),
]

export default async function GuidesListPage({ searchParams }: Props) {
  const { category } = await searchParams
  const activeCategory = category && INDUSTRY_CATEGORIES.includes(category as IndustryCategory)
    ? (category as IndustryCategory)
    : null

  const supabase = await createClient()
  let query = supabase
    .from('blog_posts')
    .select('id, slug, title, excerpt, cover_image_url, category, published_at')
    .eq('status', 'published')
    .eq('content_type', 'guide')
    .order('published_at', { ascending: false })

  if (activeCategory) {
    query = query.eq('category', activeCategory)
  }

  const { data: guides } = await query

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(guidesJsonLd) }}
      />

      {/* Header */}
      <header className="bg-white sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <PacklinxLogo variant="light" />
            <span className="hidden sm:inline text-gray-300 text-[11px] font-medium tracking-widest uppercase">전국 패키징 파트너, 한 번에</span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/guides" className="text-gray-900 text-[13px] font-semibold">
              가이드
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-[#FFF8F3] bg-dot-grid border-b border-orange-100 pt-12 pb-14 sm:pt-16 sm:pb-18 px-5">
        <div className="max-w-3xl mx-auto">
          <nav className="text-sm text-gray-400 mb-6">
            <Link href="/" className="hover:text-gray-600 transition-colors">홈</Link>
            <span className="mx-2">&rsaquo;</span>
            <span className="text-gray-700 font-medium">패키징 완전 가이드</span>
          </nav>
          <div className="inline-block text-[11px] font-semibold tracking-widest uppercase text-[#F97316] bg-[#FFF3E8] px-3 py-1.5 rounded-full mb-4">
            심층 패키징 가이드
          </div>
          <h1 className="text-[32px] sm:text-[42px] font-extrabold text-gray-900 leading-[1.1] tracking-[-0.04em] mb-3">
            패키징 완전 가이드
          </h1>
          <p className="text-gray-500 text-[16px] leading-relaxed max-w-lg">
            소재별·용도별 심층 분석 — B2B 패키징 구매 결정을 위한 완전 가이드.
          </p>
        </div>
      </section>

      {/* Category Filter */}
      <div className="bg-white border-b border-gray-100 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="flex gap-1 py-3 overflow-x-auto scrollbar-none">
            {GUIDE_CATEGORIES.map(({ key, label }) => {
              const isActive = key === 'all' ? !activeCategory : activeCategory === key
              const href = key === 'all' ? '/guides' : `/guides?category=${key}`
              return (
                <Link
                  key={key}
                  href={href}
                  className={`flex-shrink-0 px-3.5 py-1.5 rounded-md text-[13px] font-medium transition-all ${
                    isActive
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  {label}
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      {/* Guides Grid */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 py-10">
        {guides && guides.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {guides.map((guide: Pick<BlogPost, 'id' | 'slug' | 'title' | 'excerpt' | 'cover_image_url' | 'category' | 'published_at'>) => (
              <article
                key={guide.id}
                className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-gray-300 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08),0_2px_4px_rgba(0,0,0,0.04)] hover:-translate-y-px transition-all duration-200 group"
              >
                {guide.cover_image_url ? (
                  <div className="relative w-full aspect-[16/9] overflow-hidden bg-gray-100">
                    <Image
                      src={guide.cover_image_url}
                      alt={guide.title}
                      fill
                      className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                ) : (
                  <div className="w-full aspect-[16/9] bg-gradient-to-br from-[#FFF3E8] to-[#FFF8F3] flex items-center justify-center">
                    <span className="text-4xl opacity-40">📚</span>
                  </div>
                )}
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2.5">
                    {guide.category && (
                      <span className="text-[11px] font-semibold text-[#F97316] bg-[#FFF3E8] px-2 py-0.5 rounded">
                        {INDUSTRY_CATEGORY_LABELS[guide.category as IndustryCategory]}
                      </span>
                    )}
                    {guide.published_at && (
                      <span className="text-[11px] text-gray-400">{formatDate(guide.published_at)}</span>
                    )}
                  </div>
                  <h2 className="text-[15px] font-bold text-gray-900 leading-snug tracking-[-0.02em] line-clamp-2 mb-2">
                    <Link href={`/guides/${guide.slug}`} className="hover:text-[#F97316] transition-colors">
                      {guide.title}
                    </Link>
                  </h2>
                  {guide.excerpt && (
                    <p className="text-[13px] text-gray-500 leading-relaxed line-clamp-2">
                      {guide.excerpt}
                    </p>
                  )}
                  <div className="mt-4">
                    <Link
                      href={`/guides/${guide.slug}`}
                      className="text-[12px] font-semibold text-[#F97316] hover:underline underline-offset-2"
                    >
                      가이드 보기 &rarr;
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="text-center py-24">
            <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-5 h-5 text-orange-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <p className="text-gray-600 font-semibold mb-1.5 text-[15px]">아직 등록된 가이드가 없습니다</p>
            <p className="text-gray-400 text-sm mb-5">곧 심층 패키징 가이드를 발행할 예정입니다.</p>
            <Link href="/" className="text-sm text-gray-900 font-medium hover:underline underline-offset-4">
              업체 탐색하기 &rarr;
            </Link>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white mt-auto py-8">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-col gap-2">
              <PacklinxLogo variant="light" layout="horizontal" />
              <p className="text-[12px] text-gray-400 leading-relaxed">
                &copy; 2026 PACKLINX. 본 서비스의 업체 정보는 공개된 출처에서 자동 수집되었습니다.<br className="hidden sm:inline" />
                정보 오류·삭제 요청: privacy@pkging.kr
              </p>
            </div>
            <div className="flex gap-5 text-[12px] text-gray-400">
              <Link href="/guides" className="hover:text-gray-600 transition-colors">패키징 완전 가이드</Link>
              <Link href="/privacy" className="hover:text-gray-600 transition-colors">개인정보처리방침</Link>
              <Link href="/terms" className="hover:text-gray-600 transition-colors">이용약관</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
