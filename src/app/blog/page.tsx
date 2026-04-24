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
  title: '패키징 인사이트 블로그 — 트렌드·뉴스·구매 팁',
  description: '패키징 업계 동향, 구매 팁, 업체 소개 등 B2B 패키징 인사이트를 전달합니다.',
  alternates: { canonical: '/blog' },
  openGraph: {
    title: '패키징 인사이트 블로그 — 트렌드·뉴스·구매 팁 | Packlinx',
    description: '패키징 업계 동향, 구매 팁, 업체 소개 등 B2B 패키징 인사이트를 전달합니다.',
    url: `${siteUrl}/blog`,
    type: 'website',
  },
}

const blogJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Blog',
  name: '패키징 인사이트 블로그',
  description: '패키징 업계 동향, 구매 팁, 업체 소개 등 B2B 패키징 인사이트를 전달합니다.',
  url: `${siteUrl}/blog`,
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

const BLOG_CATEGORIES: Array<{ key: string; label: string }> = [
  { key: 'all', label: '전체' },
  ...INDUSTRY_CATEGORIES.map((k) => ({ key: k, label: INDUSTRY_CATEGORY_LABELS[k] })),
]

export default async function BlogListPage({ searchParams }: Props) {
  const { category } = await searchParams
  const activeCategory = category && INDUSTRY_CATEGORIES.includes(category as IndustryCategory)
    ? (category as IndustryCategory)
    : null

  const supabase = await createClient()
  let query = supabase
    .from('blog_posts')
    .select('id, slug, title, excerpt, cover_image_url, category, published_at')
    .eq('status', 'published')
    .eq('content_type', 'blog')
    .order('published_at', { ascending: false })

  if (activeCategory) {
    query = query.eq('category', activeCategory)
  }

  const { data: posts } = await query

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd) }}
      />

      {/* Header */}
      <header className="bg-white sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <PacklinxLogo variant="light" />
            <span className="hidden sm:inline text-gray-300 text-[11px] font-medium tracking-widest uppercase">전국 패키징 파트너, 한 번에</span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/guides" className="text-gray-500 hover:text-gray-900 text-[13px] font-medium transition-colors">
              가이드
            </Link>
            <Link href="/blog" className="text-gray-900 text-[13px] font-semibold">
              블로그
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-[#F8FAFC] bg-dot-grid border-b border-gray-100 pt-12 pb-14 sm:pt-16 sm:pb-18 px-5">
        <div className="max-w-3xl mx-auto">
          <nav className="text-sm text-gray-400 mb-6">
            <Link href="/" className="hover:text-gray-600 transition-colors">홈</Link>
            <span className="mx-2">&rsaquo;</span>
            <span className="text-gray-700 font-medium">블로그</span>
          </nav>
          <div className="inline-block text-[11px] font-semibold tracking-widest uppercase text-[#005EFF] bg-[#EBF2FF] px-3 py-1.5 rounded-full mb-4">
            B2B 패키징 인사이트
          </div>
          <h1 className="text-[32px] sm:text-[42px] font-extrabold text-gray-900 leading-[1.1] tracking-[-0.04em] mb-3">
            패키징 인사이트
          </h1>
          <p className="text-gray-500 text-[16px] leading-relaxed max-w-lg">
            패키징 업계 트렌드, 구매 팁, 업체 소개 — B2B 패키징 인사이트를 전달합니다.
          </p>
        </div>
      </section>

      {/* Category Filter */}
      <div className="bg-white border-b border-gray-100 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="flex gap-1 py-3 overflow-x-auto scrollbar-none">
            {BLOG_CATEGORIES.map(({ key, label }) => {
              const isActive = key === 'all' ? !activeCategory : activeCategory === key
              const href = key === 'all' ? '/blog' : `/blog?category=${key}`
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

      {/* Posts Grid */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 py-10">
        {posts && posts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post: Pick<BlogPost, 'id' | 'slug' | 'title' | 'excerpt' | 'cover_image_url' | 'category' | 'published_at'>) => (
              <article
                key={post.id}
                className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-gray-300 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08),0_2px_4px_rgba(0,0,0,0.04)] hover:-translate-y-px transition-all duration-200 group"
              >
                {post.cover_image_url ? (
                  <div className="relative w-full aspect-[16/9] overflow-hidden bg-gray-100">
                    <Image
                      src={post.cover_image_url}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                ) : (
                  <div className="w-full aspect-[16/9] bg-gradient-to-br from-[#EBF2FF] to-[#F0F4FF] flex items-center justify-center">
                    <span className="text-4xl opacity-40">📦</span>
                  </div>
                )}
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2.5">
                    {post.category && (
                      <span className="text-[11px] font-semibold text-[#005EFF] bg-[#EBF2FF] px-2 py-0.5 rounded">
                        {INDUSTRY_CATEGORY_LABELS[post.category as IndustryCategory]}
                      </span>
                    )}
                    {post.published_at && (
                      <span className="text-[11px] text-gray-400">{formatDate(post.published_at)}</span>
                    )}
                  </div>
                  <h2 className="text-[15px] font-bold text-gray-900 leading-snug tracking-[-0.02em] line-clamp-2 mb-2">
                    <Link href={`/blog/${post.slug}`} className="hover:text-[#005EFF] transition-colors">
                      {post.title}
                    </Link>
                  </h2>
                  {post.excerpt && (
                    <p className="text-[13px] text-gray-500 leading-relaxed line-clamp-2">
                      {post.excerpt}
                    </p>
                  )}
                  <div className="mt-4">
                    <Link
                      href={`/blog/${post.slug}`}
                      className="text-[12px] font-semibold text-[#005EFF] hover:underline underline-offset-2"
                    >
                      자세히 보기 &rarr;
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="text-center py-24">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-gray-600 font-semibold mb-1.5 text-[15px]">아직 게시된 글이 없습니다</p>
            <p className="text-gray-400 text-sm mb-5">곧 유익한 패키징 가이드를 발행할 예정입니다.</p>
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
              <Link href="/blog" className="hover:text-gray-600 transition-colors">블로그</Link>
              <Link href="/privacy" className="hover:text-gray-600 transition-colors">개인정보처리방침</Link>
              <Link href="/terms" className="hover:text-gray-600 transition-colors">이용약관</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
