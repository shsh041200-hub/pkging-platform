import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')
  const industry = searchParams.get('industry')
  const material = searchParams.get('material')
  const category = searchParams.get('category')
  const tag = searchParams.get('tag')
  const page = parseInt(searchParams.get('page') ?? '1', 10)
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '20', 10), 50)
  const offset = (page - 1) * limit

  const supabase = await createClient()

  let query = supabase
    .from('companies')
    .select(
      'id, slug, name, description, category, industry_categories, material_type, subcategory, tags, is_verified, founded_year, employee_range, min_order_quantity, service_capabilities, target_industries, products, certifications',
      { count: 'exact' }
    )
    .order('is_verified', { ascending: false })
    .order('name')
    .range(offset, offset + limit - 1)

  if (q) {
    query = query.or(
      `name.ilike.%${q}%,description.ilike.%${q}%,products.cs.{${q}},certifications.cs.{${q}},tags.cs.{${q}}`
    )
  }
  if (industry) query = query.contains('industry_categories', [industry])
  if (material) query = query.eq('material_type', material)
  if (category) query = query.eq('category', category)
  if (tag) query = query.contains('tags', [tag])

  const { data, count, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data, count, page, limit })
}
