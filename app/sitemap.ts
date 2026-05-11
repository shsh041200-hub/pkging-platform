import type { MetadataRoute } from "next";
import { listKeywordSlugs } from "@/lib/keyword-data";
import { listGuideSlugs } from "@/lib/guide-data";
import { INDUSTRY_CATEGORIES } from "@/types";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://packlinx.vercel.app";

export const revalidate = 21600;

const BLOG_POSTS = [
  {
    slug: "2026-korea-packaging-trends",
    lastModified: new Date("2026-05-07"),
  },
  {
    slug: "packaging-rfq-guide",
    lastModified: new Date("2026-05-08"),
  },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const slugs = await listKeywordSlugs();
  const guideSlugs = listGuideSlugs();

  // Compare pairs are handled in sitemaps/[id]/route.ts shard 0 (PACAA-348).
  // Public URL /sitemap/0 → next.config.js rewrite → /sitemaps/0 (PACAA-360).
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
    {
      url: `${siteUrl}/faq`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    },
    {
      url: `${siteUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: "yearly" as const,
      priority: 0.3,
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
  ];
}
