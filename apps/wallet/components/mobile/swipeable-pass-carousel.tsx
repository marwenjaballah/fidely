'use client'

import React, { useRef, useEffect } from 'react'
import { CustomerMembership } from '@/store/customer-store'
import { AppleWalletPass } from '@/components/common/apple-wallet-card'
import { format } from 'date-fns'
import { useI18n } from '@/lib/i18n'
import { posHaptics } from '@/lib/haptics'

interface SwipeablePassCarouselProps {
  memberships: CustomerMembership[]
  activeMembershipId?: string
  onSelectMembership: (id: string) => void
  onRefreshQr?: (membershipId: string) => Promise<void> | void
  userName?: string
}

export function SwipeablePassCarousel({
  memberships,
  activeMembershipId,
  onSelectMembership,
  onRefreshQr,
  userName = 'Loyalty Member',
}: SwipeablePassCarouselProps) {
  const { t, dir } = useI18n()
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Scroll to active card when activeMembershipId changes from external source (e.g. top pill)
  useEffect(() => {
    if (!scrollContainerRef.current || !activeMembershipId) return
    const activeIndex = memberships.findIndex((m) => m.id === activeMembershipId)
    if (activeIndex >= 0) {
      const cardWidth = scrollContainerRef.current.offsetWidth
      scrollContainerRef.current.scrollTo({
        left: activeIndex * cardWidth,
        behavior: 'smooth',
      })
    }
  }, [activeMembershipId, memberships])

  // Handle scroll snap change
  const handleScroll = () => {
    if (!scrollContainerRef.current) return
    const container = scrollContainerRef.current
    const scrollLeft = container.scrollLeft
    const cardWidth = container.offsetWidth
    const newIndex = Math.round(scrollLeft / cardWidth)
    const targetMembership = memberships[newIndex]
    if (targetMembership && targetMembership.id !== activeMembershipId) {
      posHaptics.tap()
      onSelectMembership(targetMembership.id)
    }
  }

  if (memberships.length === 0) return null

  // Single card mode: No carousel needed
  if (memberships.length === 1) {
    const m = memberships[0]
    const nextReward = m.rewards
      ? [...m.rewards]
          .filter((r) => r.active && r.pointsCost > (m.pointsBalance || 0))
          .sort((a, b) => a.pointsCost - b.pointsCost)[0]
      : null
    const reachableRewards = m.rewards
      ? m.rewards.filter((r) => r.active && r.pointsCost <= (m.pointsBalance || 0))
      : []

    return (
      <div className="w-full max-w-[400px] mx-auto px-1">
        <AppleWalletPass
          storeName={m.storeName}
          logoUrl={m.logoUrl}
          primaryColor={m.primaryColor || '#D97706'}
          pointsBalance={m.pointsBalance}
          pointsPerTnd={m.pointsPerTnd}
          qrCodeToken={m.qrCodeToken}
          memberName={userName}
          memberSince={m.joinedAt ? format(new Date(m.joinedAt), 'MMM yyyy') : 'Active'}
          rewardsCount={reachableRewards.length}
          nextRewardName={nextReward?.name}
          nextRewardCost={nextReward?.pointsCost}
          showQr={true}
          interactive={true}
          onRefreshQr={() => onRefreshQr?.(m.id)}
        />
      </div>
    )
  }

  return (
    <div className="w-full space-y-3" dir={dir}>
      {/* Horizontal Snap Scroll Container */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex w-full overflow-x-auto snap-x snap-mandatory scrollbar-none scroll-smooth pb-1"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {memberships.map((m) => {
          const nextReward = m.rewards
            ? [...m.rewards]
                .filter((r) => r.active && r.pointsCost > (m.pointsBalance || 0))
                .sort((a, b) => a.pointsCost - b.pointsCost)[0]
            : null
          const reachableRewards = m.rewards
            ? m.rewards.filter((r) => r.active && r.pointsCost <= (m.pointsBalance || 0))
            : []

          return (
            <div
              key={m.id}
              className="w-full flex-shrink-0 snap-center px-1 max-w-[400px] mx-auto"
            >
              <AppleWalletPass
                storeName={m.storeName}
                logoUrl={m.logoUrl}
                primaryColor={m.primaryColor || '#D97706'}
                pointsBalance={m.pointsBalance}
                pointsPerTnd={m.pointsPerTnd}
                qrCodeToken={m.qrCodeToken}
                memberName={userName}
                memberSince={m.joinedAt ? format(new Date(m.joinedAt), 'MMM yyyy') : 'Active'}
                rewardsCount={reachableRewards.length}
                nextRewardName={nextReward?.name}
                nextRewardCost={nextReward?.pointsCost}
                showQr={true}
                interactive={true}
                onRefreshQr={() => onRefreshQr?.(m.id)}
              />
            </div>
          )
        })}
      </div>

      {/* Dot Indicators */}
      <div className="flex items-center justify-center gap-1.5 py-1">
        {memberships.map((m, idx) => {
          const isSelected = m.id === activeMembershipId
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => {
                posHaptics.tap()
                onSelectMembership(m.id)
              }}
              aria-label={`Switch to ${m.storeName}`}
              className={`h-1.5 rounded-full transition-all ${
                isSelected
                  ? 'w-6 bg-primary'
                  : 'w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50'
              }`}
            />
          )
        })}
      </div>
    </div>
  )
}
