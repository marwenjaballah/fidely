'use client'

import React from 'react'
import Link from 'next/link'
import { FidelyLogo } from '@/components/common/fidely-logo'
import { BRAND_NAME } from '@/lib/brand'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Badge } from '@/components/ui/badge'
import { LanguageSwitcher } from '@/components/common/language-switcher'
import { ThemeToggleButton } from '@/components/common/theme-toggle-button'

export function AdminMobileHeader() {
  return (
    <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center justify-between border-b border-border/60 bg-background/95 px-3 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:hidden select-none">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="h-8 w-8" />
        <Link href="/overview" className="flex items-center gap-1.5">
          <FidelyLogo size="sm" variant="subtle" />
          <span className="text-sm font-black tracking-tight text-foreground">
            {BRAND_NAME}
          </span>
        </Link>
        <Badge
          variant="outline"
          className="text-[10px] px-1.5 py-0 h-4 font-bold border-amber-500/30 text-amber-500 bg-amber-500/10 uppercase"
        >
          Admin
        </Badge>
      </div>

      <div className="flex items-center gap-1.5">
        <LanguageSwitcher />
        <ThemeToggleButton />
      </div>
    </header>
  )
}
