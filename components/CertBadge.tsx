import { CERTIFICATION_TYPES, type CertificationCategory } from '@/types'

export interface CertBadgeProps {
  cert: string
  variant?: 'compact' | 'full'
}

const CERT_CATEGORY_COLORS: Record<CertificationCategory, { bg: string; text: string; border: string }> = {
  quality:       { bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200' },
  food_safety:   { bg: 'bg-green-50',   text: 'text-green-700',   border: 'border-green-200' },
  environmental: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  pharma:        { bg: 'bg-purple-50',  text: 'text-purple-700',  border: 'border-purple-200' },
  general:       { bg: 'bg-gray-50',    text: 'text-gray-700',    border: 'border-gray-200' },
}

function resolveCertification(raw: string) {
  return (
    CERTIFICATION_TYPES.find(
      (c) => c.id === raw || c.aliases.some((a) => a.toLowerCase() === raw.toLowerCase()),
    ) ?? null
  )
}

export function CertBadge({ cert, variant = 'compact' }: CertBadgeProps) {
  const resolved = resolveCertification(cert)
  const category: CertificationCategory = resolved?.category ?? 'general'
  const colors = CERT_CATEGORY_COLORS[category]
  const label = resolved?.label ?? cert

  if (variant === 'full') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 rounded-md border ${colors.bg} ${colors.text} ${colors.border}`}
      >
        <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        {label}
      </span>
    )
  }

  return (
    <span
      className={`text-[11px] font-medium px-2 py-0.5 rounded border ${colors.bg} ${colors.text} ${colors.border}`}
    >
      {label}
    </span>
  )
}
