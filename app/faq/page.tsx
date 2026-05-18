import type { Metadata } from 'next'
import { FaqClient } from './FaqClient'

export const revalidate = 3600

export const metadata: Metadata = {
  title: '자주 묻는 질문 (FAQ)',
  description: 'Packlinx 서비스에 관한 자주 묻는 질문 — 정보 등록 표시, 업체 정보 수집 방식, 정보 삭제·수정 요청 안내.',
  alternates: {
    canonical: 'https://www.packlinx.com/faq',
    languages: { 'ko-KR': 'https://www.packlinx.com/faq', 'x-default': 'https://www.packlinx.com/faq' },
  },
}

export default function FaqPage() {
  return <FaqClient />
}
