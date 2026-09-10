'use client'

import React, { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { PWAInstallPrompt } from '@/components/pwa-install-prompt'
import { AppleWalletPass } from '@/components/common/apple-wallet-card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Coffee,
  Sparkles,
  Gift,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Store as StoreIcon,
  QrCode,
} from 'lucide-react'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { useCustomerStore } from '@/store/customer-store'

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

const apiBase = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000').replace(/\/$/, '')

export default function CustomerStorePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const router = useRouter()
  const searchParams = useSearchParams()
  const referralStoreId = searchParams.get('ref')
  const { isAuthenticated, hasHydrated } = useAuth()
  const { joinStore } = useCustomerStore()

  const [store, setStore] = useState<StorePublicData | null>(null)
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadStore() {
      try {
        setLoading(true)
        setError(null)
        const targetSlug = decodeURIComponent(slug).trim()
        
        // 1. Try fetching by slug
        let res = await fetch(`${apiBase}/api/v1/customer/store/${encodeURIComponent(targetSlug)}`)
        
        // 2. Fallback to referral ID if slug not found and ref parameter exists
        if (!res.ok && referralStoreId && referralStoreId !== targetSlug) {
          res = await fetch(`${apiBase}/api/v1/customer/store/${encodeURIComponent(referralStoreId)}`)
        }

        if (!res.ok) {
          const errData = await res.json().catch(() => null)
          throw new Error(errData?.error || errData?.message || 'Store not found or unavailable')
        }

        const data = await res.json()
        setStore(data)
        if (typeof window !== 'undefined') {
          localStorage.setItem('fidely_pending_join_store', data.slug || data.id)
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load store')
      } finally {
        setLoading(false)
      }
    }
    loadStore()
  }, [slug, referralStoreId])

  const handleJoinClick = async () => {
    if (!store) return

    if (typeof window !== 'undefined') {
      localStorage.setItem('fidely_pending_join_store', store.slug || store.id)
    }

    if (!isAuthenticated) {
      // Direct unauthenticated user to sign up with store referral
      router.push(`/auth/sign-up?ref=${encodeURIComponent(store.slug || store.id)}&joinStore=${encodeURIComponent(store.slug || store.id)}`)
      return
    }

    try {
      setJoining(true)
      await joinStore(store.id)
      if (typeof window !== 'undefined') {
        localStorage.removeItem('fidely_pending_join_store')
      }
      router.push('/customer/overview')
    } catch {
      router.push('/customer/overview')
    } finally {
      setJoining(false)
    }
  }

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
          We couldn&apos;t find a loyalty program for &quot;{decodeURIComponent(slug)}&quot;. It may have been moved or renamed.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-3 mt-6">
          <Button variant="outline" onClick={() => window.location.reload()}>
            Try Again
          </Button>
          <Button asChild>
            <Link href="/customer/overview">Go to Customer Wallet</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col items-center p-4 sm:p-6 pb-24">
      <div className="w-full max-w-md mt-4 space-y-5">
        {/* Referral Invitation Banner */}
        <div className="bg-primary/10 border border-primary/20 rounded-2xl p-3.5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-xs text-foreground">In-Store Loyalty Pass</h3>
            <p className="text-[11px] text-muted-foreground">
              You scanned the counter QR stand for <strong className="text-foreground">{store.name}</strong>.
            </p>
          </div>
        </div>

        {/* Apple Wallet Pass Graphic */}
        <AppleWalletPass
          storeName={store.name}
          logoUrl={store.logoUrl}
          primaryColor={store.primaryColor || '#D97706'}
          pointsBalance={0}
          pointsPerTnd={store.pointsPerTnd}
          qrCodeToken={`JOIN:${store.slug}`}
          memberName={isAuthenticated ? 'Loyalty Member' : 'New Member'}
          memberSince="Available Now"
          rewardsCount={store.rewards.length}
          nextRewardName={store.rewards[0]?.name}
          nextRewardCost={store.rewards[0]?.pointsCost}
          showQr={true}
          interactive={true}
        />

        {/* Action Button */}
        <div className="space-y-3">
          <Button
            size="lg"
            onClick={handleJoinClick}
            disabled={joining}
            className="w-full text-base font-bold shadow-xl gap-2 h-14 rounded-2xl bg-primary text-primary-foreground"
          >
            {joining ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" /> Adding Card...
              </>
            ) : isAuthenticated ? (
              <>
                Add {store.name} Card <ArrowRight className="h-4 w-4" />
              </>
            ) : (
              <>
                Sign Up & Collect Points <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            {isAuthenticated
              ? 'Already registered. Tap above to add to your wallet.'
              : 'Create a free account in seconds to start earning loyalty points!'}
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
                <Card key={reward.id} className="border-border/60 bg-card/80 backdrop-blur-xs shadow-xs rounded-2xl">
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
