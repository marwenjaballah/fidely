'use client'

import React from 'react'
import { ChevronDown, Coffee, Store, ShieldCheck } from 'lucide-react'
import { posHaptics } from '@/lib/haptics'

export type AppScene = 'cashier' | 'merchant' | 'customer' | 'admin'

interface StoreCommandPillProps {
  scene: AppScene
  storeName?: string
  storeColor?: string
  logoUrl?: string | null
  pointsBalance?: number
  shiftActive?: boolean
  onClick: () => void
  className?: string
}

export function StoreCommandPill({
  scene,
  storeName,
  storeColor,
  logoUrl,
  pointsBalance,
  shiftActive = true,
  onClick,
  className = '',
}: StoreCommandPillProps) {
  const handleClick = () => {
    posHaptics.tap()
    onClick()
  }

  const defaultLabel =
    scene === 'cashier'
      ? 'Select Branch'
      : scene === 'merchant'
      ? 'Select Store'
      : scene === 'customer'
      ? 'My Passes'
      : 'Admin'

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`group flex items-center gap-1.5 py-1 px-2.5 rounded-full bg-muted/60 hover:bg-muted/90 border border-border/60 transition-all active:scale-95 max-w-[190px] sm:max-w-[220px] shadow-2xs select-none ${className}`}
      aria-label="Switch active store"
    >
      {/* Visual Identity Indicator */}
      {logoUrl ? (
        <img
          src={logoUrl}
          alt={storeName || 'Store'}
          className="w-4 h-4 rounded-full object-cover shrink-0 border border-border/50"
        />
      ) : storeColor ? (
        <span
          className="w-2.5 h-2.5 rounded-full shrink-0 ring-1 ring-white/30"
          style={{ backgroundColor: storeColor }}
        />
      ) : scene === 'cashier' ? (
        <span className="relative flex h-2 w-2 shrink-0">
          {shiftActive && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          )}
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
      ) : (
        <Coffee className="w-3.5 h-3.5 text-primary shrink-0" />
      )}

      {/* Store Name / Active Context */}
      <span className="text-xs font-bold text-foreground truncate text-start">
        {storeName || defaultLabel}
      </span>

      {/* Customer Points Badge in Pill if present */}
      {scene === 'customer' && typeof pointsBalance === 'number' && (
        <span className="text-[10px] font-extrabold font-mono text-primary bg-primary/10 px-1.5 py-0.2 rounded-md shrink-0">
          {pointsBalance}
        </span>
      )}

      {/* Chevron dropdown indicator */}
      <ChevronDown className="w-3 h-3 text-muted-foreground/70 group-hover:text-foreground shrink-0 transition-transform group-hover:translate-y-0.5" />
    </button>
  )
}
