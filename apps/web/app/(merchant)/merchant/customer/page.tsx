'use client';

import { CustomerScreen } from '@/features/customer/components/customer-screen';

export default function MerchantCustomerPage() {
  return <CustomerScreen isMerchant={true} />;
}
