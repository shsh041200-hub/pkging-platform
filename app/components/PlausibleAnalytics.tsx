'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'

// Fires a manual pageview on every SPA navigation.
// Skips the initial render because the Plausible script already
// auto-fires a pageview when the page first loads.
export default function PlausibleAnalytics() {
  const pathname = usePathname()
  const isFirst = useRef(true)

  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false
      return
    }
    window.plausible?.('pageview')
  }, [pathname])

  return null
}
