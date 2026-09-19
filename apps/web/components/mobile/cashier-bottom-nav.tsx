'use client'

import React from 'react'
import { Coins, Gift, History, Settings } from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import { posHaptics } from '@/lib/haptics'

export type CashierTab = 'award' | 'redeem' | 'activity' | 'settings'

interface CashierBottomNavProps {
  activeTab: CashierTab
  onSelectTab: (tab: CashierTab) => void
  shiftTxCount?: number
}

export function CashierBottomNav({
  activeTab,
  onSelectTab,
  shiftTxCount = 0,
}: CashierBottomNavProps) {
  const { t, dir } = useI18n()

  const handleTabClick = (tab: CashierTab) => {
    posHaptics.tap()
    onSelectTab(tab)
  }

  return (
    <div
      dir={dir}
      className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-background/90 backdrop-blur-2xl border-t border-border/70 pb-safe shadow-[0_-8px_24px_rgba(0,0,0,0.08)] select-none"
    >
      <nav className="max-w-md mx-auto flex items-center justify-around px-2 py-1">
        {/* Tab 1: Award Points */}
        <button
          type="button"
          onClick={() => handleTabClick('award')}
          className={`flex flex-1 flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all active:scale-95 ${
            activeTab === 'award'
              ? 'text-primary font-bold'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <div
            className={`p-1 rounded-xl transition-colors ${
              activeTab === 'award' ? 'bg-primary/15 text-primary' : ''
            }`}
          >
            <Coins className="h-5 w-5" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight font-medium">
            {t('nav_award_points') || 'Award'}
          </span>
        </button>

        {/* Tab 2: Redeem Rewards */}
        <button
          type="button"
          onClick={() => handleTabClick('redeem')}
          className={`flex flex-1 flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all active:scale-95 ${
            activeTab === 'redeem'
              ? 'text-primary font-bold'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <div
            className={`p-1 rounded-xl transition-colors ${
              activeTab === 'redeem' ? 'bg-primary/15 text-primary' : ''
            }`}
          >
            <Gift className="h-5 w-5" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight font-medium">
            {t('nav_redeem_perks') || 'Redeem'}
          </span>
        </button>

        {/* Tab 3: Shift Activity */}
        <button
          type="button"
          onClick={() => handleTabClick('activity')}
          className={`relative flex flex-1 flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all active:scale-95 ${
            activeTab === 'activity'
              ? 'text-primary font-bold'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {shiftTxCount > 0 && (
            <span className="absolute top-1 right-3 rtl:right-auto rtl:left-3 flex h-4 min-w-4 items-center justify-center rounded-full bg-muted-foreground/30 text-[9px] font-bold text-foreground px-1">
              {shiftTxCount}
            </span>
          )}
          <div
            className={`p-1 rounded-xl transition-colors ${
              activeTab === 'activity' ? 'bg-primary/15 text-primary' : ''
            }`}
          >
            <History className="h-5 w-5" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight font-medium">
            {t('nav_activity') || 'Activity'}
          </span>
        </button>

        {/* Tab 4: Cashier Settings */}
        <button
          type="button"
          onClick={() => handleTabClick('settings')}
          className={`flex flex-1 flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all active:scale-95 ${
            activeTab === 'settings'
              ? 'text-primary font-bold'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <div
            className={`p-1 rounded-xl transition-colors ${
              activeTab === 'settings' ? 'bg-primary/15 text-primary' : ''
            }`}
          >
            <Settings className="h-5 w-5" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight font-medium">
            {t('nav_settings') || 'Settings'}
          </span>
        </button>
      </nav>
    </div>
  )
}
