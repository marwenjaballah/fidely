'use client'

import React, { useState } from 'react'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerClose,
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Phone,
  Search,
  UserCheck,
  X,
  Loader2,
  Coins,
  Gift,
  Check,
} from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import { posHaptics } from '@/lib/haptics'
import { SearchedCustomer } from '../transaction-panel'

interface CashierPhoneLookupSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCustomerFound: (customer: SearchedCustomer) => void
  storeId?: string
  apiClient: any
}

export function CashierPhoneLookupSheet({
  open,
  onOpenChange,
  onCustomerFound,
  storeId,
  apiClient,
}: CashierPhoneLookupSheetProps) {
  const { t, dir } = useI18n()
  const [phoneQuery, setPhoneQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const clean = phoneQuery.replace(/\D/g, '')
    if (!clean || clean.length < 4 || !storeId) return

    setIsLoading(true)
    setError(null)
    posHaptics.tap()

    try {
      const { data } = await apiClient.get('/api/v1/transactions/lookup-by-phone', {
        params: { phone: clean, storeId },
      })
      const results = Array.isArray(data) ? data : data ? [data] : []
      if (results.length === 0) {
        throw new Error(t('cashier_customer_not_found') || 'No customer found with this phone number')
      }
      const raw = results[0]
      const customer: SearchedCustomer = {
        id: raw.customerId || raw.id,
        fullName: raw.fullName || raw.phone || 'Customer',
        phone: raw.phone || clean,
        qrToken: raw.qrToken || raw.qrCodeToken || `${raw.customerId || raw.id}:${storeId}`,
        pointsBalance: typeof raw.pointsBalance === 'number' ? raw.pointsBalance : 0,
      }
      posHaptics.scan()
      onCustomerFound(customer)
      onOpenChange(false)
      setPhoneQuery('')
    } catch (err: any) {
      posHaptics.error()
      setError(err?.message || t('cashier_customer_not_found') || 'Customer not found')
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeypadTap = (digit: string) => {
    posHaptics.tap()
    if (digit === 'DEL') {
      setPhoneQuery((prev) => prev.slice(0, -1))
    } else {
      setPhoneQuery((prev) => prev + digit)
    }
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent
        dir={dir}
        className="max-w-md mx-auto p-4 pb-8 rounded-t-3xl border-t border-border/80 bg-background/95 backdrop-blur-2xl"
      >
        <div className="mx-auto w-12 h-1.5 rounded-full bg-muted-foreground/30 mb-3" />

        <DrawerHeader className="p-0 mb-3 text-start">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-primary/15 text-primary flex items-center justify-center font-bold">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <DrawerTitle className="text-base font-black tracking-tight">
                  {t('cashier_forgot_phone_prompt') || 'Lookup by Phone Number'}
                </DrawerTitle>
                <DrawerDescription className="text-xs text-muted-foreground">
                  Award points or redeem rewards using customer phone digits
                </DrawerDescription>
              </div>
            </div>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                <X className="h-4 w-4" />
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        <form onSubmit={handleSearch} className="space-y-3">
          <div className="relative">
            <Input
              type="tel"
              dir="ltr"
              value={phoneQuery}
              onChange={(e) => setPhoneQuery(e.target.value)}
              placeholder="e.g. 55 123 456"
              className="h-12 text-base font-mono font-bold tracking-wider text-center rounded-2xl bg-card border-border/70"
            />
            {phoneQuery && (
              <button
                type="button"
                onClick={() => setPhoneQuery('')}
                className="absolute right-3 top-3.5 text-muted-foreground hover:text-foreground text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick Numpad Grid */}
          <div className="grid grid-cols-3 gap-2 pt-1 select-none">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'DEL'].map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => handleKeypadTap(k)}
                className={`h-11 rounded-2xl border border-border/50 text-base font-bold font-mono active:scale-95 transition-all shadow-2xs ${
                  k === 'DEL'
                    ? 'col-span-2 bg-muted/60 text-muted-foreground hover:bg-muted'
                    : 'bg-card text-foreground hover:bg-muted/40'
                }`}
              >
                {k}
              </button>
            ))}
          </div>

          {error && (
            <p className="text-xs text-destructive bg-destructive/10 p-2.5 rounded-xl border border-destructive/20 text-center font-medium">
              {error}
            </p>
          )}

          <Button
            type="submit"
            disabled={isLoading || phoneQuery.length < 4}
            className="w-full h-12 rounded-2xl text-xs font-bold gap-2 shadow-md bg-primary text-primary-foreground mt-2"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            <span>{t('cashier_search_customer_btn') || 'Find Customer'}</span>
          </Button>
        </form>
      </DrawerContent>
    </Drawer>
  )
}
