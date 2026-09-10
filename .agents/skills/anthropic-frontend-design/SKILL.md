---
name: anthropic-frontend-design
description: Frontend design principles and guidelines for building world-class, aesthetic, accessible, and responsive user interfaces with rich typography, cohesive color systems, polished micro-interactions, dark mode, and tactile feedback.
---

# Anthropic Frontend Design Guidelines

A comprehensive design standard for building modern, delightful, and highly functional web applications.

---

## 1. Core Design Philosophy

- **Aesthetics & Purpose**: Great software looks intentional. Every pixel, color choice, and animation should serve a clear user goal.
- **Visual Hierarchy**: Guide the user's eye naturally. The most important action or data point should dominate the visual field through size, contrast, and weight.
- **Zero Generic Placeholders**: Never ship generic placeholders, low-contrast text, or boring MVP layouts. Treat every interface as a production-grade product.

---

## 2. Color Systems & Visual Depth

### Color Tokens
- **Base Backgrounds**: Use tailored HSL/OKLCH dark and light modes rather than pure `#000000` or `#ffffff` (e.g. `bg-background` with subtle slate/zinc warmth).
- **Primary & Accent Colors**: Choose purposeful brand accents with curated contrast ratios (minimum 4.5:1 for normal text, 3:1 for large headings).
- **Subtle Surface Layers**:
  - `Surface 0`: Canvas background (`bg-background`)
  - `Surface 1`: Card / container (`bg-card` or `bg-muted/30`)
  - `Surface 2`: Elevated popovers, tooltips, dialogs (`bg-popover` with `shadow-xl`)

### Glassmorphism & Elevation
- Use backdrop blur (`backdrop-blur-md bg-background/80`) on fixed headers, floating bars, and sticky actions.
- Use subtle borders (`border border-border/60`) to define container edges without heavy shadows.

---

## 3. Typography & Rhythm

- **Modern Typefaces**: Use clean, modern font pairings (e.g. Inter, Geist, Outfit, or system font stacks).
- **Type Scale**:
  - **Hero Heading**: `text-4xl sm:text-5xl font-extrabold tracking-tight`
  - **Section Title**: `text-2xl sm:text-3xl font-bold tracking-tight`
  - **Card Title / Subheading**: `text-base sm:text-lg font-semibold`
  - **Body Text**: `text-sm sm:text-base text-muted-foreground leading-relaxed`
  - **Labels / Badges**: `text-xs font-semibold uppercase tracking-wider`
  - **Numeric Data / Monospace**: `font-mono font-bold` for currencies, points, IDs, and metrics.

---

## 4. Micro-Interactions & Animation

- **Hover States**: Add subtle scale transitions (`transition-all duration-200 hover:scale-[1.02]`) and border highlights.
- **Active / Press States**: Use tactile scale-down effects (`active:scale-[0.98]`) on buttons and interactive chips.
- **State Transitions**: Animate element appearance with smooth fade-in and zoom effects (`animate-in fade-in zoom-in-95 duration-200`).
- **Loading Indicators**: Replace static spinners with context-aware skeleton loaders that match the layout shape.

---

## 5. Responsive & Mobile-First Design

- **Touch Targets**: All interactive elements (buttons, pills, dropdowns) must meet minimum 44×44px touch bounding boxes on mobile screens.
- **Thumb Zone Optimization**: Place primary actions and key triggers within easy reach of one-handed thumb navigation.
- **Adaptive Layouts**: Seamlessly transition from 1-column mobile views to multi-column desktop grids using Tailwind grid breakpoints (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`).

---

## 6. Accessibility & Inclusivity

- Support full keyboard navigation with high-visibility focus rings (`focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`).
- Always pair color indicators with text or icons (e.g., green badge + checkmark icon for success).
- Semantic HTML tags: Use `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, and `<footer>` appropriately.
