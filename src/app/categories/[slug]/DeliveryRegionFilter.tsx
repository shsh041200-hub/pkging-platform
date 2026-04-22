'use client'

import { useState } from 'react'
import Link from 'next/link'
import { DELIVERY_REGIONS, DELIVERY_REGION_LABELS, type DeliveryRegion } from '@/types'

const REGION_GROUPS: { group: string; regions: DeliveryRegion[] }[] = [
  { group: '수도권', regions: ['서울특별시', '경기도', '인천광역시'] },
  { group: '충청권', regions: ['충청북도', '충청남도', '대전광역시', '세종특별자치시'] },
  { group: '호남권', regions: ['전북특별자치도', '전라남도', '광주광역시'] },
  { group: '영남권', regions: ['경상북도', '경상남도', '대구광역시', '부산광역시', '울산광역시'] },
  { group: '강원·제주', regions: ['강원특별자치도', '제주특별자치도'] },
]

// Type assertion to confirm all groups cover exactly DELIVERY_REGIONS
const _allGroupRegions = REGION_GROUPS.flatMap((g) => g.regions)
void (_allGroupRegions.length === DELIVERY_REGIONS.length)

interface Props {
  selectedRegions: DeliveryRegion[]
  regionUrls: Record<string, string>
  clearUrl: string
}

export function DeliveryRegionFilter({ selectedRegions, regionUrls, clearUrl }: Props) {
  const [open, setOpen] = useState(selectedRegions.length > 0)
  const [tooltipVisible, setTooltipVisible] = useState(false)

  return (
    <div className="pb-2.5">
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => setOpen(!open)}
          className={`text-[11px] font-medium flex items-center gap-1.5 py-1 transition-colors ${
            selectedRegions.length > 0
              ? 'text-[#005EFF] hover:text-[#0047CC]'
              : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <svg
            className={`w-3 h-3 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
          배달 가능 지역
          {selectedRegions.length > 0 && (
            <span className="bg-[#005EFF] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
              {selectedRegions.length}
            </span>
          )}
        </button>

        {/* Info tooltip */}
        <div className="relative">
          <button
            type="button"
            onMouseEnter={() => setTooltipVisible(true)}
            onMouseLeave={() => setTooltipVisible(false)}
            onFocus={() => setTooltipVisible(true)}
            onBlur={() => setTooltipVisible(false)}
            className="text-gray-300 hover:text-gray-500 transition-colors leading-none"
            aria-label="배달 가능 지역 필터 설명"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
              />
            </svg>
          </button>
          {tooltipVisible && (
            <div
              role="tooltip"
              className="absolute left-0 bottom-full mb-2 z-50 w-60 bg-gray-900 text-white text-[11px] leading-snug rounded-lg px-3 py-2.5 shadow-lg pointer-events-none whitespace-normal"
            >
              업체 <strong className="text-white">소재지가 아닌 배달 가능 지역</strong> 기준입니다. 선택한 지역에 배달 가능한 업체만 표시됩니다.
            </div>
          )}
        </div>
      </div>

      <div
        className={`grid transition-[grid-template-rows] duration-200 ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
      >
        <div className="overflow-hidden">
          <div className="pt-2 space-y-3 pb-1">
            {/* 전국 (clears all region filters) */}
            <div className="flex flex-wrap gap-1.5">
              <Link
                href={clearUrl}
                className={`flex-shrink-0 px-2.5 py-1 rounded text-[11px] font-medium transition-all border ${
                  selectedRegions.length === 0
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'text-gray-500 border-gray-200 hover:text-gray-700 hover:border-gray-300 bg-white'
                }`}
              >
                전국
              </Link>
            </div>

            {/* Region chips grouped by geographic area */}
            {REGION_GROUPS.map(({ group, regions }) => (
              <div key={group}>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1.5">
                  {group}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {regions.map((region) => {
                    const isActive = selectedRegions.includes(region)
                    return (
                      <Link
                        key={region}
                        href={regionUrls[region] ?? '#'}
                        className={`flex-shrink-0 px-2.5 py-1 rounded text-[11px] font-medium transition-all border ${
                          isActive
                            ? 'bg-[#005EFF] text-white border-[#005EFF]'
                            : 'text-gray-500 border-gray-200 hover:text-gray-700 hover:border-gray-300 bg-white'
                        }`}
                      >
                        {DELIVERY_REGION_LABELS[region]}
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
