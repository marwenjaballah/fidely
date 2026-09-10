"use client"

import React from "react"
import { HeroSection } from "./hero-section"
import { InteractiveSimulator } from "./interactive-simulator"
import { RoiCalculator } from "./roi-calculator"
import { ComparisonSection } from "./comparison-section"
import { BentoFeatures } from "./bento-features"
import { StepFlowSection } from "./step-flow-section"
import { ReviewsSection } from "./reviews-section"
import { FaqSection } from "./faq-section"
import { CtaSection } from "./cta-section"

/**
 * HomePageContent - High-Energy, Tactile, Alive Landing Page for Fidely
 * Inspired by modern, human digital product experiences (like usetapp.io)
 * Adhering strictly to Anthropic Design, Vercel Web Guidelines, and UI/UX Pro Max.
 */
export function HomePageContent() {
  return (
    <div className="flex flex-col w-full overflow-x-hidden scroll-smooth">
      {/* 1. High-Energy Hero with Interactive Live POS Phone Mockup */}
      <HeroSection />

      {/* 2. Side-by-Side Reality: Old Clunky Way vs The Fidely Way */}
      <ComparisonSection />

      {/* 3. Interactive 4-Pillar Product Tour Simulator */}
      <InteractiveSimulator />

      {/* 4. Interactive Cafe Growth & Revenue ROI Calculator */}
      <RoiCalculator />

      {/* 5. 6-Card Bento Grid Capabilities */}
      <BentoFeatures />

      {/* 6. 3-Step Merchant Setup Flow */}
      <StepFlowSection />

      {/* 7. Verified Merchant Reviews & Ratings */}
      <ReviewsSection />

      {/* 8. Accessible Accordion FAQs */}
      <FaqSection />

      {/* 9. High-Conversion Bottom CTA Banner */}
      <CtaSection />
    </div>
  )
}
