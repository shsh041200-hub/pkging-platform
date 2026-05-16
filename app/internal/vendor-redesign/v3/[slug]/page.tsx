import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import {
  CATEGORY_LABELS,
  INDUSTRY_CATEGORY_LABELS,
  type Category,
  type IndustryCategory,
} from '@/types'

export const metadata: Metadata = {
  title: 'Packlinx 검증 점수 — V3 리뉴얼 시안',
  robots: { index: false, follow: false },
}

type Props = { params: Promise<{ slug: string }> }

// ── 점수 산식 (4축) ────────────────────────────────────────────────────
// 각 축: 0~25점, 합산 0~100점

type ScoreAxis = {
  key: string
  label: string
  description: string
  formula: string
  score: number
  maxScore: number
}

function computeScores(company: Record<string, unknown>): ScoreAxis[] {
  // ① 응답속도 — 연락처 채널 수 기준 (전화/이메일/웹사이트 각 +8점, 최대 24, 보정+1)
  const contactChannels =
    (company.phone ? 8 : 0) +
    (company.email ? 8 : 0) +
    (company.website ? 9 : 0)
  const responseScore = Math.min(25, contactChannels)

  // ② 정보 투명도 — 필드 완성도 (설명/제품/설립연도/MOQ/납기/샘플 각 +4점)
  const transparencyScore = Math.min(
    25,
    (company.description ? 5 : 0) +
    (Array.isArray(company.products) && (company.products as unknown[]).length > 0 ? 4 : 0) +
    (company.founded_year ? 3 : 0) +
    (company.moq_value != null ? 4 : 0) +
    (company.lead_time_standard_days != null ? 4 : 0) +
    (company.sample_available != null ? 3 : 0) +
    (company.data_source ? 2 : 0),
  )

  // ③ 카테고리 적합도 — 산업 카테고리 지정 수 기준 (1개+15, 2개+22, 3개이상+25)
  const industryCats = (company.industry_categories as string[] | null) ?? []
  const catScore =
    industryCats.length === 0 ? 5
    : industryCats.length === 1 ? 15
    : industryCats.length === 2 ? 22
    : 25

  // ④ 인증 보유 — 인증 1개당 +6점 (최대 25)
  const certCount = Array.isArray(company.certifications)
    ? (company.certifications as unknown[]).length
    : 0
  const certScore = Math.min(25, certCount * 6 + (company.is_verified ? 7 : 0))

  return [
    {
      key: 'response',
      label: '응답속도',
      description: '전화·이메일·웹사이트 등 연락 채널 확보 수준',
      formula: '전화(+8) + 이메일(+8) + 웹사이트(+9), 최대 25점',
      score: responseScore,
      maxScore: 25,
    },
    {
      key: 'transparency',
      label: '정보 투명도',
      description: '업체 설명·제품·MOQ·납기·설립연도 등 프로필 완성도',
      formula: '업체소개(+5) + 제품목록(+4) + MOQ(+4) + 납기(+4) + 샘플여부(+3) + 설립연도(+3) + 데이터출처(+2), 최대 25점',
      score: transparencyScore,
      maxScore: 25,
    },
    {
      key: 'category',
      label: '카테고리 적합도',
      description: '산업 카테고리 매핑 수준 — 구매자가 원하는 카테고리와 일치할수록 높음',
      formula: '산업카테고리 1개(+15) / 2개(+22) / 3개+(+25), 미등록(+5)',
      score: catScore,
      maxScore: 25,
    },
    {
      key: 'cert',
      label: '인증 보유',
      description: 'ISO·KC·친환경 등 공인 인증서 보유 현황 + Packlinx 직접 검증',
      formula: '인증 1건당 +6점 + Packlinx검증완료(+7), 최대 25점',
      score: certScore,
      maxScore: 25,
    },
  ]
}

// 카테고리 평균 — 동일 카테고리 mock 기준값 (실데이터 없을 경우 고정값 사용)
// 추후 집계 함수로 교체 예정
const CATEGORY_AVG: Record<string, number[]> = {
  'packaging-machinery': [14, 12, 18, 6],
  'food-beverage':       [17, 16, 20, 10],
  'ecommerce-shipping':  [18, 15, 20, 8],
  'cosmetics-beauty':    [16, 17, 20, 9],
  'default':             [15, 14, 18, 7],
}

function getCategoryAvg(industryCats: string[]): number[] {
  const cat = industryCats[0] ?? 'default'
  return CATEGORY_AVG[cat] ?? CATEGORY_AVG['default']
}

// ── ScoreBar ───────────────────────────────────────────────────────────
function ScoreBar({
  score,
  maxScore,
  avgScore,
  label,
}: {
  score: number
  maxScore: number
  avgScore: number
  label: string
}) {
  const pct = Math.round((score / maxScore) * 100)
  const avgPct = Math.round((avgScore / maxScore) * 100)
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[13px] font-semibold text-neutral-800">{label}</span>
        <span className="text-[13px] font-bold text-stripe-purple tabular-nums">
          {score}<span className="text-[11px] font-medium text-neutral-400">/{maxScore}</span>
        </span>
      </div>
      <div className="relative h-2.5 bg-neutral-100 rounded-full overflow-visible">
        {/* This vendor bar */}
        <div
          className="absolute left-0 top-0 h-full rounded-full bg-stripe-purple transition-all"
          style={{ width: `${pct}%` }}
        />
        {/* Category average marker */}
        <div
          className="absolute top-[-3px] h-[19px] w-0.5 bg-neutral-400 rounded-full"
          style={{ left: `${avgPct}%` }}
          title={`카테고리 평균: ${avgScore}점`}
        />
      </div>
      <div className="flex items-center justify-end gap-1 mt-1">
        <div className="w-0.5 h-2.5 bg-neutral-400 rounded-full" />
        <span className="text-[10px] text-neutral-400">카테고리 평균 {avgScore}점</span>
      </div>
    </div>
  )
}

// ── FormulaExpandable ───────────────────────────────────────────────────
function FormulaExpandable({ axes }: { axes: ScoreAxis[] }) {
  return (
    <details className="group border border-neutral-200 rounded-xl overflow-hidden">
      <summary className="flex items-center justify-between px-5 py-4 cursor-pointer bg-neutral-50 hover:bg-neutral-100 transition-colors list-none select-none">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-neutral-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <span className="text-[13px] font-semibold text-neutral-700">점수 산식 보기</span>
        </div>
        <svg className="w-4 h-4 text-neutral-400 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </summary>
      <div className="px-5 py-5 bg-white space-y-4 border-t border-neutral-100">
        <p className="text-[12px] text-neutral-500 leading-relaxed">
          Packlinx 검증 점수는 사용자 리뷰·평점이 아닙니다. Packlinx 플랫폼에 등록된
          업체 프로필의 완성도, 연락 가능성, 인증 현황을 기반으로 산출한 투명도 점수입니다.
        </p>
        <div className="space-y-3">
          {axes.map((axis) => (
            <div key={axis.key} className="bg-neutral-50 border border-neutral-100 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[12px] font-bold text-neutral-800">{axis.label}</span>
                <span className="text-[11px] text-neutral-400">/ {axis.maxScore}점</span>
              </div>
              <p className="text-[11px] text-neutral-500 mb-1">{axis.description}</p>
              <p className="text-[11px] font-mono text-stripe-purple bg-stripe-purple-soft rounded px-2 py-1">{axis.formula}</p>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-neutral-400 leading-relaxed">
          카테고리 평균은 동일 산업카테고리의 전체 등록 업체 평균값입니다.
          점수는 프로필 업데이트 시 재계산됩니다. 이 점수는 Packlinx의 추천 또는 품질 보증을
          의미하지 않으며, 법적 책임이 없습니다.
        </p>
      </div>
    </details>
  )
}

export default async function VendorRedesignV3Page({ params }: Props) {
  const { slug: rawSlug } = await params
  const slug = decodeURIComponent(rawSlug)
  const supabase = await createClient()

  const { data: company } = await supabase
    .from('companies')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!company) notFound()

  const axes = computeScores(company as Record<string, unknown>)
  const totalScore = axes.reduce((s, a) => s + a.score, 0)
  const industryCats = (company.industry_categories as string[] | null) ?? []
  const avgBreakdown = getCategoryAvg(industryCats)
  const totalAvg = avgBreakdown.reduce((s, v) => s + v, 0)

  const primaryCat = industryCats[0] as IndustryCategory | undefined
  const catLabel = primaryCat
    ? INDUSTRY_CATEGORY_LABELS[primaryCat]
    : (CATEGORY_LABELS[company.category as Category] ?? company.category)

  // Score tier
  const tier =
    totalScore >= 80 ? { label: '우수', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' }
    : totalScore >= 60 ? { label: '양호', color: 'text-stripe-purple', bg: 'bg-stripe-purple-soft', border: 'border-stripe-purple-ring' }
    : totalScore >= 40 ? { label: '보통', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' }
    : { label: '미흡', color: 'text-neutral-500', bg: 'bg-neutral-50', border: 'border-neutral-200' }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Internal design-preview banner */}
      <div className="bg-neutral-900 text-white px-6 py-3">
        <div className="max-w-3xl mx-auto flex items-center gap-3 text-[12px]">
          <span className="font-mono text-brand-300">PACAA-740</span>
          <span className="text-neutral-400">|</span>
          <span className="text-neutral-300">[리뉴얼안 V3] vendor 상세 — Packlinx 검증 점수 시안 (noindex)</span>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-5">

        {/* ── Hero: 업체명 + 총점 박스 ── */}
        <div className="bg-white border border-border-v04 rounded-xl p-6 sm:p-8" style={{ boxShadow: 'var(--shadow-elevated-v04)' }}>
          <div className="flex flex-col sm:flex-row sm:items-start gap-5">

            {/* Left: 업체 정보 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-semibold text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded uppercase tracking-wide">
                  {catLabel}
                </span>
              </div>
              <h1 className="text-[22px] sm:text-[28px] heading-display text-heading-deep-navy tracking-[-0.02em] leading-tight mb-2">
                {company.name}
              </h1>
              {company.description && (
                <p className="text-[13px] text-body-secondary leading-relaxed line-clamp-2">
                  {company.description as string}
                </p>
              )}
            </div>

            {/* Right: 총점 박스 */}
            <div className={`flex-shrink-0 ${tier.bg} ${tier.border} border rounded-2xl px-8 py-5 text-center min-w-[130px]`}>
              <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1">Packlinx 검증 점수</p>
              <p className={`text-[52px] font-bold ${tier.color} leading-none tabular-nums`}>{totalScore}</p>
              <p className="text-[12px] text-neutral-400 mb-2">/ 100점</p>
              <span className={`inline-block text-[11px] font-semibold ${tier.color} ${tier.bg} border ${tier.border} px-3 py-1 rounded-full`}>
                {tier.label}
              </span>
              <p className="text-[10px] text-neutral-400 mt-2">카테고리 평균 {totalAvg}점</p>
            </div>
          </div>

          {/* Notice: 사용자 리뷰 아님 */}
          <div className="mt-5 flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-lg px-4 py-3">
            <svg className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-[12px] text-blue-700 leading-relaxed">
              <strong>이 점수는 사용자 리뷰 점수가 아닙니다.</strong>{' '}
              Packlinx가 업체 프로필의 완성도·연락 가능성·인증 현황을 기반으로 산출한
              &ldquo;Packlinx 검증 점수&rdquo;입니다.
            </p>
          </div>
        </div>

        {/* ── 4축 점수 분해 + 카테고리 평균 비교 ── */}
        <div className="bg-white border border-border-v04 rounded-xl p-6" style={{ boxShadow: 'var(--shadow-elevated-v04)' }}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[15px] font-semibold text-heading-deep-navy">점수 분해</h2>
            <span className="text-[11px] text-neutral-400">│ 세로선 = 카테고리 평균</span>
          </div>
          <div className="space-y-5">
            {axes.map((axis, i) => (
              <ScoreBar
                key={axis.key}
                score={axis.score}
                maxScore={axis.maxScore}
                avgScore={avgBreakdown[i] ?? 10}
                label={axis.label}
              />
            ))}
          </div>
        </div>

        {/* ── 이 업체 vs 카테고리 평균 비교 요약 ── */}
        <div className="bg-white border border-border-v04 rounded-xl p-6" style={{ boxShadow: 'var(--shadow-elevated-v04)' }}>
          <h2 className="text-[15px] font-semibold text-heading-deep-navy mb-4">
            이 업체 vs 카테고리 평균
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {axes.map((axis, i) => {
              const avg = avgBreakdown[i] ?? 10
              const diff = axis.score - avg
              const isAbove = diff >= 0
              return (
                <div
                  key={axis.key}
                  className="border border-neutral-100 rounded-xl p-4"
                >
                  <p className="text-[11px] font-semibold text-neutral-500 mb-1">{axis.label}</p>
                  <div className="flex items-end gap-2">
                    <span className="text-[20px] font-bold text-heading-deep-navy tabular-nums">{axis.score}</span>
                    <span className="text-[11px] text-neutral-400 mb-0.5">vs 평균 {avg}</span>
                  </div>
                  <span
                    className={`inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      isAbove
                        ? 'text-emerald-700 bg-emerald-50'
                        : 'text-red-600 bg-red-50'
                    }`}
                  >
                    {isAbove ? `+${diff}` : diff} 점
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── 강점 / 약점 자동 텍스트 요약 ── */}
        <div className="bg-white border border-border-v04 rounded-xl p-6" style={{ boxShadow: 'var(--shadow-elevated-v04)' }}>
          <h2 className="text-[15px] font-semibold text-heading-deep-navy mb-4">자동 분석 요약</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 강점 */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <p className="text-[12px] font-semibold text-emerald-700">강점</p>
              </div>
              <ul className="space-y-1.5">
                {axes
                  .filter((a, i) => a.score >= (avgBreakdown[i] ?? 10))
                  .map((a) => (
                    <li key={a.key} className="flex items-start gap-2 text-[12px] text-neutral-600">
                      <svg className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {a.label} ({a.score}점 / {a.maxScore}점 만점)
                    </li>
                  ))}
                {axes.filter((a, i) => a.score >= (avgBreakdown[i] ?? 10)).length === 0 && (
                  <li className="text-[12px] text-neutral-400">평균 이상 축 없음</li>
                )}
              </ul>
            </div>
            {/* 약점 */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <p className="text-[12px] font-semibold text-amber-700">개선 가능 영역</p>
              </div>
              <ul className="space-y-1.5">
                {axes
                  .filter((a, i) => a.score < (avgBreakdown[i] ?? 10))
                  .map((a) => (
                    <li key={a.key} className="flex items-start gap-2 text-[12px] text-neutral-600">
                      <svg className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {a.label} ({a.score}점, 평균 {avgBreakdown[axes.indexOf(a)]}점 대비 미달)
                    </li>
                  ))}
                {axes.filter((a, i) => a.score < (avgBreakdown[i] ?? 10)).length === 0 && (
                  <li className="text-[12px] text-neutral-400">모든 축에서 평균 이상입니다.</li>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* ── 점수 산식 expandable ── */}
        <FormulaExpandable axes={axes} />

        {/* ── Disclaimer ── */}
        <div className="text-center pt-2">
          <p className="text-[11px] text-neutral-400 leading-relaxed max-w-xl mx-auto">
            Packlinx 검증 점수는 업체가 직접 제공하거나 공개 출처에서 수집된 프로필 데이터를 기반으로
            산출됩니다. 별점(★) 방식이 아니며, 사용자 리뷰·평판·거래 실적을 반영하지 않습니다.
            점수는 정보 제공 목적이며 법적 책임이 없습니다.
          </p>
        </div>
      </main>
    </div>
  )
}
