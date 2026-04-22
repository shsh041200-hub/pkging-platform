'use client'

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
  const track = (eventType: string, companyId: string, metadata?: Record<string, unknown>) => {
    try {
      const sessionId = getOrCreateSessionId()
      navigator.sendBeacon(
        '/api/events',
        JSON.stringify({ eventType, companyId, sessionId, metadata }),
      )
    } catch {
      // sendBeacon failures are non-fatal
    }
  }
  return { track }
}
