'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { DeliveryRegionSelector } from '@/components/DeliveryRegionSelector'
import type { DeliveryRegion } from '@/types'

interface CompanyDeliveryEditClientProps {
  companyId: string
  initialRegions: DeliveryRegion[]
}

export function CompanyDeliveryEditClient({
  companyId,
  initialRegions,
}: CompanyDeliveryEditClientProps) {
  const router = useRouter()
  const [regions, setRegions] = useState<DeliveryRegion[]>(initialRegions)
  const [fieldError, setFieldError] = useState<string | undefined>(undefined)
  const [apiError, setApiError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setApiError(null)
    setFieldError(undefined)
    setSaved(false)

    if (regions.length === 0) {
      setFieldError('배달 가능 지역을 1개 이상 선택해 주세요.')
      return
    }

    setSaving(true)
    try {
      const res = await fetch(`/api/admin/companies/${companyId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ delivery_regions: regions }),
      })
      const data: { error?: string } = await res.json()
      if (!res.ok) {
        setApiError(data.error ?? '저장 중 오류가 발생했습니다.')
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {apiError && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-[13px] text-red-700">
          {apiError}
        </div>
      )}

      {saved && (
        <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-[13px] text-green-700">
          배달 가능 지역이 저장되었습니다.
        </div>
      )}

      <DeliveryRegionSelector
        value={regions}
        onChange={(r) => {
          setSaved(false)
          setRegions(r)
        }}
        error={fieldError}
      />

      <div className="pt-2">
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
