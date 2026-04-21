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
    ...(company.website && { sameAs: [company.website] }),
    ...(company.founded_year && { foundingDate: String(company.founded_year) }),
    ...(avgRating && { aggregateRating: { '@type': 'AggregateRating', ratingValue: avgRating, reviewCount: reviews?.length ?? 0 } }),
  }

  const hasExpandedInfo = company.founded_year || company.employee_range || company.min_order_quantity
  const hasServiceCapabilities = company.service_capabilities && company.service_capabilities.length > 0
  const hasKeyClients = company.key_clients && company.key_clients.length > 0
  const hasTargetIndustries = company.target_industries && company.target_industries.length > 0
  const hasTags = company.tags && company.tags.length > 0

  return (
    <div className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(companyJsonLd) }}
      />

      {/* Header */}
      <header className="bg-[#0A0F1E] sticky top-0 z-50 border-b border-white/[0.06]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <BoxterLogo variant="dark" size="sm" />
            <span className="hidden sm:inline text-white/25 text-[11px] font-medium tracking-widest uppercase">B2B 포장업체 디렉토리</span>
          </Link>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="max-w-[800px] mx-auto px-4 sm:px-6 pt-5 pb-0">
        <Link href="/" className="text-sm text-[#005EFF] hover:text-[#0047CC] inline-flex items-center gap-1 transition-colors">
          ← 목록으로
        </Link>
      </div>

      <main className="max-w-[800px] mx-auto px-4 sm:px-6 py-5 pb-16 space-y-4">
        {/* Company Hero Card */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 sm:p-10">
          <div className="flex items-start gap-4 mb-6">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${company.is_verified ? 'bg-green-50 border border-green-200' : 'bg-gray-100 border border-gray-200'}`}>
              <span className={`text-xl font-bold ${company.is_verified ? 'text-green-700' : 'text-gray-400'}`}>
                {company.name.charAt(0)}
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <h1 className="text-[28px] font-bold text-gray-900 tracking-[-0.025em] leading-tight">{company.name}</h1>
                {company.is_verified && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-green-50 text-green-700 border border-green-200 px-2.5 py-1 rounded-full">
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    인증업체
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-gray-100 text-gray-600 text-[11px] font-medium px-2.5 py-1 rounded">
                  {CATEGORY_LABELS[company.category as Category]}
                </span>
                {company.founded_year && (
                  <span className="text-[12px] text-gray-400">est. {company.founded_year}</span>
                )}
                {avgRating && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-gray-900">{avgRating}</span>
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(n => (
                        <div key={n} className={`w-2.5 h-2.5 rounded-sm ${n <= Math.round(Number(avgRating)) ? 'bg-amber-400' : 'bg-gray-200'}`} />
                      ))}
                    </div>
                    <span className="text-[12px] text-gray-400">{reviews?.length}개 리뷰</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {company.is_verified && (
            <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-3.5 mb-6">
              <div className="w-9 h-9 bg-white border border-green-200 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-green-600" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <div>
                <p className="text-[13px] font-semibold text-green-800">BOXTER 인증업체</p>
                <p className="text-[12px] text-gray-600">
                  웹사이트 운영 확인{(company.certifications as string[] | null)?.length! > 0 ? ` · ${(company.certifications as string[]).join(' · ')} 보유` : ''}
                </p>
              </div>
            </div>
          )}

          {/* Tags */}
          {hasTags && (
            <div className="flex flex-wrap gap-1.5 mb-6">
              {(company.tags as string[]).map((t: string) => (
                <Link
                  key={t}
                  href={`/?tag=${t}`}
                  className="text-[12px] bg-gray-100 text-gray-600 px-2.5 py-1 rounded hover:bg-gray-200 transition-colors"
                >
                  {TAG_LABELS[t as CompanyTag] ?? t}
                </Link>
              ))}
            </div>
          )}

          {/* Expanded Info Grid */}
          {hasExpandedInfo && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 border border-gray-100 rounded-lg">
              {company.founded_year && (
                <div>
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">설립연도</p>
                  <p className="text-[14px] font-semibold text-gray-700">{company.founded_year}년</p>
                </div>
              )}
              {company.employee_range && (
                <div>
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">직원수</p>
                  <p className="text-[14px] font-semibold text-gray-700">
                    {EMPLOYEE_RANGE_LABELS[company.employee_range] ?? company.employee_range}
                  </p>
                </div>
              )}
              {company.min_order_quantity && (
                <div>
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">최소 주문량 (MOQ)</p>
                  <p className="text-[14px] font-semibold text-gray-700">{company.min_order_quantity}</p>
                </div>
              )}
            </div>
          )}

          {/* Contact */}
          {company.website && (
            <div className="pt-5 border-t border-gray-100 flex flex-wrap gap-3">
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#005EFF] hover:bg-[#0047CC] text-white text-[13px] font-semibold px-5 py-2.5 rounded-lg transition-colors"
              >
                웹사이트 방문하기 →
              </a>
            </div>
          )}
        </div>

        {/* Company Description */}
        {company.description && (
          <div className="bg-white border border-gray-200 rounded-xl p-6 sm:p-8">
            <h2 className="text-[13px] font-semibold text-gray-700 uppercase tracking-wider mb-4">
              업체 소개
            </h2>
            <div className="border-l-2 border-[#005EFF]/20 pl-5">
              <p className="text-[15px] text-gray-700 leading-[1.8] whitespace-pre-line">
                {company.description}
              </p>
            </div>
          </div>
        )}

        {/* Products + Certifications grid */}
        {((company.products && company.products.length > 0) ||
          (company.certifications && company.certifications.length > 0)) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {company.products && company.products.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <h2 className="text-[13px] font-semibold text-gray-700 uppercase tracking-wider mb-3">
                  취급 제품
                </h2>
                <div className="flex flex-wrap gap-2">
                  {company.products.map((product: string, i: number) => (
                    <span
                      key={i}
                      className="text-[12px] font-medium bg-gray-100 text-gray-700 px-3 py-1.5 rounded"
                    >
                      {product}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {company.certifications && company.certifications.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <h2 className="text-[13px] font-semibold text-gray-700 uppercase tracking-wider mb-3">
                  보유 인증
                </h2>
                <div className="flex flex-wrap gap-2">
                  {company.certifications.map((cert: string, i: number) => (
                    <span
                      key={i}
                      className="text-[12px] font-medium bg-gray-100 text-gray-700 px-3 py-1.5 rounded"
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
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h2 className="text-[13px] font-semibold text-gray-700 uppercase tracking-wider mb-4">
              서비스 역량
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(company.service_capabilities as string[]).map((cap: string, i: number) => (
                <div
                  key={i}
                  className="flex items-center gap-2 text-[13px] text-gray-700 bg-gray-50 rounded-lg px-3 py-2.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#005EFF] flex-shrink-0" />
                  {cap}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Target Industries + Key Clients grid */}
        {(hasTargetIndustries || hasKeyClients) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {hasTargetIndustries && (
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <h2 className="text-[13px] font-semibold text-gray-700 uppercase tracking-wider mb-3">
                  주요 납품 산업
                </h2>
                <div className="flex flex-wrap gap-2">
                  {(company.target_industries as string[]).map((ind: string, i: number) => (
                    <span
                      key={i}
                      className="text-[12px] font-medium bg-gray-100 text-gray-700 px-3 py-1.5 rounded"
                    >
                      {ind}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {hasKeyClients && (
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <h2 className="text-[13px] font-semibold text-gray-700 uppercase tracking-wider mb-3">
                  주요 납품처
                </h2>
                <div className="flex flex-wrap gap-2">
                  {(company.key_clients as string[]).map((client: string, i: number) => (
                    <span
                      key={i}
                      className="text-[12px] font-medium bg-gray-100 text-gray-700 px-3 py-1.5 rounded"
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
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[13px] font-semibold text-gray-700 uppercase tracking-wider">
              바이어 리뷰
            </h2>
            {avgRating && (
              <div className="flex items-center gap-2">
                <span className="text-[28px] font-extrabold text-gray-900 tracking-[-0.03em]">{avgRating}</span>
                <div>
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map(n => (
                      <div key={n} className={`w-3 h-3 rounded-sm ${n <= Math.round(Number(avgRating)) ? 'bg-amber-400' : 'bg-gray-200'}`} />
                    ))}
                  </div>
                  <div className="text-[12px] text-gray-400 mt-0.5">{reviews?.length}개 리뷰</div>
                </div>
              </div>
            )}
          </div>

          {reviews && reviews.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {reviews.map((review) => (
                <div key={review.id} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(n => (
                        <div key={n} className={`w-2.5 h-2.5 rounded-sm ${n <= review.rating ? 'bg-amber-400' : 'bg-gray-200'}`} />
                      ))}
                    </div>
                    <span className="text-[12px] text-gray-400">
                      {new Date(review.created_at).toLocaleDateString('ko-KR')}
                    </span>
                  </div>
                  {review.content && (
                    <p className="text-[13px] text-gray-600 leading-relaxed">{review.content}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <p className="text-[13px] text-gray-400">아직 리뷰가 없습니다.</p>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-gray-50 py-8">
        <div className="max-w-[800px] mx-auto px-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-[12px] text-gray-400">
              © 2026 BOXTER. 업체 정보는 공개 출처에서 자동 수집되었습니다.
              정보 오류·삭제 요청: privacy@pkging.kr
            </p>
            <div className="flex gap-4 text-[12px] text-gray-400">
              <Link href="/privacy" className="hover:text-gray-600 transition-colors">개인정보처리방침</Link>
              <Link href="/terms" className="hover:text-gray-600 transition-colors">이용약관</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
