"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/features/auth/hooks/use-auth"
import { FidelyLogo } from "@/components/common/fidely-logo"
import { HeroSection } from "./hero-section"
import { BentoFeatures } from "./bento-features"
import { StepFlowSection } from "./step-flow-section"
import { FaqSection } from "./faq-section"
import { CtaSection } from "./cta-section"

/**
 * HomePageContent - Streamlined, Product-Led Landing Page for Fidely
 * Eliminates generic AI-generated text walls in favor of visual UI previews,
 * concise human copy, and responsive, tactile interactions.
 */
export function HomePageContent() {
  const router = useRouter()
  const { profile, isAuthenticated, hasHydrated } = useAuth()

  // Immediate synchronous check to prevent landing page flicker if session exists
  const [isCheckingAuth, setIsCheckingAuth] = useState(() => {
    if (typeof window === "undefined") return false
    try {
      const key = process.env.NEXT_PUBLIC_APP_AUTH_STORAGE_KEY ?? "app.auth"
      const stored = localStorage.getItem(key)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (parsed?.state?.profile) return true
      }
      if (document.cookie.includes("user_role=")) return true
    } catch {
      return false
    }
    return false
  })

  useEffect(() => {
    if (!hasHydrated) return

    if (isAuthenticated && profile) {
      switch (profile.role) {
        case "SUPER_ADMIN":
          router.replace("/admin/overview")
          break
        case "MERCHANT":
          router.replace("/merchant/overview")
          break
        case "CASHIER":
          router.replace("/cashier")
          break
        case "CUSTOMER":
        default:
          router.replace("/customer/overview")
          break
      }
    } else {
      setIsCheckingAuth(false)
    }
  }, [hasHydrated, isAuthenticated, profile, router])

  if (isCheckingAuth || (hasHydrated && isAuthenticated && profile)) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <div className="animate-pulse">
          <FidelyLogo size="lg" />
        </div>
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="flex flex-col w-full overflow-x-hidden scroll-smooth">
      {/* 1. Hero with Live Interactive POS Phone Mockup */}
      <HeroSection />

      {/* 2. Core Product Pillars: Web-Native Pass, 1s Camera POS, Fraud-Proof Perks */}
      <BentoFeatures />

      {/* 3. 3-Step Visual Experience ("How It Works") */}
      <StepFlowSection />

      {/* 4. 4 Direct, Essential FAQs */}
      <FaqSection />

      {/* 5. Minimalist, Confident Closing CTA */}
      <CtaSection />
    </div>
  )
}
