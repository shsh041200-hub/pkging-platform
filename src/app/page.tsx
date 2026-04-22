import type { Metadata } from 'next'
import Link from 'next/link'
import { BoxterLogo } from '@/components/BoxterLogo'
import {
  INDUSTRY_CATEGORIES,
  INDUSTRY_CATEGORY_LABELS,
  INDUSTRY_CATEGORY_ICONS,
  MATERIAL_TYPES,
  MATERIAL_TYPE_LABELS,
  type IndustryCategory,
  type MaterialType,
} from '@/types'
import { createClient } from '@/lib/supabase/server'
import { simplifyCompanyName } from '@/lib/simplify-company-name'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://packlinx.com'

type SearchParams = Promise<{
  q?: string
  industry?: string
  material?: string
}>

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams
}): Promise<Metadata> {
  const { q, industry, material } = await searchParams
  if (q) return { robots: { index: false, follow: true } }
  if (industry || material) return { alternates: { canonical: siteUrl } }
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

function categoryToSlug(key: IndustryCategory): string {
  return key
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const { q, industry, material } = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('companies')
    .select('id, slug, name, description, category, industry_categories, material_type, tags, is_verified, products, certifications, founded_year, website, service_capabilities, target_industries, data_source')
    .order('is_verified', { ascending: false })
    .order('name')
    .limit(60)

  if (q) {
    query = query.or(`name.ilike.%${q}%,description.ilike.%${q}%`)
  }
  if (industry) {
    query = query.contains('industry_categories', [industry])
  }
  if (material) {
    query = query.eq('material_type', material)
  }

  const { data: companies } = await query

  const { count: totalCount } = await supabase
    .from('companies')
    .select('*', { count: 'exact', head: true })

  const categoryCounts: Record<string, number> = {}
  for (const cat of INDUSTRY_CATEGORIES) {
    const { count } = await supabase
      .from('companies')
      .select('*', { count: 'exact', head: true })
      .contains('industry_categories', [cat])
    categoryCounts[cat] = count ?? 0
  }

  const buildUrl = (overrides: Record<string, string | undefined>) => {
    const params: Record<string, string> = {}
    if (q) params.q = q
    if (industry) params.industry = industry
    if (material) params.material = material
    Object.assign(params, overrides)
    Object.keys(params).forEach((k) => { if (params[k] === undefined) delete params[k] })
    const qs = new URLSearchParams(params).toString()
    return qs ? `/?${qs}` : '/'
  }

  const showingCategory = !q && !industry && !material

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Header */}
      <header className="bg-[#0A0F1E] sticky top-0 z-50 border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <BoxterLogo variant="dark" size="sm" />
            <span className="hidden sm:inline text-white/25 text-[11px] font-medium tracking-widest uppercase">전국 패키징 파트너, 한 번에</span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/blog" className="text-white/70 hover:text-white text-[13px] font-medium transition-colors">
              가이드
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero — heading on top, then search (left) + categories (right) */}
      <section className="bg-[#F8FAFC] bg-dot-grid border-b border-gray-100 pt-8 pb-8 sm:pt-10 sm:pb-10 px-5">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <div className="inline-block text-[11px] font-semibold tracking-widest uppercase text-[#005EFF] bg-[#EBF2FF] px-3 py-1.5 rounded-full mb-3">
              국내 패키징 플랫폼
            </div>
            <h1 className="text-[28px] sm:text-[36px] font-extrabold text-gray-900 leading-[1.15] tracking-[-0.04em]">
              전국 패키징 파트너, 한 번에
            </h1>
            <p className="text-gray-500 text-[15px] mt-2 leading-relaxed">
              B2B 포장 파트너를 바로 찾으세요.
            </p>
          </div>

          <div className="flex flex-col md:flex-row md:items-start md:gap-8">
            {/* Left: search */}
            <div className="md:flex-1 md:max-w-lg">
              <form method="GET" className="flex rounded-xl overflow-hidden border border-gray-200 shadow-[0_2px_8px_rgba(0,0,0,0.06)] focus-within:border-[#005EFF] focus-within:shadow-[0_2px_8px_rgba(0,0,0,0.06),0_0_0_3px_rgba(0,94,255,0.12)] transition-shadow">
                <input
                  name="q"
                  defaultValue={q}
                  placeholder="업체명, 제품, 인증으로 검색..."
                  className="flex-1 px-5 py-3.5 text-[15px] text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none"
                />
                <button
                  type="submit"
                  className="bg-[#005EFF] hover:bg-[#0047CC] text-white font-semibold px-6 py-3 transition-colors text-sm flex-shrink-0 m-1.5 rounded-lg"
                >
                  검색
                </button>
              </form>
              {totalCount != null && (
                <div className="flex items-center gap-3 mt-3 text-[12px] text-gray-400 font-medium">
                  <span>{totalCount.toLocaleString()}개 업체 등록됨</span>
                  <span className="text-gray-200">·</span>
                  <span>무료 이용</span>
                </div>
              )}
            </div>

            {/* Right: 6 category buttons */}
            {showingCategory && (
              <div className="mt-6 md:mt-0 md:flex-1">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {INDUSTRY_CATEGORIES.filter((cat) => categoryCounts[cat] > 0).map((cat) => (
                    <form key={cat} action={`/categories/${categoryToSlug(cat)}`} className="contents">
                      <button
                        type="submit"
                        className="group flex items-center gap-2.5 bg-white border border-gray-200 rounded-lg px-3 py-2.5 hover:border-[#005EFF]/30 hover:bg-[#F8FAFF] transition-all duration-150"
                      >
                        <span className="text-base flex-shrink-0">{INDUSTRY_CATEGORY_ICONS[cat]}</span>
                        <div className="min-w-0 text-left">
                          <span className="text-[13px] font-semibold text-gray-900 group-hover:text-[#005EFF] transition-colors block truncate">
                            {INDUSTRY_CATEGORY_LABELS[cat]}
                          </span>
                          <span className="text-[11px] text-gray-400">{categoryCounts[cat]}개</span>
                        </div>
                      </button>
                    </form>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Filter Bar — only when search/filter active */}
      {!showingCategory && (
        <div className="bg-white border-b border-gray-100 sticky top-16 z-40">
          <div className="max-w-7xl mx-auto px-5 sm:px-8">
            {/* Industry tabs */}
            <div className="flex gap-0.5 pt-2 overflow-x-auto scrollbar-none">
              <Link
                href={q ? `/?q=${q}` : '/'}
                className={`flex-shrink-0 px-4 py-2.5 text-[13px] font-medium transition-all border-b-2 ${
                  !industry
                    ? 'border-gray-900 text-gray-900 font-semibold'
                    : 'border-transparent text-gray-400 hover:text-gray-700'
                }`}
              >
                전체
              </Link>
              {INDUSTRY_CATEGORIES.filter((cat) => categoryCounts[cat] > 0).map((cat) => (
                <Link
                  key={cat}
                  href={buildUrl({
                    industry: industry === cat ? undefined : cat,
                    material: industry === cat ? undefined : material,
                  })}
                  className={`flex-shrink-0 px-4 py-2.5 text-[13px] font-medium transition-all border-b-2 whitespace-nowrap ${
                    industry === cat
                      ? 'border-gray-900 text-gray-900 font-semibold'
                      : 'border-transparent text-gray-400 hover:text-gray-700'
                  }`}
                >
                  {INDUSTRY_CATEGORY_LABELS[cat]}
                </Link>
              ))}
            </div>

            {/* Material chips */}
            <div className="flex gap-1.5 py-2.5 overflow-x-auto scrollbar-none">
              <span className="flex-shrink-0 text-[10px] font-semibold text-gray-300 uppercase tracking-widest self-center mr-1 hidden sm:inline">소재</span>
              {MATERIAL_TYPES.map((mat) => (
                <Link
                  key={mat}
                  href={buildUrl({
                    material: material === mat ? undefined : mat,
                  })}
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
      )}

      {/* Results — only when search/filter active */}
      {!showingCategory && <section className="max-w-7xl mx-auto px-5 sm:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5 flex-wrap">
            <p className="text-sm text-gray-500">
              <span className="font-semibold text-gray-900">{companies?.length ?? 0}</span>개 업체
            </p>
            {industry && (
              <span className="text-[11px] bg-[#EBF2FF] text-[#005EFF] font-medium px-2.5 py-1 rounded-full">
                {INDUSTRY_CATEGORY_LABELS[industry as IndustryCategory]}
              </span>
            )}
            {material && (
              <span className="text-[11px] bg-[#EBF2FF] text-[#005EFF] font-medium px-2.5 py-1 rounded-full">
                {MATERIAL_TYPE_LABELS[material as MaterialType]}
              </span>
            )}
            {q && (
              <span className="text-[11px] bg-[#EBF2FF] text-[#005EFF] font-medium px-2.5 py-1 rounded-full">
                &ldquo;{q}&rdquo;
              </span>
            )}
            {(industry || material || q) && (
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
                className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-gray-300 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08),0_2px_4px_rgba(0,0,0,0.04)] hover:-translate-y-px transition-all duration-200 group relative flex flex-col min-h-[260px] max-h-[280px]"
              >
                <div className="p-6 flex flex-col flex-1 overflow-hidden">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex flex-wrap gap-1.5">
                      {(company.industry_categories as string[])?.slice(0, 2).map((cat: string) => (
                        <span key={cat} className="text-[11px] font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                          {INDUSTRY_CATEGORY_LABELS[cat as IndustryCategory] ?? cat}
                        </span>
                      ))}
                    </div>
                  </div>

                  <h2 className="text-base font-bold text-gray-900 mb-1 leading-snug tracking-[-0.02em] line-clamp-1" title={company.name}>
                    <Link
                      href={`/companies/${company.slug}`}
                      className="after:absolute after:inset-0 after:content-['']"
                    >
                      {simplifyCompanyName(company.name)}
                    </Link>
                  </h2>

                  <p className="text-[13px] text-gray-500 leading-relaxed line-clamp-2 mb-3 flex-1">
                    {company.description ?? ''}
                  </p>

                  {(company.certifications as string[] | null)?.length! > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {(company.certifications as string[]).slice(0, 2).map((cert, i) => (
                        <span key={i} className="text-[11px] font-medium text-gray-700 bg-gray-100 px-2 py-0.5 rounded">
                          {cert}
                        </span>
                      ))}
                      {(company.certifications as string[]).length > 2 && (
                        <span className="text-[11px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                          +{(company.certifications as string[]).length - 2}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="border-t border-gray-100 pt-3 mt-auto flex items-center justify-between gap-2">
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
                    <span className="text-[11px] text-gray-400">
                      {company.material_type ? MATERIAL_TYPE_LABELS[company.material_type as MaterialType] : ''}
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
            <p className="text-gray-400 text-sm mb-5">검색어나 카테고리를 변경해보세요</p>
            <Link href="/" className="text-sm text-gray-900 font-medium hover:underline underline-offset-4">
              전체 목록 보기 →
            </Link>
          </div>
        )}
      </section>}

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-gray-50 mt-auto py-8">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-[12px] text-gray-400 leading-relaxed">
              © 2026 BOXTER. 본 서비스의 업체 정보는 공개된 출처에서 자동 수집되었습니다.<br className="hidden sm:inline" />
              정보 오류·삭제 요청: privacy@pkging.kr
            </p>
            <div className="flex gap-5 text-[12px] text-gray-400">
              <Link href="/blog" className="hover:text-gray-600 transition-colors">패키징 가이드</Link>
              <Link href="/privacy" className="hover:text-gray-600 transition-colors">개인정보처리방침</Link>
              <Link href="/terms" className="hover:text-gray-600 transition-colors">이용약관</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
