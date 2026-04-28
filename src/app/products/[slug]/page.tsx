import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PacklinxLogo } from '@/components/PacklinxLogo'
import { TermsNoticeFooterLine } from '@/components/TermsNoticeFooterLine'
import { BusinessRegistrationInfo } from '@/components/BusinessRegistrationInfo'
import {
  MATERIAL_TYPES,
  MATERIAL_TYPE_LABELS,
  CERTIFICATION_TYPES,
  type MaterialType,
} from '@/types'
import { ProductFilterBar } from './ProductFilterBar'
import { ProductActiveFilterChips } from './ActiveFilterChips'
import { createClient } from '@/lib/supabase/server'
import { simplifyCompanyName } from '@/lib/simplify-company-name'
import { WebsiteFavicon } from '@/components/WebsiteFavicon'
import { Pagination } from '@/components/Pagination'
import {
  PRODUCT_SLUGS,
  PRODUCT_SLUG_TO_FORM,
  PRODUCT_GUIDE,
  RELATED_PRODUCTS,
  type ProductSlug,
} from '@/data/productGuide'

const PAGE_SIZE = 30

export const revalidate = 300

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://packlinx.com'

function slugToProduct(slug: string): ProductSlug | undefined {
  return PRODUCT_SLUGS.find((k) => k === slug)
}

export function generateStaticParams() {
  return PRODUCT_SLUGS.map((slug) => ({ slug }))
}

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ material?: string; cert?: string; sort?: string; sample?: string; page?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const productKey = slugToProduct(slug)
  if (!productKey) return { title: '제품을 찾을 수 없습니다' }

  const guide = PRODUCT_GUIDE[productKey]

  return {
    title: guide.seoTitle,
    description: guide.seoDescription,
    alternates: { canonical: `/products/${slug}` },
    openGraph: {
      title: `${guide.label} 포장 업체 — Packlinx`,
      description: guide.seoDescription,
      url: `${siteUrl}/products/${slug}`,
      type: 'website',
    },
  }
}

export default async function ProductPage({ params, searchParams }: Props) {
  const { slug } = await params
  const sp = await searchParams
  const { material, cert, sort, sample } = sp
  const currentPage = Math.max(1, parseInt(sp.page ?? '1', 10))
  const productKey = slugToProduct(slug)
  if (!productKey) notFound()

  const guide = PRODUCT_GUIDE[productKey]
  const packagingForm = PRODUCT_SLUG_TO_FORM[productKey]

  const selectedMaterials: MaterialType[] = material
    ? (material.split(',').filter((m): m is MaterialType => MATERIAL_TYPES.includes(m as MaterialType)))
    : []

  const selectedCerts: string[] = cert
    ? cert.split(',').filter((c) => CERTIFICATION_TYPES.some((ct) => ct.id === c))
    : []

  const buildPageUrl = (page: number): string => {
    const p = new URLSearchParams()
    if (material) p.set('material', material)
    if (cert) p.set('cert', cert)
    if (sort) p.set('sort', sort)
    if (sample) p.set('sample', sample)
    if (page > 1) p.set('page', String(page))
    return `/products/${slug}${p.toString() ? `?${p}` : ''}`
  }

  const supabase = await createClient()

  let query = supabase
    .from('companies')
    .select('id, slug, name, description, category, industry_categories, material_type, packaging_form, is_verified, products, certifications, founded_year, website, icon_url, service_capabilities, target_industries, sample_available', { count: 'exact' })
    .eq('packaging_form', packagingForm)

  if (selectedMaterials.length === 1) {
    query = query.eq('material_type', selectedMaterials[0])
  } else if (selectedMaterials.length > 1) {
    query = query.in('material_type', selectedMaterials)
  }
  if (selectedCerts.length > 0) {
    const certAliases = selectedCerts.flatMap((id) => {
      const found = CERTIFICATION_TYPES.find((c) => c.id === id)
      return found ? found.aliases : [id]
    })
    query = query.overlaps('certifications', certAliases)
  }
  if (sample === 'true') query = query.eq('sample_available', true)

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

  const { count: totalInProduct } = await supabase
    .from('companies')
    .select('*', { count: 'exact', head: true })
    .eq('packaging_form', packagingForm)

  const hasFilters = selectedMaterials.length > 0 || selectedCerts.length > 0 || sample === 'true'
  const heroCount = hasFilters ? filteredCount : totalInProduct

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Packlinx', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: guide.label, item: `${siteUrl}/products/${slug}` },
    ],
  }

  const collectionJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${siteUrl}/products/${slug}`,
    name: guide.seoTitle,
    description: guide.seoDescription,
    url: `${siteUrl}/products/${slug}`,
    inLanguage: 'ko',
    isPartOf: { '@type': 'WebSite', name: 'Packlinx', url: siteUrl },
    numberOfItems: totalInProduct ?? companies?.length ?? 0,
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
      <header className="bg-[#0F172A] sticky top-0 z-50 border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <PacklinxLogo variant="dark" />
            <span className="hidden sm:inline text-slate-400 text-[11px] font-medium tracking-widest uppercase">전국 패키징 파트너, 한 번에</span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/guides" className="text-slate-300 hover:text-white text-[13px] font-medium transition-colors">
              가이드
            </Link>
          </nav>
        </div>
      </header>

      {/* Product Hero */}
      <section className="bg-white border-b border-gray-100 px-5">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 py-4 flex-wrap">
            <span className="text-[24px] leading-none flex-shrink-0">{guide.icon}</span>
            <h1 className="text-[20px] font-bold text-gray-900 leading-tight">
              {guide.label} 업체
            </h1>
            {heroCount != null && (
              <span className="text-[14px] text-slate-500 font-medium">
                {heroCount.toLocaleString()}개
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Filter bar */}
      <ProductFilterBar resultCount={filteredCount ?? 0} />

      {/* Active filter chips */}
      <ProductActiveFilterChips />

      {/* Results */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 py-8">
        {companies && companies.length > 0 ? (
          <>
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
                            <span key={i} className="text-[11px] font-medium bg-[#EFF6FF] text-[#2563EB] px-2 py-0.5 rounded">
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
                </div>
              </article>
            ))}
          </div>
          <Pagination currentPage={currentPage} totalPages={totalPages} buildPageUrl={buildPageUrl} />
          </>
        ) : (
          <div className="text-center py-24">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="text-gray-600 font-semibold mb-1.5 text-[15px]">검색 결과가 없습니다</p>
            <p className="text-gray-400 text-sm mb-5">필터를 변경해보세요</p>
            <Link href={`/products/${slug}`} className="text-sm text-gray-900 font-medium hover:underline underline-offset-4">
              전체 보기 &rarr;
            </Link>
          </div>
        )}
      </section>

      {/* Product Guide */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 pb-8">
        <div className="mt-8 bg-white border border-gray-200 rounded-xl p-6 sm:p-8">
          <p className="text-[14px] sm:text-[15px] text-gray-600 leading-relaxed mb-6">
            {guide.description}
          </p>

          <div className="mb-6">
            <h3 className="text-[12px] font-semibold text-gray-400 uppercase tracking-wider mb-3">
              구매 체크포인트
            </h3>
            <ul className="space-y-2">
              {guide.buyerPoints.map((point, i) => (
                <li key={i} className="flex items-start gap-2.5 text-[13px] sm:text-[14px] text-gray-700 leading-relaxed">
                  <svg className="w-4 h-4 text-[#F97316] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {point}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-[12px] font-semibold text-gray-400 uppercase tracking-wider mb-3">
              주요 제품 유형
            </h3>
            <div className="flex flex-wrap gap-2">
              {guide.subTypes.map((type) => (
                <span
                  key={type}
                  className="text-[12px] font-medium text-gray-600 bg-gray-100 px-3 py-1.5 rounded-lg"
                >
                  {type}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Related Products */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 pb-6">
        <h2 className="text-[13px] font-semibold text-gray-400 uppercase tracking-wider mb-4">관련 제품</h2>
        <div className="flex flex-wrap gap-3">
          {RELATED_PRODUCTS[productKey].map((key) => (
            <Link
              key={key}
              href={`/products/${key}`}
              className="inline-flex items-center gap-2 text-[13px] font-medium text-gray-700 bg-white border border-gray-200 hover:border-[#C2410C] hover:text-[#C2410C] px-4 py-2 rounded-xl transition-all shadow-sm"
            >
              <span className="text-base">{PRODUCT_GUIDE[key].icon}</span>
              <span>{PRODUCT_GUIDE[key].label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Other Products */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 pb-12">
        <h2 className="text-[13px] font-semibold text-gray-400 uppercase tracking-wider mb-4">다른 제품</h2>
        <div className="flex flex-wrap gap-2">
          {PRODUCT_SLUGS.filter((k) => k !== productKey && !RELATED_PRODUCTS[productKey].includes(k)).map((key) => (
            <Link
              key={key}
              href={`/products/${key}`}
              className="text-[13px] text-gray-600 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors"
            >
              {PRODUCT_GUIDE[key].label}
            </Link>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] bg-[#0F172A] mt-auto">
        <TermsNoticeFooterLine theme="dark" />
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
