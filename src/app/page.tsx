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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://packlinx.com'

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
    .select('id, slug, name, description, category, buyer_category, packaging_form, tags, city, province, is_verified, products, certifications, founded_year, website')
    .order('is_verified', { ascending: false })
    .order('name')
    .limit(60)

  if (q) {
    query = query.or(
      `name.ilike.%${q}%,description.ilike.%${q}%,city.ilike.%${q}%,province.ilike.%${q}%`
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

  // Level 2: show recommended forms if buyer_category selected, else all
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
    <div className="min-h-screen bg-slate-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Header */}
      <header className="bg-[#0F172A] sticky top-0 z-50 border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <BoxterLogo variant="dark" size="sm" />
            <span className="hidden sm:inline text-white/40 text-xs">|</span>
            <span className="hidden sm:inline text-white/50 text-xs">B2B 포장업체 디렉토리</span>
          </Link>
        </div>
      </header>

      {/* Hero + Search */}
      <section className="bg-gradient-to-b from-[#0F172A] to-[#1a2d45] py-16 sm:py-24 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-3xl sm:text-5xl font-bold text-white tracking-tight leading-[1.15]">
            국내 포장업체<br className="sm:hidden" /> 전문 디렉토리
          </h1>
          <p className="text-slate-300 text-lg mt-4 mb-8 leading-relaxed">
            어떤 제품을 포장하시나요?<br className="sm:hidden" /> B2B 포장 파트너를 바로 찾으세요
          </p>
          <form method="GET" className="flex max-w-xl mx-auto rounded-xl overflow-hidden shadow-xl ring-1 ring-white/10">
            <input
              name="q"
              defaultValue={q}
              placeholder="업체명, 제품, 인증, 지역으로 검색..."
              className="flex-1 px-5 py-4 text-sm text-slate-900 bg-white focus:outline-none"
            />
            {buyer_category && <input type="hidden" name="buyer_category" value={buyer_category} />}
            {packaging_form && <input type="hidden" name="packaging_form" value={packaging_form} />}
            {category && <input type="hidden" name="category" value={category} />}
            {tag && <input type="hidden" name="tag" value={tag} />}
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-4 transition-colors text-sm flex-shrink-0"
            >
              검색
            </button>
          </form>
          {totalCount != null && (
            <p className="text-white/40 text-xs mt-4">{totalCount.toLocaleString()}개 업체 등록됨</p>
          )}
        </div>
      </section>

      {/* 3-Level Filter Bar */}
      <div className="bg-white border-b border-slate-100 sticky top-14 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">

          {/* Level 1: 제품 유형 */}
          <div className="flex gap-1 pt-3 pb-2 overflow-x-auto scrollbar-none">
            <span className="flex-shrink-0 text-xs font-semibold text-slate-400 self-center mr-1 hidden sm:inline">제품 유형</span>
            <Link
              href={q ? `/?q=${q}` : '/'}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                !buyer_category && !packaging_form && !category && !tag
                  ? 'bg-[#0F172A] text-white'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
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
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  buyer_category === key
                    ? 'bg-[#0F172A] text-white'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                }`}
              >
                {BUYER_CATEGORY_LABELS[key]}
              </Link>
            ))}
          </div>

          {/* Level 2: 포장 형태 */}
          <div className="flex gap-1.5 pb-2 overflow-x-auto scrollbar-none">
            <span className="flex-shrink-0 text-xs font-semibold text-slate-400 self-center mr-1 hidden sm:inline">포장 형태</span>
            {level2Options.map((key) => (
              <Link
                key={key}
                href={buildUrl({
                  packaging_form: packaging_form === key ? undefined : key,
                })}
                className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all border ${
                  packaging_form === key
                    ? 'bg-[#0F172A] text-white border-[#0F172A]'
                    : 'text-slate-500 border-slate-200 hover:text-slate-700 hover:border-slate-400 bg-white'
                }`}
              >
                {PACKAGING_FORM_LABELS[key]}
              </Link>
            ))}
          </div>

          {/* Level 3: 소재 + 태그 (세부 필터) */}
          <FilterAccordion>
            <div className="flex gap-1.5 flex-wrap">
              <span className="text-xs text-slate-400 self-center">소재:</span>
              {(Object.entries(CATEGORY_LABELS) as [Category, string][]).map(([key, label]) => (
                <Link
                  key={key}
                  href={buildUrl({ category: category === key ? undefined : key })}
                  className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all border ${
                    category === key
                      ? 'bg-[#0F172A] text-white border-[#0F172A]'
                      : 'text-slate-500 border-slate-200 hover:border-slate-400 hover:text-slate-700 bg-white'
                  }`}
                >
                  {label}
                </Link>
              ))}
            </div>
            <div className="flex gap-1.5 flex-wrap">
              <span className="text-xs text-slate-400 self-center">기능:</span>
              {(Object.entries(TAG_LABELS) as [CompanyTag, string][]).map(([key, label]) => (
                <Link
                  key={key}
                  href={buildUrl({ tag: tag === key ? undefined : key })}
                  className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all border ${
                    tag === key
                      ? 'bg-[#0F172A] text-white border-[#0F172A]'
                      : 'text-slate-500 border-slate-200 hover:border-slate-400 hover:text-slate-700 bg-white'
                  }`}
                >
                  {label}
                </Link>
              ))}
            </div>
          </FilterAccordion>
        </div>
      </div>

      {/* Results Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-7">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm text-slate-500">
              <span className="font-semibold text-slate-900">{companies?.length ?? 0}개</span> 업체
            </p>
            {activeFilters.map((f, i) => (
              <span key={i} className="text-xs bg-blue-50 text-blue-700 font-medium px-2.5 py-1 rounded-full">
                {f}
              </span>
            ))}
            {q && (
              <span className="text-xs bg-slate-100 text-slate-600 font-medium px-2.5 py-1 rounded-full">
                &ldquo;{q}&rdquo;
              </span>
            )}
            {(buyer_category || packaging_form || category || tag || q) && (
              <Link href="/" className="text-xs text-slate-400 hover:text-slate-600 ml-1 underline">
                초기화
              </Link>
            )}
          </div>
        </div>

        {companies && companies.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {companies.map((company) => (
              <div
                key={company.id}
                className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-all duration-200 group relative"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex flex-wrap gap-1.5">
                    {company.buyer_category && (
                      <span className="text-xs font-medium bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md">
                        {BUYER_CATEGORY_LABELS[company.buyer_category as BuyerCategory]}
                      </span>
                    )}
                    {company.packaging_form && (
                      <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md">
                        {PACKAGING_FORM_LABELS[company.packaging_form as PackagingForm]}
                      </span>
                    )}
                  </div>
                  {company.is_verified && (
                    <span className="text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex-shrink-0 ml-2">
                      ✓ 인증
                    </span>
                  )}
                </div>

                <h2 className="text-base font-bold text-slate-900 mb-0.5 group-hover:text-blue-700 transition-colors leading-snug">
                  <Link
                    href={`/companies/${company.slug}`}
                    className="after:absolute after:inset-0 after:content-['']"
                  >
                    {company.name}
                  </Link>
                </h2>

                {company.province && (
                  <p className="text-xs text-slate-400 mb-2">
                    {company.province}{company.city ? ` ${company.city}` : ''}
                  </p>
                )}

                <p className="text-sm text-slate-500 leading-relaxed line-clamp-2 mb-3">
                  {company.description ?? ''}
                </p>

                {company.products && company.products.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {(company.products as string[]).slice(0, 3).map((p, i) => (
                      <span key={i} className="text-xs bg-slate-50 border border-slate-100 text-slate-500 px-2 py-0.5 rounded">
                        {p}
                      </span>
                    ))}
                    {company.products.length > 3 && (
                      <span className="text-xs text-slate-400">+{company.products.length - 3}</span>
                    )}
                  </div>
                )}

                <div className="border-t border-slate-100 pt-3 flex items-center justify-between gap-2">
                  {company.website ? (
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="relative z-10 text-xs text-slate-500 hover:text-blue-600 flex items-center gap-1 transition-colors min-w-0"
                    >
                      <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                          d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                      <span className="truncate max-w-[140px]">
                        {company.website.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}
                      </span>
                      <svg className="w-3 h-3 flex-shrink-0 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  ) : (
                    <span className="text-xs text-slate-300">—</span>
                  )}
                  <span className="text-xs text-slate-400 flex-shrink-0">
                    {CATEGORY_LABELS[company.category as Category]}
                    {company.founded_year ? ` · ${company.founded_year}년` : ''}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="text-slate-500 font-medium mb-1">검색 결과가 없습니다</p>
            <p className="text-slate-400 text-sm mb-4">검색어나 카테고리를 변경해보세요</p>
            <Link href="/" className="text-sm text-blue-600 font-medium hover:underline">
              전체 목록 보기
            </Link>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white mt-auto py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-xs text-slate-400">
              © 2026 BOXTER. 본 서비스의 업체 정보는 공개된 출처에서 자동 수집되었습니다.
              정보 오류·삭제 요청: privacy@pkging.kr
            </p>
            <div className="flex gap-4 text-xs text-slate-400">
              <Link href="/privacy" className="hover:text-slate-600">개인정보처리방침</Link>
              <Link href="/terms" className="hover:text-slate-600">이용약관</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
