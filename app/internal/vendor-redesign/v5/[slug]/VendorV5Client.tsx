'use client'

import { useState } from 'react'

type Tab = '홈' | '회사정보' | '취급품목' | '문의'

interface Company {
  id: string
  slug: string
  name: string
  description: string | null
  category: string
  industry_categories: string[] | null
  phone: string | null
  email: string | null
  website: string | null
  icon_url: string | null
  is_verified: boolean | null
  founded_year: number | null
  products: string[] | null
  service_capabilities: string[] | null
  target_industries: string[] | null
  key_clients: string[] | null
  moq_value: number | null
  moq_unit: string | null
  lead_time_standard_days: number | null
  sample_available: boolean | null
  certifications: string[] | null
  price_tier: string | null
  data_source: string | null
  city: string | null
  province: string | null
}

interface PeerCompany {
  id: string
  slug: string
  name: string
  description: string | null
  category: string
  is_verified: boolean | null
  icon_url: string | null
  phone: string | null
}

interface VendorV5ClientProps {
  company: Company
  peerVendors: PeerCompany[]
  categoryLabel: string
}

const KAKAO_CHANNEL = 'https://pf.kakao.com/_xgexjFxl'

function MapSection({ name, city, province }: { name: string; city: string | null; province: string | null }) {
  const locationText = [province, city].filter(Boolean).join(' ')

  if (!locationText) {
    // Anti-pattern: do not show empty gray box — hide map area entirely
    return null
  }

  return (
    <div className="w-full bg-neutral-100 rounded-xl overflow-hidden border border-neutral-200" style={{ height: '140px' }}>
      {/* OpenStreetMap iframe embed using location text search */}
      <div className="relative w-full h-full flex flex-col items-center justify-center bg-[#e8edf2]">
        <div className="absolute inset-0 bg-[#e8edf2]">
          {/* Stylized map background */}
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <span className="text-4xl">🗺️</span>
            </div>
          </div>
        </div>
        <div className="relative z-10 bg-white/95 border border-neutral-300 rounded-lg px-3 py-2 flex items-center gap-2 shadow-sm">
          <span className="text-base">📍</span>
          <div>
            <p className="text-xs font-bold text-neutral-800">{name}</p>
            <p className="text-xs text-neutral-500">{locationText}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function QuickAction({ icon, label, href, variant = 'secondary' }: {
  icon: string
  label: string
  href: string
  variant?: 'primary' | 'secondary'
}) {
  return (
    <a
      href={href}
      className={`flex flex-col items-center gap-1 py-2.5 px-2 rounded-xl text-center transition-all active:scale-95 ${
        variant === 'primary'
          ? 'bg-brand-500 text-white hover:bg-brand-600'
          : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
      }`}
    >
      <span className="text-lg leading-none">{icon}</span>
      <span className="text-[11px] font-semibold leading-none">{label}</span>
    </a>
  )
}

function PeerCard({ vendor }: { vendor: PeerCompany }) {
  const initial = vendor.name.charAt(0)
  return (
    <a
      href={`/companies/${vendor.slug}`}
      className="flex-none w-[160px] bg-white border border-neutral-200 rounded-xl p-3.5 hover:border-brand-300 hover:shadow-sm transition-all"
    >
      <div className="flex items-center gap-2 mb-2">
        {vendor.icon_url ? (
          <img src={vendor.icon_url} alt="" className="w-8 h-8 rounded-lg object-cover flex-none" />
        ) : (
          <div className="w-8 h-8 rounded-lg bg-brand-100 flex items-center justify-center text-brand-600 text-sm font-bold flex-none">
            {initial}
          </div>
        )}
        <div className="min-w-0">
          <p className="text-xs font-semibold text-neutral-800 truncate leading-tight">{vendor.name}</p>
          {vendor.is_verified && (
            <span className="text-[10px] text-green-600 font-medium">✓ 인증</span>
          )}
        </div>
      </div>
      {vendor.description && (
        <p className="text-[11px] text-neutral-500 leading-snug line-clamp-2">{vendor.description}</p>
      )}
      {vendor.phone && (
        <p className="mt-1.5 text-[11px] text-brand-600 font-medium">{vendor.phone}</p>
      )}
    </a>
  )
}

function HomeTab({ company, categoryLabel }: { company: Company; categoryLabel: string }) {
  const locationText = [company.province, company.city].filter(Boolean).join(' ')
  const hasPhone = !!company.phone
  const hasEmail = !!company.email
  const hasDirect = hasPhone || hasEmail || !!company.website

  return (
    <div className="space-y-4">
      {/* 업체 소개 */}
      {company.description && (
        <div className="bg-white rounded-xl border border-neutral-200 p-4">
          <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">업체 소개</h3>
          <p className="text-sm text-neutral-700 leading-relaxed">{company.description}</p>
        </div>
      )}

      {/* 기본 정보 카드 */}
      <div className="bg-white rounded-xl border border-neutral-200 p-4 space-y-3">
        <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">기본 정보</h3>
        <dl className="space-y-2">
          <div className="flex justify-between items-start gap-2">
            <dt className="text-xs text-neutral-500 flex-none">분야</dt>
            <dd className="text-xs font-semibold text-neutral-800 text-right">{categoryLabel}</dd>
          </div>
          {locationText && (
            <div className="flex justify-between items-start gap-2">
              <dt className="text-xs text-neutral-500 flex-none">소재지</dt>
              <dd className="text-xs font-semibold text-neutral-800">{locationText}</dd>
            </div>
          )}
          {company.founded_year && (
            <div className="flex justify-between items-start gap-2">
              <dt className="text-xs text-neutral-500 flex-none">설립</dt>
              <dd className="text-xs font-semibold text-neutral-800">{company.founded_year}년</dd>
            </div>
          )}
          {company.moq_value != null && (
            <div className="flex justify-between items-start gap-2">
              <dt className="text-xs text-neutral-500 flex-none">최소 주문</dt>
              <dd className="text-xs font-semibold text-neutral-800">
                {Number(company.moq_value).toLocaleString()}{company.moq_unit ?? '개'}
              </dd>
            </div>
          )}
          {company.lead_time_standard_days != null && (
            <div className="flex justify-between items-start gap-2">
              <dt className="text-xs text-neutral-500 flex-none">납기</dt>
              <dd className="text-xs font-semibold text-neutral-800">{company.lead_time_standard_days}일 (표준)</dd>
            </div>
          )}
          {company.sample_available === true && (
            <div className="flex justify-between items-start gap-2">
              <dt className="text-xs text-neutral-500 flex-none">샘플</dt>
              <dd className="text-xs font-semibold text-green-600">제공 가능</dd>
            </div>
          )}
          {company.price_tier && (
            <div className="flex justify-between items-start gap-2">
              <dt className="text-xs text-neutral-500 flex-none">가격대</dt>
              <dd className="text-xs font-semibold text-neutral-800">{company.price_tier}</dd>
            </div>
          )}
        </dl>
      </div>

      {/* 연락처 */}
      {hasDirect && (
        <div className="bg-white rounded-xl border border-neutral-200 p-4 space-y-2">
          <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">직접 연락</h3>
          {company.phone && (
            <a href={`tel:${company.phone}`} className="flex items-center gap-2 text-sm text-brand-600 hover:underline">
              <span>📞</span> {company.phone}
            </a>
          )}
          {company.email && (
            <a href={`mailto:${company.email}`} className="flex items-center gap-2 text-sm text-brand-600 hover:underline">
              <span>✉️</span> {company.email}
            </a>
          )}
          {company.website && (
            <a href={company.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-brand-600 hover:underline">
              <span>🌐</span> 홈페이지 바로가기
            </a>
          )}
        </div>
      )}
    </div>
  )
}

function CompanyInfoTab({ company }: { company: Company }) {
  return (
    <div className="space-y-4">
      {company.target_industries && company.target_industries.length > 0 && (
        <div className="bg-white rounded-xl border border-neutral-200 p-4">
          <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3">대상 산업</h3>
          <div className="flex flex-wrap gap-2">
            {(company.target_industries as string[]).map((ind) => (
              <span key={ind} className="text-xs bg-brand-50 text-brand-700 px-2.5 py-1 rounded-full font-medium border border-brand-100">
                {ind}
              </span>
            ))}
          </div>
        </div>
      )}

      {company.key_clients && company.key_clients.length > 0 && (
        <div className="bg-white rounded-xl border border-neutral-200 p-4">
          <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3">주요 고객사</h3>
          <div className="flex flex-wrap gap-2">
            {(company.key_clients as string[]).map((client) => (
              <span key={client} className="text-xs bg-neutral-100 text-neutral-600 px-2.5 py-1 rounded-full font-medium">
                {client}
              </span>
            ))}
          </div>
        </div>
      )}

      {company.certifications && company.certifications.length > 0 && (
        <div className="bg-white rounded-xl border border-neutral-200 p-4">
          <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3">인증·자격</h3>
          <div className="flex flex-wrap gap-2">
            {(company.certifications as string[]).map((cert) => (
              <span key={cert} className="text-xs bg-green-50 text-green-700 px-2.5 py-1 rounded-full font-medium border border-green-100">
                ✓ {cert}
              </span>
            ))}
          </div>
        </div>
      )}

      {company.service_capabilities && company.service_capabilities.length > 0 && (
        <div className="bg-white rounded-xl border border-neutral-200 p-4">
          <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3">서비스 역량</h3>
          <ul className="space-y-1.5">
            {(company.service_capabilities as string[]).map((cap) => (
              <li key={cap} className="flex items-start gap-2 text-sm text-neutral-700">
                <span className="text-brand-500 flex-none mt-0.5">·</span>
                {cap}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 데이터 출처 */}
      {company.data_source && (
        <p className="text-xs text-neutral-400 px-1">
          {company.data_source === 'naver_local' ? '출처: 네이버 지역 검색' :
           company.data_source === 'public_data_portal' ? '출처: 공공데이터 포털' :
           company.data_source === 'website_crawl' ? '출처: 업체 웹사이트' :
           `출처: ${company.data_source}`}
        </p>
      )}
    </div>
  )
}

function ProductsTab({ company }: { company: Company }) {
  const products = Array.isArray(company.products) ? (company.products as string[]) : []
  return (
    <div className="space-y-4">
      {products.length > 0 ? (
        <div className="bg-white rounded-xl border border-neutral-200 p-4">
          <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3">취급 품목</h3>
          <div className="grid grid-cols-2 gap-2">
            {products.map((product) => (
              <div key={product} className="flex items-start gap-2 bg-neutral-50 rounded-lg p-2.5">
                <span className="text-brand-500 flex-none font-bold text-sm mt-0.5">·</span>
                <span className="text-xs text-neutral-700 leading-snug font-medium">{product}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-neutral-50 rounded-xl border border-dashed border-neutral-200 p-8 text-center">
          <p className="text-sm text-neutral-400">취급 품목 정보가 없습니다.</p>
        </div>
      )}
    </div>
  )
}

function InquiryTab({ company }: { company: Company }) {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-neutral-200 p-5">
        <h3 className="text-sm font-bold text-neutral-800 mb-1">문의 안내</h3>
        <p className="text-xs text-neutral-500 mb-4">아래 방법으로 직접 문의하시거나 Packlinx를 통해 견적을 요청하실 수 있습니다.</p>

        <div className="space-y-3">
          {company.phone && (
            <a
              href={`tel:${company.phone}`}
              className="flex items-center gap-3 w-full bg-brand-500 text-white rounded-xl px-4 py-3.5 hover:bg-brand-600 transition-colors"
            >
              <span className="text-xl">📞</span>
              <div>
                <p className="text-xs font-medium opacity-80 leading-none mb-0.5">전화 문의</p>
                <p className="text-sm font-bold">{company.phone}</p>
              </div>
            </a>
          )}

          <a
            href={KAKAO_CHANNEL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 w-full bg-[#FEE500] text-[#191919] rounded-xl px-4 py-3.5 hover:bg-yellow-300 transition-colors"
          >
            <span className="text-xl">💬</span>
            <div>
              <p className="text-xs font-medium opacity-70 leading-none mb-0.5">카카오톡 문의</p>
              <p className="text-sm font-bold">Packlinx 채널로 문의</p>
            </div>
          </a>

          {company.email && (
            <a
              href={`mailto:${company.email}?subject=${encodeURIComponent(`[Packlinx] ${company.name} 문의`)}`}
              className="flex items-center gap-3 w-full bg-neutral-100 text-neutral-800 rounded-xl px-4 py-3.5 hover:bg-neutral-200 transition-colors"
            >
              <span className="text-xl">✉️</span>
              <div>
                <p className="text-xs font-medium opacity-60 leading-none mb-0.5">이메일 문의</p>
                <p className="text-sm font-bold">{company.email}</p>
              </div>
            </a>
          )}
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <p className="text-xs text-amber-700 leading-relaxed">
          ⚠️ Packlinx는 업체 정보 디렉토리 서비스입니다. 거래는 업체와 직접 진행하시며, Packlinx는 거래에 개입하지 않습니다.
        </p>
      </div>
    </div>
  )
}

export default function VendorV5Client({ company, peerVendors, categoryLabel }: VendorV5ClientProps) {
  const [activeTab, setActiveTab] = useState<Tab>('홈')

  const tabs: Tab[] = ['홈', '회사정보', '취급품목', '문의']

  const hasPhone = !!company.phone
  const hasEmail = !!company.email

  const initial = company.name.charAt(0)

  return (
    <div className="min-h-screen bg-[#f4f6f9]">
      {/* ─── Header ─── */}
      <header className="bg-white border-b border-neutral-200 px-4 py-3 flex items-center gap-3 sticky top-0 z-20">
        <a href="/" className="text-brand-500 text-xl leading-none" aria-label="홈으로">‹</a>
        <div className="min-w-0">
          <p className="text-sm font-bold text-neutral-800 truncate">{company.name}</p>
          <p className="text-xs text-neutral-400">{categoryLabel}</p>
        </div>
        <div className="ml-auto flex gap-2">
          {hasPhone && (
            <a href={`tel:${company.phone}`} className="w-8 h-8 flex items-center justify-center bg-neutral-100 rounded-full text-sm" aria-label="전화">
              📞
            </a>
          )}
          {hasEmail && (
            <a href={`mailto:${company.email}`} className="w-8 h-8 flex items-center justify-center bg-neutral-100 rounded-full text-sm" aria-label="이메일">
              ✉️
            </a>
          )}
        </div>
      </header>

      {/* ─── Hero: 지도 + 빠른 정보 ─── */}
      <section className="bg-white border-b border-neutral-200">
        <div className="max-w-2xl mx-auto">
          {/* Identity */}
          <div className="px-4 pt-4 pb-3 flex items-start gap-3">
            {company.icon_url ? (
              <img src={company.icon_url} alt="" className="w-14 h-14 rounded-xl object-cover flex-none border border-neutral-200" />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-brand-100 flex items-center justify-center text-brand-600 text-xl font-bold flex-none">
                {initial}
              </div>
            )}
            <div className="min-w-0 flex-1 pt-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg font-bold text-neutral-900 leading-tight">{company.name}</h1>
                {company.is_verified && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">✓ 인증 업체</span>
                )}
              </div>
              <p className="text-xs text-neutral-500 mt-0.5">
                {categoryLabel}
                {company.founded_year && ` · 설립 ${company.founded_year}년`}
              </p>
            </div>
          </div>

          {/* 지도 영역 — city/province 없으면 hide (ANTI: 빈 회색 박스 금지) */}
          {(company.city ?? company.province) && (
            <div className="px-4 pb-3">
              <MapSection name={company.name} city={company.city} province={company.province} />
            </div>
          )}

          {/* 빠른 액션 4버튼 */}
          <div className="grid grid-cols-4 gap-2 px-4 pb-4">
            {hasPhone ? (
              <QuickAction icon="📞" label="전화" href={`tel:${company.phone}`} variant="primary" />
            ) : (
              <div className="flex flex-col items-center gap-1 py-2.5 px-2 rounded-xl bg-neutral-50 opacity-40 cursor-not-allowed text-center">
                <span className="text-lg leading-none">📞</span>
                <span className="text-[11px] font-semibold text-neutral-500 leading-none">전화 없음</span>
              </div>
            )}
            <QuickAction icon="💬" label="카톡 문의" href={KAKAO_CHANNEL} />
            {hasEmail ? (
              <QuickAction icon="✉️" label="이메일" href={`mailto:${company.email}`} />
            ) : (
              <QuickAction icon="✉️" label="문의" href="#inquiry-tab" />
            )}
            {company.website ? (
              <QuickAction icon="🌐" label="홈페이지" href={company.website} />
            ) : (
              <QuickAction icon="📋" label="견적 요청" href={KAKAO_CHANNEL} />
            )}
          </div>
        </div>
      </section>

      {/* ─── 탭 ─── */}
      <div className="bg-white border-b border-neutral-200 sticky top-[53px] z-10">
        <div className="max-w-2xl mx-auto flex">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab)
                if (tab === '문의') {
                  document.getElementById('inquiry-tab')?.scrollIntoView({ behavior: 'smooth' })
                }
              }}
              className={`flex-1 py-3 text-sm font-semibold transition-colors border-b-2 ${
                activeTab === tab
                  ? 'text-brand-500 border-brand-500'
                  : 'text-neutral-500 border-transparent hover:text-neutral-700'
              }`}
              id={tab === '문의' ? 'inquiry-tab' : undefined}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* ─── 탭 콘텐츠 ─── */}
      <div className="max-w-2xl mx-auto px-4 py-4 pb-28">
        {activeTab === '홈' && <HomeTab company={company} categoryLabel={categoryLabel} />}
        {activeTab === '회사정보' && <CompanyInfoTab company={company} />}
        {activeTab === '취급품목' && <ProductsTab company={company} />}
        {activeTab === '문의' && <InquiryTab company={company} />}

        {/* ─── 동료 업체 비교 ─── (모든 탭 하단 공통) */}
        {peerVendors.length > 0 && (
          <section className="mt-6">
            <h2 className="text-sm font-bold text-neutral-700 mb-3">같은 분야 업체 보기</h2>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
              {peerVendors.map((v) => (
                <PeerCard key={v.id} vendor={v} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* ─── 모바일 sticky CTA ─── */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 p-3 z-30 md:hidden">
        <div className="max-w-2xl mx-auto flex gap-2">
          <a
            href={KAKAO_CHANNEL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-[#FEE500] text-[#191919] font-bold text-sm rounded-xl py-3.5 text-center active:scale-95 transition-transform"
          >
            💬 카카오로 문의하기
          </a>
          {hasPhone && (
            <a
              href={`tel:${company.phone}`}
              className="bg-brand-500 text-white font-bold text-sm rounded-xl py-3.5 px-5 text-center active:scale-95 transition-transform"
            >
              📞 전화
            </a>
          )}
          {!hasPhone && (
            <button
              onClick={() => setActiveTab('문의')}
              className="bg-brand-500 text-white font-bold text-sm rounded-xl py-3.5 px-4 text-center active:scale-95 transition-transform"
            >
              지금 문의하기
            </button>
          )}
        </div>
      </div>

      {/* ─── 데스크탑 CTA (md+) ─── */}
      <div className="hidden md:block fixed bottom-6 right-6 z-30">
        <a
          href={KAKAO_CHANNEL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-[#FEE500] text-[#191919] font-bold text-sm rounded-2xl py-3 px-5 shadow-lg hover:bg-yellow-300 transition-colors"
        >
          💬 지금 문의하기
        </a>
      </div>
    </div>
  )
}
