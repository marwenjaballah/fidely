'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Store,
  Users,
  Receipt,
  ShieldCheck,
  LogOut,
  ChevronRight,
  Menu,
  X,
  Sparkles,
} from 'lucide-react'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { ThemeToggleButton } from '@/components/common/theme-toggle-button'
import { LanguageSwitcher } from '@/components/common/language-switcher'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useI18n } from '@/lib/i18n'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, hasHydrated, profile, signOut } = useAuth()
  const { t, dir } = useI18n()
  const router = useRouter()
  const pathname = usePathname()
  const [isMounted, setIsMounted] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const navItems = [
    {
      title: t('admin_nav_overview'),
      href: '/admin/overview',
      icon: LayoutDashboard,
      description: t('admin_nav_overview_desc'),
    },
    {
      title: t('admin_nav_stores'),
      href: '/admin/stores',
      icon: Store,
      description: t('admin_nav_stores_desc'),
    },
    {
      title: t('admin_nav_users'),
      href: '/admin/users',
      icon: Users,
      description: t('admin_nav_users_desc'),
    },
    {
      title: t('admin_nav_transactions'),
      href: '/admin/transactions',
      icon: Receipt,
      description: t('admin_nav_transactions_desc'),
    },
  ]

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (isMounted && hasHydrated) {
      if (!isAuthenticated) {
        router.push('/auth/login')
      } else if (profile && profile.role !== 'SUPER_ADMIN') {
        // If logged in but not SUPER_ADMIN, redirect to merchant or overview
        router.push('/merchant/overview')
      }
    }
  }, [isMounted, hasHydrated, isAuthenticated, profile, router])

  if (!isMounted || !hasHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background" dir={dir}>
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground font-medium">{t('admin_verifying')}</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || profile?.role !== 'SUPER_ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background" dir={dir}>
        <div className="text-center p-8 max-w-md">
          <ShieldCheck className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-bold">{t('admin_restricted_title')}</h2>
          <p className="text-muted-foreground text-sm mt-2">
            {t('admin_restricted_desc')}
          </p>
          <Button className="mt-6" onClick={() => router.push('/auth/login')}>
            {t('admin_return_login')}
          </Button>
        </div>
      </div>
    )
  }

  const currentNav = navItems.find((item) => pathname.startsWith(item.href)) || navItems[0]

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col md:flex-row" dir={dir}>
      {/* Mobile Topbar */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 border-b bg-background sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <span className="font-bold text-sm tracking-tight">{t('app_name')}</span>
            <span className="text-[10px] ms-1.5 font-semibold text-primary uppercase bg-primary/10 px-1.5 py-0.5 rounded">
              {t('admin_badge_super_admin')}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <LanguageSwitcher />
          <ThemeToggleButton />
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Sidebar for Desktop & Mobile Overlay */}
      <aside
        className={`fixed inset-y-0 start-0 z-40 w-64 border-e bg-background flex flex-col transition-transform duration-200 ease-in-out md:translate-x-0 md:static md:z-auto ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full rtl:translate-x-full'
        }`}
      >
        {/* Brand */}
        <div className="p-6 pb-4 flex items-center gap-3 border-b">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-primary to-primary/70 flex items-center justify-center text-primary-foreground shadow-sm shrink-0">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div className="text-start">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg tracking-tight">{t('app_name')}</span>
              <Badge variant="default" className="text-[10px] px-1.5 py-0 h-4 bg-primary/90">
                {t('admin_badge_root')}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground font-medium">{t('admin_control_center')}</p>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 py-1.5 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase text-start">
            {t('admin_platform_mgmt')}
          </div>
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/admin/overview' && pathname.startsWith(item.href))
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                <span className="truncate">{item.title}</span>
              </Link>
            )
          })}
        </div>

        {/* User Card & Logout */}
        <div className="p-4 border-t bg-muted/30">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-9 w-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary text-xs shrink-0">
              {profile?.email?.slice(0, 2).toUpperCase() || 'SA'}
            </div>
            <div className="flex-1 min-w-0 text-start">
              <p className="text-xs font-semibold truncate text-foreground">{profile?.full_name || t('admin_badge_super_admin')}</p>
              <p className="text-[11px] text-muted-foreground truncate font-mono" dir="ltr">{profile?.email}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start text-xs text-muted-foreground hover:text-destructive hover:border-destructive/30 gap-2"
            onClick={async () => {
              await signOut()
              router.push('/auth/login')
            }}
          >
            <LogOut className="h-3.5 w-3.5 rtl:rotate-180" />
            <span>{t('admin_sign_out')}</span>
          </Button>
        </div>
      </aside>

      {/* Backdrop for mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden backdrop-blur-xs"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="hidden md:flex h-16 items-center justify-between px-8 border-b bg-background/80 backdrop-blur sticky top-0 z-30">
          <div className="flex items-center gap-2 text-sm">
            <Link href="/admin/overview" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
              {t('admin_badge_super_admin')}
            </Link>
            <ChevronRight className="h-4 w-4 text-muted-foreground/60 rtl:rotate-180" />
            <span className="font-semibold text-foreground">{currentNav.title}</span>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="outline" className="gap-1.5 border-primary/30 text-primary bg-primary/5 py-1 px-2.5">
              <Sparkles className="h-3.5 w-3.5" />
              {t('admin_global_admin_mode')}
            </Badge>
            <Separator orientation="vertical" className="h-6" />
            <LanguageSwitcher />
            <ThemeToggleButton />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}

