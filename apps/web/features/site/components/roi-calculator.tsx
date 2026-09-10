"use client"

import React, { useState } from "react"
import { TrendingUp, Sparkles, DollarSign, Users, Coffee, ArrowRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { posAudio } from "@/features/cashier/lib/pos-audio"

export function RoiCalculator() {
  const [dailyCustomers, setDailyCustomers] = useState(120)
  const [avgOrder, setAvgOrder] = useState(6.5)

  // Calculations:
  // Assuming 25% of walk-ins become loyalty members
  // They visit 2.5x more often each month
  const loyaltyMembersPerMonth = Math.round(dailyCustomers * 30 * 0.22)
  const extraMonthlyRevenue = Math.round(loyaltyMembersPerMonth * avgOrder * 1.8)
  const annualBoost = extraMonthlyRevenue * 12

  return (
    <section className="py-20 md:py-28 border-b border-border/60 bg-muted/30 relative">
      <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-xs font-bold">
            Interactive Growth Calculator
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-foreground">
            Calculate Your Extra Monthly Coffee Sales
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base">
            See how converting walk-ins into Fidely Wallet loyalty members boosts your repeat customer revenue.
          </p>
        </div>

        <div className="bg-card border border-border/80 rounded-[2.5rem] p-6 sm:p-10 shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Sliders */}
          <div className="lg:col-span-6 space-y-6">
            {/* Slider 1: Daily Orders */}
            <div className="space-y-3 bg-muted/40 p-5 rounded-2xl border border-border/40">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Daily Cups / Orders
                </span>
                <span className="text-xl font-black text-foreground">{dailyCustomers} cups / day</span>
              </div>
              <input
                type="range"
                min="30"
                max="500"
                step="10"
                value={dailyCustomers}
                onChange={(e) => {
                  setDailyCustomers(Number(e.target.value))
                }}
                className="w-full accent-emerald-500 cursor-pointer h-2 bg-muted rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground font-semibold">
                <span>30 / day (Boutique)</span>
                <span>250 / day (Busy Cafe)</span>
                <span>500+ / day (Flagship)</span>
              </div>
            </div>

            {/* Slider 2: Average Check */}
            <div className="space-y-3 bg-muted/40 p-5 rounded-2xl border border-border/40">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Average Order Total
                </span>
                <span className="text-xl font-black text-foreground">{avgOrder.toFixed(2)} TND</span>
              </div>
              <input
                type="range"
                min="2.5"
                max="25"
                step="0.5"
                value={avgOrder}
                onChange={(e) => {
                  setAvgOrder(Number(e.target.value))
                }}
                className="w-full accent-emerald-500 cursor-pointer h-2 bg-muted rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground font-semibold">
                <span>2.50 TND (Espresso)</span>
                <span>8.00 TND (Coffee + Pastry)</span>
                <span>25.00 TND (Brunch)</span>
              </div>
            </div>
          </div>

          {/* Results Summary Box */}
          <div className="lg:col-span-6 bg-emerald-700 rounded-3xl p-6 sm:p-8 text-white shadow-lg space-y-6 relative overflow-hidden">

            <div className="space-y-1">
              <div className="text-xs font-bold tracking-wider uppercase opacity-90">
                Estimated Extra Revenue
              </div>
              <div className="text-4xl sm:text-5xl font-black tracking-tight">
                +{extraMonthlyRevenue.toLocaleString()} <span className="text-xl font-bold">TND / month</span>
              </div>
              <div className="text-xs text-emerald-100 font-medium">
                ~ +{annualBoost.toLocaleString()} TND extra annual repeat revenue
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/20 text-xs">
              <div className="bg-black/15 p-3 rounded-xl backdrop-blur-xs">
                <div className="opacity-80 text-[11px]">New Members / mo</div>
                <div className="text-lg font-black mt-0.5">+{loyaltyMembersPerMonth}</div>
              </div>
              <div className="bg-black/15 p-3 rounded-xl backdrop-blur-xs">
                <div className="opacity-80 text-[11px]">Repeat Visit Boost</div>
                <div className="text-lg font-black mt-0.5">2.5x more often</div>
              </div>
            </div>

            <Button
              asChild
              className="w-full h-12 rounded-xl bg-white hover:bg-white/90 text-emerald-950 font-black text-xs sm:text-sm shadow-md transition-transform active:scale-95"
            >
              <Link href="/auth/sign-up" className="flex items-center justify-center gap-2">
                <span>Unlock This Revenue — Start Free</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
