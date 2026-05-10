import type { Metadata } from 'next'
import { MainR3V06Client } from './MainR3V06Client'

export const metadata: Metadata = {
  title: 'r3 V06 — 업체 카드 쇼케이스 그리드',
  robots: { index: false, follow: false },
}

export default function Page() {
  return <MainR3V06Client />
}
