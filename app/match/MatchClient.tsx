'use client'

import { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  INDUSTRY_CATEGORY_LABELS,
  INDUSTRY_CATEGORIES,
  type IndustryCategory,
  type MaterialType,
} from '@/types'
import { VendorDirectoryDisclaimer } from '@/components/VendorDirectoryDisclaimer'

// ── Types ──

export interface MatchVendor {
  id: string
  slug: string
  name: string
  industry_categories: IndustryCategory[]
  material_type: MaterialType | null
  packaging_form: string | null
  delivery_regions: string[]
  province: string | null
  city: string | null
  phone: string | null
  email: string | null
  website: string | null
  moq_value: number | null
  moq_unit: string | null
  min_order_quantity: string | null
  lead_time_standard_days: number | null
  lead_time_express_days: number | null
  certifications: string[]
  created_at: string
}

type WizardStep = 'vendor' | 'axis' | 'compare'

type Axis = 'price' | 'moq' | 'lead' | 'cert' | 'region'

interface ManualVendor {
  name: string
  industry: IndustryCategory | ''
}

// ── Axis config ──

const AXIS_OPTIONS: { id: Axis; label: string; desc: string }[] = [
  { id: 'price', label: '단가/가격', desc: '더 저렴한 단가' },
  { id: 'moq',   label: '낮은 MOQ',  desc: '소량 발주 가능' },
  { id: 'lead',  label: '빠른 납기',  desc: '납기일 단축' },
  { id: 'cert',  label: '품질 인증',  desc: 'HACCP·ISO·친환경 등' },
  { id: 'region', label: '지역 근접', desc: '가까운 납품 커버' },
]

// ── Recommendation algorithm ──

function getRecommendations(
  vendors: MatchVendor[],
  existingId: string | null,
  existingProvince: string | null,
  existingIndustry: IndustryCategory | null,
  axis: Axis,
): MatchVendor[] {
  let candidates = vendors.filter((v) => v.id !== existingId)

  if (existingIndustry) {
    const sameCat = candidates.filter((v) =>
      v.industry_categories.includes(existingIndustry),
    )
    if (sameCat.length >= 3) candidates = sameCat
  }

  const sorted = [...candidates].sort((a, b) => {
    if (axis === 'moq' || axis === 'price') {
      const av = a.moq_value ?? Infinity
      const bv = b.moq_value ?? Infinity
      return av - bv
    }
    if (axis === 'lead') {
      const av = a.lead_time_standard_days ?? Infinity
      const bv = b.lead_time_standard_days ?? Infinity
      return av - bv
    }
    if (axis === 'cert') {
      return (b.certifications?.length ?? 0) - (a.certifications?.length ?? 0)
    }
    if (axis === 'region') {
      const score = (v: MatchVendor) => {
        if (!existingProvince) return 0
        if (v.delivery_regions?.includes('전국')) return 2
        if (v.delivery_regions?.includes(existingProvince)) return 1
        if (v.province === existingProvince) return 1
        return 0
      }
      return score(b) - score(a)
    }
    return 0
  })

  return sorted.slice(0, 3)
}

// ── Fuzzy name search ──

function fuzzyMatch(query: string, name: string): boolean {
  if (!query) return true
  const q = query.toLowerCase().replace(/\s/g, '')
  const n = name.toLowerCase().replace(/\s/g, '')
  return n.includes(q)
}

// ── Progress indicator ──

function StepIndicator({ step }: { step: WizardStep }) {
  const steps: { id: WizardStep; label: string }[] = [
    { id: 'vendor', label: '기존 업체' },
    { id: 'axis',   label: '개선 기준' },
    { id: 'compare', label: '1:1 비교' },
  ]
  const currentIdx = steps.findIndex((s) => s.id === step)

  return (
    <div className="flex items-center gap-0 mb-8" role="list" aria-label="진행 단계">
      {steps.map((s, i) => {
        const done = i < currentIdx
        const active = i === currentIdx
        return (
          <div key={s.id} className="flex items-center" role="listitem">
            <div className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-[400] transition-colors ${
                  done
                    ? 'bg-[#533afd] text-white'
                    : active
                    ? 'bg-[#533afd] text-white ring-2 ring-[#533afd]/30'
                    : 'bg-[#f1f5f9] text-[#64748d]'
                }`}
                aria-current={active ? 'step' : undefined}
              >
                {done ? (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  i + 1
                )}
              </div>
              <span
                className={`text-[13px] hidden sm:inline ${
                  active ? 'text-[#273951] font-[400]' : done ? 'text-[#533afd]' : 'text-[#64748d]'
                }`}
              >
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`w-8 sm:w-12 h-px mx-2 transition-colors ${
                  i < currentIdx ? 'bg-[#533afd]' : 'bg-[#e5edf5]'
                }`}
                aria-hidden="true"
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Step 1: Vendor input ──

interface Step1Props {
  vendors: MatchVendor[]
  onSelect: (vendor: MatchVendor | null, manual: ManualVendor | null) => void
}

function Step1({ vendors, onSelect }: Step1Props) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [activeIdx, setActiveIdx] = useState(-1)
  const [manualMode, setManualMode] = useState(false)
  const [manualName, setManualName] = useState('')
  const [manualIndustry, setManualIndustry] = useState<IndustryCategory | ''>('')
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const suggestions = useMemo(() => {
    if (!query || query.length < 1) return []
    return vendors.filter((v) => fuzzyMatch(query, v.name)).slice(0, 8)
  }, [query, vendors])

  const handleInput = useCallback((value: string) => {
    setQuery(value)
    setManualMode(false)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setOpen(value.length > 0)
      setActiveIdx(-1)
    }, 200)
  }, [])

  const handleSelect = useCallback(
    (vendor: MatchVendor) => {
      setQuery(vendor.name)
      setOpen(false)
      setManualMode(false)
      onSelect(vendor, null)
    },
    [onSelect],
  )

  const handleManualConfirm = useCallback(() => {
    if (!manualName.trim()) return
    onSelect(null, { name: manualName.trim(), industry: manualIndustry })
  }, [manualName, manualIndustry, onSelect])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!open) return
      const items = suggestions.length > 0 ? suggestions.length : 0
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActiveIdx((i) => Math.min(i + 1, items - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActiveIdx((i) => Math.max(i - 1, -1))
      } else if (e.key === 'Enter') {
        if (activeIdx >= 0 && suggestions[activeIdx]) {
          handleSelect(suggestions[activeIdx])
        }
      } else if (e.key === 'Escape') {
        setOpen(false)
      }
    },
    [open, suggestions, activeIdx, handleSelect],
  )

  useEffect(() => {
    if (activeIdx >= 0 && listRef.current) {
      const item = listRef.current.children[activeIdx] as HTMLElement
      item?.scrollIntoView({ block: 'nearest' })
    }
  }, [activeIdx])

  return (
    <div>
      <h2
        className="text-[20px] sm:text-[24px] font-[300] text-[#061b31] mb-1"
        style={{ fontFeatureSettings: '"ss01"', letterSpacing: '-0.4px' }}
      >
        지금 어디서 받고 계세요?
      </h2>
      <p className="text-[14px] text-[#64748d] mb-6">
        현재 거래 중인 포장재 업체를 입력해주세요. 없으면 건너뛸 수 있습니다.
      </p>

      {!manualMode ? (
        <div className="relative">
          <label htmlFor="vendor-search" className="block text-[13px] font-[400] text-[#273951] mb-1.5">
            업체명 검색
          </label>
          <input
            id="vendor-search"
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => setTimeout(() => setOpen(false), 150)}
            onFocus={() => query.length > 0 && setOpen(true)}
            placeholder="업체명을 입력하세요"
            autoComplete="off"
            aria-autocomplete="list"
            aria-expanded={open}
            aria-controls="vendor-listbox"
            aria-activedescendant={activeIdx >= 0 ? `vendor-opt-${activeIdx}` : undefined}
            className="w-full h-11 px-4 rounded-lg border border-[#e5edf5] text-[14px] text-[#273951] bg-white placeholder:text-[#b0bec5] focus:outline-none focus:ring-2 focus:ring-[#533afd]/30 focus:border-[#533afd] transition-colors"
          />

          {open && (
            <ul
              id="vendor-listbox"
              ref={listRef}
              role="listbox"
              aria-label="업체 검색 결과"
              className="absolute z-20 w-full mt-1 bg-white border border-[#e5edf5] rounded-lg shadow-[0_4px_12px_rgba(50,50,93,0.12)] overflow-hidden max-h-64 overflow-y-auto"
            >
              {suggestions.length > 0 ? (
                suggestions.map((v, i) => (
                  <li
                    key={v.id}
                    id={`vendor-opt-${i}`}
                    role="option"
                    aria-selected={i === activeIdx}
                    onMouseDown={() => handleSelect(v)}
                    className={`px-4 py-3 cursor-pointer text-[14px] transition-colors flex items-center justify-between ${
                      i === activeIdx
                        ? 'bg-[#f4f3ff] text-[#533afd]'
                        : 'text-[#273951] hover:bg-[#f8fafc]'
                    }`}
                  >
                    <span>{v.name}</span>
                    {v.province && (
                      <span className="text-[12px] text-[#64748d] ml-2 flex-shrink-0">{v.province}</span>
                    )}
                  </li>
                ))
              ) : (
                <li className="px-4 py-3 text-[13px] text-[#64748d]">
                  검색 결과가 없습니다.{' '}
                  <button
                    type="button"
                    onMouseDown={() => {
                      setManualMode(true)
                      setManualName(query)
                      setOpen(false)
                    }}
                    className="text-[#533afd] underline underline-offset-2 hover:text-[#4434d4]"
                  >
                    직접 입력하기
                  </button>
                </li>
              )}
            </ul>
          )}

          <div className="flex flex-wrap items-center gap-3 mt-4">
            <button
              type="button"
              onClick={() => {
                setManualMode(true)
                setManualName(query)
              }}
              className="text-[13px] text-[#533afd] hover:text-[#4434d4] underline underline-offset-2 focus:outline-none"
            >
              검색에 없으면 직접 입력
            </button>
            <span className="text-[#e5edf5]">|</span>
            <button
              type="button"
              onClick={() => onSelect(null, null)}
              className="text-[13px] text-[#64748d] hover:text-[#273951] focus:outline-none"
            >
              기존 업체 없음 — 건너뛰기
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label htmlFor="manual-name" className="block text-[13px] font-[400] text-[#273951] mb-1.5">
              업체명 직접 입력
            </label>
            <input
              id="manual-name"
              type="text"
              value={manualName}
              onChange={(e) => setManualName(e.target.value)}
              placeholder="업체명을 입력하세요"
              className="w-full h-11 px-4 rounded-lg border border-[#e5edf5] text-[14px] text-[#273951] bg-white placeholder:text-[#b0bec5] focus:outline-none focus:ring-2 focus:ring-[#533afd]/30 focus:border-[#533afd] transition-colors"
            />
          </div>
          <div>
            <label htmlFor="manual-industry" className="block text-[13px] font-[400] text-[#273951] mb-1.5">
              업종 (선택)
            </label>
            <select
              id="manual-industry"
              value={manualIndustry}
              onChange={(e) => setManualIndustry(e.target.value as IndustryCategory | '')}
              className="w-full h-11 px-3 rounded-lg border border-[#e5edf5] text-[14px] text-[#273951] bg-white focus:outline-none focus:ring-2 focus:ring-[#533afd]/30 focus:border-[#533afd]"
            >
              <option value="">업종 선택 (선택사항)</option>
              {INDUSTRY_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {INDUSTRY_CATEGORY_LABELS[cat]}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleManualConfirm}
              disabled={!manualName.trim()}
              className="h-10 px-6 rounded-lg bg-[#533afd] text-white text-[14px] font-[400] hover:bg-[#4434d4] transition-colors focus:outline-none focus:ring-2 focus:ring-[#533afd]/50 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ fontFeatureSettings: '"ss01"' }}
            >
              다음
            </button>
            <button
              type="button"
              onClick={() => setManualMode(false)}
              className="text-[13px] text-[#64748d] hover:text-[#273951] focus:outline-none"
            >
              돌아가기
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Step 2: Axis selection ──

interface Step2Props {
  onSelect: (axis: Axis) => void
  onBack: () => void
}

function Step2({ onSelect, onBack }: Step2Props) {
  const [selected, setSelected] = useState<Axis | null>(null)

  return (
    <div>
      <h2
        className="text-[20px] sm:text-[24px] font-[300] text-[#061b31] mb-1"
        style={{ fontFeatureSettings: '"ss01"', letterSpacing: '-0.4px' }}
      >
        어떤 점이 더 나은 곳을 원하세요?
      </h2>
      <p className="text-[14px] text-[#64748d] mb-6">
        가장 중요한 개선 기준 하나를 선택해주세요.
      </p>

      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
        role="radiogroup"
        aria-label="개선 기준 선택"
      >
        {AXIS_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            role="radio"
            aria-checked={selected === opt.id}
            onClick={() => setSelected(opt.id)}
            className={`text-left px-4 py-4 rounded-xl border-2 transition-all focus:outline-none focus:ring-2 focus:ring-[#533afd]/40 ${
              selected === opt.id
                ? 'border-[#533afd] bg-[#f4f3ff]'
                : 'border-[#e5edf5] bg-white hover:border-[#b9b9f9] hover:bg-[#f8fafc]'
            }`}
          >
            <div
              className={`text-[15px] font-[400] mb-0.5 ${
                selected === opt.id ? 'text-[#533afd]' : 'text-[#273951]'
              }`}
              style={{ fontFeatureSettings: '"ss01"' }}
            >
              {opt.label}
            </div>
            <div className="text-[12px] text-[#64748d]">{opt.desc}</div>
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3 mt-6">
        <button
          type="button"
          onClick={() => selected && onSelect(selected)}
          disabled={!selected}
          className="h-10 px-6 rounded-lg bg-[#533afd] text-white text-[14px] font-[400] hover:bg-[#4434d4] transition-colors focus:outline-none focus:ring-2 focus:ring-[#533afd]/50 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ fontFeatureSettings: '"ss01"' }}
        >
          추천 보기
        </button>
        <button
          type="button"
          onClick={onBack}
          className="text-[13px] text-[#64748d] hover:text-[#273951] focus:outline-none"
        >
          ← 이전
        </button>
      </div>
    </div>
  )
}

// ── Step 3: Comparison ──

interface CompareRow {
  axis: Axis
  label: string
  getValue: (v: MatchVendor) => string
}

const COMPARE_ROWS: CompareRow[] = [
  {
    axis: 'region',
    label: '위치',
    getValue: (v) => {
      const parts = [v.province, v.city].filter(Boolean)
      if (parts.length) return parts.join(' ')
      if (v.delivery_regions?.includes('전국')) return '전국 배송'
      return '정보 없음'
    },
  },
  {
    axis: 'moq',
    label: 'MOQ',
    getValue: (v) => {
      if (v.moq_value != null) {
        const unit = v.moq_unit ?? '개'
        return `${v.moq_value.toLocaleString()}${unit}`
      }
      if (v.min_order_quantity) return v.min_order_quantity
      return '정보 없음'
    },
  },
  {
    axis: 'lead',
    label: '납기',
    getValue: (v) => {
      if (v.lead_time_standard_days != null) {
        const base = `${v.lead_time_standard_days}일`
        return v.lead_time_express_days != null ? `${base} (특급 ${v.lead_time_express_days}일)` : base
      }
      return '정보 없음'
    },
  },
  {
    axis: 'cert',
    label: '인증',
    getValue: (v) => {
      const certs = v.certifications ?? []
      return certs.length > 0 ? certs.slice(0, 3).join(', ') : '없음'
    },
  },
  {
    axis: 'price',
    label: '단가',
    getValue: () => '비공개 / 문의',
  },
]

function VendorCompareCard({
  vendor,
  axis,
  label,
  isPlaceholder,
}: {
  vendor: MatchVendor | null
  axis: Axis
  label: string
  isPlaceholder?: boolean
}) {
  const industryTags = vendor?.industry_categories.slice(0, 2).map((cat) => INDUSTRY_CATEGORY_LABELS[cat]) ?? []

  return (
    <article
      className={`rounded-xl border bg-white overflow-hidden shadow-[0_2px_8px_rgba(50,50,93,0.08)] ${
        isPlaceholder ? 'border-dashed border-[#b9b9f9]' : 'border-[#e5edf5]'
      }`}
    >
      {/* Card header */}
      <div className={`px-5 py-4 border-b ${isPlaceholder ? 'border-[#d6d9fc] bg-[#f4f3ff]/50' : 'border-[#e5edf5] bg-[#f8fafc]'}`}>
        <div className="text-[11px] font-[400] text-[#64748d] uppercase tracking-wider mb-1">{label}</div>
        {vendor ? (
          <>
            <h3 className="text-[15px] font-[400] text-[#061b31]" style={{ fontFeatureSettings: '"ss01"' }}>
              <Link
                href={`/companies/${vendor.slug}`}
                className="hover:text-[#533afd] transition-colors focus:outline-none focus:underline"
              >
                {vendor.name}
              </Link>
            </h3>
            {industryTags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1.5">
                {industryTags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[11px] px-2 py-0.5 rounded-full bg-[#f4f3ff] text-[#533afd] border border-[#d6d9fc]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="text-[14px] text-[#64748d] italic">기존 업체 없음</div>
        )}
      </div>

      {/* Comparison rows */}
      <dl className="divide-y divide-[#f1f5f9]">
        {COMPARE_ROWS.map((row) => {
          const isHighlighted = row.axis === axis
          const value = vendor ? row.getValue(vendor) : '—'
          return (
            <div
              key={row.axis}
              className={`flex items-center justify-between px-5 py-3 transition-colors ${
                isHighlighted
                  ? 'bg-[#f4f3ff] border-l-2 border-l-[#533afd]'
                  : ''
              }`}
            >
              <dt
                className={`text-[13px] flex-shrink-0 w-[4.5rem] ${
                  isHighlighted ? 'text-[#533afd] font-[400]' : 'text-[#64748d]'
                }`}
              >
                {isHighlighted && (
                  <span className="mr-1" aria-hidden="true">▶</span>
                )}
                {row.label}
              </dt>
              <dd
                className={`text-[13px] text-right ${
                  isHighlighted
                    ? 'text-[#533afd] font-[400]'
                    : value === '정보 없음' || value === '없음' || value === '비공개 / 문의' || value === '—'
                    ? 'text-[#b0bec5] italic'
                    : 'text-[#273951]'
                }`}
              >
                {row.axis === 'price' && value === '비공개 / 문의' ? (
                  <span className="inline-flex items-center gap-1">
                    <span>비공개</span>
                    {vendor && (
                      <Link
                        href={`/companies/${vendor.slug}`}
                        className="text-[11px] text-[#533afd] underline underline-offset-1 hover:text-[#4434d4]"
                      >
                        문의
                      </Link>
                    )}
                  </span>
                ) : (
                  value
                )}
              </dd>
            </div>
          )
        })}
      </dl>

      {/* CTA */}
      {vendor && (
        <div className="px-5 py-3 border-t border-[#f1f5f9] flex items-center gap-4">
          {vendor.website && (
            <a
              href={vendor.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[13px] text-[#533afd] hover:underline focus:outline-none focus:underline"
            >
              홈페이지 →
            </a>
          )}
          <Link
            href={`/companies/${vendor.slug}`}
            className="text-[13px] text-[#64748d] hover:text-[#273951] transition-colors focus:outline-none focus:underline"
          >
            상세 보기
          </Link>
        </div>
      )}
    </article>
  )
}

interface Step3Props {
  existingVendor: MatchVendor | null
  manualVendor: ManualVendor | null
  axis: Axis
  recommendations: MatchVendor[]
  onBack: () => void
  onReset: () => void
}

function Step3({ existingVendor, manualVendor, axis, recommendations, onBack, onReset }: Step3Props) {
  const [activeRec, setActiveRec] = useState(0)

  const axisLabel = AXIS_OPTIONS.find((o) => o.id === axis)?.label ?? axis

  const placeholderVendor: MatchVendor | null = manualVendor?.name
    ? ({
        id: '__manual__',
        slug: '',
        name: manualVendor.name,
        industry_categories: manualVendor.industry
          ? ([manualVendor.industry] as IndustryCategory[])
          : [],
        material_type: null,
        packaging_form: null,
        delivery_regions: [],
        province: null,
        city: null,
        phone: null,
        email: null,
        website: null,
        moq_value: null,
        moq_unit: null,
        min_order_quantity: null,
        lead_time_standard_days: null,
        lead_time_express_days: null,
        certifications: [],
        created_at: '',
      } as MatchVendor)
    : null

  const leftVendor = existingVendor ?? placeholderVendor

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h2
          className="text-[20px] sm:text-[24px] font-[300] text-[#061b31]"
          style={{ fontFeatureSettings: '"ss01"', letterSpacing: '-0.4px' }}
        >
          {axisLabel} 기준 추천 Top {recommendations.length}
        </h2>
        <button
          type="button"
          onClick={onReset}
          className="text-[13px] text-[#64748d] hover:text-[#273951] focus:outline-none hidden sm:block"
        >
          다시 시작
        </button>
      </div>
      <p className="text-[14px] text-[#64748d] mb-6">
        선택하신 기준({axisLabel})으로 강조 표시된 행을 비교해보세요.
      </p>

      {/* Mobile tab switcher for Top 3 */}
      {recommendations.length > 1 && (
        <div className="flex gap-2 mb-4 sm:hidden" role="tablist" aria-label="추천 업체 탭">
          {recommendations.map((r, i) => (
            <button
              key={r.id}
              type="button"
              role="tab"
              aria-selected={activeRec === i}
              onClick={() => setActiveRec(i)}
              className={`flex-1 py-2 rounded-lg text-[13px] font-[400] transition-colors border focus:outline-none ${
                activeRec === i
                  ? 'border-[#533afd] bg-[#f4f3ff] text-[#533afd]'
                  : 'border-[#e5edf5] bg-white text-[#64748d]'
              }`}
            >
              추천 {i + 1}
            </button>
          ))}
        </div>
      )}

      {/* Desktop: left vs right grid */}
      <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-1">
          {leftVendor ? (
            <VendorCompareCard vendor={leftVendor} axis={axis} label="기존 업체" />
          ) : (
            <div className="rounded-xl border-2 border-dashed border-[#e5edf5] bg-[#f8fafc] p-6 flex flex-col items-center justify-center text-center h-full min-h-[200px]">
              <div className="text-[13px] text-[#64748d] mb-1">기존 업체 없음</div>
              <div className="text-[12px] text-[#b0bec5]">(건너뛰기 선택)</div>
            </div>
          )}
        </div>
        <div className="lg:col-span-3 grid grid-cols-1 lg:grid-cols-3 gap-4">
          {recommendations.map((r, i) => (
            <VendorCompareCard key={r.id} vendor={r} axis={axis} label={`추천 ${i + 1}`} />
          ))}
          {recommendations.length === 0 && (
            <div className="col-span-3 text-center py-12 text-[14px] text-[#64748d]">
              추천 조건에 맞는 업체가 없습니다.
            </div>
          )}
        </div>
      </div>

      {/* Mobile: stacked comparison */}
      <div className="sm:hidden space-y-4">
        {leftVendor ? (
          <VendorCompareCard vendor={leftVendor} axis={axis} label="기존 업체" />
        ) : (
          <div className="rounded-xl border-2 border-dashed border-[#e5edf5] bg-[#f8fafc] p-5 text-[13px] text-[#64748d] text-center">
            기존 업체 없음 (건너뛰기 선택)
          </div>
        )}
        {recommendations[activeRec] && (
          <VendorCompareCard
            vendor={recommendations[activeRec]}
            axis={axis}
            label={`추천 ${activeRec + 1}`}
          />
        )}
        {recommendations.length === 0 && (
          <div className="text-center py-8 text-[14px] text-[#64748d]">
            추천 조건에 맞는 업체가 없습니다.
          </div>
        )}
      </div>

      {/* Price axis note */}
      {axis === 'price' && (
        <div className="mt-4 px-4 py-3 rounded-lg bg-[#fffbeb] border border-[#fde68a] text-[13px] text-[#92400e]">
          단가 정보는 현재 제공되지 않습니다. 업체 상세 페이지에서 직접 문의하세요.
          MOQ 기준으로 가격 대비 유리한 업체를 추천했습니다.
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 mt-6">
        <button
          type="button"
          onClick={onBack}
          className="text-[13px] text-[#64748d] hover:text-[#273951] focus:outline-none"
        >
          ← 기준 다시 선택
        </button>
        <button
          type="button"
          onClick={onReset}
          className="sm:hidden text-[13px] text-[#64748d] hover:text-[#273951] focus:outline-none"
        >
          처음부터
        </button>
      </div>
    </div>
  )
}

// ── Main wizard ──

interface Props {
  vendors: MatchVendor[]
}

export default function MatchClient({ vendors }: Props) {
  const [step, setStep] = useState<WizardStep>('vendor')
  const [selectedVendor, setSelectedVendor] = useState<MatchVendor | null>(null)
  const [manualVendor, setManualVendor] = useState<ManualVendor | null>(null)
  const [selectedAxis, setSelectedAxis] = useState<Axis | null>(null)

  const existingIndustry: IndustryCategory | null =
    selectedVendor?.industry_categories[0] ??
    (manualVendor?.industry || null)

  const recommendations = useMemo(() => {
    if (!selectedAxis) return []
    return getRecommendations(
      vendors,
      selectedVendor?.id ?? null,
      selectedVendor?.province ?? null,
      existingIndustry,
      selectedAxis,
    )
  }, [vendors, selectedVendor, existingIndustry, selectedAxis])

  function handleVendorSelect(vendor: MatchVendor | null, manual: ManualVendor | null) {
    setSelectedVendor(vendor)
    setManualVendor(manual)
    setStep('axis')
  }

  function handleAxisSelect(axis: Axis) {
    setSelectedAxis(axis)
    setStep('compare')
  }

  function handleReset() {
    setStep('vendor')
    setSelectedVendor(null)
    setManualVendor(null)
    setSelectedAxis(null)
  }

  return (
    <div className="max-w-4xl mx-auto px-5 py-10">
      <StepIndicator step={step} />

      <section
        className="bg-white rounded-xl border border-[#e5edf5] p-6 mb-8 shadow-[0_2px_8px_rgba(50,50,93,0.08)]"
        aria-label={
          step === 'vendor'
            ? '기존 업체 입력'
            : step === 'axis'
            ? '개선 기준 선택'
            : '업체 비교'
        }
      >
        {step === 'vendor' && <Step1 vendors={vendors} onSelect={handleVendorSelect} />}
        {step === 'axis' && (
          <Step2 onSelect={handleAxisSelect} onBack={() => setStep('vendor')} />
        )}
        {step === 'compare' && selectedAxis && (
          <Step3
            existingVendor={selectedVendor}
            manualVendor={manualVendor}
            axis={selectedAxis}
            recommendations={recommendations}
            onBack={() => setStep('axis')}
            onReset={handleReset}
          />
        )}
      </section>

      <div className="mt-8 pt-6 border-t border-[#e5edf5]">
        <VendorDirectoryDisclaimer />
      </div>
    </div>
  )
}
