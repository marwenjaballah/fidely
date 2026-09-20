'use client'

import React from 'react'
import Link from 'next/link'
import { FidelyLogo } from '@/components/common/fidely-logo'
import { BRAND_NAME } from '@/lib/brand'
import { QRScanner } from '@/components/qr-scanner'
import { TransactionPanel } from '../transaction-panel'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { LanguageSwitcher } from '@/components/common/language-switcher'
import { ThemeToggleButton } from '@/components/common/theme-toggle-button'
import {
  LogOut,
  Coffee,
  Store,
  History,
  TrendingUp,
  Gift,
  Coins,
  RefreshCw,
} from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import { CashierStoreInfo, RecentTx } from '../mobile/cashier-mobile-view'

interface CashierDesktopViewProps {
  stores: CashierStoreInfo[]
  activeStore: CashierStoreInfo | null
  onSelectStore: (storeId: string) => void
  onProcess: (
    type: 'issue' | 'redeem',
    amount: number,
    rewardId?: string,
    rewardName?: string,
    customerQrToken?: string,
    customerName?: string
  ) => void
  recentTxs: RecentTx[]
  isLoadingRecent: boolean
  onLogout: () => void
  cashierEmail?: string
  scanMode: {
    active: boolean
    type: 'issue' | 'redeem' | null
    value: any
    rewardName?: string
  }
  onScanSuccess: (decodedToken: string) => void
  onCancelScan: () => void
}

export function CashierDesktopView({
  stores,
  activeStore,
  onSelectStore,
  onProcess,
  recentTxs,
  isLoadingRecent,
  onLogout,
  cashierEmail,
  scanMode,
  onScanSuccess,
  onCancelScan,
}: CashierDesktopViewProps) {
  const { t, dir } = useI18n()

  return (
    <div className="hidden md:flex flex-col min-h-screen bg-background text-foreground" dir={dir}>
      {/* ── Desktop Header ── */}
      <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between border-b border-border/60 bg-background/95 px-8 backdrop-blur">
        <div className="flex items-center gap-3">
          <Link href="/cashier" className="flex items-center gap-2 group">
            <FidelyLogo size="md" variant="subtle" className="transition-transform group-hover:scale-105" />
            <span className="font-extrabold text-lg tracking-tight text-foreground">{BRAND_NAME}</span>
          </Link>
          <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full font-medium uppercase tracking-wider">
            POS Terminal
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Store Register Selector */}
          {stores.length > 0 && (
            <div className="flex items-center gap-2">
              <Store className="h-4 w-4 text-primary" />
              <Select
                value={activeStore?.id || ''}
                onValueChange={onSelectStore}
              >
                <SelectTrigger className="w-[200px] h-9 text-xs rounded-xl bg-card border-border/70 font-semibold">
                  <SelectValue placeholder="Select register" />
                </SelectTrigger>
                <SelectContent>
                  {stores.map((s) => (
                    <SelectItem key={s.id} value={s.id} className="text-xs font-semibold">
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <LanguageSwitcher />
          <ThemeToggleButton />

          <div className="flex items-center gap-2 border-s border-border/60 ps-3">
            <span className="text-xs font-mono text-muted-foreground">{cashierEmail}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onLogout}
              className="text-muted-foreground hover:text-destructive gap-1 h-8 px-2"
            >
              <LogOut className="h-3.5 w-3.5 rtl:rotate-180" />
              <span className="text-xs">{t('logout') || 'Logout'}</span>
            </Button>
          </div>
        </div>
      </header>

      {/* ── Main Dual-Pane POS Interface ── */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-8 space-y-6">
        <div className="grid grid-cols-12 gap-8 items-start">
          {/* Left Column (5 cols): Camera Viewfinder & Shift Ledger */}
          <div className="col-span-5 space-y-6">
            <div className="rounded-3xl border border-border/70 bg-card p-5 shadow-xl space-y-3 text-start">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm flex items-center gap-2">
                  <Coffee className="w-4 h-4 text-primary" />
                  <span>Optical Scanner</span>
                </h3>
                {scanMode.active && (
                  <Badge className="bg-primary text-primary-foreground text-[10px] font-bold animate-pulse">
                    Scanning Active
                  </Badge>
                )}
              </div>

              <div className="rounded-2xl overflow-hidden bg-black/95 p-1 relative">
                <QRScanner
                  containerId="desktop-cashier-scanner"
                  onScanSuccess={onScanSuccess}
                />
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Point barcode or pass QR code at camera to execute transaction
              </p>
            </div>

            {/* Recent Shift Transactions */}
            <div className="rounded-3xl border border-border/70 bg-card p-5 shadow-sm text-start space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5" />
                  <span>Shift Activity</span>
                </h3>
                <span className="text-xs font-mono font-bold">{recentTxs.length} Scans</span>
              </div>

              {recentTxs.length === 0 ? (
                <div className="py-8 text-center text-xs text-muted-foreground">
                  No shift transactions recorded yet.
                </div>
              ) : (
                <div className="space-y-2 max-h-[260px] overflow-y-auto pe-1">
                  {recentTxs.slice(0, 5).map((tx) => (
                    <div
                      key={tx.id}
                      className="p-3 rounded-2xl border border-border/40 bg-muted/20 flex items-center justify-between"
                    >
                      <div className="text-start">
                        <p className="font-semibold text-xs text-foreground">{tx.customerName || 'Customer'}</p>
                        <p className="text-[10px] text-muted-foreground font-mono">
                          {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <div className="text-end">
                        <span className="text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400">
                          +{tx.pointsAffected} pts
                        </span>
                        {tx.amountTnd !== null && (
                          <p className="text-[10px] text-muted-foreground font-mono">
                            {tx.amountTnd.toFixed(2)} TND
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column (7 cols): Transaction Register Panel */}
          <div className="col-span-7">
            <TransactionPanel
              storeId={activeStore?.id}
              storeName={activeStore?.name}
              pointsPerTnd={activeStore?.pointsPerTnd}
              onProcess={onProcess}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
