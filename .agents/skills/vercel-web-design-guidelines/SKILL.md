---
name: vercel-web-design-guidelines
description: Vercel Web Design Guidelines for building developer-grade, minimalist, high-contrast web applications. Covers Geist design system rules, typography scale, monochrome foundations, subtle border hierarchies, and ultra-fast UI ergonomics.
---

# Vercel Web Design Guidelines

Design standards inspired by Vercel and the Geist Design System for crafting developer-grade, razor-sharp user interfaces.

---

## 1. The Geist Aesthetic: Minimalist Precision

- **Monochrome Foundation**: Black, white, and a meticulously calibrated grayscale (`#000`, `#111`, `#666`, `#888`, `#eaeaea`, `#fafafa`, `#fff`).
- **High-Contrast Intentionality**: Use pure color (blue, green, amber, red) only for semantic feedback (status badges, error toasts, primary CTAs).
- **Subtle 1px Borders**: Define structures with crisp 1px borders (`border-border/60` or `border-zinc-800` in dark mode) instead of diffuse drop-shadows.

---

## 2. Geometry & Spacing

### Border Radii Standards
- **Small Elements (Badges, Buttons, Chips)**: `rounded-lg` (6px to 8px) or `rounded-full`.
- **Medium Containers (Cards, Modals, Menus)**: `rounded-2xl` or `rounded-3xl` (16px to 24px).
- **Outer Page Shells / Banners**: `rounded-3xl` (24px to 32px).

### 8pt Layout Grid
- Structure layout margins and paddings in multiples of 4 and 8 pixels:
  - Micro gaps: `gap-1.5` (6px), `gap-2` (8px), `gap-3` (12px)
  - Section padding: `p-4 sm:p-6 lg:p-8`
  - Container widths: `max-w-md`, `max-w-xl`, `max-w-5xl`, `max-w-7xl`

---

## 3. Typography Rules

- **Font Family**: Geist Sans, Inter, or system-native font stacks with optimized antialiasing (`antialiased`).
- **Monospace Integration**: Use Geist Mono or system monospace for UUIDs, voucher codes, terminal stats, and technical metrics (`font-mono text-xs tracking-tight`).
- **Tracking / Letter Spacing**:
  - Headings: `tracking-tight` or `tracking-tighter` (tightens letter spacing for impactful titles).
  - Uppercase subheadings / badges: `tracking-wider` or `tracking-widest` (loosens spacing for readability).

---

## 4. Component Patterns

### Command Menus (`Cmd + K`)
- Provide quick-search command palettes for fast keyboard navigation across dashboard resources.

### Interactive Card Grids
- Use `border border-border/60 bg-card hover:border-foreground/20 hover:bg-muted/30 transition-all duration-200` to create tactile, clickable surfaces.

### Skeleton States
- Ensure skeleton loaders precisely mimic the typography lines, badge sizes, and card contours to eliminate layout shifts (CLS).

### Sticky Toolbars & Navbars
- Use `sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/60` for distraction-free navigation.
