/**
 * @file components/common/admin-sidebar.tsx
 *
 * Dedicated, fully-responsive sidebar for the Super Admin console.
 * Uses shadcn/Radix primitive architecture with collapsible icon mode,
 * mobile sheets, tooltips, and RTL flipping.
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
  LogOut,
  ChevronDown,
  ChevronsUpDown,
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
    router.push('/login')
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
      href: '/overview',
      icon: LayoutDashboard,
      description: t('admin_nav_overview_desc'),
    },
    {
      title: t('admin_nav_stores'),
      href: '/stores',
      icon: Store,
      description: t('admin_nav_stores_desc'),
    },
    {
      title: t('admin_nav_users'),
      href: '/users',
      icon: Users,
      description: t('admin_nav_users_desc'),
    },
    {
      title: t('admin_nav_transactions'),
      href: '/transactions',
      icon: Receipt,
      description: t('admin_nav_transactions_desc'),
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
          href="/overview"
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
                  (item.href !== '/overview' && pathname.startsWith(item.href))
                return (
                  <SidebarMenuItem key={item.href}>
                    <TooltipProvider delayDuration={200}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <SidebarMenuButton
                            asChild
                            isActive={isActive}
                            tooltip={item.title}
                            className={`w-full justify-start gap-3 h-10 px-3 rounded-xl transition-all ${
                              isActive
                                ? 'bg-primary text-primary-foreground font-semibold shadow-xs shadow-primary/20'
                                : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                            }`}
                          >
                            <Link href={item.href} className="flex items-center gap-3 w-full">
                              <item.icon className="h-4 w-4 shrink-0" />
                              <span className="truncate">{item.title}</span>
                            </Link>
                          </SidebarMenuButton>
                        </TooltipTrigger>
                        {sidebarState === 'collapsed' && (
                          <TooltipContent side={isRtl ? 'left' : 'right'}>
                            <p className="font-semibold">{item.title}</p>
                            <p className="text-xs text-muted-foreground">{item.description}</p>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </TooltipProvider>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer / User Profile */}
      <SidebarFooter className="border-t border-sidebar-border/50 p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground rounded-xl w-full"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarFallback className="rounded-lg bg-primary/20 text-primary font-bold text-xs">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-start text-xs leading-tight min-w-0">
                    <span className="truncate font-semibold text-sidebar-foreground">
                      {profile?.full_name || profile?.email || 'Super Admin'}
                    </span>
                    <span className="truncate text-[10px] text-sidebar-foreground/60 font-mono">
                      {profile?.email}
                    </span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4 shrink-0 text-sidebar-foreground/50" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-xl p-2"
                side={isRtl ? 'left' : 'right'}
                align="end"
                sideOffset={8}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-start text-sm">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarFallback className="rounded-lg bg-primary/20 text-primary font-bold text-xs">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-start text-xs leading-tight min-w-0">
                      <span className="truncate font-semibold">
                        {profile?.full_name || profile?.email || 'Super Admin'}
                      </span>
                      <span className="truncate text-[10px] text-muted-foreground font-mono">
                        {profile?.email}
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer rounded-lg gap-2 text-xs"
                >
                  <LogOut className="h-4 w-4" />
                  <span>{t('logout')}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
