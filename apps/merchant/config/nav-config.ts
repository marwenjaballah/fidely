import { LayoutDashboard, Settings, Users, LineChart, Store, Palette, type LucideIcon } from 'lucide-react'

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
    title: 'Overview',
    href: '/overview',
    icon: LayoutDashboard,
  },
  {
    title: 'Customizer & Rewards',
    href: '/customizer',
    icon: Palette,
  },
  {
    title: 'CRM',
    href: '/crm',
    icon: Users,
  },
  {
    title: 'Staff',
    href: '/staff',
    icon: Store,
  },
  {
    title: 'Analytics',
    href: '/analytics',
    icon: LineChart,
  },
]

export const userNavItems: NavItem[] = [
  {
    title: 'Settings',
    href: '/settings/account',
    icon: Settings,
  },
]
