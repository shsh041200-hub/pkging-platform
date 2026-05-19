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
const canonicalUrl = `${siteUrl}/guides/eco-friendly-packaging-guide`;

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "홈", item: siteUrl },
    { "@type": "ListItem", position: 2, name: "패키징 가이드", item: `${siteUrl}/guides` },
    { "@type": "ListItem", position: 3, name: "친환경 포장재 종류 완전 가이드", item: canonicalUrl },
  ],
};

const title = "친환경 포장재 종류 완전 가이드 (2026) — 생분해·재활용·바이오기반 비교 및 국내 업체 탐색";
const description =
  "생분해(PLA·PBAT)·재활용(rPET·재생지)·바이오기반 포장재 종류 비교, 국내 GR 인증·EPR 분담금 기준, 업종별 적합 소재 선택표, MOQ·납기·전환 비용을 한 곳에 정리했습니다.";

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
  datePublished: "2026-05-20",
  dateModified: "2026-05-20",
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
    name: "친환경 포장재",
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "생분해 포장재는 일반 쓰레기봉투에 버려도 되나요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "PLA 등 생분해 소재는 산업용 퇴비화 시설(60°C 이상, 고습도)에서만 단기 분해됩니다. 일반 매립지에서는 기존 플라스틱과 분해 속도 차이가 크지 않습니다. 국내 퇴비화 인프라가 제한적이므로, 폐기 단계의 처리 방법까지 공급 업체와 사전 확인하시기 바랍니다.",
      },
    },
    {
      "@type": "Question",
      name: "친환경 포장재 전환 시 환경부 규제 외 추가로 검토해야 할 사항이 있나요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "식품 접촉 포장재는 식품안전처의 식품용 기구·용기 기준도 동시 충족해야 합니다. 또한 대형 유통사 납품 조건에 독자적인 친환경 기준이 포함될 수 있으므로, 바이어 사양서를 먼저 확인하십시오.",
      },
    },
    {
      "@type": "Question",
      name: "소량(수백 개)도 주문 가능한 친환경 포장재가 있나요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "재생지 계열은 MOQ 500개 내외 업체가 다수 있습니다. 생분해·바이오기반 계열은 최소 2,000개 이상인 경우가 많지만, 샘플 구매 또는 혼합 발주 형태로 소량 테스트가 가능한 업체도 있습니다.",
      },
    },
    {
      "@type": "Question",
      name: "친환경 포장재로 전환하면 ESG 평가에 실질적 도움이 되나요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "GHG Protocol 범위 3(Scope 3) 배출량 산정에서 포장재 소재 변경은 직접 반영됩니다. 또한 공급망 실사를 요구하는 대기업 거래처, 해외 바이어(유럽 공급망 실사법 대응 포함)의 공급업체 심사 항목에도 포장재 친환경성이 포함되고 있습니다.",
      },
    },
    {
      "@type": "Question",
      name: "국내 친환경 포장재 업체를 효율적으로 탐색하는 방법은?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Packlinx 벤더 디렉토리에서 소재(생분해·재활용·바이오기반), GR 인증 여부, MOQ 기준, 업종 특화 여부로 필터링하여 적합한 공급 업체를 비교할 수 있습니다.",
      },
    },
  ],
};

const slotTldr = [
  { bold: "생분해 ≠ 자동 친환경", text: "— PLA·PBAT는 산업용 퇴비화 시설에서만 단기 분해됩니다. 폐기 인프라를 먼저 확인하세요." },
  { bold: "rPET·재생지는 조달이 가장 용이", text: "— 기존 대비 5~20% 추가 비용, MOQ 500개 이상부터 가능한 업체 다수." },
  { bold: "EPR 분담금 절감 효과를 반영하면 전환 비용 감소", text: "— 재활용 용이성 등급 향상 시 분담금 감소분을 비용과 상계하세요." },
];

const slotFaq = [
  {
    question: "생분해 포장재는 일반 쓰레기봉투에 버려도 되나요?",
    answer: "PLA 등 생분해 소재는 산업용 퇴비화 시설(60°C 이상, 고습도)에서만 단기 분해됩니다. 일반 매립지에서는 기존 플라스틱과 분해 속도 차이가 크지 않으므로, 폐기 처리 방법을 공급 업체와 사전에 확인하십시오.",
  },
  {
    question: "소량(수백 개)도 주문 가능한 친환경 포장재가 있나요?",
    answer: "재생지 계열은 MOQ 500개 내외 업체가 다수 있습니다. 생분해·바이오기반 계열은 최소 2,000개 이상인 경우가 많지만, 샘플 키트 또는 혼합 발주로 소량 테스트가 가능한 업체도 있습니다.",
  },
  {
    question: "친환경 포장재로 전환하면 ESG 평가에 실질적 도움이 되나요?",
    answer: "GHG Protocol Scope 3 배출량 산정에 직접 반영됩니다. 대기업 거래처와 해외 바이어(유럽 공급망 실사법 대응)의 공급업체 심사에도 포장재 친환경성 항목이 포함되고 있습니다.",
  },
  {
    question: "친환경 포장재 전환 시 추가로 검토해야 할 사항은?",
    answer: "식품 접촉 포장재는 식품안전처의 식품용 기구·용기 기준도 충족해야 합니다. 대형 유통사 납품 조건에 독자적인 친환경 기준이 포함될 수 있으니 바이어 사양서를 먼저 확인하십시오.",
  },
];

export default function EcoFriendlyPackagingGuidePage() {
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <GuideHero
        tag="소재·친환경 · 친환경 포장재 가이드"
        title="친환경 포장재 종류 완전 가이드 — 생분해·재활용·바이오기반 비교 (2026년)"
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
          <GuideCallout variant="info" title="세 가지 개념 구분">
            <p>생분해·재활용·바이오기반은 흔히 혼용되지만 의미가 다릅니다. 생분해 소재가 반드시 친환경인 것은 아니며, 국내 폐기물 처리 인프라와 자사 물류 흐름을 함께 고려해야 합니다.</p>
          </GuideCallout>
          <GuideCallout variant="warn" title="PLA 폐기 주의">
            <p>PLA는 일반 매립지에서는 수십 년이 걸려 분해되며, 산업용 퇴비화 설비(60°C 이상, 고습도)에서만 단기 분해가 가능합니다. 공급 업체에 폐기 처리 경로를 반드시 확인하십시오.</p>
          </GuideCallout>
          <GuideCallout variant="tip" title="전환 비용 절감 팁">
            <p>재활용 용이성 등급 향상 시 EPR 분담금 감소분을 전환 비용과 상계하면 실질 추가 부담이 낮아집니다. 물량을 통합 발주해 MOQ를 집중시키면 단가 협상 여지도 생깁니다.</p>
          </GuideCallout>
          <GuideChecklist
            title="친환경 포장재 전환 전 확인 항목"
            items={[
              "<strong>폐기 인프라 확인</strong> — 생분해 소재의 경우 국내 산업용 퇴비화 시설 접근성 검토",
              "<strong>GR 인증 또는 재활용 용이성 등급</strong> — 공급 업체에 인증서 요청",
              "<strong>EPR 분담금 절감 효과 산정</strong> — 등급 향상 시 감소분을 전환 비용과 상계",
              "<strong>식품 접촉 포장재 법적 요건</strong> — 식품안전처 식품용 기구·용기 기준 병행 확인",
              "<strong>바이어 사양서 확인</strong> — 대형 유통사 납품 조건의 친환경 기준 포함 여부",
            ]}
          />
          <main>
            <p>
              한국 기업의 ESG 경영이 의무화 수준으로 강화되면서 포장재 전환 결정을 내려야 하는 구매
              담당자가 늘고 있습니다. 환경부는 2023년부터 일정 규모 이상의 제조·유통 사업자에게 포장재
              재질·구조 기준 준수와 분리배출 표시를 의무화하고 있습니다. 그러나 막상 검색해 보면{" "}
              <strong>생분해, 재활용, 바이오기반</strong>이 무엇이 다른지, 어디서 구매해야 하는지
              한 번에 정리된 정보를 찾기가 어렵습니다.
            </p>
            <p>
              이 가이드는 한국 B2B 바이어가 친환경 포장재를 처음 검토할 때 반드시 알아야 할 정보를
              한 곳에 정리한 참고 자료입니다. 특정 업체를 추천하거나 순위를 매기지 않으며, 모든 수치는
              시장 일반 범위를 기준으로 합니다.
            </p>
            <p>
              업체를 바로 찾으신다면{" "}
              <Link href="/categories/eco-friendly-packaging">
                <strong>Packlinx 친환경 포장재 업체 디렉토리 →</strong>
              </Link>
            </p>

            <section>
              <h2>1. 친환경 포장재란 무엇인가? — 생분해 vs 재활용 vs 바이오기반</h2>
              <p>세 가지 개념은 흔히 혼용되지만 의미가 다릅니다.</p>
              <table>
                <thead>
                  <tr>
                    <th>구분</th>
                    <th>정의</th>
                    <th>대표 소재</th>
                    <th>폐기 방법</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>생분해(Biodegradable)</strong></td>
                    <td>미생물에 의해 일정 조건에서 분해되는 소재</td>
                    <td>PLA(폴리젖산), PBAT</td>
                    <td>산업용 퇴비화 시설 필요</td>
                  </tr>
                  <tr>
                    <td><strong>재활용(Recycled)</strong></td>
                    <td>폐자원을 원료로 재가공한 소재</td>
                    <td>rPET, 재생지, 재생 PP</td>
                    <td>분리배출 후 재활용 처리</td>
                  </tr>
                  <tr>
                    <td><strong>바이오기반(Bio-based)</strong></td>
                    <td>식물성 원료로 만들어진 소재 (생분해 여부는 별개)</td>
                    <td>사탕수수 PE, 옥수수전분</td>
                    <td>소재 따라 상이</td>
                  </tr>
                </tbody>
              </table>
              <p>
                <strong>핵심 구분:</strong> 생분해 소재가 반드시 친환경인 것은 아닙니다. PLA는 일반
                매립지에서는 수십 년이 걸려 분해되며, 산업용 퇴비화 설비(60°C 이상, 고습도)에서만
                단기 분해가 가능합니다. 따라서 국내 폐기물 처리 인프라와 자사 물류 흐름을 함께
                고려해야 합니다.
              </p>
            </section>

            <section>
              <h2>2. 국내에서 실제 구매 가능한 친환경 포장재 종류</h2>
              <p>국내 B2B 시장에서 조달 가능한 주요 유형은 다음과 같습니다.</p>
              <h3>생분해 포장재</h3>
              <ul>
                <li><strong>PLA 필름·용기:</strong> 식품 포장, 일회용 컵·트레이에 주로 사용. 국내 제조사 다수 존재.</li>
                <li><strong>PBAT 봉투:</strong> 분해 속도가 PLA보다 빠르며, 농업용·유통용으로 확산 중.</li>
                <li><strong>종이 기반 생분해 코팅지:</strong> 식품 접촉 허용 코팅재와 결합한 친환경 포장지.</li>
              </ul>
              <h3>재활용 원료 포장재</h3>
              <ul>
                <li><strong>rPET 병·트레이:</strong> 기존 PET와 물성 차이가 거의 없어 식품·음료 업종에서 대체 진행 중.</li>
                <li><strong>재생지 박스·완충재:</strong> 단가 경쟁력이 높고 조달이 용이. E커머스 사용량 급증.</li>
                <li><strong>재생 PP 팔레트·트레이:</strong> 산업 물류용.</li>
              </ul>
              <h3>바이오기반 포장재</h3>
              <ul>
                <li><strong>사탕수수 PE 필름:</strong> 화학적 특성은 일반 PE와 동일하나 탄소 발자국이 낮음.</li>
                <li><strong>옥수수전분 완충재:</strong> 기존 EPS(스티로폼) 완충재 대체재. 수용성으로 폐기 용이.</li>
              </ul>
              <blockquote>
                <p>
                  연포장 필름 소재(PLA 필름 포함) 관련 상세 정보는{" "}
                  <Link href="/guides/flexible-packaging-guide">연포장재 완전 가이드</Link>를,
                  완충재·테이프 등 부자재는{" "}
                  <Link href="/guides/packaging-accessories-guide">포장 부자재 가이드</Link>를 참고하십시오.
                </p>
              </blockquote>
            </section>

            <section>
              <h2>3. 한국 공인 친환경 포장 인증 기준</h2>
              <p>구매 전 반드시 확인해야 할 국내 인증 체계입니다.</p>
              <h3>GR 인증 (Good Recycled)</h3>
              <ul>
                <li><strong>주관:</strong> 한국환경산업기술원</li>
                <li><strong>대상:</strong> 재활용 원료 사용 제품</li>
                <li><strong>의미:</strong> 재활용 원료 함량·품질 기준 충족 확인</li>
              </ul>
              <h3>환경부 재활용 용이성 등급</h3>
              <ul>
                <li>재질·구조에 따라 최우수~재활용 불가 4단계 분류</li>
                <li>의무 표시 대상: 연간 10톤 이상 포장재 제조·수입 사업자</li>
                <li>등급이 낮을수록 EPR(생산자책임재활용) 분담금 가중</li>
              </ul>
              <h3>생분해 인증 (국제 기준 준용)</h3>
              <ul>
                <li>ISO 14855 또는 EN 13432 기준을 국내 시험 기관에서 준용 시험</li>
                <li>국내 단독 인증 체계는 2026년 현재 구축 진행 중</li>
              </ul>
              <p>
                <strong>구매 시 확인 포인트:</strong> 공급 업체에 GR 인증서 또는 환경부 재활용
                용이성 자가평가 결과를 요청하십시오.
              </p>
            </section>

            <section>
              <h2>4. 업종·제품별 친환경 포장재 비교표</h2>
              <table>
                <thead>
                  <tr>
                    <th>포장재 유형</th>
                    <th>소재</th>
                    <th>주요 인증</th>
                    <th>평균 단가 (기존 대비)</th>
                    <th>일반 MOQ</th>
                    <th>적합 업종</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>생분해 PLA</td>
                    <td>폴리젖산</td>
                    <td>ISO 14855 준용</td>
                    <td>+30~50%</td>
                    <td>3,000개 이상</td>
                    <td>식품, 화장품, 일회용품</td>
                  </tr>
                  <tr>
                    <td>생분해 PBAT</td>
                    <td>폴리부틸렌아디페이트</td>
                    <td>EN 13432 준용</td>
                    <td>+25~40%</td>
                    <td>2,000개 이상</td>
                    <td>유통, 농업</td>
                  </tr>
                  <tr>
                    <td>rPET</td>
                    <td>재생 PET</td>
                    <td>GR 인증</td>
                    <td>+10~20%</td>
                    <td>1,000개 이상</td>
                    <td>식음료, 전자, 화장품</td>
                  </tr>
                  <tr>
                    <td>재생지</td>
                    <td>재활용 종이</td>
                    <td>재활용 마크</td>
                    <td>+5~15%</td>
                    <td>500개 이상</td>
                    <td>E커머스, 유통 일반</td>
                  </tr>
                  <tr>
                    <td>사탕수수 PE</td>
                    <td>바이오 폴리에틸렌</td>
                    <td>ISCC 바이오기반 인증</td>
                    <td>+20~35%</td>
                    <td>2,000개 이상</td>
                    <td>화장품, 식품 연포장</td>
                  </tr>
                  <tr>
                    <td>옥수수전분 완충재</td>
                    <td>전분 발포체</td>
                    <td>수용성 분해</td>
                    <td>+15~30%</td>
                    <td>100kg 이상</td>
                    <td>E커머스, 전자, 식품</td>
                  </tr>
                </tbody>
              </table>
              <blockquote>
                <p>
                  바이오기반 연포장재 관련 추가 정보는{" "}
                  <Link href="/guides/flexible-packaging-guide">연포장재 종합 가이드</Link>를,
                  친환경 완충재를 포함한 포장 부자재 전반은{" "}
                  <Link href="/guides/packaging-accessories-guide">포장 부자재 가이드</Link>를
                  참고하십시오.
                </p>
              </blockquote>
            </section>

            <section>
              <h2>5. 친환경 포장재 전환 비용은 얼마나 높은가?</h2>
              <p>비용 차이는 소재 종류와 조달 물량에 따라 크게 달라집니다.</p>
              <ul>
                <li><strong>재생지·재활용 계열:</strong> 기존 대비 5~20% 추가 비용. 물량이 클수록 격차 축소.</li>
                <li><strong>생분해 계열(PLA·PBAT):</strong> 기존 대비 25~50% 추가. 소량 조달 시 차이가 더 큼.</li>
                <li><strong>바이오기반 계열:</strong> 기존 대비 15~35% 추가. 국내 공급망이 확대되면서 단가 하락 추세.</li>
              </ul>
              <p><strong>비용 절감 전략:</strong></p>
              <ol>
                <li><strong>물량 통합 발주:</strong> 여러 SKU를 동일 소재로 통일해 MOQ를 집중시키면 단가 협상 여지 확대.</li>
                <li><strong>EPR 분담금 절감 효과 반영:</strong> 재활용 용이성 등급 향상 시 EPR 분담금 감소분을 전환 비용과 상계.</li>
                <li><strong>ESG 평가 지표 반영:</strong> 바이어 납품 조건에 친환경 포장 요건이 포함될 경우 전환 비용은 리스크 헤지 비용으로 처리.</li>
              </ol>
            </section>

            <section>
              <h2>6. 최소 발주 수량(MOQ)과 납기 기준</h2>
              <table>
                <thead>
                  <tr>
                    <th>포장재 유형</th>
                    <th>일반 MOQ</th>
                    <th>납기 (재고 기준)</th>
                    <th>납기 (주문 생산 기준)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>재생지 박스</td>
                    <td>500개</td>
                    <td>3~5 영업일</td>
                    <td>2~3주</td>
                  </tr>
                  <tr>
                    <td>rPET 트레이</td>
                    <td>1,000개</td>
                    <td>5~7 영업일</td>
                    <td>3~4주</td>
                  </tr>
                  <tr>
                    <td>생분해 PLA 봉투</td>
                    <td>3,000개</td>
                    <td>7~10 영업일</td>
                    <td>4~6주</td>
                  </tr>
                  <tr>
                    <td>사탕수수 PE 필름</td>
                    <td>2,000개</td>
                    <td>7~10 영업일</td>
                    <td>4~6주</td>
                  </tr>
                  <tr>
                    <td>옥수수전분 완충재</td>
                    <td>100kg</td>
                    <td>3~5 영업일</td>
                    <td>2~3주</td>
                  </tr>
                </tbody>
              </table>
              <p>
                소량 발주가 필요한 경우, 일부 업체에서는 샘플 키트(소량 혼합 발주)를 제공합니다.
                초도 거래 시 샘플 키트 여부를 확인하십시오.
              </p>
            </section>

            <section>
              <h2>7. 국내 친환경 포장재 업체는 어디서 찾는가?</h2>
              <p>
                국내 친환경 포장재 공급 업체는 품목별로 세분화되어 있어 직접 탐색에 시간이 걸립니다.
                Packlinx 벤더 디렉토리에서는 친환경 포장재 카테고리를 별도 분류하여 GR 인증 보유 여부,
                주요 소재, MOQ 기준으로 필터링 조회가 가능합니다.
              </p>
              <p>
                <Link href="/categories/eco-friendly-packaging">
                  <strong>Packlinx에서 친환경 포장재 업체 검색하기 →</strong>
                </Link>
              </p>
            </section>

            <section>
              <h2>자주 묻는 질문 (FAQ)</h2>
              <div>
                <h3>생분해 포장재는 일반 쓰레기봉투에 버려도 되나요?</h3>
                <p>
                  PLA 등 생분해 소재는 산업용 퇴비화 시설(60°C 이상, 고습도)에서만 단기 분해됩니다.
                  일반 매립지에서는 기존 플라스틱과 분해 속도 차이가 크지 않습니다. 국내 퇴비화
                  인프라가 제한적이므로, 폐기 단계의 처리 방법까지 공급 업체와 사전 확인하시기 바랍니다.
                </p>
              </div>
              <div>
                <h3>친환경 포장재 전환 시 환경부 규제 외 추가로 검토해야 할 사항이 있나요?</h3>
                <p>
                  식품 접촉 포장재는 식품안전처의 식품용 기구·용기 기준도 동시 충족해야 합니다.
                  또한 대형 유통사 납품 조건에 독자적인 친환경 기준이 포함될 수 있으므로, 바이어
                  사양서를 먼저 확인하십시오.
                </p>
              </div>
              <div>
                <h3>소량(수백 개)도 주문 가능한 친환경 포장재가 있나요?</h3>
                <p>
                  재생지 계열은 MOQ 500개 내외 업체가 다수 있습니다. 생분해·바이오기반 계열은 최소
                  2,000개 이상인 경우가 많지만, 샘플 구매 또는 혼합 발주 형태로 소량 테스트가 가능한
                  업체도 있습니다.
                </p>
              </div>
              <div>
                <h3>친환경 포장재로 전환하면 ESG 평가에 실질적 도움이 되나요?</h3>
                <p>
                  GHG Protocol 범위 3(Scope 3) 배출량 산정에서 포장재 소재 변경은 직접 반영됩니다.
                  또한 공급망 실사를 요구하는 대기업 거래처, 해외 바이어(유럽 공급망 실사법 대응 포함)의
                  공급업체 심사 항목에도 포장재 친환경성이 포함되고 있습니다.
                </p>
              </div>
              <div>
                <h3>국내 친환경 포장재 업체를 효율적으로 탐색하는 방법은?</h3>
                <p>
                  Packlinx 벤더 디렉토리에서 소재(생분해·재활용·바이오기반), GR 인증 여부, MOQ 기준,
                  업종 특화 여부로 필터링하여 적합한 공급 업체를 비교할 수 있습니다.{" "}
                  <Link href="/categories/eco-friendly-packaging">지금 검색하기 →</Link>
                </p>
              </div>
            </section>

            <section>
              <h2>관련 가이드</h2>
              <ul>
                <li>
                  <Link href="/guides/flexible-packaging-guide">연포장재 완전 가이드</Link> — PLA·바이오기반 필름을 포함한 연포장재 소재·MOQ·납기 비교
                </li>
                <li>
                  <Link href="/guides/packaging-accessories-guide">포장 부자재 종류 완전 가이드</Link> — 옥수수전분 완충재 등 친환경 완충재 포함 부자재 전반 정리
                </li>
                <li>
                  <Link href="/guides/plastic-container-guide">플라스틱 용기·병 선택 가이드</Link> — rPET 용기 전환 시 소재·식약처 기준 비교
                </li>
                <li>
                  <Link href="/guides/packaging-printing-guide">포장 인쇄 종류·후가공 완전 가이드</Link> — 친환경 소재에 적합한 인쇄 방식 선택
                </li>
              </ul>
            </section>

            <footer>
              <p>
                <em>
                  이 가이드는 Packlinx 편집팀이 환경부 고시, 한국환경산업기술원 자료, 업계 공개 데이터를
                  기반으로 작성하였습니다. 개별 업체의 인증 현황과 단가는 시장 상황에 따라 변동될 수
                  있으며, 최종 구매 전 공급 업체에 직접 확인하시기 바랍니다.
                </em>
              </p>
              <p>
                <em>
                  <strong>법적 고지:</strong> 본 가이드는 일반적인 정보 제공을 목적으로 작성되었으며,
                  법적 조언이나 특정 제품·업체에 대한 추천을 구성하지 않습니다. 환경 관련 인증 기준 및
                  법령은 관련 기관의 최신 고시를 반드시 확인하시기 바랍니다. 작성 기준일: 2026년 5월
                  기준 (변경될 수 있음)
                </em>
              </p>
            </footer>
          </main>
          <h2 className="text-[22px] leading-[1.35] tracking-[-0.015em] mt-12 mb-4 text-[var(--g-ink)] font-extrabold">자주 묻는 질문</h2>
          <GuideFaq items={slotFaq} />
          <GuideEndCta
            headline="친환경 포장재 업체 바로 비교"
            subtext="GR 인증·소재·MOQ 조건으로 필터링해 업체를 한눈에 비교하세요."
            buttonLabel="업체 비교하기 →"
            href="/categories/eco-friendly-packaging"
          />
        </article>
        <GuideSidebar
          ctaHeadline="친환경 포장재 업체 비교"
          ctaSubtext="소재·GR 인증·MOQ 조건으로 필터링해 업체를 한눈에 비교하세요."
          ctaButtonLabel="업체 바로 비교 →"
          ctaHref="/categories/eco-friendly-packaging"
          relatedGuides={[
            { href: "/guides/flexible-packaging-guide", title: "연포장재 완전 가이드", readTime: "6분" },
            { href: "/guides/packaging-accessories-guide", title: "포장 부자재 종류 완전 가이드", readTime: "6분" },
            { href: "/guides/plastic-container-guide", title: "플라스틱 용기·병 종류 완전 가이드", readTime: "6분" },
            { href: "/guides/packaging-printing-guide", title: "포장 인쇄 종류·후가공 완전 가이드", readTime: "5분" },
          ]}
        />
      </div>
    </div>
  );
}
