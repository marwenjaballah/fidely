"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowRight,
  LayoutDashboard,
  Menu,
  X,
  BookOpen,
  LogOut,
  User,
  ShieldCheck,
  Store,
} from "lucide-react"
import { FidelyLogo } from "@/components/common/fidely-logo"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ThemeToggleButton } from "@/components/common/theme-toggle-button"
import { useAuth } from "@/features/auth/hooks/use-auth"

import { LanguageSwitcher } from "@/components/common/language-switcher"
import { useI18n } from "@/lib/i18n"

export function SiteHeader() {
  const { isAuthenticated, profile, signOut } = useAuth()
  const { t } = useI18n()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
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

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group transition-opacity hover:opacity-90">
          <FidelyLogo size="md" variant="solid" className="transition-transform duration-200 group-hover:scale-105" />
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-black tracking-tight text-foreground">{t('app_name')}</span>
              <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary">
                PRO
              </span>
            </div>
            <span className="text-[10px] font-medium text-muted-foreground -mt-1 hidden sm:block">
              {t('landing_badge')}
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-muted-foreground">
          <a href="/#features" className="transition-colors hover:text-foreground">
            {t('nav_features') || 'Features'}
          </a>
          <a href="/#how-it-works" className="transition-colors hover:text-foreground">
            {t('nav_use_cases') || 'How It Works'}
          </a>
          <a href="/#faq" className="transition-colors hover:text-foreground">
            FAQ
          </a>
          <Link href="/docs" className="flex items-center gap-1.5 transition-colors hover:text-foreground">
            <BookOpen className="w-3.5 h-3.5 opacity-70" />
            <span>{t('nav_docs')}</span>
          </Link>
        </nav>

        {/* Right CTA Actions */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {isMounted && (
            <>
              <LanguageSwitcher />
              <ThemeToggleButton />
            </>
          )}

          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full ring-2 ring-primary/20">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary font-bold">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-2xl border-border p-2">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-bold leading-none">
                        {profile?.email?.split("@")[0] || "User"}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {profile?.email || ""}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  {profile?.role === "SUPER_ADMIN" && (
                    <DropdownMenuItem asChild className="rounded-xl font-semibold text-primary">
                      <Link href="/admin/overview">
                        <ShieldCheck className="w-4 h-4 me-2" />
                        {t('nav_super_admin_panel')}
                      </Link>
                    </DropdownMenuItem>
                  )}

                  {profile?.role === "CASHIER" && (
                    <DropdownMenuItem asChild className="rounded-xl">
                      <Link href="/cashier">
                        <Store className="w-4 h-4 me-2" />
                        {t('nav_cashier_terminal')}
                      </Link>
                    </DropdownMenuItem>
                  )}

                  {profile?.role === "CUSTOMER" && (
                    <DropdownMenuItem asChild className="rounded-xl">
                      <Link href="/customer/overview">
                        <User className="w-4 h-4 me-2" />
                        {t('customer_my_cards')}
                      </Link>
                    </DropdownMenuItem>
                  )}

                  {(profile?.role === "MERCHANT" || profile?.role === "SUPER_ADMIN") && (
                    <>
                      <DropdownMenuItem asChild className="rounded-xl font-medium">
                        <Link href="/merchant/overview">
                          <Store className="w-4 h-4 me-2" />
                          {t('nav_merchant_dashboard')}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="rounded-xl">
                        <Link href="/merchant/settings/account">{t('nav_account_settings')}</Link>
                      </DropdownMenuItem>
                    </>
                  )}

                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="rounded-xl text-rose-500 focus:text-rose-500">
                    <LogOut className="w-4 h-4 me-2 rtl:rotate-180" />
                    {t('logout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Button asChild variant="ghost" size="sm" className="rounded-xl text-xs font-semibold">
                <Link href="/auth/login">{t('nav_login')}</Link>
              </Button>
              <Button
                asChild
                size="sm"
                className="rounded-xl text-xs font-bold bg-primary text-primary-foreground shadow-sm shadow-primary/20 gap-1.5"
              >
                <Link href="/auth/sign-up">
                  <span>{t('nav_get_started')}</span>
                  <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                </Link>
              </Button>
            </div>
          )}

          {/* Mobile Menu Trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl bg-muted/60 text-foreground"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border/60 bg-background/95 backdrop-blur-xl px-4 py-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col gap-1 text-sm font-medium">
            <a
              href="/#features"
              onClick={closeMobile}
              className="rounded-xl px-3 py-2 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              {t('nav_features') || 'Features'}
            </a>
            <a
              href="/#how-it-works"
              onClick={closeMobile}
              className="rounded-xl px-3 py-2 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              {t('nav_use_cases') || 'How It Works'}
            </a>
            <a
              href="/#faq"
              onClick={closeMobile}
              className="rounded-xl px-3 py-2 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              FAQ
            </a>
            <Link
              href="/docs"
              onClick={closeMobile}
              className="rounded-xl px-3 py-2 text-muted-foreground hover:bg-muted hover:text-foreground flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              <span>{t('nav_docs')}</span>
            </Link>
          </nav>

          <div className="flex items-center justify-between pt-2 border-t border-border/40">
            <span className="text-xs text-muted-foreground font-medium">{t('theme')}</span>
            <div className="flex items-center gap-2">
              <LanguageSwitcher />
              <ThemeToggleButton />
            </div>
          </div>

          {!isAuthenticated && (
            <div className="flex flex-col gap-2 pt-1">
              <Button asChild variant="outline" className="w-full rounded-xl h-10 text-xs font-semibold">
                <Link href="/auth/login" onClick={closeMobile}>
                  {t('nav_login')}
                </Link>
              </Button>
              <Button asChild className="w-full rounded-xl h-10 text-xs font-bold bg-primary text-primary-foreground">
                <Link href="/auth/sign-up" onClick={closeMobile}>
                  {t('nav_get_started')}
                </Link>
              </Button>
            </div>
          )}
        </div>
      )}
    </header>
  )
}
