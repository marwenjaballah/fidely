"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"

const FAQS = [
  {
    q: "Do customers need to download an app from the App Store or Google Play?",
    a: "No! Customers simply point their phone camera at your counter QR stand. Their digital loyalty pass opens instantly in their mobile browser and can be saved directly to Fidely Wallet or their home screen in 1 single tap.",
  },
  {
    q: "What hardware or POS equipment is needed?",
    a: "Zero special hardware. Any smartphone, tablet (like an iPad), laptop, or touchscreen terminal at your counter functions as your cashier scanner. The camera instantly reads customer QR passes in under 1 second.",
  },
  {
    q: "How do baristas award points and redeem rewards at checkout?",
    a: "The cashier enters the transaction amount (or taps quick presets like +5, +12.50 TND) and scans the customer's pass. Points are calculated and awarded in under 1 second with instant audio-haptic chime feedback.",
  },
  {
    q: "How does the 1-time voucher burn protection work?",
    a: "When a customer redeems a voucher perk (like a free coffee or pastry), the barista scans the voucher QR code. The system immediately marks the voucher as 'USED' with an exact timestamp log, preventing duplicate reuse.",
  },
  {
    q: "Can I manage multiple cafe branches and staff accounts?",
    a: "Yes! Fidely supports multi-store management, dedicated cashier PIN logins for each barista, and cross-store mismatch protection to prevent fraudulent point leakage.",
  },
  {
    q: "How does the acrylic counter stand referral attribution work?",
    a: "When you export your 1200×1600px counter stand from your dashboard, it embeds your store's unique referral tag. When walk-in customers scan and register, they are automatically linked to your shop in the super admin telemetry hub.",
  },
]

export function FaqSection() {
  return (
    <section id="faq" className="py-20 md:py-28 border-b border-border/60 bg-background relative">
      <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs font-bold">
            Frequently Asked Questions
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-foreground">
            Everything You Need to Know
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base">
            Clear answers on Fidely Wallet compatibility, camera scanning, and multi-store operations.
          </p>
        </div>

        {/* Accessible Accordion */}
        <Accordion type="single" collapsible className="w-full space-y-4">
          {FAQS.map((faq, idx) => (
            <AccordionItem
              key={idx}
              value={`item-${idx}`}
              className="border border-border/60 bg-card rounded-2xl px-6 py-1 data-[state=open]:border-primary/40 data-[state=open]:shadow-sm transition-all"
            >
              <AccordionTrigger className="text-left font-bold text-base hover:no-underline py-4 text-foreground">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-4 pt-1">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
