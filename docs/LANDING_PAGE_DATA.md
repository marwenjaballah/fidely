# Fidely Landing Page — Complete Data & Content Specification

This document provides a raw data breakdown of all information, configurations, formulas, content copy, and metrics present across the **Fidely** landing page.

---

## 1. Product Positioning & Value Propositions

* **Product Name**: Fidely Pro (Fidely Loyalty Systems)
* **Tagline**: The Fidely Wallet Loyalty & POS for Specialty Cafes.
* **Target Audience**: Specialty coffee shops, bakeries, artisan roasters, and independent retail brands.
* **Core Problem Solved**: Eliminates lost paper punch cards, avoids customer App Store friction, and replaces expensive $2,500+ POS hardware with native browser passes and sub-second camera scanning.
* **Key Value Pillars**:
  1. **0 App Downloads**: Customers access their pass directly in mobile browsers and save it to their Fidely Wallet / home screen.
  2. **< 1-Second POS Checkout**: Any device with a camera (smartphone, iPad, laptop) functions as an optical QR scanner.
  3. **Print-Ready Counter Stands**: Auto-generated 1200×1600px acrylic table-tent stands with store-branded QR codes.
  4. **Single-Use Cryptographic Vouchers**: 1-time voucher redemption with instant burn to prevent duplication.

---

## 2. Key Metrics & Benchmarks

| Metric | Value / Benchmark | Context |
| :--- | :--- | :--- |
| **Checkout Scan Speed** | `< 0.8s` | Time required for barista camera to read QR pass and calculate points |
| **Scan Reliability** | `99.4%` | Optical read rate under variable cafe lighting |
| **Repeat Visit Boost** | `+32%` / `2.5x` | Increase in monthly visit frequency among enrolled regulars |
| **Setup Time** | `< 2 minutes` | Time to create shop, configure points ratio, and download counter stand |
| **Average Rating** | `5.0 / 5.0` | Verified merchant review score |

---

## 3. Interactive Modules & Simulators Data

### A. Quick Menu Preset Data (Hero Module)
* **Item 1**: *Oat Flat White* — Price: `4.20 TND` | Loyalty Points: `+42 PTS`
* **Item 2**: *Iced Caramel Latte* — Price: `4.80 TND` | Loyalty Points: `+48 PTS`
* **Item 3**: *Almond Croissant* — Price: `3.50 TND` | Loyalty Points: `+35 PTS`

### B. Color Palette Presets (Pass Customizer)
* **Caramel Amber**: `#D97706`
* **Dark Espresso**: `#4A2C2A`
* **Terracotta**: `#EA580C`
* **Forest Matcha**: `#059669`
* **Cobalt Blue**: `#2563EB`
* **Velvet Berry**: `#9333EA`

### C. POS Numpad & Register Presets
* **Quick Add Chips**: `+5.00 TND`, `+12.50 TND`, `+25.00 TND`
* **Default Points Ratio**: `10 PTS per 1.00 TND` (Configurable by merchant)
* **Register Terminal Auditing**: Real-time timestamp logging with terminal identifier (e.g. `Terminal 01 • Main Counter`).

### D. Acrylic Counter Stand Specifications
* **Export Resolution**: `1200 × 1600 px` (300 DPI Canvas Output)
* **Supported Physical Frame Sizes**: `4" × 6"` and `5" × 7"` acrylic table tents
* **Embedded Data**: Branded QR code with referral attribution query (`?store={storeName}&ref={storeId}`)

### E. Merchant Command Center KPIs (Simulated Snapshot)
* **Active Regulars**: `1,482 members` (`+28.4%` monthly growth)
* **Repeat Visit Rate**: `68.2%` (Average `4.1` visits / month)
* **Counter Stand Signups**: `894` (`62%` of all customer acquisitions)
* **Vouchers Redeemed**: `312` (`100%` single-use burn rate)

---

## 4. ROI & Revenue Growth Calculator Data

### Formulas & Assumptions:
* **Walk-in Conversion Rate**: `22%` of daily customers enroll in loyalty.
* **Monthly Loyalty Growth**: $\text{New Members / Month} = \text{Daily Orders} \times 30 \times 0.22$
* **Repeat Visit Multiplier**: Enrolled members visit `2.5x` more often.
* **Estimated Extra Monthly Revenue**: $\text{New Members} \times \text{Average Order Total} \times 1.8$
* **Annual Boost**: $\text{Monthly Revenue} \times 12$

### Variable Input Ranges:
* **Daily Orders Range**: `30` to `500+` cups/day (Default: `120`)
* **Average Check Range**: `2.50` to `25.00 TND` (Default: `6.50 TND`)

---

## 5. Comparison Matrix: Old Way vs. Fidely Way

| Feature / Dimension | The Old Clunky Way | The Fidely Way |
| :--- | :--- | :--- |
| **Customer Friction** | Forcing App Store downloads or physical paper cards left at home. | **Zero app install**. 1-tap browser scan adds pass to Fidely Wallet. |
| **Hardware Costs** | $2,500+ proprietary touchscreen POS terminals + service fees. | **$0 extra hardware**. Works on existing phone, iPad, or laptop cameras. |
| **Queue Speed** | Manual phone lookups, manual stamp cards, 10-digit PIN entry. | **< 0.8s optical scan** with instant audio register chime. |
| **Voucher Fraud** | Forged paper stamps or shared coupon screenshots. | **Cryptographic 1-time single-use vouchers** burned on scan. |
| **Customer Re-engagement**| Zero customer data collected once customers leave the store. | **Lock-screen updates** and live balance tracking. |

---

## 6. Core Product Capabilities (Bento Data)

1. **Native Fidely Wallet Passes**: Instant card generation without app store downloads.
2. **1-Second Optical POS Scanner**: Camera-based cashier terminal with audio-tactile haptic feedback.
3. **Printable Acrylic Stand Generator**: 1200×1600px high-res table tent generator with store branding.
4. **1-Time Single-Use Vouchers**: Automatic status transition from `ACTIVE` to `USED` with timestamp logs.
5. **Cross-Store & Shift Security**: Multi-store isolation, PIN-protected cashier shift logins, and mismatch protection.
6. **Referral & Channel Attribution**: Direct attribution breakdown comparing countertop QR signups vs organic peer referrals.

---

## 7. Merchant Onboarding Workflow (3 Steps)

1. **Step 01 — Create Your Brand & Pass** (Setup time: 60s): Configure brand colors, points-per-dinar ratio, and reward tiers.
2. **Step 02 — Print Your Counter Stand** (Action: 1-Click Export): Download the custom 1200×1600px acrylic poster and place it by the checkout counter.
3. **Step 03 — Baristas Scan & Reward** (Speed: < 1s): Baristas enter transaction totals on their counter device and scan customer QR passes.

---

## 8. Merchant Reviews & Testimonials Data

* **Reviewer 1**: *Yassine Mansour* — Owner, Roasters Specialty Cafe
  * *Title*: "No more lost punch cards!"
  * *Rating*: `5 / 5`
  * *Quote*: "Customers love adding their pass to Fidely Wallet. Our morning rush queues move twice as fast now because baristas just scan with our iPad camera in 1 second."
* **Reviewer 2**: *Celine Baccouche* — Founder, L'Atelier du Pain & Cafe
  * *Title*: "Repeat visits jumped 35% in 3 weeks"
  * *Rating*: `5 / 5`
  * *Quote*: "The acrylic table stand generator is brilliant. We printed two stands for our cashier desks and gained over 400 loyalty members in our very first month."
* **Reviewer 3**: *Karim Ben Amor* — Lead Barista, Urban Espresso Bar
  * *Title*: "Zero hardware costs was a game changer"
  * *Rating*: `5 / 5`
  * *Quote*: "We didn't need to buy expensive proprietary POS hardware. All 3 of our branch baristas use their standard counter tablets without a glitch."

---

## 9. Frequently Asked Questions (FAQ Data)

* **Q: Do customers need to download an app from the App Store or Google Play?**
  * *A*: No. Customers point their phone camera at the counter QR stand. The digital loyalty pass opens in their mobile browser and can be saved to Fidely Wallet or their home screen in 1 tap.
* **Q: What hardware or POS equipment is needed?**
  * *A*: Zero special hardware. Any smartphone, tablet (iPad), laptop, or touchscreen terminal functions as a scanner.
* **Q: How do baristas award points and redeem rewards at checkout?**
  * *A*: The cashier enters the purchase amount (or taps preset chips) and scans the customer's pass. Points apply in under 1 second with audio chime confirmation.
* **Q: How does the 1-time voucher burn protection work?**
  * *A*: When a customer redeems a perk, the barista scans the voucher QR. The system immediately marks it as `USED` with an exact timestamp, preventing reuse.
* **Q: Can I manage multiple cafe branches and staff accounts?**
  * *A*: Yes. Supports multi-store management, dedicated cashier PIN logins, and cross-store mismatch protection.
* **Q: How does the acrylic counter stand referral attribution work?**
  * *A*: Exported stands embed a unique store referral tag. Walk-ins who register are automatically credited to that store in the analytics hub.

---

## 10. Navigation & Route Architecture

| Section / Destination | Route / Anchor | Target Role / Access |
| :--- | :--- | :--- |
| **Home / Root** | `/` | Public |
| **Live Simulator** | `/#interactive-playground` | Public |
| **Capabilities** | `/#features` | Public |
| **How It Works** | `/#how-it-works` | Public |
| **Reviews** | `/#reviews` | Public |
| **FAQ** | `/#faq` | Public |
| **Documentation** | `/docs` | Public |
| **Merchant Login** | `/auth/sign-in` | Public / Merchant |
| **Register Cafe** | `/auth/sign-up` | Public / Merchant |
| **Barista Terminal** | `/cashier` | Cashier Role |
| **Customer Passbook**| `/customer/overview` | Customer Role |
| **Merchant Hub** | `/merchant/overview` | Merchant Role |
| **Super Admin Panel**| `/admin/overview` | Super Admin Role |
| **Legal** | `/terms`, `/privacy` | Public |
