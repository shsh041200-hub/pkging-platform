'use client'

import { useEffect } from 'react'
import { useTrackEvent } from '@/hooks/useTrackEvent'

export function CompanyViewTracker({ companyId }: { companyId: string }) {
  const { track } = useTrackEvent()

  useEffect(() => {
    track('company_view', companyId)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId])

  return null
}
