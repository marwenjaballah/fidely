import type { Metadata } from "next"
import Link from "next/link"
import { MarketingArticle } from "@/components/common/marketing-article"

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms governing use of this SaaS boilerplate site and software. Template language for customization.",
}

export default function TermsPage() {
  return (
    <MarketingArticle
      title="Terms of Service"
      description="Last updated: April 2026. These terms are provided as a starting point for projects built from this boilerplate—have them reviewed by qualified counsel before production use."
    >
      <h2>1. Agreement</h2>
      <p>
        By accessing or using this website, applications derived from this template, or related services (collectively,
        the &quot;Service&quot;), you agree to be bound by these Terms of Service. If you do not agree, do not use the
        Service.
      </p>

      <h2>2. Who we are</h2>
      <p>
        References to &quot;we,&quot; &quot;us,&quot; or &quot;our&quot; mean the person or entity operating the
        deployment you are using. This boilerplate does not identify a specific legal entity—you must substitute your
        company name, address, and contact details in your deployment and legal documents.
      </p>

      <h2>3. Accounts and eligibility</h2>
      <p>
        Where the Service offers accounts, you agree to provide accurate information and to keep credentials secure.
        You are responsible for activity that occurs under your account. We may suspend or terminate accounts that
        violate these terms or present security or abuse risk.
      </p>

      <h2>4. Acceptable use</h2>
      <p>You agree not to misuse the Service. Examples of prohibited conduct include, without limitation:</p>
      <ul>
        <li>Attempting to probe, scan, or test the vulnerability of any system or network without authorization.</li>
        <li>Transmitting malware, excessive automated traffic, or content designed to disrupt or harass.</li>
        <li>Using the Service to violate applicable law or third-party rights.</li>
        <li>Reverse engineering or attempting to extract source code except where applicable law expressly permits.</li>
      </ul>

      <h2>5. Intellectual property</h2>
      <p>
        The open-source components of this boilerplate remain subject to their respective licenses. Your application
        code, branding, and customer data are yours (or your licensors&apos;) subject to your agreements with users and
        vendors. We do not claim ownership of your content.
      </p>

      <h2>6. Third-party services</h2>
      <p>
        The Service may integrate with third parties (for example authentication or database providers). Those services
        have their own terms and privacy policies. We are not responsible for third-party availability, security
        incidents, or pricing changes.
      </p>

      <h2>7. Disclaimers</h2>
      <p>
        THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE.&quot; TO THE MAXIMUM EXTENT PERMITTED BY
        LAW, WE DISCLAIM ALL WARRANTIES, WHETHER EXPRESS, IMPLIED, OR STATUTORY, INCLUDING MERCHANTABILITY, FITNESS FOR
        A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. TEMPLATE TEXT IS NOT LEGAL ADVICE.
      </p>

      <h2>8. Limitation of liability</h2>
      <p>
        TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT WILL WE BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL,
        CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS, DATA, OR GOODWILL, ARISING FROM YOUR USE OF THE
        SERVICE, EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. OUR AGGREGATE LIABILITY FOR ANY CLAIM
        ARISING OUT OF THESE TERMS OR THE SERVICE WILL NOT EXCEED THE GREATER OF ONE HUNDRED US DOLLARS (US $100) OR THE
        AMOUNTS YOU PAID US FOR THE SERVICE IN THE TWELVE MONTHS BEFORE THE CLAIM (IF ANY).
      </p>

      <h2>9. Indemnity</h2>
      <p>
        You will defend and indemnify us and our affiliates, officers, directors, employees, and agents against any
        claims, damages, losses, liabilities, costs, and expenses (including reasonable attorneys&apos; fees) arising
        from your content, your use of the Service, or your violation of these terms or applicable law.
      </p>

      <h2>10. Changes</h2>
      <p>
        We may modify these terms from time to time. We will post the updated terms with a new &quot;Last updated&quot;
        date where reasonable. Continued use after changes become effective constitutes acceptance. If you disagree
        with a change, stop using the Service.
      </p>

      <h2>11. Termination</h2>
      <p>
        You may stop using the Service at any time. We may suspend or terminate access if we reasonably believe you
        have violated these terms or if required for legal or operational reasons. Provisions that by their nature
        should survive (including disclaimers, limitations, and indemnities) will survive termination.
      </p>

      <h2>12. Governing law and disputes</h2>
      <p>
        Choose governing law and a forum appropriate for your entity and users. This template does not select a
        jurisdiction. Replace this section with counsel-approved language (for example Delaware law and courts, or
        arbitration rules).
      </p>

      <h2>13. Contact</h2>
      <p>
        For questions about these terms, use the contact options published on the <Link href="/#contact">contact</Link>{" "}
        section of the site after you configure them for your deployment.
      </p>

      <hr />

      <p>
        See also the <Link href="/privacy">privacy policy</Link> and <Link href="/docs">technical documentation</Link>.
      </p>
    </MarketingArticle>
  )
}
