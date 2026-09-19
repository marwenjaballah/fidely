'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { FidelyLogo } from '@/components/common/fidely-logo'
import { ThemeToggleButton } from '@/components/common/theme-toggle-button'
import { LanguageSwitcher } from '@/components/common/language-switcher'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SceneSwitcherDrawer, AppScene } from './scene-switcher-drawer'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { useI18n } from '@/lib/i18n'
import {
  ChevronsUpDown,
  LogOut,
  CreditCard,
  Calculator,
  LayoutDashboard,
  ShieldAlert,
  Sparkles,
} from 'lucide-react'

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
  const { profile, signOut } = useAuth()
  const { t, dir } = useI18n()
  const [switcherOpen, setSwitcherOpen] = useState(false)

  const handleLogout = () => {
    if (onLogout) {
      onLogout()
    } else {
      signOut()
    }
  }

  const getSceneBadge = () => {
    switch (scene) {
      case 'cashier':
        return {
          label: 'POS',
          icon: Calculator,
          color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
        }
      case 'merchant':
        return {
          label: 'Store',
          icon: LayoutDashboard,
          color: 'text-primary bg-primary/10 border-primary/20',
        }
      case 'admin':
        return {
          label: 'Admin',
          icon: ShieldAlert,
          color: 'text-violet-500 bg-violet-500/10 border-violet-500/20',
        }
      case 'customer':
      default:
        return {
          label: 'Pass',
          icon: CreditCard,
          color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
        }
    }
  }

  const badgeInfo = getSceneBadge()
  const BadgeIcon = badgeInfo.icon

  return (
    <>
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
            <div className="flex items-center gap-1.5 min-w-0 max-w-[130px] truncate">
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
          ) : null}
        </div>

        {/* Center / Right: Scene Switcher Pill & Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* 1-Tap Scene Switcher Pill */}
          <button
            type="button"
            onClick={() => setSwitcherOpen(true)}
            className={`flex items-center gap-1 px-2 py-1 rounded-xl border text-[11px] font-bold transition-all active:scale-95 ${badgeInfo.color}`}
            title={t('scene_switcher_title') || 'Switch Mode'}
          >
            <BadgeIcon className="w-3 h-3" />
            <span>{badgeInfo.label}</span>
            <ChevronsUpDown className="w-2.5 h-2.5 opacity-60" />
          </button>

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

      {/* Native Scene Switcher Drawer */}
      <SceneSwitcherDrawer
        open={switcherOpen}
        onOpenChange={setSwitcherOpen}
        currentScene={scene}
      />
    </>
  )
}
