import type { Metadata } from 'next'
import { MainR3V09Client } from './MainR3V09Client'

export const metadata: Metadata = {
  title: 'r3 V09 — 다크 미니멀 (Linear 톤)',
  robots: { index: false, follow: false },
}

export default function Page() {
  return <MainR3V09Client />
}
