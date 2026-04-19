const FETCH_TIMEOUT_MS = 10_000
const USER_AGENT =
  'Mozilla/5.0 (compatible; PkgingBot/1.0; +https://pkging.kr/bot)'

export interface FetchResult {
  ok: boolean
  html: string
  finalUrl: string
  error?: string
}

export async function fetchHtml(url: string): Promise<FetchResult> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': USER_AGENT, Accept: 'text/html' },
      redirect: 'follow',
    })

    if (!res.ok) {
      return { ok: false, html: '', finalUrl: res.url, error: `HTTP ${res.status}` }
    }

    const contentType = res.headers.get('content-type') ?? ''
    if (!contentType.includes('text/html')) {
      return { ok: false, html: '', finalUrl: res.url, error: 'Not HTML' }
    }

    const html = await res.text()
    return { ok: true, html, finalUrl: res.url }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return { ok: false, html: '', finalUrl: url, error: msg }
  } finally {
    clearTimeout(timer)
  }
}
