# Fidely Implementation Roadmap

**Project Description**: Multi-tenant, zero-download PWA loyalty platform for coffee shops in Tunisia.
**Tech Stack**: Next.js 14+ (App Router), Hono API, Drizzle ORM, Tailwind CSS (based on `saas-boilerplate-next-hono`), PostgreSQL.

---

## Phase 1: Foundation & Boilerplate Setup (Current)
- [x] **Step 1: Clone Boilerplate**: Clone `marwenjaballah/saas-boilerplate-next-hono` into the repository.
- [x] **Step 2: Clean Up & Initialize**: Remove boilerplate git history, initialize fresh git repository, and install dependencies using `pnpm`.
- [x] **Step 3: Environment Setup**: Configure `.env.local` for PostgreSQL database (Supabase/Neon).
- [x] **Step 4: Drizzle Schema Migration**: Extend the boilerplate's schema with multi-tenant tables (`stores`, `customer_memberships`, `rewards`, `transactions`, `vouchers`) and run migrations.
- [x] **Step 5: Role-based Authentication**: Map boilerplate authentication to specific roles: `super_admin`, `merchant`, `cashier`, `customer`.

## Phase 2: Customer PWA & Store Routing
- [x] **Step 1: Store Routing**: Implement dynamic tenant resolution (`/store/[slug]`) mapping to individual merchants.
- [x] **Step 2: PWA Configuration**: Configure `next-pwa` (or equivalent) for dynamic manifests (`manifest.ts`) and offline service workers.
- [x] **Step 3: Add to Home Screen (A2HS)**: Build the native installation prompt UI component.
- [x] **Step 4: QR Code Pass**: Generate and display a dynamic/secure `qrCodeToken` on the customer portal using `qrcode.react`.
- [x] **Step 5: Customer Portal UI**: Build the digital loyalty card view, rewards listing, and points history UI.

## Phase 3: Cashier Terminal & Real-Time Scanning
- [ ] **Step 1: Cashier Routing**: Setup the `/cashier` protected routes.
- [ ] **Step 2: QR Scanner Integration**: Implement `html5-qrcode` component optimized for fast mobile/tablet scanning.
- [ ] **Step 3: Point Issuance API**: Build the Hono API endpoint (`/api/transactions/issue`) using secure Drizzle transactions to calculate points based on TND spend and update balances.
- [ ] **Step 4: Transaction Feedback UI**: Implement immediate audio/visual feedback (success/error states) for the cashier to optimize checkout speed.
- [ ] **Step 5: Reward Redemption**: Build the flow for scanning customer passes to validate and deduct points for rewards.

## Phase 4: Merchant Dashboard & CRM
- [ ] **Step 1: Dashboard UI Framework**: Setup the Merchant admin sidebar and overview layout using the boilerplate's dashboard components.
- [ ] **Step 2: Store Customization**: Build settings forms allowing merchants to configure their branding (colors, logo) and `pointsPerTnd` rules.
- [ ] **Step 3: Customer CRM**: Develop a paginated table view for merchants to see their loyalty members and balances.
- [ ] **Step 4: Staff Management (RBAC)**: Create UI for merchants to invite users as cashiers for their store.
- [ ] **Step 5: Analytics & Metrics**: Integrate `recharts` to display visual analytics for points issued vs. redeemed over time.

---
*Roadmap generated as part of initial setup. Task tracking will proceed sequentially.*
