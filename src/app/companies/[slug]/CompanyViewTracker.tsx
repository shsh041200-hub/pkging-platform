'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useTrackEvent } from '@/hooks/useTrackEvent'
import { captureUTMFromURL } from '@/lib/utm'

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content'] as const

export function CompanyViewTracker({ companyId }: { companyId: string }) {
  const { track } = useTrackEvent()
  const searchParams = useSearchParams()

  useEffect(() => {
    captureUTMFromURL()

    const utmMetadata: Record<string, string> = {}
    for (const key of UTM_KEYS) {
      const val = searchParams.get(key)
      if (val) utmMetadata[key] = val
    }

    track(
      'company_view',
      companyId,
      Object.keys(utmMetadata).length > 0 ? { utm: utmMetadata } : undefined,
    )
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId])

  return null
}
