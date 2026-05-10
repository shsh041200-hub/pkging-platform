import type { Metadata } from 'next'
import { MainR3V02Client } from './MainR3V02Client'

export const metadata: Metadata = {
  title: 'r3 V02 — 검색 + 카테고리 듀얼 히어로',
  robots: { index: false, follow: false },
}

export default function Page() {
  return <MainR3V02Client />
}
