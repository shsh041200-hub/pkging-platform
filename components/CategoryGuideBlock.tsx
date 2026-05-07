import { CATEGORY_GUIDE_CONTENT } from '@/data/categoryGuide'
import type { IndustryCategory } from '@/types'

export function CategoryGuideBlock({ categoryId }: { categoryId: IndustryCategory }) {
  const guide = CATEGORY_GUIDE_CONTENT[categoryId]
  if (!guide) return null

  return (
    <div className="mt-8 bg-white border border-gray-200 rounded-xl p-6 sm:p-8">
      <p className="text-[14px] sm:text-[15px] text-gray-600 leading-relaxed mb-6">
        {guide.description}
      </p>

      <div className="mb-6">
        <h3 className="text-[12px] font-semibold text-gray-400 uppercase tracking-wider mb-3">
          구매 체크포인트
        </h3>
        <ul className="space-y-2">
          {guide.buyerPoints.map((point, i) => (
            <li key={i} className="flex items-start gap-2.5 text-[13px] sm:text-[14px] text-gray-700 leading-relaxed">
              <svg className="w-4 h-4 text-[#F97316] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              {point}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="text-[12px] font-semibold text-gray-400 uppercase tracking-wider mb-3">
          주요 포장 유형
        </h3>
        <div className="flex flex-wrap gap-2">
          {guide.subTypes.map((type) => (
            <span
              key={type}
              className="text-[12px] font-medium text-gray-600 bg-gray-100 px-3 py-1.5 rounded-lg"
            >
              {type}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
