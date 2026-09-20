'use client'

import React from 'react'
import { ResponsiveView } from '@/components/common/responsive-view'
import { CashierMobileView, CashierStoreInfo, RecentTx } from './mobile/cashier-mobile-view'
import { CashierDesktopView } from './desktop/cashier-desktop-view'

interface ResponsiveCashierViewProps {
  stores: CashierStoreInfo[]
  activeStore: CashierStoreInfo | null
  onSelectStore: (storeId: string) => void
  onProcess: (
    type: 'issue' | 'redeem',
    amount: number,
    rewardId?: string,
    rewardName?: string,
    customerQrToken?: string,
    customerName?: string
  ) => void
  recentTxs: RecentTx[]
  isLoadingRecent: boolean
  onLogout: () => void
  cashierEmail?: string
  scanMode: {
    active: boolean
    type: 'issue' | 'redeem' | null
    value: any
    rewardName?: string
  }
  onScanSuccess: (decodedToken: string) => void
  onCancelScan: () => void
  apiClient: any
}

export function ResponsiveCashierView(props: ResponsiveCashierViewProps) {
  return (
    <ResponsiveView
      mobile={
        <CashierMobileView
          stores={props.stores}
          activeStore={props.activeStore}
          onSelectStore={props.onSelectStore}
          onProcess={props.onProcess}
          recentTxs={props.recentTxs}
          isLoadingRecent={props.isLoadingRecent}
          onLogout={props.onLogout}
          cashierEmail={props.cashierEmail}
          apiClient={props.apiClient}
        />
      }
      desktop={<CashierDesktopView {...props} />}
    />
  )
}
