# Fidely — Complete Feature Specification

> **Platform tagline**: Zero-download, frictionless digital loyalty for specialty coffee shops, cafés, and bakeries.
>
> **Version**: 1.0 (September 2026)  
> **Tech stack**: Next.js 16 · Hono API (Node/ESM) · Prisma + PostgreSQL (Supabase) · TurboRepo + pnpm workspaces

---

## Table of Contents

1. [Platform Overview](#1-platform-overview)
2. [Architecture](#2-architecture)
3. [Database Schema](#3-database-schema)
4. [User Roles & Access Control](#4-user-roles--access-control)
5. [Authentication System](#5-authentication-system)
6. [Marketing Site & Public Pages](#6-marketing-site--public-pages)
7. [Customer PWA Wallet](#7-customer-pwa-wallet)
8. [Cashier POS Terminal](#8-cashier-pos-terminal)
9. [Merchant Dashboard](#9-merchant-dashboard)
10. [Super Admin Console](#10-super-admin-console)
11. [API Surface (v1)](#11-api-surface-v1)
12. [Internationalization (i18n) & RTL](#12-internationalization-i18n--rtl)
13. [Progressive Web App (PWA)](#13-progressive-web-app-pwa)
14. [Accessibility & Design System](#14-accessibility--design-system)
15. [Cron Jobs & Background Tasks](#15-cron-jobs--background-tasks)
16. [Route Map Summary](#16-route-map-summary)

---

## 1. Platform Overview

**Fidely** is a multi-tenant SaaS loyalty platform built specifically for the hospitality industry in Tunisia and the MENA region. It replaces paper punch cards and bulky app downloads with an instant web-based loyalty pass that customers can add to their phone's home screen in a single tap.

### Core Value Propositions

| Stakeholder | Value |
|---|---|
| **Merchant** | Full CRM, analytics, customizable branding, rewards catalog, staff management — all from one dashboard |
| **Cashier** | Minimal-friction POS terminal — issue points via phone lookup or QR scan; redeem rewards exclusively via optical QR scan |
| **Customer** | One-tap digital loyalty card, no app download, works on any phone, points earned and rewards redeemed instantly |

### Key Design Principles

- **No-download for customers** — Pure PWA, installable via Add to Home Screen
- **Multi-store / multi-tenant** — One merchant account can manage several branches
- **RTL-first** — Full Arabic (RTL) support across every page and component
- **Trilingual** — English, Arabic, and French translations with 100% key parity
- **Mobile-first** — All interfaces are designed for phone/tablet first, desktop second
- **Security by design** — Reward redemption requires optical QR scan; phone lookup is restricted to point-earning only

---

## 2. Architecture

\`\`\`
fidely/                          ← TurboRepo monorepo root
├── apps/
│   ├── web/                     ← Next.js 16 App Router (React 19)
│   │   ├── app/(marketing)/     ← Public marketing pages
│   │   ├── app/(public)/auth/   ← Auth pages (login, sign-up, reset…)
│   │   ├── app/(customer)/      ← Customer wallet & store join flows
│   │   ├── app/(cashier)/       ← Cashier POS terminal
│   │   ├── app/(merchant)/      ← Merchant dashboard (sidebar layout)
│   │   └── app/(admin)/         ← Super Admin console
│   └── api/                     ← Hono REST API (Node, ESM, TypeScript)
│       └── src/routes/v1/
│           ├── authentication/
│           ├── admin/
│           ├── merchant/
│           ├── customer/
│           ├── transactions/
│           ├── users/
│           └── reviews/
└── packages/
    ├── database/                ← Prisma schema + Supabase client helpers
    ├── types/                   ← Shared TypeScript types
    ├── eslint-config/
    └── typescript-config/
\`\`\`

### Data Flow

\`\`\`
Browser / PWA
    │
    ▼
Next.js App Router (apps/web)
    │ SSR / Client Components
    ▼
Hono REST API (apps/api)   ←── Cookie-based JWT auth + refresh tokens
    │
    ▼
Prisma ORM → PostgreSQL (Supabase)
\`\`\`

---

## 3. Database Schema

### \`User\`
| Field | Type | Notes |
|---|---|---|
| \`id\` | \`uuid\` | Primary key |
| \`email\` | \`string\` | Unique |
| \`fullName\` | \`string?\` | Optional display name |
| \`phone\` | \`string?\` | Used by cashier for phone-based point-earning lookup |
| \`streetAddress\`, \`city\`, \`state\`, \`postalCode\`, \`country\` | \`string?\` | Profile address fields |
| \`role\` | \`UserRole\` | \`SUPER_ADMIN\`, \`MERCHANT\`, \`CASHIER\`, \`CUSTOMER\` |
| \`referredByStoreId\` | \`string?\` | Tracks which store QR stand the customer came from |
| \`createdAt\`, \`updatedAt\` | \`DateTime\` | Timestamps |

**Relations**: A user can own many \`Store\`s, be a cashier at many \`Store\`s, and have many \`CustomerMembership\`s.

---

### \`Store\`
| Field | Type | Notes |
|---|---|---|
| \`id\` | \`uuid\` | Primary key |
| \`ownerId\` | \`string\` | FK → \`User\` (Merchant) |
| \`name\` | \`string\` | Display name |
| \`slug\` | \`string\` | Unique URL identifier — \`fidely.app/store/[slug]\` |
| \`logoUrl\` | \`string?\` | Base64 WebP (optimized client-side to ≤ 25 KB, 128×128 px) |
| \`primaryColor\` | \`string\` | Hex color for branding (defaults \`#000000\`) |
| \`pointsPerTnd\` | \`Decimal(10,2)\` | Points earned per 1 TND spent (default \`10.00\`) |
| \`welcomePoints\` | \`int\` | Bonus points for first-time members (default \`0\`) |
| \`active\` | \`boolean\` | Soft-delete / suspend a store |
| \`createdAt\` | \`DateTime\` | Timestamp |

**Relations**: Store → \`cashiers[]\`, \`memberships[]\`, \`rewards[]\`, \`transactions[]\`, \`referredUsers[]\`

---

### \`CustomerMembership\`
| Field | Type | Notes |
|---|---|---|
| \`id\` | \`uuid\` | Primary key |
| \`customerId\` | \`string\` | FK → \`User\` |
| \`storeId\` | \`string\` | FK → \`Store\` |
| \`pointsBalance\` | \`int\` | Current loyalty balance |
| \`qrCodeToken\` | \`string\` | Unique scannable token — rotatable on demand |
| \`joinSource\` | \`string?\` | \`STORE_QR\`, \`REFERRAL\`, \`DIRECT\`, \`CASHIER_SCAN\` |
| \`joinedAt\` | \`DateTime\` | Enrollment timestamp |

**Unique constraint**: \`(customerId, storeId)\` — one membership per customer per store.

---

### \`Reward\`
| Field | Type | Notes |
|---|---|---|
| \`id\` | \`uuid\` | Primary key |
| \`storeId\` | \`string\` | FK → \`Store\` |
| \`name\` | \`string\` | E.g. "Free Espresso", "10% Discount" |
| \`description\` | \`string?\` | Optional details |
| \`pointsCost\` | \`int\` | Points required to unlock |
| \`active\` | \`boolean\` | Hidden/visible toggle |
| \`createdAt\` | \`DateTime\` | Timestamp |

---

### \`Transaction\`
| Field | Type | Notes |
|---|---|---|
| \`id\` | \`uuid\` | Primary key |
| \`storeId\` | \`string\` | FK → \`Store\` |
| \`cashierId\` | \`string\` | FK → \`User\` (Cashier who processed it) |
| \`membershipId\` | \`string\` | FK → \`CustomerMembership\` |
| \`type\` | \`string\` | \`earn\` or \`redeem\` |
| \`amountTnd\` | \`Decimal(10,3)?\` | Spend amount in TND (earn transactions only) |
| \`pointsAffected\` | \`int\` | Points added or deducted |
| \`createdAt\` | \`DateTime\` | Timestamp |

---

### \`Voucher\`
| Field | Type | Notes |
|---|---|---|
| \`id\` | \`uuid\` | Primary key |
| \`membershipId\` | \`string\` | FK → \`CustomerMembership\` |
| \`rewardId\` | \`string\` | FK → \`Reward\` |
| \`code\` | \`string\` | Unique redemption code (human-readable) |
| \`status\` | \`string\` | \`active\`, \`used\`, \`expired\` |
| \`issuedAt\` | \`DateTime\` | When the voucher was created |
| \`usedAt\` | \`DateTime?\` | When cashier redeemed it |

---

### \`Review\`
| Field | Type | Notes |
|---|---|---|
| \`id\` | \`uuid\` | Primary key |
| \`name\` | \`string\` | Reviewer display name |
| \`company\` | \`string?\` | Optional company |
| \`rating\` | \`int\` | 1–5 stars |
| \`title\` | \`string?\` | Short headline |
| \`message\` | \`string?\` | Full review body |
| \`createdAt\`, \`updatedAt\` | \`DateTime\` | Timestamps |

Used internally; not displayed on the current marketing landing page.

---

## 4. User Roles & Access Control

| Role | Entry Point | Permissions |
|---|---|---|
| \`SUPER_ADMIN\` | \`/admin\` | Full platform visibility: all users, all stores, all transactions, KPI metrics |
| \`MERCHANT\` | \`/merchant\` | Manage own stores, configure rewards, view CRM/analytics, manage cashiers |
| \`CASHIER\` | \`/cashier\` | Issue points (via phone lookup or QR scan) for assigned stores only — redeem rewards via QR scan only — no settings access |
| \`CUSTOMER\` | \`/customer/overview\` | View own loyalty cards, rewards catalog, vouchers, and transaction history |

Route guards are enforced at two levels:
1. **Middleware / layout guards** — Server-side redirect before page renders
2. **API-level guards** — JWT role validation on every Hono endpoint

Authenticated users who visit \`/\` are immediately redirected to their role's home page (e.g. \`MERCHANT\` → \`/merchant/overview\`).

---

## 5. Authentication System

**Provider**: Supabase Auth (JWT + refresh tokens delivered as HTTP-only cookies)

### Available Auth Flows

| Route | Description |
|---|---|
| \`/auth/login\` | Email + password login. Role-aware redirect after success |
| \`/auth/sign-up\` | Merchant self-registration. Supports \`?ref=\` and \`?joinStore=\` query params so customers auto-join a store after sign-up |
| \`/auth/sign-up-success\` | Post-registration confirmation screen |
| \`/auth/forgot-password\` | Sends a password-reset magic link via email |
| \`/auth/reset-password\` | Token-validated password reset form |
| \`/auth/verify\` | Email verification callback handler |
| \`/auth/callback\` | OAuth/magic-link callback handler |
| \`/auth/error\` | Generic auth error page |

### Session Management

- Access tokens are short-lived (Supabase default).
- A **refresh token** is stored in an HTTP-only cookie and auto-renewed by the API client on \`401\` responses (\`refreshAuthSession\`).
- The \`useAuth()\` hook exposes \`isAuthenticated\`, \`hasHydrated\`, \`profile\`, \`signOut\`, and \`revalidateSession\`.

---

## 6. Marketing Site & Public Pages

All pages under \`(marketing)\` use a shared \`SiteHeader\` + \`SiteFooter\`.

### Home Page (\`/\`)

\`HomePageContent\` — a product-led, minimalist landing page composed of **five full-screen sections**. Authenticated users are silently redirected to their role dashboard before the page renders.

#### Section 1 — Hero (\`HeroSection\`)

Full-viewport (\`min-h: 100dvh\`) section. Two-column grid on large screens:

- **Left column** — Bold headline (\`h1\`), short sub-headline, two CTA buttons ("Get Started", "Sign In"), and a three-badge trust bar (scan, earn, redeem).
- **Right column** — A high-fidelity **iPhone frame mockup** containing an interactive Customer Loyalty Pass preview. The pass shows the store name, brand color, points balance, a QR code, and a reward list. Tapping the **"Simulate Scan +25 pts"** button plays the POS success audio chime and animates the points balance up, demonstrating the earn flow in real time. A laser-sweep animation pulses over the QR code on scan.

#### Section 2 — Bento Features (\`BentoFeatures\`)

A responsive bento-grid of three product pillars:
1. **Web-native Loyalty Pass** — No app download needed; instant PWA card
2. **1-Second Camera POS** — Fast QR scan at counter; cashier earns points in one tap
3. **Fraud-Proof Perks** — Optical-QR-only redemption for security

#### Section 3 — How It Works (\`StepFlowSection\`)

Three-step numbered visual flow:
1. Scan the counter QR stand
2. Earn points on every purchase
3. Redeem rewards with a QR scan

#### Section 4 — FAQ (\`FaqSection\`)

Four direct, essential FAQs covering: no-download requirement, how points are earned, reward redemption security, and multi-store support.

#### Section 5 — CTA (\`CtaSection\`)

Minimalist closing call-to-action: bold headline, one "Get Started" button, no pricing table or tier comparison.

> **Note**: Social proof carousel, comparison tables, ROI calculator, and simulator sections from earlier versions have been removed. The page is intentionally minimal and product-led.

### Documentation Page (\`/docs\`)

A prose guide covering:
1. Platform overview
2. Setting up a coffee shop (Merchant Guide)
3. Cashier Terminal & POS workflow
4. Staff management
5. Customer digital loyalty card
6. Analytics & CRM

### Terms of Service (\`/terms\`)

Legal terms of service in prose format.

### Privacy Policy (\`/privacy\`)

GDPR/data-handling policy in prose format.

---

## 7. Customer PWA Wallet

Route group: \`(customer)\` — No sidebar, mobile-first layout with a sticky bottom navigation bar.

### 7.1 Store Landing Page — \`GET /store/[slug]\`

The public-facing entry point when a customer scans a counter QR stand or visits a store's link.

**Features:**
- Fetches store data by slug (with fallback by \`?ref=\` store ID for referrals)
- Displays the animated **Apple Wallet-style 3D loyalty pass** (front/back flip) with:
  - Store name, brand color, and logo
  - Points-per-TND ratio
  - Sample QR code
  - Available rewards catalog
- **Welcome Bonus banner** — shown if \`store.welcomePoints > 0\`, e.g. "+50 pts on join"
- **Referral banner** — "You scanned the counter QR stand for [Store Name]"
- **Rewards catalog** — Lists all active rewards with their point cost

**Join Flow:**
- If **unauthenticated** → CTA redirects to \`/auth/sign-up?ref=...&joinStore=...\` so membership is created automatically after registration
- If **authenticated** → \`joinStore(storeId)\` is called, membership is created, redirected to \`/customer/overview\`
- Pending join is persisted in \`localStorage\` (\`fidely_pending_join_store\`) to survive navigation

**Header Controls:** Language switcher + Dark/Light theme toggle

---

### 7.2 Customer Overview — \`/customer/overview\`

The customer's primary hub, displaying all enrolled loyalty programs.

#### Layout

- **Sticky top header** — Fidely logo, language switcher, theme toggle, user email, logout
- **Bottom navigation bar** — "My Cards", "Perks", "Stores" (mobile tab nav)

#### Store Switcher / Card Carousel

When enrolled in multiple stores, a pill-tab row lets the customer switch between active membership cards. Each pill shows:
- Store logo (or default coffee icon)
- Store name
- Current points badge

#### Apple Wallet Pass Component

The centerpiece of the customer view — a **3D-flippable loyalty card** that mimics Apple Wallet passes:

**Front face:**
- Store name + logo
- Brand color accent bar
- Member name
- Member since date
- Points balance (large, prominent)
- Points-per-TND rate
- Next reward name + cost
- Reachable rewards count

**Back face:**
- Scannable QR code (encodes the unique \`qrCodeToken\`)
- QR refresh button (rotates token server-side for security)
- Copy token button

The card is **interactive** (flip on click/tap) and uses \`backface-visibility: hidden\` for smooth CSS 3D animation.

#### Phone Number Banner

If the customer hasn't set a phone number, a dismissible amber banner prompts them to add one (used for cashier phone-based point-earning lookup).

#### Reward Tabs

Three-tab section alongside the card:

**Perks Tab (\`rewards\`)**
- Lists all active rewards for the active store
- Color-coded: green border = affordable now, gray = not enough points
- Shows how many more points are needed for locked rewards

**Vouchers Tab (\`vouchers\`)**
- Lists all active and used vouchers
- Each voucher shows: reward name, unique alphanumeric \`code\` (monospace, always \`dir="ltr"\`), issued date, and status badge (\`ACTIVE\` / \`CLAIMED\`)

**History Tab (\`history\`)**
- Chronological list of all \`earn\` and \`redeem\` transactions
- Each transaction shows: type icon, date/time, points affected (green \`+N pts\` for earn), and spend amount in TND

#### Join New Store Modal

A full-screen dialog with three tabs:
1. **QR Scan** — Live camera QR scanner to scan a counter QR stand
2. **Explore** — List of all available stores not yet joined, with a "Join" button per store
3. **Direct Link / Code** — Text input to manually enter a store slug (\`fidely.app/store/[slug]\`)

---

## 8. Cashier POS Terminal

Route: \`/cashier\` — Standalone layout (no sidebar), optimized for tablet/POS device use.

### 8.1 Authentication Guard

On load:
- Unauthenticated → redirect to \`/auth/login\`
- Role is \`CUSTOMER\` → redirect to \`/customer/overview\`
- Otherwise → load assigned stores

### 8.2 Terminal Header

Sticky top bar:
- **Fidely POS** logo + "LIVE" status badge
- **Store selector** — Dropdown (if assigned to multiple stores) or store name pill (if single)
- Cashier name + email (desktop, hidden on mobile)
- Language switcher
- Dark/Light theme toggle
- **Logout button** (icon flips in RTL)

### 8.3 Shift Stats Bar

Displayed once a store is selected:
- Store brand color accent stripe
- Store name + points-per-TND multiplier for reference
- **Shift stats** — "X transactions · Y pts issued this shift"
- **Shift History button** — Opens the full shift log modal

### 8.4 Transaction Panel — Issue Points Mode

1. Cashier enters the **order total in TND** (numeric input)
2. Live preview shows: "Will award N pts for X TND"
3. **Option A — QR Scan**: "Ready to Scan" button transitions to camera scan mode; cashier scans customer's phone; points are credited server-side
4. **Option B — Phone Lookup**: Cashier taps the phone icon to reveal the phone lookup dock, enters the customer's phone number, confirms the matched customer, and submits — points are credited without activating the camera

> **Security rule**: Phone lookup is available **only** for the **Issue Points (earn)** flow.

### 8.5 Transaction Panel — Redeem Reward Mode

1. Cashier selects a **reward from the dropdown** (all active rewards for the store)
2. Preview shows the reward name and point cost
3. **"Scan to Redeem" button** activates the camera scanner
4. Cashier scans the customer's QR code **optically** (camera only — no manual entry or image upload)
5. Points are deducted, a \`Voucher\` record is created, confirmation overlay is displayed

> **Security rule**: Reward redemption **requires** an optical QR camera scan. Phone number lookup is intentionally blocked for the redeem flow.

### 8.6 Phone Lookup (Issue Points Only)

Available exclusively in the **Issue Points** panel:

- Cashier taps the phone icon / "No camera?" affordance to reveal the lookup dock
- Enters the customer's phone number (digits only, 4+ chars)
- API call to \`/api/v1/transactions/lookup-by-phone\` returns the matched customer's name, QR token, and points balance
- Cashier confirms the match and submits; transaction executes as if the QR were scanned

### 8.7 QR Camera Scanner

- Powered by \`html5-qrcode\` library
- Continuous polling without audio on each scan attempt
- Fires \`posHaptics.scan()\` on a successful decode
- Works on tablets, smartphones, and desktop webcams
- **No manual entry or image-upload modes** — optical scan is the only input method for the QR scanner

### 8.8 Transaction Feedback Overlay

After every transaction:

- **Success (earn)** — Full-screen green overlay: "Points Issued ✓", customer name, points awarded, new balance, store name. Auto-dismisses after ~3 s.
- **Success (redeem)** — Full-screen overlay: "Reward Redeemed ✓", reward name, voucher code (monospace), new balance.
- **Error** — Red overlay with error message (e.g. "Invalid QR code", "Insufficient points", "Already redeemed").

**Sound effects:**
- \`posAudio.playSuccess()\` — pleasant chime on success
- \`posAudio.playError()\` — alert tone on error

**Haptics:**
- \`posHaptics.pointsIssued()\` — vibration pattern for points earn
- \`posHaptics.rewardClaimed()\` — distinct pattern for reward redemption
- \`posHaptics.error()\` — error haptic pattern

### 8.9 Shift History Modal

Full-screen drawer listing all transactions processed this session:
- Transaction icon (coin for earn, gift for redeem)
- Customer name + timestamp (HH:MM:SS)
- Spend amount in TND (earn) or "Claimed perk" (redeem)
- Points badge (always \`dir="ltr"\` monospace font)

### 8.10 Responsive Layout

The cashier UI adapts between a **desktop view** (two-column panel + full scanner) and a **mobile view** (bottom-sheet scanner, stacked controls). The \`ResponsiveCashierView\` component switches between these at the \`md\` breakpoint.

---

## 9. Merchant Dashboard

Route group: \`(merchant)\` — Protected sidebar layout requiring \`MERCHANT\` (or \`SUPER_ADMIN\`) role.

### Sidebar Navigation

The \`AppSidebar\` provides:
- Fidely logo + brand
- **Store switcher** — Pill showing active store name; click reveals dropdown to switch between owned stores
- Navigation links:
  - Overview
  - Customizer & Rewards
  - CRM
  - Analytics
  - Staff Management
  - Merchant Settings (account + store sub-pages)
- User avatar + email at bottom with logout

The sidebar and all its icons follow the active locale direction (RTL-aware).

### Desktop Header

Sticky header (visible \`md+\`):
- **Sidebar trigger** + dynamic breadcrumbs
- **Store switcher** (visible \`sm+\`)
- Language switcher (visible \`md+\`)
- Theme toggle
- Settings shortcut button

### Mobile Header & Quick-Switch

On screens below \`md\`, the \`MobileHeader\` component renders a compact top bar with:
- Active store name + logo
- A **"POS" quick-access pill link** (→ \`/cashier\`) with a QR code icon — one tap to open the POS register without navigating through the sidebar

A **\`MerchantBottomNav\`** bar is docked at the bottom of the screen for primary navigation on mobile.

---

### 9.1 Overview Page — \`/merchant/overview\`

The merchant's home page. Three sections:

#### KPI Cards (4-up grid)

| KPI | Icon |
|---|---|
| Total Members — enrolled customer count | Users |
| Points Issued — lifetime total | TrendingUp |
| Points Redeemed — lifetime total | Award |
| Net Outstanding — Issued − Redeemed | Zap |

#### Smart Insights Bar

Live diagnostic panel with three actionable insight cards:

1. **Redemption Velocity** — Computes redemption rate (%). Shows warning if below 15% with a link to manage perks.
2. **Counter Stand Print** — Prompt to print/share the QR stand for higher enrollment.
3. **Welcome Gift Incentive** — Shows whether welcome bonus is active and how many points, or encourages enabling it.

#### Quick Action Grid

Three shortcut cards linking to:
- Customizer (brand + rewards)
- CRM (customer directory)
- Staff Management

#### Multi-Store Switcher Bar

When the merchant owns more than one store, a scrollable pill bar appears at the top for instant switching. The active store has a highlighted pill with a checkmark.

#### First-Store Creation Flow

If no stores exist yet, a card prompts creation:
- Store name input (auto-slugifies to URL identifier in real time)
- Custom slug field with live preview of \`fidely.app/store/[slug]\`
- "Create Store" submit button with loading state

---

### 9.2 Customizer & Rewards — \`/merchant/customizer\`

A split-panel page: settings form on the left, live pass simulator on the right.

#### Brand Identity Section

| Setting | Description |
|---|---|
| **Store Name** | Editable store display name |
| **Public URL** | \`fidely.app/store/[slug]\` — with auto-sync toggle (name → slug), copy link button, and preview link |
| **Store Icon / Logo** | Upload PNG/JPEG/WebP/SVG. Client-side optimized to 128×128 px WebP, ≤ 25 KB. Shows remove button when set |
| **Brand Color** | 8 preset color swatches (Espresso, Caramel, Terracotta, Matcha, Cobalt, Berry, Rose, Charcoal) + custom hex color picker input |
| **Points Multiplier** | Preset buttons (5, 10, 15, 20, 25 pts/TND) + custom number input. Live example: "25 TND = N pts" |
| **Welcome Bonus** | Preset buttons (0, 10, 20, 50, 100 pts) + custom input. Displayed as active/disabled badge |

**Save Changes button** — Only enabled when the form has unsaved changes (diff detection across all fields).

#### Live Pass Simulator

A sticky right column showing a real-time **AppleWalletPass** component that reflects all form changes instantly — giving the merchant a pixel-perfect preview of exactly what customers will see.

#### Counter QR Stand Studio (\`StoreQRStandCard\`)

A printable A4-ready marketing flyer mockup below the form:
- Store logo prominently displayed
- QR code encoding the store's public URL (\`fidely.app/store/[slug]\`)
- "Scan to get your loyalty card" call-to-action
- Points multiplier displayed (e.g. "Earn 10 pts per TND")
- Welcome bonus callout if active
- Fidely branding footer
- **Print / Download** button for physical counter placement

#### Rewards & Perks Catalog

A dedicated section for managing the rewards catalog:

**Reward Card Grid** — Each card shows:
- Reward name + optional description
- Point cost badge
- Active/hidden toggle (Switch)
- Edit button → opens the Edit Reward modal
- Delete button with confirmation

**Add / Edit Reward Modal** — Dialog form:
- Reward name (required)
- Description (optional, multiline)
- Point cost (number input)
- Save disabled if no changes detected (edit mode) or if name/cost is empty (create mode)

---

### 9.3 CRM — \`/merchant/crm\`

The Customer Relationship Management directory for all enrolled loyalty members.

#### KPI Summary (3 cards)

| KPI | Value |
|---|---|
| Total Enrolled | Total membership count for the active store |
| Total Points Held | Sum of all customer \`pointsBalance\` values |
| Average Balance | Total ÷ member count |

#### Member Directory

**Desktop (table view):**
- Avatar with initials
- Full Name (or "Anonymous Customer")
- Email (monospace)
- Points Balance badge (monospace, highlighted)
- Join Date

**Mobile (card list):**
- Avatar + Name + Email (stacked) + Join Date with calendar icon
- Points balance badge aligned to end

**Search bar**: Real-time client-side filter by name or email.

**Refresh button**: Re-fetches the member list from the API.

---

### 9.4 Analytics — \`/merchant/analytics\`

Visual performance dashboard for the active store.

#### KPI Summary (3 cards)

- **Total Points Issued** (lifetime)
- **Total Points Redeemed** (lifetime)
- **Net Outstanding** (issued − redeemed)

#### Transaction Trend Chart

A \`recharts\` \`BarChart\` displaying grouped earn vs. redeem bars by date:
- Custom tooltip with brand-colored styling
- Legend with localized label strings
- Responsive container adapting to any screen width
- Graceful empty state ("No activity recorded") when no data exists

---

### 9.5 Staff Management — \`/merchant/staff\`

Full CRUD interface for managing cashier accounts assigned to the store.

#### Staff Table

**Desktop (table):**
- Avatar + Full Name
- Email (monospace) + optional phone number + copy-to-clipboard button
- Role badge (\`Cashier\`)
- Date added
- Actions dropdown menu (Edit, Change Password, Remove)

**Mobile (card list):**
- Compact card with avatar, name, email, role badge, date
- Actions dropdown per row

**Search bar**: Filter by name or email in real time.

#### Dialogs

**Add Cashier Dialog:**
- Full Name (required)
- Email (required)
- Password — show/hide toggle + "Auto-generate strong password" (generates 10-char alphanumeric + special chars)
- Phone (optional)
- Validation: email format, password min-length 6

**Edit Cashier Dialog:**
- Update Full Name and Phone
- Save button disabled unless changes are detected (diff check)

**Change Password Dialog:**
- New Password field with show/hide toggle
- Auto-generate button (Sparkles icon)
- Min-length 6 validation
- Amber key icon in header

**Remove Cashier Dialog:**
- Destructive confirmation listing the cashier's name and the store name
- Red alert triangle icon header
- Irreversible — removes the cashier from the store entirely

All actions show loading spinners and dismissible toast notifications on success or error.

---

### 9.6 Merchant Settings

Redirects automatically to \`/merchant/settings/account\`. Two sub-pages:

- **Account Settings** (\`/merchant/settings/account\`) — Update profile (name, phone, address), change email/password
- **Store Settings** (\`/merchant/settings/store\`) — Store-level configuration mirroring some Customizer fields

---

## 10. Super Admin Console

Route group: \`(admin)\` — Protected sidebar layout requiring \`SUPER_ADMIN\` role.

### 10.1 Admin Overview — \`/admin/overview\`

The platform command center showing aggregated KPIs across all tenants.

#### KPI Cards (4-up grid)

| KPI | Icon Color |
|---|---|
| Total Transaction Volume (TND, all stores) | Emerald |
| Registered Stores (count) | Blue |
| Platform Users (total, with merchants/cashiers/customers breakdown) | Purple |
| Points Pool (total issued, with redeemed in description) | Amber |

#### 14-Day Volume Chart

A \`recharts\` \`AreaChart\` with gradient fill showing daily TND transaction volume. Chart is always \`dir="ltr"\` for correct axis orientation. Features:
- Custom gradient fill
- Tooltip formatted as "N,NNN TND"
- Empty state shown when no data

#### Live Activity Feed

Real-time stream of the 6 most recent transactions across all stores:
- Customer name (or "Anonymous")
- Store name
- TND amount or points count
- Transaction type badge
- "View all" link to \`/admin/transactions\`

#### QR Stand Performance Widget

Customer acquisition source analysis:
- Total customer base count
- Acquired via store QR scan (referrals)
- Acquired organically/directly

**Top QR Outlets table** — per-store breakdown:
- Store logo chip + name + total members
- QR sign-up count badge (emerald)

#### Quick Navigation Cards
- Store Directory → \`/admin/stores\`
- User Directory → \`/admin/users\`
- Audit Ledger → \`/admin/transactions\`

---

### 10.2 Store Directory — \`/admin/stores\`

Full list of all registered stores with: name, slug, owner email, member count, transaction count, status (active/inactive), and created date.

### 10.3 User Directory — \`/admin/users\`

All platform users with: name, email, role badge, joined date, and quick actions (view profile, deactivate).

### 10.4 Transaction Audit Ledger — \`/admin/transactions\`

Full transaction log across all stores: customer name + email, store name, cashier name, type (\`earn\`/\`redeem\`), TND amount, points affected, and timestamp.

---

## 11. API Surface (v1)

All endpoints are prefixed \`/api/v1/\`. Authentication via HTTP-only JWT cookie. Role guards applied per route group.

### Authentication

| Method | Path | Description |
|---|---|---|
| \`POST\` | \`/authentication/sign-up\` | Register new user |
| \`POST\` | \`/authentication/login\` | Email + password login, returns JWT cookies |
| \`POST\` | \`/authentication/logout\` | Clears auth cookies |
| \`POST\` | \`/authentication/refresh\` | Exchanges refresh token for new access token |
| \`POST\` | \`/authentication/forgot-password\` | Sends reset magic link |
| \`POST\` | \`/authentication/reset-password\` | Token + new password |

### Customer

| Method | Path | Description |
|---|---|---|
| \`GET\` | \`/customer/store/:slugOrId\` | Public store data (name, rewards, branding) |
| \`GET\` | \`/customer/overview\` | All memberships, rewards, vouchers, and transactions for the authenticated customer |
| \`POST\` | \`/customer/join\` | Join a store by ID (creates \`CustomerMembership\`) |
| \`POST\` | \`/customer/join-by-slug\` | Join a store by slug |
| \`POST\` | \`/customer/refresh-qr\` | Rotate \`qrCodeToken\` for a membership |

### Transactions (Cashier)

| Method | Path | Description |
|---|---|---|
| \`GET\` | \`/transactions/my-stores\` | Cashier's assigned stores |
| \`GET\` | \`/transactions/recent?storeId=\` | Recent transactions for the active store |
| \`POST\` | \`/transactions/issue\` | Validates QR token, calculates \`amountTnd × pointsPerTnd\`, updates balance |
| \`POST\` | \`/transactions/redeem\` | Validates points sufficiency, deducts balance, creates \`Voucher\` — requires valid QR token |
| \`GET\` | \`/transactions/lookup-by-phone\` | Finds a customer membership by phone number (issue flow only) |

### Merchant

| Method | Path | Description |
|---|---|---|
| \`GET\` | \`/merchant/stores\` | Merchant's owned stores |
| \`POST\` | \`/merchant/stores\` | Create a new store |
| \`PATCH\` | \`/merchant/stores/:id\` | Update store settings |
| \`GET\` | \`/merchant/stores/:id/analytics\` | Analytics: member count, points issued/redeemed, recent transaction groups |
| \`GET\` | \`/merchant/stores/:id/customers\` | CRM: all customer memberships with balances and join dates |
| \`GET/POST\` | \`/merchant/stores/:id/rewards\` | List / create rewards |
| \`PATCH/DELETE\` | \`/merchant/stores/:id/rewards/:rewardId\` | Update / delete a reward |
| \`GET/POST\` | \`/merchant/stores/:id/staff\` | List / create cashiers |
| \`PATCH\` | \`/merchant/stores/:id/staff/:userId\` | Update cashier profile |
| \`PATCH\` | \`/merchant/stores/:id/staff/:userId/password\` | Change cashier password |
| \`DELETE\` | \`/merchant/stores/:id/staff/:userId\` | Remove cashier from store |

### Admin

| Method | Path | Description |
|---|---|---|
| \`GET\` | \`/admin/metrics\` | Platform-wide KPIs, daily trends, store acquisition data |
| \`GET\` | \`/admin/transactions\` | Full transaction audit log |
| \`GET\` | \`/admin/stores\` | All stores |
| \`GET\` | \`/admin/users\` | All users |

### Users

| Method | Path | Description |
|---|---|---|
| \`GET\` | \`/users/me\` | Current authenticated user profile |
| \`PATCH\` | \`/users/me\` | Update own profile (name, phone, address) |

### Reviews

| Method | Path | Description |
|---|---|---|
| \`GET\` | \`/reviews/\` | List published reviews |
| \`POST\` | \`/reviews/\` | Submit a new review |

---

## 12. Internationalization (i18n) & RTL

### Supported Locales

| Code | Language | Direction |
|---|---|---|
| \`en\` | English | LTR |
| \`ar\` | Arabic | RTL |
| \`fr\` | French | LTR |

### Implementation

- Custom \`useI18n()\` hook (\`apps/web/lib/i18n/\`) returns \`{ t, dir, isRtl, locale }\`.
- Translation keys live in \`apps/web/lib/i18n/locales/[en|ar|fr].ts\`.
- Locale is stored in \`localStorage\` and applied via \`document.documentElement.dir\` and \`document.documentElement.lang\`.
- The \`dir\` value (\`"ltr"\` or \`"rtl"\`) is passed to all components and layout containers.
- All five landing page sections (\`HeroSection\`, \`BentoFeatures\`, \`StepFlowSection\`, \`FaqSection\`, \`CtaSection\`) are fully localized.

### Key i18n Rules

- **"Fidely" is never translated** — the brand name remains \`Fidely\` in all locales.
- **Numeric/QR tokens** always use \`dir="ltr"\` and \`font-mono\` regardless of locale.
- **Bidirectional icons** — directional icons (e.g. arrows) use \`rtl:rotate-180\` Tailwind class to flip automatically in RTL.
- **Logical CSS properties** — All padding, margin, and alignment use \`ps-\`, \`pe-\`, \`ms-\`, \`me-\`, \`text-start\`, \`text-end\` instead of \`left\`/\`right\` hardcodes.
- **100% key parity** — All three locale files have identical key sets. No fallback to English.
- **Interpolation** — Keys support named placeholders, e.g. \`t('staff_toast_created_desc', { name: '...' })\`.

### Language Switcher

A \`LanguageSwitcher\` dropdown component is present in:
- Marketing site header (\`SiteHeader\`)
- Customer overview header
- Customer store page header
- Cashier terminal header
- Merchant/Admin dashboard header

---

## 13. Progressive Web App (PWA)

### Web App Manifest (\`/manifest.ts\`)

Dynamically generated JSON manifest:
- \`name\`: "Fidely"
- \`short_name\`: "Fidely"
- \`display\`: \`standalone\`
- \`start_url\`: \`/\`
- \`icons\`: Multiple resolutions (192×192, 512×512)

### Service Worker

Configured via \`next-pwa\`. Handles:
- Offline fallback pages
- Static asset caching

### PWA Install Prompt Component (\`PWAInstallPrompt\`)

A custom React component that:
- Listens for the \`beforeinstallprompt\` browser event
- Shows an ambient bottom banner ("Add to Home Screen") after a short delay
- Triggers the native A2HS dialog on user confirmation
- Works on Android Chrome natively and provides iOS Safari instructions
- Displayed on the customer store join page (\`/store/[slug]\`)

### Apple Wallet-Style Pass

The \`AppleWalletPass\` component renders a pixel-perfect Apple Wallet card UI:
- \`backface-visibility: hidden\` for smooth 3D CSS flip animation
- Adapts brand color, logo, member info, and QR code dynamically
- Works as the customer's "digital card" — shown on home screen when PWA is installed

---

## 14. Accessibility & Design System

### Design Tokens

CSS variables defined in \`globals.css\`:
- \`--primary\`, \`--background\`, \`--foreground\`, \`--muted\`, \`--border\`, \`--destructive\`
- **Dark mode**: System-aware via \`prefers-color-scheme\` + manual toggle via \`ThemeToggleButton\`
- **Typography**: Inter font (Google Fonts) — weights 400, 500, 600, 700, 800, 900

### Component Library

Built on **Radix UI primitives** with custom styling (shadcn patterns):
- \`Button\`, \`Badge\`, \`Card\`, \`Input\`, \`Label\`, \`Select\`, \`Switch\`, \`Tabs\`
- \`Dialog\`, \`DropdownMenu\`, \`Avatar\`, \`Table\`, \`Separator\`, \`Tooltip\`

### Responsive Breakpoints

| Breakpoint | Tailwind prefix | Layout behavior |
|---|---|---|
| Mobile \`< sm\` | (base) | Stacked layout, card list views, bottom nav |
| Tablet \`sm\` | \`sm:\` | Two-column grids, some tables visible |
| Desktop \`md\` / \`lg\` | \`md:\` / \`lg:\` | Full table views, sidebar visible, multi-column grids |

### Key Accessibility Practices

- All interactive elements have \`aria-label\` or \`sr-only\` text
- Focus rings preserved on all interactive components
- Color contrast meets WCAG AA minimum
- \`dir\` attribute propagated correctly for screen readers in RTL mode

---

## 15. Cron Jobs & Background Tasks

A cron route exists at \`apps/web/app/api/cron/\`. Intended for scheduled maintenance:

- **Voucher expiry** — Transitioning \`active\` vouchers to \`expired\` after a set TTL
- **Analytics aggregation** — Pre-computing daily trend data for the admin dashboard
- **Merchant digest emails** — (Planned) Sending weekly loyalty performance summaries

> Triggered by Vercel Cron or an external scheduler (e.g. Upstash QStash).

---

## 16. Route Map Summary

| URL Pattern | Role Required | Description |
|---|---|---|
| \`/\` | Public | Marketing home page (5 full-screen sections) |
| \`/docs\` | Public | Documentation & setup guide |
| \`/terms\` | Public | Terms of service |
| \`/privacy\` | Public | Privacy policy |
| \`/store/[slug]\` | Public | Customer store join page & loyalty pass preview |
| \`/auth/login\` | Public | Login page |
| \`/auth/sign-up\` | Public | Registration page |
| \`/auth/forgot-password\` | Public | Password reset request |
| \`/auth/reset-password\` | Public | Password reset form |
| \`/auth/verify\` | Public | Email verification |
| \`/auth/callback\` | Public | OAuth callback |
| \`/customer/overview\` | \`CUSTOMER\` | Loyalty wallet, cards, rewards, vouchers, history |
| \`/cashier\` | \`CASHIER\`, \`MERCHANT\` | POS terminal (earn via QR or phone lookup; redeem via QR only) |
| \`/merchant/overview\` | \`MERCHANT\` | Dashboard home with KPIs and smart insights |
| \`/merchant/customizer\` | \`MERCHANT\` | Branding + QR stand + rewards studio |
| \`/merchant/crm\` | \`MERCHANT\` | Customer directory with search |
| \`/merchant/analytics\` | \`MERCHANT\` | Points analytics charts |
| \`/merchant/staff\` | \`MERCHANT\` | Cashier management (CRUD) |
| \`/merchant/settings/account\` | \`MERCHANT\` | Account settings |
| \`/merchant/settings/store\` | \`MERCHANT\` | Store settings |
| \`/admin/overview\` | \`SUPER_ADMIN\` | Platform command center with KPIs and activity feed |
| \`/admin/stores\` | \`SUPER_ADMIN\` | All stores directory |
| \`/admin/users\` | \`SUPER_ADMIN\` | All users directory |
| \`/admin/transactions\` | \`SUPER_ADMIN\` | Full transaction audit ledger |

---

*Document last updated: September 2026 — synchronized with full codebase analysis.*
