import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { BoxterLogo } from '@/components/BoxterLogo'
import {
  INDUSTRY_CATEGORIES,
  INDUSTRY_CATEGORY_LABELS,
  INDUSTRY_CATEGORY_DESCRIPTIONS,
  INDUSTRY_CATEGORY_ICONS,
  MATERIAL_TYPES,
  MATERIAL_TYPE_LABELS,
  type IndustryCategory,
  type MaterialType,
} from '@/types'
import { createClient } from '@/lib/supabase/server'
import { simplifyCompanyName } from '@/lib/simplify-company-name'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://packlinx.com'

function slugToCategory(slug: string): IndustryCategory | undefined {
  return INDUSTRY_CATEGORIES.find((k) => k === slug)
}

export function generateStaticParams() {
  return INDUSTRY_CATEGORIES.map((key) => ({ slug: key }))
}

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ material?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const categoryKey = slugToCategory(slug)
  if (!categoryKey) return { title: '카테고리를 찾을 수 없습니다' }

  const label = INDUSTRY_CATEGORY_LABELS[categoryKey]
  const desc = INDUSTRY_CATEGORY_DESCRIPTIONS[categoryKey]
  const title = `${label} 업체`

  return {
    title,
    description: `${desc}. 전국 ${label} 전문 업체를 한눈에 비교하세요.`,
    alternates: { canonical: `/categories/${slug}` },
    openGraph: {
      title: `${title} — BOXTER`,
      description: `${desc}. 전국 ${label} 전문 업체를 한눈에 비교하세요.`,
      url: `${siteUrl}/categories/${slug}`,
      type: 'website',
    },
  }
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params
  const { material } = await searchParams
  const categoryKey = slugToCategory(slug)
  if (!categoryKey) notFound()

  const label = INDUSTRY_CATEGORY_LABELS[categoryKey]
  const description = INDUSTRY_CATEGORY_DESCRIPTIONS[categoryKey]
  const icon = INDUSTRY_CATEGORY_ICONS[categoryKey]

  const supabase = await createClient()
  let query = supabase
    .from('companies')
    .select('id, slug, name, description, category, industry_categories, material_type, tags, is_verified, products, certifications, founded_year, website, service_capabilities, target_industries')
    .contains('industry_categories', [categoryKey])
    .order('is_verified', { ascending: false })
    .order('name')

  if (material) {
    query = query.eq('material_type', material)
  }

  const { data: companies } = await query

  const { count: totalInCategory } = await supabase
    .from('companies')
    .select('*', { count: 'exact', head: true })
    .contains('industry_categories', [categoryKey])

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'BOXTER', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: label, item: `${siteUrl}/categories/${slug}` },
    ],
  }

  const collectionJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${label} 업체`,
    description: `${description}. 전국 ${label} 전문 업체를 한눈에 비교하세요.`,
    url: `${siteUrl}/categories/${slug}`,
    isPartOf: { '@type': 'WebSite', name: 'BOXTER', url: siteUrl },
    numberOfItems: companies?.length ?? 0,
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />

      {/* Header */}
      <header className="bg-[#0A0F1E] sticky top-0 z-50 border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <BoxterLogo variant="dark" size="sm" />
            <span className="hidden sm:inline text-white/25 text-[11px] font-medium tracking-widest uppercase">전국 패키징 파트너, 한 번에</span>
          </Link>
        </div>
      </header>

      {/* Category Hero */}
      <section className="bg-[#F8FAFC] bg-dot-grid border-b border-gray-100 pt-12 pb-14 sm:pt-16 sm:pb-18 px-5">
        <div className="max-w-3xl mx-auto">
          <nav className="text-sm text-gray-400 mb-6">
            <Link href="/" className="hover:text-gray-600 transition-colors">홈</Link>
            <span className="mx-2">&rsaquo;</span>
            <span className="text-gray-700 font-medium">{label}</span>
          </nav>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">{icon}</span>
            <h1 className="text-[32px] sm:text-[42px] font-extrabold text-gray-900 leading-[1.1] tracking-[-0.04em]">
              {label} 업체
            </h1>
          </div>
          <p className="text-gray-500 text-[16px] leading-relaxed max-w-lg">
            {description}
          </p>
          {totalInCategory != null && (
            <p className="text-[13px] text-[#005EFF] font-semibold mt-3">
              {totalInCategory.toLocaleString()}개 업체 등록됨
            </p>
          )}
        </div>
      </section>

      {/* Material Filters */}
      <div className="bg-white border-b border-gray-100 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="flex gap-1.5 py-3 overflow-x-auto scrollbar-none">
            <span className="flex-shrink-0 text-[10px] font-semibold text-gray-300 uppercase tracking-widest self-center mr-2 hidden sm:inline">소재</span>
            <Link
              href={`/categories/${slug}`}
              className={`flex-shrink-0 px-3 py-1.5 rounded-md text-[13px] font-medium transition-all ${
                !material
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              전체
            </Link>
            {MATERIAL_TYPES.map((mat) => (
              <Link
                key={mat}
                href={
                  material === mat
                    ? `/categories/${slug}`
                    : `/categories/${slug}?material=${mat}`
                }
                className={`flex-shrink-0 px-2.5 py-1 rounded text-[11px] font-medium transition-all border ${
                  material === mat
                    ? 'bg-[#005EFF] text-white border-[#005EFF]'
                    : 'text-gray-500 border-gray-200 hover:text-gray-700 hover:border-gray-300 bg-white'
                }`}
              >
                {MATERIAL_TYPE_LABELS[mat]}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <p className="text-sm text-gray-500">
              <span className="font-semibold text-gray-900">{companies?.length ?? 0}</span>개 업체
            </p>
            {material && (
              <>
                <span className="text-[11px] bg-[#EBF2FF] text-[#005EFF] font-medium px-2.5 py-1 rounded-full">
                  {MATERIAL_TYPE_LABELS[material as MaterialType]}
                </span>
                <Link href={`/categories/${slug}`} className="text-xs text-gray-400 hover:text-gray-600 ml-1">
                  초기화
                </Link>
              </>
            )}
          </div>
        </div>

        {companies && companies.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {companies.map((company) => (
              <article
                key={company.id}
                className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-gray-300 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08),0_2px_4px_rgba(0,0,0,0.04)] hover:-translate-y-px transition-all duration-200 group relative"
              >
                {company.is_verified && (company.certifications as string[] | null)?.length! > 0 && (
                  <div className="flex items-center gap-1.5 bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-2 text-[11px] font-semibold text-green-800 border-b border-green-200">
                    <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    인증업체
                    <span className="ml-auto font-medium text-green-700 text-[11px]">
                      {(company.certifications as string[])[0]}{(company.certifications as string[]).length > 1 ? ` 외 ${(company.certifications as string[]).length - 1}건` : ''}
                    </span>
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3.5">
                    <div className="flex flex-wrap gap-1.5">
                      {company.material_type && (
                        <span className="text-[11px] font-medium bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
                          {MATERIAL_TYPE_LABELS[company.material_type as MaterialType]}
                        </span>
                      )}
                    </div>
                    {company.is_verified && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full flex-shrink-0 ml-2">
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        인증업체
                      </span>
                    )}
                  </div>

                  <h2 className="text-base font-bold text-gray-900 mb-1 leading-snug tracking-[-0.02em] line-clamp-1" title={company.name}>
                    <Link
                      href={`/companies/${company.slug}`}
                      className="after:absolute after:inset-0 after:content-['']"
                    >
                      {simplifyCompanyName(company.name)}
                    </Link>
                  </h2>

                  <p className="text-[13px] text-gray-500 leading-relaxed line-clamp-2 mb-3">
                    {company.description ?? ''}
                  </p>

                  {((company.service_capabilities as string[] | null)?.length! > 0 || (company.target_industries as string[] | null)?.length! > 0) && (
                    <div className="mb-3">
                      {(company.service_capabilities as string[] | null)?.length! > 0 && (
                        <div className="flex flex-wrap gap-1 mb-1">
                          {(company.service_capabilities as string[]).slice(0, 3).map((cap, i) => (
                            <span key={i} className="text-[11px] font-medium bg-[#EBF2FF] text-[#005EFF] px-2 py-0.5 rounded">
                              {cap}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="border-t border-gray-100 pt-3.5 flex items-center justify-between gap-2">
                    {company.website ? (
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="relative z-10 text-[12px] text-gray-400 hover:text-gray-600 flex items-center gap-1.5 transition-colors min-w-0"
                      >
                        <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                            d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                        </svg>
                        <span className="truncate max-w-[130px]">
                          {company.website.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}
                        </span>
                      </a>
                    ) : (
                      <span className="text-[12px] text-gray-300">&mdash;</span>
                    )}
                    <span className="text-[11px] text-gray-400 flex-shrink-0">
                      {company.founded_year ? `est. ${company.founded_year}` : ''}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="text-center py-24">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="text-gray-600 font-semibold mb-1.5 text-[15px]">검색 결과가 없습니다</p>
            <p className="text-gray-400 text-sm mb-5">필터를 변경해보세요</p>
            <Link href={`/categories/${slug}`} className="text-sm text-gray-900 font-medium hover:underline underline-offset-4">
              전체 보기 &rarr;
            </Link>
          </div>
        )}
      </section>

      {/* Other Categories */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 pb-12">
        <h2 className="text-[13px] font-semibold text-gray-400 uppercase tracking-wider mb-4">다른 카테고리</h2>
        <div className="flex flex-wrap gap-2">
          {INDUSTRY_CATEGORIES.filter((k) => k !== categoryKey).map((key) => (
            <Link
              key={key}
              href={`/categories/${key}`}
              className="text-[13px] text-gray-600 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors"
            >
              {INDUSTRY_CATEGORY_LABELS[key]}
            </Link>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-gray-50 mt-auto py-8">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-[12px] text-gray-400 leading-relaxed">
              &copy; 2026 BOXTER. 본 서비스의 업체 정보는 공개된 출처에서 자동 수집되었습니다.<br className="hidden sm:inline" />
              정보 오류·삭제 요청: privacy@pkging.kr
            </p>
            <div className="flex gap-5 text-[12px] text-gray-400">
              <Link href="/privacy" className="hover:text-gray-600 transition-colors">개인정보처리방침</Link>
              <Link href="/terms" className="hover:text-gray-600 transition-colors">이용약관</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
