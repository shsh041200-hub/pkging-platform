'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback } from 'react'

export type SortOption = {
  value: string
  label: string
}

const SORT_OPTIONS: SortOption[] = [
  { value: '', label: '기본순' },
  { value: 'name_asc', label: '가나다순' },
  { value: 'moq_asc', label: 'MOQ 낮은순' },
  { value: 'est_asc', label: '설립연도 오래된순' },
  { value: 'est_desc', label: '설립연도 최신순' },
]

interface SortDropdownProps {
  currentSort?: string
}

export function SortDropdown({ currentSort = '' }: SortDropdownProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const params = new URLSearchParams(searchParams.toString())
      if (e.target.value) {
        params.set('sort', e.target.value)
      } else {
        params.delete('sort')
      }
      params.delete('page')
      const qs = params.toString()
      router.push(`${pathname}${qs ? `?${qs}` : ''}`)
    },
    [router, pathname, searchParams],
  )

  return (
    <div className="relative flex items-center">
      <svg
        className="absolute left-2.5 w-3.5 h-3.5 text-gray-400 pointer-events-none"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
      </svg>
      <select
        value={currentSort}
        onChange={handleChange}
        aria-label="정렬 기준"
        className="appearance-none pl-8 pr-7 py-1.5 text-[13px] text-gray-500 border border-gray-200 rounded-lg bg-white hover:border-gray-300 focus:outline-none focus:border-gray-300 transition-colors cursor-pointer min-h-[44px] sm:min-h-0"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <svg
        className="absolute right-2 w-3.5 h-3.5 text-gray-400 pointer-events-none"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  )
}
