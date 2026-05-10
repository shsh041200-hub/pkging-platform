'use client'

import Link from 'next/link'
import { useState } from 'react'
import { CATEGORIES, SAMPLE_VENDORS, SAMPLE_GUIDES, VENDOR_COUNT, CATEGORY_COUNT } from '../main-r3/_shared'

const DIRECTORY_SECTIONS = [
  { label: '골판지·종이 포장', count: 320, href: '/categories/corrugated', items: ['택배박스', '단상자', '골판지 원단', '고중량박스'] },
  { label: '비닐·플라스틱 포장', count: 218, href: '/categories/plastic', items: ['OPP 봉투', 'PE 봉투', '지퍼백', '진공포장'] },
  { label: '완충재·기포지', count: 167, href: '/categories/cushioning', items: ['기포지', '에어캡', 'EPE 폼', '스티로폼'] },
  { label: '식품 포장재', count: 201, href: '/categories/food', items: ['도시락 용기', '종이컵', '위생봉투', '냉동용기'] },
  { label: '친환경 포장재', count: 143, href: '/categories/eco', items: ['생분해 필름', '종이 포장', 'FSC 인증 박스', '재활용 소재'] },
  { label: '라벨·스티커', count: 178, href: '/categories/label', items: ['바코드 라벨', '롤 스티커', '방수 라벨', '보안봉인'] },
]

export function MainR3V07Client() {
  const [openSection, setOpenSection] = useState<string | null>('골판지·종이 포장')

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Header */}
      <header className="bg-[#061b31] sticky top-0 z-50 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between">
          <Link href="/design-preview/main-r3" className="text-white font-semibold tracking-tight text-lg">Packlinx</Link>
          <nav className="flex items-center gap-4 text-sm text-slate-300">
            <Link href="#" className="hover:text-white transition-colors">카테고리</Link>
            <Link href="#" className="hover:text-white transition-colors">가이드</Link>
            <Link href="#" className="text-white border border-white/20 px-3 py-1.5 rounded hover:bg-white/10 transition-colors">업체 등록</Link>
          </nav>
        </div>
      </header>

      {/* Hero — large number stats */}
      <section className="bg-[#061b31] text-white border-b border-white/10">
        <div className="max-w-6xl mx-auto px-5 py-20">
          <div className="max-w-xl mb-12">
            <p className="text-xs font-semibold tracking-widest uppercase text-[#b9b9f9] mb-4">포장재 업체 디렉토리</p>
            <h1 className="text-[40px] sm:text-[52px] font-light text-white leading-[1.1] tracking-[-0.04em]">
              한국 포장재 업계<br />전체를 한눈에
            </h1>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 mb-12">
            <div className="border border-white/10 rounded-xl p-6 bg-white/[0.04]">
              <p className="text-[44px] font-light text-white tracking-[-0.04em]">{VENDOR_COUNT}</p>
              <p className="text-[13px] text-slate-400 mt-1">등록 업체 수</p>
            </div>
            <div className="border border-white/10 rounded-xl p-6 bg-white/[0.04]">
              <p className="text-[44px] font-light text-white tracking-[-0.04em]">{CATEGORY_COUNT}</p>
              <p className="text-[13px] text-slate-400 mt-1">포장 카테고리</p>
            </div>
            <div className="border border-white/10 rounded-xl p-6 bg-white/[0.04] col-span-2 sm:col-span-1">
              <p className="text-[44px] font-light text-white tracking-[-0.04em]">무료</p>
              <p className="text-[13px] text-slate-400 mt-1">검색·비교 이용</p>
            </div>
          </div>

          <Link
            href="/"
            className="inline-block bg-[#533afd] hover:bg-[#4434d4] text-white px-6 py-3 rounded font-medium text-sm transition-colors"
          >
            업체 찾기 →
          </Link>
        </div>
      </section>

      {/* Category directory — accordion */}
      <section className="max-w-6xl mx-auto px-5 py-16">
        <h2 className="text-xl font-light text-[#061b31] tracking-[-0.02em] mb-8">카테고리 디렉토리</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {DIRECTORY_SECTIONS.map((sec) => (
            <div key={sec.label} className="border border-[#e5edf5] rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => setOpenSection(openSection === sec.label ? null : sec.label)}
                className="w-full flex items-center justify-between px-5 py-4 bg-white hover:bg-[#f6f9fc] transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#533afd]/40" />
                  <span className="text-[14px] font-semibold text-[#061b31]">{sec.label}</span>
                  <span className="text-[12px] text-[#64748d]">{sec.count.toLocaleString()}개</span>
                </div>
                <span className={`text-[#64748d] text-sm transition-transform ${openSection === sec.label ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </button>
              {openSection === sec.label && (
                <div className="px-5 pb-4 bg-[#f6f9fc] border-t border-[#e5edf5]">
                  <div className="flex flex-wrap gap-2 mt-3">
                    {sec.items.map((item) => (
                      <Link
                        key={item}
                        href={sec.href}
                        className="text-[12px] text-[#533afd] border border-[#b9b9f9] px-3 py-1 rounded-full hover:bg-[rgba(83,58,253,0.05)] transition-colors"
                      >
                        {item}
                      </Link>
                    ))}
                    <Link
                      href={sec.href}
                      className="text-[12px] font-medium text-[#533afd] ml-auto self-center"
                    >
                      더 보기 →
                    </Link>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Recent vendor highlight */}
      <section className="border-t border-[#e5edf5] bg-[#f6f9fc]">
        <div className="max-w-6xl mx-auto px-5 py-16">
          <h2 className="text-xl font-light text-[#061b31] tracking-[-0.02em] mb-8">
            최근 등록 업체
            <Link href="/" className="ml-4 text-[13px] text-[#533afd] font-normal">전체 보기 →</Link>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {SAMPLE_VENDORS.slice(0, 3).map((v) => (
              <Link
                key={v.name}
                href={v.href}
                className="group border border-[#e5edf5] rounded-lg p-4 bg-white hover:border-[#533afd]/30 transition-all"
              >
                <div className="w-8 h-8 rounded bg-[rgba(83,58,253,0.08)] flex items-center justify-center mb-3">
                  <span className="text-[#533afd] font-semibold text-sm">{v.name[0]}</span>
                </div>
                <h3 className="font-medium text-[#061b31] text-[14px] mb-1">{v.name}</h3>
                <p className="text-[12px] text-[#64748d]">{v.category}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Guides */}
      <section className="border-t border-[#e5edf5] bg-white">
        <div className="max-w-6xl mx-auto px-5 py-16">
          <h2 className="text-xl font-light text-[#061b31] tracking-[-0.02em] mb-8">
            포장재 가이드
            <Link href="/guides" className="ml-4 text-[13px] text-[#533afd] font-normal">전체 보기 →</Link>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {SAMPLE_GUIDES.slice(0, 2).map((g) => (
              <Link
                key={g.title}
                href={g.href}
                className="group border border-[#e5edf5] rounded-lg p-5 bg-white hover:border-[#533afd]/20 transition-colors"
              >
                <span className="text-[11px] font-medium text-[#533afd] bg-[rgba(83,58,253,0.06)] px-2.5 py-1 rounded mb-3 inline-block">{g.category}</span>
                <h3 className="text-[14px] font-medium text-[#061b31] leading-snug group-hover:text-[#533afd] transition-colors">{g.title}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-[#061b31] text-slate-400 text-xs py-8 px-5">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <span className="text-white font-semibold">Packlinx</span>
          <span>© 2026 PACKLINX. 업체 정보는 공개된 출처에서 수집되었습니다.</span>
          <Link href="/design-preview/main-r3" className="text-[#b9b9f9] hover:text-white transition-colors">← r3 비교 목록</Link>
        </div>
      </footer>
    </div>
  )
}
