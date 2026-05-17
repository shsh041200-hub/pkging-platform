import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Packlinx 인증 평가기준 — Packlinx',
  description:
    'Packlinx 인증(packlinx_verified) 부여 기준 안내 — 사업자등록 진위 확인, 통신판매업 신고 확인, 분쟁 이력 검토 등 내부 검수 절차.',
  alternates: {
    canonical: 'https://www.packlinx.com/verified-criteria',
  },
}

const criteria = [
  {
    title: '사업자등록 진위 확인',
    description:
      '국세청 사업자등록 진위확인 시스템을 통해 사업자등록번호의 유효성과 폐업 여부를 확인합니다.',
  },
  {
    title: '통신판매업 신고 확인',
    description:
      '공정거래위원회 통신판매사업자 신고 여부를 확인합니다. B2B 포장재 공급업체의 경우 해당 신고가 없을 수 있으며, 이 경우 사업자등록 확인으로 대체합니다.',
  },
  {
    title: '최근 6개월 분쟁 이력 0건',
    description:
      'Packlinx 플랫폼을 통해 접수된 분쟁 신고, 이용약관 위반 기록, 허위 정보 등록 이력이 없어야 합니다.',
  },
  {
    title: '내부 검수팀 최종 확인',
    description:
      '위 항목을 모두 충족한 업체에 한해 Packlinx 내부 검수팀이 최종 검토 후 인증을 부여합니다. 인증은 주기적으로 재검토되며 기준 미충족 시 취소될 수 있습니다.',
  },
]

export default function VerifiedCriteriaPage() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <div className="mb-8">
        <Link
          href="/"
          className="text-[13px] text-[#64748d] hover:text-[#533afd] transition-colors"
        >
          ← 홈으로
        </Link>
      </div>

      <h1 className="text-[28px] font-bold text-[#061b31] mb-3 tracking-tight">
        Packlinx 인증 평가기준
      </h1>
      <p className="text-[14px] text-[#64748d] mb-10 leading-relaxed">
        Packlinx 인증(
        <span className="font-medium text-[#061b31]">Packlinx Verified</span>)은 외부
        공인 인증기관이 발급한 인증이 아닙니다. Packlinx 내부 검수팀이 아래 기준을
        직접 확인한 업체에 한해 부여하는 자체 표시입니다.
      </p>

      <div className="space-y-6 mb-12">
        {criteria.map((item, i) => (
          <div
            key={i}
            className="border border-[#e5edf5] rounded-lg p-5"
            style={{ boxShadow: '0 1px 4px rgba(50,50,93,0.06)' }}
          >
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-[11px] font-bold flex items-center justify-center mt-0.5">
                {i + 1}
              </span>
              <div>
                <h2 className="text-[15px] font-semibold text-[#061b31] mb-1">{item.title}</h2>
                <p className="text-[13px] text-[#64748d] leading-relaxed">{item.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4 text-[12px] text-[#64748d] leading-relaxed">
        <p className="font-semibold text-[#061b31] mb-1">안내</p>
        <p>
          본 인증은 업체의 사업 역량·품질·신뢰도를 보장하지 않습니다. 거래 전 반드시
          직접 검토하시기 바랍니다. 인증 취소·이의신청은{' '}
          <Link href="/faq" className="underline text-[#533afd]">
            FAQ
          </Link>{' '}
          또는 고객센터를 통해 문의하세요.
        </p>
      </div>
    </main>
  )
}
