"use client"

import {
  Smartphone,
  Zap,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useI18n } from "@/lib/i18n"

export function BentoFeatures() {
  const { t } = useI18n()

  const pillars = [
    {
      icon: Smartphone,
      title: t('landing_bento_p1_title'),
      subtitle: t('landing_bento_p1_subtitle'),
      description: t('landing_bento_p1_desc'),
      badge: t('landing_bento_p1_badge'),
      badgeColor: "bg-primary/10 text-primary border-primary/20",
      highlights: [
        t('landing_bento_p1_h1'),
        t('landing_bento_p1_h2'),
        t('landing_bento_p1_h3'),
      ],
    },
    {
      icon: Zap,
      title: t('landing_bento_p2_title'),
      subtitle: t('landing_bento_p2_subtitle'),
      description: t('landing_bento_p2_desc'),
      badge: t('landing_bento_p2_badge'),
      badgeColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
      highlights: [
        t('landing_bento_p2_h1'),
        t('landing_bento_p2_h2'),
        t('landing_bento_p2_h3'),
      ],
    },
    {
      icon: ShieldCheck,
      title: t('landing_bento_p3_title'),
      subtitle: t('landing_bento_p3_subtitle'),
      description: t('landing_bento_p3_desc'),
      badge: t('landing_bento_p3_badge'),
      badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      highlights: [
        t('landing_bento_p3_h1'),
        t('landing_bento_p3_h2'),
        t('landing_bento_p3_h3'),
      ],
    },
  ]

  return (
    <section id="features" className="min-h-screen min-h-[100dvh] flex flex-col justify-center items-center py-16 sm:py-20 border-b border-border/60 bg-muted/20 relative scroll-mt-16">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12 my-auto w-full">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs font-bold">
            {t('landing_features_badge')}
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-foreground">
            {t('landing_features_title')}
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base">
            {t('landing_features_subtitle')}
          </p>
        </div>

        {/* 3 High-Impact Product Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon
            return (
              <div
                key={idx}
                className="group relative flex flex-col justify-between p-8 rounded-3xl border border-border/70 bg-card hover:border-border hover:shadow-xl transition-all duration-300"
              >
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20 group-hover:scale-105 transition-transform">
                      <Icon className="h-6 w-6" />
                    </div>
                    <Badge variant="outline" className={`text-[11px] font-bold ${pillar.badgeColor}`}>
                      {pillar.badge}
                    </Badge>
                  </div>

                  <div className="space-y-1.5 text-left">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                      {pillar.subtitle}
                    </span>
                    <h3 className="text-xl font-black tracking-tight text-foreground">
                      {pillar.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed pt-1">
                      {pillar.description}
                    </p>
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-border/50 space-y-2 text-left">
                  {pillar.highlights.map((h, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs font-semibold text-foreground/80">
                      <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
