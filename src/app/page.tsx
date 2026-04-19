import Link from 'next/link'
import { CATEGORY_LABELS, type Category } from '@/types'
import { createClient } from '@/lib/supabase/server'

const CATEGORY_ICONS: Record<Category, string> = {
  saneobyong: '🏭',
  food_grade: '🍱',
  jiryu: '📦',
  plastic: '♻️',
  metal: '⚙️',
  eco: '🌿',
}

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
    .limit(20)

  if (q) {
    query = query.ilike('name', `%${q}%`)
  }
  if (category) {
    query = query.eq('category', category)
  }

  const { data: companies } = await query

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-blue-600">
            📦 패키징 플랫폼
          </Link>
          <div className="flex gap-3">
            <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900">
              로그인
            </Link>
            <Link
              href="/signup"
              className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700"
            >
              회원가입
            </Link>
          </div>
        </div>
      </header>

      {/* Hero + Search */}
      <section className="bg-blue-600 text-white py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-3">전국 패키징 업체 디렉토리</h1>
          <p className="text-blue-100 mb-8">산업용·식품등급·지류·친환경 등 전국 패키징 업체를 한눈에 검색하세요</p>
          <form method="GET" className="flex gap-2 max-w-xl mx-auto">
            <input
              name="q"
              defaultValue={q}
              placeholder="업체명으로 검색..."
              className="flex-1 px-4 py-3 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            {category && <input type="hidden" name="category" value={category} />}
            <button
              type="submit"
              className="bg-white text-blue-600 font-semibold px-6 py-3 rounded-xl hover:bg-blue-50 transition-colors"
            >
              검색
            </button>
          </form>
        </div>
      </section>

      {/* Category Filter */}
      <section className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-wrap gap-2">
          <Link
            href={q ? `/?q=${q}` : '/'}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
              !category
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
            }`}
          >
            전체
          </Link>
          {(Object.entries(CATEGORY_LABELS) as [Category, string][]).map(([key, label]) => (
            <Link
              key={key}
              href={q ? `/?q=${q}&category=${key}` : `/?category=${key}`}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                category === key
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
              }`}
            >
              {CATEGORY_ICONS[key]} {label}
            </Link>
          ))}
        </div>
      </section>

      {/* Company List */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        {companies && companies.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {companies.map((company) => (
              <Link
                key={company.id}
                href={`/companies/${company.slug}`}
                className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-md hover:border-blue-300 transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <h2 className="font-semibold text-gray-900">{company.name}</h2>
                  {company.is_verified && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                      인증
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 line-clamp-2 mb-3">{company.description}</p>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span>
                    {CATEGORY_ICONS[company.category as Category]}{' '}
                    {CATEGORY_LABELS[company.category as Category]}
                  </span>
                  {company.province && (
                    <>
                      <span>•</span>
                      <span>
                        {company.province} {company.city}
                      </span>
                    </>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-400">
            <p className="text-4xl mb-3">📭</p>
            <p className="text-lg">검색 결과가 없습니다</p>
            <Link href="/" className="text-sm text-blue-600 hover:underline mt-2 inline-block">
              전체 목록 보기
            </Link>
          </div>
        )}
      </section>
    </div>
  )
}
