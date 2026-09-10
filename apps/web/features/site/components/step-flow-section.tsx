"use client"

import Image from "next/image"
import { Store, Printer, Smartphone, ArrowRight, CheckCircle2, Sparkles } from "lucide-react"
import { Badge } from "@/components/ui/badge"

const STEPS = [
  {
    num: "01",
    icon: Store,
    title: "Create Your Brand & Pass",
    description:
      "Pick your cafe colors, set your points ratio (e.g. 10 pts per 1 TND), and create your customized digital Fidely Wallet pass in 60 seconds.",
    highlight: "60 Seconds Setup",
    image: null,
  },
  {
    num: "02",
    icon: Printer,
    title: "Print Your Counter Stand",
    description:
      "Download your high-res acrylic QR stand with your store logo. Place it at the register for customers to scan and join instantly.",
    highlight: "1-Click Download",
    image: "/images/acrylic-stand.jpg",
    imageAlt: "Minimalist acrylic counter stand on cafe desk",
  },
  {
    num: "03",
    icon: Smartphone,
    title: "Baristas Scan & Reward",
    description:
      "Your staff enters the purchase total and scans customer passes using any device camera. Points and rewards apply in under 1 second.",
    highlight: "<1s Checkout Speed",
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
            Zero Learning Curve
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-foreground">
            Up and Running in 3 Simple Steps
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base">
            No expensive hardware or complex staff training. Everything works directly in the browser.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {STEPS.map((step, idx) => {
            const Icon = step.icon
            return (
              <div
                key={idx}
                className="relative rounded-3xl border border-border/60 bg-card p-6 sm:p-8 flex flex-col justify-between space-y-6 hover:border-border transition-all duration-300 hover:shadow-lg group overflow-hidden"
              >
                <div className="space-y-4">
                  {/* Step Number Top Badge */}
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted border border-border/60 text-foreground group-hover:scale-105 transition-transform">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <span className="text-3xl font-black text-muted-foreground/30 font-mono tracking-tighter">
                      {step.num}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xl font-bold tracking-tight text-foreground">
                      {step.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </div>

                  {/* Real Image Preview */}
                  {step.image && (
                    <div className="relative w-full h-44 rounded-2xl overflow-hidden border border-border/60 mt-2 bg-muted">
                      <Image
                        src={step.image}
                        alt={step.imageAlt || step.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-border/40 flex items-center justify-between text-xs font-bold text-foreground">
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
