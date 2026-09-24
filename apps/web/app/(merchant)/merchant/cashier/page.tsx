'use client';

import { CashierScreen } from '@/features/cashier/components/cashier-screen';

export default function MerchantCashierPage() {
  return <CashierScreen isMerchant={true} />;
}
