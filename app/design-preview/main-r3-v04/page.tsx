import type { Metadata } from 'next'
import { MainR3V04Client } from './MainR3V04Client'

export const metadata: Metadata = {
  title: 'r3 V04 — 콘텐츠 + 카테고리 에디토리얼',
  robots: { index: false, follow: false },
}

export default function Page() {
  return <MainR3V04Client />
}
