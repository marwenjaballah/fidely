'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ShieldCheck, Loader2, BellRing, Check, Coffee } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { useCustomerStore, CustomerActiveOrder } from '@/store/customer-store'
import { useUserStore } from '@/store/user-store'
import { useToast } from '@/hooks/use-toast'
import { useI18n } from '@/lib/i18n'
import { posAudio } from '@/features/cashier/lib/pos-audio'
import { ResponsiveCustomerView } from '@/features/customer/components/responsive-customer-view'

export interface CustomerScreenProps {
  isMerchant?: boolean
}

export function CustomerScreen({ isMerchant = false }: CustomerScreenProps) {
  const router = useRouter()
  const { toast } = useToast()
  const { profile, signOut, isAuthenticated, hasHydrated, revalidateSession } = useAuth()
  const { updateProfile } = useUserStore()
  const { t } = useI18n()

  const {
    memberships,
    activeMembership,
    availableStores,
    activeOrders,
    loading,
    fetchOverview,
    fetchActiveOrders,
    acknowledgeOrder,
    setActiveMembership,
    joinStore,
    joinStoreBySlug,
    refreshQrToken,
  } = useCustomerStore()

  const [joiningStoreId, setJoiningStoreId] = useState<string | null>(null)
  const [isJoiningSlug, setIsJoiningSlug] = useState(false)
  const [joinSlugError, setJoinSlugError] = useState<string | null>(null)
  const [readyAlertOrder, setReadyAlertOrder] = useState<CustomerActiveOrder | null>(null)
  const alertedOrderIdsRef = useRef<Set<string>>(new Set())

  // Auth redirect protection
  useEffect(() => {
    if (hasHydrated) {
      if (!isAuthenticated) {
        router.push('/auth/login')
      } else if (isMerchant) {
        if (profile?.role !== 'MERCHANT' && profile?.role !== 'SUPER_ADMIN') {
          router.replace('/customer/overview')
        }
      } else {
        // Standalone customer route: merchants redirected to /merchant/customer
        if (profile?.role === 'MERCHANT') {
          router.replace('/merchant/customer')
        }
      }
    }
  }, [hasHydrated, isAuthenticated, profile?.role, isMerchant, router])

  // Overview data fetching & pending referral join
  useEffect(() => {
    if (isAuthenticated) {
      fetchOverview()

      if (typeof window !== 'undefined') {
        const pending = localStorage.getItem('fidely_pending_join_store')
        if (pending) {
          joinStoreBySlug(pending)
            .then((joined) => {
              localStorage.removeItem('fidely_pending_join_store')
              toast({
                title: t('customer_join_success_title') || 'Welcome!',
                description: t('customer_join_success_desc', { name: joined.name }) || `Joined ${joined.name}`,
              })
            })
            .catch(() => {
              localStorage.removeItem('fidely_pending_join_store')
            })
        }
      }
    }
  }, [isAuthenticated, fetchOverview, joinStoreBySlug, toast, t])

  // Poll active self-service orders every 5s
  useEffect(() => {
    if (!isAuthenticated) return
    const interval = setInterval(() => {
      fetchActiveOrders()
    }, 5000)
    return () => clearInterval(interval)
  }, [isAuthenticated, fetchActiveOrders])

  // Trigger digital buzzer chime + vibration + modal when an order becomes READY
  useEffect(() => {
    const newlyReady = activeOrders.find(
      (o) => o.status === 'READY' && !alertedOrderIdsRef.current.has(o.id)
    )
    if (newlyReady) {
      alertedOrderIdsRef.current.add(newlyReady.id)
      posAudio.playOrderReadyBuzzer()
      setReadyAlertOrder(newlyReady)

      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        try {
          new Notification(`Order #${newlyReady.orderNumber} is Ready!`, {
            body: `Your order at ${newlyReady.storeName || 'the counter'} is ready for pickup.`,
          })
        } catch {
          // Ignore notification errors on unsupported browsers
        }
      }
    }
  }, [activeOrders])

  const handleAcknowledgeOrder = async (orderId: string) => {
    try {
      await acknowledgeOrder(orderId)
      if (readyAlertOrder?.id === orderId) {
        setReadyAlertOrder(null)
      }
      toast({
        title: 'Order Picked Up!',
        description: 'Enjoy your order!',
      })
    } catch {
      setReadyAlertOrder(null)
    }
  }

  const handleLogout = async () => {
    await signOut()
    router.push('/auth/login')
  }

  const handleJoinStore = async (storeId: string) => {
    setJoiningStoreId(storeId)
    try {
      await joinStore(storeId)
      toast({
        title: t('customer_join_success_title') || 'Pass added to wallet',
        description: t('customer_join_success_title') || 'Your loyalty pass is active.',
      })
    } catch (err: any) {
      toast({
        title: t('auth_generic_error') || 'Error',
        description: err.message || 'Could not join store',
        variant: 'destructive',
      })
    } finally {
      setJoiningStoreId(null)
    }
  }

  const handleJoinBySlug = async (slugOrCode: string) => {
    setIsJoiningSlug(true)
    setJoinSlugError(null)
    try {
      const joined = await joinStoreBySlug(slugOrCode)
      toast({
        title: t('customer_join_success_title') || 'Welcome!',
        description: t('customer_join_success_desc', { name: joined.name }) || `Added ${joined.name} pass!`,
      })
    } catch (err: any) {
      setJoinSlugError(err.message || t('scanner_invalid_qr') || 'Store not found')
      throw err
    } finally {
      setIsJoiningSlug(false)
    }
  }

  const handleRefreshQr = async (membershipId: string) => {
    try {
      await refreshQrToken(membershipId)
      toast({
        title: t('copied') || 'Pass refreshed',
        description: 'New dynamic security barcode generated.',
      })
    } catch (err: any) {
      toast({
        title: t('auth_generic_error') || 'Error',
        description: err.message || 'Failed to refresh pass',
        variant: 'destructive',
      })
    }
  }

  const handleSavePhone = async (phone: string) => {
    try {
      await updateProfile({ phone })
      await revalidateSession()
      toast({
        title: t('profile_saved_title') || 'Phone Saved',
        description: t('profile_saved_desc') || 'Your phone number has been updated.',
      })
    } catch (err: any) {
      const isDuplicate =
        err?.message?.toLowerCase().includes('already') ||
        err?.message?.toLowerCase().includes('registered') ||
        err?.message?.toLowerCase().includes('linked')
      const errorMessage = isDuplicate
        ? t('validation_phone_already_used') || err.message
        : err.message || t('settings_profile_error') || 'Failed to save phone number'

      toast({
        title: t('auth_generic_error') || 'Error',
        description: errorMessage,
        variant: 'destructive',
      })
      throw err
    }
  }

  if (loading && memberships.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">{t('loading') || 'Loading wallet...'}</p>
      </div>
    )
  }

  return (
    <>
      {/* Merchant Top Bar Header when operating in Merchant Customer Passes preview mode */}
      {isMerchant && (
        <div className="sticky top-0 z-50 flex items-center justify-between px-3 sm:px-6 py-2 bg-background/95 backdrop-blur border-b border-emerald-500/20 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>{t('merchant_customer_passes_banner') || 'Customer Passes Wallet'}</span>
            </span>
          </div>
          <Button asChild size="sm" variant="default" className="h-8 text-xs font-bold gap-1.5 rounded-full shadow-xs">
            <Link href="/merchant/overview">
              <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" />
              <span>{t('nav_back_to_dashboard') || 'Back to Dashboard'}</span>
            </Link>
          </Button>
        </div>
      )}

      <ResponsiveCustomerView
        memberships={memberships}
        activeMembership={activeMembership}
        availableStores={availableStores}
        activeOrders={activeOrders}
        onAcknowledgeOrder={handleAcknowledgeOrder}
        onSelectMembership={setActiveMembership}
        onRefreshQr={handleRefreshQr}
        onJoinStore={handleJoinStore}
        onJoinBySlug={handleJoinBySlug}
        onLogout={handleLogout}
        isJoining={isJoiningSlug}
        joiningStoreId={joiningStoreId}
        joinError={joinSlugError}
        userName={profile?.full_name || undefined}
        userEmail={profile?.email || undefined}
        userPhone={profile?.phone || undefined}
        onSavePhone={handleSavePhone}
      />

      {/* Celebratory Self-Service Order Ready Digital Buzzer Modal */}
      <Dialog
        open={Boolean(readyAlertOrder)}
        onOpenChange={(open) => {
          if (!open) setReadyAlertOrder(null)
        }}
      >
        <DialogContent className="sm:max-w-[400px] rounded-3xl border-emerald-500/40 bg-card text-center p-6">
          <DialogHeader className="items-center text-center space-y-3">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10 animate-bounce">
              <BellRing className="w-8 h-8" />
            </div>
            <DialogTitle className="text-2xl font-black tracking-tight text-foreground">
              Order #{readyAlertOrder?.orderNumber} is Ready!
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Your order at{' '}
              <span className="font-bold text-foreground">
                {readyAlertOrder?.storeName || activeMembership?.storeName || 'the counter'}
              </span>{' '}
              is hot and ready for pickup at the counter!
            </DialogDescription>
          </DialogHeader>

          {readyAlertOrder?.itemsSummary && (
            <div className="p-3 rounded-2xl bg-muted/50 border border-border/60 text-xs font-semibold text-foreground flex items-center justify-center gap-2 my-2">
              <Coffee className="w-4 h-4 text-primary shrink-0" />
              <span>{readyAlertOrder.itemsSummary}</span>
            </div>
          )}

          <div className="pt-2">
            <Button
              onClick={() => readyAlertOrder && handleAcknowledgeOrder(readyAlertOrder.id)}
              className="w-full h-12 rounded-2xl font-bold text-sm gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20"
            >
              <Check className="w-4 h-4" />
              <span>Got It — Heading to Counter!</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
