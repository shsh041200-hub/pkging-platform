"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";

// ─── Chip filter config ───────────────────────────────────────────────────────

const CHIPS = [
  "전체",
  "처음 발주",
  "MOQ 비교",
  "친환경·ESG",
  "인쇄 품질",
  "2026 트렌드",
  "이사·물류",
] as const;
type Chip = (typeof CHIPS)[number];

const CHIP_SLUGS: Partial<Record<Chip, ReadonlyArray<string>>> = {
  "처음 발주": [
    "corrugated-box-supplier-selection",
    "small-quantity-custom-box",
    "shipping-box-pricing",
    "packaging-material-complete-guide",
    "corrugated-flute-types",
  ],
  "MOQ 비교": [
    "corrugated-box-supplier-selection",
    "small-quantity-custom-box",
    "shipping-box-pricing",
    "label-printing-guide",
    "flexible-packaging-guide",
    "cosmetic-packaging-box",
  ],
  "친환경·ESG": [
    "eco-friendly-packaging",
    "2026-korea-packaging-trends",
    "packaging-accessories-guide",
    "packaging-material-complete-guide",
  ],
  "인쇄 품질": [
    "packaging-printing-guide",
    "label-printing-guide",
    "cosmetic-packaging-box",
  ],
  "2026 트렌드": [
    "2026-korea-packaging-trends",
    "packaging-machinery-guide",
    "packaging-accessories-guide",
  ],
  "이사·물류": ["이사박스-대량구매-가이드", "이사박스-사이즈-규격"],
};

// ─── Guide display data ───────────────────────────────────────────────────────

type GuideDisplay = {
  slug: string;
  title: string;
  desc: string;
  icon: string;
  readTime: string;
};

const ALL_GUIDES: GuideDisplay[] = [
  { slug: "corrugated-box-supplier-selection", icon: "📦", readTime: "6분", title: "골판지 박스 업체 선정 가이드 — MOQ·납기·인쇄·인증 비교", desc: "업체 유형별 MOQ·단가·납기 비교표와 샘플 검수 체크리스트." },
  { slug: "corrugated-flute-types", icon: "🟫", readTime: "4분", title: "골판지 골 종류 (A·B·E·F골) 선택 가이드", desc: "제품 무게·완충성·인쇄 기준으로 고르는 골 선택 매트릭스." },
  { slug: "shipping-box-pricing", icon: "💰", readTime: "5분", title: "택배 박스 단가 — 수량·사이즈별 가격대", desc: "실측 견적 기반 가격 레인지와 절감 포인트 5가지." },
  { slug: "small-quantity-custom-box", icon: "📐", readTime: "4분", title: "소량 맞춤 박스 — 100~500매 발주 옵션", desc: "디지털 인쇄 vs 실크·옵셋 비교, 견적 받는 법." },
  { slug: "이사박스-사이즈-규격", icon: "📏", readTime: "3분", title: "이사박스 사이즈·규격 표", desc: "1호~5호 표준 규격과 실제 적재 효율." },
  { slug: "이사박스-대량구매-가이드", icon: "🚚", readTime: "4분", title: "이사박스 대량 구매 가이드", desc: "이사·물류 업체 단체 발주 시 단가 산정 방식." },
  { slug: "packaging-material-complete-guide", icon: "🧱", readTime: "9분", title: "패키징 소재 종합 가이드", desc: "종이·플라스틱·금속·유리 6대 소재의 강·약점 한눈에." },
  { slug: "eco-friendly-packaging", icon: "🌱", readTime: "7분", title: "친환경 패키징 — 인증·비용·로드맵", desc: "FSC·GRS·생분해 인증 비교와 단계적 도입 전략." },
  { slug: "flexible-packaging-guide", icon: "🎀", readTime: "6분", title: "연포장 (파우치·필름) 가이드", desc: "식품·화장품·생활용품 파우치 소재 비교." },
  { slug: "label-printing-guide", icon: "🏷️", readTime: "5분", title: "라벨 인쇄 가이드", desc: "소재·접착제·인쇄 방식별 단가와 적합 용도." },
  { slug: "plastic-container-guide", icon: "🧴", readTime: "5분", title: "플라스틱 용기 가이드", desc: "PP·PET·HDPE 차이와 식품 적합성 기준." },
  { slug: "glass-metal-container-guide", icon: "🍾", readTime: "6분", title: "유리·금속 용기 가이드", desc: "주류·화장품·고급 식품 용기 선택 기준." },
  { slug: "packaging-tape-comparison", icon: "🧲", readTime: "5분", title: "포장 테이프 완전 비교 가이드", desc: "OPP·크라프트·무소음 테이프 점착력·용도별 선택 기준." },
  { slug: "cosmetic-packaging-box", icon: "💄", readTime: "5분", title: "화장품 패키징 박스", desc: "브랜드 톤과 단가 모두 잡는 박스 사양 가이드." },
  { slug: "electronics-packaging-design", icon: "🔌", readTime: "6분", title: "전자제품 패키징 디자인", desc: "완충·정전기·국제 운송 표준 충족 설계." },
  { slug: "food-packaging-materials", icon: "🍱", readTime: "6분", title: "식품 패키징 소재", desc: "식약처 기준·온도·차단성 요구사항." },
  { slug: "packaging-accessories-guide", icon: "🎁", readTime: "4분", title: "포장 부자재 가이드", desc: "완충재·테이프·라벨 등 부자재 선택." },
  { slug: "packaging-printing-guide", icon: "🖨️", readTime: "6분", title: "포장 인쇄 종류·후가공 완전 가이드", desc: "옵셋·플렉소·그라비어·디지털 비교와 후가공 옵션." },
  { slug: "packaging-machinery-guide", icon: "⚙️", readTime: "7분", title: "포장기계·자동화 완전 가이드", desc: "충전기·밀봉기·라벨러 등 자동화 ROI 계산과 도입 체크리스트." },
  { slug: "2026-korea-packaging-trends", icon: "📈", readTime: "8분", title: "2026 한국 패키징 트렌드 5가지 — 규제·소재·공급망 일괄 정리", desc: "2026년부터 적용되는 일회용 규제, EPR 강화, 친환경 인증 의무화까지." },
];

// ─── Featured + category section data ────────────────────────────────────────

type FeaturedCard = {
  slug: string;
  thumbVariant: "default" | "alt" | "alt2";
  badge: string;
  tag: string;
  title: string;
  meta: string[];
  isLarge?: boolean;
  summary?: string;
};

const FEATURED: FeaturedCard[] = [
  {
    slug: "2026-korea-packaging-trends",
    thumbVariant: "default",
    badge: "📈 이번 주 추천",
    tag: "트렌드 리포트",
    title: "2026 한국 패키징 트렌드 5가지 — 규제·소재·공급망 일괄 정리",
    meta: ["⏱ 8분 읽기", "📅 2026-04", "👁 2.1k 조회"],
    isLarge: true,
    summary:
      "2026년부터 적용되는 일회용 규제, EPR 강화, 친환경 인증 의무화까지. 결정자가 바로 행동할 수 있는 체크리스트와 산업별 영향도를 한 페이지에 정리.",
  },
  {
    slug: "corrugated-box-supplier-selection",
    thumbVariant: "alt",
    badge: "⭐ 가장 많이 본",
    tag: "박스·골판지",
    title: "골판지 박스 업체 선정 가이드",
    meta: ["⏱ 6분", "비교표 포함"],
  },
  {
    slug: "eco-friendly-packaging",
    thumbVariant: "alt2",
    badge: "🌱 ESG",
    tag: "소재",
    title: "친환경 패키징 도입 — 인증·비용·로드맵",
    meta: ["⏱ 7분", "FAQ 포함"],
  },
];

type CategorySection = {
  key: string;
  heading: string;
  sub: string;
  guides: Array<{ slug: string; icon: string; title: string; desc: string; time: string }>;
};

const CATEGORY_SECTIONS: CategorySection[] = [
  {
    key: "box",
    heading: "박스·골판지",
    sub: "발주 단가·MOQ·골 종류까지 — 박스 결정에 필요한 모든 것",
    guides: [
      { slug: "corrugated-box-supplier-selection", icon: "📦", title: "골판지 박스 업체 선정 — MOQ·납기·인쇄·인증 비교", desc: "업체 유형별 MOQ·단가·납기 비교표와 샘플 검수 체크리스트.", time: "6분" },
      { slug: "corrugated-flute-types", icon: "🟫", title: "골판지 골 종류 (A·B·E·F골) 선택 가이드", desc: "제품 무게·완충성·인쇄 기준으로 고르는 골 선택 매트릭스.", time: "4분" },
      { slug: "shipping-box-pricing", icon: "💰", title: "택배 박스 단가 — 수량·사이즈별 가격대", desc: "실측 견적 기반 가격 레인지와 절감 포인트 5가지.", time: "5분" },
      { slug: "small-quantity-custom-box", icon: "📐", title: "소량 맞춤 박스 — 100~500매 발주 옵션", desc: "디지털 인쇄 vs 실크·옵셋 비교, 견적 받는 법.", time: "4분" },
      { slug: "이사박스-사이즈-규격", icon: "📏", title: "이사박스 사이즈·규격 표", desc: "1호~5호 표준 규격과 실제 적재 효율.", time: "3분" },
      { slug: "이사박스-대량구매-가이드", icon: "🚚", title: "이사박스 대량 구매 가이드", desc: "이사·물류 업체 단체 발주 시 단가 산정 방식.", time: "4분" },
    ],
  },
  {
    key: "material",
    heading: "소재",
    sub: "필름·라벨·플라스틱·유리·금속·친환경 — 소재별 결정 기준",
    guides: [
      { slug: "packaging-material-complete-guide", icon: "🧱", title: "패키징 소재 종합 가이드", desc: "종이·플라스틱·금속·유리 6대 소재의 강·약점 한눈에.", time: "9분" },
      { slug: "eco-friendly-packaging", icon: "🌱", title: "친환경 패키징 — 인증·비용·로드맵", desc: "FSC·GRS·생분해 인증 비교와 단계적 도입 전략.", time: "7분" },
      { slug: "flexible-packaging-guide", icon: "🎀", title: "연포장 (파우치·필름) 가이드", desc: "식품·화장품·생활용품 파우치 소재 비교.", time: "6분" },
      { slug: "label-printing-guide", icon: "🏷️", title: "라벨 인쇄 가이드", desc: "소재·접착제·인쇄 방식별 단가와 적합 용도.", time: "5분" },
      { slug: "plastic-container-guide", icon: "🧴", title: "플라스틱 용기 가이드", desc: "PP·PET·HDPE 차이와 식품 적합성 기준.", time: "5분" },
      { slug: "glass-metal-container-guide", icon: "🍾", title: "유리·금속 용기 가이드", desc: "주류·화장품·고급 식품 용기 선택 기준.", time: "6분" },
    ],
  },
  {
    key: "industry",
    heading: "산업별",
    sub: "화장품·전자·식품 등 — 업종 표준에 맞는 패키징 결정",
    guides: [
      { slug: "cosmetic-packaging-box", icon: "💄", title: "화장품 패키징 박스", desc: "브랜드 톤과 단가 모두 잡는 박스 사양 가이드.", time: "5분" },
      { slug: "electronics-packaging-design", icon: "🔌", title: "전자제품 패키징 디자인", desc: "완충·정전기·국제 운송 표준 충족 설계.", time: "6분" },
      { slug: "food-packaging-materials", icon: "🍱", title: "식품 패키징 소재", desc: "식약처 기준·온도·차단성 요구사항.", time: "6분" },
      { slug: "packaging-accessories-guide", icon: "🎁", title: "포장 부자재 가이드", desc: "완충재·테이프·라벨 등 부자재 선택.", time: "4분" },
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function thumbBackground(variant: "default" | "alt" | "alt2") {
  if (variant === "alt") return "linear-gradient(135deg,#0f766e 0%,#10b981 100%)";
  if (variant === "alt2") return "linear-gradient(135deg,#4434d4 0%,#533afd 100%)";
  return "linear-gradient(135deg,#1c1e54 0%,#533afd 100%)";
}

function normalise(s: string) {
  return s.toLowerCase().replace(/\s+/g, "");
}

// ─── V1 token aliases — V05 purple replaces legacy LINX navy ─────────────────
// V1 change #3: --g-brand (#0a3d62 navy) → --color-brand-500 (#533afd purple)
const V1 = {
  brand:     "var(--color-brand-500)",
  brandHover:"var(--color-brand-600)",
  brandSoft: "var(--color-brand-50)",
  brandBorder:"var(--color-brand-200)",
} as const;

// ─── Main component ───────────────────────────────────────────────────────────

export function GuidesHubV1Client({ totalGuides }: { totalGuides: number }) {
  const [inputValue, setInputValue] = useState("");
  const [query, setQuery] = useState("");
  const [activeChip, setActiveChip] = useState<Chip>("전체");

  useEffect(() => {
    const t = setTimeout(() => setQuery(inputValue), 200);
    return () => clearTimeout(t);
  }, [inputValue]);

  const isFiltering = query.trim() !== "" || activeChip !== "전체";

  const filtered = useMemo(() => {
    let result = ALL_GUIDES;
    if (activeChip !== "전체") {
      const slugSet = new Set(CHIP_SLUGS[activeChip] ?? []);
      result = result.filter((g) => slugSet.has(g.slug));
    }
    if (query.trim()) {
      const q = normalise(query.trim());
      result = result.filter(
        (g) => normalise(g.title).includes(q) || normalise(g.desc).includes(q),
      );
    }
    return result;
  }, [query, activeChip]);

  const handleChip = useCallback((chip: Chip) => setActiveChip(chip), []);

  return (
    <div className="-mx-5 sm:-mx-8 -mt-10 sm:-mt-14">
      {/* Hero */}
      <section
        className="border-b border-[var(--g-line)]"
        style={{ padding: "64px 0 36px", background: "linear-gradient(180deg,#f3f7fb 0%,#fafbfc 100%)" }}
      >
        <div className="max-w-[1180px] mx-auto px-6">
          <nav className="text-[13px] text-[var(--g-ink-3)] mb-[14px]">
            <Link href="/" className="text-[var(--g-ink-3)] no-underline hover:underline">홈</Link>
            {" · "}
            <b className="text-[var(--g-ink-2)] font-medium">가이드</b>
          </nav>
          <h1 className="text-[44px] leading-[1.18] tracking-[-0.025em] m-0 mb-3 font-extrabold text-[var(--g-ink)]">
            발주 전에 꼭 확인하는
            <br className="hidden sm:block" />
            패키징 실무 가이드
          </h1>
          <p className="text-lg leading-[1.6] text-[var(--g-ink-2)] max-w-[720px] m-0 mb-4">
            소재 선택부터 MOQ·납기·인증까지. 1,380개 업체 데이터를 기반으로 만든 현장형 가이드 —
            추측 대신 비교, 검색 대신 결정.
          </p>

          {/* V1 change #4: fold-above CTA — 가이드 읽고 바로 업체 찾기로 진입 */}
          <div className="flex items-center gap-3 flex-wrap mb-6">
            <Link
              href="/categories"
              className="inline-flex items-center gap-2 text-white font-semibold text-sm px-5 py-3 rounded-[10px] no-underline hover:opacity-90 transition-opacity"
              style={{ background: V1.brand }}
            >
              지금 업체 찾기 →
            </Link>
            <span className="text-[var(--g-ink-3)] text-[13px]">1,380개 검증 업체 · 무료 비교</span>
          </div>

          <div className="flex flex-wrap gap-[10px] mt-2">
            {[
              { dot: true, text: "주간 업데이트" },
              { dot: false, text: `📚 ${totalGuides}개 가이드` },
              { dot: false, text: "🏭 1,380개 업체 데이터 기반" },
            ].map((pill) => (
              <span
                key={pill.text}
                className="inline-flex items-center gap-[6px] bg-white border border-[var(--g-line)] rounded-full px-[14px] py-2 text-[13px] text-[var(--g-ink-2)] font-medium"
              >
                {pill.dot && (
                  <span
                    className="w-[6px] h-[6px] rounded-full flex-none"
                    style={{ background: V1.brand }}
                  />
                )}
                {pill.text}
              </span>
            ))}
          </div>

          {/* Search bar */}
          <div
            className="mt-7 bg-white border border-[var(--g-line)] rounded-2xl px-4 py-4 flex gap-[10px] items-center"
            style={{ boxShadow: "var(--g-shadow)" }}
          >
            <span aria-hidden className="text-[var(--g-ink-3)] text-lg flex-none">🔎</span>
            <input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="예: MOQ 500개 골판지 박스, 친환경 인증 소재…"
              aria-label="가이드 검색"
              className="flex-1 border-0 outline-none font-[inherit] text-base bg-transparent text-[var(--g-ink)] placeholder:text-[var(--g-ink-3)]"
            />
            {inputValue && (
              <button
                type="button"
                onClick={() => setInputValue("")}
                aria-label="검색어 지우기"
                className="text-[var(--g-ink-3)] hover:text-[var(--g-ink)] text-lg leading-none flex-none bg-transparent border-0 p-0 cursor-pointer"
              >
                ✕
              </button>
            )}
            {/* V1 change #3: search button — navy → purple */}
            <button
              type="button"
              className="text-white border-0 rounded-[10px] px-[18px] py-3 font-semibold text-sm cursor-pointer hover:opacity-90 transition-opacity"
              style={{ background: V1.brand }}
            >
              가이드 찾기
            </button>
          </div>

          {/* Chip filters — V1 change #3: active chip → purple */}
          <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="카테고리 필터">
            {CHIPS.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => handleChip(chip)}
                aria-pressed={activeChip === chip}
                className={`text-[13px] px-3 py-1.5 rounded-full border transition-colors cursor-pointer ${
                  activeChip === chip
                    ? "text-white border-transparent"
                    : "bg-[#eef2f6] text-[var(--g-ink-2)] border-transparent hover:bg-[#e2e8f0]"
                }`}
                style={activeChip === chip ? { background: V1.brand } : undefined}
              >
                {chip}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main content */}
      <main className="max-w-[1180px] mx-auto px-6 pb-8">
        {isFiltering ? (
          <FilteredResultsV1 guides={filtered} activeChip={activeChip} query={query} />
        ) : (
          <DefaultLayoutV1 totalGuides={totalGuides} />
        )}
      </main>

      {/* Bottom CTA strip */}
      <div className="max-w-[1180px] mx-auto px-6">
        <div
          className="mb-20 text-white rounded-[20px] px-10 py-10 flex items-center justify-between gap-6 flex-wrap"
          style={{ background: "linear-gradient(135deg,#1c1e54 0%,#533afd 100%)" }}
        >
          <div>
            <h3 className="m-0 mb-1.5 text-2xl tracking-[-0.015em] font-bold">
              가이드만 읽고 끝나면 의미 없잖아요.
            </h3>
            <p className="m-0 text-white/80 text-[15px]">
              1,380개 등록 업체에서 조건에 맞는 곳 바로 비교하세요.
            </p>
          </div>
          <Link
            href="/categories"
            className="text-white font-bold px-[22px] py-[14px] rounded-xl text-[15px] no-underline hover:opacity-90 transition-opacity"
            style={{ background: "rgba(255,255,255,.15)", border: "1px solid rgba(255,255,255,.3)" }}
          >
            업체 찾기 →
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Filtered results ─────────────────────────────────────────────────────────

function FilteredResultsV1({
  guides,
  activeChip,
  query,
}: {
  guides: GuideDisplay[];
  activeChip: Chip;
  query: string;
}) {
  const label =
    activeChip !== "전체" && query.trim()
      ? `"${activeChip}" + "${query.trim()}" 검색 결과`
      : activeChip !== "전체"
        ? `"${activeChip}" 가이드`
        : `"${query.trim()}" 검색 결과`;

  return (
    <div className="mt-10">
      <div className="mb-6 flex items-center gap-3">
        <h2 className="text-[20px] font-bold text-[var(--g-ink)] m-0">{label}</h2>
        <span className="text-[var(--g-ink-3)] text-sm">{guides.length}개</span>
      </div>
      {guides.length === 0 ? (
        <div className="py-20 text-center text-[var(--g-ink-3)]">
          <div className="text-4xl mb-4">🔍</div>
          <p className="text-base m-0">검색 결과 없음</p>
          <p className="text-sm mt-2 m-0">다른 검색어나 카테고리를 시도해 보세요.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[18px]">
          {guides.map((g) => (
            <Link
              key={g.slug}
              href={`/guides/${g.slug}`}
              className="group bg-white border border-[var(--g-line)] rounded-[14px] p-[22px] flex flex-col gap-[10px] no-underline transition-all duration-150 hover:-translate-y-px hover:shadow-[var(--g-shadow)] min-h-[180px]"
              style={{ ["--tw-border-color" as string]: "transparent" }}
            >
              <div
                className="w-9 h-9 rounded-[10px] grid place-items-center font-bold text-sm"
                style={{ background: V1.brandSoft, color: V1.brand }}
              >
                {g.icon}
              </div>
              <h4 className="m-0 mt-1 text-[17px] leading-[1.4] tracking-[-0.01em] text-[var(--g-ink)] font-semibold">
                {g.title}
              </h4>
              <p className="m-0 text-[var(--g-ink-3)] text-[13.5px] leading-[1.55]">{g.desc}</p>
              <div className="mt-auto flex items-center justify-between text-xs text-[var(--g-ink-3)]">
                <span>⏱ {g.readTime}</span>
                <span className="font-semibold group-hover:underline" style={{ color: V1.brand }}>
                  읽기 →
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Default (no filter) layout ───────────────────────────────────────────────

function DefaultLayoutV1({ totalGuides }: { totalGuides: number }) {
  return (
    <>
      {/* Category tab bar — V1 change #3: active tab → purple */}
      <div
        className="flex flex-wrap gap-0 mt-12 mb-6 border-b border-[var(--g-line)]"
        role="tablist"
      >
        {[
          { label: "전체", count: totalGuides },
          { label: "박스·골판지", count: 6 },
          { label: "소재", count: 7 },
          { label: "산업별", count: 4 },
          { label: "공정·인쇄", count: 2 },
          { label: "트렌드", count: 1 },
          { label: "이사·물류", count: 1 },
        ].map((tab, i) => (
          <span
            key={tab.label}
            role="tab"
            className="px-[18px] py-[14px] font-semibold text-sm border-b-2 cursor-default transition-colors whitespace-nowrap"
            style={
              i === 0
                ? { color: V1.brand, borderBottomColor: V1.brand }
                : { color: "var(--g-ink-3)", borderBottomColor: "transparent" }
            }
          >
            {tab.label}{" "}
            <span className="ml-1.5 text-[var(--g-ink-3)] font-medium text-xs">{tab.count}</span>
          </span>
        ))}
      </div>

      {/* Featured cards — V1 change #1: large card H3 32px (was 26px) > category H2 22px */}
      <div className="mb-10 grid gap-[18px]" style={{ gridTemplateColumns: "2fr 1fr 1fr" }}>
        {FEATURED.map((feat, i) => (
          <Link
            key={feat.slug}
            href={`/guides/${feat.slug}`}
            className={[
              "relative rounded-[18px] bg-white border border-[var(--g-line)] overflow-hidden flex flex-col no-underline",
              "transition-[transform,box-shadow] duration-150 hover:-translate-y-[2px]",
              feat.isLarge ? "row-span-2" : "",
            ].join(" ")}
            style={{ boxShadow: "var(--g-shadow)" }}
          >
            <div
              className="relative overflow-hidden"
              style={{ aspectRatio: "16/9", background: thumbBackground(feat.thumbVariant) }}
            >
              <div
                className="absolute right-[-30px] bottom-[-30px] w-[220px] h-[220px] rounded-full"
                style={{ background: "rgba(255,255,255,.08)" }}
              />
              <span className="absolute top-[14px] left-[14px] bg-white/90 text-[var(--g-ink)] text-xs font-semibold px-[10px] py-[5px] rounded-full">
                {feat.badge}
              </span>
            </div>
            <div className="px-[22px] pt-5 pb-[22px] flex-1 flex flex-col">
              <div
                className="text-xs font-semibold mb-2 tracking-[.02em]"
                style={{ color: V1.brand }}
              >
                {feat.tag}
              </div>
              {/* V1 change #1: large featured H3 → 32px; small featured → 20px; clearly above category H2=22px */}
              <h3
                className={`m-0 mb-2 leading-[1.35] tracking-[-0.015em] text-[var(--g-ink)] font-bold ${
                  feat.isLarge ? "text-[32px]" : "text-[20px]"
                }`}
              >
                {feat.title}
              </h3>
              {i === 0 && feat.summary && (
                <p className="m-0 text-[var(--g-ink-3)] text-sm leading-[1.6]">{feat.summary}</p>
              )}
              <div className="mt-auto pt-[14px] flex gap-[14px] text-xs text-[var(--g-ink-3)]">
                {feat.meta.map((m) => (
                  <span key={m} className="inline-flex items-center gap-[5px]">{m}</span>
                ))}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Category sections — V1 change #1: category H2 22px (was 26px), clearly below featured 32px */}
      {CATEGORY_SECTIONS.map((section) => (
        <section key={section.key} className="mb-14" aria-labelledby={`cat-${section.key}`}>
          <div className="flex items-end justify-between mb-[18px] gap-[18px]">
            <div>
              <h2
                id={`cat-${section.key}`}
                className="text-[22px] tracking-[-0.02em] m-0 mb-1 font-extrabold text-[var(--g-ink)]"
              >
                {section.heading}
              </h2>
              <div className="text-[var(--g-ink-3)] text-sm">{section.sub}</div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[18px]">
            {section.guides.map((g) => (
              <Link
                key={g.slug}
                href={`/guides/${g.slug}`}
                className="group bg-white border border-[var(--g-line)] rounded-[14px] p-[22px] flex flex-col gap-[10px] no-underline transition-all duration-150 hover:-translate-y-px hover:shadow-[var(--g-shadow)] min-h-[180px]"
              >
                <div
                  className="w-9 h-9 rounded-[10px] grid place-items-center font-bold text-sm"
                  style={{ background: V1.brandSoft, color: V1.brand }}
                >
                  {g.icon}
                </div>
                <h4 className="m-0 mt-1 text-[17px] leading-[1.4] tracking-[-0.01em] text-[var(--g-ink)] font-semibold">
                  {g.title}
                </h4>
                <p className="m-0 text-[var(--g-ink-3)] text-[13.5px] leading-[1.55]">{g.desc}</p>
                <div className="mt-auto flex items-center justify-between text-xs text-[var(--g-ink-3)]">
                  <span>⏱ {g.time}</span>
                  <span
                    className="font-semibold group-hover:underline"
                    style={{ color: V1.brand }}
                  >
                    읽기 →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </>
  );
}
