'use client'

import { useState } from 'react'

interface WebsiteFaviconProps {
  iconUrl?: string | null
  className?: string
}

function GlobeIcon({ className }: { className: string }) {
  return (
    <svg className={`${className} flex-shrink-0`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
    </svg>
  )
}

export function WebsiteFavicon({ iconUrl, className = 'w-4 h-4' }: WebsiteFaviconProps) {
  const [failed, setFailed] = useState(false)

  if (!iconUrl || failed) {
    return <GlobeIcon className={className} />
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={iconUrl}
      alt=""
      loading="lazy"
      className={`${className} flex-shrink-0 rounded-sm object-contain`}
      onError={() => setFailed(true)}
    />
  )
}
