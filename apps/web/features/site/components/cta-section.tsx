"use client"

import Link from "next/link"
import { ArrowRight, Sparkles, Coffee, ShieldCheck, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/features/auth/hooks/use-auth"

export function CtaSection() {
  const { isAuthenticated, profile } = useAuth()

  const startHref = isAuthenticated
    ? profile?.role === "MERCHANT"
      ? "/merchant/overview"
      : "/customer/overview"
    : "/auth/sign-up"

  return (
    <section className="py-20 md:py-28 relative overflow-hidden border-b border-border/60 bg-muted/30">
      <div className="container relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl border border-border/80 bg-card p-8 sm:p-14 text-center shadow-xl space-y-8 overflow-hidden">
          {/* Top Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ready in under 2 minutes • No credit card required</span>
          </div>

          {/* Heading */}
          <div className="space-y-4 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-foreground leading-tight">
              Start Rewarding Your Regulars Today
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
              Join leading specialty cafes and shops. Create your branded Fidely Wallet pass, print your acrylic counter stand, and accelerate repeat visits immediately.
            </p>
          </div>

          {/* Action Button */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Button
              asChild
              size="lg"
              className="w-full sm:w-auto h-14 px-9 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-base shadow-xl shadow-primary/25 gap-2 transition-transform active:scale-95"
            >
              <Link href={startHref}>
                <span>{isAuthenticated ? "Go to Dashboard" : "Launch Your Store Free"}</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
          </div>

          {/* Guarantees */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs text-muted-foreground font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Instant Pass Generation
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Free Acrylic Stand Canvas Export
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Unlimited Cashier Devices
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
