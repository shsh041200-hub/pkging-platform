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
const canonicalUrl = `${siteUrl}/guides/electronics-packaging-design`;

const title = "전자제품 패키징 디자인 가이드 — ESD 방지·완충재·인증 마크 (2026)";
const description =
  "전자제품 패키징의 핵심인 ESD(정전기 방지) 소재 선택, EPE·EPP 완충재 비교, KC·CE·FCC 인증 마크 표기 기준, ISTA·ASTM 낙하 테스트 계획을 B2B 구매 담당자를 위해 정리했습니다.";

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
    name: "전자제품 패키징",
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "전자제품 패키징 설계 시 가장 중요한 기준은 무엇인가요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "낙하 충격 흡수 성능과 ESD 방지가 가장 중요합니다. ISTA 또는 ASTM 기준에 따른 낙하·압축·진동 테스트를 통해 패키징 적합성을 검증하는 것이 권장됩니다.",
      },
    },
    {
      "@type": "Question",
      name: "EPE와 EPP 완충재 중 어느 것이 더 적합한가요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "EPE는 유연성이 높아 형상이 복잡한 제품에, EPP는 복원력이 뛰어나 반복 재사용이 필요한 B2B 리패키징에 적합합니다. 제품 무게와 취약 부위를 기준으로 선택하세요.",
      },
    },
    {
      "@type": "Question",
      name: "KC 인증 마크를 외박스에 표기해야 하나요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "KC 인증 마크 부착 의무는 제품 본체에 있으며, 외박스 표기 여부는 제품별 고시를 확인하는 것이 필요합니다. 인증 마크 보유 여부는 제조사 또는 수입업자에서 확인하세요.",
      },
    },
    {
      "@type": "Question",
      name: "글로벌 배송을 위한 전자제품 패키징 등급은 어떻게 선택하나요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "ISTA 2A(멀티 기후·항공 화물용) 또는 3A(완전한 유통 사이클 시뮬레이션)를 목표로 설계하면 국내외 유통 대응 범위가 넓어집니다. 항공 운송에는 배터리 관련 IATA 위험물 규정도 함께 확인하세요.",
      },
    },
  ],
};

// ─── v1 slot data (PACAA-449 Batch 3 Post-Legal) ──────────────────────────────

const slotTldr = [
  { bold: "전자제품 패키징은 정전기 방지(ESD)와 충격 흡수가 핵심 설계 요소입니다.", text: "" },
  { bold: "KC·CE·FCC", text: " 등 안전 인증 마크 부착 요건은 제조사 및 수입업자가 보유 여부를 확인해야 합니다." },
  { bold: "내장재 선택(PE폼·EPE·EPP·클램쉘)은", text: " 제품 무게·취약 부위·낙하 높이 기준으로 결정하세요." },
];

const slotFaq = [
  {
    question: "전자제품 패키징 설계 시 가장 중요한 기준은 무엇인가요?",
    answer: "낙하 충격 흡수 성능과 ESD 방지가 가장 중요합니다. ISTA 또는 ASTM 기준에 따른 낙하·압축·진동 테스트를 통해 패키징 적합성을 검증하는 것이 권장됩니다.",
  },
  {
    question: "EPE와 EPP 완충재 중 어느 것이 더 적합한가요?",
    answer: "EPE는 유연성이 높아 형상이 복잡한 제품에, EPP는 복원력이 뛰어나 반복 재사용이 필요한 B2B 리패키징에 적합합니다. 제품 무게와 취약 부위를 기준으로 선택하세요.",
  },
  {
    question: "KC 인증 마크를 외박스에 표기해야 하나요?",
    answer: "KC 인증 마크 부착 의무는 제품 본체에 있으며, 외박스 표기 여부는 제품별 고시를 확인하는 것이 필요합니다. 인증 마크 보유 여부는 제조사 또는 수입업자에서 확인하세요.",
  },
  {
    question: "글로벌 배송을 위한 전자제품 패키징 등급은 어떻게 선택하나요?",
    answer: "ISTA 2A(멀티 기후·항공 화물용) 또는 3A(완전한 유통 사이클 시뮬레이션)를 목표로 설계하면 국내외 유통 대응 범위가 넓어집니다. 항공 운송에는 배터리 관련 IATA 위험물 규정도 함께 확인하세요.",
  },
];

export default function ElectronicsPackagingDesignPage() {
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
        tag="전자제품 · ESD·완충재"
        title="전자제품 패키징 디자인 가이드 — ESD 방지·완충재·인증 마크 (2026년)"
        dateLabel="2026-05 업데이트"
        readTime="6분 읽기"
        category="산업별"
        categoryHref="/guides"
        tldr={slotTldr}
      />
      <div
        className="max-w-[1180px] mx-auto"
        style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: "48px", padding: "40px 24px 80px" }}
      >
        <article style={{ fontSize: "17px", lineHeight: "1.78", color: "var(--g-ink-2)", maxWidth: "760px" }}>
          <GuideCallout variant="info" title="낙하 높이 기반 완충재 설계">
            <p>완충재 두께는 낙하 높이별 G값(충격 가속도) 테스트를 기반으로 설계하면 운송 중 클레임을 줄일 수 있습니다.</p>
          </GuideCallout>
          <GuideCallout variant="warn" title="ESD 소재 미적용 시 부품 손상 위험">
            <p>ESD(정전기 방지) 포장 소재 미적용 시 반도체·PCB 손상이 발생할 수 있습니다. 민감 부품에는 반드시 방전 소재(핑크 폴리백, 실드백)를 사용하세요.</p>
          </GuideCallout>
          <GuideCallout variant="tip" title="인증 마크 표기 위치 설계 초기 결정">
            <p>인증 마크(KC·CE·FCC) 인쇄는 제품 본체에 부착되는 경우도 많으므로, 외박스 중복 표기 여부를 설계 초기에 결정하면 오표기 리스크를 줄일 수 있습니다.</p>
          </GuideCallout>
          <GuideChecklist
            title="전자제품 패키징 발주 전 확정 항목"
            items={[
              "제품 취약 부위(스크린·커넥터·배터리) 기준 내장재 충격 흡수 구조 설계",
              "ESD 민감 부품 해당 여부 확인 및 방전 소재 적용 계획 수립",
              "KC·CE·FCC 등 인증 마크 보유 여부를 제조사에서 확인하고 표기 위치 결정",
              "낙하 테스트(ISTA 1A 또는 ASTM D5276 기준) 및 진동 테스트 계획 수립",
              "유통 경로(항공·해운·국내 택배)별 포장 등급 및 라벨링 요건 파악",
            ]}
          />

          <p>
            전자제품 패키징은 단순한 박스 설계가 아닙니다. 반도체·디스플레이·배터리 등
            민감 부품을 정전기와 물리적 충격 모두에서 보호해야 하며, 글로벌 유통을 위한
            인증 마크 표기와 물류 테스트 기준도 충족해야 합니다. 이 가이드는 구매 담당자가
            전자제품 패키징 발주 시 핵심 요소를 스스로 판단할 수 있도록 정리합니다.
          </p>
          <p>
            전자제품 포장 업체를 바로 찾으신다면{" "}
            <Link href="/products/electronics-packaging">
              <strong>Packlinx 전자제품 포장 업체 목록 →</strong>
            </Link>
          </p>

          <section>
            <h2>1. ESD(정전기 방지) 포장 소재 — 종류와 선택 기준</h2>
            <p>
              정전기(ESD, Electrostatic Discharge)는 반도체·PCB·디스플레이 등 전자 부품에
              눈에 보이지 않는 손상을 입힐 수 있습니다. ESD 민감도에 따라 올바른 포장 소재를
              선택하십시오.
            </p>
            <table>
              <thead>
                <tr>
                  <th>소재 종류</th>
                  <th>표면 저항</th>
                  <th>용도</th>
                  <th>특징</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>핑크 폴리백 (정전기 방지)</td>
                  <td>10⁹~10¹¹ Ω</td>
                  <td>PCB, 일반 부품</td>
                  <td>정전기 발생 억제, 외부 ESD로부터 차폐 없음</td>
                </tr>
                <tr>
                  <td>실드백 (차폐 백)</td>
                  <td>10⁶~10⁸ Ω</td>
                  <td>반도체, 민감 IC</td>
                  <td>파라데이 케이지 효과로 외부 ESD 차폐</td>
                </tr>
                <tr>
                  <td>ESD 폼 (도전성 폼)</td>
                  <td>10³~10⁵ Ω</td>
                  <td>커넥터, 리드가 있는 부품</td>
                  <td>부품 핀 손상 방지, 커스텀 성형 가능</td>
                </tr>
                <tr>
                  <td>ESD 트레이 (도전성 플라스틱)</td>
                  <td>10⁴~10⁶ Ω</td>
                  <td>IC 칩, 웨이퍼 캐리어</td>
                  <td>대량 부품 정렬 수납, 재사용 가능</td>
                </tr>
                <tr>
                  <td>일반 골판지 박스</td>
                  <td>10¹² Ω 이상</td>
                  <td>외박스 (ESD 소재 내장 필요)</td>
                  <td>단독으로는 ESD 보호 불가</td>
                </tr>
              </tbody>
            </table>
            <p>
              <strong>중요:</strong> 일반 골판지 외박스 안에 ESD 소재로 2중 포장하는 것이 기본입니다.
              실드백에 부품을 넣은 뒤 ESD 폼으로 고정하고, 외박스 안에 수납하는 구조를 권장합니다.
            </p>
            <blockquote>
              <p>
                전자제품 포장 업체를 비교하려면{" "}
                <Link href="/products/electronics-packaging">Packlinx 전자제품 포장 업체 디렉토리</Link>에서
                ESD 인증·소재 조건으로 필터링하세요.
              </p>
            </blockquote>
          </section>

          <section>
            <h2>2. 완충재 종류별 특성 비교 — EPE·EPP·EVA·클램쉘</h2>
            <p>
              완충재는 낙하 충격, 진동, 압축력으로부터 제품을 보호합니다.
              제품 무게, 취약 부위, 재사용 여부를 기준으로 소재를 선택하십시오.
            </p>
            <table>
              <thead>
                <tr>
                  <th>소재</th>
                  <th>충격흡수력</th>
                  <th>복원력</th>
                  <th>재사용</th>
                  <th>ESD 결합</th>
                  <th>상대 단가</th>
                  <th>주요 용도</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>EPE 폼 (발포 폴리에틸렌)</td>
                  <td>높음</td>
                  <td>중간</td>
                  <td>제한적</td>
                  <td>ESD 폼으로 대체</td>
                  <td>낮음</td>
                  <td>소비자 전자, 스마트폰</td>
                </tr>
                <tr>
                  <td>EPP 폼 (발포 폴리프로필렌)</td>
                  <td>높음</td>
                  <td>매우 높음</td>
                  <td>가능 (반복)</td>
                  <td>ESD 폼으로 대체</td>
                  <td>중간</td>
                  <td>B2B 리패키징, 산업용 장비</td>
                </tr>
                <tr>
                  <td>EVA 폼</td>
                  <td>매우 높음</td>
                  <td>높음</td>
                  <td>가능</td>
                  <td>ESD EVA 가능</td>
                  <td>중간~높음</td>
                  <td>의료기기, 고정밀 계측기</td>
                </tr>
                <tr>
                  <td>EPS (스티로폼)</td>
                  <td>중간</td>
                  <td>낮음 (1회성)</td>
                  <td>불가</td>
                  <td>불가</td>
                  <td>낮음</td>
                  <td>대형 가전 (환경 규제 강화 추세)</td>
                </tr>
                <tr>
                  <td>종이 허니컴 인서트</td>
                  <td>중간</td>
                  <td>낮음</td>
                  <td>제한적</td>
                  <td>불가</td>
                  <td>중간</td>
                  <td>친환경 요구 제품, 소형 전자</td>
                </tr>
                <tr>
                  <td>클램쉘 (PET 투명 성형)</td>
                  <td>낮음</td>
                  <td>—</td>
                  <td>제한적</td>
                  <td>불가</td>
                  <td>중간</td>
                  <td>소매 진열 전시, USB·배터리</td>
                </tr>
              </tbody>
            </table>
            <p>
              <strong>EPP와 EPE의 선택 기준:</strong> EPP는 반복 압축 후 형태 복원력이 높아
              B2B 제품의 반납·재포장 사이클이 있는 경우에 비용 효율적입니다. EPE는 단가가 낮고
              성형이 쉬워 소비자용 일회성 포장에 더 적합합니다.
            </p>
          </section>

          <section>
            <h2>3. 인증 마크 표기 — KC·CE·FCC 패키징 적용 기준</h2>
            <p>
              전자제품 안전 인증 마크의 표기 의무와 위치는 제품 카테고리와 유통 국가에 따라
              다릅니다. 패키징 설계 전에 다음 사항을 확인하십시오.
            </p>
            <table>
              <thead>
                <tr>
                  <th>인증 마크</th>
                  <th>적용 국가/지역</th>
                  <th>의무 표기 위치</th>
                  <th>외박스 표기 여부</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>KC (한국)</td>
                  <td>대한민국</td>
                  <td>제품 본체 (원칙)</td>
                  <td>제품별 고시 확인 필요</td>
                </tr>
                <tr>
                  <td>CE (EU)</td>
                  <td>유럽연합</td>
                  <td>제품 본체</td>
                  <td>권장 (포장 및 설명서 포함)</td>
                </tr>
                <tr>
                  <td>FCC (미국)</td>
                  <td>미국</td>
                  <td>제품 본체 또는 배터리</td>
                  <td>포장에 FCC ID 표기 권장</td>
                </tr>
                <tr>
                  <td>UKCA (영국)</td>
                  <td>영국</td>
                  <td>제품 본체</td>
                  <td>CE와 별도 표기 필요</td>
                </tr>
              </tbody>
            </table>
            <p>
              KC 마크의 경우, 안전확인 대상 전기용품에 해당하면 KC 마크와 인증 번호를 제품 본체에
              부착해야 합니다. 외박스 중복 표기는 의무는 아니나, 유통업체나 수입업체에서 요구하는
              경우가 많습니다. <strong>인증 마크 보유 여부는 반드시 제조사 또는 수입업자가 확인해야 하며,
              패키징 업체가 대신 판단할 수 없습니다.</strong>
            </p>
          </section>

          <section>
            <h2>4. 낙하·진동 테스트 기준 — ISTA·ASTM 적용 가이드</h2>
            <p>
              전자제품 패키징은 출하 전 물리적 테스트를 통해 유통 중 파손 리스크를 검증합니다.
              대표적인 기준은 ISTA(국제안전운송협회)와 ASTM D 표준입니다.
            </p>
            <table>
              <thead>
                <tr>
                  <th>테스트 기준</th>
                  <th>시험 범위</th>
                  <th>적용 상황</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>ISTA 1A</td>
                  <td>낙하, 충격, 진동 (기본)</td>
                  <td>국내 택배 유통 기본 검증</td>
                </tr>
                <tr>
                  <td>ISTA 2A</td>
                  <td>기후 사이클 + 낙하·진동 복합</td>
                  <td>항공 화물, 국제 유통</td>
                </tr>
                <tr>
                  <td>ISTA 3A</td>
                  <td>전체 유통 사이클 시뮬레이션</td>
                  <td>글로벌 유통 종합 검증</td>
                </tr>
                <tr>
                  <td>ASTM D4169</td>
                  <td>다중 유통 환경 사이클</td>
                  <td>미국 시장 표준, ISTA 동급</td>
                </tr>
                <tr>
                  <td>ASTM D5276</td>
                  <td>낙하 테스트 단일</td>
                  <td>낙하 성능 집중 검증</td>
                </tr>
              </tbody>
            </table>
            <p>
              낙하 높이는 제품 무게에 따라 달라집니다. 일반적으로 2kg 이하 소형 전자제품은
              최저 낙하 높이 76cm(30인치) 이상에서 테스트합니다. 완충재 두께 설계 시
              내용물의 G값(허용 충격 가속도)을 먼저 확인하고, 그에 맞는 완충재 두께를
              계산합니다.
            </p>
            <blockquote>
              <p>
                골판지 외박스 강도 규격 비교는{" "}
                <Link href="/guides/corrugated-flute-types">골판지 플루트 종류 가이드</Link>에서 확인하세요.
              </p>
            </blockquote>
          </section>

          <section>
            <h2>5. 유통 경로별 패키징 설계 — 택배·화물·항공</h2>
            <p>
              전자제품이 거치는 유통 경로에 따라 패키징 등급과 라벨링 요건이 달라집니다.
              수출 제품의 경우 항공 위험물 규정(IATA)도 함께 확인해야 합니다.
            </p>
            <table>
              <thead>
                <tr>
                  <th>유통 경로</th>
                  <th>권장 테스트</th>
                  <th>추가 라벨링</th>
                  <th>주요 완충재</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>국내 택배 (B2C)</td>
                  <td>ISTA 1A</td>
                  <td>취급 주의 스티커</td>
                  <td>EPE 인서트 + 에어캡</td>
                </tr>
                <tr>
                  <td>B2B 화물 (팔레트)</td>
                  <td>ISTA 2B</td>
                  <td>스트레치 필름, 하역 방향 표기</td>
                  <td>EPP 인서트, 코너 보드</td>
                </tr>
                <tr>
                  <td>항공 화물 (국제)</td>
                  <td>ISTA 2A + IATA 위험물</td>
                  <td>배터리 경고 라벨 (해당 시)</td>
                  <td>EPE·EPP, 기후 차폐 비닐</td>
                </tr>
                <tr>
                  <td>해상 컨테이너 (수출)</td>
                  <td>ISTA 3A</td>
                  <td>방습 실리카겔, 습도 인디케이터</td>
                  <td>방습 포장 + EPP</td>
                </tr>
              </tbody>
            </table>
            <p>
              리튬 배터리가 포함된 제품을 항공 운송할 경우 IATA 위험물 규정(Dangerous Goods
              Regulations)의 배터리 용량·포장 요건·라벨링 기준을 반드시 확인해야 합니다.
              위반 시 항공사 접수 거부 또는 벌칙이 부과될 수 있습니다.
            </p>
          </section>

          <section>
            <h2>6. 업체 선정 체크리스트 (5항목)</h2>
            <p>
              전자제품 패키징 업체를 최종 선정하기 전 다음 다섯 가지를 확인하십시오.
            </p>
            <ol>
              <li>
                <strong>ESD 소재 공급 능력</strong> — 핑크 폴리백, 실드백, ESD 폼·트레이 등
                필요한 ESD 소재를 직접 공급하거나 검증된 소재로 사용하는 업체인지 확인합니다.
              </li>
              <li>
                <strong>낙하·진동 테스트 지원</strong> — ISTA 또는 ASTM 기준 테스트를 자체 또는
                공인 시험 기관과 연계해 수행할 수 있는 업체를 선호합니다.
              </li>
              <li>
                <strong>커스텀 인서트 성형 능력</strong> — EPE·EPP·EVA 인서트를 제품 형상에 맞게
                CNC 성형 또는 몰드 제작할 수 있는 업체인지 확인합니다. 몰드 비용과 MOQ를 사전 협의하십시오.
              </li>
              <li>
                <strong>인증 마크 표기 검토 지원</strong> — KC·CE·FCC 마크 위치와 표기 방식을
                검토하는 업체는 패키징 설계 오류를 줄이는 데 도움이 됩니다.
                최종 판단은 제조사·수입업자가 해야 합니다.
              </li>
              <li>
                <strong>공급 리드타임 및 완충재 재고</strong> — EPP 인서트는 성형 리드타임이
                4~8주인 경우가 많습니다. 성수기 전 선발주 계획과 재고 보유 여부를 사전 확인하십시오.
              </li>
            </ol>
          </section>

          <section>
            <h2>7. Packlinx에서 전자제품 포장 업체 비교하기</h2>
            <p>
              Packlinx는 ESD 방지 소재·완충재·인증 마크 표기를 다루는 전자제품 포장 공급사와
              구매 담당자를 연결하는 B2B 디렉토리입니다.
            </p>
            <ol>
              <li>
                <Link href="/products/electronics-packaging">전자제품 포장 업체 디렉토리</Link>에서
                ESD 소재·완충재 종류로 필터링
              </li>
              <li>관심 업체 2~3곳에서 인서트 성형 능력 및 테스트 지원 여부 확인</li>
              <li>동일 사양(인서트 소재·성형 방식·MOQ·납기)으로 견적 요청</li>
              <li>샘플 인서트 수령 후 낙하 테스트 검증 → 본 발주</li>
            </ol>
            <p>
              업체 목록은{" "}
              <Link href="/products/electronics-packaging">Packlinx 전자제품 포장 업체 목록</Link>에서
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
                <Link href="/guides/packaging-accessories-guide">
                  포장 부자재 가이드 — 완충재·테이프·스트레치 필름 비교
                </Link>
              </li>
              <li>
                <Link href="/guides/corrugated-flute-types">
                  골판지 플루트 종류 가이드 — A·B·C·E·F 플루트 비교
                </Link>
              </li>
              <li>
                <Link href="/guides/shipping-box-pricing">
                  배송 박스 가격 가이드 — 사이즈별 단가 비교
                </Link>
              </li>
            </ul>
          </section>

          <footer>
            <p>
              <em>
                이 가이드는 Packlinx 콘텐츠팀이 작성하였습니다. KC·CE·FCC 인증 마크 적용 기준은
                제품 카테고리별 고시에 따라 다르므로, 발주 전 해당 인증 기관 또는 제조사와 반드시 확인하시기 바랍니다.
                IATA 위험물 규정은 매년 개정되므로 항공 운송 계획 시 최신 버전을 확인하세요.
              </em>
            </p>
          </footer>

          <h2 className="text-[22px] leading-[1.35] tracking-[-0.015em] mt-12 mb-4 text-[var(--g-ink)] font-extrabold">자주 묻는 질문</h2>
          <GuideFaq items={slotFaq} />
          <GuideEndCta
            headline="전자제품 포장 업체 찾기"
            subtext="Packlinx에서 ESD·완충재 취급 포장 공급사를 비교하세요"
            buttonLabel="업체 비교하기 →"
            href="/products/electronics-packaging"
          />
        </article>
        <GuideSidebar
          ctaHeadline="전자제품 포장 업체 비교"
          ctaSubtext="ESD 소재·완충재 종류·MOQ 조건으로 필터링해 업체를 한눈에 비교하세요."
          ctaButtonLabel="업체 바로 비교 →"
          ctaHref="/products/electronics-packaging"
          relatedGuides={[
            { href: "/guides/packaging-material-complete-guide", title: "패키징 소재 종합 가이드", readTime: "7분" },
            { href: "/guides/packaging-accessories-guide", title: "포장 부자재 가이드", readTime: "6분" },
            { href: "/guides/corrugated-flute-types", title: "골판지 플루트 종류 가이드", readTime: "5분" },
            { href: "/guides/shipping-box-pricing", title: "배송 박스 가격 가이드", readTime: "5분" },
          ]}
        />
      </div>
    </div>
  );
}
