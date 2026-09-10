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
} from 'lucide-react'

export default function CustomerOverviewPage() {
  const router = useRouter()
  const { profile, signOut, isAuthenticated, hasHydrated } = useAuth()
  const {
    memberships,
    activeMembership,
    availableStores,
    loading,
    error,
    fetchOverview,
    setActiveMembership,
    joinStore,
  } = useCustomerStore()

  const [qrModalOpen, setQrModalOpen] = useState(false)
  const [joinModalOpen, setJoinModalOpen] = useState(false)
  const [joiningStoreId, setJoiningStoreId] = useState<string | null>(null)
  const [copiedToken, setCopiedToken] = useState(false)

  useEffect(() => {
    if (hasHydrated && !isAuthenticated) {
      router.push('/auth/login')
    }
  }, [hasHydrated, isAuthenticated, router])

  useEffect(() => {
    if (isAuthenticated) {
      fetchOverview()
    }
  }, [isAuthenticated, fetchOverview])

  const handleLogout = async () => {
    await signOut()
    router.push('/auth/login')
  }

  const handleJoinStore = async (storeId: string) => {
    setJoiningStoreId(storeId)
    try {
      await joinStore(storeId)
      setJoinModalOpen(false)
    } catch {
      // Error handled in store
    } finally {
      setJoiningStoreId(null)
    }
  }

  const handleCopyQrToken = (token: string) => {
    navigator.clipboard.writeText(token)
    setCopiedToken(true)
    setTimeout(() => setCopiedToken(false), 2000)
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
      <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between border-b border-border/60 bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 sm:px-8">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 font-bold text-foreground">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Coffee className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold tracking-tight">Fidely</span>
          </Link>
          <span className="hidden sm:inline text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full font-medium">
            Customer Pass
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggleButton />

          <div className="flex items-center gap-2 border-l border-border/60 pl-3">
            <div className="hidden md:flex flex-col text-right">
              <span className="text-xs font-semibold leading-tight text-foreground">
                {profile?.email?.split('@')[0] || 'Customer'}
              </span>
              <span className="text-[11px] text-muted-foreground leading-tight">{profile?.email}</span>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-muted-foreground hover:text-destructive gap-1.5"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline text-xs">Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      {/* ── Main Content Area ── */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {loading && memberships.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading your loyalty passes...</p>
          </div>
        ) : memberships.length === 0 ? (
          /* ── Empty State: No Loyalty Passes Enrolled Yet ── */
          <div className="rounded-3xl border border-border/70 bg-card p-8 sm:p-12 text-center max-w-xl mx-auto space-y-6 shadow-xl">
            <div className="h-20 w-20 rounded-3xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
              <Sparkles className="h-10 w-10" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight">Welcome to Fidely Loyalty!</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                You don't have any active coffee loyalty cards yet. Join a coffee shop below to start earning points with every cup!
              </p>
            </div>

            {availableStores.length > 0 ? (
              <div className="space-y-3 pt-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Available Coffee Shops
                </p>
                <div className="grid gap-2 text-left">
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
                        <div>
                          <p className="font-semibold text-sm">{store.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {store.pointsPerTnd * 10} pts per 10 TND spent
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
                          'Add Card'
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-muted/40 text-xs text-muted-foreground">
                No stores currently registered. Ask your barista to scan your account code to link automatically.
              </div>
            )}
          </div>
        ) : (
          <>
            {/* ── Store Switcher / Loyalty Cards Carousel Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">My Loyalty Cards</h1>
                <p className="text-sm text-muted-foreground">
                  Present your QR code at checkout to collect points and redeem free drinks.
                </p>
              </div>

              {availableStores.length > 0 && (
                <Dialog open={joinModalOpen} onOpenChange={setJoinModalOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-1.5 self-start sm:self-auto">
                      <Plus className="h-4 w-4" />
                      Add Coffee Card
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Join a Coffee Shop</DialogTitle>
                      <DialogDescription>
                        Select a partner cafe to start collecting loyalty points.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3 pt-2">
                      {availableStores.map((store) => (
                        <div
                          key={store.id}
                          className="flex items-center justify-between p-3.5 rounded-2xl border border-border/60 bg-muted/30"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold overflow-hidden border border-border/40 shrink-0">
                              {store.logoUrl ? (
                                <img src={store.logoUrl} alt={store.name} className="h-full w-full object-cover" />
                              ) : (
                                <Coffee className="h-5 w-5" />
                              )}
                            </div>
                            <div>
                              <p className="font-semibold text-sm">{store.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {store.rewardsCount} rewards available
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
                              'Join'
                            )}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>

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
                      <Badge variant={isSelected ? 'default' : 'secondary'} className="text-[11px] ml-1">
                        {m.pointsBalance} pts
                      </Badge>
                    </button>
                  )
                })}
              </div>
            )}

            {/* ── Active Loyalty Card & QR Section ── */}
            {activeMembership && (
              <div className="grid gap-6 lg:grid-cols-12">
                {/* Left: Digital Pass Graphic + QR Presentation (7 cols) */}
                <div className="lg:col-span-7 space-y-6">
                  {/* Digital Pass Card */}
                  <div className="rounded-3xl border border-border/70 bg-card p-6 sm:p-8 shadow-xl relative overflow-hidden flex flex-col justify-between">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-border/40 pb-4 mb-6">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary font-bold overflow-hidden border border-border/40 shrink-0">
                          {activeMembership.logoUrl ? (
                            <img src={activeMembership.logoUrl} alt={activeMembership.storeName} className="h-full w-full object-cover" />
                          ) : (
                            <Coffee className="h-6 w-6" />
                          )}
                        </div>
                        <div>
                          <h2 className="font-bold text-lg text-foreground leading-tight">
                            {activeMembership.storeName}
                          </h2>
                          <p className="text-xs text-muted-foreground">Digital Coffee Card</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-xs">
                        Active Member
                      </Badge>
                    </div>

                    {/* Points Hero Banner */}
                    <div
                      className="rounded-2xl text-white p-6 sm:p-8 shadow-lg relative overflow-hidden mb-6"
                      style={{
                        backgroundColor: activeMembership.primaryColor || '#D97706',
                        backgroundImage: 'radial-gradient(circle at top right, rgba(255,255,255,0.22), transparent 70%)',
                      }}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wider text-white/80">
                            Points Balance
                          </p>
                          <p className="text-4xl sm:text-5xl font-black mt-1 tracking-tight text-white">
                            {activeMembership.pointsBalance.toLocaleString()}{' '}
                            <span className="text-lg font-medium opacity-80">pts</span>
                          </p>
                        </div>
                        <div className="h-12 w-12 rounded-2xl bg-white/15 flex items-center justify-center backdrop-blur-xs">
                          <Sparkles className="h-6 w-6 text-white" />
                        </div>
                      </div>

                      {/* Next Reward Progress */}
                      {nextReward ? (
                        <div className="mt-6 pt-4 border-t border-white/20 space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-medium">Next: {nextReward.name}</span>
                            <span className="font-bold">
                              {nextReward.pointsCost - activeMembership.pointsBalance} pts away
                            </span>
                          </div>
                          <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-white h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${Math.min(
                                  100,
                                  Math.round((activeMembership.pointsBalance / nextReward.pointsCost) * 100)
                                )}%`,
                              }}
                            />
                          </div>
                        </div>
                      ) : reachableRewards.length > 0 ? (
                        <div className="mt-6 pt-4 border-t border-white/20 flex items-center justify-between text-xs">
                          <span className="font-medium">
                            🎉 You have {reachableRewards.length} reward{reachableRewards.length > 1 ? 's' : ''} ready to redeem!
                          </span>
                        </div>
                      ) : null}
                    </div>

                    {/* QR Code Presentation Box */}
                    <div className="flex flex-col items-center justify-center text-center p-6 bg-muted/40 rounded-2xl border border-border/40 space-y-4">
                      <div className="p-4 bg-white rounded-2xl shadow-md border border-slate-200">
                        <QRCodeSVG
                          value={activeMembership.qrCodeToken}
                          size={180}
                          level="Q"
                          includeMargin={false}
                        />
                      </div>

                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-foreground">Scan at checkout</p>
                        <p className="text-xs text-muted-foreground">
                          Hold your screen in front of the barista camera to collect points
                        </p>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <Dialog open={qrModalOpen} onOpenChange={setQrModalOpen}>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8">
                              <Maximize2 className="h-3.5 w-3.5" /> Fullscreen QR
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-md text-center">
                            <DialogHeader>
                              <DialogTitle className="text-center">{activeMembership.storeName}</DialogTitle>
                              <DialogDescription className="text-center">
                                Maximum brightness pass for barista scanner
                              </DialogDescription>
                            </DialogHeader>
                            <div className="flex flex-col items-center justify-center py-6">
                              <div className="p-6 bg-white rounded-3xl shadow-xl border">
                                <QRCodeSVG
                                  value={activeMembership.qrCodeToken}
                                  size={260}
                                  level="Q"
                                  includeMargin={true}
                                />
                              </div>
                              <p className="text-xs text-muted-foreground mt-4 font-medium">
                                Token: {activeMembership.qrCodeToken}
                              </p>
                            </div>
                          </DialogContent>
                        </Dialog>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyQrToken(activeMembership.qrCodeToken)}
                          className="gap-1.5 text-xs h-8 text-muted-foreground"
                        >
                          {copiedToken ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                          {copiedToken ? 'Copied' : 'Copy ID'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Rewards, Vouchers, & History Tabs (5 cols) */}
                <div className="lg:col-span-5 space-y-6">
                  <Tabs defaultValue="rewards" className="w-full">
                    <TabsList className="grid grid-cols-3 w-full bg-muted/60 p-1 rounded-2xl">
                      <TabsTrigger value="rewards" className="rounded-xl text-xs gap-1">
                        <Gift className="h-3.5 w-3.5" /> Rewards
                      </TabsTrigger>
                      <TabsTrigger value="vouchers" className="rounded-xl text-xs gap-1">
                        <Ticket className="h-3.5 w-3.5" /> Vouchers ({activeMembership.vouchers.filter((v) => v.status === 'active').length})
                      </TabsTrigger>
                      <TabsTrigger value="history" className="rounded-xl text-xs gap-1">
                        <History className="h-3.5 w-3.5" /> History
                      </TabsTrigger>
                    </TabsList>

                    {/* Rewards Tab */}
                    <TabsContent value="rewards" className="mt-4 space-y-3">
                      <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm">
                        <h3 className="font-bold text-sm mb-1">Available Rewards</h3>
                        <p className="text-xs text-muted-foreground mb-4">
                          Redeem your points directly at the counter.
                        </p>

                        {activeMembership.rewards.length === 0 ? (
                          <div className="p-6 text-center text-xs text-muted-foreground">
                            No active rewards listed for this store.
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
                                  <div className="space-y-0.5">
                                    <p className="font-semibold text-sm text-foreground">{reward.name}</p>
                                    {reward.description && (
                                      <p className="text-xs text-muted-foreground">{reward.description}</p>
                                    )}
                                    <span className="inline-block text-xs font-bold text-primary">
                                      {reward.pointsCost} pts
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
                                    {canAfford ? 'Available' : `${reward.pointsCost - activeMembership.pointsBalance} pts left`}
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
                      <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm">
                        <h3 className="font-bold text-sm mb-1">My Redeemed Vouchers</h3>
                        <p className="text-xs text-muted-foreground mb-4">
                          Show active voucher codes to your barista when collecting items.
                        </p>

                        {activeMembership.vouchers.length === 0 ? (
                          <div className="p-8 text-center space-y-2">
                            <Ticket className="h-8 w-8 text-muted-foreground/40 mx-auto" />
                            <p className="text-xs text-muted-foreground">
                              No vouchers yet. Redeem rewards with the cashier to generate vouchers.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-2.5">
                            {activeMembership.vouchers.map((voucher) => (
                              <div
                                key={voucher.id}
                                className="p-3.5 rounded-2xl border border-border/60 bg-muted/20 flex items-center justify-between"
                              >
                                <div className="space-y-1">
                                  <p className="font-semibold text-sm">{voucher.rewardName}</p>
                                  <code className="text-xs bg-muted px-2 py-0.5 rounded font-mono font-bold text-foreground">
                                    {voucher.code}
                                  </code>
                                </div>
                                <Badge
                                  variant={voucher.status === 'active' ? 'default' : 'outline'}
                                  className={
                                    voucher.status === 'active'
                                      ? 'bg-emerald-600 text-white text-[11px]'
                                      : 'text-muted-foreground text-[11px]'
                                  }
                                >
                                  {voucher.status.toUpperCase()}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </TabsContent>

                    {/* History Tab */}
                    <TabsContent value="history" className="mt-4 space-y-3">
                      <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm">
                        <h3 className="font-bold text-sm mb-1">Recent Activity</h3>
                        <p className="text-xs text-muted-foreground mb-4">
                          Points earned and rewards redeemed at {activeMembership.storeName}.
                        </p>

                        {activeMembership.transactions.length === 0 ? (
                          <div className="p-8 text-center space-y-2">
                            <History className="h-8 w-8 text-muted-foreground/40 mx-auto" />
                            <p className="text-xs text-muted-foreground">
                              No recent transactions yet. Make your first purchase to earn points!
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-2.5">
                            {activeMembership.transactions.map((t) => {
                              const isEarn = t.type === 'earn'
                              return (
                                <div
                                  key={t.id}
                                  className="p-3 rounded-2xl border border-border/40 bg-muted/20 flex items-center justify-between"
                                >
                                  <div className="flex items-center gap-3">
                                    <div
                                      className={`h-9 w-9 rounded-xl flex items-center justify-center ${
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
                                    <div>
                                      <p className="font-semibold text-xs text-foreground">
                                        {isEarn ? 'Order Points Earned' : 'Reward Redeemed'}
                                      </p>
                                      <p className="text-[11px] text-muted-foreground">
                                        {new Date(t.createdAt).toLocaleDateString(undefined, {
                                          month: 'short',
                                          day: 'numeric',
                                          hour: '2-digit',
                                          minute: '2-digit',
                                        })}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="text-right">
                                    <span
                                      className={`text-xs font-bold ${
                                        isEarn
                                          ? 'text-emerald-600 dark:text-emerald-400'
                                          : 'text-foreground'
                                      }`}
                                    >
                                      {isEarn ? `+${t.pointsAffected}` : t.pointsAffected} pts
                                    </span>
                                    {t.amountTnd !== null && (
                                      <p className="text-[11px] text-muted-foreground">
                                        {t.amountTnd.toFixed(2)} TND
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
      </main>
    </div>
  )
}
