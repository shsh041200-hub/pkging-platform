'use client'

import { useEffect, useState } from 'react'
import { getCartItems, removeFromCart, type CompareCartItem } from '@/lib/compare-cart'

export default function CompareCart() {
  const [items, setItems] = useState<CompareCartItem[]>([])
  const [open, setOpen] = useState(true)

  useEffect(() => {
    const sync = () => {
      const next = getCartItems()
      setItems(next)
      if (next.length > 0) setOpen(true)
    }
    sync()
    window.addEventListener('compare-cart-updated', sync)
    return () => window.removeEventListener('compare-cart-updated', sync)
  }, [])

  if (items.length === 0) return null

  const compareUrl = `/compare?ids=${items.map((i) => encodeURIComponent(i.slug)).join(',')}`

  return (
    <div
      role="complementary"
      aria-label="비교 카트"
      className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-blue-600 shadow-[0_-4px_16px_rgba(0,0,0,0.12)] z-50"
    >
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between py-2.5">
        <span className="text-sm font-semibold text-blue-600">
          비교 중 ({items.length}/3)
        </span>
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? '비교 카트 접기' : '비교 카트 펼치기'}
          className="text-gray-400 hover:text-gray-600 text-xs px-2 py-1"
        >
          {open ? '▲' : '▼'}
        </button>
      </div>

      {open && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-4">
          <div className="flex gap-2 overflow-x-auto mb-3 scrollbar-none">
            {items.map((item) => (
              <div
                key={item.slug}
                className="flex-none flex items-center gap-1.5 bg-blue-50 border border-blue-200 rounded-lg px-3 py-1.5 max-w-[180px]"
              >
                <span className="text-xs font-medium text-gray-800 truncate">{item.name}</span>
                <button
                  onClick={() => removeFromCart(item.slug)}
                  aria-label={`${item.name} 비교에서 제거`}
                  className="text-gray-400 hover:text-red-500 text-xs flex-shrink-0 transition-colors"
                >
                  ✕
                </button>
              </div>
            ))}
            {Array.from({ length: 3 - items.length }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="flex-none flex items-center justify-center border border-dashed border-gray-200 rounded-lg px-3 py-1.5 w-28 text-xs text-gray-300"
              >
                + 추가
              </div>
            ))}
          </div>

          {items.length >= 2 && (
            <a
              href={compareUrl}
              className="block w-full max-w-xs mx-auto text-center bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors"
            >
              비교하기 →
            </a>
          )}
        </div>
      )}
    </div>
  )
}
