"use client"

import {
  Smartphone,
  Zap,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  QrCode,
  Coffee,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"

const PILLARS = [
  {
    icon: Smartphone,
    title: "Web-Native Loyalty Passes",
    subtitle: "For Customers",
    description: "Zero App Store downloads. Customers scan to join and save their branded card directly to their browser or phone home screen.",
    badge: "0 App Installs",
    badgeColor: "bg-primary/10 text-primary border-primary/20",
    highlights: ["Instant browser access", "Live points balance", "Custom brand theme"],
  },
  {
    icon: Zap,
    title: "1-Second Camera Register",
    subtitle: "For Cashiers & Baristas",
    description: "Any phone, iPad, or laptop camera works as your high-speed scanner with instant audio chime confirmation at checkout.",
    badge: "< 1s Scan Speed",
    badgeColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    highlights: ["Works on any device", "Instant chime confirmation", "Offline-resilient"],
  },
  {
    icon: ShieldCheck,
    title: "Fraud-Proof Single-Use Perks",
    subtitle: "For Store Owners",
    description: "Cryptographic 1-time vouchers burn instantly upon cashier scan, preventing duplicate claims or screenshot sharing.",
    badge: "100% Tamper Proof",
    badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    highlights: ["Auto-burning tokens", "Real-time ledger audit", "Multi-store protection"],
  },
]

export function BentoFeatures() {
  return (
    <section id="features" className="py-20 md:py-28 border-b border-border/60 bg-muted/20 relative">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs font-bold">
            Built for Real-World Retail
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-foreground">
            Everything You Need. Nothing You Don't.
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base">
            No bulky hardware, no customer friction, and no complex training.
          </p>
        </div>

        {/* 3 High-Impact Product Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PILLARS.map((pillar, idx) => {
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
