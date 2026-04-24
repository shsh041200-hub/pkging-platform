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
} from '@/types'
import { createClient } from '@/lib/supabase/server'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://packlinx.com'

const BLOG_SEO_OVERRIDES: Record<string, { title: string; description: string }> = {
  '이사박스-대량구매-가이드': {
    title: '이사박스 대량구매 완벽 가이드 — 골판지 vs 단프라 비교 (2026) | Packlinx',
    description: '이사업체·물류 담당자를 위한 이사박스 대량구매 실무 가이드. 골판지 vs 단프라 비교, 채널별 단가표 수록. Packlinx에서 공급업체를 비교하세요.',
  },
  '이사박스-사이즈-규격': {
    title: '이사박스 사이즈 1호~7호 규격 완전 정리 (치수·하중 포함) | Packlinx',
    description: '이사박스 1호~7호 규격과 치수를 정확하게 정리했습니다. 용도별 사이즈 선택 가이드와 실무 체크리스트 포함.',
  },
  '이사박스-제조사-리스트': {
    title: '전국 이사박스 제조사 리스트 2026 — B2B 구매 가이드 | Packlinx',
    description: '전국 이사박스 제조사를 유형별(골판지·단프라)로 정리했습니다. B2B 직발주를 위한 선정 기준 5가지와 검증 체크리스트 포함.',
  },
  'packaging-material-complete-guide': {
    title: '포장재 종류 완전 가이드 — 소재별 특징과 B2B 구매 선택법 (2026) | Packlinx',
    description: '골판지·단프라·OPP 필름·친환경 소재 특징을 B2B 구매 담당자 기준으로 정리했습니다. 소재별 MOQ·비용·재사용성 비교표 수록. Packlinx에서 공급업체를 비교하세요.',
  },
  'smartstore-seller-packaging-checklist': {
    title: '스마트스토어 포장재 체크리스트 — 반품률 줄이는 배송 포장 전략 (2026) | Packlinx',
    description: '스마트스토어 셀러가 반품률을 줄이고 언박싱 경험을 높이는 포장재 선택 완전 가이드. 배송 박스·완충재·테이프 체크리스트와 소량·대량 구매 비교표를 한눈에 확인하세요.',
  },
}

const BLOG_FAQ_DATA: Record<string, Array<{ question: string; answer: string }>> = {
  '이사박스-사이즈-규격': [
    {
      question: '이사박스 3호와 4호 중 어느 것을 더 많이 써야 하나요?',
      answer: '일반 가정 이사 기준으로 3호가 전체의 40~50%, 4호가 20~30%를 차지합니다. 3호는 의류·책·소형 가전에, 4호는 주방용품과 침구류에 적합합니다. 박스 호수를 2~3가지로 통일하면 트럭 적재 효율도 높아집니다.',
    },
    {
      question: '이사박스 적재 권장 하중을 초과하면 어떤 문제가 생기나요?',
      answer: '박스 하단이 눌려 내용물이 손상되거나 적층 중 박스 붕괴로 이어질 수 있습니다. 특히 책류는 3호 이상 큰 박스에 가득 담으면 파손 위험이 높으므로 2~3호 소포장을 권장합니다. 삼중 골판지(TW) 박스는 이중 골판지(DW) 대비 하중 내구성이 약 30~50% 높습니다(시장 참고치).',
    },
    {
      question: '이사 성수기에 이사박스를 미리 발주해야 하는 이유는 무엇인가요?',
      answer: '3~5월, 9~11월 성수기에는 3호·4호 박스 품절 현상이 발생할 수 있습니다. 제조사 직발주 기준 납기가 7~14일, 도매상도 1~3일 소요되므로 성수기 수요 대비 최소 4~6주 전에 수량을 확보하는 것을 권장합니다.',
    },
  ],
  '이사박스-제조사-리스트': [
    {
      question: '이사박스 제조사 직발주와 도매상 중 어디서 구매하는 것이 유리한가요?',
      answer: '월 500개 이상 정기 발주 시 제조사 직발주가 도매상 대비 10~30% 단가 절감에 유리합니다. 월 200개 미만이거나 급발주가 필요한 경우에는 재고를 보유한 도매상을 이용하는 것이 납기 측면에서 유리합니다.',
    },
    {
      question: '이사박스 제조사 거래 전 반드시 확인해야 할 사항은 무엇인가요?',
      answer: '전문 생산 이력 확인, 월 생산 가능 수량, 원자재 수급 안정성, 품질 관리 체계(BCT 기준 제시 여부), 거래 조건 투명성(서면 견적) 5가지를 확인하세요. 1~2회 샘플 발주를 통해 실물 품질을 검증한 후 본 발주를 결정하는 것을 권장합니다.',
    },
    {
      question: '이사박스 골판지 등급(DW vs TW)에 따라 무엇이 다른가요?',
      answer: '이중 골(DW, Double Wall)은 두 겹의 골이 있어 일반 이사용으로 적합하고, 삼중 골(TW, Triple Wall)은 중량 물품이나 반복 사용에 유리합니다. 단가는 TW가 DW 대비 약 20~40% 높지만(시장 참고치), 장기 물류 용도에서는 내구성으로 인해 총비용 면에서 유리할 수 있습니다.',
    },
  ],
  '이사박스-대량구매-가이드': [
    {
      question: '이사박스 대량구매 시 골판지와 단프라 중 어떤 소재를 선택해야 하나요?',
      answer: '1회성 이사나 단발성 운송에는 골판지(800~2,500원/개)가, 50회 이상 반복 사용하는 물류·창고 운영에는 단프라(3,000~8,000원/개)가 적합합니다. 사용 목적과 빈도에 따라 선택하세요.',
    },
    {
      question: '이사박스 대량구매 시 제조사 직거래와 도매상 중 어디서 구매하는 것이 유리한가요?',
      answer: '월 500개 이상 정기 발주라면 제조사 직거래가 도매상 대비 10~30% 단가 절감에 유리합니다. 50~200개 소량·혼합 발주나 급발주가 필요하면 도매상이 적합합니다.',
    },
    {
      question: '이사박스 대량구매 발주 전 반드시 확인해야 할 사항은 무엇인가요?',
      answer: '소재 결정(골판지/단프라), 수량 산정, 규격 혼합 비율, 골판지 등급(DW/TW) 명시, 납기 여유 확보(성수기 최소 2주 전), 인쇄 유무, 공급사 복수화(2~3개사), 결제 조건을 확인해야 합니다.',
    },
  ],
  'packaging-material-complete-guide': [
    {
      question: '골판지와 단프라 중 어느 것이 더 경제적인가요?',
      answer: '단순 단가는 골판지가 낮지만, 재사용 횟수를 고려하면 회수 가능한 물류 용기 용도에서는 단프라가 장기 비용에서 유리합니다. 사용 환경과 회수율을 먼저 파악하는 것이 선택의 핵심입니다.',
    },
    {
      question: '친환경 포장재로 전환하면 비용이 얼마나 늘어나나요?',
      answer: '소재와 규격에 따라 다르지만, 동일 규격의 일반 골판지 대비 크라프트지 기반 친환경 소재는 통상 10~30% 높은 단가를 형성합니다(시장 참고치). 대량 발주 시 공급업체와 직접 협의하시기 바랍니다.',
    },
    {
      question: '식품 포장재를 선택할 때 가장 중요한 기준은 무엇인가요?',
      answer: '식품위생법에 따른 재질 적합성(제조사 성적서 확인)이 최우선입니다. 그 다음으로 내용물의 보관 온도, 유통 기간, 진열 방식에 따라 소재를 결정합니다.',
    },
    {
      question: 'OPP 필름과 PE 필름의 차이는 무엇인가요?',
      answer: 'OPP는 투명도·광택이 높아 제품을 보여주는 포장에 적합하며, PE는 유연성이 좋아 완충재·봉투 용도에 많이 쓰입니다. 인쇄가 필요하면 OPP, 충격 완충이 주목적이면 PE를 선택하는 것이 일반적입니다.',
    },
  ],
  'smartstore-seller-packaging-checklist': [
    {
      question: '스마트스토어 포장재로 가장 많이 사용되는 박스 재질은 무엇인가요?',
      answer: '골판지 단겹(B골·E골)이 가장 범용적으로 사용됩니다. 경량 상품에는 E골, 일반 박스류에는 B골이 적합하며, 3kg 이상 취급 주의 상품이라면 BC 이중골을 권장합니다. 재질 선택보다 박스 크기의 적합성이 파손율에 더 큰 영향을 미치는 경우가 많으므로, 크기 선택을 우선 검토하자.',
    },
    {
      question: '완충재 없이 택배 포장해도 되나요?',
      answer: '의류·소프트 굿즈처럼 파손 위험이 낮은 상품은 완충재를 최소화할 수 있으나, 박스 내부 유동을 막는 고정 처리는 반드시 필요합니다. 유리·도자기·전자기기는 완충재 생략 시 파손율이 급격히 높아집니다.',
    },
    {
      question: '소량 구매 시 가장 경제적인 포장재 조합은 무엇인가요?',
      answer: '월 50개 이하 발송이라면 무지 골판지 박스 + 에어캡 롤 + OPP 테이프 조합이 비용 대비 효율이 높습니다. 브랜드 요소는 소량 MOQ로 발주 가능한 로고 스티커부터 시작하는 것이 초기 재고 부담 없이 브랜드 경험을 도입하는 방법입니다.',
    },
  ],
}

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug: rawSlug } = await params
  const slug = decodeURIComponent(rawSlug)
  const seoOverride = BLOG_SEO_OVERRIDES[slug]
  const supabase = await createClient()
  const { data: post } = await supabase
    .from('blog_posts')
    .select('title, excerpt, meta_title, meta_description, og_image_url, cover_image_url')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (!post) return { title: '글을 찾을 수 없습니다' }

  const title = seoOverride?.title ?? post.meta_title ?? post.title
  const description = seoOverride?.description ?? post.meta_description ?? post.excerpt ?? ''
  const ogImage = post.og_image_url ?? post.cover_image_url

  return {
    title: seoOverride ? { absolute: title } : title,
    description,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      title,
      description,
      url: `${siteUrl}/blog/${slug}`,
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

export default async function BlogPostPage({ params }: Props) {
  const { slug: rawSlug } = await params
  const slug = decodeURIComponent(rawSlug)
  const supabase = await createClient()

  const { data: post } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .eq('content_type', 'blog')
    .single()

  if (!post) notFound()

  const typedPost = post as BlogPost

  const contentHtml = typedPost.body ? await markdownToHtml(typedPost.body) : ''

  // Related posts (same category, excluding current)
  const { data: relatedPosts } = typedPost.category
    ? await supabase
        .from('blog_posts')
        .select('id, slug, title, excerpt, cover_image_url, published_at')
        .eq('status', 'published')
        .eq('content_type', 'blog')
        .eq('category', typedPost.category)
        .neq('slug', slug)
        .order('published_at', { ascending: false })
        .limit(3)
    : { data: [] }

  const categoryLabel = typedPost.category
    ? INDUSTRY_CATEGORY_LABELS[typedPost.category as IndustryCategory]
    : null

  const blogPostingJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${siteUrl}/blog/${slug}`,
    headline: typedPost.title,
    ...(typedPost.excerpt ? { description: typedPost.excerpt } : {}),
    url: `${siteUrl}/blog/${slug}`,
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${siteUrl}/blog/${slug}` },
    datePublished: typedPost.published_at ?? typedPost.created_at,
    ...(typedPost.updated_at ? { dateModified: typedPost.updated_at } : {}),
    author: {
      '@type': 'Person',
      name: typedPost.author ?? 'Packlinx',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Packlinx',
      url: siteUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/packlinx-logo-light.svg`,
      },
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
      { '@type': 'ListItem', position: 2, name: '블로그', item: `${siteUrl}/blog` },
      { '@type': 'ListItem', position: 3, name: typedPost.title, item: `${siteUrl}/blog/${slug}` },
    ],
  }

  const faqItems = BLOG_FAQ_DATA[slug]
  const faqJsonLd = faqItems
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingJsonLd) }}
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
            <Link href="/guides" className="text-gray-500 hover:text-gray-900 text-[13px] font-medium transition-colors">
              가이드
            </Link>
            <Link href="/blog" className="text-gray-900 text-[13px] font-semibold">
              블로그
            </Link>
          </nav>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="bg-[#F8FAFC] border-b border-gray-100 px-5 py-3">
        <div className="max-w-3xl mx-auto">
          <nav className="text-sm text-gray-400">
            <Link href="/" className="hover:text-gray-600 transition-colors">홈</Link>
            <span className="mx-2">&rsaquo;</span>
            <Link href="/blog" className="hover:text-gray-600 transition-colors">블로그</Link>
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
            <span className="text-[11px] font-semibold text-[#2563EB] bg-[#EFF6FF] px-2.5 py-1 rounded-full">
              {categoryLabel}
            </span>
          )}
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
          <p className="text-[17px] text-gray-500 leading-relaxed border-l-4 border-[#C2410C] pl-4 mb-8 italic">
            {typedPost.excerpt}
          </p>
        )}

        {/* Cover Image */}
        {(typedPost.cover_image_url) && (
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
              prose-a:text-[#2563EB] prose-a:no-underline hover:prose-a:underline
              prose-strong:text-gray-900
              prose-li:text-[15px] prose-li:text-gray-700
              prose-blockquote:border-l-4 prose-blockquote:border-[#C2410C] prose-blockquote:bg-[#FFF7ED] prose-blockquote:py-1 prose-blockquote:rounded-r-lg"
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />
        ) : (
          <p className="text-gray-400 text-center py-12">본문 콘텐츠가 없습니다.</p>
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
              className="inline-flex items-center gap-2 bg-[#C2410C] hover:bg-[#9A3412] text-white font-bold px-8 py-3.5 rounded-xl transition-colors text-[15px]"
            >
              관련 업체 찾기 &rarr;
            </Link>
          </div>
        </section>
      )}

      {/* Related Posts */}
      {relatedPosts && relatedPosts.length > 0 && (
        <section className="max-w-7xl mx-auto px-5 sm:px-8 py-12">
          <h2 className="text-[18px] font-extrabold text-gray-900 tracking-tight mb-6">
            관련 가이드
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {relatedPosts.map((related: Pick<BlogPost, 'id' | 'slug' | 'title' | 'excerpt' | 'cover_image_url' | 'published_at'>) => (
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
                  <div className="w-full aspect-[16/9] bg-gradient-to-br from-[#EFF6FF] to-[#F0F4FF] flex items-center justify-center">
                    <span className="text-3xl opacity-40">📦</span>
                  </div>
                )}
                <div className="p-4">
                  {related.published_at && (
                    <p className="text-[11px] text-gray-400 mb-1.5">{formatDate(related.published_at)}</p>
                  )}
                  <h3 className="text-[14px] font-bold text-gray-900 leading-snug line-clamp-2 mb-1">
                    <Link href={`/blog/${related.slug}`} className="hover:text-[#C2410C] transition-colors">
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
