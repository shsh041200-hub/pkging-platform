import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { remark } from 'remark'
import remarkHtml from 'remark-html'
import { PacklinxLogo } from '@/components/PacklinxLogo'
import {
  INDUSTRY_CATEGORY_LABELS,
  type IndustryCategory,
  type BlogPost,
  type FaqItem,
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

async function markdownToHtml(markdown: string): Promise<string> {
  const result = await remark()
    .use(remarkHtml, { sanitize: true })
    .process(markdown)
  return result.toString()
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
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

  const contentHtml = typedPost.body ? await markdownToHtml(typedPost.body) : ''

  const { data: relatedGuides } = typedPost.category
    ? await supabase
        .from('blog_posts')
        .select('id, slug, title, excerpt, cover_image_url, published_at')
        .eq('status', 'published')
        .eq('content_type', 'guide')
        .eq('category', typedPost.category)
        .neq('slug', slug)
        .order('published_at', { ascending: false })
        .limit(3)
    : { data: [] }

  const categoryLabel = typedPost.category
    ? INDUSTRY_CATEGORY_LABELS[typedPost.category as IndustryCategory]
    : null

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: typedPost.title,
    description: typedPost.excerpt ?? '',
    url: `${siteUrl}/guides/${slug}`,
    datePublished: typedPost.published_at ?? typedPost.created_at,
    dateModified: typedPost.updated_at,
    author: {
      '@type': 'Person',
      name: typedPost.author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Packlinx',
      url: siteUrl,
    },
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
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.answer,
          },
        })),
      }
    : null

  return (
    <div className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}

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
            <Link href="/blog" className="text-gray-500 hover:text-gray-900 text-[13px] font-medium transition-colors">
              블로그
            </Link>
          </nav>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="bg-[#FFF8F3] border-b border-orange-100 px-5 py-3">
        <div className="max-w-3xl mx-auto">
          <nav className="text-sm text-gray-400">
            <Link href="/" className="hover:text-gray-600 transition-colors">홈</Link>
            <span className="mx-2">&rsaquo;</span>
            <Link href="/guides" className="hover:text-gray-600 transition-colors">패키징 완전 가이드</Link>
            <span className="mx-2">&rsaquo;</span>
            <span className="text-gray-700 font-medium line-clamp-1">{typedPost.title}</span>
          </nav>
        </div>
      </div>

      {/* Article */}
      <article className="max-w-3xl mx-auto px-5 sm:px-8 py-10">
        {/* Meta */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          {categoryLabel && (
            <span className="text-[11px] font-semibold text-[#F97316] bg-[#FFF3E8] px-2.5 py-1 rounded-full">
              {categoryLabel}
            </span>
          )}
          <span className="text-[11px] font-semibold text-[#F97316] bg-[#FFF3E8] px-2.5 py-1 rounded-full">
            심층 가이드
          </span>
          {typedPost.published_at && (
            <time className="text-[12px] text-gray-400" dateTime={typedPost.published_at}>
              {formatDate(typedPost.published_at)}
            </time>
          )}
          {typedPost.author && (
            <span className="text-[12px] text-gray-400">by {typedPost.author}</span>
          )}
        </div>

        <h1 className="text-[28px] sm:text-[36px] font-extrabold text-gray-900 leading-[1.15] tracking-[-0.04em] mb-5">
          {typedPost.title}
        </h1>

        {typedPost.excerpt && (
          <p className="text-[17px] text-gray-500 leading-relaxed border-l-4 border-[#F97316] pl-4 mb-8 italic">
            {typedPost.excerpt}
          </p>
        )}

        {/* Cover Image */}
        {typedPost.cover_image_url && (
          <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden mb-8 bg-gray-100">
            <Image
              src={typedPost.cover_image_url}
              alt={typedPost.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 768px"
              priority
            />
          </div>
        )}

        {/* Body */}
        {contentHtml ? (
          <div
            className="prose prose-gray prose-lg max-w-none
              prose-headings:font-extrabold prose-headings:tracking-tight
              prose-h2:text-[22px] prose-h2:mt-10 prose-h2:mb-4
              prose-h3:text-[18px] prose-h3:mt-8 prose-h3:mb-3
              prose-p:text-[15px] prose-p:leading-[1.8] prose-p:text-gray-700
              prose-a:text-[#F97316] prose-a:no-underline hover:prose-a:underline
              prose-strong:text-gray-900
              prose-li:text-[15px] prose-li:text-gray-700
              prose-blockquote:border-l-4 prose-blockquote:border-[#F97316] prose-blockquote:bg-[#FFFAF5] prose-blockquote:py-1 prose-blockquote:rounded-r-lg"
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />
        ) : (
          <p className="text-gray-400 text-center py-12">본문 콘텐츠가 없습니다.</p>
        )}

        {/* FAQ Section */}
        {faqItems && faqItems.length > 0 && (
          <section className="mt-12 border-t border-gray-100 pt-10">
            <h2 className="text-[20px] font-extrabold text-gray-900 tracking-tight mb-6">
              자주 묻는 질문
            </h2>
            <dl className="space-y-5">
              {faqItems.map((item, index) => (
                <div key={index} className="border border-gray-200 rounded-xl p-5">
                  <dt className="text-[15px] font-bold text-gray-900 mb-2">
                    Q. {item.question}
                  </dt>
                  <dd className="text-[14px] text-gray-600 leading-relaxed">
                    {item.answer}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        )}
      </article>

      {/* CTA — 관련 업체 찾기 */}
      {typedPost.category && (
        <section className="bg-[#0F172A] py-12 px-5 mt-4">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-white/50 text-[12px] font-semibold uppercase tracking-widest mb-3">
              {categoryLabel} 업체 탐색
            </p>
            <h2 className="text-[24px] sm:text-[30px] font-extrabold text-white tracking-tight mb-4">
              관련 업체를 지금 바로 찾아보세요
            </h2>
            <p className="text-white/60 text-[14px] mb-7">
              Packlinx에서 검증된 {categoryLabel} 전문 업체를 한눈에 비교하세요.
            </p>
            <Link
              href={`/categories/${typedPost.category}`}
              className="inline-flex items-center gap-2 bg-[#F97316] hover:bg-[#EA6B0A] text-white font-bold px-8 py-3.5 rounded-xl transition-colors text-[15px]"
            >
              관련 업체 찾기 &rarr;
            </Link>
          </div>
        </section>
      )}

      {/* Related Guides */}
      {relatedGuides && relatedGuides.length > 0 && (
        <section className="max-w-7xl mx-auto px-5 sm:px-8 py-12">
          <h2 className="text-[18px] font-extrabold text-gray-900 tracking-tight mb-6">
            관련 가이드
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {relatedGuides.map((related: Pick<BlogPost, 'id' | 'slug' | 'title' | 'excerpt' | 'cover_image_url' | 'published_at'>) => (
              <article
                key={related.id}
                className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-gray-300 hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200"
              >
                {related.cover_image_url ? (
                  <div className="relative w-full aspect-[16/9] bg-gray-100">
                    <Image
                      src={related.cover_image_url}
                      alt={related.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                ) : (
                  <div className="w-full aspect-[16/9] bg-gradient-to-br from-[#FFF3E8] to-[#FFF8F3] flex items-center justify-center">
                    <span className="text-3xl opacity-40">📚</span>
                  </div>
                )}
                <div className="p-4">
                  {related.published_at && (
                    <p className="text-[11px] text-gray-400 mb-1.5">{formatDate(related.published_at)}</p>
                  )}
                  <h3 className="text-[14px] font-bold text-gray-900 leading-snug line-clamp-2 mb-1">
                    <Link href={`/guides/${related.slug}`} className="hover:text-[#F97316] transition-colors">
                      {related.title}
                    </Link>
                  </h3>
                  {related.excerpt && (
                    <p className="text-[12px] text-gray-500 line-clamp-2">{related.excerpt}</p>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

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
