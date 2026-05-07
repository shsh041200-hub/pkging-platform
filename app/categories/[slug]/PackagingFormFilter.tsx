'use client'

import { useState } from 'react'
import Link from 'next/link'
import { PACKAGING_FORMS, PACKAGING_FORM_LABELS, type PackagingForm } from '@/types'

const INITIAL_VISIBLE = 10

interface Props {
  selectedForms: PackagingForm[]
  formUrls: Record<string, string>
}

export function PackagingFormFilter({ selectedForms, formUrls }: Props) {
  const [expanded, setExpanded] = useState(selectedForms.length > 0)
  const hiddenCount = PACKAGING_FORMS.length - INITIAL_VISIBLE
  const visibleForms = expanded ? PACKAGING_FORMS : PACKAGING_FORMS.slice(0, INITIAL_VISIBLE)

  return (
    <div className="flex gap-1.5 py-2.5 flex-wrap items-center">
      <span className="flex-shrink-0 text-[10px] font-semibold text-gray-300 uppercase tracking-widest self-center mr-1">
        형태
      </span>
      {visibleForms.map((pf) => {
        const isActive = selectedForms.includes(pf)
        return (
          <Link
            key={pf}
            href={formUrls[pf] ?? '#'}
            className={`flex-shrink-0 px-2.5 py-1.5 rounded text-[11px] font-medium transition-all border ${
              isActive
                ? 'bg-[#7C3AED] text-white border-[#7C3AED]'
                : 'text-gray-500 border-gray-200 hover:text-gray-700 hover:border-gray-300 bg-white'
            }`}
          >
            {PACKAGING_FORM_LABELS[pf]}
          </Link>
        )
      })}
      {!expanded && hiddenCount > 0 && (
        <button
          onClick={() => setExpanded(true)}
          className="flex-shrink-0 text-[11px] text-gray-400 hover:text-gray-600 font-medium flex items-center gap-1 transition-colors"
        >
          <svg
            className="w-3 h-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
          +{hiddenCount} 더보기
        </button>
      )}
      {expanded && PACKAGING_FORMS.length > INITIAL_VISIBLE && (
        <button
          onClick={() => setExpanded(false)}
          className="flex-shrink-0 text-[11px] text-gray-400 hover:text-gray-600 font-medium flex items-center gap-1 transition-colors"
        >
          <svg
            className="w-3 h-3 rotate-180"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
          접기
        </button>
      )}
    </div>
  )
}
