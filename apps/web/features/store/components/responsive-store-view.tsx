'use client'

import React from 'react'
import { ResponsiveView } from '@/components/common/responsive-view'
import { StoreMobileView, StorePublicData } from './mobile/store-mobile-view'
import { StoreDesktopView } from './desktop/store-desktop-view'

interface ResponsiveStoreViewProps {
  store: StorePublicData
  isAuthenticated: boolean
  joining: boolean
  onJoinClick: () => void
}

export function ResponsiveStoreView(props: ResponsiveStoreViewProps) {
  return (
    <ResponsiveView
      mobile={<StoreMobileView {...props} />}
      desktop={<StoreDesktopView {...props} />}
    />
  )
}
