import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: companyId } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다.' } },
      { status: 401 }
    )
  }

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('company_id')
    .eq('id', user.id)
    .single()

  if (!profile || profile.company_id !== companyId) {
    return NextResponse.json(
      { error: { code: 'FORBIDDEN', message: '본인 업체만 설정할 수 있습니다.' } },
      { status: 403 }
    )
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: { code: 'BAD_REQUEST', message: '잘못된 요청 형식입니다.' } },
      { status: 400 }
    )
  }

  const { enabled } = body as { enabled: unknown }

  if (typeof enabled !== 'boolean') {
    return NextResponse.json(
      { error: { code: 'BAD_REQUEST', message: 'enabled 필드는 boolean이어야 합니다.' } },
      { status: 400 }
    )
  }

  const serviceClient = createServiceClient()

  const { data: company, error: companyErr } = await serviceClient
    .from('companies')
    .select('id')
    .eq('id', companyId)
    .single()

  if (companyErr || !company) {
    return NextResponse.json(
      { error: { code: 'NOT_FOUND', message: '업체를 찾을 수 없습니다.' } },
      { status: 404 }
    )
  }

  const { data: updated, error: updateErr } = await serviceClient
    .from('companies')
    .update({ similar_optout_at: enabled ? new Date().toISOString() : null })
    .eq('id', companyId)
    .select('similar_optout_at')
    .single()

  if (updateErr || !updated) {
    return NextResponse.json(
      { error: { code: 'DB_ERROR', message: '서버 오류가 발생했습니다.' } },
      { status: 500 }
    )
  }

  return NextResponse.json({
    success: true,
    similar_optout_at: updated.similar_optout_at,
  })
}
