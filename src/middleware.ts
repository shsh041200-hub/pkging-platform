import { type NextRequest, NextResponse } from 'next/server'

const BLOCKED_BOT_RE =
  /GPTBot|ChatGPT-User|CCBot|anthropic-ai|Meta-ExternalAgent|Meta-ExternalFetcher|FacebookBot|facebookexternalhit|Facebot|PetalBot|Bytespider|GoogleOther/i

export function middleware(request: NextRequest) {
  const ua = request.headers.get('user-agent') ?? ''
  if (BLOCKED_BOT_RE.test(ua)) {
    return new NextResponse('Blocked', { status: 403 })
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
