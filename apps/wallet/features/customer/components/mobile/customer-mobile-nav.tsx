'use client'

import React from 'react'
import { CreditCard, Gift, Compass } from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import { posHaptics } from '@/lib/haptics'

export type CustomerMobileTab = 'wallet' | 'rewards' | 'explore'

interface CustomerMobileNavProps {
  activeTab: CustomerMobileTab
  onSelectTab: (tab: CustomerMobileTab) => void
  unlockedRewardsCount?: number
}

export function CustomerMobileNav({
  activeTab,
  onSelectTab,
  unlockedRewardsCount = 0,
}: CustomerMobileNavProps) {
  const { t, dir } = useI18n()

  const handleTabClick = (tab: CustomerMobileTab) => {
    posHaptics.tap()
    onSelectTab(tab)
  }

  return (
    <div
      dir={dir}
      className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-background/90 backdrop-blur-2xl border-t border-border/70 pb-safe shadow-[0_-8px_24px_rgba(0,0,0,0.08)] select-none"
    >
      <nav className="max-w-md mx-auto flex items-center justify-around px-4 py-1.5">
        {/* Tab 1: Wallet (Pass & QR) */}
        <button
          type="button"
          onClick={() => handleTabClick('wallet')}
          className={`flex flex-1 flex-col items-center justify-center py-1 px-1 rounded-2xl transition-all active:scale-95 ${
            activeTab === 'wallet'
              ? 'text-primary font-bold'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <div
            className={`p-1.5 rounded-xl transition-colors ${
              activeTab === 'wallet' ? 'bg-primary/15 text-primary' : ''
            }`}
          >
            <CreditCard className="h-5 w-5" />
          </div>
          <span className="text-[11px] mt-0.5 tracking-tight font-medium">
            {t('nav_my_cards') || 'Wallet'}
          </span>
        </button>

        {/* Tab 2: Rewards & Activity */}
        <button
          type="button"
          onClick={() => handleTabClick('rewards')}
          className={`relative flex flex-1 flex-col items-center justify-center py-1 px-1 rounded-2xl transition-all active:scale-95 ${
            activeTab === 'rewards'
              ? 'text-primary font-bold'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {unlockedRewardsCount > 0 && (
            <span className="absolute top-1 right-6 rtl:right-auto rtl:left-6 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-500 text-[9px] font-bold text-white px-1 shadow-xs animate-in zoom-in-50">
              {unlockedRewardsCount}
            </span>
          )}
          <div
            className={`p-1.5 rounded-xl transition-colors ${
              activeTab === 'rewards' ? 'bg-primary/15 text-primary' : ''
            }`}
          >
            <Gift className="h-5 w-5" />
          </div>
          <span className="text-[11px] mt-0.5 tracking-tight font-medium">
            {t('nav_perks') || 'Rewards'}
          </span>
        </button>

        {/* Tab 3: Explore & Scan */}
        <button
          type="button"
          onClick={() => handleTabClick('explore')}
          className={`flex flex-1 flex-col items-center justify-center py-1 px-1 rounded-2xl transition-all active:scale-95 ${
            activeTab === 'explore'
              ? 'text-primary font-bold'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <div
            className={`p-1.5 rounded-xl transition-colors ${
              activeTab === 'explore' ? 'bg-primary/15 text-primary' : ''
            }`}
          >
            <Compass className="h-5 w-5" />
          </div>
          <span className="text-[11px] mt-0.5 tracking-tight font-medium">
            {t('nav_explore') || 'Explore'}
          </span>
        </button>
      </nav>
    </div>
  )
}
