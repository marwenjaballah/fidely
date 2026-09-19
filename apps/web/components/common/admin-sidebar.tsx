/**
 * @file components/common/admin-sidebar.tsx
 *
 * Dedicated, fully-responsive sidebar for the Super Admin console.
 * Uses the exact same shadcn/Radix primitive architecture as AppSidebar,
 * including collapsible icon mode, mobile sheets, tooltips, and RTL flipping.
 */

'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Store,
  Users,
  Receipt,
  ShieldCheck,
  LogOut,
  ExternalLink,
  ChevronDown,
  ChevronsUpDown,
  Sparkles,
  Smartphone,
  Layers,
} from 'lucide-react'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { useI18n } from '@/lib/i18n'
import { BRAND_NAME } from '@/lib/brand'
import { FidelyLogo } from '@/components/common/fidely-logo'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from '@/components/ui/sidebar'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

export function AdminSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const { profile, signOut } = useAuth()
  const { t, isRtl } = useI18n()
  const router = useRouter()
  const { state: sidebarState } = useSidebar()

  const handleLogout = async () => {
    await signOut()
    router.push('/auth/login')
  }

  const getUserInitials = () => {
    if (profile?.full_name) {
      return profile.full_name
        .split(' ')
        .filter(Boolean)
        .map((n: string) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    }
    if (profile?.email) {
      return profile.email.slice(0, 2).toUpperCase()
    }
    return 'SA'
  }

  const navItems = [
    {
      title: t('admin_nav_overview'),
      href: '/admin/overview',
      icon: LayoutDashboard,
      description: t('admin_nav_overview_desc'),
    },
    {
      title: t('admin_nav_stores'),
      href: '/admin/stores',
      icon: Store,
      description: t('admin_nav_stores_desc'),
    },
    {
      title: t('admin_nav_users'),
      href: '/admin/users',
      icon: Users,
      description: t('admin_nav_users_desc'),
    },
    {
      title: t('admin_nav_transactions'),
      href: '/admin/transactions',
      icon: Receipt,
      description: t('admin_nav_transactions_desc'),
    },
  ]

  const portalShortcuts = [
    {
      title: t('nav_merchant'),
      href: '/merchant/overview',
      icon: Store,
      badge: 'Portal',
    },
    {
      title: t('auth_signup_perk_pos'),
      href: '/cashier',
      icon: Smartphone,
      badge: 'POS',
    },
  ]

  return (
    <Sidebar collapsible="icon" side={isRtl ? 'right' : 'left'} variant="floating" {...props}>
      {/* Brand Header */}
      <SidebarHeader
        className={`border-b border-sidebar-border/50 bg-sidebar-accent/30 px-3 py-3 ${
          sidebarState === 'collapsed' ? 'flex justify-center px-0' : ''
        }`}
      >
        <Link
          href="/admin/overview"
          className="flex items-center gap-3 group rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring p-1 transition-all"
        >
          <FidelyLogo
            size={sidebarState === 'collapsed' ? 'sm' : 'md'}
            variant="subtle"
            className="group-hover:scale-105 transition-transform"
          />
          {sidebarState !== 'collapsed' && (
            <div className="flex flex-col min-w-0 text-start">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-sidebar-foreground">
                  {BRAND_NAME}
                </span>
                <Badge
                  variant="default"
                  className="text-[9px] px-1.5 py-0 h-4 font-bold bg-primary text-primary-foreground uppercase tracking-wider"
                >
                  {t('admin_badge_root')}
                </Badge>
              </div>
              <span className="text-[11px] text-sidebar-foreground/60 font-medium truncate">
                {t('admin_control_center')}
              </span>
            </div>
          )}
        </Link>
      </SidebarHeader>

      {/* Main Navigation */}
      <SidebarContent className="px-0">
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-xs font-semibold text-sidebar-foreground/70 uppercase tracking-wider text-start">
            {t('admin_platform_mgmt')}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== '/admin/overview' && pathname.startsWith(item.href))
                const Icon = item.icon
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                      className={`gap-3 px-3 py-2.5 rounded-xl transition-all ${
                        isActive
                          ? 'bg-primary text-primary-foreground font-semibold shadow-xs hover:bg-primary/95 hover:text-primary-foreground'
                          : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                      }`}
                    >
                      <Link href={item.href}>
                        <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-primary-foreground' : 'text-sidebar-foreground/60'}`} />
                        <span className="truncate">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="my-2 bg-sidebar-border/30" />

        {/* Portal Switching Shortcuts */}
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-xs font-semibold text-sidebar-foreground/70 uppercase tracking-wider text-start">
            {t('dashboard_navigation')}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {portalShortcuts.map((item) => {
                const Icon = item.icon
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.title}
                      className="gap-3 px-3 py-2 rounded-xl text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all"
                    >
                      <Link href={item.href}>
                        <Icon className="h-4 w-4 shrink-0 text-sidebar-foreground/50" />
                        <span className="truncate text-xs font-medium">{item.title}</span>
                        {sidebarState !== 'collapsed' && (
                          <Badge
                            variant="outline"
                            className="ms-auto text-[9px] px-1 py-0 h-4 border-sidebar-border/50 text-sidebar-foreground/60"
                          >
                            {item.badge}
                          </Badge>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* User Profile Footer */}
      <SidebarFooter
        className={`border-t border-sidebar-border/50 bg-sidebar-accent/20 px-2 py-2 flex flex-col gap-2 ${
          sidebarState === 'collapsed' ? 'items-center px-0' : ''
        }`}
      >
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <SidebarMenuButton
                        size="lg"
                        className={`w-full hover:bg-sidebar-accent/50 transition-colors duration-200 rounded-xl ${
                          sidebarState === 'collapsed' ? 'justify-center px-2' : 'px-3'
                        }`}
                        tooltip={sidebarState === 'collapsed' ? profile?.email?.split('@')[0] || 'Admin' : undefined}
                      >
                        <div className="relative shrink-0">
                          <Avatar className="h-8 w-8 rounded-lg border border-primary/20 bg-primary/10 text-primary">
                            <AvatarFallback className="rounded-lg font-bold text-xs bg-primary/10 text-primary">
                              {getUserInitials()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="absolute -bottom-0.5 -right-0.5 rtl:-left-0.5 rtl:right-auto size-2.5 bg-emerald-500 rounded-full border-2 border-sidebar shadow-xs" />
                        </div>
                        {sidebarState !== 'collapsed' && (
                          <>
                            <div className="grid flex-1 text-start text-xs leading-tight min-w-0">
                              <span className="truncate font-bold text-sidebar-foreground">
                                {profile?.full_name || profile?.email?.split('@')[0] || 'Super Admin'}
                              </span>
                              <span className="truncate text-[10px] text-sidebar-foreground/60 font-mono" dir="ltr">
                                {profile?.email || ''}
                              </span>
                            </div>
                            <ChevronsUpDown className="ms-auto size-4 shrink-0 text-sidebar-foreground/60" />
                          </>
                        )}
                      </SidebarMenuButton>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  {sidebarState === 'collapsed' && (
                    <TooltipContent side={isRtl ? 'left' : 'right'} className="flex items-center gap-2">
                      <div className="text-xs">
                        <div className="font-bold">{profile?.full_name || profile?.email?.split('@')[0]}</div>
                        <div className="text-[10px] text-muted-foreground">{profile?.email}</div>
                      </div>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>

              <DropdownMenuContent
                className="w-56 rounded-xl border border-sidebar-border/40 bg-popover shadow-xl p-1"
                side={isRtl ? 'left' : 'right'}
                align={isRtl ? 'start' : 'end'}
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-2 font-normal">
                  <div className="flex items-center gap-2 text-start">
                    <Avatar className="h-8 w-8 rounded-lg shrink-0 border border-primary/20 bg-primary/10 text-primary">
                      <AvatarFallback className="font-bold text-xs">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-start text-xs leading-tight min-w-0">
                      <span className="truncate font-bold text-foreground">
                        {profile?.full_name || t('admin_badge_super_admin')}
                      </span>
                      <span className="truncate text-[10px] text-muted-foreground font-mono" dir="ltr">
                        {profile?.email}
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/admin/overview" className="cursor-pointer text-xs">
                    <LayoutDashboard className="me-2 h-3.5 w-3.5" />
                    {t('admin_overview_cmd_center')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/merchant/overview" className="cursor-pointer text-xs">
                    <Store className="me-2 h-3.5 w-3.5" />
                    {t('nav_merchant')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer text-xs text-destructive focus:text-destructive focus:bg-destructive/10"
                >
                  <LogOut className="me-2 h-3.5 w-3.5 rtl:rotate-180" />
                  {t('admin_sign_out')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
