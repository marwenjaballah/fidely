'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { Loader2 } from 'lucide-react'

function getRoleRedirectUrl(role: string): string {
  const isLocal =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1')

  switch (role) {
    case 'SUPER_ADMIN':
      return isLocal ? 'http://localhost:3005/overview' : 'https://admin.fidely.app/overview'
    case 'MERCHANT':
      return isLocal ? 'http://localhost:3004/overview' : 'https://business.fidely.app/overview'
    case 'CASHIER':
      return isLocal ? 'http://localhost:3003' : 'https://pos.fidely.app'
    case 'CUSTOMER':
    default:
      return isLocal ? 'http://localhost:3002/overview' : 'https://app.fidely.app/overview'
  }
}

export default function OverviewRouterPage() {
  const router = useRouter()
  const { profile, isAuthenticated, hasHydrated } = useAuth()

  useEffect(() => {
    if (!hasHydrated) return

    if (!isAuthenticated || !profile) {
      router.replace('/auth/login')
      return
    }

    const redirectUrl = getRoleRedirectUrl(profile.role)
    window.location.href = redirectUrl
  }, [hasHydrated, isAuthenticated, profile, router])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm font-medium text-muted-foreground">Redirecting to your workspace...</p>
      </div>
    </div>
  )
}
