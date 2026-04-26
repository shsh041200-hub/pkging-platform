'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { captureUTMFromURL } from '@/lib/utm'
import { useTrackEvent } from '@/hooks/useTrackEvent'

export function PageViewTracker() {
  const { track } = useTrackEvent()
  const pathname = usePathname()
  const lastTrackedPath = useRef<string | null>(null)

  useEffect(() => {
    captureUTMFromURL()
    if (pathname === lastTrackedPath.current) return
    lastTrackedPath.current = pathname
    track('page_view', undefined, { path: pathname })
  }, [pathname]) // eslint-disable-line react-hooks/exhaustive-deps

  return null
}
