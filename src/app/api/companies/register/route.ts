import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80)
}

export async function POST(request: NextRequest) {
  const body = await request.json()

  const { name, description, category, buyer_category, packaging_form, website, email, province, city, products, certifications } = body

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return NextResponse.json({ error: '업체명을 입력해주세요 (최소 2자)' }, { status: 400 })
  }
  if (!description || typeof description !== 'string' || description.trim().length < 10) {
    return NextResponse.json({ error: '회사 설명을 입력해주세요 (최소 10자)' }, { status: 400 })
  }
  if (!category || typeof category !== 'string') {
    return NextResponse.json({ error: '업종(소재)을 선택해주세요' }, { status: 400 })
  }
  if (!website || typeof website !== 'string') {
    return NextResponse.json({ error: '웹사이트 주소를 입력해주세요' }, { status: 400 })
  }

  let normalizedWebsite = website.trim()
  if (!/^https?:\/\//i.test(normalizedWebsite)) {
    normalizedWebsite = `https://${normalizedWebsite}`
  }

  try {
    new URL(normalizedWebsite)
  } catch {
    return NextResponse.json({ error: '올바른 웹사이트 주소를 입력해주세요' }, { status: 400 })
  }

  const baseSlug = toSlug(name.trim())
  const slug = `${baseSlug}-${Date.now().toString(36)}`

  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('companies')
    .insert({
      slug,
      name: name.trim(),
      description: description.trim(),
      category,
      buyer_category: buyer_category || null,
      packaging_form: packaging_form || null,
      website: normalizedWebsite,
      email: email?.trim() || null,
      province: province?.trim() || null,
      city: city?.trim() || null,
      products: Array.isArray(products) ? products.filter((p: string) => p.trim()) : [],
      certifications: Array.isArray(certifications) ? certifications.filter((c: string) => c.trim()) : [],
      is_verified: false,
    })
    .select('id, slug')
    .single()

  if (error) {
    return NextResponse.json({ error: '등록 중 오류가 발생했습니다. 다시 시도해주세요.' }, { status: 500 })
  }

  return NextResponse.json({ data })
}
