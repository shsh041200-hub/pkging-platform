import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

const VALID_REASON_CODES = ['classification_error', 'info_inaccurate', 'delete_request', 'other'] as const
type ReasonCode = typeof VALID_REASON_CODES[number]

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: '잘못된 요청입니다.' }, { status: 400 })
  }

  const {
    vendor_name,
    business_reg_number,
    contact_name,
    contact_email,
    contact_phone,
    reason_code,
    reason_detail,
    vendor_id,
  } = body as Record<string, unknown>

  if (!vendor_name || typeof vendor_name !== 'string' || vendor_name.trim() === '') {
    return NextResponse.json({ error: '업체명을 입력해 주세요.' }, { status: 400 })
  }
  if (!contact_name || typeof contact_name !== 'string' || contact_name.trim() === '') {
    return NextResponse.json({ error: '담당자 이름을 입력해 주세요.' }, { status: 400 })
  }
  if (!contact_email || typeof contact_email !== 'string' || !contact_email.includes('@')) {
    return NextResponse.json({ error: '유효한 이메일을 입력해 주세요.' }, { status: 400 })
  }
  if (!VALID_REASON_CODES.includes(reason_code as ReasonCode)) {
    return NextResponse.json({ error: '이의제기 사유를 선택해 주세요.' }, { status: 400 })
  }

  const supabase = createServiceClient()

  // Generate receipt number: DISP-YYYYMMDD-NNNN
  const { data: receiptData, error: receiptError } = await supabase
    .rpc('generate_dispute_receipt_number')

  if (receiptError) {
    console.error('[disputes] receipt number generation error:', receiptError)
    return NextResponse.json({ error: '접수번호 생성 중 오류가 발생했습니다.' }, { status: 500 })
  }

  const receiptNumber = receiptData as string

  const { error } = await supabase.from('vendor_classification_disputes').insert({
    receipt_number: receiptNumber,
    vendor_id: typeof vendor_id === 'string' && vendor_id.length > 0 ? vendor_id : null,
    vendor_name: (vendor_name as string).trim(),
    business_reg_number: business_reg_number && typeof business_reg_number === 'string' && business_reg_number.trim()
      ? (business_reg_number as string).trim()
      : null,
    contact_name: (contact_name as string).trim(),
    contact_email: (contact_email as string).trim().toLowerCase(),
    contact_phone: contact_phone && typeof contact_phone === 'string' && contact_phone.trim()
      ? (contact_phone as string).trim()
      : null,
    reason_code: reason_code as ReasonCode,
    reason_detail: reason_detail && typeof reason_detail === 'string' && reason_detail.trim()
      ? (reason_detail as string).trim()
      : null,
    channel: 'form',
    status: '접수',
  })

  if (error) {
    console.error('[disputes] insert error:', error)
    return NextResponse.json({ error: '접수 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.' }, { status: 500 })
  }

  // Notify admin — proper email routing pending BE task (PACAA-754 BE scope)
  console.info('[dispute] 이의제기 접수:', {
    receipt_number: receiptNumber,
    vendor_name: (vendor_name as string).trim(),
    reason_code,
    contact_email: (contact_email as string).trim().toLowerCase(),
  })

  return NextResponse.json({ success: true, receipt_number: receiptNumber })
}
