import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { createSupabaseServer } from "@/lib/supabase-server";
import type { Vendor, KeywordPageData } from "@/lib/keyword-data";
import { PacklinxLogo } from "@/components/PacklinxLogo";
import { SiteHeader } from "@/components/SiteHeader";
import { BusinessRegistrationInfo } from "@/components/BusinessRegistrationInfo";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://packlinx.vercel.app";

// force-dynamic: render fresh on every request.
// ISR (revalidate=21600) caused build-time null caches → stale 404 for 6 hours.
// Switched to service-role client (no custom fetch wrapper) to avoid Next.js 15
// RSC fetch-patching interaction that caused anon-key client to return null.
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

async function fetchKeywordPage(slug: string): Promise<KeywordPageData | null> {
  const supabase = createSupabaseServer();

  const { data: meta, error: metaError } = await supabase
    .from("keyword_pages")
    .select("slug, title_ko, description_ko, category")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (metaError || !meta) {
    if (metaError) console.error("[keyword-page] keyword_pages query error:", metaError);
    return null;
  }

  const { data: companies, error: vendorError } = await supabase
    .from("companies")
    .select("id, name, city, province, website, subcategory, is_verified, updated_at")
    .eq("category", meta.category)
    .eq("is_hidden", false)
    .order("is_verified", { ascending: false })
    .order("updated_at", { ascending: false })
    .limit(20);

  if (vendorError) {
    console.error("[keyword-page] companies query error:", vendorError);
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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug);
  const data = await fetchKeywordPage(slug);

  if (!data) return { title: "페이지 없음" };

  const canonicalUrl = `${siteUrl}${data.canonicalPath}`;
  return {
    title: data.titleKo,
    description: data.descriptionKo,
    keywords: [slug.replace(/-/g, ' ')],
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: data.titleKo,
      description: data.descriptionKo,
      url: canonicalUrl,
      siteName: "Packlinx",
      locale: "ko_KR",
      type: "website",
    },
  };
}

export default async function KeywordPage({ params }: Props) {
  const { slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug);
  const data = await fetchKeywordPage(slug);

  if (!data) notFound();

  const canonicalUrl = `${siteUrl}${data.canonicalPath}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ItemList",
        name: data.titleKo,
        description: data.descriptionKo,
        url: canonicalUrl,
        numberOfItems: data.vendors.length,
        itemListElement: data.vendors.map((v, i) => ({
          "@type": "ListItem",
          position: i + 1,
          item: {
            "@type": "Organization",
            "@id": `${canonicalUrl}#vendor-${v.id}`,
            name: v.name,
            areaServed: v.region,
            knowsAbout: v.categories,
            ...(v.url ? { url: v.url } : {}),
          },
        })),
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <SiteHeader />

      {/* Hero */}
      <section className="bg-neutral-900 border-b border-white/[0.06] py-10 px-5 sm:px-8">
        <div className="max-w-4xl mx-auto">
          <nav className="text-sm text-slate-500 mb-4">
            <Link href="/keywords" className="hover:text-slate-300 transition-colors">키워드 디렉터리</Link>
            <span className="mx-2 text-slate-600">/</span>
            <span className="text-slate-300">{data.titleKo}</span>
          </nav>
          <h1 className="text-[26px] sm:text-[32px] font-bold text-white leading-tight tracking-[-0.02em] mb-2">
            {data.titleKo}
          </h1>
          <p className="text-slate-400 text-[15px] leading-relaxed max-w-xl">
            {data.descriptionKo}
          </p>
          {data.vendors.length > 0 && (
            <p className="text-[13px] text-stripe-purple font-semibold mt-3">
              {data.vendors.length}개 업체
            </p>
          )}
        </div>
      </section>

      {/* Vendor Grid */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-5 sm:px-8 py-10">
        {data.vendors.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.vendors.map((vendor) => (
              <article
                key={vendor.id}
                className="bg-white border border-border-v04 rounded-xl p-5 hover:border-stripe-purple/30 hover:shadow-elevated-v04 transition-all duration-200"
              >
                <h2 className="text-[15px] font-semibold text-gray-900 mb-1 leading-snug">
                  {vendor.url ? (
                    <a
                      href={vendor.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-stripe-purple transition-colors"
                    >
                      {vendor.name}
                    </a>
                  ) : (
                    vendor.name
                  )}
                </h2>
                {vendor.region && (
                  <p className="text-[13px] text-body-secondary mb-2">{vendor.region}</p>
                )}
                {vendor.categories.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {vendor.categories.map((cat) => (
                      <span
                        key={cat}
                        className="text-[11px] font-medium bg-info-50 text-info-600 px-2 py-0.5 rounded"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                )}
              </article>
            ))}
          </div>
        ) : (
          <div className="text-center py-24">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="text-gray-600 font-semibold mb-1.5 text-[15px]">업체를 수집 중입니다</p>
            <p className="text-gray-400 text-sm mb-5">해당 키워드의 포장 업체를 지속적으로 확보하고 있습니다.</p>
            <Link href="/keywords" className="text-sm text-stripe-purple font-medium hover:underline underline-offset-4">
              전체 키워드 목록 보기 &rarr;
            </Link>
          </div>
        )}

        <div className="mt-12 text-center">
          <p className="text-[13px] text-gray-400 mb-4">더 많은 업체를 찾고 계신가요?</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-stripe-purple hover:bg-stripe-purple-hover text-white font-semibold px-6 py-3 rounded-lg text-[14px] transition-colors"
          >
            전체 업체 검색하기
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] bg-neutral-900 mt-auto">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-col gap-2">
              <PacklinxLogo variant="dark" layout="horizontal" />
              <p className="text-[12px] text-slate-400 leading-relaxed">
                © 2026 PACKLINX. 본 서비스의 업체 정보는 공개된 출처에서 자동 수집되었습니다.<br className="hidden sm:inline" />
                정보 오류·삭제 요청: rpdla041200@gmail.com
              </p>
              <BusinessRegistrationInfo theme="dark" />
            </div>
            <div className="flex gap-5 text-[12px] text-slate-400">
              <Link href="/keywords" className="hover:text-slate-200 transition-colors">키워드 디렉터리</Link>
              <Link href="/guides" className="hover:text-slate-200 transition-colors">패키징 가이드</Link>
              <Link href="/privacy" className="hover:text-slate-200 transition-colors">개인정보처리방침</Link>
              <Link href="/terms" className="hover:text-slate-200 transition-colors">이용약관</Link>
              <Link href="/opt-out?type=takedown" className="hover:text-slate-200 transition-colors">권리침해 신고</Link>
              <Link href="/faq#what-is-jeongbo-deungrok" className="hover:text-slate-200 transition-colors">Packlinx 자체 등록 기준 안내</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
