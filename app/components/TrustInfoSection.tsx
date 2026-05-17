// Vendor detail page "신뢰 정보" section (PACAA-771)
// Legal requirements: packlinx_verified links to criteria; notable_clients must show "(업체 제공 정보)"

interface CertStructured {
  name: string
  identifier?: string | null
  url?: string | null
}

interface TrustInfoSectionProps {
  businessRegistrationNumber: string | null
  packlinxVerified: boolean          // Tier 1: 사업자 확인 ✓
  isVerified: boolean                // Tier 3: Packlinx 검증 ★
  verifiedAt?: string | null         // Tier 3: 확인일 (ISO timestamp; shown as YYYY년 M월)
  certificationsStructured: CertStructured[] | null  // Tier 2a
  keyClients: string[] | null        // Tier 2b — always labeled "(업체 제공 정보)"
}

function formatVerifiedAt(iso: string): string {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월`
}

export function TrustInfoSection({
  businessRegistrationNumber,
  packlinxVerified,
  isVerified,
  verifiedAt,
  certificationsStructured,
  keyClients,
}: TrustInfoSectionProps) {
  const hasTier1 = packlinxVerified && businessRegistrationNumber
  const hasTier3 = isVerified
  const hasTier2a = certificationsStructured && certificationsStructured.length > 0
  const hasTier2b = keyClients && keyClients.length > 0

  if (!hasTier1 && !hasTier3 && !hasTier2a && !hasTier2b) return null

  return (
    <section
      aria-labelledby="trust-info-heading"
      className="bg-white border border-[#e5edf5] rounded-xl p-5"
      style={{ boxShadow: '0 1px 4px rgba(50,50,93,0.06)' }}
    >
      <h2 id="trust-info-heading" className="text-[14px] font-bold text-[#061b31] mb-4">
        신뢰 정보
      </h2>

      <div className="space-y-4">
        {/* Tier 3: Packlinx 검증 ★ */}
        {hasTier3 && (
          <div className="flex items-start gap-3">
            <span
              className="mt-0.5 flex-shrink-0 w-6 h-6 rounded-full bg-[#533afd]/10 flex items-center justify-center"
              aria-hidden="true"
            >
              <svg className="w-3.5 h-3.5 text-[#533afd]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </span>
            <div>
              <p className="text-[13px] font-semibold text-[#061b31] leading-snug">
                Packlinx 검증 업체
              </p>
              <p className="text-[12px] text-neutral-500 mt-0.5">
                주요 정보를 Packlinx 스태프가 직접 교차 확인했습니다.
              </p>
              {verifiedAt && formatVerifiedAt(verifiedAt) && (
                <p className="text-[12px] text-neutral-500 mt-0.5">
                  확인일: {formatVerifiedAt(verifiedAt)}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Tier 1: 사업자 확인 ✓ */}
        {hasTier1 && (
          <div className="flex items-start gap-3">
            <span
              className="mt-0.5 flex-shrink-0 w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center"
              aria-hidden="true"
            >
              <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </span>
            <div>
              <p className="text-[13px] font-semibold text-[#061b31] leading-snug">
                사업자 등록 확인
              </p>
              <p className="text-[12px] font-mono text-neutral-700 mt-0.5">
                {businessRegistrationNumber}
              </p>
              <p className="text-[12px] text-neutral-500 mt-0.5">
                Packlinx 스태프가 전화로 확인했습니다.{' '}
                <a
                  href="/faq#packlinx-verification-criteria"
                  className="underline underline-offset-2 text-[#533afd] hover:text-[#4434d4] transition-colors"
                >
                  확인 기준 보기
                </a>
              </p>
            </div>
          </div>
        )}

        {/* Tier 2a: KS/산업 인증 */}
        {hasTier2a && certificationsStructured!.map((cert, i) => (
          <div key={i} className="flex items-start gap-3">
            <span
              className="mt-0.5 flex-shrink-0 w-6 h-6 rounded-full bg-amber-50 flex items-center justify-center"
              aria-hidden="true"
            >
              <svg className="w-3.5 h-3.5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </span>
            <div>
              <p className="text-[13px] font-semibold text-[#061b31] leading-snug">
                {cert.name}
              </p>
              {cert.identifier && (
                <p className="text-[12px] font-mono text-neutral-600 mt-0.5">
                  인증번호: {cert.identifier}
                </p>
              )}
              {cert.url ? (
                <a
                  href={cert.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[12px] text-[#533afd] hover:text-[#4434d4] underline underline-offset-2 transition-colors mt-0.5"
                >
                  인증 확인하기
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              ) : (
                <a
                  href="https://www.standard.go.kr/KSCI/portalindex.do"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[12px] text-[#533afd] hover:text-[#4434d4] underline underline-offset-2 transition-colors mt-0.5"
                >
                  국가표준인증 통합정보센터에서 확인하기
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              )}
            </div>
          </div>
        ))}

        {/* Tier 2b: 납품처 목록 — "(업체 제공 정보)" 주석 필수 (Legal) */}
        {hasTier2b && (
          <div className="flex items-start gap-3">
            <span
              className="mt-0.5 flex-shrink-0 w-6 h-6 rounded-full bg-neutral-100 flex items-center justify-center"
              aria-hidden="true"
            >
              <svg className="w-3.5 h-3.5 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </span>
            <div>
              <p className="text-[13px] font-semibold text-[#061b31] leading-snug">
                주요 납품처
              </p>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {keyClients!.map((client, i) => (
                  <span
                    key={i}
                    className="text-[12px] text-neutral-600 bg-neutral-50 border border-neutral-200 px-2 py-0.5 rounded"
                  >
                    {client}
                  </span>
                ))}
              </div>
              {/* Legal requirement: 업체 제공 정보 주석 필수 */}
              <p className="text-[11px] text-neutral-400 mt-1.5">
                * 업체 제공 정보입니다. Packlinx가 검증한 사실이 아닙니다.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
