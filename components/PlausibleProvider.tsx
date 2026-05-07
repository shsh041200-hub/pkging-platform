'use client'

import Script from 'next/script'
import { usePathname } from 'next/navigation'

const PLAUSIBLE_DOMAIN = 'packlinx.com'
const SELF_EXCLUSION_KEY = 'plausible_ignore'

function isExcluded(pathname: string): boolean {
  if (pathname.startsWith('/admin')) return true
  if (typeof window !== 'undefined' && localStorage.getItem(SELF_EXCLUSION_KEY) === 'true') return true
  return false
}

export function PlausibleProvider() {
  const pathname = usePathname()

  if (process.env.NODE_ENV !== 'production') return null
  if (isExcluded(pathname)) return null

  return (
    <Script
      defer
      data-domain={PLAUSIBLE_DOMAIN}
      src="https://plausible.io/js/script.js"
      strategy="afterInteractive"
    />
  )
}
