'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Palette,
  Users,
  LineChart,
  Store,
  Settings,
  LogOut,
  X,
  CreditCard,
  QrCode,
  ShieldCheck,
} from 'lucide-react'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerClose,
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { LanguageSwitcher } from '@/components/common/language-switcher'
import { ThemeToggleButton } from '@/components/common/theme-toggle-button'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { useI18n } from '@/lib/i18n'
import { posHaptics } from '@/lib/haptics'

export function MerchantBottomNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { signOut, profile } = useAuth()
  const { t, dir } = useI18n()
  const [moreDrawerOpen, setMoreDrawerOpen] = useState(false)

  const isOverview = pathname === '/merchant' || pathname === '/merchant/overview'
  const isCrm = pathname.startsWith('/merchant/crm')
  const isCards = pathname.startsWith('/merchant/customizer') || pathname.startsWith('/merchant/rewards')
  const isAnalytics = pathname.startsWith('/merchant/analytics')

  const handleTabClick = (href: string) => {
    posHaptics.tap()
    router.push(href)
  }

  const handleOpenMore = () => {
    posHaptics.tap()
    setMoreDrawerOpen(true)
  }

  const handleLogout = () => {
    signOut()
    router.push('/auth/login')
  }

  return (
    <>
      <div
        dir={dir}
        className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-background/90 backdrop-blur-2xl border-t border-border/70 pb-safe shadow-[0_-8px_24px_rgba(0,0,0,0.08)] select-none"
      >
        <nav className="max-w-md mx-auto flex items-center justify-around px-1 py-1">
          {/* Tab 1: Pulse / Overview */}
          <button
            type="button"
            onClick={() => handleTabClick('/merchant/overview')}
            className={`flex flex-1 flex-col items-center justify-center py-1.5 px-0.5 rounded-xl transition-all active:scale-95 ${
              isOverview
                ? 'text-primary font-bold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <div
              className={`p-1 rounded-xl transition-colors ${
                isOverview ? 'bg-primary/15 text-primary' : ''
              }`}
            >
              <LayoutDashboard className="h-5 w-5" />
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight font-medium truncate max-w-full">
              {t('dashboard_overview') || 'Pulse'}
            </span>
          </button>

          {/* Tab 2: Customers CRM */}
          <button
            type="button"
            onClick={() => handleTabClick('/merchant/crm')}
            className={`flex flex-1 flex-col items-center justify-center py-1.5 px-0.5 rounded-xl transition-all active:scale-95 ${
              isCrm
                ? 'text-primary font-bold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <div
              className={`p-1 rounded-xl transition-colors ${
                isCrm ? 'bg-primary/15 text-primary' : ''
              }`}
            >
              <Users className="h-5 w-5" />
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight font-medium truncate max-w-full">
              {t('nav_crm') || 'Customers'}
            </span>
          </button>

          {/* Tab 3: Loyalty Card & Rewards */}
          <button
            type="button"
            onClick={() => handleTabClick('/merchant/customizer')}
            className={`flex flex-1 flex-col items-center justify-center py-1.5 px-0.5 rounded-xl transition-all active:scale-95 ${
              isCards
                ? 'text-primary font-bold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <div
              className={`p-1 rounded-xl transition-colors ${
                isCards ? 'bg-primary/15 text-primary' : ''
              }`}
            >
              <Palette className="h-5 w-5" />
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight font-medium truncate max-w-full">
              {t('nav_customizer') || 'Loyalty'}
            </span>
          </button>

          {/* Tab 4: Analytics */}
          <button
            type="button"
            onClick={() => handleTabClick('/merchant/analytics')}
            className={`flex flex-1 flex-col items-center justify-center py-1.5 px-0.5 rounded-xl transition-all active:scale-95 ${
              isAnalytics
                ? 'text-primary font-bold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <div
              className={`p-1 rounded-xl transition-colors ${
                isAnalytics ? 'bg-primary/15 text-primary' : ''
              }`}
            >
              <LineChart className="h-5 w-5" />
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight font-medium truncate max-w-full">
              {t('nav_analytics') || 'Analytics'}
            </span>
          </button>

          {/* Tab 5: Settings / More */}
          <button
            type="button"
            onClick={handleOpenMore}
            className={`flex flex-1 flex-col items-center justify-center py-1.5 px-0.5 rounded-xl transition-all active:scale-95 ${
              moreDrawerOpen
                ? 'text-primary font-bold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <div
              className={`p-1 rounded-xl transition-colors ${
                moreDrawerOpen ? 'bg-primary/15 text-primary' : ''
              }`}
            >
              <Settings className="h-5 w-5" />
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight font-medium truncate max-w-full">
              {t('nav_settings') || 'Settings'}
            </span>
          </button>
        </nav>
      </div>

      {/* Native "More" Drawer on Mobile */}
      <Drawer open={moreDrawerOpen} onOpenChange={setMoreDrawerOpen}>
        <DrawerContent dir={dir} className="max-w-lg mx-auto p-4 pb-8 rounded-t-3xl border-t border-border/80 bg-background/95 backdrop-blur-2xl">
          <div className="mx-auto w-12 h-1.5 rounded-full bg-muted-foreground/30 mb-4" />

          <DrawerHeader className="p-0 mb-4 text-start">
            <div className="flex items-center justify-between">
              <div>
                <DrawerTitle className="text-base font-black tracking-tight">
                  {t('merchant_management_title') || 'Store Management'}
                </DrawerTitle>
                <DrawerDescription className="text-xs text-muted-foreground font-mono">
                  {profile?.email}
                </DrawerDescription>
              </div>
              <DrawerClose asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                  <X className="h-4 w-4" />
                </Button>
              </DrawerClose>
            </div>
          </DrawerHeader>

          {/* Workspaces & Quick Switch Cards */}
          <div className="space-y-2 mb-3">
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider px-1 text-start">
              {t('nav_switch_workspace') || 'Quick Switch'}
            </p>

            <Link
              href="/cashier"
              onClick={() => setMoreDrawerOpen(false)}
              className="flex items-center justify-between p-3 rounded-2xl border border-primary/30 bg-primary/5 hover:bg-primary/10 transition active:scale-[0.98]"
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-primary/20 text-primary flex items-center justify-center font-bold">
                  <QrCode className="h-4 w-4" />
                </div>
                <div className="text-start">
                  <p className="text-xs font-bold text-foreground">{t('nav_pos_register') || 'Cashier POS Terminal'}</p>
                  <p className="text-[11px] text-muted-foreground">Scan customer passes & award points</p>
                </div>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/15 px-2 py-0.5 rounded-full border border-primary/20">
                POS
              </span>
            </Link>

            <Link
              href="/customer/overview"
              onClick={() => setMoreDrawerOpen(false)}
              className="flex items-center justify-between p-3 rounded-2xl border border-border/60 bg-card hover:bg-muted/40 transition active:scale-[0.98]"
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <CreditCard className="h-4 w-4" />
                </div>
                <div className="text-start">
                  <p className="text-xs font-bold text-foreground">{t('nav_customer_passes') || 'Customer Passes'}</p>
                  <p className="text-[11px] text-muted-foreground">View your saved cards & perks</p>
                </div>
              </div>
            </Link>
          </div>

          {/* Navigation Links List */}
          <div className="space-y-2">
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider px-1 text-start">
              {t('nav_merchant_settings') || 'Management & Staff'}
            </p>

            <Link
              href="/merchant/staff"
              onClick={() => setMoreDrawerOpen(false)}
              className="flex items-center gap-3 p-3 rounded-2xl border border-border/60 bg-card hover:bg-muted/40 transition active:scale-[0.98]"
            >
              <div className="h-9 w-9 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div className="text-start">
                <p className="text-xs font-bold">{t('nav_staff') || 'Staff & Cashiers'}</p>
                <p className="text-[11px] text-muted-foreground">Cashier team PINs & roles</p>
              </div>
            </Link>

            <Link
              href="/merchant/settings/account"
              onClick={() => setMoreDrawerOpen(false)}
              className="flex items-center gap-3 p-3 rounded-2xl border border-border/60 bg-card hover:bg-muted/40 transition active:scale-[0.98]"
            >
              <div className="h-9 w-9 rounded-xl bg-zinc-500/10 text-zinc-500 flex items-center justify-center">
                <Settings className="h-4 w-4" />
              </div>
              <div className="text-start">
                <p className="text-xs font-bold">{t('nav_merchant_settings') || 'Settings'}</p>
                <p className="text-[11px] text-muted-foreground">Store identity & profile</p>
              </div>
            </Link>
          </div>

          {/* Drawer Footer Actions */}
          <div className="mt-4 flex items-center justify-between pt-3 border-t border-border/60">
            <div className="flex items-center gap-2">
              <LanguageSwitcher />
              <ThemeToggleButton />
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-xs text-destructive hover:text-destructive gap-1.5 h-8"
            >
              <LogOut className="h-3.5 w-3.5 rtl:rotate-180" />
              <span>{t('logout') || 'Logout'}</span>
            </Button>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  )
}
