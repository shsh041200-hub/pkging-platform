import type { Metadata } from 'next'
import Link from 'next/link'
import { getCompaniesBySlugs, type CompanyFull } from '@/lib/compare-data'
import AddToCompareButton from '@/app/components/AddToCompareButton'
import CompareCart from '@/app/components/CompareCart'

export const dynamic = 'force-dynamic'

type Props = { searchParams: Promise<{ ids?: string }> }

export const metadata: Metadata = {
  title: '벤더 비교',
  robots: { index: false, follow: false },
}

// ── Field helpers ─────────────────────────────────────────────────────────────

function BoolCell({ val }: { val: boolean | null | undefined }) {
  if (val == null) return <span className="text-gray-300">—</span>
  return val
    ? <span className="text-green-600 font-medium" aria-label="예">✓</span>
    : <span className="text-gray-300" aria-label="아니오">—</span>
}

function BadgesCell({ items }: { items: string[] | null | undefined }) {
  if (!items?.length) return <span className="text-gray-300">—</span>
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
  if (val == null || val === '') return <span className="text-gray-300">—</span>
  return <span className="text-sm">{String(val)}</span>
}

const PRICE_TIER_LABEL: Record<string, string> = { budget: '예산형', mid: '중간가', premium: '프리미엄' }
const MATERIAL_LABEL: Record<string, string> = {
  'paper-corrugated': '종이·골판지', plastic: '플라스틱', flexible: '필름·파우치',
  glass: '유리', metal: '금속', eco: '친환경 소재',
}

type Row = { label: string; render: (c: CompanyFull) => React.ReactNode }

const ROWS: Row[] = [
  { label: '위치', render: (c) => <TextCell val={[c.city, c.province].filter(Boolean).join(' ') || null} /> },
  { label: '설립연도', render: (c) => <TextCell val={c.founded_year} /> },
  { label: '인증 여부', render: (c) => <BoolCell val={c.is_verified} /> },
  { label: '산업 카테고리', render: (c) => <BadgesCell items={c.industry_categories} /> },
  {
    label: '소재 유형',
    render: (c) => c.material_type
      ? <span className="text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{MATERIAL_LABEL[c.material_type] ?? c.material_type}</span>
      : <span className="text-gray-300">—</span>,
  },
  {
    label: '포장 형태',
    render: (c) => c.packaging_form
      ? <span className="text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{c.packaging_form}</span>
      : <span className="text-gray-300">—</span>,
  },
  { label: '인증', render: (c) => <BadgesCell items={c.certifications} /> },
  { label: '서비스 역량', render: (c) => <BadgesCell items={c.service_capabilities} /> },
  {
    label: '인쇄 방식',
    render: (c) => c.print_method
      ? <span className="text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{c.print_method}</span>
      : <span className="text-gray-300">—</span>,
  },
  {
    label: '최소 발주량(MOQ)',
    render: (c) => c.moq_value != null
      ? <span className="text-sm">{c.moq_value.toLocaleString('ko-KR')}{c.moq_unit ? ` ${c.moq_unit}` : ''}</span>
      : <span className="text-gray-300">—</span>,
  },
  { label: '표준 납기', render: (c) => c.lead_time_standard_days != null ? <span className="text-sm">{c.lead_time_standard_days}일</span> : <span className="text-gray-300">—</span> },
  { label: '급행 납기', render: (c) => c.lead_time_express_days != null ? <span className="text-sm">{c.lead_time_express_days}일</span> : <span className="text-gray-300">—</span> },
  {
    label: '가격대',
    render: (c) => c.price_tier
      ? <span className="text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{PRICE_TIER_LABEL[c.price_tier] ?? c.price_tier}</span>
      : <span className="text-gray-300">—</span>,
  },
  { label: '샘플 제공', render: (c) => <BoolCell val={c.sample_available} /> },
  { label: '냉장 포장', render: (c) => <BoolCell val={c.cold_packaging_available} /> },
  { label: '친환경', render: (c) => <BoolCell val={c.greenwashing_verified} /> },
  { label: '재사용 모델', render: (c) => <TextCell val={c.reuse_model} /> },
  {
    label: '평점',
    render: (c) => c.avg_rating != null
      ? <span className="text-sm">★ {c.avg_rating.toFixed(1)} <span className="text-gray-400 text-xs">({c.review_count}건)</span></span>
      : <span className="text-gray-300">—</span>,
  },
]

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function ComparePage({ searchParams }: Props) {
  const { ids } = await searchParams
  const slugs = ids
    ? ids.split(',').map((s) => decodeURIComponent(s.trim())).filter(Boolean).slice(0, 3)
    : []

  const companies = await getCompaniesBySlugs(slugs)

  if (companies.length === 0) {
    return (
      <main className="max-w-2xl mx-auto px-5 py-16 text-center">
        <Link href="/" className="text-sm text-blue-600 hover:underline mb-6 inline-block">← 홈으로</Link>
        <h1 className="text-xl font-bold text-gray-900 mb-3">비교할 벤더를 선택해 주세요</h1>
        <p className="text-gray-500 text-sm">
          카테고리 페이지에서 벤더 카드의 <strong>+ 비교</strong> 버튼을 눌러 추가하세요.
        </p>
      </main>
    )
  }

  return (
    <>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-32">
        <Link href="/" className="text-sm text-blue-600 hover:underline mb-4 inline-block">
          ← 목록으로
        </Link>
        <h1 className="text-xl font-bold text-gray-900 mb-6">
          벤더 비교 <span className="text-gray-400 text-base font-normal">({companies.length}개)</span>
        </h1>

        {/* Horizontal scroll wrapper — sticky first column on mobile */}
        <div className="overflow-x-auto -mx-4 sm:mx-0 rounded-xl border border-gray-200">
          <table className="border-collapse w-full min-w-[480px] text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th
                  scope="col"
                  className="sticky left-0 z-10 bg-gray-50 text-left text-xs text-gray-500 font-medium px-4 py-3 border-b border-r border-gray-200 min-w-[110px]"
                >
                  항목
                </th>
                {companies.map((c) => (
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
              {ROWS.map((row, idx) => (
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
        </div>
      </main>
      <CompareCart />
    </>
  )
}
