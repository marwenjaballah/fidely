'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { useCustomerStore } from '@/store/customer-store'
import { useUserStore } from '@/store/user-store'
import { useToast } from '@/hooks/use-toast'
import { useI18n } from '@/lib/i18n'
import { Loader2 } from 'lucide-react'
import { ResponsiveCustomerView } from '@/features/customer/components/responsive-customer-view'

export default function CustomerOverviewPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { profile, signOut, isAuthenticated, hasHydrated, revalidateSession } = useAuth()
  const { updateProfile } = useUserStore()
  const { t } = useI18n()

  const {
    memberships,
    activeMembership,
    availableStores,
    loading,
    fetchOverview,
    setActiveMembership,
    joinStore,
    joinStoreBySlug,
    refreshQrToken,
  } = useCustomerStore()

  const [joiningStoreId, setJoiningStoreId] = useState<string | null>(null)
  const [isJoiningSlug, setIsJoiningSlug] = useState(false)
  const [joinSlugError, setJoinSlugError] = useState<string | null>(null)

  // Auth redirect protection
  useEffect(() => {
    if (hasHydrated && !isAuthenticated) {
      router.push('/auth/login')
    }
  }, [hasHydrated, isAuthenticated, router])

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
    await updateProfile({ phone })
    await revalidateSession()
    toast({
      title: t('profile_saved_title') || 'Phone Saved',
      description: t('profile_saved_desc') || 'Your phone number has been updated.',
    })
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
    <ResponsiveCustomerView
      memberships={memberships}
      activeMembership={activeMembership}
      availableStores={availableStores}
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
  )
}
