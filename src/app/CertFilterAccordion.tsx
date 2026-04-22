'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { CertificationCategory, CertificationType } from '@/types'

type Props = {
  certsByCategory: Record<CertificationCategory, CertificationType[]>
  activeCerts: string[]
  certCategoryColors: Record<CertificationCategory, { active: string; inactive: string }>
  certCategoryLabels: Record<CertificationCategory, string>
  certUrls: Record<string, string>
}

const CERT_CATEGORY_ORDER: CertificationCategory[] = ['quality', 'food_safety', 'environmental', 'pharma', 'general']

export function CertFilterAccordion({
  certsByCategory,
  activeCerts,
  certCategoryColors,
  certCategoryLabels,
  certUrls,
}: Props) {
  const [open, setOpen] = useState(activeCerts.length > 0)

  return (
    <div className="pb-2.5">
      <button
        onClick={() => setOpen(!open)}
        className={`text-[11px] font-medium flex items-center gap-1.5 py-1 transition-colors ${
          activeCerts.length > 0 ? 'text-green-700 hover:text-green-800' : 'text-gray-400 hover:text-gray-600'
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
        인증 필터
        {activeCerts.length > 0 && (
          <span className="bg-green-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
            {activeCerts.length}
          </span>
        )}
      </button>

      <div
        className={`grid transition-[grid-template-rows] duration-200 ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
      >
        <div className="overflow-hidden">
          <div className="pt-2 space-y-3 pb-1">
            {CERT_CATEGORY_ORDER.map((cat) => {
              const certs = certsByCategory[cat]
              if (!certs || certs.length === 0) return null
              return (
                <div key={cat}>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1.5">
                    {certCategoryLabels[cat]}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {certs.map((ct) => {
                      const isActive = activeCerts.includes(ct.id)
                      const colors = certCategoryColors[cat]
                      return (
                        <Link
                          key={ct.id}
                          href={certUrls[ct.id] ?? '/'}
                          className={`flex-shrink-0 px-2.5 py-1 rounded text-[11px] font-medium transition-all border ${
                            isActive ? colors.active : colors.inactive
                          }`}
                        >
                          {ct.label}
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
