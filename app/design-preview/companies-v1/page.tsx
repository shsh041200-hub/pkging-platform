import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: '[PREVIEW] companies-v1',
  robots: { index: false, follow: false },
}

// Redirect to a representative vendor with rich data for preview review
export default async function CompaniesV1Index() {
  const supabase = await createClient()

  // Pick a verified vendor with products, certifications, and contact info
  const { data: company } = await supabase
    .from('companies')
    .select('slug')
    .eq('is_verified', true)
    .not('phone', 'is', null)
    .not('products', 'is', null)
    .order('view_count', { ascending: false })
    .limit(1)
    .single()

  if (company?.slug) {
    redirect(`/design-preview/companies-v1/${company.slug}`)
  }

  // Fallback: pick any vendor
  const { data: fallback } = await supabase
    .from('companies')
    .select('slug')
    .order('view_count', { ascending: false })
    .limit(1)
    .single()

  if (fallback?.slug) {
    redirect(`/design-preview/companies-v1/${fallback.slug}`)
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
      <p className="text-neutral-500 text-sm">preview 대상 업체를 찾을 수 없습니다.</p>
    </div>
  )
}
