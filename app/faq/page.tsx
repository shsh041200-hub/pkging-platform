import type { Metadata } from 'next'
import { FaqClient } from './FaqClient'

export const revalidate = 3600

export const metadata: Metadata = {
  title: '자주 묻는 질문 (FAQ) — Packlinx',
  description: 'Packlinx 서비스에 관한 자주 묻는 질문 — 정보 등록 표시, 업체 정보 수집 방식, 정보 삭제·수정 요청 안내.',
  alternates: {
    canonical: 'https://www.packlinx.com/faq',
  },
}

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '「정보 등록」 표시는 무엇인가요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '「정보 등록」은 Packlinx가 자체적으로 수립한 등록 절차를 통해 5가지 기준(①사업자등록번호 유효성, ②법인·사업자 명의 일치, ③웹사이트 도메인 실재성, ④통신판매업 신고 여부, ⑤최소 1회 양방향 연락 가능성 확인)을 모두 충족한 업체에 부여하는 표시입니다. 외부 공인 인증기관(KS, ISO 등)이 발급한 인증이 아니며, Packlinx 자체 기준에 따른 표시입니다. 12개월(연 1회) 정기 갱신하며, 기준 미충족 시 표시는 즉시 철회됩니다.',
      },
    },
    {
      '@type': 'Question',
      name: 'Packlinx는 무료인가요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '네, Packlinx의 업체 검색·열람 기능은 모두 무료입니다. 회원 가입 없이 이용하실 수 있습니다.',
      },
    },
    {
      '@type': 'Question',
      name: '업체 정보는 어떻게 수집되나요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Packlinx는 인터넷에 공개된 사업자 정보(업체명, 웹사이트 URL, 카테고리, 취급 제품, 인증 정보, 사업 설명 등)를 자동으로 수집·가공하여 게재합니다. 전화번호·주소·이메일 등 개인식별 연락처는 수집하지 않습니다. 정보의 정확성·최신성·완전성은 보증되지 않으며, 오류가 있는 경우 정보 수정·삭제 요청을 통해 알려주세요.',
      },
    },
    {
      '@type': 'Question',
      name: '업체 정보 수정·삭제를 요청하려면 어떻게 하나요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '온라인 신청(packlinx.com/opt-out) 또는 이메일(rpdla041200@gmail.com)로 요청하실 수 있으며, 영업일 기준 24시간 이내에 처리 결과를 안내해 드립니다.',
      },
    },
  ],
}

export default function FaqPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <FaqClient />
    </>
  )
}
