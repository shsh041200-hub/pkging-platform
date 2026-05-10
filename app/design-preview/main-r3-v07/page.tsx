import type { Metadata } from 'next'
import { MainR3V07Client } from './MainR3V07Client'

export const metadata: Metadata = {
  title: 'r3 V07 — 업체 통계 + 디렉토리 매트릭스',
  robots: { index: false, follow: false },
}

export default function Page() {
  return <MainR3V07Client />
}
