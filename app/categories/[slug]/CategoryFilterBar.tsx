'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import {
  MATERIAL_TYPES,
  MATERIAL_TYPE_LABELS,
  PACKAGING_FORMS,
  PACKAGING_FORM_LABELS,
  CERTIFICATION_TYPES,
  PRINT_DESIGN_SUBTYPES,
  PRINT_DESIGN_SUBTYPE_LABELS,
  type MaterialType,
  type PackagingForm,
  type PrintDesignSubtype,
  type UseCaseTag,
} from '@/types'
import { SortDropdown } from '@/components/SortDropdown'
import { MobileFilterSheet } from './MobileFilterSheet'

interface CategoryFilterBarProps {
  categorySlug: string
  isPrintDesign: boolean
  resultCount: number
  useCaseTags: Pick<UseCaseTag, 'id' | 'slug' | 'label' | 'icon'>[]
}

type DropdownKey = 'material' | 'form' | 'cert' | 'useCase' | 'subtype'

interface DropdownOption {
  value: string
  label: string
}

interface FilterDropdownProps {
  label: string
  options: DropdownOption[]
  currentValues: string[]
  isMulti: boolean
  isOpen: boolean
  onOpen: () => void
  onClose: () => void
  onApply: (values: string[]) => void
}

function FilterDropdown({
  label,
  options,
  currentValues,
  isMulti,
  isOpen,
  onOpen,
  onClose,
  onApply,
}: FilterDropdownProps) {
  const [pending, setPending] = useState<Set<string>>(new Set(currentValues))

  useEffect(() => {
    if (isOpen) {
      setPending(new Set(currentValues))
    }
    // intentionally omit currentValues — only reset when dropdown opens
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  const toggleOption = (value: string) => {
    setPending((prev) => {
      const next = new Set(prev)
      if (isMulti) {
        if (next.has(value)) next.delete(value)
        else next.add(value)
      } else {
        if (next.has(value)) next.clear()
        else { next.clear(); next.add(value) }
      }
      return next
    })
  }

  const handleApply = () => {
    onApply(Array.from(pending))
    onClose()
  }

  const activeCount = currentValues.length

  return (
    <div className="relative">
      <button
        onClick={isOpen ? onClose : onOpen}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${
          activeCount > 0
            ? 'border-orange-700 text-orange-700 bg-orange-50'
            : 'border-slate-300 text-slate-700 bg-white hover:border-slate-400'
        }`}
      >
        {label}
        {activeCount > 0 && (
          <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-orange-700 px-1 text-[10px] font-bold text-white">
            {activeCount}
          </span>
        )}
        <svg
          className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {isOpen && (
        <div
          role="listbox"
          className="absolute left-0 top-full mt-1 w-64 bg-white border border-slate-200 rounded-lg shadow-lg p-3 z-40"
        >
          <div className="space-y-1.5 max-h-56 overflow-y-auto">
            {options.map((opt) => (
              <label
                key={opt.value}
                className="flex items-center gap-2 rounded px-2 py-1.5 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={pending.has(opt.value)}
                  onChange={() => toggleOption(opt.value)}
                  className="h-4 w-4 rounded border-slate-300 text-orange-700 focus:ring-orange-700"
                />
                {opt.label}
              </label>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2">
            <button
              onClick={() => setPending(new Set())}
              className="text-xs text-slate-500 hover:text-slate-700"
            >
              초기화
            </button>
            <button
              onClick={handleApply}
              className="bg-orange-700 text-white hover:bg-orange-800 rounded-md px-3 py-1 text-xs font-medium"
            >
              적용
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export function CategoryFilterBar({
  categorySlug: _categorySlug,
  isPrintDesign,
  resultCount,
  useCaseTags,
}: CategoryFilterBarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [activeDropdown, setActiveDropdown] = useState<DropdownKey | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const barRef = useRef<HTMLDivElement>(null)

  const currentMaterials = searchParams.get('material')?.split(',').filter(Boolean) ?? []
  const currentForms = searchParams.get('form')?.split(',').filter(Boolean) ?? []
  const currentCerts = searchParams.get('cert')?.split(',').filter(Boolean) ?? []
  const currentUseCaseRaw = searchParams.get('use-case')
  const currentUseCase = currentUseCaseRaw ? [currentUseCaseRaw] : []
  const currentSample = searchParams.get('sample') === 'true'
  const currentSubtypeRaw = searchParams.get('subtype')
  const currentSubtype = currentSubtypeRaw ? [currentSubtypeRaw] : []
  const currentSort = searchParams.get('sort') ?? ''

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (barRef.current && !barRef.current.contains(e.target as Node)) {
        setActiveDropdown(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const applyFilter = useCallback(
    (key: string, values: string[]) => {
      const params = new URLSearchParams(searchParams.toString())
      params.delete('page')
      if (values.length > 0) params.set(key, values.join(','))
      else params.delete(key)
      router.push(`${pathname}${params.toString() ? `?${params}` : ''}`)
    },
    [searchParams, pathname, router],
  )

  const currentEco = searchParams.get('eco') === 'true'
  const currentFresh = searchParams.get('fresh') === 'true'

  const toggleBoolean = (key: string, current: boolean) => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('page')
    if (current) params.delete(key)
    else params.set(key, 'true')
    router.push(`${pathname}${params.toString() ? `?${params}` : ''}`)
  }

  const toggleSample = () => toggleBoolean('sample', currentSample)
  const toggleEco = () => toggleBoolean('eco', currentEco)
  const toggleFresh = () => toggleBoolean('fresh', currentFresh)

  const totalActiveCount =
    (isPrintDesign ? currentSubtype.length : currentMaterials.length + currentForms.length) +
    currentCerts.length +
    currentUseCase.length +
    (currentSample ? 1 : 0) +
    (currentEco ? 1 : 0) +
    (currentFresh ? 1 : 0)

  const materialOptions: DropdownOption[] = MATERIAL_TYPES.map((m) => ({
    value: m,
    label: MATERIAL_TYPE_LABELS[m],
  }))
  const formOptions: DropdownOption[] = PACKAGING_FORMS.map((f) => ({
    value: f,
    label: PACKAGING_FORM_LABELS[f],
  }))
  const certOptions: DropdownOption[] = CERTIFICATION_TYPES.map((c) => ({
    value: c.id,
    label: c.label,
  }))
  const useCaseOptions: DropdownOption[] = useCaseTags.map((t) => ({
    value: t.slug,
    label: `${t.icon} ${t.label}`,
  }))
  const subtypeOptions: DropdownOption[] = PRINT_DESIGN_SUBTYPES.map((s) => ({
    value: s,
    label: PRINT_DESIGN_SUBTYPE_LABELS[s],
  }))

  return (
    <>
      <div
        className="bg-white/95 backdrop-blur-sm border-b border-gray-100 sticky top-16 z-40"
        ref={barRef}
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          {/* Desktop filter bar */}
          <div className="hidden sm:flex items-center gap-2 py-2.5 flex-wrap">
            {isPrintDesign ? (
              <FilterDropdown
                label="유형"
                options={subtypeOptions}
                currentValues={currentSubtype}
                isMulti={false}
                isOpen={activeDropdown === 'subtype'}
                onOpen={() => setActiveDropdown('subtype')}
                onClose={() => setActiveDropdown(null)}
                onApply={(vals) => applyFilter('subtype', vals)}
              />
            ) : (
              <>
                <FilterDropdown
                  label="소재"
                  options={materialOptions}
                  currentValues={currentMaterials}
                  isMulti={true}
                  isOpen={activeDropdown === 'material'}
                  onOpen={() => setActiveDropdown('material')}
                  onClose={() => setActiveDropdown(null)}
                  onApply={(vals) => applyFilter('material', vals)}
                />
                <FilterDropdown
                  label="형태"
                  options={formOptions}
                  currentValues={currentForms}
                  isMulti={true}
                  isOpen={activeDropdown === 'form'}
                  onOpen={() => setActiveDropdown('form')}
                  onClose={() => setActiveDropdown(null)}
                  onApply={(vals) => applyFilter('form', vals)}
                />
              </>
            )}

            <FilterDropdown
              label="인증"
              options={certOptions}
              currentValues={currentCerts}
              isMulti={true}
              isOpen={activeDropdown === 'cert'}
              onOpen={() => setActiveDropdown('cert')}
              onClose={() => setActiveDropdown(null)}
              onApply={(vals) => applyFilter('cert', vals)}
            />

            {useCaseTags.length > 0 && (
              <FilterDropdown
                label="용도"
                options={useCaseOptions}
                currentValues={currentUseCase}
                isMulti={false}
                isOpen={activeDropdown === 'useCase'}
                onOpen={() => setActiveDropdown('useCase')}
                onClose={() => setActiveDropdown(null)}
                onApply={(vals) => applyFilter('use-case', vals)}
              />
            )}

            <button
              onClick={toggleSample}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${
                currentSample
                  ? 'border-orange-700 text-orange-700 bg-orange-50'
                  : 'border-slate-300 text-slate-700 bg-white hover:border-slate-400'
              }`}
            >
              샘플 가능
            </button>

            <button
              onClick={toggleEco}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${
                currentEco
                  ? 'border-green-700 text-green-700 bg-green-50'
                  : 'border-slate-300 text-slate-700 bg-white hover:border-slate-400'
              }`}
            >
              친환경
            </button>

            <button
              onClick={toggleFresh}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${
                currentFresh
                  ? 'border-sky-700 text-sky-700 bg-sky-50'
                  : 'border-slate-300 text-slate-700 bg-white hover:border-slate-400'
              }`}
            >
              신선·콜드체인
            </button>

            <div className="ml-auto flex items-center gap-3">
              <span className="text-sm text-slate-500 font-medium">
                {resultCount.toLocaleString()}개 업체
              </span>
              <SortDropdown currentSort={currentSort} />
            </div>
          </div>

          {/* Mobile filter button row */}
          <div className="flex sm:hidden items-center justify-between py-2.5">
            <button
              onClick={() => setMobileOpen(true)}
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium ${
                totalActiveCount > 0
                  ? 'border-orange-700 text-orange-700 bg-orange-50'
                  : 'border-slate-300 text-slate-700 bg-white'
              }`}
              aria-label="필터 열기"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
              필터
              {totalActiveCount > 0 && (
                <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-orange-700 px-1 text-[10px] font-bold text-white">
                  {totalActiveCount}
                </span>
              )}
            </button>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500 font-medium">
                {resultCount.toLocaleString()}개
              </span>
              <SortDropdown currentSort={currentSort} />
            </div>
          </div>
        </div>
      </div>

      <MobileFilterSheet
        isOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        isPrintDesign={isPrintDesign}
        useCaseTags={useCaseTags}
        resultCount={resultCount}
      />
    </>
  )
}
