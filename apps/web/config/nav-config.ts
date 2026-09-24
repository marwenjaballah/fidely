import { LayoutDashboard, Settings, Users, Store, Palette, type LucideIcon } from 'lucide-react'

export interface NavItem {
  title: string
  href: string
  icon: LucideIcon
  badge?: string
  items?: NavSubItem[]
}

export interface NavSubItem {
  title: string
  href: string
  badge?: string
}

export const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/merchant/overview',
    icon: LayoutDashboard,
  },
  {
    title: 'Customizer & Rewards',
    href: '/merchant/customizer',
    icon: Palette,
  },
  {
    title: 'CRM',
    href: '/merchant/crm',
    icon: Users,
  },
  {
    title: 'Staff',
    href: '/merchant/staff',
    icon: Store,
  },
]

export const userNavItems: NavItem[] = [
  {
    title: 'Settings',
    href: '/merchant/settings/account',
    icon: Settings,
  },
]
