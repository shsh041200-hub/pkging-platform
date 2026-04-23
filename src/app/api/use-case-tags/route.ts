import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const industry = searchParams.get('industry')

  const supabase = await createClient()

  let query = supabase
    .from('use_case_tags')
    .select('id, slug, label, description, parent_industry, seo_title, seo_description, seo_h1, seo_slug, icon, sort_order')
    .order('sort_order', { ascending: true })
    .order('label', { ascending: true })

  if (industry) {
    query = query.eq('parent_industry', industry)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: { code: 'DB_ERROR', message: error.message } }, { status: 500 })
  }

  return NextResponse.json({ data })
}
