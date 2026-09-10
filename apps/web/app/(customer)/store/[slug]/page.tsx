'use client'

import React, { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { PWAInstallPrompt } from '@/components/pwa-install-prompt'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Coffee, Sparkles, Gift, ArrowRight, CheckCircle2, Loader2, Store as StoreIcon } from 'lucide-react'

interface StoreReward {
  id: string
  name: string
  description?: string | null
  pointsCost: number
  active: boolean
}

interface StorePublicData {
  id: string
  name: string
  slug: string
  primaryColor: string
  pointsPerTnd: number
  logoUrl?: string | null
  rewards: StoreReward[]
}

export default function CustomerStorePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const [store, setStore] = useState<StorePublicData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadStore() {
      try {
        setLoading(true)
        const res = await fetch(`/api/v1/customer/store/${slug}`)
        if (!res.ok) {
          throw new Error('Store not found or unavailable')
        }
        const data = await res.json()
        setStore(data)
      } catch (err: any) {
        setError(err.message || 'Failed to load store')
      } finally {
        setLoading(false)
      }
    }
    loadStore()
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-6">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground mt-3">Loading coffee shop pass...</p>
      </div>
    )
  }

  if (error || !store) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
          <StoreIcon className="h-8 w-8 text-muted-foreground" />
        </div>
        <h1 className="text-xl font-bold">Store Not Found</h1>
        <p className="text-sm text-muted-foreground mt-1 max-w-sm">
          We couldn&apos;t find a loyalty program for &quot;{slug}&quot;. It may have been moved or renamed.
        </p>
        <Button asChild className="mt-6">
          <Link href="/customer/overview">Go to Customer Wallet</Link>
        </Button>
      </div>
    )
  }

  const primaryColor = store.primaryColor || '#D97706'

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col items-center p-4 sm:p-6 pb-24">
      <div className="w-full max-w-md mt-6 space-y-6">
        {/* Pass Graphic Card */}
        <div
          className="rounded-3xl p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden transition-all"
          style={{
            backgroundColor: primaryColor,
            backgroundImage: 'radial-gradient(circle at top right, rgba(255,255,255,0.25), transparent 70%)',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center font-bold text-xl overflow-hidden border border-white/25 shrink-0 shadow-xs">
                {store.logoUrl ? (
                  <img src={store.logoUrl} alt={store.name} className="h-full w-full object-cover" />
                ) : (
                  <Coffee className="h-6 w-6 text-white" />
                )}
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight leading-tight">{store.name}</h1>
                <p className="text-xs text-white/80 font-medium">Official Loyalty Pass</p>
              </div>
            </div>
            <Badge className="bg-white/20 hover:bg-white/20 text-white border-0 text-xs backdrop-blur-md px-2.5 py-1">
              Active Cafe
            </Badge>
          </div>

          {/* Value Proposition */}
          <div className="my-6 bg-black/15 backdrop-blur-md rounded-2xl p-5 border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-wider text-white/75 font-semibold">Loyalty Rate</p>
              <Sparkles className="h-4 w-4 text-amber-300" />
            </div>
            <p className="text-2xl font-black tracking-tight">
              {store.pointsPerTnd * 10}{' '}
              <span className="text-sm font-medium text-white/85">pts per 10 TND</span>
            </p>
            <p className="text-xs text-white/75 leading-relaxed">
              Earn points automatically with every coffee or meal you purchase at {store.name}.
            </p>
          </div>

          {/* Pass Footer */}
          <div className="pt-2 flex items-center justify-between text-xs text-white/80 border-t border-white/15">
            <span>Powered by Fidely</span>
            <span className="font-semibold text-white">Instant Rewards</span>
          </div>
        </div>

        {/* Action Button */}
        <div className="space-y-3">
          <Button asChild size="lg" className="w-full text-base font-semibold shadow-lg gap-2 h-12 rounded-2xl">
            <Link href="/customer/overview">
              Join & Collect Points <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Existing member? Tap above to open your digital QR pass.
          </p>
        </div>

        {/* Perks & Rewards Catalog */}
        {store.rewards.length > 0 && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Gift className="h-4 w-4 text-primary" />
              Available Perks & Rewards
            </div>

            <div className="grid gap-2.5">
              {store.rewards.map((reward) => (
                <Card key={reward.id} className="border-border/60 bg-card/80 backdrop-blur-xs shadow-xs">
                  <CardContent className="p-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
                        <CheckCircle2 className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm leading-tight">{reward.name}</p>
                        {reward.description && (
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                            {reward.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <Badge variant="secondary" className="font-bold shrink-0 text-xs">
                      {reward.pointsCost} pts
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      <PWAInstallPrompt />
    </div>
  )
}
