import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: '잘못된 요청입니다.' }, { status: 400 })
  }

  const { company_name, request_type, requester_name, requester_email, reason } = body as Record<string, unknown>

  if (!company_name || typeof company_name !== 'string' || company_name.trim() === '') {
    return NextResponse.json({ error: '업체명을 입력해 주세요.' }, { status: 400 })
  }
  if (request_type !== 'delete' && request_type !== 'update') {
    return NextResponse.json({ error: '요청 유형을 선택해 주세요.' }, { status: 400 })
  }
  if (!requester_name || typeof requester_name !== 'string' || requester_name.trim() === '') {
    return NextResponse.json({ error: '요청자 이름을 입력해 주세요.' }, { status: 400 })
  }
  if (!requester_email || typeof requester_email !== 'string' || !requester_email.includes('@')) {
    return NextResponse.json({ error: '유효한 이메일을 입력해 주세요.' }, { status: 400 })
  }

  const supabase = createServiceClient()
  const { error } = await supabase.from('opt_out_requests').insert({
    company_name: company_name.trim(),
    request_type,
    requester_name: (requester_name as string).trim(),
    requester_email: (requester_email as string).trim().toLowerCase(),
    reason: reason && typeof reason === 'string' && reason.trim() ? reason.trim() : null,
  })

  if (error) {
    console.error('opt_out_requests insert error:', error)
    return NextResponse.json({ error: '요청 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
