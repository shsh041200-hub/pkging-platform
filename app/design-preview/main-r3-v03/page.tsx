import type { Metadata } from 'next'
import { MainR3V03Client } from './MainR3V03Client'

export const metadata: Metadata = {
  title: 'r3 V03 — 타이핑 플레이스홀더 검색 히어로',
  robots: { index: false, follow: false },
}

export default function Page() {
  return <MainR3V03Client />
}
