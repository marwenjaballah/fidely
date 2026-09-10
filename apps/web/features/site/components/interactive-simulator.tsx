"use client"

import React, { useState } from "react"
import { QRCodeSVG } from "qrcode.react"
import {
  Smartphone,
  Zap,
  Printer,
  TrendingUp,
  RotateCcw,
  Sparkles,
  Coffee,
  CheckCircle2,
  Sliders,
  DollarSign,
  ArrowRight,
  ShieldCheck,
  Award,
  Users,
  Eye,
  Layers,
  ChevronRight,
  Flame,
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { AppleWalletPass } from "@/components/common/apple-wallet-card"
import { posAudio } from "@/features/cashier/lib/pos-audio"

const COLOR_PRESETS = [
  { name: "Caramel Amber", color: "#D97706" },
  { name: "Dark Espresso", color: "#4A2C2A" },
  { name: "Terracotta", color: "#EA580C" },
  { name: "Forest Matcha", color: "#059669" },
  { name: "Cobalt Blue", color: "#2563EB" },
  { name: "Velvet Berry", color: "#9333EA" },
]

export function InteractiveSimulator() {
  // Live customization state
  const [storeName, setStoreName] = useState("Artisan Roast & Co.")
  const [accentColor, setAccentColor] = useState("#D97706")
  const [customerPoints, setCustomerPoints] = useState(380)

  // POS Scanner State
  const [posAmount, setPosAmount] = useState("14.50")
  const [scanStatus, setScanStatus] = useState<"idle" | "awarded">("idle")
  const [lastTx, setLastTx] = useState<{ amount: number; pts: number; time: string } | null>(null)

  const handleColorChange = (col: string) => {
    posAudio.playClick()
    setAccentColor(col)
  }

  const handleNumpad = (val: string) => {
    posAudio.playClick()
    if (val === "C") {
      setPosAmount("0")
    } else if (val === ".") {
      if (!posAmount.includes(".")) setPosAmount(posAmount + ".")
    } else {
      if (posAmount === "0") setPosAmount(val)
      else if (posAmount.length < 7) setPosAmount(posAmount + val)
    }
  }

  const handleAwardPoints = () => {
    const amt = parseFloat(posAmount) || 0
    if (amt <= 0) {
      posAudio.playError()
      return
    }
    const earned = Math.round(amt * 10)
    posAudio.playSuccess()
    setCustomerPoints((prev) => prev + earned)
    setLastTx({
      amount: amt,
      pts: earned,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
    })
    setScanStatus("awarded")
    setTimeout(() => {
      setScanStatus("idle")
    }, 2800)
  }

  return (
    <section id="interactive-playground" className="py-20 md:py-28 border-b border-border/60 relative bg-background">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs font-bold">
            Interactive Product Tour
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-foreground">
            Experience the 4 Core Pillars
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base">
            Test the live Fidely Wallet pass, barista register scanner, printable acrylic QR stand, and real-time retention telemetry.
          </p>
        </div>

        {/* Compound Tabs */}
        <Tabs defaultValue="pass" className="w-full max-w-5xl mx-auto">
          <div className="flex justify-center mb-8">
            <TabsList className="grid grid-cols-2 md:grid-cols-4 h-14 p-1.5 bg-muted/80 backdrop-blur-md rounded-2xl border border-border/60 w-full max-w-3xl">
              <TabsTrigger value="pass" className="rounded-xl font-bold text-xs sm:text-sm gap-1.5 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
                <Smartphone className="w-4 h-4 text-primary" />
                <span>1. Fidely Wallet</span>
              </TabsTrigger>
              <TabsTrigger value="scanner" className="rounded-xl font-bold text-xs sm:text-sm gap-1.5 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
                <Zap className="w-4 h-4 text-amber-500" />
                <span>2. Barista POS</span>
              </TabsTrigger>
              <TabsTrigger value="stand" className="rounded-xl font-bold text-xs sm:text-sm gap-1.5 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
                <Printer className="w-4 h-4 text-emerald-500" />
                <span>3. Counter Stand</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="rounded-xl font-bold text-xs sm:text-sm gap-1.5 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
                <TrendingUp className="w-4 h-4 text-purple-500" />
                <span>4. Retention Hub</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* ─── TAB 1: APPLE WALLET PASS ──────────────────────────── */}
          <TabsContent value="pass" className="space-y-6 animate-in fade-in-50 duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-card/60 border border-border/60 rounded-[2.5rem] p-6 sm:p-10 backdrop-blur-sm shadow-xl">
              {/* Left Controls */}
              <div className="lg:col-span-5 space-y-6">
                <div className="space-y-2">
                  <Badge variant="secondary" className="text-xs font-semibold bg-primary/10 text-primary">
                    Live Pass Customizer
                  </Badge>
                  <h3 className="text-2xl font-black tracking-tight text-foreground">
                    Native Fidely Wallet Experience
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Zero app install required. Customers scan your stand once, and their branded card flips, tracks tiers, and unlocks rewards seamlessly.
                  </p>
                </div>

                <div className="space-y-4 pt-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Store Brand Name
                    </Label>
                    <Input
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      className="h-11 rounded-xl bg-background/80 border-border font-medium"
                      placeholder="Enter cafe name..."
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Brand Accent Color
                    </Label>
                    <div className="flex flex-wrap gap-2.5">
                      {COLOR_PRESETS.map((p) => (
                        <button
                          key={p.name}
                          type="button"
                          onClick={() => handleColorChange(p.color)}
                          className={`w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center ${
                            accentColor === p.color ? "border-foreground scale-110 shadow-md" : "border-transparent opacity-80 hover:opacity-100"
                          }`}
                          style={{ backgroundColor: p.color }}
                          title={p.name}
                        >
                          {accentColor === p.color && <div className="w-2 h-2 rounded-full bg-white shadow-xs" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-2">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-muted-foreground uppercase tracking-wider">Simulate Points</span>
                      <span className="font-black text-foreground">{customerPoints} PTS</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="1000"
                      step="25"
                      value={customerPoints}
                      onChange={(e) => setCustomerPoints(Number(e.target.value))}
                      className="w-full accent-primary cursor-pointer"
                    />
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-muted/50 border border-border/40 text-xs text-muted-foreground space-y-1">
                  <div className="font-semibold text-foreground flex items-center gap-1.5">
                    <RotateCcw className="w-3.5 h-3.5 text-primary" />
                    <span>Click the Pass to flip front & back</span>
                  </div>
                  <div>See barcode, terms, and live progress bars in action.</div>
                </div>
              </div>

              {/* Right Pass Simulator */}
              <div className="lg:col-span-7 flex justify-center py-4">
                <div className="w-full max-w-sm">
                  <AppleWalletPass
                    storeName={storeName || "Fidely Cafe"}
                    primaryColor={accentColor}
                    pointsBalance={customerPoints}
                    pointsPerTnd={10}
                    qrCodeToken="SIMULATED_PASS_TOKEN_DEMO"
                    memberName="Sarah Mitchell"
                    memberSince="Sep 2026"
                    nextRewardName="Free Flat White"
                    nextRewardCost={500}
                    rewardsCount={2}
                    interactive={true}
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ─── TAB 2: BARISTA POS SCANNER ────────────────────────── */}
          <TabsContent value="scanner" className="space-y-6 animate-in fade-in-50 duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-card/60 border border-border/60 rounded-[2.5rem] p-6 sm:p-10 backdrop-blur-sm shadow-xl">
              {/* Left Info */}
              <div className="lg:col-span-5 space-y-6">
                <div className="space-y-2">
                  <Badge variant="secondary" className="text-xs font-semibold bg-amber-500/10 text-amber-500">
                    High-Speed Barista Terminal
                  </Badge>
                  <h3 className="text-2xl font-black tracking-tight text-foreground">
                    Scan & Award Points in &lt;1 Second
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Any phone, tablet, or POS display turns into an ultra-fast optical register. Enter purchase total, scan customer QR pass, and hear the register chime.
                  </p>
                </div>

                <div className="space-y-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Works on any device with a camera (iPad, Android, Laptop)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Audio & haptic tactile confirmation on every scan</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Cross-store security lock prevents point fraud</span>
                  </div>
                </div>

                {lastTx && (
                  <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-600 dark:text-emerald-400 animate-in zoom-in-95">
                    <div className="font-bold flex items-center justify-between">
                      <span>✓ Points Credited Successfully</span>
                      <span>{lastTx.time}</span>
                    </div>
                    <div className="mt-1">
                      Awarded <strong>+{lastTx.pts} PTS</strong> for purchase of{" "}
                      <strong>{lastTx.amount.toFixed(2)} TND</strong>.
                    </div>
                  </div>
                )}
              </div>

              {/* Right POS Numpad Demo */}
              <div className="lg:col-span-7 flex justify-center">
                <div className="w-full max-w-sm bg-background border border-border/80 rounded-[2rem] p-5 shadow-2xl space-y-4">
                  <div className="flex items-center justify-between border-b border-border/60 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-xs font-bold text-foreground">Terminal 01 • Main Counter</span>
                    </div>
                    <Badge variant="outline" className="text-[10px] uppercase font-bold text-muted-foreground">
                      Camera Ready
                    </Badge>
                  </div>

                  {/* Transaction Screen */}
                  <div className="bg-muted/40 rounded-2xl p-4 text-right border border-border/40">
                    <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                      Purchase Total (TND)
                    </div>
                    <div className="text-3xl sm:text-4xl font-black tracking-tight text-foreground mt-1">
                      {posAmount} <span className="text-base text-muted-foreground font-semibold">TND</span>
                    </div>
                    <div className="text-xs text-primary font-bold mt-1">
                      +{(parseFloat(posAmount) || 0) * 10} Loyalty Points
                    </div>
                  </div>

                  {/* Quick Preset Chips */}
                  <div className="grid grid-cols-3 gap-2">
                    {["5.00", "12.50", "25.00"].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => {
                          posAudio.playClick()
                          setPosAmount(val)
                        }}
                        className="py-1.5 px-2 text-xs font-bold rounded-xl bg-muted/60 hover:bg-muted text-foreground border border-border/40 transition-colors"
                      >
                        +{val} TND
                      </button>
                    ))}
                  </div>

                  {/* Interactive Numpad */}
                  <div className="grid grid-cols-3 gap-2">
                    {["1", "2", "3", "4", "5", "6", "7", "8", "9", "C", "0", "."].map((k) => (
                      <button
                        key={k}
                        type="button"
                        onClick={() => handleNumpad(k)}
                        className={`h-11 rounded-xl text-sm font-black transition-all active:scale-95 border ${
                          k === "C"
                            ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 hover:bg-rose-500/20"
                            : "bg-card text-foreground border-border/60 hover:bg-muted"
                        }`}
                      >
                        {k}
                      </button>
                    ))}
                  </div>

                  {/* Trigger Action */}
                  <Button
                    onClick={handleAwardPoints}
                    className="w-full h-12 rounded-2xl font-bold text-sm bg-primary text-primary-foreground shadow-lg shadow-primary/20 gap-2 active:scale-95 transition-all"
                  >
                    <Zap className="w-4 h-4" />
                    <span>{scanStatus === "awarded" ? "Points Credited!" : "Simulate Customer QR Scan"}</span>
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ─── TAB 3: COUNTER QR STAND ──────────────────────────── */}
          <TabsContent value="stand" className="space-y-6 animate-in fade-in-50 duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-card/60 border border-border/60 rounded-[2.5rem] p-6 sm:p-10 backdrop-blur-sm shadow-xl">
              <div className="lg:col-span-5 space-y-6">
                <div className="space-y-2">
                  <Badge variant="secondary" className="text-xs font-semibold bg-emerald-500/10 text-emerald-500">
                    Acrylic Table-Tent Stand
                  </Badge>
                  <h3 className="text-2xl font-black tracking-tight text-foreground">
                    Printable High-Res Counter Stands
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Generate crisp 1200×1600px print-ready acrylic stands with your brand colors. Customers scan right at the counter to join your club and claim their first free coffee perk.
                  </p>
                </div>

                <div className="space-y-2.5 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Auto-branded with your logo & store palette</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Embeds unique merchant referral link automatically</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Ready for standard 4x6" and 5x7" acrylic counter frames</span>
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    onClick={() => {
                      posAudio.playSuccess()
                    }}
                    className="w-full sm:w-auto h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-2"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Download Print Stand Template</span>
                  </Button>
                </div>
              </div>

              {/* Right Acrylic Mockup */}
              <div className="lg:col-span-7 flex justify-center py-2">
                <div className="relative w-full max-w-[280px] sm:max-w-[320px] rounded-3xl bg-card p-6 border-2 border-border shadow-xl text-center space-y-5">
                  <div className="flex justify-center">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md"
                      style={{ backgroundColor: accentColor }}
                    >
                      <Coffee className="w-6 h-6" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-lg font-black tracking-tight text-foreground">{storeName}</h4>
                    <p className="text-[11px] font-bold text-primary uppercase tracking-wider">
                      Join Our Coffee Club
                    </p>
                  </div>

                  {/* QR Box */}
                  <div className="p-4 bg-white rounded-2xl shadow-inner inline-block mx-auto border border-gray-100">
                    <QRCodeSVG
                      value={`https://fidely.app/join?store=${encodeURIComponent(storeName)}`}
                      size={150}
                      fgColor={accentColor}
                      level="H"
                      marginSize={0}
                    />
                  </div>

                  <div className="space-y-1 text-xs">
                    <div className="font-bold text-foreground">Scan with Phone Camera</div>
                    <div className="text-[11px] text-muted-foreground">
                      No App Store download • Instant Fidely Wallet Pass
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ─── TAB 4: RETENTION HUB ─────────────────────────────── */}
          <TabsContent value="analytics" className="space-y-6 animate-in fade-in-50 duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-card/60 border border-border/60 rounded-[2.5rem] p-6 sm:p-10 backdrop-blur-sm shadow-xl">
              <div className="lg:col-span-5 space-y-6">
                <div className="space-y-2">
                  <Badge variant="secondary" className="text-xs font-semibold bg-purple-500/10 text-purple-500">
                    Merchant Command Center
                  </Badge>
                  <h3 className="text-2xl font-black tracking-tight text-foreground">
                    Actionable Customer Telemetry
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Track visit frequency, customer lifetime value, and referral channel attribution in real-time. Super admin & store owners get total clarity on repeat revenue.
                  </p>
                </div>

                <div className="space-y-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-500 shrink-0" />
                    <span>Tracks customer acquisition source (Counter Stand vs Shared Link)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-500 shrink-0" />
                    <span>Cashier shift transaction audits with timestamp logs</span>
                  </div>
                </div>
              </div>

              {/* Right Telemetry Dashboard Preview */}
              <div className="lg:col-span-7">
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div className="p-4 rounded-2xl bg-background border border-border/60 space-y-1">
                    <div className="text-[11px] font-bold text-muted-foreground uppercase">Active Regulars</div>
                    <div className="text-2xl sm:text-3xl font-black text-foreground">1,482</div>
                    <div className="text-[11px] font-semibold text-emerald-500 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" /> +28.4% this month
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-background border border-border/60 space-y-1">
                    <div className="text-[11px] font-bold text-muted-foreground uppercase">Repeat Visit Rate</div>
                    <div className="text-2xl sm:text-3xl font-black text-foreground">68.2%</div>
                    <div className="text-[11px] font-semibold text-purple-500">Avg 4.1 visits / mo</div>
                  </div>

                  <div className="p-4 rounded-2xl bg-background border border-border/60 space-y-1">
                    <div className="text-[11px] font-bold text-muted-foreground uppercase">Counter Stand Scans</div>
                    <div className="text-2xl sm:text-3xl font-black text-foreground">894</div>
                    <div className="text-[11px] font-semibold text-muted-foreground">62% of new signups</div>
                  </div>

                  <div className="p-4 rounded-2xl bg-background border border-border/60 space-y-1">
                    <div className="text-[11px] font-bold text-muted-foreground uppercase">Vouchers Redeemed</div>
                    <div className="text-2xl sm:text-3xl font-black text-foreground">312</div>
                    <div className="text-[11px] font-semibold text-amber-500">100% 1-time single use</div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  )
}
