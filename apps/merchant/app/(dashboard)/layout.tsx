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
import { useI18n } from '@/lib/i18n'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Settings } from 'lucide-react'
import { ThemeToggleButton } from '@/components/common/theme-toggle-button'
import { StoreSwitcher } from '@/components/common/store-switcher'
import { useMerchantStore } from '@/store/merchant-store'
import { LanguageSwitcher } from '@/components/common/language-switcher'
import { MobileHeader } from '@/components/mobile/mobile-header'
import { MerchantBottomNav } from '@/components/mobile/merchant-bottom-nav'

/**
 * Merchant Dashboard Layout
 * 
 * Wraps all merchant dashboard pages with:
 * - Authentication & role protection
 * - Sidebar navigation (Desktop) & Bottom navigation (Mobile)
 * - Header with breadcrumbs, language switcher, and store switcher
 * - Responsive structure & 1-tap Scene Switcher
 */
export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { isAuthenticated, hasHydrated, profile } = useAuth()
    const { fetchStores, activeStore } = useMerchantStore()
    const { t } = useI18n()

    const router = useRouter()
    const pathname = usePathname()
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    useEffect(() => {
        if (isMounted && hasHydrated) {
            if (!isAuthenticated) {
                router.push('/login')
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
                title: t('nav_merchant'),
                href: '/merchant/overview',
                isLast: pathname === '/merchant' || pathname === '/merchant/overview',
            },
        ]

        if (pathname === '/merchant' || pathname === '/merchant/overview') {
            items.push({
                title: t('dashboard_overview'),
                href: '/merchant/overview',
                isLast: true,
            })
            return items
        }

        if (pathname.startsWith('/merchant/customizer') || pathname.startsWith('/merchant/rewards')) {
            items.push({
                title: t('nav_customizer'),
                href: '/merchant/customizer',
                isLast: true,
            })
        } else if (pathname.startsWith('/merchant/crm')) {
            items.push({
                title: t('nav_crm'),
                href: '/merchant/crm',
                isLast: true,
            })
        } else if (pathname.startsWith('/merchant/staff')) {
            items.push({
                title: t('nav_staff'),
                href: '/merchant/staff',
                isLast: true,
            })
        } else if (pathname.startsWith('/merchant/analytics')) {
            items.push({
                title: t('nav_analytics'),
                href: '/merchant/analytics',
                isLast: true,
            })
        } else if (pathname.startsWith('/merchant/settings')) {
            items.push({
                title: t('nav_merchant_settings'),
                href: '/merchant/settings/account',
                isLast: true,
            })
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
    }, [pathname, t])

    // Show loading state while checking authentication and hydrating
    if (!isMounted || !hasHydrated) {
        return (
            <div className="min-h-svh flex items-center justify-center">
                <div className="text-muted-foreground">
                    {t('loading')}
                </div>
            </div>
        )
    }

    // Don't render dashboard if not authenticated or unauthorized
    if (!isAuthenticated || (profile && profile.role !== 'MERCHANT' && profile.role !== 'SUPER_ADMIN')) {
        return (
            <div className="min-h-svh flex items-center justify-center">
                <div className="text-muted-foreground">
                    {t('dashboard_redirect_login')}
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-svh">
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                    {/* Mobile Top Bar with 1-Tap Scene Switcher (<md) */}
                    <MobileHeader
                        scene="merchant"
                        storeName={activeStore?.name}
                        storeColor={activeStore?.primaryColor}
                        logoUrl={activeStore?.logoUrl}
                    />

                    {/* Desktop Header with Breadcrumbs & Controls (md+) */}
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
                                            {index > 0 && (
                                                <BreadcrumbSeparator className="hidden md:block" />
                                            )}
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
                        <div className="ms-auto flex items-center gap-1 sm:gap-2 shrink-0">
                            {/* StoreSwitcher */}
                            <div className="hidden sm:block">
                                <StoreSwitcher variant="header" />
                            </div>
                            {/* Language switcher */}
                            <div className="hidden md:block">
                                <LanguageSwitcher />
                            </div>
                            <ThemeToggleButton />
                            <Button variant="outline" size="icon" asChild aria-label={t('nav_merchant_settings')} className="h-8 w-8 sm:h-9 sm:w-9">
                                <Link href="/settings/account">
                                    <Settings className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                </Link>
                            </Button>
                        </div>
                    </header>

                    <main className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto pb-24 md:pb-6">
                        {children}
                    </main>

                    {/* Docked Mobile Bottom Navigation Bar (<md) */}
                    <MerchantBottomNav />
                </SidebarInset>
            </SidebarProvider>
        </div>
    )
}
