'use client'

import { useEffect, useState, useCallback } from 'react'
import { CATEGORY_LABELS, type Category, type Company } from '@/types'

const EMPTY_FORM = {
  name: '',
  slug: '',
  category: 'saneobyong' as Category,
  description: '',
  subcategory: '',
  address: '',
  city: '',
  province: '',
  phone: '',
  email: '',
  website: '',
  products: '',
  certifications: '',
  is_verified: false,
}

type FormState = typeof EMPTY_FORM

function toPayload(form: FormState) {
  return {
    ...form,
    products: form.products
      ? form.products.split(',').map((s) => s.trim()).filter(Boolean)
      : [],
    certifications: form.certifications
      ? form.certifications.split(',').map((s) => s.trim()).filter(Boolean)
      : [],
  }
}

function fromCompany(c: Company): FormState {
  return {
    name: c.name,
    slug: c.slug,
    category: c.category,
    description: c.description ?? '',
    subcategory: c.subcategory ?? '',
    address: c.address ?? '',
    city: c.city ?? '',
    province: c.province ?? '',
    phone: c.phone ?? '',
    email: c.email ?? '',
    website: c.website ?? '',
    products: (c.products ?? []).join(', '),
    certifications: (c.certifications ?? []).join(', '),
    is_verified: c.is_verified,
  }
}

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

export default function AdminCompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modal, setModal] = useState<'add' | 'edit' | null>(null)
  const [editTarget, setEditTarget] = useState<Company | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const fetchCompanies = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/admin/companies')
    const json = await res.json()
    if (!res.ok) {
      setError(json.error ?? '불러오기 실패')
    } else {
      setCompanies(json.data ?? [])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchCompanies()
  }, [fetchCompanies])

  function openAdd() {
    setForm(EMPTY_FORM)
    setFormError('')
    setEditTarget(null)
    setModal('add')
  }

  function openEdit(company: Company) {
    setForm(fromCompany(company))
    setFormError('')
    setEditTarget(company)
    setModal('edit')
  }

  function closeModal() {
    setModal(null)
    setEditTarget(null)
    setFormError('')
  }

  function handleNameChange(name: string) {
    setForm((f) => ({
      ...f,
      name,
      slug: modal === 'add' ? slugify(name) : f.slug,
    }))
  }

  async function handleSave() {
    setSaving(true)
    setFormError('')
    const payload = toPayload(form)
    const url =
      modal === 'edit' && editTarget
        ? `/api/admin/companies/${editTarget.id}`
        : '/api/admin/companies'
    const method = modal === 'edit' ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const json = await res.json()
    if (!res.ok) {
      setFormError(json.error ?? '저장 실패')
    } else {
      closeModal()
      fetchCompanies()
    }
    setSaving(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('정말 삭제하시겠습니까?')) return
    setDeleteId(id)
    const res = await fetch(`/api/admin/companies/${id}`, { method: 'DELETE' })
    if (!res.ok) {
      const json = await res.json()
      alert(json.error ?? '삭제 실패')
    } else {
      fetchCompanies()
    }
    setDeleteId(null)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">업체 관리</h1>
        <button
          onClick={openAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          + 새 업체 추가
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>
      )}

      {loading ? (
        <div className="text-center py-20 text-gray-400">불러오는 중...</div>
      ) : companies.length === 0 ? (
        <div className="text-center py-20 text-gray-400">등록된 업체가 없습니다.</div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">업체명</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">카테고리</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">지역</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">슬러그</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">인증</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">작업</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {companies.map((company) => (
                <tr key={company.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">{company.name}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {CATEGORY_LABELS[company.category] ?? company.category}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {company.province} {company.city}
                  </td>
                  <td className="px-4 py-3 text-gray-400 font-mono text-xs">{company.slug}</td>
                  <td className="px-4 py-3 text-center">
                    {company.is_verified ? (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                        인증
                      </span>
                    ) : (
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                        미인증
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(company)}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => handleDelete(company.id)}
                        disabled={deleteId === company.id}
                        className="text-sm text-red-500 hover:text-red-700 font-medium disabled:opacity-50"
                      >
                        {deleteId === company.id ? '삭제 중...' : '삭제'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center overflow-y-auto py-8 px-4">
          <div className="bg-white rounded-2xl border border-gray-200 w-full max-w-2xl p-6 my-auto">
            <h2 className="text-lg font-bold text-gray-900 mb-5">
              {modal === 'add' ? '새 업체 추가' : '업체 수정'}
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  업체명 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="예: 한국패키징"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  슬러그 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="hangook-packaging"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  카테고리 <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as Category }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {(Object.entries(CATEGORY_LABELS) as [Category, string][]).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">시/도</label>
                <input
                  type="text"
                  value={form.province}
                  onChange={(e) => setForm((f) => ({ ...f, province: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="경기도"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">시/구</label>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="수원시"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">전화번호</label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="031-000-0000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">주소</label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  제품 목록{' '}
                  <span className="text-xs text-gray-400">(쉼표로 구분)</span>
                </label>
                <input
                  type="text"
                  value={form.products}
                  onChange={(e) => setForm((f) => ({ ...f, products: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="골판지 박스, 완충재, 테이프"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  인증 목록{' '}
                  <span className="text-xs text-gray-400">(쉼표로 구분)</span>
                </label>
                <input
                  type="text"
                  value={form.certifications}
                  onChange={(e) => setForm((f) => ({ ...f, certifications: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="ISO 9001, FSC"
                />
              </div>

              <div className="col-span-2 flex items-center gap-2">
                <input
                  id="is_verified"
                  type="checkbox"
                  checked={form.is_verified}
                  onChange={(e) => setForm((f) => ({ ...f, is_verified: e.target.checked }))}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600"
                />
                <label htmlFor="is_verified" className="text-sm text-gray-700">
                  인증 업체로 표시
                </label>
              </div>
            </div>

            {formError && (
              <div className="mt-4 bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">
                {formError}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
              >
                취소
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {saving ? '저장 중...' : modal === 'add' ? '추가' : '저장'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
