import { type NextRequest, NextResponse } from 'next/server'

const BLOCKED_BOT_RE =
  /GPTBot|ChatGPT-User|CCBot|anthropic-ai|Meta-ExternalAgent|Meta-ExternalFetcher|FacebookBot|facebookexternalhit|Facebot|PetalBot|Bytespider|GoogleOther/i

const PERCENT_ENCODED_RE = /%[0-9A-Fa-f]{2}/

// Old-style vendor slugs have a numeric suffix added during the manual-batch import
// (e.g. 업체이름-6283). Only these slugs need a slug_redirects lookup; canonical slugs
// skip the DB call entirely.
const OLD_SLUG_SUFFIX_RE = /-\d{3,}$/

export async function middleware(request: NextRequest) {
  const ua = request.headers.get('user-agent') ?? ''
  if (BLOCKED_BOT_RE.test(ua)) {
    return new NextResponse('Blocked', { status: 403 })
  }

  const { pathname, origin } = request.nextUrl

  // slug_redirects lookup: /companies/{from_slug} → /companies/{to_slug}
  // Handles percent-encoded Korean slugs in one pass to avoid a double-redirect.
  const companiesMatch = pathname.match(/^\/companies\/([^/]+)\/?$/)
  if (companiesMatch) {
    const rawSegment = companiesMatch[1]
    const slug = PERCENT_ENCODED_RE.test(rawSegment)
      ? decodeURIComponent(rawSegment)
      : rawSegment
    if (OLD_SLUG_SUFFIX_RE.test(slug)) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 3000)
      try {
        const res = await fetch(
          `${supabaseUrl}/rest/v1/slug_redirects?from_slug=eq.${encodeURIComponent(slug)}&select=to_slug,status_code&limit=1`,
          {
            headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` },
            signal: controller.signal,
          }
        )
        clearTimeout(timeoutId)
        if (res.ok) {
          const rows = (await res.json()) as Array<{ to_slug: string; status_code: number }>
          if (rows.length > 0) {
            const { to_slug, status_code } = rows[0]
            const redirectStatus: 301 | 308 = status_code === 308 ? 308 : 301
            // Percent-encode each path segment so Vercel/CDN edge doesn't strip the Location header.
            const encodedSlug = to_slug.split('/').map(encodeURIComponent).join('/')
            const response = new NextResponse(null, { status: redirectStatus })
            response.headers.set('Location', `${origin}/companies/${encodedSlug}`)
            return response
          }
        }
      } catch (err) {
        clearTimeout(timeoutId)
        // Supabase unreachable or timed out — fall through so Next.js can serve the 404 page.
        console.error('[slug_redirects] fetch failed, falling through:', err)
      }
    }
  }

  // /compare?ids=A,B (2-way only) → 301 → /compare/A-vs-B (alphabetical canonical)
  // 3-way stays on /compare?ids=... to preserve existing behaviour until CTO decides on 3-way slug shape.
  if (pathname === '/compare') {
    const idsParam = request.nextUrl.searchParams.get('ids')
    if (idsParam) {
      const ids = idsParam
        .split(',')
        .map((s) => decodeURIComponent(s.trim()))
        .filter(Boolean)
      if (ids.length === 2) {
        const [a, b] = ids.slice().sort()
        const encodedA = a.split('/').map(encodeURIComponent).join('/')
        const encodedB = b.split('/').map(encodeURIComponent).join('/')
        const response = new NextResponse(null, { status: 301 })
        response.headers.set('Location', `${origin}/compare/${encodedA}-vs-${encodedB}`)
        return response
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
