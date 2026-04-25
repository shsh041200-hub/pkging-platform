import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { remark } from 'remark'
import remarkGfm from 'remark-gfm'
import remarkHtml from 'remark-html'
import { PacklinxLogo } from '@/components/PacklinxLogo'
import { GuideTocDesktop, GuideTocMobile, type TocItem } from '@/components/GuideToc'
import {
  INDUSTRY_CATEGORY_LABELS,
  GUIDE_CATEGORY_COLORS,
  type IndustryCategory,
  type BlogPost,
  type FaqItem,
  type HowToStep,
} from '@/types'
import { createClient } from '@/lib/supabase/server'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://packlinx.com'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug: rawSlug } = await params
  const slug = decodeURIComponent(rawSlug)
  const supabase = await createClient()
  const { data: post } = await supabase
    .from('blog_posts')
    .select('title, excerpt, meta_title, meta_description, og_image_url, cover_image_url')
    .eq('slug', slug)
    .eq('status', 'published')
    .eq('content_type', 'guide')
    .single()

  if (!post) return { title: '가이드를 찾을 수 없습니다' }

  const title = post.meta_title ?? post.title
  const description = post.meta_description ?? post.excerpt ?? ''
  const ogImage = post.og_image_url ?? post.cover_image_url

  return {
    title,
    description,
    alternates: { canonical: `/guides/${slug}` },
    openGraph: {
      title: `${title} | Packlinx`,
      description,
      url: `${siteUrl}/guides/${slug}`,
      type: 'article',
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
    },
  }
}

const HR_RE = /^(-{3,}|\*{3,}|_{3,})\s*$/

function isSeoTrigger(text: string): boolean {
  return /SEO/.test(text) && /(메타|meta)/i.test(text)
}

function removeTrailingHr(result: string[]): void {
  for (let i = result.length - 1; i >= 0; i--) {
    if (result[i].trim() === '') continue
    if (HR_RE.test(result[i])) result.splice(i, 1)
    break
  }
}

function stripSeoMetaBlock(markdown: string): string {
  const lines = markdown.split('\n')
  const result: string[] = []
  let inSeoBlock = false
  let boldMode = false
  let seoHeadingLevel = 0

  for (const line of lines) {
    if (!inSeoBlock) {
      // Heading form: ## SEO 메타 정보 ...
      const headingMatch = line.match(/^(#{1,6})\s+(.*)/)
      if (headingMatch && isSeoTrigger(headingMatch[2])) {
        inSeoBlock = true
        boldMode = false
        seoHeadingLevel = headingMatch[1].length
        removeTrailingHr(result)
        continue
      }
      // Bold-paragraph form: **SEO 메타 정보 (발행 시 적용)**
      if (/^\s*\*\*[^*]*SEO[^*]*(메타|meta)[^*]*\*\*\s*$/i.test(line)) {
        inSeoBlock = true
        boldMode = true
        seoHeadingLevel = 0
        removeTrailingHr(result)
        continue
      }
      result.push(line)
    } else if (boldMode) {
      // Bold mode: skip blank lines and list items; exit on any other content
      if (line.trim() === '' || /^\s*[-*+]\s/.test(line)) continue
      inSeoBlock = false
      result.push(line)
    } else {
      // Heading mode: exit when reaching a heading at the same or higher level
      const m = line.match(/^(#{1,6})\s/)
      if (m && m[1].length <= seoHeadingLevel) {
        inSeoBlock = false
        result.push(line)
      }
    }
  }

  return result.join('\n').trim()
}

async function markdownToHtml(markdown: string): Promise<string> {
  const cleaned = stripSeoMetaBlock(markdown)
  const result = await remark()
    .use(remarkGfm, { singleTilde: false })
    .use(remarkHtml, { sanitize: false })
    .process(cleaned)
  return result.toString()
}

function slugifyHeading(text: string): string {
  return text
    .replace(/<[^>]+>/g, '')
    .toLowerCase()
    .replace(/[^가-힣a-z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 60)
}

function injectHeadingIds(html: string): string {
  const seen = new Map<string, number>()
  return html.replace(/<h([23])([^>]*)>([\s\S]*?)<\/h[23]>/gi, (_, level, attrs, content) => {
    const base = slugifyHeading(content)
    const count = seen.get(base) ?? 0
    seen.set(base, count + 1)
    const id = count === 0 ? base : `${base}-${count}`
    return `<h${level}${attrs} id="${id}">${content}</h${level}>`
  })
}

function extractTocItems(html: string): TocItem[] {
  const items: TocItem[] = []
  const seen = new Map<string, number>()
  const regex = /<h([23])[^>]*id="([^"]*)"[^>]*>([\s\S]*?)<\/h[23]>/gi
  let match
  while ((match = regex.exec(html)) !== null) {
    const level = parseInt(match[1]) as 2 | 3
    const id = match[2]
    const text = match[3].replace(/<[^>]+>/g, '').trim()
    if (id && text) {
      const count = seen.get(id) ?? 0
      seen.set(id, count + 1)
      items.push({ id, text, level })
    }
  }
  return items
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

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

export default async function GuidePostPage({ params }: Props) {
  const { slug: rawSlug } = await params
  const slug = decodeURIComponent(rawSlug)
  const supabase = await createClient()

  const { data: post } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .eq('content_type', 'guide')
    .single()

  if (!post) notFound()

  const typedPost = post as BlogPost

  const rawHtml = typedPost.body ? await markdownToHtml(typedPost.body) : ''
  const contentHtml = injectHeadingIds(rawHtml)
  const tocItems = extractTocItems(contentHtml)

  const { data: relatedGuides } = typedPost.category
    ? await supabase
        .from('blog_posts')
        .select('id, slug, title, excerpt, category, published_at')
        .eq('status', 'published')
        .eq('content_type', 'guide')
        .eq('category', typedPost.category)
        .neq('slug', slug)
        .order('published_at', { ascending: false })
        .limit(2)
    : { data: [] }

  const categoryLabel = typedPost.category
    ? INDUSTRY_CATEGORY_LABELS[typedPost.category as IndustryCategory]
    : null

  const cat = typedPost.category as IndustryCategory | null
  const barColor = cat ? GUIDE_CATEGORY_COLORS[cat] : '#E2E8F0'
  const badgeStyle = cat ? CATEGORY_BADGE_STYLES[cat] : null
  const targetAudience = typedPost.target_audience as string[] | null

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: typedPost.title,
    description: typedPost.excerpt ?? '',
    url: `${siteUrl}/guides/${slug}`,
    datePublished: typedPost.published_at ?? typedPost.created_at,
    dateModified: typedPost.updated_at,
    author: { '@type': 'Person', name: typedPost.author },
    publisher: { '@type': 'Organization', name: 'Packlinx', url: siteUrl },
    ...(typedPost.og_image_url || typedPost.cover_image_url
      ? { image: typedPost.og_image_url ?? typedPost.cover_image_url }
      : {}),
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Packlinx', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: '패키징 완전 가이드', item: `${siteUrl}/guides` },
      { '@type': 'ListItem', position: 3, name: typedPost.title, item: `${siteUrl}/guides/${slug}` },
    ],
  }

  const faqItems = typedPost.faq_items as FaqItem[] | null
  const faqJsonLd = faqItems && faqItems.length > 0
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqItems.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: { '@type': 'Answer', text: item.answer },
        })),
      }
    : null

  const howtoSteps = typedPost.howto_steps as HowToStep[] | null
  const howtoJsonLd = howtoSteps && howtoSteps.length > 0
    ? {
        '@context': 'https://schema.org',
        '@type': 'HowTo',
        name: typedPost.title,
        description: typedPost.excerpt ?? '',
        step: howtoSteps.map((step, i) => ({
          '@type': 'HowToStep',
          position: i + 1,
          name: step.name,
          text: step.text,
        })),
      }
    : null

  return (
    <div className="min-h-screen bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      {faqJsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      )}
      {howtoJsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howtoJsonLd) }} />
      )}

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

      {/* Two-column layout */}
      <div className="max-w-[1120px] mx-auto px-6 lg:grid lg:grid-cols-[1fr_240px] lg:gap-12">
        {/* Main content */}
        <main className="py-10 min-w-0 pb-16">

          {/* Breadcrumb */}
          <nav className="text-[13px] text-slate-500">
            <Link href="/" className="hover:text-slate-700 transition-colors">홈</Link>
            <span className="mx-1.5 text-slate-300">›</span>
            <Link href="/guides" className="hover:text-slate-700 transition-colors">패키징 완전 가이드</Link>
            <span className="mx-1.5 text-slate-300">›</span>
            <span className="text-slate-700 line-clamp-1">{typedPost.title}</span>
          </nav>

          {/* Article meta */}
          <div className="flex flex-wrap items-center gap-2 mt-5">
            {cat && badgeStyle && (
              <span
                className="text-[12px] font-medium px-2 py-1 rounded"
                style={{ color: badgeStyle.color, background: badgeStyle.bg }}
              >
                {categoryLabel}
              </span>
            )}
            <span className="text-[12px] font-medium px-2 py-1 rounded text-slate-500 bg-slate-100">
              심층 가이드
            </span>
            {typedPost.published_at && (
              <>
                <span className="text-slate-300 text-[12px]">·</span>
                <time className="text-[12px] text-slate-400" dateTime={typedPost.published_at}>
                  {formatDate(typedPost.published_at)}
                </time>
              </>
            )}
            {typedPost.author && (
              <>
                <span className="text-slate-300 text-[12px]">·</span>
                <span className="text-[12px] text-slate-400">by {typedPost.author}</span>
              </>
            )}
          </div>

          {/* Title */}
          <h1 className="text-[28px] sm:text-[32px] font-extrabold text-[#0F172A] tracking-[-0.025em] leading-[1.25] mt-4">
            {typedPost.title}
          </h1>

          {/* Lead / excerpt */}
          {typedPost.excerpt && (
            <p className="text-[16px] text-slate-500 leading-[1.7] mt-3 max-w-[640px]">
              {typedPost.excerpt}
            </p>
          )}

          {/* Target audience box */}
          {targetAudience && targetAudience.length > 0 && (
            <div className="mt-6 bg-slate-50 border border-slate-200 rounded-lg px-6 py-5">
              <p className="text-[13px] font-semibold text-slate-700 mb-2">이런 분들께 추천합니다</p>
              <ul className="space-y-1.5">
                {targetAudience.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-[14px] text-slate-500 leading-relaxed">
                    <span className="text-[#C2410C] font-semibold mt-px flex-shrink-0">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Mobile TOC */}
          <div className="lg:hidden">
            <GuideTocMobile items={tocItems} />
          </div>

          {/* Key summary */}
          {typedPost.excerpt && (
            <div className="my-8 bg-[rgba(249,115,22,0.05)] border-l-[3px] border-[#F97316] rounded-r-lg px-6 py-5">
              <p className="text-[13px] font-bold text-[#C2410C] tracking-wide mb-2">핵심 요약</p>
              <p className="text-[14px] font-medium text-slate-700 leading-[1.7]">
                {typedPost.excerpt}
              </p>
            </div>
          )}

          {/* Article body */}
          {contentHtml ? (
            <article
              className="guide-body mt-2"
              dangerouslySetInnerHTML={{ __html: contentHtml }}
            />
          ) : (
            <p className="text-slate-400 text-center py-12">본문 콘텐츠가 없습니다.</p>
          )}

          {/* FAQ Section */}
          {faqItems && faqItems.length > 0 && (
            <section className="mt-12 border-t border-slate-100 pt-10">
              <h2 className="text-[20px] font-extrabold text-[#0F172A] tracking-tight mb-6">
                자주 묻는 질문
              </h2>
              <dl className="space-y-4">
                {faqItems.map((item, index) => (
                  <div key={index} className="border border-slate-200 rounded-xl p-5">
                    <dt className="text-[15px] font-bold text-slate-900 mb-2">Q. {item.question}</dt>
                    <dd className="text-[14px] text-slate-600 leading-relaxed">{item.answer}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          {/* Bottom CTA */}
          {typedPost.category && (
            <div className="mt-12 bg-slate-50 border border-slate-200 rounded-xl p-8">
              <p className="text-[12px] font-medium text-slate-400 tracking-wide uppercase mb-2">
                {categoryLabel} 업체 탐색
              </p>
              <h3 className="text-[20px] font-bold text-[#0F172A] mt-2">
                관련 업체를 지금 바로 찾아보세요
              </h3>
              <p className="text-[14px] text-slate-500 mt-2">
                Packlinx에서 검증된 {categoryLabel} 전문 업체를 한눈에 비교하세요.
              </p>
              <Link
                href={`/categories/${typedPost.category}`}
                className="inline-block mt-4 bg-[#C2410C] hover:bg-[#9A3412] text-white text-[14px] font-semibold px-5 py-2.5 rounded-lg transition-colors"
              >
                관련 업체 찾기 →
              </Link>
            </div>
          )}

          {/* Related Guides */}
          {relatedGuides && relatedGuides.length > 0 && (
            <section className="mt-12 pb-8">
              <h3 className="text-[18px] font-bold text-[#0F172A] mb-4">관련 가이드</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(relatedGuides as Pick<BlogPost, 'id' | 'slug' | 'title' | 'excerpt' | 'category' | 'published_at'>[]).map((related) => {
                  const relCat = related.category as IndustryCategory | null
                  const relBarColor = relCat ? GUIDE_CATEGORY_COLORS[relCat] : '#E2E8F0'
                  const relBadge = relCat ? CATEGORY_BADGE_STYLES[relCat] : null
                  return (
                    <Link
                      key={related.id}
                      href={`/guides/${related.slug}`}
                      className="group block bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-slate-300 hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-all duration-200"
                    >
                      <div style={{ height: 3, background: relBarColor }} />
                      <div className="p-4">
                        <div className="flex items-center justify-between">
                          {relCat && relBadge && (
                            <span
                              className="text-[11px] font-medium px-1.5 py-0.5 rounded"
                              style={{ color: relBadge.color, background: relBadge.bg }}
                            >
                              {INDUSTRY_CATEGORY_LABELS[relCat]}
                            </span>
                          )}
                          {related.published_at && (
                            <span className="text-[11px] text-slate-400">{formatDate(related.published_at)}</span>
                          )}
                        </div>
                        <h4 className="text-[14px] font-bold text-[#0F172A] leading-snug mt-2 line-clamp-2">
                          {related.title}
                        </h4>
                        {related.excerpt && (
                          <p className="text-[13px] text-slate-500 mt-1 line-clamp-2">{related.excerpt}</p>
                        )}
                      </div>
                    </Link>
                  )
                })}
              </div>
            </section>
          )}
        </main>

        {/* Desktop TOC sidebar */}
        <aside className="hidden lg:block" style={{ paddingTop: 80 }}>
          <GuideTocDesktop items={tocItems} />
        </aside>
      </div>

      {/* Mid-page CTA (full-width, outside grid) */}
      {typedPost.category && (
        <div className="bg-[#0F172A] px-6 py-10 -mt-4">
          <div className="max-w-[1120px] mx-auto">
            <h3 className="text-[18px] font-bold text-white">
              {categoryLabel} 공급업체, 한 번에 비교하세요
            </h3>
            <p className="text-[14px] text-slate-400 mt-2">
              Packlinx에서 검증된 {categoryLabel} 전문 포장 업체를 한눈에 비교하세요.
            </p>
            <Link
              href={`/categories/${typedPost.category}`}
              className="inline-block mt-4 bg-[#C2410C] hover:bg-[#9A3412] text-white text-[14px] font-semibold px-6 py-2.5 rounded-lg transition-colors"
            >
              업체 비교하기 →
            </Link>
          </div>
        </div>
      )}

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

      {/* Guide body prose styles */}
      <style>{`
        .guide-body h2 {
          font-size: 22px;
          font-weight: 700;
          color: #0F172A;
          letter-spacing: -0.02em;
          margin-top: 48px;
          margin-bottom: 16px;
          padding-bottom: 12px;
          border-bottom: 1px solid #F1F5F9;
        }
        .guide-body h2:first-child { margin-top: 0; }
        .guide-body h3 {
          font-size: 17px;
          font-weight: 600;
          color: #1E293B;
          margin-top: 32px;
          margin-bottom: 12px;
        }
        .guide-body p {
          font-size: 15px;
          color: #334155;
          line-height: 1.8;
          margin-bottom: 16px;
        }
        .guide-body ul, .guide-body ol {
          font-size: 15px;
          color: #334155;
          line-height: 1.8;
          padding-left: 20px;
          margin-bottom: 16px;
        }
        .guide-body li { margin-bottom: 6px; }
        .guide-body li::marker { color: #94A3B8; }
        .guide-body strong { color: #0F172A; font-weight: 600; }
        .guide-body a { color: #C2410C; text-decoration: none; }
        .guide-body a:hover { text-decoration: underline; }
        .guide-body table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          border: 1px solid #E2E8F0;
          border-radius: 8px;
          overflow: hidden;
          margin: 24px 0;
          font-size: 14px;
        }
        .guide-body th {
          background: #F8FAFC;
          font-size: 13px;
          font-weight: 600;
          color: #475569;
          padding: 10px 16px;
          text-align: left;
          border-bottom: 1px solid #E2E8F0;
        }
        .guide-body td {
          padding: 10px 16px;
          color: #334155;
          border-bottom: 1px solid #F1F5F9;
        }
        .guide-body tr:last-child td { border-bottom: none; }
        .guide-body tr:nth-child(even) td { background: rgba(248,250,252,0.5); }
        .guide-body blockquote {
          margin: 24px 0;
          background: #F8FAFC;
          border-left: 3px solid #F97316;
          border-radius: 0 8px 8px 0;
          padding: 16px 20px;
        }
        .guide-body blockquote p {
          font-size: 14px;
          color: #334155;
          line-height: 1.6;
          margin: 0;
        }
        @media (max-width: 639px) {
          .guide-body table { display: block; overflow-x: auto; }
          .guide-body h2 { font-size: 20px; margin-top: 40px; }
        }
      `}</style>
    </div>
  )
}
