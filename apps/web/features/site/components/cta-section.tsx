"use client"

import Link from "next/link"
import { ArrowRight, Sparkles, CheckCircle2 } from "lucide-react"
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
    <section className="py-20 md:py-28 relative overflow-hidden border-b border-border/60 bg-background">
      <div className="container relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl border border-border/80 bg-card p-8 sm:p-12 text-center shadow-xl space-y-6 overflow-hidden">
          {/* Top Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Setup in under 2 minutes • No credit card required</span>
          </div>

          {/* Heading */}
          <div className="space-y-3 max-w-xl mx-auto">
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-foreground leading-tight">
              Start Rewarding Your Regulars Today
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
              Create your branded digital pass, download your counter stand, and start rewarding customers with zero hardware costs.
            </p>
          </div>

          {/* Action Button */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Button
              asChild
              size="lg"
              className="w-full sm:w-auto h-13 px-8 rounded-2xl bg-foreground hover:bg-foreground/90 text-background font-bold text-sm shadow-xl gap-2 transition-transform active:scale-95"
            >
              <Link href={startHref}>
                <span>{isAuthenticated ? "Go to Dashboard" : "Launch Your Store Free"}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>

          {/* Guarantees */}
          <div className="flex flex-wrap items-center justify-center gap-5 pt-3 text-xs text-muted-foreground font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Zero App Installs
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Zero Extra Hardware
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Instant Setup
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
