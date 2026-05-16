import type { VendorModel } from './VendorModelBadge'

interface VendorTradingBoxProps {
  model: VendorModel
  phone: string | null
  email: string | null
  website: string | null
  vendorName: string
}

export function VendorTradingBox({
  model,
  phone,
  email,
  website,
  vendorName,
}: VendorTradingBoxProps) {
  // Primary direct contact: phone → email → website
  const primaryHref = phone
    ? `tel:${phone}`
    : email
    ? `mailto:${email}?subject=${encodeURIComponent(`[Packlinx] ${vendorName} 견적 문의`)}`
    : website ?? null
  const primaryIsExternal = !phone && !email && !!website

  if (model === 'unknown') {
    return (
      <div className="space-y-2.5">
        {primaryHref && (
          <a
            href={primaryHref}
            target={primaryIsExternal ? '_blank' : undefined}
            rel={primaryIsExternal ? 'noopener noreferrer' : undefined}
            className="flex items-center justify-center gap-2 w-full text-[13px] font-bold text-white bg-[#533afd] hover:bg-[#4434d4] py-3.5 rounded-xl transition-colors"
          >
            견적 문의
          </a>
        )}
      </div>
    )
  }

  if (model === 'A') {
    return (
      <div className="space-y-3">
        {/* Model A description */}
        <p className="text-[12px] text-neutral-600 leading-relaxed bg-[#F8F9FA] border border-[#e5edf5] rounded-lg px-3 py-2.5">
          초대량 B2B 전문 공급사. 견적은 전화·이메일로 진행됩니다.
        </p>

        {/* Single CTA */}
        {primaryHref && (
          <a
            href={primaryHref}
            target={primaryIsExternal ? '_blank' : undefined}
            rel={primaryIsExternal ? 'noopener noreferrer' : undefined}
            className="flex items-center justify-center gap-2 w-full text-[13px] font-bold text-white bg-[#533afd] hover:bg-[#4434d4] py-3.5 rounded-xl transition-colors"
          >
            견적 문의
          </a>
        )}
        {email && phone && (
          <a
            href={`mailto:${email}?subject=${encodeURIComponent(`[Packlinx] ${vendorName} 견적 문의`)}`}
            className="flex items-center justify-center gap-2 w-full text-[13px] font-semibold text-[#061b31] bg-white hover:bg-neutral-50 border border-[#e5edf5] py-3 rounded-xl transition-colors"
          >
            이메일 문의
          </a>
        )}

        {/* Legal §20 disclaimer — Model A only (legal item 1) */}
        <p className="text-[10px] text-neutral-400 leading-relaxed pt-1 border-t border-neutral-100">
          본 업체는 통신판매업 신고 사업자가 아닙니다. 거래·계약·결제·환불 등 모든 절차는
          구매자와 업체가 직접 진행하며, Packlinx는 거래 당사자가 아닙니다.
        </p>
      </div>
    )
  }

  // Model B
  const sampleHref = website ?? primaryHref
  const sampleIsExternal = !!website || primaryIsExternal

  return (
    <div className="space-y-3">
      {/* Model B description */}
      <p className="text-[12px] text-neutral-600 leading-relaxed bg-[#F8F9FA] border border-[#e5edf5] rounded-lg px-3 py-2.5">
        샘플부터 소·대량 거래 가능. 웹 카탈로그에서 직접 확인하고 견적 요청하세요.
      </p>

      {/* 샘플 신청 — primary */}
      {sampleHref && (
        <a
          href={sampleHref}
          target={sampleIsExternal ? '_blank' : undefined}
          rel={sampleIsExternal ? 'noopener noreferrer' : undefined}
          className="flex items-center justify-center gap-2 w-full text-[13px] font-bold text-white bg-emerald-700 hover:bg-emerald-800 py-3.5 rounded-xl transition-colors"
        >
          샘플 신청
        </a>
      )}

      {/* 견적 문의 — secondary */}
      {primaryHref && (
        <a
          href={primaryHref}
          target={primaryIsExternal ? '_blank' : undefined}
          rel={primaryIsExternal ? 'noopener noreferrer' : undefined}
          className="flex items-center justify-center gap-2 w-full text-[13px] font-bold text-[#533afd] border border-[#533afd]/25 bg-[#533afd]/5 hover:bg-[#533afd]/10 py-3.5 rounded-xl transition-colors"
        >
          견적 문의
        </a>
      )}
    </div>
  )
}
