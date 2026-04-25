import type { Metadata } from 'next'
import Link from 'next/link'
import { PacklinxLogo } from '@/components/PacklinxLogo'
import {
  INDUSTRY_CATEGORIES,
  INDUSTRY_CATEGORY_LABELS,
  INDUSTRY_CATEGORY_ICONS,
  MATERIAL_TYPES,
  MATERIAL_TYPE_LABELS,
  PACKAGING_FORMS,
  PACKAGING_FORM_LABELS,
  PRINT_DESIGN_SUBTYPES,
  PRINT_DESIGN_SUBTYPE_LABELS,
  CERTIFICATION_TYPES,
  CERTIFICATION_CATEGORY_LABELS,
  MOQ_RANGES,
  LEAD_TIME_RANGES,
  PRINT_METHOD_LABELS,
  COLD_RETENTION_RANGES,
  type IndustryCategory,
  type MaterialType,
  type PackagingForm,
  type PrintDesignSubtype,
  type CertificationCategory,
  type PrintMethod,
} from '@/types'
import { createClient } from '@/lib/supabase/server'
import { simplifyCompanyName } from '@/lib/simplify-company-name'
import { CertFilterAccordion } from './CertFilterAccordion'
import { CompanyIcon } from '@/components/CompanyIcon'
import { WebsiteFavicon } from '@/components/WebsiteFavicon'
import { CertBadge } from '@/components/CertBadge'
import { SortDropdown } from '@/components/SortDropdown'
import { Pagination } from '@/components/Pagination'

const PAGE_SIZE = 30

export const revalidate = 300

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://packlinx.com'

type SearchParams = Promise<{
  q?: string
  industry?: string
  material?: string
  form?: string
  cert?: string
  sort?: string
  moq?: string
  leadtime?: string
  cold?: string
  print?: string
  coldretention?: string
  dryice?: string
  sample?: string
  page?: string
  subtype?: string
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
      name: 'Packlinx',
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
      name: 'Packlinx',
      url: siteUrl,
      logo: `${siteUrl}/packlinx-logo-light.svg`,
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
  const { q, industry, material, form, cert, sort, moq, leadtime, cold, print, coldretention, dryice, sample, page, subtype } = await searchParams
  const currentPage = Math.max(1, parseInt(page ?? '1', 10))
  const supabase = await createClient()

  const isPrintDesign = industry === 'print_design_services'

  const activeCerts = cert ? cert.split(',').filter(Boolean) : []
  const selectedMaterials: MaterialType[] = !isPrintDesign && material
    ? (material.split(',').filter((m): m is MaterialType => MATERIAL_TYPES.includes(m as MaterialType)))
    : []
  const selectedForms: PackagingForm[] = !isPrintDesign && form
    ? (form.split(',').filter((f): f is PackagingForm => PACKAGING_FORMS.includes(f as PackagingForm)))
    : []
  const selectedSubtype: PrintDesignSubtype | null = isPrintDesign && subtype
    ? (PRINT_DESIGN_SUBTYPES.includes(subtype as PrintDesignSubtype) ? subtype as PrintDesignSubtype : null)
    : null

  const COMPANY_SELECT = 'id, slug, name, description, category, industry_categories, material_type, packaging_form, tags, is_verified, cert_count, products, certifications, founded_year, website, icon_url, service_capabilities, target_industries, data_source, review_count, avg_rating, lead_time_standard_days, lead_time_express_days, moq_value, moq_unit, print_method, sample_available, cold_packaging_available, cold_retention_hours, dry_ice_available, reuse_model, spec_sheet_available, seasonal_packaging_available'

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let companies: any[] = []
  let filteredCount: number | null = 0
  let isRecommendation = false
  let matchedKeyword = ''
  let matchedIndustries: string[] = []
  const offset = (currentPage - 1) * PAGE_SIZE

  if (q) {
    // ── Korean full-text search path ──────────────────────────────────────────
    // Delegates to search_companies_korean RPC (migration 037) which:
    //   1. Expands synonyms via korean_search_synonyms
    //   2. Searches using weighted tsvector (name A > products/subcategory B > description D)
    //   3. Includes ilike fallback for compound Korean words not split by spaces
    //   4. Ranks results by relevance, verified status, and cert count
    const sanitized = q.replace(/[,().]/g, '')
    const rpcCertAlias = activeCerts.flatMap(id => {
      const ct = CERTIFICATION_TYPES.find(c => c.id === id)
      return ct ? ct.aliases : [id]
    })[0] ?? null

    const { data: rpcRows, error: rpcErr } = await supabase.rpc('search_companies_korean', {
      p_query:          sanitized,
      p_limit:          PAGE_SIZE,
      p_offset:         offset,
      p_industry:       industry ?? null,
      p_material_type:  selectedMaterials.length === 1 ? selectedMaterials[0] : null,
      p_packaging_form: selectedForms.length === 1 ? selectedForms[0] : null,
      p_category:       null,
      p_tag:            null,
      p_use_case:       null,
      p_certification:  rpcCertAlias,
    })

    if (!rpcErr && rpcRows) {
      const ranked = rpcRows as Array<{ id: string; total_count: number }>
      const rankedIds = ranked.map(r => r.id)
      filteredCount = ranked.length > 0 ? Number(ranked[0].total_count) : 0

      if (rankedIds.length > 0) {
        // Fetch full display fields for the ranked IDs (RPC only returns core columns)
        const { data: fullData } = await supabase
          .from('companies')
          .select(COMPANY_SELECT)
          .in('id', rankedIds)
        const byId = new Map((fullData ?? []).map(c => [c.id, c]))
        // Preserve RPC-determined rank order
        companies = rankedIds.map(id => byId.get(id)).filter(Boolean)
      }
    } else {
      // RPC unavailable (migration not applied locally) — fallback to ilike
      const { data, count } = await supabase
        .from('companies')
        .select(COMPANY_SELECT, { count: 'exact' })
        .or(`name.ilike.%${sanitized}%,description.ilike.%${sanitized}%`)
        .order('is_verified', { ascending: false })
        .order('cert_count', { ascending: false })
        .order('name')
        .range(offset, offset + PAGE_SIZE - 1)
      companies = data ?? []
      filteredCount = count ?? 0
    }

    // ── Pass 2: product→category recommendation (only when Pass 1 found nothing) ──
    if (companies.length === 0 && (filteredCount ?? 0) === 0) {
      const { data: recRows } = await supabase.rpc('recommend_companies_by_product', {
        p_query: sanitized,
        p_limit: PAGE_SIZE,
        p_offset: offset,
      })
      if (recRows && recRows.length > 0) {
        const recs = recRows as Array<{ id: string; matched_keyword: string; matched_industries: string[]; total_count: number }>
        isRecommendation = true
        matchedKeyword = recs[0].matched_keyword
        matchedIndustries = recs[0].matched_industries ?? []
        filteredCount = Number(recs[0].total_count)
        const recIds = recs.map(r => r.id)
        const { data: fullData } = await supabase
          .from('companies')
          .select(COMPANY_SELECT)
          .in('id', recIds)
        const byId = new Map((fullData ?? []).map(c => [c.id, c]))
        companies = recIds.map(id => byId.get(id)).filter(Boolean)
      }
    }
  } else {
    // ── Filter-only path (no text query) ────────────────────────────────────
    let dbQuery = supabase
      .from('companies')
      .select(COMPANY_SELECT, { count: 'exact' })

    if (industry) dbQuery = dbQuery.contains('industry_categories', [industry])
    if (isPrintDesign) {
      if (selectedSubtype) dbQuery = dbQuery.eq('subcategory', selectedSubtype)
    } else {
      if (selectedMaterials.length === 1) {
        dbQuery = dbQuery.eq('material_type', selectedMaterials[0])
      } else if (selectedMaterials.length > 1) {
        dbQuery = dbQuery.in('material_type', selectedMaterials)
      }
      if (selectedForms.length === 1) {
        dbQuery = dbQuery.eq('packaging_form', selectedForms[0])
      } else if (selectedForms.length > 1) {
        dbQuery = dbQuery.in('packaging_form', selectedForms)
      }
    }
    if (activeCerts.length > 0) {
      const expandedCerts = activeCerts.flatMap(id => {
        const ct = CERTIFICATION_TYPES.find(c => c.id === id)
        return ct ? ct.aliases : [id]
      })
      dbQuery = dbQuery.overlaps('certifications', expandedCerts)
    }

    type RangeEntry = { id: string; label: string; min?: number; max?: number }
    if (moq) {
      const range = (MOQ_RANGES as readonly RangeEntry[]).find(r => r.id === moq)
      if (range) {
        if (range.min !== undefined) dbQuery = dbQuery.gte('moq_value', range.min)
        if (range.max !== undefined) dbQuery = dbQuery.lte('moq_value', range.max)
      }
    }
    if (leadtime) {
      const range = (LEAD_TIME_RANGES as readonly RangeEntry[]).find(r => r.id === leadtime)
      if (range) {
        if (range.min !== undefined) dbQuery = dbQuery.gte('lead_time_standard_days', range.min)
        if (range.max !== undefined) dbQuery = dbQuery.lte('lead_time_standard_days', range.max)
      }
    }
    if (cold === 'true') dbQuery = dbQuery.eq('cold_packaging_available', true)
    if (coldretention) {
      const range = (COLD_RETENTION_RANGES as readonly RangeEntry[]).find(r => r.id === coldretention)
      if (range?.min !== undefined) dbQuery = dbQuery.gte('cold_retention_hours', range.min)
    }
    if (dryice === 'true') dbQuery = dbQuery.eq('dry_ice_available', true)
    if (sample === 'true') dbQuery = dbQuery.eq('sample_available', true)
    if (print) dbQuery = dbQuery.eq('print_method', print)

    if (sort === 'name_asc') {
      dbQuery = dbQuery.order('name', { ascending: true })
    } else if (sort === 'moq_asc') {
      dbQuery = dbQuery.order('moq_value', { ascending: true, nullsFirst: false }).order('name')
    } else if (sort === 'est_asc') {
      dbQuery = dbQuery.order('founded_year', { ascending: true, nullsFirst: false }).order('name')
    } else if (sort === 'est_desc') {
      dbQuery = dbQuery.order('founded_year', { ascending: false, nullsFirst: false }).order('name')
    } else {
      dbQuery = dbQuery.order('is_verified', { ascending: false }).order('cert_count', { ascending: false }).order('name')
    }

    dbQuery = dbQuery.range(offset, offset + PAGE_SIZE - 1)

    const { data, count } = await dbQuery
    companies = data ?? []
    filteredCount = count ?? 0
  }
  const totalPages = Math.ceil((filteredCount ?? 0) / PAGE_SIZE)

  const [{ count: totalCount }, ...categoryCountResults] = await Promise.all([
    supabase.from('companies').select('*', { count: 'exact', head: true }),
    ...INDUSTRY_CATEGORIES.map(cat =>
      supabase.from('companies').select('*', { count: 'exact', head: true }).contains('industry_categories', [cat])
    ),
  ])

  const categoryCounts: Record<string, number> = {}
  INDUSTRY_CATEGORIES.forEach((cat, i) => {
    categoryCounts[cat] = categoryCountResults[i].count ?? 0
  })

  const buildUrl = (overrides: Record<string, string | undefined>) => {
    const params: Record<string, string> = {}
    if (q) params.q = q
    if (industry) params.industry = industry
    if (!isPrintDesign && material) params.material = material
    if (!isPrintDesign && form) params.form = form
    if (isPrintDesign && selectedSubtype) params.subtype = selectedSubtype
    if (cert) params.cert = cert
    if (sort) params.sort = sort
    if (!isPrintDesign && moq) params.moq = moq
    if (!isPrintDesign && leadtime) params.leadtime = leadtime
    if (!isPrintDesign && cold) params.cold = cold
    if (!isPrintDesign && print) params.print = print
    if (!isPrintDesign && coldretention) params.coldretention = coldretention
    if (!isPrintDesign && dryice) params.dryice = dryice
    if (sample) params.sample = sample
    Object.assign(params, overrides)
    // always reset page when changing filters (except when page itself is the override)
    if (!('page' in overrides)) delete params.page
    Object.keys(params).forEach((k) => { if ((params as Record<string, string | undefined>)[k] === undefined) delete params[k] })
    const qs = new URLSearchParams(params).toString()
    return qs ? `/?${qs}` : '/'
  }

  const buildPageUrl = (p: number): string => {
    const params: Record<string, string | undefined> = {}
    if (q) params.q = q
    if (industry) params.industry = industry
    if (!isPrintDesign && material) params.material = material
    if (!isPrintDesign && form) params.form = form
    if (isPrintDesign && selectedSubtype) params.subtype = selectedSubtype
    if (cert) params.cert = cert
    if (sort) params.sort = sort
    if (!isPrintDesign && moq) params.moq = moq
    if (!isPrintDesign && leadtime) params.leadtime = leadtime
    if (!isPrintDesign && cold) params.cold = cold
    if (!isPrintDesign && print) params.print = print
    if (!isPrintDesign && coldretention) params.coldretention = coldretention
    if (!isPrintDesign && dryice) params.dryice = dryice
    if (sample) params.sample = sample
    if (p > 1) params.page = String(p)
    Object.keys(params).forEach((k) => { if (params[k] === undefined) delete params[k] })
    const qs = new URLSearchParams(params as Record<string, string>).toString()
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

  const showingCategory = !q && !industry && selectedMaterials.length === 0 && selectedForms.length === 0 && activeCerts.length === 0 && !moq && !leadtime && !cold && !print && !coldretention && !dryice && !sample && !selectedSubtype

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

  const buildMoqUrl = (id: string): string => buildUrl({ moq: moq === id ? undefined : id })
  const buildLeadTimeUrl = (id: string): string => buildUrl({ leadtime: leadtime === id ? undefined : id })
  const buildPrintUrl = (method: string): string => buildUrl({ print: print === method ? undefined : method })
  const buildColdUrl = (): string => buildUrl({ cold: cold === 'true' ? undefined : 'true' })
  const buildColdRetentionUrl = (id: string): string => buildUrl({ coldretention: coldretention === id ? undefined : id })
  const buildDryIceUrl = (): string => buildUrl({ dryice: dryice === 'true' ? undefined : 'true' })
  const buildSampleUrl = (): string => buildUrl({ sample: sample === 'true' ? undefined : 'true' })

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
      <header className="bg-[#0F172A] sticky top-0 z-50 border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <PacklinxLogo variant="dark" />
            <span className="hidden sm:inline text-slate-400 text-[11px] font-medium tracking-widest uppercase">패키징 업체 검색 플랫폼</span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link
              href="/guides"
              className="flex items-center gap-1.5 text-slate-200 hover:text-white text-sm font-medium px-3.5 py-2 border border-white/[0.15] hover:border-white/[0.30] hover:bg-white/[0.06] rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-white/40 focus-visible:ring-offset-[#0F172A]"
            >
              <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
              가이드
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero — Variation B: center-aligned */}
      <section className="relative bg-[#F9FAFB] border-b border-gray-100 overflow-hidden">
        {/* Radial glow — top-left */}
        <div
          className="absolute -top-[20%] -left-[20%] w-[80%] h-[120%] max-md:w-[80%] max-md:h-[80%] max-md:-top-[10%] max-md:-left-[20%] pointer-events-none z-0"
          style={{
            background: 'radial-gradient(ellipse at center, var(--glow-primary) 0%, var(--glow-primary-mid) 40%, transparent 70%)'
          }}
        />
        {/* Radial glow — bottom-right */}
        <div
          className="absolute -bottom-[30%] -right-[10%] w-[60%] h-[100%] max-md:w-[70%] max-md:h-[60%] max-md:-bottom-[10%] max-md:-right-[15%] pointer-events-none z-0"
          style={{
            background: 'radial-gradient(ellipse at center, var(--glow-secondary) 0%, transparent 60%)'
          }}
        />

        <div className="relative z-10 flex flex-col items-center text-center px-6 sm:px-8 py-16 lg:py-24">
          {/* Text content */}
          <div className="max-w-3xl mx-auto w-full">
            <div className="inline-block text-[11px] font-semibold tracking-widest uppercase text-[#C2410C] bg-[#C2410C]/[0.08] border border-[#C2410C]/[0.15] px-3 py-1.5 rounded-full mb-5">
              패키징 파트너 검색의 시작점
            </div>
            <h1 className="text-[32px] sm:text-[40px] lg:text-[48px] font-extrabold text-[#0F172A] leading-[1.15] tracking-[-0.03em] mb-4">
              패키징에 필요한 모든 업체,<br />여기서 한 번에 찾으세요
            </h1>
            <p className="text-[15px] sm:text-[16px] text-[#64748B] leading-relaxed max-w-[520px] mx-auto">
              박스 제작부터 인쇄·디자인, 친환경 소재까지 —<br className="hidden sm:inline" />
              전국 1,300+ 패키징 업체를 카테고리별로 비교하고<br className="hidden sm:inline" />
              내 제품에 딱 맞는 파트너를 찾으세요.
            </p>
          </div>

          {/* Search bar */}
          <div className="max-w-[560px] w-full mx-auto mt-8">
            <form method="GET" className="flex rounded-xl overflow-hidden border border-gray-200 shadow-[0_2px_8px_rgba(0,0,0,0.06)] focus-within:border-[#C2410C] focus-within:shadow-[0_2px_8px_rgba(0,0,0,0.06),0_0_0_3px_rgba(194,65,12,0.12)] transition-shadow">
              <input
                name="q"
                defaultValue={q}
                placeholder="업체명, 제품, 인증으로 검색..."
                className="flex-1 px-5 py-3.5 text-[15px] text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none"
              />
              <button
                type="submit"
                className="bg-[#C2410C] hover:bg-[#9A3412] text-white font-semibold px-6 py-3 transition-colors text-sm flex-shrink-0 m-1.5 rounded-lg"
              >
                검색
              </button>
            </form>

            {totalCount != null && (
              <div className="flex items-center justify-center gap-3 mt-3 text-[12px] text-gray-400 font-medium text-center">
                <span>{totalCount.toLocaleString()}개 업체 등록됨</span>
                <span className="text-gray-200">·</span>
                <span>무료 이용</span>
              </div>
            )}
          </div>

          {/* Category grid */}
          {showingCategory && (
            <div className="max-w-[560px] mx-auto w-full mt-8">
              <div className="flex items-center justify-center mb-4">
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">카테고리 탐색</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {INDUSTRY_CATEGORIES.filter((cat) => categoryCounts[cat] > 0).map((cat) => (
                  <form key={cat} action={`/categories/${categoryToSlug(cat)}`} className="contents">
                    <button
                      type="submit"
                      className="group flex items-center gap-2.5 bg-white border border-gray-200 rounded-lg px-3 py-2.5 hover:border-[#C2410C]/30 hover:bg-[#FFF7ED] transition-all duration-150"
                    >
                      <span className="text-base flex-shrink-0">{INDUSTRY_CATEGORY_ICONS[cat]}</span>
                      <div className="min-w-0 text-left">
                        <span className="text-[13px] font-semibold text-gray-900 group-hover:text-[#C2410C] transition-colors block truncate">
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

            {/* Print/Design subtype filter — print_design_services 전용 */}
            {isPrintDesign ? (
              <div className="flex gap-1.5 py-2.5 overflow-x-auto scrollbar-none">
                <span className="flex-shrink-0 text-[10px] font-semibold text-gray-300 uppercase tracking-widest self-center mr-1">유형</span>
                <Link
                  href={buildUrl({ subtype: undefined })}
                  className={`flex-shrink-0 px-2.5 py-1.5 rounded text-[11px] font-medium transition-all border ${
                    !selectedSubtype
                      ? 'bg-gray-900 text-white border-gray-900'
                      : 'text-gray-500 border-gray-200 hover:text-gray-700 hover:border-gray-300 bg-white'
                  }`}
                >
                  전체
                </Link>
                {PRINT_DESIGN_SUBTYPES.map((sub) => {
                  const isActive = selectedSubtype === sub
                  return (
                    <Link
                      key={sub}
                      href={buildUrl({ subtype: selectedSubtype === sub ? undefined : sub })}
                      className={`flex-shrink-0 px-2.5 py-1.5 rounded text-[11px] font-medium transition-all border ${
                        isActive
                          ? 'bg-[#C2410C] text-white border-[#C2410C]'
                          : 'text-gray-500 border-gray-200 hover:text-gray-700 hover:border-gray-300 bg-white'
                      }`}
                    >
                      {PRINT_DESIGN_SUBTYPE_LABELS[sub]}
                    </Link>
                  )
                })}
              </div>
            ) : (
              <>
                {/* Material chips */}
                <div className="flex gap-1.5 py-2.5 overflow-x-auto scrollbar-none">
                  <span className="flex-shrink-0 text-[10px] font-semibold text-gray-300 uppercase tracking-widest self-center mr-1">소재</span>
                  {MATERIAL_TYPES.map((mat) => {
                    const isActive = selectedMaterials.includes(mat)
                    return (
                      <Link
                        key={mat}
                        href={buildMaterialUrl(mat)}
                        className={`flex-shrink-0 px-2.5 py-1.5 rounded text-[11px] font-medium transition-all border ${
                          isActive
                            ? 'bg-[#C2410C] text-white border-[#C2410C]'
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
                  <span className="flex-shrink-0 text-[10px] font-semibold text-gray-300 uppercase tracking-widest self-center mr-1">형태</span>
                  {PACKAGING_FORMS.map((pf) => {
                    const isActive = selectedForms.includes(pf)
                    return (
                      <Link
                        key={pf}
                        href={buildFormUrl(pf)}
                        className={`flex-shrink-0 px-2.5 py-1.5 rounded text-[11px] font-medium transition-all border ${
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

                {/* Buyer criteria chips — MOQ / 납기 / 인쇄 / 보냉 */}
                <div className="flex gap-1.5 py-2.5 overflow-x-auto scrollbar-none">
                  <span className="flex-shrink-0 text-[10px] font-semibold text-gray-300 uppercase tracking-widest self-center mr-1">조건</span>
                  {MOQ_RANGES.map((range) => {
                    const isActive = moq === range.id
                    return (
                      <Link
                        key={range.id}
                        href={buildMoqUrl(range.id)}
                        className={`flex-shrink-0 px-2.5 py-1.5 rounded text-[11px] font-medium transition-all border ${
                          isActive
                            ? 'bg-[#0D9488] text-white border-[#0D9488]'
                            : 'text-gray-500 border-gray-200 hover:text-gray-700 hover:border-gray-300 bg-white'
                        }`}
                      >
                        {range.label}
                      </Link>
                    )
                  })}
                  <span className="flex-shrink-0 w-px h-4 bg-gray-200 self-center mx-0.5" aria-hidden="true" />
                  {LEAD_TIME_RANGES.map((range) => {
                    const isActive = leadtime === range.id
                    return (
                      <Link
                        key={range.id}
                        href={buildLeadTimeUrl(range.id)}
                        className={`flex-shrink-0 px-2.5 py-1.5 rounded text-[11px] font-medium transition-all border ${
                          isActive
                            ? 'bg-[#0D9488] text-white border-[#0D9488]'
                            : 'text-gray-500 border-gray-200 hover:text-gray-700 hover:border-gray-300 bg-white'
                        }`}
                      >
                        {range.label}
                      </Link>
                    )
                  })}
                  <span className="flex-shrink-0 w-px h-4 bg-gray-200 self-center mx-0.5" aria-hidden="true" />
                  {(['digital', 'offset'] as PrintMethod[]).map((method) => {
                    const isActive = print === method
                    return (
                      <Link
                        key={method}
                        href={buildPrintUrl(method)}
                        className={`flex-shrink-0 px-2.5 py-1.5 rounded text-[11px] font-medium transition-all border ${
                          isActive
                            ? 'bg-[#0D9488] text-white border-[#0D9488]'
                            : 'text-gray-500 border-gray-200 hover:text-gray-700 hover:border-gray-300 bg-white'
                        }`}
                      >
                        {PRINT_METHOD_LABELS[method]}
                      </Link>
                    )
                  })}
                  <span className="flex-shrink-0 w-px h-4 bg-gray-200 self-center mx-0.5" aria-hidden="true" />
                  <Link
                    href={buildColdUrl()}
                    className={`flex-shrink-0 px-2.5 py-1.5 rounded text-[11px] font-medium transition-all border ${
                      cold === 'true'
                        ? 'bg-[#0D9488] text-white border-[#0D9488]'
                        : 'text-gray-500 border-gray-200 hover:text-gray-700 hover:border-gray-300 bg-white'
                    }`}
                  >
                    보냉 포장
                  </Link>
                  <span className="flex-shrink-0 w-px h-4 bg-gray-200 self-center mx-0.5" aria-hidden="true" />
                  {COLD_RETENTION_RANGES.map((range) => {
                    const isActive = coldretention === range.id
                    return (
                      <Link
                        key={range.id}
                        href={buildColdRetentionUrl(range.id)}
                        className={`flex-shrink-0 px-2.5 py-1.5 rounded text-[11px] font-medium transition-all border ${
                          isActive
                            ? 'bg-[#0D9488] text-white border-[#0D9488]'
                            : 'text-gray-500 border-gray-200 hover:text-gray-700 hover:border-gray-300 bg-white'
                        }`}
                      >
                        보냉 {range.label}
                      </Link>
                    )
                  })}
                  <Link
                    href={buildDryIceUrl()}
                    className={`flex-shrink-0 px-2.5 py-1.5 rounded text-[11px] font-medium transition-all border ${
                      dryice === 'true'
                        ? 'bg-[#0D9488] text-white border-[#0D9488]'
                        : 'text-gray-500 border-gray-200 hover:text-gray-700 hover:border-gray-300 bg-white'
                    }`}
                  >
                    드라이아이스
                  </Link>
                  <span className="flex-shrink-0 w-px h-4 bg-gray-200 self-center mx-0.5" aria-hidden="true" />
                  <Link
                    href={buildSampleUrl()}
                    className={`flex-shrink-0 px-2.5 py-1.5 rounded text-[11px] font-medium transition-all border ${
                      sample === 'true'
                        ? 'bg-[#0D9488] text-white border-[#0D9488]'
                        : 'text-gray-500 border-gray-200 hover:text-gray-700 hover:border-gray-300 bg-white'
                    }`}
                  >
                    샘플 제작
                  </Link>
                </div>
              </>
            )}

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
        {isRecommendation && companies.length > 0 && (
          <div className="mb-6 p-4 bg-[#FFF7ED] border border-[#C2410C]/10 rounded-xl">
            <p className="text-[15px] font-semibold text-gray-900 mb-2">
              &lsquo;{q}&rsquo; 포장에 적합한 업체를 추천합니다
            </p>
            <div className="flex flex-wrap gap-1.5">
              {matchedIndustries.map((ind) => (
                <Link
                  key={ind}
                  href={`/categories/${ind}`}
                  className="text-[11px] font-medium bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full hover:bg-gray-200 transition-colors"
                >
                  {INDUSTRY_CATEGORY_LABELS[ind as IndustryCategory] ?? ind}
                </Link>
              ))}
            </div>
          </div>
        )}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5 flex-wrap">
            <p className="text-sm text-gray-500">
              <span className="font-semibold text-gray-900">{filteredCount ?? 0}</span>개 업체
              {isRecommendation && <span className="text-gray-400 ml-1">(추천)</span>}
            </p>
            {industry && (
              <span className="text-[11px] bg-[#EFF6FF] text-[#2563EB] font-medium px-2.5 py-1 rounded-full">
                {INDUSTRY_CATEGORY_LABELS[industry as IndustryCategory]}
              </span>
            )}
            {isPrintDesign && selectedSubtype && (
              <Link
                href={buildUrl({ subtype: undefined })}
                className="text-[11px] bg-[#EFF6FF] text-[#2563EB] font-medium px-2.5 py-1 rounded-full flex items-center gap-1 hover:bg-[#DBEAFE] transition-colors"
              >
                {PRINT_DESIGN_SUBTYPE_LABELS[selectedSubtype]}
                <span className="text-[#2563EB]/60 text-[10px] leading-none">×</span>
              </Link>
            )}
            {selectedMaterials.map((mat) => (
              <Link
                key={mat}
                href={buildMaterialUrl(mat)}
                className="text-[11px] bg-[#EFF6FF] text-[#2563EB] font-medium px-2.5 py-1 rounded-full flex items-center gap-1 hover:bg-[#DBEAFE] transition-colors"
              >
                {MATERIAL_TYPE_LABELS[mat]}
                <span className="text-[#2563EB]/60 text-[10px] leading-none">×</span>
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
            {moq && (
              <Link
                href={buildUrl({ moq: undefined })}
                className="text-[11px] bg-teal-50 text-teal-700 font-medium px-2.5 py-1 rounded-full flex items-center gap-1 border border-teal-200 hover:bg-teal-100 transition-colors"
              >
                {MOQ_RANGES.find(r => r.id === moq)?.label ?? moq}
                <span className="text-teal-700/60 text-[10px] leading-none">×</span>
              </Link>
            )}
            {leadtime && (
              <Link
                href={buildUrl({ leadtime: undefined })}
                className="text-[11px] bg-teal-50 text-teal-700 font-medium px-2.5 py-1 rounded-full flex items-center gap-1 border border-teal-200 hover:bg-teal-100 transition-colors"
              >
                {LEAD_TIME_RANGES.find(r => r.id === leadtime)?.label ?? leadtime}
                <span className="text-teal-700/60 text-[10px] leading-none">×</span>
              </Link>
            )}
            {print && (
              <Link
                href={buildUrl({ print: undefined })}
                className="text-[11px] bg-teal-50 text-teal-700 font-medium px-2.5 py-1 rounded-full flex items-center gap-1 border border-teal-200 hover:bg-teal-100 transition-colors"
              >
                {PRINT_METHOD_LABELS[print as PrintMethod] ?? print}
                <span className="text-teal-700/60 text-[10px] leading-none">×</span>
              </Link>
            )}
            {sample === 'true' && (
              <Link
                href={buildUrl({ sample: undefined })}
                className="text-[11px] bg-teal-50 text-teal-700 font-medium px-2.5 py-1 rounded-full flex items-center gap-1 border border-teal-200 hover:bg-teal-100 transition-colors"
              >
                샘플 제작
                <span className="text-teal-700/60 text-[10px] leading-none">×</span>
              </Link>
            )}
            {cold === 'true' && (
              <Link
                href={buildUrl({ cold: undefined })}
                className="text-[11px] bg-teal-50 text-teal-700 font-medium px-2.5 py-1 rounded-full flex items-center gap-1 border border-teal-200 hover:bg-teal-100 transition-colors"
              >
                보냉 포장
                <span className="text-teal-700/60 text-[10px] leading-none">×</span>
              </Link>
            )}
            {coldretention && (
              <Link
                href={buildUrl({ coldretention: undefined })}
                className="text-[11px] bg-teal-50 text-teal-700 font-medium px-2.5 py-1 rounded-full flex items-center gap-1 border border-teal-200 hover:bg-teal-100 transition-colors"
              >
                보냉 {COLD_RETENTION_RANGES.find(r => r.id === coldretention)?.label ?? coldretention}
                <span className="text-teal-700/60 text-[10px] leading-none">×</span>
              </Link>
            )}
            {dryice === 'true' && (
              <Link
                href={buildUrl({ dryice: undefined })}
                className="text-[11px] bg-teal-50 text-teal-700 font-medium px-2.5 py-1 rounded-full flex items-center gap-1 border border-teal-200 hover:bg-teal-100 transition-colors"
              >
                드라이아이스
                <span className="text-teal-700/60 text-[10px] leading-none">×</span>
              </Link>
            )}
            {q && (
              <span className="text-[11px] bg-[#EFF6FF] text-[#2563EB] font-medium px-2.5 py-1 rounded-full">
                &ldquo;{q}&rdquo;
              </span>
            )}
            {(industry || selectedMaterials.length > 0 || selectedForms.length > 0 || q || activeCerts.length > 0 || moq || leadtime || cold || print || coldretention || dryice || sample || selectedSubtype) && (
              <Link href="/" className="text-xs text-gray-400 hover:text-gray-600 ml-1">
                초기화
              </Link>
            )}
          </div>

          <SortDropdown currentSort={sort ?? ''} />
        </div>

        {companies && companies.length > 0 ? (
          <>
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
                        <CertBadge key={i} cert={cert} variant="compact" />
                      ))}
                      {(company.certifications as string[]).length > 2 && (
                        <span className="text-[11px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                          +{(company.certifications as string[]).length - 2}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="border-t border-gray-100 pt-3 mt-auto">
                    <div className="flex items-center justify-between gap-2">
                      {company.website ? (
                        <a
                          href={company.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="relative z-10 text-[12px] text-gray-400 hover:text-gray-600 flex items-center gap-1.5 transition-colors min-w-0"
                        >
                          <WebsiteFavicon iconUrl={company.icon_url ?? null} className="w-4 h-4" />
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
                    {(company.moq_value != null || company.lead_time_standard_days != null) && (
                      <div className="flex items-center gap-2 text-[11px] text-gray-400 mt-1">
                        {company.moq_value != null && (
                          <span>MOQ {Number(company.moq_value).toLocaleString()}{company.moq_unit ?? '개'}</span>
                        )}
                        {company.lead_time_standard_days != null && (
                          <span>납기 {company.lead_time_standard_days}일</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
          <Pagination currentPage={currentPage} totalPages={totalPages} buildPageUrl={buildPageUrl} />
          </>
        ) : (
          <div className="text-center py-16">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="text-gray-600 font-semibold mb-1.5 text-[15px]">검색 결과가 없습니다</p>
            <p className="text-gray-400 text-sm mb-8">검색어나 카테고리를 변경해보세요</p>

            <div className="max-w-[560px] mx-auto">
              <div className="flex items-center justify-center mb-4">
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">카테고리별로 업체를 둘러보세요</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {INDUSTRY_CATEGORIES.filter((cat) => categoryCounts[cat] > 0).map((cat) => (
                  <Link
                    key={cat}
                    href={`/categories/${categoryToSlug(cat)}`}
                    className="group flex items-center gap-2.5 bg-white border border-gray-200 rounded-lg px-3 py-2.5 hover:border-[#C2410C]/30 hover:bg-[#FFF7ED] transition-all duration-150"
                  >
                    <span className="text-base flex-shrink-0">{INDUSTRY_CATEGORY_ICONS[cat]}</span>
                    <div className="min-w-0 text-left">
                      <span className="text-[13px] font-semibold text-gray-900 group-hover:text-[#C2410C] transition-colors block truncate">
                        {INDUSTRY_CATEGORY_LABELS[cat]}
                      </span>
                      <span className="text-[11px] text-gray-400">{categoryCounts[cat]}개</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>}

      {/* Footer */}
      <footer className="border-t border-white/[0.06] bg-[#0F172A] mt-auto py-8">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-col gap-2">
              <PacklinxLogo variant="dark" layout="horizontal" />
              <p className="text-[12px] text-slate-400 leading-relaxed">
                © 2026 PACKLINX. 본 서비스의 업체 정보는 공개된 출처에서 자동 수집되었습니다.<br className="hidden sm:inline" />
                정보 오류·삭제 요청: rpdla041200@gmail.com
              </p>
            </div>
            <div className="flex gap-5 text-[12px] text-slate-400">
              <Link href="/guides" className="hover:text-slate-200 transition-colors">패키징 가이드</Link>
              <Link href="/privacy" className="hover:text-slate-200 transition-colors">개인정보처리방침</Link>
              <Link href="/terms" className="hover:text-slate-200 transition-colors">이용약관</Link>
              <Link href="/opt-out?type=takedown" className="hover:text-slate-200 transition-colors">권리침해 신고</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
