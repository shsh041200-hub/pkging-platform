import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enforce ISR revalidation interval (seconds). Backend can lower via on-demand revalidation.
  // This is a page-level default; individual pages may override.
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
