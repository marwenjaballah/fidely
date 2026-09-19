'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { QRCodeSVG } from 'qrcode.react'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { useCustomerStore } from '@/store/customer-store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ThemeToggleButton } from '@/components/common/theme-toggle-button'
import { LanguageSwitcher } from '@/components/common/language-switcher'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  Maximize2,
  Copy,
  Check,
  Loader2,
  Ticket,
  ChevronRight,
  TrendingUp,
  Search,
  Globe,
  Smartphone,
} from 'lucide-react'

import { QRScanner } from '@/components/qr-scanner'
import { AppleWalletPass } from '@/components/common/apple-wallet-card'
import { CustomerBottomNav } from '@/components/common/customer-bottom-nav'
import { FidelyLogo } from '@/components/common/fidely-logo'
import { BRAND_NAME } from '@/lib/brand'
import { useUserStore } from '@/store/user-store'
import { useI18n } from '@/lib/i18n'
import { format } from 'date-fns'

export default function CustomerOverviewPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { profile, signOut, isAuthenticated, hasHydrated, revalidateSession } = useAuth()
  const { updateProfile } = useUserStore()
  const { t, isRtl, dir } = useI18n()
  const {
    memberships,
    activeMembership,
    availableStores,
    loading,
    error,
    fetchOverview,
    setActiveMembership,
    joinStore,
    joinStoreBySlug,
    refreshQrToken,
  } = useCustomerStore()

  const [qrModalOpen, setQrModalOpen] = useState(false)
  const [joinModalOpen, setJoinModalOpen] = useState(false)
  const [activeJoinTab, setActiveJoinTab] = useState<'scan' | 'explore' | 'code'>('scan')
  const [joiningStoreId, setJoiningStoreId] = useState<string | null>(null)
  const [copiedToken, setCopiedToken] = useState(false)
  const [slugInput, setSlugInput] = useState('')
  const [isJoiningSlug, setIsJoiningSlug] = useState(false)
  const [joinSlugError, setJoinSlugError] = useState<string | null>(null)

  // Phone setup prompt state
  const [phoneInput, setPhoneInput] = useState('')
  const [isSavingPhone, setIsSavingPhone] = useState(false)
  const [mobileTab, setMobileTab] = useState<'pass' | 'rewards' | 'stores'>('pass')

  const handleSavePhone = async () => {
    if (!phoneInput.trim()) return
    setIsSavingPhone(true)
    try {
      await updateProfile({ phone: phoneInput.trim() })
      await revalidateSession()
      toast({
        title: t('customer_phone_saved_title'),
        description: t('customer_phone_saved_desc'),
      })
      setPhoneInput('')
    } catch (err: any) {
      toast({
        title: t('auth_generic_error'),
        description: err.message || t('auth_generic_error'),
        variant: 'destructive',
      })
    } finally {
      setIsSavingPhone(false)
    }
  }

  useEffect(() => {
    if (hasHydrated && !isAuthenticated) {
      router.push('/auth/login')
    }
  }, [hasHydrated, isAuthenticated, router])

  useEffect(() => {
    if (isAuthenticated) {
      fetchOverview()

      // Auto-join pending store from QR scan/referral if present in localStorage
      if (typeof window !== 'undefined') {
        const pending = localStorage.getItem('fidely_pending_join_store')
        if (pending) {
          joinStoreBySlug(pending)
            .then((joined) => {
              localStorage.removeItem('fidely_pending_join_store')
              toast({
                title: t('customer_join_success_title'),
                description: t('customer_join_success_desc', { name: joined.name }),
              })
            })
            .catch(() => {
              localStorage.removeItem('fidely_pending_join_store')
            })
        }
      }
    }
  }, [isAuthenticated, fetchOverview, joinStoreBySlug, toast, t])

  const handleLogout = async () => {
    await signOut()
    router.push('/auth/login')
  }

  const handleJoinStore = async (storeId: string) => {
    setJoiningStoreId(storeId)
    try {
      await joinStore(storeId)
      toast({
        title: t('customer_join_success_title'),
        description: t('customer_join_success_title'),
      })
      setJoinModalOpen(false)
    } catch {
      // Error handled in store
    } finally {
      setJoiningStoreId(null)
    }
  }

  const handleJoinBySlug = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!slugInput.trim()) return
    setIsJoiningSlug(true)
    setJoinSlugError(null)
    try {
      const joined = await joinStoreBySlug(slugInput.trim())
      toast({
        title: t('customer_join_success_title'),
        description: t('customer_join_success_desc', { name: joined.name }),
      })
      setSlugInput('')
      setJoinModalOpen(false)
    } catch (err: any) {
      setJoinSlugError(err.message || t('auth_generic_error'))
    } finally {
      setIsJoiningSlug(false)
    }
  }

  const handleQrScanSuccess = async (decodedText: string) => {
    if (isJoiningSlug) return
    setIsJoiningSlug(true)
    setJoinSlugError(null)
    try {
      const joined = await joinStoreBySlug(decodedText.trim())
      toast({
        title: t('customer_join_success_title'),
        description: t('customer_join_success_desc', { name: joined.name }),
      })
      setJoinModalOpen(false)
    } catch (err: any) {
      setJoinSlugError(err.message || t('scanner_invalid_qr'))
    } finally {
      setIsJoiningSlug(false)
    }
  }

  const handleCopyQrToken = (token: string) => {
    navigator.clipboard.writeText(token)
    setCopiedToken(true)
    setTimeout(() => setCopiedToken(false), 2000)
  }

  const handleRefreshQr = async (membershipId: string) => {
    try {
      await refreshQrToken(membershipId)
      toast({
        title: t('copied'),
        description: t('copied'),
      })
    } catch (err: any) {
      toast({
        title: t('auth_generic_error'),
        description: err.message || t('auth_generic_error'),
        variant: 'destructive',
      })
    }
  }

  // Calculate next reward target for active card
  const nextReward = activeMembership?.rewards
    ? [...activeMembership.rewards]
        .filter((r) => r.active && r.pointsCost > (activeMembership.pointsBalance || 0))
        .sort((a, b) => a.pointsCost - b.pointsCost)[0]
    : null

  const reachableRewards = activeMembership?.rewards
    ? activeMembership.rewards.filter((r) => r.active && r.pointsCost <= (activeMembership.pointsBalance || 0))
    : []

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* ── Top Customer Navigation Bar ── */}
      <header className="sticky top-0 z-40 flex h-11 sm:h-14 lg:h-16 shrink-0 items-center justify-between border-b border-border/60 bg-background/95 px-3 sm:px-8 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-2 sm:gap-3">
          <Link href="/" className="flex items-center gap-1.5 sm:gap-2.5 font-bold text-foreground group">
            <FidelyLogo size="sm" variant="subtle" className="transition-transform group-hover:scale-105" />
            <span className="text-sm sm:text-lg font-bold tracking-tight">{BRAND_NAME}</span>
          </Link>
          <span className="hidden sm:inline text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full font-medium">
            {t('nav_customer')}
          </span>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 sm:gap-3">
          <div className="hidden sm:block">
            <LanguageSwitcher />
          </div>
          <ThemeToggleButton />

          <div className="flex items-center gap-1 sm:gap-2 border-s border-border/60 ps-2 sm:ps-3">
            <div className="hidden md:flex flex-col text-start">
              <span className="text-xs font-semibold leading-tight text-foreground">
                {profile?.email?.split('@')[0] || 'Customer'}
              </span>
              <span className="text-[11px] text-muted-foreground leading-tight font-mono">{profile?.email}</span>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-muted-foreground hover:text-destructive gap-1 h-7 sm:h-9 px-1.5 sm:px-2"
            >
              <LogOut className="h-3.5 w-3.5 sm:h-4 sm:w-4 rtl:rotate-180" />
              <span className="hidden sm:inline text-xs">{t('logout')}</span>
            </Button>
          </div>
        </div>
      </header>

      {/* ── Main Content Area ── */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {loading && memberships.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">{t('loading')}</p>
          </div>
        ) : memberships.length === 0 ? (
          /* ── Empty State: No Loyalty Passes Enrolled Yet ── */
          <div className="rounded-3xl border border-border/70 bg-card p-8 sm:p-12 text-center max-w-xl mx-auto space-y-6 shadow-xl">
            <FidelyLogo size="xl" variant="subtle" className="mx-auto" />
            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-bold tracking-tight">{t('customer_empty_cards_title')}</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {t('customer_empty_cards_desc')}
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
                {t('customer_scan_qr_stand')}
              </Button>
            </div>

            {availableStores.length > 0 ? (
              <div className="space-y-3 pt-2 text-start">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t('store_switcher_my_stores')}
                </p>
                <div className="grid gap-2">
                  {availableStores.map((store) => (
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
                          <p className="text-xs text-muted-foreground font-mono">
                            fidely.app/{store.slug}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleJoinStore(store.id)}
                        disabled={joiningStoreId === store.id}
                      >
                        {joiningStoreId === store.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          t('customer_add_coffee_card')
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Direct Link / Code Input in Empty State */}
            <div className="pt-2 border-t border-border/40 text-start">
              <form onSubmit={handleJoinBySlug} className="space-y-3">
                <Label htmlFor="empty-store-slug-input" className="text-xs font-semibold text-foreground">
                  {t('customer_join_by_slug_label')}
                </Label>
                <div className="flex items-center gap-2">
                  <div className="flex flex-1 items-center rounded-lg border bg-background px-3 py-1.5 text-xs text-muted-foreground focus-within:ring-1 focus-within:ring-primary shadow-2xs">
                    <span className="font-mono text-muted-foreground/80 select-none" dir="ltr">fidely.app/store/</span>
                    <input
                      id="empty-store-slug-input"
                      type="text"
                      dir="ltr"
                      className="w-full bg-transparent px-1 py-0.5 text-foreground font-mono font-medium outline-none text-xs text-start"
                      placeholder="artisan-cafe"
                      value={slugInput}
                      onChange={(e) => {
                        setSlugInput(e.target.value)
                        setJoinSlugError(null)
                      }}
                    />
                  </div>
                  <Button type="submit" size="sm" disabled={isJoiningSlug || !slugInput.trim()} className="h-9 px-4 text-xs font-medium shrink-0">
                    {isJoiningSlug ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : t('customer_join_slug_btn')}
                  </Button>
                </div>
                {joinSlugError && (
                  <p className="text-xs font-medium text-destructive bg-destructive/10 p-2.5 rounded-lg border border-destructive/20">
                    {joinSlugError}
                  </p>
                )}
              </form>
            </div>
          </div>
        ) : (
          <>
            {/* ── Store Switcher / Loyalty Cards Carousel Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-start">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t('customer_my_cards')}</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {t('customer_cards_desc')}
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
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
                  {t('customer_scan_qr_stand')}
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
                  {t('customer_add_coffee_card')}
                </Button>
              </div>
            </div>

            {/* ── Phone Number Setup Action Banner ── */}
            {!profile?.phone && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 text-foreground text-start">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400">
                    <Smartphone className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold tracking-tight">{t('customer_phone_banner_title')}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {t('customer_phone_banner_desc')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Input
                    type="tel"
                    dir="ltr"
                    placeholder="+216 55 123 456"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    className="h-8 text-xs bg-background/80 w-full sm:w-36 rounded-xl font-mono text-start"
                  />
                  <Button
                    size="sm"
                    onClick={handleSavePhone}
                    disabled={isSavingPhone || !phoneInput.trim()}
                    className="h-8 px-3 text-xs font-semibold rounded-xl shrink-0"
                  >
                    {isSavingPhone ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : t('save')}
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
                      onClick={() => setActiveMembership(m.id)}
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
                        {m.pointsBalance} {t('pts')}
                      </Badge>
                    </button>
                  )
                })}
              </div>
            )}

            {/* ── Active Loyalty Card & QR Section ── */}
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
                    memberName={profile?.full_name || 'Loyalty Member'}
                    memberSince={activeMembership.joinedAt ? format(new Date(activeMembership.joinedAt), 'MMM yyyy') : 'Active'}
                    rewardsCount={reachableRewards.length}
                    nextRewardName={nextReward?.name}
                    nextRewardCost={nextReward?.pointsCost}
                    showQr={true}
                    interactive={true}
                    onRefreshQr={() => handleRefreshQr(activeMembership.id)}
                  />
                  <p className="text-center text-[11px] text-muted-foreground">
                    {t('customer_show_code')}
                  </p>
                </div>

                {/* Right: Rewards, Vouchers, & History Tabs (7 cols) */}
                <div className="lg:col-span-7 space-y-6">
                  <Tabs id="rewards-tabs-section" defaultValue="rewards" dir={dir} className="w-full scroll-mt-20">
                    <TabsList className="grid grid-cols-3 w-full bg-muted/60 p-1 rounded-2xl">
                      <TabsTrigger value="rewards" className="rounded-xl text-xs gap-1">
                        <Gift className="h-3.5 w-3.5" /> {t('customer_bottom_nav_perks')}
                      </TabsTrigger>
                      <TabsTrigger value="vouchers" className="rounded-xl text-xs gap-1">
                        <Ticket className="h-3.5 w-3.5" /> {t('customer_tab_rewards')} ({activeMembership.vouchers.length})
                      </TabsTrigger>
                      <TabsTrigger value="history" className="rounded-xl text-xs gap-1">
                        <History className="h-3.5 w-3.5" /> {t('customer_history_title')}
                      </TabsTrigger>
                    </TabsList>

                    {/* Rewards Tab */}
                    <TabsContent value="rewards" className="mt-4 space-y-3">
                      <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm text-start">
                        <h3 className="font-bold text-sm mb-1">{t('rewards_title')}</h3>
                        <p className="text-xs text-muted-foreground mb-4">
                          {t('rewards_subtitle')}
                        </p>

                        {activeMembership.rewards.length === 0 ? (
                          <div className="p-6 text-center text-xs text-muted-foreground">
                            {t('customizer_no_rewards_title')}
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
                                    <span className="inline-block text-xs font-bold text-primary">
                                      {reward.pointsCost} {t('pts')}
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
                                    {canAfford ? t('customizer_reward_active') : `${reward.pointsCost - activeMembership.pointsBalance} ${t('pts')} left`}
                                  </Badge>
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    </TabsContent>

                    {/* Vouchers Tab */}
                    <TabsContent value="vouchers" className="mt-4 space-y-3">
                      <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm text-start">
                        <h3 className="font-bold text-sm mb-1">{t('rewards_voucher_code')}</h3>
                        <p className="text-xs text-muted-foreground mb-4">
                          {t('rewards_voucher_instruction')}
                        </p>

                        {activeMembership.vouchers.length === 0 ? (
                          <div className="p-8 text-center space-y-2">
                            <Ticket className="h-8 w-8 text-muted-foreground/40 mx-auto" />
                            <p className="text-xs text-muted-foreground">
                              {t('rewards_voucher_instruction')}
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-2.5">
                            {activeMembership.vouchers.map((voucher) => (
                              <div
                                key={voucher.id}
                                className="p-3.5 rounded-2xl border border-border/60 bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                              >
                                <div className="space-y-1 text-start">
                                  <div className="flex items-center gap-2">
                                    <p className="font-semibold text-sm">{voucher.rewardName}</p>
                                    <span className="text-[11px] text-muted-foreground font-mono">
                                      ({voucher.pointsCost} {t('pts')})
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <code className="text-xs bg-muted px-2 py-0.5 rounded font-mono font-bold text-foreground" dir="ltr">
                                      {voucher.code}
                                    </code>
                                    <span className="text-[11px] text-muted-foreground">
                                      {voucher.usedAt
                                        ? `Claimed on ${format(new Date(voucher.usedAt), 'MMM d, yyyy')}`
                                        : `Issued on ${format(new Date(voucher.issuedAt), 'MMM d, yyyy')}`}
                                    </span>
                                  </div>
                                </div>
                                <div className="self-start sm:self-auto">
                                  <Badge
                                    variant={voucher.status === 'used' ? 'secondary' : 'default'}
                                    className={`text-[11px] flex items-center gap-1 font-semibold ${
                                      voucher.status === 'used'
                                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                        : 'bg-primary text-primary-foreground'
                                    }`}
                                  >
                                    {voucher.status === 'used' ? (
                                      <>
                                        <CheckCircle2 className="w-3 h-3" />
                                        CLAIMED
                                      </>
                                    ) : (
                                      'ACTIVE'
                                    )}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </TabsContent>

                    {/* History Tab */}
                    <TabsContent value="history" className="mt-4 space-y-3">
                      <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm text-start">
                        <h3 className="font-bold text-sm mb-1">{t('customer_history_title')}</h3>
                        <p className="text-xs text-muted-foreground mb-4">
                          {t('customer_no_history')}
                        </p>

                        {activeMembership.transactions.length === 0 ? (
                          <div className="p-8 text-center space-y-2">
                            <History className="h-8 w-8 text-muted-foreground/40 mx-auto" />
                            <p className="text-xs text-muted-foreground">
                              {t('customer_no_history')}
                            </p>
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
                                      {isEarn ? (
                                        <TrendingUp className="h-4 w-4" />
                                      ) : (
                                        <Gift className="h-4 w-4" />
                                      )}
                                    </div>
                                    <div className="text-start">
                                      <p className="font-semibold text-xs text-foreground">
                                        {isEarn ? t('pos_points_to_award') : t('pos_redeem_reward_tab')}
                                      </p>
                                      <p className="text-[11px] text-muted-foreground">
                                        {new Date(tItem.createdAt).toLocaleDateString(undefined, {
                                          month: 'short',
                                          day: 'numeric',
                                          hour: '2-digit',
                                          minute: '2-digit',
                                        })}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="text-end">
                                    <span
                                      className={`text-xs font-bold ${
                                        isEarn
                                          ? 'text-emerald-600 dark:text-emerald-400'
                                          : 'text-foreground'
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

        {/* ── Global Join Coffee Pass Modal (Accessible from both Empty State & Card Views) ── */}
        <Dialog open={joinModalOpen} onOpenChange={setJoinModalOpen}>
          <DialogContent className="sm:max-w-[480px]">
            <DialogHeader className="text-start">
              <DialogTitle className="flex items-center gap-2 text-lg">
                <Coffee className="h-5 w-5 text-primary" />
                {t('customer_add_coffee_card')}
              </DialogTitle>
              <DialogDescription>
                {t('customer_cards_desc')}
              </DialogDescription>
            </DialogHeader>

            <Tabs value={activeJoinTab} onValueChange={(val) => setActiveJoinTab(val as any)} dir={dir} className="w-full pt-2">
              <TabsList className="grid grid-cols-3 w-full mb-4">
                <TabsTrigger value="scan" className="text-xs gap-1">
                  <QrCode className="h-3.5 w-3.5" /> {t('scanner_title')}
                </TabsTrigger>
                <TabsTrigger value="explore" className="text-xs gap-1">
                  <Coffee className="h-3.5 w-3.5" /> {t('customer_bottom_nav_stores')} {availableStores.length > 0 && `(${availableStores.length})`}
                </TabsTrigger>
                <TabsTrigger value="code" className="text-xs gap-1">
                  <Globe className="h-3.5 w-3.5" /> {t('customer_join_by_slug_label')}
                </TabsTrigger>
              </TabsList>

              {/* Tab 1: Live Optical Camera QR Scanner */}
              <TabsContent value="scan" className="space-y-3">
                <div className="rounded-2xl overflow-hidden bg-black/90 p-1">
                  <QRScanner
                    containerId="customer-modal-qr-scanner"
                    onScanSuccess={handleQrScanSuccess}
                  />
                </div>
                <p className="text-[11px] text-muted-foreground text-center">
                  {t('scanner_instruction')}
                </p>
                {joinSlugError && (
                  <p className="text-xs font-medium text-destructive bg-destructive/10 p-2.5 rounded-lg border border-destructive/20 text-center">
                    {joinSlugError}
                  </p>
                )}
              </TabsContent>

              {/* Tab 2: Available partner stores */}
              <TabsContent value="explore" className="space-y-3">
                {availableStores.length > 0 ? (
                  <div className="space-y-2.5 max-h-[320px] overflow-y-auto pe-1">
                    {availableStores.map((store) => (
                      <div
                        key={store.id}
                        className="flex items-center justify-between p-3.5 rounded-2xl border border-border/60 bg-muted/30 hover:bg-muted/50 transition"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold overflow-hidden border border-border/40 shrink-0">
                            {store.logoUrl ? (
                              <img src={store.logoUrl} alt={store.name} className="h-full w-full object-cover" />
                            ) : (
                              <Coffee className="h-5 w-5" />
                            )}
                          </div>
                          <div className="text-start">
                            <p className="font-semibold text-sm text-foreground">{store.name}</p>
                            <p className="text-xs text-muted-foreground font-mono">
                              fidely.app/{store.slug}
                            </p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleJoinStore(store.id)}
                          disabled={joiningStoreId === store.id}
                          className="h-8 text-xs font-semibold px-3"
                        >
                          {joiningStoreId === store.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            t('customer_join_slug_btn')
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 rounded-2xl bg-muted/40 text-center space-y-2 border border-border/40">
                    <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto" />
                    <p className="text-sm font-semibold">{t('customer_empty_cards_title')}</p>
                    <p className="text-xs text-muted-foreground">
                      {t('customer_empty_cards_desc')}
                    </p>
                  </div>
                )}
              </TabsContent>

              {/* Tab 3: Join by Slug / URL */}
              <TabsContent value="code" className="space-y-4 text-start">
                <form onSubmit={handleJoinBySlug} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="store-slug-input" className="text-xs font-medium">
                      {t('customer_join_by_slug_label')}
                    </Label>
                    <div className="flex items-center rounded-lg border bg-background px-3 py-1.5 text-xs text-muted-foreground focus-within:ring-1 focus-within:ring-primary shadow-2xs">
                      <span className="font-mono text-muted-foreground/80 select-none" dir="ltr">fidely.app/store/</span>
                      <input
                        id="store-slug-input"
                        type="text"
                        dir="ltr"
                        className="w-full bg-transparent px-1 py-0.5 text-foreground font-mono font-medium outline-none text-xs text-start"
                        placeholder="artisan-cafe"
                        value={slugInput}
                        onChange={(e) => {
                          setSlugInput(e.target.value)
                          setJoinSlugError(null)
                        }}
                        autoFocus
                        required
                      />
                    </div>
                  </div>

                  {joinSlugError && (
                    <p className="text-xs font-medium text-destructive bg-destructive/10 p-2.5 rounded-lg border border-destructive/20">
                      {joinSlugError}
                    </p>
                  )}

                  <Button type="submit" disabled={isJoiningSlug || !slugInput.trim()} className="w-full gap-2 text-xs">
                    {isJoiningSlug ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        {t('loading')}
                      </>
                    ) : (
                      <>
                        <Plus className="h-3.5 w-3.5" />
                        {t('customer_join_slug_btn')}
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>

        {/* ── Mobile-First Bottom Navigation Bar ── */}
        <CustomerBottomNav
          activeTab={mobileTab}
          onSelectTab={(tab) => {
            setMobileTab(tab)
            if (tab === 'pass') {
              window.scrollTo({ top: 0, behavior: 'smooth' })
            } else if (tab === 'rewards') {
              const el = document.getElementById('rewards-tabs-section')
              if (el) el.scrollIntoView({ behavior: 'smooth' })
            } else if (tab === 'stores') {
              setActiveJoinTab('explore')
              setJoinModalOpen(true)
            }
          }}
          onOpenQrPass={() => {
            setActiveJoinTab('scan')
            setJoinModalOpen(true)
          }}
          unlockedRewardsCount={reachableRewards.length}
        />
      </main>
    </div>
  )
}

