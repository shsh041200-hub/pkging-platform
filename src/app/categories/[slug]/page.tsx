import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PacklinxLogo } from '@/components/PacklinxLogo'
import {
  INDUSTRY_CATEGORIES,
  INDUSTRY_CATEGORY_LABELS,
  INDUSTRY_CATEGORY_DESCRIPTIONS,
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
  type CertificationType,
  type BlogPost,
  type UseCaseTag,
} from '@/types'
import { PackagingFormFilter } from './PackagingFormFilter'
import { CertFilterAccordion } from '@/app/CertFilterAccordion'
import { createClient } from '@/lib/supabase/server'
import { simplifyCompanyName } from '@/lib/simplify-company-name'
import { WebsiteFavicon } from '@/components/WebsiteFavicon'

const CERT_CATEGORY_COLORS: Record<CertificationCategory, { active: string; inactive: string }> = {
  quality:       { active: 'bg-blue-600 text-white border-blue-600',    inactive: 'text-gray-500 border-gray-200 hover:text-gray-700 hover:border-gray-300 bg-white' },
  food_safety:   { active: 'bg-green-600 text-white border-green-600',  inactive: 'text-gray-500 border-gray-200 hover:text-gray-700 hover:border-gray-300 bg-white' },
  environmental: { active: 'bg-emerald-600 text-white border-emerald-600', inactive: 'text-gray-500 border-gray-200 hover:text-gray-700 hover:border-gray-300 bg-white' },
  pharma:        { active: 'bg-purple-600 text-white border-purple-600', inactive: 'text-gray-500 border-gray-200 hover:text-gray-700 hover:border-gray-300 bg-white' },
  general:       { active: 'bg-gray-700 text-white border-gray-700',    inactive: 'text-gray-500 border-gray-200 hover:text-gray-700 hover:border-gray-300 bg-white' },
}

const CERTS_BY_CATEGORY: Record<CertificationCategory, CertificationType[]> = {
  quality: [], food_safety: [], environmental: [], pharma: [], general: [],
}
for (const ct of CERTIFICATION_TYPES) {
  CERTS_BY_CATEGORY[ct.category].push(ct)
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://packlinx.com'

const CATEGORY_SEO_TITLE: Record<IndustryCategory, string> = {
  'food-beverage':           '식품 포장업체 찾기 — 전국 식품·음료 포장재 업체',
  'ecommerce-shipping':      '택배박스·이커머스 포장 업체 — 전국 배송 포장재 업체',
  'cosmetics-beauty':        '화장품 포장 업체 찾기 — 뷰티 브랜드 포장재 전문',
  'pharma-health':           '의약품·건강기능식품 포장 업체 — 전국 의약 포장재',
  'electronics-industrial':  '전자·산업용 포장 업체 — 보호 포장재 전문',
  'eco-special':             '친환경 포장재 업체 찾기 — FSC·생분해 포장 전문',
  'fresh_produce_packaging': '농산물·신선 포장 업체 찾기 — packlinx',
  'print_design_services':   '인쇄·디자인 서비스 업체 찾기 — packlinx',
}

const CATEGORY_SEO_DESCRIPTION: Record<IndustryCategory, string> = {
  'food-beverage':
    '식품 포장업체를 한눈에 비교하세요. HACCP·GMP 인증 식품 포장재 전문 업체를 Packlinx에서 찾아보세요.',
  'ecommerce-shipping':
    '택배박스, 완충재, 배송 포장재 업체를 비교하세요. 스마트스토어·쿠팡 셀러를 위한 포장 파트너를 찾아보세요.',
  'cosmetics-beauty':
    '화장품 포장 업체를 한눈에 비교하세요. 소량 제작, OEM 포장, 파우치·용기 전문 업체를 Packlinx에서 찾아보세요.',
  'pharma-health':
    '의약품, 건강기능식품 포장 업체를 비교하세요. GMP 인증 의약 포장재 전문 업체를 찾아보세요.',
  'electronics-industrial':
    '전자제품, 부품, 산업재 보호 포장 업체를 비교하세요. 완충·정전기방지 포장재 전문 업체를 Packlinx에서 찾아보세요.',
  'eco-special':
    '친환경 포장재 업체를 비교하세요. FSC 인증, 생분해 포장재, ESG 포장 솔루션 전문 업체를 찾아보세요.',
  'fresh_produce_packaging':
    '신선식품·농산물 포장 전문 업체를 찾으시나요? 콜드체인, 냉장·냉동 포장재, CA/MAP 포장 업체를 packlinx.com에서 한 번에 비교하세요.',
  'print_design_services':
    '소량 주문 가능한 인쇄·패키지 디자인 업체를 찾으시나요? 박스 디자인, 라벨 인쇄, 맞춤 포장 전문 업체를 packlinx.com에서 바로 비교하세요.',
}

const CATEGORY_OG_TITLE: Partial<Record<IndustryCategory, string>> = {
  'fresh_produce_packaging': '농산물·신선 포장 전문 업체 — packlinx',
  'print_design_services':   '인쇄·디자인 서비스 전문 업체 — packlinx',
}

const CATEGORY_OG_DESCRIPTION: Partial<Record<IndustryCategory, string>> = {
  'fresh_produce_packaging': '신선도 유지·콜드체인 포장재 공급업체를 빠르게 비교하세요. 국내 신선 포장 전문 업체 목록.',
  'print_design_services':   '소량 맞춤 인쇄부터 패키지 디자인까지. 스타트업·소규모 발주에 특화된 인쇄·디자인 업체 목록.',
}

function slugToCategory(slug: string): IndustryCategory | undefined {
  return INDUSTRY_CATEGORIES.find((k) => k === slug)
}

export function generateStaticParams() {
  return INDUSTRY_CATEGORIES.map((key) => ({ slug: key }))
}

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ material?: string; form?: string; cert?: string; 'use-case'?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const categoryKey = slugToCategory(slug)
  if (!categoryKey) return { title: '카테고리를 찾을 수 없습니다' }

  const title = CATEGORY_SEO_TITLE[categoryKey]
  const description = CATEGORY_SEO_DESCRIPTION[categoryKey]

  return {
    title,
    description,
    alternates: { canonical: `/categories/${slug}` },
    openGraph: {
      title: CATEGORY_OG_TITLE[categoryKey] ?? `${title} — Packlinx`,
      description: CATEGORY_OG_DESCRIPTION[categoryKey] ?? description,
      url: `${siteUrl}/categories/${slug}`,
      type: 'website',
    },
  }
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params
  const sp = await searchParams
  const { material, form, cert } = sp
  const useCaseParam = sp['use-case']
  const categoryKey = slugToCategory(slug)
  if (!categoryKey) notFound()

  const label = INDUSTRY_CATEGORY_LABELS[categoryKey]
  const description = INDUSTRY_CATEGORY_DESCRIPTIONS[categoryKey]
  const icon = INDUSTRY_CATEGORY_ICONS[categoryKey]

  const selectedMaterials: MaterialType[] = material
    ? (material.split(',').filter((m): m is MaterialType => MATERIAL_TYPES.includes(m as MaterialType)))
    : []

  const selectedForms: PackagingForm[] = form
    ? (form.split(',').filter((f): f is PackagingForm => PACKAGING_FORMS.includes(f as PackagingForm)))
    : []

  const selectedCerts: string[] = cert
    ? cert.split(',').filter((c) => CERTIFICATION_TYPES.some((ct) => ct.id === c))
    : []

  const selectedUseCase = useCaseParam ?? null

  const buildMaterialUrl = (mat: MaterialType): string => {
    const current = new Set(selectedMaterials)
    if (current.has(mat)) current.delete(mat)
    else current.add(mat)
    const matStr = Array.from(current).join(',')
    const p = new URLSearchParams()
    if (matStr) p.set('material', matStr)
    if (form) p.set('form', form)
    if (cert) p.set('cert', cert)
    if (useCaseParam) p.set('use-case', useCaseParam)
    return `/categories/${slug}${p.toString() ? `?${p}` : ''}`
  }

  const buildFormUrl = (pf: PackagingForm): string => {
    const current = new Set(selectedForms)
    if (current.has(pf)) current.delete(pf)
    else current.add(pf)
    const formStr = Array.from(current).join(',')
    const p = new URLSearchParams()
    if (material) p.set('material', material)
    if (formStr) p.set('form', formStr)
    if (cert) p.set('cert', cert)
    if (useCaseParam) p.set('use-case', useCaseParam)
    return `/categories/${slug}${p.toString() ? `?${p}` : ''}`
  }

  const buildCertUrl = (certId: string): string => {
    const current = new Set(selectedCerts)
    if (current.has(certId)) current.delete(certId)
    else current.add(certId)
    const certStr = Array.from(current).join(',')
    const p = new URLSearchParams()
    if (material) p.set('material', material)
    if (form) p.set('form', form)
    if (certStr) p.set('cert', certStr)
    if (useCaseParam) p.set('use-case', useCaseParam)
    return `/categories/${slug}${p.toString() ? `?${p}` : ''}`
  }

  const buildUseCaseUrl = (tagSlug: string): string => {
    const p = new URLSearchParams()
    if (material) p.set('material', material)
    if (form) p.set('form', form)
    if (cert) p.set('cert', cert)
    if (selectedUseCase !== tagSlug) p.set('use-case', tagSlug)
    return `/categories/${slug}${p.toString() ? `?${p}` : ''}`
  }

  const formUrls: Record<string, string> = {}
  for (const pf of PACKAGING_FORMS) {
    formUrls[pf] = buildFormUrl(pf)
  }

  const certUrls: Record<string, string> = {}
  for (const ct of CERTIFICATION_TYPES) {
    certUrls[ct.id] = buildCertUrl(ct.id)
  }

  const supabase = await createClient()

  const { data: useCaseTags } = await supabase
    .from('use_case_tags')
    .select('id, slug, label, icon, sort_order, seo_slug')
    .eq('parent_industry', categoryKey)
    .order('sort_order', { ascending: true })
    .order('label', { ascending: true })

  const useCaseTagList = (useCaseTags ?? []) as Pick<UseCaseTag, 'id' | 'slug' | 'label' | 'icon' | 'sort_order' | 'seo_slug'>[]

  let query = supabase
    .from('companies')
    .select('id, slug, name, description, category, industry_categories, material_type, packaging_form, tags, is_verified, products, certifications, founded_year, website, icon_url, service_capabilities, target_industries')
    .contains('industry_categories', [categoryKey])
    .order('is_verified', { ascending: false })
    .order('name')

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
  if (selectedCerts.length > 0) {
    // Expand canonical IDs to all known aliases so stored values like 'HACCP 인증' match 'haccp'
    const certAliases = selectedCerts.flatMap((id) => {
      const found = CERTIFICATION_TYPES.find((c) => c.id === id)
      return found ? found.aliases : [id]
    })
    query = query.overlaps('certifications', certAliases)
  }
  if (selectedUseCase) {
    query = query.contains('use_case_tags', [selectedUseCase])
  }

  const { data: companies } = await query

  const { count: totalInCategory } = await supabase
    .from('companies')
    .select('*', { count: 'exact', head: true })
    .contains('industry_categories', [categoryKey])

  const { data: relatedPosts } = await supabase
    .from('blog_posts')
    .select('id, slug, title, excerpt, published_at')
    .eq('category', categoryKey)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(3)

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Packlinx', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: label, item: `${siteUrl}/categories/${slug}` },
    ],
  }

  const collectionJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${siteUrl}/categories/${slug}`,
    name: CATEGORY_SEO_TITLE[categoryKey],
    description: CATEGORY_SEO_DESCRIPTION[categoryKey],
    url: `${siteUrl}/categories/${slug}`,
    inLanguage: 'ko',
    isPartOf: { '@type': 'WebSite', name: 'Packlinx', url: siteUrl },
    numberOfItems: totalInCategory ?? companies?.length ?? 0,
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />

      {/* Header */}
      <header className="bg-white sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <PacklinxLogo variant="light" />
            <span className="hidden sm:inline text-gray-300 text-[11px] font-medium tracking-widest uppercase">전국 패키징 파트너, 한 번에</span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/blog" className="text-gray-500 hover:text-gray-900 text-[13px] font-medium transition-colors">
              가이드
            </Link>
          </nav>
        </div>
      </header>

      {/* Category Hero */}
      <section className="bg-[#F8FAFC] bg-dot-grid border-b border-gray-100 pt-12 pb-14 sm:pt-16 sm:pb-18 px-5">
        <div className="max-w-3xl mx-auto">
          <nav className="text-sm text-gray-400 mb-6">
            <Link href="/" className="hover:text-gray-600 transition-colors">홈</Link>
            <span className="mx-2">&rsaquo;</span>
            <span className="text-gray-700 font-medium">{label}</span>
          </nav>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">{icon}</span>
            <h1 className="text-[32px] sm:text-[42px] font-extrabold text-gray-900 leading-[1.1] tracking-[-0.04em]">
              {label} 업체
            </h1>
          </div>
          <h2 className="text-gray-500 text-[16px] leading-relaxed max-w-lg font-normal">
            {description}
          </h2>
          {totalInCategory != null && (
            <p className="text-[13px] text-[#005EFF] font-semibold mt-3">
              {totalInCategory.toLocaleString()}개 업체 등록됨
            </p>
          )}
        </div>
      </section>

      {/* Filters */}
      <div className="bg-white border-b border-gray-100 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          {/* Material filter chips */}
          <div className="flex gap-1.5 py-3 overflow-x-auto scrollbar-none">
            <span className="flex-shrink-0 text-[10px] font-semibold text-gray-300 uppercase tracking-widest self-center mr-2 hidden sm:inline">소재</span>
            <Link
              href={(() => {
                const p = new URLSearchParams()
                if (form) p.set('form', form)
                return `/categories/${slug}${p.toString() ? `?${p}` : ''}`
              })()}
              className={`flex-shrink-0 px-3 py-1.5 rounded-md text-[13px] font-medium transition-all ${
                selectedMaterials.length === 0
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              전체
            </Link>
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

          {/* Use-case filter chips — 태그가 있을 때만 노출 */}
          {useCaseTagList.length > 0 && (
            <div className="flex gap-1.5 py-2.5 flex-wrap items-center border-t border-gray-100">
              <span className="flex-shrink-0 text-[10px] font-semibold text-gray-300 uppercase tracking-widest self-center mr-1 hidden sm:inline">
                용도
              </span>
              <Link
                href={(() => {
                  const p = new URLSearchParams()
                  if (material) p.set('material', material)
                  if (form) p.set('form', form)
                  if (cert) p.set('cert', cert)
                  return `/categories/${slug}${p.toString() ? `?${p}` : ''}`
                })()}
                className={`flex-shrink-0 px-2.5 py-1 rounded text-[11px] font-medium transition-all border ${
                  !selectedUseCase
                    ? 'bg-[#005EFF] text-white border-[#005EFF]'
                    : 'text-gray-500 border-gray-200 hover:text-gray-700 hover:border-gray-300 bg-white'
                }`}
              >
                전체
              </Link>
              {useCaseTagList.map((tag) => {
                const isActive = selectedUseCase === tag.slug
                return (
                  <Link
                    key={tag.id}
                    href={buildUseCaseUrl(tag.slug)}
                    className={`flex-shrink-0 px-2.5 py-1 rounded text-[11px] font-medium transition-all border flex items-center gap-1 ${
                      isActive
                        ? 'bg-[#005EFF] text-white border-[#005EFF]'
                        : 'text-gray-500 border-gray-200 hover:text-gray-700 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <span>{tag.icon}</span>
                    {tag.label}
                  </Link>
                )
              })}
            </div>
          )}

          {/* Packaging form filter chips — 더 보기 접이식 (Client Component) */}
          <PackagingFormFilter selectedForms={selectedForms} formUrls={formUrls} />

          {/* 인증 필터 (Client Component) */}
          <CertFilterAccordion
            certsByCategory={CERTS_BY_CATEGORY}
            activeCerts={selectedCerts}
            certCategoryColors={CERT_CATEGORY_COLORS}
            certCategoryLabels={CERTIFICATION_CATEGORY_LABELS}
            certUrls={certUrls}
          />
        </div>
      </div>

      {/* Results */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5 flex-wrap">
            <p className="text-sm text-gray-500">
              <span className="font-semibold text-gray-900">{companies?.length ?? 0}</span>개 업체
            </p>
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
            {selectedCerts.map((certId) => {
              const ct = CERTIFICATION_TYPES.find((c) => c.id === certId)
              if (!ct) return null
              return (
                <Link
                  key={certId}
                  href={buildCertUrl(certId)}
                  className="text-[11px] bg-green-50 text-green-700 font-medium px-2.5 py-1 rounded-full flex items-center gap-1 hover:bg-green-100 transition-colors border border-green-200"
                >
                  {ct.label}
                  <span className="text-green-500/60 text-[10px] leading-none">×</span>
                </Link>
              )
            })}
            {selectedUseCase && (() => {
              const tag = useCaseTagList.find((t) => t.slug === selectedUseCase)
              if (!tag) return null
              const clearUrl = buildUseCaseUrl(selectedUseCase)
              return (
                <Link
                  href={clearUrl}
                  className="text-[11px] bg-[#EBF2FF] text-[#005EFF] font-medium px-2.5 py-1 rounded-full flex items-center gap-1 hover:bg-[#D6E8FF] transition-colors"
                >
                  {tag.icon} {tag.label}
                  <span className="text-[#005EFF]/60 text-[10px] leading-none">×</span>
                </Link>
              )
            })()}
            {(selectedMaterials.length > 0 || selectedForms.length > 0 || selectedCerts.length > 0 || selectedUseCase) && (
              <Link href={`/categories/${slug}`} className="text-xs text-gray-400 hover:text-gray-600">
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
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3.5">
                    <div className="flex flex-wrap gap-1.5">
                      {company.material_type && (
                        <span className="text-[11px] font-medium bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
                          {MATERIAL_TYPE_LABELS[company.material_type as MaterialType]}
                        </span>
                      )}
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
                    </div>
                  )}

                  <div className="border-t border-gray-100 pt-3.5 flex items-center justify-between gap-2">
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
                      <span className="text-[12px] text-gray-300">&mdash;</span>
                    )}
                    <span className="text-[11px] text-gray-400 flex-shrink-0">
                      {company.founded_year ? `est. ${company.founded_year}` : ''}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="text-center py-24">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              {selectedCerts.length > 0 ? (
                <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              )}
            </div>
            {selectedCerts.length > 0 ? (
              <>
                <p className="text-gray-600 font-semibold mb-1.5 text-[15px]">해당 인증 보유 업체를 추가 수집 중입니다</p>
                <p className="text-gray-400 text-sm mb-5">현재 인증 데이터를 지속적으로 확보하고 있습니다. 다른 인증을 선택하거나 전체 업체를 확인하세요.</p>
              </>
            ) : (
              <>
                <p className="text-gray-600 font-semibold mb-1.5 text-[15px]">검색 결과가 없습니다</p>
                <p className="text-gray-400 text-sm mb-5">필터를 변경해보세요</p>
              </>
            )}
            <Link href={`/categories/${slug}`} className="text-sm text-gray-900 font-medium hover:underline underline-offset-4">
              전체 보기 &rarr;
            </Link>
          </div>
        )}
      </section>

      {/* Related Blog Posts */}
      {relatedPosts && relatedPosts.length > 0 && (
        <section className="max-w-7xl mx-auto px-5 sm:px-8 pb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[13px] font-semibold text-gray-400 uppercase tracking-wider">관련 가이드</h2>
            <Link href="/blog" className="text-[12px] text-[#005EFF] hover:text-[#0047CC] font-medium transition-colors">
              블로그 전체 보기 →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {relatedPosts.map((post: Pick<BlogPost, 'id' | 'slug' | 'title' | 'excerpt' | 'published_at'>) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 hover:shadow-sm transition-all group"
              >
                <p className="text-[11px] text-gray-400 mb-2">
                  {post.published_at
                    ? new Date(post.published_at).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
                    : ''}
                </p>
                <h3 className="text-[14px] font-semibold text-gray-900 leading-snug mb-2 line-clamp-2 group-hover:text-[#005EFF] transition-colors">
                  {post.title}
                </h3>
                {post.excerpt && (
                  <p className="text-[12px] text-gray-500 leading-relaxed line-clamp-2">{post.excerpt}</p>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Other Categories */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 pb-12">
        <h2 className="text-[13px] font-semibold text-gray-400 uppercase tracking-wider mb-4">다른 카테고리</h2>
        <div className="flex flex-wrap gap-2">
          {INDUSTRY_CATEGORIES.filter((k) => k !== categoryKey).map((key) => (
            <Link
              key={key}
              href={`/categories/${key}`}
              className="text-[13px] text-gray-600 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors"
            >
              {INDUSTRY_CATEGORY_LABELS[key]}
            </Link>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white mt-auto py-8">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-col gap-2">
              <PacklinxLogo variant="light" layout="horizontal" />
              <p className="text-[12px] text-gray-400 leading-relaxed">
                &copy; 2026 PACKLINX. 본 서비스의 업체 정보는 공개된 출처에서 자동 수집되었습니다.<br className="hidden sm:inline" />
                정보 오류·삭제 요청: privacy@pkging.kr
              </p>
            </div>
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
