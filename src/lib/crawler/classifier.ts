import { type Category } from '@/types'

interface CategoryRule {
  category: Category
  keywords: string[]
  subcategoryMap: Record<string, string[]>
}

const RULES: CategoryRule[] = [
  {
    category: 'food_grade',
    keywords: ['식품', 'HACCP', 'haccp', '식품등급', '냉동', '냉장', '진공포장', '신선', '농산물', '수산물'],
    subcategoryMap: {
      '신선/농수산': ['신선', '농수산', '농산물', '수산물', '냉동', '냉장'],
      '가공식품': ['가공식품', '즉석', '레토르트', 'MAP', '실링'],
      '유기농/로컬': ['유기농', '유기', '로컬', '제주', '특산물'],
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
    category: 'metal',
    keywords: ['금속', '알루미늄', '스틸', '철', '캔', '드럼', '틴', '주석', '금속캔', '메탈'],
    subcategoryMap: {
      '음료/식품캔': ['음료캔', '식품캔', '캔'],
      '드럼/컨테이너': ['드럼', '컨테이너', '스틸드럼'],
      '알루미늄/방산': ['알루미늄', '방산', '방진'],
      '틴케이스/선물': ['틴케이스', '틴박스', '선물'],
    },
  },
  {
    category: 'plastic',
    keywords: ['플라스틱', 'PET', 'PP', 'HDPE', 'PE', '사출', '압출', '수지', '폴리'],
    subcategoryMap: {
      PET: ['PET', 'pet'],
      'PP/사출': ['PP', '사출', '트레이'],
      'HDPE/드럼': ['HDPE', '드럼'],
    },
  },
  {
    category: 'jiryu',
    keywords: ['종이', '지류', '골판지', '박스', '쇼핑백', '인쇄', '페이퍼', '제지', '단상자'],
    subcategoryMap: {
      '인쇄/출판': ['인쇄', '출판', '카탈로그'],
      '명품/프리미엄': ['명품', '프리미엄', '고급', '럭셔리'],
      '패션/라이프스타일': ['패션', '라이프스타일', '패브릭'],
    },
  },
  {
    category: 'saneobyong',
    keywords: ['산업용', '공업용', '방청', 'ESD', '팔레트', '물류', '크레이트', '완충재', '포장재', '패키징'],
    subcategoryMap: {
      '중공업/해양': ['중공업', '해양', '조선', '항만', '물류'],
      '정밀/전자': ['정밀', '전자', '반도체', 'ESD', '클린룸'],
      '목재/천연': ['목재', '원목', '왕겨', '천연'],
    },
  },
]

function detectSubcategory(text: string, rule: CategoryRule): string | null {
  for (const [sub, kws] of Object.entries(rule.subcategoryMap)) {
    if (kws.some((kw) => text.includes(kw))) return sub
  }
  return null
}

export interface ClassificationResult {
  category: Category
  subcategory: string | null
  confidence: number
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
]

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
  const scores: Array<{ rule: CategoryRule; score: number }> = RULES.map((rule) => {
    const score = rule.keywords.reduce(
      (acc, kw) => acc + (text.includes(kw) ? 1 : 0),
      0
    )
    return { rule, score }
  })

  scores.sort((a, b) => b.score - a.score)
  const best = scores[0]

  if (best.score === 0) {
    return { category: 'saneobyong', subcategory: null, confidence: 0 }
  }

  const total = scores.reduce((s, x) => s + x.score, 0)
  const confidence = total > 0 ? best.score / total : 0

  return {
    category: best.rule.category,
    subcategory: detectSubcategory(text, best.rule),
    confidence,
  }
}
