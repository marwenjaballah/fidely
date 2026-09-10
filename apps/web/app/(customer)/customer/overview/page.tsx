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
} from 'lucide-react'

import { QRScanner } from '@/components/qr-scanner'
import { AppleWalletPass } from '@/components/common/apple-wallet-card'
import { format } from 'date-fns'

export default function CustomerOverviewPage() {
  const router = useRouter()
  const { toast } = useToast()
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
    joinStoreBySlug,
  } = useCustomerStore()

  const [qrModalOpen, setQrModalOpen] = useState(false)
  const [joinModalOpen, setJoinModalOpen] = useState(false)
  const [activeJoinTab, setActiveJoinTab] = useState<'scan' | 'explore' | 'code'>('scan')
  const [joiningStoreId, setJoiningStoreId] = useState<string | null>(null)
  const [copiedToken, setCopiedToken] = useState(false)
  const [slugInput, setSlugInput] = useState('')
  const [isJoiningSlug, setIsJoiningSlug] = useState(false)
  const [joinSlugError, setJoinSlugError] = useState<string | null>(null)

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
                title: 'Welcome!',
                description: `Successfully added ${joined.name}'s loyalty card to your wallet.`,
              })
            })
            .catch(() => {
              localStorage.removeItem('fidely_pending_join_store')
            })
        }
      }
    }
  }, [isAuthenticated, fetchOverview, joinStoreBySlug, toast])

  const handleLogout = async () => {
    await signOut()
    router.push('/auth/login')
  }

  const handleJoinStore = async (storeId: string) => {
    setJoiningStoreId(storeId)
    try {
      await joinStore(storeId)
      toast({
        title: 'Coffee Card Added!',
        description: 'Successfully joined the loyalty program.',
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
        title: 'Coffee Card Added!',
        description: `Successfully joined ${joined.name}'s loyalty program.`,
      })
      setSlugInput('')
      setJoinModalOpen(false)
    } catch (err: any) {
      setJoinSlugError(err.message || 'Failed to find or join store.')
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
        title: 'QR Code Scanned!',
        description: `Successfully added ${joined.name}'s loyalty pass!`,
      })
      setJoinModalOpen(false)
    } catch (err: any) {
      setJoinSlugError(err.message || 'Could not recognize store QR code.')
    } finally {
      setIsJoiningSlug(false)
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
                Scan In-Store QR Stand
              </Button>
            </div>

            {availableStores.length > 0 ? (
              <div className="space-y-3 pt-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Available Partner Cafes
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
            ) : null}

            {/* Direct Link / Code Input in Empty State */}
            <div className="pt-2 border-t border-border/40">
              <form onSubmit={handleJoinBySlug} className="space-y-3 text-left">
                <Label htmlFor="empty-store-slug-input" className="text-xs font-semibold text-foreground">
                  Or Join with Coffee Shop Link / Code
                </Label>
                <div className="flex items-center gap-2">
                  <div className="flex flex-1 items-center rounded-lg border bg-background px-3 py-1.5 text-xs text-muted-foreground focus-within:ring-1 focus-within:ring-primary shadow-2xs">
                    <span className="font-mono text-muted-foreground/80 select-none">fidely.app/store/</span>
                    <input
                      id="empty-store-slug-input"
                      type="text"
                      className="w-full bg-transparent px-1 py-0.5 text-foreground font-mono font-medium outline-none text-xs"
                      placeholder="artisan-cafe"
                      value={slugInput}
                      onChange={(e) => {
                        setSlugInput(e.target.value)
                        setJoinSlugError(null)
                      }}
                    />
                  </div>
                  <Button type="submit" size="sm" disabled={isJoiningSlug || !slugInput.trim()} className="h-9 px-4 text-xs font-medium shrink-0">
                    {isJoiningSlug ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Join Cafe'}
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">My Loyalty Cards</h1>
                <p className="text-sm text-muted-foreground">
                  Present your QR code at checkout to collect points and redeem free drinks.
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
                  Scan QR Stand
                </Button>

                <Dialog open={joinModalOpen} onOpenChange={setJoinModalOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveJoinTab('explore')}
                      className="gap-1.5 shadow-2xs"
                    >
                      <Plus className="h-4 w-4" />
                      Add Coffee Card
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[480px]">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2 text-lg">
                        <Coffee className="h-5 w-5 text-primary" />
                        Add Coffee Loyalty Card
                      </DialogTitle>
                      <DialogDescription>
                        Scan a table QR poster, browse partner cafes, or enter a store link.
                      </DialogDescription>
                    </DialogHeader>

                    <Tabs value={activeJoinTab} onValueChange={(val) => setActiveJoinTab(val as any)} className="w-full pt-2">
                      <TabsList className="grid grid-cols-3 w-full mb-4">
                        <TabsTrigger value="scan" className="text-xs gap-1">
                          <QrCode className="h-3.5 w-3.5" /> Scan QR
                        </TabsTrigger>
                        <TabsTrigger value="explore" className="text-xs gap-1">
                          <Coffee className="h-3.5 w-3.5" /> Browse {availableStores.length > 0 && `(${availableStores.length})`}
                        </TabsTrigger>
                        <TabsTrigger value="code" className="text-xs gap-1">
                          <Globe className="h-3.5 w-3.5" /> Enter Link
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
                          Point your camera at any table stand QR poster or pass link to instantly add the store.
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
                          <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
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
                                  <div>
                                    <p className="font-semibold text-sm text-foreground">{store.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {store.rewardsCount} rewards available • /{store.slug}
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
                                    'Join'
                                  )}
                                </Button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-6 rounded-2xl bg-muted/40 text-center space-y-2 border border-border/40">
                            <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto" />
                            <p className="text-sm font-semibold">You've joined all partner cafes!</p>
                            <p className="text-xs text-muted-foreground">
                              When visiting a new cafe, you can scan their in-store QR code or enter their store link in the other tabs.
                            </p>
                          </div>
                        )}
                      </TabsContent>

                      {/* Tab 3: Join by Slug / URL */}
                      <TabsContent value="code" className="space-y-4">
                        <form onSubmit={handleJoinBySlug} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="store-slug-input" className="text-xs font-medium">
                              Store Link or Identifier
                            </Label>
                            <div className="flex items-center rounded-lg border bg-background px-3 py-1.5 text-xs text-muted-foreground focus-within:ring-1 focus-within:ring-primary shadow-2xs">
                              <span className="font-mono text-muted-foreground/80 select-none">fidely.app/store/</span>
                              <input
                                id="store-slug-input"
                                type="text"
                                className="w-full bg-transparent px-1 py-0.5 text-foreground font-mono font-medium outline-none text-xs"
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
                            <p className="text-[11px] text-muted-foreground">
                              Enter the coffee shop URL handle or paste their public link.
                            </p>
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
                                Adding Coffee Card...
                              </>
                            ) : (
                              <>
                                <Plus className="h-3.5 w-3.5" />
                                Add Coffee Card
                              </>
                            )}
                          </Button>
                        </form>
                      </TabsContent>
                    </Tabs>
                  </DialogContent>
                </Dialog>
              </div>
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
                  />
                  <p className="text-center text-[11px] text-muted-foreground">
                    Tap the pass or barcode to view fullscreen brightness pass or flip for details.
                  </p>
                </div>

                {/* Right: Rewards, Vouchers, & History Tabs (7 cols) */}
                <div className="lg:col-span-7 space-y-6">
                  <Tabs defaultValue="rewards" className="w-full">
                    <TabsList className="grid grid-cols-3 w-full bg-muted/60 p-1 rounded-2xl">
                      <TabsTrigger value="rewards" className="rounded-xl text-xs gap-1">
                        <Gift className="h-3.5 w-3.5" /> Rewards
                      </TabsTrigger>
                      <TabsTrigger value="vouchers" className="rounded-xl text-xs gap-1">
                        <Ticket className="h-3.5 w-3.5" /> Vouchers ({activeMembership.vouchers.length})
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
                        <h3 className="font-bold text-sm mb-1">Redeemed Perk Receipts</h3>
                        <p className="text-xs text-muted-foreground mb-4">
                          History and voucher records of rewards redeemed at checkout.
                        </p>

                        {activeMembership.vouchers.length === 0 ? (
                          <div className="p-8 text-center space-y-2">
                            <Ticket className="h-8 w-8 text-muted-foreground/40 mx-auto" />
                            <p className="text-xs text-muted-foreground">
                              No vouchers yet. Redeem rewards with the cashier at checkout to generate voucher records.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-2.5">
                            {activeMembership.vouchers.map((voucher) => (
                              <div
                                key={voucher.id}
                                className="p-3.5 rounded-2xl border border-border/60 bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                              >
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <p className="font-semibold text-sm">{voucher.rewardName}</p>
                                    <span className="text-[11px] text-muted-foreground font-mono">
                                      ({voucher.pointsCost} pts)
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <code className="text-xs bg-muted px-2 py-0.5 rounded font-mono font-bold text-foreground">
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
                                        CLAIMED AT POS
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
