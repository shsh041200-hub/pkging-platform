'use client'

import { useState, Children } from 'react'

const VISIBLE_COUNT = 5

export function BuyerCategoryFilter({ children, forceExpand }: { children: React.ReactNode; forceExpand?: boolean }) {
  const [showAll, setShowAll] = useState(forceExpand ?? false)
  const items = Children.toArray(children)
  const visible = showAll ? items : items.slice(0, VISIBLE_COUNT)
  const hasMore = items.length > VISIBLE_COUNT

  return (
    <>
      {visible}
      {hasMore && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="flex-shrink-0 px-3.5 py-1.5 rounded-md text-[13px] font-medium text-gray-400 border border-dashed border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all"
        >
          {showAll ? '접기' : '더보기 ▾'}
        </button>
      )}
    </>
  )
}
