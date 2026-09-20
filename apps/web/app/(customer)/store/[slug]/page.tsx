'use client'

import React, { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Loader2, Store as StoreIcon } from 'lucide-react'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { useCustomerStore } from '@/store/customer-store'
import { ResponsiveStoreView } from '@/features/store/components/responsive-store-view'
import { StorePublicData } from '@/features/store/components/mobile/store-mobile-view'

const apiBase = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000').replace(/\/$/, '')

export default function CustomerStorePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const router = useRouter()
  const searchParams = useSearchParams()
  const referralStoreId = searchParams.get('ref')
  const { isAuthenticated } = useAuth()
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

        let res = await fetch(`${apiBase}/api/v1/customer/store/${encodeURIComponent(targetSlug)}`)

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
      <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-6 space-y-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading loyalty pass...</p>
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
          We couldn&apos;t find a loyalty program for &quot;{decodeURIComponent(slug)}&quot;.
        </p>
        <div className="flex items-center gap-3 mt-6">
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
    <ResponsiveStoreView
      store={store}
      isAuthenticated={isAuthenticated}
      joining={joining}
      onJoinClick={handleJoinClick}
    />
  )
}
