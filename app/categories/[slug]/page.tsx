import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PacklinxLogo } from '@/components/PacklinxLogo'
import { BusinessRegistrationInfo } from '@/components/BusinessRegistrationInfo'
import {
  INDUSTRY_CATEGORIES,
  INDUSTRY_CATEGORY_LABELS,
  INDUSTRY_CATEGORY_DESCRIPTIONS,
  INDUSTRY_CATEGORY_ICONS,
  MATERIAL_TYPES,
  MATERIAL_TYPE_LABELS,
  PACKAGING_FORMS,
  CERTIFICATION_TYPES,
  type IndustryCategory,
  type MaterialType,
  type PackagingForm,
  type BlogPost,
  type UseCaseTag,
} from '@/types'
import { CategoryGuideBlock } from '@/components/CategoryGuideBlock'
import { CategoryFilterBar } from './CategoryFilterBar'
import { ActiveFilterChips } from './ActiveFilterChips'
import { createClient } from '@/lib/supabase/server'
import { simplifyCompanyName } from '@/lib/simplify-company-name'
import { WebsiteFavicon } from '@/components/WebsiteFavicon'
import { Pagination } from '@/components/Pagination'
import AddToCompareButton from '@/app/components/AddToCompareButton'
import CompareCart from '@/app/components/CompareCart'
import { VerifiedTooltip } from '@/components/VerifiedTooltip'
import { VendorDirectoryDisclaimer } from '@/components/VendorDirectoryDisclaimer'

const PAGE_SIZE = 30


export const revalidate = 300

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.packlinx.com'

const CATEGORY_SEO_TITLE: Record<IndustryCategory, string> = {
  'food-beverage':           '식품 포장업체 찾기 — 전국 식품·음료 포장재 업체',
  'ecommerce-shipping':      '택배박스·이커머스 포장 업체 — 전국 배송 포장재 업체',
  'cosmetics-beauty':        '화장품 포장 업체 찾기 — 뷰티 브랜드 포장재 전문',
  'pharma-health':           '의약품·건강기능식품 포장 업체 — 전국 의약 포장재',
  'electronics-industrial':  '전자·산업용 포장 업체 — 보호 포장재 전문',
}

const CATEGORY_SEO_DESCRIPTION: Record<IndustryCategory, string> = {
  'food-beverage':
    '전국 210개 식품·음료 포장 업체를 한 번에 찾으세요. 냉동식품·HMR·음료용 포장재 B2B 공급업체 비교 Packlinx.',
  'ecommerce-shipping':
    '전국 237개 이커머스·배송 포장 업체를 한 번에 비교하세요. 택배박스, 완충재, 배송봉투 전문 B2B 공급업체 Packlinx.',
  'cosmetics-beauty':
    '전국 170개 화장품·뷰티 포장 업체를 비교하세요. 스킨케어·메이크업·헤어케어용 병·파우치·박스 B2B 공급업체 Packlinx.',
  'pharma-health':
    '의약품, 건강기능식품 포장 업체를 비교하세요. GMP 인증 의약 포장재 전문 업체를 찾아보세요.',
  'electronics-industrial':
    '전자제품, 부품, 산업재 보호 포장 업체를 비교하세요. 완충·정전기방지 포장재 전문 업체를 Packlinx에서 찾아보세요.',
}

const CATEGORY_H1_OVERRIDE: Partial<Record<IndustryCategory, string>> = {
  'ecommerce-shipping': '이커머스·택배 포장 업체',
}

const HIDE_ICON_CATEGORIES = new Set<IndustryCategory>([
  'ecommerce-shipping',
  'cosmetics-beauty',
])

const CATEGORY_OG_TITLE: Partial<Record<IndustryCategory, string>> = {}

const CATEGORY_OG_DESCRIPTION: Partial<Record<IndustryCategory, string>> = {}

const RELATED_CATEGORIES: Record<IndustryCategory, IndustryCategory[]> = {
  'food-beverage':           ['pharma-health', 'ecommerce-shipping', 'cosmetics-beauty'],
  'ecommerce-shipping':      ['electronics-industrial', 'food-beverage', 'cosmetics-beauty'],
  'cosmetics-beauty':        ['pharma-health', 'food-beverage', 'ecommerce-shipping'],
  'pharma-health':           ['cosmetics-beauty', 'food-beverage', 'electronics-industrial'],
  'electronics-industrial':  ['ecommerce-shipping', 'food-beverage', 'pharma-health'],
}

const CATEGORY_KEYWORDS: Record<IndustryCategory, Array<{ slug: string; label: string }>> = {
  'food-beverage': [
    { slug: '지퍼백-제작', label: '지퍼백 제작' },
    { slug: '비닐봉투-제작', label: '비닐봉투 제작' },
    { slug: '진공포장기-가격', label: '진공포장기 가격' },
    { slug: '유리병-제작', label: '유리병 제작' },
  ],
  'ecommerce-shipping': [
    { slug: '택배박스-제작', label: '택배박스 제작' },
    { slug: '골판지박스-제작', label: '골판지박스 제작' },
    { slug: '소량-박스-제작', label: '소량 박스 제작' },
    { slug: '박스-견적', label: '박스 견적' },
  ],
  'cosmetics-beauty': [
    { slug: '화장품-용기-제작', label: '화장품 용기 제작' },
    { slug: '화장품-펌프-용기', label: '화장품 펌프 용기' },
    { slug: '공병-가격', label: '공병 가격' },
    { slug: '라벨-스티커-제작', label: '라벨 스티커 제작' },
  ],
  'pharma-health': [
    { slug: '플라스틱-용기-제작', label: '플라스틱 용기 제작' },
    { slug: '유리병-제작', label: '유리병 제작' },
    { slug: '라벨-스티커-제작', label: '라벨 스티커 제작' },
    { slug: '스티커-인쇄-업체', label: '스티커 인쇄 업체' },
  ],
  'electronics-industrial': [
    { slug: '박스-테이프-제작', label: '박스 테이프 제작' },
    { slug: '택배박스-제작', label: '택배박스 제작' },
    { slug: '테이프-제작', label: '테이프 제작' },
    { slug: '골판지박스-제작', label: '골판지박스 제작' },
  ],
}

function slugToCategory(slug: string): IndustryCategory | undefined {
  return INDUSTRY_CATEGORIES.find((k) => k === slug)
}

export function generateStaticParams() {
  return INDUSTRY_CATEGORIES.map((key) => ({ slug: key }))
}

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ material?: string; form?: string; cert?: string; 'use-case'?: string; sort?: string; sample?: string; eco?: string; fresh?: string; page?: string }>
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
  const { material, form, cert, sort, sample, eco, fresh } = sp
  const useCaseParam = sp['use-case']
  const currentPage = Math.max(1, parseInt(sp.page ?? '1', 10))
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

  const buildPageUrl = (page: number): string => {
    const p = new URLSearchParams()
    if (material) p.set('material', material)
    if (form) p.set('form', form)
    if (cert) p.set('cert', cert)
    if (useCaseParam) p.set('use-case', useCaseParam)
    if (sort) p.set('sort', sort)
    if (sample) p.set('sample', sample)
    if (eco) p.set('eco', eco)
    if (fresh) p.set('fresh', fresh)
    if (page > 1) p.set('page', String(page))
    return `/categories/${slug}${p.toString() ? `?${p}` : ''}`
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
    .select('id, slug, name, description, category, industry_categories, material_type, packaging_form, is_verified, products, certifications, founded_year, website, icon_url, service_capabilities, target_industries, sample_available', { count: 'exact' })
    .contains('industry_categories', [categoryKey])

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
  if (sample === 'true') query = query.eq('sample_available', true)
  if (eco === 'true') query = query.eq('is_eco', true)
  if (fresh === 'true') query = query.eq('is_cold_chain', true)

  if (sort === 'name_asc') {
    query = query.order('name', { ascending: true })
  } else if (sort === 'est_asc') {
    query = query.order('founded_year', { ascending: true, nullsFirst: false }).order('name')
  } else if (sort === 'est_desc') {
    query = query.order('founded_year', { ascending: false, nullsFirst: false }).order('name')
  } else {
    query = query.order('is_verified', { ascending: false }).order('name')
  }

  const offset = (currentPage - 1) * PAGE_SIZE
  query = query.range(offset, offset + PAGE_SIZE - 1)

  const { data: companies, count: filteredCount } = await query
  const totalPages = Math.ceil((filteredCount ?? 0) / PAGE_SIZE)

  const { count: totalInCategory } = await supabase
    .from('companies')
    .select('*', { count: 'exact', head: true })
    .contains('industry_categories', [categoryKey])

  const { data: relatedPosts } = await supabase
    .from('blog_posts')
    .select('id, slug, title, excerpt, published_at')
    .eq('category', categoryKey)
    .eq('status', 'published')
    .eq('content_type', 'guide')
    .order('published_at', { ascending: false })
    .limit(3)

  const hasFilters = selectedMaterials.length > 0 || selectedForms.length > 0 || selectedCerts.length > 0 || !!selectedUseCase || sample === 'true' || eco === 'true' || fresh === 'true'
  const heroCount = hasFilters ? filteredCount : totalInCategory

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
    <>
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
      <header className="bg-[#0F172A] sticky top-0 z-50 border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <PacklinxLogo variant="dark" />
            <span className="hidden sm:inline text-slate-400 text-[11px] font-medium tracking-widest uppercase">전국 패키징 파트너, 한 번에</span>
          </Link>
          <nav className="flex items-center gap-3">
            <Link
              href="/categories"
              className="flex items-center gap-1.5 text-slate-200 hover:text-white text-sm font-medium px-3.5 py-2 border border-white/[0.15] hover:border-white/[0.30] hover:bg-white/[0.06] rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-white/40 focus-visible:ring-offset-[#0F172A]"
            >
              <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
              </svg>
              카테고리
            </Link>
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

      {/* Category Hero - compact one-line */}
      <section className="bg-white border-b border-gray-100 px-5">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 py-4 flex-wrap">
            {!HIDE_ICON_CATEGORIES.has(categoryKey) && (
              <span className="text-[24px] leading-none flex-shrink-0">{icon}</span>
            )}
            <h1 className="text-[20px] font-light text-heading-deep-navy leading-tight">
              {CATEGORY_H1_OVERRIDE[categoryKey] ?? `${label} 업체`}
            </h1>
            {heroCount != null && (
              <span className="text-[14px] text-slate-500 font-medium">
                {heroCount.toLocaleString()}개
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Dropdown filter bar (desktop) + mobile filter button */}
      <CategoryFilterBar
        categorySlug={slug}
        isPrintDesign={false}
        resultCount={filteredCount ?? 0}
        useCaseTags={useCaseTagList}
      />

      {/* Active filter chips row */}
      <ActiveFilterChips
        isPrintDesign={false}
        useCaseTags={useCaseTagList}
      />

      {/* Results */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 py-8">
        {companies && companies.length > 0 ? (
          <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {companies.map((company) => (
              <article
                key={company.id}
                className="bg-white border border-border-v04 rounded-xl overflow-hidden hover:border-stripe-purple/20 hover:shadow-[var(--shadow-elevated-v04)] hover:-translate-y-px transition-all duration-200 group relative"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3.5">
                    <div className="flex flex-wrap gap-1.5">
                      {company.is_verified && <VerifiedTooltip />}
                      {company.material_type && (
                        <span className="text-[11px] font-medium bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
                          {MATERIAL_TYPE_LABELS[company.material_type as MaterialType]}
                        </span>
                      )}
                    </div>
                  </div>

                  <h2 className="text-base font-bold text-heading-deep-navy mb-1 leading-snug tracking-[-0.02em] line-clamp-1" title={company.name}>
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
                            <span key={i} className="text-[11px] font-medium bg-stripe-purple/6 text-stripe-purple px-2 py-0.5 rounded">
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
                        <WebsiteFavicon iconUrl={company.icon_url ?? null} className="w-4 h-4" />
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
                  <div className="mt-2.5 flex justify-end">
                    <AddToCompareButton slug={company.slug} name={company.name} />
                  </div>
                </div>
              </article>
            ))}
          </div>
          <Pagination currentPage={currentPage} totalPages={totalPages} buildPageUrl={buildPageUrl} />
          </>
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

      {/* Category Guide */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 pb-8">
        <CategoryGuideBlock categoryId={categoryKey} />
      </section>

      {/* Related Blog Posts */}
      {relatedPosts && relatedPosts.length > 0 && (
        <section className="max-w-7xl mx-auto px-5 sm:px-8 pb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[13px] font-semibold text-gray-400 uppercase tracking-wider">관련 가이드</h2>
            <Link href="/guides" className="text-[12px] text-stripe-purple hover:text-stripe-purple-hover font-medium transition-colors">
              가이드 전체 보기 →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {relatedPosts.map((post: Pick<BlogPost, 'id' | 'slug' | 'title' | 'excerpt' | 'published_at'>) => (
              <Link
                key={post.id}
                href={`/guides/${post.slug}`}
                className="bg-white border border-border-v04 rounded-xl p-5 hover:border-stripe-purple/30 hover:shadow-[0_4px_12px_rgba(50,50,93,0.15)] transition-all group"
              >
                <p className="text-[11px] text-gray-400 mb-2">
                  {post.published_at
                    ? new Date(post.published_at).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
                    : ''}
                </p>
                <h3 className="text-[14px] font-semibold text-gray-900 leading-snug mb-2 line-clamp-2 group-hover:text-stripe-purple transition-colors">
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

      {/* Related Categories — curated */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 pb-6">
        <h2 className="text-[13px] font-semibold text-gray-400 uppercase tracking-wider mb-4">관련 카테고리</h2>
        <div className="flex flex-wrap gap-3">
          {RELATED_CATEGORIES[categoryKey].map((key) => (
            <Link
              key={key}
              href={`/categories/${key}`}
              className="inline-flex items-center gap-2 text-[13px] font-medium text-gray-700 bg-white border border-border-v04 hover:border-stripe-purple hover:text-stripe-purple px-4 py-2 rounded-xl transition-all shadow-sm"
            >
              <span className="text-base">{INDUSTRY_CATEGORY_ICONS[key]}</span>
              <span>{INDUSTRY_CATEGORY_LABELS[key]}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Other Categories */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 pb-8">
        <h2 className="text-[13px] font-semibold text-gray-400 uppercase tracking-wider mb-4">다른 카테고리</h2>
        <div className="flex flex-wrap gap-2">
          {INDUSTRY_CATEGORIES.filter((k) => k !== categoryKey && !RELATED_CATEGORIES[categoryKey].includes(k)).map((key) => (
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

      {/* Related Keywords */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 pb-12">
        <h2 className="text-[13px] font-semibold text-gray-400 uppercase tracking-wider mb-4">관련 검색 키워드</h2>
        <div className="flex flex-wrap gap-2">
          {(CATEGORY_KEYWORDS[categoryKey] ?? []).map(({ slug, label }) => (
            <a
              key={slug}
              href={`https://keywords.packlinx.com/keywords/${slug}`}
              className="text-[13px] text-stripe-purple bg-stripe-purple/6 hover:bg-stripe-purple/12 border border-stripe-purple/15 hover:border-stripe-purple/30 px-3 py-1.5 rounded-lg transition-colors"
            >
              {label}
            </a>
          ))}
          <a
            href="https://keywords.packlinx.com/keywords"
            className="text-[13px] text-gray-500 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors"
          >
            키워드 전체 보기 →
          </a>
        </div>
      </section>

      {/* Vendor Directory Disclaimer — Legal §5-A (PACAA-591) */}
      <div className="max-w-7xl mx-auto px-5 sm:px-8 pb-6 text-center">
        <VendorDirectoryDisclaimer />
      </div>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] bg-[#0F172A] mt-auto">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-col gap-2">
              <PacklinxLogo variant="dark" layout="horizontal" />
              <p className="text-[12px] text-slate-400 leading-relaxed">
                &copy; 2026 PACKLINX. 본 서비스의 업체 정보는 공개된 출처에서 자동 수집되었습니다.<br className="hidden sm:inline" />
                정보 오류·삭제 요청: rpdla041200@gmail.com
              </p>
              <BusinessRegistrationInfo theme="dark" />
            </div>
            <div className="flex flex-wrap gap-5 text-[12px] text-slate-400">
              <a href="https://keywords.packlinx.com/keywords" className="hover:text-slate-200 transition-colors">키워드 디렉터리</a>
              <Link href="/guides" className="hover:text-slate-200 transition-colors">패키징 가이드</Link>
              <Link href="/privacy" className="hover:text-slate-200 transition-colors">개인정보처리방침</Link>
              <Link href="/terms" className="hover:text-slate-200 transition-colors">이용약관</Link>
              <Link href="/opt-out?type=takedown" className="hover:text-slate-200 transition-colors">권리침해 신고</Link>
              <Link href="/faq#what-is-jeongbo-deungrok" className="hover:text-slate-200 transition-colors">Packlinx 자체 등록 기준 안내</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
    <CompareCart />
    </>
  )
}
