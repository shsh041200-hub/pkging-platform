'use client'

import Link from 'next/link'
import { useState } from 'react'
import type { CompanyFull } from '@/lib/compare-data'
import AddToCompareButton from '@/app/components/AddToCompareButton'

// ── Field helpers ─────────────────────────────────────────────────────────────

function BoolCell({ val }: { val: boolean | null | undefined }) {
  if (val == null) return <span className="text-gray-200">—</span>
  return val
    ? <span className="text-green-600 font-medium" aria-label="예">✓</span>
    : <span className="text-gray-200" aria-label="아니오">—</span>
}

function BadgesCell({ items }: { items: string[] | null | undefined }) {
  if (!items?.length) return <span className="text-gray-200">—</span>
  return (
    <div className="flex flex-wrap gap-1 justify-center">
      {items.map((b) => (
        <span key={b} className="text-[11px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">
          {b}
        </span>
      ))}
    </div>
  )
}

function TextCell({ val }: { val: string | number | null | undefined }) {
  if (val == null || val === '') return <span className="text-gray-200">—</span>
  return <span className="text-sm">{String(val)}</span>
}

const PRICE_TIER_LABEL: Record<string, string> = { budget: '예산형', mid: '중간가', premium: '프리미엄' }
const MATERIAL_LABEL: Record<string, string> = {
  'paper-corrugated': '종이·골판지', plastic: '플라스틱', flexible: '필름·파우치',
  glass: '유리', metal: '금속', eco: '친환경 소재',
}

type Row = {
  label: string
  render: (c: CompanyFull) => React.ReactNode
  getValue: (c: CompanyFull) => string
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
    label: '인증 여부',
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
      ? <span className="text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{MATERIAL_LABEL[c.material_type] ?? c.material_type}</span>
      : <span className="text-gray-200">—</span>,
    getValue: (c) => c.material_type ?? '',
  },
  {
    label: '포장 형태',
    render: (c) => c.packaging_form
      ? <span className="text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{c.packaging_form}</span>
      : <span className="text-gray-200">—</span>,
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
      ? <span className="text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{c.print_method}</span>
      : <span className="text-gray-200">—</span>,
    getValue: (c) => c.print_method ?? '',
  },
  {
    label: '최소 발주량(MOQ)',
    render: (c) => c.moq_value != null
      ? <span className="text-sm">{c.moq_value.toLocaleString('ko-KR')}{c.moq_unit ? ` ${c.moq_unit}` : ''}</span>
      : <span className="text-gray-200">—</span>,
    getValue: (c) => c.moq_value != null ? `${c.moq_value}${c.moq_unit ?? ''}` : '',
  },
  {
    label: '표준 납기',
    render: (c) => c.lead_time_standard_days != null
      ? <span className="text-sm">{c.lead_time_standard_days}일</span>
      : <span className="text-gray-200">—</span>,
    getValue: (c) => String(c.lead_time_standard_days ?? ''),
  },
  {
    label: '급행 납기',
    render: (c) => c.lead_time_express_days != null
      ? <span className="text-sm">{c.lead_time_express_days}일</span>
      : <span className="text-gray-200">—</span>,
    getValue: (c) => String(c.lead_time_express_days ?? ''),
  },
  {
    label: '가격대',
    render: (c) => c.price_tier
      ? <span className="text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{PRICE_TIER_LABEL[c.price_tier] ?? c.price_tier}</span>
      : <span className="text-gray-200">—</span>,
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
      ? <span className="text-sm">★ {c.avg_rating.toFixed(1)} <span className="text-gray-400 text-xs">({c.review_count}건)</span></span>
      : <span className="text-gray-200">—</span>,
    getValue: (c) => String(c.avg_rating ?? ''),
  },
]

function isRowSame(companies: CompanyFull[], row: Row): boolean {
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
        : 'text-gray-500 bg-gray-50 border-gray-200'
  return (
    <span className="inline-flex flex-col items-center gap-0.5 mt-1.5">
      <span className={`text-[10px] font-medium border px-1.5 py-0.5 rounded leading-tight ${colorCls}`}>
        프로필 {pct}%
      </span>
      {pct < 50 && (
        <span className="text-[9px] text-gray-400">벤더님 보강 필요</span>
      )}
    </span>
  )
}

// ── Table ─────────────────────────────────────────────────────────────────────

type Props = {
  companies: CompanyFull[]
  completeness: number[]
}

export default function CompareTable({ companies, completeness }: Props) {
  const [showDiffOnly, setShowDiffOnly] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    try { return localStorage.getItem('compare-diff-only') === 'true' } catch { return false }
  })

  const handleToggle = () => {
    setShowDiffOnly((prev) => {
      const next = !prev
      try { localStorage.setItem('compare-diff-only', String(next)) } catch { /* storage unavailable */ }
      return next
    })
  }

  const visibleRows = showDiffOnly
    ? ROWS.filter((row) => !isRowSame(companies, row))
    : ROWS

  const allSame = showDiffOnly && visibleRows.length === 0

  return (
    <>
      {/* Diff toggle */}
      {companies.length >= 2 && (
        <div className="flex justify-end mb-3">
          <button
            onClick={handleToggle}
            aria-pressed={showDiffOnly}
            className={`text-xs font-medium border rounded-lg px-3 py-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
              showDiffOnly
                ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            {showDiffOnly ? '전체 항목 보기' : '차이만 보기'}
          </button>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto -mx-4 sm:mx-0 rounded-xl border border-gray-200">
        {allSame ? (
          <div className="py-12 text-center text-sm text-gray-400">
            모든 항목이 동일합니다
          </div>
        ) : (
          <table className="border-collapse w-full min-w-[480px] text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th
                  scope="col"
                  className="sticky left-0 z-10 bg-gray-50 text-left text-xs text-gray-500 font-medium px-4 py-3 border-b border-r border-gray-200 min-w-[110px]"
                >
                  항목
                </th>
                {companies.map((c, i) => (
                  <th
                    key={c.slug}
                    scope="col"
                    className="text-center px-4 py-3 border-b border-l border-gray-200 min-w-[180px] align-top"
                  >
                    {c.icon_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={c.icon_url}
                        alt={`${c.name} 로고`}
                        width={36}
                        height={36}
                        className="mx-auto mb-1.5 rounded object-contain"
                      />
                    )}
                    <span className="block font-bold text-gray-900 leading-snug">{c.name}</span>
                    {c.is_verified && (
                      <span className="inline-block mt-1 text-[10px] font-medium text-green-700 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded">
                        ✓ 인증
                      </span>
                    )}
                    <CompletenessBadge pct={completeness[i] ?? 0} />
                  </th>
                ))}
                {Array.from({ length: 3 - companies.length }).map((_, i) => (
                  <th
                    key={`ph-${i}`}
                    scope="col"
                    className="text-center px-4 py-3 border-b border-l border-gray-100 min-w-[140px] text-gray-300 text-xs"
                  >
                    <Link href="/" className="text-gray-300 hover:text-gray-500">+ 벤더 추가</Link>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((row, idx) => (
                <tr key={row.label} className={idx % 2 === 1 ? 'bg-gray-50/50' : 'bg-white'}>
                  <th
                    scope="row"
                    className="sticky left-0 z-10 bg-inherit text-left text-xs font-medium text-gray-500 px-4 py-3 border-b border-r border-gray-100 whitespace-nowrap"
                  >
                    {row.label}
                  </th>
                  {companies.map((c) => (
                    <td key={c.slug} className="px-4 py-3 border-b border-l border-gray-100 text-center align-middle">
                      {row.render(c)}
                    </td>
                  ))}
                  {Array.from({ length: 3 - companies.length }).map((_, i) => (
                    <td key={`ph-${i}`} className="px-4 py-3 border-b border-l border-gray-50" />
                  ))}
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td className="sticky left-0 z-10 bg-white border-t border-r border-gray-200 px-4 py-4" />
                {companies.map((c) => (
                  <td key={c.slug} className="border-t border-l border-gray-200 px-4 py-4 text-center align-middle">
                    <div className="flex flex-col gap-2 items-center">
                      <Link
                        href={`/companies/${c.slug}`}
                        className="text-xs font-medium text-gray-700 border border-gray-300 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors"
                      >
                        프로필 보기
                      </Link>
                      <AddToCompareButton slug={c.slug} name={c.name} />
                      {c.website && (
                        <a
                          href={c.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-medium text-white bg-orange-600 hover:bg-orange-700 rounded-lg px-3 py-1.5 transition-colors"
                        >
                          문의하기 ↗
                        </a>
                      )}
                    </div>
                  </td>
                ))}
                {Array.from({ length: 3 - companies.length }).map((_, i) => (
                  <td key={`ph-${i}`} className="border-t border-l border-gray-100 px-4 py-4" />
                ))}
              </tr>
            </tfoot>
          </table>
        )}
      </div>
    </>
  )
}
