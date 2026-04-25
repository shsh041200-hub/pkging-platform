import type { Metadata } from 'next'
import Link from 'next/link'
import { PacklinxLogo } from '@/components/PacklinxLogo'
import {
  INDUSTRY_CATEGORIES,
  INDUSTRY_CATEGORY_LABELS,
  GUIDE_CATEGORY_COLORS,
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

function calcReadingTime(body: string | null): number {
  if (!body) return 3
  return Math.max(1, Math.ceil(body.length / 500))
}

const GUIDE_CATEGORIES: Array<{ key: string; label: string }> = [
  { key: 'all', label: '전체' },
  ...INDUSTRY_CATEGORIES.map((k) => ({ key: k, label: INDUSTRY_CATEGORY_LABELS[k] })),
]

type GuideRow = Pick<BlogPost, 'id' | 'slug' | 'title' | 'excerpt' | 'body' | 'category' | 'published_at'>

const CATEGORY_BADGE_STYLES: Record<IndustryCategory, { color: string; bg: string }> = {
  'food-beverage':           { color: '#B45309', bg: '#FFFBEB' },
  'ecommerce-shipping':      { color: '#C2410C', bg: '#FFF7ED' },
  'cosmetics-beauty':        { color: '#BE185D', bg: '#FDF2F8' },
  'pharma-health':           { color: '#047857', bg: '#ECFDF5' },
  'electronics-industrial':  { color: '#334155', bg: '#F1F5F9' },
  'eco-special':             { color: '#15803D', bg: '#F0FDF4' },
  'fresh_produce_packaging': { color: '#3F6212', bg: '#F7FEE7' },
  'print_design_services':   { color: '#5B21B6', bg: '#F5F3FF' },
}

export default async function GuidesListPage({ searchParams }: Props) {
  const { category } = await searchParams
  const activeCategory = category && INDUSTRY_CATEGORIES.includes(category as IndustryCategory)
    ? (category as IndustryCategory)
    : null

  const supabase = await createClient()
  let query = supabase
    .from('blog_posts')
    .select('id, slug, title, excerpt, body, category, published_at')
    .eq('status', 'published')
    .eq('content_type', 'guide')
    .order('published_at', { ascending: false })

  if (activeCategory) {
    query = query.eq('category', activeCategory)
  }

  const { data: guides } = await query

  return (
    <div className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(guidesJsonLd) }}
      />

      {/* Header */}
      <header className="bg-[#0F172A] sticky top-0 z-50" style={{ height: 56 }}>
        <div className="max-w-[1120px] mx-auto px-6 h-full flex items-center justify-between">
          <Link href="/" className="flex items-baseline gap-1">
            <PacklinxLogo variant="dark" />
            <span className="hidden sm:inline text-white/30 text-[10px] font-medium tracking-widest uppercase ml-2">
              전국 패키징 파트너, 한 번에
            </span>
          </Link>
          <nav>
            <Link href="/guides" className="text-white/70 hover:text-white text-[14px] font-medium transition-colors">
              가이드
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-[1024px] mx-auto px-6 pt-12 pb-10 sm:pt-14 sm:pb-12">
        <nav className="text-[13px] text-slate-500 mb-4">
          <Link href="/" className="hover:text-slate-700 transition-colors">홈</Link>
          <span className="mx-1.5 text-slate-300">›</span>
          <span className="text-slate-700">패키징 완전 가이드</span>
        </nav>
        <h1 className="text-[36px] sm:text-[40px] font-extrabold text-[#0F172A] tracking-[-0.03em] leading-tight mt-4">
          패키징 완전 가이드
        </h1>
        <p className="text-[16px] text-slate-500 leading-relaxed mt-2 max-w-[560px]">
          소재·용도·업종별 심층 분석 — B2B 패키징 구매 결정을 위한 전문 가이드
        </p>
        {guides && (
          <p className="text-[13px] text-slate-400 font-medium mt-4">
            {guides.length}편의 전문 가이드 · {INDUSTRY_CATEGORIES.length}개 카테고리
          </p>
        )}
      </section>

      {/* Category Filter */}
      <div
        className="border-b border-slate-100 bg-white sticky z-40"
        style={{ top: 56 }}
      >
        <div className="max-w-[1120px] mx-auto px-6 py-3 flex gap-2 overflow-x-auto scrollbar-none">
          {GUIDE_CATEGORIES.map(({ key, label }) => {
            const isActive = key === 'all' ? !activeCategory : activeCategory === key
            const href = key === 'all' ? '/guides' : `/guides?category=${key}`
            return (
              <Link
                key={key}
                href={href}
                className={[
                  'flex-shrink-0 px-4 py-2 text-[14px] font-medium rounded-md transition-all whitespace-nowrap',
                  isActive
                    ? 'bg-[#0F172A] text-white font-semibold'
                    : 'text-[#475569] hover:bg-slate-50',
                ].join(' ')}
              >
                {label}
              </Link>
            )
          })}
        </div>
      </div>

      {/* Guides Grid */}
      <section className="max-w-[1120px] mx-auto px-6 pt-8 pb-16">
        {guides && guides.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {(guides as GuideRow[]).map((guide) => {
              const cat = guide.category as IndustryCategory | null
              const barColor = cat ? GUIDE_CATEGORY_COLORS[cat] : '#E2E8F0'
              const badgeStyle = cat ? CATEGORY_BADGE_STYLES[cat] : null
              const readingTime = calcReadingTime(guide.body)
              return (
                <Link
                  key={guide.id}
                  href={`/guides/${guide.slug}`}
                  className="group block bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-slate-300 hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-all duration-200"
                >
                  {/* Category color bar */}
                  <div style={{ height: 4, background: barColor }} />

                  <div className="p-5">
                    {/* Meta row */}
                    <div className="flex items-center justify-between">
                      {cat && badgeStyle ? (
                        <span
                          className="text-[12px] font-medium px-2 py-1 rounded"
                          style={{ color: badgeStyle.color, background: badgeStyle.bg }}
                        >
                          {INDUSTRY_CATEGORY_LABELS[cat]}
                        </span>
                      ) : (
                        <span />
                      )}
                      <span className="text-[12px] text-slate-400">약 {readingTime}분</span>
                    </div>

                    {/* Title */}
                    <h2 className="text-[16px] font-bold text-[#0F172A] tracking-[-0.015em] leading-snug mt-3 line-clamp-2">
                      {guide.title}
                    </h2>

                    {/* Excerpt */}
                    {guide.excerpt && (
                      <p className="text-[14px] text-slate-500 leading-relaxed mt-2 line-clamp-2">
                        {guide.excerpt}
                      </p>
                    )}

                    {/* Footer */}
                    <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between">
                      <span className="text-[12px] text-slate-400">
                        {guide.published_at ? formatDate(guide.published_at) : ''}
                      </span>
                      <span className="text-[13px] font-semibold text-[#C2410C] group-hover:underline underline-offset-2">
                        가이드 보기 →
                      </span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-24">
            <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-5 h-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <p className="text-slate-600 font-semibold text-[15px] mb-1.5">아직 등록된 가이드가 없습니다</p>
            <p className="text-slate-400 text-sm mb-5">곧 심층 패키징 가이드를 발행할 예정입니다.</p>
            <Link href="/" className="text-sm text-slate-900 font-medium hover:underline underline-offset-4">
              업체 탐색하기 →
            </Link>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-slate-50 py-8">
        <div className="max-w-[1120px] mx-auto px-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-col gap-1.5">
              <PacklinxLogo variant="light" />
              <p className="text-[12px] text-slate-400">
                © 2026 PACKLINX. 본 서비스의 업체 정보는 공개된 출처에서 자동 수집되었습니다.
              </p>
            </div>
            <div className="flex gap-4 text-[12px] text-slate-400">
              <Link href="/guides" className="hover:text-slate-600 transition-colors">패키징 완전 가이드</Link>
              <Link href="/privacy" className="hover:text-slate-600 transition-colors">개인정보처리방침</Link>
              <Link href="/terms" className="hover:text-slate-600 transition-colors">이용약관</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
