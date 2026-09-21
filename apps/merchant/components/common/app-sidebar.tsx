"use client"

import type * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { ChevronDown, LogOut, ChevronsUpDown } from "lucide-react"
import { useAuth } from "@/features/auth/hooks/use-auth"
import { useI18n } from "@/lib/i18n"
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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { navItems, userNavItems, type NavItem } from "@/config/nav-config"
import { StoreSwitcher } from "@/components/common/store-switcher"

/**
 * Enhanced AppSidebar Component with reactive i18n & full RTL support
 */
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const { profile, signOut } = useAuth()
  const { t, isRtl } = useI18n()
  const router = useRouter()
  const { state: sidebarState } = useSidebar()

  const handleLogout = () => {
    signOut()
    router.push("/login")
  }

  const getUserInitials = () => {
    if (!profile?.email) return "U"
    return profile.email.charAt(0).toUpperCase()
  }

  return (
    <Sidebar collapsible="icon" side={isRtl ? "right" : "left"} variant="floating" {...props}>
      {/* Sidebar Header with Store Switcher */}
      <SidebarHeader
        className={`border-b border-sidebar-border/50 bg-sidebar-accent/30 px-2 py-2 ${
          sidebarState === "collapsed" ? "flex justify-center px-0" : ""
        }`}
      >
        <StoreSwitcher variant="sidebar" />
      </SidebarHeader>

      {/* Main Navigation Content */}
      <SidebarContent className="px-0">
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-xs font-semibold text-sidebar-foreground/70 uppercase tracking-wider text-start">
            {t('dashboard_navigation')}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <NavItemComponent key={item.href} item={item} pathname={pathname} isRtl={isRtl} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* User Settings Section */}
        {userNavItems.length > 0 && (
          <>
            <SidebarSeparator className="my-3 bg-sidebar-border/30" />
            <SidebarGroup>
              <SidebarGroupLabel className="px-4 text-xs font-semibold text-sidebar-foreground/70 uppercase tracking-wider text-start">
                {t('dashboard_settings')}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {userNavItems.map((item) => (
                    <NavItemComponent key={item.href} item={item} pathname={pathname} isRtl={isRtl} />
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>

      {/* User Profile Footer */}
      <SidebarFooter
        className={`border-t border-sidebar-border/50 bg-sidebar-accent/20 px-2 py-2 flex flex-col gap-2 ${
          sidebarState === "collapsed" ? "items-center px-0" : ""
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
                        className={`data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground w-full hover:bg-sidebar-accent/40 transition-colors duration-200 ${
                          sidebarState === "collapsed" ? "justify-center px-2" : "px-3"
                        }`}
                        tooltip={sidebarState === "collapsed" ? profile?.email?.split("@")[0] || "User" : undefined}
                      >
                        <div className="relative shrink-0">
                          <Avatar className="h-8 w-8 rounded-lg border border-sidebar-accent/50">
                            <AvatarFallback className="rounded-lg from-primary/20 to-primary/10 text-primary font-semibold">
                              {getUserInitials()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="absolute -bottom-0.5 -right-0.5 rtl:-left-0.5 rtl:right-auto size-2.5 bg-emerald-500 rounded-full border border-sidebar shadow-xs"></span>
                        </div>
                        {sidebarState !== "collapsed" && (
                          <>
                            <div className="grid flex-1 text-start text-sm leading-tight min-w-0">
                              <span className="truncate font-semibold text-sidebar-foreground">
                                {profile?.email?.split("@")[0] || "User"}
                              </span>
                              <span className="truncate text-xs text-sidebar-foreground/60">
                                {profile?.email || ""}
                              </span>
                            </div>
                            <ChevronsUpDown className="ms-auto size-4 shrink-0 text-sidebar-foreground/60" />
                          </>
                        )}
                      </SidebarMenuButton>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  {sidebarState === "collapsed" && (
                    <TooltipContent side={isRtl ? "left" : "right"} className="flex items-center gap-2">
                      <div className="text-sm">
                        <div className="font-semibold">{profile?.email?.split("@")[0] || "User"}</div>
                        <div className="text-xs text-muted-foreground">{profile?.email || ""}</div>
                      </div>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
              <DropdownMenuContent
                className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-xl border border-sidebar-border/40 bg-popover shadow-xl p-1"
                side={isRtl ? "left" : "right"}
                align={isRtl ? "start" : "end"}
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-3 py-2 text-start">
                    <Avatar className="h-8 w-8 rounded-lg shrink-0 border border-sidebar-accent">
                      <AvatarFallback className="rounded-lg from-primary/20 to-primary/10 text-primary font-semibold">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-start text-sm leading-tight min-w-0">
                      <span className="truncate font-semibold text-sidebar-foreground">
                        {profile?.email?.split("@")[0] || "User"}
                      </span>
                      <span className="truncate text-xs text-sidebar-foreground/60">{profile?.email || ""}</span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-sidebar-border/30" />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer text-destructive focus:text-destructive hover:bg-destructive/10 rounded-lg gap-2"
                >
                  <LogOut className="h-4 w-4 shrink-0" />
                  <span>{t('dashboard_log_out')}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

/**
 * Enhanced Navigation Item Component with reactive i18n and RTL support
 */
function NavItemComponent({
  item,
  pathname,
  isRtl,
}: {
  item: NavItem
  pathname: string
  isRtl: boolean
}) {
  const { state: sidebarState } = useSidebar()
  const { t } = useI18n()
  const isCollapsed = sidebarState === "collapsed"
  const isActive = pathname === item.href || (item.href !== '/merchant/overview' && pathname.startsWith(item.href + "/"))
  const hasSubItems = item.items && item.items.length > 0

  const getNavTitle = (title: string): string => {
    switch (title) {
      case 'Overview':
        return t('nav_overview')
      case 'Customizer & Rewards':
        return t('nav_customizer')
      case 'CRM':
        return t('nav_crm')
      case 'Staff':
        return t('nav_staff')
      case 'Analytics':
        return t('nav_analytics')
      case 'Settings':
        return t('nav_merchant_settings')
      case 'Account':
      case 'Account Settings':
        return t('nav_account_settings')
      default:
        return title
    }
  }

  const title = getNavTitle(item.title)

  if (hasSubItems) {
    const isSubItemActive = item.items?.some(
      (subItem) => pathname === subItem.href || pathname.startsWith(subItem.href + "/"),
    )

    return (
      <Collapsible key={item.title} asChild defaultOpen={isActive || isSubItemActive} className="group/collapsible">
        <SidebarMenuItem>
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    tooltip={isCollapsed ? title : undefined}
                    isActive={isActive || isSubItemActive}
                    className={`w-full transition-all duration-200 ${isActive || isSubItemActive ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold" : "hover:bg-sidebar-accent/50"}`}
                  >
                    {item.icon && <item.icon className="shrink-0" />}
                    <span className="truncate text-start">{title}</span>
                    {item.badge && !isCollapsed && (
                      <Badge
                        variant="secondary"
                        className="ms-auto shrink-0 bg-primary/20 text-primary"
                      >
                        {item.badge}
                      </Badge>
                    )}
                    <ChevronDown
                      className="ms-auto shrink-0 transition-transform duration-300 group-data-[state=open]/collapsible:rotate-180"
                    />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
              </TooltipTrigger>
              {isCollapsed && (
                <TooltipContent side={isRtl ? "left" : "right"} className="flex items-center gap-2">
                  {title}
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
          <CollapsibleContent>
            <SidebarMenuSub>
              {item.items?.map((subItem) => {
                const isSubActive = pathname === subItem.href || pathname.startsWith(subItem.href + "/")
                const subTitle = getNavTitle(subItem.title)
                return (
                  <SidebarMenuSubItem key={subItem.title}>
                    <TooltipProvider delayDuration={0}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <SidebarMenuSubButton
                            asChild
                            isActive={isSubActive}
                            className={`transition-all duration-200 ${isSubActive ? "bg-sidebar-accent/60 font-semibold" : "hover:bg-sidebar-accent/30"}`}
                          >
                            <Link href={subItem.href} className="flex items-center gap-2">
                              <span className="truncate text-start">{subTitle}</span>
                              {subItem.badge && !isCollapsed && (
                                <Badge
                                  variant="secondary"
                                  className="ms-auto shrink-0 bg-primary/20 text-primary text-xs"
                                >
                                  {subItem.badge}
                                </Badge>
                              )}
                            </Link>
                          </SidebarMenuSubButton>
                        </TooltipTrigger>
                        {isCollapsed && (
                          <TooltipContent side={isRtl ? "left" : "right"}>{subTitle}</TooltipContent>
                        )}
                      </Tooltip>
                    </TooltipProvider>
                  </SidebarMenuSubItem>
                )
              })}
            </SidebarMenuSub>
          </CollapsibleContent>
        </SidebarMenuItem>
      </Collapsible>
    )
  }

  return (
    <SidebarMenuItem>
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <SidebarMenuButton
              asChild
              tooltip={isCollapsed ? title : undefined}
              isActive={isActive}
              className={`transition-all duration-200 ${isActive ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold" : "hover:bg-sidebar-accent/50"}`}
            >
              <Link href={item.href} className="flex items-center gap-2">
                {item.icon && <item.icon className="shrink-0" />}
                <span className="truncate text-start">{title}</span>
                {item.badge && !isCollapsed && (
                  <Badge
                    variant="secondary"
                    className="ms-auto shrink-0 bg-primary/20 text-primary"
                  >
                    {item.badge}
                  </Badge>
                )}
              </Link>
            </SidebarMenuButton>
          </TooltipTrigger>
          {isCollapsed && <TooltipContent side={isRtl ? "left" : "right"}>{title}</TooltipContent>}
        </Tooltip>
      </TooltipProvider>
    </SidebarMenuItem>
  )
}
