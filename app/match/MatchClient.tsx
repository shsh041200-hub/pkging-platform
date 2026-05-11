'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  INDUSTRY_CATEGORY_LABELS,
  MATERIAL_TYPE_LABELS,
  PACKAGING_FORM_LABELS,
  DELIVERY_REGION_LABELS,
  DELIVERY_REGIONS,
  INDUSTRY_CATEGORIES,
  MATERIAL_TYPES,
  PACKAGING_FORMS,
  type IndustryCategory,
  type MaterialType,
  type PackagingForm,
  type DeliveryRegion,
} from '@/types'
import { VendorDirectoryDisclaimer } from '@/components/VendorDirectoryDisclaimer'

// Minimal shape fetched from SSR — only what filtering + §13 display needs
export interface MatchVendor {
  id: string
  slug: string
  name: string
  industry_categories: IndustryCategory[]
  material_type: MaterialType | null
  packaging_form: string | null
  delivery_regions: string[]
  province: string | null
  city: string | null
  phone: string | null
  email: string | null
  website: string | null
  created_at: string
}

interface Filters {
  industry: IndustryCategory | ''
  material: MaterialType | ''
  form: PackagingForm | ''
  region: DeliveryRegion | ''
}

type SortKey = 'match' | 'registered'

function computeMatchScore(vendor: MatchVendor, filters: Filters): number {
  let score = 0
  if (filters.industry && vendor.industry_categories.includes(filters.industry)) score++
  if (filters.material && vendor.material_type === filters.material) score++
  if (filters.form && vendor.packaging_form === filters.form) score++
  if (
    filters.region &&
    (vendor.delivery_regions.includes(filters.region) || vendor.delivery_regions.includes('전국'))
  )
    score++
  return score
}

function hasAnyFilter(filters: Filters) {
  return filters.industry || filters.material || filters.form || filters.region
}

const SORT_LABELS: Record<SortKey, string> = {
  match: '사양 일치도순',
  registered: '등록순',
}

interface Props {
  vendors: MatchVendor[]
}

export default function MatchClient({ vendors }: Props) {
  const [filters, setFilters] = useState<Filters>({
    industry: '',
    material: '',
    form: '',
    region: '',
  })
  const [sort, setSort] = useState<SortKey>('match')
  const [searched, setSearched] = useState(false)

  const filtered = useMemo(() => {
    if (!searched) return []
    const withScore = vendors.map((v) => ({
      ...v,
      _score: computeMatchScore(v, filters),
    }))
    const relevant =
      hasAnyFilter(filters) ? withScore.filter((v) => v._score > 0) : withScore
    if (sort === 'match') {
      return relevant.sort((a, b) => b._score - a._score)
    }
    return relevant.sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    )
  }, [vendors, filters, sort, searched])

  function handleSearch() {
    setSearched(true)
  }

  function handleReset() {
    setFilters({ industry: '', material: '', form: '', region: '' })
    setSearched(false)
  }

  return (
    <div className="max-w-4xl mx-auto px-5 py-10">
      {/* ── Spec Matching Form ── */}
      <section
        aria-labelledby="match-form-heading"
        className="bg-white rounded-xl border border-[#e5edf5] p-6 mb-8 shadow-[0_2px_8px_rgba(50,50,93,0.08)]"
      >
        <h2
          id="match-form-heading"
          className="text-[18px] font-[300] text-[#061b31] tracking-tight mb-1"
          style={{ fontFeatureSettings: '"ss01"' }}
        >
          사양 입력
        </h2>
        <p className="text-[13px] text-[#64748d] mb-5">
          포장재 사양을 선택하면 조건에 맞는 업체 목록을 보여드립니다.
          <br />
          <strong className="text-[#273951]">개인 정보(이름·연락처·회사명)는 수집하지 않습니다.</strong>
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* 업종 */}
          <div>
            <label
              htmlFor="filter-industry"
              className="block text-[13px] font-[400] text-[#273951] mb-1"
            >
              업종
            </label>
            <select
              id="filter-industry"
              value={filters.industry}
              onChange={(e) =>
                setFilters((f) => ({ ...f, industry: e.target.value as IndustryCategory | '' }))
              }
              className="w-full h-10 px-3 rounded-lg border border-[#e5edf5] text-[14px] text-[#273951] bg-white focus:outline-none focus:ring-2 focus:ring-[#533afd]/30 focus:border-[#533afd]"
            >
              <option value="">전체 업종</option>
              {INDUSTRY_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {INDUSTRY_CATEGORY_LABELS[cat]}
                </option>
              ))}
            </select>
          </div>

          {/* 소재 */}
          <div>
            <label
              htmlFor="filter-material"
              className="block text-[13px] font-[400] text-[#273951] mb-1"
            >
              소재
            </label>
            <select
              id="filter-material"
              value={filters.material}
              onChange={(e) =>
                setFilters((f) => ({ ...f, material: e.target.value as MaterialType | '' }))
              }
              className="w-full h-10 px-3 rounded-lg border border-[#e5edf5] text-[14px] text-[#273951] bg-white focus:outline-none focus:ring-2 focus:ring-[#533afd]/30 focus:border-[#533afd]"
            >
              <option value="">전체 소재</option>
              {MATERIAL_TYPES.map((m) => (
                <option key={m} value={m}>
                  {MATERIAL_TYPE_LABELS[m]}
                </option>
              ))}
            </select>
          </div>

          {/* 포장 형태 */}
          <div>
            <label
              htmlFor="filter-form"
              className="block text-[13px] font-[400] text-[#273951] mb-1"
            >
              포장 형태
            </label>
            <select
              id="filter-form"
              value={filters.form}
              onChange={(e) =>
                setFilters((f) => ({ ...f, form: e.target.value as PackagingForm | '' }))
              }
              className="w-full h-10 px-3 rounded-lg border border-[#e5edf5] text-[14px] text-[#273951] bg-white focus:outline-none focus:ring-2 focus:ring-[#533afd]/30 focus:border-[#533afd]"
            >
              <option value="">전체 형태</option>
              {PACKAGING_FORMS.map((f) => (
                <option key={f} value={f}>
                  {PACKAGING_FORM_LABELS[f]}
                </option>
              ))}
            </select>
          </div>

          {/* 지역 */}
          <div>
            <label
              htmlFor="filter-region"
              className="block text-[13px] font-[400] text-[#273951] mb-1"
            >
              납품 가능 지역
            </label>
            <select
              id="filter-region"
              value={filters.region}
              onChange={(e) =>
                setFilters((f) => ({ ...f, region: e.target.value as DeliveryRegion | '' }))
              }
              className="w-full h-10 px-3 rounded-lg border border-[#e5edf5] text-[14px] text-[#273951] bg-white focus:outline-none focus:ring-2 focus:ring-[#533afd]/30 focus:border-[#533afd]"
            >
              <option value="">전체 지역</option>
              {DELIVERY_REGIONS.map((r) => (
                <option key={r} value={r}>
                  {DELIVERY_REGION_LABELS[r]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-5">
          <button
            type="button"
            onClick={handleSearch}
            className="h-10 px-6 rounded-lg bg-[#533afd] text-white text-[14px] font-[400] hover:bg-[#4434d4] transition-colors focus:outline-none focus:ring-2 focus:ring-[#533afd]/50"
            style={{ fontFeatureSettings: '"ss01"' }}
          >
            업체 찾기
          </button>
          {searched && (
            <button
              type="button"
              onClick={handleReset}
              className="h-10 px-4 rounded-lg border border-[#e5edf5] text-[14px] text-[#64748d] hover:text-[#273951] hover:border-[#b9b9f9] transition-colors focus:outline-none"
            >
              초기화
            </button>
          )}
        </div>
      </section>

      {/* ── Results ── */}
      {searched && (
        <section aria-label="매칭 결과">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[14px] text-[#64748d]">
              <span className="font-[400] text-[#273951]">{filtered.length}개</span> 업체
            </p>

            {/* Sort — 사양 일치도 / 등록순 only (광고법 §3) */}
            <div className="flex items-center gap-2 text-[13px] text-[#64748d]">
              정렬:
              {(Object.keys(SORT_LABELS) as SortKey[]).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSort(key)}
                  className={`px-3 py-1 rounded-full border transition-colors focus:outline-none ${
                    sort === key
                      ? 'border-[#533afd] text-[#533afd] bg-[#f4f3ff]'
                      : 'border-[#e5edf5] text-[#64748d] hover:border-[#b9b9f9]'
                  }`}
                >
                  {SORT_LABELS[key]}
                </button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-16 text-[14px] text-[#64748d]">
              선택하신 조건에 맞는 업체가 없습니다. 조건을 넓혀 보세요.
            </div>
          ) : (
            <ul className="space-y-4">
              {filtered.map((vendor) => (
                <li key={vendor.id}>
                  <VendorCard vendor={vendor} />
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {/* ── Disclaimer ── */}
      <div className="mt-12 pt-6 border-t border-[#e5edf5]">
        <VendorDirectoryDisclaimer />
      </div>
    </div>
  )
}

// ── §13 Vendor Card ──

function VendorCard({ vendor }: { vendor: MatchVendor }) {
  const address =
    [vendor.province, vendor.city].filter(Boolean).join(' ') || null

  const industryTags = vendor.industry_categories
    .slice(0, 2)
    .map((cat) => INDUSTRY_CATEGORY_LABELS[cat])

  return (
    <article className="bg-white rounded-xl border border-[#e5edf5] p-5 shadow-[0_1px_4px_rgba(50,50,93,0.06)] hover:shadow-[0_4px_12px_rgba(50,50,93,0.12)] transition-shadow">
      {/* 상호 */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <h3 className="text-[16px] font-[400] text-[#061b31]" style={{ fontFeatureSettings: '"ss01"' }}>
          <Link
            href={`/companies/${vendor.slug}`}
            className="hover:text-[#533afd] transition-colors focus:outline-none focus:underline"
          >
            {vendor.name}
          </Link>
        </h3>
        {industryTags.length > 0 && (
          <div className="flex gap-1 flex-shrink-0">
            {industryTags.map((tag) => (
              <span
                key={tag}
                className="text-[11px] px-2 py-0.5 rounded-full bg-[#f4f3ff] text-[#533afd] border border-[#d6d9fc] whitespace-nowrap"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* §13 공개 사업자 정보 */}
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-[13px]">
        <InfoRow label="대표자" value={null} />
        <InfoRow label="주소" value={address} />
        <InfoRow label="전화" value={vendor.phone} />
        <InfoRow label="이메일" value={vendor.email} />
        <InfoRow label="사업자등록번호" value={null} />
        <InfoRow label="통신판매업 신고번호" value={null} />
      </dl>

      {/* 홈페이지 + 상세 링크 */}
      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-[#f1f5f9]">
        {vendor.website && (
          <a
            href={vendor.website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[13px] text-[#533afd] hover:underline focus:outline-none focus:underline"
          >
            홈페이지 →
          </a>
        )}
        <Link
          href={`/companies/${vendor.slug}`}
          className="text-[13px] text-[#64748d] hover:text-[#273951] transition-colors focus:outline-none focus:underline"
        >
          업체 상세 보기
        </Link>
      </div>
    </article>
  )
}

function InfoRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex gap-2">
      <dt className="text-[#64748d] flex-shrink-0 w-[7rem]">{label}</dt>
      <dd className={value ? 'text-[#273951]' : 'text-[#c4cdd6] italic'}>
        {value ?? '정보 없음'}
      </dd>
    </div>
  )
}
