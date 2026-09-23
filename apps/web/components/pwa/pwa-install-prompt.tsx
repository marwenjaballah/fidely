'use client'

import React, { useEffect, useState } from 'react'
import { Download, X, Share2, PlusSquare, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/lib/i18n'
import { BRAND_NAME } from '@/lib/brand'

import { PwaInstallDialog } from './pwa-install-dialog'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function PWAInstallPrompt() {
  const { t, dir } = useI18n()
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(true)
  const [showPrompt, setShowPrompt] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    // Check if already in standalone/PWA mode
    const isStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://')

    setIsStandalone(isStandaloneMode)
    if (isStandaloneMode) return

    // Check if recently dismissed (within 7 days)
    const dismissedAt = localStorage.getItem('fidely_pwa_dismissed')
    if (dismissedAt) {
      const elapsed = Date.now() - parseInt(dismissedAt, 10)
      if (elapsed < 7 * 24 * 60 * 60 * 1000) {
        return
      }
    }

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase()
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent) && !(window as any).MSStream
    setIsIOS(isIosDevice)

    // Capture Android / Chrome beforeinstallprompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault()
      const promptEvent = e as BeforeInstallPromptEvent
      setDeferredPrompt(promptEvent)
      ;(window as any).deferredPwaPrompt = promptEvent
      // Delay prompt appearance for seamless first impression
      setTimeout(() => setShowPrompt(true), 3000)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstall)

    const handleManualOpen = () => setShowPrompt(true)
    window.addEventListener('fidely:open-pwa-prompt', handleManualOpen)

    // On iOS, if not standalone, prompt after brief delay
    if (isIosDevice) {
      const timer = setTimeout(() => setShowPrompt(true), 4000)
      return () => {
        clearTimeout(timer)
        window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
        window.removeEventListener('fidely:open-pwa-prompt', handleManualOpen)
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
      window.removeEventListener('fidely:open-pwa-prompt', handleManualOpen)
    }
  }, [])

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt()
      const choice = await deferredPrompt.userChoice
      if (choice.outcome === 'accepted') {
        setShowPrompt(false)
      }
      setDeferredPrompt(null)
    } else {
      setShowPrompt(false)
      setDialogOpen(true)
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem('fidely_pwa_dismissed', Date.now().toString())
  }

  if (isStandalone || (!showPrompt && !dialogOpen)) return null

  return (
    <>
      {showPrompt && (
        <aside
          dir={dir}
          aria-label="Install App"
          className="fixed bottom-20 md:bottom-6 start-4 end-4 md:start-auto md:end-6 md:max-w-sm z-50 p-4 rounded-3xl bg-card/95 backdrop-blur-xl border border-border/80 shadow-2xl shadow-black/20 animate-in slide-in-from-bottom-5 duration-300"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-primary/15 text-primary flex items-center justify-center shrink-0 shadow-2xs font-bold mt-0.5">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <p className="font-bold text-xs text-foreground">
                  {t('pwa_install_title') || `Install ${BRAND_NAME}`}
                </p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {t('pwa_install_desc') ||
                    'Add to your home screen for instant 1-tap customer passes & cashier POS scanning.'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDismiss}
              aria-label="Close"
              className="p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {isIOS ? (
            <div className="mt-3 pt-3 border-t border-border/50 text-[11px] text-muted-foreground space-y-1.5">
              <div className="flex items-center gap-1.5 font-medium text-foreground">
                <span>1. Tap</span>
                <Share2 className="w-3.5 h-3.5 text-primary inline" />
                <span className="font-bold">Share</span>
                <span>in Safari</span>
              </div>
              <div className="flex items-center gap-1.5 font-medium text-foreground">
                <span>2. Scroll down & select</span>
                <PlusSquare className="w-3.5 h-3.5 text-primary inline" />
                <span className="font-bold">Add to Home Screen</span>
              </div>
            </div>
          ) : (
            <div className="mt-3.5 pt-3 border-t border-border/50 flex items-center justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                className="h-8 rounded-xl text-xs font-semibold px-3"
              >
                {t('pwa_dismiss_btn') || 'Maybe Later'}
              </Button>
              <Button
                size="sm"
                onClick={handleInstallClick}
                className="h-8 rounded-xl text-xs font-bold px-3.5 gap-1.5 shadow-sm bg-primary text-primary-foreground"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{t('pwa_install_btn') || 'Install App'}</span>
              </Button>
            </div>
          )}
        </aside>
      )}

      <PwaInstallDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  )
}
