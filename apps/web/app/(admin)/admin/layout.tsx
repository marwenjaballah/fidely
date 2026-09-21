/**
 * @file app/(admin)/admin/layout.tsx
 *
 * Super Admin Dashboard Layout
 * Built with full parity to the Merchant dashboard layout:
 * - SidebarProvider with collapsible AdminSidebar
 * - Dynamic Breadcrumbs & SidebarInset
 * - Role authentication & security gates
 * - Language switcher & theme switcher
 * - Fluid responsive layout with zero horizontal overflow
 */

'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Sparkles, ShieldAlert } from 'lucide-react'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { useI18n } from '@/lib/i18n'
import { ThemeToggleButton } from '@/components/common/theme-toggle-button'
import { LanguageSwitcher } from '@/components/common/language-switcher'
import { AdminSidebar } from '@/components/common/admin-sidebar'
import { MobileHeader } from '@/components/mobile/mobile-header'
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, hasHydrated, profile } = useAuth()
  const { t, dir } = useI18n()
  const router = useRouter()
  const pathname = usePathname()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (isMounted && hasHydrated) {
      if (!isAuthenticated) {
        router.push('/auth/login')
      } else if (profile && profile.role !== 'SUPER_ADMIN') {
        router.push(
          profile.role === 'MERCHANT'
            ? '/merchant/overview'
            : profile.role === 'CASHIER'
            ? '/cashier'
            : '/customer/overview'
        )
      }
    }
  }, [isAuthenticated, hasHydrated, profile, router, isMounted])

  const breadcrumbs = useMemo(() => {
    const items: Array<{ title: string; href: string; isLast: boolean }> = [
      {
        title: t('admin_badge_super_admin'),
        href: '/admin/overview',
        isLast: pathname === '/admin' || pathname === '/admin/overview',
      },
    ]

    if (pathname === '/admin' || pathname === '/admin/overview') {
      items.push({
        title: t('admin_nav_overview'),
        href: '/admin/overview',
        isLast: true,
      })
      return items
    }

    if (pathname.startsWith('/admin/stores')) {
      items.push({
        title: t('admin_nav_stores'),
        href: '/admin/stores',
        isLast: true,
      })
    } else if (pathname.startsWith('/admin/users')) {
      items.push({
        title: t('admin_nav_users'),
        href: '/admin/users',
        isLast: true,
      })
    } else if (pathname.startsWith('/admin/transactions')) {
      items.push({
        title: t('admin_nav_transactions'),
        href: '/admin/transactions',
        isLast: true,
      })
    }

    return items
  }, [pathname, t])

  if (!isMounted || !hasHydrated) {
    return (
      <div className="min-h-svh flex items-center justify-center bg-background" dir={dir}>
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground font-medium">{t('admin_verifying')}</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || profile?.role !== 'SUPER_ADMIN') {
    return (
      <div className="min-h-svh flex items-center justify-center bg-background" dir={dir}>
        <div className="text-center p-8 max-w-md">
          <ShieldAlert className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-bold">{t('admin_restricted_title')}</h2>
          <p className="text-muted-foreground text-sm mt-2">{t('admin_restricted_desc')}</p>
          <Button className="mt-6" onClick={() => router.push('/auth/login')}>
            {t('admin_return_login')}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-svh" dir={dir}>
      <SidebarProvider>
        <AdminSidebar />
        <SidebarInset>
          {/* Mobile Top Bar with 1-Tap Scene Switcher (<md) */}
          <MobileHeader scene="admin" />

          {/* Header with Parity to Merchant UI (md+) */}
          <header className="sticky top-0 z-40 hidden md:flex h-12 md:h-14 lg:h-16 shrink-0 items-center gap-2 px-2 sm:px-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
            <div className="flex flex-1 items-center gap-1 sm:gap-2 min-w-0">
              <SidebarTrigger className="-ms-1 shrink-0" />
              <Separator
                orientation="vertical"
                className="me-1 sm:me-2 data-[orientation=vertical]:h-4 shrink-0"
              />
              <Breadcrumb className="min-w-0">
                <BreadcrumbList className="flex-nowrap">
                  {breadcrumbs.map((crumb, index) => (
                    <div key={`${crumb.href}-${index}`} className="flex items-center">
                      {index > 0 && <BreadcrumbSeparator className="hidden md:block" />}
                      <BreadcrumbItem className={index === 0 ? 'hidden md:block' : 'max-w-[120px] sm:max-w-none truncate'}>
                        {crumb.isLast ? (
                          <BreadcrumbPage className="truncate text-xs sm:text-sm">{crumb.title}</BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink asChild>
                            <Link href={crumb.href}>{crumb.title}</Link>
                          </BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                    </div>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>
            </div>

            {/* Quick Header Controls */}
            <div className="ms-auto flex items-center gap-1 sm:gap-2 shrink-0">
              <Badge
                variant="outline"
                className="hidden sm:flex items-center gap-1.5 border-primary/30 text-primary bg-primary/5 py-1 px-2.5 text-xs font-semibold"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>{t('admin_global_admin_mode')}</span>
              </Badge>
              <div className="hidden md:block">
                <LanguageSwitcher />
              </div>
              <ThemeToggleButton />
            </div>
          </header>

          {/* Main Content Viewport */}
          <main className="flex-1 flex flex-col overflow-y-auto p-4 md:p-8 space-y-6">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}
