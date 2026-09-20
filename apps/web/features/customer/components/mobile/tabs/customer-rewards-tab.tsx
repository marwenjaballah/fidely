'use client'

import React, { useState } from 'react'
import { CustomerMembership } from '@/store/customer-store'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Gift,
  Ticket,
  History,
  TrendingUp,
  CheckCircle2,
  Lock,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import { format } from 'date-fns'
import { posHaptics } from '@/lib/haptics'

interface CustomerRewardsTabProps {
  activeMembership: CustomerMembership | null
}

export function CustomerRewardsTab({ activeMembership }: CustomerRewardsTabProps) {
  const { t, dir } = useI18n()
  const [subTab, setSubTab] = useState<'rewards' | 'history'>('rewards')

  if (!activeMembership) {
    return (
      <div className="p-8 rounded-3xl border border-border/70 bg-card text-center space-y-4">
        <Gift className="h-10 w-10 text-muted-foreground/40 mx-auto" />
        <div>
          <h3 className="text-sm font-bold">{t('nav_perks') || 'Rewards'}</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Join a store to unlock rewards and track your points history.
          </p>
        </div>
      </div>
    )
  }

  const points = activeMembership.pointsBalance || 0
  const rewards = activeMembership.rewards || []
  const vouchers = activeMembership.vouchers || []
  const transactions = activeMembership.transactions || []

  const unlockedRewards = rewards.filter((r) => r.active && r.pointsCost <= points)
  const lockedRewards = rewards.filter((r) => r.active && r.pointsCost > points)

  return (
    <div className="space-y-4 text-start" dir={dir}>
      {/* Sub-navigation Switcher */}
      <div className="flex items-center p-1 rounded-2xl bg-muted/60 border border-border/50">
        <button
          type="button"
          onClick={() => {
            posHaptics.tap()
            setSubTab('rewards')
          }}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            subTab === 'rewards'
              ? 'bg-background text-foreground shadow-xs'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Gift className="h-3.5 w-3.5" />
          <span>{t('nav_perks') || 'Perks & Vouchers'}</span>
          {unlockedRewards.length + vouchers.length > 0 && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 font-mono font-bold">
              {unlockedRewards.length + vouchers.length}
            </Badge>
          )}
        </button>

        <button
          type="button"
          onClick={() => {
            posHaptics.tap()
            setSubTab('history')
          }}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            subTab === 'history'
              ? 'bg-background text-foreground shadow-xs'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <History className="h-3.5 w-3.5" />
          <span>{t('customer_history_title') || 'History'}</span>
        </button>
      </div>

      {/* ── SUB-TAB 1: PERKS & VOUCHERS ── */}
      {subTab === 'rewards' && (
        <div className="space-y-4">
          {/* Active Claimed Vouchers Section (if any) */}
          {vouchers.length > 0 && (
            <div className="rounded-3xl border border-primary/30 bg-primary/5 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Ticket className="w-4 h-4 text-primary" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-primary">
                    Active Claim Vouchers ({vouchers.length})
                  </h4>
                </div>
              </div>

              <div className="space-y-2">
                {vouchers.map((voucher) => (
                  <div
                    key={voucher.id}
                    className="p-3 rounded-2xl border border-primary/20 bg-background flex items-center justify-between shadow-2xs"
                  >
                    <div className="space-y-1 min-w-0">
                      <p className="font-bold text-xs text-foreground truncate">{voucher.rewardName}</p>
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-muted px-2 py-0.5 rounded font-mono font-bold text-foreground">
                          {voucher.code}
                        </code>
                        <span className="text-[10px] text-muted-foreground">
                          {voucher.pointsCost} {t('pts')}
                        </span>
                      </div>
                    </div>
                    <Badge
                      variant={voucher.status === 'used' ? 'secondary' : 'default'}
                      className="text-[10px] font-bold shrink-0"
                    >
                      {voucher.status === 'used' ? 'CLAIMED' : 'READY AT COUNTER'}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Unlocked & Ready Rewards */}
          {unlockedRewards.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 px-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Ready to Redeem ({unlockedRewards.length})
                </h4>
              </div>

              <div className="space-y-2">
                {unlockedRewards.map((reward) => (
                  <div
                    key={reward.id}
                    className="p-3.5 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 flex items-center justify-between gap-3 shadow-2xs"
                  >
                    <div className="space-y-0.5 min-w-0">
                      <p className="font-bold text-xs text-foreground truncate">{reward.name}</p>
                      {reward.description && (
                        <p className="text-[11px] text-muted-foreground line-clamp-1">{reward.description}</p>
                      )}
                      <span className="inline-block text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                        {reward.pointsCost} {t('pts')}
                      </span>
                    </div>

                    <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white text-[11px] font-bold shrink-0 shadow-xs px-2.5 py-1">
                      Ready at Counter
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Locked Perks Catalog */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 px-1">
              <Lock className="w-3.5 h-3.5 text-muted-foreground" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Upcoming Perks ({lockedRewards.length})
              </h4>
            </div>

            {lockedRewards.length === 0 && unlockedRewards.length === 0 ? (
              <div className="p-8 rounded-3xl border border-border/60 bg-card text-center text-xs text-muted-foreground">
                No rewards catalog configured for this store yet.
              </div>
            ) : (
              <div className="space-y-2">
                {lockedRewards.map((reward) => {
                  const ptsNeeded = reward.pointsCost - points
                  const pct = Math.min(100, Math.round((points / reward.pointsCost) * 100))

                  return (
                    <div
                      key={reward.id}
                      className="p-3.5 rounded-2xl border border-border/60 bg-card/60 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-0.5 min-w-0">
                          <p className="font-bold text-xs text-foreground truncate">{reward.name}</p>
                          {reward.description && (
                            <p className="text-[11px] text-muted-foreground line-clamp-1">{reward.description}</p>
                          )}
                        </div>
                        <Badge variant="secondary" className="text-[10px] font-mono shrink-0">
                          {reward.pointsCost} {t('pts')}
                        </Badge>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-1">
                        <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-primary h-full rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <p className="text-[10px] text-muted-foreground text-end font-mono">
                          {ptsNeeded} {t('card_pts_left') || 'pts left'} ({pct}%)
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── SUB-TAB 2: POINTS HISTORY ── */}
      {subTab === 'history' && (
        <div className="rounded-3xl border border-border/70 bg-card p-4 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-primary" />
            <h3 className="font-bold text-xs uppercase tracking-wider text-foreground">
              {t('customer_history_title') || 'Transaction History'}
            </h3>
          </div>

          {transactions.length === 0 ? (
            <div className="py-12 text-center text-xs text-muted-foreground space-y-2">
              <History className="h-8 w-8 text-muted-foreground/30 mx-auto" />
              <p>{t('customer_no_history') || 'No transactions yet.'}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {transactions.map((tx) => {
                const isEarn = tx.type === 'earn'
                return (
                  <div
                    key={tx.id}
                    className="p-3 rounded-2xl border border-border/40 bg-muted/20 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 ${
                          isEarn ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-primary/10 text-primary'
                        }`}
                      >
                        {isEarn ? <TrendingUp className="h-4 w-4" /> : <Gift className="h-4 w-4" />}
                      </div>
                      <div className="text-start">
                        <p className="font-semibold text-xs text-foreground">
                          {isEarn ? t('pos_points_to_award') || 'Points Earned' : t('pos_redeem_reward_tab') || 'Reward Claimed'}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {format(new Date(tx.createdAt), 'MMM d, h:mm a')}
                        </p>
                      </div>
                    </div>

                    <div className="text-end">
                      <span
                        className={`text-xs font-bold font-mono ${
                          isEarn ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground'
                        }`}
                      >
                        {isEarn ? `+${tx.pointsAffected}` : tx.pointsAffected} {t('pts')}
                      </span>
                      {tx.amountTnd !== null && (
                        <p className="text-[10px] text-muted-foreground font-mono">
                          {tx.amountTnd.toFixed(2)} TND
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
