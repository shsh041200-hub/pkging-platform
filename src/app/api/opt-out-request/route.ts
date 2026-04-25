import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

const VALID_REQUEST_TYPES = ['delete', 'update', 'takedown'] as const
type RequestType = typeof VALID_REQUEST_TYPES[number]

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: '잘못된 요청입니다.' }, { status: 400 })
  }

  const { company_name, request_type, requester_name, requester_email, reason, takedown_url } = body as Record<string, unknown>

  if (!company_name || typeof company_name !== 'string' || company_name.trim() === '') {
    return NextResponse.json({ error: '업체명을 입력해 주세요.' }, { status: 400 })
  }
  if (!VALID_REQUEST_TYPES.includes(request_type as RequestType)) {
    return NextResponse.json({ error: '요청 유형을 선택해 주세요.' }, { status: 400 })
  }
  if (!requester_name || typeof requester_name !== 'string' || requester_name.trim() === '') {
    return NextResponse.json({ error: '요청자 이름을 입력해 주세요.' }, { status: 400 })
  }
  if (!requester_email || typeof requester_email !== 'string' || !requester_email.includes('@')) {
    return NextResponse.json({ error: '유효한 이메일을 입력해 주세요.' }, { status: 400 })
  }

  // takedown requires the URL of the allegedly infringing content
  if (request_type === 'takedown') {
    if (!takedown_url || typeof takedown_url !== 'string' || takedown_url.trim() === '') {
      return NextResponse.json({ error: '신고 대상 URL을 입력해 주세요.' }, { status: 400 })
    }
  }

  const supabase = createServiceClient()
  const { error } = await supabase.from('opt_out_requests').insert({
    company_name: company_name.trim(),
    request_type,
    requester_name: (requester_name as string).trim(),
    requester_email: (requester_email as string).trim().toLowerCase(),
    reason: reason && typeof reason === 'string' && reason.trim() ? reason.trim() : null,
    takedown_url: request_type === 'takedown' && typeof takedown_url === 'string' ? takedown_url.trim() : null,
  })

  if (error) {
    console.error('opt_out_requests insert error:', error)
    return NextResponse.json({ error: '요청 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.' }, { status: 500 })
  }

  // Notify legal team on takedown submissions — proper email routing pending KOR-540
  if (request_type === 'takedown') {
    console.warn('[TAKEDOWN] 권리침해 신고 접수 → rpdla041200@gmail.com 전달 필요', {
      company_name: (company_name as string).trim(),
      requester_email: (requester_email as string).trim().toLowerCase(),
      takedown_url: typeof takedown_url === 'string' ? takedown_url.trim() : null,
    })
  }

  return NextResponse.json({ success: true })
}
