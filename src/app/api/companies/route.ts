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
  const use_case = searchParams.get('use_case')
  const page = parseInt(searchParams.get('page') ?? '1', 10)
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '20', 10), 50)
  const offset = (page - 1) * limit

  const supabase = await createClient()

  // When a text query is present, delegate to the scored Korean search RPC which:
  //   1. Expands the query via the korean_search_synonyms table
  //   2. Searches using a weighted tsvector (name > products/subcategory > description)
  //   3. Falls back to ilike for compound Korean words not split by spaces
  //   4. Ranks by relevance score rather than static is_verified / cert_count sort
  if (q) {
    // certification aliases must be resolved client-side and passed as a single
    // representative value; the RPC does an && overlap match.
    let certAlias: string | null = null
    if (certification) {
      const certIds = certification.split(',').filter(Boolean)
      const aliases = certIds.flatMap(id => {
        const found = CERTIFICATION_TYPES.find(c => c.id === id)
        return found ? found.aliases : [id]
      })
      certAlias = aliases[0] ?? null
    }

    // multi-value material / packaging_form: pass first value only to RPC;
    // multi-value paths fall through to the legacy filter query below.
    const materialValues = material_type?.split(',').filter(Boolean) ?? []
    const formValues = packaging_form?.split(',').filter(Boolean) ?? []
    const singleMaterial = materialValues.length === 1 ? materialValues[0] : null
    const singleForm = formValues.length === 1 ? formValues[0] : null

    const { data: rpcData, error: rpcError } = await supabase.rpc(
      'search_companies_korean',
      {
        p_query:         q,
        p_limit:         limit,
        p_offset:        offset,
        p_industry:      industry      ?? null,
        p_material_type: singleMaterial,
        p_packaging_form: singleForm,
        p_category:      category      ?? null,
        p_tag:           tag           ?? null,
        p_use_case:      use_case      ?? null,
        p_certification: certAlias,
      }
    )

    if (rpcError) {
      return NextResponse.json({ error: rpcError.message }, { status: 500 })
    }

    const rows = rpcData as Array<Record<string, unknown>>
    const count = rows.length > 0 ? Number(rows[0].total_count) : 0
    const data = rows.map(({ total_count: _tc, rank: _r, ...rest }) => rest)

    return NextResponse.json({ data, count, page, limit })
  }

  // ── Filter-only path (no text query) ──────────────────────────────────────
  let query = supabase
    .from('companies')
    .select(
      'id, slug, name, description, category, industry_categories, material_type, packaging_form, subcategory, tags, use_case_tags, is_verified, cert_count, founded_year, min_order_quantity, service_capabilities, target_industries, products, certifications',
      { count: 'exact' }
    )
    .eq('is_hidden', false)
    .order('is_verified', { ascending: false })
    .order('cert_count', { ascending: false })
    .order('name')
    .range(offset, offset + limit - 1)

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
  if (use_case) query = query.contains('use_case_tags', [use_case])
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
