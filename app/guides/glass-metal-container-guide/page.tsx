import type { Metadata } from "next";
import Link from "next/link";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://packlinx.com";
const canonicalUrl = `${siteUrl}/guides/glass-metal-container-guide`;

const title =
  "유리·금속 용기 완전 가이드 — 종류·소재·MOQ·인쇄 옵션 비교 (2026)";
const description =
  "유리 용기(갈색·투명·청색, 병·단지·바이알)와 금속 캔(알루미늄·TFS·양철) 종류 비교, 식품·화장품·의약품별 선택 기준, B2B 구매 결정 비교표, MOQ·커스텀 성형 비용, 슈링크 라벨·직접 인쇄 옵션을 한곳에 정리했습니다.";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: canonicalUrl,
    languages: { "ko-KR": canonicalUrl, "x-default": canonicalUrl },
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

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline:
    "유리·금속 용기 완전 가이드 — 종류·소재·MOQ·인쇄 옵션 비교 (2026)",
  description,
  url: canonicalUrl,
  inLanguage: "ko-KR",
  datePublished: "2026-05-02",
  dateModified: "2026-05-02",
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
    name: "유리 용기 금속 캔",
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "식품용 유리 용기는 어떤 종류가 있나요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "식품용 유리 용기는 투명·갈색·청색 등 색상과 병·단지·바이알 형태로 나뉩니다. 갈색 유리는 차광성이 뛰어나 햇빛에 민감한 음료·소스에 적합합니다. 투명 유리는 내용물 확인이 가능해 잼·피클·드레싱 등에 많이 사용됩니다.",
      },
    },
    {
      "@type": "Question",
      name: "알루미늄 캔과 양철(주석도금강판) 캔의 차이는 무엇인가요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "알루미늄 캔은 가볍고 녹이 슬지 않으며 탄산음료·맥주에 주로 사용됩니다. 양철 캔(TFS)은 더 단단하고 내압성이 높아 통조림·분말식품·음료 대용량 캔에 적합합니다. 알루미늄 캔이 재활용률은 더 높지만 단가는 양철 캔보다 약간 높습니다.",
      },
    },
    {
      "@type": "Question",
      name: "유리 용기 커스텀 성형(몰드) 비용은 얼마나 드나요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "국내 유리 용기 커스텀 몰드 비용은 용기 크기·복잡도에 따라 500만~2,000만 원 수준입니다. 몰드 제작 후 최소 발주량(MOQ)은 보통 5,000~10,000개 이상입니다. 표준 규격 유리 용기를 활용하면 몰드 비용 없이 소량 주문이 가능합니다.",
      },
    },
    {
      "@type": "Question",
      name: "유리 용기는 플라스틱보다 왜 B2B에서 선호되나요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "유리는 화학적으로 비활성이어 내용물 맛·향에 영향을 주지 않으며, 고온 살균(레토르트) 처리가 가능합니다. 프리미엄 브랜드 이미지 구축에 유리하고, 소비자의 친환경·건강 인식과도 맞닿아 있습니다. 단, 중량이 무겁고 파손 위험이 있어 물류 비용이 플라스틱보다 높습니다.",
      },
    },
    {
      "@type": "Question",
      name: "금속 캔에 브랜드 로고를 인쇄하는 방법은 무엇인가요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "금속 캔 인쇄 방식은 캔 표면에 직접 인쇄하는 직접 인쇄(Direct Printing)와 슈링크 라벨(Shrink Sleeve) 적용 두 가지가 있습니다. 직접 인쇄는 대량 발주 시(10,000개+) 단가가 낮고 고급스럽습니다. 슈링크 라벨은 소량도 가능하고 디자인 변경이 유연합니다.",
      },
    },
  ],
};

export default function GlassMetalContainerGuidePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <main>
        <h1>
          유리·금속 용기 완전 가이드 — 종류·소재·MOQ·인쇄 옵션 비교 (2026)
        </h1>
        <p>
          식품·음료·화장품·의약품 구매 담당자가 유리 용기나 금속 캔을 발주할 때
          마주치는 핵심 질문을 정리했습니다. 유리 용기의 색상과 형태 차이, 금속
          캔 소재(알루미늄·TFS·양철)별 특성, 플라스틱 대비 B2B 구매 결정 기준,
          MOQ·커스텀 성형 비용, 라벨·인쇄 옵션까지 구매 담당자가 직접 판단할 수
          있도록 항목별로 정리합니다. 특정 업체를 추천하거나 순위를 매기지
          않으며, 수치는 시장 일반 범위를 기준으로 합니다.
        </p>

        <p>
          업체를 바로 찾으신다면{" "}
          <Link href="/products/container">
            <strong>Packlinx 유리 용기 업체 목록 →</strong>
          </Link>{" "}
          또는{" "}
          <Link href="/products/can">
            <strong>Packlinx 금속 캔 업체 목록 →</strong>
          </Link>
        </p>

        <section>
          <h2>1. 유리 용기 종류 — 색상·형태별 비교</h2>
          <p>
            유리 용기는 <strong>색상</strong>(투명·갈색·청색)과{" "}
            <strong>형태</strong>(병·단지·바이알)의 조합으로 결정됩니다. 내용물의
            광분해 민감도와 브랜드 이미지에 따라 색상을 먼저 선택하고, 충전·밀봉
            방식에 맞는 형태를 고릅니다.
          </p>
          <table>
            <thead>
              <tr>
                <th>구분</th>
                <th>종류</th>
                <th>차광성</th>
                <th>주요 용도</th>
                <th>특징</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td rowSpan={3}>색상</td>
                <td>투명 유리</td>
                <td>낮음</td>
                <td>잼·피클·드레싱·음료수</td>
                <td>내용물 시인성 높음, 소비자 신뢰 확보</td>
              </tr>
              <tr>
                <td>갈색(앰버) 유리</td>
                <td>높음</td>
                <td>맥주·소스·약품·오일</td>
                <td>UV 차단 효과 우수, 광분해 민감 제품 필수</td>
              </tr>
              <tr>
                <td>청색(코발트) 유리</td>
                <td>중간</td>
                <td>프리미엄 음료·화장품·향수</td>
                <td>심미성 강조, 브랜드 차별화 수단</td>
              </tr>
              <tr>
                <td rowSpan={3}>형태</td>
                <td>병(Bottle)</td>
                <td>—</td>
                <td>음료·소스·오일·주류</td>
                <td>크라운 캡·스크류 캡·코르크 마개 등 다양한 밀봉 옵션</td>
              </tr>
              <tr>
                <td>단지(Jar)</td>
                <td>—</td>
                <td>잼·피클·꿀·화장품 크림</td>
                <td>넓은 입구로 내용물 투입·스쿱 사용 용이</td>
              </tr>
              <tr>
                <td>바이알(Vial)</td>
                <td>—</td>
                <td>의약품·향수·에센셜 오일</td>
                <td>소용량 정밀 충전, 고무 마개·알루미늄 크림프 캡 사용</td>
              </tr>
            </tbody>
          </table>
          <p>
            갈색 유리는 파장 450nm 이하의 자외선을 90% 이상 차단해 광분해에
            민감한 음료·오일·의약품 보관에 필수입니다. 투명 유리는 내용물을
            눈으로 확인할 수 있어 소비자 신뢰도가 높지만, 직사광선 노출이
            많은 환경에서는 내용물 변질 위험이 있습니다.
          </p>
          <blockquote>
            <p>
              유리 용기 공급업체를 비교하려면{" "}
              <Link href="/products/container">
                Packlinx 유리 용기 업체 디렉토리
              </Link>
              에서 용량·색상·형태 조건으로 필터링하세요.
            </p>
          </blockquote>
        </section>

        <section>
          <h2>2. 금속 캔·통 종류 — TFS / 알루미늄 / 양철 비교</h2>
          <p>
            금속 용기는 소재에 따라 특성이 크게 달라집니다. 내용물의 무게,
            내압 요건, 재활용 요건, 발주 단가를 고려해 소재를 선택하십시오.
          </p>
          <table>
            <thead>
              <tr>
                <th>소재</th>
                <th>무게</th>
                <th>내압성</th>
                <th>재활용률</th>
                <th>상대 단가</th>
                <th>주요 용도</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>알루미늄 캔</td>
                <td>가벼움</td>
                <td>중간</td>
                <td>매우 높음(~70%)</td>
                <td>중간~높음</td>
                <td>탄산음료·맥주·에너지드링크</td>
              </tr>
              <tr>
                <td>TFS(주석도금강판) 캔</td>
                <td>무거움</td>
                <td>높음</td>
                <td>높음(~60%)</td>
                <td>낮음~중간</td>
                <td>통조림·분말식품·대용량 음료</td>
              </tr>
              <tr>
                <td>양철(Tinplate) 캔</td>
                <td>무거움</td>
                <td>높음</td>
                <td>높음</td>
                <td>낮음</td>
                <td>과자·쿠키 틴·선물 용기·오일</td>
              </tr>
            </tbody>
          </table>
          <p>
            <strong>알루미늄 캔</strong>은 가볍고 녹이 슬지 않으며, 탄산 압력에
            대한 내압성이 충분해 탄산음료·맥주·에너지드링크에 가장 많이
            사용됩니다. 재활용률이 높고 소비자 친환경 인식에 유리하지만, TFS
            대비 단가가 약간 높습니다.
          </p>
          <p>
            <strong>TFS(주석도금강판) 캔</strong>은 강판에 주석 도금을 입혀
            내식성을 높인 소재로, 내압성과 강도가 높아 통조림·분말식품·대용량
            음료 캔에 적합합니다. 알루미늄 대비 단가가 낮아 대량 생산 제품에
            비용 효율적입니다.
          </p>
          <p>
            <strong>양철(Tinplate) 캔</strong>은 TFS와 유사하지만 주석 도금 두께가
            두꺼워 내식성이 더 높습니다. 고급 과자 틴·선물용 용기·오일 캔에
            많이 사용되며, 인쇄와 후가공(에폭시 코팅·UV 코팅)이 용이합니다.
          </p>
        </section>

        <section>
          <h2>3. 식품·화장품·의약품별 적합 용기 선택 기준</h2>
          <p>
            제품 카테고리에 따라 용기 소재 선택의 우선순위가 달라집니다.
            내용물의 화학적 특성, 살균 방식, 규제 요건을 기준으로 판단하십시오.
          </p>
          <table>
            <thead>
              <tr>
                <th>카테고리</th>
                <th>권장 용기</th>
                <th>선택 이유</th>
                <th>주요 규제·인증</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>식품 (음료·소스·잼)</td>
                <td>유리 병/단지, TFS 캔</td>
                <td>
                  화학 비활성, 고온 살균(레토르트) 가능, 내용물 변질 없음
                </td>
                <td>식약처 기구·용기 기준 및 규격</td>
              </tr>
              <tr>
                <td>탄산음료·맥주</td>
                <td>알루미늄 캔, 갈색 유리 병</td>
                <td>내압성, 차광성, 경량 물류</td>
                <td>식약처 기준, 주류법</td>
              </tr>
              <tr>
                <td>화장품 (크림·세럼)</td>
                <td>유리 단지/바이알, 알루미늄 튜브</td>
                <td>
                  화학 비반응성, 프리미엄 이미지, 방부제 효능 유지
                </td>
                <td>화장품법, CGMP</td>
              </tr>
              <tr>
                <td>의약품 (액제·주사제)</td>
                <td>갈색/투명 유리 바이알·앰플</td>
                <td>
                  USP Type I/II 규격 유리, 화학 비활성, 밀봉 신뢰성
                </td>
                <td>약사법, GMP, USP/EP 규격</td>
              </tr>
              <tr>
                <td>분말·건식 식품</td>
                <td>TFS 캔, 양철 캔</td>
                <td>수분 차단, 내압성, 장기 보존 가능</td>
                <td>식약처 기준</td>
              </tr>
            </tbody>
          </table>
          <p>
            의약품용 유리는 미국 약전(USP)·유럽 약전(EP) 기준에 따라 Type I
            (붕규산 유리·최고 내화학성), Type II, Type III 등급으로 나뉩니다.
            주사제·점안제에는 반드시 USP Type I 유리 바이알을 사용하십시오.
          </p>
        </section>

        <section>
          <h2>
            4. 유리 vs 금속 vs 플라스틱 — B2B 구매 결정 비교표
          </h2>
          <p>
            포장재 소재를 최종 결정할 때 무게·비용·차광성·재활용성 네 가지
            기준으로 비교하십시오. B2B 구매에서는 물류비와 MOQ가 총원가에 미치는
            영향이 가장 큽니다.
          </p>
          <table>
            <thead>
              <tr>
                <th>기준</th>
                <th>유리</th>
                <th>금속(알루미늄/TFS)</th>
                <th>플라스틱(PET/PP)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>무게</td>
                <td>무거움 (물류비 높음)</td>
                <td>중간</td>
                <td>가벼움 (물류비 낮음)</td>
              </tr>
              <tr>
                <td>용기 단가</td>
                <td>중간~높음</td>
                <td>중간</td>
                <td>낮음</td>
              </tr>
              <tr>
                <td>차광성</td>
                <td>갈색·청색 우수 / 투명 낮음</td>
                <td>완전 차광</td>
                <td>낮음(불투명 소재 제외)</td>
              </tr>
              <tr>
                <td>재활용성</td>
                <td>높음 (100% 재용융)</td>
                <td>매우 높음 (알루미늄 ~70%)</td>
                <td>중간 (rPET 도입 시 향상)</td>
              </tr>
              <tr>
                <td>내화학성</td>
                <td>매우 높음</td>
                <td>높음(코팅 전제)</td>
                <td>소재별 상이</td>
              </tr>
              <tr>
                <td>파손 위험</td>
                <td>높음 (물류 완충재 필수)</td>
                <td>낮음</td>
                <td>낮음</td>
              </tr>
              <tr>
                <td>프리미엄 이미지</td>
                <td>매우 높음</td>
                <td>높음</td>
                <td>중간</td>
              </tr>
              <tr>
                <td>MOQ(표준 규격)</td>
                <td>500~2,000개</td>
                <td>1,000~5,000개</td>
                <td>500~1,000개</td>
              </tr>
            </tbody>
          </table>
          <p>
            <strong>결정 원칙:</strong> 내용물이 광분해·산화 민감 제품이라면
            금속 캔(완전 차광) 또는 갈색 유리가 적합합니다. 프리미엄 브랜드
            이미지가 중요하다면 유리 용기를 선택하되, 물류비 증가와 파손 완충재
            비용을 총원가에 포함해 계산하십시오. 물류 효율이 최우선이라면
            경량 알루미늄 캔이나 플라스틱 병을 검토하십시오.
          </p>
        </section>

        <section>
          <h2>5. 유리 용기 MOQ 및 커스텀 성형 비용</h2>
          <p>
            유리 용기의 커스텀 형상을 도입하려면 <strong>몰드(금형) 제작</strong>이
            필요합니다. 몰드 비용과 MOQ는 용기 크기·복잡도에 따라 크게
            달라집니다.
          </p>
          <table>
            <thead>
              <tr>
                <th>구분</th>
                <th>몰드 비용</th>
                <th>MOQ</th>
                <th>납기</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>표준 규격(범용 몰드 활용)</td>
                <td>몰드 비용 없음</td>
                <td>500~2,000개</td>
                <td>2~4주</td>
              </tr>
              <tr>
                <td>소형 커스텀 유리 용기(50~200ml)</td>
                <td>500만~800만 원</td>
                <td>5,000~10,000개</td>
                <td>몰드 제작 8~12주 + 양산 2~4주</td>
              </tr>
              <tr>
                <td>중형 커스텀 유리 용기(200~500ml)</td>
                <td>800만~1,500만 원</td>
                <td>5,000~15,000개</td>
                <td>몰드 제작 10~16주 + 양산 2~4주</td>
              </tr>
              <tr>
                <td>대형·복잡 형상(500ml 이상·언더컷)</td>
                <td>1,500만~2,000만 원 이상</td>
                <td>10,000개 이상</td>
                <td>몰드 제작 12~20주 + 양산 4주</td>
              </tr>
            </tbody>
          </table>
          <p>
            <strong>몰드 소유권 및 보관:</strong> 유리 몰드(금형)는 제조사에
            보관되는 경우가 많습니다. 발주처 소유권 귀속 여부와 타 업체 이전
            가능 여부를 계약서에 명시하십시오. 몰드 보관 기간(통상 3~5년)과
            장기 미발주 시 폐기 조건도 사전에 합의하십시오.
          </p>
          <p>
            초도 물량이 적어 커스텀 몰드 회수가 어렵다면, 표준 규격 유리 용기에
            라벨·슬리브 인쇄로 브랜드화하는 방법이 비용 효율적입니다. 발주량이
            안정된 이후 커스텀 몰드를 발주하는 두 단계 전략을 권장합니다.
          </p>
        </section>

        <section>
          <h2>6. 금속 캔 라벨·인쇄 옵션 — 슈링크 라벨 vs 직접 인쇄</h2>
          <p>
            금속 캔에 브랜드를 표현하는 방식은 크게 두 가지입니다. 발주 수량과
            디자인 변경 빈도에 따라 선택하십시오.
          </p>
          <table>
            <thead>
              <tr>
                <th>인쇄 방식</th>
                <th>최소 발주량</th>
                <th>단가</th>
                <th>디자인 변경</th>
                <th>품질·외관</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>직접 인쇄(Direct Printing)</td>
                <td>10,000개 이상 권장</td>
                <td>대량 시 낮음</td>
                <td>변경 시 판(版) 교체 필요</td>
                <td>고급스러움, 내구성 높음</td>
              </tr>
              <tr>
                <td>슈링크 라벨(Shrink Sleeve)</td>
                <td>1,000개~소량 가능</td>
                <td>소량 시 유리, 대량 시 높음</td>
                <td>라벨 교체만으로 변경 가능</td>
                <td>360도 전면 인쇄 가능</td>
              </tr>
            </tbody>
          </table>
          <p>
            <strong>직접 인쇄(Direct Printing)</strong>는 금속 캔 표면에 UV
            오프셋·플렉소·그라비어 방식으로 잉크를 직접 인쇄합니다. 라벨
            비용이 없어 대량 생산 시 단가가 낮고, 고급스러운 외관을 구현할 수
            있습니다. 초기 판 제작비(색상당 약 30~80만 원)가 발생하고, 디자인
            변경 시 판을 다시 제작해야 합니다.
          </p>
          <p>
            <strong>슈링크 라벨(Shrink Sleeve)</strong>은 PVC 또는 PET 수축
            필름에 디자인을 인쇄한 후 캔에 씌워 수축시키는 방식입니다. 소량
            발주도 가능하고 360도 전면 디자인이 가능해 신제품 출시·시즌 한정판에
            유연하게 대응할 수 있습니다. 단, 대량 생산 시 직접 인쇄 대비 단가가
            높고, 재활용 시 라벨 분리가 필요합니다.
          </p>
          <p>
            <strong>추가 후가공 옵션:</strong>
          </p>
          <ul>
            <li>
              <strong>에폭시 내면 코팅</strong> — 캔 내면에 에폭시 수지를
              코팅해 내용물과 금속의 직접 접촉을 차단합니다. 산성 식품(과일
              통조림·음료)에 필수입니다.
            </li>
            <li>
              <strong>UV 광택·무광 코팅</strong> — 외면 코팅으로 프리미엄 외관
              연출 및 스크래치 방지에 사용합니다.
            </li>
            <li>
              <strong>엠보싱</strong> — 캔 표면에 입체 패턴을 넣어 촉감과
              시각적 차별화를 동시에 구현합니다.
            </li>
          </ul>
        </section>

        <section>
          <h2>7. 업체 선정 체크리스트 (5항목)</h2>
          <p>
            유리·금속 용기 업체를 최종 선정하기 전, 아래 5가지 항목을 반드시
            확인하십시오.
          </p>
          <ul>
            <li>
              <strong>식품·의약품 접촉 적합성 서류</strong> — 식품용 유리 용기는
              식약처 기구·용기 기준 적합 시험 성적서를, 의약품용 바이알은 USP
              Type I/II 등급 확인서를 발급할 수 있는 업체인지 확인하십시오.
              금속 캔은 에폭시 내면 코팅 식품 적합성 서류(BPA-free 여부 포함)를
              요청하십시오.
            </li>
            <li>
              <strong>몰드·금형 소유권 및 보관 정책 서면 확인</strong> — 커스텀
              몰드를 제작할 경우 소유권이 발주처에 귀속되는지, 업체 이전 시
              몰드 반출이 가능한지를 계약서에 명시하십시오.
            </li>
            <li>
              <strong>샘플 수령 후 본 발주</strong> — 몰드 완성 후 첫 샘플을
              수령해 치수·색상·밀봉성·내압성을 확인한 뒤 본 발주를 진행하십시오.
              유리 용기는 두께 균일성(편차 ±0.2mm 이내), 금속 캔은 시임(Seam)
              용접 품질을 중점 확인하십시오.
            </li>
            <li>
              <strong>불량 처리 및 교체 기준 명기</strong> — 유리 크랙·기포·두께
              불균일, 금속 캔 찌그러짐·코팅 박리 발생 시 교체 또는 환불 기준을
              계약서에 명기하십시오. 유리 용기는 운송 파손 책임 범위도 함께
              합의하십시오.
            </li>
            <li>
              <strong>납기 이력 및 재발주 단가 조건</strong> — 초도 양산 납기
              이력과 함께, 몰드 유지 관리비·재발주 단가 조건을 사전에
              협의하십시오. 장기 거래를 전제로 재발주 단가 인하 조건을 협상하는
              것이 비용 효율적입니다.
            </li>
          </ul>
        </section>

        <section>
          <h2>8. Packlinx에서 유리·금속 용기 공급업체 견적 비교하기</h2>
          <p>
            Packlinx는 국내 유리·금속 용기 제조사와 구매 담당자를 연결하는 B2B
            패키징 디렉토리입니다. 용기 종류·색상·용량·인증 조건으로 업체를
            필터링하고, 동일 사양으로 여러 업체에 견적을 요청해 비교하는 과정을
            단축할 수 있습니다.
          </p>
          <p>
            <strong>견적 비교 권장 절차:</strong>
          </p>
          <ol>
            <li>
              <Link href="/products/container">
                Packlinx 유리 용기 업체 디렉토리
              </Link>
              또는{" "}
              <Link href="/products/can">
                Packlinx 금속 캔 업체 디렉토리
              </Link>
              에서 소재·용량·인증 조건으로 필터링
            </li>
            <li>
              관심 업체 2~3곳의 프로필에서 보유 몰드·MOQ·납기 이력·인증 서류
              발급 가능 여부 확인
            </li>
            <li>
              동일 사양(소재·용량·색상·MOQ·납기 조건·인쇄 방식)으로 견적 요청
            </li>
            <li>
              몰드 비용 포함 총 초도 발주 비용과 재발주 단가 조건을 함께 비교
            </li>
          </ol>
          <p>
            업체 목록은{" "}
            <Link href="/products/container">Packlinx 유리 용기 업체 목록</Link>
            {" "}또는{" "}
            <Link href="/products/can">Packlinx 금속 캔 업체 목록</Link>에서
            확인하시기 바랍니다.
          </p>
          <p>
            관련 업체 찾기:{" "}
            <a href="https://keywords.packlinx.com/keywords/유리병-제작">유리병 제작 업체 →</a>
            {" "}·{" "}
            <a href="https://keywords.packlinx.com/keywords/캔음료-제작">캔음료 제작 업체 →</a>
          </p>
        </section>

        <section>
          <h2>관련 가이드</h2>
          <ul>
            <li>
              <Link href="/guides/plastic-container-guide">
                플라스틱 용기·병 종류 완전 가이드 — PET·PP·HDPE 소재 선택 + 식약처 기준
              </Link>
            </li>
            <li>
              <Link href="/guides/flexible-packaging-guide">
                연포장재 완전 가이드 — 종류·소재·선택 기준
              </Link>
            </li>
            <li>
              <Link href="/guides/label-printing-guide">
                라벨 인쇄 업체 선정 가이드 — 인쇄 방식·소재·MOQ·납기 비교
              </Link>
            </li>
            <li>
              <Link href="/guides/packaging-accessories-guide">
                포장 부자재 종류 완전 가이드 — 완충재·테이프·충전재 비교
              </Link>
            </li>
          </ul>
        </section>

        <section>
          <h2>자주 묻는 질문 (FAQ)</h2>

          <div>
            <h3>식품용 유리 용기는 어떤 종류가 있나요?</h3>
            <p>
              식품용 유리 용기는 투명·갈색·청색 등 색상과 병·단지·바이알 형태로
              나뉩니다. 갈색 유리는 차광성이 뛰어나 햇빛에 민감한 음료·소스에
              적합합니다. 투명 유리는 내용물 확인이 가능해 잼·피클·드레싱 등에
              많이 사용됩니다.
            </p>
          </div>

          <div>
            <h3>알루미늄 캔과 양철(주석도금강판) 캔의 차이는 무엇인가요?</h3>
            <p>
              알루미늄 캔은 가볍고 녹이 슬지 않으며 탄산음료·맥주에 주로
              사용됩니다. 양철 캔(TFS)은 더 단단하고 내압성이 높아 통조림·분말식품·음료
              대용량 캔에 적합합니다. 알루미늄 캔이 재활용률은 더 높지만 단가는
              양철 캔보다 약간 높습니다.
            </p>
          </div>

          <div>
            <h3>유리 용기 커스텀 성형(몰드) 비용은 얼마나 드나요?</h3>
            <p>
              국내 유리 용기 커스텀 몰드 비용은 용기 크기·복잡도에 따라 500만~2,000만
              원 수준입니다. 몰드 제작 후 최소 발주량(MOQ)은 보통 5,000~10,000개
              이상입니다. 표준 규격 유리 용기를 활용하면 몰드 비용 없이 소량 주문이
              가능합니다.
            </p>
          </div>

          <div>
            <h3>유리 용기는 플라스틱보다 왜 B2B에서 선호되나요?</h3>
            <p>
              유리는 화학적으로 비활성이어 내용물 맛·향에 영향을 주지 않으며,
              고온 살균(레토르트) 처리가 가능합니다. 프리미엄 브랜드 이미지 구축에
              유리하고, 소비자의 친환경·건강 인식과도 맞닿아 있습니다. 단, 중량이
              무겁고 파손 위험이 있어 물류 비용이 플라스틱보다 높습니다.
            </p>
          </div>

          <div>
            <h3>금속 캔에 브랜드 로고를 인쇄하는 방법은 무엇인가요?</h3>
            <p>
              금속 캔 인쇄 방식은 캔 표면에 직접 인쇄하는 직접 인쇄(Direct
              Printing)와 슈링크 라벨(Shrink Sleeve) 적용 두 가지가 있습니다.
              직접 인쇄는 대량 발주 시(10,000개+) 단가가 낮고 고급스럽습니다.
              슈링크 라벨은 소량도 가능하고 디자인 변경이 유연합니다.
            </p>
          </div>
        </section>

        <footer>
          <p>
            <em>
              이 가이드는 Packlinx 콘텐츠팀이 작성하였습니다. 수록된 몰드 비용·MOQ·납기
              수치는 시장 일반 범위를 기준으로 하며, 업체·소재·형상별로 상이할 수
              있습니다. 식품·의약품 용기 관련 규제 기준은 식약처 고시 및 USP/EP
              원문에서 최신 내용을 확인하시기 바랍니다.
            </em>
          </p>
        </footer>
      </main>
    </>
  );
}
