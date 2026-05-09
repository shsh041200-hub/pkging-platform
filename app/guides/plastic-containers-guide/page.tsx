import type { Metadata } from "next";
import Link from "next/link";
import { GuidePageShell } from "@/components/guide/GuidePageShell";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://packlinx.com";
const canonicalUrl = `${siteUrl}/guides/plastic-containers-guide`;

const title =
  "플라스틱 용기·병 완전 가이드 — 종류·소재·선택 기준";
const description =
  "플라스틱 용기·병 종류·소재·식품 안전 기준·업체 선택 체크리스트를 한 곳에 정리했습니다. PET 병, PE·PP·HDPE 용기 비교와 Packlinx 플라스틱 용기 업체 디렉토리.";

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
    "플라스틱 용기·병 완전 가이드 — 종류·소재·업체 선택 기준 (2026년)",
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
  mainEntityOfPage: {
    "@type": "WebPage",
    "@id": canonicalUrl,
  },
  about: {
    "@type": "Thing",
    name: "플라스틱 용기",
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "플라스틱 용기와 유리·금속 용기의 차이는 무엇인가요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "플라스틱 용기는 유리·금속 대비 경량이고 성형 자유도가 높아 다양한 형상 제작이 가능합니다. 파손 위험이 없고 단가가 낮은 것이 장점이지만, 소재에 따라 내열성과 화학 내성이 다르며 식품 접촉 안전성은 소재별로 확인이 필요합니다. 유리는 무취·불투과성이 뛰어나고, 금속(알루미늄·강판)은 차단성과 재활용성이 높습니다.",
      },
    },
    {
      "@type": "Question",
      name: "PET 병·PP 용기·HDPE 통의 차이는 무엇인가요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "PET 병은 투명도가 높고 탄산·음료·생수에 주로 사용됩니다. PP 용기는 내열성이 높아(최대 120℃) 전자레인지 가열과 고온 충전에 적합합니다. HDPE 통은 충격 내성과 화학 내성이 뛰어나 세제·샴푸·공업용 액체 저장에 많이 사용됩니다. PS 용기는 저렴하고 투명해 일회용 컵·도시락에 활용되지만 내열성이 낮습니다.",
      },
    },
    {
      "@type": "Question",
      name: "화장품 용기에 필요한 안전 기준은 무엇인가요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "화장품 용기는 화장품법 제8조 및 식품의약품안전처 고시 「화장품 안전기준 등에 관한 규정」을 준수해야 합니다. ISO 15378(화장품 1차 포장재 GMP)을 보유한 업체와 거래하면 화장품법 적합성을 체계적으로 관리할 수 있습니다. 용기 소재의 내용물 적합성 시험(이행성 시험)과 중금속·환경호르몬 용출 기준을 반드시 확인하세요.",
      },
    },
    {
      "@type": "Question",
      name: "플라스틱 용기 친환경 옵션(rPET, 바이오플라스틱)은 어떻게 선택하나요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "rPET(재활용 PET)는 버진 PET 대비 10~25% 추가 비용으로 EU 수출 포장재 재활용 함량 의무에 대응할 수 있습니다. GRS(Global Recycled Standard) 인증 획득에 3~6개월이 소요됩니다. PLA 등 바이오플라스틱은 산업용 퇴비화 조건에서만 분해되며 비용이 50~100% 이상 높습니다. 식품 용기에 rPET를 사용할 경우 식약처의 재생 원료 이행성 시험을 별도로 확인해야 합니다.",
      },
    },
    {
      "@type": "Question",
      name: "HACCP·ISO 22000·ISO 15378 인증이 용기 업체 선정 시 왜 중요한가요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "HACCP와 ISO 22000은 식품 포장재 생산 위생 관리 체계를 검증하는 인증으로, 식품용 용기 발주 시 필수 확인 항목입니다. ISO 15378은 화장품 1차 포장재 GMP 기준으로 화장품법 적합성의 신호입니다. 인증 보유 업체는 정기 감사를 통해 생산 위생 수준을 유지하므로, 비인증 업체 대비 불량 리스크가 낮습니다.",
      },
    },
  ],
};

export default function PlasticContainersGuidePage() {
  return (
    <GuidePageShell>
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
          플라스틱 용기·병 완전 가이드 — 종류·소재·업체 선택 기준 (2026년)
        </h1>
        <p>
          식품·음료·화장품·생활용품 구매 담당자가 플라스틱 용기·병을 발주할 때
          마주치는 핵심 질문은 같습니다. &ldquo;어떤 종류를 선택해야 하고, 유리·금속과
          무엇이 다르며, 식품위생법·화장품법 기준은 어떻게 맞추는가?&rdquo; 이 가이드는
          PET·PE·PP·HDPE·PS 용기 종류 비교, 소재별 특성, 식품·화장품 안전 기준, 제조
          방식·MOQ, 친환경 옵션, 업체 선택 체크리스트까지 구매 담당자가 직접 판단할 수
          있도록 핵심 기준을 항목별로 정리합니다. 특정 업체를 추천하거나 순위를 매기지
          않으며, 모든 수치는 시장 일반 범위를 기준으로 합니다.
        </p>

        <section>
          <h2>1. 플라스틱 용기·병이란? — 유리·금속과의 차이</h2>
          <p>
            플라스틱 용기·병은 합성 수지를 성형해 만든 용기로, 국내 식품·화장품·생활용품
            포장의 주력 소재입니다. 유리·금속(알루미늄, 강판)과 비교하면 다음과 같은 특징이
            있습니다.
          </p>
          <table>
            <thead>
              <tr>
                <th>항목</th>
                <th>플라스틱</th>
                <th>유리</th>
                <th>금속(알루미늄·강판)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>중량</td>
                <td>가벼움</td>
                <td>무거움</td>
                <td>중간</td>
              </tr>
              <tr>
                <td>성형 자유도</td>
                <td>매우 높음</td>
                <td>낮음</td>
                <td>중간</td>
              </tr>
              <tr>
                <td>파손 위험</td>
                <td>낮음</td>
                <td>높음</td>
                <td>낮음(찌그러짐)</td>
              </tr>
              <tr>
                <td>차단성(산소·수분)</td>
                <td>소재에 따라 다름</td>
                <td>매우 높음</td>
                <td>매우 높음</td>
              </tr>
              <tr>
                <td>재활용성</td>
                <td>소재에 따라 다름</td>
                <td>높음</td>
                <td>높음</td>
              </tr>
              <tr>
                <td>단가(소량 기준)</td>
                <td>낮음~중간</td>
                <td>높음</td>
                <td>중간~높음</td>
              </tr>
              <tr>
                <td>무취·무이행성</td>
                <td>소재에 따라 다름</td>
                <td>매우 높음</td>
                <td>코팅 처리 필요</td>
              </tr>
            </tbody>
          </table>
          <p>
            플라스틱 용기는 경량성과 성형 자유도가 강점이지만, 소재별로 식품·화장품 접촉
            안전성과 내열성이 크게 다릅니다. 내용물의 특성(내열 필요 여부, 화학 반응성,
            유통 기한)과 용도(식품·화장품·공업용)에 따라 소재를 먼저 결정해야 합니다.
          </p>
          <blockquote>
            <p>
              플라스틱 용기 공급업체를 비교하려면{" "}
              <Link href="/plastic-containers">
                Packlinx 플라스틱 용기 업체 디렉토리
              </Link>
              에서 소재·인증 조건으로 필터링하세요.
            </p>
          </blockquote>
        </section>

        <section>
          <h2>
            2. 플라스틱 용기·병 주요 종류 — PET 병·PE 용기·PP 용기·HDPE 통·PS 용기
          </h2>
          <p>
            국내 시장에서 가장 많이 사용되는 5가지 플라스틱 용기 종류를 용도·특성 기준으로
            정리합니다.
          </p>
          <ul>
            <li>
              <strong>PET 병(폴리에틸렌 테레프탈레이트)</strong> — 투명도가 가장 높아
              생수·탄산음료·주스·식용유 병에 광범위하게 사용됩니다. 내열성이 낮아(~70℃)
              고온 충전이 필요한 제품에는 내열 PET(CPET)를 별도로 검토해야 합니다.
              rPET(재활용 PET) 전환이 가장 활성화된 소재이기도 합니다.
            </li>
            <li>
              <strong>PE 용기(폴리에틸렌)</strong> — LDPE(저밀도)와 HDPE(고밀도)로
              나뉩니다. LDPE는 유연성이 높아 스퀴즈 타입 용기, 튜브, 비닐 봉투에 사용됩니다.
              HDPE는 충격 내성과 화학 내성이 뛰어나 우유 병, 세제·샴푸 용기, 공업용 액체
              저장 통에 널리 활용됩니다.
            </li>
            <li>
              <strong>PP 용기(폴리프로필렌)</strong> — 내열성이 높아(~120℃) 전자레인지
              가열과 고온 충전이 가능합니다. 반찬통·도시락·요거트 컵·의약품 용기에 적합하며,
              투명 PP(클리어 PP)를 활용하면 내용물 시인성도 확보할 수 있습니다.
            </li>
            <li>
              <strong>HDPE 통(고밀도 폴리에틸렌)</strong> — 충격 내성, 화학 내성, 내수성이
              뛰어납니다. 세탁세제·공업용 화학품·농약·윤활유 등 고용량 액체 저장에 주로
              사용됩니다. 식품용으로는 식약처 기준 적합 소재이나 투명도가 낮습니다.
            </li>
            <li>
              <strong>PS 용기(폴리스티렌)</strong> — 가볍고 단가가 낮아 일회용 컵·도시락·
              냉장 식품 트레이에 사용됩니다. 내열성이 낮아(~70℃) 전자레인지 사용 불가이며,
              발포 PS(스티로폼)는 완충·보냉 포장재로 별도 활용됩니다.
            </li>
          </ul>
        </section>

        <section>
          <h2>3. 소재별 특성 비교 — PET·PE·PP·HDPE·PS</h2>
          <p>
            용기 소재 선택 시 가장 중요한 기준은{" "}
            <strong>투명도·내열성·화학 내성·식품 접촉 허용 여부·단가</strong>입니다.
          </p>
          <table>
            <thead>
              <tr>
                <th>소재</th>
                <th>투명도</th>
                <th>내열성</th>
                <th>화학 내성</th>
                <th>식약처 식품 접촉 허용</th>
                <th>상대 단가</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>PET</td>
                <td>매우 높음</td>
                <td>낮음(~70℃)</td>
                <td>중간</td>
                <td>허용 (내열 PET 별도)</td>
                <td>낮음~중간</td>
              </tr>
              <tr>
                <td>LDPE</td>
                <td>반투명</td>
                <td>낮음(~60℃)</td>
                <td>낮음</td>
                <td>허용</td>
                <td>낮음</td>
              </tr>
              <tr>
                <td>PP</td>
                <td>반투명~투명</td>
                <td>높음(~120℃)</td>
                <td>높음</td>
                <td>허용</td>
                <td>낮음</td>
              </tr>
              <tr>
                <td>HDPE</td>
                <td>불투명</td>
                <td>중간(~80℃)</td>
                <td>매우 높음</td>
                <td>허용</td>
                <td>낮음</td>
              </tr>
              <tr>
                <td>PS</td>
                <td>높음(일반) / 불투명(발포)</td>
                <td>낮음(~70℃)</td>
                <td>낮음</td>
                <td>허용(내열 등급 한정)</td>
                <td>낮음</td>
              </tr>
            </tbody>
          </table>
          <p>
            소재 선택의 핵심 원칙: <strong>내용물 온도·pH·화학 조성</strong>에 맞는 소재를
            먼저 정한 뒤, 투명도와 단가를 비교하십시오. 산성 내용물(식초·과일 주스)에는
            PET·PP, 알칼리성 세제류에는 HDPE, 고온 충전에는 PP 또는 내열 PET, 투명 진열
            용기에는 PET 또는 투명 PP가 일반적인 선택입니다.
          </p>
        </section>

        <section>
          <h2>
            4. 식품·화장품 안전 기준 — 식품위생법·화장품법·수지 코드(재활용 분류)
          </h2>
          <p>
            플라스틱 용기의 용도가 식품이냐 화장품이냐에 따라 준수해야 할 법령이 다릅니다.
          </p>
          <h3>4-1. 식품 용기 — 식품위생법·식약처 고시</h3>
          <p>
            국내 식품 접촉용 플라스틱 용기는{" "}
            <strong>
              식품의약품안전처 고시 「기구 및 용기·포장의 기준 및 규격」
            </strong>
            을 준수해야 합니다. 발주 전 업체에 아래 서류를 요청하십시오.
          </p>
          <ul>
            <li>
              식품 접촉 소재 적합성 확인서 (공인 시험기관 발급 — KCL, KOTITI 등)
            </li>
            <li>재질 기준 성적서 (중금속, BPA, 프탈레이트계 가소제 함량)</li>
            <li>이행성 시험 성적서 (식품 시뮬란트 조건 포함)</li>
          </ul>
          <p>
            PC(폴리카보네이트) 소재는 비스페놀 A(BPA) 용출 우려로 영·유아용 식품 접촉 용기
            사용이 금지되어 있으며, 일반 성인용 제품에서도 BPA-free 여부 확인이 권장됩니다.
          </p>
          <h3>4-2. 화장품 용기 — 화장품법·ISO 15378</h3>
          <p>
            화장품 1차 포장재(내용물과 직접 접촉하는 용기)는{" "}
            <strong>화장품법 제8조</strong> 및{" "}
            <strong>「화장품 안전기준 등에 관한 규정」</strong>을 준수해야 합니다.
            ISO 15378(화장품 1차 포장재 GMP) 인증을 보유한 업체와 거래하면 법적 적합성을
            체계적으로 관리할 수 있습니다. 용기 소재의 내용물 적합성 시험(이행성 시험)과
            중금속·환경호르몬 기준을 사전에 확인하십시오.
          </p>
          <h3>4-3. 수지 코드(재질 분류 표시)</h3>
          <p>
            국내 포장재 재활용 의무화에 따라 플라스틱 용기에는 재질 분류 표시(수지 코드)가
            필요합니다. 주요 코드는 다음과 같습니다.
          </p>
          <ul>
            <li>
              <strong>1 — PET(PETE)</strong>: 생수·음료 병, rPET 재활용 활성화
            </li>
            <li>
              <strong>2 — HDPE</strong>: 세제·샴푸·우유 병, 재활용 용이
            </li>
            <li>
              <strong>4 — LDPE</strong>: 비닐봉투·스퀴즈 튜브
            </li>
            <li>
              <strong>5 — PP</strong>: 식품 용기·의약품 용기
            </li>
            <li>
              <strong>6 — PS</strong>: 일회용 컵·도시락, 재활용 어려움
            </li>
            <li>
              <strong>7 — 기타(OTHER)</strong>: PC·복합 소재, 재활용 어려움
            </li>
          </ul>
          <p>
            수지 코드 7(기타)에 해당하는 PC 소재는 재활용이 어렵고 BPA 용출 이슈가 있어
            식품·화장품 용기 신규 도입 시 가급적 피하는 것이 권장됩니다.
          </p>
        </section>

        <section>
          <h2>5. 제조 방식과 MOQ — 사출·블로우·진공 성형</h2>
          <p>
            용기 형상과 생산량에 따라 적합한 성형 공법이 다릅니다. 공법 선택은 금형비·MOQ·납기·
            형상 자유도에 직접 영향을 줍니다.
          </p>
          <table>
            <thead>
              <tr>
                <th>공법</th>
                <th>적합 MOQ</th>
                <th>납기(금형 완성 후)</th>
                <th>금형비 범위</th>
                <th>형상 자유도</th>
                <th>대표 용기</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>사출성형(Injection Molding)</td>
                <td>3,000~10,000개 이상</td>
                <td>2~4주</td>
                <td>300~1,500만 원</td>
                <td>높음</td>
                <td>화장품 캡·의약품 용기·PP 반찬통</td>
              </tr>
              <tr>
                <td>블로우성형(Blow Molding)</td>
                <td>3,000~5,000개 이상</td>
                <td>2~3주</td>
                <td>200~500만 원</td>
                <td>중간</td>
                <td>PET 음료 병·HDPE 샴푸 병</td>
              </tr>
              <tr>
                <td>진공성형(Vacuum Forming)</td>
                <td>500~2,000개 이상</td>
                <td>1~2주</td>
                <td>50~300만 원</td>
                <td>낮음</td>
                <td>식품 트레이·블리스터 팩</td>
              </tr>
            </tbody>
          </table>
          <p>
            <strong>사출성형</strong>은 복잡한 형상의 뚜껑·캡·나사산·힌지를 일체로 성형할 수
            있어 화장품 용기·의약품 용기에 가장 많이 쓰입니다. 금형비가 높지만 양산 단가가
            낮고 치수 정밀도가 우수합니다.
          </p>
          <p>
            <strong>블로우성형</strong>은 속이 빈 병·용기를 빠르게 생산하는 공법으로, PET 음료
            병과 HDPE 샴푸·세제 병에 주로 사용됩니다. 사출 대비 금형비가 낮고 경량 용기를
            대량 생산하기에 적합합니다.
          </p>
          <p>
            <strong>진공성형</strong>은 시트를 금형 위에서 진공 흡착해 성형하는 방식으로
            금형비가 낮고 소량 제작이 가능합니다. 트레이·블리스터 팩처럼 단순한 형상에 적합하며,
            벽 두께 균일성과 복잡한 형상 구현에는 제한이 있습니다.
          </p>
          <p>
            소량 발주가 필요한 경우: 진공성형(소량 트레이) 또는 표준 범용 금형을 보유한 업체의
            기존 금형을 활용하면 금형비 없이 500~1,000개 단위 발주가 가능합니다.
          </p>
        </section>

        <section>
          <h2>6. 친환경 플라스틱 용기 — rPET·바이오플라스틱·단일 소재</h2>
          <p>
            ESG 경영과 자원재활용법 포장재 분리배출 의무화, EU 포장재 규정(PPWR)에 따라
            친환경 플라스틱 용기 수요가 증가하고 있습니다.
          </p>
          <ul>
            <li>
              <strong>rPET(재활용 PET)</strong> — 버진 PET 대비 10~25% 추가 비용으로 EU
              포장재 재활용 함량 의무에 대응할 수 있습니다. GRS(Global Recycled Standard)
              인증 획득에 3~6개월이 소요됩니다. 식품 용기에 사용 시 식약처의 재생 원료
              이행성 시험을 별도로 확인해야 합니다.
            </li>
            <li>
              <strong>바이오플라스틱(PLA 등)</strong> — 버진 소재 대비 비용이 50~100% 이상
              상승합니다. 산업용 퇴비화(industrial composting) 조건에서만 분해되며, 일반
              가정 매립·소각 환경에서는 분해 속도 차이가 크지 않습니다. 환경부
              친환경마크(EL724) 인증 여부를 확인하십시오.
            </li>
            <li>
              <strong>단일 소재(Mono-material) 용기</strong> — PP 또는 HDPE 단일 소재로
              용기와 뚜껑을 통일하면 재활용률이 높아집니다. 복합 소재 결합 구조를 피해
              분리배출 용이성을 높이는 방향으로 제품 설계를 검토하십시오.
            </li>
            <li>
              <strong>경량화 설계</strong> — 동일 소재 내에서 벽 두께를 줄여 플라스틱 사용량을
              감소시키는 방법입니다. 구조 강도와 스택킹(적층) 내구성을 유지하면서 중량을
              줄일 수 있으며, 물류비 절감 효과도 병행됩니다.
            </li>
          </ul>
        </section>

        <section>
          <h2>7. 업체 선택 체크리스트 — HACCP·ISO 22000·ISO 15378</h2>
          <p>
            플라스틱 용기·병 업체를 최종 선정하기 전, 아래 항목을 반드시 확인하십시오.
          </p>
          <ul>
            <li>
              <strong>인증 확인 — HACCP·ISO 22000(식품용)·ISO 15378(화장품용)</strong> —
              식품 포장재라면 HACCP 또는 ISO 22000 인증 보유 업체를 우선 검토하십시오.
              화장품 1차 포장재라면 ISO 15378(화장품 포장재 GMP) 인증 여부를 확인하십시오.
              인증이 없는 업체와 거래할 경우 식약처·화장품법 위반 리스크가 높아집니다.
            </li>
            <li>
              <strong>식품·화장품 접촉 적합성 서류 발급 가능 여부</strong> — 공인 시험기관
              발급 이행성 시험 성적서, 재질 기준 성적서를 제공할 수 있는 업체인지 사전에
              확인하십시오. 서류 제공 불가 업체와의 거래는 법적 리스크가 있습니다.
            </li>
            <li>
              <strong>금형 소유권 및 보관 정책 서면 확인</strong> — 금형 제작 후 소유권이
              발주처(구매자)에 귀속되는지, 업체 이전 시 금형 반출이 가능한지 계약서에
              명시하십시오. 금형 보관 기간(통상 3~5년)과 폐기 조건도 사전에 합의하십시오.
            </li>
            <li>
              <strong>샘플(T1) 수령 후 본 발주</strong> — 금형 완성 후 첫 샘플(T1 샘플)을
              수령해 치수·외관·소재 적합성을 확인한 뒤 본 발주를 진행하십시오. T1 샘플
              승인 없이 양산에 들어가면 불량 로트 전체 교체 비용이 발생할 수 있습니다.
            </li>
            <li>
              <strong>불량 처리·납기 이력 서면 확인</strong> — 치수 불량, 크랙, 색상 차이,
              실링 불량 발생 시 교체 또는 환불 기준을 계약서에 명기하십시오. 재발주 납기
              이력과 재발주 단가 조건(금형 유지 관리비 포함)을 사전에 협의하십시오.
            </li>
          </ul>
        </section>

        <section>
          <h2>8. Packlinx에서 플라스틱 용기 업체 찾기</h2>
          <p>
            Packlinx는 국내 플라스틱 용기·병 제조사와 구매 담당자를 연결하는 B2B 패키징
            디렉토리입니다. 소재·성형 공법·식품 안전 인증·지역 조건으로 업체를 필터링하고,
            동일 사양으로 여러 업체에 견적을 요청해 비교하는 과정을 단축할 수 있습니다.
          </p>
          <p>
            <strong>견적 비교 권장 절차:</strong>
          </p>
          <ol>
            <li>
              <Link href="/plastic-containers">
                Packlinx 플라스틱 용기 업체 디렉토리
              </Link>
              에서 소재(PET·PP·HDPE 등)·성형 공법·인증(HACCP/ISO 22000/ISO 15378)으로
              필터링
            </li>
            <li>
              관심 업체 2~3곳의 프로필에서 생산 가능 소재, 금형 보유 현황, MOQ, 납기 이력
              확인
            </li>
            <li>
              동일 사양(소재·공법·용량·MOQ·납기·인증 조건)으로 견적 요청
            </li>
            <li>
              금형비 포함 총 초도 발주 비용과 재발주 단가 조건을 함께 비교
            </li>
          </ol>
          <p>
            업체 목록은{" "}
            <Link href="/plastic-containers">
              Packlinx 플라스틱 용기 업체 목록
            </Link>
            에서 확인하시기 바랍니다.
          </p>
          <p>
            관련 포장재 가이드:{" "}
            <Link href="/guides/flexible-packaging-guide">
              연포장재 완전 가이드
            </Link>
            ,{" "}
            <Link href="/guides/label-printing-guide">
              라벨 인쇄 업체 선정 가이드
            </Link>
          </p>
        </section>

        <section>
          <h2>자주 묻는 질문 (FAQ)</h2>

          <div>
            <h3>플라스틱 용기와 유리·금속 용기의 차이는 무엇인가요?</h3>
            <p>
              플라스틱 용기는 유리·금속 대비 경량이고 성형 자유도가 높아 다양한 형상 제작이
              가능합니다. 파손 위험이 없고 단가가 낮은 것이 장점이지만, 소재에 따라 내열성과
              화학 내성이 다르며 식품 접촉 안전성은 소재별로 확인이 필요합니다. 유리는
              무취·불투과성이 뛰어나고, 금속(알루미늄·강판)은 차단성과 재활용성이 높습니다.
            </p>
          </div>

          <div>
            <h3>PET 병·PP 용기·HDPE 통의 차이는 무엇인가요?</h3>
            <p>
              PET 병은 투명도가 높고 탄산·음료·생수에 주로 사용됩니다. PP 용기는 내열성이
              높아(최대 120℃) 전자레인지 가열과 고온 충전에 적합합니다. HDPE 통은 충격
              내성과 화학 내성이 뛰어나 세제·샴푸·공업용 액체 저장에 많이 사용됩니다.
              PS 용기는 저렴하고 투명해 일회용 컵·도시락에 활용되지만 내열성이 낮습니다.
            </p>
          </div>

          <div>
            <h3>화장품 용기에 필요한 안전 기준은 무엇인가요?</h3>
            <p>
              화장품 용기는 화장품법 제8조 및 식품의약품안전처 고시 「화장품 안전기준 등에
              관한 규정」을 준수해야 합니다. ISO 15378(화장품 1차 포장재 GMP)을 보유한
              업체와 거래하면 화장품법 적합성을 체계적으로 관리할 수 있습니다. 용기 소재의
              내용물 적합성 시험(이행성 시험)과 중금속·환경호르몬 용출 기준을 반드시
              확인하세요.
            </p>
          </div>

          <div>
            <h3>
              플라스틱 용기 친환경 옵션(rPET, 바이오플라스틱)은 어떻게 선택하나요?
            </h3>
            <p>
              rPET(재활용 PET)는 버진 PET 대비 10~25% 추가 비용으로 EU 수출 포장재 재활용
              함량 의무에 대응할 수 있습니다. GRS 인증 획득에 3~6개월이 소요됩니다.
              PLA 등 바이오플라스틱은 산업용 퇴비화 조건에서만 분해되며 비용이 50~100%
              이상 높습니다. 식품 용기에 rPET를 사용할 경우 식약처의 재생 원료 이행성
              시험을 별도로 확인해야 합니다.
            </p>
          </div>

          <div>
            <h3>
              HACCP·ISO 22000·ISO 15378 인증이 용기 업체 선정 시 왜 중요한가요?
            </h3>
            <p>
              HACCP와 ISO 22000은 식품 포장재 생산 위생 관리 체계를 검증하는 인증으로,
              식품용 용기 발주 시 필수 확인 항목입니다. ISO 15378은 화장품 1차 포장재
              GMP 기준으로 화장품법 적합성의 신호입니다. 인증 보유 업체는 정기 감사를
              통해 생산 위생 수준을 유지하므로, 비인증 업체 대비 불량 리스크가 낮습니다.
            </p>
          </div>
        </section>

        <footer>
          <p>
            <em>
              이 가이드는 Packlinx 콘텐츠팀이 작성하였습니다. 수록된 금형비·단가·MOQ·납기
              수치는 시장 일반 범위를 기준으로 하며, 업체·소재·형상별로 상이할 수 있습니다.
              식품 안전 관련 기준은 식약처 고시 「기구 및 용기·포장의 기준 및 규격」을,
              화장품 관련 기준은 화장품법 및 관련 고시를 참고하였으며, 최신 규정은 해당
              공식 원문에서 확인하시기 바랍니다.
            </em>
          </p>
        </footer>
      </main>
    </GuidePageShell>
  );
}
