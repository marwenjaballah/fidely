'use client'

import React, { useState } from 'react'
import { QRScanner } from '@/components/qr-scanner'
import { MobileHeader } from '@/components/mobile/mobile-header'
import { CashierBottomNav, CashierTab } from '@/components/mobile/cashier-bottom-nav'
import { CashierPhoneLookupSheet } from './cashier-phone-lookup-sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Phone,
  QrCode,
  UserCheck,
  Coins,
  Gift,
  Check,
  X,
  History,
  TrendingUp,
  Settings,
  Sparkles,
  Loader2,
  Delete,
} from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import { posHaptics } from '@/lib/haptics'
import { posAudio } from '@/features/cashier/lib/pos-audio'
import { SearchedCustomer } from '../transaction-panel'

export interface CashierStoreInfo {
  id: string
  name: string
  slug: string
  primaryColor: string
  pointsPerTnd: number
  isOwner: boolean
}

export interface RecentTx {
  id: string
  type: string
  amountTnd: number | null
  pointsAffected: number
  createdAt: string
  customerName: string
}

interface CashierMobileViewProps {
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
  apiClient: any
}

export function CashierMobileView({
  stores,
  activeStore,
  onSelectStore,
  onProcess,
  recentTxs,
  isLoadingRecent,
  onLogout,
  apiClient,
}: CashierMobileViewProps) {
  const { t, dir } = useI18n()
  const [mobileTab, setMobileTab] = useState<CashierTab>('award')
  const [phoneLookupOpen, setPhoneLookupOpen] = useState(false)
  const [scannedCustomer, setScannedCustomer] = useState<{
    token: string
    name?: string
    balance?: number
  } | null>(null)

  // Transaction amount & selected reward
  const [spendAmount, setSpendAmount] = useState('')
  const [rewards, setRewards] = useState<any[]>([])
  const [selectedRewardId, setSelectedRewardId] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const pointsPerTnd = activeStore?.pointsPerTnd || 10
  const parsedSpend = parseFloat(spendAmount) || 0
  const estimatedPoints = Math.max(0, Math.round(parsedSpend * pointsPerTnd))

  // Handle QR scan success
  const handleScanSuccess = (decodedToken: string) => {
    posAudio.playClick()
    posHaptics.scan()
    setScannedCustomer({
      token: decodedToken.trim(),
      name: 'Customer',
    })
    // Fetch store rewards if not loaded
    if (activeStore?.id && rewards.length === 0) {
      apiClient
        .get('/api/v1/transactions/store-rewards', { params: { storeId: activeStore.id } })
        .then((res: any) => setRewards(res.data || []))
        .catch(() => {})
    }
  }

  // Handle phone lookup customer
  const handlePhoneCustomerFound = (customer: SearchedCustomer) => {
    setScannedCustomer({
      token: customer.qrToken,
      name: customer.fullName || customer.phone,
      balance: customer.pointsBalance,
    })
  }

  const handleKeypadTap = (val: string) => {
    posAudio.playClick()
    posHaptics.tap()
    if (val === 'DEL') {
      setSpendAmount((prev) => prev.slice(0, -1))
    } else if (val === '.') {
      if (!spendAmount.includes('.')) {
        setSpendAmount((prev) => (prev === '' ? '0.' : prev + '.'))
      }
    } else {
      setSpendAmount((prev) => prev + val)
    }
  }

  const handleQuickAdd = (amt: number) => {
    posAudio.playClick()
    posHaptics.tap()
    const cur = parseFloat(spendAmount) || 0
    setSpendAmount((cur + amt).toString())
  }

  const handleConfirmAward = () => {
    if (!scannedCustomer || parsedSpend <= 0) return
    setIsProcessing(true)
    onProcess('issue', parsedSpend, undefined, undefined, scannedCustomer.token, scannedCustomer.name)
    setScannedCustomer(null)
    setSpendAmount('')
    setIsProcessing(false)
  }

  const handleConfirmRedeem = (rewardId: string, rewardName: string) => {
    if (!scannedCustomer) return
    setIsProcessing(true)
    onProcess('redeem', 0, rewardId, rewardName, scannedCustomer.token, scannedCustomer.name)
    setScannedCustomer(null)
    setSelectedRewardId(null)
    setIsProcessing(false)
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:hidden select-none" dir={dir}>
      {/* ── TOP MOBILE HEADER WITH SAFE REGISTER PILL ── */}
      <MobileHeader
        scene="cashier"
        storeName={activeStore?.name}
        storeColor={activeStore?.primaryColor}
        cashierStores={stores}
        activeCashierStoreId={activeStore?.id}
        onSelectCashierStore={onSelectStore}
        shiftActive={true}
        rightElement={
          <button
            type="button"
            onClick={() => setPhoneLookupOpen(true)}
            className="flex items-center gap-1 py-1 px-2.5 rounded-full bg-primary/15 text-primary border border-primary/25 text-xs font-bold active:scale-95 transition-all shadow-2xs"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Phone</span>
          </button>
        }
      />

      {/* ── MAIN SCENE CONTAINER ── */}
      <main className="flex-1 p-3.5 pb-28 max-w-md mx-auto w-full space-y-4">
        {/* ── TAB 1: SCAN / AWARD REGISTER ── */}
        {mobileTab === 'award' && (
          <div className="space-y-4">
            {!scannedCustomer ? (
              /* Ready Viewfinder */
              <div className="space-y-3">
                <div className="rounded-3xl border border-border/70 bg-card p-3 shadow-xl text-center space-y-2">
                  <div className="rounded-2xl overflow-hidden bg-black/95 p-1 relative">
                    <QRScanner
                      containerId="cashier-mobile-viewfinder"
                      onScanSuccess={handleScanSuccess}
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground font-medium py-1">
                    Point camera at customer&apos;s digital pass
                  </p>
                </div>

                {/* Quick Phone Lookup Prompt */}
                <button
                  type="button"
                  onClick={() => setPhoneLookupOpen(true)}
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-border/60 bg-card hover:bg-muted/30 text-start active:scale-[0.98] transition-all shadow-2xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-primary/15 text-primary flex items-center justify-center font-bold">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">Customer forgot their phone?</p>
                      <p className="text-[11px] text-muted-foreground">Tap to search by phone number</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px] font-bold">
                    Search
                  </Badge>
                </button>
              </div>
            ) : (
              /* Scanned Customer Action Sheet */
              <div className="rounded-3xl border border-primary/40 bg-card p-4 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
                {/* Customer Identity Bar */}
                <div className="flex items-center justify-between border-b border-border/50 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-primary/15 text-primary flex items-center justify-center font-bold shadow-2xs">
                      <UserCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">{scannedCustomer.name}</p>
                      {typeof scannedCustomer.balance === 'number' && (
                        <p className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                          Balance: {scannedCustomer.balance} pts
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setScannedCustomer(null)
                      setSpendAmount('')
                    }}
                    className="h-8 w-8 rounded-full"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Amount Entry & Keypad */}
                <div className="space-y-3">
                  <div className="text-center p-3 rounded-2xl bg-muted/40 border border-border/50">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Order Amount (TND)
                    </p>
                    <div className="text-3xl font-black font-mono tracking-tight text-foreground mt-0.5">
                      {spendAmount || '0.00'}{' '}
                      <span className="text-xs font-semibold text-muted-foreground">TND</span>
                    </div>
                    {estimatedPoints > 0 && (
                      <p className="text-xs font-bold text-primary mt-1 font-mono animate-in fade-in">
                        +{estimatedPoints} points to award
                      </p>
                    )}
                  </div>

                  {/* Quick Preset Buttons */}
                  <div className="grid grid-cols-4 gap-1.5">
                    {[5, 10, 20, 50].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => handleQuickAdd(amt)}
                        className="py-1.5 rounded-xl border border-border/60 bg-card text-xs font-bold font-mono hover:bg-muted active:scale-95 transition-all shadow-2xs"
                      >
                        +{amt}
                      </button>
                    ))}
                  </div>

                  {/* Integrated Touch Keypad */}
                  <div className="grid grid-cols-3 gap-1.5 pt-1">
                    {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'DEL'].map((k) => (
                      <button
                        key={k}
                        type="button"
                        onClick={() => handleKeypadTap(k)}
                        className={`h-11 rounded-2xl border border-border/50 text-base font-bold font-mono active:scale-95 transition-all shadow-2xs ${
                          k === 'DEL'
                            ? 'bg-muted/60 text-muted-foreground'
                            : 'bg-card text-foreground hover:bg-muted/40'
                        }`}
                      >
                        {k}
                      </button>
                    ))}
                  </div>

                  {/* Confirm Action */}
                  <Button
                    onClick={handleConfirmAward}
                    disabled={isProcessing || parsedSpend <= 0}
                    className="w-full h-13 rounded-2xl text-xs font-bold gap-2 shadow-lg bg-primary text-primary-foreground"
                  >
                    {isProcessing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Coins className="h-4 w-4" />
                    )}
                    <span>Award {estimatedPoints > 0 ? `+${estimatedPoints} Points` : 'Points'}</span>
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── TAB 2: SHIFT ACTIVITY ── */}
        {mobileTab === 'activity' && (
          <div className="rounded-3xl border border-border/70 bg-card p-4 shadow-sm text-start space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-primary" />
                <h3 className="font-bold text-xs uppercase tracking-wider text-foreground">
                  Today&apos;s Shift Activity
                </h3>
              </div>
              <Badge variant="outline" className="text-[10px] font-mono font-bold">
                {recentTxs.length} Scans
              </Badge>
            </div>

            {recentTxs.length === 0 ? (
              <div className="py-12 text-center text-xs text-muted-foreground space-y-2">
                <History className="h-8 w-8 text-muted-foreground/30 mx-auto" />
                <p>No shift transactions recorded yet.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentTxs.map((tx) => {
                  const isEarn = tx.type === 'earn'
                  return (
                    <div
                      key={tx.id}
                      className="p-3 rounded-2xl border border-border/40 bg-muted/20 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 ${
                            isEarn ? 'bg-emerald-500/10 text-emerald-600' : 'bg-primary/10 text-primary'
                          }`}
                        >
                          {isEarn ? <TrendingUp className="h-4 w-4" /> : <Gift className="h-4 w-4" />}
                        </div>
                        <div className="text-start">
                          <p className="font-semibold text-xs text-foreground">
                            {tx.customerName || 'Customer'}
                          </p>
                          <p className="text-[10px] text-muted-foreground font-mono">
                            {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>

                      <div className="text-end">
                        <span
                          className={`text-xs font-bold font-mono ${
                            isEarn ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground'
                          }`}
                        >
                          {isEarn ? `+${tx.pointsAffected}` : tx.pointsAffected} pts
                        </span>
                        {tx.amountTnd !== null && (
                          <p className="text-[10px] text-muted-foreground font-mono">
                            {tx.amountTnd.toFixed(2)} TND
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 3: SETTINGS ── */}
        {mobileTab === 'settings' && (
          <div className="space-y-3 text-start">
            <div className="p-4 rounded-3xl bg-card border border-border/70 shadow-sm space-y-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                Active Register Info
              </h3>
              <div className="space-y-1">
                <p className="text-sm font-bold text-foreground">{activeStore?.name}</p>
                <p className="text-xs text-muted-foreground font-mono">Rate: {pointsPerTnd} pts / 1 TND</p>
              </div>
            </div>

            <Button
              variant="destructive"
              onClick={onLogout}
              className="w-full h-11 rounded-2xl text-xs font-bold gap-2 shadow-xs"
            >
              <span>End Shift / Log Out</span>
            </Button>
          </div>
        )}
      </main>

      {/* ── CASHIER BOTTOM NAV ── */}
      <CashierBottomNav
        activeTab={mobileTab}
        onSelectTab={setMobileTab}
        shiftTxCount={recentTxs.length}
      />

      {/* ── PHONE LOOKUP SHEET ── */}
      <CashierPhoneLookupSheet
        open={phoneLookupOpen}
        onOpenChange={setPhoneLookupOpen}
        onCustomerFound={handlePhoneCustomerFound}
        storeId={activeStore?.id}
        apiClient={apiClient}
      />
    </div>
  )
}
