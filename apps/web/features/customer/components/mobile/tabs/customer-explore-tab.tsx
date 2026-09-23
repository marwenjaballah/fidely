'use client'

import React, { useState, useMemo } from 'react'
import { AvailableStore, CustomerMembership } from '@/store/customer-store'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Search,
  QrCode,
  Coffee,
  CheckCircle2,
  Loader2,
} from 'lucide-react'
import { QRScanner } from '@/components/qr-scanner'
import { useI18n } from '@/lib/i18n'
import { posHaptics } from '@/lib/haptics'

interface CustomerExploreTabProps {
  availableStores: AvailableStore[]
  memberships: CustomerMembership[]
  onJoinStore: (storeId: string) => Promise<void>
  onJoinBySlug: (slug: string) => Promise<void>
  onSelectMembership?: (membershipId: string) => void
  onGoToWallet?: () => void
  isJoining: boolean
  joiningStoreId: string | null
  joinError: string | null
}

export function CustomerExploreTab({
  availableStores,
  memberships,
  onJoinStore,
  onJoinBySlug,
  isJoining,
  joiningStoreId,
  joinError,
}: CustomerExploreTabProps) {
  const { t, dir } = useI18n()
  const [searchQuery, setSearchQuery] = useState('')
  const [scannerOpen, setScannerOpen] = useState(false)

  // Filter to strictly NOT JOINED stores
  const joinedStoreIds = useMemo(() => new Set(memberships.map((m) => m.storeId)), [memberships])
  const unjoinedStores = useMemo(
    () => availableStores.filter((s) => !joinedStoreIds.has(s.id)),
    [availableStores, joinedStoreIds]
  )

  const filteredStores = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return unjoinedStores
    return unjoinedStores.filter(
      (s) => s.name.toLowerCase().includes(q) || s.slug.toLowerCase().includes(q)
    )
  }, [unjoinedStores, searchQuery])

  const handleScanSuccess = async (decodedText: string) => {
    if (isJoining) return
    posHaptics.scan()
    await onJoinBySlug(decodedText.trim())
    setScannerOpen(false)
  }

  return (
    <div className="space-y-4 text-start" dir={dir}>
      {/* ── 1. SCAN COUNTER STAND ── */}
      <div className="space-y-3">
        <Button
          variant={scannerOpen ? 'secondary' : 'default'}
          size="default"
          onClick={() => {
            posHaptics.tap()
            setScannerOpen(!scannerOpen)
          }}
          className="w-full h-12 rounded-2xl text-xs font-bold gap-2 shadow-xs bg-primary text-primary-foreground"
        >
          <QrCode className="h-4 w-4" />
          <span>{scannerOpen ? 'Close Camera' : t('explore_scan_stand_btn') || 'Scan Counter Stand QR'}</span>
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
      </div>

      {/* ── 2. SEARCH BAR ── */}
      <div className="relative">
        <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground rtl:left-auto rtl:right-3.5" />
        <Input
          type="search"
          placeholder={t('explore_search_placeholder') || 'Search stores by name or slug...'}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="ps-9 pe-9 h-11 rounded-2xl bg-card border-border/70 text-xs shadow-2xs"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-3.5 top-3.5 rtl:right-auto rtl:left-3.5 text-muted-foreground hover:text-foreground text-xs font-bold"
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>

      {/* ── 3. LIST OF AVAILABLE NOT JOINED STORES ── */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {t('explore_available_stores') || 'Available Stores'} ({filteredStores.length})
          </p>
        </div>

        {unjoinedStores.length === 0 ? (
          <div className="p-8 text-center bg-card rounded-3xl border border-border/60 space-y-2">
            <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto" />
            <p className="text-xs font-semibold text-foreground">
              {t('explore_all_joined') || 'You have joined all available partner stores!'}
            </p>
            <p className="text-[11px] text-muted-foreground">
              Scan a counter stand at a new shop to enroll instantly.
            </p>
          </div>
        ) : filteredStores.length === 0 ? (
          <div className="p-8 text-center bg-card rounded-3xl border border-border/60 text-xs text-muted-foreground space-y-1">
            <p>
              {t('explore_no_results', { query: searchQuery }) ||
                `No available stores found matching "${searchQuery}".`}
            </p>
          </div>
        ) : (
          <div className="grid gap-2">
            {filteredStores.map((store) => (
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
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
