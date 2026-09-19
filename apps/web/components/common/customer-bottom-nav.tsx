'use client'

import React from 'react'
import { CreditCard, Gift, Store, QrCode } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useI18n } from '@/lib/i18n'

interface CustomerBottomNavProps {
  activeTab: 'pass' | 'rewards' | 'stores'
  onSelectTab: (tab: 'pass' | 'rewards' | 'stores') => void
  onOpenQrPass?: () => void
  unlockedRewardsCount?: number
}

export function CustomerBottomNav({
  activeTab,
  onSelectTab,
  onOpenQrPass,
  unlockedRewardsCount = 0,
}: CustomerBottomNavProps) {
  const { t } = useI18n()

  return (
    <div className="fixed bottom-3 inset-x-0 z-40 px-4 md:hidden pointer-events-none">
      <nav className="pointer-events-auto max-w-sm mx-auto flex items-center justify-around p-1.5 rounded-2xl bg-background/90 dark:bg-zinc-900/90 backdrop-blur-2xl border border-border/80 shadow-[0_16px_36px_rgba(0,0,0,0.2)]">
        {/* Pass Tab */}
        <button
          type="button"
          onClick={() => onSelectTab('pass')}
          className={`flex flex-1 flex-col items-center justify-center py-2 px-1 rounded-xl transition-all ${
            activeTab === 'pass'
              ? 'bg-primary/15 text-primary font-bold shadow-xs'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <CreditCard className="h-5 w-5 mb-0.5" />
          <span className="text-[10px]">{t('customer_bottom_nav_card')}</span>
        </button>

        {/* Center Quick QR Action Button */}
        {onOpenQrPass && (
          <button
            type="button"
            onClick={onOpenQrPass}
            className="flex -my-3 h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg active:scale-95 transition-transform"
            title={t('customer_bottom_nav_scan_title')}
          >
            <QrCode className="h-6 w-6" />
          </button>
        )}

        {/* Rewards Tab */}
        <button
          type="button"
          onClick={() => onSelectTab('rewards')}
          className={`relative flex flex-1 flex-col items-center justify-center py-2 px-1 rounded-xl transition-all ${
            activeTab === 'rewards'
              ? 'bg-primary/15 text-primary font-bold shadow-xs'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {unlockedRewardsCount > 0 && (
            <span className="absolute top-1 right-3 rtl:right-auto rtl:left-3 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-500 text-[9px] font-bold text-white px-1">
              {unlockedRewardsCount}
            </span>
          )}
          <Gift className="h-5 w-5 mb-0.5" />
          <span className="text-[10px]">{t('customer_bottom_nav_perks')}</span>
        </button>

        {/* Stores Tab */}
        <button
          type="button"
          onClick={() => onSelectTab('stores')}
          className={`flex flex-1 flex-col items-center justify-center py-2 px-1 rounded-xl transition-all ${
            activeTab === 'stores'
              ? 'bg-primary/15 text-primary font-bold shadow-xs'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Store className="h-5 w-5 mb-0.5" />
          <span className="text-[10px]">{t('customer_bottom_nav_stores')}</span>
        </button>
      </nav>
    </div>
  )
}

