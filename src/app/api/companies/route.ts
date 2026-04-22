import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { CERTIFICATION_TYPES } from '@/types'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')
  const industry = searchParams.get('industry')
  const material_type = searchParams.get('material_type') ?? searchParams.get('material')
  const packaging_form = searchParams.get('packaging_form')
  const category = searchParams.get('category')
  const tag = searchParams.get('tag')
  const certification = searchParams.get('certification')
  const page = parseInt(searchParams.get('page') ?? '1', 10)
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '20', 10), 50)
  const offset = (page - 1) * limit

  const supabase = await createClient()

  let query = supabase
    .from('companies')
    .select(
      'id, slug, name, description, category, industry_categories, material_type, packaging_form, subcategory, tags, is_verified, founded_year, min_order_quantity, service_capabilities, target_industries, products, certifications',
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
  if (material_type) {
    const materials = material_type.split(',').filter(Boolean)
    if (materials.length === 1) {
      query = query.eq('material_type', materials[0])
    } else if (materials.length > 1) {
      query = query.in('material_type', materials)
    }
  }
  if (packaging_form) {
    const forms = packaging_form.split(',').filter(Boolean)
    if (forms.length === 1) {
      query = query.eq('packaging_form', forms[0])
    } else if (forms.length > 1) {
      query = query.in('packaging_form', forms)
    }
  }
  if (category) query = query.eq('category', category)
  if (tag) query = query.contains('tags', [tag])
  if (certification) {
    // Expand canonical IDs to all known aliases so stored values like
    // 'HACCP 인증' match a query for id 'haccp'. Unknown values pass through as-is.
    const certIds = certification.split(',').filter(Boolean)
    const aliases = certIds.flatMap(id => {
      const found = CERTIFICATION_TYPES.find(c => c.id === id)
      return found ? found.aliases : [id]
    })
    query = query.overlaps('certifications', aliases)
  }

  const { data, count, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data, count, page, limit })
}
