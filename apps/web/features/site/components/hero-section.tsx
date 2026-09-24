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
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/features/auth/hooks/use-auth"
import { posAudio } from "@/features/cashier/lib/pos-audio"
import { AppleWalletPass } from "@/components/common/apple-wallet-card"
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

            {/* Photorealistic iPhone Device Frame */}
            <div className="relative w-full max-w-[340px] sm:max-w-[355px] rounded-[3rem] p-3 sm:p-3.5 bg-gradient-to-b from-zinc-800 via-zinc-900 to-zinc-950 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] ring-1 ring-white/20 dark:ring-white/10 select-none">
              {/* Inner Screen */}
              <div className="relative rounded-[2.4rem] overflow-hidden bg-background border border-black/20 dark:border-white/10 flex flex-col">
                {/* iOS Status Bar */}
                <div className="h-10 px-5 pt-2 flex items-center justify-between text-[11px] font-semibold text-foreground/80 bg-background/80 backdrop-blur-md select-none border-b border-border/30">
                  <span>9:41</span>
                  {/* Dynamic Island */}
                  <div className="h-4 w-20 bg-black rounded-full flex items-center justify-end px-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
                  </div>
                  <div className="flex items-center gap-1.5 text-foreground/70">
                    <Signal className="w-3 h-3" />
                    <Wifi className="w-3 h-3" />
                    <Battery className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* Minimal Web Pass URL Bar */}
                <div className="flex items-center justify-between px-3.5 py-1.5 bg-muted/40 border-b border-border/40 text-[10px] text-muted-foreground">
                  <div className="flex items-center gap-1.5 font-mono">
                    <Lock className="w-2.5 h-2.5 text-emerald-500" />
                    <span>fidely.app/pass/artisan</span>
                  </div>
                  <span className="font-bold text-[9px] uppercase tracking-wider text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                    Apple / Google Wallet
                  </span>
                </div>

                {/* The In-App Digital Loyalty Pass */}
                <div className="p-3 bg-muted/20 relative">
                  {/* Optical Scanner Laser Simulation */}
                  {justScanned && (
                    <div className="absolute inset-0 pointer-events-none z-30 flex items-center justify-center">
                      <div className="w-48 h-1 bg-emerald-400 rounded-full shadow-[0_0_20px_4px_rgba(52,211,153,0.9)] animate-pulse" />
                    </div>
                  )}

                  <AppleWalletPass
                    storeName="Artisan Coffee Lab"
                    primaryColor="#B45309"
                    pointsBalance={customerPoints}
                    pointsPerTnd={3}
                    qrCodeToken="FIDELY:PASS:SARAH-8921"
                    memberName="Sarah Mitchell"
                    memberSince="May 2024"
                    rewardsCount={customerPoints >= 300 ? 1 : 0}
                    nextRewardName="Free Flat White"
                    nextRewardCost={300}
                    showQr={true}
                    interactive={true}
                    className="shadow-none border-0"
                  />
                </div>
              </div>
            </div>

            {/* Interactive "Simulate Scan" Controller */}
            <div className="w-full max-w-[340px] sm:max-w-[355px] pt-3.5 text-center space-y-2">
              <Button
                type="button"
                onClick={handleSimulateScan}
                className={`w-full h-12 rounded-2xl font-bold text-xs sm:text-sm shadow-lg transition-all active:scale-[0.98] gap-2 ${
                  justScanned
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/25 ring-2 ring-emerald-500/30"
                    : "bg-foreground hover:bg-foreground/90 text-background"
                }`}
              >
                {justScanned ? (
                  <>
                    <Check className="w-4 h-4 animate-bounce" />
                    <span>+25 Points Scanned & Awarded!</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span>Tap to Simulate Cashier Scan (+25 PTS)</span>
                  </>
                )}
              </Button>
              <p className="text-[11px] text-muted-foreground flex items-center justify-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 opacity-70" />
                <span>Interactive app preview • Tap the (i) on pass to flip</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
