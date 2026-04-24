'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { UseCaseTag } from '@/types'

interface UseCaseTagEditClientProps {
  companyId: string
  allTags: UseCaseTag[]
  initialTags: string[]
}

interface ApiErrorResponse {
  error?: { message?: string } | string
}

export function UseCaseTagEditClient({
  companyId,
  allTags,
  initialTags,
}: UseCaseTagEditClientProps) {
  const router = useRouter()
  const [selectedTags, setSelectedTags] = useState<string[]>(initialTags)
  const [apiError, setApiError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  function toggleTag(slug: string) {
    setSaved(false)
    setSelectedTags((prev) =>
      prev.includes(slug) ? prev.filter((t) => t !== slug) : [...prev, slug]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setApiError(null)
    setSaved(false)
    setSaving(true)

    try {
      const res = await fetch(`/api/admin/companies/${companyId}/use-case-tags`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ use_case_tags: selectedTags }),
      })
      const data: ApiErrorResponse = await res.json()
      if (!res.ok) {
        const errMsg =
          typeof data.error === 'object'
            ? (data.error?.message ?? '저장 중 오류가 발생했습니다.')
            : (data.error ?? '저장 중 오류가 발생했습니다.')
        setApiError(errMsg)
        return
      }
      setSaved(true)
      router.refresh()
    } catch {
      setApiError('네트워크 오류가 발생했습니다. 다시 시도해 주세요.')
    } finally {
      setSaving(false)
    }
  }

  if (allTags.length === 0) {
    return (
      <p className="text-[13px] text-gray-400">
        등록된 use-case 태그가 없습니다. 먼저 태그를 등록해 주세요.
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {apiError && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-[13px] text-red-700">
          {apiError}
        </div>
      )}

      {saved && (
        <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-[13px] text-green-700">
          Use-case 태그가 저장되었습니다.
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {allTags.map((tag) => {
          const isSelected = selectedTags.includes(tag.slug)
          return (
            <button
              key={tag.id}
              type="button"
              onClick={() => toggleTag(tag.slug)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium border transition-all ${
                isSelected
                  ? 'bg-[#C2410C] text-white border-[#C2410C]'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400 hover:text-gray-900'
              }`}
            >
              <span>{tag.icon}</span>
              {tag.label}
              {isSelected && (
                <span className="text-white/70 text-[11px] leading-none ml-0.5">✓</span>
              )}
            </button>
          )
        })}
      </div>

      <div className="pt-1">
        <button
          type="submit"
          disabled={saving}
          className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-[#C2410C] text-white text-[14px] font-semibold hover:bg-[#9A3412] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {saving ? '저장 중...' : '저장'}
        </button>
      </div>
    </form>
  )
}
