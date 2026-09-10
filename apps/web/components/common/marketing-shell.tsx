"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { SiteHeader } from "@/features/site/components/site-header"
import { SiteFooter } from "@/features/site/components/site-footer"

export function MarketingShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  useEffect(() => {
    if (pathname !== "/") return
    const hash = typeof window !== "undefined" ? window.location.hash.slice(1) : ""
    if (!hash) return
    const frame = requestAnimationFrame(() => {
      document.getElementById(hash)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    })
    return () => cancelAnimationFrame(frame)
  }, [pathname])

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  )
}
