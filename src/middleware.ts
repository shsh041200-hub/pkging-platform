import { type NextRequest, NextResponse } from 'next/server'

const BLOCKED_BOT_RE =
  /GPTBot|ChatGPT-User|CCBot|anthropic-ai|Meta-ExternalAgent|Meta-ExternalFetcher|FacebookBot|facebookexternalhit|Facebot|PetalBot|Bytespider|GoogleOther/i

const PERCENT_ENCODED_RE = /%[0-9A-Fa-f]{2}/

export function middleware(request: NextRequest) {
  const ua = request.headers.get('user-agent') ?? ''
  if (BLOCKED_BOT_RE.test(ua)) {
    return new NextResponse('Blocked', { status: 403 })
  }

  const { pathname, search, origin } = request.nextUrl
  if (PERCENT_ENCODED_RE.test(pathname)) {
    const decoded = decodeURIComponent(pathname)
    // Set Location header directly — NextResponse.redirect() pipes through new URL()
    // which re-encodes Korean characters. Raw bytes in Location header are correct per RFC 3986 §3.3.
    const response = new NextResponse(null, { status: 301 })
    response.headers.set('Location', origin + decoded + search)
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
