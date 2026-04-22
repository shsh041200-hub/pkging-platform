import type { Metadata } from 'next'
import Link from 'next/link'
import { BoxterLogo } from '@/components/BoxterLogo'
import {
  INDUSTRY_CATEGORIES,
  INDUSTRY_CATEGORY_LABELS,
  INDUSTRY_CATEGORY_ICONS,
  MATERIAL_TYPES,
  MATERIAL_TYPE_LABELS,
  PACKAGING_FORMS,
  PACKAGING_FORM_LABELS,
  CERTIFICATION_TYPES,
  CERTIFICATION_CATEGORY_LABELS,
  type IndustryCategory,
  type MaterialType,
  type PackagingForm,
  type CertificationCategory,
} from '@/types'
import { createClient } from '@/lib/supabase/server'
import { simplifyCompanyName } from '@/lib/simplify-company-name'
import { CertFilterAccordion } from './CertFilterAccordion'
import { CompanyIcon } from '@/components/CompanyIcon'
import { WebsiteFavicon } from '@/components/WebsiteFavicon'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://packlinx.com'

type SearchParams = Promise<{
  q?: string
  industry?: string
  material?: string
  form?: string
  cert?: string
  sort?: string
}>

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams
}): Promise<Metadata> {
  const { q, industry, material, form, cert } = await searchParams
  if (q) return { robots: { index: false, follow: true } }
  if (industry || material || form || cert) return { alternates: { canonical: siteUrl } }
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

const CERT_CATEGORY_COLORS: Record<CertificationCategory, { active: string; inactive: string }> = {
  quality:       { active: 'bg-blue-500 text-white border-blue-500',   inactive: 'text-blue-700 border-blue-200 bg-blue-50 hover:border-blue-400' },
  food_safety:   { active: 'bg-green-600 text-white border-green-600', inactive: 'text-green-700 border-green-200 bg-green-50 hover:border-green-400' },
  environmental: { active: 'bg-emerald-600 text-white border-emerald-600', inactive: 'text-emerald-700 border-emerald-200 bg-emerald-50 hover:border-emerald-400' },
  pharma:        { active: 'bg-purple-600 text-white border-purple-600', inactive: 'text-purple-700 border-purple-200 bg-purple-50 hover:border-purple-400' },
  general:       { active: 'bg-gray-700 text-white border-gray-700',   inactive: 'text-gray-600 border-gray-200 bg-gray-50 hover:border-gray-400' },
}

function categoryToSlug(key: IndustryCategory): string {
  return key
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const { q, industry, material, form, cert, sort } = await searchParams
  const supabase = await createClient()

  const activeCerts = cert ? cert.split(',').filter(Boolean) : []
  const selectedMaterials: MaterialType[] = material
    ? (material.split(',').filter((m): m is MaterialType => MATERIAL_TYPES.includes(m as MaterialType)))
    : []
  const selectedForms: PackagingForm[] = form
    ? (form.split(',').filter((f): f is PackagingForm => PACKAGING_FORMS.includes(f as PackagingForm)))
    : []

  let query = supabase
    .from('companies')
    .select('id, slug, name, description, category, industry_categories, material_type, packaging_form, tags, is_verified, cert_count, products, certifications, founded_year, website, icon_url, service_capabilities, target_industries, data_source, review_count, avg_rating')
    .order('is_verified', { ascending: false })
    .order('cert_count', { ascending: false })
    .limit(60)

  if (q) {
    query = query.or(`name.ilike.%${q}%,description.ilike.%${q}%`)
  }
  if (industry) {
    query = query.contains('industry_categories', [industry])
  }
  if (selectedMaterials.length === 1) {
    query = query.eq('material_type', selectedMaterials[0])
  } else if (selectedMaterials.length > 1) {
    query = query.in('material_type', selectedMaterials)
  }
  if (selectedForms.length === 1) {
    query = query.eq('packaging_form', selectedForms[0])
  } else if (selectedForms.length > 1) {
    query = query.in('packaging_form', selectedForms)
  }
  if (activeCerts.length > 0) {
    query = query.overlaps('certifications', activeCerts)
  }

  if (sort === 'rating') {
    query = query.order('avg_rating', { ascending: false, nullsFirst: false })
  } else {
    query = query.order('name')
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
    if (form) params.form = form
    if (cert) params.cert = cert
    if (sort) params.sort = sort
    Object.assign(params, overrides)
    Object.keys(params).forEach((k) => { if (params[k] === undefined) delete params[k] })
    const qs = new URLSearchParams(params).toString()
    return qs ? `/?${qs}` : '/'
  }

  const buildCertUrl = (certId: string) => {
    const current = new Set(activeCerts)
    if (current.has(certId)) {
      current.delete(certId)
    } else {
      current.add(certId)
    }
    const certStr = Array.from(current).join(',')
    return buildUrl({ cert: certStr || undefined })
  }

  const showingCategory = !q && !industry && selectedMaterials.length === 0 && selectedForms.length === 0 && activeCerts.length === 0

  const buildMaterialUrl = (mat: MaterialType): string => {
    const current = new Set(selectedMaterials)
    if (current.has(mat)) {
      current.delete(mat)
    } else {
      current.add(mat)
    }
    const matStr = Array.from(current).join(',')
    return buildUrl({ material: matStr || undefined })
  }

  const buildFormUrl = (pf: PackagingForm): string => {
    const current = new Set(selectedForms)
    if (current.has(pf)) {
      current.delete(pf)
    } else {
      current.add(pf)
    }
    const formStr = Array.from(current).join(',')
    return buildUrl({ form: formStr || undefined })
  }

  // Group cert types by category for filter UI
  const certsByCategory = CERTIFICATION_TYPES.reduce<Record<CertificationCategory, typeof CERTIFICATION_TYPES>>((acc, ct) => {
    if (!acc[ct.category]) acc[ct.category] = []
    acc[ct.category].push(ct)
    return acc
  }, {} as Record<CertificationCategory, typeof CERTIFICATION_TYPES>)

  // Pre-compute cert toggle URLs — serializable map avoids passing functions to Client Components
  const certUrls: Record<string, string> = {}
  for (const ct of CERTIFICATION_TYPES) {
    certUrls[ct.id] = buildCertUrl(ct.id)
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Header */}
      <header className="bg-white sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <BoxterLogo variant="light" size="sm" />
            <span className="hidden sm:inline text-gray-300 text-[11px] font-medium tracking-widest uppercase">전국 패키징 파트너, 한 번에</span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/blog" className="text-gray-500 hover:text-gray-900 text-[13px] font-medium transition-colors">
              가이드
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero — unified background with radial glow accents */}
      <section className="relative bg-[#F9FAFB] border-b border-gray-100 overflow-hidden">
        {/* Radial glow — top-left */}
        <div
          className="absolute -top-[20%] -left-[10%] w-[60%] h-[120%] max-md:w-[80%] max-md:h-[80%] max-md:-top-[10%] max-md:-left-[20%] pointer-events-none z-0"
          style={{
            background: 'radial-gradient(ellipse at center, var(--glow-primary) 0%, var(--glow-primary-mid) 40%, transparent 70%)'
          }}
        />
        {/* Radial glow — bottom-right */}
        <div
          className="absolute -bottom-[30%] -right-[5%] w-[50%] h-[100%] max-md:w-[70%] max-md:h-[60%] max-md:-bottom-[10%] max-md:-right-[15%] pointer-events-none z-0"
          style={{
            background: 'radial-gradient(ellipse at center, var(--glow-secondary) 0%, transparent 60%)'
          }}
        />
        <div className="relative z-10 flex flex-col lg:flex-row lg:min-h-[calc(100vh-64px)]">

          {/* Left: Visual hero panel */}
          <div className="relative lg:w-[52%] flex flex-col justify-center px-8 sm:px-12 lg:px-16 py-14 lg:py-20">
            {/* Concept #10 — Modular grid pattern (slate on light, decorative background) */}
            <svg
              className="absolute bottom-0 right-0 w-[340px] h-[340px] lg:w-[420px] lg:h-[420px] opacity-[0.18] pointer-events-none select-none"
              viewBox="0 0 420 420"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              {/* Row 1 */}
              <rect x="40" y="40" width="130" height="85" rx="4" stroke="#94A3B8" strokeWidth="1.5"/>
              <rect x="178" y="40" width="90" height="85" rx="4" fill="#CBD5E1"/>
              <rect x="276" y="40" width="110" height="85" rx="4" fill="#E2E8F0"/>
              {/* Row 2 */}
              <rect x="40" y="133" width="85" height="120" rx="4" fill="#CBD5E1"/>
              <rect x="133" y="133" width="70" height="55" rx="4" stroke="#94A3B8" strokeWidth="1.5"/>
              <rect x="133" y="196" width="70" height="57" rx="4" fill="#94A3B8"/>
              <rect x="211" y="133" width="110" height="120" rx="4" stroke="#CBD5E1" strokeWidth="1.2"/>
              <rect x="329" y="133" width="90" height="120" rx="4" fill="#E2E8F0"/>
              {/* Row 3 */}
              <rect x="40" y="261" width="120" height="85" rx="4" stroke="#CBD5E1" strokeWidth="1.2"/>
              <rect x="168" y="261" width="50" height="85" rx="4" fill="#0A0F1E"/>
              <rect x="226" y="261" width="90" height="85" rx="4" stroke="#94A3B8" strokeWidth="1.5"/>
              <rect x="324" y="261" width="90" height="85" rx="4" fill="#E2E8F0"/>
              {/* Row 4 */}
              <rect x="40" y="354" width="65" height="55" rx="4" fill="#94A3B8"/>
              <rect x="113" y="354" width="100" height="55" rx="4" stroke="#CBD5E1" strokeWidth="1.2"/>
              <rect x="221" y="354" width="85" height="55" rx="4" fill="#E2E8F0"/>
              <rect x="314" y="354" width="55" height="55" rx="4" stroke="#94A3B8" strokeWidth="1.5"/>
              <rect x="377" y="354" width="40" height="55" rx="4" fill="#CBD5E1"/>
            </svg>

            {/* Content */}
            <div className="relative z-10">
              <div className="inline-block text-[11px] font-semibold tracking-widest uppercase text-[#F97316] bg-[#F97316]/10 border border-[#F97316]/20 px-3 py-1.5 rounded-full mb-5">
                국내 패키징 플랫폼
              </div>
              <h1 className="text-[34px] sm:text-[44px] lg:text-[52px] font-extrabold text-[#0A0F1E] leading-[1.1] tracking-[-0.04em] mb-4">
                전국 패키징<br />파트너, 한 번에
              </h1>
              <p className="text-[#64748B] text-[15px] leading-relaxed mb-10 max-w-[400px]">
                검증된 B2B 포장 파트너를 바로 찾으세요.<br className="hidden sm:inline" />
                식품·산업·친환경 전 분야 커버.
              </p>
              {totalCount != null && (
                <div className="flex items-center gap-6 sm:gap-8 flex-wrap">
                  <div>
                    <div className="text-[26px] sm:text-[30px] font-black text-[#0A0F1E] tracking-[-0.03em] leading-none">
                      {totalCount.toLocaleString()}
                    </div>
                    <div className="text-[11px] text-[#94A3B8] font-medium mt-1.5">등록 업체</div>
                  </div>
                  <div className="w-px h-10 bg-[#CBD5E1] self-center" />
                  <div>
                    <div className="text-[26px] sm:text-[30px] font-black text-[#0A0F1E] tracking-[-0.03em] leading-none">{INDUSTRY_CATEGORIES.length}</div>
                    <div className="text-[11px] text-[#94A3B8] font-medium mt-1.5">산업 카테고리</div>
                  </div>
                  <div className="w-px h-10 bg-[#CBD5E1] self-center" />
                  <div>
                    <div className="text-[26px] sm:text-[30px] font-black text-[#F97316] tracking-[-0.03em] leading-none">무료</div>
                    <div className="text-[11px] text-[#94A3B8] font-medium mt-1.5">이용 가능</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Search + 6 category buttons panel */}
          <div className="lg:w-[48%] flex items-center px-8 sm:px-12 py-12 lg:py-20">
            <div className="w-full max-w-[440px] mx-auto lg:mx-0">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-4">업체 검색</p>

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

              {/* 6 category buttons */}
              {showingCategory && (
                <>
                  <div className="flex items-center mt-7 mb-4">
                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">카테고리 탐색</span>
                  </div>
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
                </>
              )}
            </div>
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
              {MATERIAL_TYPES.map((mat) => {
                const isActive = selectedMaterials.includes(mat)
                return (
                  <Link
                    key={mat}
                    href={buildMaterialUrl(mat)}
                    className={`flex-shrink-0 px-2.5 py-1 rounded text-[11px] font-medium transition-all border ${
                      isActive
                        ? 'bg-[#005EFF] text-white border-[#005EFF]'
                        : 'text-gray-500 border-gray-200 hover:text-gray-700 hover:border-gray-300 bg-white'
                    }`}
                  >
                    {MATERIAL_TYPE_LABELS[mat]}
                  </Link>
                )
              })}
            </div>

            {/* Packaging form chips */}
            <div className="flex gap-1.5 py-2.5 overflow-x-auto scrollbar-none">
              <span className="flex-shrink-0 text-[10px] font-semibold text-gray-300 uppercase tracking-widest self-center mr-1 hidden sm:inline">형태</span>
              {PACKAGING_FORMS.map((pf) => {
                const isActive = selectedForms.includes(pf)
                return (
                  <Link
                    key={pf}
                    href={buildFormUrl(pf)}
                    className={`flex-shrink-0 px-2.5 py-1 rounded text-[11px] font-medium transition-all border ${
                      isActive
                        ? 'bg-[#7C3AED] text-white border-[#7C3AED]'
                        : 'text-gray-500 border-gray-200 hover:text-gray-700 hover:border-gray-300 bg-white'
                    }`}
                  >
                    {PACKAGING_FORM_LABELS[pf]}
                  </Link>
                )
              })}
            </div>

            {/* Certification accordion filter */}
            <CertFilterAccordion
              certsByCategory={certsByCategory}
              activeCerts={activeCerts}
              certCategoryColors={CERT_CATEGORY_COLORS}
              certCategoryLabels={CERTIFICATION_CATEGORY_LABELS}
              certUrls={certUrls}
            />
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
            {selectedMaterials.map((mat) => (
              <Link
                key={mat}
                href={buildMaterialUrl(mat)}
                className="text-[11px] bg-[#EBF2FF] text-[#005EFF] font-medium px-2.5 py-1 rounded-full flex items-center gap-1 hover:bg-[#D6E8FF] transition-colors"
              >
                {MATERIAL_TYPE_LABELS[mat]}
                <span className="text-[#005EFF]/60 text-[10px] leading-none">×</span>
              </Link>
            ))}
            {selectedForms.map((pf) => (
              <Link
                key={pf}
                href={buildFormUrl(pf)}
                className="text-[11px] bg-[#F3E8FF] text-[#7C3AED] font-medium px-2.5 py-1 rounded-full flex items-center gap-1 hover:bg-[#EDE9FE] transition-colors"
              >
                {PACKAGING_FORM_LABELS[pf]}
                <span className="text-[#7C3AED]/60 text-[10px] leading-none">×</span>
              </Link>
            ))}
            {activeCerts.map((certId) => {
              const ct = CERTIFICATION_TYPES.find((c) => c.id === certId)
              return (
                <span key={certId} className="text-[11px] bg-green-50 text-green-700 font-medium px-2.5 py-1 rounded-full border border-green-200">
                  {ct?.label ?? certId}
                </span>
              )
            })}
            {q && (
              <span className="text-[11px] bg-[#EBF2FF] text-[#005EFF] font-medium px-2.5 py-1 rounded-full">
                &ldquo;{q}&rdquo;
              </span>
            )}
            {(industry || selectedMaterials.length > 0 || selectedForms.length > 0 || q || activeCerts.length > 0) && (
              <Link href="/" className="text-xs text-gray-400 hover:text-gray-600 ml-1">
                초기화
              </Link>
            )}
          </div>

          {/* Sort dropdown */}
          <div className="flex items-center gap-2">
            <Link
              href={buildUrl({ sort: undefined })}
              className={`text-[12px] font-medium px-2.5 py-1 rounded transition-colors ${
                !sort ? 'text-gray-900 bg-gray-100' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              기본순
            </Link>
            <Link
              href={buildUrl({ sort: 'rating' })}
              className={`text-[12px] font-medium px-2.5 py-1 rounded transition-colors ${
                sort === 'rating' ? 'text-gray-900 bg-gray-100' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              평점순
            </Link>
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
                    {/* Rating badge */}
                    {company.avg_rating != null && company.review_count > 0 && (
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <svg className="w-3 h-3 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="text-[11px] font-semibold text-gray-700">{Number(company.avg_rating).toFixed(1)}</span>
                        <span className="text-[11px] text-gray-400">({company.review_count})</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mb-1">
                    <CompanyIcon
                      iconUrl={company.icon_url ?? null}
                      name={company.name}
                      category={company.category}
                      size="sm"
                      linkUrl={company.website ?? null}
                    />
                    <h2 className="text-base font-bold text-gray-900 leading-snug tracking-[-0.02em] line-clamp-1 flex-1 min-w-0" title={company.name}>
                      <Link
                        href={`/companies/${company.slug}`}
                        className="after:absolute after:inset-0 after:content-['']"
                      >
                        {simplifyCompanyName(company.name)}
                      </Link>
                    </h2>
                  </div>

                  <p className="text-[13px] text-gray-500 leading-relaxed line-clamp-2 mb-3 flex-1">
                    {company.description ?? ''}
                  </p>

                  {(company.certifications as string[] | null)?.length! > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {(company.certifications as string[]).slice(0, 2).map((cert, i) => (
                        <span key={i} className="text-[11px] font-medium text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded">
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
                        <WebsiteFavicon website={company.website} iconUrl={company.icon_url ?? null} className="w-4 h-4" />
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
      <footer className="border-t border-gray-100 bg-white mt-auto py-8">
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
