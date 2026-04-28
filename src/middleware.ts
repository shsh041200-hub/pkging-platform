import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const BLOCKED_BOT_PATTERNS = [
  'GPTBot',
  'ChatGPT-User',
  'CCBot',
  'anthropic-ai',
  'Meta-ExternalAgent',
  'Meta-ExternalFetcher',
  'FacebookBot',
  'facebookexternalhit',
  'Facebot',
  'PetalBot',
  'Bytespider',
]

const botRegex = new RegExp(BLOCKED_BOT_PATTERNS.join('|'), 'i')

export function middleware(request: NextRequest) {
  const ua = request.headers.get('user-agent') ?? ''
  if (botRegex.test(ua)) {
    return new NextResponse(null, { status: 403 })
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico|.*\\.svg|.*\\.png|.*\\.jpg|.*\\.woff2).*)'],
}
