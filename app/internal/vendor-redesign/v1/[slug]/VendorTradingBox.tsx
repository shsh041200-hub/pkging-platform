import type { VendorModel } from './page'

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
  const primaryContact = phone
    ? { href: `tel:${phone}`, label: phone }
    : email
    ? { href: `mailto:${email}`, label: '이메일 문의' }
    : website
    ? { href: website, label: '웹사이트', external: true }
    : null

  if (model === 'unknown') {
    return (
      <div className="bg-white border border-border-v04 rounded-2xl p-5 sm:p-6 space-y-4">
        {primaryContact && (
          <a
            href={primaryContact.href}
            target={primaryContact.href.startsWith('http') ? '_blank' : undefined}
            rel={primaryContact.href.startsWith('http') ? 'noopener noreferrer' : undefined}
            className="flex items-center justify-center gap-2 w-full text-[14px] font-semibold text-white bg-stripe-purple hover:bg-stripe-purple-hover py-3 rounded-xl transition-colors"
          >
            견적 문의
          </a>
        )}
      </div>
    )
  }

  if (model === 'A') {
    return (
      <div className="bg-white border border-border-v04 rounded-2xl p-5 sm:p-6 space-y-4">
        {/* Description */}
        <p className="text-[14px] text-body-secondary leading-relaxed">
          초대량 B2B 전문 공급사. 견적은 전화·이메일로 진행됩니다.
        </p>

        {/* CTA */}
        {primaryContact && (
          <a
            href={primaryContact.href}
            target={primaryContact.href.startsWith('http') ? '_blank' : undefined}
            rel={primaryContact.href.startsWith('http') ? 'noopener noreferrer' : undefined}
            className="flex items-center justify-center gap-2 w-full text-[14px] font-semibold text-white bg-stripe-purple hover:bg-stripe-purple-hover py-3 rounded-xl transition-colors"
          >
            견적 문의
          </a>
        )}
        {email && phone && (
          <a
            href={`mailto:${email}`}
            className="flex items-center justify-center gap-2 w-full text-[13px] font-medium text-neutral-600 border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 py-2.5 rounded-xl transition-colors"
          >
            이메일 문의
          </a>
        )}

        {/* Legal §20 disclaimer — Model A only (legal item 1) */}
        <p className="text-[11px] text-neutral-400 leading-relaxed pt-1 border-t border-neutral-100">
          본 업체는 통신판매업 신고 사업자가 아닙니다. 거래·계약·결제·환불 등 모든 절차는
          구매자와 업체가 직접 진행하며, Packlinx는 거래 당사자가 아닙니다.
        </p>
      </div>
    )
  }

  // Model B
  return (
    <div className="bg-white border border-border-v04 rounded-2xl p-5 sm:p-6 space-y-4">
      {/* Description */}
      <p className="text-[14px] text-body-secondary leading-relaxed">
        샘플부터 소·대량 거래 가능. 웹 카탈로그에서 직접 확인하고 견적 요청하세요.
      </p>

      {/* CTAs: 샘플 신청 (primary) + 견적 문의 (secondary) */}
      {website ? (
        <a
          href={website}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full text-[14px] font-semibold text-white bg-emerald-700 hover:bg-emerald-800 py-3 rounded-xl transition-colors"
        >
          샘플 신청
        </a>
      ) : phone ? (
        <a
          href={`tel:${phone}`}
          className="flex items-center justify-center gap-2 w-full text-[14px] font-semibold text-white bg-emerald-700 hover:bg-emerald-800 py-3 rounded-xl transition-colors"
        >
          샘플 신청
        </a>
      ) : null}

      {primaryContact && (
        <a
          href={primaryContact.href}
          target={primaryContact.href.startsWith('http') ? '_blank' : undefined}
          rel={primaryContact.href.startsWith('http') ? 'noopener noreferrer' : undefined}
          className="flex items-center justify-center gap-2 w-full text-[14px] font-semibold text-stripe-purple border border-stripe-purple-ring bg-stripe-purple-soft hover:bg-stripe-purple-tint py-3 rounded-xl transition-colors"
        >
          견적 문의
        </a>
      )}

      {/* Vendor name for accessibility context */}
      <p className="text-[11px] text-neutral-400 text-center">
        {vendorName}에 직접 연락하세요
      </p>
    </div>
  )
}
