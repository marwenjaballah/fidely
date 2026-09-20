'use client'

import React from 'react'
import Link from 'next/link'
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
} from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import { LanguageSwitcher } from '@/components/common/language-switcher'
import { ThemeToggleButton } from '@/components/common/theme-toggle-button'
import { FidelyLogo } from '@/components/common/fidely-logo'
import { BRAND_NAME } from '@/lib/brand'

export interface StoreReward {
  id: string
  name: string
  description?: string | null
  pointsCost: number
  active: boolean
}

export interface StorePublicData {
  id: string
  name: string
  slug: string
  primaryColor: string
  pointsPerTnd: number
  welcomePoints?: number
  logoUrl?: string | null
  rewards: StoreReward[]
}

interface StoreMobileViewProps {
  store: StorePublicData
  isAuthenticated: boolean
  joining: boolean
  onJoinClick: () => void
}

export function StoreMobileView({
  store,
  isAuthenticated,
  joining,
  onJoinClick,
}: StoreMobileViewProps) {
  const { t, dir } = useI18n()
  const hasWelcomeBonus = Boolean(store.welcomePoints && store.welcomePoints > 0)

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col items-center p-3.5 pb-24 md:hidden select-none" dir={dir}>
      <div className="w-full max-w-md space-y-4">
        {/* Top Header Controls */}
        <div className="flex items-center justify-between pt-1">
          <Link href={isAuthenticated ? "/customer/overview" : "/"} className="flex items-center gap-1.5 group">
            <FidelyLogo size="sm" variant="subtle" className="transition-transform group-hover:scale-105" />
            <span className="font-extrabold text-sm tracking-tight text-foreground">{BRAND_NAME}</span>
          </Link>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggleButton />
          </div>
        </div>

        {/* In-Store Counter Stand Badge */}
        <div className="bg-primary/10 border border-primary/20 rounded-2xl p-3 flex items-center gap-3 shadow-2xs">
          <div className="w-8 h-8 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-xs">
            <QrCode className="w-4 h-4" />
          </div>
          <div className="text-start">
            <h3 className="font-bold text-xs text-foreground">In-Store Loyalty Pass</h3>
            <p className="text-[11px] text-muted-foreground">
              You scanned the counter stand for <strong className="text-foreground">{store.name}</strong>
            </p>
          </div>
        </div>

        {/* Welcome Bonus Gift Banner */}
        {hasWelcomeBonus && (
          <div className="bg-gradient-to-r from-primary/15 via-primary/10 to-indigo-500/15 border border-primary/30 rounded-2xl p-3.5 flex items-center justify-between shadow-2xs animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-start">
              <div className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold shrink-0 shadow-xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-foreground">Welcome Bonus Gift</h4>
                <p className="text-[11px] text-muted-foreground">Receive instant bonus points when joining</p>
              </div>
            </div>
            <Badge className="bg-primary text-primary-foreground font-mono font-bold text-xs px-2.5 py-1 shrink-0">
              +{store.welcomePoints} pts
            </Badge>
          </div>
        )}

        {/* Apple Wallet Pass Graphic */}
        <AppleWalletPass
          storeName={store.name}
          logoUrl={store.logoUrl}
          primaryColor={store.primaryColor || '#D97706'}
          pointsBalance={0}
          pointsPerTnd={store.pointsPerTnd}
          qrCodeToken={`JOIN:${store.slug}`}
          memberName={isAuthenticated ? t('card_member') || 'Member' : t('card_fallback_customer') || 'New Customer'}
          memberSince={t('card_available_now') || 'Available Now'}
          rewardsCount={store.rewards.length}
          nextRewardName={store.rewards[0]?.name}
          nextRewardCost={store.rewards[0]?.pointsCost}
          showQr={true}
          interactive={true}
        />

        {/* Action Button */}
        <div className="space-y-2 text-center pt-1">
          <Button
            size="lg"
            onClick={onJoinClick}
            disabled={joining}
            className="w-full text-sm font-bold shadow-xl gap-2 h-13 rounded-2xl bg-primary text-primary-foreground"
          >
            {joining ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> {t('loading') || 'Adding pass...'}
              </>
            ) : isAuthenticated ? (
              <>
                {t('customer_add_coffee_card') || 'Add Coffee Pass'} <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </>
            ) : (
              <>
                {t('auth_signup_button') || 'Get Your Pass'} <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </>
            )}
          </Button>
          <p className="text-center text-[11px] text-muted-foreground">
            {isAuthenticated
              ? 'Instant 1-tap addition to your digital wallet'
              : 'Sign up in seconds to start earning rewards'}
          </p>
        </div>

        {/* Rewards Catalog Teaser */}
        {store.rewards.length > 0 && (
          <div className="rounded-3xl border border-border/70 bg-card p-4 text-start space-y-2.5 shadow-sm">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Rewards Catalog ({store.rewards.length})
              </h4>
              <Badge variant="outline" className="text-[10px] font-mono">
                {store.pointsPerTnd} pts / 1 TND
              </Badge>
            </div>

            <div className="space-y-2">
              {store.rewards.slice(0, 3).map((r) => (
                <div
                  key={r.id}
                  className="p-3 rounded-2xl border border-border/60 bg-muted/20 flex items-center justify-between"
                >
                  <div className="space-y-0.5 min-w-0">
                    <p className="font-bold text-xs text-foreground truncate">{r.name}</p>
                    {r.description && (
                      <p className="text-[10px] text-muted-foreground line-clamp-1">{r.description}</p>
                    )}
                  </div>
                  <Badge variant="secondary" className="text-[10px] font-mono font-bold shrink-0">
                    {r.pointsCost} {t('pts') || 'pts'}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
