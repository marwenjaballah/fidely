'use client'

import React from 'react'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerClose,
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { Check, Plus, Store, X } from 'lucide-react'
import { useMerchantStore } from '@/store/merchant-store'
import { useI18n } from '@/lib/i18n'
import { posHaptics } from '@/lib/haptics'
import { AppScene } from './store-command-pill'

interface StoreSwitcherDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  scene?: AppScene
  onCreateStoreClick?: () => void
}

export function StoreSwitcherDrawer({
  open,
  onOpenChange,
  onCreateStoreClick,
}: StoreSwitcherDrawerProps) {
  const { t, dir } = useI18n()

  const {
    stores: merchantStores,
    activeStore: activeMerchantStore,
    setActiveStore: setActiveMerchantStore,
  } = useMerchantStore()

  const handleMerchantSelect = (storeId: string) => {
    posHaptics.tap()
    setActiveMerchantStore(storeId)
    onOpenChange(false)
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent
        dir={dir}
        className="max-w-lg mx-auto p-4 pb-8 rounded-t-3xl border-t border-border/80 bg-background/95 backdrop-blur-2xl"
      >
        {/* Pull Notch */}
        <div className="mx-auto w-12 h-1.5 rounded-full bg-muted-foreground/30 mb-4" />

        <DrawerHeader className="p-0 mb-4 text-start">
          <div className="flex items-center justify-between">
            <div>
              <DrawerTitle className="text-base font-black tracking-tight">
                {t('store_switcher_my_stores') || 'My Stores'}
              </DrawerTitle>
              <DrawerDescription className="text-xs text-muted-foreground">
                Manage and switch between your business branches
              </DrawerDescription>
            </div>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                <X className="h-4 w-4" />
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        {/* ── MERCHANT STORES LIST ── */}
        <div className="space-y-3">
          <div className="max-h-[340px] overflow-y-auto space-y-2 pe-1">
            {merchantStores.length === 0 ? (
              <div className="p-6 rounded-2xl bg-muted/30 border border-border/60 text-center text-xs text-muted-foreground">
                No stores created yet.
              </div>
            ) : (
              merchantStores.map((s) => {
                const isSelected = activeMerchantStore?.id === s.id
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handleMerchantSelect(s.id)}
                    className={`w-full flex items-center justify-between p-3.5 rounded-2xl border transition-all active:scale-[0.98] text-start ${
                      isSelected
                        ? 'border-primary bg-primary/10 shadow-xs ring-1 ring-primary/40'
                        : 'border-border/60 bg-card hover:bg-muted/40'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="h-10 w-10 rounded-xl flex items-center justify-center font-bold overflow-hidden border border-border/40 shrink-0"
                        style={{ backgroundColor: s.primaryColor ? `${s.primaryColor}25` : undefined }}
                      >
                        {s.logoUrl ? (
                          <img src={s.logoUrl} alt={s.name} className="h-full w-full object-cover" />
                        ) : (
                          <Store className="h-5 w-5 text-primary" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-foreground truncate">{s.name}</p>
                        <p className="text-[11px] text-muted-foreground font-mono">
                          fidely.app/{s.slug}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 ms-2">
                      {isSelected && <Check className="w-4 h-4 text-primary shrink-0" />}
                    </div>
                  </button>
                )
              })
            )}
          </div>

          {/* Quick Action: Create New Store */}
          {onCreateStoreClick && (
            <Button
              variant="outline"
              onClick={() => {
                onOpenChange(false)
                onCreateStoreClick()
              }}
              className="w-full h-11 rounded-2xl text-xs font-bold gap-2 border-dashed border-primary/50 text-primary hover:bg-primary/5"
            >
              <Plus className="w-4 h-4" />
              <span>{t('overview_add_store') || 'Create New Store'}</span>
            </Button>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  )
}
