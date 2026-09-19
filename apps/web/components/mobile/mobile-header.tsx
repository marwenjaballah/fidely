'use client'

import React from 'react'
import Link from 'next/link'
import { FidelyLogo } from '@/components/common/fidely-logo'
import { BRAND_NAME } from '@/lib/brand'
import { useI18n } from '@/lib/i18n'

export type AppScene = 'cashier' | 'merchant' | 'customer' | 'admin'

interface MobileHeaderProps {
  scene: AppScene
  storeName?: string
  storeColor?: string
  logoUrl?: string | null
  rightElement?: React.ReactNode
  onLogout?: () => void
}

export function MobileHeader({
  scene,
  storeName,
  storeColor,
  logoUrl,
  rightElement,
}: MobileHeaderProps) {
  const { dir } = useI18n()

  const getSceneBadge = () => {
    switch (scene) {
      case 'cashier':
        return 'POS'
      case 'merchant':
        return 'Merchant'
      case 'admin':
        return 'Admin'
      case 'customer':
      default:
        return 'Pass'
    }
  }

  return (
    <header
      dir={dir}
      className="sticky top-0 z-40 flex h-11 shrink-0 items-center justify-between border-b border-border/60 bg-background/95 px-3.5 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:hidden select-none"
    >
      {/* Side 1: App Logo & App Name */}
      <Link href="/" className="flex items-center gap-1.5 shrink-0 group">
        <FidelyLogo size="sm" variant="subtle" className="transition-transform group-hover:scale-105" />
        <span className="text-sm font-black tracking-tight text-foreground">{BRAND_NAME}</span>
      </Link>

      {/* Side 2: Store Identity on the opposite side */}
      <div className="flex items-center gap-1.5 min-w-0">
        {rightElement ? (
          rightElement
        ) : storeName ? (
          <div className="flex items-center gap-1.5 py-1 px-2.5 rounded-full bg-muted/50 border border-border/50 max-w-[170px] truncate shadow-2xs">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={storeName}
                className="w-3.5 h-3.5 rounded-full object-cover shrink-0"
              />
            ) : storeColor ? (
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: storeColor }}
              />
            ) : null}
            <span className="text-[11px] font-bold text-foreground truncate">
              {storeName}
            </span>
          </div>
        ) : (
          <span className="text-[10px] font-semibold text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full">
            {getSceneBadge()}
          </span>
        )}
      </div>
    </header>
  )
}
