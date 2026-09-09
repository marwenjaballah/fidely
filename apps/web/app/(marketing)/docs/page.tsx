import type { Metadata } from "next"
import Link from "next/link"
import { MarketingArticle } from "@/components/common/marketing-article"

export const metadata: Metadata = {
  title: "Fidely Documentation & Guide",
  description:
    "Complete guide to setting up and running your cafe loyalty program with Fidely: store configuration, cashier terminal, and digital passes.",
}

export default function DocsPage() {
  return (
    <MarketingArticle
      title="Fidely Documentation"
      description="A complete guide to managing digital loyalty cards, cashier scanning terminals, and customer rewards for your coffee shop."
    >
      <h2>1. Overview of Fidely</h2>
      <p>
        <strong>Fidely</strong> is a frictionless digital loyalty platform designed specifically for specialty coffee shops, cafes, and bakeries. It eliminates the need for paper punch cards and clunky mobile app downloads, providing a seamless Web / PWA loyalty card that customers can save directly to their home screen.
      </p>

      <h2>2. Setting Up Your Coffee Shop (Merchant Guide)</h2>
      <p>
        As a store owner (Merchant), you can set up and manage multiple coffee shops from your Merchant Dashboard:
      </p>
      <ul>
        <li>
          <strong>Create Store:</strong> Provide your coffee shop name and custom URL slug (e.g. <code>fidely.app/store/my-cafe</code>).
        </li>
        <li>
          <strong>Points Ratio:</strong> Configure how many loyalty points customers earn per currency unit spent (e.g. 10 points per 1 TND).
        </li>
        <li>
          <strong>Rewards Catalog:</strong> Define unlockable perks (such as a free espresso, pastry discount, or signature bag of beans) and their point costs.
        </li>
        <li>
          <strong>Multi-Store Switcher:</strong> If you operate multiple locations or branches, effortlessly switch between them from the sidebar or header switcher to view location-specific CRM and analytics.
        </li>
      </ul>

      <h2>3. Cashier Terminal & POS Workflow</h2>
      <p>
        Your baristas and cashiers don&apos;t need access to sensitive store settings or financial reporting. They use the dedicated <strong>Cashier Terminal</strong> at <code>/cashier</code>:
      </p>
      <ul>
        <li>
          <strong>Issue Points:</strong> Cashier enters the order total (in TND) and clicks &ldquo;Ready to Scan&rdquo;. They scan the customer&apos;s digital QR pass to instantly issue points.
        </li>
        <li>
          <strong>Redeem Rewards:</strong> When a customer wants to redeem a voucher or reward, the cashier selects &ldquo;Redeem&rdquo; and scans their voucher QR code to apply the reward and deduct points.
        </li>
        <li>
          <strong>Camera Scanner:</strong> Built-in fast QR camera scanner works directly on tablets, POS terminals, and smartphones without extra hardware.
        </li>
      </ul>

      <h2>4. Managing Staff & Cashier Accounts</h2>
      <p>
        Merchants have full authority over cashier accounts in <strong>Merchant &gt; Staff Management</strong>:
      </p>
      <ul>
        <li>
          <strong>Add Cashier:</strong> Create dedicated login credentials (email and password) for each barista or cashier.
        </li>
        <li>
          <strong>Change Passwords:</strong> Instantly reset or auto-generate a new password for any cashier if they forget it.
        </li>
        <li>
          <strong>Revoke Access:</strong> Remove cashiers in one click if they leave your team.
        </li>
      </ul>

      <h2>5. Customer Digital Loyalty Card</h2>
      <p>
        Customers do not need to install an app from the App Store. When they visit your store&apos;s link (or scan your counter display QR code):
      </p>
      <ul>
        <li>
          They get an instant digital pass displaying their current loyalty balance, available rewards, and a unique QR token.
        </li>
        <li>
          They can install it as a lightweight Progressive Web App (PWA) on iOS or Android with a single tap.
        </li>
        <li>
          At checkout, they present their QR code to the cashier to earn points or redeem rewards.
        </li>
      </ul>

      <h2>6. Analytics & CRM</h2>
      <p>
        Track the metrics that matter most to your coffee business:
      </p>
      <ul>
        <li>
          <strong>Total Members:</strong> Number of unique customers enrolled in your loyalty program.
        </li>
        <li>
          <strong>Points Issued vs. Redeemed:</strong> Lifetime balance to measure program engagement.
        </li>
        <li>
          <strong>Customer CRM:</strong> View customer joining dates, points balances, and visit frequency.
        </li>
      </ul>

      <hr />

      <p>
        Ready to get started? <Link href="/auth/sign-up">Create your merchant account</Link>, return to the <Link href="/">home page</Link>, or read our <Link href="/terms">terms of service</Link> and <Link href="/privacy">privacy policy</Link>.
      </p>
    </MarketingArticle>
  )
}
