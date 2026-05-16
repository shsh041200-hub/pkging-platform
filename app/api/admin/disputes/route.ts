import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

const ADMIN_SECRET = process.env.ADMIN_SECRET

function isAuthorized(request: NextRequest): boolean {
  if (!ADMIN_SECRET) return false
  const token = request.headers.get('x-admin-secret') ?? request.nextUrl.searchParams.get('secret')
  return token === ADMIN_SECRET
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const status = request.nextUrl.searchParams.get('status')
  const page = parseInt(request.nextUrl.searchParams.get('page') ?? '1', 10)
  const limit = 20
  const offset = (page - 1) * limit

  const supabase = createServiceClient()
  let query = supabase
    .from('vendor_classification_disputes')
    .select('*', { count: 'exact' })
    .order('submitted_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (status && status !== 'all') {
    query = query.eq('status', status)
  }

  const { data, error, count } = await query

  if (error) {
    console.error('[admin/disputes] fetch error:', error)
    return NextResponse.json({ error: '조회 중 오류가 발생했습니다.' }, { status: 500 })
  }

  return NextResponse.json({ disputes: data, total: count ?? 0, page, limit })
}
