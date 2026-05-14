import { type NextRequest, NextResponse } from 'next/server'

const BLOCKED_BOT_RE =
  /GPTBot|ChatGPT-User|CCBot|anthropic-ai|Meta-ExternalAgent|Meta-ExternalFetcher|FacebookBot|facebookexternalhit|Facebot|PetalBot|Bytespider|GoogleOther/i

const PERCENT_ENCODED_RE = /%[0-9A-Fa-f]{2}/

export async function middleware(request: NextRequest) {
  const ua = request.headers.get('user-agent') ?? ''
  if (BLOCKED_BOT_RE.test(ua)) {
    return new NextResponse('Blocked', { status: 403 })
  }

  const { pathname, origin } = request.nextUrl

  // slug_redirects lookup: /companies/{from_slug} → /companies/{to_slug}
  // Covers: old-style numeric-suffix slugs (-NNNN), PIPA slug fixes, HTML-entity
  // amp slugs, domain-polluted slugs, and any future redirects added to the table.
  const companiesMatch = pathname.match(/^\/companies\/([^/]+)\/?$/)
  if (companiesMatch) {
    const rawSegment = companiesMatch[1]
    const slug = PERCENT_ENCODED_RE.test(rawSegment)
      ? decodeURIComponent(rawSegment)
      : rawSegment
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

  // Filter URLs (/?industry=...&material=...) — belt-and-suspenders noindex at HTTP header
  // level alongside the <meta name="robots" content="noindex"> set by generateMetadata.
  // CDN caching is not achievable here: Next.js dynamic SSR (searchParams path) always
  // emits Cache-Control: private,no-cache,no-store and Vercel respects that over middleware.
  if (pathname === '/' && request.nextUrl.search.length > 0) {
    const response = NextResponse.next()
    response.headers.set('X-Robots-Tag', 'noindex, follow')
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
