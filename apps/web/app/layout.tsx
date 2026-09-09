import type { Metadata } from 'next'
import { Geist, Noto_Serif, Fira_Code } from "next/font/google";
import './globals.css'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from "@/components/common/theme-provider"
import { strings } from '@/lib/strings'

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

export const metadata: Metadata = {
  metadataBase: metadataBaseUrl(),
  title: {
    default: strings.app_name,
    template: `%s | ${strings.app_name}`,
  },
  description: siteDescription,
  applicationName: strings.app_name,
  manifest: '/manifest.json',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: strings.app_name,
    title: strings.app_name,
    description: siteDescription,
  },
  twitter: {
    card: 'summary_large_image',
    title: strings.app_name,
    description: siteDescription,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: strings.app_name,
  },
  formatDetection: {
    telephone: false,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="scroll-smooth">
      <body
        className={`${fontSans.variable} ${fontSerif.variable} ${fontMono.variable} font-sans antialiased`}
      >
        <ThemeProvider>
          {children}
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
