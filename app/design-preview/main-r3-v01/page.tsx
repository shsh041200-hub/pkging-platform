import type { Metadata } from 'next'
import { MainR3V01Client } from './MainR3V01Client'

export const metadata: Metadata = {
  title: 'r3 V01 — 검색 게이트웨이',
  robots: { index: false, follow: false },
}

export default function Page() {
  return <MainR3V01Client />
}
