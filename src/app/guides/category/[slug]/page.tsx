import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { PacklinxLogo } from '@/components/PacklinxLogo'
import {
  INDUSTRY_CATEGORIES,
  INDUSTRY_CATEGORY_LABELS,
  INDUSTRY_CATEGORY_DESCRIPTIONS,
  GUIDE_CATEGORY_COLORS,
  type IndustryCategory,
  type BlogPost,
} from '@/types'
import { createClient } from '@/lib/supabase/server'
import { getActiveGuideCategories } from '@/lib/guides'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://packlinx.com'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return INDUSTRY_CATEGORIES.map((cat) => ({ slug: cat }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  if (!INDUSTRY_CATEGORIES.includes(slug as IndustryCategory)) return {}

  const cat = slug as IndustryCategory
  const label = INDUSTRY_CATEGORY_LABELS[cat]
  const description = INDUSTRY_CATEGORY_DESCRIPTIONS[cat]

  return {
    title: `${label} 가이드 — 전문 패키징 가이드 모음 | Packlinx`,
    description,
    alternates: { canonical: `/guides/category/${cat}` },
    openGraph: {
      title: `${label} 가이드 | Packlinx`,
      description,
      url: `${siteUrl}/guides/category/${cat}`,
      type: 'website',
    },
  }
}

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

export default async function GuideCategoryPage({ params }: Props) {
  const { slug } = await params

  if (!INDUSTRY_CATEGORIES.includes(slug as IndustryCategory)) {
    notFound()
  }

  const cat = slug as IndustryCategory
  const label = INDUSTRY_CATEGORY_LABELS[cat]
  const description = INDUSTRY_CATEGORY_DESCRIPTIONS[cat]
  const barColor = GUIDE_CATEGORY_COLORS[cat]
  const badgeStyle = CATEGORY_BADGE_STYLES[cat]

  const supabase = await createClient()
  const [{ data }, activeCategories] = await Promise.all([
    supabase
      .from('blog_posts')
      .select('id, slug, title, excerpt, body, category, published_at')
      .eq('status', 'published')
      .eq('content_type', 'guide')
      .eq('category', cat)
      .order('published_at', { ascending: false }),
    getActiveGuideCategories(),
  ])

  const guides = (data ?? []) as GuideRow[]

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${label} 패키징 가이드`,
    description,
    url: `${siteUrl}/guides/category/${cat}`,
    numberOfItems: guides.length,
    itemListElement: guides.map((g, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${siteUrl}/guides/${g.slug}`,
      name: g.title,
    })),
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: '홈', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: '패키징 완전 가이드', item: `${siteUrl}/guides` },
      { '@type': 'ListItem', position: 3, name: label, item: `${siteUrl}/guides/category/${cat}` },
    ],
  }

  return (
    <div className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* Header */}
      <header className="bg-[#0F172A] sticky top-0 z-50 border-b border-white/[0.06]" style={{ height: 56 }}>
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

      {/* Category hero */}
      <section className="max-w-[1024px] mx-auto px-6 pt-12 pb-8 sm:pt-14 sm:pb-10">
        <nav className="text-[13px] text-slate-500 mb-4" aria-label="breadcrumb">
          <Link href="/" className="hover:text-slate-700 transition-colors">홈</Link>
          <span className="mx-1.5 text-slate-300">›</span>
          <Link href="/guides" className="hover:text-slate-700 transition-colors">패키징 완전 가이드</Link>
          <span className="mx-1.5 text-slate-300">›</span>
          <span className="text-slate-700">{label}</span>
        </nav>

        <div className="flex items-center gap-2.5 mt-4">
          <span
            className="inline-block w-3 h-3 rounded-sm"
            style={{ background: barColor }}
          />
          <span
            className="text-[13px] font-medium px-2.5 py-1 rounded"
            style={{ color: badgeStyle.color, background: badgeStyle.bg }}
          >
            {label}
          </span>
        </div>

        <h1 className="text-[32px] sm:text-[38px] font-extrabold text-[#0F172A] tracking-[-0.03em] leading-tight mt-3">
          {label} 가이드
        </h1>
        <p className="text-[15px] text-slate-500 leading-relaxed mt-2 max-w-[560px]">
          {description}
        </p>
        {guides.length > 0 && (
          <p className="text-[13px] text-slate-400 font-medium mt-4">
            {guides.length}편의 가이드
          </p>
        )}
      </section>

      {/* Other categories nav — mirrors the chips on /guides using the same active-category source */}
      <div
        className="border-b border-slate-100 bg-white sticky z-40"
        style={{ top: 56 }}
      >
        <div className="max-w-[1120px] mx-auto px-6 py-3 flex gap-2 overflow-x-auto scrollbar-none">
          <Link
            href="/guides"
            className="flex-shrink-0 px-4 py-2 text-[14px] font-medium rounded-md transition-all whitespace-nowrap text-[#475569] hover:bg-slate-50"
          >
            전체
          </Link>
          {activeCategories.map(({ category: c, count }) => {
            const isActive = c === cat
            return (
              <Link
                key={c}
                href={`/guides/category/${c}`}
                className={[
                  'flex-shrink-0 px-4 py-2 text-[14px] font-medium rounded-md transition-all whitespace-nowrap',
                  isActive
                    ? 'bg-[#0F172A] text-white font-semibold'
                    : 'text-[#475569] hover:bg-slate-50',
                ].join(' ')}
              >
                {INDUSTRY_CATEGORY_LABELS[c]}
                <span className={[
                  'ml-1.5 text-[12px]',
                  isActive ? 'text-white/60' : 'text-slate-400',
                ].join(' ')}>
                  ({count})
                </span>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Guides list */}
      <main className="max-w-[1120px] mx-auto px-6 pt-8 pb-16">
        {guides.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-5 h-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <p className="text-slate-600 font-semibold text-[15px] mb-1.5">
              {label} 카테고리의 가이드를 준비 중입니다
            </p>
            <p className="text-slate-400 text-sm mb-5">
              곧 심층 패키징 가이드를 발행할 예정입니다.
            </p>
            <Link href="/guides" className="text-sm text-slate-900 font-medium hover:underline underline-offset-4">
              전체 가이드 보기 →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {guides.map((guide) => {
              const readingTime = calcReadingTime(guide.body)
              return (
                <Link
                  key={guide.id}
                  href={`/guides/${guide.slug}`}
                  className="group block bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-slate-300 hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-all duration-200"
                >
                  <div style={{ height: 4, background: barColor }} />
                  <div className="p-5">
                    <div className="flex items-center justify-between">
                      <span
                        className="text-[12px] font-medium px-2 py-1 rounded"
                        style={{ color: badgeStyle.color, background: badgeStyle.bg }}
                      >
                        {label}
                      </span>
                      <span className="text-[12px] text-slate-400">약 {readingTime}분</span>
                    </div>
                    <h2 className="text-[16px] font-bold text-[#0F172A] tracking-[-0.015em] leading-snug mt-3 line-clamp-2">
                      {guide.title}
                    </h2>
                    {guide.excerpt && (
                      <p className="text-[14px] text-slate-500 leading-relaxed mt-2 line-clamp-2">
                        {guide.excerpt}
                      </p>
                    )}
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
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] bg-[#0F172A] py-8">
        <div className="max-w-[1120px] mx-auto px-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-col gap-1.5">
              <PacklinxLogo variant="dark" />
              <p className="text-[12px] text-slate-400">
                © 2026 PACKLINX. 본 서비스의 업체 정보는 공개된 출처에서 자동 수집되었습니다.
              </p>
            </div>
            <div className="flex gap-4 text-[12px] text-slate-400">
              <Link href="/guides" className="hover:text-slate-200 transition-colors">패키징 완전 가이드</Link>
              <Link href="/privacy" className="hover:text-slate-200 transition-colors">개인정보처리방침</Link>
              <Link href="/terms" className="hover:text-slate-200 transition-colors">이용약관</Link>
              <Link href="/opt-out?type=takedown" className="hover:text-slate-200 transition-colors">권리침해 신고</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
