"use client"

import Link from "next/link"
import { ArrowRight, Sparkles, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/features/auth/hooks/use-auth"
import { useI18n } from "@/lib/i18n"

export function CtaSection() {
  const { isAuthenticated, profile } = useAuth()
  const { t } = useI18n()

  const startHref = isAuthenticated
    ? profile?.role === "MERCHANT"
      ? "/merchant/overview"
      : "/customer/overview"
    : "/auth/sign-up"

  return (
    <section className="min-h-screen min-h-[100dvh] flex flex-col justify-center items-center py-16 sm:py-20 relative overflow-hidden border-b border-border/60 bg-background">
      <div className="container relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 my-auto w-full">
        <div className="relative rounded-3xl border border-border/80 bg-card p-8 sm:p-12 text-center shadow-xl space-y-6 overflow-hidden">
          {/* Top Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t('landing_final_cta_badge')}</span>
          </div>

          {/* Heading */}
          <div className="space-y-3 max-w-xl mx-auto">
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-foreground leading-tight">
              {t('landing_final_cta_title')}
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
              {t('landing_final_cta_desc')}
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
                <span>{isAuthenticated ? t('landing_cta_go_dashboard') : t('landing_cta_launch_free')}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>

          {/* Guarantees */}
          <div className="flex flex-wrap items-center justify-center gap-5 pt-3 text-xs text-muted-foreground font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              {t('landing_cta_g1')}
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              {t('landing_cta_g2')}
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              {t('landing_cta_g3')}
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
