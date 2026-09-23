'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { CustomerMembership, AvailableStore } from '@/store/customer-store'
import { AppleWalletPass } from '@/components/common/apple-wallet-card'
import { FidelyLogo } from '@/components/common/fidely-logo'
import { BRAND_NAME } from '@/lib/brand'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { QRScanner } from '@/components/qr-scanner'
import { LanguageSwitcher } from '@/components/common/language-switcher'
import { ThemeToggleButton } from '@/components/common/theme-toggle-button'
import {
  Coffee,
  QrCode,
  Sparkles,
  Gift,
  History,
  Plus,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  LogOut,
  Store as StoreIcon,
  Copy,
  Check,
  Loader2,
  Ticket,
  TrendingUp,
  Search,
  Globe,
  Smartphone,
  Settings,
  User,
} from 'lucide-react'
import { format } from 'date-fns'
import { useI18n } from '@/lib/i18n'

interface CustomerDesktopViewProps {
  memberships: CustomerMembership[]
  activeMembership: CustomerMembership | null
  availableStores: AvailableStore[]
  onSelectMembership: (id: string) => void
  onRefreshQr: (id: string) => Promise<void> | void
  onJoinStore: (storeId: string) => Promise<void>
  onJoinBySlug: (slug: string) => Promise<void>
  onLogout: () => void
  isJoining: boolean
  joiningStoreId: string | null
  joinError: string | null
  userName?: string
  userEmail?: string
  userPhone?: string
  onSavePhone?: (phone: string) => Promise<void>
}

export function CustomerDesktopView({
  memberships,
  activeMembership,
  availableStores,
  onSelectMembership,
  onRefreshQr,
  onJoinStore,
  onJoinBySlug,
  onLogout,
  isJoining,
  joiningStoreId,
  joinError,
  userName,
  userEmail,
  userPhone,
  onSavePhone,
}: CustomerDesktopViewProps) {
  const { t, dir } = useI18n()

  const [joinModalOpen, setJoinModalOpen] = useState(false)
  const [activeJoinTab, setActiveJoinTab] = useState<'scan' | 'explore' | 'code'>('scan')
  const [slugInput, setSlugInput] = useState('')
  const [phoneInput, setPhoneInput] = useState(userPhone || '')
  const [isSavingPhone, setIsSavingPhone] = useState(false)

  const joinedStoreIds = React.useMemo(() => new Set(memberships.map((m) => m.storeId)), [memberships])
  const unjoinedStores = React.useMemo(
    () => availableStores.filter((s) => !joinedStoreIds.has(s.id)),
    [availableStores, joinedStoreIds]
  )

  const handlePhoneSave = async () => {
    if (!phoneInput.trim() || !onSavePhone) return
    setIsSavingPhone(true)
    try {
      await onSavePhone(phoneInput.trim())
    } finally {
      setIsSavingPhone(false)
    }
  }

  const handleSlugSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!slugInput.trim()) return
    await onJoinBySlug(slugInput.trim())
    setSlugInput('')
    setJoinModalOpen(false)
  }

  const nextReward = activeMembership?.rewards
    ? [...activeMembership.rewards]
        .filter((r) => r.active && r.pointsCost > (activeMembership.pointsBalance || 0))
        .sort((a, b) => a.pointsCost - b.pointsCost)[0]
    : null

  const reachableRewards = activeMembership?.rewards
    ? activeMembership.rewards.filter((r) => r.active && r.pointsCost <= (activeMembership.pointsBalance || 0))
    : []

  return (
    <div className="hidden md:flex flex-col min-h-screen bg-background text-foreground" dir={dir}>
      {/* ── Desktop Customer Navigation Bar (md+) ── */}
      <header className="sticky top-0 z-40 flex h-14 lg:h-16 shrink-0 items-center justify-between border-b border-border/60 bg-background/95 px-4 sm:px-8 backdrop-blur supports-[backdrop-filter]:bg-background/60 select-none">
        <div className="flex items-center gap-2 sm:gap-3">
          <Link href="/customer/overview" className="flex items-center gap-1.5 sm:gap-2.5 font-bold text-foreground group">
            <FidelyLogo size="sm" variant="subtle" className="transition-transform group-hover:scale-105" />
            <span className="text-sm sm:text-lg font-bold tracking-tight">{BRAND_NAME}</span>
          </Link>
          <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full font-medium">
            {t('nav_customer') || 'Pass'}
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageSwitcher />
          <ThemeToggleButton />

          <div className="flex items-center gap-2 border-s border-border/60 ps-3">
            <div className="flex flex-col text-start">
              <span className="text-xs font-semibold leading-tight text-foreground">
                {userName || userEmail?.split('@')[0] || 'Customer'}
              </span>
              <span className="text-[11px] text-muted-foreground leading-tight font-mono">{userEmail}</span>
            </div>

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

      {/* ── Main Content Area ── */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-6 lg:p-8 space-y-6">
        {memberships.length === 0 ? (
          /* Empty State: No Loyalty Passes Enrolled Yet */
          <div className="rounded-3xl border border-border/70 bg-card p-8 sm:p-12 text-center max-w-xl mx-auto space-y-6 shadow-xl my-auto">
            <FidelyLogo size="xl" variant="subtle" className="mx-auto" />
            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-bold tracking-tight">{t('customer_empty_cards_title') || 'No Loyalty Passes Yet'}</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {t('customer_empty_cards_desc') ||
                  'Scan an in-store counter QR stand at any partner coffee shop to add your first pass.'}
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <Button
                size="lg"
                onClick={() => {
                  setActiveJoinTab('scan')
                  setJoinModalOpen(true)
                }}
                className="w-full gap-2 rounded-2xl h-12 font-semibold shadow-md"
              >
                <QrCode className="h-5 w-5" />
                {t('customer_scan_qr_stand') || 'Scan In-Store QR Stand'}
              </Button>
            </div>

            {unjoinedStores.length > 0 && (
              <div className="space-y-3 pt-2 text-start">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t('explore_available_stores') || 'Available Stores'}
                </p>
                <div className="grid gap-2">
                  {unjoinedStores.map((store) => (
                    <div
                      key={store.id}
                      className="flex items-center justify-between p-3.5 rounded-2xl border border-border/60 bg-muted/30 hover:bg-muted/60 transition"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center font-bold overflow-hidden border border-border/40 shrink-0">
                          {store.logoUrl ? (
                            <img src={store.logoUrl} alt={store.name} className="h-full w-full object-cover" />
                          ) : (
                            <Coffee className="h-5 w-5" />
                          )}
                        </div>
                        <div className="text-start">
                          <p className="font-semibold text-sm">{store.name}</p>
                          <p className="text-xs text-muted-foreground font-mono">fidely.app/{store.slug}</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => onJoinStore(store.id)}
                        disabled={joiningStoreId === store.id}
                      >
                        {joiningStoreId === store.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          t('customer_add_coffee_card') || 'Add Pass'
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* ── Header & Action Controls ── */}
            <div className="flex items-center justify-between gap-4 text-start">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t('customer_my_cards') || 'My Loyalty Cards'}</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {t('customer_cards_desc') || 'Your enrolled digital passes and live rewards.'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => {
                    setActiveJoinTab('scan')
                    setJoinModalOpen(true)
                  }}
                  className="gap-1.5 shadow-2xs font-semibold"
                >
                  <QrCode className="h-4 w-4" />
                  {t('customer_scan_qr_stand') || 'Scan Stand'}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setActiveJoinTab('explore')
                    setJoinModalOpen(true)
                  }}
                  className="gap-1.5 shadow-2xs"
                >
                  <Plus className="h-4 w-4" />
                  {t('customer_add_coffee_card') || 'Add Card'}
                </Button>
              </div>
            </div>

            {/* ── Phone Number Setup Action Banner ── */}
            {!userPhone && (
              <div className="flex items-center justify-between gap-3 p-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 text-foreground text-start">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400">
                    <Smartphone className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold tracking-tight">{t('customer_phone_banner_title') || 'Add Phone Number'}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {t('customer_phone_banner_desc') || 'Enable cashiers to find your account by phone if you leave your device at home.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Input
                    type="tel"
                    dir="ltr"
                    placeholder="+216 55 123 456"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    className="h-8 text-xs bg-background/80 w-36 rounded-xl font-mono text-start"
                  />
                  <Button
                    size="sm"
                    onClick={handlePhoneSave}
                    disabled={isSavingPhone || !phoneInput.trim()}
                    className="h-8 px-3 text-xs font-semibold rounded-xl shrink-0"
                  >
                    {isSavingPhone ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : t('save') || 'Save'}
                  </Button>
                </div>
              </div>
            )}

            {/* ── Horizontal Coffee Passes Pills ── */}
            {memberships.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                {memberships.map((m) => {
                  const isSelected = activeMembership?.id === m.id
                  return (
                    <button
                      key={m.id}
                      onClick={() => onSelectMembership(m.id)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border transition text-sm font-medium whitespace-nowrap ${
                        isSelected
                          ? 'border-primary bg-primary/10 text-primary font-bold shadow-xs'
                          : 'border-border/60 bg-card text-muted-foreground hover:bg-muted/50'
                      }`}
                    >
                      {m.logoUrl ? (
                        <img src={m.logoUrl} alt={m.storeName} className="h-4 w-4 rounded-sm object-cover shrink-0" />
                      ) : (
                        <Coffee className="h-4 w-4 shrink-0" />
                      )}
                      <span>{m.storeName}</span>
                      <Badge variant={isSelected ? 'default' : 'secondary'} className="text-[11px] ms-1">
                        {m.pointsBalance} {t('pts') || 'pts'}
                      </Badge>
                    </button>
                  )
                })}
              </div>
            )}

            {/* ── Active Loyalty Card & QR Section (Desktop 12-col Grid) ── */}
            {activeMembership && (
              <div className="grid gap-6 lg:grid-cols-12 items-start">
                {/* Left: Authentic Apple Wallet Loyalty Pass (5 cols) */}
                <div className="lg:col-span-5 space-y-4">
                  <AppleWalletPass
                    storeName={activeMembership.storeName}
                    logoUrl={activeMembership.logoUrl}
                    primaryColor={activeMembership.primaryColor || '#D97706'}
                    pointsBalance={activeMembership.pointsBalance}
                    pointsPerTnd={activeMembership.pointsPerTnd}
                    qrCodeToken={activeMembership.qrCodeToken}
                    memberName={userName || 'Loyalty Member'}
                    memberSince={activeMembership.joinedAt ? format(new Date(activeMembership.joinedAt), 'MMM yyyy') : 'Active'}
                    rewardsCount={reachableRewards.length}
                    nextRewardName={nextReward?.name}
                    nextRewardCost={nextReward?.pointsCost}
                    showQr={true}
                    interactive={true}
                    onRefreshQr={() => onRefreshQr(activeMembership.id)}
                  />
                  <p className="text-center text-[11px] text-muted-foreground">
                    {t('customer_show_code') || 'Present this code at counter to earn or redeem points'}
                  </p>
                </div>

                {/* Right: Rewards, Vouchers, & History Tabs (7 cols) */}
                <div className="lg:col-span-7 space-y-6">
                  <Tabs defaultValue="rewards" dir={dir} className="w-full">
                    <TabsList className="grid grid-cols-3 w-full bg-muted/60 p-1 rounded-2xl">
                      <TabsTrigger value="rewards" className="rounded-xl text-xs gap-1">
                        <Gift className="h-3.5 w-3.5" /> {t('customer_bottom_nav_perks') || 'Perks'}
                      </TabsTrigger>
                      <TabsTrigger value="claimed" className="rounded-xl text-xs gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" /> {t('customer_tab_claimed') || 'Claimed'} ({activeMembership.vouchers.length})
                      </TabsTrigger>
                      <TabsTrigger value="history" className="rounded-xl text-xs gap-1">
                        <History className="h-3.5 w-3.5" /> {t('customer_history_title') || 'History'}
                      </TabsTrigger>
                    </TabsList>

                    {/* Rewards Tab */}
                    <TabsContent value="rewards" className="mt-4 space-y-3">
                      <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm text-start">
                        <h3 className="font-bold text-sm mb-1">{t('rewards_title') || 'Store Rewards'}</h3>
                        <p className="text-xs text-muted-foreground mb-4">
                          {t('rewards_subtitle') || 'Unlock free drinks and perks as you earn points.'}
                        </p>

                        {activeMembership.rewards.length === 0 ? (
                          <div className="p-6 text-center text-xs text-muted-foreground">
                            {t('customizer_no_rewards_title') || 'No rewards active yet.'}
                          </div>
                        ) : (
                          <div className="space-y-2.5">
                            {activeMembership.rewards.map((reward) => {
                              const canAfford = activeMembership.pointsBalance >= reward.pointsCost
                              return (
                                <div
                                  key={reward.id}
                                  className={`p-3.5 rounded-2xl border transition flex items-center justify-between ${
                                    canAfford
                                      ? 'border-emerald-500/30 bg-emerald-500/5'
                                      : 'border-border/60 bg-muted/20'
                                  }`}
                                >
                                  <div className="space-y-0.5 text-start">
                                    <p className="font-semibold text-sm text-foreground">{reward.name}</p>
                                    {reward.description && (
                                      <p className="text-xs text-muted-foreground">{reward.description}</p>
                                    )}
                                    <span className="inline-block text-xs font-bold text-primary font-mono">
                                      {reward.pointsCost} {t('pts') || 'pts'}
                                    </span>
                                  </div>

                                  <Badge
                                    variant={canAfford ? 'default' : 'secondary'}
                                    className={`text-[11px] ${
                                      canAfford
                                        ? 'bg-emerald-600 hover:bg-emerald-600 text-white'
                                        : 'text-muted-foreground'
                                    }`}
                                  >
                                    {canAfford
                                      ? t('customizer_reward_active') || 'Ready'
                                      : `${reward.pointsCost - activeMembership.pointsBalance} ${t('pts') || 'pts'} left`}
                                  </Badge>
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    </TabsContent>

                    {/* Claimed Rewards Tab */}
                    <TabsContent value="claimed" className="mt-4 space-y-3">
                      <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm text-start">
                        <div className="flex items-center gap-2 mb-1">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          <h3 className="font-bold text-sm">{t('rewards_claimed_title') || 'Claimed Rewards'}</h3>
                        </div>
                        <p className="text-xs text-muted-foreground mb-4">
                          {t('rewards_claimed_desc') || 'Rewards already redeemed and handed to you at the counter.'}
                        </p>

                        {activeMembership.vouchers.length === 0 ? (
                          <div className="p-8 text-center space-y-2">
                            <Gift className="h-8 w-8 text-muted-foreground/40 mx-auto" />
                            <p className="text-xs text-muted-foreground">
                              {t('rewards_no_claimed') || 'No rewards claimed yet.'}
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-2.5">
                            {activeMembership.vouchers.map((voucher) => (
                              <div
                                key={voucher.id}
                                className="p-3.5 rounded-2xl border border-border/60 bg-muted/20 flex items-center justify-between gap-3 shadow-2xs"
                              >
                                <div className="space-y-1 text-start min-w-0">
                                  <div className="flex items-center gap-2">
                                    <p className="font-semibold text-sm text-foreground truncate">{voucher.rewardName}</p>
                                    <span className="text-[11px] text-muted-foreground font-mono">
                                      ({voucher.pointsCost} {t('pts')})
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono flex-wrap">
                                    <span className="text-[11px] text-muted-foreground">
                                      {format(new Date(voucher.usedAt || voucher.issuedAt), 'MMM d, yyyy • h:mm a')}
                                    </span>
                                    <span>•</span>
                                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono font-bold text-foreground">
                                      {voucher.code}
                                    </code>
                                  </div>
                                </div>
                                <Badge
                                  variant="secondary"
                                  className="text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0 gap-1 px-2.5 py-1"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  {t('rewards_status_claimed') || 'CLAIMED'}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </TabsContent>

                    {/* History Tab */}
                    <TabsContent value="history" className="mt-4 space-y-3">
                      <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm text-start">
                        <h3 className="font-bold text-sm mb-1">{t('customer_history_title') || 'History'}</h3>
                        <p className="text-xs text-muted-foreground mb-4">
                          {t('customer_no_history') || 'Your points activity log.'}
                        </p>

                        {activeMembership.transactions.length === 0 ? (
                          <div className="p-8 text-center space-y-2">
                            <History className="h-8 w-8 text-muted-foreground/40 mx-auto" />
                            <p className="text-xs text-muted-foreground">No transactions recorded yet.</p>
                          </div>
                        ) : (
                          <div className="space-y-2.5">
                            {activeMembership.transactions.map((tItem) => {
                              const isEarn = tItem.type === 'earn'
                              return (
                                <div
                                  key={tItem.id}
                                  className="p-3 rounded-2xl border border-border/40 bg-muted/20 flex items-center justify-between"
                                >
                                  <div className="flex items-center gap-3">
                                    <div
                                      className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${
                                        isEarn
                                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                          : 'bg-primary/10 text-primary'
                                      }`}
                                    >
                                      {isEarn ? <TrendingUp className="h-4 w-4" /> : <Gift className="h-4 w-4" />}
                                    </div>
                                    <div className="text-start">
                                      <p className="font-semibold text-xs text-foreground">
                                        {isEarn ? t('pos_points_to_award') || 'Points Earned' : t('pos_redeem_reward_tab') || 'Redemption'}
                                      </p>
                                      <p className="text-[11px] text-muted-foreground">
                                        {format(new Date(tItem.createdAt), 'MMM d, yyyy h:mm a')}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="text-end">
                                    <span
                                      className={`text-xs font-bold font-mono ${
                                        isEarn ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground'
                                      }`}
                                    >
                                      {isEarn ? `+${tItem.pointsAffected}` : tItem.pointsAffected} {t('pts')}
                                    </span>
                                    {tItem.amountTnd !== null && (
                                      <p className="text-[11px] text-muted-foreground font-mono">
                                        {tItem.amountTnd.toFixed(2)} TND
                                      </p>
                                    )}
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            )}
          </>
        )}

        {/* Global Join Coffee Pass Modal */}
        <Dialog open={joinModalOpen} onOpenChange={setJoinModalOpen}>
          <DialogContent className="sm:max-w-[480px]">
            <DialogHeader className="text-start">
              <DialogTitle className="flex items-center gap-2 text-lg">
                <Coffee className="h-5 w-5 text-primary" />
                {t('customer_add_coffee_card') || 'Add Loyalty Pass'}
              </DialogTitle>
              <DialogDescription>
                Scan a counter QR stand or explore partner stores.
              </DialogDescription>
            </DialogHeader>

            <Tabs value={activeJoinTab} onValueChange={(val) => setActiveJoinTab(val as any)} dir={dir} className="w-full pt-2">
              <TabsList className="grid grid-cols-3 w-full mb-4">
                <TabsTrigger value="scan" className="text-xs gap-1">
                  <QrCode className="h-3.5 w-3.5" /> Scan Stand
                </TabsTrigger>
                <TabsTrigger value="explore" className="text-xs gap-1">
                  <Coffee className="h-3.5 w-3.5" /> {t('explore_available_stores') || 'Stores'} ({unjoinedStores.length})
                </TabsTrigger>
                <TabsTrigger value="code" className="text-xs gap-1">
                  <Globe className="h-3.5 w-3.5" /> Code / Link
                </TabsTrigger>
              </TabsList>

              <TabsContent value="scan" className="space-y-3">
                <div className="rounded-2xl overflow-hidden bg-black/90 p-1">
                  <QRScanner
                    containerId="desktop-modal-qr-scanner"
                    onScanSuccess={(txt) => {
                      onJoinBySlug(txt.trim())
                      setJoinModalOpen(false)
                    }}
                  />
                </div>
                <p className="text-[11px] text-muted-foreground text-center">
                  Point camera at the acrylic QR stand on the counter
                </p>
              </TabsContent>

              <TabsContent value="explore" className="space-y-3">
                <div className="space-y-2.5 max-h-[320px] overflow-y-auto pe-1">
                  {unjoinedStores.length === 0 ? (
                    <div className="p-8 text-center bg-muted/20 rounded-2xl border text-xs text-muted-foreground space-y-1">
                      <p className="font-semibold text-foreground">
                        {t('explore_all_joined') || 'You have joined all available partner stores!'}
                      </p>
                    </div>
                  ) : (
                    unjoinedStores.map((store) => (
                      <div
                        key={store.id}
                        className="flex items-center justify-between p-3.5 rounded-2xl border border-border/60 bg-muted/30 hover:bg-muted/50 transition"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center font-bold overflow-hidden border border-border/40 shrink-0">
                            {store.logoUrl ? (
                              <img src={store.logoUrl} alt={store.name} className="h-full w-full object-cover" />
                            ) : (
                              <Coffee className="h-5 w-5" />
                            )}
                          </div>
                          <div className="text-start">
                            <p className="font-semibold text-sm">{store.name}</p>
                            <p className="text-xs text-muted-foreground font-mono">fidely.app/{store.slug}</p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => onJoinStore(store.id)}
                          disabled={joiningStoreId === store.id}
                        >
                          {joiningStoreId === store.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            t('customer_add_coffee_card') || 'Add'
                          )}
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="code" className="space-y-3">
                <form onSubmit={handleSlugSubmit} className="space-y-3">
                  <Label htmlFor="desktop-slug-input" className="text-xs font-semibold">
                    Enter store slug or URL
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="desktop-slug-input"
                      type="text"
                      dir="ltr"
                      placeholder="artisan-cafe"
                      value={slugInput}
                      onChange={(e) => setSlugInput(e.target.value)}
                      className="h-10 text-xs font-mono"
                    />
                    <Button type="submit" size="sm" disabled={isJoining || !slugInput.trim()}>
                      {isJoining ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Join'}
                    </Button>
                  </div>
                </form>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
