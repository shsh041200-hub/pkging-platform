'use server'

import { createServiceClient } from '@/lib/supabase/service'

type DisputeStatus = '접수' | '검토중' | '정정완료' | '유지'

type UpdateDisputeInput = {
  id: string
  status?: DisputeStatus
  admin_note?: string | null
  after_classification?: string | null
  resolved_by?: string | null
}

export async function updateDispute(input: UpdateDisputeInput) {
  const adminSecret = process.env.ADMIN_SECRET
  if (!adminSecret) {
    return { error: 'Admin not configured.' }
  }

  const { id, status, admin_note, after_classification, resolved_by } = input

  const VALID_STATUSES: DisputeStatus[] = ['접수', '검토중', '정정완료', '유지']
  if (status !== undefined && !VALID_STATUSES.includes(status)) {
    return { error: '유효하지 않은 상태값입니다.' }
  }

  const now = new Date().toISOString()
  const supabase = createServiceClient()

  const { data: current, error: fetchError } = await supabase
    .from('vendor_classification_disputes')
    .select('*')
    .eq('id', id)
    .single()

  if (fetchError || !current) {
    return { error: '이의제기 건을 찾을 수 없습니다.' }
  }

  const updates: Record<string, unknown> = {}
  if (status !== undefined) updates.status = status
  if (admin_note !== undefined) updates.admin_note = admin_note
  if (after_classification !== undefined) updates.after_classification = after_classification
  if (resolved_by !== undefined) updates.resolved_by = resolved_by

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
    return { error: '업데이트 중 오류가 발생했습니다.' }
  }

  // Write classification audit log when classification changes
  if (after_classification && after_classification !== current.before_classification) {
    await supabase.from('vendor_classification_audit').insert({
      vendor_id: current.vendor_id,
      dispute_id: id,
      before_model: current.before_classification,
      after_model: after_classification,
      reason: admin_note ?? `이의제기 처분 (${current.receipt_number})`,
      changed_by: resolved_by ?? 'admin',
    })
  }

  return { dispute: data }
}
