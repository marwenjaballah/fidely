'use client'

import React from 'react'
import { CreditCard, Gift, Store, QrCode, History } from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import { posHaptics } from '@/lib/haptics'

export type CustomerTab = 'pass' | 'rewards' | 'stores' | 'history' | 'scan'

interface CustomerBottomNavProps {
  activeTab: CustomerTab
  onSelectTab: (tab: CustomerTab) => void
  onOpenQrPass?: () => void
  unlockedRewardsCount?: number
}

export function CustomerBottomNav({
  activeTab,
  onSelectTab,
  onOpenQrPass,
  unlockedRewardsCount = 0,
}: CustomerBottomNavProps) {
  const { t, dir } = useI18n()

  const handleTabClick = (tab: CustomerTab) => {
    posHaptics.tap()
    onSelectTab(tab)
  }

  const handleCenterAction = () => {
    posHaptics.tap()
    if (onOpenQrPass) {
      onOpenQrPass()
    } else {
      onSelectTab('scan')
    }
  }

  return (
    <div
      dir={dir}
      className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-background/90 backdrop-blur-2xl border-t border-border/70 pb-safe shadow-[0_-8px_24px_rgba(0,0,0,0.08)] select-none"
    >
      <nav className="max-w-md mx-auto flex items-center justify-around px-2 py-1">
        {/* Pass Tab */}
        <button
          type="button"
          onClick={() => handleTabClick('pass')}
          className={`flex flex-1 flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all active:scale-95 ${
            activeTab === 'pass'
              ? 'text-primary font-bold'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <div
            className={`p-1 rounded-xl transition-colors ${
              activeTab === 'pass' ? 'bg-primary/15 text-primary' : ''
            }`}
          >
            <CreditCard className="h-5 w-5" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight font-medium">
            {t('customer_bottom_nav_card') || 'Card'}
          </span>
        </button>

        {/* Rewards Tab */}
        <button
          type="button"
          onClick={() => handleTabClick('rewards')}
          className={`relative flex flex-1 flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all active:scale-95 ${
            activeTab === 'rewards'
              ? 'text-primary font-bold'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {unlockedRewardsCount > 0 && (
            <span className="absolute top-1 right-3 rtl:right-auto rtl:left-3 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-500 text-[9px] font-bold text-white px-1">
              {unlockedRewardsCount}
            </span>
          )}
          <div
            className={`p-1 rounded-xl transition-colors ${
              activeTab === 'rewards' ? 'bg-primary/15 text-primary' : ''
            }`}
          >
            <Gift className="h-5 w-5" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight font-medium">
            {t('customer_bottom_nav_perks') || 'Perks'}
          </span>
        </button>

        {/* Center Quick Action: Show QR Pass or Scan Stand */}
        <div className="flex -my-3 px-1">
          <button
            type="button"
            onClick={handleCenterAction}
            className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 active:scale-90 transition-all ${
              activeTab === 'scan' ? 'ring-4 ring-primary/20' : ''
            }`}
            title={t('customer_bottom_nav_scan_title') || 'Scan QR'}
          >
            <QrCode className="h-6 w-6" />
          </button>
        </div>

        {/* Stores Tab */}
        <button
          type="button"
          onClick={() => handleTabClick('stores')}
          className={`flex flex-1 flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all active:scale-95 ${
            activeTab === 'stores'
              ? 'text-primary font-bold'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <div
            className={`p-1 rounded-xl transition-colors ${
              activeTab === 'stores' ? 'bg-primary/15 text-primary' : ''
            }`}
          >
            <Store className="h-5 w-5" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight font-medium">
            {t('customer_bottom_nav_stores') || 'Stores'}
          </span>
        </button>

        {/* History Tab */}
        <button
          type="button"
          onClick={() => handleTabClick('history')}
          className={`flex flex-1 flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all active:scale-95 ${
            activeTab === 'history'
              ? 'text-primary font-bold'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <div
            className={`p-1 rounded-xl transition-colors ${
              activeTab === 'history' ? 'bg-primary/15 text-primary' : ''
            }`}
          >
            <History className="h-5 w-5" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight font-medium">
            {t('customer_history_title') || 'History'}
          </span>
        </button>
      </nav>
    </div>
  )
}
