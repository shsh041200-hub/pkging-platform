'use client'

import { useTrackEvent } from '@/hooks/useTrackEvent'

type Props = {
  companyId: string
  phone: string | null
}

export function MobileStickyBar({ companyId, phone }: Props) {
  const { track } = useTrackEvent()

  const handlePhoneClick = () => {
    track('phone_click', companyId, { phone })
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 h-14 md:hidden bg-white border-t border-[#E5E7EB] shadow-[0_-2px_8px_rgba(0,0,0,0.08)] z-40 flex items-center px-3 gap-2">
      {phone && (
        <a
          href={`tel:${phone}`}
          onClick={handlePhoneClick}
          className="w-10 h-10 flex items-center justify-center border border-gray-200 rounded-lg text-gray-500 hover:text-gray-700 hover:border-gray-300 flex-shrink-0 transition-colors"
          aria-label="전화 연결"
        >
          <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
        </a>
      )}
    </div>
  )
}
