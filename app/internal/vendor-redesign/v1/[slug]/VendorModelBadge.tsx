import type { VendorModel } from './page'

interface VendorModelBadgeProps {
  model: VendorModel
}

export function VendorModelBadge({ model }: VendorModelBadgeProps) {
  if (model === 'unknown') return null

  const isA = model === 'A'

  return (
    <div className="inline-flex items-center gap-1.5">
      <span
        className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full border ${
          isA
            ? 'text-[#0F172A] bg-[#E8EEF7] border-[#B8CCE0]'
            : 'text-emerald-800 bg-emerald-50 border-emerald-200'
        }`}
      >
        {isA ? '기업 거래 전문' : '샘플·소량부터 가능'}
      </span>

      {/* (i) tooltip — legal item 2 */}
      <div className="relative group">
        <button
          type="button"
          aria-label="거래 형태 분류 기준 안내"
          className="w-4 h-4 rounded-full bg-neutral-200 hover:bg-neutral-300 text-neutral-500 flex items-center justify-center text-[9px] font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          i
        </button>
        <div
          role="tooltip"
          className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 bg-[#061b31] text-white text-[11px] leading-relaxed px-3 py-2 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 pointer-events-none transition-opacity z-20"
        >
          통신판매업 신고 정보 + vendor 자가신고 기반 거래 형태 분류 — 품질·신뢰도 평가 아님
          <span className="absolute left-1/2 -translate-x-1/2 top-full border-4 border-transparent border-t-[#061b31]" />
        </div>
      </div>
    </div>
  )
}
