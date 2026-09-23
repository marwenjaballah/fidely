import type { Metadata } from "next"
import Link from "next/link"
import { MarketingArticle } from "@/components/common/marketing-article"

export const metadata: Metadata = {
  title: "Terms of Service - Fidely Loyalty Platform",
  description:
    "Terms of Service governing the use of the Fidely universal digital loyalty platform, merchant dashboards, and cashier scanning terminals.",
}

export default function TermsPage() {
  return (
    <MarketingArticle
      title="Terms of Service"
      description="Last updated: September 2026. These terms govern your access and use of the Fidely universal digital loyalty platform, merchant terminals, and customer passes."
    >
      <h2>1. Agreement to Terms</h2>
      <p>
        By accessing or using Fidely, including our website, merchant management tools, cashier POS terminals, customer digital passes, and API services (collectively, the &quot;Service&quot;), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.
      </p>

      <h2>2. Description of the Service</h2>
      <p>
        Fidely provides cloud software enabling merchants (retail stores, cafes, restaurants, and outlets) to issue digital loyalty memberships, award points based on purchase spend, and redeem reward vouchers. Customers access their loyalty passes via mobile web or Progressive Web App (PWA) with zero mandatory app store downloads.
      </p>

      <h2>3. Merchant Responsibilities</h2>
      <p>Merchants using Fidely agree to:</p>
      <ul>
        <li>Maintain accurate information regarding store identity, point earning multipliers, and rewards catalog values.</li>
        <li>Honor valid loyalty points and rewards earned by customers in good faith at their registered store locations.</li>
        <li>Safeguard cashier login credentials and ensure staff use cashier terminals solely for authorized in-store customer transactions.</li>
        <li>Comply with local tax, commercial, consumer protection, and privacy laws applicable to their jurisdiction.</li>
      </ul>

      <h2>4. Customer Loyalty Points & Vouchers</h2>
      <p>
        Loyalty points and reward vouchers issued through Fidely are promotional incentives granted at the discretion of individual merchants. Unless explicitly stated by an individual store merchant:
      </p>
      <ul>
        <li>Points have no standalone cash surrender value and cannot be exchanged for legal tender.</li>
        <li>Points accrued at a specific store are non-transferable to other unrelated merchant stores, protecting against cross-store pass misuse.</li>
        <li>Merchants determine their own reward rules, expiration policies, and perk eligibility.</li>
      </ul>

      <h2>5. Acceptable Use Policy</h2>
      <p>You agree not to misuse or attempt to compromise the Fidely platform. Prohibited actions include:</p>
      <ul>
        <li>Generating fraudulent points, fabricating QR codes, or manipulating transaction records.</li>
        <li>Attempting to probe, scan, or exploit security vulnerabilities in the Fidely infrastructure or API.</li>
        <li>Transmitting malware, spam, or executing denial-of-service attempts.</li>
        <li>Interfering with the operation of cashier scanners or unauthorized data extraction.</li>
      </ul>

      <h2>6. Account Security & Privacy</h2>
      <p>
        You are responsible for safeguarding your account credentials. You must notify us immediately of any unauthorized access to your merchant or cashier account. Your personal data is processed strictly in accordance with our <Link href="/privacy">Privacy Policy</Link>.
      </p>

      <h2>7. Intellectual Property</h2>
      <p>
        The Fidely brand, logos, software, user interfaces, documentation, and algorithms are the exclusive property of Fidely and its licensors. Merchants retain all rights to their proprietary store logos, trademarks, and customer business records.
      </p>

      <h2>8. Service Availability & Modifications</h2>
      <p>
        We strive for continuous 99.9% uptime. However, the Service is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis. We reserve the right to update, enhance, or temporarily suspend features for maintenance, security, or legal requirements with reasonable advance notice when feasible.
      </p>

      <h2>9. Limitation of Liability</h2>
      <p>
        To the maximum extent permitted by applicable law, Fidely shall not be liable for indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or business goodwill arising from the use or inability to use the platform.
      </p>

      <h2>10. Contact Us</h2>
      <p>
        For inquiries regarding these terms or commercial merchant agreements, please reach out to our team at{" "}
        <a href="mailto:support@fidely.app" className="text-primary hover:underline font-semibold">
          support@fidely.app
        </a>.
      </p>

      <hr />

      <p>
        Please review our <Link href="/privacy">Privacy Policy</Link> and <Link href="/docs">Merchant Documentation</Link>.
      </p>
    </MarketingArticle>
  )
}
