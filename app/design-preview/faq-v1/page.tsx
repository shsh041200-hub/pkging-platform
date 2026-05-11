import type { Metadata } from 'next'
import { FaqV1Client } from './FaqV1Client'

export const metadata: Metadata = {
  title: 'FAQ v1 preview — Packlinx',
  robots: { index: false, follow: false },
}

export default function FaqV1Page() {
  return <FaqV1Client />
}
