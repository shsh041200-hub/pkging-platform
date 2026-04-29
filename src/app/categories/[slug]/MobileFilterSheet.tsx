'use client'

import { useState, useEffect } from 'react'
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

interface MobileFilterSheetProps {
  isOpen: boolean
  onClose: () => void
  isPrintDesign: boolean
  useCaseTags: Pick<UseCaseTag, 'id' | 'slug' | 'label' | 'icon'>[]
  resultCount: number
}

interface AccordionSectionProps {
  title: string
  isOpen: boolean
  onToggle: () => void
  activeCount: number
  children: React.ReactNode
}

function AccordionSection({ title, isOpen, onToggle, activeCount, children }: AccordionSectionProps) {
  return (
    <div className="border-b border-slate-100">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between px-4 py-3"
        aria-expanded={isOpen}
      >
        <span className="text-sm font-medium text-slate-900">
          {title}
          {activeCount > 0 && (
            <span className="ml-1.5 text-orange-700">({activeCount})</span>
          )}
        </span>
        <svg
          className={`h-4 w-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>
      {isOpen && <div className="px-4 pb-3 space-y-0.5">{children}</div>}
    </div>
  )
}

export function MobileFilterSheet({
  isOpen,
  onClose,
  isPrintDesign,
  useCaseTags,
  resultCount,
}: MobileFilterSheetProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [pendingMaterials, setPendingMaterials] = useState<Set<MaterialType>>(new Set())
  const [pendingForms, setPendingForms] = useState<Set<PackagingForm>>(new Set())
  const [pendingCerts, setPendingCerts] = useState<Set<string>>(new Set())
  const [pendingUseCase, setPendingUseCase] = useState<string | null>(null)
  const [pendingSample, setPendingSample] = useState(false)
  const [pendingEco, setPendingEco] = useState(false)
  const [pendingFresh, setPendingFresh] = useState(false)
  const [pendingSubtype, setPendingSubtype] = useState<PrintDesignSubtype | null>(null)

  const firstSection = isPrintDesign ? 'subtype' : 'material'
  const [openSection, setOpenSection] = useState<string>(firstSection)

  useEffect(() => {
    if (!isOpen) return

    setPendingMaterials(
      new Set(
        (searchParams.get('material')?.split(',').filter(Boolean) ?? []) as MaterialType[],
      ),
    )
    setPendingForms(
      new Set(
        (searchParams.get('form')?.split(',').filter(Boolean) ?? []) as PackagingForm[],
      ),
    )
    setPendingCerts(new Set(searchParams.get('cert')?.split(',').filter(Boolean) ?? []))
    setPendingUseCase(searchParams.get('use-case') ?? null)
    setPendingSample(searchParams.get('sample') === 'true')
    setPendingEco(searchParams.get('eco') === 'true')
    setPendingFresh(searchParams.get('fresh') === 'true')
    setPendingSubtype((searchParams.get('subtype') as PrintDesignSubtype | null) ?? null)
    setOpenSection(firstSection)
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

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const handleApply = () => {
    const params = new URLSearchParams()
    const currentSort = searchParams.get('sort')

    if (!isPrintDesign && pendingMaterials.size > 0)
      params.set('material', Array.from(pendingMaterials).join(','))
    if (!isPrintDesign && pendingForms.size > 0)
      params.set('form', Array.from(pendingForms).join(','))
    if (isPrintDesign && pendingSubtype) params.set('subtype', pendingSubtype)
    if (pendingCerts.size > 0) params.set('cert', Array.from(pendingCerts).join(','))
    if (pendingUseCase) params.set('use-case', pendingUseCase)
    if (pendingSample) params.set('sample', 'true')
    if (pendingEco) params.set('eco', 'true')
    if (pendingFresh) params.set('fresh', 'true')
    if (currentSort) params.set('sort', currentSort)

    router.push(`${pathname}${params.toString() ? `?${params}` : ''}`)
    onClose()
  }

  const clearAll = () => {
    setPendingMaterials(new Set())
    setPendingForms(new Set())
    setPendingCerts(new Set())
    setPendingUseCase(null)
    setPendingSample(false)
    setPendingEco(false)
    setPendingFresh(false)
    setPendingSubtype(null)
  }

  const totalPending =
    (isPrintDesign
      ? pendingSubtype ? 1 : 0
      : pendingMaterials.size + pendingForms.size) +
    pendingCerts.size +
    (pendingUseCase ? 1 : 0) +
    (pendingSample ? 1 : 0) +
    (pendingEco ? 1 : 0) +
    (pendingFresh ? 1 : 0)

  const toggleSection = (key: string) => {
    setOpenSection((prev) => (prev === key ? '' : key))
  }

  const toggleMaterial = (m: MaterialType) => {
    setPendingMaterials((prev) => {
      const next = new Set(prev)
      if (next.has(m)) next.delete(m)
      else next.add(m)
      return next
    })
  }

  const toggleForm = (f: PackagingForm) => {
    setPendingForms((prev) => {
      const next = new Set(prev)
      if (next.has(f)) next.delete(f)
      else next.add(f)
      return next
    })
  }

  const toggleCert = (id: string) => {
    setPendingCerts((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 sm:hidden" role="dialog" aria-modal="true" aria-label="필터">
      {/* Overlay */}
      <div className="absolute inset-0 bg-slate-900/50" onClick={onClose} />

      {/* Sheet */}
      <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] flex flex-col rounded-t-2xl bg-white">
        {/* Sticky header */}
        <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-2xl border-b border-slate-200 bg-white px-4 py-3">
          <h2 className="text-base font-semibold text-slate-900">필터</h2>
          <button
            onClick={onClose}
            className="p-1 text-slate-500"
            aria-label="닫기"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1">
          {isPrintDesign ? (
            <AccordionSection
              title="유형"
              isOpen={openSection === 'subtype'}
              onToggle={() => toggleSection('subtype')}
              activeCount={pendingSubtype ? 1 : 0}
            >
              {PRINT_DESIGN_SUBTYPES.map((s) => (
                <label
                  key={s}
                  className="flex items-center gap-2.5 py-1.5 text-sm text-slate-700 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={pendingSubtype === s}
                    onChange={() => setPendingSubtype(pendingSubtype === s ? null : s)}
                    className="h-4 w-4 rounded border-slate-300 text-orange-700 focus:ring-orange-700"
                  />
                  {PRINT_DESIGN_SUBTYPE_LABELS[s]}
                </label>
              ))}
            </AccordionSection>
          ) : (
            <>
              <AccordionSection
                title="소재"
                isOpen={openSection === 'material'}
                onToggle={() => toggleSection('material')}
                activeCount={pendingMaterials.size}
              >
                {MATERIAL_TYPES.map((m) => (
                  <label
                    key={m}
                    className="flex items-center gap-2.5 py-1.5 text-sm text-slate-700 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={pendingMaterials.has(m)}
                      onChange={() => toggleMaterial(m)}
                      className="h-4 w-4 rounded border-slate-300 text-orange-700 focus:ring-orange-700"
                    />
                    {MATERIAL_TYPE_LABELS[m]}
                  </label>
                ))}
              </AccordionSection>

              <AccordionSection
                title="형태"
                isOpen={openSection === 'form'}
                onToggle={() => toggleSection('form')}
                activeCount={pendingForms.size}
              >
                {PACKAGING_FORMS.map((f) => (
                  <label
                    key={f}
                    className="flex items-center gap-2.5 py-1.5 text-sm text-slate-700 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={pendingForms.has(f)}
                      onChange={() => toggleForm(f)}
                      className="h-4 w-4 rounded border-slate-300 text-orange-700 focus:ring-orange-700"
                    />
                    {PACKAGING_FORM_LABELS[f]}
                  </label>
                ))}
              </AccordionSection>
            </>
          )}

          <AccordionSection
            title="인증"
            isOpen={openSection === 'cert'}
            onToggle={() => toggleSection('cert')}
            activeCount={pendingCerts.size}
          >
            {CERTIFICATION_TYPES.map((c) => (
              <label
                key={c.id}
                className="flex items-center gap-2.5 py-1.5 text-sm text-slate-700 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={pendingCerts.has(c.id)}
                  onChange={() => toggleCert(c.id)}
                  className="h-4 w-4 rounded border-slate-300 text-orange-700 focus:ring-orange-700"
                />
                {c.label}
              </label>
            ))}
          </AccordionSection>

          {useCaseTags.length > 0 && (
            <AccordionSection
              title="용도"
              isOpen={openSection === 'useCase'}
              onToggle={() => toggleSection('useCase')}
              activeCount={pendingUseCase ? 1 : 0}
            >
              {useCaseTags.map((t) => (
                <label
                  key={t.id}
                  className="flex items-center gap-2.5 py-1.5 text-sm text-slate-700 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={pendingUseCase === t.slug}
                    onChange={() =>
                      setPendingUseCase(pendingUseCase === t.slug ? null : t.slug)
                    }
                    className="h-4 w-4 rounded border-slate-300 text-orange-700 focus:ring-orange-700"
                  />
                  {t.icon} {t.label}
                </label>
              ))}
            </AccordionSection>
          )}

          {/* Sample toggle */}
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <span className="text-sm font-medium text-slate-900">샘플 가능</span>
            <button
              onClick={() => setPendingSample(!pendingSample)}
              role="switch"
              aria-checked={pendingSample}
              className={`relative h-6 w-11 rounded-full transition-colors ${
                pendingSample ? 'bg-orange-700' : 'bg-slate-300'
              }`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  pendingSample ? 'translate-x-[22px]' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {/* Eco toggle */}
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <span className="text-sm font-medium text-slate-900">친환경</span>
            <button
              onClick={() => setPendingEco(!pendingEco)}
              role="switch"
              aria-checked={pendingEco}
              className={`relative h-6 w-11 rounded-full transition-colors ${
                pendingEco ? 'bg-green-700' : 'bg-slate-300'
              }`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  pendingEco ? 'translate-x-[22px]' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {/* Fresh / cold-chain toggle */}
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <span className="text-sm font-medium text-slate-900">신선·콜드체인</span>
            <button
              onClick={() => setPendingFresh(!pendingFresh)}
              role="switch"
              aria-checked={pendingFresh}
              className={`relative h-6 w-11 rounded-full transition-colors ${
                pendingFresh ? 'bg-sky-700' : 'bg-slate-300'
              }`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  pendingFresh ? 'translate-x-[22px]' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {totalPending > 0 && (
            <div className="px-4 py-3">
              <button
                onClick={clearAll}
                className="text-sm text-slate-500 hover:text-slate-700"
              >
                전체 초기화
              </button>
            </div>
          )}
        </div>

        {/* Sticky CTA */}
        <div className="sticky bottom-0 border-t border-slate-200 bg-white p-4">
          <button
            onClick={handleApply}
            className="w-full rounded-lg bg-orange-700 py-3 text-sm font-semibold text-white hover:bg-orange-800 transition-colors"
          >
            {resultCount.toLocaleString()}개 업체 보기
          </button>
        </div>
      </div>
    </div>
  )
}
