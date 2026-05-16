import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { SiteHeader } from '@/components/SiteHeader'
import { CompanyIcon } from '@/components/CompanyIcon'
import { CertBadge } from '@/components/CertBadge'
import {
  CATEGORY_LABELS,
  INDUSTRY_CATEGORY_LABELS,
  CERTIFICATION_TYPES,
  type Category,
  type IndustryCategory,
  type Portfolio,
} from '@/types'

type Props = {
  params: Promise<{ slug: string }>
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type CompanyRow = Record<string, any>

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

// Required for next.config.mjs output:export mode; also sets dynamic rendering in SSR mode.
// Only the probe slug is pre-generated; other slugs render dynamically in dev.
export function generateStaticParams() {
  return [{ slug: 'packaging_machinery-ac6b11ca' }]
}

function resolveCertification(raw: string) {
  return (
    CERTIFICATION_TYPES.find(
      (c) => c.id === raw || c.aliases.some((a) => a.toLowerCase() === raw.toLowerCase()),
    ) ?? null
  )
}

function getPortfolioImageUrl(rawUrl: string) {
  if (!rawUrl) return rawUrl
  if (rawUrl.includes('/storage/v1/object/public/')) return `${rawUrl}?width=800&format=webp`
  return rawUrl
}

function InfoBox({ label, value, highlight }: { label: string; value: React.ReactNode; highlight?: boolean }) {
  return (
    <div className={`rounded-lg border p-3 text-center ${highlight ? 'bg-emerald-50 border-emerald-200' : 'bg-neutral-50 border-neutral-200'}`}>
      <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-400 mb-1">{label}</p>
      <div className={`text-[14px] font-bold tracking-tight leading-tight ${highlight ? 'text-emerald-700' : 'text-[#061b31]'}`}>
        {value}
      </div>
    </div>
  )
}

function EmptyField({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 text-[12px] text-neutral-400 bg-neutral-50 border border-dashed border-neutral-200 rounded-lg px-3 py-2">
      <svg className="w-3.5 h-3.5 shrink-0 text-neutral-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 12H4" />
      </svg>
      <span>{label}: <span className="font-medium text-neutral-400">정보 미제공</span></span>
    </div>
  )
}

async function fetchJson<T>(url: string): Promise<T | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  const res = await fetch(`${supabaseUrl}${url}`, {
    headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` },
    next: { revalidate: 60 },
  })
  if (!res.ok) return null
  const data = await res.json()
  return data as T
}

export default async function VendorRedesignV1({ params }: Props) {
  const { slug: rawSlug } = await params
  const slug = decodeURIComponent(rawSlug)

  const companies = await fetchJson<CompanyRow[]>(
    `/rest/v1/companies?slug=eq.${encodeURIComponent(slug)}&is_hidden=not.is.true&limit=1`
  )
  const company = companies?.[0] ?? null
  if (!company) notFound()

  const portfolios = await fetchJson<Portfolio[]>(
    `/rest/v1/company_portfolios?company_id=eq.${company.id}&select=id,title,description,image_url,display_order,category_tag&order=display_order.asc`
  ) ?? []

  const industryCats = (company.industry_categories as string[] | null) ?? []
  const primaryIndustry = industryCats[0] as IndustryCategory | undefined
  const categoryLabel = primaryIndustry
    ? INDUSTRY_CATEGORY_LABELS[primaryIndustry]
    : (CATEGORY_LABELS[company.category as Category] ?? company.category)

  const certItems = ((company.certifications as string[] | null) ?? []).map((raw) => ({
    raw,
    resolved: resolveCertification(raw),
  }))
  const hasCertifications = certItems.length > 0

  const yearsInBusiness = company.founded_year
    ? new Date().getFullYear() - (company.founded_year as number)
    : null

  const hasWebsite = !!company.website
  const hasPhone = !!company.phone
  const hasEmail = !!company.email

  const moqValue = company.moq_value != null ? Number(company.moq_value).toLocaleString() : null
  const moqUnit = (company.moq_unit as string | null) ?? '개'
  const hasPortfolios = portfolios.length > 0

  const hasServiceCapabilities = Array.isArray(company.service_capabilities) && company.service_capabilities.length > 0

  return (
    <>
      {/* noindex via metadata export — this line is an extra safety net for proxies */}
      <meta name="robots" content="noindex, nofollow" />

      <div className="min-h-screen bg-[#f8f9fa]">
        <SiteHeader />

        {/* Internal preview banner */}
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 text-center">
          <p className="text-[12px] font-semibold text-amber-700">
            내부 리뉴얼 프리뷰 · noindex · 외부 공개 금지 —&nbsp;
            <Link href={`/companies/${slug}`} className="underline hover:text-amber-900">
              현재 프로덕션 페이지 보기 →
            </Link>
          </p>
        </div>

        {/* Breadcrumb */}
        <div className="max-w-[1100px] mx-auto px-4 sm:px-6 pt-4 pb-0">
          <div className="flex items-center gap-2 text-[12px] text-neutral-400">
            <Link href="/" className="hover:text-[#533afd] transition-colors">Packlinx</Link>
            <span>›</span>
            <span className="text-neutral-500">[V1 리뉴얼안]</span>
            <span>›</span>
            <span className="text-neutral-600 truncate max-w-[200px]">{company.name}</span>
          </div>
        </div>

        {/* ════ MAIN LAYOUT: Left content + Right sticky RFQ ════ */}
        <div className="max-w-[1100px] mx-auto px-4 sm:px-6 pt-5 pb-20">
          <div className="lg:grid lg:grid-cols-[1fr_320px] lg:gap-6">

            {/* ════ LEFT COLUMN ════ */}
            <div className="space-y-4">

              {/* ── HERO CARD ── */}
              <div className="bg-white border border-[#e5edf5] rounded-xl overflow-hidden" style={{ boxShadow: '0 2px 8px rgba(50,50,93,0.08), 0 1px 3px rgba(0,0,0,0.06)' }}>
                {/* Photo strip / logo row */}
                {hasPortfolios && (
                  <div className="h-[180px] sm:h-[220px] bg-neutral-100 overflow-hidden relative">
                    <div className="grid grid-cols-3 h-full gap-0.5">
                      {portfolios.slice(0, 3).map((p, i) =>
                        p.image_url ? (
                          <div key={p.id} className="relative overflow-hidden">
                            <Image
                              src={getPortfolioImageUrl(p.image_url)}
                              alt={p.title ?? '업체 사진'}
                              fill
                              sizes="(max-width:640px) 33vw, 220px"
                              className="object-cover"
                              priority={i === 0}
                            />
                          </div>
                        ) : null
                      )}
                      {portfolios.length < 3 && (
                        Array.from({ length: 3 - Math.min(portfolios.length, 3) }).map((_, i) => (
                          <div key={i} className="bg-neutral-100" />
                        ))
                      )}
                    </div>
                    {portfolios.length > 3 && (
                      <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm text-white text-[11px] font-semibold px-2 py-1 rounded">
                        +{portfolios.length - 3}장 더
                      </div>
                    )}
                  </div>
                )}

                <div className="p-5 sm:p-6">
                  {/* Company identity row */}
                  <div className="flex items-start gap-4 mb-5">
                    <CompanyIcon
                      iconUrl={company.icon_url ?? null}
                      name={company.name}
                      category={company.category}
                      size="lg"
                      linkUrl={company.website ?? null}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h1 className="text-[24px] sm:text-[28px] font-bold text-[#061b31] tracking-tight leading-tight">
                          {company.name}
                        </h1>
                        {company.is_verified && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Packlinx 검증
                          </span>
                        )}
                      </div>
                      <p className="text-[13px] text-neutral-500 font-medium">{categoryLabel}</p>
                    </div>
                  </div>

                  {/* ── HARD DATA BOXES (Alibaba-inspired above-fold stats) ── */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
                    <InfoBox
                      label="업력"
                      value={yearsInBusiness != null ? <>{yearsInBusiness}<span className="text-[11px] font-medium text-neutral-500 ml-0.5">년</span></> : '정보 미제공'}
                      highlight={false}
                    />
                    <InfoBox
                      label="보유 인증"
                      value={certItems.length > 0 ? <>{certItems.length}<span className="text-[11px] font-medium text-neutral-500 ml-0.5">건</span></> : '없음'}
                    />
                    <InfoBox
                      label="최소주문(MOQ)"
                      value={moqValue != null ? <>{moqValue}<span className="text-[11px] font-medium text-neutral-500 ml-0.5">{moqUnit}</span></> : '문의'}
                    />
                    <InfoBox
                      label="샘플"
                      value={
                        company.sample_available === true
                          ? <span className="text-emerald-700">가능</span>
                          : company.sample_available === false
                          ? '불가'
                          : '확인 필요'
                      }
                    />
                  </div>

                  {/* ── REGISTRATION BOX (사업자·통신판매업·설립연도 boxed) ── */}
                  <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4 mb-5">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-3">사업자 정보 (공개 등록 기준)</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <p className="text-[10px] font-semibold text-neutral-400 mb-0.5">사업자등록번호</p>
                        {company.business_registration_number
                          ? <p className="text-[13px] font-bold text-[#061b31]">{company.business_registration_number as string}</p>
                          : <p className="text-[12px] text-neutral-400 italic">정보 미제공</p>
                        }
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold text-neutral-400 mb-0.5">통신판매업 신고번호</p>
                        {company.telesales_registration_number
                          ? <p className="text-[13px] font-bold text-[#061b31]">{company.telesales_registration_number as string}</p>
                          : <p className="text-[12px] text-neutral-400 italic">정보 미제공</p>
                        }
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold text-neutral-400 mb-0.5">설립연도</p>
                        {company.founded_year
                          ? <p className="text-[13px] font-bold text-[#061b31]">{company.founded_year as number}년</p>
                          : <p className="text-[12px] text-neutral-400 italic">정보 미제공</p>
                        }
                      </div>
                    </div>
                  </div>

                  {/* Company description */}
                  {company.description && (
                    <p className="text-[14px] text-neutral-600 leading-[1.85] whitespace-pre-line">
                      {company.description}
                    </p>
                  )}
                </div>
              </div>

              {/* ── CERTIFICATIONS GRID ── */}
              <div className="bg-white border border-[#e5edf5] rounded-xl p-5" style={{ boxShadow: '0 1px 4px rgba(50,50,93,0.06)' }}>
                <h2 className="text-[14px] font-bold text-[#061b31] mb-1">보유 인증 · 특허</h2>
                <p className="text-[11px] text-neutral-400 mb-4">국내 공인 인증 기준 (KS/KC/ISO 등) — 실제 보유분만 표기</p>
                {hasCertifications ? (
                  <div className="flex flex-wrap gap-2">
                    {certItems.map(({ raw }, i) => (
                      <CertBadge key={i} cert={raw} variant="full" />
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-2.5 bg-neutral-50 border border-dashed border-neutral-200 rounded-lg p-4">
                    <svg className="w-4 h-4 text-neutral-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                    <p className="text-[12px] text-neutral-400">현재 등록된 인증 정보가 없습니다. 업체 문의 시 확인하세요.</p>
                  </div>
                )}
              </div>

              {/* ── PRODUCTION CAPACITY / FACILITY TABLE (있으면 표시, 없으면 미제공) ── */}
              <div className="bg-white border border-[#e5edf5] rounded-xl p-5" style={{ boxShadow: '0 1px 4px rgba(50,50,93,0.06)' }}>
                <h2 className="text-[14px] font-bold text-[#061b31] mb-1">생산 역량 · 시설 정보</h2>
                <p className="text-[11px] text-neutral-400 mb-4">수량·납기 기준 정보 (없는 항목은 정보 미제공으로 표기)</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {company.moq_value != null || company.min_order_quantity ? (
                    <div className="bg-neutral-50 border border-neutral-200 rounded-lg px-4 py-3">
                      <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-1">최소 주문 수량</p>
                      <p className="text-[14px] font-bold text-[#061b31]">
                        {moqValue != null ? `${moqValue} ${moqUnit}` : (company.min_order_quantity as string)}
                      </p>
                    </div>
                  ) : (
                    <EmptyField label="최소 주문 수량" />
                  )}

                  {company.lead_time_standard_days != null ? (
                    <div className="bg-neutral-50 border border-neutral-200 rounded-lg px-4 py-3">
                      <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-1">표준 납기</p>
                      <p className="text-[14px] font-bold text-[#061b31]">{company.lead_time_standard_days as number}일</p>
                    </div>
                  ) : (
                    <EmptyField label="납기" />
                  )}

                  {company.lead_time_express_days != null ? (
                    <div className="bg-neutral-50 border border-neutral-200 rounded-lg px-4 py-3">
                      <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-1">특급 납기</p>
                      <p className="text-[14px] font-bold text-[#061b31]">{company.lead_time_express_days as number}일</p>
                    </div>
                  ) : null}

                  {company.print_method ? (
                    <div className="bg-neutral-50 border border-neutral-200 rounded-lg px-4 py-3">
                      <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-1">인쇄 방식</p>
                      <p className="text-[14px] font-bold text-[#061b31]">{company.print_method as string}</p>
                    </div>
                  ) : null}

                  {company.spec_sheet_available != null ? (
                    <div className="bg-neutral-50 border border-neutral-200 rounded-lg px-4 py-3">
                      <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-1">규격서 발행</p>
                      <p className={`text-[14px] font-bold ${company.spec_sheet_available ? 'text-emerald-700' : 'text-neutral-500'}`}>
                        {company.spec_sheet_available ? '가능' : '미지원'}
                      </p>
                    </div>
                  ) : (
                    <EmptyField label="규격서 발행" />
                  )}
                </div>
              </div>

              {/* ── SERVICE CAPABILITIES ── */}
              {hasServiceCapabilities && (
                <div className="bg-white border border-[#e5edf5] rounded-xl p-5" style={{ boxShadow: '0 1px 4px rgba(50,50,93,0.06)' }}>
                  <h2 className="text-[14px] font-bold text-[#061b31] mb-4">서비스 역량</h2>
                  <div className="grid grid-cols-2 gap-2">
                    {(company.service_capabilities as string[]).map((cap: string, i: number) => (
                      <div key={i} className="flex items-center gap-2 text-[12px] text-neutral-700 bg-neutral-50 border border-neutral-100 rounded-lg px-3 py-2.5">
                        <svg className="w-3.5 h-3.5 text-[#533afd] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {cap}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── PORTFOLIO GALLERY ── */}
              {hasPortfolios && (
                <div className="bg-white border border-[#e5edf5] rounded-xl p-5" style={{ boxShadow: '0 1px 4px rgba(50,50,93,0.06)' }}>
                  <h2 className="text-[14px] font-bold text-[#061b31] mb-4">제품 · 시설 사진</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {portfolios.map((item) =>
                      item.image_url ? (
                        <div key={item.id} className="relative aspect-square rounded-lg overflow-hidden bg-neutral-100 group">
                          <Image
                            src={getPortfolioImageUrl(item.image_url)}
                            alt={item.title ?? '제품 이미지'}
                            fill
                            sizes="(max-width:640px) 50vw, 33vw"
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          {item.category_tag && (
                            <div className="absolute top-2 left-2">
                              <span className="text-[10px] font-semibold text-white bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded">
                                {item.category_tag}
                              </span>
                            </div>
                          )}
                        </div>
                      ) : null
                    )}
                  </div>
                </div>
              )}

              {/* ── PRODUCTS ── */}
              {company.products && (company.products as string[]).length > 0 && (
                <div className="bg-white border border-[#e5edf5] rounded-xl p-5" style={{ boxShadow: '0 1px 4px rgba(50,50,93,0.06)' }}>
                  <h2 className="text-[14px] font-bold text-[#061b31] mb-4">취급 제품 · 품목</h2>
                  <div className="flex flex-wrap gap-2">
                    {(company.products as string[]).map((product: string, i: number) => (
                      <span key={i} className="text-[12px] font-medium bg-neutral-100 text-neutral-700 px-3 py-1.5 rounded-md border border-neutral-200">
                        {product}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* ── CATALOG / MATERIALS REQUEST ── */}
              <div className="bg-white border border-[#e5edf5] rounded-xl p-5" style={{ boxShadow: '0 1px 4px rgba(50,50,93,0.06)' }}>
                <h2 className="text-[14px] font-bold text-[#061b31] mb-2">카탈로그 · 자료 요청</h2>
                <p className="text-[12px] text-neutral-500 mb-4">현재 PDF 카탈로그를 보유한 업체의 경우 담당자가 이메일로 전송해드립니다.</p>
                <div className="flex items-center gap-2.5 bg-neutral-50 border border-dashed border-neutral-300 rounded-lg p-4">
                  <svg className="w-5 h-5 text-neutral-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <div>
                    <p className="text-[12px] font-semibold text-neutral-600">자료 요청은 하단 문의 채널을 이용하세요</p>
                    <p className="text-[11px] text-neutral-400 mt-0.5">이메일 또는 카카오채널로 "카탈로그 요청" 메시지를 보내주세요.</p>
                  </div>
                </div>
              </div>

              {/* Key clients / Target industries */}
              {((company.key_clients && (company.key_clients as string[]).length > 0) || (company.target_industries && (company.target_industries as string[]).length > 0)) && (
                <div className="bg-white border border-[#e5edf5] rounded-xl p-5" style={{ boxShadow: '0 1px 4px rgba(50,50,93,0.06)' }}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {company.target_industries && (company.target_industries as string[]).length > 0 && (
                      <div>
                        <h2 className="text-[14px] font-bold text-[#061b31] mb-3">주요 납품 산업</h2>
                        <div className="flex flex-wrap gap-2">
                          {(company.target_industries as string[]).map((ind: string, i: number) => (
                            <span key={i} className="text-[12px] font-medium bg-neutral-100 text-neutral-500 px-3 py-1.5 rounded-md">
                              {ind}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {company.key_clients && (company.key_clients as string[]).length > 0 && (
                      <div>
                        <h2 className="text-[14px] font-bold text-[#061b31] mb-3">주요 납품처</h2>
                        <div className="flex flex-wrap gap-2">
                          {(company.key_clients as string[]).map((client: string, i: number) => (
                            <span key={i} className="text-[12px] font-medium bg-white text-neutral-500 border border-[#e5edf5] px-3 py-1.5 rounded-md">
                              {client}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* ════ RIGHT COLUMN — Sticky RFQ Panel ════ */}
            <div className="hidden lg:block">
              <div className="sticky top-24 space-y-3">
                {/* Main contact card */}
                <div className="bg-white border border-[#e5edf5] rounded-xl p-5" style={{ boxShadow: '0 4px 16px rgba(50,50,93,0.12), 0 1px 3px rgba(0,0,0,0.08)' }}>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-[15px] font-bold text-[#061b31]">견적·문의 채널</h3>
                    {company.is_verified && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">검증완료</span>
                    )}
                  </div>
                  <p className="text-[11px] text-neutral-400 mb-4">Packlinx 운영팀이 해당 업체와 연결해드립니다</p>

                  <div className="space-y-2.5">
                    {/* Kakao channel */}
                    <a
                      href="https://pf.kakao.com/_packlinx"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 w-full bg-[#FEE500] hover:bg-[#F5DB00] text-[#3A1D1D] font-bold text-[13px] px-4 py-3.5 rounded-xl transition-colors"
                    >
                      <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 3C6.477 3 2 6.799 2 11.5c0 3.009 1.877 5.65 4.703 7.197L5.5 22l4.386-2.46C10.543 19.82 11.261 20 12 20c5.523 0 10-3.799 10-8.5S17.523 3 12 3z"/>
                      </svg>
                      카카오 채널로 문의
                    </a>

                    {hasWebsite && (
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 w-full bg-[#533afd] hover:bg-[#4434d4] text-white font-bold text-[13px] px-4 py-3.5 rounded-xl transition-colors"
                      >
                        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        웹사이트 바로가기
                      </a>
                    )}

                    {hasPhone && (
                      <a
                        href={`tel:${company.phone}`}
                        className="flex items-center gap-3 w-full bg-white hover:bg-neutral-50 text-[#061b31] font-semibold text-[13px] px-4 py-3.5 rounded-xl border border-[#e5edf5] transition-colors"
                      >
                        <svg className="w-4 h-4 shrink-0 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        {company.phone}
                      </a>
                    )}

                    {hasEmail && (
                      <a
                        href={`mailto:${company.email}?subject=${encodeURIComponent(`[Packlinx] ${company.name} 견적 문의`)}`}
                        className="flex items-center gap-3 w-full bg-white hover:bg-neutral-50 text-[#061b31] font-semibold text-[13px] px-4 py-3.5 rounded-xl border border-[#e5edf5] transition-colors"
                      >
                        <svg className="w-4 h-4 shrink-0 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        이메일 문의
                      </a>
                    )}

                    {/* Fallback if no contacts */}
                    {!hasWebsite && !hasPhone && !hasEmail && (
                      <div className="text-center py-4">
                        <p className="text-[12px] text-neutral-400">연락처 정보가 등록되지 않았습니다</p>
                        <a
                          href="https://pf.kakao.com/_packlinx"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-block text-[12px] text-[#533afd] hover:underline"
                        >
                          Packlinx 카카오채널로 문의하기
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-neutral-100">
                    <p className="text-[11px] text-neutral-400 text-center leading-relaxed">
                      견적 요청 시 <strong>업체명·필요 수량·납기</strong>를 함께 알려주시면<br />
                      빠른 답변을 받을 수 있습니다
                    </p>
                  </div>
                </div>

                {/* Hard data quick summary */}
                <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-3">업체 요약 정보</p>
                  <dl className="space-y-2">
                    <div className="flex justify-between text-[12px]">
                      <dt className="text-neutral-400">카테고리</dt>
                      <dd className="font-semibold text-neutral-700 text-right">{categoryLabel}</dd>
                    </div>
                    <div className="flex justify-between text-[12px]">
                      <dt className="text-neutral-400">설립</dt>
                      <dd className="font-semibold text-neutral-700">
                        {company.founded_year ? `${company.founded_year}년` : '정보 미제공'}
                      </dd>
                    </div>
                    <div className="flex justify-between text-[12px]">
                      <dt className="text-neutral-400">인증 수</dt>
                      <dd className="font-semibold text-neutral-700">{certItems.length}건</dd>
                    </div>
                    <div className="flex justify-between text-[12px]">
                      <dt className="text-neutral-400">샘플 가능</dt>
                      <dd className={`font-semibold ${company.sample_available ? 'text-emerald-700' : 'text-neutral-500'}`}>
                        {company.sample_available === true ? '가능' : company.sample_available === false ? '불가' : '확인 필요'}
                      </dd>
                    </div>
                    {company.is_verified && (
                      <div className="flex justify-between text-[12px]">
                        <dt className="text-neutral-400">Packlinx 검증</dt>
                        <dd className="font-semibold text-emerald-700">완료</dd>
                      </div>
                    )}
                  </dl>
                </div>

                {/* Data disclaimer */}
                <p className="text-[10px] text-neutral-400 text-center leading-relaxed px-1">
                  ※ 이 페이지는 내부 리뉴얼 프리뷰입니다. 공개 페이지가 아니며 검색엔진에 노출되지 않습니다.
                </p>
              </div>
            </div>
          </div>

          {/* ── Mobile sticky CTA ── */}
          <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-neutral-200 px-4 py-3">
            <div className="flex gap-2.5">
              <a
                href="https://pf.kakao.com/_packlinx"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 text-[14px] font-bold text-[#3A1D1D] bg-[#FEE500] hover:bg-[#F5DB00] py-3.5 rounded-xl transition-colors"
              >
                카카오로 문의
              </a>
              {hasPhone && (
                <a
                  href={`tel:${company.phone}`}
                  className="w-14 flex items-center justify-center bg-white border border-neutral-200 rounded-xl shrink-0"
                  aria-label="전화 문의"
                >
                  <svg className="w-5 h-5 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </a>
              )}
              {hasWebsite && (
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-14 flex items-center justify-center bg-[#533afd] rounded-xl shrink-0"
                  aria-label="웹사이트"
                >
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
