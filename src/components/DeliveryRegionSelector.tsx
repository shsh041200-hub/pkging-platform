'use client'

import { useState } from 'react'
import { DELIVERY_REGIONS, DELIVERY_REGION_LABELS, type DeliveryRegion } from '@/types'

const REGION_GROUPS: { group: string; regions: DeliveryRegion[] }[] = [
  { group: '수도권', regions: ['서울특별시', '경기도', '인천광역시'] },
  { group: '충청권', regions: ['충청북도', '충청남도', '대전광역시', '세종특별자치시'] },
  { group: '호남권', regions: ['전북특별자치도', '전라남도', '광주광역시'] },
  { group: '영남권', regions: ['경상북도', '경상남도', '대구광역시', '부산광역시', '울산광역시'] },
  { group: '강원·제주', regions: ['강원특별자치도', '제주특별자치도'] },
]

const ALL_REGIONS = DELIVERY_REGIONS

function allSelected(regions: DeliveryRegion[]): boolean {
  return regions.length === ALL_REGIONS.length && ALL_REGIONS.every(r => regions.includes(r))
}

function buildSummary(regions: DeliveryRegion[]): string {
  if (regions.length === 0) return ''
  if (allSelected(regions)) return '전국 배송'
  if (regions.length <= 4) return regions.map(r => DELIVERY_REGION_LABELS[r]).join(', ')
  return `${regions.length}개 지역 선택됨`
}

export interface DeliveryRegionSelectorProps {
  value: DeliveryRegion[]
  onChange: (regions: DeliveryRegion[]) => void
  error?: string
}

export function DeliveryRegionSelector({ value, onChange, error }: DeliveryRegionSelectorProps) {
  const [nationwideMode, setNationwideMode] = useState(() => allSelected(value))
  const summary = buildSummary(value)

  function handleNationwideToggle() {
    if (nationwideMode) {
      // Turn off — keep all 17 selected but allow individual deselection
      setNationwideMode(false)
    } else {
      setNationwideMode(true)
      onChange([...ALL_REGIONS])
    }
  }

  function handleChipClick(region: DeliveryRegion) {
    if (nationwideMode) return
    if (value.includes(region)) {
      onChange(value.filter(r => r !== region))
    } else {
      onChange([...value, region])
    }
  }

  return (
    <div>
      <div className="flex items-center gap-1 mb-1">
        <span className="text-[14px] font-semibold text-gray-700">배달 가능 지역</span>
        <span className="text-red-500 text-[14px]">*</span>
      </div>
      <p className="text-[13px] text-gray-500 mb-4">귀사가 배달 가능한 지역을 모두 선택해 주세요.</p>

      {/* Nationwide toggle */}
      <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-[10px] px-4 py-3 mb-5">
        <div>
          <p className="text-[14px] font-semibold text-gray-900">전국 배송</p>
          <p className="text-[12px] text-gray-500 mt-0.5">전국 모든 지역으로 배송 가능합니다.</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={nationwideMode}
          aria-label="전국 배송 토글"
          onClick={handleNationwideToggle}
          className={`relative flex-shrink-0 w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#005EFF] focus-visible:ring-offset-2 ${
            nationwideMode ? 'bg-[#005EFF]' : 'bg-gray-300'
          }`}
        >
          <span
            className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
              nationwideMode ? 'translate-x-5' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>

      {/* Region chip grid grouped by region type */}
      <div className="space-y-4 mb-5">
        {REGION_GROUPS.map(({ group, regions }) => (
          <div key={group}>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-2">
              {group}
            </p>
            <div className="flex flex-wrap gap-2">
              {regions.map((region) => {
                const isSelected = value.includes(region)
                const isDisabled = nationwideMode
                return (
                  <button
                    key={region}
                    type="button"
                    disabled={isDisabled}
                    aria-pressed={isSelected}
                    onClick={() => handleChipClick(region)}
                    className={`px-3 py-2 rounded-lg text-[13px] font-medium border transition-all duration-150 ${
                      isSelected
                        ? isDisabled
                          ? 'bg-[#EBF2FF] border-[rgba(0,94,255,0.25)] text-[rgba(0,94,255,0.5)] opacity-70 cursor-default'
                          : 'bg-[#EBF2FF] border-[#005EFF] text-[#005EFF] font-semibold'
                        : isDisabled
                        ? 'bg-white border-gray-200 text-gray-300 cursor-default'
                        : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:text-gray-900'
                    }`}
                  >
                    {DELIVERY_REGION_LABELS[region]}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Selection summary */}
      <div className="min-h-[20px]">
        {value.length > 0 && (
          <p className="text-[13px] text-gray-500">
            선택된 지역:{' '}
            <span className="font-semibold text-gray-800">{summary}</span>
          </p>
        )}
        {value.length === 0 && (
          <p className="text-[13px] text-gray-400 italic">아직 선택된 지역이 없습니다.</p>
        )}
      </div>

      {/* Validation error */}
      {error && (
        <p className="mt-2 text-[12px] text-red-500">{error}</p>
      )}
    </div>
  )
}
