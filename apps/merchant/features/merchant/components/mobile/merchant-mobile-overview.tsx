'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Users,
  TrendingUp,
  Sparkles,
  QrCode,
  Share2,
  Copy,
  Check,
  Store,
  Plus,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import { posHaptics } from '@/lib/haptics'
import { useToast } from '@/hooks/use-toast'

interface MerchantMobileOverviewProps {
  activeStore: {
    id: string
    name: string
    slug: string
    primaryColor: string
    pointsPerTnd: number
  } | null
  analytics: {
    totalMembers: number
    totalPointsIssued: number
    totalPointsRedeemed: number
    recentTransactions?: Array<{
      date: string
      issued: number
      redeemed: number
    }>
  } | null
  onCreateStoreClick?: () => void
}

export function MerchantMobileOverview({
  activeStore,
  analytics,
  onCreateStoreClick,
}: MerchantMobileOverviewProps) {
  const { t, dir } = useI18n()
  const { toast } = useToast()
  const [copiedLink, setCopiedLink] = useState(false)

  const storeUrl = activeStore
    ? `https://fidely.app/store/${activeStore.slug}`
    : ''

  const handleCopyLink = () => {
    if (!storeUrl) return
    posHaptics.tap()
    navigator.clipboard.writeText(storeUrl)
    setCopiedLink(true)
    toast({
      title: 'Store link copied!',
      description: storeUrl,
    })
    setTimeout(() => setCopiedLink(false), 2000)
  }

  if (!activeStore) {
    return (
      <div className="p-6 rounded-3xl border border-border/70 bg-card text-center space-y-4 my-auto">
        <Store className="h-10 w-10 text-muted-foreground/40 mx-auto" />
        <div>
          <h3 className="text-base font-bold">No Active Store Selected</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Create your first store to start issuing digital loyalty passes.
          </p>
        </div>
        {onCreateStoreClick && (
          <Button onClick={onCreateStoreClick} className="rounded-2xl text-xs font-bold gap-2">
            <Plus className="w-4 h-4" />
            <span>Create Store</span>
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4 text-start md:hidden select-none" dir={dir}>
      {/* ── POCKET PULSE: 3 KEY METRIC TILES ── */}
      <div className="grid grid-cols-3 gap-2">
        {/* Members */}
        <div className="p-3 rounded-2xl border border-border/60 bg-card space-y-1 shadow-2xs">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Users className="w-3.5 h-3.5 text-blue-500" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Members</span>
          </div>
          <p className="text-xl font-black font-mono tracking-tight text-foreground">
            {analytics?.totalMembers?.toLocaleString() || 0}
          </p>
        </div>

        {/* Points Issued */}
        <div className="p-3 rounded-2xl border border-border/60 bg-card space-y-1 shadow-2xs">
          <div className="flex items-center gap-1 text-muted-foreground">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Awarded</span>
          </div>
          <p className="text-xl font-black font-mono tracking-tight text-emerald-600 dark:text-emerald-400">
            +{analytics?.totalPointsIssued?.toLocaleString() || 0}
          </p>
        </div>

        {/* Points Redeemed */}
        <div className="p-3 rounded-2xl border border-border/60 bg-card space-y-1 shadow-2xs">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Redeemed</span>
          </div>
          <p className="text-xl font-black font-mono tracking-tight text-foreground">
            {analytics?.totalPointsRedeemed?.toLocaleString() || 0}
          </p>
        </div>
      </div>

      {/* ── IN-STORE COUNTER STAND QUICK SHARE CARD ── */}
      <div className="p-4 rounded-3xl border border-primary/30 bg-primary/5 space-y-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold shadow-2xs">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-foreground">Counter Stand Link</h4>
              <p className="text-[10px] text-muted-foreground font-mono truncate max-w-[200px]">
                fidely.app/store/{activeStore.slug}
              </p>
            </div>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={handleCopyLink}
            className="h-8 rounded-xl text-xs font-bold gap-1.5 border-primary/40 text-primary hover:bg-primary/10"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'Copied' : 'Copy'}</span>
          </Button>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <Button asChild size="sm" className="flex-1 h-9 rounded-xl text-xs font-bold gap-1.5 shadow-2xs">
            <Link href={`/store/${activeStore.slug}`} target="_blank">
              <span>Preview Pass</span>
              <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="flex-1 h-9 rounded-xl text-xs font-semibold">
            <Link href="/merchant/customizer">
              <span>Edit Card</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* ── QUICK MANAGEMENT SHORTCUTS ── */}
      <div className="grid grid-cols-2 gap-2">
        <Link
          href="/merchant/crm"
          className="p-3.5 rounded-2xl border border-border/60 bg-card hover:bg-muted/40 transition active:scale-[0.98] space-y-1 shadow-2xs"
        >
          <div className="w-7 h-7 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
          <p className="text-xs font-bold text-foreground">Customers CRM</p>
          <p className="text-[10px] text-muted-foreground">View member directory</p>
        </Link>

        <Link
          href="/merchant/staff"
          className="p-3.5 rounded-2xl border border-border/60 bg-card hover:bg-muted/40 transition active:scale-[0.98] space-y-1 shadow-2xs"
        >
          <div className="w-7 h-7 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <p className="text-xs font-bold text-foreground">Cashier Staff</p>
          <p className="text-[10px] text-muted-foreground">Manage POS PINs</p>
        </Link>
      </div>
    </div>
  )
}
