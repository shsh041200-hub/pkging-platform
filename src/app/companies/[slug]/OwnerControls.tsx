'use client'

import { useEffect, useState } from 'react'
import { CertificationCTABanner } from '@/components/CertificationCTABanner'
import { SimilarOptoutToggle } from '@/components/SimilarOptoutToggle'

type Variant =
  | { kind: 'cert-cta'; withTopBorder: boolean; standaloneCard?: boolean }
  | { kind: 'similar-optout-on' }
  | { kind: 'similar-optout-off' }

type Props = {
  companyId: string
  slug: string
  variant: Variant
}

// PACAA-228: Owner-only UI extracted into a client component so the parent page
// can be ISR-cached. Fetches owner status from /api/companies/[slug]/is-owner
// on mount; renders nothing while loading or if not the owner. Some flicker on
// hydration is acceptable.
export function OwnerControls({ companyId, slug, variant }: Props) {
  const [isOwner, setIsOwner] = useState<boolean | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch(`/api/companies/${encodeURIComponent(slug)}/is-owner`, {
      credentials: 'include',
      cache: 'no-store',
    })
      .then((res) => (res.ok ? res.json() : { isOwner: false }))
      .then((data: { isOwner?: boolean }) => {
        if (!cancelled) setIsOwner(!!data?.isOwner)
      })
      .catch(() => {
        if (!cancelled) setIsOwner(false)
      })
    return () => {
      cancelled = true
    }
  }, [slug])

  if (!isOwner) return null

  if (variant.kind === 'cert-cta') {
    if (variant.standaloneCard) {
      return (
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <CertificationCTABanner companyId={companyId} />
        </div>
      )
    }
    return (
      <div className={variant.withTopBorder ? 'border-t border-gray-100 pt-5' : ''}>
        <CertificationCTABanner companyId={companyId} />
      </div>
    )
  }

  if (variant.kind === 'similar-optout-on') {
    return <SimilarOptoutToggle companyId={companyId} initialOptedOut={true} />
  }

  // similar-optout-off
  return <SimilarOptoutToggle companyId={companyId} initialOptedOut={false} />
}
