import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const PHONE_RE = /^0\d{1,2}-?\d{3,4}-?\d{4}$/

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: '잘못된 요청 형식입니다.' }, { status: 400 })
  }

  const {
    companyId,
    contactName,
    phone,
    packagingType,
    quantity,
    companyName,
    details,
    desiredDelivery,
  } = body as Record<string, string | undefined>

  if (!companyId || !contactName?.trim() || !phone?.trim() || !packagingType?.trim() || !quantity?.trim()) {
    return NextResponse.json(
      { error: '필수 항목을 모두 입력해주세요. (담당자명, 연락처, 포장 유형, 예상 수량)' },
      { status: 400 },
    )
  }

  const normalizedPhone = phone.replace(/\s/g, '')
  if (!PHONE_RE.test(normalizedPhone)) {
    return NextResponse.json(
      { error: '올바른 전화번호 형식을 입력해주세요. (예: 010-0000-0000)' },
      { status: 400 },
    )
  }

  const supabase = await createClient()

  const { data: company } = await supabase
    .from('companies')
    .select('id')
    .eq('id', companyId)
    .single()

  if (!company) {
    return NextResponse.json({ error: '존재하지 않는 업체입니다.' }, { status: 400 })
  }

  const { data, error } = await supabase.from('quote_requests').insert({
    company_id: companyId,
    contact_name: contactName.trim(),
    contact_phone: normalizedPhone,
    packaging_type: packagingType.trim(),
    estimated_quantity: quantity.trim(),
    company_name: companyName?.trim() || null,
    detail_request: details?.trim()?.slice(0, 500) || null,
    desired_deadline: desiredDelivery || null,
  }).select('id').single()

  if (error) {
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }

  return NextResponse.json({ success: true, id: data.id }, { status: 201 })
}
