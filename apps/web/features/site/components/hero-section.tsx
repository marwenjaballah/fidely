"use client"

import React, { useState } from "react"
import Link from "next/link"
import {
  Sparkles,
  ArrowRight,
  Play,
  CheckCircle2,
  Coffee,
  Smartphone,
  Zap,
  TrendingUp,
  Check,
  Plus,
  Flame,
  Award,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/features/auth/hooks/use-auth"
import { posAudio } from "@/features/cashier/lib/pos-audio"

const QUICK_MENU = [
  { id: "1", name: "Oat Flat White", price: "4.20", pts: 42, icon: "☕" },
  { id: "2", name: "Iced Caramel Latte", price: "4.80", pts: 48, icon: "🧊" },
  { id: "3", name: "Almond Croissant", price: "3.50", pts: 35, icon: "🥐" },
]

export function HeroSection() {
  const { isAuthenticated, profile } = useAuth()
  const [selectedItem, setSelectedItem] = useState(QUICK_MENU[0])
  const [customerPoints, setCustomerPoints] = useState(240)
  const [justScanned, setJustScanned] = useState(false)
  const [scanCount, setScanCount] = useState(14)

  const handleSimulateScan = () => {
    posAudio.playSuccess()
    setCustomerPoints((prev) => prev + selectedItem.pts)
    setScanCount((prev) => prev + 1)
    setJustScanned(true)
    setTimeout(() => setJustScanned(false), 2400)
  }

  const startHref = isAuthenticated
    ? profile?.role === "MERCHANT"
      ? "/merchant/overview"
      : "/customer/overview"
    : "/auth/sign-up"

  return (
    <section className="relative overflow-hidden pt-10 pb-20 md:pt-16 md:pb-28 border-b border-border/60 bg-background">

      <div className="container relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Bold Headline & Story */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Live Ticker Tag */}
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold shadow-xs">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Turn Every Coffee Run into a Regular</span>
              <span className="text-muted-foreground hidden sm:inline">• 0 Apps to Install</span>
            </div>

            {/* High-Impact Punchy Title */}
            <h1 className="text-4xl sm:text-6xl xl:text-7xl font-black tracking-tight leading-[1.05] text-foreground">
              The Fidely Wallet Loyalty & POS for{" "}
              <span className="text-emerald-600 dark:text-emerald-400">
                Specialty Cafes.
              </span>
            </h1>

            {/* Crisp Subtitle */}
            <p className="text-base sm:text-xl text-muted-foreground max-w-xl leading-relaxed font-normal">
              No paper cards to lose. No slow App Store downloads. Customers tap their phone on your acrylic stand, get their Fidely Wallet card, and your baristas scan & reward in &lt;1 second.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
              <Button
                asChild
                size="lg"
                className="h-14 px-8 text-base font-bold rounded-2xl bg-foreground hover:bg-foreground/90 text-background shadow-xl hover:shadow-2xl transition-all duration-200 active:scale-[0.98] gap-2"
              >
                <Link href={startHref}>
                  <span>{isAuthenticated ? "Go to Dashboard" : "Launch Your Store Free"}</span>
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-14 px-6 text-base font-semibold rounded-2xl border-border/80 hover:bg-muted/60 transition-all duration-200 active:scale-[0.98]"
              >
                <a href="#interactive-playground">
                  <Play className="h-4 w-4 mr-2 text-primary" />
                  Try Live POS Simulator
                </a>
              </Button>
            </div>

            {/* Trust Signals */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border/50 max-w-lg">
              <div>
                <div className="text-2xl sm:text-3xl font-black text-foreground">0.8s</div>
                <div className="text-[11px] sm:text-xs text-muted-foreground">Checkout Scan Speed</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-emerald-500">100%</div>
                <div className="text-[11px] sm:text-xs text-muted-foreground">Browser & Wallet Native</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-amber-500">+32%</div>
                <div className="text-[11px] sm:text-xs text-muted-foreground">Repeat Customer Rate</div>
              </div>
            </div>
          </div>

          {/* Right Column: Live Interactive POS + Fidely Wallet Device Mockup */}
          <div className="lg:col-span-5 flex justify-center relative">
            {/* Floating Live Notification Badge */}
            <div className="absolute -top-6 -left-4 sm:-left-8 z-20 bg-background/90 backdrop-blur-md border border-border/80 rounded-2xl p-3 shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-lg">
                🎉
              </div>
              <div>
                <div className="text-xs font-bold text-foreground">Free Flat White Unlocked!</div>
                <div className="text-[10px] text-muted-foreground">Sarah just reached 300 PTS</div>
              </div>
            </div>

            {/* Floating Live Ticker Bottom */}
            <div className="absolute -bottom-5 -right-4 sm:-right-6 z-20 bg-background/90 backdrop-blur-md border border-border/80 rounded-2xl px-3.5 py-2.5 shadow-xl flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <div className="text-xs font-bold text-foreground">
                {scanCount} scans today at Counter 01
              </div>
            </div>

            {/* Interactive Phone Frame */}
            <div className="relative w-full max-w-[340px] sm:max-w-[360px] bg-card border-4 border-foreground/15 rounded-[2.5rem] p-5 shadow-2xl shadow-black/20 space-y-4">
              {/* Phone Speaker & Dynamic Island */}
              <div className="w-24 h-4 bg-foreground/10 rounded-full mx-auto" />

              {/* Barista Terminal Header */}
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                    <Coffee className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-black text-foreground">Artisan Coffee Lab</div>
                    <div className="text-[10px] text-muted-foreground">Barista Quick Register</div>
                  </div>
                </div>
                <Badge variant="outline" className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20">
                  Ready
                </Badge>
              </div>

              {/* Live Menu Selector (Interactive) */}
              <div className="space-y-1.5">
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Tap to Add to Order:
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {QUICK_MENU.map((item) => {
                    const isSelected = selectedItem.id === item.id
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          posAudio.playClick()
                          setSelectedItem(item)
                        }}
                        className={`p-2 rounded-xl text-left border transition-all ${
                          isSelected
                            ? "bg-primary/10 border-primary text-foreground shadow-xs scale-105"
                            : "bg-muted/40 border-border/60 text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        <div className="text-base">{item.icon}</div>
                        <div className="text-[11px] font-bold truncate mt-1">{item.name}</div>
                        <div className="text-[10px] font-extrabold text-foreground">{item.price} TND</div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Live Customer Digital Pass Widget */}
              <div className="rounded-2xl bg-amber-600 p-4 text-white shadow-md space-y-3 relative overflow-hidden">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold tracking-wider uppercase opacity-80">Fidely Wallet Pass</span>
                  <Badge variant="outline" className="text-[10px] font-black bg-white/20 text-white border-none">
                    Gold Member
                  </Badge>
                </div>

                <div className="flex items-end justify-between pt-1">
                  <div>
                    <div className="text-[10px] opacity-80 uppercase">Sarah Mitchell</div>
                    <div className="text-2xl font-black">{customerPoints} PTS</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] opacity-80">Next: Free Coffee</div>
                    <div className="text-xs font-bold">300 PTS</div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-black/20 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-white h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (customerPoints / 300) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Scan Action Button with Tactile Feedback */}
              <Button
                onClick={handleSimulateScan}
                className={`w-full h-12 rounded-xl font-black text-xs sm:text-sm shadow-md transition-all active:scale-95 gap-2 ${
                  justScanned
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                    : "bg-primary hover:bg-primary/90 text-primary-foreground"
                }`}
              >
                {justScanned ? (
                  <>
                    <Check className="w-4 h-4 animate-bounce" />
                    <span>+{selectedItem.pts} Points Credited!</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>Tap to Charge {selectedItem.price} TND & Award Points</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
