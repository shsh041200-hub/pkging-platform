import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import Link from 'next/link'
import { getCompaniesBySlugs, computeCompleteness } from '@/lib/compare-data'
import CompareTable from '@/app/compare/CompareTable'
import CompareCart from '@/app/components/CompareCart'

export const revalidate = 3600

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.packlinx.com').replace(/\/$/, '')

type Props = { params: Promise<{ slug: string }> }

function parseSlugs(slug: string): [string, string] | null {
  const idx = slug.indexOf('-vs-')
  if (idx < 1) return null
  const a = slug.slice(0, idx)
  const b = slug.slice(idx + 4)
  if (!a || !b) return null
  return [a, b]
}

function canonicalSlug(a: string, b: string): string {
  return [a, b].sort().join('-vs-')
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const parsed = parseSlugs(slug)
  if (!parsed) return { title: '비교', robots: { index: false, follow: false } }

  const [rawA, rawB] = parsed
  const sorted = canonicalSlug(rawA, rawB)
  if (slug !== sorted) return { title: '비교', robots: { index: false, follow: false } }

  const companies = await getCompaniesBySlugs([rawA, rawB].sort())
  if (companies.length !== 2) return { title: '비교', robots: { index: false, follow: false } }

  const [a, b] = companies.sort((x, y) => x.slug.localeCompare(y.slug))
  const canonical = `${siteUrl}/compare/${sorted}`

  return {
    title: `${a.name} vs ${b.name} — 패키징 업체 비교 | Packlinx`,
    description: `${a.name}과 ${b.name}의 소재, 납기, MOQ, 인증, 서비스 역량을 한눈에 비교하세요. 한국 포장 업체 비교 플랫폼 Packlinx.`,
    robots: { index: true, follow: true },
    alternates: { canonical },
    openGraph: {
      title: `${a.name} vs ${b.name} — 패키징 업체 비교`,
      description: `${a.name}과 ${b.name}의 소재, 납기, MOQ, 인증, 서비스 역량을 한눈에 비교하세요.`,
      url: canonical,
      siteName: 'Packlinx',
      locale: 'ko_KR',
      type: 'website',
    },
  }
}

export default async function CompareTwoPage({ params }: Props) {
  const { slug } = await params

  const parsed = parseSlugs(slug)
  if (!parsed) notFound()

  const [rawA, rawB] = parsed
  const sorted = canonicalSlug(rawA, rawB)

  if (slug !== sorted) {
    permanentRedirect(`/compare/${sorted}`)
  }

  const companies = await getCompaniesBySlugs([rawA, rawB].sort())
  if (companies.length !== 2) notFound()

  const orderedCompanies = companies.sort((x, y) => x.slug.localeCompare(y.slug))
  const completeness = orderedCompanies.map(computeCompleteness)

  return (
    <>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-32">
        <Link href="/" className="text-sm text-blue-600 hover:underline mb-4 inline-block">
          ← 목록으로
        </Link>
        <h1 className="text-xl font-bold text-gray-900 mb-1">
          {orderedCompanies[0].name} vs {orderedCompanies[1].name}
        </h1>
        <p className="text-sm text-gray-500 mb-6">패키징 업체 비교 · Packlinx</p>
        <CompareTable companies={orderedCompanies} completeness={completeness} />
      </main>
      <CompareCart />
    </>
  )
}
