---
name: ui-ux-pro-max
description: Comprehensive UI/UX master skill for creating peak aesthetic, intuitive, and conversion-optimized digital products. Covers visual hierarchy, micro-interactions, haptic/audio feedback, empty/error/loading states, onboarding flows, mobile-first responsiveness, and accessibility (WCAG AAA).
---

# UI/UX Pro Max: Master Design & Experience Guidelines

The gold standard for creating breathtaking, user-centered digital interfaces that blend aesthetics, speed, tactile feedback, and accessibility.

---

## 1. Visual Hierarchy & Cognitive Load

- **The 3-Second Rule**: A user should understand what a screen does within 3 seconds of landing on it.
- **F-Pattern & Z-Pattern Scanning**: Align key value propositions and calls to action along natural eye-tracking paths.
- **Visual Weight Ranking**:
  1. **Primary Action**: Solid brand background, high contrast, prominent positioning (`bg-primary text-primary-foreground shadow-lg`).
  2. **Secondary Action**: Outline or subtle surface (`variant="outline"` or `bg-muted/50`).
  3. **Tertiary / Destructive**: Text link or subtle red accent.

---

## 2. Audio-Tactile Feedback Loops

- **Multisensory Confirmation**: For critical or fast-paced POS/checkout operations, pair visual toasts with subtle Web Audio chimes (`sine` wave arpeggios) and mobile haptics (`navigator.vibrate([40, 30, 80])`).
- **Error Alarms**: Low double-boop tones and gentle double vibrations immediately warn users of validation failures or mismatches before they look away.

---

## 3. The 4 Essential UI States

Every interactive view must gracefully handle all 4 states:
1. **Loading State**: Content-shaped skeleton loaders that prevent jarring layout shifts (CLS).
2. **Empty State**: Welcoming illustrations or icons, clear explanations, and an explicit primary CTA button (e.g. *"No cards yet — Join your first store!"*).
3. **Error State**: Actionable, human-readable error descriptions with a prominent **"Retry"** button rather than generic technical codes.
4. **Success State**: Rewarding animations, celebratory badges, and clear next steps (e.g. *"✓ Claimed at Counter — Done & Next Scan"*).

---

## 4. Mobile Ergonomics & Touch Guidelines

- **44×44px Rule**: Every clickable surface (buttons, chips, select triggers, icons) must have an active target area of at least 44×44 CSS pixels.
- **Reachability (Thumb Zone)**: Place bottom navigation bars and floating actions in the lower half of the viewport on handheld devices.
- **Input Type Tuning**: Ensure mobile virtual keyboards open the correct keyboard layout:
  - `type="email"` for email fields
  - `type="number"` or `inputMode="decimal"` for currency/numeric entries
  - `type="tel"` for phone numbers

---

## 5. Accessibility (WCAG 2.1 AA / AAA)

- **Color Contrast**: Minimum contrast ratio of 4.5:1 for standard body text and 3:1 for large text and interactive UI borders.
- **Never Rely on Color Alone**: Always combine color indicators with icons or descriptive text labels.
- **Keyboard Trapping & ARIA**: Use Radix UI primitives for dialogs, popovers, and dropdowns to ensure screen reader focus is trapped and announced correctly.
