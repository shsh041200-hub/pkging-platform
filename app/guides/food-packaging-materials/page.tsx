import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { GuideHero } from "@/components/guide/GuideHero";
import { GuideCallout } from "@/components/guide/GuideCallout";
import { GuideChecklist } from "@/components/guide/GuideChecklist";
import { GuideFaq } from "@/components/guide/GuideFaq";
import { GuideSidebar } from "@/components/guide/GuideSidebar";
import { GuideEndCta } from "@/components/guide/GuideEndCta";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://packlinx.com";
const canonicalUrl = `${siteUrl}/guides/food-packaging-materials`;

const title = "식품 패키징 소재 가이드 — 기준 및 규격·소재 선택·이행성 시험 (2026)";
const description =
  "식약처 「기구 및 용기·포장의 기준 및 규격」 준수를 위한 식품 패키징 소재 선택 가이드. 종이·플라스틱·금속·유리 소재별 특성, 이행성 시험 항목, 친환경 전환 기준을 B2B 구매 담당자를 위해 정리했습니다.";

export function generateMetadata(): Metadata {
  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: "Packlinx",
      locale: "ko_KR",
      type: "website",
    },
  };
}

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: title,
  description,
  url: canonicalUrl,
  inLanguage: "ko-KR",
  datePublished: "2026-05-10",
  dateModified: "2026-05-10",
  author: {
    "@type": "Organization",
    name: "Packlinx",
    url: siteUrl,
  },
  image: `${canonicalUrl}/opengraph-image`,
  publisher: {
    "@type": "Organization",
    name: "Packlinx",
    url: siteUrl,
  },
  about: {
    "@type": "Thing",
    name: "식품 패키징 소재",
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "식품 패키징에 사용 가능한 소재는 어떻게 확인하나요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "식약처 「기구 및 용기·포장의 기준 및 규격」 고시를 확인하세요. 플라스틱·금속·종이·유리 등 소재별 허용 물질과 이행성 시험 기준이 수록되어 있습니다.",
      },
    },
    {
      "@type": "Question",
      name: "PP와 PE의 식품 포장 적합성 차이는 무엇인가요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "PP는 내열성(약 120~140°C)이 PE보다 높아 레토르트·전자레인지용 용기에 적합합니다. PE는 저온(-20°C 이하)에서의 유연성이 우수해 냉동 식품 포장에 많이 사용됩니다.",
      },
    },
    {
      "@type": "Question",
      name: "친환경 식품 포장재로 전환 시 주의할 점은 무엇인가요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "생분해 소재도 식품 접촉 기준 적합성이 요구됩니다. 퇴비화 가능(compostable) 소재는 별도 인증을 확인하고, 내수성·차단성 기능을 기존 소재와 비교 검토하세요.",
      },
    },
    {
      "@type": "Question",
      name: "레토르트 파우치와 캔 중 비용 효율이 높은 것은 무엇인가요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "소량(5만 개 미만)에서는 레토르트 파우치가 초기 금형비 없이 제작 가능해 유리합니다. 대량(수백만 개)에서는 캔이 단가 면에서 경쟁력이 있습니다.",
      },
    },
    {
      "@type": "Question",
      name: "식품 패키징 인쇄 시 잉크 소재 관련 주의 사항이 있나요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "식품 접촉면 인쇄는 이행성 기준을 만족해야 합니다. 외면 인쇄라도 잉크 이행(set-off) 가능성이 있어 제조사에 식품 접촉 용도 잉크 사용 여부를 확인하는 것이 권장됩니다.",
      },
    },
  ],
};

// ─── v1 slot data (PACAA-449 Batch 3 Post-Legal) ──────────────────────────────

const slotTldr = [
  { bold: "식품 패키징 소재는 식약처 「기구 및 용기·포장의 기준 및 규격」 적합 여부를 반드시 확인해야 합니다.", text: "" },
  { bold: "소재 선택 전", text: " 내용물의 pH·지방 함량·충진 온도를 기준으로 이행성 시험 항목을 파악하세요." },
  { bold: "종이·플라스틱·금속·유리", text: " 소재별 특성을 비교해 최적 패키징 조합을 설계하세요." },
];

const slotFaq = [
  {
    question: "식품 패키징에 사용 가능한 소재는 어떻게 확인하나요?",
    answer: "식약처 「기구 및 용기·포장의 기준 및 규격」 고시를 확인하세요. 플라스틱·금속·종이·유리 등 소재별 허용 물질과 이행성 시험 기준이 수록되어 있습니다.",
  },
  {
    question: "PP와 PE의 식품 포장 적합성 차이는 무엇인가요?",
    answer: "PP는 내열성(약 120~140°C)이 PE보다 높아 레토르트·전자레인지용 용기에 적합합니다. PE는 저온(-20°C 이하)에서의 유연성이 우수해 냉동 식품 포장에 많이 사용됩니다.",
  },
  {
    question: "친환경 식품 포장재로 전환 시 주의할 점은 무엇인가요?",
    answer: "생분해 소재도 식품 접촉 기준 적합성이 요구됩니다. 퇴비화 가능(compostable) 소재는 별도 인증을 확인하고, 내수성·차단성 기능을 기존 소재와 비교 검토하세요.",
  },
  {
    question: "레토르트 파우치와 캔 중 비용 효율이 높은 것은 무엇인가요?",
    answer: "소량(5만 개 미만)에서는 레토르트 파우치가 초기 금형비 없이 제작 가능해 유리합니다. 대량(수백만 개)에서는 캔이 단가 면에서 경쟁력이 있습니다.",
  },
  {
    question: "식품 패키징 인쇄 시 잉크 소재 관련 주의 사항이 있나요?",
    answer: "식품 접촉면 인쇄는 이행성 기준을 만족해야 합니다. 외면 인쇄라도 잉크 이행(set-off) 가능성이 있어 제조사에 식품 접촉 용도 잉크 사용 여부를 확인하는 것이 권장됩니다.",
  },
];

export default function FoodPackagingMaterialsPage() {
  const hreflangKo = { rel: "alternate", hreflang: "ko-KR", href: canonicalUrl } as React.LinkHTMLAttributes<HTMLLinkElement>;
  const hreflangDefault = { rel: "alternate", hreflang: "x-default", href: canonicalUrl } as React.LinkHTMLAttributes<HTMLLinkElement>;
  return (
    <div className="-mx-5 sm:-mx-8 -mt-10 sm:-mt-14">
      <link {...hreflangKo} />
      <link {...hreflangDefault} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <GuideHero
        tag="소재·규제 · 식품 패키징"
        title="식품 패키징 소재 가이드 — 기준 및 규격·소재 선택·이행성 시험 (2026년)"
        dateLabel="2026-05 업데이트"
        readTime="7분 읽기"
        category="소재"
        categoryHref="/guides"
        tldr={slotTldr}
      />
      <div
        className="max-w-[1180px] mx-auto"
        style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: "48px", padding: "40px 24px 80px" }}
      >
        <article style={{ fontSize: "17px", lineHeight: "1.78", color: "var(--g-ink-2)", maxWidth: "760px" }}>
          <GuideCallout variant="info" title="이행성 시험 성적서 수령 필수">
            <p>식품 접촉 소재는 납·카드뮴·총용출량 등 식약처 규정 항목에 대한 이행성 시험 성적서를 제조사로부터 수령하는 것이 권장됩니다.</p>
          </GuideCallout>
          <GuideCallout variant="warn" title='"식품 등급" 표기만으로 부족'>
            <p>&ldquo;식품 등급(Food Grade)&rdquo; 표기만으로는 법적 요건을 충족하지 않을 수 있습니다. 반드시 시험 성적서와 함께 규격 적합 여부를 확인하세요.</p>
          </GuideCallout>
          <GuideCallout variant="tip" title="고온 충진 소재 선택 기준">
            <p>고온 충진(레토르트·UHT)에는 일반 PE 대신 내열성 PP 또는 레토르트 파우치 전용 소재를 선택하면 변형 리스크를 낮출 수 있습니다.</p>
          </GuideCallout>
          <GuideChecklist
            title="식품 패키징 소재 발주 전 확정 항목"
            items={[
              "식약처 「기구 및 용기·포장의 기준 및 규격」 최신 고시 버전 확인",
              "내용물 특성(pH, 알코올 함량, 지방 함량, 충진 온도)에 따른 이행성 시험 항목 파악",
              "제조사로부터 이행성 시험 성적서 수령 여부 확인",
              "소재 조합(내층·중층·외층) 설계 후 기능성 검증",
              "폐기물관리법에 따른 재활용 가능 소재 여부 사전 검토",
            ]}
          />

          <p>
            식품 포장재를 선택할 때 가장 먼저 마주치는 질문은 &ldquo;이 소재를 식품에 사용해도 되는가?&rdquo;입니다.
            식약처 「기구 및 용기·포장의 기준 및 규격」은 식품과 접촉하는 모든 포장 소재에 대해
            허용 물질 목록과 이행성 한도를 규정합니다. 이 가이드는 구매 담당자가 소재별 특성과
            법적 요건을 스스로 판단할 수 있도록 핵심 기준을 정리합니다.
          </p>
          <p>
            소재 공급업체를 바로 찾으신다면{" "}
            <Link href="/products/food-packaging">
              <strong>Packlinx 식품 패키징 소재 업체 목록 →</strong>
            </Link>
          </p>

          <section>
            <h2>1. 소재별 특성 비교 — 종이·플라스틱·금속·유리</h2>
            <p>
              식품 패키징 소재는 크게 종이, 플라스틱, 금속, 유리 네 가지 계열로 구분됩니다.
              내용물의 수분·산소 차단 요건, 충진 온도, 유통 방식에 따라 소재를 선택합니다.
            </p>
            <table>
              <thead>
                <tr>
                  <th>소재 계열</th>
                  <th>산소 차단성</th>
                  <th>수분 차단성</th>
                  <th>내열성</th>
                  <th>주요 규제 근거</th>
                  <th>대표 용도</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>종이·판지</td>
                  <td>낮음</td>
                  <td>낮음</td>
                  <td>낮음</td>
                  <td>식약처 기구·용기·포장 기준</td>
                  <td>건식 식품, 케이크 박스</td>
                </tr>
                <tr>
                  <td>PE (폴리에틸렌)</td>
                  <td>낮음</td>
                  <td>높음</td>
                  <td>60~80°C</td>
                  <td>식약처 기구·용기·포장 기준</td>
                  <td>냉동식품, 랩 필름</td>
                </tr>
                <tr>
                  <td>PP (폴리프로필렌)</td>
                  <td>낮음</td>
                  <td>높음</td>
                  <td>120~140°C</td>
                  <td>식약처 기구·용기·포장 기준</td>
                  <td>레토르트, 전자레인지 용기</td>
                </tr>
                <tr>
                  <td>PET (폴리에스터)</td>
                  <td>중간</td>
                  <td>중간</td>
                  <td>150°C+</td>
                  <td>식약처 기구·용기·포장 기준</td>
                  <td>음료병, 스낵 파우치 외층</td>
                </tr>
                <tr>
                  <td>알루미늄 라미네이트</td>
                  <td>매우 높음</td>
                  <td>매우 높음</td>
                  <td>레토르트 가능</td>
                  <td>식약처 기구·용기·포장 기준</td>
                  <td>즉석식품, 커피, 장기 보관</td>
                </tr>
                <tr>
                  <td>금속 캔 (TFS·알루미늄)</td>
                  <td>완전 차광</td>
                  <td>완전 차단</td>
                  <td>레토르트 가능</td>
                  <td>식약처 기구·용기·포장 기준</td>
                  <td>통조림, 분말식품</td>
                </tr>
                <tr>
                  <td>유리</td>
                  <td>매우 높음</td>
                  <td>매우 높음</td>
                  <td>붕규산 유리 300°C+</td>
                  <td>식약처 기구·용기·포장 기준</td>
                  <td>잼, 소스, 음료</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section>
            <h2>2. 식약처 「기구 및 용기·포장의 기준 및 규격」 핵심 이해</h2>
            <p>
              이 고시는 식품과 직접·간접으로 접촉하는 모든 포장 소재에 적용됩니다.
              구매 담당자가 알아야 할 핵심 내용은 다음 세 가지입니다.
            </p>
            <ol>
              <li>
                <strong>허용 물질 목록(Positive List)</strong> — 소재별로 사용 가능한 원료·첨가제 목록이 규정되어 있습니다.
                목록에 없는 물질은 원칙적으로 사용 불가입니다.
              </li>
              <li>
                <strong>이행성 시험(Migration Test)</strong> — 포장 소재에서 식품으로 이행되는 물질량을
                측정하는 시험입니다. 납·카드뮴·총용출량·잔류 단량체 등 항목별 한도가 규정되어 있습니다.
              </li>
              <li>
                <strong>용출 시험 조건</strong> — 내용물 특성에 따라 시험액(4% 초산, n-헵탄, 증류수 등)과
                시험 시간·온도가 달라집니다. 산성 식품(pH 5 미만)에는 4% 초산 시험액을 사용합니다.
              </li>
            </ol>
            <blockquote>
              <p>
                식품 패키징 소재 업체를 비교하려면{" "}
                <Link href="/products/food-packaging">Packlinx 식품 패키징 소재 업체 디렉토리</Link>에서
                소재·인증 조건으로 필터링하세요.
              </p>
            </blockquote>
          </section>

          <section>
            <h2>3. 소재 조합(다층 구조) 설계 원칙</h2>
            <p>
              단일 소재만으로 모든 요건을 충족하기 어려운 경우, 두 가지 이상의 소재를
              라미네이트(합지)한 다층 구조를 설계합니다.
            </p>
            <table>
              <thead>
                <tr>
                  <th>층 역할</th>
                  <th>대표 소재</th>
                  <th>기능</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>외층 (인쇄·내마모)</td>
                  <td>PET, OPP</td>
                  <td>인쇄 품질 확보, 물리적 보호</td>
                </tr>
                <tr>
                  <td>중간층 (차단)</td>
                  <td>알루미늄 호일, EVOH, 나일론</td>
                  <td>산소·수분·광선 차단</td>
                </tr>
                <tr>
                  <td>내층 (실링·식품 접촉)</td>
                  <td>PE, PP, 이오노머</td>
                  <td>열접착 실링, 식품 직접 접촉</td>
                </tr>
              </tbody>
            </table>
            <p>
              내층 소재는 식품과 직접 접촉하므로 이행성 시험 성적서가 필수입니다.
              중간층 알루미늄 호일을 사용하면 산소·수분 차단성이 거의 완전해지지만,
              복합 소재 특성상 재활용이 어렵습니다. 차단 요건이 낮다면 EVOH 중간층으로
              재활용 가능성을 높이는 설계를 검토하세요.
            </p>
          </section>

          <section>
            <h2>4. 충진 방식별 소재 선택 — 레토르트·UHT·냉동·상온</h2>
            <p>
              충진 온도와 방식에 따라 소재의 내열성 요건이 크게 달라집니다.
            </p>
            <table>
              <thead>
                <tr>
                  <th>충진 방식</th>
                  <th>온도</th>
                  <th>권장 소재</th>
                  <th>주의사항</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>레토르트(가압·고온 살균)</td>
                  <td>121°C 이상</td>
                  <td>PP 용기, 레토르트 파우치(나일론/PET/AL/PP)</td>
                  <td>일반 PE 사용 금지, 실링 강도 검증 필수</td>
                </tr>
                <tr>
                  <td>UHT (초고온 살균)</td>
                  <td>135~150°C 순간</td>
                  <td>무균 충진 팩 (PET/AL/PE), 멸균 파우치</td>
                  <td>무균 충진 환경 및 설비 필요</td>
                </tr>
                <tr>
                  <td>냉장·냉동 충진</td>
                  <td>-40~4°C</td>
                  <td>PE (LDPE·LLDPE), 나일론/PE 합지</td>
                  <td>저온에서 실링 강도 유지 확인</td>
                </tr>
                <tr>
                  <td>상온 충진</td>
                  <td>20~80°C</td>
                  <td>PET/PE, PP, 유리, 금속 캔</td>
                  <td>산소 차단 요건에 따라 소재 결정</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section>
            <h2>5. 친환경 식품 포장재 전환 — 규제 대응과 기능성 균형</h2>
            <p>
              EU 포장재 규정(PPWR)과 국내 재활용 의무화 추세에 따라 친환경 소재 전환 수요가
              증가하고 있습니다. 식품용 친환경 소재 선택 시 기능성과 법적 요건을 동시에 충족해야 합니다.
            </p>
            <ul>
              <li>
                <strong>재활용 가능 단일 소재 (모노 PE·모노 PP)</strong> — 차단성이 낮아 건식·저민감
                식품에 적합. 분리배출 시 재활용률이 높음.
              </li>
              <li>
                <strong>생분해 필름 (PLA·PBAT 계열)</strong> — 산업용 퇴비화 조건에서 분해.
                차단성이 일반 소재보다 낮고, 식품 접촉 적합성 인증 별도 확인 필요.
              </li>
              <li>
                <strong>재생 원료 함유 소재 (r-PET·r-PE)</strong> — 기존 소재와 물성이 유사.
                GRS 인증 여부 및 식품 접촉 이행성 시험 성적서 요청 필수.
              </li>
            </ul>
            <p>
              생분해 소재는 식품 접촉 이행성 기준을 별도로 충족해야 합니다.
              &ldquo;생분해 인증&rdquo;이 식약처 기준 적합성을 보장하지 않으므로, 공급사에
              식품 접촉 시험 성적서를 반드시 요청하십시오.
            </p>
            <blockquote>
              <p>
                친환경 포장재 인증 기준 비교는{" "}
                <Link href="/guides/eco-friendly-packaging">친환경 포장재 가이드</Link>에서 확인하세요.
              </p>
            </blockquote>
          </section>

          <section>
            <h2>6. 업체 선정 체크리스트 (5항목)</h2>
            <p>
              식품 패키징 소재 업체를 최종 선정하기 전 다음 다섯 가지를 확인하십시오.
            </p>
            <ol>
              <li>
                <strong>이행성 시험 성적서 발급 능력</strong> — 식약처 기준에 따른 항목별
                시험 성적서를 발급할 수 있는 업체인지 확인. 시험 성적서 없이 납품하는 업체는 리스크입니다.
              </li>
              <li>
                <strong>소재 이력 추적 가능 여부 (Lot 추적)</strong> — 불량 발생 시 원료
                Lot 단위 소급이 가능해야 리콜 대응이 원활합니다.
              </li>
              <li>
                <strong>충진 방식 호환성</strong> — 레토르트·UHT 등 고온 충진을 계획한다면
                소재의 내열 사양을 업체에서 서면으로 확인하십시오.
              </li>
              <li>
                <strong>친환경 인증 현황</strong> — FSC·GRS·EL724 등 필요한 인증을 보유한
                소재를 공급할 수 있는지 확인합니다.
              </li>
              <li>
                <strong>샘플 및 파일럿 롤 공급 가능 여부</strong> — 본 발주 전 소량 샘플로
                실링 강도·인쇄 품질·이행성을 검증한 뒤 발주를 진행하십시오.
              </li>
            </ol>
          </section>

          <section>
            <h2>7. Packlinx에서 식품 패키징 소재 업체 비교하기</h2>
            <p>
              Packlinx는 식품 패키징 소재 공급사와 구매 담당자를 연결하는 B2B 디렉토리입니다.
              소재 종류·식품 접촉 인증·MOQ·납기 조건으로 업체를 필터링해 비교할 수 있습니다.
            </p>
            <ol>
              <li>
                <Link href="/products/food-packaging">식품 패키징 소재 업체 디렉토리</Link>에서
                소재·인증 조건으로 필터링
              </li>
              <li>관심 업체 2~3곳에서 이행성 시험 성적서 발급 가능 여부 확인</li>
              <li>동일 사양(소재 구조·충진 온도·MOQ)으로 견적 요청</li>
              <li>샘플 수령 후 품질 검증 → 본 발주</li>
            </ol>
            <p>
              업체 목록은{" "}
              <Link href="/products/food-packaging">Packlinx 식품 패키징 소재 업체 목록</Link>에서
              확인하시기 바랍니다.
            </p>
          </section>

          <section>
            <h2>관련 가이드</h2>
            <ul>
              <li>
                <Link href="/guides/packaging-material-complete-guide">
                  패키징 소재 종합 가이드 — 골판지·단프라·연포장 비교
                </Link>
              </li>
              <li>
                <Link href="/guides/glass-metal-container-guide">
                  유리·금속 용기 가이드 — 종류·소재·MOQ 비교
                </Link>
              </li>
              <li>
                <Link href="/guides/eco-friendly-packaging">
                  친환경 포장재 가이드 — FSC·GRS·생분해 인증
                </Link>
              </li>
              <li>
                <Link href="/guides/flexible-packaging-guide">
                  연포장재 가이드 — 파우치·필름 종류·소재 선택
                </Link>
              </li>
            </ul>
          </section>

          <footer>
            <p>
              <em>
                이 가이드는 Packlinx 콘텐츠팀이 작성하였습니다. 식약처 「기구 및 용기·포장의 기준 및 규격」은
                개정될 수 있으므로 발주 전 식품안전나라(foodsafetykorea.go.kr)에서 최신 고시를 확인하시기 바랍니다.
              </em>
            </p>
          </footer>

          <h2 className="text-[22px] leading-[1.35] tracking-[-0.015em] mt-12 mb-4 text-[var(--g-ink)] font-extrabold">자주 묻는 질문</h2>
          <GuideFaq items={slotFaq} />
          <GuideEndCta
            headline="식품 패키징 소재 업체 바로 비교"
            subtext="식품 패키징 소재 공급사를 Packlinx에서 확인하세요"
            buttonLabel="업체 비교하기 →"
            href="/products/food-packaging"
          />
        </article>
        <GuideSidebar
          ctaHeadline="식품 패키징 소재 업체 비교"
          ctaSubtext="소재·식품 접촉 인증·MOQ 조건으로 필터링해 업체를 한눈에 비교하세요."
          ctaButtonLabel="업체 바로 비교 →"
          ctaHref="/products/food-packaging"
          relatedGuides={[
            { href: "/guides/packaging-material-complete-guide", title: "패키징 소재 종합 가이드", readTime: "7분" },
            { href: "/guides/glass-metal-container-guide", title: "유리·금속 용기 가이드", readTime: "7분" },
            { href: "/guides/eco-friendly-packaging", title: "친환경 포장재 가이드", readTime: "6분" },
            { href: "/guides/flexible-packaging-guide", title: "연포장재 가이드", readTime: "6분" },
          ]}
        />
      </div>
    </div>
  );
}
