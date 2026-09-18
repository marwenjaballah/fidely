'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { Loader2 } from 'lucide-react'

export default function OverviewRouterPage() {
  const router = useRouter()
  const { profile, isAuthenticated, hasHydrated } = useAuth()

  useEffect(() => {
    if (!hasHydrated) return

    if (!isAuthenticated || !profile) {
      router.replace('/auth/login')
      return
    }

    switch (profile.role) {
      case 'SUPER_ADMIN':
        router.replace('/admin/overview')
        break
      case 'MERCHANT':
        router.replace('/merchant/overview')
        break
      case 'CASHIER':
        router.replace('/cashier')
        break
      case 'CUSTOMER':
      default:
        router.replace('/customer/overview')
        break
    }
  }, [hasHydrated, isAuthenticated, profile, router])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm font-medium text-muted-foreground">Redirecting to your dashboard...</p>
      </div>
    </div>
  )
}
