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
    href: '/merchant/overview',
    icon: LayoutDashboard,
  },
  {
    title: 'Customizer & Rewards',
    href: '/merchant/settings/store',
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
  {
    title: 'Analytics',
    href: '/merchant/analytics',
    icon: LineChart,
  },
]

export const userNavItems: NavItem[] = [
  {
    title: 'Settings',
    href: '/merchant/settings',
    icon: Settings,
    items: [
      {
        title: 'Store & Rewards',
        href: '/merchant/settings/store',
      },
      {
        title: 'Account',
        href: '/merchant/settings/account',
      },
    ],
  },
]
