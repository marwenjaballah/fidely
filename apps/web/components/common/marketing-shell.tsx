"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { Navbar } from "@/components/common/navbar"
import { Footer } from "@/components/common/footer"

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
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
