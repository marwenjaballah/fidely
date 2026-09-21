'use client'

import React from 'react'
import { ResponsiveView } from '@/components/common/responsive-view'
import { CustomerMobileView } from './mobile/customer-mobile-view'
import { CustomerDesktopView } from './desktop/customer-desktop-view'
import { CustomerMembership, AvailableStore } from '@/store/customer-store'

interface ResponsiveCustomerViewProps {
  memberships: CustomerMembership[]
  activeMembership: CustomerMembership | null
  availableStores: AvailableStore[]
  onSelectMembership: (id: string) => void
  onRefreshQr: (id: string) => Promise<void> | void
  onJoinStore: (storeId: string) => Promise<void>
  onJoinBySlug: (slug: string) => Promise<void>
  onLogout: () => void
  isJoining: boolean
  joiningStoreId: string | null
  joinError: string | null
  userName?: string
  userEmail?: string
  userPhone?: string
  onSavePhone?: (phone: string) => Promise<void>
}

export function ResponsiveCustomerView(props: ResponsiveCustomerViewProps) {
  return (
    <ResponsiveView
      mobile={<CustomerMobileView {...props} />}
      desktop={<CustomerDesktopView {...props} />}
    />
  )
}
