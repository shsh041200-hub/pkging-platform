import { notFound, permanentRedirect } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getCompaniesBySlugs, computeCompleteness } from '@/lib/compare-data'
import CompareCart from '@/app/components/CompareCart'
import CompareTable from '../CompareTable'

export const revalidate = 3600

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.packlinx.com'

type Props = { params: Promise<{ slug: string }> }

/**
 * Parses "slugA-vs-slugB" by trying each -vs- split point and verifying both
 * halves exist in DB. Handles slugs that themselves contain "-vs-".
 */
async function parseVsSlug(segment: string): Promise<[string, string] | null> {
  const parts = segment.split('-vs-')
  if (parts.length < 2) return null

  for (let i = 0; i < parts.length - 1; i++) {
    const slugA = parts.slice(0, i + 1).join('-vs-')
    const slugB = parts.slice(i + 1).join('-vs-')
    const companies = await getCompaniesBySlugs([slugA, slugB])
    if (
      companies.length === 2 &&
      companies.some((c) => c.slug === slugA) &&
      companies.some((c) => c.slug === slugB)
    ) {
      return [slugA, slugB]
    }
  }
  return null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const decoded = decodeURIComponent(slug)
  const parsed = await parseVsSlug(decoded)
  if (!parsed) return { title: '비교 페이지를 찾을 수 없습니다' }

  const [slugA, slugB] = parsed
  const [canonA, canonB] = [slugA, slugB].sort()
  const companies = await getCompaniesBySlugs([canonA, canonB])
  if (companies.length < 2) return { title: '비교 페이지를 찾을 수 없습니다' }

  const [compA, compB] = [
    companies.find((c) => c.slug === canonA)!,
    companies.find((c) => c.slug === canonB)!,
  ]

  const title = `${compA.name} vs ${compB.name} — 패키징 업체 비교 | Packlinx`
  const description = `${compA.name}과 ${compB.name}를 한눈에 비교하세요. 최소주문수량, 납기, 인증, 가격 등 18가지 항목을 비교해 최적의 포장 업체를 선택하세요.`
  const canonicalUrl = `${siteUrl}/compare/${canonA}-vs-${canonB}`

  return {
    title,
    description,
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: 'website',
    },
    alternates: {
      canonical: canonicalUrl,
    },
  }
}

export default async function CompareSlugPage({ params }: Props) {
  const { slug } = await params
  const decoded = decodeURIComponent(slug)
  const parsed = await parseVsSlug(decoded)
  if (!parsed) notFound()

  const [slugA, slugB] = parsed
  const [canonA, canonB] = [slugA, slugB].sort()

  // Permanent redirect: enforce alphabetical slug order for canonical URL
  if (slugA !== canonA || slugB !== canonB) {
    permanentRedirect(`/compare/${canonA}-vs-${canonB}`)
  }

  const companies = await getCompaniesBySlugs([canonA, canonB])
  if (companies.length < 2) notFound()

  const completeness = companies.map(computeCompleteness)
  const [compA, compB] = [
    companies.find((c) => c.slug === canonA)!,
    companies.find((c) => c.slug === canonB)!,
  ]
  const orderedCompanies = [compA, compB]

  return (
    <>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-32">
        <Link href="/" className="text-sm text-blue-600 hover:underline mb-4 inline-block">
          ← 목록으로
        </Link>
        <h1 className="text-xl font-bold text-gray-900 mb-6">
          {compA.name} vs {compB.name}{' '}
          <span className="text-gray-400 text-base font-normal">비교</span>
        </h1>
        <CompareTable companies={orderedCompanies} completeness={completeness} />
      </main>
      <CompareCart />
    </>
  )
}
