'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { FidelyLogo } from '@/components/common/fidely-logo'
import { BRAND_NAME } from '@/lib/brand'
import { useI18n } from '@/lib/i18n'
import { StoreCommandPill, AppScene } from './store-command-pill'
import { StoreSwitcherDrawer, CashierStoreItem } from './store-switcher-drawer'

export type { AppScene }

interface MobileHeaderProps {
  scene: AppScene
  storeName?: string
  storeColor?: string
  logoUrl?: string | null
  rightElement?: React.ReactNode
  onLogout?: () => void
  // Extended props for dynamic store switcher
  pointsBalance?: number
  shiftActive?: boolean
  cashierStores?: CashierStoreItem[]
  activeCashierStoreId?: string
  onSelectCashierStore?: (storeId: string) => void
  onOpenScanStand?: () => void
  onCreateStoreClick?: () => void
}

export function MobileHeader({
  scene,
  storeName,
  storeColor,
  logoUrl,
  rightElement,
  pointsBalance,
  shiftActive = true,
  cashierStores,
  activeCashierStoreId,
  onSelectCashierStore,
  onOpenScanStand,
  onCreateStoreClick,
}: MobileHeaderProps) {
  const { dir } = useI18n()
  const [drawerOpen, setDrawerOpen] = useState(false)

  const homeHref =
    scene === 'cashier'
      ? '/cashier'
      : scene === 'merchant'
      ? '/merchant/overview'
      : scene === 'admin'
      ? '/admin/overview'
      : '/customer/overview'

  return (
    <>
      <header
        dir={dir}
        className="sticky top-0 z-40 flex h-12 shrink-0 items-center justify-between border-b border-border/60 bg-background/95 px-3 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:hidden select-none"
      >
        {/* 1. App Logo & Brand Name */}
        <Link href={homeHref} className="flex items-center gap-1.5 shrink-0 group">
          <FidelyLogo size="sm" variant="subtle" className="transition-transform group-hover:scale-105" />
          <span className="text-sm font-black tracking-tight text-foreground hidden xs:inline sm:inline">
            {BRAND_NAME}
          </span>
        </Link>

        {/* 2. Center: Universal Interactive Store Command Pill */}
        <div className="flex-1 flex items-center justify-center px-2 min-w-0">
          <StoreCommandPill
            scene={scene}
            storeName={storeName}
            storeColor={storeColor}
            logoUrl={logoUrl}
            pointsBalance={pointsBalance}
            shiftActive={shiftActive}
            onClick={() => setDrawerOpen(true)}
          />
        </div>

        {/* 3. End: Right Action / Avatar / Scene Indicator */}
        <div className="flex items-center gap-1.5 shrink-0">
          {rightElement ? (
            rightElement
          ) : (
            <span className="text-[10px] font-bold text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full uppercase tracking-wider">
              {scene === 'cashier'
                ? 'POS'
                : scene === 'merchant'
                ? 'Merchant'
                : scene === 'admin'
                ? 'Admin'
                : 'Pass'}
            </span>
          )}
        </div>
      </header>

      {/* Universal Store Switcher Bottom Sheet */}
      <StoreSwitcherDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        scene={scene}
        cashierStores={cashierStores}
        activeCashierStoreId={activeCashierStoreId}
        onSelectCashierStore={onSelectCashierStore}
        onOpenScanStand={onOpenScanStand}
        onCreateStoreClick={onCreateStoreClick}
      />
    </>
  )
}
