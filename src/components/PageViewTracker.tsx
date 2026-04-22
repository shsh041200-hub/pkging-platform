'use client'

import { useEffect } from 'react'
import { captureUTMFromURL } from '@/lib/utm'
import { useTrackEvent } from '@/hooks/useTrackEvent'

export function PageViewTracker() {
  const { track } = useTrackEvent()

  useEffect(() => {
    captureUTMFromURL()
    track('page_view', undefined, { path: window.location.pathname })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return null
}
