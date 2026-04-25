'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import {
  MATERIAL_TYPE_LABELS,
  PACKAGING_FORM_LABELS,
  CERTIFICATION_TYPES,
  PRINT_DESIGN_SUBTYPE_LABELS,
  type MaterialType,
  type PackagingForm,
  type PrintDesignSubtype,
  type UseCaseTag,
} from '@/types'

interface ActiveFilterChipsProps {
  isPrintDesign: boolean
  useCaseTags: Pick<UseCaseTag, 'id' | 'slug' | 'label' | 'icon'>[]
}

function CloseIcon() {
  return (
    <svg
      className="h-3 w-3"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={3}
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

const chipClass =
  'flex items-center gap-1 rounded-full border border-orange-200 bg-orange-50 text-orange-700 px-2.5 py-1 text-xs font-medium hover:bg-orange-100 transition-colors'

export function ActiveFilterChips({ isPrintDesign, useCaseTags }: ActiveFilterChipsProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const materials = searchParams.get('material')?.split(',').filter(Boolean) ?? []
  const forms = searchParams.get('form')?.split(',').filter(Boolean) ?? []
  const certs = searchParams.get('cert')?.split(',').filter(Boolean) ?? []
  const useCase = searchParams.get('use-case')
  const sample = searchParams.get('sample') === 'true'
  const subtype = searchParams.get('subtype')

  const hasFilters = isPrintDesign
    ? !!subtype || certs.length > 0 || !!useCase || sample
    : materials.length > 0 || forms.length > 0 || certs.length > 0 || !!useCase || sample

  if (!hasFilters) return null

  const removeParam = (key: string, valueToRemove?: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('page')
    if (valueToRemove) {
      const current = params.get(key)?.split(',').filter(Boolean) ?? []
      const updated = current.filter((v) => v !== valueToRemove)
      if (updated.length > 0) params.set(key, updated.join(','))
      else params.delete(key)
    } else {
      params.delete(key)
    }
    router.push(`${pathname}${params.toString() ? `?${params}` : ''}`)
  }

  const clearAll = () => {
    const params = new URLSearchParams()
    const sort = searchParams.get('sort')
    if (sort) params.set('sort', sort)
    router.push(`${pathname}${params.toString() ? `?${params}` : ''}`)
  }

  return (
    <div className="border-b border-slate-100 bg-white">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-2 flex flex-wrap items-center gap-2">
        {subtype && isPrintDesign && (
          <button onClick={() => removeParam('subtype')} className={chipClass}>
            {PRINT_DESIGN_SUBTYPE_LABELS[subtype as PrintDesignSubtype] ?? subtype}
            <CloseIcon />
          </button>
        )}

        {!isPrintDesign &&
          materials.map((mat) => (
            <button
              key={mat}
              onClick={() => removeParam('material', mat)}
              className={chipClass}
            >
              {MATERIAL_TYPE_LABELS[mat as MaterialType] ?? mat}
              <CloseIcon />
            </button>
          ))}

        {!isPrintDesign &&
          forms.map((form) => (
            <button
              key={form}
              onClick={() => removeParam('form', form)}
              className={chipClass}
            >
              {PACKAGING_FORM_LABELS[form as PackagingForm] ?? form}
              <CloseIcon />
            </button>
          ))}

        {certs.map((certId) => {
          const ct = CERTIFICATION_TYPES.find((c) => c.id === certId)
          if (!ct) return null
          return (
            <button
              key={certId}
              onClick={() => removeParam('cert', certId)}
              className={chipClass}
            >
              {ct.label}
              <CloseIcon />
            </button>
          )
        })}

        {useCase &&
          (() => {
            const tag = useCaseTags.find((t) => t.slug === useCase)
            return (
              <button onClick={() => removeParam('use-case')} className={chipClass}>
                {tag ? `${tag.icon} ${tag.label}` : useCase}
                <CloseIcon />
              </button>
            )
          })()}

        {sample && (
          <button onClick={() => removeParam('sample')} className={chipClass}>
            샘플 가능
            <CloseIcon />
          </button>
        )}

        <button
          onClick={clearAll}
          className="text-xs text-slate-500 hover:text-slate-700 ml-1"
        >
          전체 초기화
        </button>
      </div>
    </div>
  )
}
