"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, BookOpen } from "lucide-react"
import { useState, useEffect } from "react"
import { FidelyLogo } from "@/components/common/fidely-logo"
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

import { LanguageSwitcher } from "@/components/common/language-switcher"
import { useI18n } from "@/lib/i18n"
import { getRoleRedirectUrl } from "@/lib/navigation"

const sectionNavClass =
  "text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const { isAuthenticated, profile, signOut } = useAuth()
  const { t } = useI18n()
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

  const handleLogout = async () => {
    await signOut()
    router.push("/auth/login")
  }

  const closeMobile = () => setMobileMenuOpen(false)

  const landingSections = [
    { id: "features" as const, label: t('nav_features') },
    { id: "use-cases" as const, label: t('nav_use_cases') },
    { id: "reviews" as const, label: t('footer_reviews') },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/90 shadow-sm backdrop-blur-md supports-[backdrop-filter]:bg-background/75">
      <div className="container mx-auto max-w-7xl px-3 sm:px-4 lg:px-8">
        <div className="flex h-12 sm:h-14 lg:h-16 items-center justify-between gap-2 sm:gap-4">
          <div className="flex min-w-0 flex-1 items-center gap-4 sm:gap-8">
            <Link
              href="/"
              className="group flex shrink-0 items-center gap-1.5 sm:gap-2.5 rounded-lg outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={t('app_name')}
            >
              <FidelyLogo size="md" variant="subtle" className="group-hover:bg-primary/20" />
              <span className="hidden font-bold tracking-tight text-foreground sm:inline truncate max-w-[8rem] md:max-w-none text-base sm:text-lg">
                {t('app_name')}
              </span>
            </Link>

            <nav
              className="hidden lg:flex items-center gap-1"
              aria-label={t('footer_explore_title')}
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
                {t('nav_docs')}
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {isMounted && (
              <>
                <LanguageSwitcher />
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
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="default" className="shadow-xs text-xs font-semibold gap-1.5" asChild>
                        <a href={getRoleRedirectUrl(profile?.role)}>
                          {profile?.role === 'SUPER_ADMIN'
                            ? strings.nav_super_admin_panel
                            : profile?.role === 'CASHIER'
                            ? strings.nav_cashier_terminal
                            : profile?.role === 'CUSTOMER'
                            ? strings.customer_my_cards
                            : strings.nav_dashboard}
                        </a>
                      </Button>
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
                        {profile?.role === 'SUPER_ADMIN' && (
                          <DropdownMenuItem asChild>
                            <a href={getRoleRedirectUrl('SUPER_ADMIN')} className="font-semibold text-primary">
                              {strings.nav_super_admin_panel}
                            </a>
                          </DropdownMenuItem>
                        )}
                        {profile?.role === 'CASHIER' && (
                          <DropdownMenuItem asChild>
                            <a href={getRoleRedirectUrl('CASHIER')}>{strings.nav_cashier_terminal}</a>
                          </DropdownMenuItem>
                        )}
                        {profile?.role === 'CUSTOMER' && (
                          <DropdownMenuItem asChild>
                            <a href={getRoleRedirectUrl('CUSTOMER')}>{strings.customer_my_cards}</a>
                          </DropdownMenuItem>
                        )}
                        {profile?.role === 'MERCHANT' && (
                          <>
                            <DropdownMenuItem asChild>
                              <a href={getRoleRedirectUrl('MERCHANT')}>{strings.nav_dashboard}</a>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <a href={`${getRoleRedirectUrl('MERCHANT').replace('/overview', '')}/settings/account`}>{strings.nav_account_settings}</a>
                            </DropdownMenuItem>
                          </>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout}>{strings.logout}</DropdownMenuItem>
                      </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )}
                </div>
              </>
            )}

            <button
              type="button"
              className="lg:hidden inline-flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-md border border-border/80 bg-background text-foreground hover:bg-muted/50"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle menu"
            >
              <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
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
                      {profile?.role === 'SUPER_ADMIN' && (
                        <DropdownMenuItem asChild>
                          <a href={getRoleRedirectUrl('SUPER_ADMIN')} onClick={closeMobile} className="font-semibold text-primary">
                            {strings.nav_super_admin_panel}
                          </a>
                        </DropdownMenuItem>
                      )}
                      {profile?.role === 'CASHIER' && (
                        <DropdownMenuItem asChild>
                          <a href={getRoleRedirectUrl('CASHIER')} onClick={closeMobile}>
                            {strings.nav_cashier_terminal}
                          </a>
                        </DropdownMenuItem>
                      )}
                      {profile?.role === 'CUSTOMER' && (
                        <DropdownMenuItem asChild>
                          <a href={getRoleRedirectUrl('CUSTOMER')} onClick={closeMobile}>
                            {strings.customer_my_cards}
                          </a>
                        </DropdownMenuItem>
                      )}
                      {profile?.role === 'MERCHANT' && (
                        <>
                          <DropdownMenuItem asChild>
                            <a href={getRoleRedirectUrl('MERCHANT')} onClick={closeMobile}>
                              {strings.nav_dashboard}
                            </a>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <a href={`${getRoleRedirectUrl('MERCHANT').replace('/overview', '')}/settings/account`} onClick={closeMobile}>
                              {strings.nav_account_settings}
                            </a>
                          </DropdownMenuItem>
                        </>
                      )}
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
