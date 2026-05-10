import type { Metadata } from 'next'
import MainR2V3Client from './MainR2V3Client'

// noindex inherited from parent design-preview/layout.tsx metadata
export const metadata: Metadata = {
  title: 'Design Preview r2-v3 — Sidebar Directory | PACKLINX',
  robots: { index: false, follow: false },
}

export default function MainR2V3Page() {
  return <MainR2V3Client />
}
