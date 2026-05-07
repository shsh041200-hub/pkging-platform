'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import {
  CERTIFICATION_TYPES,
  PRINT_DESIGN_SUBTYPES,
  PRINT_DESIGN_SUBTYPE_LABELS,
  type PrintDesignSubtype,
} from '@/types'

interface ServiceMobileFilterSheetProps {
  isOpen: boolean
  onClose: () => void
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

export function ServiceMobileFilterSheet({
  isOpen,
  onClose,
  resultCount,
}: ServiceMobileFilterSheetProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [pendingSubtype, setPendingSubtype] = useState<PrintDesignSubtype | null>(null)
  const [pendingCerts, setPendingCerts] = useState<Set<string>>(new Set())
  const [pendingSample, setPendingSample] = useState(false)
  const [openSection, setOpenSection] = useState<string>('subtype')

  useEffect(() => {
    if (!isOpen) return
    setPendingSubtype((searchParams.get('subtype') as PrintDesignSubtype | null) ?? null)
    setPendingCerts(new Set(searchParams.get('cert')?.split(',').filter(Boolean) ?? []))
    setPendingSample(searchParams.get('sample') === 'true')
    setOpenSection('subtype')
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
    if (pendingSubtype) params.set('subtype', pendingSubtype)
    if (pendingCerts.size > 0) params.set('cert', Array.from(pendingCerts).join(','))
    if (pendingSample) params.set('sample', 'true')
    if (currentSort) params.set('sort', currentSort)
    router.push(`${pathname}${params.toString() ? `?${params}` : ''}`)
    onClose()
  }

  const clearAll = () => {
    setPendingSubtype(null)
    setPendingCerts(new Set())
    setPendingSample(false)
  }

  const totalPending = (pendingSubtype ? 1 : 0) + pendingCerts.size + (pendingSample ? 1 : 0)

  const toggleSection = (key: string) => {
    setOpenSection((prev) => (prev === key ? '' : key))
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
      <div className="absolute inset-0 bg-slate-900/50" onClick={onClose} />
      <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] flex flex-col rounded-t-2xl bg-white">
        <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-2xl border-b border-slate-200 bg-white px-4 py-3">
          <h2 className="text-base font-semibold text-slate-900">필터</h2>
          <button onClick={onClose} className="p-1 text-slate-500" aria-label="닫기">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          <AccordionSection
            title="유형"
            isOpen={openSection === 'subtype'}
            onToggle={() => toggleSection('subtype')}
            activeCount={pendingSubtype ? 1 : 0}
          >
            {PRINT_DESIGN_SUBTYPES.map((s) => (
              <label key={s} className="flex items-center gap-2.5 py-1.5 text-sm text-slate-700 cursor-pointer">
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

          <AccordionSection
            title="인증"
            isOpen={openSection === 'cert'}
            onToggle={() => toggleSection('cert')}
            activeCount={pendingCerts.size}
          >
            {CERTIFICATION_TYPES.map((c) => (
              <label key={c.id} className="flex items-center gap-2.5 py-1.5 text-sm text-slate-700 cursor-pointer">
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

          {totalPending > 0 && (
            <div className="px-4 py-3">
              <button onClick={clearAll} className="text-sm text-slate-500 hover:text-slate-700">
                전체 초기화
              </button>
            </div>
          )}
        </div>

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
