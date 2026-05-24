import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DYNAMIC_GUIDE_SLUGS, type DynamicGuideSlug } from "@/lib/guide-data";
import { GuidePageShell } from "@/components/guide/GuidePageShell";
import { GuideHero } from "@/components/guide/GuideHero";
import { GuideToc, type GuideTocItem } from "@/components/guide/GuideToc";
import { GuideCallout } from "@/components/guide/GuideCallout";
import { GuideCompareTable } from "@/components/guide/GuideCompareTable";
import { GuideChecklist } from "@/components/guide/GuideChecklist";
import { GuideFaq } from "@/components/guide/GuideFaq";
import { GuideSidebar } from "@/components/guide/GuideSidebar";
import { GuideEndCta } from "@/components/guide/GuideEndCta";
import Link from "next/link";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://packlinx.com";

type GuideContent = {
  title: string;
  description: string;
  datePublished: string;
  /** 1 = v1 redesign template */
  redesignVersion?: 1;
  body: React.ReactNode;
};

// Record<DynamicGuideSlug, ...> gives a compile-time error if any slug in
// DYNAMIC_GUIDE_SLUGS is missing a content entry here.
const GUIDES: Record<DynamicGuideSlug, GuideContent> = {
  "food-packaging-materials": {
    title: "식품 포장재 소재 가이드 — 용도별 소재 선택 기준 정리",
    description:
      "식품 포장재에 적합한 소재 선택 기준, 위생 규제, 용도별 적합 소재를 정리합니다. Packlinx에 등록된 식품 포장 업체를 비교해보세요.",
    datePublished: "2026-05-01",
    redesignVersion: 1,
    body: <FoodPackagingMaterialsContent />,
  },
  "eco-friendly-packaging": {
    title: "친환경 포장재 완전 가이드 — FSC·생분해·재생 소재 선택 기준",
    description:
      "FSC 인증, 생분해 필름(PLA/PBAT), 재생 PET(rPET) 등 친환경 포장재 전환 기준과 ESG 보고서 활용법을 정리합니다.",
    datePublished: "2026-05-01",
    redesignVersion: 1,
    body: <EcoFriendlyPackagingContent />,
  },
  "small-quantity-custom-box": {
    title: "소량 맞춤 박스 제작 가이드 — MOQ·단가·납기·파일 준비",
    description:
      "100개부터 가능한 소량 맞춤 박스 디지털 인쇄 방식, 단가, 납기, 디자인 파일 준비 기준을 안내합니다. Packlinx 박스 업체 디렉토리와 함께 활용하세요.",
    datePublished: "2026-05-01",
    redesignVersion: 1,
    body: <SmallQuantityCustomBoxContent />,
  },
  "corrugated-flute-types": {
    title: "박스 골 종류 완전 가이드 — a골·b골·ab골·e골·f골 차이 및 선택 기준",
    description:
      "a골(4.7mm)·ab골(이중벽)·e골(1.6mm) 등 골판지 박스 골 종류별 두께·완충성·인쇄 적합성을 비교합니다. 용도에 맞는 골을 5분에 선택하세요. Packlinx에서 골판지 업체 바로 비교.",
    datePublished: "2026-05-01",
    redesignVersion: 1,
    body: <CorugatedFluteTypesContent />,
  },
  "corrugated-box-supplier-selection": {
    title: "골판지 박스 업체 선정 가이드 — MOQ·납기·인쇄·인증 비교",
    description:
      "골판지 박스 업체 선정 시 MOQ, 납기, 인쇄 방식, 물류 접근성, 인증 기준을 항목별로 비교합니다. Packlinx에 등록된 골판지 박스 업체를 빠르게 찾아보세요.",
    datePublished: "2026-05-01",
    redesignVersion: 1,
    body: <CorrugatedBoxSupplierSelectionContent />,
  },
  "shipping-box-pricing": {
    title: "택배 박스 가격표 (2026) — 사이즈별 단가·수량 할인·업체 비교",
    description:
      "택배 박스 1호 130~180원, 2호 160~220원 (1,000개 기준). 수량 5,000개↑ 시 30~40% 할인. Packlinx에서 업체 정보 비교.",
    datePublished: "2026-05-01",
    redesignVersion: 1,
    body: <ShippingBoxPricingContent />,
  },
  "cosmetic-packaging-box": {
    title: "화장품 박스 포장 완전 가이드 — 구조·MOQ·후가공·법정 표시",
    description:
      "화장품 박스 구조(싸바리·접이식), MOQ, 후가공(금박·코팅), 법정 표시 의무를 정리합니다.",
    datePublished: "2026-05-01",
    redesignVersion: 1,
    body: <CosmeticPackagingBoxContent />,
  },
  "electronics-packaging-design": {
    title: "전자제품 포장 설계 가이드 — 완충재·ECT·ISTA 인증",
    description:
      "전자제품 택배 파손 원인, 완충재 소재(EPE·EPP·EPS), ECT 기준, ISTA 인증 요건을 정리합니다.",
    datePublished: "2026-05-01",
    redesignVersion: 1,
    body: <ElectronicsPackagingDesignContent />,
  },
  "packaging-material-complete-guide": {
    title: "포장재 소재 완전 가이드 — 골판지·단프라·친환경 소재 비교",
    description:
      "골판지, 단프라(PP 골판지), 친환경 소재의 용도별 선택 기준과 MOQ·납기를 정리합니다.",
    datePublished: "2026-05-01",
    redesignVersion: 1,
    body: <PackagingMaterialCompleteGuideContent />,
  },
  "packaging-tape-comparison": {
    title: "포장 테이프 완전 비교 가이드 — OPP·크라프트·무소음 테이프",
    description:
      "OPP 아크릴·핫멜트·크라프트·무소음 테이프의 점착력·내열·내한성 차이와 용도별 선택 기준을 정리합니다.",
    datePublished: "2026-05-10",
    redesignVersion: 1,
    body: null,
  },
  "이사박스-대량구매-가이드": {
    title: "이사박스 대량구매 가이드 — 수량 기준·단가·업체 선정",
    description:
      "이사 규모별 박스 수량 기준, 대량구매 단가 협상 포인트, 업체 선정 기준을 안내합니다.",
    datePublished: "2026-05-01",
    redesignVersion: 1,
    body: <MovingBoxBulkPurchaseContent />,
  },
  "이사박스-사이즈-규격": {
    title: "이사박스 사이즈 규격 완전 가이드 — 표준 규격표·적재 기준",
    description:
      "이사박스 표준 규격표, 수납 물품별 적합 사이즈, 적재 기준을 정리합니다.",
    datePublished: "2026-05-01",
    redesignVersion: 1,
    body: <MovingBoxSizeGuideContent />,
  },
  "2026-korea-packaging-trends": {
    title: "2026 한국 패키징 트렌드 리포트 — 친환경·스마트·이커머스 변화 분석",
    description:
      "2026년 한국 포장재 시장의 5대 트렌드 — EPR 강화, 스마트 패키징 도입, 소량·맞춤 수요 증가, 단가 상승 대응, 이커머스 전용 설계 — 를 데이터 기반으로 분석합니다.",
    datePublished: "2026-05-10",
    redesignVersion: 1,
    body: null,
  },
  "glass-metal-container-guide": {
    title: "유리·금속 용기 완전 가이드 — 종류·소재·MOQ·인쇄 옵션 비교 (2026)",
    description:
      "유리 용기(갈색·투명·청색, 병·단지·바이알)와 금속 캔(알루미늄·TFS·양철) 종류 비교, 식품·화장품·의약품별 선택 기준, B2B 구매 결정 비교표, MOQ·커스텀 성형 비용, 슈링크 라벨·직접 인쇄 옵션을 한곳에 정리했습니다.",
    datePublished: "2026-05-01",
    redesignVersion: 1,
    body: null,
  },
  "packaging-accessories-guide": {
    title: "포장 부자재 종류 완전 가이드 — 완충재·테이프·충전재 비교 + 환경 규제 (2026)",
    description:
      "에어캡(뽁뽁이)·EPE 폼·종이 완충재 등 완충재 종류, OPP·천·보안 테이프 선택 기준, 허니컴·우드울 충전재, 과대포장 환경 규제 대응, B2B 대량구매 단가 기준을 한곳에 정리했습니다.",
    datePublished: "2026-05-01",
    redesignVersion: 1,
    body: null,
  },
  "packaging-printing-guide": {
    title: "포장 인쇄 종류·후가공 완전 가이드 — 옵셋·플렉소·그라비어·디지털 비교",
    description:
      "포장 인쇄 방식(옵셋·플렉소·그라비어·디지털) 비교, 코팅·박·엠보싱 등 후가공 종류, 식품 인쇄 잉크 규제, 파일 규격 체크리스트를 정리합니다.",
    datePublished: "2026-05-10",
    redesignVersion: 1,
    body: null,
  },
  "packaging-machinery-guide": {
    title: "포장기계·자동화 완전 가이드 — 종류·ROI·도입 체크리스트 (2026년)",
    description:
      "충전기·밀봉기·라벨러·박스포장기·팔레타이저 종류 비교, 자동화 ROI 계산식, 국내 주요 제조사 비교, 식약처·KC 인증 요건, 발주 전 체크리스트를 한 곳에 정리했습니다.",
    datePublished: "2026-05-10",
    redesignVersion: 1,
    body: null,
  },
};

type Props = { params: Promise<{ slug: string }> };

function isDynamicGuideSlug(slug: string): slug is DynamicGuideSlug {
  return (DYNAMIC_GUIDE_SLUGS as readonly string[]).includes(slug);
}

export function generateStaticParams() {
  return DYNAMIC_GUIDE_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug);
  if (!isDynamicGuideSlug(slug)) return {};
  const guide = GUIDES[slug];
  const canonicalUrl = `${siteUrl}/guides/${slug}`;
  return {
    title: guide.title,
    description: guide.description,
    alternates: {
      canonical: canonicalUrl,
      languages: { "ko-KR": canonicalUrl, "x-default": canonicalUrl },
    },
    openGraph: {
      title: guide.title,
      description: guide.description,
      url: canonicalUrl,
      siteName: "Packlinx",
      locale: "ko_KR",
      type: "article",
      images: [{ url: `${siteUrl}/og-default.png`, width: 1200, height: 630, alt: guide.title }],
    },
    twitter: {
      card: "summary_large_image",
      images: [`${siteUrl}/og-default.png`],
    },
  };
}

export default async function GuidePage({ params }: Props) {
  const { slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug);
  if (!isDynamicGuideSlug(slug)) notFound();
  const guide = GUIDES[slug];

  if (guide.redesignVersion === 1) {
    return <GuideV1Page slug={slug} guide={guide} />;
  }

  return (
    <GuidePageShell>
      <main>
        <h1>{guide.title}</h1>
        {guide.body}
      </main>
    </GuidePageShell>
  );
}

// ─── v1 redesign template ────────────────────────────────────────────────────

const CORRUGATED_TOC_ITEMS: GuideTocItem[] = [
  { id: "s1", label: "1. 업체 유형 4가지" },
  { id: "s2", label: "2. MOQ·단가·납기 비교표" },
  { id: "s3", label: "3. 견적 전 5가지 체크" },
  { id: "s4", label: "4. 샘플 검수 체크리스트" },
  { id: "s5", label: "5. 자주 묻는 질문" },
];

function GuideV1Page({
  slug,
  guide,
}: {
  slug: string;
  guide: GuideContent;
}) {
  if (slug === "corrugated-box-supplier-selection") {
    return <CorrugatedBoxGuideV1 slug={slug} guide={guide} />;
  }
  if (slug === "corrugated-flute-types") {
    return <GuideSlotV1Page slug={slug} guide={guide} data={SLOT_DATA_CORRUGATED_FLUTE} />;
  }
  if (slug === "shipping-box-pricing") {
    return <GuideSlotV1Page slug={slug} guide={guide} data={SLOT_DATA_SHIPPING_PRICING} />;
  }
  if (slug === "small-quantity-custom-box") {
    return <GuideSlotV1Page slug={slug} guide={guide} data={SLOT_DATA_SMALL_QUANTITY} />;
  }
  if (slug === "이사박스-사이즈-규격") {
    return <GuideSlotV1Page slug={slug} guide={guide} data={SLOT_DATA_MOVING_SIZE} />;
  }
  if (slug === "이사박스-대량구매-가이드") {
    return <GuideSlotV1Page slug={slug} guide={guide} data={SLOT_DATA_MOVING_BULK} />;
  }
  if (slug === "eco-friendly-packaging") {
    return <GuideSlotV1Page slug={slug} guide={guide} data={SLOT_DATA_ECO_FRIENDLY} />;
  }
  if (slug === "packaging-material-complete-guide") {
    return <GuideSlotV1Page slug={slug} guide={guide} data={SLOT_DATA_PACKAGING_MATERIAL} />;
  }
  if (slug === "food-packaging-materials") {
    return <GuideSlotV1Page slug={slug} guide={guide} data={SLOT_DATA_FOOD_PACKAGING} />;
  }
  if (slug === "cosmetic-packaging-box") {
    return <GuideSlotV1Page slug={slug} guide={guide} data={SLOT_DATA_COSMETIC_BOX} />;
  }
  if (slug === "electronics-packaging-design") {
    return <GuideSlotV1Page slug={slug} guide={guide} data={SLOT_DATA_ELECTRONICS_PACKAGING} />;
  }
  if (slug === "glass-metal-container-guide") {
    return <GuideSlotV1Page slug={slug} guide={guide} data={SLOT_DATA_GLASS_METAL} />;
  }
  if (slug === "packaging-accessories-guide") {
    return <GuideSlotV1Page slug={slug} guide={guide} data={SLOT_DATA_PACKAGING_ACCESSORIES} />;
  }
  if (slug === "packaging-tape-comparison") {
    return <GuideSlotV1Page slug={slug} guide={guide} data={SLOT_DATA_PACKAGING_TAPE} />;
  }
  if (slug === "2026-korea-packaging-trends") {
    return <GuideSlotV1Page slug={slug} guide={guide} data={SLOT_DATA_KOREA_TRENDS_2026} />;
  }
  if (slug === "packaging-printing-guide") {
    return <GuideSlotV1Page slug={slug} guide={guide} data={SLOT_DATA_PACKAGING_PRINTING} />;
  }
  if (slug === "packaging-machinery-guide") {
    return <GuideSlotV1Page slug={slug} guide={guide} data={SLOT_DATA_PACKAGING_MACHINERY} />;
  }
  // Fallback to prose template for any other redesign-flagged guide
  return (
    <GuidePageShell>
      <main>
        <h1>{guide.title}</h1>
        {guide.body}
      </main>
    </GuidePageShell>
  );
}

function CorrugatedBoxGuideV1({ slug, guide }: { slug: string; guide: GuideContent }) {
  const canonicalUrl = `${siteUrl}/guides/${slug}`;
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.title,
    description: guide.description,
    url: canonicalUrl,
    inLanguage: "ko-KR",
    datePublished: guide.datePublished,
    author: { "@type": "Organization", name: "Packlinx", url: siteUrl },
    image: `${siteUrl}/og-default.png`,
    publisher: { "@type": "Organization", name: "Packlinx", url: siteUrl },
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "해외(중국·동남아) 업체와 국내 업체 단가 차이는?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "평균적으로 국내 대비 30~45% 저렴하지만, 운송·통관·MOQ(보통 5,000매 이상)·리드타임(30~45일)을 합산하면 월 50,000매 이상 안정적 발주가 가능한 경우에만 유리합니다.",
        },
      },
      {
        "@type": "Question",
        name: "샘플은 무료인가요?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "기성 박스 샘플은 대부분 무료(택배비만 부담)이며, 인쇄·후가공 포함 커스텀 샘플은 1~5만원 또는 양산 시 차감 조건이 일반적입니다.",
        },
      },
      {
        "@type": "Question",
        name: "발주 후 디자인 수정이 가능한 시점은?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "제판 제작 전까지만 무료 수정. 제판 이후 수정 시 100,000~300,000원의 재제판 비용이 발생합니다.",
        },
      },
      {
        "@type": "Question",
        name: "친환경 인증 (FSC) 박스는 단가가 얼마나 더 비싼가요?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "동일 사양 대비 8~15% 추가.",
        },
      },
    ],
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "홈", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "포장 가이드", item: `${siteUrl}/guides` },
      { "@type": "ListItem", position: 3, name: guide.title, item: canonicalUrl },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {/* Hero — full-width breakout from the layout's overflow-x-clip wrapper */}
      {/* V1 #3: --g-brand navy → V05 purple across section badges, CTA, sidebar */}
      <div
        className="-mx-5 sm:-mx-8 -mt-10 sm:-mt-14"
        style={
          {
            "--g-brand": "var(--color-brand-500)",
            "--g-brand-2": "var(--color-brand-400)",
            "--g-brand-soft": "var(--color-brand-50)",
          } as React.CSSProperties
        }
      >
        <GuideHero
          tag="박스·골판지 · 업체 선정"
          title="골판지 박스 업체, 어떻게 골라야 후회 안 할까?"
          subtitle="MOQ·납기·인쇄·인증을 동일 기준으로 비교하는 4단계 체크리스트"
          dateLabel="2026-04 업데이트"
          readTime="6분 읽기"
          views="4,128 조회"
          category="박스·골판지"
          categoryHref="/guides"
          tldr={[
            {
              bold: "업체 유형 4가지",
              text: "— 직판 제조, 도매 유통, 인쇄 특화, 종합 패키징. 각각 MOQ·단가·납기 구조가 다름.",
            },
            {
              bold: "견적 받기 전 체크",
              text: "— 골 종류, 인쇄 사양, 후가공, 납기, 샘플 수령 가능 여부 5가지를 확정해야 정확한 비교가 가능.",
            },
            {
              bold: "샘플 검수 5항목",
              text: "— 압축강도·인쇄 정합·접착·치수·발주 식별 — 이 5가지만 통과하면 양산 리스크 80% 차단.",
            },
          ]}
        />

        {/* 3-col layout */}
        <div
          className="max-w-[1180px] mx-auto px-6"
          style={{
            display: "grid",
            gridTemplateColumns: "240px 1fr 280px",
            gap: "48px",
            padding: "40px 24px 80px",
          }}
        >
          {/* TOC — V1 #3: active state → purple */}
          <GuideToc items={CORRUGATED_TOC_ITEMS} />

          {/* Article */}
          <article
            style={{
              fontSize: "17px",
              lineHeight: "1.78",
              color: "var(--g-ink-2)",
              maxWidth: "760px",
            }}
          >
            <h2
              id="s1"
              className="text-[26px] leading-[1.3] tracking-[-0.015em] mt-12 mb-[14px] text-[var(--g-ink)] font-extrabold scroll-mt-28"
            >
              <span
                aria-hidden
                className="inline-grid place-items-center w-[30px] h-[30px] rounded-lg bg-[var(--g-brand)] text-white text-sm mr-[10px] align-middle"
              >
                1
              </span>
              업체 유형 4가지 — 무엇이 다른가
            </h2>
            <p>
              같은 &ldquo;골판지 박스&rdquo;라도 어디서 발주하느냐에 따라 단가는{" "}
              <strong className="text-[var(--g-ink)]">최대 2배 이상</strong> 차이가 납니다.
              첫 단계는 우리 회사가 어떤 유형의 업체에 발주해야 적합한지 파악하는 것입니다.
            </p>

            <GuideCallout variant="info" title="핵심 원칙">
              <p>
                월 발주량 5,000매 이하라면 도매 유통, 5,000~30,000매는 인쇄 특화, 30,000매
                이상은 직판 제조가 보통 가장 유리합니다. 단, 인쇄 컬러 수가 4도 이상이면
                발주량과 무관하게 인쇄 특화 업체를 권장합니다.
              </p>
            </GuideCallout>

            <h2
              id="s2"
              className="text-[26px] leading-[1.3] tracking-[-0.015em] mt-12 mb-[14px] text-[var(--g-ink)] font-extrabold scroll-mt-28"
            >
              <span
                aria-hidden
                className="inline-grid place-items-center w-[30px] h-[30px] rounded-lg bg-[var(--g-brand)] text-white text-sm mr-[10px] align-middle"
              >
                2
              </span>
              MOQ·단가·납기 한눈에 비교
            </h2>
            <p>
              아래 표는 2026년 1분기 등록 업체 평균치 기준입니다. 단가는
              200×150×100mm·BC골·1도 인쇄 기준으로 환산했습니다.
            </p>

            <GuideCompareTable
              columns={[
                { key: "type", label: "업체 유형" },
                { key: "moq", label: "MOQ" },
                { key: "price", label: "단가 (매)" },
                { key: "leadtime", label: "납기" },
                { key: "print", label: "인쇄 역량" },
                { key: "scale", label: "적합 발주 규모" },
              ]}
              rows={[
                {
                  type: "<strong>직판 제조</strong>",
                  moq: { text: "3,000매~", pill: "warn" },
                  price: "₩280~420",
                  leadtime: "10~14일",
                  print: "1~2도",
                  scale: "월 30,000매 이상",
                },
                {
                  type: "<strong>도매 유통</strong>",
                  moq: { text: "100매~", pill: "good" },
                  price: "₩520~780",
                  leadtime: "2~5일",
                  print: "무지·기성",
                  scale: "월 5,000매 이하",
                },
                {
                  type: "<strong>인쇄 특화</strong>",
                  moq: { text: "500매~", pill: "default" },
                  price: "₩460~650",
                  leadtime: "7~10일",
                  print: "4~8도·후가공",
                  scale: "브랜드 박스·중간 발주",
                },
                {
                  type: "<strong>종합 패키징</strong>",
                  moq: { text: "1,000매~", pill: "warn" },
                  price: "₩430~590",
                  leadtime: "5~10일",
                  print: "2~4도",
                  scale: "다품종 동시 발주",
                },
              ]}
            />

            <GuideCallout variant="warn" title="흔한 실수">
              <p>
                &ldquo;단가만 보고 직판 제조에 의뢰&rdquo; — MOQ 미달이면 견적이 도매 수준으로
                올라가거나 거절당합니다. 발주 전 MOQ를 먼저 확인하세요.
              </p>
            </GuideCallout>

            <h2
              id="s3"
              className="text-[26px] leading-[1.3] tracking-[-0.015em] mt-12 mb-[14px] text-[var(--g-ink)] font-extrabold scroll-mt-28"
            >
              <span
                aria-hidden
                className="inline-grid place-items-center w-[30px] h-[30px] rounded-lg bg-[var(--g-brand)] text-white text-sm mr-[10px] align-middle"
              >
                3
              </span>
              견적 받기 전 5가지를 확정하세요
            </h2>
            <p>
              업체 5곳에 같은 사양으로 견적을 받아야 비교가 됩니다. 다음 5가지가 빠지면 받은
              견적은 의미가 없습니다.
            </p>

            <GuideChecklist
              title="견적 요청 전 확정 항목"
              items={[
                "<strong>외경 치수</strong> — 너비×길이×높이 (mm). 내경 기준이면 별도 명시",
                "<strong>골 종류</strong> — A·B·E·F골 또는 BC·EB 합지",
                "<strong>인쇄 사양</strong> — 도수, Pantone 컬러 코드, 인쇄 면적 비율",
                "<strong>후가공</strong> — 코팅, 박, 형압, 창 (불필요시 &ldquo;없음&rdquo; 명시)",
                "<strong>납기·납품 방법</strong> — 희망 납기일, 분납 여부, 직배송/택배",
              ]}
            />

            <h2
              id="s4"
              className="text-[26px] leading-[1.3] tracking-[-0.015em] mt-12 mb-[14px] text-[var(--g-ink)] font-extrabold scroll-mt-28"
            >
              <span
                aria-hidden
                className="inline-grid place-items-center w-[30px] h-[30px] rounded-lg bg-[var(--g-brand)] text-white text-sm mr-[10px] align-middle"
              >
                4
              </span>
              샘플 검수 — 5가지만 보면 됩니다
            </h2>
            <p>
              샘플은 <strong className="text-[var(--g-ink)]">최소 3매 이상</strong> 받아 다음
              5가지 항목을 평가하세요. 한 가지라도 통과하지 못하면 양산 후 더 큰 비용이
              발생합니다.
            </p>

            <h3 className="text-[19px] mt-[30px] mb-[10px] text-[var(--g-ink)] font-bold tracking-[-0.01em]">
              ① 압축강도 (Compression Strength)
            </h3>
            <p>
              적재 시 무너지지 않는지 확인. 책상 모서리에 박스 모서리를 맞대고 체중을 실어
              눌러도 함몰되지 않아야 합니다.
            </p>

            <h3 className="text-[19px] mt-[30px] mb-[10px] text-[var(--g-ink)] font-bold tracking-[-0.01em]">
              ② 인쇄 정합·색상
            </h3>
            <p>Pantone 색상 일치, 도판 어긋남(misregister) 없음, 인쇄면 긁힘 없음.</p>

            <h3 className="text-[19px] mt-[30px] mb-[10px] text-[var(--g-ink)] font-bold tracking-[-0.01em]">
              ③ 접착·접합
            </h3>
            <p>
              이음새 부위를 손으로 꺾어 5회 반복. 접착이 떨어지면 양산 시 운송 중 파손률
              급증.
            </p>

            <h3 className="text-[19px] mt-[30px] mb-[10px] text-[var(--g-ink)] font-bold tracking-[-0.01em]">
              ④ 치수 정밀도
            </h3>
            <p>
              ±2mm 이내. 자동 포장 라인을 쓴다면 ±1mm 이내 요구 가능.
            </p>

            <h3 className="text-[19px] mt-[30px] mb-[10px] text-[var(--g-ink)] font-bold tracking-[-0.01em]">
              ⑤ 발주 식별 정보
            </h3>
            <p>
              박스 내부 또는 측면에 발주 코드·생산일자가 인쇄/스탬핑 되어 있어야 추후 클레임
              시 추적이 가능.
            </p>

            <GuideCallout variant="tip" title="Pro tip">
              <p>
                샘플 평가표를 PDF로 저장해 모든 업체에 동일 기준으로 적용하세요. 주관 평가가
                아닌 객관 데이터가 협상력을 만듭니다.
              </p>
            </GuideCallout>

            <h2
              id="s5"
              className="text-[26px] leading-[1.3] tracking-[-0.015em] mt-12 mb-[14px] text-[var(--g-ink)] font-extrabold scroll-mt-28"
            >
              <span
                aria-hidden
                className="inline-grid place-items-center w-[30px] h-[30px] rounded-lg bg-[var(--g-brand)] text-white text-sm mr-[10px] align-middle"
              >
                5
              </span>
              자주 묻는 질문
            </h2>

            <GuideFaq
              items={[
                {
                  question: "해외(중국·동남아) 업체와 국내 업체 단가 차이는?",
                  answer:
                    "평균적으로 국내 대비 30~45% 저렴하지만, 운송·통관·MOQ(보통 5,000매 이상)·리드타임(30~45일)을 합산하면 월 50,000매 이상 안정적 발주가 가능한 경우에만 유리합니다. 시즌성 발주는 권장하지 않습니다.",
                },
                {
                  question: "샘플은 무료인가요? 비용이 든다면 얼마인가요?",
                  answer:
                    "기성 박스 샘플은 대부분 무료(택배비만 부담)이며, 인쇄·후가공 포함 커스텀 샘플은 1~5만원 또는 양산 시 차감 조건이 일반적입니다.",
                },
                {
                  question: "발주 후 디자인 수정이 가능한 시점은?",
                  answer:
                    "제판(인쇄용 동판) 제작 전까지만 무료 수정. 제판 이후 수정 시 ₩100,000~₩300,000의 재제판 비용이 발생합니다.",
                },
                {
                  question: "친환경 인증 (FSC) 박스는 단가가 얼마나 더 비싼가요?",
                  answer:
                    '동일 사양 대비 8~15% 추가. 자세한 비교는 <a href="/guides/eco-friendly-packaging">친환경 포장 가이드</a>를 참고하세요.',
                },
              ]}
            />

            <GuideEndCta
              headline="이 가이드대로 견적 받을 업체 찾으세요"
              subtext="골판지 박스 등록 업체 320곳 — MOQ·납기 필터로 즉시 비교"
              buttonLabel="업체 비교하기 →"
              href="/products/box"
            />
          </article>

          {/* Sidebar — V1 #3: purple CTA button, hover links */}
          <GuideSidebar
            ctaHeadline="MOQ 500개부터 가능한 업체"
            ctaSubtext="등록된 320개 골판지 박스 업체 중 조건에 맞는 곳만 추려 비교하세요."
            ctaButtonLabel="업체 찾기 →"
            ctaHref="/products/box"
            relatedGuides={[
              { href: "/guides/corrugated-flute-types", title: "골판지 골 종류 (A·B·E·F골) 선택", readTime: "4분" },
              { href: "/guides/shipping-box-pricing", title: "택배 박스 단가 — 수량·사이즈별", readTime: "5분" },
              { href: "/guides/small-quantity-custom-box", title: "소량 맞춤 박스 — 100~500매 발주", readTime: "4분" },
              { href: "/guides/eco-friendly-packaging", title: "친환경 패키징 — 인증·비용·로드맵", readTime: "7분" },
            ]}
          />
        </div>
      </div>

      {/* V1 #4: mobile sticky bottom CTA — desktop sidebar covers this */}
      <div
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 px-4 pb-4 pt-3"
        style={{ background: "linear-gradient(180deg, transparent 0%, rgba(250,251,252,0.96) 30%, #fafbfc 100%)" }}
      >
        <Link
          href="/products/box"
          className="block text-center text-white font-bold py-4 rounded-[12px] no-underline text-[15px] hover:opacity-90 transition-opacity"
          style={{ background: "var(--color-brand-500)" }}
        >
          업체 찾기 →
        </Link>
      </div>
      <div className="lg:hidden h-20" />
    </>
  );
}

function FoodPackagingMaterialsContent() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "식품 포장재가 식약처 기준을 충족하는지 어떻게 확인하나요?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "식품에 직접 접촉하는 포장재는 식약처 「기구 및 용기·포장의 기준 및 규격」을 충족해야 합니다. 업체에 KOLAS 인정 시험기관이 발급한 자가품질검사 시험성적서를 요청하세요. 소재 자체가 아닌 개별 제품별로 적합 여부가 결정됩니다.",
        },
      },
      {
        "@type": "Question",
        name: "밀키트·냉장 배송용 식품 포장재는 어떤 소재가 적합한가요?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "PP(폴리프로필렌) 트레이와 PE 필름 밀봉 조합이 일반적으로 권장됩니다. PP는 내유성·내열성이 우수하고 전자레인지 사용이 가능합니다. MOQ는 3,000~5,000개, 단가는 80~200원 수준입니다.",
        },
      },
      {
        "@type": "Question",
        name: "커피·분말 식품 장기 보관용 포장재 소재는 무엇인가요?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "알루미늄 파우치(삼면 실링)가 권장됩니다. 산소와 습기 차단 성능이 가장 높아 장기 보관에 적합합니다. MOQ는 3,000~5,000매, 단가는 80~250원 수준입니다.",
        },
      },
      {
        "@type": "Question",
        name: "식품 포장재 금형비는 얼마인가요?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "PP 트레이·PET 용기 등 맞춤 규격 제작 시 금형비가 50~200만 원 별도로 발생합니다. 표준 규격 활용 시 금형비를 절감할 수 있습니다.",
        },
      },
      {
        "@type": "Question",
        name: "FSC 인증 종이 식품 포장재는 일반 소재 대비 단가 차이가 얼마나 되나요?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "FSC 인증 원지를 사용하는 종이 식품 포장재는 일반 대비 20~30% 추가됩니다. 일반 종이 식품 포장 단가는 소형 포장 기준 50~150원 수준입니다.",
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <p>
        식품 포장재는 내용물 보호, 위생, 법적 규제, 소비자 편의성을 동시에 충족해야 합니다.
        소재를 잘못 선택하면 유통 중 오염이나 규제 위반으로 이어질 수 있으므로, 제품 특성과
        유통 환경을 먼저 파악한 뒤 소재를 결정하십시오.
      </p>

      <section>
        <h2>1. 식품 포장재 소재 분류 및 특성</h2>
        <table>
          <thead>
            <tr>
              <th>소재</th>
              <th>내열성</th>
              <th>내냉성</th>
              <th>산소 차단성</th>
              <th>주요 용도</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>PP(폴리프로필렌)</td>
              <td>높음 (120°C)</td>
              <td>중간</td>
              <td>낮음</td>
              <td>반찬 용기, 전자레인지용 용기</td>
            </tr>
            <tr>
              <td>PE(폴리에틸렌)</td>
              <td>중간 (80°C)</td>
              <td>높음</td>
              <td>낮음</td>
              <td>냉동식품 봉투, 지퍼백</td>
            </tr>
            <tr>
              <td>PET(폴리에스터)</td>
              <td>중간 (70°C)</td>
              <td>높음</td>
              <td>중간</td>
              <td>음료 병, 샐러드 용기</td>
            </tr>
            <tr>
              <td>나일론(PA)</td>
              <td>높음</td>
              <td>높음</td>
              <td>높음</td>
              <td>진공 포장, 육류·수산물</td>
            </tr>
            <tr>
              <td>알루미늄 호일</td>
              <td>매우 높음</td>
              <td>높음</td>
              <td>매우 높음</td>
              <td>레토르트 파우치, 스낵 봉투</td>
            </tr>
            <tr>
              <td>종이·판지</td>
              <td>낮음</td>
              <td>낮음</td>
              <td>낮음</td>
              <td>건식품 박스, 냉동식품 외포</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section>
        <h2>2. 식품 포장재 규제 요건</h2>
        <p>
          국내 식품 포장재는 식품위생법 및 기구·용기·포장의 기준 및 규격(식품의약품안전처 고시)을
          준수해야 합니다. 업체 선정 시 해당 소재의 용출 시험 성적서 제공 가능 여부를 반드시
          확인하십시오.
        </p>
        <ul>
          <li>
            <strong>용출 시험:</strong> 소재가 식품과 접촉할 때 유해 물질이 용출되지 않는지
            확인하는 시험. 납, 카드뮴 등 중금속과 비스페놀A(BPA) 등 내분비계 교란 물질을 검사합니다.
          </li>
          <li>
            <strong>식품접촉재질 인증:</strong> 일부 유통 채널(대형 마트, 온라인 플랫폼)은
            공급업체에게 식품접촉재질 적합 확인서를 요구하므로, 첫 거래 전에 서류 준비 여부를
            확인하십시오.
          </li>
          <li>
            <strong>리사이클 표시:</strong> 포장재에 재질 분리 표시를 올바르게 표기해야 합니다.
            표기 오류 시 과태료가 부과될 수 있습니다.
          </li>
        </ul>
      </section>

      <section>
        <h2>3. 용도별 소재 선택</h2>
        <ul>
          <li>
            <strong>냉동식품:</strong> PE 또는 나일론/PE 복합 필름. 저온에서 접착력과 유연성이
            유지되어야 합니다.
          </li>
          <li>
            <strong>전자레인지 가열 용기:</strong> 전자레인지 전용 PP(CPP 또는 RCPP 계열). 일반
            PP라도 전자레인지 적합 표시가 없으면 가열에 주의해야 합니다.
          </li>
          <li>
            <strong>진공 포장(육류·수산물):</strong> 나일론/PE 또는 EVOH 복합 필름. 높은 산소
            차단성이 필요합니다.
          </li>
          <li>
            <strong>건식품·스낵:</strong> 알루미늄 호일 적층 필름(알루미 파우치) 또는 OPP/CPP
            복합 필름. 방습과 산소 차단이 핵심입니다.
          </li>
        </ul>
      </section>

      <section>
        <h2>4. 업체 선정 체크리스트</h2>
        <ol>
          <li>식품위생법 적합 소재 사용 여부 및 용출 시험 성적서 제공 가능 여부</li>
          <li>HACCP 인증 또는 식품 포장재 전문 생산 이력 확인</li>
          <li>소량 샘플 제작 및 실물 확인 후 본 발주 가능 여부</li>
          <li>납기 및 재발주 단가 조건</li>
          <li>리사이클 분리 표시 인쇄 서비스 제공 여부</li>
        </ol>
      </section>

      <footer>
        <p>
          <em>
            이 가이드는 Packlinx 콘텐츠팀이 작성하였습니다. 수록된 내용은 일반적인 시장 기준이며
            개별 제품·업체 상황에 따라 다를 수 있습니다.
          </em>
        </p>
      </footer>
    </>
  );
}

function CorugatedFluteTypesContent() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "골판지 A골과 B골의 실질적인 차이는 무엇인가요?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "A골은 두께 약 5mm에 완충성이 가장 높은 편이며 가전·가구 등 무거운 제품과 장거리 운송에 적합합니다. B골은 두께 약 3mm로 가장 범용적인 택배 박스 표준이며 완충성과 인쇄 적합성의 균형이 좋습니다. B골 대비 A골 단가는 약 15~20% 높습니다.",
        },
      },
      {
        "@type": "Question",
        name: "제품 무게가 5kg을 넘으면 어떤 골을 선택해야 하나요?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "3~5kg 제품은 B골로 충분하지만 5kg 초과 시에는 A골 사용이 권장됩니다. 10kg 이상 제품에는 A골, 20kg 초과 중량물이나 5단 이상 적재가 필요한 경우에는 AB골(이중골)을 선택해야 합니다.",
        },
      },
      {
        "@type": "Question",
        name: "E골 박스는 화장품 포장에 충분한 강도인가요?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "500g 이하 화장품·소형 전자기기처럼 파손 민감도가 낮은 제품에는 E골이 적합합니다. E골은 두께 약 1.5mm로 인쇄 품질이 최상급이며, B골 대비 개당 단가가 20~25% 낮아 배송비와 포장 원가를 동시에 절감할 수 있습니다.",
        },
      },
      {
        "@type": "Question",
        name: "AB골(이중골)은 언제 반드시 선택해야 하나요?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "내용물 총 중량이 15kg을 초과하거나 물류센터에서 5단 이상 적재가 필요한 경우, 또는 수출처럼 장거리 운송으로 충격 노출 시간이 긴 경우에 AB골을 선택해야 합니다. 10kg 이하 제품에 AB골을 적용하면 박스 무게만 늘어 배송비가 상승합니다.",
        },
      },
      {
        "@type": "Question",
        name: "골 종류에 따른 개당 단가 차이는 얼마나 되나요?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "3호 규격 1,000개 발주 기준(B등급 원지·무인쇄): E골 250~320원, B골 330~420원, A골 380~490원, AB골 480~620원 수준입니다. E골과 B골 차이는 개당 약 80~100원으로, 월 1,000박스 발주 시 연간 약 100만 원 이상 절감이 가능합니다.",
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <p>
        골판지 박스의 강도와 무게, 적합 용도는 내부 파형 구조인 &ldquo;플루트&rdquo; 유형에 따라
        달라집니다. 플루트를 잘못 선택하면 수송 중 파손이 늘거나 불필요하게 두꺼운 박스로
        물류 비용이 증가합니다. 발주 전 제품 중량, 적재 단수, 유통 환경을 먼저 확인하십시오.
      </p>

      <section>
        <h2>1. 플루트 유형별 비교</h2>
        <table>
          <thead>
            <tr>
              <th>플루트</th>
              <th>두께(mm)</th>
              <th>골 수(/30cm)</th>
              <th>특성</th>
              <th>주요 용도</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>A 플루트</td>
              <td>약 4.7</td>
              <td>33±3</td>
              <td>쿠션성 우수, 압축 강도 우수</td>
              <td>유리·도자기 포장, 고중량 제품</td>
            </tr>
            <tr>
              <td>B 플루트</td>
              <td>약 2.4</td>
              <td>47±3</td>
              <td>인쇄 적성 우수, 평압 강도 높음</td>
              <td>통조림·캔 포장, 디스플레이 박스</td>
            </tr>
            <tr>
              <td>C 플루트</td>
              <td>약 3.5</td>
              <td>38±3</td>
              <td>강도·쿠션성 균형, 가장 범용적</td>
              <td>일반 택배 박스, 식품 포장</td>
            </tr>
            <tr>
              <td>E 플루트</td>
              <td>약 1.5</td>
              <td>90±4</td>
              <td>얇고 가벼움, 인쇄 정밀도 높음</td>
              <td>소형 고급 포장, 화장품·전자제품</td>
            </tr>
            <tr>
              <td>F 플루트</td>
              <td>약 0.8</td>
              <td>125±4</td>
              <td>초박형, 소형 정밀 박스에 적합</td>
              <td>의약품·소형 식품 개별 포장</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section>
        <h2>2. 플루트 선택 기준</h2>
        <h3>제품 중량 기준</h3>
        <ul>
          <li>
            <strong>10kg 초과 고중량:</strong> A 플루트 또는 이중 벽(BC 복합) 골판지 권장.
            압축 강도가 높아 적재 시 하중을 견딥니다.
          </li>
          <li>
            <strong>5~10kg 중량:</strong> C 플루트가 강도와 비용의 균형점입니다.
          </li>
          <li>
            <strong>5kg 이하 경량:</strong> B 또는 E 플루트. 재료비를 줄이면서도 충분한 강도를
            제공합니다.
          </li>
          <li>
            <strong>소형 정밀 제품:</strong> E 또는 F 플루트. 인쇄 정밀도가 높아 브랜딩
            목적에도 적합합니다.
          </li>
        </ul>

        <h3>유통 환경 기준</h3>
        <ul>
          <li>
            <strong>해외 수출 및 장거리 수송:</strong> A 또는 C 플루트. 충격 흡수와 압축
            강도가 중요합니다.
          </li>
          <li>
            <strong>냉장·냉동 유통:</strong> 수분 흡수로 강도가 저하되므로 방습 코팅 처리된
            골판지를 선택하십시오. 플루트 자체보다 라이너지의 방습 처리가 더 중요합니다.
          </li>
          <li>
            <strong>직접 소비자 배송(D2C):</strong> E 또는 B 플루트 + 고품질 인쇄 조합이
            개봉 경험(언박싱)과 브랜드 이미지를 높입니다.
          </li>
        </ul>
      </section>

      <section>
        <h2>3. 이중 벽·삼중 벽 골판지</h2>
        <p>
          두 개 이상의 플루트 레이어를 겹친 이중 벽(Double Wall)·삼중 벽(Triple Wall) 골판지는
          단일 플루트보다 압축 강도가 현저히 높습니다. 주로 BC 복합(B+C 플루트)이 쓰이며,
          가전제품, 기계 부품, 의료 장비 등 고중량·고가 제품 포장에 적합합니다. 단가가 높고
          무게가 무거우므로, 일반 택배용으로는 과잉 설계에 해당합니다.
        </p>
      </section>

      <section>
        <h2>4. 골판지 박스 발주 시 확인 사항</h2>
        <ol>
          <li>
            <strong>연합시험(ECT/BCT) 수치 요청:</strong> Edge Crush Test(ECT)와 Box
            Compression Test(BCT) 결과를 업체에 요청하면 강도를 수치로 비교할 수 있습니다.
          </li>
          <li>
            <strong>외장 인쇄 방식 확인:</strong> B·E·F 플루트는 인쇄 정밀도가 높아 오프셋
            인쇄에 적합하고, A·C 플루트는 플렉소 인쇄가 일반적입니다.
          </li>
          <li>
            <strong>납기 및 MOQ:</strong> 커스텀 사이즈 박스는 목형(다이컷 금형) 제작 비용이
            별도 발생하며 납기가 길어집니다. 표준 규격 박스는 재고 출고로 납기가 짧습니다.
          </li>
          <li>
            <strong>FSC 인증 여부:</strong> 친환경 마케팅이나 수출 바이어 요구 시 FSC 인증
            원지를 사용하는 업체를 선택하십시오.
          </li>
        </ol>
      </section>

      <section>
        <h2>5. 골 종류별 특화 업체 찾기</h2>
        <p>
          <a href="/products/box">Packlinx 골판지 박스 업체 디렉토리</a>에서 골 종류별 특화
          업체를 비교해보세요.
        </p>
      </section>

      <footer>
        <p>
          <em>
            이 가이드는 Packlinx 콘텐츠팀이 작성하였습니다. 수록된 수치는 KS 규격 및 시장
            일반 기준이며 업체·원지 등급별로 다를 수 있습니다.
          </em>
        </p>
      </footer>
    </>
  );
}

function CorrugatedBoxSupplierSelectionContent() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "골판지 박스 업체 선택 시 견적 단가 외에 꼭 확인해야 할 항목은 무엇인가요?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "MOQ(최소주문수량), 납기(리드타임), 인쇄 역량(플렉소/옵셋), 물류 접근성, 인증(FSC·ISO 등), 샘플 대응 총 6가지입니다. 박스 단가가 개당 50원 낮아도 납기 지연 하루면 그 이상의 기회비용이 발생합니다.",
        },
      },
      {
        "@type": "Question",
        name: "골판지 박스 납기(리드타임)는 보통 얼마나 걸리나요?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "표준 무인쇄·1도 인쇄 박스는 5~7영업일, 다색 인쇄나 특수 합지 구조는 10~15영업일이 일반적입니다. 설·추석·연말 성수기에는 2~3일이 추가되며, 납기 기산점이 발주 확정일인지 입금 확인일인지 반드시 확인해야 합니다.",
        },
      },
      {
        "@type": "Question",
        name: "플렉소 인쇄와 옵셋 합지의 차이는 무엇인가요?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "플렉소 인쇄는 골판지 원단에 직접 인쇄하는 방식으로 1~3도 단색에 적합하고 단가가 낮습니다. 옵셋 합지는 별도 인쇄지를 골판지에 부착하는 방식으로 풀컬러·고해상도 표현이 가능하지만 단가가 높고 납기가 깁니다.",
        },
      },
      {
        "@type": "Question",
        name: "골판지 박스 샘플 테스트 시 어떤 항목을 확인해야 하나요?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "압축 강도(5단 적재 24시간), 인쇄 정렬(로고 위치 2mm 오차 기준), 접착 상태(바닥 접합부 박리 여부), 습기 테스트(냉장·냉동 제품 시 필수) 4가지를 점검하세요. 샘플이 수작업 제작인 경우 양산 품질 보장 여부를 문서로 확인하세요.",
        },
      },
      {
        "@type": "Question",
        name: "소량 발주 시 골판지 박스 업체 유형은 어떻게 선택해야 하나요?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "월 300~1,000박스 수준은 중소 제조사가 적합합니다. 대형 제조사는 보통 MOQ 1,000~3,000박스부터 수주합니다. 월간 소요량과 창고 보관 여력을 먼저 계산한 후 유형을 결정하세요.",
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <p>
        골판지 박스 업체를 선정할 때 단가만 비교하면 납기 지연, 품질 불일치, MOQ 초과로
        예상치 못한 비용이 발생합니다. 이 가이드에서는 업체 선정 전 반드시 확인해야 할 6가지
        항목과 업체 유형별 특성을 정리합니다.
      </p>

      <section>
        <h2>1. 핵심 확인 항목 6가지</h2>
        <ol>
          <li>
            <strong>MOQ(최소주문수량):</strong> 대형 제조사는 1,000~3,000박스부터 수주하는
            경우가 많습니다. 월간 소요량을 먼저 파악하고 MOQ 조건을 맞출 수 있는 업체를
            선택하십시오.
          </li>
          <li>
            <strong>납기(리드타임):</strong> 표준 무인쇄·1도 인쇄 박스는 5~7영업일,
            다색 인쇄나 특수 합지 구조는 10~15영업일이 일반적입니다. 성수기(설·추석·연말)에는
            2~3일이 추가됩니다. 납기 기산점(발주 확정일 vs 입금 확인일)을 반드시 확인하십시오.
          </li>
          <li>
            <strong>인쇄 역량(플렉소 vs 옵셋 합지):</strong> 플렉소는 원단 직접 인쇄 방식으로
            1~3도 단색에 적합하고 단가가 낮습니다. 옵셋 합지는 풀컬러·고해상도 표현이
            가능하지만 단가가 높고 납기가 깁니다.
          </li>
          <li>
            <strong>물류 접근성:</strong> 업체 소재지와 입고 창고 간 거리는 긴급 재발주 대응
            속도에 영향을 줍니다. 수도권 업체는 당일·익일 대응이 가능한 경우가 많습니다.
          </li>
          <li>
            <strong>인증(FSC·ISO 등):</strong> 친환경 마케팅이나 수출 바이어 대응 시 FSC
            인증 원지 사용 업체가 필요합니다. ISO 9001 인증은 품질관리 시스템을 보증합니다.
          </li>
          <li>
            <strong>샘플 대응:</strong> 샘플 제작이 수작업인 경우 양산 품질과 다를 수 있으므로
            양산 품질 보장 여부를 문서로 확인하십시오.
          </li>
        </ol>
      </section>

      <section>
        <h2>2. 업체 유형별 비교 기준</h2>
        <table>
          <thead>
            <tr>
              <th>업체 유형</th>
              <th>MOQ</th>
              <th>단가</th>
              <th>납기</th>
              <th>인쇄 역량</th>
              <th>적합 발주 규모</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>대형 제조사</td>
              <td>1,000~3,000박스</td>
              <td>낮음</td>
              <td>7~15영업일</td>
              <td>플렉소·옵셋 모두 가능</td>
              <td>월 1,000박스 이상</td>
            </tr>
            <tr>
              <td>중소 제조사</td>
              <td>200~500박스</td>
              <td>중간</td>
              <td>5~10영업일</td>
              <td>플렉소 중심</td>
              <td>월 300~1,000박스</td>
            </tr>
            <tr>
              <td>대리점·유통사</td>
              <td>100박스 이하 가능</td>
              <td>높음</td>
              <td>3~7영업일</td>
              <td>표준 규격 재고 위주</td>
              <td>월 100박스 이하 소량</td>
            </tr>
          </tbody>
        </table>

        <p>
          업체 유형별 특성 비교가 완료됐다면{" "}
          <a href="/products/box">Packlinx 골판지 박스 업체 목록</a>에서
          MOQ·지역·인증 조건으로 필터링하여 빠르게 견적을 비교해 보세요.
        </p>
      </section>

      <section>
        <h2>3. 샘플 테스트 체크리스트</h2>
        <p>본 발주 전 반드시 샘플을 수령하여 아래 4가지를 점검하십시오.</p>
        <ul>
          <li>
            <strong>압축 강도:</strong> 5단 적재 24시간 후 변형 여부 확인
          </li>
          <li>
            <strong>인쇄 정렬:</strong> 로고·바코드 위치 2mm 오차 기준 이내 여부
          </li>
          <li>
            <strong>접착 상태:</strong> 바닥 접합부 박리 및 풀림 여부
          </li>
          <li>
            <strong>습기 테스트:</strong> 냉장·냉동 제품 포장인 경우 필수 확인
          </li>
        </ul>
      </section>

      <section>
        <h2>4. 자주 묻는 질문</h2>

        <h3>골판지 박스 업체 선택 시 견적 단가 외에 꼭 확인해야 할 항목은 무엇인가요?</h3>
        <p>
          MOQ(최소주문수량), 납기(리드타임), 인쇄 역량(플렉소/옵셋), 물류 접근성, 인증(FSC·ISO
          등), 샘플 대응 총 6가지입니다. 박스 단가가 개당 50원 낮아도 납기 지연 하루면 그 이상의
          기회비용이 발생합니다.
        </p>

        <h3>골판지 박스 납기(리드타임)는 보통 얼마나 걸리나요?</h3>
        <p>
          표준 무인쇄·1도 인쇄 박스는 5~7영업일, 다색 인쇄나 특수 합지 구조는 10~15영업일이
          일반적입니다. 설·추석·연말 성수기에는 2~3일이 추가되며, 납기 기산점이 발주 확정일인지
          입금 확인일인지 반드시 확인해야 합니다.
        </p>

        <h3>플렉소 인쇄와 옵셋 합지의 차이는 무엇인가요?</h3>
        <p>
          플렉소 인쇄는 골판지 원단에 직접 인쇄하는 방식으로 1~3도 단색에 적합하고 단가가
          낮습니다. 옵셋 합지는 별도 인쇄지를 골판지에 부착하는 방식으로 풀컬러·고해상도 표현이
          가능하지만 단가가 높고 납기가 깁니다.
        </p>

        <h3>소량 발주 시 골판지 박스 업체 유형은 어떻게 선택해야 하나요?</h3>
        <p>
          월 300~1,000박스 수준은 중소 제조사가 적합합니다. 대형 제조사는 보통 MOQ
          1,000~3,000박스부터 수주합니다. 월간 소요량과 창고 보관 여력을 먼저 계산한 후 유형을
          결정하세요.
        </p>
      </section>

      <section>
        <h2>5. Packlinx에서 업체 비교하기</h2>
        <p>
          MOQ·지역·인증 조건으로 맞는 업체를 빠르게 찾아보세요.{" "}
          <a href="/products/box">골판지 박스 업체 목록 보기</a>
        </p>
        <p>
          관련 업체 찾기:{" "}
          <a href="https://keywords.packlinx.com/keywords/골판지박스-제작">골판지박스 제작 업체 →</a>
          {" "}·{" "}
          <a href="https://keywords.packlinx.com/keywords/택배박스-제작">택배박스 제작 업체 →</a>
        </p>
      </section>

      <footer>
        <p>
          <em>
            이 가이드는 Packlinx 콘텐츠팀이 작성하였습니다. 수록된 내용은 일반적인 시장 기준이며
            개별 제품·업체 상황에 따라 다를 수 있습니다.
          </em>
        </p>
      </footer>
    </>
  );
}

function EcoFriendlyPackagingContent() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "친환경 포장재에서 FSC 인증이란 무엇인가요?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "FSC(Forest Stewardship Council)는 지속가능하게 관리된 산림에서 조달한 원자재임을 인증하는 국제 인증입니다. FSC CoC 인증을 보유한 업체의 종이·골판지·목재 기반 포장재를 사용하면 ESG 보고서 「지속가능한 원료 조달」 항목에 기재할 수 있습니다.",
        },
      },
      {
        "@type": "Question",
        name: "생분해 필름과 일반 플라스틱 필름의 단가 차이는 얼마인가요?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "생분해 필름(PLA/PBAT)은 일반 플라스틱 필름 대비 50~100% 높습니다. 산업 퇴비화 시설(58°C 이상, 12주 조건) 없이는 실제 환경에서 분해되지 않으므로 수거 체계 확보가 필요합니다.",
        },
      },
      {
        "@type": "Question",
        name: "친환경 포장재 전환의 가장 현실적인 첫 단계는 무엇인가요?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "FSC 인증 종이로 골판지 박스 원지를 교체하는 것이 진입 장벽이 가장 낮습니다. 일반 골판지 대비 단가 차이가 5~15%에 불과하고, 강도·가공성은 동일합니다. ESG 보고서 「지속가능한 원료 조달」 항목에도 바로 기재 가능합니다.",
        },
      },
      {
        "@type": "Question",
        name: "재생 PET(rPET) 사용 시 받을 수 있는 ESG 인증은 무엇인가요?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "GRS(Global Recycled Standard) 인증 취득이 가능합니다. GRS는 재생 원료 사용 비율을 검증하며, ESG 보고서 「재활용 원료 사용」 항목에 활용할 수 있습니다.",
        },
      },
      {
        "@type": "Question",
        name: "수성 잉크 인쇄는 재활용에 어떤 영향을 미치나요?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "수성 잉크는 유성 잉크 대비 재활용 과정에서 제거가 용이하여 재활용 등급에 부정적 영향을 주지 않습니다. 단가는 일반 유성 잉크 대비 10~20% 추가됩니다.",
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <p>
        친환경 포장재 전환은 ESG 경영 요구가 높아지면서 선택이 아닌 필수가 되고 있습니다.
        그러나 인증 종류가 많고 소재별 분해 조건이 달라 오해가 생기기 쉽습니다. 이 가이드에서는
        FSC, 생분해, 재생 소재의 실제 기준과 전환 비용을 정리합니다.
      </p>

      <section>
        <h2>1. 친환경 포장재 인증 체계</h2>
        <table>
          <thead>
            <tr>
              <th>인증</th>
              <th>대상 소재</th>
              <th>인증 기준</th>
              <th>ESG 보고 활용</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>FSC CoC</td>
              <td>종이·골판지·목재</td>
              <td>지속가능한 산림에서 조달된 원자재</td>
              <td>지속가능한 원료 조달</td>
            </tr>
            <tr>
              <td>GRS</td>
              <td>재생 PET·재생 플라스틱</td>
              <td>재생 원료 비율 검증</td>
              <td>재활용 원료 사용</td>
            </tr>
            <tr>
              <td>OK Compost / DIN CERTCO</td>
              <td>생분해 필름(PLA·PBAT)</td>
              <td>산업 퇴비화 조건(58°C, 12주) 분해</td>
              <td>생분해 소재 사용</td>
            </tr>
            <tr>
              <td>수성 잉크 인증</td>
              <td>인쇄 포장재</td>
              <td>VOC 저함량, 재활용 등급 무영향</td>
              <td>유해물질 저감</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section>
        <h2>2. 소재별 전환 비용 비교</h2>
        <ul>
          <li>
            <strong>FSC 인증 골판지 박스:</strong> 일반 대비 단가 5~15% 추가. 강도·가공성
            동일. 진입 장벽이 가장 낮아 친환경 전환 1순위로 권장됩니다.
          </li>
          <li>
            <strong>재생 PET(rPET) 트레이:</strong> 일반 PET 대비 20~40% 추가. GRS 인증
            취득 가능. 투명도·물성은 버진 PET와 거의 동일합니다.
          </li>
          <li>
            <strong>생분해 필름(PLA/PBAT):</strong> 일반 플라스틱 필름 대비 50~100%
            추가. 산업 퇴비화 시설 없이는 일반 환경에서 분해되지 않으므로 수거 체계 구축이
            선행되어야 합니다.
          </li>
          <li>
            <strong>수성 잉크 인쇄:</strong> 유성 잉크 대비 10~20% 추가. 재활용 등급에
            부정적 영향 없음. 별도 수거 체계 불필요.
          </li>
        </ul>
      </section>

      <section>
        <h2>3. 친환경 포장재 전환 단계별 로드맵</h2>
        <ol>
          <li>
            <strong>1단계 — FSC 골판지 교체:</strong> 비용 증가 최소화. ESG 보고서 즉시
            반영 가능. 대부분의 골판지 박스 업체에서 FSC 원지 옵션 제공.
          </li>
          <li>
            <strong>2단계 — 수성 잉크 전환:</strong> 인쇄 품질 유지하면서 VOC 저감.
            재활용 등급 개선에 기여.
          </li>
          <li>
            <strong>3단계 — rPET 또는 생분해 필름 도입:</strong> 비용 부담 크고 공급망
            제한적. 수거·처리 체계가 갖춰진 B2B 채널에 적합.
          </li>
        </ol>
      </section>

      <section>
        <h2>4. 자주 묻는 질문</h2>

        <h3>FSC 인증이란 무엇인가요?</h3>
        <p>
          FSC(Forest Stewardship Council)는 지속가능하게 관리된 산림에서 조달한 원자재임을
          인증하는 국제 인증입니다. FSC CoC 인증을 보유한 업체의 종이·골판지를 사용하면 ESG
          보고서 「지속가능한 원료 조달」 항목에 기재할 수 있습니다.
        </p>

        <h3>생분해 필름은 일반 환경에서 분해되나요?</h3>
        <p>
          생분해 필름(PLA/PBAT)은 58°C 이상의 산업 퇴비화 시설에서 12주 이상 처리해야 분해됩니다.
          일반 토양이나 바다에서는 일반 플라스틱과 유사하게 잔류합니다. 도입 전 수거·처리
          체계 확보가 필수입니다.
        </p>

        <h3>친환경 전환 비용이 부담스러울 때 가장 현실적인 첫 단계는 무엇인가요?</h3>
        <p>
          FSC 인증 골판지 원지 교체가 진입 장벽이 가장 낮습니다. 일반 골판지 대비 단가 차이가
          5~15%에 불과하고, 강도·가공성은 동일합니다. ESG 보고서에도 즉시 반영할 수 있습니다.
        </p>
      </section>

      <footer>
        <p>
          <em>
            이 가이드는 Packlinx 콘텐츠팀이 작성하였습니다. 수록된 내용은 일반적인 시장 기준이며
            개별 제품·업체 상황에 따라 다를 수 있습니다.
          </em>
        </p>
      </footer>
    </>
  );
}

function SmallQuantityCustomBoxContent() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "소량 맞춤 박스 제작 최소 주문 수량(MOQ)은 얼마인가요?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "디지털 인쇄 방식을 활용하면 100~300개부터 풀컬러 맞춤 인쇄가 가능합니다. 금형판 없이 파일에서 바로 인쇄하므로 초기 판 제작비(15~30만 원)가 발생하지 않습니다.",
        },
      },
      {
        "@type": "Question",
        name: "소량 맞춤 박스 디지털 인쇄 단가는 얼마인가요?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "100개 기준 개당 800~1,500원, 1,000개 기준 400~700원 수준입니다(인쇄 단가 기준, 박스 소재비 별도). 오프셋 인쇄는 1,000개 기준 200~400원으로 낮지만 MOQ 1,000~3,000개와 판 제작비가 전제됩니다.",
        },
      },
      {
        "@type": "Question",
        name: "소량 맞춤 박스 납기는 얼마나 걸리나요?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "디지털 인쇄는 샘플 확인 후 본 발주 기준 3~5영업일, 오프셋 인쇄는 7~15영업일이 일반적입니다. 샘플 제작에 3~5영업일이 추가됩니다.",
        },
      },
      {
        "@type": "Question",
        name: "소량 주문 시 단가를 낮추는 방법은 무엇인가요?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "①표준 규격 박스에 맞춤 인쇄만 적용(금형비 절감, 단가 20~30% 절감), ②1~2도 단색 인쇄 시작, ③여러 디자인 합판 인쇄, ④연간 계약 소량 분할 납품 등 4가지 방법이 있습니다.",
        },
      },
      {
        "@type": "Question",
        name: "소량 맞춤 박스 디자인 파일은 어떤 형식으로 준비해야 하나요?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "AI(Adobe Illustrator) 또는 PDF 형식, CMYK 색상 모드, 300dpi 이상, 도무송(재단선) 라인 포함이 기본 요건입니다. 업체별 세부 사양이 다를 수 있으므로 견적 요청 시 디자인 가이드를 함께 요청하세요.",
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <p>
        소량 맞춤 박스 제작은 스타트업·D2C 브랜드·샘플 발송용 수요가 높습니다. 디지털 인쇄
        기술 발전으로 100개 단위부터 풀컬러 맞춤 인쇄가 가능해졌지만, 방식과 수량에 따라
        단가 차이가 크게 납니다. 이 가이드에서는 소량 박스 제작의 핵심 판단 기준을 정리합니다.
      </p>

      <section>
        <h2>1. 인쇄 방식별 비교</h2>
        <table>
          <thead>
            <tr>
              <th>방식</th>
              <th>MOQ</th>
              <th>단가(1,000개 기준)</th>
              <th>납기</th>
              <th>판 제작비</th>
              <th>적합 용도</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>디지털 인쇄</td>
              <td>100~300개</td>
              <td>400~700원</td>
              <td>3~5영업일</td>
              <td>없음</td>
              <td>소량 다품종, 샘플</td>
            </tr>
            <tr>
              <td>오프셋 인쇄</td>
              <td>1,000~3,000개</td>
              <td>200~400원</td>
              <td>7~15영업일</td>
              <td>15~30만 원</td>
              <td>중량 단색·다색 정기 발주</td>
            </tr>
            <tr>
              <td>플렉소 인쇄</td>
              <td>500~1,000개</td>
              <td>150~300원</td>
              <td>5~10영업일</td>
              <td>10~20만 원</td>
              <td>1~3도 단색 물류 박스</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section>
        <h2>2. 단가를 낮추는 4가지 방법</h2>
        <ol>
          <li>
            <strong>표준 규격 박스에 맞춤 인쇄만 적용:</strong> 금형(다이컷) 비용이
            없으므로 단가를 20~30% 절감할 수 있습니다.
          </li>
          <li>
            <strong>1~2도 단색 인쇄로 시작:</strong> 컬러 수를 줄이면 플렉소로 대체
            가능해 단가가 낮아집니다.
          </li>
          <li>
            <strong>여러 디자인 합판 인쇄:</strong> 동일 소재·규격의 디자인 여러 개를
            한 판에 인쇄하면 판 제작비를 분산할 수 있습니다.
          </li>
          <li>
            <strong>연간 계약 소량 분할 납품:</strong> 연간 수량을 약정하고 월별·분기별로
            분할 납품 받으면 대량 단가를 적용받을 수 있습니다.
          </li>
        </ol>
      </section>

      <section>
        <h2>3. 디자인 파일 준비 요건</h2>
        <ul>
          <li>
            <strong>파일 형식:</strong> AI(Adobe Illustrator) 또는 PDF 권장. PSD는
            업체에 따라 별도 변환 비용이 발생할 수 있습니다.
          </li>
          <li>
            <strong>색상 모드:</strong> CMYK. RGB로 제출 시 인쇄 색상이 달라질 수
            있습니다.
          </li>
          <li>
            <strong>해상도:</strong> 300dpi 이상. 특히 세밀한 로고나 바코드가 포함된
            경우 필수입니다.
          </li>
          <li>
            <strong>도무송(재단선) 라인:</strong> 박스 전개도에 칼선(재단선)을 별도
            레이어로 포함해야 합니다. 업체마다 레이어명 규칙이 다를 수 있으므로 견적 요청 시
            템플릿을 받아 작업하세요.
          </li>
        </ul>
      </section>

      <section>
        <h2>4. 자주 묻는 질문</h2>

        <h3>소량 맞춤 박스 MOQ는 얼마인가요?</h3>
        <p>
          디지털 인쇄 방식을 활용하면 100~300개부터 풀컬러 맞춤 인쇄가 가능합니다. 금형판 없이
          파일에서 바로 인쇄하므로 초기 판 제작비(15~30만 원)가 발생하지 않습니다.
        </p>

        <h3>납기는 얼마나 걸리나요?</h3>
        <p>
          디지털 인쇄는 샘플 확인 후 본 발주 기준 3~5영업일, 오프셋 인쇄는 7~15영업일이
          일반적입니다. 샘플 제작에 3~5영업일이 추가됩니다.
        </p>
      </section>

      <section>
        <h2>5. Packlinx에서 소량 박스 업체 찾기</h2>
        <p>
          MOQ·지역·인쇄 방식으로 필터링하여 소량 맞춤 박스 업체를 빠르게 비교하세요.{" "}
          <a href="/products/box">Packlinx 골판지 박스 업체 디렉토리</a>
        </p>
      </section>

      <footer>
        <p>
          <em>
            이 가이드는 Packlinx 콘텐츠팀이 작성하였습니다. 수록된 내용은 일반적인 시장 기준이며
            개별 제품·업체 상황에 따라 다를 수 있습니다.
          </em>
        </p>
      </footer>
    </>
  );
}

function ShippingBoxPricingContent() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "같은 호수 택배박스인데 업체마다 단가가 다른 이유는 무엇인가요?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "원지 등급(K·A·B등급), 골 종류(E골·B골 등), 유통 구조(제조사 직거래·도매몰·오픈마켓)의 세 가지 차이 때문입니다. 동일 사이즈라도 K등급과 B등급 원지 사이에는 개당 30~80원 차이가 나며, 오픈마켓은 직거래 대비 40~60% 단가가 높을 수 있습니다.",
        },
      },
      {
        "@type": "Question",
        name: "택배박스 호수별 단가는 대략 얼마나 되나요?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "2026년 기준 B골·B등급·무인쇄 기준: 3호 박스(340×250×210mm) 1,000개 발주 시 330~420원, 5,000개 발주 시 250~330원 수준입니다. 5호(480×380×340mm)는 1,000개 기준 560~720원, 1호(220×190×90mm)는 220~280원 수준입니다.",
        },
      },
      {
        "@type": "Question",
        name: "단가를 낮추기 위한 최적 발주 수량 구간은 어디인가요?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "500개에서 1,000개 구간이 단가 하락폭이 가장 큰 구간으로 100~500개 대비 추가 10~15% 단가가 하락합니다. 월 출고 200~300건인 셀러라면 2~3개월 치를 한 번에 발주해 이 구간에 진입하는 것이 유리하나, 창고 보관 비용도 함께 고려해야 합니다.",
        },
      },
      {
        "@type": "Question",
        name: "제조사 직거래와 도매몰, 어느 채널이 유리한가요?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "월 출고 1,000건 이상이라면 제조사 직거래가 가장 경제적이며 연간 계약으로 추가 단가 인하도 가능합니다. 월 200~1,000건 구간은 도매몰에서 500~1,000개 단위로 발주하되 3개 업체 이상 견적 비교가 권장됩니다.",
        },
      },
      {
        "@type": "Question",
        name: "택배박스 발주 시 단가 외에 추가로 발생할 수 있는 비용은 무엇인가요?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "맞춤 규격 첫 발주 시 금형비(목형비) 15~30만 원, 1도 인쇄 시 개당 20~50원·풀컬러 합지 시 개당 100~200원의 인쇄비, 도매몰 이용 시 건당 3~5만 원의 운송비가 별도 발생합니다. 대량 발주로 단가를 낮추더라도 창고 보관비가 추가될 수 있으므로 월 출고량 대비 적정 발주량 계산이 필요합니다.",
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <p>
        택배 박스 단가는 사이즈, 수량, 인쇄 여부, 원지 등급에 따라 크게 달라집니다.
        이 가이드에서는 주요 사이즈별 단가 기준과 가격 결정 요인을 정리합니다.
      </p>

      <section>
        <h2>1. 택배 박스 표준 사이즈별 단가 기준</h2>
        <table>
          <thead>
            <tr>
              <th>사이즈</th>
              <th>외경 기준(mm)</th>
              <th>1,000개 단가</th>
              <th>5,000개 단가</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1호</td>
              <td>350×250×95</td>
              <td>130~180원</td>
              <td>90~130원</td>
            </tr>
            <tr>
              <td>2호</td>
              <td>410×310×150</td>
              <td>160~220원</td>
              <td>110~160원</td>
            </tr>
            <tr>
              <td>3호</td>
              <td>450×340×200</td>
              <td>200~270원</td>
              <td>140~200원</td>
            </tr>
            <tr>
              <td>4호</td>
              <td>490×380×280</td>
              <td>260~350원</td>
              <td>180~260원</td>
            </tr>
          </tbody>
        </table>
        <p>
          <small>위 단가는 무인쇄·C 플루트·중량지 기준이며 업체·원지 등급별로 달라질 수 있습니다.</small>
        </p>
      </section>

      <section>
        <h2>2. 단가 결정 요인</h2>
        <ul>
          <li><strong>수량:</strong> 5,000개 이상 발주 시 단가가 30~40% 하락합니다.</li>
          <li><strong>인쇄:</strong> 1도 인쇄 추가 시 개당 20~50원, 풀컬러 옵셋 합지는 개당 100~200원 추가됩니다.</li>
          <li><strong>원지 등급:</strong> 재생지(중량지) 대비 크라프트지는 15~25% 단가가 높습니다.</li>
          <li><strong>플루트:</strong> C 플루트가 범용. B 플루트는 5~10% 낮고, BC 이중 벽은 40~60% 높습니다.</li>
        </ul>
      </section>

      <section>
        <h2>3. Packlinx에서 업체 비교하기</h2>
        <p>
          <a href="/products/box">Packlinx 골판지 박스 업체 디렉토리</a>에서
          사이즈·수량·지역으로 필터링하여 견적을 비교하세요.
        </p>
        <p>
          관련 업체 찾기:{" "}
          <a href="https://keywords.packlinx.com/keywords/박스-견적">박스 견적 업체 →</a>
          {" "}·{" "}
          <a href="https://keywords.packlinx.com/keywords/우체국택배박스-가격">우체국택배박스 가격 비교 →</a>
        </p>
      </section>

      <footer>
        <p>
          <em>
            이 가이드는 Packlinx 콘텐츠팀이 작성하였습니다. 수록된 내용은 일반적인 시장 기준이며
            개별 제품·업체 상황에 따라 다를 수 있습니다.
          </em>
        </p>
      </footer>
    </>
  );
}

function MovingBoxBulkPurchaseContent() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "이사박스 대량 구매 시 골판지와 단프라 중 무엇을 선택해야 하나요?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "1회성 이사에는 골판지(800~2,500원/개)가 적합하고, 반복 물류·창고 운영에는 단프라(3,000~8,000원/개)가 장기적으로 유리합니다. 단프라는 50~200회 이상 재사용 가능해 월 500개 이상 사용 시 총 비용이 절감됩니다.",
        },
      },
      {
        "@type": "Question",
        name: "이사박스 제조사 직거래 vs 도매상, 어떤 채널이 유리한가요?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "월 500개 이상 구매 시 제조사 직거래로 10~30% 절감이 가능합니다. 소량 구매나 다양한 사이즈 혼합 발주라면 재고를 보유한 도매상이 납기와 유연성 면에서 유리합니다.",
        },
      },
      {
        "@type": "Question",
        name: "이사박스 대량 발주 시 납기는 얼마나 걸리나요?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "일반 재고 물량은 1~3 영업일, 별도 제작(커스텀 사이즈·인쇄 포함)은 5~10 영업일이 일반적입니다. 이사 성수기(3~5월, 9~11월)에는 납기가 2주 이상 지연될 수 있으므로 최소 2주 전 선발주를 권장합니다.",
        },
      },
      {
        "@type": "Question",
        name: "이사박스 골판지 등급(BF·CF·SSF)별 차이는 무엇인가요?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "BF(Basic Flute)는 일반 이사용 기본 등급으로 단가가 낮습니다. CF(Corrugated Fine)는 중량물 적재에 적합하며 내구성이 높습니다. SSF(Super Strong Flute)는 20kg 이상 중량물이나 장거리 운송에 사용하는 최상위 등급입니다. 용도에 맞는 등급 선택으로 파손율을 크게 줄일 수 있습니다.",
        },
      },
      {
        "@type": "Question",
        name: "이사박스 대량 구매 시 로고·인쇄 옵션은 어떻게 되나요?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "일반적으로 1,000개 이상 발주 시 1~2도 플렉소 인쇄가 가능하며, 단가 추가는 개당 100~300원 수준입니다. 인쇄 없이 단색(크라프트·흰색)만으로도 발주 가능하며, 소량은 스티커 라벨로 대체하는 경우가 많습니다.",
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <p>
        이사 규모와 보유 가구·짐에 따라 필요한 박스 수량이 달라집니다. 대량구매 시 단가를
        낮추는 협상 포인트와 업체 선정 기준을 정리합니다.
      </p>

      <section>
        <h2>1. 이사 규모별 박스 수량 기준</h2>
        <table>
          <thead>
            <tr>
              <th>이사 규모</th>
              <th>권장 박스 수량</th>
              <th>주요 사이즈</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>원룸·1인 가구</td>
              <td>15~25개</td>
              <td>2호·3호 중심</td>
            </tr>
            <tr>
              <td>2~3인 가구(방 2개)</td>
              <td>30~50개</td>
              <td>2호·3호·4호 혼합</td>
            </tr>
            <tr>
              <td>4인 이상 가구(방 3개+)</td>
              <td>60~100개</td>
              <td>2호·3호·4호·5호 혼합</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section>
        <h2>2. 대량구매 단가 협상 포인트</h2>
        <ul>
          <li><strong>50개 이상:</strong> 낱개 대비 20~30% 할인 가능.</li>
          <li><strong>100개 이상:</strong> 택배 포함 일괄 납품 협상 가능.</li>
          <li><strong>표준 규격 선택:</strong> 커스텀 사이즈 대비 재고 출고로 납기 단축.</li>
          <li><strong>반납 조건 확인:</strong> 미개봉 박스 반품 또는 중고 박스 재매입 서비스 여부 확인.</li>
        </ul>
      </section>

      <section>
        <h2>3. Packlinx에서 업체 비교하기</h2>
        <p>
          <a href="/products/box">Packlinx 골판지 박스 업체 디렉토리</a>에서
          수량·지역 조건으로 필터링하세요.
        </p>
      </section>

      <footer>
        <p>
          <em>
            이 가이드는 Packlinx 콘텐츠팀이 작성하였습니다. 수록된 내용은 일반적인 시장 기준이며
            개별 제품·업체 상황에 따라 다를 수 있습니다.
          </em>
        </p>
      </footer>
    </>
  );
}

function MovingBoxSizeGuideContent() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "이사박스 1호~7호 사이즈 규격과 용량은 어떻게 되나요?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "1호(약 10~12L, 10kg 이하), 2호(약 25~30L, 15kg), 3호(약 55~60L, 20kg), 4호(약 75~80L, 20~25kg), 5호(약 110~120L, 25kg), 6호(약 150~160L, 25~30kg), 7호(약 200~220L, 30kg)입니다. 제조사별 ±10~20mm 차이가 있으므로 발주 전 공급사 규격표를 확인하세요.",
        },
      },
      {
        "@type": "Question",
        name: "일반 가정 이사 시 어떤 이사박스 호수를 가장 많이 사용하나요?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "일반 가정 이사 1건 기준으로 3호(40~50%)와 4호(20~30%)가 주력입니다. 2호는 책·의류 소포장(15~20%), 5~7호는 대형 이불·특수 물품(5~10%)에 활용합니다.",
        },
      },
      {
        "@type": "Question",
        name: "이사박스 적재 하중을 초과하면 어떤 문제가 생기나요?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "적재 하중 초과 시 박스 바닥이 빠지거나 측면이 찌그러져 내용물이 파손될 수 있습니다. 특히 책·주방용품처럼 밀도가 높은 물품은 3호(20kg 한도)에도 쉽게 초과되므로, 박스당 무게를 손으로 들어 확인하고 초과 시 분산 포장하세요.",
        },
      },
      {
        "@type": "Question",
        name: "이사박스 사이즈 커스텀 제작이 가능한가요?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "제조사 직거래 시 500~1,000개 이상 발주하면 원하는 치수로 커스텀 제작이 가능합니다. 금형비 없이 칼선 변경만으로 제작하는 경우가 많아 추가 비용이 크지 않습니다. 납기는 일반 재고품 대비 5~7 영업일 추가됩니다.",
        },
      },
      {
        "@type": "Question",
        name: "이사박스를 적재 효율적으로 쌓으려면 어떻게 해야 하나요?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "같은 호수의 박스끼리 쌓아 무게 분산을 균일하게 하고, 무거운 박스는 하단, 가벼운 박스는 상단에 배치합니다. 5단 이상 적재 시 내부 물품 하중으로 하단 박스가 눌리지 않도록 파레트와 랩핑 작업을 병행하세요.",
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <p>
        이사박스 사이즈를 잘못 선택하면 짐을 제대로 수납하지 못하거나 박스가 찌그러질 수
        있습니다. 수납 물품별 적합 사이즈와 적재 기준을 정리합니다.
      </p>

      <section>
        <h2>1. 이사박스 표준 규격표</h2>
        <table>
          <thead>
            <tr>
              <th>호수</th>
              <th>외경(가로×세로×높이, mm)</th>
              <th>적재 무게 기준</th>
              <th>주요 수납 물품</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1호</td>
              <td>350×250×95</td>
              <td>~5kg</td>
              <td>서류, 소형 물품</td>
            </tr>
            <tr>
              <td>2호</td>
              <td>410×310×150</td>
              <td>~10kg</td>
              <td>책, 소형 주방용품</td>
            </tr>
            <tr>
              <td>3호</td>
              <td>450×340×200</td>
              <td>~15kg</td>
              <td>의류, 중형 생활용품</td>
            </tr>
            <tr>
              <td>4호</td>
              <td>490×380×280</td>
              <td>~20kg</td>
              <td>이불, 대형 의류</td>
            </tr>
            <tr>
              <td>5호</td>
              <td>550×440×440</td>
              <td>~25kg</td>
              <td>침구류, 대형 물품</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section>
        <h2>2. 물품별 권장 사이즈</h2>
        <ul>
          <li><strong>책·서류:</strong> 2호. 무거우므로 가득 채우지 말고 15kg 이하로 제한.</li>
          <li><strong>의류·의복:</strong> 3호~4호. 접어서 넣으면 부피 절감.</li>
          <li><strong>이불·침구:</strong> 4호~5호. 진공 압축 후 2~3호도 가능.</li>
          <li><strong>주방용품·그릇:</strong> 2호~3호. 신문지·에어캡으로 완충 필수.</li>
        </ul>
      </section>

      <section>
        <h2>3. 적재 기준</h2>
        <ul>
          <li>무거운 박스는 하단 배치, 가벼운 박스는 상단 배치.</li>
          <li>박스 1단 적재 시 최대 5단까지. 5단 초과 시 하단 박스 압축 파손 위험.</li>
          <li>냉장고·세탁기 등 대형 가전은 별도 포장재(스티로폼 완충재) 사용 권장.</li>
        </ul>
      </section>

      <section>
        <h2>4. Packlinx에서 업체 비교하기</h2>
        <p>
          <a href="/products/box">Packlinx 골판지 박스 업체 디렉토리</a>에서
          사이즈·수량 조건으로 빠르게 견적을 비교하세요.
        </p>
      </section>

      <footer>
        <p>
          <em>
            이 가이드는 Packlinx 콘텐츠팀이 작성하였습니다. 수록된 내용은 일반적인 시장 기준이며
            개별 제품·업체 상황에 따라 다를 수 있습니다.
          </em>
        </p>
      </footer>
    </>
  );
}

function CosmeticPackagingBoxContent() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "화장품 박스에서 싸바리와 접이식 중 어떤 구조를 선택해야 하나요?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "출고가 3만 원 이상 프리미엄 제품이라면 싸바리(경질 박스)가 고급감으로 가격 정당화에 기여합니다. 1만 원대 이하 제품에는 포장 비용 비중이 높아 접이식이 현실적입니다. 소규모 브랜드는 접이식으로 시작 후 매출 안정 후 싸바리로 업그레이드하는 방식이 권장됩니다.",
        },
      },
      {
        "@type": "Question",
        name: "화장품 박스 MOQ는 구조별로 얼마나 되나요?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "싸바리(경질 박스)는 500~1,000개, 접이식과 슬리브는 1,000~3,000개가 일반적인 최소 발주 수량입니다. 개당 단가는 싸바리 1,500~5,000원, 접이식 300~800원, 슬리브 200~500원 수준입니다(1,000개 기준).",
        },
      },
      {
        "@type": "Question",
        name: "금박·무광 코팅 등 후가공을 추가하면 단가와 납기에 어떤 영향이 있나요?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "무광·유광 코팅은 개당 30~60원 추가에 납기 1~2일이 더 소요됩니다. 금박·은박은 개당 80~200원 추가에 2~3일, 형압(엠보싱)은 50~150원 추가에 2~3일이 필요합니다. 후가공 2종 이상 조합 시 판(금형) 비용이 추가 발생하므로 초도 발주는 코팅 1종 + 후가공 1종으로 제한이 권장됩니다.",
        },
      },
      {
        "@type": "Question",
        name: "화장품 박스 인쇄 시 색상 교정(프루프)은 꼭 필요한가요?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "반드시 필요합니다. 화장품은 브랜드 컬러가 구매 결정에 직결되기 때문에 본 인쇄 전에 디지털 또는 실물 프루프로 색상을 확인해야 합니다. 모니터 색상과 인쇄 색상은 다르며, 색상 오류로 인한 재인쇄 비용은 전량 발주자 부담입니다.",
        },
      },
      {
        "@type": "Question",
        name: "화장품 박스에 법적으로 반드시 표시해야 할 항목이 있나요?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "화장품법에 따라 전성분·제조번호·사용기한 등 법정 표시 사항을 박스에 인쇄해야 하므로, 레이아웃 설계 단계에서 해당 공간을 미리 확보해야 합니다. 포장재 재질 분류 표시(분리배출 마크)도 법적 의무 사항입니다.",
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <p>
        화장품 박스는 브랜드 정체성 표현과 법정 표시 의무를 동시에 충족해야 합니다. 구조·소재·후가공
        선택이 단가와 납기에 직결되므로 발주 전 기준을 명확히 해야 합니다.
      </p>

      <section>
        <h2>1. 박스 구조별 비교</h2>
        <table>
          <thead>
            <tr>
              <th>구조</th>
              <th>특성</th>
              <th>MOQ</th>
              <th>개당 단가(1,000개 기준)</th>
              <th>적합 제품</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>싸바리(경질 박스)</td>
              <td>고급감, 두꺼운 보드지 + 외장지 합지</td>
              <td>500~1,000개</td>
              <td>1,500~5,000원</td>
              <td>출고가 3만 원 이상 프리미엄</td>
            </tr>
            <tr>
              <td>접이식(슬리팅)</td>
              <td>범용, 보드지 단층, 인쇄 적합</td>
              <td>1,000~3,000개</td>
              <td>300~800원</td>
              <td>중저가 화장품, 세트 구성</td>
            </tr>
            <tr>
              <td>슬리브</td>
              <td>얇은 띠 형태, 내용물 케이스 위에 덧씌움</td>
              <td>1,000~3,000개</td>
              <td>200~500원</td>
              <td>단가 절감, 계절 한정판</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section>
        <h2>2. 후가공 종류 및 단가</h2>
        <ul>
          <li>
            <strong>무광·유광 코팅:</strong> 개당 30~60원 추가, 납기 1~2일 추가. 가장 기본적인
            고급감 표현 수단입니다.
          </li>
          <li>
            <strong>금박·은박:</strong> 개당 80~200원 추가, 납기 2~3일 추가. 로고나 포인트
            요소에 부분 적용이 일반적입니다.
          </li>
          <li>
            <strong>형압(엠보싱):</strong> 개당 50~150원 추가, 납기 2~3일 추가. 입체감 있는
            브랜드 표현에 적합합니다.
          </li>
          <li>
            <strong>후가공 2종 이상 조합:</strong> 판(금형) 비용이 추가 발생합니다. 초도
            발주는 코팅 1종 + 후가공 1종으로 제한을 권장합니다.
          </li>
        </ul>
      </section>

      <section>
        <h2>3. 법정 표시 의무 사항</h2>
        <p>
          화장품법에 따라 다음 항목을 반드시 박스에 인쇄해야 합니다. 레이아웃 설계 단계에서
          해당 공간을 미리 확보하십시오.
        </p>
        <ul>
          <li>전성분(전체 성분 표시)</li>
          <li>제조번호(Lot No.)</li>
          <li>사용기한 또는 개봉 후 사용기간</li>
          <li>제조업자·책임판매업자 정보</li>
          <li>포장재 재질 분류 표시(분리배출 마크) — 법적 의무</li>
        </ul>
      </section>

      <section>
        <h2>4. Packlinx에서 화장품 박스 업체 찾기</h2>
        <p>
          <a href="/products/box">Packlinx 박스 업체 디렉토리</a>에서 소재·후가공·MOQ 조건으로
          화장품 포장 전문 업체를 비교하세요.
        </p>
      </section>

      <footer>
        <p>
          <em>
            이 가이드는 Packlinx 콘텐츠팀이 작성하였습니다. 수록된 내용은 일반적인 시장 기준이며
            개별 제품·업체 상황에 따라 다를 수 있습니다.
          </em>
        </p>
      </footer>
    </>
  );
}

function ElectronicsPackagingDesignContent() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "전자제품 택배 배송 중 파손이 발생하는 주요 원인은 무엇인가요?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "택배 분류기·상하차 시 1.0~1.2m 낙하 충격, 트럭 운송 중 지속 진동, 팔레트 적재 시 상단 무게로 인한 압축 — 이 세 가지가 주요 원인입니다. 완충재로 충격을 흡수하고, 박스 강도로 압축을 버티며, 유격 최소화로 진동 피해를 줄여야 파손율을 낮출 수 있습니다.",
        },
      },
      {
        "@type": "Question",
        name: "EPE, EPP, EPS 완충재 중 전자제품에 가장 적합한 소재는 무엇인가요?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "노트북·태블릿(1~3kg)에는 EPE 성형 완충재가 표준입니다. 서버·산업용 장비(20kg 이상)에는 반복 충격에도 복원력이 높은 EPP가 적합합니다. EPS(스티로폼)는 1회 충격 후 변형되어 복원력이 낮고, EPE나 종이 펄프 몰드로 전환하는 기업이 늘고 있습니다.",
        },
      },
      {
        "@type": "Question",
        name: "대형 유통사 납품 시 ISTA 인증이 필요한가요?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "대형 유통사에 전자제품을 납품할 때 ISTA 인증을 요구받는 경우가 증가하고 있습니다. 전자상거래 제품에는 ISTA 3A, 해외 유통 시에는 ISTA 6-AMAZON이 적용됩니다. 한국포장재료연구소, SGS, Intertek 등에서 테스트를 수행하므로 납품처 요구사항을 사전에 확인해야 합니다.",
        },
      },
      {
        "@type": "Question",
        name: "전자제품 포장 박스의 ECT(압축 강도) 기준은 어떻게 선택하나요?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "5kg 이하 5단 적재 시 ECT 5.5kN/m 이상(B골), 10~20kg 4단 적재 시 ECT 8.5kN/m 이상(A골), 20~30kg 3단 적재 시 ECT 10.0kN/m 이상(AB골)이 권장됩니다. 실제 적용 시에는 안전 계수 1.5~2.0배를 적용하는 것이 일반적입니다.",
        },
      },
      {
        "@type": "Question",
        name: "전자제품 완충재 금형 비용은 얼마나 드나요?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "EPE 성형 완충재 금형 비용은 30~80만 원 수준입니다. 월 500세트 이하 소량 발주라면 금형 제작 대신 EPE 시트를 재단·조립하는 방식이 현실적입니다. 스마트폰·소형 기기는 에어캡과 소형 EPE 패드 조합으로 금형 없이 대응하는 경우가 많습니다.",
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <p>
        전자제품 포장 설계의 핵심은 낙하 충격·진동·압축 세 가지 물리적 위험에서 제품을 보호하는
        것입니다. 완충재 소재와 박스 강도를 제품 중량과 유통 환경에 맞게 선택해야 파손율을 낮출 수
        있습니다.
      </p>

      <section>
        <h2>1. 완충재 소재별 비교</h2>
        <table>
          <thead>
            <tr>
              <th>소재</th>
              <th>특성</th>
              <th>복원력</th>
              <th>적합 제품</th>
              <th>금형 필요</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>EPE(발포 폴리에틸렌)</td>
              <td>가볍고 유연, 성형 용이</td>
              <td>중간</td>
              <td>노트북·태블릿(1~3kg)</td>
              <td>성형 시 필요(30~80만 원)</td>
            </tr>
            <tr>
              <td>EPP(발포 폴리프로필렌)</td>
              <td>반복 충격 복원력 우수</td>
              <td>높음</td>
              <td>서버·산업용 장비(20kg+)</td>
              <td>필요(고가)</td>
            </tr>
            <tr>
              <td>EPS(발포 폴리스티렌)</td>
              <td>단가 낮음, 1회 충격 후 변형</td>
              <td>낮음</td>
              <td>가전(레거시 방식)</td>
              <td>필요</td>
            </tr>
            <tr>
              <td>종이 펄프 몰드</td>
              <td>친환경, 재활용 가능</td>
              <td>중간</td>
              <td>소형 전자기기</td>
              <td>필요</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section>
        <h2>2. ECT(압축 강도) 기준 선택</h2>
        <table>
          <thead>
            <tr>
              <th>제품 중량</th>
              <th>적재 단수</th>
              <th>권장 ECT</th>
              <th>권장 플루트</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>5kg 이하</td>
              <td>5단</td>
              <td>5.5kN/m 이상</td>
              <td>B골</td>
            </tr>
            <tr>
              <td>10~20kg</td>
              <td>4단</td>
              <td>8.5kN/m 이상</td>
              <td>A골</td>
            </tr>
            <tr>
              <td>20~30kg</td>
              <td>3단</td>
              <td>10.0kN/m 이상</td>
              <td>AB골</td>
            </tr>
          </tbody>
        </table>
        <p>
          <small>실제 적용 시 안전 계수 1.5~2.0배를 적용하는 것이 일반적입니다.</small>
        </p>
      </section>

      <section>
        <h2>3. ISTA 인증 요건</h2>
        <ul>
          <li>
            <strong>ISTA 3A:</strong> 전자상거래 제품 납품 시 대형 유통사에서 요구하는 기준.
          </li>
          <li>
            <strong>ISTA 6-AMAZON:</strong> 해외(아마존) 유통 시 적용. FBA 입고 조건 확인 필수.
          </li>
          <li>
            <strong>시험 기관:</strong> 한국포장재료연구소, SGS, Intertek 등. 납품처 요구사항을
            사전에 확인하십시오.
          </li>
        </ul>
      </section>

      <section>
        <h2>4. Packlinx에서 전자제품 포장 업체 찾기</h2>
        <p>
          <a href="/products/box">Packlinx 박스 업체 디렉토리</a>에서 완충재 종류·ECT 기준·MOQ로
          필터링하여 전자제품 포장 전문 업체를 비교하세요.
        </p>
      </section>

      <footer>
        <p>
          <em>
            이 가이드는 Packlinx 콘텐츠팀이 작성하였습니다. 수록된 내용은 일반적인 시장 기준이며
            개별 제품·업체 상황에 따라 다를 수 있습니다.
          </em>
        </p>
      </footer>
    </>
  );
}

function PackagingMaterialCompleteGuideContent() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "골판지와 단프라(PP 골판지) 중 어떤 포장재를 선택해야 하나요?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "일회성 택배 배송용이라면 골판지가 단가가 낮고 재활용이 용이하여 적합합니다. 냉장·냉동 물류나 반복 회수가 필요한 환경이라면 방수성과 재사용성이 뛰어난 단프라가 유리합니다. 단프라는 초기 비용이 높지만 수십 회 반복 사용이 가능합니다.",
        },
      },
      {
        "@type": "Question",
        name: "식품 포장에 사용할 소재는 어떤 인증을 확인해야 하나요?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "식품 접촉 소재는 식품안전처 기준 적합 여부를 제조사 성적서로 반드시 확인해야 합니다. 냉장·냉동 물류 환경이라면 내수성이 높은 단프라 또는 방습 코팅 골판지를 검토해야 합니다.",
        },
      },
      {
        "@type": "Question",
        name: "친환경 포장재 도입 시 생분해 소재와 크라프트지 중 무엇이 현실적인가요?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "크라프트지는 인쇄 적합성이 높고 프리미엄 브랜딩 트렌드와 부합하며 현실적인 선택입니다. 생분해 소재(PLA, PBAT 등)는 한국환경산업기술원 환경성적표지 인증 여부를 확인해야 하며, EU PPWR 대응이 필요한 수출 기업이라면 인증 획득이 중요합니다.",
        },
      },
      {
        "@type": "Question",
        name: "포장재 소재별 일반적인 MOQ는 얼마나 되나요?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "국내 제조업체 일반 참고치 기준: 골판지 300~1,000박스, 단프라 100~500개, OPP·PE 필름 1,000~5,000m, 친환경 소재 500~2,000개입니다. 업체별 조건이 다르므로 발주 전 직접 확인이 필요합니다.",
        },
      },
      {
        "@type": "Question",
        name: "포장재 초도 발주 시 납기는 얼마나 예상해야 하나요?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "초도 발주는 샘플 제작 → 생산 → 납품까지 통상 3~6주가 소요됩니다. 불필요한 재발주를 줄이려면 용도·내용물 특성·인쇄 여부·환경 규제 해당 여부를 사전에 정리한 후 2~3개사 이상 견적을 비교하는 것이 권장됩니다.",
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <p>
        포장재 소재 선택은 내용물 보호, 유통 환경, 비용, 환경 규제를 종합적으로 고려해야 합니다.
        소재를 잘못 선택하면 파손, 규제 위반, 과잉 비용이 발생합니다. 이 가이드에서는 주요 소재별
        특성과 용도별 선택 기준을 정리합니다.
      </p>

      <section>
        <h2>1. 주요 포장재 소재 비교</h2>
        <table>
          <thead>
            <tr>
              <th>소재</th>
              <th>특성</th>
              <th>MOQ</th>
              <th>주요 용도</th>
              <th>재사용 여부</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>골판지</td>
              <td>단가 낮음, 재활용 용이</td>
              <td>300~1,000박스</td>
              <td>일회성 택배 배송</td>
              <td>불가(1회용)</td>
            </tr>
            <tr>
              <td>단프라(PP 골판지)</td>
              <td>방수, 내구성 높음</td>
              <td>100~500개</td>
              <td>냉장·냉동, 반복 회수</td>
              <td>가능(수십 회)</td>
            </tr>
            <tr>
              <td>OPP·PE 필름</td>
              <td>투명, 방습, 유연</td>
              <td>1,000~5,000m</td>
              <td>식품 포장, 개별 포장</td>
              <td>불가</td>
            </tr>
            <tr>
              <td>크라프트지</td>
              <td>친환경 브랜딩, 인쇄 적합</td>
              <td>500~2,000개</td>
              <td>프리미엄 포장, D2C</td>
              <td>불가</td>
            </tr>
            <tr>
              <td>생분해 소재(PLA/PBAT)</td>
              <td>산업 퇴비화 조건 필요</td>
              <td>500~2,000개</td>
              <td>친환경 인증 필요 수출</td>
              <td>불가</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section>
        <h2>2. 용도별 소재 선택 기준</h2>
        <ul>
          <li>
            <strong>일회성 택배 배송:</strong> 골판지. 단가 낮고 재활용 인프라 완비.
          </li>
          <li>
            <strong>냉장·냉동 물류:</strong> 단프라 또는 방습 코팅 골판지. 방수성이 핵심.
          </li>
          <li>
            <strong>반복 회수 물류(B2B):</strong> 단프라. 초기 비용 높지만 수십 회 재사용으로
            총비용 절감.
          </li>
          <li>
            <strong>식품 직접 접촉:</strong> 식약처 기준 적합 소재 성적서 필수 확인.
          </li>
          <li>
            <strong>친환경 브랜딩·수출:</strong> 크라프트지(현실적 선택) 또는 생분해 소재(인증
            필요).
          </li>
        </ul>
      </section>

      <section>
        <h2>3. 초도 발주 체크리스트</h2>
        <ol>
          <li>내용물 특성(무게, 파손 민감도, 식품 접촉 여부) 정리</li>
          <li>유통 환경(상온·냉장·냉동, 배송 횟수) 확인</li>
          <li>인쇄 여부 및 환경 규제 해당 여부 파악</li>
          <li>2~3개사 이상 견적 비교 후 발주</li>
          <li>식품 소재의 경우 성적서 수령 확인</li>
        </ol>
      </section>

      <section>
        <h2>4. Packlinx에서 포장재 업체 찾기</h2>
        <p>
          <a href="/products/box">Packlinx 포장재 업체 디렉토리</a>에서 소재·MOQ·지역 조건으로
          필터링하여 견적을 비교하세요.
        </p>
      </section>

      <footer>
        <p>
          <em>
            이 가이드는 Packlinx 콘텐츠팀이 작성하였습니다. 수록된 내용은 일반적인 시장 기준이며
            개별 제품·업체 상황에 따라 다를 수 있습니다.
          </em>
        </p>
      </footer>
    </>
  );
}

function PackagingTapeComparisonContent() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "OPP 아크릴 테이프와 OPP 핫멜트 테이프의 차이는 무엇인가요?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "핫멜트 계열은 초기 점착이 강해 무거운 박스(5kg 이상)에 적합하지만 60°C 이상 고온에서 접착제가 녹을 수 있습니다. 아크릴 계열은 초기 점착이 약하지만 24시간 후 최대 접착력에 도달해 장기 유지력이 우수하고 80°C까지 내열 가능합니다.",
        },
      },
      {
        "@type": "Question",
        name: "냉장·냉동 택배에 적합한 포장 테이프는 무엇인가요?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "냉장·냉동 택배에는 OPP 핫멜트 테이프가 권장됩니다. 핫멜트는 내한성이 -20°C까지 유지되어 저온 환경에서도 접착력이 안정적입니다. OPP 아크릴은 내한성이 -10°C까지만 보장되므로 냉동 환경에서는 접착력이 저하될 수 있습니다.",
        },
      },
      {
        "@type": "Question",
        name: "친환경 포장 브랜드에 맞는 테이프 종류는 무엇인가요?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "크라프트 테이프(고무계)와 종이 테이프(수활성) 두 가지가 친환경 포장에 적합합니다. 크라프트 테이프는 골판지 박스에 대한 접착력이 가장 우수합니다. 종이 테이프(수활성)는 전분 접착제를 사용해 완전 재활용이 가능하며 ESG 대응에 유리합니다.",
        },
      },
      {
        "@type": "Question",
        name: "물류센터 야간 작업에서 테이프 소음을 줄이려면 어떤 테이프를 쓰나요?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "주거지 인접 물류센터나 야간 작업 환경에는 아크릴 무소음 테이프가 적합합니다. 48mm×100m 기준 1,000~1,400원으로 일반 OPP 아크릴 대비 소폭 높지만 소음을 거의 없앨 수 있습니다.",
        },
      },
      {
        "@type": "Question",
        name: "자동 박스 포장기(자동라인)에 호환되는 테이프는 무엇인가요?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "자동 박스 포장기에는 기계용 OPP 핫멜트 테이프가 권장됩니다. 기계 호환성이 높고 고속 부착 안정성이 우수합니다. 접착력·소음·단가의 균형이 가장 좋아 처음 테이프 종류를 결정하기 어렵다면 OPP 핫멜트를 먼저 테스트하는 것이 권장됩니다.",
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <p>
        포장 테이프는 종류에 따라 점착력, 내열성, 내한성, 소음, 친환경성이 크게 다릅니다.
        잘못 선택하면 박스가 열리거나 작업 환경 문제가 발생할 수 있습니다. 용도별 최적 테이프
        종류를 정리합니다.
      </p>

      <section>
        <h2>1. 테이프 종류별 비교</h2>
        <table>
          <thead>
            <tr>
              <th>종류</th>
              <th>접착제</th>
              <th>내열성</th>
              <th>내한성</th>
              <th>48mm×100m 단가</th>
              <th>주요 특징</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>OPP 아크릴</td>
              <td>아크릴</td>
              <td>80°C</td>
              <td>-10°C</td>
              <td>600~900원</td>
              <td>장기 유지력 우수, 범용</td>
            </tr>
            <tr>
              <td>OPP 핫멜트</td>
              <td>핫멜트(고무계)</td>
              <td>60°C</td>
              <td>-20°C</td>
              <td>700~1,000원</td>
              <td>초기 점착 강함, 냉동 적합</td>
            </tr>
            <tr>
              <td>아크릴 무소음</td>
              <td>아크릴</td>
              <td>80°C</td>
              <td>-10°C</td>
              <td>1,000~1,400원</td>
              <td>저소음, 야간 작업 적합</td>
            </tr>
            <tr>
              <td>크라프트 테이프</td>
              <td>고무계</td>
              <td>중간</td>
              <td>중간</td>
              <td>800~1,200원</td>
              <td>골판지 접착력 우수, 친환경</td>
            </tr>
            <tr>
              <td>종이 테이프(수활성)</td>
              <td>전분</td>
              <td>낮음</td>
              <td>낮음</td>
              <td>1,200~2,000원</td>
              <td>완전 재활용 가능, ESG</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section>
        <h2>2. 용도별 테이프 선택 기준</h2>
        <ul>
          <li>
            <strong>일반 택배(상온, 5kg 이하):</strong> OPP 아크릴. 단가·성능 균형 최적.
          </li>
          <li>
            <strong>무거운 박스(5kg 이상):</strong> OPP 핫멜트. 초기 점착이 강해 즉시 고정.
          </li>
          <li>
            <strong>냉장·냉동 배송:</strong> OPP 핫멜트. 내한성 -20°C로 저온 환경에서 안정적.
          </li>
          <li>
            <strong>야간·소음 민감 작업장:</strong> 아크릴 무소음 테이프.
          </li>
          <li>
            <strong>자동 포장 라인:</strong> 기계용 OPP 핫멜트. 고속 부착 호환성 필수 확인.
          </li>
          <li>
            <strong>친환경 브랜딩·ESG:</strong> 크라프트 테이프(골판지 박스) 또는 종이 수활성
            테이프(완전 재활용).
          </li>
        </ul>
      </section>

      <section>
        <h2>3. Packlinx에서 포장재 업체 찾기</h2>
        <p>
          <a href="/products/box">Packlinx 포장재 업체 디렉토리</a>에서 테이프·완충재·박스를
          함께 공급하는 업체를 비교하세요.
        </p>
      </section>

      <footer>
        <p>
          <em>
            이 가이드는 Packlinx 콘텐츠팀이 작성하였습니다. 수록된 내용은 일반적인 시장 기준이며
            개별 제품·업체 상황에 따라 다를 수 있습니다.
          </em>
        </p>
      </footer>
    </>
  );
}

function KoreaPackagingTrends2026Content() {
  return (
    <>
      <p>
        2026년 한국 포장재 시장은 규제 강화, 기술 도입, 유통 구조 변화가 동시에 맞물리며 빠르게
        재편되고 있습니다. 원자재 가격 변동성, EPR(생산자책임재활용제도) 의무 확대, 이커머스 물동량
        증가는 패키징 구매·생산 담당자 모두에게 직접적인 영향을 미칩니다. 이 리포트는 2026년에
        주목해야 할 5가지 핵심 트렌드를 분석하고, 각 트렌드에서 실질적으로 대응할 수 있는 방향을
        정리합니다.
      </p>

      <p>
        패키징 업체를 찾고 있다면{" "}
        <a href="/vendors">Packlinx 업체 디렉토리</a>에서 카테고리별로 검색하세요.
      </p>

      <section>
        <h2>트렌드 1. EPR 강화 — 재생원료 의무 비율과 포장재 감량 규제</h2>
        <p>
          2026년부터 환경부의 EPR(생산자책임재활용제도) 규정이 강화되면서 포장재 제조·수입업자에게
          재생원료 사용 비율 목표가 적용됩니다. 특히 합성수지 포장재는 포장재 대비 감량 기준이
          강화되고, 재활용 어려운 복합재질 포장재는 분리배출 표시 의무 대상이 확대됩니다.
        </p>
        <p>
          이에 따라 공급망 전반에서 단일 소재 전환, PET 단일재질 파우치, FSC 인증 종이 박스 채택이
          증가하는 추세입니다. 화장품·식품 업계를 중심으로 rPET(재생 PET) 용기 도입 사례가 늘고
          있으며, 일부 브랜드는 ESG 보고서에 포장재 재생원료 비율을 공개 지표로 관리하기
          시작했습니다.
        </p>
        <p>
          <strong>실무 대응:</strong> 현재 사용 중인 포장재의 재질 분류(단일재질/복합재질)를 확인하고,
          재생원료 전환 가능 여부를 공급 업체에 문의하는 것을 권장합니다. 관련 내용은{" "}
          <a href="/guides/eco-friendly-packaging">친환경 포장재 완전 가이드</a>에서 상세히
          확인할 수 있습니다.
        </p>
      </section>

      <section>
        <h2>트렌드 2. 스마트 패키징 도입 가속 — QR코드·NFC·디지털 추적</h2>
        <p>
          스마트 패키징은 포장재에 디지털 기술을 결합해 소비자와의 접점을 확장하거나 공급망 내 물류
          추적 효율을 높이는 방식을 말합니다. 2026년 기준 가장 빠르게 확산되는 방식은 QR코드 기반
          콘텐츠 연동으로, 제품 원산지 정보, 성분 상세 페이지, A/S 접수 링크, 리뷰 유도 등 다양한
          용도로 활용됩니다.
        </p>
        <p>
          NFC(근거리 무선통신) 태그를 포장재에 삽입하는 방식은 초도 비용이 상대적으로 높지만,
          위변조 방지와 정품 인증이 필요한 의약품·명품 패키징 분야에서 수요가 증가하고 있습니다.
          이커머스 물류 박스에 QR코드 또는 바코드를 인쇄하는 경우, 디지털 인쇄 방식과의 연계가
          중요해집니다.
        </p>
        <p>
          <strong>실무 대응:</strong> 디지털 인쇄 업체를 선정할 때 가변 데이터(장마다 다른 QR코드)
          인쇄 지원 여부를 사전에 확인하세요. 자세한 인쇄 방식 비교는{" "}
          <a href="/guides/label-printing-guide">라벨 인쇄 업체 선정 가이드</a>를 참고하세요.
        </p>
      </section>

      <section>
        <h2>트렌드 3. 소량·맞춤 발주 수요 증가 — D2C·스타트업 성장과 MOQ 하락</h2>
        <p>
          이커머스 D2C(Direct-to-Consumer) 채널 성장과 함께 소량 맞춤 패키징 수요가 구조적으로
          증가하고 있습니다. 과거에는 최소 주문 수량(MOQ) 1,000개 이상이 일반적이었지만, 디지털
          인쇄 기술의 발전으로 100개 단위, 경우에 따라 10개 단위 발주도 가능한 업체가 늘고 있습니다.
        </p>
        <p>
          이 변화는 신제품 테스트 비용을 대폭 낮추고, 시즌 한정 에디션이나 개인화 패키징 수요를
          충족할 수 있게 합니다. 스타트업과 소규모 브랜드는 대량 재고를 보유하지 않고 수요에 맞춰
          유연하게 발주하는 전략을 택하는 경향이 강해졌습니다.
        </p>
        <p>
          소량 맞춤 박스 발주 시 참고할 수 있는 비용·납기 기준은{" "}
          <a href="/guides/small-quantity-custom-box">소량 맞춤 박스 제작 가이드</a>에서 확인할
          수 있습니다.
        </p>
      </section>

      <section>
        <h2>트렌드 4. 포장재 단가 상승과 공급망 재편 — 원자재·물류비 대응</h2>
        <p>
          글로벌 원자재(펄프, 원유, 알루미늄) 가격 변동성과 해상 물류비 불안정이 지속되면서 국내
          포장재 단가는 2023~2024년에 이어 2026년에도 완만한 상승 압력을 받고 있습니다. 특히
          골판지와 폴리에틸렌(PE) 기반 연포장재는 원가 비중이 높아 단가 변동 민감도가 높습니다.
        </p>
        <p>
          이에 대응해 다수 기업이 ①단일 공급 업체 의존도를 낮추는 복수 업체 체제 구축, ②국내 대체
          소재 탐색, ③연간 계약 고정 단가 협상을 적극 활용하는 추세입니다. Packlinx 디렉토리는
          카테고리별로 복수 업체를 한눈에 비교할 수 있어 공급망 다변화에 활용할 수 있습니다.
        </p>
        <p>
          골판지 박스 업체 선정 기준과 단가 협상 포인트는{" "}
          <a href="/guides/corrugated-box-supplier-selection">
            골판지 박스 업체 선정 가이드
          </a>
          에서 확인하세요.
        </p>
      </section>

      <section>
        <h2>트렌드 5. 이커머스 전용 패키징 설계 증가 — ISTA 기준·배송 파손 최소화</h2>
        <p>
          국내 이커머스 물동량이 지속적으로 증가하면서 배송 환경에 최적화된 패키징 설계 수요가
          높아지고 있습니다. 기존에 오프라인 매장 진열을 전제로 설계된 포장재를 택배 배송에 그대로
          사용할 경우 파손율이 높아지는 사례가 늘면서, 이커머스 전용 패키징 검토가 확산되고 있습니다.
        </p>
        <p>
          전자제품·소형 가전처럼 충격에 민감한 제품은 ISTA(국제 안전 수송 협회) 기준을 참고해
          완충재 두께와 박스 ECT(엣지 압축 강도)를 설정하는 방식이 권장됩니다. 완충재 소재 비교와
          ECT 기준은{" "}
          <a href="/guides/electronics-packaging-design">
            전자제품 포장 설계 가이드
          </a>
          에서 확인할 수 있습니다.
        </p>
        <p>
          이커머스 배송 박스 단가 기준은{" "}
          <a href="/guides/shipping-box-pricing">배송 박스 가격 완전 가이드</a>를 참고하세요.
        </p>
      </section>

      <section>
        <h2>2026 트렌드 요약 — 기업별 우선순위 체크리스트</h2>
        <table>
          <thead>
            <tr>
              <th>트렌드</th>
              <th>영향 대상</th>
              <th>즉시 확인 액션</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>EPR·재생원료 의무화</td>
              <td>제조업·식품·화장품</td>
              <td>현재 포장재 재질 분류 확인, 대체 소재 견적 요청</td>
            </tr>
            <tr>
              <td>스마트 패키징 (QR/NFC)</td>
              <td>식품·의약품·명품 브랜드</td>
              <td>라벨 인쇄 업체에 가변 데이터 지원 여부 문의</td>
            </tr>
            <tr>
              <td>소량·맞춤 발주</td>
              <td>스타트업·D2C 브랜드</td>
              <td>현재 MOQ 조건 재확인, 소량 특화 업체 비교</td>
            </tr>
            <tr>
              <td>원자재·단가 상승</td>
              <td>전 업종</td>
              <td>복수 업체 비교 견적, 연간 계약 조건 협의</td>
            </tr>
            <tr>
              <td>이커머스 전용 설계</td>
              <td>온라인 판매 기업</td>
              <td>배송 파손율 측정, ISTA 기준 박스 설계 검토</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section>
        <h2>Packlinx에서 패키징 업체 찾기</h2>
        <p>
          이 리포트에서 언급한 소재·카테고리별 업체는{" "}
          <a href="/vendors">Packlinx 업체 디렉토리</a>에서 인쇄 방식·소재·지역 조건으로
          필터링해 비교할 수 있습니다. 견적 비교는 무료입니다.
        </p>
      </section>

      <footer>
        <p>
          <em>
            이 리포트는 Packlinx 콘텐츠팀이 작성하였습니다. 수록된 트렌드 분석은 공개된 산업 자료와
            시장 관찰을 기반으로 하며, 특정 기업의 투자·구매 결정을 보증하지 않습니다. 최신 규제
            정보는 환경부 공식 자료를 함께 확인하시기 바랍니다.
          </em>
        </p>
      </footer>
    </>
  );
}

// ─── Phase 2 batch 1 — slot-based v1 template ────────────────────────────────

type SlotCallout = {
  variant: "info" | "warn" | "tip";
  title: string;
  body: string;
};

type SlotData = {
  heroTag: string;
  heroSubtitle?: string;
  heroDateLabel: string;
  heroReadTime: string;
  tldr: Array<{ bold: string; text: string }>;
  callouts: SlotCallout[];
  checklistTitle: string;
  checklist: string[];
  faq: Array<{ question: string; answer: string }>;
  sidebar: {
    ctaHeadline: string;
    ctaSubtext: string;
    ctaButtonLabel: string;
    ctaHref: string;
    relatedGuides: Array<{ href: string; title: string; readTime: string }>;
  };
  endCta: {
    headline: string;
    subtext: string;
    buttonLabel: string;
    href: string;
  };
};

function GuideSlotV1Page({
  slug,
  guide,
  data,
}: {
  slug: string;
  guide: GuideContent;
  data: SlotData;
}) {
  const canonicalUrl = `${siteUrl}/guides/${slug}`;
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.title,
    description: guide.description,
    url: canonicalUrl,
    inLanguage: "ko-KR",
    datePublished: guide.datePublished,
    author: { "@type": "Organization", name: "Packlinx", url: siteUrl },
    image: `${siteUrl}/og-default.png`,
    publisher: { "@type": "Organization", name: "Packlinx", url: siteUrl },
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: data.faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer.replace(/<[^>]+>/g, "") },
    })),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "홈", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "포장 가이드", item: `${siteUrl}/guides` },
      { "@type": "ListItem", position: 3, name: guide.title, item: canonicalUrl },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {/* V1 #3: --g-brand navy → V05 purple across category pill, CTA, sidebar */}
      <div
        className="-mx-5 sm:-mx-8 -mt-10 sm:-mt-14"
        style={
          {
            "--g-brand": "var(--color-brand-500)",
            "--g-brand-2": "var(--color-brand-400)",
            "--g-brand-soft": "var(--color-brand-50)",
          } as React.CSSProperties
        }
      >
        <GuideHero
          tag={data.heroTag}
          title={guide.title}
          subtitle={data.heroSubtitle}
          dateLabel={data.heroDateLabel}
          readTime={data.heroReadTime}
          category="박스·골판지"
          categoryHref="/guides"
          tldr={data.tldr}
        />

        <div
          className="max-w-[1180px] mx-auto"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 280px",
            gap: "48px",
            padding: "40px 24px 80px",
          }}
        >
          <article
            style={{
              fontSize: "17px",
              lineHeight: "1.78",
              color: "var(--g-ink-2)",
              maxWidth: "760px",
            }}
          >
            {data.callouts.map((c, i) => (
              <GuideCallout key={i} variant={c.variant} title={c.title}>
                <p>{c.body}</p>
              </GuideCallout>
            ))}

            <GuideChecklist title={data.checklistTitle} items={data.checklist} />

            <h2
              className="text-[22px] leading-[1.35] tracking-[-0.015em] mt-12 mb-4 text-[var(--g-ink)] font-extrabold"
            >
              자주 묻는 질문
            </h2>

            <GuideFaq items={data.faq} />

            <GuideEndCta
              headline={data.endCta.headline}
              subtext={data.endCta.subtext}
              buttonLabel={data.endCta.buttonLabel}
              href={data.endCta.href}
            />
          </article>

          {/* V1 #3: purple CTA button, hover links */}
          <GuideSidebar
            ctaHeadline={data.sidebar.ctaHeadline}
            ctaSubtext={data.sidebar.ctaSubtext}
            ctaButtonLabel={data.sidebar.ctaButtonLabel}
            ctaHref={data.sidebar.ctaHref}
            relatedGuides={data.sidebar.relatedGuides}
          />
        </div>
      </div>

      {/* V1 #4: mobile sticky bottom CTA — desktop sidebar covers this */}
      <div
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 px-4 pb-4 pt-3"
        style={{ background: "linear-gradient(180deg, transparent 0%, rgba(250,251,252,0.96) 30%, #fafbfc 100%)" }}
      >
        <Link
          href={data.sidebar.ctaHref}
          className="block text-center text-white font-bold py-4 rounded-[12px] no-underline text-[15px] hover:opacity-90 transition-opacity"
          style={{ background: "var(--color-brand-500)" }}
        >
          {data.sidebar.ctaButtonLabel}
        </Link>
      </div>
      <div className="lg:hidden h-20" />
    </>
  );
}

// ─── Slot data — corrugated-flute-types ──────────────────────────────────────

const SLOT_DATA_CORRUGATED_FLUTE: SlotData = {
  heroTag: "박스·골판지 · 골 선택 가이드",
  heroDateLabel: "2026-05 업데이트",
  heroReadTime: "5분 읽기",
  tldr: [
    {
      bold: "A골(4.7mm)",
      text: "— 완충성 우수. 식품·가전 등 충격 민감 제품에 최적. 소재 사용량이 많아 단가는 높습니다.",
    },
    {
      bold: "E골·F골(1.6mm 이하)",
      text: "— 초박형으로 화장품·소매 박스 인쇄 품질이 탁월합니다. 적재 강도는 낮습니다.",
    },
    {
      bold: "골 선택 순서",
      text: "— 제품 무게·충격 민감도 → ECT 적층 강도 → 인쇄 정밀도 순으로 결정합니다.",
    },
  ],
  callouts: [
    {
      variant: "info",
      title: "골 두께 ≠ 강도",
      body: "골 높이가 높을수록 완충성은 올라가지만 압축 강도(ECT)는 C골이 A골보다 높을 수 있습니다. 강도 설계 시 ECT 수치를 반드시 확인하세요.",
    },
    {
      variant: "warn",
      title: "E골 단독 사용 주의",
      body: "E골은 인쇄 품질이 우수하지만 1kg 이상 중량 제품 단독 포장에는 부적합합니다. 이중벽(DW) 구조나 내부 보강재와 병용하세요.",
    },
    {
      variant: "tip",
      title: "골 방향 확인",
      body: "박스 조립 방향과 골 방향이 수직이면 압축 강도가 최대 2배 차이납니다. 발주 전 제조사에 골 방향(MD/CD) 명시 요청을 권장합니다.",
    },
  ],
  checklistTitle: "골 선택 전 확정 항목",
  checklist: [
    "<strong>내용물 무게</strong> — 단위 박스당 최대 적재 중량 확인",
    "<strong>충격 민감도</strong> — 파손 발생 시 비용·클레임 빈도 검토",
    "<strong>인쇄 정밀도</strong> — 로고·바코드 인쇄 해상도 요건 명시",
    "<strong>ECT 강도 기준</strong> — 적재 단수 × 박스 중량으로 최소 ECT 산출",
    "<strong>납기·MOQ</strong> — 골 유형별 제조사 재고 현황 및 최소 발주량 확인",
  ],
  faq: [
    {
      question: "A골·B골·C골 중 택배 배송에 가장 많이 쓰이는 골은?",
      answer:
        "일반 택배 박스에는 주로 C골(3.5mm)이 많이 사용됩니다. A골 대비 소재 효율이 높고, B골 대비 완충성이 우수해 널리 선택되나, 제품 특성과 업체 조건에 따라 최적 골은 달라질 수 있습니다. 업체 선정 기준은 <a href=\"/guides/corrugated-box-supplier-selection\">골판지 업체 선정 가이드</a>를 참고하세요.",
    },
    {
      question: "E골과 F골의 차이는?",
      answer:
        "E골(1.6mm)은 소매 박스·마감재로 주로 쓰이고, F골(0.8mm)은 더 얇아 화장품·식품 소형 박스에 적합합니다. F골은 국내 취급 업체가 제한적이므로 발주 전 납기 확인이 필수입니다.",
    },
    {
      question: "이중벽(Double Wall) 구조는 언제 사용하나요?",
      answer:
        "10kg 이상 중량 제품, 장거리 해상 운송, 또는 팰릿 적재 5단 이상인 경우 이중벽 구조(B+C, B+B)를 검토하세요. 단가는 약 1.5~2배지만 파손율 감소 효과로 총비용을 절감할 수 있습니다.",
    },
    {
      question: "소량 맞춤 박스 제작 시 골 유형 선택은 어떻게 하나요?",
      answer:
        "소량(100~500매) 발주 시 재고형 C골 원지를 사용하는 업체가 납기·단가 면에서 유리합니다. 특수 골(E·F)은 소량 발주 시 원지 재단 손실비가 추가될 수 있습니다. 상세 발주 기준은 <a href=\"/guides/small-quantity-custom-box\">소량 맞춤 박스 가이드</a>를 참고하세요.",
    },
    {
      question: "골판지 박스 발주 시 ECT(엣지압축강도) 수치를 반드시 확인해야 하나요?",
      answer:
        "ECT(Edge Crush Test) 수치는 팰릿 적재 또는 장거리 운송처럼 압축 하중이 반복되는 환경에서 필수 지표입니다. 단순 택배용 박스라면 업체 표준 원지 사양으로 충분하나, 고중량(5kg 이상) 또는 5단 이상 적재 조건이라면 발주 사양서에 최소 ECT 수치를 명시하고 업체 테스트 성적서를 요청하십시오.",
    },
    {
      question: "냉동·냉장 유통에 적합한 골판지 골 종류와 주의사항은?",
      answer:
        "냉장·냉동 환경에서는 골 종류보다 방습 처리(왁스 코팅·PE 라미네이션)가 더 중요합니다. 습기에 장시간 노출되면 C골·A골 모두 압축 강도가 최대 50% 이상 저하됩니다. 냉동 배송용 박스는 방습 라이너지 적용 여부를 업체에 반드시 확인하고, 저온 환경에서의 적재 강도 유지 기간도 사전 테스트하십시오.",
    },
  ],
  sidebar: {
    ctaHeadline: "골판지 박스 업체 비교",
    ctaSubtext: "골 종류·MOQ·인쇄 조건으로 필터링해 업체를 한눈에 비교하세요.",
    ctaButtonLabel: "골 유형별 업체 지금 비교 →",
    ctaHref: "/products/box",
    relatedGuides: [
      { href: "/guides/corrugated-box-supplier-selection", title: "골판지 업체 MOQ·납기·인증 비교", readTime: "7분" },
      { href: "/guides/shipping-box-pricing", title: "택배 박스 수량별 단가 가이드", readTime: "4분" },
      { href: "/guides/small-quantity-custom-box", title: "100~500매 소량 맞춤 박스 발주", readTime: "5분" },
      { href: "/guides/packaging-material-complete-guide", title: "골판지·단프라·친환경 소재 비교", readTime: "6분" },
    ],
  },
  endCta: {
    headline: "골 유형별 업체 지금 비교",
    subtext: "골판지 박스 전문 업체, 골 종류·MOQ·인쇄 조건으로 필터 비교",
    buttonLabel: "업체 비교하기 →",
    href: "/products/box",
  },
};

// ─── Slot data — shipping-box-pricing ────────────────────────────────────────

const SLOT_DATA_SHIPPING_PRICING: SlotData = {
  heroTag: "박스·골판지 · 택배 박스 단가",
  heroDateLabel: "2026-05 업데이트",
  heroReadTime: "4분 읽기",
  tldr: [
    {
      bold: "1호 기준 130~180원",
      text: "— 1,000개 발주 기준 개당 단가(2026년 일반 시장 참고치). 5,000개 이상 대량 발주 시 추가 할인 협상이 가능합니다.",
    },
    {
      bold: "사이즈 클수록 단가 상승폭 비선형",
      text: "— 3호 이상은 소재 면적 증가로 2호 대비 단가가 약 50~70% 높습니다.",
    },
    {
      bold: "500개 미만 발주는 디지털 인쇄 업체 선택",
      text: "— 오프셋 대비 단가는 높지만 MOQ 없이 유연하게 발주합니다.",
    },
  ],
  callouts: [
    {
      variant: "info",
      title: "택배사 사이즈 기준 확인",
      body: "한국 주요 택배사(CJ·한진·롯데 등)의 일반 택배 1호 구간은 통상 가로+세로+높이 합계 80cm 이내, 무게 5kg 이내 수준이나, 택배사·서비스별로 기준이 다릅니다. 발주 전 이용 택배사의 사이즈표를 반드시 확인하세요.",
    },
    {
      variant: "warn",
      title: "단가만 보면 총비용이 달라진다",
      body: "박스 단가 외 인쇄비·형판비·운송비가 별도 청구되는 경우가 많습니다. 총 구매 비용(TCO) 기준으로 비교하지 않으면 실제 비용이 견적의 1.3~1.5배까지 늘어날 수 있습니다.",
    },
    {
      variant: "tip",
      title: "발주 물량 묶음 전략",
      body: "같은 제조사에서 여러 사이즈를 한 번에 발주하면 운송비를 절감하고 단가 협상력이 높아집니다. 월 발주 물량을 합산한 뒤 분기 단위로 묶어 발주하는 것을 권장합니다.",
    },
  ],
  checklistTitle: "택배 박스 발주 전 확정 항목",
  checklist: [
    "<strong>내용물 최대 치수</strong> — 가로·세로·높이 실측 후 박스 내경 기준 +20~30mm 여유 확인",
    "<strong>내용물 무게</strong> — 택배사 사이즈 구간별 무게 제한 초과 여부 확인",
    "<strong>월 평균 발주 물량</strong> — 물량 구간(500·1,000·3,000·5,000개)별 단가 시뮬레이션",
    "<strong>인쇄 요건</strong> — 브랜드 로고·반송 주소 인쇄 여부, 도수(1도/2도/전면) 확정",
    "<strong>납기 일정</strong> — 재고형(2~3일) vs 생산 주문형(5~10 영업일) 방식 선택",
  ],
  faq: [
    {
      question: "택배 박스 1,000개 주문 시 실제 총 비용은 얼마나 드나요?",
      answer:
        "1호 기준 단가 130~180원에서 1도 인쇄비(약 20~30원/개)·형판비(3~10만원 1회)·배송비를 합산하면 총비용은 약 18~28만원 수준입니다. 정확한 견적은 업체별로 다르므로 Packlinx에서 업체 정보를 비교한 뒤, 3곳 이상 업체에 직접 문의하시기 바랍니다.",
    },
    {
      question: "수량이 적을 때 단가를 낮추는 방법은?",
      answer:
        "500개 미만이라면 디지털 인쇄 방식 업체를 선택하면 형판비 없이 발주할 수 있습니다. 상세 소량 발주 옵션은 <a href=\"/guides/small-quantity-custom-box\">소량 맞춤 박스 가이드</a>를 참고하세요.",
    },
    {
      question: "택배 박스 사이즈는 어떻게 결정하나요?",
      answer:
        "내용물 최대 치수에 완충재 두께(EPE 기준 10~20mm)를 더한 내경으로 결정합니다. 사이즈가 택배사 구간을 넘으면 추가 운임이 발생하므로 내경 기준보다 외경 기준 택배사 구간표를 먼저 확인하세요.",
    },
    {
      question: "재고형 박스와 생산 주문형 박스의 차이는?",
      answer:
        "재고형은 표준 사이즈·무지(흰색/크라프트) 납기 2~3일이지만 사이즈 선택지가 제한됩니다. 생산 주문형은 맞춤 사이즈·인쇄가 가능하지만 납기 5~10 영업일, MOQ 500개 이상이 일반적입니다.",
    },
    {
      question: "골판지 원지 등급에 따라 단가 차이가 크게 나나요?",
      answer:
        "단가는 원지 등급 명칭보다 원지 평량(g/㎡)과 골 종류(A·B·C)에 따라 결정됩니다. 골판지 원지 등급 상세 내용은 <a href=\"/guides/corrugated-flute-types\">골판지 플루트 유형 가이드</a>를 참고하세요.",
    },
  ],
  sidebar: {
    ctaHeadline: "택배 박스 업체 비교",
    ctaSubtext: "사이즈·수량·인쇄 조건으로 필터링해 업체를 한눈에 비교하세요.",
    ctaButtonLabel: "업체 바로 비교 →",
    ctaHref: "/products/box",
    relatedGuides: [
      { href: "/guides/corrugated-flute-types", title: "A·B·C·E·F골 특성·용도 선택 가이드", readTime: "5분" },
      { href: "/guides/small-quantity-custom-box", title: "100~500매 소량 맞춤 박스 발주", readTime: "5분" },
      { href: "/guides/corrugated-box-supplier-selection", title: "골판지 업체 MOQ·납기 비교", readTime: "7분" },
      { href: "/guides/packaging-tape-comparison", title: "OPP·크라프트·무소음 테이프 비교", readTime: "4분" },
    ],
  },
  endCta: {
    headline: "택배 박스 업체 정보 비교",
    subtext: "박스 전문 업체, 사이즈·수량·인쇄 조건으로 필터 비교",
    buttonLabel: "업체 비교하기 →",
    href: "/products/box",
  },
};

// ─── Slot data — small-quantity-custom-box ───────────────────────────────────

const SLOT_DATA_SMALL_QUANTITY: SlotData = {
  heroTag: "박스·골판지 · 소량 맞춤 발주",
  heroDateLabel: "2026-05 업데이트",
  heroReadTime: "5분 읽기",
  tldr: [
    {
      bold: "디지털 인쇄 100개부터",
      text: "— 형판비 없이 최소 100개부터 맞춤 인쇄 박스 발주가 가능합니다.",
    },
    {
      bold: "납기 5~7 영업일",
      text: "— 디지털 인쇄 기준. 오프셋 인쇄 대비 2~3배 빠르지만 단가는 약 30~50% 높습니다.",
    },
    {
      bold: "1,000개 넘으면 오프셋 전환 검토",
      text: "— 단가 분기점은 보통 500~1,000개 구간. 수량이 늘수록 오프셋이 원가 효율적입니다.",
    },
  ],
  callouts: [
    {
      variant: "info",
      title: "디지털 vs 오프셋 선택 기준",
      body: "1,000개 미만은 디지털 인쇄, 1,000개 이상은 오프셋이 원가 효율적입니다. 단, 색상 정밀도(Pantone 정합)가 중요한 경우 오프셋이 더 나은 결과를 줍니다.",
    },
    {
      variant: "warn",
      title: "파일 해상도 미준수 시 발주 지연",
      body: "디지털 인쇄는 300dpi 이상 PDF/AI 파일을 요구합니다. 72dpi 웹용 파일로 발주하면 제조사에서 반려되어 납기가 3~5일 추가 지연될 수 있습니다.",
    },
    {
      variant: "tip",
      title: "샘플 선(先) 발주 권장",
      body: "본 발주 전 샘플(1~5개)을 제작해 색상·치수·강도를 실물로 검수하면 불량 반품 리스크를 줄일 수 있습니다. 샘플 비용은 보통 3~10만원이며 본 발주 시 공제해 주는 업체도 있습니다.",
    },
  ],
  checklistTitle: "소량 맞춤 박스 발주 전 확정 항목",
  checklist: [
    "<strong>박스 내경 치수</strong> — 내용물 + 완충재 두께 포함 최종 내경(W×D×H) mm 확정",
    "<strong>발주 수량</strong> — 디지털(100~999개) vs 오프셋(1,000개 이상) 방식 선택 기준 확인",
    "<strong>인쇄 도수·색상</strong> — 1도/2도/풀컬러(4도) 및 Pantone 지정 여부 명시",
    "<strong>디자인 파일 규격</strong> — 300dpi 이상 PDF·AI·EPS, 도무송(die-cut) 선 레이어 분리",
    "<strong>납기 요건</strong> — 판매 일정 역산 후 제조사 생산 리드타임 + 배송 여유일 확보",
  ],
  faq: [
    {
      question: "소량 맞춤 박스 100개 기준 단가는 얼마인가요?",
      answer:
        "박스 사이즈·인쇄 도수에 따라 다르나, 표준 C골 1호 기준 디지털 인쇄 1도는 개당 약 300~500원 수준입니다. 풀컬러(4도) 전면 인쇄는 500~900원까지 올라갈 수 있습니다. 정확한 견적은 Packlinx에서 소량 전문 업체를 찾아 직접 문의하세요.",
    },
    {
      question: "100개 이하로도 발주할 수 있나요?",
      answer:
        "일부 디지털 인쇄 전문 업체는 50개 이하 소량도 수용하지만 개당 단가가 높아집니다. Packlinx 업체 필터에서 '소량 가능' 조건으로 검색하면 해당 업체를 찾을 수 있습니다.",
    },
    {
      question: "디자인 파일이 없어도 발주할 수 있나요?",
      answer:
        "네, 디자인 파일 작성 서비스를 제공하는 업체가 있습니다. 로고 파일과 텍스트 정보만 제공하면 업체가 전개도(die-cut) 레이아웃까지 제작합니다. 비용은 5~15만원 수준이며 2~3 영업일이 추가로 소요됩니다.",
    },
    {
      question: "인쇄 품질이 중요한 브랜드 박스는 어떤 골을 선택해야 하나요?",
      answer:
        "인쇄 정밀도를 높이려면 E골(1.6mm) 또는 F골(0.8mm) 기반 박스를 선택하세요. C골 대비 표면이 균일해 디지털 인쇄 시 색상 재현율이 높습니다. 골 유형 상세 비교는 <a href=\"/guides/corrugated-flute-types\">골판지 플루트 유형 가이드</a>를 참고하세요.",
    },
    {
      question: "친환경 소재로 맞춤 박스를 만들 수 있나요?",
      answer:
        "FSC 인증 원지 또는 재생 골판지로 소량 제작이 가능합니다. 다만 친환경 원지 수급이 제한적이어서 납기가 1~2주 더 소요될 수 있습니다. 친환경 포장재 전환 기준은 <a href=\"/guides/eco-friendly-packaging\">친환경 포장재 가이드</a>를 참고하세요.",
    },
  ],
  sidebar: {
    ctaHeadline: "소량 맞춤 박스 업체 비교",
    ctaSubtext: "MOQ·인쇄 방식·납기 조건으로 필터링해 업체를 한눈에 비교하세요.",
    ctaButtonLabel: "업체 바로 비교 →",
    ctaHref: "/products/box",
    relatedGuides: [
      { href: "/guides/corrugated-flute-types", title: "A·B·E·F골 특성·인쇄 적합성 비교", readTime: "5분" },
      { href: "/guides/shipping-box-pricing", title: "수량별 택배 박스 단가 기준표", readTime: "4분" },
      { href: "/guides/corrugated-box-supplier-selection", title: "소량 전문 업체 선정 기준", readTime: "7분" },
      { href: "/guides/eco-friendly-packaging", title: "FSC 인증 친환경 박스 전환 가이드", readTime: "6분" },
    ],
  },
  endCta: {
    headline: "소량 맞춤 박스 업체 바로 비교",
    subtext: "박스 전문 업체, MOQ·인쇄 방식·납기 조건으로 필터 비교",
    buttonLabel: "업체 비교하기 →",
    href: "/products/box",
  },
};

// ─── Slot data — 이사박스-사이즈-규격 ────────────────────────────────────────

const SLOT_DATA_MOVING_SIZE: SlotData = {
  heroTag: "박스·골판지 · 이사박스 규격",
  heroDateLabel: "2026-05 업데이트",
  heroReadTime: "4분 읽기",
  tldr: [
    {
      bold: "표준 4호수(소·중·대·특대)",
      text: "— 한국 이사업계 통용 규격. 소 310×210×220mm~특대 600×430×400mm(외경 기준, 제조사마다 ±20mm 차이 있음).",
    },
    {
      bold: "1박스 권장 무게 15~20kg 이하",
      text: "— 초과 적재 시 바닥 파손 위험. 무거운 짐(책·그릇)은 소 박스에 분산합니다.",
    },
    {
      bold: "호수별 수납 기준",
      text: "— 소=책·그릇류, 중=의류·잡화, 대=이불·쿠션, 특대=완충재와 함께 가전 보조 포장에 씁니다.",
    },
  ],
  callouts: [
    {
      variant: "info",
      title: "호수 명칭이 같아도 치수가 다를 수 있다",
      body: "이사업체·박스 제조사마다 '소·중·대' 또는 '1호·2호·3호' 명칭이 같아도 외경 치수가 ±20mm 차이가 날 수 있습니다. 발주 전 업체 치수표를 반드시 확인하고 내경 기준으로 수납 테스트를 권장합니다.",
    },
    {
      variant: "warn",
      title: "과적 위험",
      body: "이사박스 1개당 권장 무게는 15~20kg입니다. 초과 적재 시 바닥 파손뿐 아니라 운반 중 낙하 부상 사고 위험이 있습니다. 특히 책·그릇류는 소 박스에 나눠 담으세요.",
    },
    {
      variant: "tip",
      title: "박스 외면 표기",
      body: "이사 전 박스 외면에 방·내용물·무게 표기 스티커를 붙이면 이사 당일 작업 효율이 크게 올라갑니다. 유성 매직 또는 라벨 프린터를 활용하세요.",
    },
  ],
  checklistTitle: "이사박스 사이즈 선택 전 확정 항목",
  checklist: [
    "<strong>짐 품목 분류</strong> — 책/의류/주방/가전/침구 카테고리별 수납 계획 수립",
    "<strong>박스 내경 치수 확인</strong> — 구매 전 업체별 외경·내경 치수표 비교 (제조사마다 상이)",
    "<strong>적재 층수 계획</strong> — 이삿짐차 적재 높이 기준으로 층수별 무게 배분 확인",
    "<strong>수량 추산</strong> — 방 개수 기준 소 5~8개·중 5~8개·대 3~5개가 1인 가구 평균 참고치",
    "<strong>재사용 여부</strong> — 1회용 vs 다회용(이사업체 대여) 비용 비교",
  ],
  faq: [
    {
      question: "이사박스 소·중·대·특대 규격(외경 mm)과 용량(L)은 각각 어떻게 되나요?",
      answer:
        "국내 이사업계 통용 기준으로 소(310×210×220mm, 약 14L)·중(420×300×300mm, 약 38L)·대(480×370×360mm, 약 64L)·특대(600×430×400mm, 약 103L) 수준입니다. 정확한 치수는 제조사마다 ±20mm 차이가 있으므로 발주 전 업체 치수표를 확인하세요.",
    },
    {
      question: "일반 가정 이사 시 어떤 호수를 가장 많이 사용하나요?",
      answer:
        "이삿짐 무게 균형을 위해 중 박스(약 38L)가 가장 많이 쓰입니다. 소 박스는 책·그릇 등 무거운 품목, 대 박스는 이불·쿠션 등 부피 큰 품목에 사용합니다. 3인 가족 기준 소 10개·중 15개·대 8개가 일반적인 참고 수량입니다.",
    },
    {
      question: "이사박스를 대량으로 구매할 때 단가는 얼마나 되나요?",
      answer:
        "대량 구매 단가와 업체 선정 기준은 <a href=\"/guides/이사박스-대량구매-가이드\">이사박스 대량구매 가이드</a>에서 자세히 다룹니다.",
    },
    {
      question: "이사박스 사이즈 커스텀 제작이 가능한가요?",
      answer:
        "가능하지만 최소 발주량(MOQ) 500매 이상이 일반적입니다. 100~500매 소량 맞춤 박스 제작 옵션은 <a href=\"/guides/small-quantity-custom-box\">소량 맞춤 박스 가이드</a>를 참고하세요.",
    },
    {
      question: "이사박스를 효율적으로 적재하는 방법은?",
      answer:
        "무거운 박스를 아래에, 가벼운 박스를 위에 쌓고 박스 크기를 맞춰 빈 공간을 최소화합니다. 이삿짐차 기준 천장까지 수직 쌓기가 가능하도록 같은 높이 박스를 우선 선택하세요.",
    },
  ],
  sidebar: {
    ctaHeadline: "이사박스 업체 비교",
    ctaSubtext: "사이즈·수량·납기 조건으로 필터링해 업체를 한눈에 비교하세요.",
    ctaButtonLabel: "이사박스 업체 지금 비교 →",
    ctaHref: "/products/box",
    relatedGuides: [
      { href: "/guides/이사박스-대량구매-가이드", title: "수량 기준·단가·업체 선정 가이드", readTime: "5분" },
      { href: "/guides/corrugated-box-supplier-selection", title: "골판지 업체 MOQ·납기 비교", readTime: "7분" },
      { href: "/guides/small-quantity-custom-box", title: "소량 맞춤 박스 발주 가이드", readTime: "5분" },
      { href: "/guides/packaging-material-complete-guide", title: "골판지·단프라 소재 비교", readTime: "6분" },
    ],
  },
  endCta: {
    headline: "이사박스 업체 지금 비교",
    subtext: "이사박스 전문 업체, 사이즈·수량·납기 조건으로 필터 비교",
    buttonLabel: "업체 비교하기 →",
    href: "/products/box",
  },
};

// ─── Slot data — 이사박스-대량구매-가이드 ────────────────────────────────────

const SLOT_DATA_MOVING_BULK: SlotData = {
  heroTag: "박스·골판지 · 이사박스 대량구매",
  heroDateLabel: "2026-05 업데이트",
  heroReadTime: "5분 읽기",
  tldr: [
    {
      bold: "500매 이상부터 제조사 직거래 협상 가능",
      text: "— 발주 조건·업체·수량에 따라 단가 절감이 가능한 경우가 있습니다. 절감 폭은 업체마다 다르며 품질 검수와 납기 관리는 직접 수행해야 합니다.",
    },
    {
      bold: "원지 평량(g/㎡)이 실질 강도 결정",
      text: "— 골판지 등급 명칭보다 원지 평량 160~175g/㎡ 이상을 발주 사양서에 직접 명시하세요.",
    },
    {
      bold: "이사 성수기(3·9월) 2~3주 선발주 필수",
      text: "— 생산 주문형은 최소 7~10 영업일 소요. 성수기에는 품귀로 납기가 2~3주 추가될 수 있습니다.",
    },
  ],
  callouts: [
    {
      variant: "info",
      title: "대량 발주 단가 분기점",
      body: "국내 골판지 이사박스 제조사는 500매·1,000매·3,000매·5,000매 단위로 단가 구간이 끊깁니다. 1,000매 이상이면 제조사 직거래, 500매 미만이면 도매상 구매가 유통·납기 면에서 유리한 경우가 많습니다. 절감 폭은 업체·물량 조건에 따라 다릅니다.",
    },
    {
      variant: "warn",
      title: "이사 성수기 품귀 주의",
      body: "3월(학기 이사)·9월(추석 전후 이사) 성수기에는 박스 수급이 빡빡해집니다. 성수기 2~3주 전 선발주를 권장하며, 재고형 박스는 별도 창고 공간을 확보해야 합니다.",
    },
    {
      variant: "tip",
      title: "복수 업체 분산 발주",
      body: "단일 업체 의존도를 낮추기 위해 메인 업체 70%·서브 업체 30% 비율로 분산 발주하면 공급 리스크를 줄일 수 있습니다. 성수기 전 서브 업체를 미리 등록해 두는 것이 좋습니다.",
    },
  ],
  checklistTitle: "이사박스 대량 구매 전 확정 항목",
  checklist: [
    "<strong>연간 소요 수량 예측</strong> — 월 평균 이사 건수 × 건당 박스 수량으로 연간 총량 산출",
    "<strong>박스 규격·등급 사양서</strong> — 외경 치수·원지 평량(g/㎡)·골 종류 명시 후 업체에 전달",
    "<strong>납기 일정 역산</strong> — 성수기(3·9월) 수요 급증 감안한 선발주 스케줄 확정",
    "<strong>보관 공간 확보</strong> — 팰릿 단위 적재 가능 여부, 창고 바닥 면적·높이 기준 확인",
    "<strong>결제 조건 협상</strong> — 현금 선결제·어음·카드 결제 조건별 추가 할인 여부 확인",
  ],
  faq: [
    {
      question: "이사박스 대량 구매 시 골판지 등급별 차이는?",
      answer:
        "국내 골판지는 원지 평량(g/㎡) 기준으로 강도가 결정됩니다. 발주 사양서에 등급 명칭보다 원지 평량(160g·175g/㎡ 등)과 골 종류(A·B·C)를 직접 명시하는 것이 권장됩니다. 골 종류 상세 비교는 <a href=\"/guides/corrugated-flute-types\">골판지 플루트 유형 가이드</a>를 참고하세요.",
    },
    {
      question: "제조사 직거래와 도매상 중 어느 채널이 유리한가요?",
      answer:
        "1,000매 이상 정기 발주는 제조사 직거래가 단가 면에서 유리합니다. 500매 미만 또는 다양한 사이즈를 혼합 발주할 때는 도매상이 재고 유연성 면에서 낫습니다. 업체 비교는 Packlinx에서 한번에 확인하고, 관심 업체에 직접 문의하시기 바랍니다.",
    },
    {
      question: "대량 발주 납기는 얼마나 걸리나요?",
      answer:
        "재고형 표준 박스는 2~3 영업일, 생산 주문형(맞춤 사이즈·인쇄)은 7~10 영업일이 일반적입니다. 성수기(3·9월)에는 1~2주 추가 소요가 될 수 있으니 여유있게 발주하세요.",
    },
    {
      question: "대량 구매 시 로고·인쇄 옵션은 어떻게 되나요?",
      answer:
        "1,000매 이상부터 1~2도 플렉소 인쇄가 가능하며 형판비는 업체별 5~15만원입니다. 소량(100~500매) 디지털 인쇄 옵션은 <a href=\"/guides/small-quantity-custom-box\">소량 맞춤 박스 가이드</a>를 참고하세요.",
    },
    {
      question: "골판지와 단프라 중 이사박스로 어떤 소재가 나은가요?",
      answer:
        "일반 이사용은 골판지가 원가 효율적입니다. 단프라(PP 골판지)는 방습·내구성이 필요한 보관용 박스나 반복 사용 이사박스에 적합하지만 단가가 2~3배 높습니다. 소재 선택 기준 상세 내용은 <a href=\"/guides/packaging-material-complete-guide\">포장재 소재 완전 가이드</a>를 참고하세요.",
    },
  ],
  sidebar: {
    ctaHeadline: "이사박스 대량 발주 업체 비교",
    ctaSubtext: "수량·원지 등급·납기 조건으로 필터링해 업체를 한눈에 비교하세요.",
    ctaButtonLabel: "업체 비교하기 →",
    ctaHref: "/products/box",
    relatedGuides: [
      { href: "/guides/이사박스-사이즈-규격", title: "이사박스 표준 규격표·적재 기준", readTime: "4분" },
      { href: "/guides/corrugated-box-supplier-selection", title: "골판지 업체 MOQ·납기·인증 비교", readTime: "7분" },
      { href: "/guides/small-quantity-custom-box", title: "소량(100~500매) 맞춤 박스 발주", readTime: "5분" },
      { href: "/guides/packaging-material-complete-guide", title: "골판지·단프라·친환경 소재 비교", readTime: "6분" },
    ],
  },
  endCta: {
    headline: "이사박스 대량 발주 업체 비교",
    subtext: "이사박스 전문 업체, 수량·원지 등급·납기 조건으로 필터 비교",
    buttonLabel: "업체 비교하기 →",
    href: "/products/box",
  },
};

// ─── Slot data — eco-friendly-packaging ──────────────────────────────────────

const SLOT_DATA_ECO_FRIENDLY: SlotData = {
  heroTag: "소재·친환경 · 인증·전환 가이드",
  heroDateLabel: "2026-05 업데이트",
  heroReadTime: "6분 읽기",
  tldr: [
    {
      bold: "FSC·GRS 인증 확인이 첫 단계",
      text: "— 공급 업체에 인증서 사본을 요청해 인증 범위를 검증합니다.",
    },
    {
      bold: "전환 비용 20~40% 상승",
      text: "— FSC 인증 원지·재생 PET(rPET)는 일반 소재 대비 단가가 높습니다.",
    },
    {
      bold: "ESG 공시 로드맵 6~18개월",
      text: "— 소재 전환 → 인증 확보 → ESG 보고 순으로 진행합니다.",
    },
  ],
  callouts: [
    {
      variant: "info",
      title: "포장재 친환경 인증 체계",
      body: "FSC는 산림 관리, GRS는 재생 원료 비율, 생분해 인증은 TÜV Austria OK Compost 또는 KS M ISO 17088 기준입니다. 인증 유형마다 적용 범위가 다르므로 소재 선택 전 인증서 적용 범위를 반드시 확인하세요.",
    },
    {
      variant: "warn",
      title: '"생분해" 표시 규제 주의',
      body: '국내 표시광고법 §3에 따라 공인 시험 성적서 없는 "생분해" 표시는 부당 표시에 해당할 수 있습니다. 납품 업체에 EN 13432 또는 KS M ISO 17088 생분해 인증 성적서를 반드시 요청하세요.',
    },
    {
      variant: "tip",
      title: "단계별 전환 전략",
      body: "전 제품을 한 번에 전환하면 MOQ·납기 부담이 커집니다. 물량이 많은 외포장 1종부터 파일럿 전환 후 인증서 확보와 ESG 문서화를 병행하는 단계별 접근을 권장합니다.",
    },
  ],
  checklistTitle: "친환경 포장재 전환 전 확정 항목",
  checklist: [
    "<strong>인증서 수집</strong> — 공급 업체 FSC·GRS·생분해 인증서 사본 및 범위 확인",
    "<strong>소재별 TCO 산출</strong> — 일반 소재 대비 전환 소재 총비용(단가·MOQ·납기) 비교",
    "<strong>수급 리드타임 확인</strong> — 친환경 소재 조달 추가 리드타임(최대 2~4주) 파악",
    "<strong>ESG 보고 데이터 항목 정의</strong> — GRI 301 또는 TCFD 기준 필요 데이터 목록 작성",
    "<strong>파일럿 발주 검수</strong> — 샘플 수령 후 강도·인쇄 품질·인증 실물 확인",
  ],
  faq: [
    {
      question: "친환경 포장재로 전환하면 비용이 얼마나 오르나요?",
      answer:
        "FSC 인증 원지 골판지 박스는 일반 박스 대비 약 15~25%, GRS 인증 재생 PET(rPET)는 버진 PET 대비 약 10~20%, PLA 생분해 필름은 일반 PE 필름 대비 30~50% 단가가 높습니다. 소재·MOQ·공급 업체에 따라 폭이 크므로 Packlinx에서 업체 정보를 비교한 뒤, 복수 업체에 직접 문의하시기 바랍니다.",
    },
    {
      question: "FSC 인증과 GRS 인증의 차이는 무엇인가요?",
      answer:
        'FSC(Forest Stewardship Council)는 산림의 지속가능한 관리를 인증하며 원지·종이 기반 소재에 주로 적용됩니다. GRS(Global Recycled Standard)는 재생 원료 함량과 공급망 투명성을 인증하며 재생 PET·PP·골판지 등에 적용됩니다. 인증 업체 선정 기준은 <a href="/guides/corrugated-box-supplier-selection">골판지 업체 선정 가이드</a>를 참고하세요.',
    },
    {
      question: "PLA 생분해 포장재, 국내에서 실제로 처리되나요?",
      answer:
        "PLA는 산업적 퇴비화 조건(60°C 이상)에서 생분해되며, 일반 매립이나 가정 퇴비화에서는 분해가 매우 느립니다. 국내 산업 퇴비화 시설이 제한적이므로 PLA 도입 전 실제 처리 경로를 사전에 확인하세요.",
    },
    {
      question: "ESG 보고서에 포장재 전환 실적을 어떻게 기재하나요?",
      answer:
        'GRI 301(소재) 기준에 따라 재생·인증 소재 비율(%)과 탄소 배출 절감량(tCO₂e)을 기재합니다. 공급 업체에서 LCA(수명주기 평가) 데이터 또는 인증서를 받아 근거 자료로 보관하세요. 2026 패키징 트렌드는 <a href="/guides/2026-korea-packaging-trends">2026 패키징 트렌드 리포트</a>에서 확인하세요.',
    },
  ],
  sidebar: {
    ctaHeadline: "친환경 포장재 업체 비교",
    ctaSubtext: "FSC·GRS 인증 업체, 발주 전 인증서 직접 확인 필요.",
    ctaButtonLabel: "친환경 업체 바로 비교 →",
    ctaHref: "/products/box",
    relatedGuides: [
      { href: "/guides/packaging-material-complete-guide", title: "골판지·단프라·친환경 소재 종합 비교", readTime: "6분" },
      { href: "/guides/food-packaging-materials", title: "식품 포장재 위생·인증 기준 가이드", readTime: "5분" },
      { href: "/guides/2026-korea-packaging-trends", title: "2026 한국 패키징 트렌드 리포트", readTime: "7분" },
      { href: "/guides/flexible-packaging-guide", title: "파우치·필름 연포장 소재 선택 가이드", readTime: "5분" },
    ],
  },
  endCta: {
    headline: "친환경 포장재 업체 바로 비교",
    subtext: "FSC·GRS 인증 여부 표시 업체, 발주 전 인증서 직접 확인 필요",
    buttonLabel: "업체 비교하기 →",
    href: "/products/box",
  },
};

// ─── Slot data — packaging-material-complete-guide ───────────────────────────

const SLOT_DATA_PACKAGING_MATERIAL: SlotData = {
  heroTag: "소재·친환경 · 소재 종합 가이드",
  heroDateLabel: "2026-05 업데이트",
  heroReadTime: "6분 읽기",
  tldr: [
    {
      bold: "골판지·단프라·연포장",
      text: "— 소재 선택은 내용물 무게·방습·인쇄 요건 3가지로 결정합니다.",
    },
    {
      bold: "소재별 MOQ 3~10배 차이",
      text: "— 단프라·알루미늄 라미네이트는 골판지 대비 MOQ가 높습니다.",
    },
    {
      bold: "복합 소재 전환 시 Total Cost 계산",
      text: "— 단가만 비교하면 납기·형판비 차이를 놓칩니다.",
    },
  ],
  callouts: [
    {
      variant: "info",
      title: "소재별 특성 한눈에 비교",
      body: "골판지는 압축 강도·인쇄 적합성이 우수하고, 단프라(PP 골판지)는 방습·내구성, 연포장 필름은 밀봉성·중량 절감에 강점이 있습니다. 용도별 최적 소재를 선택하려면 내용물 물성(무게·수분·기체 차단 요건)을 먼저 정의하세요.",
    },
    {
      variant: "warn",
      title: "소재 변경은 인증 재검토 필요",
      body: "식품·의약품 포장재는 소재를 변경하면 식약처 기준 재확인 및 이행성 시험이 필요합니다. 소재 전환 전 반드시 현행 인증 서류가 새 소재에도 적용되는지 확인하세요.",
    },
    {
      variant: "tip",
      title: "소량 다품종 발주 시 소재 통합",
      body: "여러 SKU의 포장재 소재를 통합하면 발주 수량이 늘어 MOQ를 충족하기 쉽고 단가 협상력이 높아집니다. 소재 종류를 줄이는 방향으로 제품 라인업을 정비하는 것을 권장합니다.",
    },
  ],
  checklistTitle: "소재 선택 전 확정 항목",
  checklist: [
    "<strong>내용물 물성 정의</strong> — 무게·수분·기체 차단 요건·내열 조건 문서화",
    "<strong>법정 인증 요건 확인</strong> — 식품·화장품·의약품 포장 시 소재별 식약처 기준 검토",
    "<strong>MOQ·납기 비교</strong> — 소재별 제조사 MOQ 및 생산 리드타임 일람표 작성",
    "<strong>형판비·초기 비용 산출</strong> — 맞춤 소재·연포장 형판비를 TCO에 포함",
    "<strong>친환경 전환 가능 여부</strong> — FSC·GRS 인증 소재 대체 옵션 및 단가 차이 확인",
  ],
  faq: [
    {
      question: "골판지와 단프라(PP 골판지) 중 어느 소재가 더 나은가요?",
      answer:
        '일반 배송용 박스에는 골판지가 원가 효율적입니다. 단프라(PP 골판지)는 방습·내구성이 필요한 냉장·냉동 물류, 반복 사용 박스, 야외 보관 제품에 적합하지만 단가가 2~3배 높습니다. 소재 선택 기준 상세 내용은 <a href="/guides/eco-friendly-packaging">친환경 포장재 가이드</a>에서도 확인하세요.',
    },
    {
      question: "연포장(파우치·필름)과 경질 용기의 주요 차이점은 무엇인가요?",
      answer:
        '연포장은 중량이 가볍고 밀봉성·기체 차단이 우수하며 대량 생산에 유리합니다. 경질 용기는 보호력·재사용성이 높지만 금형 초기 비용이 큽니다. 연포장 소재 상세 선택 기준은 <a href="/guides/flexible-packaging-guide">연포장 가이드</a>를 참고하세요.',
    },
    {
      question: "화장품 포장 소재 선택 시 주의할 점은 무엇인가요?",
      answer:
        '화장품 용기·포장은 「화장품법」에 따라 이물질 용출, 내용물 변질 방지 기준을 준수해야 합니다. PET·PP·유리 소재가 주로 사용되며, 라벨 표시 의무 사항도 반드시 확인하세요. 화장품 박스 구조와 후가공은 <a href="/guides/cosmetic-packaging-box">화장품 박스 가이드</a>에서 확인하세요.',
    },
    {
      question: "식품 포장재로 사용 가능한 소재는 어떻게 확인하나요?",
      answer:
        '식약처 「기구 및 용기·포장의 기준 및 규격」에서 식품 접촉 허용 소재를 확인하고, 업체에 KOLAS 인정 시험기관 발급 시험성적서를 요청하세요. 식품 포장재 소재 선택 상세 기준은 <a href="/guides/food-packaging-materials">식품 포장재 가이드</a>를 참고하세요.',
    },
    {
      question: "소재 전환 시 발주 MOQ는 어떻게 맞추나요?",
      answer:
        '단프라·알루미늄 라미네이트 등 특수 소재는 MOQ가 높습니다. 여러 SKU를 동일 소재로 통합하거나, 소량 맞춤 발주 옵션을 제공하는 업체를 Packlinx에서 찾아보세요. 소량 박스 발주 기준은 <a href="/guides/small-quantity-custom-box">소량 맞춤 박스 가이드</a>를 참고하세요.',
    },
  ],
  sidebar: {
    ctaHeadline: "소재별 포장재 업체 비교",
    ctaSubtext: "골판지·단프라·연포장 업체, 소재·MOQ·납기 조건으로 필터 비교.",
    ctaButtonLabel: "소재별 업체 바로 비교 →",
    ctaHref: "/products/box",
    relatedGuides: [
      { href: "/guides/eco-friendly-packaging", title: "FSC·GRS·생분해 인증 소재 전환 가이드", readTime: "6분" },
      { href: "/guides/flexible-packaging-guide", title: "파우치·필름 연포장 소재 선택 기준", readTime: "5분" },
      { href: "/guides/food-packaging-materials", title: "식품 포장재 위생·인증 기준", readTime: "5분" },
      { href: "/guides/corrugated-flute-types", title: "A·B·C·E·F골 특성·용도 비교", readTime: "5분" },
    ],
  },
  endCta: {
    headline: "소재별 포장재 업체 바로 비교",
    subtext: "골판지·단프라·연포장 업체, 소재·MOQ·납기 조건으로 필터 비교",
    buttonLabel: "업체 비교하기 →",
    href: "/products/box",
  },
};

// ─── Slot data — food-packaging-materials ─────────────────────────────────────

const SLOT_DATA_FOOD_PACKAGING: SlotData = {
  heroTag: "소재·산업별 · 식품 패키징",
  heroDateLabel: "2026-05 업데이트",
  heroReadTime: "5분 읽기",
  tldr: [
    {
      bold: "식품 접촉 소재 적합성",
      text: "— 식약처 「기구 및 용기·포장의 기준 및 규격」 적합 여부를 반드시 확인해야 합니다.",
    },
    {
      bold: "이행성 시험 항목 파악",
      text: "— 소재 선택 전 내용물의 pH·지방 함량·충진 온도를 기준으로 이행성 시험 항목을 파악하세요.",
    },
    {
      bold: "소재 조합 설계",
      text: "— 종이·플라스틱·금속·유리 소재별 특성을 비교해 최적 패키징 조합을 설계하세요.",
    },
  ],
  callouts: [
    {
      variant: "info",
      title: "이행성 시험 성적서 수령 권장",
      body: "식품 접촉 소재는 납·카드뮴·총용출량 등 식약처 규정 항목에 대한 이행성 시험 성적서를 제조사로부터 수령하는 것이 권장됩니다.",
    },
    {
      variant: "warn",
      title: "\"식품 등급\" 표기만으로는 불충분",
      body: "\"식품 등급(Food Grade)\" 표기만으로는 법적 요건을 충족하지 않을 수 있습니다. 반드시 시험 성적서와 함께 규격 적합 여부를 확인하세요.",
    },
    {
      variant: "tip",
      title: "고온 충진 시 내열 소재 선택",
      body: "고온 충진(레토르트·UHT)에는 일반 PE 대신 내열성 PP 또는 레토르트 파우치 전용 소재를 선택하면 변형 리스크를 낮출 수 있습니다.",
    },
  ],
  checklistTitle: "소재 선택 전 확정 항목",
  checklist: [
    "식약처 「기구 및 용기·포장의 기준 및 규격」 최신 고시 버전 확인",
    "내용물 특성(pH, 알코올 함량, 지방 함량, 충진 온도)에 따른 이행성 시험 항목 파악",
    "제조사로부터 이행성 시험 성적서 수령 여부 확인",
    "소재 조합(내층·중층·외층) 설계 후 기능성 검증",
    "폐기물관리법에 따른 재활용 가능 소재 여부 사전 검토",
  ],
  faq: [
    {
      question: "식품 패키징에 사용 가능한 소재는 어떻게 확인하나요?",
      answer:
        '식약처 「기구 및 용기·포장의 기준 및 규격」 고시를 확인하세요. 플라스틱·금속·종이·유리 등 소재별 허용 물질과 이행성 시험 기준이 수록되어 있습니다.',
    },
    {
      question: "PP와 PE의 식품 포장 적합성 차이는 무엇인가요?",
      answer:
        "PP는 내열성(약 120~140°C)이 PE보다 높아 레토르트·전자레인지용 용기에 적합합니다. PE는 저온(-20°C 이하)에서의 유연성이 우수해 냉동 식품 포장에 많이 사용됩니다.",
    },
    {
      question: "친환경 식품 포장재로 전환 시 주의할 점은 무엇인가요?",
      answer:
        '생분해 소재도 식품 접촉 기준 적합성이 요구됩니다. 퇴비화 가능(compostable) 소재는 별도 인증을 확인하고, 내수성·차단성 기능을 기존 소재와 비교 검토하세요.',
    },
    {
      question: "레토르트 파우치와 캔 중 비용 효율이 높은 것은 무엇인가요?",
      answer:
        "소량(5만 개 미만)에서는 레토르트 파우치가 초기 금형비 없이 제작 가능해 유리합니다. 대량(수백만 개)에서는 캔이 단가 면에서 경쟁력이 있습니다.",
    },
    {
      question: "식품 패키징 인쇄 시 잉크 소재 관련 주의 사항이 있나요?",
      answer:
        "식품 접촉면 인쇄는 이행성 기준을 만족해야 합니다. 외면 인쇄라도 잉크 이행(set-off) 가능성이 있어 제조사에 식품 접촉 용도 잉크 사용 여부를 확인하는 것이 권장됩니다.",
    },
  ],
  sidebar: {
    ctaHeadline: "식품 패키징 소재 업체 찾기",
    ctaSubtext: "식품 패키징 소재 공급사를 Packlinx에서 확인하세요.",
    ctaButtonLabel: "업체 비교하기 →",
    ctaHref: "/products/food-packaging",
    relatedGuides: [
      { href: "/guides/packaging-material-complete-guide", title: "패키징 소재 종합 가이드", readTime: "6분" },
      { href: "/guides/glass-metal-container-guide", title: "유리·금속 용기 가이드", readTime: "5분" },
      { href: "/guides/eco-friendly-packaging", title: "친환경 포장재 가이드", readTime: "6분" },
      { href: "/guides/flexible-packaging-guide", title: "연포장 파우치·필름 가이드", readTime: "5분" },
    ],
  },
  endCta: {
    headline: "식품 패키징 소재 업체 찾기",
    subtext: "식품 패키징 소재 공급사를 Packlinx에서 확인하세요",
    buttonLabel: "업체 비교하기 →",
    href: "/products/food-packaging",
  },
};

// ─── Slot data — cosmetic-packaging-box ──────────────────────────────────────

const SLOT_DATA_COSMETIC_BOX: SlotData = {
  heroTag: "소재·산업별 · 화장품 패키징",
  heroDateLabel: "2026-05 업데이트",
  heroReadTime: "5분 읽기",
  tldr: [
    {
      bold: "화장품법 §10 필수 기재",
      text: "— 명칭·영업자 정보·제조번호·사용기한 또는 개봉 후 사용기간·전성분·사용할 때의 주의사항 등을 외장 박스에 표시해야 합니다. 단, 소용량(50mL/50g 이하)은 일부 항목이 면제될 수 있습니다.",
    },
    {
      bold: "소재·화학 반응성 동시 검토",
      text: "— 소재 선택 시 고급감과 차광성뿐 아니라 내용물과의 화학적 반응성(탈색·변형)을 함께 검토하세요.",
    },
    {
      bold: "과대 포장 규제",
      text: "— 2차 포장 공간 15% 이내 기준 준수 여부를 설계 단계에서 확인하세요.",
    },
  ],
  callouts: [
    {
      variant: "info",
      title: "화장품법 §10 필수 기재 사항",
      body: "화장품 외장 박스에는 명칭·제조번호·사용기한 또는 개봉 후 사용기간·전성분·사용할 때의 주의사항 등을 기재해야 합니다 (화장품법 §10).",
    },
    {
      variant: "warn",
      title: "재활용 표기 시 단정 표현 지양",
      body: "재활용 표기 시 \"처분됩니다\"와 같은 단정적 표현은 피하고, \"처분이 가능합니다\" 등 가능성 어조를 사용하세요 (환경부 분리배출 표시 지침 참고).",
    },
    {
      variant: "tip",
      title: "디자인 시스템 명문화로 생산 오류 감소",
      body: "마스터 디자인 시스템(색상 코드·폰트·로고 여백 규칙)을 패키징 사양서에 명문화하면 생산 변경 시 비용과 오류를 줄일 수 있습니다.",
    },
  ],
  checklistTitle: "발주 전 확정 항목",
  checklist: [
    "화장품법 §10 필수 기재 항목 전체 체크 (명칭·제조번호·사용기한 또는 개봉 후 사용기간·전성분·사용할 때의 주의사항·영업자 정보 등)",
    "과대 포장 규제 기준 충족 여부 확인 (2차 포장 빈 공간 15% 이내)",
    "소재 내광성·내수성 테스트 계획 수립 (자외선 노출 진열 환경 고려)",
    "인쇄 색상 실물 교정(컬러 프루프) 진행 후 디지털 시안과 색차(ΔE) 확인",
    "샘플 조립 후 내용물 취출 용이성 및 내부 충격 방지재 설계 검증",
  ],
  faq: [
    {
      question: "화장품 박스에 반드시 기재해야 할 사항은 무엇인가요?",
      answer:
        "화장품법 §10에 따라 명칭, 제조번호, 사용기한 또는 개봉 후 사용기간, 전성분, 사용할 때의 주의사항, 제조업자 및 수입업자 정보, 내용량 등을 기재해야 합니다. 단, 소용량(50mL/50g 이하) 화장품은 시행규칙에 따라 일부 항목 표시가 면제될 수 있습니다.",
    },
    {
      question: "화장품 박스 소재로 가장 많이 사용되는 것은 무엇인가요?",
      answer:
        "아트지(코팅지)·크라프트지·마이크로플루트 골판지가 가장 많이 사용됩니다. 고급 라인에는 특수 지류(감압지·레인보우 박) 또는 리지드 박스가 활용됩니다.",
    },
    {
      question: "화장품 박스 과대 포장 기준은 어떻게 되나요?",
      answer:
        "화장품류 2차 포장의 포장 공간 비율은 내용물 부피 대비 15% 이하, 포장 횟수는 2차 이내가 기준입니다 (「제품의 포장재질·포장방법에 관한 기준 등에 관한 규칙」 별표).",
    },
    {
      question: "친환경 화장품 박스로 전환하려면 어떻게 해야 하나요?",
      answer:
        "FSC 인증 종이·재생 판지 사용, 수성 코팅·콩기름 잉크 적용, 열접착 대신 풀 부착 방식으로 분리 배출을 용이하게 설계하는 것이 기본입니다. 전환 전 현 공급업체와 단가 차이를 먼저 확인하세요.",
    },
  ],
  sidebar: {
    ctaHeadline: "화장품 박스 공급사 찾기",
    ctaSubtext: "화장품 박스 공급사를 Packlinx에서 비교하세요.",
    ctaButtonLabel: "업체 비교하기 →",
    ctaHref: "/products/cosmetic-packaging",
    relatedGuides: [
      { href: "/guides/packaging-material-complete-guide", title: "패키징 소재 종합 가이드", readTime: "6분" },
      { href: "/guides/glass-metal-container-guide", title: "유리·금속 용기 가이드", readTime: "5분" },
      { href: "/guides/label-printing-guide", title: "라벨 인쇄 가이드", readTime: "5분" },
      { href: "/guides/eco-friendly-packaging", title: "친환경 포장재 가이드", readTime: "6분" },
    ],
  },
  endCta: {
    headline: "화장품 박스 공급사 찾기",
    subtext: "화장품 박스 공급사를 Packlinx에서 비교하세요",
    buttonLabel: "업체 비교하기 →",
    href: "/products/cosmetic-packaging",
  },
};

// ─── Slot data — electronics-packaging-design ────────────────────────────────

const SLOT_DATA_ELECTRONICS_PACKAGING: SlotData = {
  heroTag: "소재·산업별 · 전자제품 패키징",
  heroDateLabel: "2026-05 업데이트",
  heroReadTime: "5분 읽기",
  tldr: [
    {
      bold: "ESD·충격 흡수가 핵심",
      text: "— 전자제품 패키징은 정전기 방지(ESD)와 충격 흡수가 핵심 설계 요소입니다.",
    },
    {
      bold: "KC·CE·FCC 인증 마크",
      text: "— 안전 인증 마크 부착 요건은 제조사 및 수입업자가 보유 여부를 확인해야 합니다.",
    },
    {
      bold: "내장재 선택 기준",
      text: "— PE폼·EPE·EPP·클램쉘은 제품 무게·취약 부위·낙하 높이 기준으로 결정하세요.",
    },
  ],
  callouts: [
    {
      variant: "info",
      title: "G값 테스트 기반 완충재 설계",
      body: "완충재 두께는 낙하 높이별 G값(충격 가속도) 테스트를 기반으로 설계하면 운송 중 클레임을 줄일 수 있습니다.",
    },
    {
      variant: "warn",
      title: "ESD 소재 미적용 시 부품 손상 위험",
      body: "ESD(정전기 방지) 포장 소재 미적용 시 반도체·PCB 손상이 발생할 수 있습니다. 민감 부품에는 반드시 방전 소재(핑크 폴리백, 실드백)를 사용하세요.",
    },
    {
      variant: "tip",
      title: "인증 마크 중복 표기 여부 조기 결정",
      body: "인증 마크(KC·CE·FCC) 인쇄는 제품 본체에 부착되는 경우도 많으므로, 외박스 중복 표기 여부를 설계 초기에 결정하면 오표기 리스크를 줄일 수 있습니다.",
    },
  ],
  checklistTitle: "발주 전 확정 항목",
  checklist: [
    "제품 취약 부위(스크린·커넥터·배터리) 기준 내장재 충격 흡수 구조 설계",
    "ESD 민감 부품 해당 여부 확인 및 방전 소재 적용 계획 수립",
    "KC·CE·FCC 등 인증 마크 보유 여부를 제조사에서 확인하고 표기 위치 결정",
    "낙하 테스트(ISTA 1A 또는 ASTM D5276 기준) 및 진동 테스트 계획 수립",
    "유통 경로(항공·해운·국내 택배)별 포장 등급 및 라벨링 요건 파악",
  ],
  faq: [
    {
      question: "전자제품 패키징 설계 시 가장 중요한 기준은 무엇인가요?",
      answer:
        "낙하 충격 흡수 성능과 ESD 방지가 가장 중요합니다. ISTA 또는 ASTM 기준에 따른 낙하·압축·진동 테스트를 통해 패키징 적합성을 검증하는 것이 권장됩니다.",
    },
    {
      question: "EPE와 EPP 완충재 중 어느 것이 더 적합한가요?",
      answer:
        "EPE는 유연성이 높아 형상이 복잡한 제품에, EPP는 복원력이 뛰어나 반복 재사용이 필요한 B2B 리패키징에 적합합니다. 제품 무게와 취약 부위를 기준으로 선택하세요.",
    },
    {
      question: "KC 인증 마크를 외박스에 표기해야 하나요?",
      answer:
        "KC 인증 마크 부착 의무는 제품 본체에 있으며, 외박스 표기 여부는 제품별 고시를 확인하는 것이 필요합니다. 인증 마크 보유 여부는 제조사 또는 수입업자에서 확인하세요.",
    },
    {
      question: "글로벌 배송을 위한 전자제품 패키징 등급은 어떻게 선택하나요?",
      answer:
        "ISTA 2A(멀티 기후·항공 화물용) 또는 3A(완전한 유통 사이클 시뮬레이션)를 목표로 설계하면 국내외 유통 대응 범위가 넓어집니다. 항공 운송에는 배터리 관련 IATA 위험물 규정도 함께 확인하세요.",
    },
  ],
  sidebar: {
    ctaHeadline: "전자제품 포장 업체 찾기",
    ctaSubtext: "Packlinx에서 ESD·완충재 취급 포장 공급사를 비교하세요.",
    ctaButtonLabel: "업체 비교하기 →",
    ctaHref: "/products/electronics-packaging",
    relatedGuides: [
      { href: "/guides/packaging-material-complete-guide", title: "패키징 소재 종합 가이드", readTime: "6분" },
      { href: "/guides/packaging-accessories-guide", title: "포장 부자재 가이드", readTime: "5분" },
      { href: "/guides/corrugated-flute-types", title: "골판지 플루트 종류 가이드", readTime: "5분" },
      { href: "/guides/shipping-box-pricing", title: "배송 박스 가격 가이드", readTime: "5분" },
    ],
  },
  endCta: {
    headline: "전자제품 포장 업체 찾기",
    subtext: "Packlinx에서 ESD·완충재 취급 포장 공급사를 비교하세요",
    buttonLabel: "업체 비교하기 →",
    href: "/products/electronics-packaging",
  },
};

// ─── Slot data — glass-metal-container-guide ─────────────────────────────────

const SLOT_DATA_GLASS_METAL: SlotData = {
  heroTag: "소재·산업별 · 유리·금속 용기",
  heroDateLabel: "2026-05 업데이트",
  heroReadTime: "5분 읽기",
  tldr: [
    {
      bold: "유리 용기",
      text: "— 화학적 안정성과 고급감이 높아 식품·화장품·의약품 포장에 적합합니다.",
    },
    {
      bold: "금속 캔",
      text: "— 기밀성과 차광성이 우수해 장기 보존 식품에 가장 많이 활용됩니다.",
    },
    {
      bold: "소재 선택 순서",
      text: "— 내용물 특성·충진 방식·관련 법규 요건을 동시에 검토하세요.",
    },
  ],
  callouts: [
    {
      variant: "info",
      title: "유리 용기 운송 충격 대비 필수",
      body: "유리 용기는 열·화학물질에 강하지만 무게가 무겁고 파손 위험이 있어 운송용 완충재 설계가 반드시 필요합니다.",
    },
    {
      variant: "warn",
      title: "금속 캔 산성 내용물 내면 코팅 확인",
      body: "금속 캔에 산성 내용물(과일류, 식초 음료)을 담을 경우 내면 코팅 규격(BPA-free 여부)을 제조사에 명시 요청하세요.",
    },
    {
      variant: "tip",
      title: "라벨 면적 최소화로 재활용률 향상",
      body: "유리 용기 재활용률을 높이려면 라벨 접착 면적을 30% 이하로 설계하여 색상별 분리 배출이 용이하도록 하세요.",
    },
  ],
  checklistTitle: "발주 전 확정 항목",
  checklist: [
    "내용물 성상(pH, 온도, 지방 함량) 확인 후 소재 적합성 검토",
    "제조사 규격서에서 내면 코팅·내열 온도·압력 사양 수령",
    "식품 접촉 소재 기준 적합 여부 확인 (식약처 고시 기준 해당 시)",
    "운송 충격 시험(drop test·vibration test) 계획 수립",
    "공급업체 MOQ·리드타임·샘플 수령 일정 확인",
  ],
  faq: [
    {
      question: "유리 용기와 금속 캔 중 식품 보존에 더 적합한 것은 무엇인가요?",
      answer:
        "내용물 특성에 따라 다릅니다. 산소 차단이 중요한 음료·소스류는 금속 캔이, 이취 흡수 없이 원향을 유지해야 하는 고급 식품·화장품은 유리 용기가 유리합니다.",
    },
    {
      question: "유리 용기의 내열성은 어느 정도인가요?",
      answer:
        "일반 소다석회 유리는 약 150°C, 붕규산 유리(파이렉스 계열)는 300°C 이상의 급격한 온도 변화를 견딥니다. 레토르트 충진에는 내열 규격 확인이 필수입니다.",
    },
    {
      question: "금속 캔 내면 코팅의 주요 종류는 무엇인가요?",
      answer:
        "에폭시·아크릴·폴리에스터 코팅이 주로 사용됩니다. 최근 식품 업계에서는 BPA-free 아크릴 코팅이 표준으로 자리 잡는 추세입니다.",
    },
    {
      question: "유리·금속 용기 최소 발주 수량(MOQ)은 어느 정도인가요?",
      answer:
        "유리 용기는 통상 5,000~10,000개, 금속 캔은 10,000개 이상이 일반적입니다. 소량이라면 재고 용기 구매 또는 공용 금형 활용을 검토하세요.",
    },
  ],
  sidebar: {
    ctaHeadline: "유리·금속 용기 공급사 찾기",
    ctaSubtext: "Packlinx에서 유리·금속 용기 공급사를 한 번에 비교하세요.",
    ctaButtonLabel: "업체 비교하기 →",
    ctaHref: "/products/glass-metal-container",
    relatedGuides: [
      { href: "/guides/packaging-material-complete-guide", title: "패키징 소재 종합 가이드", readTime: "6분" },
      { href: "/guides/food-packaging-materials", title: "식품 패키징 소재 가이드", readTime: "5분" },
      { href: "/guides/eco-friendly-packaging", title: "친환경 포장재 가이드", readTime: "6분" },
      { href: "/guides/plastic-container-guide", title: "플라스틱 용기 가이드", readTime: "5분" },
    ],
  },
  endCta: {
    headline: "유리·금속 용기 공급사 찾기",
    subtext: "Packlinx에서 유리·금속 용기 공급사를 한 번에 비교하세요",
    buttonLabel: "업체 비교하기 →",
    href: "/products/glass-metal-container",
  },
};

// ─── Slot data — packaging-accessories-guide ─────────────────────────────────

const SLOT_DATA_PACKAGING_ACCESSORIES: SlotData = {
  heroTag: "소재·산업별 · 포장 부자재",
  heroDateLabel: "2026-05 업데이트",
  heroReadTime: "5분 읽기",
  tldr: [
    {
      bold: "포장 부자재",
      text: "— 완충재·테이프·스트레치 필름·끈 등 제품 포장을 완성하는 보조 소재 전반을 의미합니다.",
    },
    {
      bold: "규격 선정 기준",
      text: "— 제품 무게·배송 방식·보관 환경(온습도)에 맞춘 규격을 선정해야 합니다.",
    },
    {
      bold: "공급 안정성 확보",
      text: "— 핵심 부자재는 복수 공급처를 유지하는 것이 리스크 관리에 유리합니다.",
    },
  ],
  callouts: [
    {
      variant: "info",
      title: "스트레치 필름 규격은 공급사에 문의",
      body: "스트레치 필름은 두께(10~30μm)와 신장률(200~400%)에 따라 팔레타이징 효율이 크게 달라집니다. 제품 무게와 스택 높이에 맞는 규격을 공급사에 문의하세요.",
    },
    {
      variant: "warn",
      title: "저온 환경엔 저온용 테이프 사용",
      body: "OPP 테이프는 저온 환경(-5°C 이하)에서 접착력이 급격히 저하됩니다. 냉동·냉장 물류에는 저온용 테이프(아크릴 또는 핫멜트 저온 사양)를 선택하세요.",
    },
    {
      variant: "tip",
      title: "에어백으로 보관 공간 절약",
      body: "완충 에어백(Air Pillow)은 EPS 폼 대비 부피가 1/10 수준으로 보관 공간을 크게 절약할 수 있습니다. 소형 전자제품·잡화 배송에 도입을 검토해 보세요.",
    },
  ],
  checklistTitle: "발주 전 확정 항목",
  checklist: [
    "주요 부자재(테이프·완충재·스트레치 필름·코너 보호재) 종류별 현재 사용 규격 목록화",
    "배송 경로(택배·화물·항공)별 부자재 요건 파악 및 표준화",
    "보관 환경(온습도·UV 노출) 기준 테이프·필름 접착력 유지 기간 확인",
    "핵심 부자재 공급업체 복수화 계획 수립 (최소 2개 업체 이상)",
    "연간 소비량 기반 LOT 발주 vs. 단건 발주 비용 비교 분석",
  ],
  faq: [
    {
      question: "국내 물류 현장에서 가장 많이 쓰이는 포장 부자재는 무엇인가요?",
      answer:
        "OPP 테이프·PE 완충 에어백·에어캡(버블랩)·코너 보호대·스트레치 필름·PP 끈이 가장 빈번하게 사용됩니다.",
    },
    {
      question: "완충재 종류별 차이는 무엇이고, 어떤 제품에 적합한가요?",
      answer:
        "대표 완충재 4종을 비교하면: <strong>에어캡(버블랩)</strong>은 충격 흡수력이 우수하고 단가가 낮아 E커머스 일반 배송에 가장 널리 사용됩니다. <strong>에어백(Air Pillow)</strong>은 보관 부피가 1/10로 줄어 창고 효율이 필요한 대형 물류센터에 적합합니다. <strong>EPE 폼</strong>은 화장품·전자기기처럼 표면 스크래치에 민감한 제품에 사용하며, 맞춤 재단이 가능합니다. <strong>EPS(스티로폼)</strong>는 단열이 필요한 식품·의약품 냉장 배송에 주로 사용됩니다.",
    },
    {
      question: "친환경 부자재로 전환 시 어떤 제품을 검토해야 하나요?",
      answer:
        "종이 테이프(water-activated tape)·재생 에어캡·옥수수 전분 완충재(PLA 기반)·FSC 인증 코너 보호재가 대표적입니다. 기능성(접착력·강도)과 단가를 기존 제품과 비교 후 단계적으로 전환하세요. 친환경 포장재 전반 비교는 <a href=\"/guides/eco-friendly-packaging-guide\">친환경 포장재 가이드</a>를 참고하십시오.",
    },
    {
      question: "스트레치 필름 구매 시 확인해야 할 스펙은 무엇인가요?",
      answer:
        "두께(μm)·신장률(%)·인장 강도(N/mm²)·롤 중량(kg)과 함께, 핸드 랩 vs. 기계용 구분과 코어 사이즈(76mm/150mm)를 반드시 확인하세요.",
    },
    {
      question: "OPP 테이프와 크라프트 테이프 중 어떤 것을 선택해야 하나요?",
      answer:
        "박스 봉함 일반 용도에는 방습성·점착력이 우수한 OPP 테이프가 표준입니다. 크라프트 테이프는 종이 기재로 ESG 정책에 부합하고 손으로 찢기 가능해 소규모 포장 현장에 적합합니다. 저온(냉동·냉장) 환경에는 OPP와 크라프트 모두 접착력이 저하되므로 저온용 아크릴 또는 핫멜트 테이프를 선택하십시오. 더 자세한 비교는 <a href=\"/guides/packaging-tape-comparison\">포장 테이프 종류 비교 가이드</a>를 참고하세요.",
    },
    {
      question: "국내 포장 부자재 업체는 어떻게 찾나요?",
      answer:
        "Packlinx 벤더 디렉토리에서 부자재 카테고리(완충재·테이프·스트레치 필름·코너 보호재)별로 필터링해 업체를 비교할 수 있습니다. 용도·취급 소재·MOQ 조건을 기준으로 복수 업체를 비교한 후 견적을 요청하는 것이 효율적입니다. <a href=\"/products/packaging-accessories\">포장 부자재 업체 바로 비교 →</a>",
    },
  ],
  sidebar: {
    ctaHeadline: "포장 부자재 공급사 찾기",
    ctaSubtext: "테이프·완충재·필름 취급 업체를 Packlinx에서 비교하세요.",
    ctaButtonLabel: "업체 비교하기 →",
    ctaHref: "/products/packaging-accessories",
    relatedGuides: [
      { href: "/guides/corrugated-flute-types", title: "골판지 플루트 종류 가이드", readTime: "5분" },
      { href: "/guides/electronics-packaging-design", title: "전자제품 패키징 디자인 가이드", readTime: "5분" },
      { href: "/guides/shipping-box-pricing", title: "배송 박스 가격 가이드", readTime: "5분" },
      { href: "/guides/small-quantity-custom-box", title: "소량 맞춤 박스 가이드", readTime: "5분" },
    ],
  },
  endCta: {
    headline: "포장 부자재 공급사 찾기",
    subtext: "테이프·완충재·필름 취급 업체를 Packlinx에서 비교하세요",
    buttonLabel: "업체 비교하기 →",
    href: "/products/packaging-accessories",
  },
};

// ─── Slot data — packaging-tape-comparison ───────────────────────────────────

const SLOT_DATA_PACKAGING_TAPE: SlotData = {
  heroTag: "소재 · 포장 테이프 비교",
  heroDateLabel: "2026-05 업데이트",
  heroReadTime: "5분 읽기",
  tldr: [
    {
      bold: "용도와 작업 환경이 테이프 선택 기준을 결정한다",
      text: "— OPP·크라프트·저소음(무소음 테이프로도 표기됨) 각 소재는 봉함 강도·소음·환경 처리 방식에서 차이가 있으며, 용도별 적합성을 분리해 선택하면 비용 효율적입니다.",
    },
    {
      bold: "박스 봉함 일반 용도에는 OPP가 표준적으로 사용된다",
      text: "— 강한 점착력과 방습성으로 물류·창고 환경에 적합하며, 대량 발주 시 단가가 낮아집니다.",
    },
    {
      bold: "친환경 폐기가 우선이라면 크라프트 테이프를 검토하라",
      text: "— 종이 기재 크라프트 테이프는 분리 배출 시 종이류로 분류 가능하여 ESG 패키징 정책에 부합할 수 있습니다.",
    },
  ],
  callouts: [
    {
      variant: "info",
      title: "\"무소음 테이프\"는 마케팅 용어",
      body: "\"무소음 테이프\"는 시장에서 통용되는 마케팅 용어입니다. 엄밀히는 저소음(소음 감소) 테이프로, OPP 대비 테이프 박리 소음이 낮으나 완전 무음은 아닙니다. 야간 작업장·주거 인접 물류센터 등 소음 민감 환경에 적합합니다.",
    },
    {
      variant: "warn",
      title: "식품·의약품 포장 외면 테이프 접착제 이행 확인 필수",
      body: "식품·의약품 포장 외면에 테이프를 사용할 경우 접착제 이행 가능성을 반드시 확인하세요. 식품 접촉 가능성이 있는 포장에는 해당 용도로 적합성이 확인된 테이프를 선택하는 것이 안전합니다.",
    },
    {
      variant: "tip",
      title: "크라프트 테이프는 손으로 찢기 가능",
      body: "크라프트 테이프는 수(手)인열이 가능하여 테이프 커터기 없이도 사용 가능합니다. 소규모 포장 현장에서 작업 효율을 높일 수 있습니다.",
    },
  ],
  checklistTitle: "발주 전 확정 항목",
  checklist: [
    "봉함 강도(접착력 N/25mm) 사양 확인 후 용도 적합성 검토",
    "소음 민감 환경이라면 저소음(무소음) 테이프 적용 검토",
    "ESG·친환경 기준이라면 크라프트 테이프 분리 배출 가능 여부 확인",
    "물류 환경(온도·습도·표면 기재)에 맞게 점착제 종류 확인",
    "대량 구매 전 샘플 테스트 및 접착 유지력 사전 검증",
  ],
  faq: [
    {
      question: "OPP, 크라프트, 저소음 테이프 중 어떤 것이 더 강한가요?",
      answer:
        "단순 강도보다 용도별 적합성으로 선택하세요. 일반 박스 봉함이라면 OPP, 친환경 폐기가 중요하면 크라프트, 야간·소음 민감 환경에는 저소음 테이프가 표준적으로 사용됩니다.",
    },
    {
      question: "\"무소음 테이프\"와 \"저소음 테이프\"는 다른 건가요?",
      answer:
        "동일한 제품을 가리키는 경우가 많습니다. 시장에서는 마케팅 용어로 \"무소음\"이 통용되지만, 엄밀히는 저소음(소음 감소) 테이프입니다. 구매 시 제품 사양서에서 소음 감소 기준을 확인하세요.",
    },
    {
      question: "크라프트 테이프는 분리수거가 가능한가요?",
      answer:
        "종이 기재 크라프트 테이프는 일반적으로 종이류로 분리 배출이 가능하나, 지역 지자체 분리수거 기준에 따라 달라질 수 있습니다. 접착제 잔류물 제거 후 배출하는 것이 안전합니다.",
    },
    {
      question: "대량 구매 시 소재별 단가 차이가 큰가요?",
      answer:
        "소재·규격·발주량에 따라 다르므로 Packlinx에서 복수 업체 정보를 비교한 뒤, 각 업체에 직접 문의하는 것이 가장 정확합니다.",
    },
  ],
  sidebar: {
    ctaHeadline: "테이프 공급업체 찾기",
    ctaSubtext: "OPP·크라프트·저소음 테이프 전문 업체를 Packlinx에서 비교하세요.",
    ctaButtonLabel: "업체 비교하기 →",
    ctaHref: "/vendors?category=packaging-tape",
    relatedGuides: [
      { href: "/guides/packaging-material-complete-guide", title: "포장재 소재 완전 가이드", readTime: "6분" },
      { href: "/guides/eco-friendly-packaging", title: "친환경 포장재 가이드", readTime: "6분" },
      { href: "/guides/corrugated-flute-types", title: "골판지 플루트 종류 가이드", readTime: "5분" },
      { href: "/guides/packaging-printing-guide", title: "패키징 인쇄 공정 가이드", readTime: "5분" },
    ],
  },
  endCta: {
    headline: "테이프 공급업체를 Packlinx에서 비교하세요",
    subtext: "OPP·크라프트·저소음 테이프 전문 업체를 한 곳에서 찾고 견적을 바로 요청하세요.",
    buttonLabel: "업체 비교하기 →",
    href: "/vendors?category=packaging-tape",
  },
};

// ─── Slot data — 2026-korea-packaging-trends ─────────────────────────────────

const SLOT_DATA_KOREA_TRENDS_2026: SlotData = {
  heroTag: "트렌드 · 2026 한국 패키징",
  heroDateLabel: "2026-05 업데이트",
  heroReadTime: "6분 읽기",
  tldr: [
    {
      bold: "친환경·경량화·스마트 패키징이 2026년 한국 포장 시장을 재편하고 있다",
      text: "— 규제 강화와 ESG 공급망 요구가 맞물려 포장재 선택의 기준이 빠르게 이동하고 있습니다.",
    },
    {
      bold: "생산자책임재활용제도(EPR) 적용 범위가 확대되고 있다",
      text: "— 「자원의 절약과 재활용촉진에 관한 법률」에 근거한 EPR 제도는 포장재 생산·수입 사업자의 재활용 의무를 강화하고 있으며, 대상 범위와 분담금 단가는 환경부 고시로 매년 갱신됩니다.",
    },
    {
      bold: "일회용품 규제 대상 품목 및 시설 기준은 환경부 고시를 직접 확인해야 한다",
      text: "— 「자원의 절약과 재활용촉진에 관한 법률」 §10 및 관련 환경부 고시에 따라 규제 대상이 갱신되므로, 사업자는 환경부 또는 한국환경공단 공지를 직접 확인하시기 바랍니다.",
    },
  ],
  callouts: [
    {
      variant: "info",
      title: "EPR 분담금 단가는 환경부 고시로 매년 갱신",
      body: "EPR(생산자책임재활용제도) 분담금 단가는 환경부가 매년 고시로 갱신합니다. 사업자는 한국포장재재활용사업공제조합(KPRC) 또는 환경부 고시 공지 기준으로 연간 의무량과 단가를 확인하시기 바랍니다. 본 가이드는 특정 단가를 제시하지 않습니다.",
    },
    {
      variant: "warn",
      title: "일회용품 규제 대상은 환경부 공지에서 직접 확인",
      body: "일회용품 규제 대상 품목은 「자원의 절약과 재활용촉진에 관한 법률」 §10 및 시행령과 환경부 고시에 따라 갱신됩니다(2026-05 기준). 가이드에서 제시한 내용은 참고용이며, 최신 기준과 대상 품목은 환경부 또는 한국환경공단 공지에서 직접 확인하세요.",
    },
    {
      variant: "tip",
      title: "경량화·재사용 전환으로 EPR 분담금 부담 절감 검토 가능",
      body: "포장재 경량화·재사용 전환은 EPR 분담금 부담을 낮출 수 있는 실질적 방법입니다. 재활용 용이 등급이 높은 소재로 전환할 경우, 한국포장재재활용사업공제조합(KPRC)을 통해 분담금 감면 여부를 미리 확인하는 것이 좋습니다.",
    },
  ],
  checklistTitle: "사업자 확인 항목",
  checklist: [
    "자사 포장재가 EPR 대상인지 「자원의 절약과 재활용촉진에 관한 법률」 §16 + 시행령 기준으로 확인",
    "EPR 연간 의무량·분담금 단가를 KPRC 또는 환경부 고시에서 최신 기준으로 확인",
    "일회용품 규제 대상 품목·시설 여부를 환경부 또는 한국환경공단 공지에서 직접 확인",
    "포장재 재활용 용이 등급(환경부 고시 기준) 진단 후 경량화·소재 전환 계획 수립",
    "해외 ESG 공급망(EU PPWR 등) 요구 시 수출국 법령 기준 별도 확인",
  ],
  faq: [
    {
      question: "EPR 적용 대상 포장재인지 어떻게 확인하나요?",
      answer:
        "「자원의 절약과 재활용촉진에 관한 법률」 §16 및 시행령에 따른 대상 포장재 여부는 한국포장재재활용사업공제조합(KPRC) 또는 환경부 공지에서 확인할 수 있습니다. 특정 포장재의 대상 여부는 공제조합에 직접 문의하시기 바랍니다.",
    },
    {
      question: "2026년에 달라지는 일회용품 규제는 무엇인가요?",
      answer:
        "일회용품 규제 대상 품목과 시설은 「자원의 절약과 재활용촉진에 관한 법률」 §10 및 환경부 고시 변경에 따라 갱신됩니다(2026-05 기준). 특정 품목의 규제 적용 여부는 환경부 또는 한국환경공단 공지에서 직접 확인하시기 바랍니다.",
    },
    {
      question: "친환경 포장재로 전환하면 EPR 분담금이 줄어드나요?",
      answer:
        "환경부 고시에서 재활용 용이 등급이 높은 포장재는 분담금 산정 기준이 다를 수 있습니다. 정확한 감면 여부는 KPRC 또는 환경부 공지에서 확인하시기 바랍니다.",
    },
    {
      question: "EU Packaging Regulation이 한국 수출 포장에도 영향을 미치나요?",
      answer:
        "EU 시장에 제품을 수출한다면 EU Packaging and Packaging Waste Regulation(PPWR) 요건이 적용될 수 있습니다. 국내 EPR과 별개 규제이므로, 수출국 법령에 맞는 포장재 기준을 별도로 확인해야 합니다.",
    },
  ],
  sidebar: {
    ctaHeadline: "친환경·규제 대응 포장 업체 찾기",
    ctaSubtext: "2026 트렌드에 맞는 공급업체를 Packlinx에서 한 번에 비교하세요.",
    ctaButtonLabel: "업체 비교하기 →",
    ctaHref: "/vendors?category=eco-packaging",
    relatedGuides: [
      { href: "/guides/eco-friendly-packaging", title: "친환경 포장재 가이드", readTime: "6분" },
      { href: "/guides/packaging-material-complete-guide", title: "포장재 소재 완전 가이드", readTime: "6분" },
      { href: "/guides/packaging-accessories-guide", title: "포장 부자재 종류 가이드", readTime: "5분" },
      { href: "/guides/glass-metal-container-guide", title: "유리·금속 용기 가이드", readTime: "5분" },
    ],
  },
  endCta: {
    headline: "2026 포장 트렌드에 맞는 공급업체를 Packlinx에서 찾으세요",
    subtext: "친환경·재활용 포장 전문 업체를 한 곳에서 비교하고 견적을 요청할 수 있습니다.",
    buttonLabel: "업체 비교하기 →",
    href: "/vendors?category=eco-packaging",
  },
};

// ─── Slot data — packaging-printing-guide ────────────────────────────────────

const SLOT_DATA_PACKAGING_PRINTING: SlotData = {
  heroTag: "공정·인쇄 · 패키징 인쇄 공정",
  heroDateLabel: "2026-05 업데이트",
  heroReadTime: "5분 읽기",
  tldr: [
    {
      bold: "인쇄 방식 선택이 포장 단가와 품질을 결정한다",
      text: "— 오프셋·디지털·플렉소 등 공정별 최소 발주량·색상 수·기재 적합성 차이를 사전 파악하면 과잉 비용을 줄일 수 있습니다.",
    },
    {
      bold: "환경 인증은 공급업체 주장이 아닌 인증서로 직접 확인해야 한다",
      text: "— 환경부 환경표지 또는 ISO 14001 등 공식 인증 보유 여부를 견적 단계에서 인증서로 요청하는 것이 안전합니다.",
    },
    {
      bold: "식품 접촉 포장은 식약처 고시 기준 적합 잉크 사용 업체를 선택해야 한다",
      text: "— 「기구 및 용기·포장의 기준 및 규격」(식품의약품안전처 고시 기준) 적합 소재·잉크 사용 여부를 사전 확인하세요.",
    },
  ],
  callouts: [
    {
      variant: "info",
      title: "VOC 함량 낮은 잉크 사용 여부 사전 확인",
      body: "잉크 종류에 따라 인쇄 후 냄새·이행성이 달라집니다. VOC 함량 낮은 잉크(저VOC 잉크) 사용 여부를 발주 전 공급업체에 확인하면 식품·의약품 포장 클레임을 사전에 방지할 수 있습니다.",
    },
    {
      variant: "warn",
      title: "친환경 인쇄 주장은 공식 인증서로 반드시 검증",
      body: "\"친환경 인쇄\"는 규제 기관이 정의한 단일 기준이 없습니다. 공급업체의 친환경 주장은 환경부 환경표지·GR인증·ISO 14001 등 공식 인증서로 반드시 검증하세요. 인증서 없는 친환경 단정 표현은 표시광고법 §3 위반 소지가 있으며, Packlinx는 특정 업체의 인증 사실을 단정하지 않습니다.",
    },
    {
      variant: "tip",
      title: "소량·다품종은 디지털, 풀컬러 대량은 오프셋",
      body: "단색·2도 인쇄는 플렉소·스크린, 풀컬러 고화질은 오프셋·디지털 UV, 소량 다품종은 디지털이 비용 효율적입니다. 수량·색상·기재를 먼저 정리한 뒤 견적을 요청하세요.",
    },
  ],
  checklistTitle: "발주 전 확정 항목",
  checklist: [
    "인쇄 방식(오프셋/디지털/플렉소/그라비아)과 최소 발주량 확인",
    "기재(종이·PET·PE 등)와 잉크 호환성 사전 검토",
    "식품 접촉 포장의 경우 식약처 고시 기준 적합 잉크·코팅 사용 여부 확인",
    "친환경 인쇄 요구 시 공식 인증서(환경표지/ISO 14001 등) 직접 요청·확인",
    "교정쇄(색상 시편) 수령 후 승인, 본 인쇄 진행 전 품질 기준 합의",
  ],
  faq: [
    {
      question: "소량 주문 시 어떤 인쇄 방식이 유리한가요?",
      answer:
        "디지털 인쇄는 판(plate) 제작 비용이 없어 소량(보통 1,000부 미만)에서 단가 경쟁력이 있습니다. 다만 색 재현율은 오프셋 대비 차이가 있으므로 샘플 확인 후 결정하는 것이 좋습니다.",
    },
    {
      question: "VOC 함량 낮은 잉크는 어떻게 확인하나요?",
      answer:
        "공급업체에 MSDS(물질안전보건자료) 제공을 요청하거나, 환경부 환경표지 인증 제품 여부를 인증서로 확인하는 방법이 있습니다.",
    },
    {
      question: "식품 포장 인쇄에는 어떤 기준이 적용되나요?",
      answer:
        "식품의약품안전처 고시 「기구 및 용기·포장의 기준 및 규격」에 따라 식품 접촉면 소재·잉크에 대한 안전 기준이 적용됩니다. 공급업체에 해당 기준 적합 확인서 제출을 요구하는 것이 안전합니다.",
    },
    {
      question: "해외(EU) 수출 포장에도 인쇄 기준이 있나요?",
      answer:
        "EU는 Regulation (EC) No 1935/2004(식품 접촉 소재 기준)이 적용됩니다. 수출 포장이라면 수입국 법령에 맞는 잉크·소재 사용 여부를 발주 전 확인하세요.",
    },
  ],
  sidebar: {
    ctaHeadline: "인쇄 공정별 포장 업체 찾기",
    ctaSubtext: "공정·기재·인쇄 방식별 공급업체 정보를 한눈에 비교할 수 있습니다.",
    ctaButtonLabel: "업체 비교하기 →",
    ctaHref: "/vendors?category=packaging-printing",
    relatedGuides: [
      { href: "/guides/label-printing-guide", title: "라벨 인쇄 업체 선정 가이드", readTime: "5분" },
      { href: "/guides/packaging-material-complete-guide", title: "포장재 소재 완전 가이드", readTime: "6분" },
      { href: "/guides/eco-friendly-packaging", title: "친환경 포장재 가이드", readTime: "6분" },
      { href: "/guides/food-packaging-materials", title: "식품 포장재 소재 가이드", readTime: "5분" },
    ],
  },
  endCta: {
    headline: "인쇄 공정에 맞는 포장 업체, Packlinx에서 찾으세요",
    subtext: "공정·기재·인쇄 방식별 공급업체 정보를 한눈에 비교할 수 있습니다.",
    buttonLabel: "업체 비교하기 →",
    href: "/vendors?category=packaging-printing",
  },
};

// ─── Slot data — packaging-machinery-guide ───────────────────────────────────

const SLOT_DATA_PACKAGING_MACHINERY: SlotData = {
  heroTag: "공정·인쇄 · 포장기계 가이드",
  heroDateLabel: "2026-05 업데이트",
  heroReadTime: "5분 읽기",
  tldr: [
    {
      bold: "자동화 수준이 포장 라인 선택을 결정한다",
      text: "— 반자동·전자동·완전자동 구분과 시간당 처리량(BPM/CPM)을 먼저 정의해야 과잉·과소 투자를 막을 수 있습니다.",
    },
    {
      bold: "국내 도입 시 KCs 안전인증 대상 여부를 반드시 확인하라",
      text: "— 「전기용품 및 생활용품 안전관리법」 상 KCs 인증 대상 기계는 인증 마크 없이 판매·사용이 불가합니다. 공급업체에 인증서 제출을 요청하는 것이 안전합니다.",
    },
    {
      bold: "TCO(총 소유 비용)로 선택하라",
      text: "— 초기 구매가뿐 아니라 부품 수급·유지보수 계약·소모품 단가를 포함한 5년 TCO 기준으로 비교해야 합니다.",
    },
  ],
  callouts: [
    {
      variant: "info",
      title: "처리 대상 제품 형상·크기부터 정의",
      body: "포장기계는 용도별로 카톤에렉터, 씰링기, 슈링크 포장기, 스트레치 포장기, 진공 포장기 등으로 세분됩니다. 처리 대상 제품의 형상·크기·중량을 먼저 정의해야 적합한 기종을 선택할 수 있습니다.",
    },
    {
      variant: "warn",
      title: "전기 사용 포장기계 — KCs 인증 대상 여부 확인 필수",
      body: "국내에서 전기를 사용하는 포장기계를 도입하려면 KCs 안전인증 대상 품목인지 먼저 확인하세요. 인증 대상임에도 마크가 없는 제품을 사용하면 「전기용품 및 생활용품 안전관리법」 위반이 됩니다. 공급업체에 KCs 인증서를 요청하시기 바랍니다.",
    },
    {
      variant: "tip",
      title: "국내 KCs와 EU CE는 별개 제도 — 혼동 금지",
      body: "EU 시장에 수출하는 제품을 패키징한다면 CE 적합성 표시(Declaration of Conformity)가 필요할 수 있습니다. 국내 KCs와 EU CE는 별개 제도이므로 각각 별도로 확인이 필요합니다.",
    },
  ],
  checklistTitle: "발주 전 확정 항목",
  checklist: [
    "처리 대상 제품 형상·크기·중량·시간당 처리량(BPM) 사전 정의",
    "국내 도입 기계의 KCs 안전인증 대상 여부 및 인증서 보유 여부 확인",
    "산업안전보건법령 상 안전기준 준수 여부 점검",
    "부품 수급 안정성·유지보수 계약·소모품 단가 포함 5년 TCO 산정",
    "설치 후 시운전·조작자 교육 포함 여부 계약서에 명시",
  ],
  faq: [
    {
      question: "KCs 인증이 없는 수입 포장기계를 사용할 수 있나요?",
      answer:
        "KCs 안전인증 대상 품목이라면 인증 없이 국내 판매·사용이 불가합니다. 해외 직수입 기계라도 동일 기준이 적용되므로, 공급업체에 KCs 인증서를 반드시 요청하세요.",
    },
    {
      question: "CE 인증 제품은 국내에서도 사용 가능한가요?",
      answer:
        "CE는 EU 시장 적합성 표시로, 국내 KCs와 별개 제도입니다. CE만 보유했다고 국내 KCs 요건을 충족하지 않으므로, 국내 도입 전 KCs 인증 여부를 별도로 확인해야 합니다.",
    },
    {
      question: "반자동과 전자동 포장기 중 어떤 것이 유리한가요?",
      answer:
        "월 처리량 기준으로 판단하세요. 소량 다품종이라면 반자동이 유연성이 높고, 대량 단품종은 전자동이 장기적으로 단가 절감에 유리합니다. 공급업체 무상 시뮬레이션을 활용하시기 바랍니다.",
    },
    {
      question: "포장기계 유지보수는 어떻게 준비해야 하나요?",
      answer:
        "공급업체 또는 공인 서비스센터와 유지보수 계약을 체결하는 것이 일반적입니다. 계약서에 부품 보증기간·응급 출동 SLA(서비스 수준)를 명시하면 운영 리스크를 줄일 수 있습니다.",
    },
  ],
  sidebar: {
    ctaHeadline: "포장기계 공급업체 찾기",
    ctaSubtext: "KCs 인증 보유 업체를 포함, 기계 유형·처리량별 공급업체를 한 곳에서 확인할 수 있습니다.",
    ctaButtonLabel: "업체 비교하기 →",
    ctaHref: "/vendors?category=packaging-machinery",
    relatedGuides: [
      { href: "/guides/packaging-material-complete-guide", title: "포장재 소재 완전 가이드", readTime: "6분" },
      { href: "/guides/corrugated-flute-types", title: "골판지 플루트 종류 가이드", readTime: "5분" },
      { href: "/guides/food-packaging-materials", title: "식품 포장재 소재 가이드", readTime: "5분" },
      { href: "/guides/packaging-printing-guide", title: "패키징 인쇄 공정 가이드", readTime: "5분" },
    ],
  },
  endCta: {
    headline: "포장기계 공급업체를 Packlinx에서 비교하세요",
    subtext: "KCs 인증 보유 업체를 포함, 기계 유형·처리량별 공급업체를 한 곳에서 확인할 수 있습니다.",
    buttonLabel: "업체 비교하기 →",
    href: "/vendors?category=packaging-machinery",
  },
};
