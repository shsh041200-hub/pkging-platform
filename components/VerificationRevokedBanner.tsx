// Server component — LC §5-B mandatory notice banner (PACAA-532).
// Non-dismissable: must remain visible until 2026-08-09 per LC advisory.
// console.log below is the mandatory SSR audit trail per LC §5-B condition 4.

type VerificationRevokedReason = 'audit_2026Q2_evidence_missing'

type Props = {
  slug: string
  companyId: string
  revokedAt: string | null
  reason: string
}

const SUPPORTED_REASONS: VerificationRevokedReason[] = ['audit_2026Q2_evidence_missing']

export function VerificationRevokedBanner({ slug, companyId, revokedAt, reason }: Props) {
  if (!SUPPORTED_REASONS.includes(reason as VerificationRevokedReason)) return null

  const renderTs = new Date().toISOString()

  // LC §5-B condition 4 — server-side audit log (do NOT remove)
  console.log(
    JSON.stringify({
      event: 'verification_revoked_banner_render',
      slug,
      companyId,
      reason,
      revokedAt,
      graceEnd: '2026-08-09',
      renderTs,
    }),
  )

  return (
    <div
      role="region"
      aria-label="인증 배지 박탈 공지"
      className="bg-amber-50 border-b-2 border-amber-300"
    >
      <div className="max-w-[800px] mx-auto px-4 sm:px-6 py-4">
        <p className="text-[13px] font-bold text-amber-900 mb-1.5">
          [공지] is_verified 배지 상태 변경 안내
        </p>
        <p className="text-[13px] text-amber-800 leading-relaxed whitespace-pre-line">
          {`귀사 프로필의 인증 배지가 2026년 5월 11일부로 비표시 처리되었습니다.\n사유: 2026-Q2 감사 결과 §1 검증 기준 evidence(사업자등록번호·도메인·이메일·전화·양방향 연락처) 미확인.\n기준 전문 → `}
          <a
            href="https://packlinx.com/docs/legal/vendor-verification-criteria"
            className="underline underline-offset-2 font-medium hover:text-amber-900 break-all"
          >
            https://packlinx.com/docs/legal/vendor-verification-criteria
          </a>
          {`\n보완 기간: 2026-05-11 ~ 2026-08-09 (90일) 내 evidence 제출 시 배지 복구 절차 진행.\n제출: `}
          <a href="mailto:verify@packlinx.com" className="underline underline-offset-2 hover:text-amber-900">
            verify@packlinx.com
          </a>
          {` | 문의: `}
          <a href="mailto:contact@packlinx.com" className="underline underline-offset-2 hover:text-amber-900">
            contact@packlinx.com
          </a>
        </p>
      </div>
    </div>
  )
}
