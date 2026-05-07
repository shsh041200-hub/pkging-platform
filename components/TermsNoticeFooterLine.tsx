'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { isFooterNoticeActive } from '@/lib/terms-notice-window'

interface TermsNoticeFooterLineProps {
  theme?: 'dark' | 'light'
}

const COPY = {
  text: '※ 이용약관·개인정보처리방침이 2026년 5월 2일부터 개정 시행됩니다.',
  linkLabel: '자세히 →',
} as const

export function TermsNoticeFooterLine({ theme = 'dark' }: TermsNoticeFooterLineProps) {
  const [active, setActive] = useState(false)

  useEffect(() => {
    setActive(isFooterNoticeActive())
  }, [])

  if (!active) return null

  const isDark = theme === 'dark'

  return (
    <div
      className={`w-full py-3 text-center border-b ${
        isDark
          ? 'border-white/[0.06]'
          : 'border-slate-100'
      }`}
    >
      <p className={`text-[12px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
        {COPY.text}{' '}
        <Link
          href="/terms#변경이력"
          className={`font-medium underline underline-offset-2 transition-colors ${
            isDark
              ? 'text-slate-300 hover:text-white'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {COPY.linkLabel}
        </Link>
      </p>
    </div>
  )
}
