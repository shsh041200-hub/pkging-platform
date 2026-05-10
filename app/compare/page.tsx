import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
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

  // 2-way comparison: redirect to canonical SEO URL (/compare/a-vs-b)
  if (slugs.length === 2) {
    const [a, b] = slugs.sort()
    redirect(`/compare/${a}-vs-${b}`)
  }

  const companies = await getCompaniesBySlugs(slugs)

  if (companies.length === 0) {
    return (
      <main className="max-w-2xl mx-auto px-5 py-16 text-center">
        <Link href="/" className="text-sm text-stripe-purple hover:underline mb-6 inline-block">← 홈으로</Link>
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
        <Link href="/" className="text-sm text-stripe-purple hover:underline mb-4 inline-block">
          ← 목록으로
        </Link>
        <h1 className="text-xl font-bold text-gray-900 mb-6">
          벤더 비교 <span className="text-gray-400 text-base font-normal">({companies.length}개)</span>
        </h1>
        <CompareTable companies={companies} completeness={completeness} />
        <footer className="mt-6 rounded border border-border-v04 bg-neutral-50 px-4 py-3 text-xs leading-relaxed text-body-secondary">
          Packlinx는 패키징 업체에 대한 공개 정보를 정리해 제공하는 디렉토리 서비스입니다. 거래·견적 의뢰는 직접 중개하지 않으며, 업체 연락은 각 업체의 공식 채널을 이용해 주세요.
        </footer>
      </main>
      <CompareCart />
    </>
  )
}
