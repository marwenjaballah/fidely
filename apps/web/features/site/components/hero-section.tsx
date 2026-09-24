import React, { useState } from "react"
import Link from "next/link"
import {
  ArrowRight,
  Play,
  Smartphone,
  Zap,
  Check,
  Signal,
  Wifi,
  Battery,
  Lock,
  Coffee,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/features/auth/hooks/use-auth"
import { posAudio } from "@/features/cashier/lib/pos-audio"
import { QRCodeSVG } from "qrcode.react"
import { useI18n } from "@/lib/i18n"

export function HeroSection() {
  const { isAuthenticated, profile } = useAuth()
  const { t } = useI18n()
  const [customerPoints, setCustomerPoints] = useState(240)
  const [justScanned, setJustScanned] = useState(false)

  const handleSimulateScan = () => {
    posAudio.playSuccess()
    setCustomerPoints((prev) => prev + 25)
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
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold shadow-2xs">
              <span className="flex h-2 w-2 rounded-full bg-primary animate-ping" />
              <span>{t('landing_badge') || 'Modern Digital Loyalty'}</span>
              <span className="text-muted-foreground hidden sm:inline">• Web Native</span>
            </div>

            {/* High-Impact Punchy Title */}
            <h1 className="text-4xl sm:text-6xl xl:text-7xl font-black tracking-tight leading-[1.05] text-foreground">
              {t('landing_title_main')}{" "}
              <span className="text-primary">
                {t('landing_title_highlight')}.
              </span>
            </h1>

            {/* Crisp Subtitle */}
            <p className="text-base sm:text-lg text-muted-foreground max-w-xl leading-relaxed font-normal">
              {t('landing_description')}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
              <Button
                asChild
                size="lg"
                className="h-14 px-8 text-base font-bold rounded-2xl bg-foreground hover:bg-foreground/90 text-background shadow-xl hover:shadow-2xl transition-all duration-200 active:scale-[0.98] gap-2"
              >
                <Link href={startHref}>
                  <span>{isAuthenticated ? t('nav_dashboard') : t('landing_cta_primary')}</span>
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-14 px-6 text-base font-semibold rounded-2xl border-border/80 hover:bg-muted/60 transition-all duration-200 active:scale-[0.98]"
              >
                <a href="#how-it-works">
                  <Play className="h-4 w-4 mr-2 text-primary" />
                  <span>See How It Works</span>
                </a>
              </Button>
            </div>

            {/* Trust Signals */}
            <div className="grid grid-cols-3 gap-6 pt-4 border-t border-border/50 max-w-lg">
              <div>
                <div className="text-2xl sm:text-3xl font-black text-foreground font-mono">&lt; 1s</div>
                <div className="text-xs text-muted-foreground font-medium">Checkout Scan</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-primary font-mono">0</div>
                <div className="text-xs text-muted-foreground font-medium">App Downloads</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-amber-500 font-mono">100%</div>
                <div className="text-xs text-muted-foreground font-medium">Hardware-Free</div>
              </div>
            </div>
          </div>

          {/* Right Column: In-App Code-Generated Mobile Screenshot (Customer Digital Pass) */}
          <div className="lg:col-span-5 flex flex-col items-center relative">
            {/* Ambient Store Glow Backdrop */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-gradient-to-tr from-amber-500/25 via-primary/20 to-emerald-500/15 blur-3xl -z-10 pointer-events-none" />

            {/* Photorealistic iPhone Device Frame (Authentic iPhone 16 Pro Dimensions & Silhouette - Scaled Up) */}
            <div className="relative w-[310px] sm:w-[335px] h-[650px] sm:h-[695px] rounded-[3.5rem] p-3 sm:p-3.5 bg-gradient-to-b from-zinc-800 via-zinc-900 to-zinc-950 shadow-[0_30px_70px_-15px_rgba(0,0,0,0.6)] ring-1 ring-white/15 dark:ring-white/10 select-none flex flex-col justify-between">
              {/* iPhone Hardware Side Buttons */}
              <div className="absolute -left-[3.5px] top-28 w-[3.5px] h-8 bg-zinc-700 rounded-l-xs" />
              <div className="absolute -left-[3.5px] top-40 w-[3.5px] h-12 bg-zinc-700 rounded-l-xs" />
              <div className="absolute -left-[3.5px] top-56 w-[3.5px] h-12 bg-zinc-700 rounded-l-xs" />
              <div className="absolute -right-[3.5px] top-36 w-[3.5px] h-16 bg-zinc-700 rounded-r-xs" />

              {/* Inner Screen */}
              <div className="relative w-full h-full rounded-[2.75rem] overflow-hidden bg-background border border-black/30 dark:border-white/10 flex flex-col justify-between">
                {/* iOS Status Bar */}
                <div className="h-11 px-6 pt-2.5 flex items-center justify-between text-[11px] font-semibold text-foreground/80 bg-background select-none shrink-0">
                  <span>9:41</span>
                  {/* Dynamic Island */}
                  <div className="h-5 w-24 bg-black rounded-full flex items-center justify-end px-2.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
                  </div>
                  <div className="flex items-center gap-1.5 text-foreground/70">
                    <Signal className="w-3 h-3" />
                    <Wifi className="w-3 h-3" />
                    <Battery className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* Minimal Web Pass URL Bar */}
                <div className="flex items-center justify-between px-4 py-1.5 bg-muted/40 border-y border-border/40 text-[10px] text-muted-foreground shrink-0">
                  <div className="flex items-center gap-1.5 font-mono">
                    <Lock className="w-2.5 h-2.5 text-emerald-500" />
                    <span>fidely.app/pass</span>
                  </div>
                </div>

                {/* The In-App Digital Loyalty Pass (Fits 100% Inside Phone with Zero Clipping) */}
                <div className="flex-1 p-3 sm:p-3.5 flex flex-col items-center justify-center bg-zinc-950/40 select-none">
                  <div className="w-full max-w-[270px] sm:max-w-[285px] rounded-[24px] text-white shadow-2xl relative overflow-hidden border border-white/20 bg-gradient-to-b from-amber-600 via-amber-700 to-amber-900 transition-all">
                    {/* Ambient Lighting Highlight */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.25),transparent_50%)] pointer-events-none" />

                    {/* Card Header */}
                    <div className="px-4 py-2.5 flex items-center justify-between border-b border-white/10 relative z-10">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="h-8 w-8 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center font-bold text-sm shrink-0 shadow-xs border border-white/25">
                          <Coffee className="h-4 w-4 text-white" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[9px] font-bold tracking-widest uppercase text-white/70 leading-none">
                            Loyalty Pass
                          </p>
                          <h3 className="text-xs font-black tracking-tight truncate text-white mt-0.5">
                            Artisan Coffee Lab
                          </h3>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[8px] font-bold uppercase tracking-wider text-white/70">Rate</p>
                        <p className="text-[10px] font-extrabold text-white">3 pts / 1 TND</p>
                      </div>
                    </div>

                    {/* Points & Member Status */}
                    <div className="px-4 py-2.5 flex items-baseline justify-between relative z-10">
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-widest text-white/75">
                          Current Balance
                        </p>
                        <div className="flex items-baseline gap-1.5 mt-0.5">
                          <span className="text-3xl font-black tracking-tight text-white font-mono drop-shadow-xs">
                            {customerPoints}
                          </span>
                          <span className="text-xs font-bold uppercase tracking-wider text-white/80">PTS</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-white/20 text-white backdrop-blur-xs border border-white/20">
                          <Sparkles className="w-2.5 h-2.5 text-amber-300" />
                          {customerPoints >= 300 ? "Reward Ready!" : "Gold Member"}
                        </span>
                      </div>
                    </div>

                    {/* Next Perk Goal Progress */}
                    <div className="px-4 pb-2.5 relative z-10 space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-white/90">
                        <span className="font-semibold">Target: Free Flat White</span>
                        <span className="font-mono font-bold text-[9px]">
                          {customerPoints >= 300 ? "Unlocked! 🎉" : `${300 - customerPoints} pts left`}
                        </span>
                      </div>
                      <div className="w-full bg-black/25 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-white h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, (customerPoints / 300) * 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Signature Perforated Apple Wallet Notch Line */}
                    <div className="relative h-3.5 flex items-center justify-between z-10">
                      <div className="h-3.5 w-2 rounded-r-full bg-zinc-950/60 border-r border-white/10 -ms-[1px]" />
                      <div className="flex-1 border-b border-dashed border-white/25 mx-2" />
                      <div className="h-3.5 w-2 rounded-l-full bg-zinc-950/60 border-l border-white/10 -me-[1px]" />
                    </div>

                    {/* QR Presentation Zone */}
                    <div className="p-3 pt-2 flex flex-col items-center justify-center text-center relative z-10">
                      <div className="p-2.5 bg-white rounded-2xl shadow-lg border border-white/30 relative">
                        {/* Optical Scanner Laser Animation */}
                        {justScanned && (
                          <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none z-20 flex items-center justify-center">
                            <div className="w-full h-1 bg-emerald-500 shadow-[0_0_15px_4px_rgba(16,185,129,0.9)] animate-pulse" />
                          </div>
                        )}
                        <QRCodeSVG
                          value="FIDELY:PASS:SARAH-8921"
                          size={110}
                          level="M"
                          includeMargin={false}
                        />
                        <p className="text-[8px] font-bold text-slate-800 tracking-wider uppercase mt-1">
                          Sarah Mitchell • Member
                        </p>
                      </div>
                      <p className="text-[10px] text-white/80 font-medium mt-2">
                        Present at counter to scan & earn
                      </p>
                    </div>
                  </div>
                </div>

                {/* iOS Home Indicator Bar */}
                <div className="py-2.5 flex justify-center shrink-0 bg-background">
                  <div className="w-32 h-1 bg-foreground/25 rounded-full" />
                </div>
              </div>
            </div>

            {/* Interactive "Simulate Scan" Controller */}
            <div className="w-[310px] sm:w-[335px] pt-3.5 text-center space-y-1.5">
              <Button
                type="button"
                onClick={handleSimulateScan}
                className={`w-full h-12 rounded-2xl font-bold text-xs sm:text-sm shadow-lg transition-all active:scale-[0.98] gap-2 ${justScanned
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/25 ring-2 ring-emerald-500/30"
                    : "bg-foreground hover:bg-foreground/90 text-background"
                  }`}
              >
                {justScanned ? (
                  <>
                    <Check className="w-4 h-4 animate-bounce" />
                    <span>+25 Points Awarded!</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span>Tap to Simulate Scan (+25 PTS)</span>
                  </>
                )}
              </Button>
              <p className="text-[11px] text-muted-foreground flex items-center justify-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 opacity-70" />
                <span>Interactive preview • Tap (i) on pass to flip</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
