import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

const ALLOWED_EVENT_TYPES = new Set([
  'quote_modal_open',
  'quote_submit',
  'kakao_click',
  'website_click',
  'company_view',
])

// In-memory rate limiter: 60 requests / minute per IP
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT = 60
const RATE_WINDOW_MS = 60_000

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)

  if (!entry || now >= entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS })
    return true
  }

  if (entry.count >= RATE_LIMIT) return false

  entry.count++
  return true
}

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    request.headers.get('x-real-ip') ??
    'unknown'

  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' }, { status: 429 })
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: '잘못된 요청 형식입니다.' }, { status: 400 })
  }

  const { eventType, companyId, sessionId, metadata } = body as Record<string, unknown>

  if (typeof eventType !== 'string' || !ALLOWED_EVENT_TYPES.has(eventType)) {
    return NextResponse.json({ error: '유효하지 않은 이벤트 유형입니다.' }, { status: 400 })
  }

  if (typeof sessionId !== 'string' || sessionId.trim() === '') {
    return NextResponse.json({ error: 'sessionId는 필수입니다.' }, { status: 400 })
  }

  if (typeof companyId !== 'string' || companyId.trim() === '') {
    return NextResponse.json({ error: 'companyId는 필수입니다.' }, { status: 400 })
  }

  const safeMetadata =
    metadata !== null && typeof metadata === 'object' && !Array.isArray(metadata)
      ? (metadata as Record<string, unknown>)
      : {}

  const supabase = createServiceClient()

  const { error } = await supabase.from('conversion_events').insert({
    event_type: eventType,
    company_id: companyId,
    session_id: sessionId.trim(),
    referrer_path: request.headers.get('referer') ?? null,
    metadata: safeMetadata,
  })

  if (error) {
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }

  return NextResponse.json({ success: true }, { status: 201 })
}
