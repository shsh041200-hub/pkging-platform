import type { Metadata } from 'next'
import { MainR3V08Client } from './MainR3V08Client'

export const metadata: Metadata = {
  title: 'r3 V08 — 미니멀 에디토리얼 (Stripe 톤)',
  robots: { index: false, follow: false },
}

export default function Page() {
  return <MainR3V08Client />
}
