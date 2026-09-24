"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { useI18n } from "@/lib/i18n"

export function FaqSection() {
  const { t } = useI18n()

  const faqs = [
    {
      q: t('landing_faq_q1'),
      a: t('landing_faq_a1'),
    },
    {
      q: t('landing_faq_q2'),
      a: t('landing_faq_a2'),
    },
    {
      q: t('landing_faq_q3'),
      a: t('landing_faq_a3'),
    },
    {
      q: t('landing_faq_q4'),
      a: t('landing_faq_a4'),
    },
  ]

  return (
    <section id="faq" className="min-h-screen min-h-[100dvh] flex flex-col justify-center items-center py-16 sm:py-20 border-b border-border/60 bg-muted/20 relative scroll-mt-16">
      <div className="container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 space-y-10 my-auto w-full">
        {/* Section Header */}
        <div className="text-center max-w-xl mx-auto space-y-3">
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs font-bold">
            {t('landing_faq_badge')}
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-foreground">
            {t('landing_faq_title')}
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base">
            {t('landing_faq_subtitle')}
          </p>
        </div>

        {/* Accessible Accordion */}
        <Accordion type="single" collapsible className="w-full space-y-3">
          {faqs.map((faq, idx) => (
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
