'use client'

import { useEffect, useState } from 'react'
import { addToCart, removeFromCart, isInCart, getCartItems, COMPARE_MAX } from '@/lib/compare-data'

type Props = { slug: string; name: string }

export default function AddToCompareButton({ slug, name }: Props) {
  const [inCart, setInCart] = useState(false)
  const [cartFull, setCartFull] = useState(false)

  useEffect(() => {
    const sync = () => {
      const items = getCartItems()
      setInCart(items.some((c) => c.slug === slug))
      setCartFull(items.length >= COMPARE_MAX && !items.some((c) => c.slug === slug))
    }
    sync()
    window.addEventListener('compare-cart-updated', sync)
    return () => window.removeEventListener('compare-cart-updated', sync)
  }, [slug])

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (inCart) removeFromCart(slug)
    else addToCart({ slug, name })
  }

  return (
    <button
      onClick={handleClick}
      disabled={cartFull}
      aria-pressed={inCart}
      aria-label={inCart ? `${name} 비교에서 제거` : `${name} 비교에 추가`}
      className={[
        'relative z-10 text-[11px] font-medium px-2.5 py-1 rounded border transition-colors whitespace-nowrap',
        inCart
          ? 'bg-blue-600 text-white border-blue-600'
          : cartFull
            ? 'text-gray-300 border-gray-200 cursor-not-allowed'
            : 'text-blue-600 border-blue-200 hover:bg-blue-50',
      ].join(' ')}
    >
      {inCart ? '✓ 비교 중' : cartFull ? '최대 3개' : '+ 비교'}
    </button>
  )
}
