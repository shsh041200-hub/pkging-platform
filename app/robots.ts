import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://packlinx.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/internal/",
        "/*?industry=*",
        "/*?material=*",
        "/*?form=*",
        "/*?cert=*",
        "/*?moq=*",
        "/*?leadtime=*",
        "/*?cold=*",
        "/*?print=*",
        "/*?coldretention=*",
        "/*?dryice=*",
        "/*?sample=*",
        "/*?q=*",
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
