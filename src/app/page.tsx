import Link from 'next/link'
import { CATEGORY_LABELS, TAG_LABELS, type Category, type CompanyTag } from '@/types'
import { createClient } from '@/lib/supabase/server'

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; tag?: string }>
}) {
  const { q, category, tag } = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('companies')
    .select('id, slug, name, description, category, tags, city, province, is_verified, products, certifications, founded_year')
    .order('is_verified', { ascending: false })
    .order('name')
    .limit(60)

  if (q) {
    query = query.or(
      `name.ilike.%${q}%,description.ilike.%${q}%,city.ilike.%${q}%,province.ilike.%${q}%`
    )
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

  const activeFilters = [
    category && CATEGORY_LABELS[category as Category],
    tag && TAG_LABELS[tag as CompanyTag],
  ].filter(Boolean)

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-[#0d1d2e] sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="text-white font-bold text-lg tracking-wide">PKGING</span>
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
            지류·플라스틱·금속·친환경 — B2B 포장 파트너를 빠르게 찾으세요
          </p>
          <form method="GET" className="flex max-w-xl mx-auto shadow-lg">
            <input
              name="q"
              defaultValue={q}
              placeholder="업체명, 제품, 인증, 지역으로 검색..."
              className="flex-1 px-5 py-3.5 rounded-l-lg text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/40"
            />
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

      {/* Category + Tag Filter Bar */}
      <div className="bg-white border-b border-slate-100 sticky top-14 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {/* 소재 카테고리 탭 */}
          <div className="flex gap-1 pt-3 pb-2 overflow-x-auto scrollbar-none">
            <Link
              href={q ? `/?q=${q}` : '/'}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                !category && !tag
                  ? 'bg-[#0d1d2e] text-white'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
              }`}
            >
              전체
            </Link>
            {(Object.entries(CATEGORY_LABELS) as [Category, string][]).map(([key, label]) => (
              <Link
                key={key}
                href={
                  tag
                    ? q ? `/?q=${q}&category=${key}&tag=${tag}` : `/?category=${key}&tag=${tag}`
                    : q ? `/?q=${q}&category=${key}` : `/?category=${key}`
                }
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  category === key
                    ? 'bg-[#1e3a5f] text-white'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                }`}
              >
                {label}
              </Link>
            ))}
          </div>
          {/* 기능 태그 토글 */}
          <div className="flex gap-1.5 pb-3 overflow-x-auto scrollbar-none">
            {(Object.entries(TAG_LABELS) as [CompanyTag, string][]).map(([key, label]) => (
              <Link
                key={key}
                href={
                  tag === key
                    ? category ? (q ? `/?q=${q}&category=${category}` : `/?category=${category}`) : (q ? `/?q=${q}` : '/')
                    : category
                      ? q ? `/?q=${q}&category=${category}&tag=${key}` : `/?category=${category}&tag=${key}`
                      : q ? `/?q=${q}&tag=${key}` : `/?tag=${key}`
                }
                className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors border ${
                  tag === key
                    ? 'bg-[#1e3a5f] text-white border-[#1e3a5f]'
                    : 'text-slate-500 border-slate-200 hover:text-slate-700 hover:border-slate-400 bg-white'
                }`}
              >
                {tag === key ? `✓ ${label}` : label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Results Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-7">
        {/* Results header */}
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
            {(category || tag || q) && (
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
                {/* Top: category + verified */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md">
                    {CATEGORY_LABELS[company.category as Category]}
                  </span>
                  <div className="flex items-center gap-1.5">
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

                {/* Company name */}
                <h2 className="text-base font-semibold text-slate-900 mb-1.5 group-hover:text-[#1e3a5f] transition-colors">
                  {company.name}
                </h2>

                {/* Description */}
                <p className="text-sm text-slate-500 leading-relaxed line-clamp-2 mb-3">
                  {company.description ?? ''}
                </p>

                {/* Products preview */}
                {company.products && company.products.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2.5">
                    {(company.products as string[]).slice(0, 3).map((p, i) => (
                      <span
                        key={i}
                        className="text-xs bg-slate-50 border border-slate-200 text-slate-600 px-2 py-0.5 rounded"
                      >
                        {p}
                      </span>
                    ))}
                    {company.products.length > 3 && (
                      <span className="text-xs text-slate-400 px-1 self-center">+{company.products.length - 3}</span>
                    )}
                  </div>
                )}

                {/* Certifications */}
                {company.certifications && company.certifications.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2.5">
                    {(company.certifications as string[]).slice(0, 2).map((cert, i) => (
                      <span
                        key={i}
                        className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded"
                      >
                        ✓ {cert}
                      </span>
                    ))}
                    {company.certifications.length > 2 && (
                      <span className="text-xs text-slate-400 self-center">+{company.certifications.length - 2}</span>
                    )}
                  </div>
                )}

                {/* Tags */}
                {company.tags && company.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {(company.tags as string[]).slice(0, 3).map((t) => (
                      <span
                        key={t}
                        className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full"
                      >
                        {TAG_LABELS[t as CompanyTag] ?? t}
                      </span>
                    ))}
                  </div>
                )}

                {/* Footer */}
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
              <svg
                className="w-8 h-8 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
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
              © 2026 PKGING. 본 서비스의 업체 정보는 공개된 출처에서 자동 수집되었습니다.
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
