'use client'

import { useState, useRef, useCallback } from 'react'
import Link from 'next/link'

const DISCLAIMER =
  '본 표시(정보 등록)는 외부 공인 인증기관이 발급한 인증이 아닙니다. Packlinx 자체 등록 절차에 따라 객관적 기준을 만족한 업체에 부여됩니다.'

export function VerifiedTooltip() {
  const [open, setOpen] = useState(false)
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const show = useCallback(() => {
    if (hideTimer.current) clearTimeout(hideTimer.current)
    setOpen(true)
  }, [])

  const hide = useCallback(() => {
    hideTimer.current = setTimeout(() => setOpen(false), 120)
  }, [])

  const toggle = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setOpen((v) => !v)
  }, [])

  return (
    <span className="relative inline-flex items-center">
      {/* Badge */}
      <span
        className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded border bg-emerald-50 text-emerald-700 border-emerald-200 select-none cursor-default"
        onMouseEnter={show}
        onMouseLeave={hide}
        onClick={toggle}
        onTouchEnd={toggle}
        aria-label="정보 등록 업체 — 한정 문구 보기"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setOpen((v) => !v)
          }
        }}
      >
        정보 등록
        <svg
          className="w-3 h-3 text-emerald-500 flex-shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-4M12 8h.01" />
        </svg>
      </span>

      {/* Tooltip */}
      {open && (
        <span
          className="absolute z-50 bottom-full left-0 mb-2 w-72 max-w-[calc(100vw-2rem)] bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-left pointer-events-auto"
          onMouseEnter={show}
          onMouseLeave={hide}
          role="tooltip"
        >
          <p className="text-[12px] text-gray-700 leading-relaxed mb-2">{DISCLAIMER}</p>
          <Link
            href="/faq#what-is-jeongbo-deungrok"
            className="text-[12px] text-emerald-700 font-medium underline underline-offset-2 hover:text-emerald-900 transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            정보 등록 기준 안내
          </Link>
        </span>
      )}
    </span>
  )
}
