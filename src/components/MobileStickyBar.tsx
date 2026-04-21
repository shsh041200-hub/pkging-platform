'use client'

import { useState } from 'react'
import { QuoteRequestModal } from './QuoteRequestModal'

type Props = {
  companyId: string
  companyName: string
  phone: string | null
}

export function MobileStickyBar({ companyId, companyName, phone }: Props) {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 h-14 md:hidden bg-white border-t border-[#E5E7EB] shadow-[0_-2px_8px_rgba(0,0,0,0.08)] z-40 flex items-center px-3 gap-2">
        {phone && (
          <a
            href={`tel:${phone}`}
            className="w-10 h-10 flex items-center justify-center border border-gray-200 rounded-lg text-gray-500 hover:text-gray-700 hover:border-gray-300 flex-shrink-0 transition-colors"
            aria-label="전화 연결"
          >
            <svg className="w-4.5 h-4.5 w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </a>
        )}

        <a
          href="https://pf.kakao.com/_placeholder"
          target="_blank"
          rel="noopener noreferrer"
          className="w-10 h-10 flex items-center justify-center bg-[#FEE500] rounded-lg flex-shrink-0 hover:opacity-90 transition-opacity"
          aria-label="카카오톡 상담"
        >
          <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="#191919">
            <path d="M12 3C6.477 3 2 6.82 2 11.5c0 2.985 1.79 5.62 4.5 7.12L5.5 21l3.14-1.56C9.54 19.63 10.75 19.75 12 19.75c5.523 0 10-3.82 10-8.5S17.523 3 12 3z"/>
          </svg>
        </a>

        <button
          onClick={() => setModalOpen(true)}
          className="flex-1 bg-[#005EFF] hover:bg-[#0047CC] text-white text-[14px] font-semibold rounded-lg h-10 transition-colors"
        >
          견적 요청하기
        </button>
      </div>

      <QuoteRequestModal
        companyId={companyId}
        companyName={companyName}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  )
}
