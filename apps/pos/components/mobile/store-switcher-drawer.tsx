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
import { Check, Store, X } from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import { posHaptics } from '@/lib/haptics'
import { AppScene } from './store-command-pill'

export interface CashierStoreItem {
  id: string
  name: string
  slug: string
  primaryColor?: string
  pointsPerTnd?: number
}

interface StoreSwitcherDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  scene?: AppScene
  cashierStores?: CashierStoreItem[]
  activeCashierStoreId?: string
  onSelectCashierStore?: (storeId: string) => void
  onOpenScanStand?: () => void
  onCreateStoreClick?: () => void
}

export function StoreSwitcherDrawer({
  open,
  onOpenChange,
  cashierStores = [],
  activeCashierStoreId,
  onSelectCashierStore,
}: StoreSwitcherDrawerProps) {
  const { t, dir } = useI18n()
  const tt = t as (key: string) => string

  const handleCashierSelect = (storeId: string) => {
    posHaptics.tap()
    onSelectCashierStore?.(storeId)
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
                {tt('cashier_switch_store_title') || 'Switch POS Register'}
              </DrawerTitle>
              <DrawerDescription className="text-xs text-muted-foreground">
                {tt('cashier_switch_store_desc') || 'Select the active branch register for this shift'}
              </DrawerDescription>
            </div>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                <X className="h-4 w-4" />
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        <div className="space-y-2 max-h-[340px] overflow-y-auto pe-1">
          {cashierStores.length === 0 ? (
            <div className="p-6 rounded-2xl bg-muted/30 border border-border/60 text-center space-y-2">
              <Store className="h-8 w-8 text-muted-foreground/40 mx-auto" />
              <p className="text-xs text-muted-foreground">
                {tt('cashier_no_stores_found') || 'No stores assigned to your staff account.'}
              </p>
            </div>
          ) : (
            cashierStores.map((s) => {
              const isSelected = activeCashierStoreId === s.id
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => handleCashierSelect(s.id)}
                  className={`w-full flex items-center justify-between p-3.5 rounded-2xl border transition-all active:scale-[0.98] text-start ${
                    isSelected
                      ? 'border-primary bg-primary/10 shadow-xs ring-1 ring-primary/40'
                      : 'border-border/60 bg-card hover:bg-muted/40'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="h-10 w-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 shadow-xs"
                      style={{
                        backgroundColor: s.primaryColor ? `${s.primaryColor}25` : 'hsl(var(--primary) / 0.15)',
                        color: s.primaryColor || 'hsl(var(--primary))',
                      }}
                    >
                      <Store className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate leading-tight">{s.name}</p>
                      <p className="text-xs text-muted-foreground truncate font-mono mt-0.5">
                        {s.pointsPerTnd ? `${s.pointsPerTnd} pts / TND` : 'Active Register'}
                      </p>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground shrink-0 shadow-xs">
                      <Check className="h-3.5 w-3.5 stroke-[3]" />
                    </div>
                  )}
                </button>
              )
            })
          )}
        </div>
      </DrawerContent>
    </Drawer>
  )
}
