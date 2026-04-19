import Link from 'next/link'
import { CATEGORY_LABELS, type Category } from '@/types'
import { createClient } from '@/lib/supabase/server'

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>
}) {
  const { q, category } = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('companies')
    .select('id, slug, name, description, category, city, province, is_verified')
    .order('is_verified', { ascending: false })
    .order('name')
    .limit(60)

  if (q) {
    query = query.ilike('name', `%${q}%`)
  }
  if (category) {
    query = query.eq('category', category)
  }

  const { data: companies } = await query

  const { count: totalCount } = await supabase
    .from('companies')
    .select('*', { count: 'exact', head: true })

  return (
    <div className="min-h-screen">
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
      <section className="bg-[#0d1d2e] py-14 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">
            국내 포장업체 전문 디렉토리
          </h1>
          <p className="text-slate-300 text-base sm:text-lg mt-3 mb-8">
            산업용·식품등급·지류·친환경 — B2B 포장 파트너를 빠르게 찾으세요
          </p>
          <form method="GET" className="flex max-w-xl mx-auto shadow-lg">
            <input
              name="q"
              defaultValue={q}
              placeholder="업체명, 제품, 인증으로 검색..."
              className="flex-1 px-5 py-3.5 rounded-l-lg text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/40"
            />
            {category && <input type="hidden" name="category" value={category} />}
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

      {/* Category Filter */}
      <div className="bg-white border-b border-slate-100 sticky top-14 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex gap-1 py-3 overflow-x-auto scrollbar-none">
            <Link
              href={q ? `/?q=${q}` : '/'}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                !category
                  ? 'bg-[#1e3a5f] text-white'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
              }`}
            >
              전체
            </Link>
            {(Object.entries(CATEGORY_LABELS) as [Category, string][]).map(([key, label]) => (
              <Link
                key={key}
                href={q ? `/?q=${q}&category=${key}` : `/?category=${key}`}
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
        </div>
      </div>

      {/* Results Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-8 pb-16">
        {/* Results header */}
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm text-slate-500">
            <span className="font-semibold text-slate-900">{companies?.length ?? 0}개</span> 업체
            {category && ` · ${CATEGORY_LABELS[category as Category]}`}
            {q && ` · "${q}"`}
          </p>
        </div>

        {companies && companies.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {companies.map((company) => (
              <Link
                key={company.id}
                href={`/companies/${company.slug}`}
                className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-all duration-200 block group"
              >
                {/* Top: category + verified */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md">
                    {CATEGORY_LABELS[company.category as Category]}
                  </span>
                  {company.is_verified && (
                    <span className="inline-flex items-center gap-1 text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
                      ✓ 인증
                    </span>
                  )}
                </div>

                {/* Company name */}
                <h2 className="text-base font-semibold text-slate-900 mb-1.5 group-hover:text-[#1e3a5f] transition-colors">
                  {company.name}
                </h2>

                {/* Description */}
                <p className="text-sm text-slate-500 leading-relaxed line-clamp-2 mb-4">
                  {company.description ?? ''}
                </p>

                {/* Footer */}
                <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
                  {company.province && (
                    <span className="text-xs text-slate-400">
                      {company.province} {company.city}
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
    </div>
  )
}
