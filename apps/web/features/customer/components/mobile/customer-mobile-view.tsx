'use client'

import React, { useState } from 'react'
import { CustomerMembership, AvailableStore, CustomerActiveOrder } from '@/store/customer-store'
import { MobileHeader } from '@/components/mobile/mobile-header'
import { CustomerMobileNav, CustomerMobileTab } from './customer-mobile-nav'
import { CustomerWalletTab } from './tabs/customer-wallet-tab'
import { CustomerRewardsTab } from './tabs/customer-rewards-tab'
import { CustomerExploreTab } from './tabs/customer-explore-tab'
import { CustomerProfileDrawer } from './customer-profile-drawer'
import { User, QrCode, BellRing, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { posHaptics } from '@/lib/haptics'

interface CustomerMobileViewProps {
  memberships: CustomerMembership[]
  activeMembership: CustomerMembership | null
  availableStores: AvailableStore[]
  activeOrders?: CustomerActiveOrder[]
  onAcknowledgeOrder?: (orderId: string) => Promise<void> | void
  onSelectMembership: (id: string) => void
  onRefreshQr: (id: string) => Promise<void> | void
  onJoinStore: (storeId: string) => Promise<void>
  onJoinBySlug: (slug: string) => Promise<void>
  onLogout: () => void
  isJoining: boolean
  joiningStoreId: string | null
  joinError: string | null
  userName?: string
  userEmail?: string
}

export function CustomerMobileView({
  memberships,
  activeMembership,
  availableStores,
  activeOrders = [],
  onAcknowledgeOrder,
  onSelectMembership,
  onRefreshQr,
  onJoinStore,
  onJoinBySlug,
  onLogout,
  isJoining,
  joiningStoreId,
  joinError,
  userName,
  userEmail,
}: CustomerMobileViewProps) {
  const [activeTab, setActiveTab] = useState<CustomerMobileTab>('wallet')
  const [profileOpen, setProfileOpen] = useState(false)

  const unlockedRewardsCount = activeMembership?.rewards
    ? activeMembership.rewards.filter(
        (r) => r.active && r.pointsCost <= (activeMembership.pointsBalance || 0)
      ).length
    : 0

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:hidden select-none">
      {/* ── TOP MOBILE BAR WITH COMMAND PILL & AVATAR ── */}
      <MobileHeader
        scene="customer"
        storeName={activeMembership?.storeName}
        storeColor={activeMembership?.primaryColor}
        logoUrl={activeMembership?.logoUrl}
        pointsBalance={activeMembership?.pointsBalance}
        onOpenScanStand={() => setActiveTab('explore')}
        rightElement={
          <button
            type="button"
            onClick={() => {
              posHaptics.tap()
              setProfileOpen(true)
            }}
            className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/15 text-primary border border-border/60 hover:bg-primary/25 transition active:scale-95 shadow-2xs"
            aria-label="Open profile settings"
          >
            {userName ? (
              <span className="text-xs font-black">{userName[0].toUpperCase()}</span>
            ) : (
              <User className="h-4 w-4" />
            )}
          </button>
        }
      />

      {/* ── MAIN SCENE CONTAINER ── */}
      <main className="flex-1 p-3.5 pb-28 space-y-4 max-w-md mx-auto w-full">
        {/* ── LIVE SELF-SERVICE ORDER BUZZER BANNER ── */}
        {activeOrders.length > 0 && (
          <div className="space-y-2">
            {activeOrders.map((order) => {
              const isReady = order.status === 'READY'
              return (
                <div
                  key={order.id}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 transition-all text-start shadow-sm ${
                    isReady
                      ? 'border-emerald-500/50 bg-emerald-500/15 animate-pulse'
                      : 'border-amber-500/40 bg-amber-500/10'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div
                      className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 font-mono font-black text-xs ${
                        isReady
                          ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                      }`}
                    >
                      #{order.orderNumber}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="text-xs font-extrabold tracking-tight text-foreground truncate">
                          {isReady
                            ? `Order #${order.orderNumber} is READY!`
                            : `Order #${order.orderNumber} • Preparing`}
                        </p>
                        <Badge
                          variant={isReady ? 'default' : 'secondary'}
                          className={`text-[9px] font-bold px-1.5 py-0 ${
                            isReady
                              ? 'bg-emerald-600 text-white'
                              : 'bg-amber-500/20 text-amber-700 dark:text-amber-300'
                          }`}
                        >
                          {isReady ? 'PICKUP NOW' : 'IN QUEUE'}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                        {order.itemsSummary
                          ? `${order.itemsSummary}`
                          : isReady
                          ? 'Collect your order at the counter!'
                          : "We'll buzz your phone when ready."}
                      </p>
                    </div>
                  </div>

                  {isReady && onAcknowledgeOrder && (
                    <Button
                      size="sm"
                      onClick={() => onAcknowledgeOrder(order.id)}
                      className="h-8 rounded-xl text-[11px] font-bold gap-1 bg-emerald-600 hover:bg-emerald-700 text-white shrink-0 px-2.5 shadow-xs"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Picked Up</span>
                    </Button>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {activeTab === 'wallet' && (
          <CustomerWalletTab
            memberships={memberships}
            activeMembership={activeMembership}
            onSelectMembership={onSelectMembership}
            onRefreshQr={onRefreshQr}
            onOpenExplore={() => setActiveTab('explore')}
            onOpenScanStand={() => setActiveTab('explore')}
            onGoToRewards={() => setActiveTab('rewards')}
            userName={userName}
          />
        )}

        {activeTab === 'rewards' && (
          <CustomerRewardsTab activeMembership={activeMembership} />
        )}

        {activeTab === 'explore' && (
          <CustomerExploreTab
            availableStores={availableStores}
            memberships={memberships}
            onJoinStore={onJoinStore}
            onJoinBySlug={onJoinBySlug}
            onSelectMembership={onSelectMembership}
            onGoToWallet={() => setActiveTab('wallet')}
            isJoining={isJoining}
            joiningStoreId={joiningStoreId}
            joinError={joinError}
          />
        )}
      </main>

      {/* ── 3-TAB THUMB-ZONE BOTTOM NAVIGATION ── */}
      <CustomerMobileNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        unlockedRewardsCount={unlockedRewardsCount}
      />

      {/* ── PROFILE & SETTINGS BOTTOM SHEET ── */}
      <CustomerProfileDrawer
        open={profileOpen}
        onOpenChange={setProfileOpen}
        onLogout={onLogout}
      />
    </div>
  )
}
