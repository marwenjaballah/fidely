'use client'

import React from 'react'
import { CustomerMembership } from '@/store/customer-store'
import { SwipeablePassCarousel } from '@/components/mobile/swipeable-pass-carousel'
import { Button } from '@/components/ui/button'
import { QrCode, Compass, Gift, ChevronRight, Sparkles } from 'lucide-react'
import { FidelyLogo } from '@/components/common/fidely-logo'
import { useI18n } from '@/lib/i18n'
import { posHaptics } from '@/lib/haptics'

interface CustomerWalletTabProps {
  memberships: CustomerMembership[]
  activeMembership: CustomerMembership | null
  onSelectMembership: (id: string) => void
  onRefreshQr: (id: string) => Promise<void> | void
  onOpenExplore: () => void
  onOpenScanStand: () => void
  onGoToRewards: () => void
  userName?: string
}

export function CustomerWalletTab({
  memberships,
  activeMembership,
  onSelectMembership,
  onRefreshQr,
  onOpenExplore,
  onOpenScanStand,
  onGoToRewards,
  userName,
}: CustomerWalletTabProps) {
  const { t } = useI18n()

  const reachableRewards = activeMembership?.rewards
    ? activeMembership.rewards.filter((r) => r.active && r.pointsCost <= (activeMembership.pointsBalance || 0))
    : []

  if (memberships.length === 0) {
    return (
      <div className="rounded-3xl border border-border/70 bg-card p-6 text-center space-y-5 shadow-lg my-auto">
        <FidelyLogo size="lg" variant="subtle" className="mx-auto" />
        <div className="space-y-1.5 text-center">
          <h2 className="text-xl font-bold tracking-tight">
            {t('customer_empty_cards_title') || 'No Loyalty Passes Yet'}
          </h2>
          <p className="text-muted-foreground text-xs leading-relaxed max-w-xs mx-auto">
            {t('customer_empty_cards_desc') ||
              'Scan a counter stand QR code at your favorite coffee shop to add your first digital pass.'}
          </p>
        </div>

        <div className="space-y-2.5 pt-2">
          <Button
            size="default"
            onClick={onOpenScanStand}
            className="w-full gap-2 rounded-2xl h-12 text-xs font-bold shadow-md bg-primary text-primary-foreground"
          >
            <QrCode className="h-4 w-4" />
            {t('customer_scan_qr_stand') || 'Scan In-Store QR Stand'}
          </Button>
          <Button
            variant="outline"
            size="default"
            onClick={onOpenExplore}
            className="w-full gap-2 rounded-2xl h-11 text-xs font-semibold"
          >
            <Compass className="h-4 w-4" />
            {t('nav_explore') || 'Explore Partner Stores'}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Ambient Store Glow Backdrop */}
      <div className="relative">
        {activeMembership?.primaryColor && (
          <div
            className="absolute top-1/4 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-3xl opacity-15 pointer-events-none -z-10 transition-all duration-700"
            style={{ backgroundColor: activeMembership.primaryColor }}
          />
        )}

        {/* Swipeable Pass Carousel */}
        <SwipeablePassCarousel
          memberships={memberships}
          activeMembershipId={activeMembership?.id}
          onSelectMembership={onSelectMembership}
          onRefreshQr={onRefreshQr}
          userName={userName}
        />
      </div>

      <p className="text-center text-[11px] text-muted-foreground">
        {t('customer_show_code') || 'Present this barcode to cashier to earn & redeem points'}
      </p>

      {/* Quick Perk Redeem Banner if perks are reachable */}
      {reachableRewards.length > 0 && (
        <button
          type="button"
          onClick={() => {
            posHaptics.tap()
            onGoToRewards()
          }}
          className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/15 text-start active:scale-[0.98] transition-all shadow-2xs"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
              <Gift className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                {reachableRewards.length} {t('nav_perks') || 'Perks'} ready to redeem!
              </p>
              <p className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80">
                Tap to claim your perks at the counter
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400 rtl:rotate-180 shrink-0" />
        </button>
      )}
    </div>
  )
}
