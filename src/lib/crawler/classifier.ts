import { type Category, type CompanyTag } from '@/types'

interface CategoryRule {
  category: Category
  keywords: string[]
  subcategoryMap: Record<string, string[]>
}

interface TagRule {
  tag: CompanyTag
  keywords: string[]
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

const TAG_RULES: TagRule[] = [
  {
    tag: 'food_grade',
    keywords: ['식품', 'HACCP', 'haccp', '식품등급', '냉동', '냉장', '진공포장', '신선', '농산물', '수산물', '식품용', '식품포장'],
  },
  {
    tag: 'industrial',
    keywords: ['산업용', '공업용', '방청', 'ESD', '팔레트', '물류', '크레이트', '완충재', '산업포장', '중공업', '정밀부품'],
  },
  {
    tag: 'cosmetic',
    keywords: ['화장품', '코스메틱', '뷰티', '스킨케어', '메이크업', '향수', '화장품용기'],
  },
  {
    tag: 'pharma',
    keywords: ['제약', '의약품', '의료', '약품', '블리스터', 'pharma', 'GMP'],
  },
  {
    tag: 'design_service',
    keywords: ['패키지 디자인', '패키징 디자인', '디자인 서비스', '브랜딩', '디자인 에이전시', '디자인 스튜디오', '라벨 디자인'],
  },
  {
    tag: 'ecommerce',
    keywords: ['이커머스', '온라인 쇼핑', '언박싱', 'D2C', '배송박스', '쿠팡', '스마트스토어'],
  },
]

function detectSubcategory(text: string, rule: CategoryRule): string | null {
  for (const [sub, kws] of Object.entries(rule.subcategoryMap)) {
    if (kws.some((kw) => text.includes(kw))) return sub
  }
  return null
}

function detectTags(text: string): CompanyTag[] {
  return TAG_RULES
    .filter((rule) => rule.keywords.some((kw) => text.includes(kw)))
    .map((rule) => rule.tag)
}

export interface ClassificationResult {
  category: Category
  subcategory: string | null
  confidence: number
  tags: CompanyTag[]
}

// Broad packaging relevance keywords — any one match means the page is likely packaging-related
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

// Signals that strongly indicate a non-packaging page (news, error, games, etc.)
const IRRELEVANT_SIGNALS = [
  // News/media
  '기자', '보도', '취재', '뉴스레터', '헬로티', '더구루', '푸드투데이',
  'IT동아', 'AI타임스', '이코노믹리뷰', 'Newsroom', '보도자료',
  '단독]', '인터뷰]',
  // Error pages
  'Access Denied', 'Reference #', 'Página no encontrada', '404', 'Not Found',
  // PDFs / binary content
  '%PDF', 'endobj',
  // Clearly unrelated domains/topics
  '게임', '플레이', '아이템', '퀘스트',
  '욕실타일', '화장실타일',
  '학생화방', '내륙운송', '해상운송', '항공운송',
  // Market research signals
  '연평균 성장률(CAGR)', 'CAGR)', 'billion by',
  // Blog / case-study openers that appear near the start of non-vendor pages
  '번째 후기', '번째 작업', '번째 납품',
]

// URL patterns that indicate a product/blog/FAQ page rather than a company homepage
const NON_HOMEPAGE_URL_PATTERNS = [
  /\/product\/[^/]+\/\d+/,     // /product/{slug}/{id}
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
  /\/\d+\/\?idx=/,             // Naver blog-style: /27/?idx=20
]

export function isCompanyHomepage(url: string): boolean {
  try {
    const parsed = new URL(url)
    // A homepage URL has a short path (just "/" or nothing meaningful)
    const path = parsed.pathname
    if (NON_HOMEPAGE_URL_PATTERNS.some((p) => p.test(url))) return false
    // Allow paths that look like category or section pages (not product/article IDs)
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
  // Reject if strong irrelevant signals appear in a short span near the start
  const head = text.slice(0, 500)
  for (const sig of IRRELEVANT_SIGNALS) {
    if (head.includes(sig)) return false
  }
  // Accept if at least one packaging keyword appears anywhere in the text
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

  const tags = detectTags(text)

  if (best.score === 0) {
    return { category: 'plastic', subcategory: null, confidence: 0, tags }
  }

  const total = scores.reduce((s, x) => s + x.score, 0)
  const confidence = total > 0 ? best.score / total : 0

  return {
    category: best.rule.category,
    subcategory: detectSubcategory(text, best.rule),
    confidence,
    tags,
  }
}
