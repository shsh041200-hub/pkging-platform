const UTM_STORAGE_KEY = 'pkging_utm'

const UTM_PARAMS = ['utm_source', 'utm_medium', 'utm_campaign'] as const

export type UTMData = {
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
}

export function captureUTMFromURL(): void {
  if (typeof window === 'undefined') return
  const params = new URLSearchParams(window.location.search)
  const hasUTM = UTM_PARAMS.some((k) => params.has(k))
  if (!hasUTM) return

  const data: UTMData = {}
  for (const key of UTM_PARAMS) {
    const val = params.get(key)
    if (val) data[key] = val
  }
  sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(data))
}

export function getStoredUTM(): UTMData {
  if (typeof window === 'undefined') return {}
  try {
    const raw = sessionStorage.getItem(UTM_STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}
