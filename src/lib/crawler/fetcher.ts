const FETCH_TIMEOUT_MS = 10_000
const USER_AGENT = 'Mozilla/5.0 (compatible; PkgingBot/1.0; +https://pkging.kr/bot)'
const BOT_NAME = 'pkgingbot'

export interface FetchResult {
  ok: boolean
  html: string
  finalUrl: string
  error?: string
}

async function isAllowedByRobots(url: string): Promise<boolean> {
  try {
    const origin = new URL(url).origin
    const robotsUrl = `${origin}/robots.txt`
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

    let robotsTxt: string
    try {
      const res = await fetch(robotsUrl, {
        signal: controller.signal,
        headers: { 'User-Agent': USER_AGENT },
      })
      if (!res.ok) return true // no robots.txt → allowed
      robotsTxt = await res.text()
    } finally {
      clearTimeout(timer)
    }

    const path = new URL(url).pathname || '/'
    return parseRobotsAllowed(robotsTxt, BOT_NAME, path)
  } catch {
    return true // on error, assume allowed
  }
}

function parseRobotsAllowed(robotsTxt: string, botName: string, path: string): boolean {
  const lines = robotsTxt.split(/\r?\n/)
  let activeAgent = false
  let applicable = false
  let allowed = true

  for (const raw of lines) {
    const line = raw.split('#')[0].trim()
    if (!line) continue

    const [field, ...rest] = line.split(':')
    const key = field.trim().toLowerCase()
    const value = rest.join(':').trim()

    if (key === 'user-agent') {
      activeAgent = value === '*' || value.toLowerCase() === botName
      if (activeAgent) applicable = true
    } else if (activeAgent && key === 'disallow') {
      if (value === '' || value === '/') {
        // empty disallow = allow all; '/' = disallow all
        if (value === '/') allowed = false
      } else if (path.startsWith(value)) {
        allowed = false
      }
    } else if (activeAgent && key === 'allow') {
      if (value && path.startsWith(value)) {
        allowed = true
      }
    }
  }

  return applicable ? allowed : true
}

export async function fetchHtml(url: string): Promise<FetchResult> {
  const allowed = await isAllowedByRobots(url)
  if (!allowed) {
    return { ok: false, html: '', finalUrl: url, error: 'Disallowed by robots.txt' }
  }

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
