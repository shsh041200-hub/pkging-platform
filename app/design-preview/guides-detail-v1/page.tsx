/**
 * PACAA-549 — guides-detail-v1 preview
 *
 * Representative: label-printing-guide
 *
 * V1 changes vs production:
 *   #1 (hierarchy): H1=38px 유지, category-tag pill 및 TOC active → V05 purple
 *   #3 (token): --g-brand navy → --color-brand-500 purple across tag pill, TOC, sidebar link hover
 *   #4 (CTA): mobile sticky bottom CTA bar (sm:hidden) — production sidebar는 desktop-only
 *   bonus: "다음 가이드" next-up section at bottom for related-guide path
 */
import type { Metadata } from "next";
import type React from "react";
import Link from "next/link";
import { GuideHero } from "@/components/guide/GuideHero";
import { GuideCallout } from "@/components/guide/GuideCallout";
import { GuideChecklist } from "@/components/guide/GuideChecklist";
import { GuideFaq } from "@/components/guide/GuideFaq";
import { GuideEndCta } from "@/components/guide/GuideEndCta";
import { GuideCompareTable } from "@/components/guide/GuideCompareTable";
import { GuideSidebarV1 } from "./GuideSidebarV1";
import { GuideTocV1 } from "./GuideTocV1";

export const metadata: Metadata = {
  title: "[Preview] 라벨 인쇄 가이드 — V1 · PACAA-549",
  robots: { index: false, follow: false },
};

const NEXT_GUIDES = [
  { href: "/guides/packaging-printing-guide", title: "포장 인쇄 종류·후가공 완전 가이드", readTime: "6분", icon: "🖨️" },
  { href: "/guides/flexible-packaging-guide", title: "연포장 (파우치·필름) 가이드", readTime: "6분", icon: "🎀" },
  { href: "/guides/corrugated-box-supplier-selection", title: "골판지 박스 업체 선정 가이드", readTime: "6분", icon: "📦" },
];

const TOC_ITEMS = [
  { id: "toc-types", label: "인쇄 방식 3종 비교" },
  { id: "toc-cost", label: "비용·단가 구조" },
  { id: "toc-material", label: "소재별 선택 기준" },
  { id: "toc-moq", label: "MOQ & 납기 현실" },
  { id: "toc-checklist", label: "발주 체크리스트" },
  { id: "toc-faq", label: "자주 묻는 질문" },
];

export default function GuidesDetailV1Page() {
  return (
    <>
      {/* Preview banner */}
      <div
        className="fixed top-0 left-0 right-0 z-50 text-center py-2 text-xs font-semibold text-white"
        style={{ background: "#7c3aed" }}
      >
        [PREVIEW] guides-detail-v1 · PACAA-549 · noindex ·{" "}
        <a href="/guides/label-printing-guide" className="underline text-white/80 hover:text-white ml-1">
          production 비교 →
        </a>
      </div>

      <div className="pt-8 -mx-5 sm:-mx-8 -mt-10 sm:-mt-14">
        {/* Hero — V1 #3: CSS var override wrapper switches --g-brand navy → V05 purple */}
        <div
          style={
            {
              "--g-brand": "var(--color-brand-500)",
              "--g-brand-2": "var(--color-brand-400)",
              "--g-brand-soft": "var(--color-brand-50)",
            } as React.CSSProperties
          }
        >
          <GuideHero
            tag="인쇄 실무"
            title="라벨 인쇄 업체 선정 가이드 — 인쇄 방식·비용·소재·MOQ 비교 (2026)"
            subtitle="소량 디지털부터 대량 플렉소까지 — 용도·수량별 최적 방식과 발주 체크리스트"
            dateLabel="2026-05-01"
            readTime="5분"
            views="3.2k"
            category="소재"
            categoryHref="/guides?category=material"
            tldr={[
              { bold: "소량(~1,000장):", text: "디지털 인쇄 — 판 비용 0원, 교정 빠름." },
              { bold: "중량(~10,000장):", text: "옵셋 인쇄 — 단가 유리, CTP 판 비용 분산." },
              { bold: "대량(10만장+):", text: "플렉소 — 롤 라벨·식품 포장에 최적, 판 비용 회수." },
            ]}
          />
        </div>

        {/* Body: TOC (left) + content (center) + sidebar (right) */}
        <div className="max-w-[1180px] mx-auto px-6 py-10">
          <div
            className="grid gap-10"
            style={{ gridTemplateColumns: "200px 1fr 280px" }}
          >
            {/* TOC — V1 #3: active state → purple */}
            <GuideTocV1 items={TOC_ITEMS} />

            {/* Main content */}
            <article className="min-w-0">
              <section id="toc-types" className="mb-10">
                <h2 className="text-[22px] font-bold tracking-[-0.015em] text-[var(--g-ink)] mb-4">
                  인쇄 방식 3종 비교
                </h2>
                <p className="text-[var(--g-ink-2)] leading-[1.75] mb-6">
                  라벨 인쇄의 핵심은 방식 선택입니다. 수량·납기·소재에 따라 디지털, 옵셋, 플렉소 세 가지 중 하나가 명확히 유리합니다.
                </p>
                <GuideCompareTable
                  columns={[
                    { key: "item", label: "구분" },
                    { key: "digital", label: "디지털" },
                    { key: "offset", label: "옵셋" },
                    { key: "flexo", label: "플렉소" },
                  ]}
                  rows={[
                    { item: "적정 수량", digital: "100~5,000장", offset: "1,000~50,000장", flexo: "10만장+" },
                    { item: "판 제작비", digital: "없음", offset: "15~30만원", flexo: "30~100만원" },
                    { item: "장당 단가", digital: "높음", offset: "중간", flexo: "낮음" },
                    { item: "납기", digital: "1~3일", offset: "5~10일", flexo: "10~20일" },
                    { item: "소재 다양성", digital: "제한적", offset: "넓음", flexo: "넓음" },
                  ]}
                />
              </section>

              <section id="toc-cost" className="mb-10">
                <h2 className="text-[22px] font-bold tracking-[-0.015em] text-[var(--g-ink)] mb-4">
                  비용·단가 구조
                </h2>
                <GuideCallout variant="info">
                  <b>핵심:</b> 판 제작비(초기비용)와 장당 단가(변동비)의 교차점을 계산하세요.
                  디지털 인쇄는 1,000장 미만에서 총비용이 항상 유리합니다.
                </GuideCallout>
                <p className="text-[var(--g-ink-2)] leading-[1.75] mt-4">
                  디지털 인쇄 기준 소량(100장 내외) 총비용은 5만~15만원 수준입니다.
                  옵셋은 1,000장 기준 15만~40만원(CTP 판 비용 포함), 플렉소는 판 제작비(30만~100만원)가
                  별도 발생해 소량에는 비효율적입니다.
                </p>
              </section>

              <section id="toc-material" className="mb-10">
                <h2 className="text-[22px] font-bold tracking-[-0.015em] text-[var(--g-ink)] mb-4">
                  소재별 선택 기준
                </h2>
                <p className="text-[var(--g-ink-2)] leading-[1.75] mb-4">
                  라벨 소재는 사용 환경(방수, 냉동, 고온)과 접착 방식(상시, 재접착, 영구)으로 결정합니다.
                </p>
                <GuideCallout variant="warn">
                  식품 라벨의 경우 식약처 표시 기준(식품위생법 제10조)을 충족하는 소재인지 반드시 확인하세요.
                </GuideCallout>
              </section>

              <section id="toc-moq" className="mb-10">
                <h2 className="text-[22px] font-bold tracking-[-0.015em] text-[var(--g-ink)] mb-4">
                  MOQ &amp; 납기 현실
                </h2>
                <p className="text-[var(--g-ink-2)] leading-[1.75]">
                  대부분의 국내 라벨 인쇄 업체는 디지털 인쇄 MOQ 100장, 옵셋 500장, 플렉소 5,000장을
                  기준으로 합니다. 샘플 발주(10~50장)가 가능한 업체를 먼저 확인하세요.
                </p>
              </section>

              <section id="toc-checklist" className="mb-10">
                <h2 className="text-[22px] font-bold tracking-[-0.015em] text-[var(--g-ink)] mb-4">
                  발주 체크리스트
                </h2>
                <GuideChecklist
                  items={[
                    "라벨 사이즈 및 형태 (원형/사각/특수형) 결정",
                    "소재 선택 (아트지/PE/PET/방수필름)",
                    "인쇄 색상 수 (1도/4도/별색)",
                    "후가공 옵션 (코팅/에폭시/형광)",
                    "접착 방식 (상시/재접착/영구)",
                    "납기 및 수량 확인",
                    "바코드·QR 코드 인쇄 포함 여부",
                  ]}
                />
              </section>

              <section id="toc-faq" className="mb-10">
                <h2 className="text-[22px] font-bold tracking-[-0.015em] text-[var(--g-ink)] mb-4">
                  자주 묻는 질문
                </h2>
                <GuideFaq
                  items={[
                    {
                      question: "라벨 인쇄 비용은 얼마인가요?",
                      answer: "방식·수량에 따라 다릅니다. 디지털 소량(100장) 5~15만원, 옵셋 1,000장 15~40만원, 플렉소는 판 제작비 별도.",
                    },
                    {
                      question: "소량 라벨은 어디서 주문하나요?",
                      answer: "디지털 인쇄 전문 업체(MOQ 100~500장)를 Packlinx에서 검색하세요. 샘플 발주 가능 여부를 우선 확인하세요.",
                    },
                    {
                      question: "방수 라벨 소재는 무엇을 써야 하나요?",
                      answer: "PE(폴리에틸렌) 또는 PP 소재 라벨이 방수에 적합합니다. 냉동 환경은 냉동 전용 접착제 사용 여부를 확인하세요.",
                    },
                  ]}
                />
              </section>

              <GuideEndCta
                headline="라벨 인쇄 업체, 바로 비교해 보세요"
                subtext="1,380개 등록 업체에서 MOQ·납기·인쇄 방식 조건으로 필터링"
                buttonLabel="라벨 인쇄 업체 찾기 →"
                href="/categories?category=label"
              />

              {/* V1 bonus: 다음 가이드 — next-guide path */}
              <div className="mt-14">
                <h3 className="text-[18px] font-bold text-[var(--g-ink)] mb-4 tracking-[-0.01em]">
                  다음으로 읽을 가이드
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-[14px]">
                  {NEXT_GUIDES.map((g) => (
                    <Link
                      key={g.href}
                      href={g.href}
                      className="group bg-white border border-[var(--g-line)] rounded-[12px] p-5 flex flex-col gap-3 no-underline hover:shadow-[var(--g-shadow)] hover:-translate-y-px transition-all duration-150"
                    >
                      <div
                        className="w-8 h-8 rounded-[8px] grid place-items-center text-sm font-bold"
                        style={{ background: "var(--color-brand-50)", color: "var(--color-brand-500)" }}
                      >
                        {g.icon}
                      </div>
                      <p className="m-0 text-[14px] font-semibold text-[var(--g-ink)] leading-[1.45]">
                        {g.title}
                      </p>
                      <span className="text-xs text-[var(--g-ink-3)]">⏱ {g.readTime}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </article>

            {/* Sidebar — V1 #3: purple CTA button, hover links */}
            <GuideSidebarV1
              ctaHeadline="라벨 인쇄 업체 찾기"
              ctaSubtext="MOQ·납기·소재 조건으로 필터링된 1,380개 업체"
              ctaButtonLabel="업체 목록 보기 →"
              ctaHref="/categories?category=label"
              relatedGuides={[
                { href: "/guides/packaging-printing-guide", title: "포장 인쇄 종류·후가공 완전 가이드", readTime: "6분" },
                { href: "/guides/flexible-packaging-guide", title: "연포장 (파우치·필름) 가이드", readTime: "6분" },
                { href: "/guides/cosmetic-packaging-box", title: "화장품 패키징 박스 가이드", readTime: "5분" },
              ]}
            />
          </div>
        </div>

        {/* V1 change #4: mobile sticky bottom CTA — sm:hidden (production sidebar is desktop-only, mobile has no CTA fold) */}
        <div
          className="lg:hidden fixed bottom-0 left-0 right-0 z-40 px-4 pb-4 pt-3"
          style={{ background: "linear-gradient(180deg, transparent 0%, rgba(250,251,252,0.96) 30%, #fafbfc 100%)" }}
        >
          <Link
            href="/categories?category=label"
            className="block text-center text-white font-bold py-4 rounded-[12px] no-underline text-[15px] hover:opacity-90 transition-opacity"
            style={{ background: "var(--color-brand-500)" }}
          >
            라벨 인쇄 업체 찾기 →
          </Link>
        </div>
        {/* Spacer so content isn't hidden behind sticky bar on mobile */}
        <div className="lg:hidden h-20" />
      </div>
    </>
  );
}
