"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

type SectionNavLinkProps = {
  sectionId: string
  children: React.ReactNode
  className?: string
  onNavigate?: () => void
}

/**
 * In-app sections on `/`: smooth-scroll and update the hash.
 * From other routes: navigates to `/#sectionId`; {@link MarketingShell} scrolls on mount.
 */
export function SectionNavLink({ sectionId, children, className, onNavigate }: SectionNavLinkProps) {
  const pathname = usePathname()
  const href = `/#${sectionId}`

  return (
    <Link
      href={href}
      scroll={false}
      className={className}
      onClick={(e) => {
        onNavigate?.()
        if (pathname !== "/") return
        e.preventDefault()
        document.getElementById(sectionId)?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        })
        window.history.pushState(null, "", href)
      }}
    >
      {children}
    </Link>
  )
}
