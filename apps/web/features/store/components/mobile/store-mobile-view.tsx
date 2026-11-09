'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { AppleWalletPass } from '@/components/common/apple-wallet-card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Sparkles,
  Gift,
  ArrowRight,
  Loader2,
  Store as StoreIcon,
  QrCode,
  CheckCircle2,
  UtensilsCrossed,
  Coffee,
  Share2,
  Check,
} from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import { LanguageSwitcher } from '@/components/common/language-switcher'
import { ThemeToggleButton } from '@/components/common/theme-toggle-button'
import { FidelyLogo } from '@/components/common/fidely-logo'
import { BRAND_NAME } from '@/lib/brand'

export interface StoreReward {
  id: string
  name: string
  description?: string | null
  pointsCost: number
  active: boolean
}

export interface StoreMenuItem {
  id: string
  name: string
  description?: string | null
  category: string
  price: number
  imageUrl?: string | null
  available: boolean
}

export interface StorePublicData {
  id: string
  name: string
  slug: string
  primaryColor: string
  currency?: string
  pointsPerTnd: number
  welcomePoints?: number
  selfServiceEnabled?: boolean
  logoUrl?: string | null
  rewards: StoreReward[]
  menuItems?: StoreMenuItem[]
}

interface StoreMobileViewProps {
  store: StorePublicData
  isAuthenticated: boolean
  joining: boolean
  onJoinClick: () => void
}

export function StoreMobileView({
  store,
  isAuthenticated,
  joining,
  onJoinClick,
}: StoreMobileViewProps) {
  const { t, dir } = useI18n()
  const searchParams = useSearchParams()
  const initialTab = searchParams.get('tab') === 'menu' ? 'menu' : 'pass'
  const [activeTab, setActiveTab] = useState<'pass' | 'menu'>(initialTab)
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL')
  const [sharedCopied, setSharedCopied] = useState(false)

  useEffect(() => {
    if (searchParams.get('tab') === 'menu') {
      setActiveTab('menu')
    }
  }, [searchParams])

  const hasWelcomeBonus = Boolean(store.welcomePoints && store.welcomePoints > 0)
  const currency = store.currency || 'TND'
  const menuItems = store.menuItems || []
  const categories = ['ALL', ...Array.from(new Set(menuItems.map((m) => m.category || 'Coffee')))]
  const filteredMenu =
    selectedCategory === 'ALL'
      ? menuItems
      : menuItems.filter((m) => (m.category || 'Coffee') === selectedCategory)

  const handleShareMenu = async () => {
    const shareUrl = `${window.location.origin}/store/${store.slug}?tab=menu`
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${store.name} - Menu & Loyalty`,
          text: `Check out the menu and loyalty rewards at ${store.name}!`,
          url: shareUrl,
        })
        return
      } catch {}
    }
    navigator.clipboard.writeText(shareUrl)
    setSharedCopied(true)
    setTimeout(() => setSharedCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col items-center p-3.5 pb-24 md:hidden select-none" dir={dir}>
      <div className="w-full max-w-md space-y-4">
        {/* Top Header Controls */}
        <div className="flex items-center justify-between pt-1">
          <Link href={isAuthenticated ? "/customer/overview" : "/"} className="flex items-center gap-1.5 group">
            <FidelyLogo size="sm" variant="subtle" className="transition-transform group-hover:scale-105" />
            <span className="font-extrabold text-sm tracking-tight text-foreground">{BRAND_NAME}</span>
          </Link>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleShareMenu}
              className="h-8 px-2.5 rounded-xl text-[11px] font-bold gap-1"
            >
              {sharedCopied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Share2 className="h-3.5 w-3.5" />}
              <span>{sharedCopied ? 'Copied' : 'Share Menu'}</span>
            </Button>
            <LanguageSwitcher />
            <ThemeToggleButton />
          </div>
        </div>

        {/* Mode Switcher: Loyalty Pass vs Store Menu */}
        <div className="grid grid-cols-2 p-1 rounded-2xl bg-muted border border-border/60">
          <button
            type="button"
            onClick={() => setActiveTab('pass')}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'pass'
                ? 'bg-background text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <QrCode className="w-3.5 h-3.5 text-primary" />
            <span>Loyalty Pass</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('menu')}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'menu'
                ? 'bg-background text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <UtensilsCrossed className="w-3.5 h-3.5 text-primary" />
            <span>Menu &amp; Prices ({menuItems.length})</span>
          </button>
        </div>

        {activeTab === 'menu' ? (
          /* ── STORE MENU & PRICES VIEW ── */
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="rounded-3xl border border-border/70 bg-card p-4 text-start space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  {store.logoUrl ? (
                    <img src={store.logoUrl} alt={store.name} className="w-10 h-10 rounded-xl object-cover border border-border/50" />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center font-bold">
                      <Coffee className="w-5 h-5" />
                    </div>
                  )}
                  <div>
                    <h2 className="text-base font-black tracking-tight text-foreground">{store.name} Menu</h2>
                    <p className="text-[11px] text-muted-foreground">
                      Earn <strong className="text-primary">{store.pointsPerTnd} pts</strong> for every 1 {currency} spent
                    </p>
                  </div>
                </div>
              </div>

              {/* Category Filter Pills */}
              {categories.length > 2 && (
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                        selectedCategory === cat
                          ? 'bg-primary text-primary-foreground shadow-2xs'
                          : 'bg-muted/60 text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {cat === 'ALL' ? 'All Items' : cat}
                    </button>
                  ))}
                </div>
              )}

              {filteredMenu.length === 0 ? (
                <div className="py-10 text-center space-y-2 text-muted-foreground">
                  <Coffee className="w-8 h-8 mx-auto opacity-40" />
                  <p className="text-xs font-medium">No menu items published yet for this store.</p>
                </div>
              ) : (
                <div className="space-y-2.5 pt-1">
                  {filteredMenu.map((item) => {
                    const earnedPts = Math.max(1, Math.round(item.price * (store.pointsPerTnd || 10)))
                    return (
                      <div
                        key={item.id}
                        className="p-3 rounded-2xl border border-border/60 bg-muted/20 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-12 h-12 rounded-xl object-cover border border-border/50 shrink-0"
                            />
                          ) : (
                            <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                              <Coffee className="w-5 h-5" />
                            </div>
                          )}
                          <div className="space-y-0.5 min-w-0 text-start">
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block">
                              {item.category}
                            </span>
                            <p className="font-bold text-xs text-foreground truncate">{item.name}</p>
                            {item.description && (
                              <p className="text-[11px] text-muted-foreground line-clamp-2">{item.description}</p>
                            )}
                          </div>
                        </div>

                        <div className="text-end shrink-0">
                          <Badge className="font-mono font-bold text-xs bg-foreground text-background">
                            {item.price.toFixed(2)} {currency}
                          </Badge>
                          <p className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                            +{earnedPts} pts
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Bottom Call-To-Action to Add Loyalty Pass */}
            <Button
              size="lg"
              onClick={onJoinClick}
              disabled={joining}
              className="w-full text-sm font-bold shadow-xl gap-2 h-13 rounded-2xl bg-primary text-primary-foreground"
            >
              {joining ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> {t('loading') || 'Adding pass...'}
                </>
              ) : (
                <>
                  <span>Get Loyalty Pass &amp; Earn Points</span>
                  <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                </>
              )}
            </Button>
          </div>
        ) : (
          /* ── LOYALTY PASS VIEW ── */
          <>
            {/* In-Store Counter Stand Badge */}
            <div className="bg-primary/10 border border-primary/20 rounded-2xl p-3 flex items-center gap-3 shadow-2xs">
              <div className="w-8 h-8 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-xs">
                <QrCode className="w-4 h-4" />
              </div>
              <div className="text-start">
                <h3 className="font-bold text-xs text-foreground">In-Store Loyalty Pass</h3>
                <p className="text-[11px] text-muted-foreground">
                  You scanned the counter stand for <strong className="text-foreground">{store.name}</strong>
                </p>
              </div>
            </div>

            {/* Welcome Bonus Gift Banner */}
            {hasWelcomeBonus && (
              <div className="bg-gradient-to-r from-primary/15 via-primary/10 to-indigo-500/15 border border-primary/30 rounded-2xl p-3.5 flex items-center justify-between shadow-2xs animate-in zoom-in-95 duration-200">
                <div className="flex items-center gap-3 text-start">
                  <div className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold shrink-0 shadow-xs">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-foreground">Welcome Bonus Gift</h4>
                    <p className="text-[11px] text-muted-foreground">Receive instant bonus points when joining</p>
                  </div>
                </div>
                <Badge className="bg-primary text-primary-foreground font-mono font-bold text-xs px-2.5 py-1 shrink-0">
                  +{store.welcomePoints} pts
                </Badge>
              </div>
            )}

            {/* Apple Wallet Pass Graphic */}
            <AppleWalletPass
              storeName={store.name}
              logoUrl={store.logoUrl}
              primaryColor={store.primaryColor || '#D97706'}
              pointsBalance={0}
              pointsPerTnd={store.pointsPerTnd}
              qrCodeToken={`JOIN:${store.slug}`}
              memberName={isAuthenticated ? t('card_member') || 'Member' : t('card_fallback_customer') || 'New Customer'}
              memberSince={t('card_available_now') || 'Available Now'}
              rewardsCount={store.rewards.length}
              nextRewardName={store.rewards[0]?.name}
              nextRewardCost={store.rewards[0]?.pointsCost}
              showQr={true}
              interactive={true}
            />

            {/* Action Button */}
            <div className="space-y-2 text-center pt-1">
              <Button
                size="lg"
                onClick={onJoinClick}
                disabled={joining}
                className="w-full text-sm font-bold shadow-xl gap-2 h-13 rounded-2xl bg-primary text-primary-foreground"
              >
                {joining ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> {t('loading') || 'Adding pass...'}
                  </>
                ) : isAuthenticated ? (
                  <>
                    {t('customer_add_coffee_card') || 'Add Coffee Pass'} <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                  </>
                ) : (
                  <>
                    {t('auth_signup_button') || 'Get Your Pass'} <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                  </>
                )}
              </Button>
              <p className="text-center text-[11px] text-muted-foreground">
                {isAuthenticated
                  ? 'Instant 1-tap addition to your digital wallet'
                  : 'Sign up in seconds to start earning rewards'}
              </p>
            </div>

            {/* Quick Menu Preview Button if store has menu items */}
            {menuItems.length > 0 && (
              <button
                type="button"
                onClick={() => setActiveTab('menu')}
                className="w-full p-3.5 rounded-2xl border border-border/70 bg-card hover:bg-muted/30 flex items-center justify-between text-start shadow-2xs transition"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
                    <UtensilsCrossed className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground">View Store Menu &amp; Prices</p>
                    <p className="text-[11px] text-muted-foreground">{menuItems.length} drinks &amp; items available</p>
                  </div>
                </div>
                <Badge variant="secondary" className="text-[10px] font-bold">
                  Open Menu
                </Badge>
              </button>
            )}

            {/* Rewards Catalog Teaser */}
            {store.rewards.length > 0 && (
              <div className="rounded-3xl border border-border/70 bg-card p-4 text-start space-y-2.5 shadow-sm">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Rewards Catalog ({store.rewards.length})
                  </h4>
                  <Badge variant="outline" className="text-[10px] font-mono">
                    {store.pointsPerTnd} pts / 1 {currency}
                  </Badge>
                </div>

                <div className="space-y-2">
                  {store.rewards.slice(0, 3).map((r) => (
                    <div
                      key={r.id}
                      className="p-3 rounded-2xl border border-border/60 bg-muted/20 flex items-center justify-between"
                    >
                      <div className="space-y-0.5 min-w-0">
                        <p className="font-bold text-xs text-foreground truncate">{r.name}</p>
                        {r.description && (
                          <p className="text-[10px] text-muted-foreground line-clamp-1">{r.description}</p>
                        )}
                      </div>
                      <Badge variant="secondary" className="text-[10px] font-mono font-bold shrink-0">
                        {r.pointsCost} {t('pts') || 'pts'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
