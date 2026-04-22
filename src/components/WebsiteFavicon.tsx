'use client'

import { useState } from 'react'

interface WebsiteFaviconProps {
  website: string
  iconUrl?: string | null
  className?: string
}

function getDomain(url: string): string {
  try {
    return new URL(url).hostname
  } catch {
    return url.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]
  }
}

export function WebsiteFavicon({ website, iconUrl, className = 'w-4 h-4' }: WebsiteFaviconProps) {
  const [stage, setStage] = useState<'icon' | 'favicon' | 'globe'>(
    iconUrl ? 'icon' : 'favicon'
  )

  if (stage === 'globe') {
    return (
      <svg className={`${className} flex-shrink-0`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
      </svg>
    )
  }

  const src = stage === 'icon'
    ? iconUrl!
    : `https://www.google.com/s2/favicons?domain=${getDomain(website)}&sz=32`

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      className={`${className} flex-shrink-0 rounded-sm object-contain`}
      onError={() => setStage(stage === 'icon' ? 'favicon' : 'globe')}
    />
  )
}
