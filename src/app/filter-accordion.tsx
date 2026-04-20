'use client'

import { useState } from 'react'

export function FilterAccordion({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="pb-2">
      <button
        onClick={() => setOpen(!open)}
        className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1"
      >
        <svg
          className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
        소재 / 기능 세부 필터
      </button>
      {open && (
        <div className="pt-2 flex flex-wrap gap-2">
          {children}
        </div>
      )}
    </div>
  )
}
