'use client'

import { useState } from 'react'

export function FilterAccordion({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="pb-2.5">
      <button
        onClick={() => setOpen(!open)}
        className="text-[11px] text-gray-400 hover:text-gray-600 font-medium flex items-center gap-1 py-1 transition-colors"
      >
        <svg
          className={`w-3 h-3 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
        {open ? '접기' : '소재 / 기능 더보기'}
      </button>
      <div
        className={`grid transition-[grid-template-rows] duration-200 ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
      >
        <div className="overflow-hidden">
          <div className="pt-2 flex flex-col gap-2.5">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
