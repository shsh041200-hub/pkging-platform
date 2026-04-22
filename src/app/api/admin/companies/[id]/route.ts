import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { DELIVERY_REGIONS } from '@/types'

const VALID_REGIONS = new Set<string>(DELIVERY_REGIONS)

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body: unknown = await request.json()
  if (typeof body !== 'object' || body === null || !('delivery_regions' in body)) {
    return NextResponse.json({ error: 'delivery_regions is required' }, { status: 400 })
  }

  const { delivery_regions } = body as { delivery_regions: unknown }

  if (!Array.isArray(delivery_regions)) {
    return NextResponse.json({ error: 'delivery_regions must be an array' }, { status: 400 })
  }

  if (delivery_regions.length === 0) {
    return NextResponse.json(
      { error: '배달 가능 지역을 1개 이상 선택해 주세요.' },
      { status: 400 },
    )
  }

  for (const r of delivery_regions) {
    if (typeof r !== 'string' || !VALID_REGIONS.has(r)) {
      return NextResponse.json({ error: `유효하지 않은 지역: ${r}` }, { status: 400 })
    }
  }

  const { data, error } = await supabase
    .from('companies')
    .update({ delivery_regions })
    .eq('id', id)
    .select('id, slug, name, delivery_regions')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data })
}
