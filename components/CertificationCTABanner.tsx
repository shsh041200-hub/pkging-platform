'use client'

import { useState } from 'react'
import { CertificationInputModal } from './CertificationInputModal'

interface Props {
  companyId: string
}

const UI_TEXT = {
  bannerMessage: '인증을 추가하면 검색 결과에서 상위에 노출됩니다',
  bannerCta: '인증 추가하기',
  badgeLabel: '노출 우위',
} as const

export function CertificationCTABanner({ companyId }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className="w-full text-left bg-blue-50 border border-blue-200 rounded-xl p-4 sm:p-5 flex items-start sm:items-center gap-4 hover:bg-blue-100/70 transition-colors group focus:outline-none focus:ring-2 focus:ring-[#FED7AA]/60"
        aria-label={UI_TEXT.bannerCta}
      >
        {/* Icon */}
        <div className="flex-shrink-0 w-10 h-10 sm:w-11 sm:h-11 bg-blue-100 group-hover:bg-blue-200 rounded-lg flex items-center justify-center transition-colors">
          <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-0.5">
            <p className="text-[14px] font-semibold text-blue-900">
              {UI_TEXT.bannerMessage}
            </p>
            <span className="text-[10px] font-bold text-blue-600 bg-blue-100 border border-blue-200 px-1.5 py-0.5 rounded-full leading-none uppercase tracking-wide">
              {UI_TEXT.badgeLabel}
            </span>
          </div>
          <p className="text-[12px] text-blue-700/80 mt-0.5">
            {UI_TEXT.bannerCta} →
          </p>
        </div>

        {/* Arrow */}
        <svg
          className="flex-shrink-0 w-4 h-4 text-blue-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all hidden sm:block"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {isModalOpen && (
        <CertificationInputModal
          companyId={companyId}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  )
}
