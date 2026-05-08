// Hand-off interface for Backend (see ADR-001 §Hand-off Interface for Backend)
// Keyword metadata is now served from the keyword_pages Supabase table (PACAA-288).
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

function getClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is not set");
  }
  // cache: 'no-store' bypasses Next.js data cache so ISR pages always get
  // fresh Supabase data instead of a stale cached response from a prior build.
  return createClient(url, key, {
    global: {
      fetch: (input, init) =>
        fetch(input as RequestInfo, { ...(init as RequestInit), cache: "no-store" }),
    },
  });
}

export async function listKeywordSlugs(): Promise<string[]> {
  const supabase = getClient();
  const { data, error } = await supabase
    .from("keyword_pages")
    .select("slug")
    .eq("is_active", true)
    .order("slug");

  if (error) {
    console.error("[keyword-data] Failed to list slugs:", error);
    return [];
  }
  return (data ?? []).map((row: { slug: string }) => row.slug);
}

export async function listKeywordIndex(): Promise<Array<{ slug: string; titleKo: string }>> {
  const supabase = getClient();
  const { data, error } = await supabase
    .from("keyword_pages")
    .select("slug, title_ko")
    .eq("is_active", true)
    .neq("slug", "test-keyword")
    .order("slug");

  if (error) {
    console.error("[keyword-data] Failed to list keyword index:", error);
    return [];
  }
  return (data ?? []).map((row: { slug: string; title_ko: string }) => ({
    slug: row.slug,
    titleKo: row.title_ko,
  }));
}

export async function getKeywordPage(
  slug: string
): Promise<KeywordPageData | null> {
  const supabase = getClient();

  const { data: meta, error: metaError } = await supabase
    .from("keyword_pages")
    .select("slug, title_ko, description_ko, category")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (metaError || !meta) {
    if (metaError) console.error("[keyword-data] keyword_pages query error:", metaError);
    return null;
  }

  const { data: companies, error: vendorError } = await supabase
    .from("companies")
    .select(
      "id, name, city, province, website, subcategory, is_verified, updated_at"
    )
    .eq("category", meta.category)
    .eq("is_hidden", false)
    .order("is_verified", { ascending: false })
    .order("updated_at", { ascending: false })
    .limit(20);

  if (vendorError) {
    console.error("[keyword-data] Supabase error:", vendorError);
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
    titleKo: meta.title_ko,
    descriptionKo: meta.description_ko,
    canonicalPath: `/keywords/${slug}`,
    vendors,
    updatedAt,
  };
}
