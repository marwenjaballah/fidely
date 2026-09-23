import { MetadataRoute } from 'next'

function getBaseUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_APP_URL?.trim()
  if (explicit) return explicit.endsWith('/') ? explicit.slice(0, -1) : explicit
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return 'https://fidely.app'
}

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getBaseUrl()
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/docs',
          '/privacy',
          '/terms',
          '/auth/login',
          '/auth/sign-up',
          '/store/',
        ],
        disallow: [
          '/admin/',
          '/merchant/',
          '/cashier/',
          '/customer/',
          '/api/',
          '/_next/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
