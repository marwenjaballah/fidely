"use client"

import { X, Check, Coffee, Zap, Smartphone, Sparkles, ShieldAlert, ShieldCheck } from "lucide-react"
import { Badge } from "@/components/ui/badge"

const COMPARISONS = [
  {
    feature: "Customer Friction",
    oldWay: "Forcing app downloads from App Store or physical paper cards left in jeans pockets.",
    fidelyWay: "Zero app install. 1-tap browser QR scan saves directly to Fidely Wallet.",
  },
  {
    feature: "POS Hardware Costs",
    oldWay: "$2,500+ clunky proprietary touchscreen registers and annual maintenance fees.",
    fidelyWay: "Zero extra hardware. Any phone, iPad, or laptop camera is your high-speed scanner.",
  },
  {
    feature: "Checkout Queue Speed",
    oldWay: "Baristas manually search phone numbers, punch stamps, or enter 10-digit codes.",
    fidelyWay: "Sub-second camera QR scan with instant audio register chime confirmation.",
  },
  {
    feature: "Voucher Fraud & Duplication",
    oldWay: "Paper stamps get forged or customers take screenshots of generic coupon codes.",
    fidelyWay: "Cryptographic 1-time single-use vouchers burn instantly upon barista scan.",
  },
  {
    feature: "Customer Re-engagement",
    oldWay: "You have zero contact info and cannot reach customers once they walk out the door.",
    fidelyWay: "Native lock-screen notifications and real-time pass points balance updates.",
  },
]

export function ComparisonSection() {
  return (
    <section className="py-20 md:py-28 border-b border-border/60 bg-background relative">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs font-bold">
            The Difference
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-foreground">
            Why Cafes Are Ditching Paper & Heavy POS
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base">
            See why modern coffee shops and retail boutiques replace paper punch cards with Fidely.
          </p>
        </div>

        {/* Side-by-Side Comparison Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* The Old Way */}
          <div className="rounded-[2.5rem] border border-rose-500/20 bg-rose-500/[0.03] p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center font-bold">
                <X className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">The Old Clunky Way</h3>
                <p className="text-xs text-muted-foreground">Paper cards & expensive hardware</p>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              {COMPARISONS.map((c, i) => (
                <div key={i} className="flex items-start gap-3 text-xs leading-relaxed text-muted-foreground">
                  <div className="w-5 h-5 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0 mt-0.5">
                    <X className="w-3 h-3" />
                  </div>
                  <div>
                    <strong className="text-foreground block">{c.feature}</strong>
                    <span>{c.oldWay}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* The Fidely Way */}
          <div className="rounded-[2.5rem] border-2 border-emerald-500/40 bg-emerald-500/[0.04] p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-500/20">
                  <Check className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">The Fidely Way</h3>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                    Fidely Wallet + Instant Camera POS
                  </p>
                </div>
              </div>
              <Badge className="bg-emerald-500 text-white font-bold text-[10px] uppercase">
                Modern Standard
              </Badge>
            </div>

            <div className="space-y-4 pt-2">
              {COMPARISONS.map((c, i) => (
                <div key={i} className="flex items-start gap-3 text-xs leading-relaxed text-foreground">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3" />
                  </div>
                  <div>
                    <strong className="text-foreground block font-bold">{c.feature}</strong>
                    <span className="text-muted-foreground">{c.fidelyWay}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
