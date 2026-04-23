import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 })

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'Forbidden' } }, { status: 403 })
  }

  const body: unknown = await request.json()
  if (typeof body !== 'object' || body === null) {
    return NextResponse.json({ error: { code: 'BAD_REQUEST', message: 'Request body must be a JSON object' } }, { status: 400 })
  }

  const raw = body as Record<string, unknown>

  if (!('use_case_tags' in raw)) {
    return NextResponse.json({ error: { code: 'BAD_REQUEST', message: 'use_case_tags field is required' } }, { status: 400 })
  }

  const tags = raw.use_case_tags
  if (!Array.isArray(tags)) {
    return NextResponse.json({ error: { code: 'BAD_REQUEST', message: 'use_case_tags must be an array of strings' } }, { status: 400 })
  }
  for (const t of tags) {
    if (typeof t !== 'string' || t.trim() === '') {
      return NextResponse.json({ error: { code: 'BAD_REQUEST', message: 'Each use_case_tag must be a non-empty string' } }, { status: 400 })
    }
  }

  const serviceClient = createServiceClient()
  const { data, error } = await serviceClient
    .from('companies')
    .update({ use_case_tags: tags })
    .eq('id', id)
    .select('id, slug, use_case_tags')
    .single()

  if (error) {
    return NextResponse.json({ error: { code: 'DB_ERROR', message: error.message } }, { status: 500 })
  }

  return NextResponse.json({ success: true, use_case_tags: data.use_case_tags })
}
