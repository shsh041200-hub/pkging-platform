'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { QuoteRequestModal } from './QuoteRequestModal'

type Props = {
  companyId: string
  companyName: string
  website: string | null
}

export function CompanyDetailCTA({ companyId, companyName, website }: Props) {
  const [modalOpen, setModalOpen] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (searchParams.get('quote') === 'true') {
      setModalOpen(true)
    }
  }, [searchParams])

  const handleClose = () => {
    setModalOpen(false)
    const params = new URLSearchParams(searchParams.toString())
    params.delete('quote')
    const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname
    router.replace(newUrl)
  }

  return (
    <>
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 bg-[#005EFF] hover:bg-[#0047CC] text-white text-[15px] font-semibold px-6 py-3 rounded-lg transition-colors"
        >
          견적 요청하기
        </button>

        <a
          href="https://pf.kakao.com/_placeholder"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-[#FEE500] text-[#191919] text-[14px] font-semibold px-5 py-2.5 rounded-lg transition-opacity hover:opacity-90"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 3C6.477 3 2 6.82 2 11.5c0 2.985 1.79 5.62 4.5 7.12L5.5 21l3.14-1.56C9.54 19.63 10.75 19.75 12 19.75c5.523 0 10-3.82 10-8.5S17.523 3 12 3z"/>
          </svg>
          카카오톡 상담
        </a>

        {website && (
          <a
            href={website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-gray-600 hover:text-gray-800 text-[13px] underline underline-offset-4 transition-colors"
          >
            웹사이트 방문하기 →
          </a>
        )}
      </div>

      <QuoteRequestModal
        companyId={companyId}
        companyName={companyName}
        isOpen={modalOpen}
        onClose={handleClose}
      />
    </>
  )
}
