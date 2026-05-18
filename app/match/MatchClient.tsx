'use client'

import { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  INDUSTRY_CATEGORY_LABELS,
  INDUSTRY_CATEGORIES,
  MATERIAL_TYPE_LABELS,
  MATERIAL_TYPES,
  PACKAGING_FORM_LABELS,
  PACKAGING_FORMS,
  type IndustryCategory,
  type MaterialType,
  type PackagingForm,
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

type WizardStep = 'vendor' | 'industry' | 'material' | 'volume' | 'axis' | 'compare'

type Axis = 'moq' | 'lead' | 'cert' | 'region'

type VolumeRange = 'lt_1k' | 'btw_1k_10k' | 'btw_10k_100k' | 'gt_100k'

interface ManualVendor {
  name: string
}

// ── Volume range config ──

const VOLUME_OPTIONS: { id: VolumeRange; label: string; desc: string; moqMax?: number; moqMin?: number }[] = [
  { id: 'lt_1k',        label: '1천 개 미만',    desc: '초소량 발주',   moqMax: 999 },
  { id: 'btw_1k_10k',   label: '1천~1만 개',    desc: '소량 발주',    moqMin: 1000,  moqMax: 10000 },
  { id: 'btw_10k_100k', label: '1만~10만 개',   desc: '중량 발주',   moqMin: 10000, moqMax: 100000 },
  { id: 'gt_100k',      label: '10만 개 이상',  desc: '대량 발주',   moqMin: 100000 },
]

// ── Axis config ──

const AXIS_OPTIONS: { id: Axis; label: string; desc: string }[] = [
  { id: 'moq',    label: '낮은 MOQ',  desc: '소량 발주 가능' },
  { id: 'lead',   label: '빠른 납기',  desc: '납기일 단축' },
  { id: 'cert',   label: '품질 인증',  desc: 'HACCP·ISO·친환경 등' },
  { id: 'region', label: '지역 근접', desc: '가까운 납품 커버' },
]

// ── Recommendation algorithm ──

function hasAxisData(v: MatchVendor, axis: Axis): boolean {
  if (axis === 'moq') return v.moq_value != null
  if (axis === 'lead') return v.lead_time_standard_days != null
  if (axis === 'cert') return (v.certifications?.length ?? 0) > 0
  if (axis === 'region') {
    return (v.delivery_regions?.length ?? 0) > 0 || v.province != null
  }
  return true
}

function axisScore(v: MatchVendor, ax: Axis, existingProvince: string | null): number {
  if (ax === 'moq') {
    const moq = v.moq_value ?? 999999
    return 1 / (1 + moq / 10000)
  }
  if (ax === 'lead') {
    const days = v.lead_time_standard_days ?? 999
    return 1 / (1 + days / 7)
  }
  if (ax === 'cert') {
    return v.certifications?.length ?? 0
  }
  if (ax === 'region') {
    if (!existingProvince) return 0
    if (v.delivery_regions?.includes('전국')) return 2
    if (v.delivery_regions?.includes(existingProvince)) return 1
    if (v.province === existingProvince) return 1
    return 0
  }
  return 0
}

function getRecommendations(
  vendors: MatchVendor[],
  existingId: string | null,
  existingProvince: string | null,
  industry: IndustryCategory | null,
  materials: MaterialType[],
  packagingForms: PackagingForm[],
  volume: VolumeRange | null,
  axes: Axis[],
): MatchVendor[] {
  const primaryAxis = axes[0] ?? 'moq'
  const secondaryAxis = axes[1] ?? null

  let pool = vendors.filter(
    (v) => v.id !== existingId && axes.some((ax) => hasAxisData(v, ax)),
  )

  // Filter by industry (soft: keep all if < 3 match)
  if (industry) {
    const sameCat = pool.filter((v) => v.industry_categories.includes(industry))
    if (sameCat.length >= 3) pool = sameCat
  }

  // Filter by material (soft match)
  if (materials.length > 0) {
    const withMat = pool.filter(
      (v) => v.material_type == null || materials.includes(v.material_type),
    )
    if (withMat.length >= 3) pool = withMat
  }

  // Filter by packaging form (soft match against packaging_form string field)
  if (packagingForms.length > 0) {
    const withForm = pool.filter((v) => {
      if (!v.packaging_form) return true
      return packagingForms.some((pf) => v.packaging_form?.includes(pf))
    })
    if (withForm.length >= 3) pool = withForm
  }

  // Filter by volume (MOQ soft match)
  if (volume) {
    const opt = VOLUME_OPTIONS.find((o) => o.id === volume)
    if (opt) {
      const volFiltered = pool.filter((v) => {
        if (v.moq_value == null) return true
        if (opt.moqMax != null && opt.moqMin == null) return v.moq_value <= opt.moqMax
        if (opt.moqMin != null && opt.moqMax != null) {
          return v.moq_value >= opt.moqMin && v.moq_value <= opt.moqMax
        }
        if (opt.moqMin != null && opt.moqMax == null) return v.moq_value >= opt.moqMin
        return true
      })
      if (volFiltered.length >= 3) pool = volFiltered
    }
  }

  // Score: primary 0.7 + secondary 0.3
  const score = (v: MatchVendor): number => {
    const primary = axisScore(v, primaryAxis, existingProvince) * 0.7
    const secondary = secondaryAxis
      ? axisScore(v, secondaryAxis, existingProvince) * 0.3
      : 0
    return primary + secondary
  }

  const sorted = [...pool].sort((a, b) => {
    const sd = score(b) - score(a)
    if (sd !== 0) return sd
    // tie-break by primary axis raw
    if (primaryAxis === 'moq') return (a.moq_value ?? 0) - (b.moq_value ?? 0)
    if (primaryAxis === 'lead') return (a.lead_time_standard_days ?? 0) - (b.lead_time_standard_days ?? 0)
    if (primaryAxis === 'cert') return (b.certifications?.length ?? 0) - (a.certifications?.length ?? 0)
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

const WIZARD_STEPS: { id: WizardStep; label: string }[] = [
  { id: 'vendor',   label: '기존 업체' },
  { id: 'industry', label: '업종' },
  { id: 'material', label: '소재·형태' },
  { id: 'volume',   label: '발주량' },
  { id: 'axis',     label: '우선순위' },
  { id: 'compare',  label: '비교' },
]

function StepIndicator({ step }: { step: WizardStep }) {
  const currentIdx = WIZARD_STEPS.findIndex((s) => s.id === step)

  return (
    <div className="flex items-center gap-0 mb-8 overflow-x-auto pb-1" role="list" aria-label="진행 단계">
      {WIZARD_STEPS.map((s, i) => {
        const done = i < currentIdx
        const active = i === currentIdx
        return (
          <div key={s.id} className="flex items-center flex-shrink-0" role="listitem">
            <div className="flex items-center gap-1.5">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-[400] transition-colors ${
                  done
                    ? 'bg-[#533afd] text-white'
                    : active
                    ? 'bg-[#533afd] text-white ring-2 ring-[#533afd]/30'
                    : 'bg-[#f1f5f9] text-[#64748d]'
                }`}
                aria-current={active ? 'step' : undefined}
              >
                {done ? (
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  i + 1
                )}
              </div>
              <span
                className={`text-[12px] hidden sm:inline whitespace-nowrap ${
                  active ? 'text-[#273951] font-[400]' : done ? 'text-[#533afd]' : 'text-[#64748d]'
                }`}
              >
                {s.label}
              </span>
            </div>
            {i < WIZARD_STEPS.length - 1 && (
              <div
                className={`w-5 sm:w-8 h-px mx-1.5 flex-shrink-0 transition-colors ${
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

// ── Shared: multi-select chip button ──

function ChipButton({
  selected,
  onClick,
  children,
}: {
  selected: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={selected}
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 text-left transition-all focus:outline-none focus:ring-2 focus:ring-[#533afd]/40 ${
        selected
          ? 'border-[#533afd] bg-[#f4f3ff]'
          : 'border-[#e5edf5] bg-white hover:border-[#b9b9f9] hover:bg-[#f8fafc]'
      }`}
    >
      <div
        className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
          selected ? 'border-[#533afd] bg-[#533afd]' : 'border-[#d1d9e0] bg-white'
        }`}
        aria-hidden="true"
      >
        {selected && (
          <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
            <path d="M1 4l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <span
        className={`text-[14px] font-[400] ${selected ? 'text-[#533afd]' : 'text-[#273951]'}`}
        style={{ fontFeatureSettings: '"ss01"' }}
      >
        {children}
      </span>
    </button>
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
    onSelect(null, { name: manualName.trim() })
  }, [manualName, onSelect])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!open) return
      const items = suggestions.length
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

// ── Step 2: Industry selection ──

interface Step2Props {
  prefill: IndustryCategory | null
  onSelect: (industry: IndustryCategory) => void
  onSkip: () => void
  onBack: () => void
}

function Step2({ prefill, onSelect, onSkip, onBack }: Step2Props) {
  const [selected, setSelected] = useState<IndustryCategory | null>(prefill)

  return (
    <div>
      <h2
        className="text-[20px] sm:text-[24px] font-[300] text-[#061b31] mb-1"
        style={{ fontFeatureSettings: '"ss01"', letterSpacing: '-0.4px' }}
      >
        어떤 업종에 필요한 포장재인가요?
      </h2>
      <p className="text-[14px] text-[#64748d] mb-6">
        업종을 선택하면 더 적합한 업체를 추천해드립니다.
      </p>

      <div
        className="grid grid-cols-2 sm:grid-cols-3 gap-3"
        role="radiogroup"
        aria-label="업종 선택"
      >
        {INDUSTRY_CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            role="radio"
            aria-checked={selected === cat}
            onClick={() => setSelected(cat)}
            className={`text-left px-4 py-3 rounded-xl border-2 transition-all focus:outline-none focus:ring-2 focus:ring-[#533afd]/40 ${
              selected === cat
                ? 'border-[#533afd] bg-[#f4f3ff]'
                : 'border-[#e5edf5] bg-white hover:border-[#b9b9f9] hover:bg-[#f8fafc]'
            }`}
          >
            <div
              className={`text-[14px] font-[400] ${
                selected === cat ? 'text-[#533afd]' : 'text-[#273951]'
              }`}
              style={{ fontFeatureSettings: '"ss01"' }}
            >
              {INDUSTRY_CATEGORY_LABELS[cat]}
            </div>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3 mt-6">
        <button
          type="button"
          onClick={() => selected && onSelect(selected)}
          disabled={!selected}
          className="h-10 px-6 rounded-lg bg-[#533afd] text-white text-[14px] font-[400] hover:bg-[#4434d4] transition-colors focus:outline-none focus:ring-2 focus:ring-[#533afd]/50 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ fontFeatureSettings: '"ss01"' }}
        >
          다음
        </button>
        <button
          type="button"
          onClick={onSkip}
          className="text-[13px] text-[#64748d] hover:text-[#273951] focus:outline-none"
        >
          잘 모름 — 건너뛰기
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

// ── Step 3: Material + packaging form multi-select ──

interface Step3Props {
  onSelect: (materials: MaterialType[], forms: PackagingForm[]) => void
  onBack: () => void
}

function Step3({ onSelect, onBack }: Step3Props) {
  const [selMaterials, setSelMaterials] = useState<Set<MaterialType>>(new Set())
  const [selForms, setSelForms] = useState<Set<PackagingForm>>(new Set())

  const toggleMat = (mat: MaterialType) =>
    setSelMaterials((prev) => {
      const next = new Set(prev)
      next.has(mat) ? next.delete(mat) : next.add(mat)
      return next
    })

  const toggleForm = (form: PackagingForm) =>
    setSelForms((prev) => {
      const next = new Set(prev)
      next.has(form) ? next.delete(form) : next.add(form)
      return next
    })

  const totalSelected = selMaterials.size + selForms.size

  return (
    <div>
      <h2
        className="text-[20px] sm:text-[24px] font-[300] text-[#061b31] mb-1"
        style={{ fontFeatureSettings: '"ss01"', letterSpacing: '-0.4px' }}
      >
        필요한 소재·형태를 선택해주세요
      </h2>
      <p className="text-[14px] text-[#64748d] mb-5">
        복수 선택 가능합니다. 선택하지 않으면 모든 소재·형태를 포함합니다.
      </p>

      {/* Material group */}
      <div className="mb-5">
        <p className="text-[12px] font-[400] text-[#64748d] uppercase tracking-wider mb-2">소재</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2" role="group" aria-label="소재 선택">
          {MATERIAL_TYPES.map((mat) => (
            <ChipButton key={mat} selected={selMaterials.has(mat)} onClick={() => toggleMat(mat)}>
              {MATERIAL_TYPE_LABELS[mat]}
            </ChipButton>
          ))}
        </div>
      </div>

      {/* Packaging form group */}
      <div className="mb-5">
        <p className="text-[12px] font-[400] text-[#64748d] uppercase tracking-wider mb-2">형태</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2" role="group" aria-label="형태 선택">
          {PACKAGING_FORMS.map((form) => (
            <ChipButton key={form} selected={selForms.has(form)} onClick={() => toggleForm(form)}>
              {PACKAGING_FORM_LABELS[form]}
            </ChipButton>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 mt-2">
        <button
          type="button"
          onClick={() => onSelect(Array.from(selMaterials), Array.from(selForms))}
          className="h-10 px-6 rounded-lg bg-[#533afd] text-white text-[14px] font-[400] hover:bg-[#4434d4] transition-colors focus:outline-none focus:ring-2 focus:ring-[#533afd]/50"
          style={{ fontFeatureSettings: '"ss01"' }}
        >
          {totalSelected > 0 ? `${totalSelected}개 선택 · 다음` : '잘 모름 — 건너뛰기'}
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

// ── Step 4: Monthly order volume ──

interface Step4Props {
  onSelect: (volume: VolumeRange | null) => void
  onBack: () => void
}

function Step4({ onSelect, onBack }: Step4Props) {
  const [selected, setSelected] = useState<VolumeRange | null>(null)

  return (
    <div>
      <h2
        className="text-[20px] sm:text-[24px] font-[300] text-[#061b31] mb-1"
        style={{ fontFeatureSettings: '"ss01"', letterSpacing: '-0.4px' }}
      >
        월 발주량은 어느 정도인가요?
      </h2>
      <p className="text-[14px] text-[#64748d] mb-6">
        MOQ 기준으로 적합한 업체를 추려드립니다.
      </p>

      <div
        className="grid grid-cols-2 sm:grid-cols-4 gap-3"
        role="radiogroup"
        aria-label="월 발주량 선택"
      >
        {VOLUME_OPTIONS.map((opt) => (
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
              className={`text-[14px] font-[400] mb-0.5 ${
                selected === opt.id ? 'text-[#533afd]' : 'text-[#273951]'
              }`}
              style={{ fontFeatureSettings: '"ss01"' }}
            >
              {opt.label}
            </div>
            <div className="text-[11px] text-[#64748d]">{opt.desc}</div>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3 mt-6">
        <button
          type="button"
          onClick={() => selected && onSelect(selected)}
          disabled={!selected}
          className="h-10 px-6 rounded-lg bg-[#533afd] text-white text-[14px] font-[400] hover:bg-[#4434d4] transition-colors focus:outline-none focus:ring-2 focus:ring-[#533afd]/50 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ fontFeatureSettings: '"ss01"' }}
        >
          다음
        </button>
        <button
          type="button"
          onClick={() => onSelect(null)}
          className="text-[13px] text-[#64748d] hover:text-[#273951] focus:outline-none"
        >
          모름 — 건너뛰기
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

// ── Step 5: Priority axis selection (max 2) ──

interface Step5Props {
  onSelect: (axes: Axis[]) => void
  onBack: () => void
}

function Step5({ onSelect, onBack }: Step5Props) {
  const [selected, setSelected] = useState<Axis[]>([])

  const toggle = (ax: Axis) => {
    setSelected((prev) => {
      if (prev.includes(ax)) return prev.filter((a) => a !== ax)
      if (prev.length >= 2) return prev
      return [...prev, ax]
    })
  }

  return (
    <div>
      <h2
        className="text-[20px] sm:text-[24px] font-[300] text-[#061b31] mb-1"
        style={{ fontFeatureSettings: '"ss01"', letterSpacing: '-0.4px' }}
      >
        어떤 점이 더 나은 곳을 원하세요?
      </h2>
      <p className="text-[14px] text-[#64748d] mb-6">
        우선순위 기준을 최대 2개 선택해주세요.{' '}
        {selected.length > 0 && (
          <span className="text-[#533afd] font-[400]">{selected.length}/2 선택됨</span>
        )}
      </p>

      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"
        role="group"
        aria-label="개선 기준 선택"
      >
        {AXIS_OPTIONS.map((opt) => {
          const isSelected = selected.includes(opt.id)
          const isDisabled = !isSelected && selected.length >= 2
          const rank = selected.indexOf(opt.id)
          return (
            <button
              key={opt.id}
              type="button"
              role="checkbox"
              aria-checked={isSelected}
              onClick={() => toggle(opt.id)}
              disabled={isDisabled}
              className={`relative text-left px-4 py-4 rounded-xl border-2 transition-all focus:outline-none focus:ring-2 focus:ring-[#533afd]/40 ${
                isSelected
                  ? 'border-[#533afd] bg-[#f4f3ff]'
                  : isDisabled
                  ? 'border-[#e5edf5] bg-[#f8fafc] opacity-40 cursor-not-allowed'
                  : 'border-[#e5edf5] bg-white hover:border-[#b9b9f9] hover:bg-[#f8fafc]'
              }`}
            >
              {isSelected && rank >= 0 && (
                <span
                  className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#533afd] text-white text-[10px] font-[400] flex items-center justify-center"
                  aria-label={`우선순위 ${rank + 1}`}
                >
                  {rank + 1}
                </span>
              )}
              <div
                className={`text-[15px] font-[400] mb-0.5 ${
                  isSelected ? 'text-[#533afd]' : 'text-[#273951]'
                }`}
                style={{ fontFeatureSettings: '"ss01"' }}
              >
                {opt.label}
              </div>
              <div className="text-[12px] text-[#64748d]">{opt.desc}</div>
            </button>
          )
        })}
      </div>

      <div className="flex items-center gap-3 mt-6">
        <button
          type="button"
          onClick={() => selected.length > 0 && onSelect(selected)}
          disabled={selected.length === 0}
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

// ── Step 6: Comparison ──

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
]

function VendorCompareCard({
  vendor,
  axes,
  label,
}: {
  vendor: MatchVendor | null
  axes: Axis[]
  label: string
}) {
  const isPlaceholder = !vendor
  const industryTags = vendor?.industry_categories.slice(0, 2).map((cat) => INDUSTRY_CATEGORY_LABELS[cat]) ?? []

  return (
    <article
      className={`rounded-xl border bg-white overflow-hidden shadow-[0_2px_8px_rgba(50,50,93,0.08)] ${
        isPlaceholder ? 'border-dashed border-[#b9b9f9]' : 'border-[#e5edf5]'
      }`}
    >
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

      <dl className="divide-y divide-[#f1f5f9]">
        {COMPARE_ROWS.map((row) => {
          const isPrimary = axes[0] === row.axis
          const isSecondary = axes[1] === row.axis
          const value = vendor ? row.getValue(vendor) : '—'
          return (
            <div
              key={row.axis}
              className={`flex items-center justify-between px-5 py-3 transition-colors ${
                isPrimary
                  ? 'bg-[#f4f3ff] border-l-2 border-l-[#533afd]'
                  : isSecondary
                  ? 'bg-[#faf9ff] border-l-2 border-l-[#b9b9f9]'
                  : ''
              }`}
            >
              <dt
                className={`text-[13px] flex-shrink-0 w-[4.5rem] ${
                  isPrimary ? 'text-[#533afd] font-[400]' : isSecondary ? 'text-[#7c6ef9]' : 'text-[#64748d]'
                }`}
              >
                {isPrimary && <span className="mr-1" aria-hidden="true">▶</span>}
                {isSecondary && <span className="mr-1" aria-hidden="true">▷</span>}
                {row.label}
              </dt>
              <dd
                className={`text-[13px] text-right ${
                  isPrimary
                    ? 'text-[#533afd] font-[400]'
                    : isSecondary
                    ? 'text-[#7c6ef9]'
                    : value === '정보 없음' || value === '없음' || value === '—'
                    ? 'text-[#b0bec5] italic'
                    : 'text-[#273951]'
                }`}
              >
                {value}
              </dd>
            </div>
          )
        })}
      </dl>

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

interface Step6Props {
  existingVendor: MatchVendor | null
  manualVendor: ManualVendor | null
  axes: Axis[]
  recommendations: MatchVendor[]
  onBack: () => void
  onReset: () => void
}

function Step6({ existingVendor, manualVendor, axes, recommendations, onBack, onReset }: Step6Props) {
  const [activeRec, setActiveRec] = useState(0)

  const axisLabels = axes.map((ax) => AXIS_OPTIONS.find((o) => o.id === ax)?.label ?? ax).join(' · ')

  const placeholderVendor: MatchVendor | null = manualVendor?.name
    ? ({
        id: '__manual__',
        slug: '',
        name: manualVendor.name,
        industry_categories: [],
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
          추천 Top {recommendations.length}
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
        선택하신 기준({axisLabels})으로 강조된 행을 비교해보세요.
      </p>

      {recommendations.length === 0 ? (
        <div className="rounded-xl border border-[#e5edf5] bg-[#f8fafc] p-8 text-center">
          <p className="text-[15px] text-[#273951] mb-2">조건에 맞는 업체가 없습니다.</p>
          <p className="text-[13px] text-[#64748d] mb-4">
            소재·형태 또는 발주량 조건을 완화하면 더 많은 업체를 볼 수 있습니다.
          </p>
          <button
            type="button"
            onClick={onReset}
            className="h-10 px-6 rounded-lg bg-[#533afd] text-white text-[14px] font-[400] hover:bg-[#4434d4] transition-colors focus:outline-none focus:ring-2 focus:ring-[#533afd]/50"
            style={{ fontFeatureSettings: '"ss01"' }}
          >
            처음부터 다시
          </button>
        </div>
      ) : (
        <>
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

          {/* Desktop */}
          <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-1">
              {leftVendor ? (
                <VendorCompareCard vendor={leftVendor} axes={axes} label="기존 업체" />
              ) : (
                <div className="rounded-xl border-2 border-dashed border-[#e5edf5] bg-[#f8fafc] p-6 flex flex-col items-center justify-center text-center h-full min-h-[200px]">
                  <div className="text-[13px] text-[#64748d] mb-1">기존 업체 없음</div>
                  <div className="text-[12px] text-[#b0bec5]">(건너뛰기 선택)</div>
                </div>
              )}
            </div>
            <div className="lg:col-span-3 grid grid-cols-1 lg:grid-cols-3 gap-4">
              {recommendations.map((r, i) => (
                <VendorCompareCard key={r.id} vendor={r} axes={axes} label={`추천 ${i + 1}`} />
              ))}
            </div>
          </div>

          {/* Mobile */}
          <div className="sm:hidden space-y-4">
            {leftVendor ? (
              <VendorCompareCard vendor={leftVendor} axes={axes} label="기존 업체" />
            ) : (
              <div className="rounded-xl border-2 border-dashed border-[#e5edf5] bg-[#f8fafc] p-5 text-[13px] text-[#64748d] text-center">
                기존 업체 없음 (건너뛰기 선택)
              </div>
            )}
            {recommendations[activeRec] && (
              <VendorCompareCard
                vendor={recommendations[activeRec]}
                axes={axes}
                label={`추천 ${activeRec + 1}`}
              />
            )}
          </div>
        </>
      )}

      <div className="flex flex-wrap items-center gap-3 mt-6">
        {recommendations.length > 0 && (
          <button
            type="button"
            onClick={onBack}
            className="text-[13px] text-[#64748d] hover:text-[#273951] focus:outline-none"
          >
            ← 기준 다시 선택
          </button>
        )}
        <button
          type="button"
          onClick={onReset}
          className="text-[13px] text-[#64748d] hover:text-[#273951] focus:outline-none sm:hidden"
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
  const [selectedIndustry, setSelectedIndustry] = useState<IndustryCategory | null>(null)
  const [selectedMaterials, setSelectedMaterials] = useState<MaterialType[]>([])
  const [selectedForms, setSelectedForms] = useState<PackagingForm[]>([])
  const [selectedVolume, setSelectedVolume] = useState<VolumeRange | null>(null)
  const [selectedAxes, setSelectedAxes] = useState<Axis[]>([])

  // Pre-fill industry from vendor when vendor is selected
  const vendorIndustryPrefill = selectedVendor?.industry_categories[0] ?? null

  const recommendations = useMemo(() => {
    if (selectedAxes.length === 0) return []
    return getRecommendations(
      vendors,
      selectedVendor?.id ?? null,
      selectedVendor?.province ?? null,
      selectedIndustry,
      selectedMaterials,
      selectedForms,
      selectedVolume,
      selectedAxes,
    )
  }, [vendors, selectedVendor, selectedIndustry, selectedMaterials, selectedForms, selectedVolume, selectedAxes])

  function handleVendorSelect(vendor: MatchVendor | null, manual: ManualVendor | null) {
    setSelectedVendor(vendor)
    setManualVendor(manual)
    setStep('industry')
  }

  function handleReset() {
    setStep('vendor')
    setSelectedVendor(null)
    setManualVendor(null)
    setSelectedIndustry(null)
    setSelectedMaterials([])
    setSelectedForms([])
    setSelectedVolume(null)
    setSelectedAxes([])
  }

  const ariaLabel = {
    vendor: '기존 업체 입력',
    industry: '업종 선택',
    material: '소재·형태 선택',
    volume: '발주량 선택',
    axis: '개선 기준 선택',
    compare: '업체 비교',
  }[step]

  return (
    <div className="max-w-4xl mx-auto px-5 py-10">
      <StepIndicator step={step} />

      <section
        className="bg-white rounded-xl border border-[#e5edf5] p-6 mb-8 shadow-[0_2px_8px_rgba(50,50,93,0.08)]"
        aria-label={ariaLabel}
      >
        {step === 'vendor' && (
          <Step1 vendors={vendors} onSelect={handleVendorSelect} />
        )}
        {step === 'industry' && (
          <Step2
            prefill={vendorIndustryPrefill}
            onSelect={(ind) => { setSelectedIndustry(ind); setStep('material') }}
            onSkip={() => { setSelectedIndustry(null); setStep('material') }}
            onBack={() => setStep('vendor')}
          />
        )}
        {step === 'material' && (
          <Step3
            onSelect={(mats, forms) => {
              setSelectedMaterials(mats)
              setSelectedForms(forms)
              setStep('volume')
            }}
            onBack={() => setStep('industry')}
          />
        )}
        {step === 'volume' && (
          <Step4
            onSelect={(vol) => { setSelectedVolume(vol); setStep('axis') }}
            onBack={() => setStep('material')}
          />
        )}
        {step === 'axis' && (
          <Step5
            onSelect={(axes) => { setSelectedAxes(axes); setStep('compare') }}
            onBack={() => setStep('volume')}
          />
        )}
        {step === 'compare' && selectedAxes.length > 0 && (
          <Step6
            existingVendor={selectedVendor}
            manualVendor={manualVendor}
            axes={selectedAxes}
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
