'use client'

import React from 'react'
import Link from 'next/link'
import { QRCodeSVG } from 'qrcode.react'
import { AppleWalletPass } from '@/components/common/apple-wallet-card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Sparkles,
  Gift,
  ArrowRight,
  Loader2,
  Store as StoreIcon,
  QrCode,
  CheckCircle2,
  Smartphone,
} from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import { LanguageSwitcher } from '@/components/common/language-switcher'
import { ThemeToggleButton } from '@/components/common/theme-toggle-button'
import { FidelyLogo } from '@/components/common/fidely-logo'
import { BRAND_NAME } from '@/lib/brand'
import { StorePublicData } from '../mobile/store-mobile-view'

interface StoreDesktopViewProps {
  store: StorePublicData
  isAuthenticated: boolean
  joining: boolean
  onJoinClick: () => void
}

export function StoreDesktopView({
  store,
  isAuthenticated,
  joining,
  onJoinClick,
}: StoreDesktopViewProps) {
  const { t, dir } = useI18n()
  const hasWelcomeBonus = Boolean(store.welcomePoints && store.welcomePoints > 0)
  const storeUrl = typeof window !== 'undefined' ? window.location.href : `https://fidely.app/store/${store.slug}`

  return (
    <div className="hidden md:flex flex-col min-h-screen bg-slate-50 dark:bg-zinc-950 text-foreground" dir={dir}>
      {/* Header */}
      <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between border-b border-border/60 bg-background/95 px-8 backdrop-blur">
        <Link href={isAuthenticated ? "/customer/overview" : "/"} className="flex items-center gap-2 group">
          <FidelyLogo size="md" variant="subtle" className="transition-transform group-hover:scale-105" />
          <span className="font-extrabold text-lg tracking-tight text-foreground">{BRAND_NAME}</span>
        </Link>
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <ThemeToggleButton />
        </div>
      </header>

      {/* Main 2-Column Showcase */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-8 my-auto">
        <div className="grid grid-cols-12 gap-8 items-center">
          {/* Left Column: Authentic Pass Preview */}
          <div className="col-span-5 space-y-4">
            <AppleWalletPass
              storeName={store.name}
              logoUrl={store.logoUrl}
              primaryColor={store.primaryColor || '#D97706'}
              pointsBalance={0}
              pointsPerTnd={store.pointsPerTnd}
              qrCodeToken={`JOIN:${store.slug}`}
              memberName={isAuthenticated ? t('card_member') || 'Member' : t('card_fallback_customer') || 'Customer'}
              memberSince={t('card_available_now') || 'Available Now'}
              rewardsCount={store.rewards.length}
              nextRewardName={store.rewards[0]?.name}
              nextRewardCost={store.rewards[0]?.pointsCost}
              showQr={true}
              interactive={true}
            />
          </div>

          {/* Right Column: Store Details & Actions */}
          <div className="col-span-7 space-y-6 text-start">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-mono text-xs">
                  {store.pointsPerTnd} pts / 1 TND
                </Badge>
                {hasWelcomeBonus && (
                  <Badge className="bg-primary text-primary-foreground font-mono text-xs">
                    +{store.welcomePoints} pts Welcome Bonus
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl font-black tracking-tight">{store.name} Loyalty Program</h1>
              <p className="text-sm text-muted-foreground">
                Earn points with every purchase at {store.name} and unlock exclusive rewards.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <Button
                size="lg"
                onClick={onJoinClick}
                disabled={joining}
                className="text-sm font-bold shadow-lg gap-2 h-12 px-6 rounded-2xl bg-primary text-primary-foreground"
              >
                {joining ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> {t('loading') || 'Joining...'}
                  </>
                ) : isAuthenticated ? (
                  <>
                    {t('customer_add_coffee_card') || 'Add Pass to Wallet'} <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                  </>
                ) : (
                  <>
                    {t('auth_signup_button') || 'Sign Up & Get Pass'} <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                  </>
                )}
              </Button>
            </div>

            {/* Scan with Phone Card */}
            <div className="p-4 rounded-3xl border border-border/70 bg-card flex items-center gap-4 shadow-sm">
              <div className="p-2 bg-white rounded-xl shadow-xs shrink-0">
                <QRCodeSVG value={storeUrl} size={84} level="M" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                  <Smartphone className="w-4 h-4 text-primary" />
                  <span>Scan with your phone</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Point your phone&apos;s camera at this QR code to open and save this pass on your mobile device.
                </p>
              </div>
            </div>

            {/* Rewards Catalog */}
            {store.rewards.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Available Rewards ({store.rewards.length})
                </h3>
                <div className="grid grid-cols-2 gap-2.5">
                  {store.rewards.map((r) => (
                    <div key={r.id} className="p-3 rounded-2xl border border-border/60 bg-muted/20 space-y-1">
                      <p className="font-bold text-xs text-foreground truncate">{r.name}</p>
                      <p className="text-[11px] font-mono text-primary font-bold">{r.pointsCost} pts</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
