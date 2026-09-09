import type { Metadata } from "next"
import Link from "next/link"
import { MarketingArticle } from "@/components/common/marketing-article"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How this SaaS boilerplate deployment may collect, use, and protect information. Template language for your legal review.",
}

export default function PrivacyPage() {
  return (
    <MarketingArticle
      title="Privacy Policy"
      description="Last updated: April 2026. This policy describes information practices typical for applications built from this boilerplate. Customize it for your product, jurisdiction, and vendors."
    >
      <h2>1. Introduction</h2>
      <p>
        This Privacy Policy explains how we collect, use, disclose, and safeguard information when you visit our website
        or use our applications (the &quot;Service&quot;). By using the Service, you agree to this policy. If you do not
        agree, please do not use the Service.
      </p>

      <h2>2. Who is responsible</h2>
      <p>
        The &quot;data controller&quot; or business responsible for processing is the organization operating this
        deployment. You should replace generic references with your legal name, registered address, and data protection
        contact (including any EU/UK representative if required).
      </p>

      <h2>3. Information we may collect</h2>
      <h3>3.1 You provide directly</h3>
      <ul>
        <li>Account details such as name, email address, and profile fields you choose to submit.</li>
        <li>Authentication events (for example sign-in timestamps) processed by our auth provider.</li>
        <li>Content you post where the product allows it (such as public feedback or support messages).</li>
      </ul>
      <h3>3.2 Collected automatically</h3>
      <ul>
        <li>Device and browser type, IP address, and general location derived from IP.</li>
        <li>Usage diagnostics, performance metrics, and error logs to keep the Service reliable and secure.</li>
        <li>Cookies and similar technologies where we or our analytics partners use them—see Section 6.</li>
      </ul>

      <h2>4. How we use information</h2>
      <p>We use information to:</p>
      <ul>
        <li>Provide, maintain, and improve the Service and its security.</li>
        <li>Authenticate users, prevent fraud, and enforce our terms.</li>
        <li>Communicate about updates, incidents, or (where permitted) marketing—honoring your preferences and law.</li>
        <li>Comply with legal obligations and respond to lawful requests.</li>
      </ul>

      <h2>5. Legal bases (where GDPR/UK GDPR applies)</h2>
      <p>Depending on context, we may rely on one or more of the following:</p>
      <ul>
        <li>
          <strong>Contract</strong> — processing necessary to deliver the Service you requested.
        </li>
        <li>
          <strong>Legitimate interests</strong> — for example securing our systems, understanding aggregate usage, and
          improving reliability, balanced against your rights.
        </li>
        <li>
          <strong>Legal obligation</strong> — where the law requires us to retain or disclose information.
        </li>
        <li>
          <strong>Consent</strong> — where required for optional cookies or marketing; you may withdraw consent without
          affecting the lawfulness of processing before withdrawal.
        </li>
      </ul>

      <h2>6. Cookies and analytics</h2>
      <p>
        We may use strictly necessary cookies for authentication and security. Where we use analytics or marketing
        cookies, we will present choices as required by your region (for example a consent banner). Review your
        analytics vendor configuration (for example Vercel Analytics) and update this section to list specific
        cookies, purposes, and retention.
      </p>

      <h2>7. Sharing and subprocessors</h2>
      <p>We may share information with:</p>
      <ul>
        <li>
          <strong>Infrastructure and hosting</strong> providers that run the website and API.
        </li>
        <li>
          <strong>Authentication and database</strong> providers (for example Supabase) that process account and
          application data under their agreements.
        </li>
        <li>
          <strong>Professional advisers</strong> where required (for example auditors or lawyers under confidentiality).
        </li>
        <li>
          <strong>Authorities</strong> when we believe disclosure is necessary to comply with the law or protect
          rights, safety, and security.
        </li>
      </ul>
      <p>
        Maintain a current subprocessor list if you owe that to customers under a Data Processing Agreement (DPA).
      </p>

      <h2>8. International transfers</h2>
      <p>
        If data is processed in countries other than your own, describe the safeguards (for example Standard Contractual
        Clauses, adequacy decisions, or other mechanisms) after you confirm where your vendors store and process data.
      </p>

      <h2>9. Retention</h2>
      <p>
        We retain information only as long as needed for the purposes above, including legal, accounting, and reporting
        requirements. Technical logs may be kept for shorter rolling periods. Define concrete retention periods for
        your product categories (accounts, billing, logs, marketing).
      </p>

      <h2>10. Security</h2>
      <p>
        We implement administrative, technical, and organizational measures appropriate to the risk. No method of
        transmission or storage is completely secure; we encourage strong passwords, MFA where available, and prompt
        reporting of suspected incidents.
      </p>

      <h2>11. Your rights</h2>
      <p>
        Depending on your location, you may have rights to access, correct, delete, or export personal data, to
        restrict or object to certain processing, and to lodge a complaint with a supervisory authority. To exercise
        rights, contact us using the details you publish for your deployment. We will verify requests as permitted by
        law.
      </p>

      <h2>12. Children</h2>
      <p>
        The Service is not directed to children under the age where parental consent is required in their jurisdiction.
        We do not knowingly collect personal information from children. If you believe we have, contact us and we will
        take appropriate steps to delete it.
      </p>

      <h2>13. Changes to this policy</h2>
      <p>
        We may update this Privacy Policy from time to time. We will post the revised policy with an updated date and,
        where appropriate, provide additional notice. Please review the policy periodically.
      </p>

      <h2>14. Contact</h2>
      <p>
        For privacy inquiries, use the contact methods shown in the <Link href="/#contact">contact</Link> section after
        you configure them for your organization.
      </p>

      <hr />

      <p>
        Read the <Link href="/terms">terms of service</Link> or return to <Link href="/">home</Link>.
      </p>
    </MarketingArticle>
  )
}
