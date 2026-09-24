"use client"

import Image from "next/image"
import { Store, Printer, Smartphone, CheckCircle2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"

const STEPS = [
  {
    num: "01",
    icon: Store,
    title: "Brand Your Pass",
    description: "Set your colors, upload your logo, and define your points ratio in 60 seconds.",
    highlight: "60s Setup",
    previewType: "card",
  },
  {
    num: "02",
    icon: Printer,
    title: "Place Your Stand",
    description: "Download your print-ready acrylic QR stand so walk-in customers can tap & join instantly.",
    highlight: "Print-Ready",
    previewType: "image",
    image: "/images/acrylic-stand.jpg",
    imageAlt: "Minimalist acrylic counter stand on cafe desk",
  },
  {
    num: "03",
    icon: Smartphone,
    title: "Scan & Reward",
    description: "Enter the purchase total and scan customer passes with any phone or tablet in under 1 second.",
    highlight: "< 1s Speed",
    previewType: "image",
    image: "/images/barista-scan.jpg",
    imageAlt: "Barista scanning customer loyalty pass with smartphone",
  },
]

export function StepFlowSection() {
  return (
    <section id="how-it-works" className="py-20 md:py-28 border-b border-border/60 bg-background relative">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs font-bold">
            How It Works
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-foreground">
            Up and Running in 3 Steps
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base">
            No expensive hardware. No complex training. Everything works right in the browser.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {STEPS.map((step, idx) => {
            const Icon = step.icon
            return (
              <div
                key={idx}
                className="relative rounded-3xl border border-border/70 bg-card p-6 sm:p-8 flex flex-col justify-between space-y-6 hover:border-border transition-all duration-300 hover:shadow-xl group overflow-hidden"
              >
                <div className="space-y-4">
                  {/* Step Number Top Badge */}
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-primary group-hover:scale-105 transition-transform">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="text-3xl font-black text-muted-foreground/30 font-mono tracking-tighter">
                      {step.num}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-left">
                    <h3 className="text-xl font-black tracking-tight text-foreground">
                      {step.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </div>

                  {/* Visual Preview */}
                  {step.previewType === "image" && step.image ? (
                    <div className="relative w-full h-44 rounded-2xl overflow-hidden border border-border/60 mt-3 bg-muted">
                      <Image
                        src={step.image}
                        alt={step.imageAlt || step.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    </div>
                  ) : (
                    <div className="relative w-full h-44 rounded-2xl overflow-hidden border border-primary/20 mt-3 bg-gradient-to-br from-primary/10 via-primary/5 to-muted p-4 flex flex-col justify-between group-hover:scale-105 transition-transform duration-500">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold tracking-wider uppercase text-foreground/80">Digital Pass</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/20 text-primary">Live</span>
                      </div>
                      <div className="text-left space-y-1">
                        <p className="text-xs text-muted-foreground font-mono">Regular Member</p>
                        <p className="text-2xl font-black text-foreground">240 PTS</p>
                      </div>
                      <div className="w-full bg-foreground/10 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-primary h-full rounded-full w-3/4" />
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-border/50 flex items-center justify-between text-xs font-bold text-foreground">
                  <span className="text-primary">{step.highlight}</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
