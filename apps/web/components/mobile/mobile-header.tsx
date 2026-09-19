'use client'

import React from 'react'
import Link from 'next/link'
import { FidelyLogo } from '@/components/common/fidely-logo'
import { ThemeToggleButton } from '@/components/common/theme-toggle-button'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { useI18n } from '@/lib/i18n'
import { LogOut } from 'lucide-react'

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
  onLogout,
}: MobileHeaderProps) {
  const { signOut } = useAuth()
  const { t, dir } = useI18n()

  const handleLogout = () => {
    if (onLogout) {
      onLogout()
    } else {
      signOut()
    }
  }

  const getSceneTitle = () => {
    switch (scene) {
      case 'cashier':
        return 'Fidely POS'
      case 'merchant':
        return 'Merchant'
      case 'admin':
        return 'Admin'
      case 'customer':
      default:
        return 'Fidely'
    }
  }

  return (
    <header
      dir={dir}
      className="sticky top-0 z-40 flex h-11 shrink-0 items-center justify-between border-b border-border/60 bg-background/95 px-3 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:hidden"
    >
      {/* Left: Brand / Store Identity */}
      <div className="flex items-center gap-2 min-w-0">
        <Link href="/" className="flex items-center gap-1.5 shrink-0">
          <FidelyLogo size="sm" variant="subtle" />
        </Link>

        {storeName ? (
          <div className="flex items-center gap-1.5 min-w-0 max-w-[160px] truncate">
            {storeColor && (
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: storeColor }}
              />
            )}
            <span className="text-xs font-bold text-foreground truncate">
              {storeName}
            </span>
          </div>
        ) : (
          <span className="text-xs font-bold text-foreground truncate">
            {getSceneTitle()}
          </span>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1.5 shrink-0">
        {rightElement}

        <ThemeToggleButton />

        <Button
          variant="ghost"
          size="icon"
          onClick={handleLogout}
          className="h-7 w-7 rounded-xl text-muted-foreground hover:text-destructive"
          aria-label={t('logout') || 'Logout'}
        >
          <LogOut className="h-3.5 w-3.5 rtl:rotate-180" />
        </Button>
      </div>
    </header>
  )
}
