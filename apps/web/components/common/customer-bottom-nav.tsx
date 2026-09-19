'use client'

import React from 'react'
import { CreditCard, Gift, Compass, History, Settings } from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import { posHaptics } from '@/lib/haptics'

export type CustomerTab = 'pass' | 'perks' | 'explore' | 'activity' | 'settings'

interface CustomerBottomNavProps {
  activeTab: CustomerTab
  onSelectTab: (tab: CustomerTab) => void
  onOpenQrPass?: () => void
  unlockedRewardsCount?: number
}

export function CustomerBottomNav({
  activeTab,
  onSelectTab,
  unlockedRewardsCount = 0,
}: CustomerBottomNavProps) {
  const { t, dir } = useI18n()

  const handleTabClick = (tab: CustomerTab) => {
    posHaptics.tap()
    onSelectTab(tab)
  }

  return (
    <div
      dir={dir}
      className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-background/90 backdrop-blur-2xl border-t border-border/70 pb-safe shadow-[0_-8px_24px_rgba(0,0,0,0.08)] select-none"
    >
      <nav className="max-w-md mx-auto flex items-center justify-around px-1.5 py-1">
        {/* 1. My Cards */}
        <button
          type="button"
          onClick={() => handleTabClick('pass')}
          className={`flex flex-1 flex-col items-center justify-center py-1.5 px-0.5 rounded-xl transition-all active:scale-95 ${
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
          <span className="text-[10px] mt-0.5 tracking-tight font-medium truncate max-w-full">
            {t('nav_my_cards') || 'Cards'}
          </span>
        </button>

        {/* 2. Perks / Rewards */}
        <button
          type="button"
          onClick={() => handleTabClick('perks')}
          className={`relative flex flex-1 flex-col items-center justify-center py-1.5 px-0.5 rounded-xl transition-all active:scale-95 ${
            activeTab === 'perks'
              ? 'text-primary font-bold'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {unlockedRewardsCount > 0 && (
            <span className="absolute top-1 right-2 rtl:right-auto rtl:left-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-500 text-[9px] font-bold text-white px-1 shadow-xs">
              {unlockedRewardsCount}
            </span>
          )}
          <div
            className={`p-1 rounded-xl transition-colors ${
              activeTab === 'perks' ? 'bg-primary/15 text-primary' : ''
            }`}
          >
            <Gift className="h-5 w-5" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight font-medium truncate max-w-full">
            {t('nav_perks') || 'Perks'}
          </span>
        </button>

        {/* 3. Explore Stores */}
        <button
          type="button"
          onClick={() => handleTabClick('explore')}
          className={`flex flex-1 flex-col items-center justify-center py-1.5 px-0.5 rounded-xl transition-all active:scale-95 ${
            activeTab === 'explore'
              ? 'text-primary font-bold'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <div
            className={`p-1 rounded-xl transition-colors ${
              activeTab === 'explore' ? 'bg-primary/15 text-primary' : ''
            }`}
          >
            <Compass className="h-5 w-5" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight font-medium truncate max-w-full">
            {t('nav_explore') || 'Explore'}
          </span>
        </button>

        {/* 4. Activity History */}
        <button
          type="button"
          onClick={() => handleTabClick('activity')}
          className={`flex flex-1 flex-col items-center justify-center py-1.5 px-0.5 rounded-xl transition-all active:scale-95 ${
            activeTab === 'activity'
              ? 'text-primary font-bold'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <div
            className={`p-1 rounded-xl transition-colors ${
              activeTab === 'activity' ? 'bg-primary/15 text-primary' : ''
            }`}
          >
            <History className="h-5 w-5" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight font-medium truncate max-w-full">
            {t('nav_activity') || 'Activity'}
          </span>
        </button>

        {/* 5. Settings */}
        <button
          type="button"
          onClick={() => handleTabClick('settings')}
          className={`flex flex-1 flex-col items-center justify-center py-1.5 px-0.5 rounded-xl transition-all active:scale-95 ${
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
          <span className="text-[10px] mt-0.5 tracking-tight font-medium truncate max-w-full">
            {t('nav_settings') || 'Settings'}
          </span>
        </button>
      </nav>
    </div>
  )
}
