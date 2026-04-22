'use client'

import { useState } from 'react'
import { QuoteRequestModal } from './QuoteRequestModal'
import { useTrackEvent } from '@/hooks/useTrackEvent'

type Props = {
  companyId: string
  companyName: string
  website: string | null
  kakaoUrl?: string | null
}

export function CompanyDetailCTA({ companyId, companyName, website, kakaoUrl }: Props) {
  const [modalOpen, setModalOpen] = useState(false)
  const { track } = useTrackEvent()

  const handleQuoteOpen = () => {
    track('quote_modal_open', companyId)
    setModalOpen(true)
  }

  const handleQuoteClose = () => setModalOpen(false)

  const handleWebsiteClick = () => {
    track('website_click', companyId, { url: website })
  }

  const handleKakaoClick = () => {
    track('kakao_click', companyId)
  }

  return (
    <>
      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleQuoteOpen}
          className="inline-flex items-center gap-2 bg-[#005EFF] hover:bg-[#0047CC] text-white text-[14px] font-semibold px-5 py-2.5 rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          견적 요청하기
        </button>

        {kakaoUrl && (
          <a
            href={kakaoUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleKakaoClick}
            className="inline-flex items-center gap-2 bg-[#FEE500] hover:bg-[#F5D800] text-[#191919] text-[14px] font-semibold px-4 py-2.5 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3C6.477 3 2 6.477 2 10.8c0 2.7 1.618 5.076 4.07 6.512L5.12 21l4.395-2.31C10.255 18.893 11.115 19 12 19c5.523 0 10-3.477 10-8s-4.477-8-10-8z" />
            </svg>
            카카오톡 문의
          </a>
        )}

        {website && (
          <a
            href={website}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleWebsiteClick}
            className="inline-flex items-center gap-1.5 text-gray-500 hover:text-gray-700 text-[13px] underline underline-offset-4 transition-colors"
          >
            웹사이트 방문하기 →
          </a>
        )}
      </div>

      <QuoteRequestModal
        companyId={companyId}
        companyName={companyName}
        isOpen={modalOpen}
        onClose={handleQuoteClose}
      />
    </>
  )
}
