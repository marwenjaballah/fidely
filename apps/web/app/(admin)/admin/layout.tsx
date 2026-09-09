'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Store,
  Users,
  Receipt,
  ShieldCheck,
  LogOut,
  ChevronRight,
  Menu,
  X,
  Sparkles,
} from 'lucide-react'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { ThemeToggleButton } from '@/components/common/theme-toggle-button'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

interface NavItem {
  title: string
  href: string
  icon: typeof LayoutDashboard
  description: string
}

const navItems: NavItem[] = [
  {
    title: 'Overview',
    href: '/admin/overview',
    icon: LayoutDashboard,
    description: 'Platform metrics and system health',
  },
  {
    title: 'Stores & Merchants',
    href: '/admin/stores',
    icon: Store,
    description: 'Manage all platform stores and owners',
  },
  {
    title: 'User Management',
    href: '/admin/users',
    icon: Users,
    description: 'Manage accounts, roles and permissions',
  },
  {
    title: 'Global Audit Log',
    href: '/admin/transactions',
    icon: Receipt,
    description: 'Real-time transaction & loyalty ledger',
  },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, hasHydrated, profile, signOut } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [isMounted, setIsMounted] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (isMounted && hasHydrated) {
      if (!isAuthenticated) {
        router.push('/auth/login')
      } else if (profile && profile.role !== 'SUPER_ADMIN') {
        // If logged in but not SUPER_ADMIN, redirect to merchant or overview
        router.push('/overview')
      }
    }
  }, [isMounted, hasHydrated, isAuthenticated, profile, router])

  if (!isMounted || !hasHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground font-medium">Verifying Super Admin credentials...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || profile?.role !== 'SUPER_ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center p-8 max-w-md">
          <ShieldCheck className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-bold">Access Restricted</h2>
          <p className="text-muted-foreground text-sm mt-2">
            You do not have Super Admin privileges to view this area.
          </p>
          <Button className="mt-6" onClick={() => router.push('/auth/login')}>
            Return to Login
          </Button>
        </div>
      </div>
    )
  }

  const currentNav = navItems.find((item) => pathname.startsWith(item.href)) || navItems[0]

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col md:flex-row">
      {/* Mobile Topbar */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 border-b bg-background sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <span className="font-bold text-sm tracking-tight">Fidely</span>
            <span className="text-[10px] ml-1.5 font-semibold text-primary uppercase bg-primary/10 px-1.5 py-0.5 rounded">Super Admin</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <ThemeToggleButton />
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Sidebar for Desktop & Mobile Overlay */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 border-r bg-background flex flex-col transition-transform duration-200 ease-in-out md:translate-x-0 md:static md:z-auto ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand */}
        <div className="p-6 pb-4 flex items-center gap-3 border-b">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-primary to-primary/70 flex items-center justify-center text-primary-foreground shadow-sm">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg tracking-tight">Fidely</span>
              <Badge variant="default" className="text-[10px] px-1.5 py-0 h-4 bg-primary/90">
                ROOT
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground font-medium">Control Center</p>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 py-1.5 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
            Platform Management
          </div>
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/admin/overview' && pathname.startsWith(item.href))
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                <span>{item.title}</span>
              </Link>
            )
          })}
        </div>

        {/* User Card & Logout */}
        <div className="p-4 border-t bg-muted/30">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-9 w-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary text-xs">
              {profile?.email?.slice(0, 2).toUpperCase() || 'SA'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate text-foreground">{profile?.full_name || 'Super Administrator'}</p>
              <p className="text-[11px] text-muted-foreground truncate">{profile?.email}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start text-xs text-muted-foreground hover:text-destructive hover:border-destructive/30"
            onClick={async () => {
              await signOut()
              router.push('/auth/login')
            }}
          >
            <LogOut className="h-3.5 w-3.5 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Backdrop for mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden backdrop-blur-xs"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="hidden md:flex h-16 items-center justify-between px-8 border-b bg-background/80 backdrop-blur sticky top-0 z-30">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Super Admin</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground/60" />
            <span className="font-semibold text-foreground">{currentNav.title}</span>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="outline" className="gap-1.5 border-primary/30 text-primary bg-primary/5 py-1 px-2.5">
              <Sparkles className="h-3.5 w-3.5" />
              Global Admin Mode
            </Badge>
            <Separator orientation="vertical" className="h-6" />
            <ThemeToggleButton />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
