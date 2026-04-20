import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { BoxterLogo } from '@/components/BoxterLogo'
import { CATEGORY_LABELS, TAG_LABELS, type Category, type CompanyTag } from '@/types'

type Props = {
  params: Promise<{ slug: string }>
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://packlinx.com'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug: rawSlug } = await params
  const slug = decodeURIComponent(rawSlug)
  const supabase = await createClient()
  const { data: company } = await supabase
    .from('companies')
    .select('name, description, category')
    .eq('slug', slug)
    .single()

  if (!company) return { title: '업체를 찾을 수 없습니다' }

  const title = `${company.name} — BOXTER`
  const description = company.description ?? `${company.name} 패키징 업체 상세 정보`

  return {
    title,
    description,
    alternates: {
      canonical: `/companies/${slug}`,
    },
    openGraph: {
      title: company.name,
      description,
      url: `${siteUrl}/companies/${slug}`,
      type: 'profile',
    },
    twitter: {
      card: 'summary',
      title: company.name,
      description,
    },
  }
}

const EMPLOYEE_RANGE_LABELS: Record<string, string> = {
  '1-10': '1~10명',
  '11-50': '11~50명',
  '51-200': '51~200명',
  '200+': '200명 이상',
}

export default async function CompanyPage({ params }: Props) {
  const { slug: rawSlug } = await params
  const slug = decodeURIComponent(rawSlug)
  const supabase = await createClient()

  const { data: company } = await supabase
    .from('companies')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!company) notFound()

  const { data: reviews } = await supabase
    .from('reviews')
    .select('id, rating, content, created_at')
    .eq('company_id', company.id)
    .order('created_at', { ascending: false })
    .limit(10)

  const avgRating =
    reviews && reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : null

  const companyJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: company.name,
    description: company.description ?? '',
    url: `${siteUrl}/companies/${slug}`,
    ...(company.province && { address: { '@type': 'PostalAddress', addressRegion: company.province, addressLocality: company.city ?? '' } }),
    ...(company.website && { sameAs: [company.website] }),
    ...(company.email && { email: company.email }),
    ...(company.founded_year && { foundingDate: String(company.founded_year) }),
    ...(avgRating && { aggregateRating: { '@type': 'AggregateRating', ratingValue: avgRating, reviewCount: reviews?.length ?? 0 } }),
  }

  const hasExpandedInfo = company.founded_year || company.employee_range || company.min_order_quantity
  const hasServiceCapabilities = company.service_capabilities && company.service_capabilities.length > 0
  const hasKeyClients = company.key_clients && company.key_clients.length > 0
  const hasTargetIndustries = company.target_industries && company.target_industries.length > 0
  const hasTags = company.tags && company.tags.length > 0

  return (
    <div className="min-h-screen bg-[#FAFBFC]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(companyJsonLd) }}
      />

      {/* Header */}
      <header className="bg-[#0F172A] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <BoxterLogo variant="dark" size="sm" />
            <span className="hidden sm:inline text-white/30 text-[11px] font-medium tracking-wide uppercase">B2B 포장업체 디렉토리</span>
          </Link>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="max-w-4xl mx-auto px-5 sm:px-8 pt-6 pb-0">
        <Link href="/" className="text-[13px] text-slate-500 hover:text-slate-700 inline-flex items-center gap-1.5 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          목록으로
        </Link>
      </div>

      <main className="max-w-4xl mx-auto px-5 sm:px-8 py-6 pb-16 space-y-5">
        {/* Company Hero Card */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-7 sm:p-9">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-14 h-14 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center flex-shrink-0">
              <span className="text-lg font-bold text-slate-400">
                {company.name.charAt(0)}
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2.5 mb-2">
                <h1 className="text-2xl font-bold text-slate-900">{company.name}</h1>
                {company.is_verified && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-1 rounded-md">
                    인증업체
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2.5 text-sm text-slate-500">
                <span className="bg-slate-50 text-slate-600 text-xs font-medium px-2.5 py-1 rounded-md border border-slate-100">
                  {CATEGORY_LABELS[company.category as Category]}
                </span>
                {company.province && (
                  <span className="text-xs text-slate-400">{company.province} {company.city}</span>
                )}
                {company.founded_year && (
                  <span className="text-xs text-slate-400">설립 {company.founded_year}</span>
                )}
                {avgRating && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-slate-900">{avgRating}</span>
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(n => (
                        <div key={n} className={`w-2.5 h-2.5 rounded-sm ${n <= Math.round(Number(avgRating)) ? 'bg-amber-400' : 'bg-slate-200'}`} />
                      ))}
                    </div>
                    <span className="text-xs text-slate-400">{reviews?.length}개 리뷰</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {company.description && (
            <p className="text-[15px] text-slate-600 leading-[1.7] mb-6">
              {company.description}
            </p>
          )}

          {hasTags && (
            <div className="flex flex-wrap gap-1.5 mb-6">
              {(company.tags as string[]).map((t: string) => (
                <Link
                  key={t}
                  href={`/?tag=${t}`}
                  className="text-xs bg-slate-50 text-slate-600 border border-slate-200 px-2.5 py-1 rounded-md hover:border-slate-300 transition-colors"
                >
                  {TAG_LABELS[t as CompanyTag] ?? t}
                </Link>
              ))}
            </div>
          )}

          {hasExpandedInfo && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-5 mb-6 p-5 bg-slate-50/70 rounded-lg border border-slate-100">
              {company.founded_year && (
                <div>
                  <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1">설립연도</p>
                  <p className="text-sm font-semibold text-slate-700">{company.founded_year}년</p>
                </div>
              )}
              {company.employee_range && (
                <div>
                  <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1">직원수</p>
                  <p className="text-sm font-semibold text-slate-700">
                    {EMPLOYEE_RANGE_LABELS[company.employee_range] ?? company.employee_range}
                  </p>
                </div>
              )}
              {company.min_order_quantity && (
                <div>
                  <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1">최소 주문량</p>
                  <p className="text-sm font-semibold text-slate-700">{company.min_order_quantity}</p>
                </div>
              )}
            </div>
          )}

          {(company.email || company.website) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-6 border-t border-slate-100">
              {company.email && (
                <div>
                  <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1.5">이메일</p>
                  <a
                    href={`mailto:${company.email}`}
                    className="text-sm text-slate-700 font-medium hover:text-slate-900 transition-colors"
                  >
                    {company.email}
                  </a>
                </div>
              )}
              {company.website && (
                <div>
                  <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1.5">웹사이트</p>
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-slate-700 font-medium hover:text-slate-900 inline-flex items-center gap-1 transition-colors"
                  >
                    방문하기
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Products + Certifications */}
        {((company.products && company.products.length > 0) ||
          (company.certifications && company.certifications.length > 0)) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {company.products && company.products.length > 0 && (
              <div className="bg-white border border-slate-200/80 rounded-xl p-6">
                <h2 className="text-[13px] font-semibold text-slate-700 uppercase tracking-wide mb-4">
                  취급 제품
                </h2>
                <div className="flex flex-wrap gap-2">
                  {company.products.map((product: string, i: number) => (
                    <span
                      key={i}
                      className="text-xs font-medium bg-slate-50 border border-slate-100 text-slate-600 px-3 py-1.5 rounded-md"
                    >
                      {product}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {company.certifications && company.certifications.length > 0 && (
              <div className="bg-white border border-slate-200/80 rounded-xl p-6">
                <h2 className="text-[13px] font-semibold text-slate-700 uppercase tracking-wide mb-4">
                  보유 인증
                </h2>
                <div className="flex flex-wrap gap-2">
                  {company.certifications.map((cert: string, i: number) => (
                    <span
                      key={i}
                      className="text-xs font-medium bg-emerald-50 border border-emerald-100 text-emerald-700 px-3 py-1.5 rounded-md"
                    >
                      {cert}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Service Capabilities */}
        {hasServiceCapabilities && (
          <div className="bg-white border border-slate-200/80 rounded-xl p-6">
            <h2 className="text-[13px] font-semibold text-slate-700 uppercase tracking-wide mb-5">
              서비스 역량
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {(company.service_capabilities as string[]).map((cap: string, i: number) => (
                <div
                  key={i}
                  className="flex items-center gap-2.5 text-[13px] text-slate-700 bg-slate-50 rounded-lg px-3.5 py-3 border border-slate-100"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 flex-shrink-0" />
                  {cap}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Target Industries + Key Clients */}
        {(hasTargetIndustries || hasKeyClients) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {hasTargetIndustries && (
              <div className="bg-white border border-slate-200/80 rounded-xl p-6">
                <h2 className="text-[13px] font-semibold text-slate-700 uppercase tracking-wide mb-4">
                  주요 납품 산업
                </h2>
                <div className="flex flex-wrap gap-2">
                  {(company.target_industries as string[]).map((ind: string, i: number) => (
                    <span
                      key={i}
                      className="text-xs font-medium bg-slate-50 text-slate-600 border border-slate-100 px-3 py-1.5 rounded-md"
                    >
                      {ind}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {hasKeyClients && (
              <div className="bg-white border border-slate-200/80 rounded-xl p-6">
                <h2 className="text-[13px] font-semibold text-slate-700 uppercase tracking-wide mb-4">
                  주요 납품처
                </h2>
                <div className="flex flex-wrap gap-2">
                  {(company.key_clients as string[]).map((client: string, i: number) => (
                    <span
                      key={i}
                      className="text-xs font-medium bg-slate-50 text-slate-600 border border-slate-100 px-3 py-1.5 rounded-md"
                    >
                      {client}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Reviews */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[13px] font-semibold text-slate-700 uppercase tracking-wide">
              바이어 리뷰
            </h2>
            {avgRating && (
              <div className="flex items-center gap-2.5">
                <span className="text-2xl font-bold text-slate-900">{avgRating}</span>
                <div>
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map(n => (
                      <div key={n} className={`w-3 h-3 rounded-sm ${n <= Math.round(Number(avgRating)) ? 'bg-amber-400' : 'bg-slate-200'}`} />
                    ))}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{reviews?.length}개 리뷰</div>
                </div>
              </div>
            )}
          </div>

          {reviews && reviews.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {reviews.map((review) => (
                <div key={review.id} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(n => (
                        <div key={n} className={`w-2.5 h-2.5 rounded-sm ${n <= review.rating ? 'bg-amber-400' : 'bg-slate-200'}`} />
                      ))}
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {new Date(review.created_at).toLocaleDateString('ko-KR')}
                    </span>
                  </div>
                  {review.content && (
                    <p className="text-[13px] text-slate-600 leading-relaxed">{review.content}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400 text-center py-10">아직 리뷰가 없습니다.</p>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-white py-8">
        <div className="max-w-4xl mx-auto px-5 sm:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-xs text-slate-400 leading-relaxed">
              © 2026 BOXTER. 업체 정보는 공개 출처에서 자동 수집되었습니다.<br className="hidden sm:inline" />
              정보 오류·삭제 요청: privacy@pkging.kr
            </p>
            <div className="flex gap-5 text-xs text-slate-400">
              <Link href="/privacy" className="hover:text-slate-600 transition-colors">개인정보처리방침</Link>
              <Link href="/terms" className="hover:text-slate-600 transition-colors">이용약관</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
