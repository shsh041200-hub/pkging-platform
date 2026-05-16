import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import {
  INDUSTRY_CATEGORY_LABELS,
  CATEGORY_LABELS,
  type Category,
  type IndustryCategory,
} from '@/types'
import VendorV5Client from './VendorV5Client'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: '[V5 리뉴얼안] Vendor Detail — Korean Discovery',
  robots: { index: false, follow: false },
}

type Props = {
  params: Promise<{ slug: string }>
}

export default async function VendorRedesignV5Page({ params }: Props) {
  const { slug: rawSlug } = await params
  const slug = decodeURIComponent(rawSlug)
  const supabase = await createClient()

  const { data: company } = await supabase
    .from('companies')
    .select(
      'id, slug, name, description, category, industry_categories, phone, email, website, icon_url, is_verified, founded_year, products, service_capabilities, target_industries, key_clients, moq_value, moq_unit, lead_time_standard_days, sample_available, certifications, price_tier, data_source, city, province'
    )
    .eq('slug', slug)
    .eq('is_hidden', false)
    .single()

  if (!company) notFound()

  const industryCats = (company.industry_categories as string[] | null) ?? []
  const primaryIndustry = industryCats[0] as IndustryCategory | undefined
  const categoryLabel = primaryIndustry
    ? INDUSTRY_CATEGORY_LABELS[primaryIndustry]
    : (CATEGORY_LABELS[company.category as Category] ?? company.category)

  // Peer vendors: same category, exclude self, limit 3
  let peerVendors: Array<{
    id: string
    slug: string
    name: string
    description: string | null
    category: string
    is_verified: boolean | null
    icon_url: string | null
    phone: string | null
  }> = []

  if (primaryIndustry) {
    const { data: peers } = await supabase
      .from('companies')
      .select('id, slug, name, description, category, is_verified, icon_url, phone')
      .contains('industry_categories', [primaryIndustry])
      .neq('id', company.id)
      .eq('is_hidden', false)
      .limit(3)

    peerVendors = peers ?? []
  } else {
    const { data: peers } = await supabase
      .from('companies')
      .select('id, slug, name, description, category, is_verified, icon_url, phone')
      .eq('category', company.category)
      .neq('id', company.id)
      .eq('is_hidden', false)
      .limit(3)

    peerVendors = peers ?? []
  }

  return (
    <>
      {/* noindex 명시 */}
      <meta name="robots" content="noindex, nofollow" />

      {/* V5 리뉴얼안 워터마크 */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center pointer-events-none">
        <span className="bg-brand-500 text-white text-[10px] font-bold px-3 py-0.5 rounded-b-md opacity-80">
          [V5 리뉴얼안 — noindex]
        </span>
      </div>

      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <VendorV5Client
        company={company as any}
        peerVendors={peerVendors}
        categoryLabel={categoryLabel}
      />
    </>
  )
}
