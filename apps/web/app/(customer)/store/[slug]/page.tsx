'use client'

import React, { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { PWAInstallPrompt } from '@/components/pwa-install-prompt'
import { AppleWalletPass } from '@/components/common/apple-wallet-card'
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
        {/* Apple Wallet Pass Graphic */}
        <AppleWalletPass
          storeName={store.name}
          logoUrl={store.logoUrl}
          primaryColor={store.primaryColor || '#D97706'}
          pointsBalance={1250}
          pointsPerTnd={store.pointsPerTnd}
          qrCodeToken={`JOIN:${store.slug}`}
          memberName="New Cardholder"
          memberSince="Available Now"
          rewardsCount={store.rewards.length}
          nextRewardName={store.rewards[0]?.name}
          nextRewardCost={store.rewards[0]?.pointsCost}
          showQr={true}
          interactive={true}
        />

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
