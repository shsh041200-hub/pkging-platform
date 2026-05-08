import React from "react";
import type { Metadata } from "next";
import Link from "next/link";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://packlinx.com";
const canonicalUrl = `${siteUrl}/blog/packaging-rfq-guide`;

const title =
  "포장 업체 견적 요청 완전 가이드 — RFQ 준비부터 업체 선정까지 (2026) | Packlinx";
const description =
  "포장재 견적 요청(RFQ) 전 꼭 알아야 할 7가지 — 수량·소재·납기 정보 준비법부터 복수 업체 비교 선정 기준까지";

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
      type: "article",
    },
  };
}

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline:
    "포장 업체 견적 요청 완전 가이드 — RFQ 준비부터 업체 선정까지 (2026)",
  description,
  url: canonicalUrl,
  inLanguage: "ko-KR",
  datePublished: "2026-05-08",
  dateModified: "2026-05-08",
  author: {
    "@type": "Organization",
    name: "Packlinx 편집팀",
    url: siteUrl,
  },
  publisher: {
    "@type": "Organization",
    name: "Packlinx",
    url: siteUrl,
  },
  about: {
    "@type": "Thing",
    name: "패키징 RFQ 가이드",
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "포장재 견적 요청(RFQ)을 보낼 때 가장 먼저 준비해야 할 정보는 무엇인가요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "수량(월 발주량·연 발주량)과 제품 사이즈(가로·세로·높이)를 먼저 확정하세요. 이 두 가지가 없으면 업체에서 단가 산출 자체가 불가능합니다.",
      },
    },
    {
      "@type": "Question",
      name: "포장재 RFQ에서 소재를 미리 정해야 하나요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "소재를 확정하지 않아도 됩니다. '친환경 소재 우선' 또는 '원가 최소화' 같은 우선순위를 명시하면 업체가 적합한 소재를 제안합니다. 단, 식품 접촉 여부나 특수 인증(FSC, GRS 등) 요구가 있으면 반드시 기재해야 합니다.",
      },
    },
    {
      "@type": "Question",
      name: "포장 업체에 견적을 몇 곳 정도 요청하는 게 적당한가요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "최소 3곳, 이상적으로는 5곳 이상을 권장합니다. 동일 스펙으로 복수 견적을 받아야 단가 기준선(baseline)을 파악하고 협상력을 갖출 수 있습니다.",
      },
    },
    {
      "@type": "Question",
      name: "납기 정보를 RFQ에 포함해야 하는 이유는 무엇인가요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "납기 일정은 업체의 생산 스케줄과 직결됩니다. 긴급 납기(2주 이내)는 별도 급행 비용이 붙거나 거절될 수 있으므로, 표준 납기(4~6주)와 최단 납기(긴급 시)를 함께 명시하면 업체가 현실적인 조건을 제시합니다.",
      },
    },
    {
      "@type": "Question",
      name: "포장 업체 비교 시 단가 외에 무엇을 봐야 하나요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "MOQ(최소 발주 수량), 납기 준수율, 인증 보유 현황(FSC·ISO 등), 샘플 제작 가능 여부, 결제 조건(선금 비율)을 단가와 함께 비교해야 합니다. 단가만 보면 TCO(총소유비용)를 놓칩니다.",
      },
    },
  ],
};

export default function PackagingRfqGuidePage() {
  const hreflangKo = {
    rel: "alternate",
    hreflang: "ko-KR",
    href: canonicalUrl,
  } as React.LinkHTMLAttributes<HTMLLinkElement>;
  const hreflangDefault = {
    rel: "alternate",
    hreflang: "x-default",
    href: canonicalUrl,
  } as React.LinkHTMLAttributes<HTMLLinkElement>;

  return (
    <>
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
      <main>
        <header>
          <p>Packlinx 편집팀 | 최초 발행: 2026-05-08 | 조달 가이드</p>
          <h1>
            포장 업체 견적 요청 완전 가이드 — RFQ 준비부터 업체 선정까지
            (2026)
          </h1>
        </header>

        <p>
          포장재 조달에서 가장 많은 시간을 낭비하는 단계는 견적 요청(RFQ)
          이전입니다. 준비 없이 여러 업체에 연락하면 각기 다른 조건의 견적이
          돌아오고, 결국 단순 비교조차 불가능해집니다. 이 가이드는 포장 업체
          견적 요청 전 꼭 확인해야 할 7가지 핵심 항목을 정리합니다. 처음
          견적을 요청하는 담당자부터 기존 공급사를 재검토하려는 구매팀까지
          모두에게 적용됩니다.
        </p>

        <section>
          <h2>패키징 RFQ란 무엇이며 왜 중요한가</h2>
          <p>
            RFQ(Request for Quotation, 견적 요청서)는 구매자가 공급업체에
            특정 품목의 단가, 납기, 조건을 공식 요청하는 문서입니다. 단순한
            전화 문의와 다른 점은 <strong>동일한 스펙을 복수 업체에 동시
            발송</strong>하여 비교 가능한 데이터를 확보한다는 것입니다.
          </p>
          <p>
            포장재 조달에서 RFQ가 특히 중요한 이유는 세 가지입니다. 첫째,
            포장재는 소재·규격·인쇄·마감 등 변수가 많아 스펙이 달라지면 단가가
            최대 50% 이상 차이납니다. 둘째, 복수 견적 없이는 협상 기준점이
            없습니다. 셋째, 정형화된 RFQ 프로세스는 공급사 변경 시 히스토리
            관리에도 활용됩니다.
          </p>
        </section>

        <section>
          <h2>1. 수량·사이즈: 견적의 출발점</h2>
          <p>
            포장 업체가 단가를 산출하려면 반드시 필요한 정보 두 가지가
            있습니다. <strong>발주 수량</strong>과 <strong>제품 치수</strong>입니다.
          </p>

          <h3>수량 정보 준비 방법</h3>
          <ul>
            <li>
              <strong>월 발주량·연 발주량:</strong> 단가는 수량에 따라
              크게 달라집니다. MOQ(최소 발주 수량) 이하일 경우 별도 단가가
              적용됩니다.
            </li>
            <li>
              <strong>성수기·비수기 변동폭:</strong> 이커머스·식품업계는
              특정 월 수요가 3~5배 급등합니다. 피크 수량을 미리 공유하면
              업체가 생산 일정을 계획할 수 있습니다.
            </li>
            <li>
              <strong>초도 물량 vs 정기 발주:</strong> 첫 거래 시 샘플·소량
              발주 후 본 발주 전환 계획을 함께 제시하면 업체의 협조를 얻기
              쉽습니다.
            </li>
          </ul>

          <h3>제품 치수 기재 요령</h3>
          <p>
            가로(W) × 세로(D) × 높이(H) 순서로 내경(내부 치수)을 기준으로
            기재합니다. 외경(외부 치수)과 혼동하면 포장재가 제품에 맞지
            않는 오류가 발생합니다. 허용 공차(±mm)도 함께 명시하세요.
          </p>
        </section>

        <section>
          <h2>2. 소재·스펙 정의: 너무 구체적이어도, 너무 막연해도 안 된다</h2>
          <p>
            소재를 확정하지 않고 RFQ를 보내도 됩니다. 오히려 &ldquo;친환경
            우선&rdquo; 또는 &ldquo;내구성 우선&rdquo; 같은 우선순위를 명시하면
            업체가 적합한 소재를 제안하므로 더 효율적인 경우가 많습니다.
          </p>

          <h3>반드시 기재해야 할 조건</h3>
          <table>
            <thead>
              <tr>
                <th>항목</th>
                <th>기재 이유</th>
                <th>예시</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>식품 접촉 여부</td>
                <td>식품위생법 적합 소재 필수 사용</td>
                <td>내면 식품 접촉 면, 외면 인쇄 가능</td>
              </tr>
              <tr>
                <td>특수 인증 요구</td>
                <td>납품처 요건 충족 여부</td>
                <td>FSC-C 인증, GRS 30% 이상</td>
              </tr>
              <tr>
                <td>인쇄 방식·색상 수</td>
                <td>인쇄 단가·납기에 직접 영향</td>
                <td>4도 인쇄, CMYK + 별색 1도</td>
              </tr>
              <tr>
                <td>마감 처리</td>
                <td>마감 방식에 따라 단가 차이 큼</td>
                <td>무광 코팅, UV 부분 코팅</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section>
          <h2>3. 납기 일정: 현실적인 타임라인 설정</h2>
          <p>
            납기 정보를 RFQ에 포함하지 않으면 업체는 표준 납기(통상
            4~6주)를 기준으로 견적을 냅니다. 급행 납기가 필요할 경우
            단가가 10~30% 추가되거나 거절될 수 있습니다.
          </p>
          <p>
            <strong>권장 납기 정보 구성:</strong>
          </p>
          <ul>
            <li>
              <strong>희망 입고일:</strong> 절대 데드라인(생산 투입·행사
              일정 기준)
            </li>
            <li>
              <strong>발주 예정일:</strong> 견적 검토 후 발주 예상 시점
            </li>
            <li>
              <strong>반복 발주 주기:</strong> 정기 거래 시 업체의 생산
              스케줄 확보에 도움
            </li>
          </ul>
          <p>
            <strong>주의:</strong> 견적 요청 후 발주까지 2~4주가 소요되는
            점을 감안해 역산하여 RFQ를 발송하세요. 첫 거래는 샘플 제작·승인
            기간이 추가로 1~2주 필요합니다.
          </p>
        </section>

        <section>
          <h2>4. 예산 범위: 공개할수록 견적 정확도가 높아진다</h2>
          <p>
            예산 범위를 공개하는 것을 꺼리는 구매 담당자가 많습니다. 하지만
            예산 범위를 제시하면 업체가 그 범위 안에서 최적 스펙을 제안하므로
            실무적으로 유리합니다.
          </p>
          <p>
            예산을 공개하지 않을 경우, 업체는 보통 <strong>최고 사양
            기준</strong>으로 견적을 냅니다. 이를 토대로 협상하면 오히려
            원하는 품질을 낮춰야 하는 역효과가 발생합니다.
          </p>
          <p>
            <strong>실용 팁:</strong> &ldquo;개당 단가 X원 이하&rdquo; 또는
            &ldquo;월 총 구매액 Y만 원 예산&rdquo; 형태로 범위를 명시하되,
            최저 기준선보다 10~15% 여유를 두고 제시하세요.
          </p>
        </section>

        <section>
          <h2>5. 샘플 요청 조건: 비용과 절차를 미리 확인하라</h2>
          <p>
            양산 발주 전 반드시 <strong>샘플 승인</strong> 단계를 거쳐야
            합니다. RFQ 단계에서 샘플 관련 조건을 함께 확인하세요.
          </p>
          <ul>
            <li>
              <strong>무료 샘플 제공 여부:</strong> 일반적으로 기존 재고
              샘플은 무료, 맞춤 제작 샘플은 유료입니다.
            </li>
            <li>
              <strong>샘플 제작 납기:</strong> 통상 1~2주. 금형 제작이
              필요한 경우 3~4주 추가됩니다.
            </li>
            <li>
              <strong>샘플 비용의 본 발주 상계 여부:</strong> 일정 수량 이상
              발주 시 샘플비 환급 여부를 협의하세요.
            </li>
          </ul>
        </section>

        <section>
          <h2>6. 복수 업체 동시 요청: 최소 3곳, 이상적으로는 5곳</h2>
          <p>
            단일 업체에만 견적을 요청하는 것은 두 가지 리스크를 낳습니다.
            첫째, 단가 기준선이 없어 협상력이 약해집니다. 둘째, 해당
            업체의 생산 차질·폐업 시 대안이 없습니다.
          </p>

          <h3>업체 유형별 장단점</h3>
          <table>
            <thead>
              <tr>
                <th>유형</th>
                <th>장점</th>
                <th>단점</th>
                <th>적합 상황</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>대형 전문 제조사</td>
                <td>안정적 품질·납기, 인증 다수 보유</td>
                <td>MOQ 높음, 소량 발주 불리</td>
                <td>연 발주량 10만 개 이상</td>
              </tr>
              <tr>
                <td>중소형 제조사</td>
                <td>유연한 MOQ, 맞춤 대응 빠름</td>
                <td>인증·설비 한계</td>
                <td>소량·다품종, 신제품 테스트</td>
              </tr>
              <tr>
                <td>종합 유통 업체</td>
                <td>다양한 소재 원스톱 공급</td>
                <td>마진 구조상 단가 높을 수 있음</td>
                <td>품목 다양, 소량 혼합 발주</td>
              </tr>
            </tbody>
          </table>

          <p>
            <Link href="/compare">
              Packlinx 견적 비교 페이지에서 복수 업체를 한 번에 비교하세요 →
            </Link>
          </p>
        </section>

        <section>
          <h2>7. 업체 비교 및 최종 선정 기준</h2>
          <p>
            견적서가 수집되면 단가만으로 비교하는 실수를 피해야 합니다.
            아래 항목을 기준으로 종합 평가표를 작성하세요.
          </p>

          <h3>비교 평가 항목</h3>
          <table>
            <thead>
              <tr>
                <th>항목</th>
                <th>확인 내용</th>
                <th>가중치 (예시)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>단가</td>
                <td>동일 스펙·수량 기준 개당 단가</td>
                <td>30%</td>
              </tr>
              <tr>
                <td>MOQ</td>
                <td>최소 발주 수량이 현실적인가</td>
                <td>15%</td>
              </tr>
              <tr>
                <td>납기</td>
                <td>표준 납기 및 급행 납기 가능 여부</td>
                <td>20%</td>
              </tr>
              <tr>
                <td>품질·인증</td>
                <td>FSC·GRS·ISO 등 필요 인증 보유</td>
                <td>20%</td>
              </tr>
              <tr>
                <td>결제 조건</td>
                <td>선금 비율, 외상 한도, 결제 주기</td>
                <td>10%</td>
              </tr>
              <tr>
                <td>샘플·대응력</td>
                <td>수정 요청 대응 속도 및 샘플 품질</td>
                <td>5%</td>
              </tr>
            </tbody>
          </table>

          <p>
            <strong>선정 후 필수 체크:</strong> 최종 업체와 거래 전 사업자
            등록증·인증서 사본을 수령하고, 계약서(또는 발주서)에 납기
            위반 시 페널티 조항을 포함하세요.
          </p>

          <p>
            <Link href="/compare">
              Packlinx에서 포장재 업체를 비교하고 견적을 요청하세요 →
            </Link>
          </p>
        </section>

        <section>
          <h2>RFQ 체크리스트 요약</h2>
          <table>
            <thead>
              <tr>
                <th>항목</th>
                <th>준비 완료?</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>월 발주량·연 발주량 확정</td>
                <td>☐</td>
              </tr>
              <tr>
                <td>제품 치수(내경 W×D×H) 및 허용 공차 기재</td>
                <td>☐</td>
              </tr>
              <tr>
                <td>소재 우선순위 또는 특수 조건 명시</td>
                <td>☐</td>
              </tr>
              <tr>
                <td>희망 입고일 및 발주 예정일 설정</td>
                <td>☐</td>
              </tr>
              <tr>
                <td>예산 범위 결정 (내부 검토용)</td>
                <td>☐</td>
              </tr>
              <tr>
                <td>3곳 이상 업체 후보 목록 작성</td>
                <td>☐</td>
              </tr>
              <tr>
                <td>샘플 요청 조건 확인</td>
                <td>☐</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section>
          <h2>FAQ</h2>

          <div>
            <h3>
              Q1. 포장재 견적 요청(RFQ)을 보낼 때 가장 먼저 준비해야 할
              정보는 무엇인가요?
            </h3>
            <p>
              수량(월 발주량·연 발주량)과 제품 사이즈(가로·세로·높이)를
              먼저 확정하세요. 이 두 가지가 없으면 업체에서 단가 산출 자체가
              불가능합니다.
            </p>
          </div>

          <div>
            <h3>Q2. 포장재 RFQ에서 소재를 미리 정해야 하나요?</h3>
            <p>
              소재를 확정하지 않아도 됩니다. &lsquo;친환경 소재 우선&rsquo; 또는
              &lsquo;원가 최소화&rsquo; 같은 우선순위를 명시하면 업체가 적합한 소재를
              제안합니다. 단, 식품 접촉 여부나 특수 인증(FSC, GRS 등) 요구가
              있으면 반드시 기재해야 합니다.
            </p>
          </div>

          <div>
            <h3>
              Q3. 포장 업체에 견적을 몇 곳 정도 요청하는 게 적당한가요?
            </h3>
            <p>
              최소 3곳, 이상적으로는 5곳 이상을 권장합니다. 동일 스펙으로
              복수 견적을 받아야 단가 기준선(baseline)을 파악하고 협상력을
              갖출 수 있습니다.
            </p>
          </div>

          <div>
            <h3>Q4. 납기 정보를 RFQ에 포함해야 하는 이유는 무엇인가요?</h3>
            <p>
              납기 일정은 업체의 생산 스케줄과 직결됩니다. 긴급 납기(2주
              이내)는 별도 급행 비용이 붙거나 거절될 수 있으므로, 표준
              납기(4~6주)와 최단 납기(긴급 시)를 함께 명시하면 업체가
              현실적인 조건을 제시합니다.
            </p>
          </div>

          <div>
            <h3>
              Q5. 포장 업체 비교 시 단가 외에 무엇을 봐야 하나요?
            </h3>
            <p>
              MOQ(최소 발주 수량), 납기 준수율, 인증 보유 현황(FSC·ISO 등),
              샘플 제작 가능 여부, 결제 조건(선금 비율)을 단가와 함께
              비교해야 합니다. 단가만 보면 TCO(총소유비용)를 놓칩니다.
            </p>
          </div>
        </section>

        <footer>
          <h2>정리</h2>
          <p>
            포장 업체 견적 요청은 &ldquo;업체에 연락하는 것&rdquo;이 아니라
            &ldquo;비교 가능한 데이터를 수집하는 과정&rdquo;입니다. 수량·사이즈·소재·납기·예산의
            5가지 핵심 정보를 사전에 정리하고, 최소 3곳 이상에 동일한 RFQ를
            발송하면 협상력과 조달 안정성이 동시에 높아집니다.
          </p>
          <p>
            <Link href="/compare">
              Packlinx 견적 비교 — 포장 업체를 한 곳에서 찾고 비교하세요 →
            </Link>
          </p>
          <p>
            <em>
              Packlinx 편집팀 |{" "}
              <Link href="https://packlinx.com">
                패키징 업체 무료 검색 →
              </Link>
            </em>
          </p>
        </footer>
      </main>
    </>
  );
}
