'use client'

import { useTrackEvent } from '@/hooks/useTrackEvent'

type Props = {
  companyId: string
  companyName: string
  website: string | null
  iconUrl?: string | null
  kakaoUrl?: string | null
}

export function CompanyDetailCTA({ companyId, website, kakaoUrl }: Props) {
  const { track } = useTrackEvent()

  const handleWebsiteClick = () => {
    track('website_click', companyId, { url: website })
  }

  const handleKakaoClick = () => {
    track('kakao_click', companyId)
  }

  return (
    <div className="flex flex-col gap-2">
      {website && (
        <a
          href={website}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleWebsiteClick}
          className="flex items-center justify-center gap-2 w-full bg-[#005EFF] hover:bg-[#0047CC] text-white text-[15px] font-semibold py-3.5 rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          웹사이트 방문하기
        </a>
      )}
      {kakaoUrl && (
        <a
          href={kakaoUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleKakaoClick}
          className="flex items-center justify-center gap-2 w-full bg-[#FEE500] hover:bg-[#E6CF00] text-[#3C1E1E] text-[15px] font-semibold py-3.5 rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 3C6.477 3 2 6.477 2 10.8c0 2.7 1.618 5.076 4.07 6.512L5.12 21l4.395-2.31C10.255 18.893 11.115 19 12 19c5.523 0 10-3.477 10-8s-4.477-8-10-8z" />
          </svg>
          카카오톡 문의
        </a>
      )}
    </div>
  )
}
