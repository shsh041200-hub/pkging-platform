import type { Metadata } from 'next'
import { MainR3V05Client } from './MainR3V05Client'

export const metadata: Metadata = {
  title: 'r3 V05 — 상황별 온보딩 플로우',
  robots: { index: false, follow: false },
}

export default function Page() {
  return <MainR3V05Client />
}
