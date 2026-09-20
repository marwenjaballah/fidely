'use client'

import React, { useState } from 'react'
import { AvailableStore, CustomerMembership } from '@/store/customer-store'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Search,
  QrCode,
  Coffee,
  CheckCircle2,
  Loader2,
  X,
  Store,
  Compass,
} from 'lucide-react'
import { QRScanner } from '@/components/qr-scanner'
import { useI18n } from '@/lib/i18n'
import { posHaptics } from '@/lib/haptics'

interface CustomerExploreTabProps {
  availableStores: AvailableStore[]
  memberships: CustomerMembership[]
  onJoinStore: (storeId: string) => Promise<void>
  onJoinBySlug: (slug: string) => Promise<void>
  onSelectMembership: (membershipId: string) => void
  onGoToWallet: () => void
  isJoining: boolean
  joiningStoreId: string | null
  joinError: string | null
}

export function CustomerExploreTab({
  availableStores,
  memberships,
  onJoinStore,
  onJoinBySlug,
  onSelectMembership,
  onGoToWallet,
  isJoining,
  joiningStoreId,
  joinError,
}: CustomerExploreTabProps) {
  const { t, dir } = useI18n()
  const [searchQuery, setSearchQuery] = useState('')
  const [scannerOpen, setScannerOpen] = useState(false)
  const [slugInput, setSlugInput] = useState('')

  const filteredStores = availableStores.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.slug.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSlugSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!slugInput.trim() || isJoining) return
    posHaptics.tap()
    await onJoinBySlug(slugInput.trim())
    setSlugInput('')
  }

  const handleScanSuccess = async (decodedText: string) => {
    if (isJoining) return
    posHaptics.scan()
    await onJoinBySlug(decodedText.trim())
    setScannerOpen(false)
  }

  return (
    <div className="space-y-4 text-start" dir={dir}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground rtl:left-auto rtl:right-3.5" />
        <Input
          type="search"
          placeholder={t('explore_search_placeholder') || 'Search partner coffee shops...'}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="ps-9 pe-9 h-11 rounded-2xl bg-card border-border/70 text-xs shadow-2xs"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-3 rtl:right-auto rtl:left-3 text-muted-foreground hover:text-foreground text-xs font-bold"
          >
            ✕
          </button>
        )}
      </div>

      {/* Stand QR Camera Trigger Button */}
      <Button
        variant={scannerOpen ? 'secondary' : 'default'}
        size="default"
        onClick={() => {
          posHaptics.tap()
          setScannerOpen(!scannerOpen)
        }}
        className="w-full h-12 rounded-2xl text-xs font-bold gap-2 shadow-2xs bg-primary text-primary-foreground"
      >
        <QrCode className="h-4 w-4" />
        <span>{scannerOpen ? 'Close Camera' : t('explore_scan_stand_btn') || 'Scan In-Store QR Stand'}</span>
      </Button>

      {/* Live Optical QR Camera if toggled */}
      {scannerOpen && (
        <div className="rounded-3xl border border-border/70 bg-card p-4 shadow-xl space-y-3 text-center animate-in zoom-in-95 duration-200">
          <div className="rounded-2xl overflow-hidden bg-black/90 p-1">
            <QRScanner
              containerId="customer-explore-tab-scanner"
              onScanSuccess={handleScanSuccess}
            />
          </div>
          <p className="text-[11px] text-muted-foreground">
            {t('scanner_instruction') || 'Point camera at the acrylic QR stand on the counter'}
          </p>
          {joinError && (
            <p className="text-xs font-medium text-destructive bg-destructive/10 p-2.5 rounded-xl border border-destructive/20 text-center">
              {joinError}
            </p>
          )}
        </div>
      )}

      {/* Join by Slug / Shortcode */}
      <div className="p-3.5 rounded-2xl border border-border/60 bg-card space-y-2">
        <Label htmlFor="explore-slug-input" className="text-xs font-bold text-foreground">
          {t('customer_join_by_slug_label') || 'Have a store link or code?'}
        </Label>
        <form onSubmit={handleSlugSubmit} className="flex items-center gap-2">
          <div className="flex flex-1 items-center rounded-xl border bg-background px-3 py-1.5 text-xs text-muted-foreground shadow-2xs">
            <span className="font-mono text-muted-foreground/80 select-none text-[11px]" dir="ltr">
              fidely.app/
            </span>
            <input
              id="explore-slug-input"
              type="text"
              dir="ltr"
              className="w-full bg-transparent px-1 py-0.5 text-foreground font-mono font-medium outline-none text-xs"
              placeholder="artisan-cafe"
              value={slugInput}
              onChange={(e) => setSlugInput(e.target.value)}
            />
          </div>
          <Button
            type="submit"
            size="sm"
            disabled={isJoining || !slugInput.trim()}
            className="h-9 px-3 text-xs font-bold rounded-xl shrink-0"
          >
            {isJoining ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : t('customer_join_slug_btn') || 'Join'}
          </Button>
        </form>
        {joinError && !scannerOpen && (
          <p className="text-xs text-destructive bg-destructive/10 p-2 rounded-xl border border-destructive/20">
            {joinError}
          </p>
        )}
      </div>

      {/* Partner Stores Directory */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {t('store_switcher_my_stores') || 'Partner Stores'} ({filteredStores.length})
          </p>
        </div>

        {filteredStores.length === 0 ? (
          <div className="p-8 text-center bg-card rounded-3xl border border-border/60 text-xs text-muted-foreground">
            {searchQuery
              ? `No partner stores found matching "${searchQuery}".`
              : 'No partner stores available at the moment.'}
          </div>
        ) : (
          <div className="grid gap-2">
            {filteredStores.map((store) => {
              const matchingMembership = memberships.find((m) => m.storeId === store.id)
              const isEnrolled = !!matchingMembership

              return (
                <div
                  key={store.id}
                  className="flex items-center justify-between p-3.5 rounded-2xl border border-border/60 bg-card hover:bg-muted/40 transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="h-10 w-10 rounded-xl flex items-center justify-center font-bold overflow-hidden border border-border/40 shrink-0 shadow-2xs"
                      style={{ backgroundColor: store.primaryColor ? `${store.primaryColor}25` : undefined }}
                    >
                      {store.logoUrl ? (
                        <img src={store.logoUrl} alt={store.name} className="h-full w-full object-cover" />
                      ) : (
                        <Coffee className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <div className="text-start min-w-0">
                      <p className="font-bold text-xs text-foreground truncate">{store.name}</p>
                      <p className="text-[11px] text-muted-foreground font-mono truncate">
                        fidely.app/{store.slug}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 ms-2">
                    {isEnrolled ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          posHaptics.tap()
                          if (matchingMembership) {
                            onSelectMembership(matchingMembership.id)
                            onGoToWallet()
                          }
                        }}
                        className="rounded-xl text-xs h-8 px-2.5 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 font-bold gap-1"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>View Pass</span>
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => {
                          posHaptics.tap()
                          onJoinStore(store.id)
                        }}
                        disabled={joiningStoreId === store.id}
                        className="rounded-xl text-xs h-8 px-3 font-semibold shadow-2xs"
                      >
                        {joiningStoreId === store.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          t('customer_add_coffee_card') || 'Add Pass'
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
