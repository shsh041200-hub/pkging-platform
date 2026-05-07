'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { BANNER_DISMISS_KEY, isBannerWindowActive } from '@/lib/terms-notice-window'

const COPY = {
  text: '[안내] 2026년 5월 2일부터 이용약관과 개인정보처리방침이 개정됩니다. 주요 변경: "비슷한 업체" 자동 노출 기능 관련 조항 신설.',
  linkLabel: '자세히 보기 →',
  closeLabel: '닫기',
} as const

export function TermsNoticeBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!isBannerWindowActive()) return
    if (localStorage.getItem(BANNER_DISMISS_KEY)) return
    setVisible(true)
  }, [])

  const handleDismiss = () => {
    localStorage.setItem(BANNER_DISMISS_KEY, '1')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      role="alert"
      aria-label="이용약관 개정 안내"
      className="bg-[#0F172A] border-b border-white/[0.08]"
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-3 flex items-start sm:items-center justify-between gap-4">
        <p className="text-[13px] leading-snug text-slate-200">
          {COPY.text}{' '}
          <Link
            href="/terms#변경이력"
            className="text-white font-semibold underline underline-offset-2 hover:text-slate-300 transition-colors whitespace-nowrap"
          >
            {COPY.linkLabel}
          </Link>
        </p>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label={COPY.closeLabel}
          className="flex-shrink-0 text-slate-400 hover:text-white transition-colors p-1 rounded"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  )
}
