import type { Metadata } from 'next'
import { Geist, Noto_Serif, Fira_Code } from "next/font/google";
import './globals.css'
import { ThemeProvider } from "@/components/common/theme-provider"
import { Toaster } from "sonner"
import { I18nProvider } from "@repo/i18n"

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

export const metadata: Metadata = {
  title: 'Fidely Admin - Platform Governance & Control Console',
  description: 'Global ecosystem supervision, tenant stores management, user accounts, and real-time transaction audit logs.',
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
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
            {children}
            <Toaster position="top-right" richColors />
          </ThemeProvider>
        </I18nProvider>
      </body>
    </html>
  )
}
