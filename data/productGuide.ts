import type { PackagingForm } from '@/types'

export type ProductSlug =
  | 'box'
  | 'pouch'
  | 'container'
  | 'tube'
  | 'can'
  | 'shopping-bag'
  | 'cushioning'
  | 'film'
  | 'label'
  | 'tape'

export const PRODUCT_SLUGS: ProductSlug[] = [
  'box',
  'pouch',
  'container',
  'tube',
  'can',
  'shopping-bag',
  'cushioning',
  'film',
  'label',
  'tape',
]

export const PRODUCT_SLUG_TO_FORM: Record<ProductSlug, PackagingForm> = {
  'box':          'box_case',
  'pouch':        'pouch_bag',
  'container':    'bottle_container',
  'tube':         'tube',
  'can':          'can_tin',
  'shopping-bag': 'shopping_bag',
  'cushioning':   'cushioning',
  'film':         'stretch_film',
  'label':        'label_sticker',
  'tape':         'tape_sealing',
}

export interface ProductGuideData {
  slug: ProductSlug
  label: string
  icon: string
  description: string
  buyerPoints: string[]
  subTypes: string[]
  seoTitle: string
  seoDescription: string
  seoKeywords: string[]
}

export const PRODUCT_GUIDE: Record<ProductSlug, ProductGuideData> = {
  'box': {
    slug: 'box',
    label: '박스·케이스',
    icon: '📦',
    description: '박스·케이스는 제품 보호와 브랜드 경험을 동시에 결정하는 포장재의 기본입니다. 택배박스, 단상자, 마그넷 박스, 선물 박스 등 용도별 전문 업체를 비교하고, 규격·소재·인쇄 방식에 맞는 파트너를 찾아보세요.',
    buyerPoints: [
      '규격(가로·세로·높이) 맞춤 제작 가능 여부 확인',
      '골판지·백판지·미세골 등 소재별 강도와 용도 비교',
      'MOQ(최소주문량)와 납기 조건 사전 협의 필수',
      '인쇄·후가공(UV, 호박금, 엠보싱) 가능 여부',
    ],
    subTypes: ['택배박스', '단상자', '마그넷 박스', '선물 박스', '골판지 박스', '미세골 박스'],
    seoTitle: '박스·케이스 포장 업체 찾기 — 전국 박스 제조업체',
    seoDescription: '전국 박스·케이스 전문 포장업체를 한 번에 비교하세요. 택배박스, 단상자, 선물박스 맞춤 제작 B2B 공급업체 Packlinx.',
    seoKeywords: ['박스 업체', '택배박스 제조', '단상자 업체', '맞춤 박스', '골판지 박스'],
  },
  'pouch': {
    slug: 'pouch',
    label: '파우치·백',
    icon: '🛍️',
    description: '파우치·백은 식품, 화장품, 생활용품 등 다양한 산업에서 활용되는 유연 포장재입니다. 스탠딩파우치, 지퍼백, 진공팩 등 형태별 전문 업체를 비교하고, 소재·차단성·인쇄 품질 기준으로 최적의 파트너를 찾아보세요.',
    buyerPoints: [
      '차단성(산소·수분) 요구 수준에 맞는 소재 구조 확인',
      '지퍼·스파우트·노치 등 개봉 편의 기능 여부',
      '식품등급 소재 사용 여부 (식품 용도 시 필수)',
      '소량 시제품 제작 가능 여부 확인',
    ],
    subTypes: ['스탠딩파우치', '지퍼백', '삼방파우치', '진공팩', '스파우트파우치', '알루미늄파우치'],
    seoTitle: '파우치·백 포장 업체 찾기 — 전국 파우치 전문업체',
    seoDescription: '전국 파우치·백 전문 포장업체를 한 번에 비교하세요. 스탠딩파우치, 지퍼백, 진공팩 맞춤 제작 B2B 공급업체 Packlinx.',
    seoKeywords: ['파우치 업체', '스탠딩파우치', '지퍼백 제조', '식품 파우치', '맞춤 파우치'],
  },
  'container': {
    slug: 'container',
    label: '병·용기',
    icon: '🧴',
    description: '병·용기는 화장품, 식품, 의약품 등 내용물 보호와 브랜드 아이덴티티를 결정하는 핵심 포장재입니다. 유리병, 플라스틱 용기, PET병 등 소재별 전문 업체를 비교하고, 용도에 맞는 파트너를 찾아보세요.',
    buyerPoints: [
      '소재별 특성 비교: 유리(고급감), PET(경량), HDPE(내화학성)',
      '캡·펌프·디스펜서 등 마감재 호환 여부 확인',
      '식품등급·화장품 GMP 적합 소재 여부',
      '소량 샘플 제작(MOQ 100개 이하) 가능 여부',
    ],
    subTypes: ['유리병', 'PET병', 'HDPE 용기', '화장품 용기', '식품 용기', '펌프·디스펜서'],
    seoTitle: '병·용기 포장 업체 찾기 — 전국 용기 전문업체',
    seoDescription: '전국 병·용기 전문 포장업체를 한 번에 비교하세요. 유리병, PET병, 화장품 용기 맞춤 제작 B2B 공급업체 Packlinx.',
    seoKeywords: ['용기 업체', '유리병 제조', '화장품 용기', 'PET병 업체', '플라스틱 용기'],
  },
  'tube': {
    slug: 'tube',
    label: '튜브',
    icon: '🧪',
    description: '튜브는 화장품, 의약품, 치약 등 크림·겔 형태 제품에 최적화된 포장재입니다. 알루미늄 튜브, 라미네이트 튜브, PE 튜브 등 소재별 전문 업체를 Packlinx에서 비교하세요.',
    buyerPoints: [
      '소재별 특성: 알루미늄(차단성), 라미네이트(인쇄), PE(유연성)',
      '캡 형태(플립캡, 스크류캡, 니들노즐) 선택 확인',
      '인쇄 방식(오프셋, 실크스크린, 핫스탬프) 비교',
      '화장품 GMP(ISO 22716) 인증 보유 여부',
    ],
    subTypes: ['알루미늄 튜브', '라미네이트 튜브', 'PE 튜브', '에어리스 튜브', '아이크림 튜브'],
    seoTitle: '튜브 포장 업체 찾기 — 전국 튜브 전문업체',
    seoDescription: '전국 튜브 전문 포장업체를 한 번에 비교하세요. 화장품·의약품 튜브 맞춤 제작 B2B 공급업체 Packlinx.',
    seoKeywords: ['튜브 업체', '화장품 튜브', '알루미늄 튜브', '라미네이트 튜브', '튜브 제조'],
  },
  'can': {
    slug: 'can',
    label: '캔·틴',
    icon: '🥫',
    description: '캔·틴은 음료, 식품, 화학제품 등 밀봉 보존이 필요한 제품에 사용되는 금속 포장재입니다. 알루미늄 캔, 틴플레이트 캔, 스프레이 캔 등 전문 업체를 Packlinx에서 비교하세요.',
    buyerPoints: [
      '소재 선택: 알루미늄(경량·재활용), 틴플레이트(강도·내식성)',
      '내면 코팅(에폭시·수성) 안전성 확인 — 식품 용도 필수',
      '인쇄·라벨링 방식(슬리브, 직접인쇄) 비교',
      '밀봉·실링 공정 품질 및 기밀성 테스트 여부',
    ],
    subTypes: ['음료 캔', '식품 캔', '틴케이스', '스프레이 캔', '차·커피 캔', '선물용 틴'],
    seoTitle: '캔·틴 포장 업체 찾기 — 전국 캔 전문업체',
    seoDescription: '전국 캔·틴 전문 포장업체를 한 번에 비교하세요. 음료캔, 식품캔, 틴케이스 맞춤 제작 B2B 공급업체 Packlinx.',
    seoKeywords: ['캔 업체', '음료캔 제조', '틴케이스', '알루미늄 캔', '식품 캔'],
  },
  'shopping-bag': {
    slug: 'shopping-bag',
    label: '쇼핑백·캐리어백',
    icon: '🛒',
    description: '쇼핑백·캐리어백은 매장 경험과 브랜드 인지도를 높이는 핵심 포장재입니다. 종이 쇼핑백, 부직포 가방, 비닐 캐리어백 등 소재·디자인별 전문 업체를 Packlinx에서 비교하세요.',
    buyerPoints: [
      '소재 선택: 종이(고급감), 부직포(재사용), PE(경제성)',
      '인쇄 범위와 색상 수에 따른 단가 비교',
      '손잡이 형태(꼬임끈, 리본, 다이컷) 선택',
      '친환경 인증(FSC, 재생 소재) 여부 확인',
    ],
    subTypes: ['종이 쇼핑백', '부직포 가방', 'PE 캐리어백', '럭셔리 쇼핑백', '에코백', '부직포 보냉백'],
    seoTitle: '쇼핑백·캐리어백 업체 찾기 — 전국 쇼핑백 전문업체',
    seoDescription: '전국 쇼핑백·캐리어백 전문 업체를 한 번에 비교하세요. 종이 쇼핑백, 부직포 가방, 맞춤 제작 B2B 공급업체 Packlinx.',
    seoKeywords: ['쇼핑백 업체', '종이 쇼핑백', '부직포 가방', '캐리어백', '맞춤 쇼핑백'],
  },
  'cushioning': {
    slug: 'cushioning',
    label: '완충재·보호재',
    icon: '🫧',
    description: '완충재·보호재는 배송 중 제품 파손을 방지하는 필수 포장재입니다. 에어캡, EPE 폼, 종이 완충재, 스티로폼 등 용도별 전문 업체를 Packlinx에서 비교하고 최적의 보호 솔루션을 찾아보세요.',
    buyerPoints: [
      '제품 무게·취약성에 맞는 완충 소재 선택',
      '맞춤 형상 가공(금형, CNC 커팅) 가능 여부',
      '친환경 완충재(종이, 전분) 대체 가능 여부',
      'ESD(정전기방지) 기능 필요 여부 확인',
    ],
    subTypes: ['에어캡', 'EPE 폼', 'EPS 스티로폼', '종이 완충재', '허니컴 패드', '에어필로우'],
    seoTitle: '완충재·보호재 업체 찾기 — 전국 완충포장 전문업체',
    seoDescription: '전국 완충재·보호재 전문 업체를 한 번에 비교하세요. 에어캡, EPE 폼, 종이 완충재 맞춤 제작 B2B 공급업체 Packlinx.',
    seoKeywords: ['완충재 업체', '에어캡', 'EPE 폼', '포장 완충재', '보호포장'],
  },
  'film': {
    slug: 'film',
    label: '스트레치·필름',
    icon: '🎞️',
    description: '스트레치·필름은 팔레트 래핑, 식품 포장, 산업용 보호에 사용되는 핵심 포장재입니다. PE 스트레치 필름, 수축필름, OPP 필름 등 용도별 전문 업체를 Packlinx에서 비교하세요.',
    buyerPoints: [
      '필름 두께(미크론)와 인장강도 요구 사양 확인',
      '식품 접촉 가능 등급 여부 (식품 포장 시 필수)',
      '기계식/수동식 래핑 호환 여부',
      '친환경 필름(생분해·재생) 대체 가능 여부',
    ],
    subTypes: ['PE 스트레치 필름', '수축필름', 'OPP 필름', '팔레트 랩', '식품용 랩', '산업용 보호필름'],
    seoTitle: '스트레치·필름 업체 찾기 — 전국 필름 전문업체',
    seoDescription: '전국 스트레치·필름 전문 업체를 한 번에 비교하세요. 스트레치 필름, 수축필름, OPP 필름 B2B 공급업체 Packlinx.',
    seoKeywords: ['스트레치 필름', '수축필름', '포장 필름', 'OPP 필름', '필름 업체'],
  },
  'label': {
    slug: 'label',
    label: '라벨·스티커',
    icon: '🏷️',
    description: '라벨·스티커는 제품 정보 전달과 브랜드 표현의 핵심 요소입니다. 접착 라벨, 수축 슬리브, 열전사 라벨 등 용도별 전문 업체를 Packlinx에서 비교하고 맞춤 파트너를 찾아보세요.',
    buyerPoints: [
      '접착 방식(영구, 재부착, 냉동) 용도에 맞는 선택',
      '인쇄 방식(디지털, 플렉소, 오프셋) 비교',
      '소재: 아트지, PP, PET, 유포지 등 환경별 내구성',
      '식품·의약품 라벨 규격 및 법적 요건 충족 여부',
    ],
    subTypes: ['접착 라벨', '수축 슬리브', '열전사 라벨', '투명 라벨', '보안 라벨', '바코드 라벨'],
    seoTitle: '라벨·스티커 업체 찾기 — 전국 라벨 전문업체',
    seoDescription: '전국 라벨·스티커 전문 업체를 한 번에 비교하세요. 접착 라벨, 수축 슬리브, 맞춤 라벨 인쇄 B2B 공급업체 Packlinx.',
    seoKeywords: ['라벨 업체', '스티커 인쇄', '접착 라벨', '수축 슬리브', '맞춤 라벨'],
  },
  'tape': {
    slug: 'tape',
    label: '테이프·밀봉재',
    icon: '📋',
    description: '테이프·밀봉재는 포장 마감과 제품 보호의 마지막 단계를 책임지는 포장재입니다. OPP 테이프, 크라프트 테이프, 보안 테이프 등 용도별 전문 업체를 Packlinx에서 비교하세요.',
    buyerPoints: [
      '접착력과 내온도성 요구 사양 확인',
      '인쇄 테이프(브랜드 로고) 제작 가능 여부',
      '친환경 테이프(종이, 수용성 접착) 대체 가능 여부',
      '자동 봉함기 호환 규격 확인',
    ],
    subTypes: ['OPP 테이프', '크라프트 테이프', '보안 테이프', '인쇄 테이프', '봉함 테이프', '마스킹 테이프'],
    seoTitle: '테이프·밀봉재 업체 찾기 — 전국 테이프 전문업체',
    seoDescription: '전국 테이프·밀봉재 전문 업체를 한 번에 비교하세요. OPP 테이프, 크라프트 테이프, 보안 테이프 B2B 공급업체 Packlinx.',
    seoKeywords: ['테이프 업체', 'OPP 테이프', '크라프트 테이프', '포장 테이프', '밀봉재'],
  },
}

export const RELATED_PRODUCTS: Record<ProductSlug, ProductSlug[]> = {
  'box':          ['pouch', 'tape', 'cushioning'],
  'pouch':        ['film', 'label', 'box'],
  'container':    ['tube', 'label', 'can'],
  'tube':         ['container', 'label', 'pouch'],
  'can':          ['container', 'label', 'box'],
  'shopping-bag': ['box', 'tape', 'label'],
  'cushioning':   ['film', 'box', 'tape'],
  'film':         ['cushioning', 'tape', 'pouch'],
  'label':        ['tape', 'pouch', 'container'],
  'tape':         ['label', 'cushioning', 'film'],
}
