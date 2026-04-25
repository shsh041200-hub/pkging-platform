'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { PacklinxLogo } from '@/components/PacklinxLogo'

// --- Mock Data (no Supabase) ---

const MOCK_COMPANIES = [
  { id: 1, name: '한솔패키지', slug: 'hansol-package', category: '식품·음료', material: '종이·골판지', form: '박스·케이스', certs: ['HACCP', 'ISO 9001'], verified: true, description: '식품용 골판지 박스 전문 제조. 냉동·냉장 포장재 맞춤 설계.' },
  { id: 2, name: '그린팩', slug: 'green-pack', category: '친환경·특수', material: '친환경 소재', form: '파우치·백', certs: ['FSC', 'OK Compost'], verified: true, description: 'FSC 인증 친환경 파우치·백 전문. 생분해성 필름 포장재.' },
  { id: 3, name: '코스팩코리아', slug: 'cospack-korea', category: '화장품·뷰티', material: '플라스틱·용기', form: '병·용기', certs: ['ISO 9001', 'GMP'], verified: false, description: '화장품 용기 ODM/OEM. 스킨케어·메이크업 용기 전문.' },
  { id: 4, name: '대한포장', slug: 'daehan-packaging', category: '이커머스·배송', material: '종이·골판지', form: '박스·케이스', certs: ['ISO 14001'], verified: true, description: '이커머스 택배박스 대량 생산. 자체 골판지 공장 보유.' },
  { id: 5, name: '필름텍', slug: 'filmtech', category: '식품·음료', material: '필름·파우치', form: '파우치·백', certs: ['HACCP'], verified: false, description: '식품용 레토르트 파우치·진공포장 필름 전문 제조.' },
  { id: 6, name: '메디팩', slug: 'medipak', category: '의약품·건강', material: '플라스틱·용기', form: '병·용기', certs: ['GMP', 'ISO 13485'], verified: true, description: '의약품·건강기능식품 포장 전문. GMP 인증 클린룸 생산.' },
  { id: 7, name: '에코라벨', slug: 'eco-label', category: '인쇄·디자인', material: '라벨·인쇄물', form: '라벨·스티커', certs: ['FSC'], verified: false, description: '친환경 라벨·스티커 인쇄 전문. 소량 맞춤 주문 가능.' },
  { id: 8, name: '글래스원', slug: 'glass-one', category: '식품·음료', material: '유리·금속', form: '병·용기', certs: ['ISO 9001', 'HACCP'], verified: true, description: '유리병·금속캔 포장 전문. 음료·조미료 용기 대량 공급.' },
]

const FILTER_CONFIG = {
  cert: { label: '인증', options: ['HACCP', 'ISO 9001', 'ISO 14001', 'FSC', 'GMP', 'OK Compost', 'ISO 13485'] },
  material: { label: '소재', options: ['종이·골판지', '플라스틱·용기', '필름·파우치', '유리·금속', '라벨·인쇄물', '친환경 소재'] },
  form: { label: '형태', options: ['박스·케이스', '파우치·백', '병·용기', '라벨·스티커'] },
  useCase: { label: '용도', options: ['식품·음료', '화장품·뷰티', '의약품·건강', '이커머스·배송', '친환경·특수', '인쇄·디자인'] },
} as const

type FilterKey = keyof typeof FILTER_CONFIG

export default function CategoryFilterPreview() {
  const [activeDropdown, setActiveDropdown] = useState<FilterKey | null>(null)
  const [selectedFilters, setSelectedFilters] = useState<Record<FilterKey, Set<string>>>({
    cert: new Set(),
    material: new Set(),
    form: new Set(),
    useCase: new Set(),
  })
  const [sampleOnly, setSampleOnly] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setActiveDropdown(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const toggleFilter = (key: FilterKey, value: string) => {
    setSelectedFilters(prev => {
      const next = new Map(Object.entries(prev)) as unknown as Record<FilterKey, Set<string>>
      const updated = new Set(prev[key])
      if (updated.has(value)) updated.delete(value)
      else updated.add(value)
      return { ...prev, [key]: updated }
    })
  }

  const clearAll = () => {
    setSelectedFilters({ cert: new Set(), material: new Set(), form: new Set(), useCase: new Set() })
    setSampleOnly(false)
  }

  const activeChips = Object.entries(selectedFilters).flatMap(([key, set]) =>
    Array.from(set).map(val => ({ key: key as FilterKey, value: val }))
  )
  const hasFilters = activeChips.length > 0 || sampleOnly

  const filtered = MOCK_COMPANIES.filter(c => {
    if (selectedFilters.material.size > 0 && !selectedFilters.material.has(c.material)) return false
    if (selectedFilters.form.size > 0 && !selectedFilters.form.has(c.form)) return false
    if (selectedFilters.cert.size > 0 && !c.certs.some(cert => selectedFilters.cert.has(cert))) return false
    if (selectedFilters.useCase.size > 0 && !selectedFilters.useCase.has(c.category)) return false
    return true
  })

  return (
    <div className="min-h-screen bg-white font-[family-name:var(--font-pretendard)]">
      {/* Header */}
      <header className="bg-[#0F172A] text-white">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <PacklinxLogo className="h-6 w-auto" />
          </Link>
          <span className="text-xs text-slate-400 border border-slate-600 rounded px-2 py-0.5">
            디자인 프리뷰
          </span>
        </div>
      </header>

      {/* Category Hero */}
      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">식품 포장업체</h1>
          <p className="mt-1 text-sm text-slate-500">{filtered.length}개 업체</p>
        </div>
      </section>

      {/* Desktop Filter Bar */}
      <div className="sticky top-0 z-30 border-b border-slate-200 bg-white" ref={dropdownRef}>
        <div className="mx-auto max-w-7xl px-4">
          {/* Desktop */}
          <div className="hidden sm:flex items-center gap-2 py-2.5">
            {(Object.entries(FILTER_CONFIG) as [FilterKey, typeof FILTER_CONFIG[FilterKey]][]).map(([key, config]) => {
              const count = selectedFilters[key].size
              const isActive = activeDropdown === key
              return (
                <div key={key} className="relative">
                  <button
                    onClick={() => setActiveDropdown(isActive ? null : key)}
                    className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                      count > 0
                        ? 'border-orange-700 text-orange-700 bg-orange-50'
                        : 'border-slate-300 text-slate-700 bg-white hover:border-slate-400'
                    }`}
                  >
                    {config.label}
                    {count > 0 && (
                      <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-orange-700 px-1 text-[10px] font-bold text-white">
                        {count}
                      </span>
                    )}
                    <svg className={`h-3.5 w-3.5 transition-transform ${isActive ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </button>

                  {isActive && (
                    <div className="absolute left-0 top-full mt-1 w-64 rounded-lg border border-slate-200 bg-white p-3 shadow-lg z-40">
                      <div className="space-y-1.5 max-h-56 overflow-y-auto">
                        {config.options.map(opt => (
                          <label key={opt} className="flex items-center gap-2 rounded px-2 py-1.5 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedFilters[key].has(opt)}
                              onChange={() => toggleFilter(key, opt)}
                              className="h-4 w-4 rounded border-slate-300 text-orange-700 focus:ring-orange-700"
                            />
                            {opt}
                          </label>
                        ))}
                      </div>
                      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2">
                        <button
                          onClick={() => setSelectedFilters(prev => ({ ...prev, [key]: new Set() }))}
                          className="text-xs text-slate-500 hover:text-slate-700"
                        >
                          초기화
                        </button>
                        <button
                          onClick={() => setActiveDropdown(null)}
                          className="rounded-md bg-orange-700 px-3 py-1 text-xs font-medium text-white hover:bg-orange-800"
                        >
                          적용
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}

            {/* Sample toggle */}
            <button
              onClick={() => setSampleOnly(!sampleOnly)}
              className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                sampleOnly
                  ? 'border-orange-700 text-orange-700 bg-orange-50'
                  : 'border-slate-300 text-slate-700 bg-white hover:border-slate-400'
              }`}
            >
              샘플 가능
            </button>

            <div className="ml-auto flex items-center gap-3">
              <span className="text-sm text-slate-500 font-medium">{filtered.length}개 업체</span>
              <select className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-700">
                <option>추천순</option>
                <option>최신순</option>
                <option>이름순</option>
              </select>
            </div>
          </div>

          {/* Mobile */}
          <div className="flex sm:hidden items-center justify-between py-2.5">
            <button
              onClick={() => setMobileOpen(true)}
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium ${
                hasFilters
                  ? 'border-orange-700 text-orange-700 bg-orange-50'
                  : 'border-slate-300 text-slate-700'
              }`}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              필터
              {activeChips.length > 0 && (
                <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-orange-700 px-1 text-[10px] font-bold text-white">
                  {activeChips.length}
                </span>
              )}
            </button>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">{filtered.length}개</span>
              <select className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-700">
                <option>추천순</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Active filter chips */}
      {hasFilters && (
        <div className="border-b border-slate-100 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-2 flex flex-wrap items-center gap-2">
            {activeChips.map(({ key, value }) => (
              <button
                key={`${key}-${value}`}
                onClick={() => toggleFilter(key, value)}
                className="flex items-center gap-1 rounded-full border border-orange-200 bg-orange-50 px-2.5 py-1 text-xs font-medium text-orange-700"
              >
                {value}
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            ))}
            {sampleOnly && (
              <button
                onClick={() => setSampleOnly(false)}
                className="flex items-center gap-1 rounded-full border border-orange-200 bg-orange-50 px-2.5 py-1 text-xs font-medium text-orange-700"
              >
                샘플 가능
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
            <button onClick={clearAll} className="text-xs text-slate-500 hover:text-slate-700 ml-1">
              전체 초기화
            </button>
          </div>
        </div>
      )}

      {/* Company Grid */}
      <main className="mx-auto max-w-7xl px-4 py-6">
        {filtered.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-lg font-medium text-slate-900">검색 결과가 없습니다</p>
            <p className="mt-1 text-sm text-slate-500">다른 필터 조합을 시도해 보세요.</p>
            <button onClick={clearAll} className="mt-4 rounded-lg bg-orange-700 px-4 py-2 text-sm font-medium text-white hover:bg-orange-800">
              필터 초기화
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map(company => (
              <div
                key={company.id}
                className="group rounded-xl border border-slate-200 bg-white p-5 transition-shadow hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-sm font-bold text-slate-600">
                      {company.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">{company.name}</h3>
                      <p className="text-xs text-slate-500">{company.category}</p>
                    </div>
                  </div>
                  {company.verified && (
                    <span className="flex items-center gap-0.5 rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-medium text-green-700 border border-green-200">
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      인증됨
                    </span>
                  )}
                </div>

                <p className="mt-3 text-sm text-slate-600 line-clamp-2">{company.description}</p>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600">{company.material}</span>
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600">{company.form}</span>
                </div>

                {company.certs.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {company.certs.map(cert => (
                      <span key={cert} className="rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700 border border-blue-100">
                        {cert}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-4 pt-3 border-t border-slate-100">
                  <button className="w-full rounded-lg bg-orange-700 py-2 text-sm font-medium text-white hover:bg-orange-800 transition-colors">
                    업체 상세보기
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Mobile Bottom Sheet */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 sm:hidden">
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => setMobileOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-2xl bg-white">
            <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 rounded-t-2xl">
              <h2 className="text-base font-semibold text-slate-900">필터</h2>
              <button onClick={() => setMobileOpen(false)} className="text-slate-500">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-4 py-3 space-y-4">
              {(Object.entries(FILTER_CONFIG) as [FilterKey, typeof FILTER_CONFIG[FilterKey]][]).map(([key, config]) => (
                <MobileFilterSection
                  key={key}
                  label={config.label}
                  options={config.options as unknown as string[]}
                  selected={selectedFilters[key]}
                  onToggle={(val) => toggleFilter(key, val)}
                />
              ))}

              <div className="flex items-center justify-between py-2">
                <span className="text-sm font-medium text-slate-700">샘플 가능</span>
                <button
                  onClick={() => setSampleOnly(!sampleOnly)}
                  className={`relative h-6 w-11 rounded-full transition-colors ${sampleOnly ? 'bg-orange-700' : 'bg-slate-300'}`}
                >
                  <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${sampleOnly ? 'left-[22px]' : 'left-0.5'}`} />
                </button>
              </div>
            </div>

            <div className="sticky bottom-0 border-t border-slate-200 bg-white p-4">
              <button
                onClick={() => setMobileOpen(false)}
                className="w-full rounded-lg bg-orange-700 py-3 text-sm font-semibold text-white hover:bg-orange-800"
              >
                {filtered.length}개 업체 보기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-6 text-center">
          <p className="text-xs text-slate-400">
            디자인 프리뷰 — KOR-552 카테고리 필터 개선안 (권고안 A v2)
          </p>
          <p className="mt-1 text-xs text-slate-400">
            이 페이지는 정적 목업이며 실제 데이터와 연결되지 않습니다.
          </p>
        </div>
      </footer>
    </div>
  )
}

function MobileFilterSection({ label, options, selected, onToggle }: {
  label: string
  options: string[]
  selected: Set<string>
  onToggle: (val: string) => void
}) {
  const [open, setOpen] = useState(false)
  const count = selected.size

  return (
    <div className="border-b border-slate-100 pb-3">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-1"
      >
        <span className="text-sm font-medium text-slate-900">
          {label}
          {count > 0 && <span className="ml-1.5 text-orange-700">({count})</span>}
        </span>
        <svg className={`h-4 w-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>
      {open && (
        <div className="mt-2 space-y-1">
          {options.map(opt => (
            <label key={opt} className="flex items-center gap-2.5 rounded px-1 py-1.5 text-sm text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={selected.has(opt)}
                onChange={() => onToggle(opt)}
                className="h-4 w-4 rounded border-slate-300 text-orange-700 focus:ring-orange-700"
              />
              {opt}
            </label>
          ))}
        </div>
      )}
    </div>
  )
}
