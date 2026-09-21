'use client'

import React, { useState, useEffect } from 'react'
import { Download, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export function PwaInstallRow() {
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    const isStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true

    setIsStandalone(isStandaloneMode)
  }, [])

  if (isStandalone) {
    return (
      <div className="flex items-center justify-between py-1">
        <div className="text-start">
          <p className="text-xs font-bold text-foreground">Installed App</p>
          <p className="text-[10px] text-muted-foreground">Running as standalone PWA</p>
        </div>
        <Badge variant="outline" className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 gap-1 border-emerald-500/30">
          <Check className="w-3 h-3" />
          <span>Installed</span>
        </Badge>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between py-1">
      <div className="text-start">
        <p className="text-xs font-bold text-foreground">Add to Home Screen</p>
        <p className="text-[10px] text-muted-foreground">Install 1-tap app icon</p>
      </div>
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={() => {
          localStorage.removeItem('fidely_pwa_dismissed')
          window.dispatchEvent(new Event('fidely:open-pwa-prompt'))
        }}
        className="h-8 rounded-xl text-xs font-bold gap-1 px-3 shadow-2xs"
      >
        <Download className="w-3.5 h-3.5 text-primary" />
        <span>Install</span>
      </Button>
    </div>
  )
}
