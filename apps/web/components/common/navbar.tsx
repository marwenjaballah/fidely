"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, LayoutGrid, BookOpen } from "lucide-react"
import { useState, useEffect } from "react"
import { useAuth } from "@/features/auth/hooks/use-auth"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { strings } from "@/lib/strings"
import { useRouter } from "next/navigation"
import { SectionNavLink } from "@/components/common/section-nav-link"
import { ThemeToggleButton } from "@/components/common/theme-toggle-button"
import { cn } from "@/lib/utils"

const sectionNavClass =
  "text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const { isAuthenticated, profile, signOut } = useAuth()
  const router = useRouter()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const getUserInitials = () => {
    if (profile?.email) {
      return profile.email.substring(0, 2).toUpperCase()
    }
    return "U"
  }

  const handleLogout = () => {
    signOut()
    router.push("/")
  }

  const closeMobile = () => setMobileMenuOpen(false)

  const landingSections = [
    { id: "intro" as const, label: strings.nav_intro },
    { id: "features" as const, label: strings.nav_features },
    { id: "use-cases" as const, label: strings.nav_use_cases },
    { id: "contact" as const, label: strings.nav_contact },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/90 shadow-sm backdrop-blur-md supports-[backdrop-filter]:bg-background/75">
      <div className="container mx-auto max-w-7xl px-4 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <div className="flex min-w-0 flex-1 items-center gap-8">
            <Link
              href="/"
              className="group flex shrink-0 items-center gap-2.5 rounded-lg outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={strings.app_name}
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/20 transition-colors group-hover:bg-primary/20">
                <LayoutGrid className="h-5 w-5" />
              </span>
              <span className="hidden font-semibold tracking-tight text-foreground sm:inline truncate max-w-[10rem] md:max-w-none">
                {strings.app_name}
              </span>
            </Link>

            <nav
              className="hidden lg:flex items-center gap-1"
              aria-label={strings.footer_explore_title}
            >
              {landingSections.map(({ id, label }) => (
                <SectionNavLink
                  key={id}
                  sectionId={id}
                  className={cn(sectionNavClass, "rounded-md px-2.5 py-2")}
                >
                  {label}
                </SectionNavLink>
              ))}
              <span className="mx-1 h-4 w-px bg-border" aria-hidden />
              <Link
                href="/docs"
                className={cn(
                  sectionNavClass,
                  "inline-flex items-center gap-1.5 rounded-md px-2.5 py-2"
                )}
              >
                <BookOpen className="h-3.5 w-3.5 opacity-70" />
                {strings.nav_docs}
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {isMounted && (
              <>
                <ThemeToggleButton />

                <div className="hidden md:flex items-center gap-2">
                  {!isAuthenticated ? (
                    <>
                      {/* <Button variant="ghost" size="sm" className="text-muted-foreground" asChild>
                        <Link href="/auth/login">{strings.nav_login}</Link>
                      </Button> */}
                      <Button size="sm" className="shadow-sm" asChild>
                        <Link href="/auth/sign-up">{strings.nav_get_started}</Link>
                      </Button>
                    </>
                  ) : (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {getUserInitials()}
                            </AvatarFallback>
                          </Avatar>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>
                          <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">
                              {profile?.email?.split("@")[0] || "User"}
                            </p>
                            <p className="text-xs leading-none text-muted-foreground">
                              {profile?.email || ""}
                            </p>
                          </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href="/overview">{strings.nav_dashboard}</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/settings/account">{strings.nav_account_settings}</Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout}>{strings.logout}</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </>
            )}

            <button
              type="button"
              className="lg:hidden inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-border/80 bg-background text-foreground hover:bg-muted/50"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-border/60 py-4 animate-in fade-in slide-in-from-top-1 duration-200">
            <nav className="flex flex-col gap-1" aria-label={strings.footer_explore_title}>
              {landingSections.map(({ id, label }) => (
                <SectionNavLink
                  key={id}
                  sectionId={id}
                  onNavigate={closeMobile}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                >
                  {label}
                </SectionNavLink>
              ))}
              <Link
                href="/docs"
                className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                onClick={closeMobile}
              >
                <BookOpen className="h-4 w-4 opacity-70" />
                {strings.nav_docs}
              </Link>
              <div className="my-2 h-px bg-border" />
              <Link
                href="/terms"
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                onClick={closeMobile}
              >
                {strings.footer_terms}
              </Link>
              <Link
                href="/privacy"
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                onClick={closeMobile}
              >
                {strings.footer_privacy_policy}
              </Link>
              <div className="flex flex-col gap-2 pt-4">
                {!isAuthenticated ? (
                  <>
                    {/* <Button variant="outline" asChild className="w-full bg-transparent">
                      <Link href="/auth/login" onClick={closeMobile}>
                        {strings.nav_login}
                      </Link>
                    </Button> */}
                    <Button asChild className="w-full">
                      <Link href="/auth/sign-up" onClick={closeMobile}>
                        {strings.nav_get_started}
                      </Link>
                    </Button>
                  </>
                ) : (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full justify-start bg-transparent">
                        <Avatar className="mr-2 h-8 w-8">
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {getUserInitials()}
                          </AvatarFallback>
                        </Avatar>
                        {profile?.email?.split("@")[0] || "User"}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {profile?.email?.split("@")[0] || "User"}
                          </p>
                          <p className="text-xs leading-none text-muted-foreground">
                            {profile?.email || ""}
                          </p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/overview" onClick={closeMobile}>
                          {strings.nav_dashboard}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/settings/account" onClick={closeMobile}>
                          {strings.nav_account_settings}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout}>{strings.logout}</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
