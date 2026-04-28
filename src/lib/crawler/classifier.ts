import {
  type Category,
  type IndustryCategory,
  type MaterialType,
  type PrintDesignSubtype,
  PRINT_DESIGN_SUBTYPES,
  CATEGORY_TO_MATERIAL,
} from '@/types'

interface CategoryRule {
  category: Category
  keywords: string[]
  subcategoryMap: Record<string, string[]>
}

interface WeightedIndustryRule {
  industry: IndustryCategory
  keywords: string[]
  weight: number
}

export interface IndustryClassificationResult {
  categories: IndustryCategory[]
  confidence: number
  method: 'rule' | 'ai' | 'none'
}

const CATEGORY_RULES: CategoryRule[] = [
  {
    category: 'paper',
    keywords: ['종이', '지류', '골판지', '박스', '쇼핑백', '인쇄', '페이퍼', '제지', '단상자', '한지', '크라프트'],
    subcategoryMap: {
      '인쇄/출판': ['인쇄', '출판', '카탈로그'],
      '명품/프리미엄': ['명품', '프리미엄', '고급', '럭셔리'],
      '패션/라이프스타일': ['패션', '라이프스타일'],
      '골판지/박스': ['골판지', '박스', '단상자'],
    },
  },
  {
    category: 'plastic',
    keywords: ['플라스틱', 'PET', 'PP', 'HDPE', 'PE', '사출', '압출', '수지', '폴리', 'PVC', 'PS'],
    subcategoryMap: {
      PET: ['PET', 'pet'],
      'PP/사출': ['PP', '사출', '트레이'],
      'HDPE/드럼': ['HDPE', '드럼'],
      '용기/보틀': ['용기', '보틀', '병'],
    },
  },
  {
    category: 'metal',
    keywords: ['금속', '알루미늄', '스틸', '철', '캔', '드럼', '틴', '주석', '금속캔', '메탈'],
    subcategoryMap: {
      '음료/식품캔': ['음료캔', '식품캔', '캔'],
      '드럼/컨테이너': ['드럼', '컨테이너', '스틸드럼'],
      '알루미늄': ['알루미늄', '방산', '방진'],
      '틴케이스/선물': ['틴케이스', '틴박스', '선물'],
    },
  },
  {
    category: 'flexible',
    keywords: ['연포장', '파우치', '필름', '라미네이트', '비닐', '봉투', '스탠딩파우치', 'BOPP', 'OPP', '스트레치'],
    subcategoryMap: {
      '파우치': ['파우치', '스탠딩파우치'],
      '필름/라미': ['필름', '라미네이트', 'BOPP', 'OPP'],
      '비닐/봉투': ['비닐', '봉투'],
    },
  },
  {
    category: 'eco',
    keywords: ['친환경', '생분해', '재생', 'FSC', 'fsc', '바이오', 'PLA', '업사이클', '재활용', 'GRS', '친환경포장'],
    subcategoryMap: {
      '재생/업사이클': ['재생', '업사이클', '재활용', 'GRS'],
      '생분해/바이오': ['생분해', 'PLA', '바이오', '옥수수', '사탕수수'],
      '천연/전통소재': ['천연', '한지', '왕겨', '볏짚', '마포'],
    },
  },
  {
    category: 'glass',
    keywords: ['유리', '글라스', '유리병', '유리용기', '유리컵'],
    subcategoryMap: {
      '유리병/보틀': ['유리병', '보틀'],
      '유리용기': ['유리용기', '유리컵'],
    },
  },
]

const WEIGHTED_INDUSTRY_RULES: WeightedIndustryRule[] = [
  {
    industry: 'food-beverage',
    keywords: [
      '식품', '음료', '냉동', 'HACCP', 'haccp', '밀키트', '냉장', '베이커리',
      '제과', '쌀', '김치', '반찬', '즉석식품', '식자재', '커피', '과자', '스낵',
      '라면', '주류', '와인', '맥주', '소주', '유제품', '도시락', '카페',
    ],
    weight: 2,
  },
  {
    industry: 'cosmetics-beauty',
    keywords: [
      '화장품', '뷰티', '코스메틱', '스킨케어', '메이크업', '향수', '크림자',
      '펌프보틀', '에어리스', '화장품용기', '화장품 포장', '뷰티 패키징',
    ],
    weight: 3,
  },
  {
    industry: 'pharma-health',
    keywords: [
      '의약', '제약', '의료', '약품', 'GMP', '블리스터', '건강보조', '건강기능',
      '한방', '약국', '의료기기', '수액', '캡슐', '연고', '멸균', 'ISO 13485',
      'ISO 15378', 'pharma',
    ],
    weight: 3,
  },
  {
    industry: 'electronics-industrial',
    keywords: [
      '전자', '반도체', 'PCB', 'ESD', 'LED', '디스플레이', '전자부품',
      '산업용', '공업용', '방청', '팔레트', '물류', '크레이트', '중공업',
      '석유화학', '화학', '드럼', '화물', '자동차', '자동차부품',
    ],
    weight: 2,
  },
  {
    industry: 'ecommerce-shipping',
    keywords: [
      '택배', '배송', '이커머스', 'D2C', '언박싱', '택배박스', '온라인 쇼핑',
      '물류 포장', '쇼핑몰 포장',
    ],
    weight: 2,
  },
]

// ── Print/Design subtype detection ──────────────────────────────────────────

interface PrintDesignSubtypeRule {
  subtype: PrintDesignSubtype
  keywords: string[]
}

const PRINT_DESIGN_SUBTYPE_RULES: PrintDesignSubtypeRule[] = [
  {
    subtype: 'package-printing',
    keywords: ['패키지인쇄', '박스인쇄', '골판지인쇄', '단상자인쇄', '박스제작', '패키지 인쇄', '박스 인쇄', '포장박스 인쇄', '포장인쇄'],
  },
  {
    subtype: 'label-sticker',
    keywords: ['라벨인쇄', '스티커인쇄', '라벨 인쇄', '스티커 인쇄', '라벨제작', '스티커제작', '바코드라벨', '바코드 라벨', '라벨지', '제품라벨'],
  },
  {
    subtype: 'brochure-catalog',
    keywords: ['브로셔', '카탈로그', '리플릿', '팸플릿', '전단지', '브로셔인쇄', '카탈로그인쇄', '리플릿인쇄', '팸플릿인쇄'],
  },
  {
    subtype: 'business-stationery',
    keywords: ['명함', '봉투인쇄', '레터헤드', '사무인쇄', '명함인쇄', '명함제작', '사무용 인쇄', '사무 인쇄'],
  },
  {
    subtype: 'signage-display',
    keywords: ['현수막', '배너', '대형출력', '사인물', '간판', 'X배너', '롤업배너', '현수막인쇄', '배너인쇄', '대형 인쇄', '실사출력'],
  },
  {
    subtype: 'package-design',
    keywords: ['패키지 디자인', '패키징 디자인', '박스 디자인', '포장 디자인', '패키지디자인', '패키징디자인', '박스디자인', '포장디자인', '브랜딩 디자인', '라벨 디자인'],
  },
  {
    subtype: 'finishing-postpress',
    keywords: ['후가공', '형압', '박가공', '에폭시', '특수인쇄', '코팅', '라미네이팅', 'UV코팅', '에폭시가공', '형광인쇄', '금박', '은박', '음각', '양각'],
  },
]

export function detectPrintDesignSubtype(text: string): PrintDesignSubtype | null {
  const scores: Partial<Record<PrintDesignSubtype, number>> = {}
  for (const rule of PRINT_DESIGN_SUBTYPE_RULES) {
    let score = 0
    for (const kw of rule.keywords) {
      if (text.includes(kw)) score++
    }
    if (score > 0) scores[rule.subtype] = score
  }
  const entries = Object.entries(scores) as [PrintDesignSubtype, number][]
  if (entries.length === 0) return null
  entries.sort((a, b) => b[1] - a[1])
  const winner = entries[0][0]
  return PRINT_DESIGN_SUBTYPES.includes(winner) ? winner : null
}

const ABBREV_RE = /^[A-Z]{2,5}$/

function detectSubcategory(text: string, rule: CategoryRule): string | null {
  for (const [sub, kws] of Object.entries(rule.subcategoryMap)) {
    if (kws.some((kw) => text.includes(kw))) return sub
  }
  return null
}

function matchesKeyword(text: string, kw: string): boolean {
  if (ABBREV_RE.test(kw)) {
    return new RegExp('(?<![A-Za-z])' + kw + '(?![A-Za-z])', 'i').test(text)
  }
  return text.toLowerCase().includes(kw.toLowerCase())
}

export function detectIndustryCategories(text: string): IndustryClassificationResult {
  const scores: Record<string, number> = {}
  for (const rule of WEIGHTED_INDUSTRY_RULES) {
    let score = 0
    for (const kw of rule.keywords) {
      if (matchesKeyword(text, kw)) {
        score += rule.weight
      }
    }
    if (score > 0) scores[rule.industry] = score
  }

  const entries = Object.entries(scores)
  if (entries.length === 0) {
    return { categories: [], confidence: 0, method: 'rule' }
  }

  const maxScore = Math.max(...entries.map(([, s]) => s))
  const categories = entries
    .filter(([, s]) => s >= maxScore * 0.6)
    .sort((a, b) => b[1] - a[1])
    .map(([cat]) => cat as IndustryCategory)

  const confidence = Math.min(maxScore / 10, 1)
  return { categories, confidence, method: 'rule' }
}

export interface ClassificationResult {
  category: Category
  subcategory: string | null
  confidence: number
  industryClassification: IndustryClassificationResult
  materialType: MaterialType
  printDesignSubtype: PrintDesignSubtype | null
}

const PACKAGING_RELEVANCE_KEYWORDS = [
  '박스', '포장', '패키지', '패키징', '상자', '용기', '봉투', '쇼핑백',
  '비닐', '필름', '테이프', '완충', '에어캡', '버블', '스트레치',
  '골판지', '지류', '인쇄', '제지', '종이', '합지', '싸바리',
  'PET', 'PP', 'HDPE', 'PLA', '사출', '수지',
  '캔', '드럼', '틴', '금속캔', '알루미늄 포일',
  '친환경포장', '생분해', '재생포장', 'FSC', 'GRS',
  '식품포장', '포장재', '포장용기', '포장지',
  'packaging', 'pack', 'container', 'carton', 'bag',
  '제함', '봉함', '실링', '충전',
  '파우치', '라미네이트', '연포장',
]

const IRRELEVANT_SIGNALS = [
  '기자', '보도', '취재', '뉴스레터', '헬로티', '더구루', '푸드투데이',
  'IT동아', 'AI타임스', '이코노믹리뷰', 'Newsroom', '보도자료',
  '단독]', '인터뷰]',
  'Access Denied', 'Reference #', 'Página no encontrada', '404', 'Not Found',
  '%PDF', 'endobj',
  '게임', '플레이', '아이템', '퀘스트',
  '욕실타일', '화장실타일',
  '학생화방', '내륙운송', '해상운송', '항공운송',
  '연평균 성장률(CAGR)', 'CAGR)', 'billion by',
  '번째 후기', '번째 작업', '번째 납품',
]

const NON_HOMEPAGE_URL_PATTERNS = [
  /\/product\/[^/]+\/\d+/,
  /\/goods\/goods_view/,
  /\/goods\/goods_list/,
  /\/shop_view\//,
  /\/product\/detail/,
  /product_no=\d+/,
  /goodsNo=\d+/,
  /[?&]idx=\d+/,
  /[?&]bmode=view/,
  /[?&]prdid=\d+/,
  /\/notice\/.*bmode=/,
  /\/faq\/.*bmode=/,
  /\/\d+\/\?idx=/,
]

export function isCompanyHomepage(url: string): boolean {
  try {
    if (NON_HOMEPAGE_URL_PATTERNS.some((p) => p.test(url))) return false
    return true
  } catch {
    return true
  }
}

export function extractHomepage(url: string): string {
  try {
    const parsed = new URL(url)
    return `${parsed.protocol}//${parsed.host}/`
  } catch {
    return url
  }
}

export function isPackagingRelevant(text: string): boolean {
  const head = text.slice(0, 500)
  for (const sig of IRRELEVANT_SIGNALS) {
    if (head.includes(sig)) return false
  }
  return PACKAGING_RELEVANCE_KEYWORDS.some((kw) => text.includes(kw))
}

export function classifyCompany(text: string): ClassificationResult {
  const scores = CATEGORY_RULES.map((rule) => {
    const score = rule.keywords.reduce(
      (acc, kw) => acc + (text.includes(kw) ? 1 : 0),
      0
    )
    return { rule, score }
  })

  scores.sort((a, b) => b.score - a.score)
  const best = scores[0]

  const industryClassification = detectIndustryCategories(text)
  const printDesignSubtype = detectPrintDesignSubtype(text)

  if (best.score === 0) {
    return {
      category: 'plastic',
      subcategory: printDesignSubtype,
      confidence: 0,
      industryClassification,
      materialType: 'plastic-container',
      printDesignSubtype,
    }
  }

  const total = scores.reduce((s, x) => s + x.score, 0)
  const confidence = total > 0 ? best.score / total : 0
  const legacySubcategory = detectSubcategory(text, best.rule)

  return {
    category: best.rule.category,
    subcategory: printDesignSubtype ?? legacySubcategory,
    confidence,
    industryClassification,
    materialType: CATEGORY_TO_MATERIAL[best.rule.category],
    printDesignSubtype,
  }
}
