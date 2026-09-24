import type { Metadata, Viewport } from 'next'
import { Geist, Noto_Serif, Fira_Code } from "next/font/google";
import './globals.css'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from "@/components/common/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { strings } from '@/lib/strings'
import { BRAND_LOGO_SRC } from '@/lib/brand'
import { I18nProvider } from "@/lib/i18n"
import { PwaRegister } from "@/components/pwa/pwa-register"
import { PWAInstallPrompt } from "@/components/pwa/pwa-install-prompt"

function metadataBaseUrl(): URL {
  const explicit = process.env.NEXT_PUBLIC_APP_URL?.trim()
  if (explicit) {
    return new URL(explicit.endsWith('/') ? explicit.slice(0, -1) : explicit)
  }
  if (process.env.VERCEL_URL) {
    return new URL(`https://${process.env.VERCEL_URL}`)
  }
  return new URL('http://localhost:3001')
}

const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontSerif = Noto_Serif({
  subsets: ["latin"],
  variable: "--font-serif",
});

const fontMono = Fira_Code({
  subsets: ["latin"],
  variable: "--font-mono",
});

const siteDescription = strings.landing_description

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#09090b' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export const metadata: Metadata = {
  metadataBase: metadataBaseUrl(),
  title: {
    default: 'Fidely — Universal Digital Loyalty & Rewards Platform',
    template: `%s | Fidely`,
  },
  description: siteDescription,
  applicationName: 'Fidely',
  keywords: [
    'digital loyalty card',
    'customer loyalty program',
    'cafe loyalty pass',
    'mobile loyalty card',
    'pwa loyalty pass',
    'cashier scanner pos',
    'restaurant rewards system',
    'digital punch card',
    'customer retention software',
    'fidely',
  ],
  authors: [{ name: 'Fidely Team', url: 'https://fidely.app' }],
  creator: 'Fidely',
  publisher: 'Fidely',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  alternates: {
    canonical: '/',
    languages: {
      en: '/',
      fr: '/',
      ar: '/',
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    alternateLocale: ['fr_FR', 'ar_TN'],
    url: '/',
    siteName: 'Fidely',
    title: 'Fidely — Turn First-Time Buyers into Lifelong Regulars',
    description: siteDescription,
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'Fidely — Universal Digital Loyalty & Rewards Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Fidely — Universal Digital Loyalty & Rewards Platform',
    description: siteDescription,
    images: ['/opengraph-image'],
    creator: '@fidely_app',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Fidely',
  },
  formatDetection: {
    telephone: false,
  },
}

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://fidely.app/#organization",
      name: "Fidely",
      url: "https://fidely.app",
      logo: {
        "@type": "ImageObject",
        url: "https://fidely.app/icon.svg",
        width: 512,
        height: 512,
      },
      sameAs: ["https://twitter.com/fidely_app", "https://github.com/marwenjaballah/fidely"],
      description: "Universal digital loyalty card and customer rewards platform for modern cafes, retail, and hospitality.",
    },
    {
      "@type": "WebSite",
      "@id": "https://fidely.app/#website",
      url: "https://fidely.app",
      name: "Fidely",
      publisher: {
        "@id": "https://fidely.app/#organization",
      },
    },
    {
      "@type": "SoftwareApplication",
      name: "Fidely Loyalty POS",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web, iOS, Android",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      description: "Digital customer loyalty passes, counter QR stands, and sub-second handheld cashier POS scanning terminal.",
    },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="scroll-smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${fontSans.variable} ${fontSerif.variable} ${fontMono.variable} font-sans antialiased`}
      >
        <I18nProvider>
          <ThemeProvider>
            <PwaRegister />
            {children}
            <PWAInstallPrompt />
            <Toaster />
          </ThemeProvider>
        </I18nProvider>
        <Analytics />
      </body>
    </html>
  )
}
