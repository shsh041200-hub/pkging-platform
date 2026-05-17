/**
 * Single source of truth for guide slugs and metadata.
 *
 * When adding a new guide:
 *   - Static page (app/guides/<slug>/page.tsx) → add to STATIC_GUIDE_SLUGS
 *   - Dynamic route (app/guides/[slug]/page.tsx) → add to DYNAMIC_GUIDE_SLUGS AND add its
 *     content entry in that file's GUIDES record
 * Both arrays feed the sitemap automatically via listGuideSlugs().
 */

/** Guides with dedicated static page directories (app/guides/<slug>/page.tsx) */
export const STATIC_GUIDE_SLUGS = [
  "label-printing-guide",
  "flexible-packaging-guide",
  "plastic-container-guide",
  "plastic-containers-guide",
] as const;
export type StaticGuideSlug = (typeof STATIC_GUIDE_SLUGS)[number];

/** Guides served by the catch-all app/guides/[slug]/page.tsx */
export const DYNAMIC_GUIDE_SLUGS = [
  "food-packaging-materials",
  "eco-friendly-packaging",
  "small-quantity-custom-box",
  "corrugated-flute-types",
  "corrugated-box-supplier-selection",
  "shipping-box-pricing",
  "cosmetic-packaging-box",
  "electronics-packaging-design",
  "packaging-material-complete-guide",
  "packaging-tape-comparison",
  "이사박스-대량구매-가이드",
  "이사박스-사이즈-규격",
  "2026-korea-packaging-trends",
  "glass-metal-container-guide",
  "packaging-accessories-guide",
  "packaging-printing-guide",
  "packaging-machinery-guide",
] as const;
export type DynamicGuideSlug = (typeof DYNAMIC_GUIDE_SLUGS)[number];

export type GuideSlug = StaticGuideSlug | DynamicGuideSlug;

/** Canonical list of all guide slugs — consumed by sitemap.ts. */
export const ALL_GUIDE_SLUGS: readonly GuideSlug[] = [
  ...STATIC_GUIDE_SLUGS,
  ...DYNAMIC_GUIDE_SLUGS,
];

export function listGuideSlugs(): string[] {
  return [...ALL_GUIDE_SLUGS];
}

export type GuideCategory = "box" | "material" | "industry" | "process" | "trend";

export const CATEGORY_LABELS: Record<GuideCategory, string> = {
  box: "박스·골판지",
  material: "소재",
  industry: "산업별",
  process: "공정·인쇄",
  trend: "트렌드",
};

export const CATEGORY_ORDER: GuideCategory[] = ["box", "material", "industry", "process", "trend"];

export type GuideMeta = {
  slug: GuideSlug;
  title: string;
  description: string;
  category: GuideCategory;
  /** 1 = v1 redesign template; absence = legacy prose template */
  redesignVersion?: 1;
  /** Short reading-time label shown on index cards, e.g. "6분" */
  readTime?: string;
  /** Emoji icon for index card display */
  icon?: string;
};

/** Display metadata for the /guides index page. Order matches ALL_GUIDE_SLUGS. */
export const GUIDE_META: GuideMeta[] = [
  // material (7)
  { slug: "label-printing-guide", category: "material",
    title: "라벨 인쇄 업체 선정 가이드",
    description: "인쇄 방식(디지털·옵셋·플렉소), 소재, MOQ, 납기 기준을 항목별로 비교합니다." },
  { slug: "flexible-packaging-guide", category: "material",
    title: "연포장재 완전 가이드 — 종류·소재·선택 기준",
    description: "파우치·롤 필름·합지 소재 비교, 식품 안전 기준(OTR·WVTR), MOQ·납기, 업체 선택 체크리스트를 정리합니다." },
  { slug: "plastic-container-guide", category: "material",
    title: "플라스틱 용기·병 종류 완전 가이드 — PET·PP·HDPE 소재 선택 + 식약처 기준",
    description: "PET·PP·HDPE·PS·PC 소재 비교, 식품용 식약처 이행성 시험 기준, 사출·블로우·진공 성형 공법 차이, 금형비·MOQ·친환경 rPET 비용을 정리합니다." },
  // process (2)
  { slug: "packaging-printing-guide", category: "process",
    title: "포장 인쇄 종류·후가공 완전 가이드 — 옵셋·플렉소·그라비어·디지털 비교",
    description: "포장 인쇄 방식(옵셋·플렉소·그라비어·디지털) 비교, 코팅·박·엠보싱 등 후가공 종류, 식품 인쇄 잉크 규제, 파일 규격 체크리스트를 정리합니다." },
  // material (cont.)
  { slug: "glass-metal-container-guide", category: "material",
    title: "유리·금속 용기 완전 가이드 — 종류·소재·MOQ·인쇄 옵션 비교 (2026)",
    description: "유리 용기(갈색·투명·청색, 병·단지·바이알)와 금속 캔(알루미늄·TFS·양철) 종류 비교, 식품·화장품·의약품별 선택 기준, B2B 구매 결정 비교표, MOQ·커스텀 성형 비용, 슈링크 라벨·직접 인쇄 옵션을 정리합니다." },
  { slug: "packaging-accessories-guide", category: "material",
    title: "포장 부자재 종류 완전 가이드 — 완충재·테이프·충전재 비교 + 환경 규제 (2026)",
    description: "에어캡(뽁뽁이)·EPE 폼·종이 완충재 등 완충재 종류, OPP·천·보안 테이프 선택 기준, 허니컴·우드울 충전재, 과대포장 환경 규제 대응, B2B 대량구매 단가 기준을 한곳에 정리했습니다." },
  // industry (4)
  { slug: "food-packaging-materials", category: "industry",
    title: "식품 포장재 소재 가이드",
    description: "식품 포장에 적합한 소재 선택 기준과 위생·규제 요건을 정리합니다." },
  { slug: "eco-friendly-packaging", category: "industry",
    title: "친환경 포장재 가이드",
    description: "FSC 인증, 생분해 필름, 재생 PET 등 친환경 포장재 전환 기준과 ESG 활용법을 정리합니다." },
  // box (6)
  { slug: "small-quantity-custom-box", category: "box",
    title: "소량 맞춤 박스 제작 가이드",
    description: "100개부터 가능한 소량 맞춤 박스 디지털 인쇄 방식, 단가, 납기, 파일 준비 방법을 안내합니다." },
  { slug: "corrugated-flute-types", category: "box",
    title: "골판지 플루트 유형 가이드",
    description: "A·B·C·E·F 플루트별 특성과 박스 설계 시 적합한 용도를 안내합니다." },
  { slug: "corrugated-box-supplier-selection", category: "box",
    title: "골판지 박스 업체 선정 가이드 — MOQ·납기·인쇄·인증 비교",
    description: "골판지 박스 업체 선정 시 MOQ, 납기, 인쇄 방식, 물류 접근성, 인증 기준을 항목별로 비교합니다.",
    redesignVersion: 1,
    readTime: "6분",
    icon: "📦" },
  { slug: "shipping-box-pricing", category: "box",
    title: "택배 박스 가격표 (2026) — 사이즈별 단가·수량 할인·업체 비교",
    description: "택배 박스 1호 130~180원, 2호 160~220원 (1,000개 기준). 수량 5,000개↑ 시 30~40% 할인. Packlinx에서 무료 견적 비교." },
  // industry (cont.)
  { slug: "cosmetic-packaging-box", category: "industry",
    title: "화장품 박스 포장 완전 가이드 — 구조·MOQ·후가공·법정 표시",
    description: "화장품 박스 구조(싸바리·접이식), MOQ, 후가공(금박·코팅), 법정 표시 의무를 정리합니다." },
  { slug: "electronics-packaging-design", category: "industry",
    title: "전자제품 포장 설계 가이드 — 완충재·ECT·ISTA 인증",
    description: "전자제품 택배 파손 원인, 완충재 소재(EPE·EPP·EPS), ECT 기준, ISTA 인증 요건을 정리합니다." },
  // material (cont.)
  { slug: "packaging-material-complete-guide", category: "material",
    title: "포장재 소재 완전 가이드 — 골판지·단프라·친환경 소재 비교",
    description: "골판지, 단프라(PP 골판지), 친환경 소재의 용도별 선택 기준과 MOQ·납기를 정리합니다." },
  { slug: "packaging-tape-comparison", category: "material",
    title: "포장 테이프 완전 비교 가이드 — OPP·크라프트·무소음 테이프",
    description: "OPP 아크릴·핫멜트·크라프트·무소음 테이프의 점착력·내열·내한성 차이와 용도별 선택 기준을 정리합니다." },
  // process (cont.)
  { slug: "packaging-machinery-guide", category: "process",
    title: "포장기계·자동화 완전 가이드 — 종류·ROI·도입 체크리스트 (2026년)",
    description: "충전기·밀봉기·라벨러·박스포장기·팔레타이저 종류 비교, 자동화 ROI 계산식, 국내 주요 제조사 비교, 식약처·KC 인증 요건, 발주 전 체크리스트를 한 곳에 정리했습니다." },
  // box (cont.)
  { slug: "이사박스-대량구매-가이드", category: "box",
    title: "이사박스 대량구매 가이드",
    description: "이사 규모별 박스 수량 기준, 대량구매 단가 협상 포인트, 업체 선정 기준을 안내합니다." },
  { slug: "이사박스-사이즈-규격", category: "box",
    title: "이사박스 사이즈 규격 완전 가이드",
    description: "이사박스 표준 규격표, 수납 물품별 적합 사이즈, 적재 기준을 정리합니다." },
  // trend (1)
  { slug: "2026-korea-packaging-trends", category: "trend",
    title: "2026 한국 패키징 트렌드 리포트 — 친환경·스마트·이커머스 변화 분석",
    description: "2026년 한국 포장재 시장의 5대 트렌드 — EPR 강화, 스마트 패키징 도입, 소량·맞춤 수요 증가, 단가 상승 대응, 이커머스 전용 설계 — 를 데이터 기반으로 분석합니다." },
];
