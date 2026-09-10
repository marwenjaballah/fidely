"use client"

import {
  Smartphone,
  Zap,
  Printer,
  ShieldCheck,
  Users,
  TrendingUp,
  Gift,
  QrCode,
  Lock,
  Sparkles,
  Layers,
  Award,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

const FEATURES = [
  {
    icon: Smartphone,
    title: "Native Fidely Wallet Passes",
    description:
      "Zero App Store friction. Customers add your branded loyalty pass directly to Fidely Wallet or their mobile home screen in a single tap.",
    badge: "0 App Downloads",
    badgeColor: "bg-primary/10 text-primary border-primary/20",
  },
  {
    icon: Zap,
    title: "1-Second Optical POS Scanner",
    description:
      "Transform any iPad, smartphone, or laptop camera into an ultra-fast register scanner with real-time audio-tactile chime confirmation.",
    badge: "< 1s Checkout",
    badgeColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  },
  {
    icon: Printer,
    title: "Printable Acrylic Stand Generator",
    description:
      "Export high-resolution 1200×1600px counter stands with your brand colors and custom QR code ready for physical acrylic table tents.",
    badge: "Print Ready",
    badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
  {
    icon: Gift,
    title: "1-Time Single-Use Vouchers",
    description:
      "Burn vouchers instantly upon barista scan. Prevents duplicate reward claims and provides 100% transparent redemption logs.",
    badge: "Zero Fraud",
    badgeColor: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  },
  {
    icon: Lock,
    title: "Cross-Store & Shift Security",
    description:
      "Multi-store isolation, PIN-protected cashier shift terminals, and mismatch detection stop unauthorized point transfers.",
    badge: "Enterprise Grade",
    badgeColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  },
  {
    icon: TrendingUp,
    title: "Referral & Channel Attribution",
    description:
      "Know exactly how many regulars joined through your counter stand QR vs organic peer invites with real-time acquisition charts.",
    badge: "Live Telemetry",
    badgeColor: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  },
]

export function BentoFeatures() {
  return (
    <section id="features" className="py-20 md:py-28 border-b border-border/60 bg-muted/30 relative">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs font-bold">
            Built for Modern Retail
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-foreground">
            Engineered for Speed, Beauty, and Retention
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base">
            Every feature was designed specifically to eliminate checkout delays, reward regular guests, and boost your monthly cafe revenue.
          </p>
        </div>

        {/* 6-Card Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feat, idx) => {
            const Icon = feat.icon
            return (
              <Card
                key={idx}
                className="group relative overflow-hidden border-border/60 bg-card hover:border-border transition-all duration-300 hover:shadow-lg hover:-translate-y-1 rounded-3xl"
              >
                <CardHeader className="space-y-4 pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted border border-border/60 text-foreground group-hover:scale-105 transition-transform">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <Badge variant="outline" className={`text-[11px] font-bold ${feat.badgeColor}`}>
                      {feat.badge}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl font-bold tracking-tight text-foreground">
                    {feat.title}
                  </CardTitle>
                </CardHeader>

                <CardContent>
                  <CardDescription className="text-sm text-muted-foreground leading-relaxed">
                    {feat.description}
                  </CardDescription>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
