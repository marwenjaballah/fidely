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
    q: "Do customers need to download an app from the App Store?",
    a: "No. Customers simply point their camera at your counter QR stand. Their pass opens immediately in their mobile browser and can be saved to their home screen in one tap.",
  },
  {
    q: "Do I need special POS hardware or barcode scanners?",
    a: "Zero extra hardware. Any smartphone, iPad, tablet, or laptop camera acts as your cashier scanner with instant sub-second recognition.",
  },
  {
    q: "How fast is checkout for cashiers and baristas?",
    a: "Under 1 second. Enter the purchase total and point the camera at the customer's pass. An instant audio chime confirms the transaction.",
  },
  {
    q: "How does fraud prevention work for free rewards?",
    a: "Rewards generate cryptographic single-use voucher codes that burn instantly upon cashier scan, preventing duplicate claims or screenshot sharing.",
  },
]

export function FaqSection() {
  return (
    <section id="faq" className="py-20 md:py-28 border-b border-border/60 bg-muted/20 relative">
      <div className="container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-xl mx-auto space-y-3">
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs font-bold">
            FAQ
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-foreground">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base">
            Everything you need to know about setting up and running Fidely.
          </p>
        </div>

        {/* Accessible Accordion */}
        <Accordion type="single" collapsible className="w-full space-y-3">
          {FAQS.map((faq, idx) => (
            <AccordionItem
              key={idx}
              value={`item-${idx}`}
              className="border border-border/70 bg-card rounded-2xl px-6 py-0.5 data-[state=open]:border-primary/40 data-[state=open]:shadow-sm transition-all"
            >
              <AccordionTrigger className="text-left font-bold text-base hover:no-underline py-4 text-foreground">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-4 pt-0">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
