'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { useMerchantStore } from '@/store/merchant-store'
import { strings } from '@/lib/strings'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Users, Zap, TrendingUp, Award, Plus, Coffee, ExternalLink, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CreateStoreDialog } from '@/components/common/create-store-dialog'

export default function OverviewPage() {
  const { profile } = useAuth()
  const { fetchStores, activeStore, stores, createStore, setActiveStore, fetchAnalytics, analytics, loading, error } = useMerchantStore()
  
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
    try {
      await createStore(storeName, storeSlug)
      setIsCreating(false)
      setStoreName('')
      setStoreSlug('')
    } catch (err) {
      // Error handled in store
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:gap-8 md:p-8 overflow-auto">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{strings.dashboard_overview}</h1>
          <p className="text-muted-foreground mt-1 flex items-center gap-2">
            {activeStore ? (
              <>
                <span>Managing:</span>
                <span className="font-semibold text-foreground flex items-center gap-1.5 bg-primary/10 text-primary px-2.5 py-0.5 rounded-md text-sm">
                  <Coffee className="h-3.5 w-3.5" />
                  {activeStore.name}
                </span>
                <span className="text-xs text-muted-foreground">({activeStore.slug})</span>
              </>
            ) : (
              'Welcome to your merchant dashboard'
            )}
          </p>
        </div>
        {stores.length > 0 && !isCreating && (
          <div className="flex items-center gap-2">
            <Button onClick={() => setIsCreating(true)} variant="default" className="gap-2">
              <Plus className="h-4 w-4" /> Add Coffee Shop
            </Button>
          </div>
        )}
      </div>

      {/* Coffee Shop Quick Switcher Bar when multiple stores exist */}
      {stores.length > 1 && !isCreating && (
        <div className="flex flex-wrap items-center gap-2 p-3 rounded-xl border border-border/70 bg-card/60 backdrop-blur-xs shadow-xs">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mr-1 flex items-center gap-1.5">
            <Coffee className="h-3.5 w-3.5 text-primary" />
            Switch Coffee Shop:
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            {stores.map((store) => {
              const isSelected = activeStore?.id === store.id
              return (
                <button
                  key={store.id}
                  onClick={() => setActiveStore(store.id)}
                  type="button"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-primary text-primary-foreground shadow-xs'
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

      {!loading && stores.length === 0 && !isCreating && (
        <Card className="border border-border/60 max-w-md mt-4">
          <CardHeader>
            <CardTitle>Welcome to Fidely!</CardTitle>
            <CardDescription>
              To get started with your loyalty program, you need to create your first store.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => setIsCreating(true)}>
              Create your first store
            </Button>
          </CardFooter>
        </Card>
      )}

      {isCreating && (
        <Card className="border border-border/60 max-w-md mt-4">
          <CardHeader>
            <CardTitle>{stores.length === 0 ? 'Create First Store' : 'Create New Store'}</CardTitle>
            <CardDescription>
              Set up a new loyalty program for your store.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateStore} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="storeName">Store Name</Label>
                <Input
                  id="storeName"
                  value={storeName}
                  onChange={(e) => {
                    setStoreName(e.target.value)
                    if (!storeSlug) {
                      setStoreSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'))
                    }
                  }}
                  placeholder="My Awesome Cafe"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="storeSlug">URL Slug</Label>
                <Input
                  id="storeSlug"
                  value={storeSlug}
                  onChange={(e) => setStoreSlug(e.target.value)}
                  placeholder="my-awesome-cafe"
                  required
                />
                <p className="text-xs text-muted-foreground">This is used for your public store link.</p>
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="flex gap-2">
                <Button type="submit" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Store'}
                </Button>
                {stores.length > 0 && (
                  <Button type="button" variant="outline" onClick={() => setIsCreating(false)}>
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {loading && !analytics && stores.length > 0 && !isCreating && (
        <div className="text-sm text-muted-foreground">Loading analytics...</div>
      )}

      {analytics && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border border-border/60">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalMembers}</div>
              <CardDescription className="text-xs">Customers in program</CardDescription>
            </CardContent>
          </Card>
          
          <Card className="border border-border/60">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Points Issued</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalPointsIssued}</div>
              <CardDescription className="text-xs">Lifetime points given</CardDescription>
            </CardContent>
          </Card>

          <Card className="border border-border/60">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Points Redeemed</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalPointsRedeemed}</div>
              <CardDescription className="text-xs">Points spent by customers</CardDescription>
            </CardContent>
          </Card>
          
          <Card className="border border-border/60">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Points Outstanding</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analytics.totalPointsIssued - analytics.totalPointsRedeemed}
              </div>
              <CardDescription className="text-xs">Points waiting to be used</CardDescription>
            </CardContent>
          </Card>
        </div>
      )}

    </div>
  )
}
