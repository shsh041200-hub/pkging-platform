// Trust signal badges for vendor card (category listing / search results)
// Priority: Tier 3 (Packlinx 검증 ★) > Tier 2a (KS 인증) > Tier 1 (사업자 확인 ✓)
// Max 3 badges; if no trust data, renders nothing.

interface TrustSignalBadgesProps {
  isVerified: boolean         // is_verified — Tier 3: Packlinx 검증 ★
  packlinxVerified: boolean   // packlinx_verified — Tier 1: 사업자 확인 ✓
  certifications: string[]    // certifications text[] — Tier 2a: KS 인증
}

export function TrustSignalBadges({ isVerified, packlinxVerified, certifications }: TrustSignalBadgesProps) {
  const hasCerts = certifications.length > 0

  const badges: React.ReactNode[] = []

  // Tier 3: Packlinx 검증 — highest priority, strong emphasis
  if (isVerified && badges.length < 3) {
    badges.push(
      <span
        key="tier3"
        className="inline-flex items-center gap-1 text-[10px] font-bold text-[#533afd] bg-[#533afd]/8 border border-[#533afd]/20 px-1.5 py-0.5 rounded"
      >
        <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        Packlinx 검증
      </span>
    )
  }

  // Tier 2a: KS 인증 — certification present
  if (hasCerts && badges.length < 3) {
    const certNames = certifications.slice(0, 2).join(', ')
    badges.push(
      <span
        key="tier2a"
        title={certNames}
        className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded"
        aria-label={`인증 보유: ${certNames}`}
      >
        <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
        KS 인증
      </span>
    )
  }

  // Tier 1: 사업자 확인 — phone-verified business registration
  if (packlinxVerified && badges.length < 3) {
    badges.push(
      <span
        key="tier1"
        className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded"
      >
        <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        사업자 확인
      </span>
    )
  }

  if (badges.length === 0) return null

  return (
    <div className="flex flex-wrap gap-1" role="list" aria-label="신뢰 배지">
      {badges}
    </div>
  )
}
