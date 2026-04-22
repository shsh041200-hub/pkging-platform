'use client'

import Image from 'next/image'
import { useState } from 'react'

interface FallbackStyle {
  bg: string
  text: string
}

const CATEGORY_COLORS: Record<string, FallbackStyle> = {
  paper:                    { bg: 'bg-emerald-50', text: 'text-emerald-600' },
  plastic:                  { bg: 'bg-purple-50',  text: 'text-purple-600' },
  metal:                    { bg: 'bg-gray-100',   text: 'text-gray-600' },
  flexible:                 { bg: 'bg-blue-50',    text: 'text-blue-600' },
  eco:                      { bg: 'bg-green-50',   text: 'text-green-600' },
  glass:                    { bg: 'bg-gray-100',   text: 'text-gray-600' },
  'food-beverage':          { bg: 'bg-amber-50',   text: 'text-amber-600' },
  'ecommerce-shipping':     { bg: 'bg-blue-50',    text: 'text-blue-600' },
  'cosmetics-beauty':       { bg: 'bg-rose-50',    text: 'text-rose-600' },
  'pharma-health':          { bg: 'bg-purple-50',  text: 'text-purple-600' },
  'electronics-industrial': { bg: 'bg-blue-50',    text: 'text-blue-600' },
  'eco-special':            { bg: 'bg-green-50',   text: 'text-green-600' },
}

const DEFAULT_STYLE: FallbackStyle = { bg: 'bg-gray-100', text: 'text-gray-500' }

export interface CompanyIconProps {
  iconUrl: string | null
  name: string
  category: string
  size: 'sm' | 'lg'
  linkUrl?: string | null
}

export function CompanyIcon({ iconUrl, name, category, size, linkUrl }: CompanyIconProps) {
  const [errored, setErrored] = useState(false)

  const style = CATEGORY_COLORS[category] ?? DEFAULT_STYLE
  const showImage = !!iconUrl && !errored

  const px = size === 'sm' ? 32 : 56
  const sizeClass = size === 'sm' ? 'w-8 h-8' : 'w-14 h-14'
  const roundedClass = size === 'sm' ? 'rounded-lg' : 'rounded-xl'
  const textClass = size === 'sm' ? 'text-sm font-bold' : 'text-xl font-bold'
  const initial = name.charAt(0)

  const containerBase = `${sizeClass} ${roundedClass} flex items-center justify-center flex-shrink-0 overflow-hidden border border-gray-200`
  const containerColor = showImage ? 'bg-white' : style.bg

  const imgEl = showImage ? (
    <Image
      src={iconUrl}
      alt={`${name} 아이콘`}
      width={px}
      height={px}
      className="w-full h-full object-contain"
      onError={() => setErrored(true)}
    />
  ) : (
    <span className={`${textClass} ${style.text}`}>{initial}</span>
  )

  if (showImage && linkUrl) {
    return (
      <a
        href={linkUrl}
        target="_blank"
        rel="noopener noreferrer"
        title={`${name} 사이트 바로가기`}
        className={`${containerBase} ${containerColor} relative z-10`}
        onClick={(e) => e.stopPropagation()}
      >
        {imgEl}
      </a>
    )
  }

  return (
    <div className={`${containerBase} ${containerColor}`}>
      {imgEl}
    </div>
  )
}
