import type { Metadata } from 'next'
import Link from 'next/link'
import { getCompaniesBySlugs, computeCompleteness } from '@/lib/compare-data'
import CompareCart from '@/app/components/CompareCart'
import CompareTable from './CompareTable'

export const dynamic = 'force-dynamic'

type Props = { searchParams: Promise<{ ids?: string }> }

export const metadata: Metadata = {
  title: '벤더 비교',
  robots: { index: false, follow: false },
}

export default async function ComparePage({ searchParams }: Props) {
  const { ids } = await searchParams
  const slugs = ids
    ? ids.split(',').map((s) => decodeURIComponent(s.trim())).filter(Boolean).slice(0, 3)
    : []

  const companies = await getCompaniesBySlugs(slugs)

  if (companies.length === 0) {
    return (
      <main className="max-w-2xl mx-auto px-5 py-16 text-center">
        <Link href="/" className="text-sm text-blue-600 hover:underline mb-6 inline-block">← 홈으로</Link>
        <h1 className="text-xl font-bold text-gray-900 mb-3">비교할 벤더를 선택해 주세요</h1>
        <p className="text-gray-500 text-sm">
          카테고리 페이지에서 벤더 카드의 <strong>+ 비교</strong> 버튼을 눌러 추가하세요.
        </p>
      </main>
    )
  }

  const completeness = companies.map(computeCompleteness)

  return (
    <>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-32">
        <Link href="/" className="text-sm text-blue-600 hover:underline mb-4 inline-block">
          ← 목록으로
        </Link>
        <h1 className="text-xl font-bold text-gray-900 mb-6">
          벤더 비교 <span className="text-gray-400 text-base font-normal">({companies.length}개)</span>
        </h1>
        <CompareTable companies={companies} completeness={completeness} />
      </main>
      <CompareCart />
    </>
  )
}
