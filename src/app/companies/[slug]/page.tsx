import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { CATEGORY_LABELS, type Category } from '@/types'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data: company } = await supabase
    .from('companies')
    .select('name, description, category')
    .eq('slug', slug)
    .single()

  if (!company) return { title: '업체를 찾을 수 없습니다' }

  return {
    title: `${company.name} — 패키징 플랫폼`,
    description: company.description ?? `${company.name} 패키징 업체 상세 정보`,
    openGraph: {
      title: company.name,
      description: company.description ?? '',
    },
  }
}

export default async function CompanyPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: company } = await supabase
    .from('companies')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!company) notFound()

  const { data: reviews } = await supabase
    .from('reviews')
    .select('id, rating, content, created_at')
    .eq('company_id', company.id)
    .order('created_at', { ascending: false })
    .limit(10)

  const avgRating =
    reviews && reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : null

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-2">
          <Link href="/" className="text-blue-600 text-sm hover:underline">
            ← 목록으로
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Company Header */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold text-gray-900">{company.name}</h1>
                {company.is_verified && (
                  <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">
                    인증업체
                  </span>
                )}
              </div>
              <span className="inline-block bg-gray-100 text-gray-600 text-sm px-3 py-1 rounded-full">
                {CATEGORY_LABELS[company.category as Category]}
              </span>
            </div>
            {avgRating && (
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-500">★ {avgRating}</div>
                <div className="text-xs text-gray-400">{reviews?.length}개 리뷰</div>
              </div>
            )}
          </div>

          {company.description && (
            <p className="text-gray-600 leading-relaxed mb-4">{company.description}</p>
          )}

          <div className="grid grid-cols-2 gap-3 text-sm">
            {company.province && (
              <div>
                <span className="text-gray-400">위치</span>
                <p className="text-gray-700">
                  {company.province} {company.city}
                </p>
              </div>
            )}
            {company.phone && (
              <div>
                <span className="text-gray-400">전화번호</span>
                <p className="text-gray-700">
                  <a href={`tel:${company.phone}`} className="text-blue-600 hover:underline">
                    {company.phone}
                  </a>
                </p>
              </div>
            )}
            {company.email && (
              <div>
                <span className="text-gray-400">이메일</span>
                <p className="text-gray-700">
                  <a href={`mailto:${company.email}`} className="text-blue-600 hover:underline">
                    {company.email}
                  </a>
                </p>
              </div>
            )}
            {company.website && (
              <div>
                <span className="text-gray-400">웹사이트</span>
                <p className="text-gray-700">
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    방문하기 →
                  </a>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Products */}
        {company.products && company.products.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
            <h2 className="font-semibold text-gray-900 mb-3">취급 제품</h2>
            <div className="flex flex-wrap gap-2">
              {company.products.map((product: string, i: number) => (
                <span
                  key={i}
                  className="bg-blue-50 text-blue-700 text-sm px-3 py-1 rounded-full"
                >
                  {product}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Certifications */}
        {company.certifications && company.certifications.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
            <h2 className="font-semibold text-gray-900 mb-3">인증</h2>
            <div className="flex flex-wrap gap-2">
              {company.certifications.map((cert: string, i: number) => (
                <span key={i} className="bg-green-50 text-green-700 text-sm px-3 py-1 rounded-full">
                  ✓ {cert}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Reviews */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">리뷰 ({reviews?.length ?? 0})</h2>
          {reviews && reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="border-b border-gray-100 pb-4 last:border-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-yellow-500">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                    <span className="text-xs text-gray-400">
                      {new Date(review.created_at).toLocaleDateString('ko-KR')}
                    </span>
                  </div>
                  {review.content && <p className="text-gray-600 text-sm">{review.content}</p>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">아직 리뷰가 없습니다.</p>
          )}
        </div>
      </main>
    </div>
  )
}
