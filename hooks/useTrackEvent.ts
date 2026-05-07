'use client'

import { getStoredUTM } from '@/lib/utm'

function getOrCreateSessionId(): string {
  const key = 'pkging_session_id'
  let id = localStorage.getItem(key)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(key, id)
  }
  return id
}

export function useTrackEvent() {
  const track = (eventType: string, companyId?: string, metadata?: Record<string, unknown>) => {
    try {
      const sessionId = getOrCreateSessionId()
      const utm = getStoredUTM()
      navigator.sendBeacon(
        '/api/events',
        JSON.stringify({
          eventType,
          ...(companyId && { companyId }),
          sessionId,
          metadata,
          ...(utm.utm_source && { utmSource: utm.utm_source }),
          ...(utm.utm_medium && { utmMedium: utm.utm_medium }),
          ...(utm.utm_campaign && { utmCampaign: utm.utm_campaign }),
        }),
      )
    } catch {
      // sendBeacon failures are non-fatal
    }
  }
  return { track }
}
