'use client'

import Link from 'next/link'
import { useState } from 'react'
import { PacklinxLogo } from '@/components/PacklinxLogo'

// ── Static sample data ──────────────────────────────────────────────────────

type SampleCompany = {
  slug: string
  name: string
  is_verified: boolean
  website: string | null
  phone: string | null
  city: string
  province: string
  founded_year: number | null
  industry_categories: string[]
  material_type: string | null
  packaging_form: string | null
  certifications: string[]
  service_capabilities: string[]
  print_method: string | null
  moq_value: number | null
  moq_unit: string | null
  lead_time_standard_days: number | null
  lead_time_express_days: number | null
  price_tier: string | null
  sample_available: boolean | null
  cold_packaging_available: boolean | null
  greenwashing_verified: boolean | null
  reuse_model: string | null
  avg_rating: number | null
  review_count: number
  completeness: number
}

const SAMPLE_COMPANIES: SampleCompany[] = [
  {
    slug: 'daesung-packaging',
    name: '대성포장',
    is_verified: true,
    website: 'https://example.com/daesung',
    phone: '02-1234-5678',
    city: '서울',
    province: '서울특별시',
    founded_year: 1998,
    industry_categories: ['food-beverage', 'ecommerce-shipping'],
    material_type: 'paper-corrugated',
    packaging_form: '골판지 박스',
    certifications: ['ISO 9001', 'FSC 인증'],
    service_capabilities: ['맞춤 인쇄', '소량 제작', '디자인 지원'],
    print_method: '오프셋',
    moq_value: 500,
    moq_unit: '개',
    lead_time_standard_days: 7,
    lead_time_express_days: 3,
    price_tier: 'mid',
    sample_available: true,
    cold_packaging_available: false,
    greenwashing_verified: true,
    reuse_model: null,
    avg_rating: 4.3,
    review_count: 28,
    completeness: 82,
  },
  {
    slug: 'hanyang-flex',
    name: '한양플렉스',
    is_verified: true,
    website: 'https://example.com/hanyang',
    phone: '031-9876-5432',
    city: '수원',
    province: '경기도',
    founded_year: 2005,
    industry_categories: ['food-beverage', 'cosmetics-beauty'],
    material_type: 'flexible',
    packaging_form: '파우치·필름',
    certifications: ['ISO 22000', 'HACCP'],
    service_capabilities: ['무균 포장', '가스치환', '디자인 지원'],
    print_method: '그라비어',
    moq_value: 2000,
    moq_unit: '개',
    lead_time_standard_days: 10,
    lead_time_express_days: 5,
    price_tier: 'premium',
    sample_available: true,
    cold_packaging_available: true,
    greenwashing_verified: false,
    reuse_model: null,
    avg_rating: 4.6,
    review_count: 41,
    completeness: 91,
  },
]

// ── Field config ─────────────────────────────────────────────────────────────

const PRICE_TIER_LABEL: Record<string, string> = { budget: '예산형', mid: '중간가', premium: '프리미엄' }
const MATERIAL_LABEL: Record<string, string> = {
  'paper-corrugated': '종이·골판지', plastic: '플라스틱', flexible: '필름·파우치',
  glass: '유리', metal: '금속', eco: '친환경 소재',
}

type Row = {
  label: string
  getValue: (c: SampleCompany) => string
  render: (c: SampleCompany) => React.ReactNode
}

function BoolCell({ val }: { val: boolean | null | undefined }) {
  if (val == null) return <span className="text-neutral-300">—</span>
  return val
    ? <span className="text-green-600 font-semibold" aria-label="예">✓</span>
    : <span className="text-neutral-300" aria-label="아니오">—</span>
}

function BadgesCell({ items }: { items: string[] | null | undefined }) {
  if (!items?.length) return <span className="text-neutral-300">—</span>
  return (
    <div className="flex flex-wrap gap-1 justify-center">
      {items.map((b) => (
        <span key={b} className="text-[11px] bg-brand-50 text-brand-700 border border-brand-100 px-1.5 py-0.5 rounded">
          {b}
        </span>
      ))}
    </div>
  )
}

function TextCell({ val }: { val: string | number | null | undefined }) {
  if (val == null || val === '') return <span className="text-neutral-300">—</span>
  return <span className="text-sm text-neutral-800">{String(val)}</span>
}

const ROWS: Row[] = [
  {
    label: '위치',
    render: (c) => <TextCell val={[c.city, c.province].filter(Boolean).join(' ') || null} />,
    getValue: (c) => [c.city, c.province].filter(Boolean).join(' '),
  },
  {
    label: '설립연도',
    render: (c) => <TextCell val={c.founded_year} />,
    getValue: (c) => String(c.founded_year ?? ''),
  },
  {
    label: '정보 등록',
    render: (c) => <BoolCell val={c.is_verified} />,
    getValue: (c) => String(c.is_verified),
  },
  {
    label: '산업 카테고리',
    render: (c) => <BadgesCell items={c.industry_categories} />,
    getValue: (c) => (c.industry_categories ?? []).slice().sort().join(','),
  },
  {
    label: '소재 유형',
    render: (c) => c.material_type
      ? <span className="text-[11px] bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded">{MATERIAL_LABEL[c.material_type] ?? c.material_type}</span>
      : <span className="text-neutral-300">—</span>,
    getValue: (c) => c.material_type ?? '',
  },
  {
    label: '포장 형태',
    render: (c) => c.packaging_form
      ? <span className="text-[11px] bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded">{c.packaging_form}</span>
      : <span className="text-neutral-300">—</span>,
    getValue: (c) => c.packaging_form ?? '',
  },
  {
    label: '인증',
    render: (c) => <BadgesCell items={c.certifications} />,
    getValue: (c) => (c.certifications ?? []).slice().sort().join(','),
  },
  {
    label: '서비스 역량',
    render: (c) => <BadgesCell items={c.service_capabilities} />,
    getValue: (c) => (c.service_capabilities ?? []).slice().sort().join(','),
  },
  {
    label: '인쇄 방식',
    render: (c) => c.print_method
      ? <span className="text-[11px] bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded">{c.print_method}</span>
      : <span className="text-neutral-300">—</span>,
    getValue: (c) => c.print_method ?? '',
  },
  {
    label: '최소 발주량(MOQ)',
    render: (c) => c.moq_value != null
      ? <span className="text-sm font-semibold text-heading-deep-navy">{c.moq_value.toLocaleString('ko-KR')}<span className="text-xs font-normal text-neutral-500 ml-0.5">{c.moq_unit ?? ''}</span></span>
      : <span className="text-neutral-300">—</span>,
    getValue: (c) => c.moq_value != null ? `${c.moq_value}${c.moq_unit ?? ''}` : '',
  },
  {
    label: '표준 납기',
    render: (c) => c.lead_time_standard_days != null
      ? <span className="text-sm font-semibold text-heading-deep-navy">{c.lead_time_standard_days}<span className="text-xs font-normal text-neutral-500 ml-0.5">일</span></span>
      : <span className="text-neutral-300">—</span>,
    getValue: (c) => String(c.lead_time_standard_days ?? ''),
  },
  {
    label: '급행 납기',
    render: (c) => c.lead_time_express_days != null
      ? <span className="text-sm">{c.lead_time_express_days}일</span>
      : <span className="text-neutral-300">—</span>,
    getValue: (c) => String(c.lead_time_express_days ?? ''),
  },
  {
    label: '가격대',
    render: (c) => c.price_tier
      ? <span className="text-[11px] bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded">{PRICE_TIER_LABEL[c.price_tier] ?? c.price_tier}</span>
      : <span className="text-neutral-300">—</span>,
    getValue: (c) => c.price_tier ?? '',
  },
  {
    label: '샘플 제공',
    render: (c) => <BoolCell val={c.sample_available} />,
    getValue: (c) => String(c.sample_available ?? ''),
  },
  {
    label: '냉장 포장',
    render: (c) => <BoolCell val={c.cold_packaging_available} />,
    getValue: (c) => String(c.cold_packaging_available),
  },
  {
    label: '친환경',
    render: (c) => <BoolCell val={c.greenwashing_verified} />,
    getValue: (c) => String(c.greenwashing_verified),
  },
  {
    label: '재사용 모델',
    render: (c) => <TextCell val={c.reuse_model} />,
    getValue: (c) => c.reuse_model ?? '',
  },
  {
    label: '평점',
    render: (c) => c.avg_rating != null
      ? <span className="text-sm">★ {c.avg_rating.toFixed(1)} <span className="text-neutral-400 text-xs">({c.review_count}건)</span></span>
      : <span className="text-neutral-300">—</span>,
    getValue: (c) => String(c.avg_rating ?? ''),
  },
]

function isRowSame(companies: SampleCompany[], row: Row): boolean {
  if (companies.length <= 1) return false
  const vals = companies.map(row.getValue)
  return vals.every((v) => v === vals[0])
}

// ── Completeness badge ────────────────────────────────────────────────────────

function CompletenessBadge({ pct }: { pct: number }) {
  const colorCls =
    pct >= 75
      ? 'text-green-700 bg-green-50 border-green-200'
      : pct >= 50
        ? 'text-amber-700 bg-amber-50 border-amber-200'
        : 'text-neutral-500 bg-neutral-50 border-neutral-200'
  return (
    <span className="inline-flex flex-col items-center gap-0.5 mt-1.5">
      <span className={`text-[10px] font-medium border px-1.5 py-0.5 rounded leading-tight ${colorCls}`}>
        프로필 {pct}%
      </span>
    </span>
  )
}

// ── Main client component ────────────────────────────────────────────────────

export function CompareV1Client() {
  const companies = SAMPLE_COMPANIES
  const [compA, compB] = companies
  const [showDiffOnly, setShowDiffOnly] = useState(false)

  const handleToggle = () => setShowDiffOnly((prev) => !prev)

  const visibleRows = showDiffOnly
    ? ROWS.filter((row) => !isRowSame(companies, row))
    : ROWS

  const allSame = showDiffOnly && visibleRows.length === 0

  return (
    <div className="min-h-screen bg-neutral-50">

      {/* ── V05 Dark sticky header ── */}
      <header className="bg-slate-900 sticky top-0 z-50 border-b border-white/[0.06]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
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

      {/* ── V05 Breadcrumb with chevron ── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-5 pb-0">
        <div className="flex items-center gap-2 text-sm text-body-secondary">
          <Link href="/" className="text-stripe-purple hover:text-stripe-purple-hover transition-colors">Packlinx</Link>
          <span className="text-neutral-300">›</span>
          <span className="text-neutral-400">비교</span>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-4 pb-28 md:pb-12">

        {/* ── Hero band: title + desktop CTA above fold ── */}
        <div className="bg-white border border-border-v04 rounded-xl p-5 sm:p-7 mb-5" style={{ boxShadow: 'var(--shadow-elevated-v04)' }}>
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-[22px] sm:text-[26px] heading-display text-heading-deep-navy tracking-[-0.02em] leading-tight mb-1">
                {compA.name} <span className="text-neutral-400 font-light">vs</span> {compB.name}
              </h1>
              <p className="text-sm text-body-secondary">
                {compA.is_verified && compB.is_verified ? '두 업체 모두 정보 등록 ✓' : '패키징 업체 상세 비교'}
              </p>
            </div>

            {/* Desktop CTAs — fold-above, right-aligned */}
            <div className="hidden sm:flex flex-col gap-2 shrink-0 min-w-[200px]">
              {compA.website && (
                <a
                  href={compA.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between gap-2 text-[13px] font-semibold text-white bg-stripe-purple hover:bg-stripe-purple-hover px-3.5 py-2.5 rounded-lg transition-colors"
                >
                  <span className="truncate max-w-[120px]">{compA.name}</span>
                  <span className="text-white/70 text-[11px] whitespace-nowrap">문의하기 ↗</span>
                </a>
              )}
              {compB.website && (
                <a
                  href={compB.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between gap-2 text-[13px] font-semibold text-stripe-purple border border-stripe-purple-ring bg-stripe-purple-soft hover:bg-stripe-purple-tint px-3.5 py-2.5 rounded-lg transition-colors"
                >
                  <span className="truncate max-w-[120px]">{compB.name}</span>
                  <span className="text-stripe-purple/70 text-[11px] whitespace-nowrap">문의하기 ↗</span>
                </a>
              )}
            </div>
          </div>

          {/* Key stats summary — brand-50 accent row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-5">
            {companies.map((c) => (
              <div key={c.slug} className="bg-brand-50 border border-brand-100 rounded-lg px-3 py-2.5 text-center">
                <p className="text-[9px] font-semibold text-brand-700 uppercase tracking-widest mb-1 truncate">{c.name}</p>
                {c.moq_value != null && (
                  <p className="text-[15px] font-bold text-heading-deep-navy leading-tight">
                    {c.moq_value.toLocaleString('ko-KR')}
                    <span className="text-[11px] font-normal text-body-secondary ml-0.5">{c.moq_unit}</span>
                  </p>
                )}
                <p className="text-[10px] text-body-secondary mt-0.5">최소주문량</p>
              </div>
            ))}
            {companies.map((c) => (
              <div key={`${c.slug}-lead`} className="bg-neutral-100 border border-neutral-200 rounded-lg px-3 py-2.5 text-center">
                <p className="text-[9px] font-semibold text-neutral-500 uppercase tracking-widest mb-1 truncate">{c.name}</p>
                {c.lead_time_standard_days != null && (
                  <p className="text-[15px] font-bold text-heading-deep-navy leading-tight">
                    {c.lead_time_standard_days}
                    <span className="text-[11px] font-normal text-body-secondary ml-0.5">일</span>
                  </p>
                )}
                <p className="text-[10px] text-body-secondary mt-0.5">표준 납기</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── V05 diff toggle (stripe-purple, not blue-600) ── */}
        {companies.length >= 2 && (
          <div className="flex justify-end mb-3">
            <button
              onClick={handleToggle}
              aria-pressed={showDiffOnly}
              className={`text-xs font-medium border rounded-lg px-3 py-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stripe-purple ${
                showDiffOnly
                  ? 'bg-stripe-purple text-white border-stripe-purple hover:bg-stripe-purple-hover'
                  : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-50'
              }`}
            >
              {showDiffOnly ? '전체 항목 보기' : '차이만 보기'}
            </button>
          </div>
        )}

        {/* ── Compare table ── */}
        <div className="overflow-x-auto -mx-4 sm:mx-0 rounded-xl border border-border-v04 bg-white" style={{ boxShadow: 'var(--shadow-elevated-v04)' }}>
          {allSame ? (
            <div className="py-12 text-center text-sm text-neutral-400">
              모든 항목이 동일합니다
            </div>
          ) : (
            <table className="border-collapse w-full min-w-[480px] text-sm">
              <thead>
                <tr className="bg-neutral-50/80">
                  <th
                    scope="col"
                    className="sticky left-0 z-10 bg-neutral-50 text-left text-xs text-neutral-500 font-medium px-4 py-3 border-b border-r border-border-v04 min-w-[110px]"
                  >
                    항목
                  </th>
                  {companies.map((c, i) => (
                    <th
                      key={c.slug}
                      scope="col"
                      className="text-center px-4 py-3 border-b border-l border-border-v04 min-w-[200px] align-top"
                    >
                      <span className="block font-bold text-heading-deep-navy leading-snug text-[15px]">{c.name}</span>
                      {c.is_verified && (
                        <span className="inline-block mt-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                          정보 등록
                        </span>
                      )}
                      <CompletenessBadge pct={c.completeness} />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visibleRows.map((row, idx) => (
                  <tr key={row.label} className={idx % 2 === 1 ? 'bg-neutral-50/40' : 'bg-white'}>
                    <th
                      scope="row"
                      className="sticky left-0 z-10 bg-inherit text-left text-xs font-medium text-neutral-500 px-4 py-3 border-b border-r border-neutral-100 whitespace-nowrap"
                    >
                      {row.label}
                    </th>
                    {companies.map((c) => (
                      <td key={c.slug} className="px-4 py-3 border-b border-l border-neutral-100 text-center align-middle">
                        {row.render(c)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
              {/* ── Table footer CTA — stripe-purple (V05) ── */}
              <tfoot>
                <tr>
                  <td className="sticky left-0 z-10 bg-white border-t border-r border-border-v04 px-4 py-5" />
                  {companies.map((c, i) => (
                    <td key={c.slug} className="border-t border-l border-border-v04 px-4 py-5 text-center align-middle">
                      <div className="flex flex-col gap-2.5 items-center">
                        <Link
                          href={`/companies/${c.slug}`}
                          className="text-xs font-medium text-neutral-700 border border-neutral-300 rounded-lg px-3 py-2 hover:bg-neutral-50 transition-colors"
                        >
                          프로필 보기
                        </Link>
                        {c.website && (
                          <a
                            href={c.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`text-xs font-semibold rounded-lg px-4 py-2 transition-colors whitespace-nowrap ${
                              i === 0
                                ? 'text-white bg-stripe-purple hover:bg-stripe-purple-hover'
                                : 'text-stripe-purple border border-stripe-purple-ring bg-stripe-purple-soft hover:bg-stripe-purple-tint'
                            }`}
                          >
                            문의하기 ↗
                          </a>
                        )}
                      </div>
                    </td>
                  ))}
                </tr>
              </tfoot>
            </table>
          )}
        </div>

        {/* ── Disclaimer footer ── */}
        <footer className="mt-5 rounded-xl border border-border-v04 bg-neutral-50 px-4 py-3 text-xs leading-relaxed text-body-secondary">
          Packlinx는 패키징 업체에 대한 공개 정보를 정리해 제공하는 디렉토리 서비스입니다. 거래·견적 의뢰는 직접 중개하지 않으며, 업체 연락은 각 업체의 공식 채널을 이용해 주세요.
        </footer>
      </main>

      {/* ── V05 Mobile sticky CTA — fixed bottom bar ── */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-neutral-200 px-4 py-3 safe-area-pb">
        <div className="flex gap-2.5">
          {compA.website && (
            <a
              href={compA.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 text-[13px] font-semibold text-white bg-stripe-purple hover:bg-stripe-purple-hover py-3.5 rounded-xl transition-colors"
            >
              {compA.name} 문의
            </a>
          )}
          {compB.website && (
            <a
              href={compB.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 text-[13px] font-semibold text-stripe-purple border border-stripe-purple-ring bg-stripe-purple-soft hover:bg-stripe-purple-tint py-3.5 rounded-xl transition-colors"
            >
              {compB.name} 문의
            </a>
          )}
        </div>
      </div>

    </div>
  )
}
