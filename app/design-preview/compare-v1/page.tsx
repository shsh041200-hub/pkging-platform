import { CompareV1Client } from './CompareV1Client'

export const metadata = {
  title: '[Preview] Compare V1 — PACAA-573',
  robots: { index: false, follow: false },
}

export default function CompareV1PreviewPage() {
  return <CompareV1Client />
}
