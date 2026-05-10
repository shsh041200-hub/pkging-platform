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
const canonicalUrl = `${siteUrl}/guides/cosmetic-packaging-box`;

const title = "화장품 패키징 박스 가이드 — 화장품법 §10 기재 항목·소재·과대포장 (2026)";
const description =
  "화장품 외장 박스 설계 시 반드시 알아야 할 화장품법 §10 필수 기재 사항, 과대포장 기준(2차 포장 15% 이내), 소재·인쇄·후가공 선택 기준을 B2B 구매 담당자를 위해 정리했습니다.";

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
    name: "화장품 패키징 박스",
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "화장품 박스에 반드시 기재해야 할 사항은 무엇인가요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "화장품법 §10에 따라 전성분, 사용기한(또는 제조연월일), 사용할 때의 주의사항, 제조업자 및 수입업자 정보, 내용량, 가격 등을 기재해야 합니다. 누락 시 행정처분이 가능합니다. 단, 소용량(50mL/50g 이하) 화장품은 시행규칙에 따라 일부 항목(전성분 등) 표시가 면제될 수 있으며, 인터넷 게시 등으로 갈음이 가능합니다.",
      },
    },
    {
      "@type": "Question",
      name: "화장품 박스 소재로 가장 많이 사용되는 것은 무엇인가요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "아트지(코팅지)·크라프트지·마이크로플루트 골판지가 가장 많이 사용됩니다. 고급 라인에는 특수 지류(감압지·레인보우 박) 또는 리지드 박스가 활용됩니다.",
      },
    },
    {
      "@type": "Question",
      name: "화장품 박스 과대 포장 기준은 어떻게 되나요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "화장품류 2차 포장의 포장 공간 비율은 내용물 부피 대비 15% 이하, 포장 횟수는 2차 이내가 기준입니다 (자원의 절약과 재활용 촉진에 관한 법률 시행규칙).",
      },
    },
    {
      "@type": "Question",
      name: "친환경 화장품 박스로 전환하려면 어떻게 해야 하나요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "FSC 인증 종이·재생 판지 사용, 수성 코팅·콩기름 잉크 적용, 열접착 대신 풀 부착 방식으로 분리 배출을 용이하게 설계하는 것이 기본입니다. 전환 전 현 공급업체와 단가 차이를 먼저 확인하세요.",
      },
    },
  ],
};

// ─── v1 slot data (PACAA-449 Batch 3 Post-Legal) ──────────────────────────────

const slotTldr = [
  {
    bold: "화장품 패키징은 화장품법 §10의 필수 기재 사항을 외장 박스에 표시해야 합니다.",
    text: " 단, 소용량(50mL/50g 이하) 화장품은 시행규칙에 따라 일부 항목 표시가 면제될 수 있습니다.",
  },
  { bold: "소재 선택 시", text: " 고급감과 차광성뿐 아니라 내용물과의 화학적 반응성(탈색·변형)을 함께 검토하세요." },
  { bold: "환경 규제 대응을 위해", text: " 과대 포장 기준(2차 포장 공간 15% 이내) 준수 여부를 설계 단계에서 확인하세요." },
];

const slotFaq = [
  {
    question: "화장품 박스에 반드시 기재해야 할 사항은 무엇인가요?",
    answer: "화장품법 §10에 따라 전성분, 사용기한(또는 제조연월일), 사용할 때의 주의사항, 제조업자 및 수입업자 정보, 내용량, 가격 등을 기재해야 합니다. 누락 시 행정처분이 가능합니다. <strong>단, 소용량(50mL/50g 이하) 화장품은 시행규칙에 따라 일부 항목(전성분 등) 표시가 면제될 수 있으며, 인터넷 게시 등으로 갈음이 가능합니다.</strong>",
  },
  {
    question: "화장품 박스 소재로 가장 많이 사용되는 것은 무엇인가요?",
    answer: "아트지(코팅지)·크라프트지·마이크로플루트 골판지가 가장 많이 사용됩니다. 고급 라인에는 특수 지류(감압지·레인보우 박) 또는 리지드 박스가 활용됩니다.",
  },
  {
    question: "화장품 박스 과대 포장 기준은 어떻게 되나요?",
    answer: "화장품류 2차 포장의 포장 공간 비율은 내용물 부피 대비 15% 이하, 포장 횟수는 2차 이내가 기준입니다 (자원의 절약과 재활용 촉진에 관한 법률 시행규칙).",
  },
  {
    question: "친환경 화장품 박스로 전환하려면 어떻게 해야 하나요?",
    answer: "FSC 인증 종이·재생 판지 사용, 수성 코팅·콩기름 잉크 적용, 열접착 대신 풀 부착 방식으로 분리 배출을 용이하게 설계하는 것이 기본입니다. 전환 전 현 공급업체와 단가 차이를 먼저 확인하세요.",
  },
];

export default function CosmeticPackagingBoxPage() {
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
        tag="화장품 · 법규·인쇄"
        title="화장품 패키징 박스 가이드 — 화장품법 §10 기재 항목·소재·과대포장 (2026년)"
        dateLabel="2026-05 업데이트"
        readTime="6분 읽기"
        category="소재"
        categoryHref="/guides"
        tldr={slotTldr}
      />
      <div
        className="max-w-[1180px] mx-auto"
        style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: "48px", padding: "40px 24px 80px" }}
      >
        <article style={{ fontSize: "17px", lineHeight: "1.78", color: "var(--g-ink-2)", maxWidth: "760px" }}>
          <GuideCallout variant="info" title="화장품법 §10 기재 필수 항목">
            <p>화장품 외장 박스에는 전성분·사용기한·사용할 때의 주의사항·제조업자·수입업자 정보를 모두 기재해야 합니다 (화장품법 §10).</p>
          </GuideCallout>
          <GuideCallout variant="warn" title="재활용 표기 시 어조 주의">
            <p>&ldquo;처분됩니다&rdquo;와 같은 단정적 표현은 피하고, &ldquo;처분이 가능합니다&rdquo; 등 가능성 어조를 사용하세요.</p>
          </GuideCallout>
          <GuideCallout variant="tip" title="마스터 디자인 시스템 명문화">
            <p>마스터 디자인 시스템(색상 코드·폰트·로고 여백 규칙)을 패키징 사양서에 명문화하면 생산 변경 시 비용과 오류를 줄일 수 있습니다.</p>
          </GuideCallout>
          <GuideChecklist
            title="화장품 박스 발주 전 확정 항목"
            items={[
              "화장품법 §10 필수 기재 항목 전체 체크 (전성분·사용기한·사용할 때의 주의사항·제조업자·수입업자)",
              "과대 포장 규제 기준 충족 여부 확인 (2차 포장 빈 공간 15% 이내)",
              "소재 내광성·내수성 테스트 계획 수립 (자외선 노출 진열 환경 고려)",
              "인쇄 색상 실물 교정(컬러 프루프) 진행 후 디지털 시안과 색차(ΔE) 확인",
              "샘플 조립 후 내용물 취출 용이성 및 내부 충격 방지재 설계 검증",
            ]}
          />

          <p>
            화장품 패키징 박스는 브랜드 이미지와 법적 기재 의무를 동시에 충족해야 합니다.
            외장 박스 하나에 화장품법 §10의 필수 기재 사항을 빠짐없이 표시하면서,
            과대 포장 규제를 준수하고 소비자의 재활용 편의도 고려해야 합니다.
            이 가이드는 구매 담당자가 박스 발주 전 확인해야 할 핵심 항목을 정리합니다.
          </p>
          <p>
            화장품 박스 공급업체를 바로 찾으신다면{" "}
            <Link href="/products/cosmetic-packaging">
              <strong>Packlinx 화장품 박스 업체 목록 →</strong>
            </Link>
          </p>

          <section>
            <h2>1. 화장품법 §10 필수 기재 사항 — 외장 박스에 표시해야 하는 항목</h2>
            <p>
              화장품법 제10조는 화장품을 판매하는 경우 용기·포장에 반드시 기재해야 할 사항을 규정합니다.
              외장 박스(2차 포장)가 있는 경우 해당 박스에 다음 항목을 모두 표시해야 합니다.
            </p>
            <table>
              <thead>
                <tr>
                  <th>기재 항목</th>
                  <th>표기 방식</th>
                  <th>소용량(50mL/50g 이하) 면제 여부</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>화장품의 명칭</td>
                  <td>브랜드명 + 제품명</td>
                  <td>면제 불가</td>
                </tr>
                <tr>
                  <td>영업자의 상호·주소</td>
                  <td>제조업자, 수입업자, 책임판매업자</td>
                  <td>면제 불가</td>
                </tr>
                <tr>
                  <td>내용량 또는 중량</td>
                  <td>mL·g 단위 명기</td>
                  <td>면제 불가</td>
                </tr>
                <tr>
                  <td>제조번호 또는 사용기한</td>
                  <td>LOT 번호 또는 개봉 후 사용기간</td>
                  <td>면제 불가</td>
                </tr>
                <tr>
                  <td>사용할 때의 주의사항</td>
                  <td>안전 사용 주의 문구</td>
                  <td>면제 불가</td>
                </tr>
                <tr>
                  <td>전성분 (모든 성분)</td>
                  <td>함량 많은 순 표기</td>
                  <td>면제 가능 (인터넷 게시로 갈음)</td>
                </tr>
                <tr>
                  <td>가격</td>
                  <td>소비자 가격 (또는 오픈 프라이스)</td>
                  <td>면제 조건 있음</td>
                </tr>
              </tbody>
            </table>
            <p>
              소용량(50mL 또는 50g 이하) 화장품은 시행규칙 별표4에 따라 전성분 표시를
              인터넷 게시 등으로 갈음할 수 있습니다. 단, 사용할 때의 주의사항은 소용량에도
              반드시 기재해야 합니다.
            </p>
            <blockquote>
              <p>
                화장품법 최신 개정 내용은 식품의약품안전처 법령 페이지에서 확인하시기 바랍니다.
              </p>
            </blockquote>
          </section>

          <section>
            <h2>2. 소재별 특성 비교 — 아트지·크라프트지·리지드 박스</h2>
            <p>
              화장품 박스 소재는 브랜드 포지셔닝과 예산에 따라 선택합니다.
              고급 라인일수록 소재 두께와 후가공 옵션이 늘어납니다.
            </p>
            <table>
              <thead>
                <tr>
                  <th>소재</th>
                  <th>두께 범위</th>
                  <th>고급감</th>
                  <th>친환경성</th>
                  <th>상대 단가</th>
                  <th>주요 용도</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>아트지 (코팅지)</td>
                  <td>250~350g/m²</td>
                  <td>중간</td>
                  <td>재활용 가능</td>
                  <td>낮음</td>
                  <td>마스·스킨케어·색조 기초라인</td>
                </tr>
                <tr>
                  <td>크라프트지</td>
                  <td>200~350g/m²</td>
                  <td>내추럴</td>
                  <td>재활용 가능, FSC 인증 가능</td>
                  <td>낮음~중간</td>
                  <td>자연주의·오가닉 브랜드</td>
                </tr>
                <tr>
                  <td>마이크로플루트 골판지</td>
                  <td>E/F 플루트</td>
                  <td>중간</td>
                  <td>재활용 가능</td>
                  <td>중간</td>
                  <td>향수·고가 세트 완충 보호</td>
                </tr>
                <tr>
                  <td>특수 지류 (감압지·레인보우 박)</td>
                  <td>250~400g/m²</td>
                  <td>높음</td>
                  <td>코팅 종류에 따라 상이</td>
                  <td>높음</td>
                  <td>프리미엄 색조·향수·선물세트</td>
                </tr>
                <tr>
                  <td>리지드 박스 (경질 박스)</td>
                  <td>2~4mm 심지</td>
                  <td>매우 높음</td>
                  <td>재사용 가능</td>
                  <td>매우 높음</td>
                  <td>럭셔리 뷰티·한정판·컬렉션</td>
                </tr>
              </tbody>
            </table>
            <p>
              <strong>아트지</strong>는 광택 코팅(UV·수성)을 적용해 인쇄 발색이 우수하며,
              국내 화장품 박스의 가장 범용적인 소재입니다. 리사이클 아트지(PCW 함유)를 선택하면
              친환경 소재 전환 비용을 최소화할 수 있습니다.
            </p>
            <p>
              <strong>리지드 박스</strong>는 두꺼운 심지에 래핑지를 붙인 구조로 개봉 경험 자체가
              브랜드 메시지가 됩니다. 접착제 없이 조립되어 재사용이 가능한 반면, 단가가 높고
              MOQ도 일반 박스 대비 높습니다.
            </p>
          </section>

          <section>
            <h2>3. 과대 포장 기준 — 화장품 2차 포장 공간 비율 계산</h2>
            <p>
              「자원의 절약과 재활용 촉진에 관한 법률 시행규칙」은 화장품류 2차 포장(외장 박스)에
              대해 포장 공간 비율과 포장 횟수를 규제합니다.
            </p>
            <table>
              <thead>
                <tr>
                  <th>규제 항목</th>
                  <th>기준</th>
                  <th>계산 방법</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>포장 공간 비율</td>
                  <td>15% 이하</td>
                  <td>(박스 내부 부피 - 내용물 부피) / 박스 내부 부피 × 100</td>
                </tr>
                <tr>
                  <td>포장 횟수</td>
                  <td>2차 이내</td>
                  <td>1차(직접 용기) + 2차(외장 박스) 까지만 허용</td>
                </tr>
              </tbody>
            </table>
            <p>
              실무에서 포장 공간 비율을 15% 이내로 맞추려면 박스 내부 치수를 내용물 치수에
              가깝게 설계해야 합니다. 완충 인서트(종이 트레이·몰드 펄프)를 사용해 내용물을
              고정하면서도 빈 공간을 최소화하는 설계가 가장 효과적입니다.
            </p>
            <p>
              <strong>위반 시:</strong> 환경부 과태료 처분 대상이 됩니다. 신규 박스 설계 시
              설계 단계에서 포장 공간 비율을 측정해 두는 것이 비용 효율적입니다.
            </p>
          </section>

          <section>
            <h2>4. 인쇄·후가공 옵션 — 발색·질감·내구성 결정 요소</h2>
            <p>
              화장품 박스 인쇄 품질은 소비자의 첫인상에 직접 영향을 미칩니다.
              인쇄 방식과 후가공 옵션을 조합해 브랜드 아이덴티티를 구현합니다.
            </p>
            <table>
              <thead>
                <tr>
                  <th>후가공 옵션</th>
                  <th>효과</th>
                  <th>상대 단가</th>
                  <th>친환경성</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>UV 광택 코팅</td>
                  <td>선명한 발색, 스크래치 방지</td>
                  <td>낮음</td>
                  <td>재활용 시 코팅 분리 어려움</td>
                </tr>
                <tr>
                  <td>수성 코팅 (매트·유광)</td>
                  <td>자연스러운 질감, 친환경</td>
                  <td>낮음~중간</td>
                  <td>재활용 용이</td>
                </tr>
                <tr>
                  <td>박 (금박·은박·홀로그램)</td>
                  <td>고급 메탈릭 효과</td>
                  <td>중간~높음</td>
                  <td>낮음 (복합 소재)</td>
                </tr>
                <tr>
                  <td>엠보싱·디보싱</td>
                  <td>입체감·촉감 차별화</td>
                  <td>중간</td>
                  <td>중간</td>
                </tr>
                <tr>
                  <td>부분 UV (Spot UV)</td>
                  <td>특정 부위 광택 강조</td>
                  <td>중간</td>
                  <td>재활용 시 코팅 분리 어려움</td>
                </tr>
                <tr>
                  <td>소프트 터치 코팅</td>
                  <td>벨벳 질감, 프리미엄감</td>
                  <td>높음</td>
                  <td>낮음</td>
                </tr>
              </tbody>
            </table>
            <p>
              박(foil stamping)과 소프트 터치 코팅은 재활용 시 분리가 어렵습니다. ESG 경영을
              강조하는 브랜드라면 수성 코팅 + 엠보싱 조합으로 고급감을 구현하는 방법이 있습니다.
              콩기름 잉크(Soy Ink)와 수성 코팅의 조합은 현재 가장 현실적인 친환경 인쇄 선택지입니다.
            </p>
          </section>

          <section>
            <h2>5. 친환경 화장품 박스 전환 — FSC 인증 + 수성 코팅</h2>
            <p>
              화장품 업계의 클린 뷰티 트렌드와 ESG 경영 요구에 따라 친환경 박스 전환 수요가
              증가하고 있습니다. 아래 순서로 단계적 전환을 권장합니다.
            </p>
            <ol>
              <li>
                <strong>FSC 인증 종이 도입</strong> — 기존 아트지 또는 크라프트지를
                FSC 인증 소재로 전환합니다. 단가 차이는 통상 5~15% 수준으로 가장 현실적인 첫 단계입니다.
              </li>
              <li>
                <strong>UV 코팅 → 수성 코팅 전환</strong> — UV 광택 코팅 대신 수성 매트 또는
                수성 유광 코팅으로 변경하면 재활용 적합성이 높아집니다.
              </li>
              <li>
                <strong>박 사용 최소화</strong> — 브랜드 아이덴티티상 불가피한 경우를 제외하고
                박 면적을 최소화하거나, 수성 박 대체 옵션을 검토합니다.
              </li>
              <li>
                <strong>과대 포장 기준 재검토</strong> — 내용물 치수에 맞게 박스를 재설계해
                불필요한 빈 공간을 줄이고 충전재 사용도 함께 줄입니다.
              </li>
            </ol>
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
              화장품 박스 업체를 최종 선정하기 전 다음 다섯 가지를 확인하십시오.
            </p>
            <ol>
              <li>
                <strong>화장품법 §10 기재 사항 인쇄 지원</strong> — 필수 기재 항목 레이아웃을
                함께 검토하고, 기재 누락 없이 인쇄할 수 있는 업체인지 확인합니다.
              </li>
              <li>
                <strong>인쇄 색상 컬러 프루프 제공</strong> — 본 발주 전 교정쇄(proof)를 통해
                색상 차이(ΔE)를 실물로 검수한 뒤 승인합니다. 디지털 시안과 실제 인쇄물 간 색차는
                소재·코팅 방식에 따라 예상보다 클 수 있습니다.
              </li>
              <li>
                <strong>과대 포장 기준 대응 설계 지원</strong> — 박스 치수 설계 단계에서
                포장 공간 비율 계산을 함께 검토해주는 업체를 선호합니다.
              </li>
              <li>
                <strong>소재·인증 서류 발급</strong> — FSC 인증 소재, 식품 접촉 이행성 성적서(내용물이
                식품인 경우), 친환경 마크 관련 서류를 발급할 수 있는 업체인지 확인합니다.
              </li>
              <li>
                <strong>불량 처리 정책 서면 확인</strong> — 인쇄 색상 불량, 박스 구조 오류,
                납기 지연 시 재제작 또는 환불 기준을 계약서에 명기합니다.
              </li>
            </ol>
          </section>

          <section>
            <h2>7. Packlinx에서 화장품 박스 업체 비교하기</h2>
            <p>
              Packlinx는 화장품 박스 공급사와 구매 담당자를 연결하는 B2B 디렉토리입니다.
              소재·인쇄 방식·MOQ·인증 조건으로 업체를 필터링해 동일 사양으로 여러 업체에
              견적을 요청할 수 있습니다.
            </p>
            <ol>
              <li>
                <Link href="/products/cosmetic-packaging">화장품 박스 업체 디렉토리</Link>에서
                소재·인쇄 방식·MOQ 조건으로 필터링
              </li>
              <li>관심 업체 2~3곳에서 샘플 및 컬러 프루프 수령</li>
              <li>화장품법 §10 기재 사항 레이아웃 검토 후 본 발주</li>
              <li>과대 포장 기준 적합 여부 확인 후 최종 승인</li>
            </ol>
            <p>
              업체 목록은{" "}
              <Link href="/products/cosmetic-packaging">Packlinx 화장품 박스 업체 목록</Link>에서
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
                <Link href="/guides/label-printing-guide">
                  라벨 인쇄 가이드 — 인쇄 방식·소재·MOQ 비교
                </Link>
              </li>
              <li>
                <Link href="/guides/eco-friendly-packaging">
                  친환경 포장재 가이드 — FSC·GRS·생분해 인증
                </Link>
              </li>
            </ul>
          </section>

          <footer>
            <p>
              <em>
                이 가이드는 Packlinx 콘텐츠팀이 작성하였습니다. 화장품법 §10 기재 사항은 개정될 수 있으므로
                발주 전 식품의약품안전처 법령 원문을 확인하시기 바랍니다.
                소용량 면제 범위 등 세부 규정은 화장품법 시행규칙을 참조하십시오.
              </em>
            </p>
          </footer>

          <h2 className="text-[22px] leading-[1.35] tracking-[-0.015em] mt-12 mb-4 text-[var(--g-ink)] font-extrabold">자주 묻는 질문</h2>
          <GuideFaq items={slotFaq} />
          <GuideEndCta
            headline="화장품 박스 공급사 찾기"
            subtext="화장품 박스 공급사를 Packlinx에서 비교하세요"
            buttonLabel="업체 비교하기 →"
            href="/products/cosmetic-packaging"
          />
        </article>
        <GuideSidebar
          ctaHeadline="화장품 박스 업체 비교"
          ctaSubtext="소재·인쇄 방식·MOQ 조건으로 필터링해 업체를 한눈에 비교하세요."
          ctaButtonLabel="업체 바로 비교 →"
          ctaHref="/products/cosmetic-packaging"
          relatedGuides={[
            { href: "/guides/packaging-material-complete-guide", title: "패키징 소재 종합 가이드", readTime: "7분" },
            { href: "/guides/glass-metal-container-guide", title: "유리·금속 용기 가이드", readTime: "7분" },
            { href: "/guides/label-printing-guide", title: "라벨 인쇄 가이드", readTime: "5분" },
            { href: "/guides/eco-friendly-packaging", title: "친환경 포장재 가이드", readTime: "6분" },
          ]}
        />
      </div>
    </div>
  );
}
