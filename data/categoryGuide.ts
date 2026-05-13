import type { IndustryCategory } from '@/types'

export interface CategoryGuideData {
  categoryId: IndustryCategory
  categoryLabel: string
  description: string
  buyerPoints: string[]
  subTypes: string[]
  seoKeywords: string[]
}

export const CATEGORY_GUIDE_CONTENT: Record<IndustryCategory, CategoryGuideData> = {
  'food-beverage': {
    categoryId: 'food-beverage',
    categoryLabel: '식품·음료 포장',
    description: '식품·음료 포장재는 내용물의 안전성과 신선도를 직결하는 핵심 요소입니다. HACCP·GMP·ISO 22000 인증 여부를 반드시 확인하고, 냉동·냉장·상온 보관 조건에 맞는 소재와 형태를 선택해야 합니다. 트레이, 파우치, 유리병, 알루미늄 캔, 종이박스 등 다양한 식품 포장재 전문 업체를 지금 바로 비교하세요.',
    buyerPoints: [
      'HACCP·GMP·ISO 22000 인증 보유 업체인지 확인',
      '식품위생법 적합 소재(식품등급) 사용 여부 확인',
      '냉동·냉장·상온 보관 조건에 맞는 소재 선택 (PE, PP, PET 등)',
      'MOQ(최소주문량)와 납기 조건 사전 협의 필수',
    ],
    subTypes: ['트레이', '파우치·스탠딩파우치', '유리병·유리용기', '알루미늄 캔·음료캔', '종이박스·단상자', '플라스틱 용기', '포장 필름'],
    seoKeywords: ['식품 포장재', '식품 포장업체', 'HACCP 포장', '음료 포장재', '식품 용기 업체'],
  },
  'ecommerce-shipping': {
    categoryId: 'ecommerce-shipping',
    categoryLabel: '이커머스·배송 포장',
    description: '이커머스 포장은 배송 중 파손 방지와 브랜드 언박싱 경험을 동시에 충족해야 합니다. 스마트스토어·쿠팡 셀러부터 D2C 브랜드까지, 물량과 납기에 맞는 택배박스·완충재·봉투 전문 업체를 한 번에 비교하세요. 반복 발주가 많은 만큼 단가와 최소주문량이 핵심 선택 기준입니다.',
    buyerPoints: [
      '단가와 MOQ(최소주문량)가 반복 발주의 핵심 기준',
      '박스 규격(가로·세로·높이) 맞춤 제작 가능 여부 확인',
      '완충재 종류(에어캡, EPE 폼, 종이 완충재)별 특성 비교',
      '친환경 박스·재생 소재 여부 (ESG 조달 요건 증가)',
    ],
    subTypes: ['택배박스', '각대봉투·에어봉투', '에어캡·완충재', '포장테이프·OPP테이프', '쇼핑백', '종이 완충재·허니컴'],
    seoKeywords: ['택배박스 업체', '이커머스 포장재', '배송 포장재', '완충재 업체', '택배봉투'],
  },
  'cosmetics-beauty': {
    categoryId: 'cosmetics-beauty',
    categoryLabel: '화장품·뷰티 포장',
    description: '화장품 포장은 브랜드 아이덴티티를 결정하는 첫 인상입니다. 소량 OEM 제작부터 맞춤 패키지 디자인까지, 뷰티 브랜드의 성장 단계에 맞는 파트너를 찾아보세요. 용기, 파우치, 유리병, 튜브 등 화장품 포장재 전문 업체를 ISO 22716 인증 기준으로 비교하세요.',
    buyerPoints: [
      '소량 샘플 제작(MOQ 100개 이하) 가능 여부 확인',
      'ISO 22716(화장품 GMP) 인증 보유 업체 우선 검토',
      '소재 안전성: 식품등급 플라스틱, 비BPA 소재 여부',
      '커스텀 디자인·인쇄 및 후가공(UV, 호박금) 가능 여부',
    ],
    subTypes: ['화장품 용기·콤팩트', '유리병·향수병', '파우치·파우더 파우치', '튜브', '펌프 디스펜서', '선물 박스·마그넷 박스'],
    seoKeywords: ['화장품 포장재', '화장품 용기 업체', '뷰티 패키징', '화장품 OEM 용기', '소량 화장품 용기'],
  },
  'pharma-health': {
    categoryId: 'pharma-health',
    categoryLabel: '의약·건강 포장',
    description: '의약품·건강기능식품 포장재는 식약처 규정 준수와 GMP 인증이 필수입니다. 방습·차광·멸균 기능을 갖춘 전문 소재가 요구되며, 용도별 규격이 까다롭습니다. 블리스터 패키징, 약병, 건강기능식품 파우치 전문 업체를 인증 기준으로 검색하세요.',
    buyerPoints: [
      'GMP·식약처 인증 의무 여부 확인 (품목별 상이)',
      '방습·차광 기능 소재 여부 (알루미늄 복합재 등)',
      '블리스터·약병·진공 포장 각 공정 전문 업체 분리 필요',
      '유통기한·성분 라벨링 인쇄 서비스 포함 여부',
    ],
    subTypes: ['블리스터 팩', '약병·HDPE 용기', '건강기능식품 파우치', '의료기기 포장재', '알루미늄 복합 포장', '진공 포장재'],
    seoKeywords: ['의약품 포장재', '건강기능식품 포장', 'GMP 포장업체', '블리스터 포장', '약 용기 업체'],
  },
  'electronics-industrial': {
    categoryId: 'electronics-industrial',
    categoryLabel: '전자·산업 포장',
    description: '전자·산업 포장재는 정전기 방지(ESD)와 충격 흡수 성능이 핵심입니다. 부품·완제품 규격에 맞는 맞춤형 트레이, 완충 폼, 방청 소재 전문 업체를 Packlinx에서 신속하게 비교하고 적합한 파트너를 찾아보세요.',
    buyerPoints: [
      'ESD(정전기방지) 인증 소재 사용 여부 필수 확인',
      '완충 폼(EPE·EPS·EVA·PU폼) 맞춤 제작 가능 여부',
      '방청·방습 포장 경험 여부 (자동차 부품, 군수 등)',
      'KS·KC 인증 포장재 여부 및 RoHS 대응 가능 여부',
    ],
    subTypes: ['ESD 트레이·정전기방지 봉투', '완충 폼 (EPE·EPS·PU폼)', '진공 성형 트레이', '방청 포장재', '스트레치 필름', '팔레트 랩'],
    seoKeywords: ['전자 포장재', '산업용 포장재', '정전기방지 포장', 'ESD 포장업체', '완충 폼 업체'],
  },
  'label-sticker': {
    categoryId: 'label-sticker',
    categoryLabel: '라벨·스티커',
    description: '라벨·스티커는 제품 정보 전달과 브랜드 표현의 핵심입니다. 바코드 라벨, 방수 스티커, 제품 라벨, 운송 라벨까지 다양한 용도별 인쇄 업체를 Packlinx에서 비교하세요.',
    buyerPoints: [
      '소재 선택: 종이·PP·PET·비닐·방수 소재 용도별 구분',
      '바코드·QR코드 인쇄 정확도 및 스캔 가능 여부 확인',
      'MOQ(최소주문량) — 소량(100장~) 제작 가능 여부',
      '점착력 등급: 영구·반영구·제거형 용도에 맞게 선택',
    ],
    subTypes: ['제품 라벨', '바코드·QR 라벨', '방수 스티커', '운송·물류 라벨', '스티커 시트', '홀로그램 라벨'],
    seoKeywords: ['라벨 제작 업체', '스티커 인쇄 업체', '바코드 라벨 제작', '방수 라벨 제작', '제품 라벨 인쇄'],
  },
  'printing-postprocess': {
    categoryId: 'printing-postprocess',
    categoryLabel: '인쇄·후가공',
    description: '패키지 인쇄와 후가공은 제품의 첫 인상을 결정합니다. 오프셋·디지털 인쇄부터 UV 코팅, 박(포일), 형압, 에폭시까지 다양한 공정을 지원하는 전문 업체를 비교하세요.',
    buyerPoints: [
      '오프셋 vs 디지털 인쇄: 물량·납기에 따른 선택 기준',
      '후가공 공정(UV·박·형압·에폭시) 가능 업체 여부 확인',
      'Pantone·특색 잉크 사용 가능 여부 및 색 재현성',
      '소량 인쇄(100부 이하) 가능 여부 및 단가 확인',
    ],
    subTypes: ['패키지·박스 인쇄', '오프셋 인쇄', '디지털 인쇄', 'UV 코팅·라미네이팅', '박(포일)·형압', '에폭시·특수 후가공'],
    seoKeywords: ['패키지 인쇄 업체', '후가공 업체', 'UV 코팅 인쇄', '박 형압 인쇄', '소량 인쇄 업체'],
  },
  'packaging-accessories': {
    categoryId: 'packaging-accessories',
    categoryLabel: '포장 부자재',
    description: '포장 부자재는 물류·배송의 효율성과 제품 보호를 결정합니다. OPP·PVC 테이프, 에어캡, PP밴드, 완충재, 스트래핑 등 다양한 부자재 전문 업체를 Packlinx에서 한 번에 비교하세요.',
    buyerPoints: [
      '테이프 점착력·두께 및 용도(포장·표면보호·양면)에 맞는 선택',
      '에어캡·완충재 두께·소재(PE·EPE·허니컴) 비교',
      'PP밴드·스트래핑 강도 및 자동 포장기 호환 여부',
      '대량 구매 단가 및 정기 납품 가능 업체 확인',
    ],
    subTypes: ['OPP·PVC 포장 테이프', '에어캡·버블 완충재', 'EPE·PE 폼 완충재', 'PP밴드·스트래핑', '허니컴 종이 완충재', '진공·수축 필름'],
    seoKeywords: ['포장 부자재 업체', 'OPP 테이프 제작', '에어캡 완충재', 'PP밴드 업체', '포장용 테이프 공급'],
  },
  'packaging-machinery': {
    categoryId: 'packaging-machinery',
    categoryLabel: '포장기계·자동화',
    description: '포장 자동화는 생산성 향상과 인건비 절감의 핵심입니다. 충전기, 밀봉기, 수축 포장기, 팔레타이저까지 라인 구성에 맞는 포장기계 전문 업체를 Packlinx에서 비교하세요.',
    buyerPoints: [
      '생산 속도(분당 개수)와 라인 속도에 맞는 기계 사양 확인',
      'A/S 및 소모품 공급 가능 여부 — 국내 서비스망 필수',
      '기계 임대·리스 vs 구매 옵션 비교',
      'CE·KS 인증 여부 및 안전 규격 준수 확인',
    ],
    subTypes: ['자동 충전기', '열봉합·밀봉기', '수축 포장기(쉬링크)', '팔레타이저·래핑기', '진공 포장기', '자동 박스 조립·테이핑기'],
    seoKeywords: ['포장기계 업체', '자동 포장기 가격', '충전기 포장기', '수축 포장기 업체', '팔레타이저 가격'],
  },
}
