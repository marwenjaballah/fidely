'use client'

import React from 'react'
import { Calculator, QrCode, Gift, History } from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import { posHaptics } from '@/lib/haptics'

export type CashierTab = 'pos' | 'scan' | 'redeem' | 'shift'

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
        {/* Tab 1: Keypad POS */}
        <button
          type="button"
          onClick={() => handleTabClick('pos')}
          className={`flex flex-1 flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all active:scale-95 ${
            activeTab === 'pos'
              ? 'text-primary font-bold'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <div
            className={`p-1 rounded-xl transition-colors ${
              activeTab === 'pos' ? 'bg-primary/15 text-primary' : ''
            }`}
          >
            <Calculator className="h-5 w-5" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight font-medium">
            {t('cashier_nav_keypad') || 'POS'}
          </span>
        </button>

        {/* Tab 2: Elevated Center Quick Scan */}
        <div className="flex -my-3 px-1">
          <button
            type="button"
            onClick={() => handleTabClick('scan')}
            className={`flex h-12 w-12 items-center justify-center rounded-2xl shadow-lg transition-all active:scale-90 ${
              activeTab === 'scan'
                ? 'bg-emerald-600 text-white ring-4 ring-emerald-500/20 shadow-emerald-500/30'
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
            }`}
            title={t('cashier_nav_scan') || 'Scan QR'}
          >
            <QrCode className="h-6 w-6" />
          </button>
        </div>

        {/* Tab 3: Redeem Perks */}
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
            {t('cashier_nav_redeem') || 'Redeem'}
          </span>
        </button>

        {/* Tab 4: Shift Stats & History */}
        <button
          type="button"
          onClick={() => handleTabClick('shift')}
          className={`relative flex flex-1 flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all active:scale-95 ${
            activeTab === 'shift'
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
              activeTab === 'shift' ? 'bg-primary/15 text-primary' : ''
            }`}
          >
            <History className="h-5 w-5" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight font-medium">
            {t('cashier_nav_shift') || 'Shift'}
          </span>
        </button>
      </nav>
    </div>
  )
}
