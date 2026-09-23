'use client'

import React, { useState } from 'react'
import { CustomerMembership, AvailableStore } from '@/store/customer-store'
import { MobileHeader } from '@/components/mobile/mobile-header'
import { CustomerMobileNav, CustomerMobileTab } from './customer-mobile-nav'
import { CustomerWalletTab } from './tabs/customer-wallet-tab'
import { CustomerRewardsTab } from './tabs/customer-rewards-tab'
import { CustomerExploreTab } from './tabs/customer-explore-tab'
import { CustomerProfileDrawer } from './customer-profile-drawer'
import { User, QrCode } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { posHaptics } from '@/lib/haptics'

interface CustomerMobileViewProps {
  memberships: CustomerMembership[]
  activeMembership: CustomerMembership | null
  availableStores: AvailableStore[]
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
