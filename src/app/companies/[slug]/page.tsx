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
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-[#0d1d2e] sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="text-white font-bold text-lg tracking-wide">PKGING</span>
            <span className="text-slate-400 text-xs hidden sm:inline">B2B 포장업체 디렉토리</span>
          </Link>
          <nav className="flex items-center gap-4">
            <a
              href="mailto:privacy@pkging.kr"
              className="text-slate-300 text-sm hover:text-white transition-colors"
            >
              업체 정보 수정·삭제
            </a>
          </nav>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-5 pb-0">
        <Link href="/" className="text-sm text-[#1e3a5f] hover:underline inline-flex items-center gap-1">
          ← 목록으로
        </Link>
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-5 pb-16">
        {/* Company Hero Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 mb-5">
          <div className="flex items-start gap-4 mb-5">
            {/* Logo placeholder */}
            <div className="w-14 h-14 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0">
              <span className="text-xl font-bold text-slate-400">
                {company.name.charAt(0)}
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold text-slate-900">{company.name}</h1>
                {company.is_verified && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full">
                    ✓ 인증업체
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
                <span className="bg-slate-100 text-slate-600 text-xs font-medium px-2.5 py-1 rounded-md">
                  {CATEGORY_LABELS[company.category as Category]}
                </span>
                {company.province && (
                  <span>
                    {company.province} {company.city}
                  </span>
                )}
                {avgRating && (
                  <span className="flex items-center gap-1">
                    <span className="text-amber-500">★</span>
                    <span className="font-medium text-slate-700">{avgRating}</span>
                    <span className="text-slate-400">({reviews?.length}개 리뷰)</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {company.description && (
            <p className="text-sm text-slate-600 leading-relaxed mb-6 border-l-2 border-slate-200 pl-4">
              {company.description}
            </p>
          )}

          {/* Contact grid */}
          {(company.phone || company.email || company.website) && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-5 border-t border-slate-100">
              {company.phone && (
                <div>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">전화</p>
                  <a
                    href={`tel:${company.phone}`}
                    className="text-sm text-[#1e3a5f] font-medium hover:underline"
                  >
                    {company.phone}
                  </a>
                </div>
              )}
              {company.email && (
                <div>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">이메일</p>
                  <a
                    href={`mailto:${company.email}`}
                    className="text-sm text-[#1e3a5f] font-medium hover:underline truncate block"
                  >
                    {company.email}
                  </a>
                </div>
              )}
              {company.website && (
                <div>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">웹사이트</p>
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[#1e3a5f] font-medium hover:underline"
                  >
                    방문하기 →
                  </a>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Products + Certifications grid */}
        {((company.products && company.products.length > 0) ||
          (company.certifications && company.certifications.length > 0)) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            {company.products && company.products.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <h2 className="text-xs font-semibold text-slate-900 mb-3 uppercase tracking-wide">
                  취급 제품
                </h2>
                <div className="flex flex-wrap gap-2">
                  {company.products.map((product: string, i: number) => (
                    <span
                      key={i}
                      className="text-xs font-medium bg-slate-50 border border-slate-200 text-slate-700 px-3 py-1.5 rounded-md"
                    >
                      {product}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {company.certifications && company.certifications.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <h2 className="text-xs font-semibold text-slate-900 mb-3 uppercase tracking-wide">
                  보유 인증
                </h2>
                <div className="flex flex-wrap gap-2">
                  {company.certifications.map((cert: string, i: number) => (
                    <span
                      key={i}
                      className="text-xs font-medium bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-1.5 rounded-md"
                    >
                      ✓ {cert}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Reviews */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xs font-semibold text-slate-900 uppercase tracking-wide">
              바이어 리뷰
            </h2>
            {avgRating && (
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-slate-900">{avgRating}</span>
                <div>
                  <div className="text-amber-400 text-sm">
                    {'★'.repeat(Math.round(Number(avgRating)))}
                    {'☆'.repeat(5 - Math.round(Number(avgRating)))}
                  </div>
                  <div className="text-xs text-slate-400">{reviews?.length}개 리뷰</div>
                </div>
              </div>
            )}
          </div>

          {reviews && reviews.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {reviews.map((review) => (
                <div key={review.id} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-amber-400 text-sm">
                      {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(review.created_at).toLocaleDateString('ko-KR')}
                    </span>
                  </div>
                  {review.content && (
                    <p className="text-sm text-slate-600 leading-relaxed">{review.content}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400 text-center py-8">아직 리뷰가 없습니다.</p>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-xs text-slate-400">
              © 2026 PKGING. 업체 정보는 공개 출처에서 자동 수집되었습니다.
              정보 오류·삭제 요청: privacy@pkging.kr
            </p>
            <div className="flex gap-4 text-xs text-slate-400">
              <Link href="/privacy" className="hover:text-slate-600">개인정보처리방침</Link>
              <Link href="/terms" className="hover:text-slate-600">이용약관</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
