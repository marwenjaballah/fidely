# Fidely Implementation Roadmap

**Project Description**: Multi-tenant, zero-download PWA loyalty platform for coffee shops and retail businesses.
**Tech Stack**: Next.js 16 (App Router), Hono API, Prisma ORM, Tailwind CSS, PostgreSQL / Supabase.

---

## Phase 1: Foundation & Architecture Setup
- [x] **Step 1: Workspace Architecture**: TurboRepo + pnpm workspaces monorepo structure.
- [x] **Step 2: Clean Up & Initialize**: Fresh repository setup, dependency management, and build orchestration.
- [x] **Step 3: Environment Setup**: Configure environment configurations for development, staging, and production.
- [x] **Step 4: Schema Migration**: Multi-tenant Prisma schema (`stores`, `customer_memberships`, `rewards`, `transactions`, `vouchers`).
- [x] **Step 5: Role-based Authentication**: Role-based access control: `super_admin`, `merchant`, `cashier`, `customer`.

## Phase 2: Customer PWA & Store Routing
- [x] **Step 1: Store Routing**: Implement dynamic tenant resolution (`/store/[slug]`) mapping to individual merchants.
- [x] **Step 2: PWA Configuration**: Configure `next-pwa` (or equivalent) for dynamic manifests (`manifest.ts`) and offline service workers.
- [x] **Step 3: Add to Home Screen (A2HS)**: Build the native installation prompt UI component.
- [x] **Step 4: QR Code Pass**: Generate and display a dynamic/secure `qrCodeToken` on the customer portal using `qrcode.react`.
- [x] **Step 5: Customer Portal UI**: Build the digital loyalty card view, rewards listing, and points history UI.

## Phase 3: Cashier Terminal & Real-Time Scanning
- [x] **Step 1: Cashier Routing**: Setup the `/cashier` protected routes.
- [x] **Step 2: QR Scanner Integration**: Implement `html5-qrcode` component optimized for fast mobile/tablet scanning.
- [x] **Step 3: Point Issuance API**: Build the Hono API endpoint (`/api/transactions/issue`) using secure Drizzle/Prisma transactions to calculate points based on TND spend and update balances.
- [x] **Step 4: Transaction Feedback UI**: Implement immediate audio/visual feedback (success/error states) for the cashier to optimize checkout speed.
- [x] **Step 5: Reward Redemption**: Build the flow for scanning customer passes to validate and deduct points for rewards.

## Phase 4: Merchant Dashboard & CRM
- [ ] **Step 1: Dashboard UI Framework**: Setup the Merchant admin sidebar and overview layout using modern responsive dashboard components.
- [ ] **Step 2: Store Customization**: Build settings forms allowing merchants to configure their branding (colors, logo) and `pointsPerTnd` rules.
- [ ] **Step 3: Customer CRM**: Develop a paginated table view for merchants to see their loyalty members and balances.
- [ ] **Step 4: Staff Management (RBAC)**: Create UI for merchants to invite users as cashiers for their store.
- [ ] **Step 5: Analytics & Metrics**: Integrate `recharts` to display visual analytics for points issued vs. redeemed over time.

---
*Roadmap generated as part of initial setup. Task tracking will proceed sequentially.*
