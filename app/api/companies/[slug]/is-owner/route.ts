import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// PACAA-228: per-user owner-status check used by client components on
// otherwise-ISR pages. MUST NOT be cached — response depends on the cookie
// session.
export const dynamic = 'force-dynamic'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug: rawSlug } = await params
  const slug = decodeURIComponent(rawSlug)

  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json(
      { isOwner: false },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  }

  const { data: company, error: companyErr } = await supabase
    .from('companies')
    .select('id')
    .eq('slug', slug)
    .single()

  if (companyErr || !company) {
    return NextResponse.json(
      { isOwner: false },
      { status: 404, headers: { 'Cache-Control': 'no-store' } }
    )
  }

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('company_id')
    .eq('id', user.id)
    .single()

  const isOwner = profile?.company_id === company.id

  return NextResponse.json(
    { isOwner },
    { headers: { 'Cache-Control': 'no-store' } }
  )
}
