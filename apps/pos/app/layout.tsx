import type { Metadata, Viewport } from 'next'
import { Geist, Noto_Serif, Fira_Code } from "next/font/google";
import './globals.css'
import { ThemeProvider } from "@/components/common/theme-provider"
import { Toaster } from "sonner"
import { I18nProvider } from "@repo/i18n"
import { PwaRegister } from "@/components/pwa/pwa-register"
import { PWAInstallPrompt } from "@/components/pwa/pwa-install-prompt"

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
  title: 'Fidely POS Terminal',
  description: 'Handheld cashier terminal for QR loyalty scans, points issuing, and reward redemptions.',
  applicationName: 'Fidely POS',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Fidely POS',
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
        <I18nProvider>
          <ThemeProvider>
            <PwaRegister />
            {children}
            <PWAInstallPrompt />
            <Toaster position="top-center" richColors />
          </ThemeProvider>
        </I18nProvider>
      </body>
    </html>
  )
}
