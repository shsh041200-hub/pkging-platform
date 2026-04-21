import type { Metadata } from 'next'
import Link from 'next/link'
import { BoxterLogo } from '@/components/BoxterLogo'
import { FilterAccordion } from './filter-accordion'
import {
  CATEGORY_LABELS,
  TAG_LABELS,
  BUYER_CATEGORY_LABELS,
  BUYER_CATEGORY_PACKAGING_FORMS,
  PACKAGING_FORM_LABELS,
  type Category,
  type CompanyTag,
  type BuyerCategory,
  type PackagingForm,
} from '@/types'
import { createClient } from '@/lib/supabase/server'
import { simplifyCompanyName } from '@/lib/simplify-company-name'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://packlinx.com'

const DATA_SOURCE_LABELS: Record<string, string> = {
  naver_local: '출처: 네이버 지역 검색',
  public_data_portal: '출처: 공공데이터 포털',
  website_crawl: '출처: 업체 웹사이트',
}

type SearchParams = Promise<{
  q?: string
  buyer_category?: string
  packaging_form?: string
  category?: string
  tag?: string
}>

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams
}): Promise<Metadata> {
  const { q, buyer_category, packaging_form, category, tag } = await searchParams
  const hasFilter = buyer_category || packaging_form || category || tag

  if (q) {
    return {
      robots: { index: false, follow: true },
    }
  }

  if (hasFilter) {
    return {
      alternates: { canonical: siteUrl },
    }
  }

  return {}
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      name: 'BOXTER',
      url: siteUrl,
      description: '전국 패키징 업체를 한눈에. 식품·산업용·친환경 포장재 B2B 파트너 찾기.',
      inLanguage: 'ko',
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${siteUrl}/?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'Organization',
      name: 'BOXTER',
      url: siteUrl,
      logo: `${siteUrl}/boxter-logo-light.svg`,
    },
  ],
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string
    buyer_category?: string
    packaging_form?: string
    category?: string
    tag?: string
  }>
}) {
  const { q, buyer_category, packaging_form, category, tag } = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('companies')
    .select('id, slug, name, description, category, buyer_category, packaging_form, tags, is_verified, products, certifications, founded_year, website, service_capabilities, target_industries, data_source')
    .order('is_verified', { ascending: false })
    .order('name')
    .limit(60)

  if (q) {
    query = query.or(
      `name.ilike.%${q}%,description.ilike.%${q}%`
    )
  }
  if (buyer_category) {
    query = query.eq('buyer_category', buyer_category)
  }
  if (packaging_form) {
    query = query.eq('packaging_form', packaging_form)
  }
  if (category) {
    query = query.eq('category', category)
  }
  if (tag) {
    query = query.contains('tags', [tag])
  }

  const { data: companies } = await query

  const { count: totalCount } = await supabase
    .from('companies')
    .select('*', { count: 'exact', head: true })

  const level2Options: PackagingForm[] = buyer_category && BUYER_CATEGORY_PACKAGING_FORMS[buyer_category as BuyerCategory]
    ? BUYER_CATEGORY_PACKAGING_FORMS[buyer_category as BuyerCategory]
    : (Object.keys(PACKAGING_FORM_LABELS) as PackagingForm[])

  const buildUrl = (overrides: Record<string, string | undefined>) => {
    const params: Record<string, string> = {}
    if (q) params.q = q
    if (buyer_category) params.buyer_category = buyer_category
    if (packaging_form) params.packaging_form = packaging_form
    if (category) params.category = category
    if (tag) params.tag = tag
    Object.assign(params, overrides)
    Object.keys(params).forEach((k) => { if (params[k] === undefined) delete params[k] })
    const qs = new URLSearchParams(params).toString()
    return qs ? `/?${qs}` : '/'
  }

  const activeFilters = [
    buyer_category && BUYER_CATEGORY_LABELS[buyer_category as BuyerCategory],
    packaging_form && PACKAGING_FORM_LABELS[packaging_form as PackagingForm],
    category && CATEGORY_LABELS[category as Category],
    tag && TAG_LABELS[tag as CompanyTag],
  ].filter(Boolean)

  return (
    <div className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Header */}
      <header className="bg-[#0A0F1E] sticky top-0 z-50 border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <BoxterLogo variant="dark" size="sm" />
            <span className="hidden sm:inline text-white/25 text-[11px] font-medium tracking-widest uppercase">B2B 포장업체 디렉토리</span>
          </Link>
        </div>
      </header>

      {/* Hero — white background, confident typography */}
      <section className="bg-white border-b border-gray-100 pt-16 pb-20 sm:pt-20 sm:pb-24 px-5">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-block text-[11px] font-semibold tracking-widest uppercase text-[#005EFF] bg-[#EBF2FF] px-3 py-1.5 rounded-full mb-5">
            국내 패키징 플랫폼
          </div>
          <h1 className="text-[38px] sm:text-[52px] font-extrabold text-gray-900 leading-[1.1] tracking-[-0.04em]">
            국내 포장업체<br />전문 디렉토리
          </h1>
          <p className="text-gray-500 text-[16px] sm:text-[17px] mt-4 mb-9 leading-relaxed max-w-md mx-auto">
            B2B 포장 파트너를 바로 찾으세요.
          </p>
          <form method="GET" className="flex max-w-xl mx-auto rounded-xl overflow-hidden border border-gray-200 shadow-[0_2px_8px_rgba(0,0,0,0.06)] focus-within:border-[#005EFF] focus-within:shadow-[0_2px_8px_rgba(0,0,0,0.06),0_0_0_3px_rgba(0,94,255,0.12)] transition-shadow">
            <input
              name="q"
              defaultValue={q}
              placeholder="업체명, 제품, 인증, 지역으로 검색..."
              className="flex-1 px-5 py-4 text-[15px] text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none"
            />
            {buyer_category && <input type="hidden" name="buyer_category" value={buyer_category} />}
            {packaging_form && <input type="hidden" name="packaging_form" value={packaging_form} />}
            {category && <input type="hidden" name="category" value={category} />}
            {tag && <input type="hidden" name="tag" value={tag} />}
            <button
              type="submit"
              className="bg-[#005EFF] hover:bg-[#0047CC] text-white font-semibold px-6 py-3 transition-colors text-sm flex-shrink-0 m-1.5 rounded-lg"
            >
              검색
            </button>
          </form>
          {totalCount != null && (
            <div className="flex items-center justify-center gap-3 mt-5 text-[12px] text-gray-400 font-medium">
              <span>{totalCount.toLocaleString()}개 업체 등록됨</span>
              <span className="text-gray-200">·</span>
              <span>업체 인증 시스템</span>
              <span className="text-gray-200">·</span>
              <span>무료 이용</span>
            </div>
          )}
        </div>
      </section>

      {/* Filter Bar */}
      <div className="bg-white border-b border-gray-100 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">

          {/* Level 1 */}
          <div className="flex gap-1 pt-3 pb-2 overflow-x-auto scrollbar-none items-center">
            <span className="flex-shrink-0 text-[10px] font-semibold text-gray-300 uppercase tracking-widest self-center mr-2 hidden sm:inline">유형</span>
            <Link
              href={q ? `/?q=${q}` : '/'}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-md text-[13px] font-medium transition-all ${
                !buyer_category && !packaging_form && !category && !tag
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              전체
            </Link>
            {(Object.keys(BUYER_CATEGORY_LABELS) as BuyerCategory[]).map((key) => (
              <Link
                key={key}
                href={buildUrl({
                  buyer_category: buyer_category === key ? undefined : key,
                  packaging_form: buyer_category === key ? undefined : packaging_form,
                })}
                className={`flex-shrink-0 px-3.5 py-1.5 rounded-md text-[13px] font-medium transition-all ${
                  buyer_category === key
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                {BUYER_CATEGORY_LABELS[key]}
              </Link>
            ))}
          </div>

          {/* Level 2 */}
          <div className="flex gap-1 pb-2.5 overflow-x-auto scrollbar-none">
            <span className="flex-shrink-0 text-[10px] font-semibold text-gray-300 uppercase tracking-widest self-center mr-2 hidden sm:inline">형태</span>
            {level2Options.map((key) => (
              <Link
                key={key}
                href={buildUrl({
                  packaging_form: packaging_form === key ? undefined : key,
                })}
                className={`flex-shrink-0 px-2.5 py-1 rounded text-[11px] font-medium transition-all border ${
                  packaging_form === key
                    ? 'bg-[#005EFF] text-white border-[#005EFF]'
                    : 'text-gray-500 border-gray-200 hover:text-gray-700 hover:border-gray-300 bg-white'
                }`}
              >
                {PACKAGING_FORM_LABELS[key]}
              </Link>
            ))}
          </div>

          {/* Level 3 */}
          <FilterAccordion>
            <div className="flex gap-1.5 flex-wrap">
              <span className="text-[10px] text-gray-300 font-semibold uppercase tracking-widest self-center mr-1">소재</span>
              {(Object.entries(CATEGORY_LABELS) as [Category, string][]).map(([key, label]) => (
                <Link
                  key={key}
                  href={buildUrl({ category: category === key ? undefined : key })}
                  className={`flex-shrink-0 px-3 py-1 rounded-md text-[12px] font-medium transition-all border ${
                    category === key
                      ? 'bg-[#005EFF] text-white border-[#005EFF]'
                      : 'text-gray-500 border-gray-200 hover:border-gray-300 hover:text-gray-700 bg-white'
                  }`}
                >
                  {label}
                </Link>
              ))}
            </div>
            <div className="flex gap-1.5 flex-wrap">
              <span className="text-[10px] text-gray-300 font-semibold uppercase tracking-widest self-center mr-1">기능</span>
              {(Object.entries(TAG_LABELS) as [CompanyTag, string][]).map(([key, label]) => (
                <Link
                  key={key}
                  href={buildUrl({ tag: tag === key ? undefined : key })}
                  className={`flex-shrink-0 px-3 py-1 rounded-md text-[12px] font-medium transition-all border ${
                    tag === key
                      ? 'bg-[#005EFF] text-white border-[#005EFF]'
                      : 'text-gray-500 border-gray-200 hover:border-gray-300 hover:text-gray-700 bg-white'
                  }`}
                >
                  {label}
                </Link>
              ))}
            </div>
          </FilterAccordion>
        </div>
      </div>

      {/* Results */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5 flex-wrap">
            <p className="text-sm text-gray-500">
              <span className="font-semibold text-gray-900">{companies?.length ?? 0}</span>개 업체
            </p>
            {activeFilters.map((f, i) => (
              <span key={i} className="text-[11px] bg-[#EBF2FF] text-[#005EFF] font-medium px-2.5 py-1 rounded-full">
                {f}
              </span>
            ))}
            {q && (
              <span className="text-[11px] bg-[#EBF2FF] text-[#005EFF] font-medium px-2.5 py-1 rounded-full">
                &ldquo;{q}&rdquo;
              </span>
            )}
            {(buyer_category || packaging_form || category || tag || q) && (
              <Link href="/" className="text-xs text-gray-400 hover:text-gray-600 ml-1">
                초기화
              </Link>
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
                      {company.buyer_category && (
                        <span className="text-[11px] font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                          {BUYER_CATEGORY_LABELS[company.buyer_category as BuyerCategory]}
                        </span>
                      )}
                      {company.packaging_form && (
                        <span className="text-[11px] font-medium bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
                          {PACKAGING_FORM_LABELS[company.packaging_form as PackagingForm]}
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
                      {(company.target_industries as string[] | null)?.length! > 0 && (
                        <div className="flex flex-wrap gap-1 mb-1">
                          {(company.target_industries as string[]).slice(0, 2).map((ind, i) => (
                            <span key={i} className="text-[11px] font-medium bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
                              {ind}
                            </span>
                          ))}
                        </div>
                      )}
                      <p className="text-[10px] text-gray-400 mt-0.5">AI 생성 정보</p>
                    </div>
                  )}

                  {company.data_source && DATA_SOURCE_LABELS[company.data_source as string] && (
                    <p className="text-[10px] text-gray-400 -mt-1 mb-1">
                      {DATA_SOURCE_LABELS[company.data_source as string]}
                    </p>
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
                      <span className="text-[12px] text-gray-300">—</span>
                    )}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-[11px] text-gray-400">
                        {CATEGORY_LABELS[company.category as Category]}
                        {company.founded_year ? ` · est. ${company.founded_year}` : ''}
                      </span>
                      <Link
                        href={`/companies/${company.slug}?quote=true`}
                        className="border border-[#005EFF] text-[#005EFF] hover:bg-[#EBF2FF] text-[13px] font-semibold px-3 py-1.5 rounded-lg relative z-10 transition-colors"
                      >
                        견적 받기
                      </Link>
                    </div>
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
            <p className="text-gray-400 text-sm mb-5">검색어나 카테고리를 변경해보세요</p>
            <Link href="/" className="text-sm text-gray-900 font-medium hover:underline underline-offset-4">
              전체 목록 보기 →
            </Link>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-gray-50 mt-auto py-8">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-[12px] text-gray-400 leading-relaxed">
              © 2026 BOXTER. 본 서비스의 업체 정보는 공개된 출처에서 자동 수집되었습니다.<br className="hidden sm:inline" />
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
