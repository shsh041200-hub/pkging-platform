'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { BoxterLogo } from '@/components/BoxterLogo'
import {
  CATEGORY_LABELS,
  BUYER_CATEGORY_LABELS,
  PACKAGING_FORM_LABELS,
  type Category,
  type BuyerCategory,
  type PackagingForm,
} from '@/types'

type FormData = {
  name: string
  description: string
  category: string
  buyer_category: string
  packaging_form: string
  website: string
  email: string
  province: string
  city: string
  products: string
  certifications: string
}

const initialForm: FormData = {
  name: '',
  description: '',
  category: '',
  buyer_category: '',
  packaging_form: '',
  website: '',
  email: '',
  province: '',
  city: '',
  products: '',
  certifications: '',
}

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState<FormData>(initialForm)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const set = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
    if (error) setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    const payload = {
      name: form.name,
      description: form.description,
      category: form.category,
      buyer_category: form.buyer_category || null,
      packaging_form: form.packaging_form || null,
      website: form.website,
      email: form.email || null,
      province: form.province || null,
      city: form.city || null,
      products: form.products ? form.products.split(',').map((s) => s.trim()).filter(Boolean) : [],
      certifications: form.certifications ? form.certifications.split(',').map((s) => s.trim()).filter(Boolean) : [],
    }

    try {
      const res = await fetch('/api/companies/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error || '등록 중 오류가 발생했습니다.')
        return
      }
      router.push(`/companies/${json.data.slug}`)
    } catch {
      setError('네트워크 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass = 'w-full px-4 py-3 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-slate-900 placeholder:text-slate-400'
  const labelClass = 'block text-sm font-semibold text-slate-700 mb-1.5'
  const requiredMark = <span className="text-red-500 ml-0.5">*</span>

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-[#0F172A] sticky top-0 z-50 border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <BoxterLogo variant="dark" size="sm" />
            <span className="hidden sm:inline text-white/40 text-xs">|</span>
            <span className="hidden sm:inline text-white/50 text-xs">B2B 포장업체 디렉토리</span>
          </Link>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-8">
          <Link href="/" className="text-sm text-blue-600 hover:underline inline-flex items-center gap-1 mb-4">
            ← 목록으로
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">업체 등록</h1>
          <p className="text-sm text-slate-500 mt-2">
            포장업체 정보를 등록하세요. <span className="text-red-500">*</span> 표시는 필수 항목입니다.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
            <h2 className="text-base font-semibold text-slate-800 pb-2 border-b border-slate-100">기본 정보</h2>

            <div>
              <label className={labelClass}>업체명{requiredMark}</label>
              <input type="text" value={form.name} onChange={set('name')} required minLength={2} placeholder="예: 한국패키징" className={inputClass} />
            </div>

            <div>
              <label className={labelClass}>회사 설명{requiredMark}</label>
              <textarea value={form.description} onChange={set('description')} required minLength={10} rows={3} placeholder="업체가 하는 일, 주요 강점을 설명해주세요 (최소 10자)" className={inputClass + ' resize-none'} />
            </div>

            <div>
              <label className={labelClass}>웹사이트{requiredMark}</label>
              <input type="text" value={form.website} onChange={set('website')} required placeholder="예: https://www.example.com" className={inputClass} />
            </div>

            <div>
              <label className={labelClass}>이메일</label>
              <input type="email" value={form.email} onChange={set('email')} placeholder="예: contact@company.com" className={inputClass} />
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
            <h2 className="text-base font-semibold text-slate-800 pb-2 border-b border-slate-100">업종 분류</h2>

            <div>
              <label className={labelClass}>소재/유형{requiredMark}</label>
              <select value={form.category} onChange={set('category')} required className={inputClass}>
                <option value="">선택하세요</option>
                {(Object.entries(CATEGORY_LABELS) as [Category, string][]).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>제품 유형 (바이어 분류)</label>
              <select value={form.buyer_category} onChange={set('buyer_category')} className={inputClass}>
                <option value="">선택하세요</option>
                {(Object.entries(BUYER_CATEGORY_LABELS) as [BuyerCategory, string][]).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>포장 형태</label>
              <select value={form.packaging_form} onChange={set('packaging_form')} className={inputClass}>
                <option value="">선택하세요</option>
                {(Object.entries(PACKAGING_FORM_LABELS) as [PackagingForm, string][]).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
            <h2 className="text-base font-semibold text-slate-800 pb-2 border-b border-slate-100">위치 및 제품</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>시/도</label>
                <input type="text" value={form.province} onChange={set('province')} placeholder="예: 경기도" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>시/군/구</label>
                <input type="text" value={form.city} onChange={set('city')} placeholder="예: 수원시" className={inputClass} />
              </div>
            </div>

            <div>
              <label className={labelClass}>취급 제품</label>
              <input type="text" value={form.products} onChange={set('products')} placeholder="콤마(,)로 구분 — 예: 택배박스, 완충재, 테이프" className={inputClass} />
              <p className="text-xs text-slate-400 mt-1">콤마(,)로 구분하여 입력하세요</p>
            </div>

            <div>
              <label className={labelClass}>보유 인증</label>
              <input type="text" value={form.certifications} onChange={set('certifications')} placeholder="콤마(,)로 구분 — 예: ISO 9001, FSC 인증" className={inputClass} />
              <p className="text-xs text-slate-400 mt-1">콤마(,)로 구분하여 입력하세요</p>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#0F172A] hover:bg-[#1e293b] text-white font-semibold py-4 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {submitting ? '등록 중...' : '업체 등록하기'}
          </button>
        </form>
      </div>

      <footer className="border-t border-slate-200 bg-white mt-auto py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-xs text-slate-400">
              © 2026 BOXTER. 본 서비스의 업체 정보는 공개된 출처에서 자동 수집되었습니다.
              정보 오류·삭제 요청: privacy@pkging.kr
            </p>
            <div className="flex gap-4 text-xs text-slate-400">
              <Link href="/privacy" className="hover:text-slate-600">개인정보처리방침</Link>
              <Link href="/terms" className="hover:text-slate-600">이용약관</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
