'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { QRCodeSVG } from 'qrcode.react'
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
  Smartphone,
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
import { StorePublicData } from '../mobile/store-mobile-view'

interface StoreDesktopViewProps {
  store: StorePublicData
  isAuthenticated: boolean
  joining: boolean
  onJoinClick: () => void
}

export function StoreDesktopView({
  store,
  isAuthenticated,
  joining,
  onJoinClick,
}: StoreDesktopViewProps) {
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

  const storeUrl = typeof window !== 'undefined' ? window.location.href : `https://fidely.app/store/${store.slug}`

  const handleShareMenu = () => {
    const shareUrl = `${window.location.origin}/store/${store.slug}?tab=menu`
    navigator.clipboard.writeText(shareUrl)
    setSharedCopied(true)
    setTimeout(() => setSharedCopied(false), 2000)
  }

  return (
    <div className="hidden md:flex flex-col min-h-screen bg-slate-50 dark:bg-zinc-950 text-foreground" dir={dir}>
      {/* Header */}
      <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between border-b border-border/60 bg-background/95 px-8 backdrop-blur">
        <div className="flex items-center gap-4">
          <Link href={isAuthenticated ? "/customer/overview" : "/"} className="flex items-center gap-2 group">
            <FidelyLogo size="md" variant="subtle" className="transition-transform group-hover:scale-105" />
            <span className="font-extrabold text-lg tracking-tight text-foreground">{BRAND_NAME}</span>
          </Link>

          <div className="flex items-center p-1 rounded-xl bg-muted border border-border/60">
            <button
              type="button"
              onClick={() => setActiveTab('pass')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'pass'
                  ? 'bg-background text-foreground shadow-2xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <QrCode className="w-3.5 h-3.5 text-primary" />
              <span>Loyalty Pass</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('menu')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'menu'
                  ? 'bg-background text-foreground shadow-2xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <UtensilsCrossed className="w-3.5 h-3.5 text-primary" />
              <span>Store Menu &amp; Prices ({menuItems.length})</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleShareMenu}
            className="gap-1.5 text-xs font-bold"
          >
            {sharedCopied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Share2 className="h-3.5 w-3.5" />}
            <span>{sharedCopied ? 'Menu Link Copied!' : 'Share Menu'}</span>
          </Button>
          <LanguageSwitcher />
          <ThemeToggleButton />
        </div>
      </header>

      {/* Main 2-Column Showcase */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-8 my-auto">
        <div className="grid grid-cols-12 gap-8 items-start">
          {/* Left Column: Authentic Pass Preview */}
          <div className="col-span-5 space-y-4 sticky top-24">
            <AppleWalletPass
              storeName={store.name}
              logoUrl={store.logoUrl}
              primaryColor={store.primaryColor || '#D97706'}
              pointsBalance={0}
              pointsPerTnd={store.pointsPerTnd}
              qrCodeToken={`JOIN:${store.slug}`}
              memberName={isAuthenticated ? t('card_member') || 'Member' : t('card_fallback_customer') || 'Customer'}
              memberSince={t('card_available_now') || 'Available Now'}
              rewardsCount={store.rewards.length}
              nextRewardName={store.rewards[0]?.name}
              nextRewardCost={store.rewards[0]?.pointsCost}
              showQr={true}
              interactive={true}
            />

            <Button
              size="lg"
              onClick={onJoinClick}
              disabled={joining}
              className="w-full text-sm font-bold shadow-lg gap-2 h-12 px-6 rounded-2xl bg-primary text-primary-foreground"
            >
              {joining ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> {t('loading') || 'Joining...'}
                </>
              ) : isAuthenticated ? (
                <>
                  {t('customer_add_coffee_card') || 'Add Pass to Wallet'} <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                </>
              ) : (
                <>
                  {t('auth_signup_button') || 'Sign Up & Get Pass'} <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                </>
              )}
            </Button>
          </div>

          {/* Right Column: Store Details / Menu & Actions */}
          <div className="col-span-7 space-y-6 text-start">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-mono text-xs">
                  {store.pointsPerTnd} pts / 1 {currency}
                </Badge>
                {hasWelcomeBonus && (
                  <Badge className="bg-primary text-primary-foreground font-mono text-xs">
                    +{store.welcomePoints} pts Welcome Bonus
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl font-black tracking-tight">
                {activeTab === 'menu' ? `${store.name} Menu` : `${store.name} Loyalty Program`}
              </h1>
              <p className="text-sm text-muted-foreground">
                {activeTab === 'menu'
                  ? `Explore our freshly prepared drinks & items. Every 1 ${currency} spent earns you ${store.pointsPerTnd} loyalty points!`
                  : `Earn points with every purchase at ${store.name} and unlock exclusive rewards.`}
              </p>
            </div>

            {activeTab === 'menu' ? (
              <div className="space-y-4">
                {categories.length > 2 && (
                  <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                          selectedCategory === cat
                            ? 'bg-primary text-primary-foreground shadow-xs'
                            : 'bg-card border border-border/60 text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {cat === 'ALL' ? 'All Items' : cat}
                      </button>
                    ))}
                  </div>
                )}

                {filteredMenu.length === 0 ? (
                  <div className="p-10 rounded-3xl border border-dashed border-border bg-card text-center space-y-2 text-muted-foreground">
                    <Coffee className="w-8 h-8 mx-auto opacity-40" />
                    <p className="text-sm font-semibold">No menu items published yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {filteredMenu.map((item) => {
                      const earnedPts = Math.max(1, Math.round(item.price * (store.pointsPerTnd || 10)))
                      return (
                        <div
                          key={item.id}
                          className="p-4 rounded-2xl border border-border/70 bg-card flex items-start justify-between gap-3 shadow-2xs hover:shadow-md transition"
                        >
                          <div className="flex items-start gap-3 min-w-0">
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
                            <div className="space-y-0.5 min-w-0">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                {item.category}
                              </span>
                              <p className="font-bold text-sm text-foreground truncate">{item.name}</p>
                              {item.description && (
                                <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
                              )}
                            </div>
                          </div>

                          <div className="text-end shrink-0">
                            <Badge className="font-mono font-bold text-xs bg-foreground text-background">
                              {item.price.toFixed(2)} {currency}
                            </Badge>
                            <p className="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                              +{earnedPts} pts
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* Scan with Phone Card */}
                <div className="p-4 rounded-3xl border border-border/70 bg-card flex items-center gap-4 shadow-sm">
                  <div className="p-2 bg-white rounded-xl shadow-xs shrink-0">
                    <QRCodeSVG value={storeUrl} size={84} level="M" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                      <Smartphone className="w-4 h-4 text-primary" />
                      <span>Scan with your phone</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Point your phone&apos;s camera at this QR code to open and save this pass on your mobile device.
                    </p>
                  </div>
                </div>

                {/* Quick Menu Teaser if Store has Menu Items */}
                {menuItems.length > 0 && (
                  <div className="p-4 rounded-3xl border border-primary/25 bg-primary/5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                        <UtensilsCrossed className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">Explore {store.name}&apos;s Digital Menu</p>
                        <p className="text-xs text-muted-foreground">
                          Browse {menuItems.length} drinks &amp; items with prices and loyalty points.
                        </p>
                      </div>
                    </div>
                    <Button size="sm" variant="default" onClick={() => setActiveTab('menu')} className="rounded-xl text-xs font-bold">
                      View Menu
                    </Button>
                  </div>
                )}

                {/* Rewards Catalog */}
                {store.rewards.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Available Rewards ({store.rewards.length})
                    </h3>
                    <div className="grid grid-cols-2 gap-2.5">
                      {store.rewards.map((r) => (
                        <div key={r.id} className="p-3 rounded-2xl border border-border/60 bg-muted/20 space-y-1">
                          <p className="font-bold text-xs text-foreground truncate">{r.name}</p>
                          <p className="text-[11px] font-mono text-primary font-bold">{r.pointsCost} pts</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
