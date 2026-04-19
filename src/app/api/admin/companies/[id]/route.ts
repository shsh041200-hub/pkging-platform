import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { type Category } from '@/types'

const VALID_CATEGORIES: Category[] = [
  'saneobyong',
  'food_grade',
  'jiryu',
  'plastic',
  'metal',
  'eco',
]

async function requireAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') return null
  return supabase
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await requireAdmin()
  if (!supabase) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  const body = await request.json()
  const { name, slug, category } = body

  if (!name?.trim()) {
    return NextResponse.json({ error: '업체명은 필수입니다.' }, { status: 400 })
  }
  if (!slug?.trim()) {
    return NextResponse.json({ error: '슬러그는 필수입니다.' }, { status: 400 })
  }
  if (!category || !VALID_CATEGORIES.includes(category)) {
    return NextResponse.json({ error: '유효한 카테고리를 선택하세요.' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('companies')
    .update({
      name: name.trim(),
      slug: slug.trim(),
      category,
      description: body.description?.trim() || null,
      subcategory: body.subcategory?.trim() || null,
      address: body.address?.trim() || null,
      city: body.city?.trim() || null,
      province: body.province?.trim() || null,
      phone: body.phone?.trim() || null,
      email: body.email?.trim() || null,
      website: body.website?.trim() || null,
      products: body.products || [],
      certifications: body.certifications || [],
      is_verified: body.is_verified ?? false,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await requireAdmin()
  if (!supabase) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params

  const { error } = await supabase.from('companies').delete().eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
