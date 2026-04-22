import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://packlinx.com'

  return {
    rules: [
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/api/', '/opt-out/'],
      },
      {
        userAgent: 'Yeti',
        allow: '/',
        disallow: ['/api/', '/opt-out/'],
      },
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/opt-out/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
