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
    <div className="min-h-screen bg-[#FAFBFC]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Header */}
      <header className="bg-[#0F172A] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <BoxterLogo variant="dark" size="sm" />
            <span className="hidden sm:inline text-white/30 text-[11px] font-medium tracking-wide uppercase">B2B 포장업체 디렉토리</span>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-[#0F172A] pt-16 pb-20 sm:pt-20 sm:pb-28 px-5">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-3xl sm:text-[44px] font-bold text-white leading-[1.2] tracking-tight">
            국내 포장업체<br className="sm:hidden" /> 전문 디렉토리
          </h1>
          <p className="text-slate-400 text-base sm:text-lg mt-5 mb-10 leading-relaxed">
            어떤 제품을 포장하시나요? B2B 포장 파트너를 바로 찾으세요.
          </p>
          <form method="GET" className="flex max-w-xl mx-auto rounded-lg overflow-hidden shadow-2xl ring-1 ring-white/5">
            <input
              name="q"
              defaultValue={q}
              placeholder="업체명, 제품, 인증, 지역으로 검색..."
              className="flex-1 px-6 py-4 text-[15px] text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none"
            />
            {buyer_category && <input type="hidden" name="buyer_category" value={buyer_category} />}
            {packaging_form && <input type="hidden" name="packaging_form" value={packaging_form} />}
            {category && <input type="hidden" name="category" value={category} />}
            {tag && <input type="hidden" name="tag" value={tag} />}
            <button
              type="submit"
              className="bg-[#1D4ED8] hover:bg-[#1E40AF] text-white font-semibold px-7 py-4 transition-colors text-sm flex-shrink-0"
            >
              검색
            </button>
          </form>
          {totalCount != null && (
            <p className="text-slate-500 text-xs mt-5 font-medium">{totalCount.toLocaleString()}개 업체 등록됨</p>
          )}
        </div>
      </section>

      {/* Filter Bar */}
      <div className="bg-white border-b border-slate-100 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">

          {/* Level 1 */}
          <div className="flex gap-1.5 pt-4 pb-2.5 overflow-x-auto scrollbar-none">
            <span className="flex-shrink-0 text-[11px] font-semibold text-slate-400 uppercase tracking-wider self-center mr-2 hidden sm:inline">유형</span>
            <Link
              href={q ? `/?q=${q}` : '/'}
              className={`flex-shrink-0 px-4 py-2 rounded-md text-[13px] font-medium transition-all ${
                !buyer_category && !packaging_form && !category && !tag
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
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
                className={`flex-shrink-0 px-4 py-2 rounded-md text-[13px] font-medium transition-all ${
                  buyer_category === key
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                {BUYER_CATEGORY_LABELS[key]}
              </Link>
            ))}
          </div>

          {/* Level 2 */}
          <div className="flex gap-1.5 pb-3 overflow-x-auto scrollbar-none">
            <span className="flex-shrink-0 text-[11px] font-semibold text-slate-400 uppercase tracking-wider self-center mr-2 hidden sm:inline">형태</span>
            {level2Options.map((key) => (
              <Link
                key={key}
                href={buildUrl({
                  packaging_form: packaging_form === key ? undefined : key,
                })}
                className={`flex-shrink-0 px-3.5 py-1.5 rounded-md text-xs font-medium transition-all border ${
                  packaging_form === key
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'text-slate-500 border-slate-200 hover:text-slate-700 hover:border-slate-300 bg-white'
                }`}
              >
                {PACKAGING_FORM_LABELS[key]}
              </Link>
            ))}
          </div>

          {/* Level 3 */}
          <FilterAccordion>
            <div className="flex gap-1.5 flex-wrap">
              <span className="text-[11px] text-slate-400 font-medium self-center mr-1">소재</span>
              {(Object.entries(CATEGORY_LABELS) as [Category, string][]).map(([key, label]) => (
                <Link
                  key={key}
                  href={buildUrl({ category: category === key ? undefined : key })}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-md text-xs font-medium transition-all border ${
                    category === key
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'text-slate-500 border-slate-200 hover:border-slate-300 hover:text-slate-700 bg-white'
                  }`}
                >
                  {label}
                </Link>
              ))}
            </div>
            <div className="flex gap-1.5 flex-wrap">
              <span className="text-[11px] text-slate-400 font-medium self-center mr-1">기능</span>
              {(Object.entries(TAG_LABELS) as [CompanyTag, string][]).map(([key, label]) => (
                <Link
                  key={key}
                  href={buildUrl({ tag: tag === key ? undefined : key })}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-md text-xs font-medium transition-all border ${
                    tag === key
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'text-slate-500 border-slate-200 hover:border-slate-300 hover:text-slate-700 bg-white'
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
            <p className="text-sm text-slate-500">
              <span className="font-semibold text-slate-900">{companies?.length ?? 0}</span>개 업체
            </p>
            {activeFilters.map((f, i) => (
              <span key={i} className="text-[11px] bg-slate-100 text-slate-600 font-medium px-2.5 py-1 rounded-md">
                {f}
              </span>
            ))}
            {q && (
              <span className="text-[11px] bg-slate-100 text-slate-600 font-medium px-2.5 py-1 rounded-md">
                &ldquo;{q}&rdquo;
              </span>
            )}
            {(buyer_category || packaging_form || category || tag || q) && (
              <Link href="/" className="text-xs text-slate-400 hover:text-slate-600 ml-1">
                초기화
              </Link>
            )}
          </div>
        </div>

        {companies && companies.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {companies.map((company) => (
              <article
                key={company.id}
                className="bg-white border border-slate-200/80 rounded-xl p-5 hover:border-slate-300 hover:shadow-[0_4px_12px_rgba(15,23,42,0.06)] transition-all duration-200 group relative"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex flex-wrap gap-1.5">
                    {company.buyer_category && (
                      <span className="text-[11px] font-medium bg-slate-50 text-slate-600 px-2.5 py-1 rounded-md border border-slate-100">
                        {BUYER_CATEGORY_LABELS[company.buyer_category as BuyerCategory]}
                      </span>
                    )}
                    {company.packaging_form && (
                      <span className="text-[11px] font-medium bg-slate-50 text-slate-500 px-2.5 py-1 rounded-md border border-slate-100">
                        {PACKAGING_FORM_LABELS[company.packaging_form as PackagingForm]}
                      </span>
                    )}
                  </div>
                  {company.is_verified && (
                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md flex-shrink-0 ml-2">
                      인증
                    </span>
                  )}
                </div>

                <h2 className="text-[15px] font-bold text-slate-900 mb-1 group-hover:text-slate-700 transition-colors leading-snug">
                  <Link
                    href={`/companies/${company.slug}`}
                    className="after:absolute after:inset-0 after:content-['']"
                  >
                    {company.name}
                  </Link>
                </h2>

                {company.province && (
                  <p className="text-xs text-slate-400 mb-2.5">
                    {company.province}{company.city ? ` ${company.city}` : ''}
                  </p>
                )}

                <p className="text-[13px] text-slate-500 leading-relaxed line-clamp-2 mb-3.5">
                  {company.description ?? ''}
                </p>

                {company.products && company.products.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3.5">
                    {(company.products as string[]).slice(0, 3).map((p, i) => (
                      <span key={i} className="text-[11px] bg-slate-50 text-slate-500 px-2 py-0.5 rounded">
                        {p}
                      </span>
                    ))}
                    {company.products.length > 3 && (
                      <span className="text-[11px] text-slate-400">+{company.products.length - 3}</span>
                    )}
                  </div>
                )}

                <div className="border-t border-slate-100 pt-3.5 flex items-center justify-between gap-2">
                  {company.website ? (
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="relative z-10 text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1.5 transition-colors min-w-0"
                    >
                      <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                          d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                      <span className="truncate max-w-[140px]">
                        {company.website.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}
                      </span>
                    </a>
                  ) : (
                    <span className="text-xs text-slate-300">—</span>
                  )}
                  <span className="text-[11px] text-slate-400 flex-shrink-0">
                    {CATEGORY_LABELS[company.category as Category]}
                    {company.founded_year ? ` · ${company.founded_year}` : ''}
                  </span>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="text-center py-24">
            <div className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="text-slate-600 font-medium mb-1.5">검색 결과가 없습니다</p>
            <p className="text-slate-400 text-sm mb-5">검색어나 카테고리를 변경해보세요</p>
            <Link href="/" className="text-sm text-slate-900 font-medium hover:underline underline-offset-4">
              전체 목록 보기 →
            </Link>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-white mt-auto py-8">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-xs text-slate-400 leading-relaxed">
              © 2026 BOXTER. 본 서비스의 업체 정보는 공개된 출처에서 자동 수집되었습니다.<br className="hidden sm:inline" />
              정보 오류·삭제 요청: privacy@pkging.kr
            </p>
            <div className="flex gap-5 text-xs text-slate-400">
              <Link href="/privacy" className="hover:text-slate-600 transition-colors">개인정보처리방침</Link>
              <Link href="/terms" className="hover:text-slate-600 transition-colors">이용약관</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
