'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { useMerchantStore } from '@/store/merchant-store'
import { strings } from '@/lib/strings'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Users, Zap, TrendingUp, Award, Plus, Coffee, ExternalLink, Check, Loader2, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'

export default function OverviewPage() {
  const { profile } = useAuth()
  const { fetchStores, activeStore, stores, createStore, setActiveStore, fetchAnalytics, analytics, loading, error } = useMerchantStore()
  const { toast } = useToast()
  
  const [isCreating, setIsCreating] = useState(false)
  const [storeName, setStoreName] = useState('')
  const [storeSlug, setStoreSlug] = useState('')

  useEffect(() => {
    fetchStores()
  }, [fetchStores])

  useEffect(() => {
    if (activeStore) {
      fetchAnalytics(activeStore.id)
    }
  }, [activeStore, fetchAnalytics])

  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!storeName.trim()) return
    try {
      const created = await createStore(storeName.trim(), storeSlug.trim() || undefined)
      toast({
        title: 'Store Created Successfully',
        description: `'${created.name}' is now ready (Link: /store/${created.slug}).`,
      })
      setIsCreating(false)
      setStoreName('')
      setStoreSlug('')
    } catch (err: any) {
      toast({
        title: 'Failed to Create Store',
        description: err.message || 'Could not create store.',
        variant: 'destructive',
      })
    }
  }

  const handleSwitchStore = (storeId: string) => {
    setActiveStore(storeId)
    const target = stores.find((s) => s.id === storeId)
    if (target) {
      toast({
        title: 'Switched Active Store',
        description: `Now managing '${target.name}'.`,
      })
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:gap-8 md:p-8 overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{strings.dashboard_overview}</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 flex flex-wrap items-center gap-1.5">
            {activeStore ? (
              <>
                <span>Managing:</span>
                <span className="font-semibold text-foreground flex items-center gap-1.5 bg-primary/10 text-primary px-2.5 py-0.5 rounded-md text-xs">
                  <Coffee className="h-3.5 w-3.5" />
                  {activeStore.name}
                </span>
                <span className="text-xs text-muted-foreground font-mono">({activeStore.slug})</span>
              </>
            ) : (
              'Welcome to your merchant dashboard'
            )}
          </p>
        </div>
        {stores.length > 0 && !isCreating && (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Button onClick={() => setIsCreating(true)} variant="default" size="sm" className="gap-2 text-xs sm:text-sm">
              <Plus className="h-4 w-4" /> Add Coffee Shop
            </Button>
          </div>
        )}
      </div>

      {/* Coffee Shop Quick Switcher Bar when multiple stores exist */}
      {stores.length > 1 && !isCreating && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 p-3 rounded-2xl border border-border/70 bg-card/60 backdrop-blur-xs shadow-2xs">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 shrink-0">
            <Coffee className="h-3.5 w-3.5 text-primary" />
            Active Shop:
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {stores.map((store) => {
              const isSelected = activeStore?.id === store.id
              return (
                <button
                  key={store.id}
                  onClick={() => handleSwitchStore(store.id)}
                  type="button"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all shrink-0 ${
                    isSelected
                      ? 'bg-primary text-primary-foreground shadow-xs font-bold'
                      : 'bg-muted/80 text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  {isSelected && <Check className="h-3.5 w-3.5 shrink-0" />}
                  <span>{store.name}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Empty State / First Store Creation */}
      {!loading && stores.length === 0 && !isCreating && (
        <Card className="border border-border/60 max-w-md mx-auto sm:mx-0 mt-2">
          <CardHeader>
            <CardTitle className="text-lg">Welcome to Fidely!</CardTitle>
            <CardDescription className="text-xs">
              To get started with your loyalty program, you need to create your first store.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => setIsCreating(true)} className="w-full sm:w-auto text-xs font-semibold">
              Create your first store
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Store Creation Form */}
      {isCreating && (
        <Card className="border border-border/60 max-w-md mx-auto sm:mx-0 mt-2">
          <CardHeader>
            <CardTitle className="text-lg">{stores.length === 0 ? 'Create First Store' : 'Create New Store'}</CardTitle>
            <CardDescription className="text-xs">
              Set up a new loyalty program for your store.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateStore} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="storeName" className="text-xs font-semibold">Store Name</Label>
                <Input
                  id="storeName"
                  value={storeName}
                  onChange={(e) => {
                    setStoreName(e.target.value)
                    const normalized = e.target.value
                      .toLowerCase()
                      .normalize('NFKD')
                      .replace(/[\u0300-\u036f]/g, '')
                      .replace(/[^a-z0-9]+/g, '-')
                      .replace(/^-+|-+$/g, '')
                    if (!storeSlug || storeSlug === normalized.slice(0, storeSlug.length)) {
                      setStoreSlug(normalized)
                    }
                  }}
                  placeholder="My Awesome Cafe"
                  className="text-xs"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="storeSlug" className="text-xs font-semibold">URL Slug</Label>
                <div className="flex items-center rounded-md border bg-muted/40 px-3 py-1 text-xs text-muted-foreground">
                  <span className="font-mono text-muted-foreground/80 select-none">fidely.app/store/</span>
                  <input
                    id="storeSlug"
                    type="text"
                    className="w-full bg-transparent p-1 text-foreground font-mono font-medium outline-none text-xs"
                    value={storeSlug}
                    onChange={(e) => setStoreSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    placeholder="my-awesome-cafe"
                  />
                </div>
                <p className="text-[11px] text-muted-foreground">Used for your public digital loyalty pass. Collisions resolve automatically.</p>
              </div>
              {error && <p className="text-xs text-destructive">{error}</p>}
              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <Button
                  type="submit"
                  disabled={loading || !storeName.trim() || !storeSlug.trim()}
                  className={`w-full sm:w-auto text-xs font-semibold ${!storeName.trim() || !storeSlug.trim() ? 'opacity-50 cursor-not-allowed bg-muted text-muted-foreground hover:bg-muted' : ''}`}
                >
                  {loading ? 'Creating...' : 'Create Store'}
                </Button>
                {stores.length > 0 && (
                  <Button type="button" variant="outline" onClick={() => setIsCreating(false)} className="w-full sm:w-auto text-xs">
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {loading && !analytics && stores.length > 0 && !isCreating && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground py-4">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          Loading analytics...
        </div>
      )}

      {analytics && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Card className="border border-border/60">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Members</CardTitle>
                <Users className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.totalMembers}</div>
                <CardDescription className="text-[11px]">Customers in program</CardDescription>
              </CardContent>
            </Card>
            
            <Card className="border border-border/60">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Points Issued</CardTitle>
                <TrendingUp className="h-4 w-4 text-emerald-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.totalPointsIssued.toLocaleString()}</div>
                <CardDescription className="text-[11px]">Lifetime points given</CardDescription>
              </CardContent>
            </Card>

            <Card className="border border-border/60">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Points Redeemed</CardTitle>
                <Award className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.totalPointsRedeemed.toLocaleString()}</div>
                <CardDescription className="text-[11px]">Points spent by customers</CardDescription>
              </CardContent>
            </Card>
            
            <Card className="border border-border/60">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Net Outstanding</CardTitle>
                <Zap className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(analytics.totalPointsIssued - analytics.totalPointsRedeemed).toLocaleString()}
                </div>
                <CardDescription className="text-[11px]">Points waiting to be used</CardDescription>
              </CardContent>
            </Card>
          </div>

          {/* Quick Action Navigation Grid for Merchant on Mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <Link
              href="/merchant/settings/store"
              className="p-4 rounded-2xl border border-border/60 bg-card hover:bg-muted/30 transition-all flex items-center justify-between group"
            >
              <div>
                <p className="font-semibold text-sm text-foreground">Customizer & Rewards</p>
                <p className="text-xs text-muted-foreground mt-0.5">Customize passes & perks</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </Link>

            <Link
              href="/merchant/crm"
              className="p-4 rounded-2xl border border-border/60 bg-card hover:bg-muted/30 transition-all flex items-center justify-between group"
            >
              <div>
                <p className="font-semibold text-sm text-foreground">Customer CRM</p>
                <p className="text-xs text-muted-foreground mt-0.5">View loyalty members</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </Link>

            <Link
              href="/merchant/staff"
              className="p-4 rounded-2xl border border-border/60 bg-card hover:bg-muted/30 transition-all flex items-center justify-between group"
            >
              <div>
                <p className="font-semibold text-sm text-foreground">Staff & Cashiers</p>
                <p className="text-xs text-muted-foreground mt-0.5">Manage POS terminal access</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </Link>
          </div>
        </>
      )}
    </div>
  )
}
