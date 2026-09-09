"use client"

import Link from "next/link"
import { LayoutGrid, Github, ExternalLink } from "lucide-react"
import { strings } from "@/lib/strings"
import { SectionNavLink } from "@/components/common/section-nav-link"

const GITHUB_REPO = "https://github.com/Khalil-Bchir/saas-boilerplate-next-hono"

const footerLinkClass =
  "text-sm text-muted-foreground transition-colors hover:text-foreground"

export function Footer() {
  const year = new Date().getFullYear()

  const sections = [
    { id: "intro" as const, label: strings.nav_intro },
    { id: "features" as const, label: strings.nav_features },
    { id: "use-cases" as const, label: strings.nav_use_cases },
    { id: "reviews" as const, label: strings.footer_reviews },
    { id: "contact" as const, label: strings.nav_contact },
  ]

  return (
    <footer className="mt-auto border-t border-primary/10 bg-background">
      <div className="container mx-auto max-w-7xl px-4 py-14 lg:px-8 lg:py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-4 space-y-5">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 rounded-lg font-semibold text-foreground outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/20">
                <LayoutGrid className="h-5 w-5" />
              </span>
              {strings.app_name}
            </Link>
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              {strings.footer_tagline}
            </p>
            <a
              href={GITHUB_REPO}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
            >
              <Github className="h-4 w-4" />
              {strings.footer_github}
              <ExternalLink className="h-3 w-3 opacity-60" />
            </a>
          </div>

          <div className="grid gap-10 sm:grid-cols-2 lg:col-span-5 lg:grid-cols-2">
            <div className="space-y-4">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-foreground/80">
                {strings.footer_explore_title}
              </h2>
              <ul className="space-y-2.5">
                {sections.map(({ id, label }) => (
                  <li key={id}>
                    <SectionNavLink sectionId={id} className={footerLinkClass}>
                      {label}
                    </SectionNavLink>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-foreground/80">
                {strings.footer_legal_title}
              </h2>
              <ul className="space-y-2.5">
                <li>
                  <Link href="/docs" className={footerLinkClass}>
                    {strings.nav_docs}
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className={footerLinkClass}>
                    {strings.footer_terms}
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className={footerLinkClass}>
                    {strings.footer_privacy_policy}
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col justify-between gap-8 border-t border-border/60 pt-10 md:border-0 md:pt-0 lg:col-span-3 lg:border-l lg:border-border/60 lg:pl-10">
            <div className="space-y-3">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-foreground/80">
                {strings.footer_resources_title}
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {strings.footer_resources_blurb}
              </p>
            </div>
            <p className="text-xs text-muted-foreground/90">
              © {year} {strings.app_name}. {strings.footer_rights_reserved}
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
