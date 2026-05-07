export type CompareCartItem = {
  slug: string
  name: string
}

export const COMPARE_CART_KEY = 'packlinx_compare_cart'
export const COMPARE_MAX = 3

export function getCartItems(): CompareCartItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(COMPARE_CART_KEY)
    return raw ? (JSON.parse(raw) as CompareCartItem[]) : []
  } catch {
    return []
  }
}

export function setCartItems(items: CompareCartItem[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(COMPARE_CART_KEY, JSON.stringify(items))
  window.dispatchEvent(new Event('compare-cart-updated'))
}

export function addToCart(item: CompareCartItem): boolean {
  const current = getCartItems()
  if (current.length >= COMPARE_MAX) return false
  if (current.some((c) => c.slug === item.slug)) return true
  setCartItems([...current, item])
  return true
}

export function removeFromCart(slug: string): void {
  setCartItems(getCartItems().filter((c) => c.slug !== slug))
}

export function isInCart(slug: string): boolean {
  return getCartItems().some((c) => c.slug === slug)
}
