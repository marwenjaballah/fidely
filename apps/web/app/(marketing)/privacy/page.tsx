import type { Metadata } from "next"
import Link from "next/link"
import { MarketingArticle } from "@/components/common/marketing-article"

export const metadata: Metadata = {
  title: "Privacy Policy - Fidely Loyalty Platform",
  description:
    "How Fidely collects, safeguards, and processes merchant and customer loyalty membership information.",
}

export default function PrivacyPage() {
  return (
    <MarketingArticle
      title="Privacy Policy"
      description="Last updated: September 2026. This Privacy Policy describes how Fidely collects, uses, and safeguards information across our digital loyalty platform, merchant dashboards, and cashier scanning tools."
    >
      <h2>1. Introduction</h2>
      <p>
        Fidely (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting the privacy and security of our merchants, cashiers, and consumers. This Privacy Policy outlines our data handling practices when you access our website, use our loyalty web apps, or interact with an enrolled merchant store.
      </p>

      <h2>2. Information We Collect</h2>
      <h3>2.1 Customer Information</h3>
      <ul>
        <li>
          <strong>Contact Information:</strong> Phone numbers and email addresses submitted to enroll in store loyalty memberships or lookup passes at checkout.
        </li>
        <li>
          <strong>Loyalty Data:</strong> Digital membership identifiers, accumulated points balances, earned perks, and transaction visit timestamps.
        </li>
        <li>
          <strong>Pass Interaction:</strong> Unique cryptographic QR pass tokens generated to identify customer memberships at physical counter scanners.
        </li>
      </ul>

      <h3>2.2 Merchant & Staff Information</h3>
      <ul>
        <li>
          <strong>Account Credentials:</strong> Name, business email, encrypted authentication credentials, and role designations (Merchant Owner, Cashier Staff).
        </li>
        <li>
          <strong>Store Profile:</strong> Brand names, store slugs, custom color palettes, points multipliers, and reward catalog configurations.
        </li>
      </ul>

      <h3>2.3 Technical & Device Information</h3>
      <ul>
        <li>
          Device identifiers, browser types, screen orientations, operating system details, and PWA installation state necessary to deliver smooth cashier scanning and digital pass display.
        </li>
      </ul>

      <h2>3. How We Use Information</h2>
      <p>We process collected data exclusively to:</p>
      <ul>
        <li>Operate the universal loyalty ledger, issue loyalty points, and validate reward redemptions at POS.</li>
        <li>Authenticate merchants and cashiers, protecting store management settings from unauthorized modifications.</li>
        <li>Prevent fraud, cross-store loyalty pass misuse, and unauthorized transaction generation.</li>
        <li>Deliver high-reliability Progressive Web App features with offline support for customer loyalty cards.</li>
        <li>Provide merchants with aggregated, anonymized CRM metrics on customer return rates and store visit frequency.</li>
      </ul>

      <h2>4. Data Sharing & Third-Party Processors</h2>
      <p>
        <strong>We do not sell, rent, or trade your personal data to third parties.</strong> Data is shared only with trusted infrastructure providers required to operate Fidely:
      </p>
      <ul>
        <li>
          <strong>Cloud Database & Auth:</strong> Managed PostgreSQL and Supabase infrastructure for encrypted data storage and secure session management.
        </li>
        <li>
          <strong>Hosting & CDN:</strong> Vercel and edge caching networks to deliver sub-second global response times for counter passes.
        </li>
      </ul>

      <h2>5. Data Security</h2>
      <p>
        Fidely employs industry-standard security protocols including TLS 1.3 encryption in transit, strict database row-level boundaries, salted password hashing, and role-based access control (RBAC). Cashiers cannot access sensitive merchant financial settings or customer personal contact info beyond transaction processing.
      </p>

      <h2>6. Your Rights & Data Portability</h2>
      <p>
        In accordance with modern privacy standards (including GDPR and consumer data rights):
      </p>
      <ul>
        <li>You have the right to request access to the personal data we hold about you.</li>
        <li>You may request correction of inaccurate phone numbers or profile details.</li>
        <li>You may request complete erasure of your customer loyalty profile and associated membership records.</li>
      </ul>

      <h2>7. Contact Our Privacy Team</h2>
      <p>
        If you have any questions, concerns, or data deletion requests, please contact our Data Protection Officer at{" "}
        <a href="mailto:privacy@fidely.app" className="text-primary hover:underline font-semibold">
          privacy@fidely.app
        </a>.
      </p>

      <hr />

      <p>
        Read our <Link href="/terms">Terms of Service</Link> or return to the <Link href="/">Fidely Home</Link>.
      </p>
    </MarketingArticle>
  )
}
