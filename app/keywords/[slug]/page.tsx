import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createSupabaseServer } from "@/lib/supabase-server";
import type { Vendor, KeywordPageData } from "@/lib/keyword-data";

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
  const { slug } = await params;
  const data = await fetchKeywordPage(slug);

  if (!data) return { title: "페이지 없음" };

  const canonicalUrl = `${siteUrl}${data.canonicalPath}`;
  return {
    title: data.titleKo,
    description: data.descriptionKo,
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
  const { slug } = await params;
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
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main>
        <h1>{data.titleKo}</h1>
        <p className="description">{data.descriptionKo}</p>
        <div className="vendor-grid">
          {data.vendors.map((vendor) => (
            <div key={vendor.id} className="vendor-card">
              <h2>
                {vendor.url ? (
                  <a href={vendor.url} target="_blank" rel="noopener noreferrer">
                    {vendor.name}
                  </a>
                ) : (
                  vendor.name
                )}
              </h2>
              <p className="region">{vendor.region}</p>
              <div className="categories">
                {vendor.categories.map((cat) => (
                  <span key={cat} className="tag">
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
