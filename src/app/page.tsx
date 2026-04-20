import Link from 'next/link'
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
    .select('id, slug, name, description, category, buyer_category, packaging_form, tags, city, province, is_verified, products, certifications, founded_year')
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
      {/* Header */}
      <header className="bg-[#0d1d2e] sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="text-white font-bold text-lg tracking-wide">K&amp;P</span>
            <span className="text-slate-400 text-xs hidden sm:inline">B2B 포장업체 디렉토리</span>
          </Link>
        </div>
      </header>

      {/* Hero + Search */}
      <section className="bg-[#0d1d2e] py-12 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">
            국내 포장업체 전문 디렉토리
          </h1>
          <p className="text-slate-300 text-base sm:text-lg mt-3 mb-7">
            어떤 제품을 포장하시나요? 제품 유형부터 선택해 B2B 포장 파트너를 찾으세요
          </p>
          <form method="GET" className="flex max-w-xl mx-auto shadow-lg">
            <input
              name="q"
              defaultValue={q}
              placeholder="업체명, 제품, 인증, 지역으로 검색..."
              className="flex-1 px-5 py-3.5 rounded-l-lg text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/40"
            />
            {buyer_category && <input type="hidden" name="buyer_category" value={buyer_category} />}
            {packaging_form && <input type="hidden" name="packaging_form" value={packaging_form} />}
            {category && <input type="hidden" name="category" value={category} />}
            {tag && <input type="hidden" name="tag" value={tag} />}
            <button
              type="submit"
              className="bg-[#1e3a5f] text-white font-semibold px-6 py-3.5 rounded-r-lg hover:bg-[#162d4a] transition-colors text-sm"
            >
              검색
            </button>
          </form>
          {totalCount != null && (
            <p className="text-slate-400 text-xs mt-3">{totalCount.toLocaleString()}개 업체 등록됨</p>
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
                  ? 'bg-[#0d1d2e] text-white'
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
                    ? 'bg-[#1e3a5f] text-white'
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
                className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors border ${
                  packaging_form === key
                    ? 'bg-[#1e3a5f] text-white border-[#1e3a5f]'
                    : 'text-slate-500 border-slate-200 hover:text-slate-700 hover:border-slate-400 bg-white'
                }`}
              >
                {packaging_form === key ? `✓ ${PACKAGING_FORM_LABELS[key]}` : PACKAGING_FORM_LABELS[key]}
              </Link>
            ))}
          </div>

          {/* Level 3: 소재 + 태그 (접힌 세부 필터) */}
          <details className="group pb-2">
            <summary className="text-xs text-slate-400 cursor-pointer hover:text-slate-600 select-none list-none flex items-center gap-1 w-fit">
              <span className="group-open:hidden">▸</span>
              <span className="hidden group-open:inline">▾</span>
              소재 / 기능 태그 세부 필터
            </summary>
            <div className="pt-2 flex flex-wrap gap-2">
              <div className="flex gap-1 flex-wrap">
                <span className="text-xs text-slate-400 self-center">소재:</span>
                {(Object.entries(CATEGORY_LABELS) as [Category, string][]).map(([key, label]) => (
                  <Link
                    key={key}
                    href={buildUrl({ category: category === key ? undefined : key })}
                    className={`flex-shrink-0 px-2.5 py-0.5 rounded text-xs font-medium transition-colors border ${
                      category === key
                        ? 'bg-slate-700 text-white border-slate-700'
                        : 'text-slate-500 border-slate-200 hover:border-slate-400 bg-white'
                    }`}
                  >
                    {category === key ? `✓ ${label}` : label}
                  </Link>
                ))}
              </div>
              <div className="flex gap-1 flex-wrap">
                <span className="text-xs text-slate-400 self-center">기능:</span>
                {(Object.entries(TAG_LABELS) as [CompanyTag, string][]).map(([key, label]) => (
                  <Link
                    key={key}
                    href={buildUrl({ tag: tag === key ? undefined : key })}
                    className={`flex-shrink-0 px-2.5 py-0.5 rounded text-xs font-medium transition-colors border ${
                      tag === key
                        ? 'bg-slate-700 text-white border-slate-700'
                        : 'text-slate-500 border-slate-200 hover:border-slate-400 bg-white'
                    }`}
                  >
                    {tag === key ? `✓ ${label}` : label}
                  </Link>
                ))}
              </div>
            </div>
          </details>
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
              <span key={i} className="text-xs bg-[#1e3a5f]/10 text-[#1e3a5f] font-medium px-2.5 py-1 rounded-full">
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
              <Link
                key={company.id}
                href={`/companies/${company.slug}`}
                className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 hover:shadow-[0_4px_20px_rgba(0,0,0,0.07)] transition-all duration-200 block group"
              >
                {/* Top: buyer_category + packaging_form + verified */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {company.buyer_category && (
                      <span className="text-xs font-medium bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md">
                        {BUYER_CATEGORY_LABELS[company.buyer_category as BuyerCategory]}
                      </span>
                    )}
                    {company.packaging_form && (
                      <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                        {PACKAGING_FORM_LABELS[company.packaging_form as PackagingForm]}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {company.founded_year && (
                      <span className="text-xs text-slate-400">est. {company.founded_year}</span>
                    )}
                    {company.is_verified && (
                      <span className="inline-flex items-center gap-0.5 text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
                        ✓ 인증
                      </span>
                    )}
                  </div>
                </div>

                <h2 className="text-base font-semibold text-slate-900 mb-1.5 group-hover:text-[#1e3a5f] transition-colors">
                  {company.name}
                </h2>

                <p className="text-sm text-slate-500 leading-relaxed line-clamp-2 mb-3">
                  {company.description ?? ''}
                </p>

                {company.products && company.products.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2.5">
                    {(company.products as string[]).slice(0, 3).map((p, i) => (
                      <span key={i} className="text-xs bg-slate-50 border border-slate-200 text-slate-600 px-2 py-0.5 rounded">
                        {p}
                      </span>
                    ))}
                    {company.products.length > 3 && (
                      <span className="text-xs text-slate-400 px-1 self-center">+{company.products.length - 3}</span>
                    )}
                  </div>
                )}

                {company.certifications && company.certifications.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2.5">
                    {(company.certifications as string[]).slice(0, 2).map((cert, i) => (
                      <span key={i} className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded">
                        ✓ {cert}
                      </span>
                    ))}
                    {company.certifications.length > 2 && (
                      <span className="text-xs text-slate-400 self-center">+{company.certifications.length - 2}</span>
                    )}
                  </div>
                )}

                {/* Level 3 chips (material + tags, compact) */}
                <div className="flex flex-wrap gap-1 mb-3">
                  <span className="text-xs bg-slate-50 border border-slate-100 text-slate-500 px-2 py-0.5 rounded">
                    {CATEGORY_LABELS[company.category as Category]}
                  </span>
                  {company.tags && (company.tags as string[]).slice(0, 2).map((t) => (
                    <span key={t} className="text-xs bg-slate-50 border border-slate-100 text-slate-500 px-2 py-0.5 rounded">
                      {TAG_LABELS[t as CompanyTag] ?? t}
                    </span>
                  ))}
                </div>

                <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
                  {company.province && (
                    <span className="text-xs text-slate-400">
                      📍 {company.province} {company.city}
                    </span>
                  )}
                  <span className="text-xs font-medium text-[#1e3a5f] group-hover:underline ml-auto">
                    상세보기 →
                  </span>
                </div>
              </Link>
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
            <Link href="/" className="text-sm text-[#1e3a5f] font-medium hover:underline">
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
              © 2026 Korea Pack. 본 서비스의 업체 정보는 공개된 출처에서 자동 수집되었습니다.
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
