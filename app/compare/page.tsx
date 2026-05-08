import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getCompaniesBySlugs, computeCompleteness } from '@/lib/compare-data'
import CompareCart from '@/app/components/CompareCart'
import QuoteRequestForm from '@/app/components/QuoteRequestForm'
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
        {companies.length > 0 && <QuoteRequestForm companies={companies} />}
        {/* 통신판매중개자 고지문 §20 — compare page footer */}
        <footer className="mt-6 rounded border border-[#e5edf5] bg-[#f8fafc] px-4 py-3 text-xs leading-relaxed text-[#64748d]">
          Packlinx는 통신판매중개자로서 거래 당사자가 아닙니다. 판매자와 구매자 간 거래에서 발생하는 의무와 책임은
          각 당사자에게 있으며, Packlinx는 이에 대한 책임을 부담하지 않습니다. (전자상거래 등에서의 소비자보호에
          관한 법률 §20)
        </footer>
      </main>
      <CompareCart />
    </>
  )
}
