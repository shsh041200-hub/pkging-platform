import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

const ADMIN_SECRET = process.env.ADMIN_SECRET

function isAuthorized(request: NextRequest): boolean {
  if (!ADMIN_SECRET) return false
  const token = request.headers.get('x-admin-secret') ?? request.nextUrl.searchParams.get('secret')
  return token === ADMIN_SECRET
}

const VALID_STATUSES = ['접수', '검토중', '정정완료', '유지'] as const
type DisputeStatus = typeof VALID_STATUSES[number]

type Props = {
  params: Promise<{ id: string }>
}

export async function PATCH(request: NextRequest, { params }: Props) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: '잘못된 요청입니다.' }, { status: 400 })
  }

  const {
    status,
    admin_note,
    after_classification,
    resolved_by,
  } = body as Record<string, unknown>

  if (status !== undefined && !VALID_STATUSES.includes(status as DisputeStatus)) {
    return NextResponse.json({ error: '유효하지 않은 상태값입니다.' }, { status: 400 })
  }

  const now = new Date().toISOString()
  const supabase = createServiceClient()

  // Fetch current state for audit log
  const { data: current, error: fetchError } = await supabase
    .from('vendor_classification_disputes')
    .select('*')
    .eq('id', id)
    .single()

  if (fetchError || !current) {
    return NextResponse.json({ error: '이의제기 건을 찾을 수 없습니다.' }, { status: 404 })
  }

  const updates: Record<string, unknown> = {}
  if (status !== undefined) updates.status = status
  if (admin_note !== undefined) updates.admin_note = admin_note
  if (after_classification !== undefined) updates.after_classification = after_classification
  if (resolved_by !== undefined) updates.resolved_by = resolved_by

  // Set SLA timestamps
  if (status === '검토중' && !current.first_replied_at) {
    updates.first_replied_at = now
  }
  if ((status === '정정완료' || status === '유지') && !current.resolved_at) {
    updates.resolved_at = now
  }

  const { data, error } = await supabase
    .from('vendor_classification_disputes')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('[admin/disputes] update error:', error)
    return NextResponse.json({ error: '업데이트 중 오류가 발생했습니다.' }, { status: 500 })
  }

  // Write classification audit log when classification changes
  if (after_classification && after_classification !== current.before_classification) {
    await supabase.from('vendor_classification_audit').insert({
      vendor_id: current.vendor_id,
      dispute_id: id,
      before_model: current.before_classification,
      after_model: after_classification,
      reason: admin_note ?? `이의제기 처분 (${current.receipt_number})`,
      changed_by: typeof resolved_by === 'string' ? resolved_by : 'admin',
    })
  }

  return NextResponse.json({ dispute: data })
}
