'use client'

import { Analytics } from '@vercel/analytics/next'
import type { BeforeSendEvent } from '@vercel/analytics'

function normalizePageviewUrl(event: BeforeSendEvent): BeforeSendEvent | null {
  if (event.type !== 'pageview') return event
  try {
    const url = new URL(event.url, location.origin)
    return { type: 'pageview', url: url.origin + url.pathname }
  } catch {
    return event
  }
}

export function AnalyticsProvider() {
  return <Analytics beforeSend={normalizePageviewUrl} />
}
