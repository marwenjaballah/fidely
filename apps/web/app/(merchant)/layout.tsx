'use client'

import { AppSidebar } from '@/components/common/app-sidebar'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { strings } from '@/lib/strings'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Settings } from 'lucide-react'
import { ThemeToggleButton } from '@/components/common/theme-toggle-button'
import { StoreSwitcher } from '@/components/common/store-switcher'
import { useMerchantStore } from '@/store/merchant-store'

/**
 * Merchant Dashboard Layout
 * 
 * Wraps all merchant dashboard pages with:
 * - Authentication & role protection
 * - Sidebar navigation
 * - Header with breadcrumbs and store switcher
 * - Responsive structure
 */
export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { isAuthenticated, hasHydrated, profile } = useAuth()
    const { fetchStores } = useMerchantStore()
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
            } else if (profile && profile.role !== 'MERCHANT' && profile.role !== 'SUPER_ADMIN') {
                // If not merchant or super admin, redirect to role-specific overview
                router.push('/overview')
            } else if (isAuthenticated) {
                fetchStores()
            }
        }
    }, [isMounted, hasHydrated, isAuthenticated, profile, router, fetchStores])

    // Generate dynamic, clean breadcrumbs based on current pathname
    const breadcrumbs = useMemo(() => {
        const items: Array<{ title: string; href: string; isLast: boolean }> = [
            {
                title: 'Merchant',
                href: '/merchant/overview',
                isLast: pathname === '/merchant' || pathname === '/merchant/overview',
            },
        ]

        if (pathname === '/merchant' || pathname === '/merchant/overview') {
            items.push({
                title: strings.dashboard_overview,
                href: '/merchant/overview',
                isLast: true,
            })
            return items
        }

        if (pathname.startsWith('/merchant/crm')) {
            items.push({
                title: 'CRM',
                href: '/merchant/crm',
                isLast: true,
            })
        } else if (pathname.startsWith('/merchant/staff')) {
            items.push({
                title: 'Staff',
                href: '/merchant/staff',
                isLast: true,
            })
        } else if (pathname.startsWith('/merchant/analytics')) {
            items.push({
                title: 'Analytics',
                href: '/merchant/analytics',
                isLast: true,
            })
        } else if (pathname.startsWith('/merchant/settings')) {
            const isStore = pathname.includes('/store')
            const isAccount = pathname.includes('/account')

            items.push({
                title: strings.dashboard_settings,
                href: '/merchant/settings/store',
                isLast: !isStore && !isAccount,
            })

            if (isStore) {
                items.push({
                    title: 'Store & Rewards',
                    href: '/merchant/settings/store',
                    isLast: true,
                })
            } else if (isAccount) {
                items.push({
                    title: strings.nav_account_settings,
                    href: '/merchant/settings/account',
                    isLast: true,
                })
            }
        } else {
            // Fallback for custom or nested sub-pages
            const subPath = pathname.replace('/merchant/', '')
            const segments = subPath.split('/').filter(Boolean)
            let currentHref = '/merchant'
            segments.forEach((seg, idx) => {
                currentHref += `/${seg}`
                items.push({
                    title: seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' '),
                    href: currentHref,
                    isLast: idx === segments.length - 1,
                })
            })
        }

        return items
    }, [pathname])

    // Show loading state while checking authentication and hydrating
    if (!isMounted || !hasHydrated) {
        return (
            <div className="min-h-svh flex items-center justify-center">
                <div className="text-muted-foreground">
                    {strings.loading}
                </div>
            </div>
        )
    }

    // Don't render dashboard if not authenticated or unauthorized
    if (!isAuthenticated || (profile && profile.role !== 'MERCHANT' && profile.role !== 'SUPER_ADMIN')) {
        return (
            <div className="min-h-svh flex items-center justify-center">
                <div className="text-muted-foreground">
                    {strings.dashboard_redirect_login}
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-svh">
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-2 px-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
                        <div className="flex flex-1 items-center gap-2">
                            <SidebarTrigger className="-ml-1" />
                            <Separator
                                orientation="vertical"
                                className="mr-2 data-[orientation=vertical]:h-4"
                            />
                            <Breadcrumb>
                                <BreadcrumbList>
                                    {breadcrumbs.map((crumb, index) => (
                                        <div key={`${crumb.href}-${index}`} className="flex items-center">
                                            {index > 0 && (
                                                <BreadcrumbSeparator className="hidden md:block" />
                                            )}
                                            <BreadcrumbItem className={index === 0 ? 'hidden md:block' : ''}>
                                                {crumb.isLast ? (
                                                    <BreadcrumbPage>{crumb.title}</BreadcrumbPage>
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
                        <div className="ml-auto flex items-center gap-2">
                            <StoreSwitcher variant="header" />
                            <ThemeToggleButton />
                            <Button variant="outline" size="icon" asChild aria-label={strings.nav_account_settings}>
                                <Link href="/merchant/settings/account">
                                    <Settings className="h-4 w-4" />
                                </Link>
                            </Button>
                        </div>
                    </header>
                    <main className="flex flex-1 flex-col overflow-hidden">
                        {children}
                    </main>
                </SidebarInset>
            </SidebarProvider>
        </div>
    )
}
