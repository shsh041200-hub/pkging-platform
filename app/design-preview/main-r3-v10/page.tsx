import type { Metadata } from 'next'
import { MainR3V10Client } from './MainR3V10Client'

export const metadata: Metadata = {
  title: 'r3 V10 — 한국 B2B 정공법',
  robots: { index: false, follow: false },
}

export default function Page() {
  return <MainR3V10Client />
}
