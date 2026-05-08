import type { MetadataRoute } from "next";
import { listKeywordSlugs } from "@/lib/keyword-data";
import { listGuideSlugs } from "@/lib/guide-data";
import { listVerifiedCompanyStubs } from "@/lib/compare-data";
import { INDUSTRY_CATEGORIES } from "@/types";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://packlinx.vercel.app";

export const revalidate = 21600;

const BLOG_POSTS = [
  {
    slug: "2026-korea-packaging-trends",
    lastModified: new Date("2026-05-07"),
  },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const slugs = await listKeywordSlugs();
  const guideSlugs = listGuideSlugs();
  const verifiedStubs = await listVerifiedCompanyStubs();

  // Build all 2-way pairs of verified companies (alphabetically sorted, capped at 500).
  // Cap policy: verified vendors only, max 500 pairs. Revisit with CTO if vendor count grows.
  const comparePairs: MetadataRoute.Sitemap = [];
  outer: for (let i = 0; i < verifiedStubs.length; i++) {
    for (let j = i + 1; j < verifiedStubs.length; j++) {
      const [a, b] = [verifiedStubs[i].slug, verifiedStubs[j].slug].sort();
      comparePairs.push({
        url: `${siteUrl}/compare/${a}-vs-${b}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.7,
      });
      if (comparePairs.length >= 500) break outer;
    }
  }

  return [
    { url: siteUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    {
      url: `${siteUrl}/categories`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    },
    ...INDUSTRY_CATEGORIES.map((cat) => ({
      url: `${siteUrl}/categories/${cat}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.85,
    })),
    {
      url: `${siteUrl}/guides`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    },
    ...BLOG_POSTS.map((post) => ({
      url: `${siteUrl}/blog/${post.slug}`,
      lastModified: post.lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...guideSlugs.map((slug) => ({
      url: `${siteUrl}/guides/${slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...slugs.map((slug) => ({
      url: `${siteUrl}/keywords/${slug}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
    ...comparePairs,
  ];
}
