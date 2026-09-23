'use client'

import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Share2,
  PlusSquare,
  CheckCircle2,
  MoreVertical,
  Download,
  Smartphone,
  Laptop,
  Sparkles,
} from 'lucide-react'
import { BRAND_NAME } from '@/lib/brand'
import { useI18n } from '@/lib/i18n'
import { posHaptics } from '@/lib/haptics'

interface PwaInstallDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PwaInstallDialog({ open, onOpenChange }: PwaInstallDialogProps) {
  const { t, dir } = useI18n()
  const [deviceType, setDeviceType] = useState<'ios' | 'android' | 'desktop'>('ios')
  const [canPromptDirectly, setCanPromptDirectly] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const ua = window.navigator.userAgent.toLowerCase()
    const isIosDevice = /iphone|ipad|ipod/.test(ua) && !(window as any).MSStream
    const isAndroidDevice = /android/.test(ua)

    if (isIosDevice) {
      setDeviceType('ios')
    } else if (isAndroidDevice) {
      setDeviceType('android')
    } else {
      setDeviceType('desktop')
    }

    if ((window as any).deferredPwaPrompt) {
      setCanPromptDirectly(true)
    }
  }, [open])

  const handleDirectInstall = async () => {
    const promptEvent = (window as any).deferredPwaPrompt
    if (promptEvent) {
      posHaptics.tap()
      await promptEvent.prompt()
      const choice = await promptEvent.userChoice
      if (choice.outcome === 'accepted') {
        ;(window as any).deferredPwaPrompt = null
        onOpenChange(false)
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm rounded-3xl p-5 bg-card border-border/80 shadow-2xl text-start" dir={dir}>
        <DialogHeader className="space-y-2 text-start">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/15 text-primary flex items-center justify-center shrink-0 shadow-2xs font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-foreground">
                Install {BRAND_NAME}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Add to your home screen for fast 1-tap access
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* If native direct install is available on Android / Chrome */}
        {canPromptDirectly && deviceType !== 'ios' && (
          <div className="pt-2">
            <Button
              onClick={handleDirectInstall}
              className="w-full h-11 rounded-2xl text-xs font-bold gap-2 bg-primary text-primary-foreground shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>Install Directly</span>
            </Button>
            <div className="my-3 flex items-center gap-2">
              <div className="h-px bg-border flex-1" />
              <span className="text-[10px] text-muted-foreground uppercase font-bold">Or manually</span>
              <div className="h-px bg-border flex-1" />
            </div>
          </div>
        )}

        {/* Device-Specific Visual Instructions */}
        {deviceType === 'ios' && (
          <div className="space-y-3 pt-2">
            <div className="p-3 rounded-2xl bg-muted/30 border border-border/50 flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                <Share2 className="w-4 h-4" />
              </div>
              <div className="text-xs space-y-0.5">
                <p className="font-bold text-foreground">1. Tap Share in Safari</p>
                <p className="text-[11px] text-muted-foreground">
                  Tap the Share icon <Share2 className="w-3 h-3 inline text-primary mx-0.5" /> in the bottom toolbar of Safari.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-muted/30 border border-border/50 flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                <PlusSquare className="w-4 h-4" />
              </div>
              <div className="text-xs space-y-0.5">
                <p className="font-bold text-foreground">2. Select "Add to Home Screen"</p>
                <p className="text-[11px] text-muted-foreground">
                  Scroll down the share options and tap <strong>Add to Home Screen</strong>.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-muted/30 border border-border/50 flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="text-xs space-y-0.5">
                <p className="font-bold text-foreground">3. Tap "Add"</p>
                <p className="text-[11px] text-muted-foreground">
                  Tap <strong>Add</strong> in the top-right corner to place {BRAND_NAME} on your home screen.
                </p>
              </div>
            </div>
          </div>
        )}

        {deviceType === 'android' && (
          <div className="space-y-3 pt-2">
            <div className="p-3 rounded-2xl bg-muted/30 border border-border/50 flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                <MoreVertical className="w-4 h-4" />
              </div>
              <div className="text-xs space-y-0.5">
                <p className="font-bold text-foreground">1. Open Browser Menu</p>
                <p className="text-[11px] text-muted-foreground">
                  Tap the three dots (<strong>⋮</strong>) in the top-right corner of Chrome.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-muted/30 border border-border/50 flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                <Download className="w-4 h-4" />
              </div>
              <div className="text-xs space-y-0.5">
                <p className="font-bold text-foreground">2. Tap "Install App" or "Add to Home screen"</p>
                <p className="text-[11px] text-muted-foreground">
                  Select <strong>Install app</strong> or <strong>Add to Home screen</strong> from the menu.
                </p>
              </div>
            </div>
          </div>
        )}

        {deviceType === 'desktop' && (
          <div className="space-y-3 pt-2">
            <div className="p-3 rounded-2xl bg-muted/30 border border-border/50 flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                <Download className="w-4 h-4" />
              </div>
              <div className="text-xs space-y-0.5">
                <p className="font-bold text-foreground">1. Click the Install Icon in the URL Bar</p>
                <p className="text-[11px] text-muted-foreground">
                  Look at the right side of your Chrome or Edge address bar and click the <strong>Install</strong> icon.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-muted/30 border border-border/50 flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="text-xs space-y-0.5">
                <p className="font-bold text-foreground">2. Click "Install"</p>
                <p className="text-[11px] text-muted-foreground">
                  Confirm to install {BRAND_NAME} to your applications dock/taskbar.
                </p>
              </div>
            </div>
          </div>
        )}

        <Button
          variant="outline"
          onClick={() => onOpenChange(false)}
          className="w-full h-10 rounded-2xl text-xs font-semibold mt-2"
        >
          Got It
        </Button>
      </DialogContent>
    </Dialog>
  )
}
