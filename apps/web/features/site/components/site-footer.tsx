"use client"

import Link from "next/link"
import { Sparkles } from "lucide-react"
import { useI18n } from "@/lib/i18n"
import { LanguageSwitcher } from "@/components/common/language-switcher"

export function SiteFooter() {
  const { t } = useI18n()

  return (
    <footer className="w-full border-t border-border/60 bg-background text-foreground py-14">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Brand */}
          <div className="space-y-4 md:col-span-2">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                <Sparkles className="h-5 w-5" />
              </div>
              <span className="text-lg font-black tracking-tight">{t('app_name')}</span>
            </Link>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-sm leading-relaxed">
              {t('footer_resources_blurb')}
            </p>
            <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold text-foreground">All Systems Operational</span>
              <span>•</span>
              <LanguageSwitcher showText variant="ghost" size="sm" />
            </div>
          </div>

          {/* Col 2: Product Links */}
          <div className="space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-foreground">{t('footer_explore_title')}</div>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <a href="/#interactive-playground" className="hover:text-foreground transition-colors">
                  {t('nav_intro')}
                </a>
              </li>
              <li>
                <a href="/#features" className="hover:text-foreground transition-colors">
                  {t('nav_features')}
                </a>
              </li>
              <li>
                <a href="/#how-it-works" className="hover:text-foreground transition-colors">
                  {t('nav_use_cases')}
                </a>
              </li>
              <li>
                <a href="/#reviews" className="hover:text-foreground transition-colors">
                  {t('footer_reviews')}
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Portal Links */}
          <div className="space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-foreground">{t('footer_legal_title')}</div>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <Link href="/auth/login" className="hover:text-foreground transition-colors">
                  {t('nav_login')}
                </Link>
              </li>
              <li>
                <Link href="/auth/sign-up" className="hover:text-foreground transition-colors">
                  {t('nav_get_started')}
                </Link>
              </li>
              <li>
                <Link href="/cashier" className="hover:text-foreground transition-colors">
                  {t('nav_cashier')}
                </Link>
              </li>
              <li>
                <Link href="/customer/overview" className="hover:text-foreground transition-colors">
                  {t('nav_customer')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div>
            © {new Date().getFullYear()} {t('app_name')}. {t('footer_rights_reserved')}
          </div>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-foreground transition-colors">
              {t('footer_privacy_policy')}
            </Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">
              {t('footer_terms')}
            </Link>
            <Link href="/docs" className="hover:text-foreground transition-colors">
              {t('nav_docs')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
