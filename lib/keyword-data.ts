// Hand-off interface for Backend (see ADR-001 §Hand-off Interface for Backend)
// Backend replaces the stub bodies below with Supabase queries.
// The page, sitemap, and API route layers must never be modified for this change to work.

import { createClient } from "@supabase/supabase-js";

export type Vendor = {
  id: string;
  name: string;       // Korean
  region: string;
  categories: string[];
  url?: string;
};

export type KeywordPageData = {
  slug: string;
  titleKo: string;
  descriptionKo: string;
  canonicalPath: string;   // e.g. "/keywords/corrugated-box-suppliers"
  vendors: Vendor[];       // ≥10 expected; <5 means do not index
  updatedAt: string;       // ISO; drives ISR revalidate
};

// companies.category values used in Supabase
type CompanyCategory = "paper" | "plastic" | "flexible" | "eco" | "glass" | "metal";

type KeywordMeta = {
  titleKo: string;
  descriptionKo: string;
  /** Maps to companies.category — the vendor pool for this keyword. */
  category: CompanyCategory;
};

// Keyword slug → metadata registry.
// category mapping: category_key → companies.category (CTO decision, PACAA-134 comment a5053f4c)
//   corrugated_box/label_sticker/packaging_accessories/printing_postprocess → paper
//   flexible_packaging → flexible | plastic_container → plastic
//   glass_metal_container → glass | packaging_machinery → paper (fallback, no machinery category)
// Future: replace with keyword_pages Supabase table (migration deferred per CTO Option B).
const KEYWORD_REGISTRY: Record<string, KeywordMeta> = {
  // ── test ─────────────────────────────────────────────────────────────────
  "test-keyword": {
    titleKo: "테스트 키워드 포장재 공급업체",
    descriptionKo:
      "국내 최고의 테스트 키워드 관련 포장재 공급업체를 한눈에 비교하세요. " +
      "제조사 직접 연결, 가격 투명화, 신뢰 기반 매칭 서비스를 제공합니다.",
    category: "paper",
  },
  // ── corrugated_box → paper ────────────────────────────────────────────────
  "골판지박스-제작": {
    titleKo: "골판지박스 제작 전문 업체 비교",
    descriptionKo: "국내 골판지박스 제작 전문 업체를 한눈에 비교하세요. 제조사 직접 연결, 가격 투명화, 신뢰 기반 매칭 서비스를 제공합니다.",
    category: "paper",
  },
  "택배박스-제작": {
    titleKo: "택배박스 제작 전문 업체 비교",
    descriptionKo: "국내 택배박스 제작 전문 업체를 한눈에 비교하세요. 제조사 직접 연결, 가격 투명화, 신뢰 기반 매칭 서비스를 제공합니다.",
    category: "paper",
  },
  "박스-견적": {
    titleKo: "박스 견적 전문 업체 비교",
    descriptionKo: "국내 박스 견적 전문 업체를 한눈에 비교하세요. 제조사 직접 연결, 가격 투명화, 신뢰 기반 매칭 서비스를 제공합니다.",
    category: "paper",
  },
  "소량-박스-제작": {
    titleKo: "소량 박스 제작 전문 업체 비교",
    descriptionKo: "국내 소량 박스 제작 전문 업체를 한눈에 비교하세요. 제조사 직접 연결, 가격 투명화, 신뢰 기반 매칭 서비스를 제공합니다.",
    category: "paper",
  },
  "박스-주문제작": {
    titleKo: "박스 주문제작 전문 업체 비교",
    descriptionKo: "국내 박스 주문제작 전문 업체를 한눈에 비교하세요. 제조사 직접 연결, 가격 투명화, 신뢰 기반 매칭 서비스를 제공합니다.",
    category: "paper",
  },
  "택배박스-도매": {
    titleKo: "택배박스 도매 전문 업체 비교",
    descriptionKo: "국내 택배박스 도매 전문 업체를 한눈에 비교하세요. 제조사 직접 연결, 가격 투명화, 신뢰 기반 매칭 서비스를 제공합니다.",
    category: "paper",
  },
  "주문제작-박스": {
    titleKo: "주문제작 박스 전문 업체 비교",
    descriptionKo: "국내 주문제작 박스 전문 업체를 한눈에 비교하세요. 제조사 직접 연결, 가격 투명화, 신뢰 기반 매칭 서비스를 제공합니다.",
    category: "paper",
  },
  "우체국택배박스-가격": {
    titleKo: "우체국택배박스 가격 — 국내 업체 비교",
    descriptionKo: "국내 우체국택배박스 가격 비교 전문 업체를 한눈에 비교하세요. 제조사 직접 연결, 가격 투명화, 신뢰 기반 매칭 서비스를 제공합니다.",
    category: "paper",
  },
  "종이박스-제작": {
    titleKo: "종이박스 제작 전문 업체 비교",
    descriptionKo: "국내 종이박스 제작 전문 업체를 한눈에 비교하세요. 제조사 직접 연결, 가격 투명화, 신뢰 기반 매칭 서비스를 제공합니다.",
    category: "paper",
  },
  // ── label_sticker → paper ─────────────────────────────────────────────────
  "라벨-스티커-제작": {
    titleKo: "라벨 스티커 제작 전문 업체 비교",
    descriptionKo: "국내 라벨 스티커 제작 전문 업체를 한눈에 비교하세요. 제조사 직접 연결, 가격 투명화, 신뢰 기반 매칭 서비스를 제공합니다.",
    category: "paper",
  },
  "스티커-인쇄-업체": {
    titleKo: "국내 스티커 인쇄 업체 비교",
    descriptionKo: "국내 스티커 인쇄 업체를 한눈에 비교하세요. 제조사 직접 연결, 가격 투명화, 신뢰 기반 매칭 서비스를 제공합니다.",
    category: "paper",
  },
  "의류-라벨-제작": {
    titleKo: "의류 라벨 제작 전문 업체 비교",
    descriptionKo: "국내 의류 라벨 제작 전문 업체를 한눈에 비교하세요. 제조사 직접 연결, 가격 투명화, 신뢰 기반 매칭 서비스를 제공합니다.",
    category: "paper",
  },
  "소량-스티커-제작": {
    titleKo: "소량 스티커 제작 전문 업체 비교",
    descriptionKo: "국내 소량 스티커 제작 전문 업체를 한눈에 비교하세요. 제조사 직접 연결, 가격 투명화, 신뢰 기반 매칭 서비스를 제공합니다.",
    category: "paper",
  },
  "방수-스티커-제작": {
    titleKo: "방수 스티커 제작 전문 업체 비교",
    descriptionKo: "국내 방수 스티커 제작 전문 업체를 한눈에 비교하세요. 제조사 직접 연결, 가격 투명화, 신뢰 기반 매칭 서비스를 제공합니다.",
    category: "paper",
  },
  "홀로그램-스티커-제작": {
    titleKo: "홀로그램 스티커 제작 전문 업체 비교",
    descriptionKo: "국내 홀로그램 스티커 제작 전문 업체를 한눈에 비교하세요. 제조사 직접 연결, 가격 투명화, 신뢰 기반 매칭 서비스를 제공합니다.",
    category: "paper",
  },
  "스티커-제작": {
    titleKo: "스티커 제작 전문 업체 비교",
    descriptionKo: "국내 스티커 제작 전문 업체를 한눈에 비교하세요. 제조사 직접 연결, 가격 투명화, 신뢰 기반 매칭 서비스를 제공합니다.",
    category: "paper",
  },
  "스티커-주문제작": {
    titleKo: "스티커 주문제작 전문 업체 비교",
    descriptionKo: "국내 스티커 주문제작 전문 업체를 한눈에 비교하세요. 제조사 직접 연결, 가격 투명화, 신뢰 기반 매칭 서비스를 제공합니다.",
    category: "paper",
  },
  // ── flexible_packaging → flexible ─────────────────────────────────────────
  "비닐-포장지-제작": {
    titleKo: "비닐 포장지 제작 전문 업체 비교",
    descriptionKo: "국내 비닐 포장지 제작 전문 업체를 한눈에 비교하세요. 제조사 직접 연결, 가격 투명화, 신뢰 기반 매칭 서비스를 제공합니다.",
    category: "flexible",
  },
  "지퍼백-제작": {
    titleKo: "지퍼백 제작 전문 업체 비교",
    descriptionKo: "국내 지퍼백 제작 전문 업체를 한눈에 비교하세요. 제조사 직접 연결, 가격 투명화, 신뢰 기반 매칭 서비스를 제공합니다.",
    category: "flexible",
  },
  "비닐-봉투-도매": {
    titleKo: "비닐 봉투 도매 전문 업체 비교",
    descriptionKo: "국내 비닐 봉투 도매 전문 업체를 한눈에 비교하세요. 제조사 직접 연결, 가격 투명화, 신뢰 기반 매칭 서비스를 제공합니다.",
    category: "flexible",
  },
  "비닐봉투-제작": {
    titleKo: "비닐봉투 제작 전문 업체 비교",
    descriptionKo: "국내 비닐봉투 제작 전문 업체를 한눈에 비교하세요. 제조사 직접 연결, 가격 투명화, 신뢰 기반 매칭 서비스를 제공합니다.",
    category: "flexible",
  },
  "편지봉투-제작": {
    titleKo: "편지봉투 제작 전문 업체 비교",
    descriptionKo: "국내 편지봉투 제작 전문 업체를 한눈에 비교하세요. 제조사 직접 연결, 가격 투명화, 신뢰 기반 매칭 서비스를 제공합니다.",
    category: "flexible",
  },
  "지퍼백-도매": {
    titleKo: "지퍼백 도매 전문 업체 비교",
    descriptionKo: "국내 지퍼백 도매 전문 업체를 한눈에 비교하세요. 제조사 직접 연결, 가격 투명화, 신뢰 기반 매칭 서비스를 제공합니다.",
    category: "flexible",
  },
  "OPP봉투-제작": {
    titleKo: "OPP봉투 제작 전문 업체 비교",
    descriptionKo: "국내 OPP봉투 제작 전문 업체를 한눈에 비교하세요. 제조사 직접 연결, 가격 투명화, 신뢰 기반 매칭 서비스를 제공합니다.",
    category: "flexible",
  },
  // ── plastic_container → plastic ───────────────────────────────────────────
  "플라스틱-용기-제작": {
    titleKo: "플라스틱 용기 제작 전문 업체 비교",
    descriptionKo: "국내 플라스틱 용기 제작 전문 업체를 한눈에 비교하세요. 제조사 직접 연결, 가격 투명화, 신뢰 기반 매칭 서비스를 제공합니다.",
    category: "plastic",
  },
  "화장품-펌프-용기": {
    titleKo: "화장품 펌프 용기 전문 업체 비교",
    descriptionKo: "국내 화장품 펌프 용기 전문 업체를 한눈에 비교하세요. 제조사 직접 연결, 가격 투명화, 신뢰 기반 매칭 서비스를 제공합니다.",
    category: "plastic",
  },
  "화장품-용기-제작": {
    titleKo: "화장품 용기 제작 전문 업체 비교",
    descriptionKo: "국내 화장품 용기 제작 전문 업체를 한눈에 비교하세요. 제조사 직접 연결, 가격 투명화, 신뢰 기반 매칭 서비스를 제공합니다.",
    category: "plastic",
  },
  "공병-가격": {
    titleKo: "공병 가격 — 국내 업체 비교",
    descriptionKo: "국내 공병 가격 비교 전문 업체를 한눈에 비교하세요. 제조사 직접 연결, 가격 투명화, 신뢰 기반 매칭 서비스를 제공합니다.",
    category: "plastic",
  },
  "화장품-용기-업체": {
    titleKo: "국내 화장품 용기 업체 비교",
    descriptionKo: "국내 화장품 용기 업체를 한눈에 비교하세요. 제조사 직접 연결, 가격 투명화, 신뢰 기반 매칭 서비스를 제공합니다.",
    category: "plastic",
  },
  "플라스틱-용기-제조업체": {
    titleKo: "국내 플라스틱 용기 제조업체 비교",
    descriptionKo: "국내 플라스틱 용기 제조업체를 한눈에 비교하세요. 제조사 직접 연결, 가격 투명화, 신뢰 기반 매칭 서비스를 제공합니다.",
    category: "plastic",
  },
  // ── packaging_accessories → paper ────────────────────────────────────────
  "종이-쇼핑백-제작": {
    titleKo: "종이 쇼핑백 제작 전문 업체 비교",
    descriptionKo: "국내 종이 쇼핑백 제작 전문 업체를 한눈에 비교하세요. 제조사 직접 연결, 가격 투명화, 신뢰 기반 매칭 서비스를 제공합니다.",
    category: "paper",
  },
  "박스-테이프-제작": {
    titleKo: "박스 테이프 제작 전문 업체 비교",
    descriptionKo: "국내 박스 테이프 제작 전문 업체를 한눈에 비교하세요. 제조사 직접 연결, 가격 투명화, 신뢰 기반 매칭 서비스를 제공합니다.",
    category: "paper",
  },
  "마스킹테이프-제작": {
    titleKo: "마스킹테이프 제작 전문 업체 비교",
    descriptionKo: "국내 마스킹테이프 제작 전문 업체를 한눈에 비교하세요. 제조사 직접 연결, 가격 투명화, 신뢰 기반 매칭 서비스를 제공합니다.",
    category: "paper",
  },
  "테이프-제작": {
    titleKo: "테이프 제작 전문 업체 비교",
    descriptionKo: "국내 테이프 제작 전문 업체를 한눈에 비교하세요. 제조사 직접 연결, 가격 투명화, 신뢰 기반 매칭 서비스를 제공합니다.",
    category: "paper",
  },
  "테이프-주문제작": {
    titleKo: "테이프 주문제작 전문 업체 비교",
    descriptionKo: "국내 테이프 주문제작 전문 업체를 한눈에 비교하세요. 제조사 직접 연결, 가격 투명화, 신뢰 기반 매칭 서비스를 제공합니다.",
    category: "paper",
  },
  "테이프-공장": {
    titleKo: "테이프 공장 전문 업체 비교",
    descriptionKo: "국내 테이프 공장 전문 업체를 한눈에 비교하세요. 제조사 직접 연결, 가격 투명화, 신뢰 기반 매칭 서비스를 제공합니다.",
    category: "paper",
  },
  // ── printing_postprocess → paper ─────────────────────────────────────────
  "UV-인쇄": {
    titleKo: "UV 인쇄 전문 업체 비교",
    descriptionKo: "국내 UV 인쇄 전문 업체를 한눈에 비교하세요. 제조사 직접 연결, 가격 투명화, 신뢰 기반 매칭 서비스를 제공합니다.",
    category: "paper",
  },
  "시트지-인쇄": {
    titleKo: "시트지 인쇄 전문 업체 비교",
    descriptionKo: "국내 시트지 인쇄 전문 업체를 한눈에 비교하세요. 제조사 직접 연결, 가격 투명화, 신뢰 기반 매칭 서비스를 제공합니다.",
    category: "paper",
  },
  "인쇄물-제작": {
    titleKo: "인쇄물 제작 전문 업체 비교",
    descriptionKo: "국내 인쇄물 제작 전문 업체를 한눈에 비교하세요. 제조사 직접 연결, 가격 투명화, 신뢰 기반 매칭 서비스를 제공합니다.",
    category: "paper",
  },
  "DTF-인쇄": {
    titleKo: "DTF 인쇄 전문 업체 비교",
    descriptionKo: "국내 DTF 인쇄 전문 업체를 한눈에 비교하세요. 제조사 직접 연결, 가격 투명화, 신뢰 기반 매칭 서비스를 제공합니다.",
    category: "paper",
  },
  "비닐-인쇄": {
    titleKo: "비닐 인쇄 전문 업체 비교",
    descriptionKo: "국내 비닐 인쇄 전문 업체를 한눈에 비교하세요. 제조사 직접 연결, 가격 투명화, 신뢰 기반 매칭 서비스를 제공합니다.",
    category: "paper",
  },
  "박스-인쇄": {
    titleKo: "박스 인쇄 전문 업체 비교",
    descriptionKo: "국내 박스 인쇄 전문 업체를 한눈에 비교하세요. 제조사 직접 연결, 가격 투명화, 신뢰 기반 매칭 서비스를 제공합니다.",
    category: "paper",
  },
  // ── glass_metal_container → glass ────────────────────────────────────────
  "유리병-제작": {
    titleKo: "유리병 제작 전문 업체 비교",
    descriptionKo: "국내 유리병 제작 전문 업체를 한눈에 비교하세요. 제조사 직접 연결, 가격 투명화, 신뢰 기반 매칭 서비스를 제공합니다.",
    category: "glass",
  },
  "유리병-도매": {
    titleKo: "유리병 도매 전문 업체 비교",
    descriptionKo: "국내 유리병 도매 전문 업체를 한눈에 비교하세요. 제조사 직접 연결, 가격 투명화, 신뢰 기반 매칭 서비스를 제공합니다.",
    category: "glass",
  },
  "유리병-구매": {
    titleKo: "유리병 구매 전문 업체 비교",
    descriptionKo: "국내 유리병 구매 전문 업체를 한눈에 비교하세요. 제조사 직접 연결, 가격 투명화, 신뢰 기반 매칭 서비스를 제공합니다.",
    category: "glass",
  },
  "캔음료-제작": {
    titleKo: "캔음료 제작 전문 업체 비교",
    descriptionKo: "국내 캔음료 제작 전문 업체를 한눈에 비교하세요. 제조사 직접 연결, 가격 투명화, 신뢰 기반 매칭 서비스를 제공합니다.",
    category: "glass",
  },
  // ── packaging_machinery → paper (fallback, no machinery category) ─────────
  "진공포장기-가격": {
    titleKo: "진공포장기 가격 — 국내 장비 공급업체",
    descriptionKo: "국내 진공포장기 전문 장비 공급업체를 한눈에 비교하세요. 제조사 직접 연결, 가격 투명화, 신뢰 기반 매칭 서비스를 제공합니다.",
    category: "paper",
  },
  "진공포장기": {
    titleKo: "진공포장기 전문 장비 공급업체",
    descriptionKo: "국내 진공포장기 전문 장비 공급업체를 한눈에 비교하세요. 제조사 직접 연결, 가격 투명화, 신뢰 기반 매칭 서비스를 제공합니다.",
    category: "paper",
  },
  "실링기": {
    titleKo: "실링기 전문 장비 공급업체",
    descriptionKo: "국내 실링기 전문 장비 공급업체를 한눈에 비교하세요. 제조사 직접 연결, 가격 투명화, 신뢰 기반 매칭 서비스를 제공합니다.",
    category: "paper",
  },
  "자동테이핑기": {
    titleKo: "자동테이핑기 전문 장비 공급업체",
    descriptionKo: "국내 자동테이핑기 전문 장비 공급업체를 한눈에 비교하세요. 제조사 직접 연결, 가격 투명화, 신뢰 기반 매칭 서비스를 제공합니다.",
    category: "paper",
  },
};

function getClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is not set");
  }
  return createClient(url, key);
}

export async function listKeywordSlugs(): Promise<string[]> {
  return Object.keys(KEYWORD_REGISTRY);
}

export async function getKeywordPage(
  slug: string
): Promise<KeywordPageData | null> {
  const meta = KEYWORD_REGISTRY[slug];
  if (!meta) return null;

  const supabase = getClient();

  const { data: companies, error } = await supabase
    .from("companies")
    .select(
      "id, name, city, province, website, subcategory, is_verified, updated_at"
    )
    .eq("category", meta.category)
    .eq("is_hidden", false)
    .order("is_verified", { ascending: false })
    .order("updated_at", { ascending: false })
    .limit(20);

  if (error) {
    console.error("[keyword-data] Supabase error:", error);
    return null;
  }

  const vendors: Vendor[] = (companies ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    region: [c.city, c.province].filter(Boolean).join(" "),
    categories: c.subcategory ? [c.subcategory] : [],
    url: c.website ?? undefined,
  }));

  const updatedAt =
    companies && companies.length > 0
      ? companies[0].updated_at
      : new Date().toISOString();

  return {
    slug,
    titleKo: meta.titleKo,
    descriptionKo: meta.descriptionKo,
    canonicalPath: `/keywords/${slug}`,
    vendors,
    updatedAt,
  };
}
