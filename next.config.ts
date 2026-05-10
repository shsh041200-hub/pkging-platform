import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co', pathname: '/storage/v1/object/public/**' },
    ],
  },
  async rewrites() {
    return [
      // PACAA-360: sitemap shard handler lives at /sitemaps/[id] to avoid
      // Next.js internal metadata routing conflict at app/sitemap/. Public
      // URL /sitemap/:id is preserved via this rewrite.
      {
        source: '/sitemap/:id',
        destination: '/sitemaps/:id',
      },
    ]
  },
  async redirects() {
    return [
      // PACAA-201: brief spec used plural slug; actual published route is singular
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'packlinx.com' }],
        destination: 'https://www.packlinx.com/:path*',
        permanent: true,
      },
      {
        source: '/categories/eco-special',
        destination: '/categories?eco=true',
        permanent: true,
      },
      {
        source: "/guides/plastic-containers-guide",
        destination: "/guides/plastic-container-guide",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
