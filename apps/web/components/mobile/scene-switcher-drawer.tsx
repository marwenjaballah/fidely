'use client'

import React from 'react'
import { useRouter, usePathname } from 'next/navigation'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { useI18n } from '@/lib/i18n'
import { posHaptics } from '@/lib/haptics'
import {
  CreditCard,
  Calculator,
  LayoutDashboard,
  ShieldAlert,
  Check,
  ChevronRight,
  Sparkles,
  ArrowRight,
  X,
} from 'lucide-react'

export type AppScene = 'cashier' | 'merchant' | 'customer' | 'admin'

interface SceneSwitcherDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentScene?: AppScene
}

interface SceneOption {
  id: AppScene
  title: string
  subtitle: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
  color: string
  bgColor: string
  borderColor: string
}

export function SceneSwitcherDrawer({
  open,
  onOpenChange,
  currentScene,
}: SceneSwitcherDrawerProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { profile } = useAuth()
  const { t, isRtl, dir } = useI18n()

  // Detect current scene from pathname if not explicitly passed
  const activeScene: AppScene =
    currentScene ||
    (pathname.startsWith('/cashier')
      ? 'cashier'
      : pathname.startsWith('/merchant')
      ? 'merchant'
      : pathname.startsWith('/admin')
      ? 'admin'
      : 'customer')

  const scenes: SceneOption[] = [
    {
      id: 'customer',
      title: t('customer_scene_title') || 'Customer Wallet',
      subtitle: t('customer_scene_desc') || 'Digital loyalty cards, stamps, rewards & store exploration',
      href: '/customer/overview',
      icon: CreditCard,
      color: 'text-amber-500 dark:text-amber-400',
      bgColor: 'bg-amber-500/10 dark:bg-amber-500/20',
      borderColor: 'border-amber-500/30',
    },
    {
      id: 'cashier',
      title: t('cashier_scene_title') || 'Cashier POS Terminal',
      subtitle: t('cashier_scene_desc') || 'Fast keypad checkout, counter scanner, perks redemption & shift stats',
      href: '/cashier',
      icon: Calculator,
      color: 'text-emerald-500 dark:text-emerald-400',
      bgColor: 'bg-emerald-500/10 dark:bg-emerald-500/20',
      borderColor: 'border-emerald-500/30',
    },
    {
      id: 'merchant',
      title: t('merchant_scene_title') || 'Merchant Commander',
      subtitle: t('merchant_scene_desc') || 'Business analytics, card design, customer CRM & team management',
      href: '/merchant/overview',
      icon: LayoutDashboard,
      color: 'text-primary dark:text-primary',
      bgColor: 'bg-primary/10 dark:bg-primary/20',
      borderColor: 'border-primary/30',
    },
  ]

  // Add Super Admin scene if authorized
  if (profile?.role === 'SUPER_ADMIN') {
    scenes.push({
      id: 'admin',
      title: t('admin_scene_title') || 'Global Admin',
      subtitle: t('admin_scene_desc') || 'System stores, user management, and platform oversight',
      href: '/admin/overview',
      icon: ShieldAlert,
      badge: 'Admin',
      color: 'text-violet-500 dark:text-violet-400',
      bgColor: 'bg-violet-500/10 dark:bg-violet-500/20',
      borderColor: 'border-violet-500/30',
    })
  }

  const handleSelectScene = (scene: SceneOption) => {
    posHaptics.tap()
    onOpenChange(false)
    if (scene.id !== activeScene) {
      router.push(scene.href)
    }
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent dir={dir} className="max-w-lg mx-auto p-4 pb-8 rounded-t-3xl border-t border-border/80 bg-background/95 backdrop-blur-2xl">
        {/* Drag handle pill */}
        <div className="mx-auto w-12 h-1.5 rounded-full bg-muted-foreground/30 mb-4" />

        <DrawerHeader className="p-0 mb-4 text-start">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <DrawerTitle className="text-lg font-black tracking-tight">
                  {t('scene_switcher_title') || 'Switch Mode & Scene'}
                </DrawerTitle>
              </div>
              <DrawerDescription className="text-xs text-muted-foreground">
                {t('scene_switcher_subtitle') || 'Select the experience you want to use on this device'}
              </DrawerDescription>
            </div>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                <X className="h-4 w-4" />
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        {/* Scene List */}
        <div className="space-y-2.5">
          {scenes.map((scene) => {
            const Icon = scene.icon
            const isCurrent = scene.id === activeScene

            return (
              <button
                key={scene.id}
                type="button"
                onClick={() => handleSelectScene(scene)}
                className={`w-full flex items-center gap-3.5 p-3.5 rounded-2xl border transition-all text-start group active:scale-[0.98] ${
                  isCurrent
                    ? 'border-primary bg-primary/10 shadow-sm'
                    : 'border-border/60 bg-card hover:bg-muted/40 hover:border-border'
                }`}
              >
                {/* Scene Icon */}
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${scene.bgColor} ${scene.borderColor} ${scene.color} transition-transform group-hover:scale-105`}
                >
                  <Icon className="h-5 w-5" />
                </div>

                {/* Text Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold tracking-tight text-foreground truncate">
                      {scene.title}
                    </span>
                    {scene.badge && (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                        {scene.badge}
                      </Badge>
                    )}
                    {isCurrent && (
                      <Badge variant="default" className="text-[9px] font-bold px-1.5 py-0 h-4 bg-primary text-primary-foreground">
                        {t('active') || 'Active'}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground leading-snug mt-0.5 line-clamp-1">
                    {scene.subtitle}
                  </p>
                </div>

                {/* Trailing Check or Arrow */}
                <div className="shrink-0 flex items-center">
                  {isCurrent ? (
                    <div className="h-6 w-6 rounded-full bg-primary/20 text-primary flex items-center justify-center">
                      <Check className="h-3.5 w-3.5 stroke-[3]" />
                    </div>
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground/60 rtl:rotate-180 group-hover:text-foreground transition-colors" />
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </DrawerContent>
    </Drawer>
  )
}
