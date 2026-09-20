'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { FeedbackOverlay, FeedbackData } from '@/features/cashier/components/feedback-overlay';
import { posAudio } from '@/features/cashier/lib/pos-audio';
import { posHaptics } from '@/lib/haptics';
import { createCookieAuthApiClient, refreshAuthSession } from '@/lib/api-client';
import { AUTH_ROUTES } from '@/features/auth/services/auth-service';
import { useI18n } from '@/lib/i18n';
import { ResponsiveCashierView } from '@/features/cashier/components/responsive-cashier-view';
import { CashierStoreInfo, RecentTx } from '@/features/cashier/components/mobile/cashier-mobile-view';

const baseURL = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000').replace(/\/$/, '');
let apiClient: ReturnType<typeof createCookieAuthApiClient> | null = null;

function getCashierApiClient() {
  if (apiClient) return apiClient;
  apiClient = createCookieAuthApiClient({
    baseURL,
    useCookies: true,
    refreshUrl: AUTH_ROUTES.refresh,
    onRefresh: () => refreshAuthSession(baseURL),
  });
  return apiClient;
}

export default function CashierPage() {
  const { profile, signOut, isAuthenticated, hasHydrated } = useAuth();
  const { t } = useI18n();
  const router = useRouter();

  const [stores, setStores] = useState<CashierStoreInfo[]>([]);
  const [activeStore, setActiveStore] = useState<CashierStoreInfo | null>(null);
  const [isLoadingStores, setIsLoadingStores] = useState(true);

  // Recent transactions & shift totals
  const [recentTxs, setRecentTxs] = useState<RecentTx[]>([]);
  const [isLoadingRecent, setIsLoadingRecent] = useState(false);

  // Desktop scan state
  const [scanMode, setScanMode] = useState<{
    active: boolean;
    type: 'issue' | 'redeem' | null;
    value: any;
    rewardName?: string;
  }>({
    active: false,
    type: null,
    value: null,
  });

  // Modal feedback state & in-flight transaction verification state
  const [feedback, setFeedback] = useState<FeedbackData>({ state: 'idle' });
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchStores = useCallback(async () => {
    setIsLoadingStores(true);
    try {
      const client = getCashierApiClient();
      const { data } = await client.get<CashierStoreInfo[]>('/api/v1/transactions/my-stores');
      const storeList = data || [];
      setStores(storeList);
      if (storeList.length > 0) {
        const savedId = typeof window !== 'undefined' ? localStorage.getItem('fidely_cashier_store_id') : null;
        const matched = storeList.find((s) => s.id === savedId) || storeList[0];
        setActiveStore(matched);
      }
    } catch (err) {
      console.error('Failed to load cashier stores:', err);
    } finally {
      setIsLoadingStores(false);
    }
  }, []);

  const fetchRecentTransactions = useCallback(async (storeId?: string) => {
    if (!storeId) return;
    setIsLoadingRecent(true);
    try {
      const client = getCashierApiClient();
      const { data } = await client.get<RecentTx[]>('/api/v1/transactions/recent', {
        params: { storeId },
      });
      setRecentTxs(data || []);
    } catch (err) {
      console.error('Failed to load recent transactions:', err);
    } finally {
      setIsLoadingRecent(false);
    }
  }, []);

  useEffect(() => {
    if (hasHydrated) {
      if (!isAuthenticated) {
        router.push('/auth/login');
      } else if (profile?.role === 'CUSTOMER') {
        router.push('/customer/overview');
      } else {
        fetchStores();
      }
    }
  }, [hasHydrated, isAuthenticated, profile?.role, router, fetchStores]);

  useEffect(() => {
    if (activeStore?.id) {
      fetchRecentTransactions(activeStore.id);
    }
  }, [activeStore?.id, fetchRecentTransactions]);

  const handleSelectStore = (storeId: string) => {
    const found = stores.find((s) => s.id === storeId) || null;
    setActiveStore(found);
    if (found && typeof window !== 'undefined') {
      localStorage.setItem('fidely_cashier_store_id', found.id);
    }
  };

  const handleLogout = async () => {
    await signOut();
    router.push('/auth/login');
  };

  const executeTransaction = async (
    type: 'issue' | 'redeem',
    value: any,
    qrToken: string,
    rewardName?: string
  ): Promise<boolean> => {
    if (!activeStore) {
      posAudio.playError();
      posHaptics.error();
      setFeedback({
        state: 'error',
        title: t('cashier_no_assignment_title') || 'No Store Assigned',
        message: t('cashier_no_assignment_desc') || 'Please select an active store register.',
      });
      return false;
    }

    setIsProcessing(true);
    try {
      const client = getCashierApiClient();

      if (type === 'issue') {
        const { data } = await client.post<{
          newBalance: number;
          pointsIssued: number;
          storeName: string;
          customerName: string;
        }>('/api/v1/transactions/issue', {
          qrToken,
          amountTnd: Number(value),
          storeId: activeStore.id,
        });

        posAudio.playSuccess();
        posHaptics.pointsIssued();
        setFeedback({
          state: 'success',
          type: 'issue',
          title: t('cashier_tx_issue_title') || 'Points Awarded!',
          message: `${t('pos_points_awarded_feedback', { points: data.pointsIssued, name: data.customerName || 'Customer' }) || `Awarded +${data.pointsIssued} points`}`,
          points: data.pointsIssued,
          customerName: data.customerName || 'Customer',
          newBalance: data.newBalance,
          storeName: data.storeName,
        });

        fetchRecentTransactions(activeStore.id);
        return true;
      } else if (type === 'redeem') {
        const { data } = await client.post<{
          newBalance: number;
          voucherCode: string;
          rewardName: string;
          storeName: string;
        }>('/api/v1/transactions/redeem', {
          qrToken,
          rewardId: String(value),
          storeId: activeStore.id,
        });

        posAudio.playSuccess();
        posHaptics.rewardClaimed();
        setFeedback({
          state: 'success',
          type: 'redeem',
          title: (t as any)('cashier_tx_redeem_title') || 'Reward Claimed!',
          message: `${(t as any)('pos_reward_redeemed_feedback', { reward: rewardName || data.rewardName }) || `Redeemed ${data.rewardName}`}`,
          rewardName: rewardName || data.rewardName,
          voucherCode: data.voucherCode,
          newBalance: data.newBalance,
          storeName: data.storeName,
        });

        fetchRecentTransactions(activeStore.id);
        return true;
      }
      return false;
    } catch (err: any) {
      posAudio.playError();
      posHaptics.error();
      setFeedback({
        state: 'error',
        title: (t as any)('cashier_tx_failed_title') || 'Transaction Failed',
        message: err.message || t('auth_generic_error') || 'Could not complete transaction',
      });
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProcess = async (
    type: 'issue' | 'redeem',
    amount: number,
    rewardId?: string,
    rewardName?: string,
    customerQrToken?: string,
    customerName?: string
  ): Promise<boolean> => {
    if (customerQrToken) {
      return await executeTransaction(type, type === 'issue' ? amount : rewardId, customerQrToken, rewardName);
    } else {
      setScanMode({
        active: true,
        type,
        value: type === 'issue' ? amount : rewardId,
        rewardName,
      });
      return false;
    }
  };

  const handleScanSuccess = async (decodedToken: string) => {
    if (!scanMode.type || !scanMode.value) return;
    const { type, value, rewardName } = scanMode;
    setScanMode({ active: false, type: null, value: null });
    await executeTransaction(type, value, decodedToken, rewardName);
  };

  return (
    <>
      <ResponsiveCashierView
        stores={stores}
        activeStore={activeStore}
        onSelectStore={handleSelectStore}
        onProcess={handleProcess}
        recentTxs={recentTxs}
        isLoadingRecent={isLoadingRecent}
        onLogout={handleLogout}
        cashierEmail={profile?.email}
        scanMode={scanMode}
        onScanSuccess={handleScanSuccess}
        onCancelScan={() => setScanMode({ active: false, type: null, value: null })}
        apiClient={getCashierApiClient()}
        isProcessing={isProcessing}
        isFeedbackOpen={feedback.state !== 'idle'}
      />

      <FeedbackOverlay
        data={feedback}
        onDismiss={() => setFeedback({ state: 'idle' })}
      />
    </>
  );
}
