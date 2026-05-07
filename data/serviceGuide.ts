export type ServiceSlug = 'printing-design'

export const SERVICE_SLUGS: ServiceSlug[] = ['printing-design']

export interface ServiceGuideData {
  slug: ServiceSlug
  label: string
  icon: string
  description: string
  buyerPoints: string[]
  subTypes: string[]
  seoTitle: string
  seoDescription: string
  seoKeywords: string[]
}

export const SERVICE_GUIDE: Record<ServiceSlug, ServiceGuideData> = {
  'printing-design': {
    slug: 'printing-design',
    label: '인쇄·디자인 서비스',
    icon: '🖨️',
    description: '소량 맞춤 인쇄부터 패키지 브랜딩까지, 스타트업과 소규모 브랜드에 특화된 인쇄·디자인 업체를 찾아보세요. 디자인 파일이 없어도 의뢰 가능한 원스톱 서비스 업체부터 고품질 오프셋 인쇄 전문사까지 Packlinx에서 비교하세요.',
    buyerPoints: [
      '소량 주문 가능 여부 (디지털 인쇄: 100~500매 기준)',
      '디자인 제작 포함 여부 — 파일 없이 의뢰 가능한지 확인',
      '오프셋 vs 디지털 인쇄 선택 기준 (수량·품질·납기)',
      '샘플 제작 후 본생산 가능 여부 및 교정 프로세스',
    ],
    subTypes: ['택배박스·단상자 인쇄', '라벨·스티커 인쇄', '쇼핑백 인쇄', '패키지 디자인', '스탬핑·UV·엠보싱 후가공', '브랜드 패키징 컨설팅'],
    seoTitle: '인쇄·디자인 서비스 업체 찾기 — 전국 패키지 인쇄 전문',
    seoDescription: '소량 맞춤 인쇄부터 패키지 디자인까지. 스타트업·소규모 발주에 특화된 인쇄·디자인 업체를 packlinx.com에서 바로 비교하세요.',
    seoKeywords: ['패키지 디자인 업체', '라벨 인쇄 업체', '소량 인쇄', '박스 디자인', '맞춤 포장 인쇄'],
  },
}

export const RELATED_SERVICES_TO_PRODUCTS = ['box', 'label', 'shopping-bag'] as const
