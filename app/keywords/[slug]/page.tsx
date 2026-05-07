import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getKeywordPage, listKeywordSlugs } from "@/lib/keyword-data";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://packlinx.vercel.app";

// ISR: revalidate every 6 hours. Backend can trigger on-demand revalidation via
// the Next.js revalidatePath API after Supabase writes.
export const revalidate = 21600;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const slugs = await listKeywordSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await getKeywordPage(slug);

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
  const data = await getKeywordPage(slug);

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
