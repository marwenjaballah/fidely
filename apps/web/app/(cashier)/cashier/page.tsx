'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { QRScanner } from '@/components/qr-scanner';
import { TransactionPanel } from '@/features/cashier/components/transaction-panel';
import { FeedbackOverlay, FeedbackData } from '@/features/cashier/components/feedback-overlay';
import { posAudio } from '@/features/cashier/lib/pos-audio';
import { posHaptics } from '@/lib/haptics';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ThemeToggleButton } from '@/components/common/theme-toggle-button';
import { LanguageSwitcher } from '@/components/common/language-switcher';
import { FidelyLogo } from '@/components/common/fidely-logo';
import {
  LogOut,
  Coffee,
  Store,
  ShieldAlert,
  Sparkles,
  Gift,
  Coins,
  History,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  X,
  RefreshCw,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { createCookieAuthApiClient, refreshAuthSession, ApiError } from '@/lib/api-client';
import { AUTH_ROUTES } from '@/features/auth/services/auth-service';

import { useI18n } from '@/lib/i18n';
import { MobileHeader } from '@/components/mobile/mobile-header';
import { CashierBottomNav, CashierTab } from '@/components/mobile/cashier-bottom-nav';

interface CashierStoreInfo {
  id: string;
  name: string;
  slug: string;
  primaryColor: string;
  pointsPerTnd: number;
  isOwner: boolean;
}

interface CashierTransaction {
  id: string;
  pointsEarned: number;
  tndAmount: number;
  createdAt: string;
  customerName: string;
}

interface RecentTx {
  id: string;
  type: string;
  amountTnd: number | null;
  pointsAffected: number;
  createdAt: string;
  customerName: string;
}

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
  const { t, dir } = useI18n();
  const router = useRouter();

  const [stores, setStores] = useState<CashierStoreInfo[]>([]);
  const [activeStore, setActiveStore] = useState<CashierStoreInfo | null>(null);
  const [isLoadingStores, setIsLoadingStores] = useState(true);

  // Recent transactions & shift totals
  const [recentTxs, setRecentTxs] = useState<RecentTx[]>([]);
  const [isLoadingRecent, setIsLoadingRecent] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // Scan state
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

  // Modal feedback state
  const [feedback, setFeedback] = useState<FeedbackData>({ state: 'idle' });
  const [mobileTab, setMobileTab] = useState<CashierTab>('pos');

  const handleSelectMobileTab = (tab: CashierTab) => {
    setMobileTab(tab);
    if (tab === 'scan') {
      setScanMode({ active: true, type: null, value: null });
    } else if (tab === 'pos') {
      setScanMode((prev) => ({ ...prev, active: false }));
    } else if (tab === 'redeem') {
      setScanMode((prev) => ({ ...prev, active: false }));
    } else if (tab === 'shift') {
      setScanMode((prev) => ({ ...prev, active: false }));
      if (activeStore) {
        fetchRecentTransactions(activeStore.id);
      }
    }
  };

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
  ) => {
    if (!activeStore) {
      posAudio.playError();
      posHaptics.error();
      setFeedback({
        state: 'error',
        title: t('cashier_no_assignment_title'),
        message: t('cashier_no_assignment_desc'),
      });
      return;
    }

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
          title: t('cashier_tx_issue_title'),
          message: `${t('pos_points_awarded_feedback', { points: data.pointsIssued, name: data.customerName || t('cashier_customer_label') })}`,
          points: data.pointsIssued,
          customerName: data.customerName || t('cashier_customer_label'),
          newBalance: data.newBalance,
          storeName: data.storeName,
        });

        fetchRecentTransactions(activeStore.id);
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
          title: t('cashier_tx_redeem_title'),
          message: t('pos_voucher_redeemed_feedback', { title: data.rewardName }),
          rewardName: data.rewardName,
          voucherCode: data.voucherCode,
          newBalance: data.newBalance,
          storeName: data.storeName,
        });

        fetchRecentTransactions(activeStore.id);
      }
    } catch (err: any) {
      posAudio.playError();
      posHaptics.error();
      const message =
        err instanceof ApiError
          ? err.message
          : err.response?.data?.error || err.message || t('pos_transaction_error');

      setFeedback({
        state: 'error',
        title: t('cashier_tx_declined'),
        message,
      });
    }
  };

  const handleProcessStart = (
    type: 'issue' | 'redeem',
    amount: number,
    rewardId?: string,
    rewardName?: string,
    customerQrToken?: string,
    customerName?: string
  ) => {
    if (customerQrToken) {
      // Direct phone lookup execution without camera
      executeTransaction(
        type,
        type === 'issue' ? amount : rewardId,
        customerQrToken,
        rewardName
      );
      return;
    }

    setScanMode({
      active: true,
      type,
      value: type === 'issue' ? amount : rewardId,
      rewardName,
    });
  };

  const handleScanSuccess = async (decodedText: string) => {
    posHaptics.scan();
    const modeType = scanMode.type;
    const modeValue = scanMode.value;
    const modeRewardName = scanMode.rewardName;
    setScanMode((prev) => ({ ...prev, active: false }));

    if (modeType && modeValue !== null) {
      await executeTransaction(modeType, modeValue, decodedText, modeRewardName);
    }
  };

  const handleScanError = (_error: string) => {
    // Silent continuous polling
  };

  // Compute shift stats
  const totalEarnTxs = recentTxs.filter((t) => t.type === 'earn').length;
  const totalPointsIssued = recentTxs
    .filter((t) => t.type === 'earn')
    .reduce((acc, t) => acc + (t.pointsAffected || 0), 0);

  return (
    <div className="min-h-screen bg-background flex flex-col text-foreground" dir={dir}>
      {/* MOBILE TOP BAR with 1-Tap Scene Switcher (<md) */}
      <MobileHeader
        scene="cashier"
        storeName={activeStore?.name}
        storeColor={activeStore?.primaryColor}
        onLogout={handleLogout}
      />

      {/* DESKTOP TOP BAR (md+) */}
      <header className="sticky top-0 z-40 hidden md:flex h-14 lg:h-16 shrink-0 items-center justify-between border-b border-border/60 bg-background/95 px-4 sm:px-8 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <FidelyLogo size="sm" variant="subtle" />
          <div>
            <div className="flex items-center gap-1 sm:gap-2">
              <span className="font-extrabold text-xs sm:text-base tracking-tight">Fidely POS</span>
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[9px] sm:text-[10px] font-bold px-1 sm:px-2 py-0.5">
                {t('cashier_live_badge')}
              </Badge>
            </div>
          </div>
        </div>

        {/* Store Selector & Controls */}
        <div className="flex items-center gap-1 sm:gap-3">
          {stores.length > 1 ? (
            <div className="flex items-center gap-1">
              <Store className="h-4 w-4 text-muted-foreground hidden sm:inline" />
              <Select value={activeStore?.id || ''} onValueChange={handleSelectStore} dir={dir}>
                <SelectTrigger className="h-7 sm:h-9 text-xs font-semibold w-[100px] sm:w-[200px] rounded-xl">
                  <SelectValue placeholder={t('store_switcher_select_store')} />
                </SelectTrigger>
                <SelectContent dir={dir}>
                  {stores.map((s) => (
                    <SelectItem key={s.id} value={s.id} className="text-xs font-medium">
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : activeStore ? (
            <div className="flex items-center gap-1.5 px-2 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-muted border border-border/60 text-xs font-bold truncate max-w-[90px] sm:max-w-none">
              <span
                className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: activeStore.primaryColor || '#10b981' }}
              />
              <span className="truncate">{activeStore.name}</span>
            </div>
          ) : null}

          {profile && (
            <div className="hidden lg:flex flex-col text-end pe-2">
              <span className="text-xs font-bold text-foreground">
                {profile.full_name || profile.email.split('@')[0]}
              </span>
              <span className="text-[10px] text-muted-foreground font-mono" dir="ltr">
                {profile.email}
              </span>
            </div>
          )}

          <div className="hidden sm:block">
            <LanguageSwitcher />
          </div>
          <ThemeToggleButton />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="gap-1 text-xs text-muted-foreground hover:text-foreground h-7 sm:h-9 rounded-xl px-1.5 sm:px-3"
          >
            <LogOut className="h-3.5 w-3.5 sm:h-4 sm:w-4 rtl:rotate-180" />
            <span className="hidden sm:inline">{t('logout')}</span>
          </Button>
        </div>
      </header>

      {/* MAIN TERMINAL BODY */}
      <main className="flex-1 flex flex-col items-center justify-start p-3 sm:p-8 max-w-5xl mx-auto w-full space-y-4 sm:space-y-6 pb-24 md:pb-8">
        {/* SHIFT STATS & STORE BRAND BAR (Desktop only) */}
        {activeStore && (
          <div className="w-full hidden md:flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-3xl bg-muted/40 border border-border/60">
            <div className="flex items-center gap-3">
              <div
                className="w-3 h-10 rounded-full shrink-0"
                style={{ backgroundColor: activeStore.primaryColor || '#10b981' }}
              />
              <div className="text-start">
                <h2 className="text-base font-black tracking-tight">{activeStore.name} {t('cashier_pos_title')}</h2>
                <p className="text-xs text-muted-foreground">
                  {t('cashier_earning_multiplier', { points: activeStore.pointsPerTnd })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5 bg-background border border-border/60 px-3 py-1.5 rounded-xl shadow-xs">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-muted-foreground">{t('cashier_shift_stats', { txns: totalEarnTxs, pts: totalPointsIssued })}</span>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowHistoryModal(true)}
                className="h-8 text-xs font-semibold rounded-xl gap-1.5 bg-background"
              >
                <History className="w-3.5 h-3.5" />
                <span>{t('cashier_shift_history_btn', { count: recentTxs.length })}</span>
              </Button>
            </div>
          </div>
        )}

        {/* SCANNER / INPUT WORKSPACE */}
        <div className="w-full max-w-lg space-y-4 sm:space-y-6">
          {/* Mobile Shift Scene */}
          {mobileTab === 'shift' && activeStore ? (
            <div className="space-y-4 md:hidden animate-in fade-in duration-200">
              {/* Shift Stats Card */}
              <div className="p-4 rounded-3xl bg-card border border-border/70 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <History className="w-4 h-4 text-primary" />
                    <h3 className="font-bold text-sm">{t('cashier_shift_log_title') || 'Today’s Shift Summary'}</h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => fetchRecentTransactions(activeStore.id)}
                    disabled={isLoadingRecent}
                    className="h-7 px-2 text-xs gap-1 rounded-xl"
                  >
                    <RefreshCw className={`w-3 h-3 ${isLoadingRecent ? 'animate-spin' : ''}`} />
                    <span>{t('refresh') || 'Refresh'}</span>
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 rounded-2xl bg-muted/40 border border-border/50 text-start">
                    <p className="text-[11px] text-muted-foreground font-medium">{t('cashier_shift_sales') || 'Earn Txs'}</p>
                    <p className="text-xl font-black text-foreground mt-0.5">{totalEarnTxs}</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-start">
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">{t('cashier_points_issued') || 'Points Issued'}</p>
                    <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">+{totalPointsIssued}</p>
                  </div>
                </div>
              </div>

              {/* Transactions List */}
              <div className="p-4 rounded-3xl bg-card border border-border/70 shadow-sm space-y-3">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider text-start">
                  {t('cashier_recent_activity_title') || 'Recent Shift Receipts'} ({recentTxs.length})
                </h4>

                {recentTxs.length === 0 ? (
                  <div className="py-8 text-center text-xs text-muted-foreground">
                    {t('cashier_no_shift_txns') || 'No transactions yet in this shift.'}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {recentTxs.map((tx) => (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between p-3 rounded-2xl bg-muted/30 border border-border/40 text-start"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                              tx.type === 'earn' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-primary/10 text-primary'
                            }`}
                          >
                            {tx.type === 'earn' ? <Coins className="w-4 h-4" /> : <Gift className="w-4 h-4" />}
                          </div>
                          <div className="truncate">
                            <p className="text-xs font-bold text-foreground truncate">{tx.customerName}</p>
                            <p className="text-[10px] text-muted-foreground font-mono">
                              {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              {tx.amountTnd ? ` • ${tx.amountTnd} TND` : ''}
                            </p>
                          </div>
                        </div>

                        <Badge
                          variant="outline"
                          className={`font-mono text-xs font-bold shrink-0 ${
                            tx.type === 'earn'
                              ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                              : 'bg-primary/10 text-primary border-primary/30'
                          }`}
                          dir="ltr"
                        >
                          {tx.type === 'earn' ? `+${tx.pointsAffected}` : `${tx.pointsAffected}`} pts
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : activeStore ? (
            <>
              {!scanMode.active ? (
                <TransactionPanel
                  storeId={activeStore.id}
                  storeName={activeStore.name}
                  pointsPerTnd={activeStore.pointsPerTnd}
                  controlledTab={mobileTab === 'redeem' ? 'redeem' : 'issue'}
                  onTabChange={(tab) => setMobileTab(tab === 'redeem' ? 'redeem' : 'pos')}
                  onProcess={handleProcessStart}
                />
              ) : (
                <div className="space-y-4 bg-card border border-border/80 rounded-3xl p-6 shadow-xl animate-in zoom-in-95 duration-200">
                  <div className="bg-primary/10 border border-primary/20 text-primary p-3.5 rounded-2xl text-center space-y-1">
                    <span className="text-xs font-medium uppercase tracking-wider block opacity-80">
                      {t('cashier_awaiting_qr')}
                    </span>
                    <h3 className="font-bold text-base">
                      {scanMode.type === 'issue'
                        ? t('cashier_award_points_heading', {
                            amount: scanMode.value,
                            points: Math.round(Number(scanMode.value) * activeStore.pointsPerTnd),
                          })
                        : t('cashier_redeem_perk_heading', { name: scanMode.rewardName || 'Reward' })}
                    </h3>
                  </div>

                  <QRScanner onScanSuccess={handleScanSuccess} onScanError={handleScanError} />

                  <Button
                    variant="outline"
                    onClick={() => setScanMode({ active: false, type: null, value: null })}
                    className="w-full h-12 rounded-2xl text-sm font-semibold hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                  >
                    {t('cashier_cancel_scan')}
                  </Button>
                </div>
              )}
            </>
          ) : !isLoadingStores && stores.length === 0 ? (
            <div className="text-center p-8 bg-card border border-destructive/30 rounded-3xl space-y-4 shadow-sm">
              <ShieldAlert className="h-12 w-12 text-destructive mx-auto" />
              <div className="space-y-1">
                <h2 className="text-lg font-bold text-foreground">{t('cashier_no_assignment_title')}</h2>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  {t('cashier_no_assignment_desc')}
                </p>
              </div>
              <Button onClick={() => fetchStores()} variant="outline" size="sm" className="rounded-xl text-xs gap-1.5">
                <RefreshCw className="w-3.5 h-3.5" />
                {t('cashier_retry_connection')}
              </Button>
            </div>
          ) : (
            <div className="text-center p-12 space-y-3">
              <RefreshCw className="w-8 h-8 animate-spin text-primary mx-auto" />
              <h2 className="text-base font-bold text-muted-foreground">{t('cashier_initializing')}</h2>
            </div>
          )}

          {/* RECENT ACTIVITY COMPONENT UNDER PANEL */}
          {activeStore && recentTxs.length > 0 && !scanMode.active && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  {t('cashier_recent_activity_title')}
                </span>
                <button
                  onClick={() => setShowHistoryModal(true)}
                  className="text-xs font-semibold text-primary hover:underline flex items-center gap-0.5"
                >
                  {t('cashier_view_all', { count: recentTxs.length })}
                  <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180" />
                </button>
              </div>

              <div className="space-y-2">
                {recentTxs.slice(0, 3).map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-card border border-border/60 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                          tx.type === 'earn'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : 'bg-primary/10 text-primary'
                        }`}
                      >
                        {tx.type === 'earn' ? (
                          <ArrowUpRight className="w-4 h-4 rtl:rotate-180" />
                        ) : (
                          <ArrowDownLeft className="w-4 h-4 rtl:rotate-180" />
                        )}
                      </div>
                      <div className="text-start">
                        <span className="text-xs font-bold block">{tx.customerName}</span>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {tx.amountTnd ? ` • ${tx.amountTnd} TND` : ''}
                        </span>
                      </div>
                    </div>

                    <Badge
                      className={`font-mono text-xs font-bold ${
                        tx.type === 'earn'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                          : 'bg-primary/10 text-primary border-primary/20'
                      }`}
                      dir="ltr"
                    >
                      {tx.type === 'earn' ? `+${tx.pointsAffected}` : `${tx.pointsAffected}`} pts
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* SHIFT HISTORY FULL DRAWER / MODAL */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" dir={dir}>
          <div className="w-full max-w-lg bg-card border border-border/80 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-black tracking-tight">{t('cashier_shift_log_title')}</h3>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowHistoryModal(false)}
                className="w-8 h-8 rounded-full"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pe-1">
              {recentTxs.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted-foreground">
                  {t('cashier_no_shift_txns')}
                </div>
              ) : (
                recentTxs.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-muted/30 border border-border/50"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold ${
                          tx.type === 'earn'
                            ? 'bg-emerald-500/10 text-emerald-600'
                            : 'bg-primary/10 text-primary'
                        }`}
                      >
                        {tx.type === 'earn' ? <Coins className="w-4 h-4" /> : <Gift className="w-4 h-4" />}
                      </div>
                      <div className="text-start">
                        <div className="text-xs font-bold">{tx.customerName}</div>
                        <div className="text-[10px] text-muted-foreground font-mono">
                          {new Date(tx.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                          })}
                          {tx.amountTnd ? ` • ${tx.amountTnd} TND` : ` • ${t('cashier_claimed_perk')}`}
                        </div>
                      </div>
                    </div>

                    <Badge
                      variant="outline"
                      className={`font-mono text-xs font-bold ${
                        tx.type === 'earn'
                          ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                          : 'bg-primary/10 text-primary border-primary/30'
                      }`}
                      dir="ltr"
                    >
                      {tx.type === 'earn' ? `+${tx.pointsAffected} pts` : `${tx.pointsAffected} pts`}
                    </Badge>
                  </div>
                ))
              )}
            </div>

            <Button
              onClick={() => setShowHistoryModal(false)}
              className="w-full rounded-2xl font-bold"
            >
              {t('cashier_close_log')}
            </Button>
          </div>
        </div>
      )}

      {/* MODERN FEEDBACK MODAL OVERLAY */}
      <FeedbackOverlay
        data={feedback}
        onDismiss={() => setFeedback({ state: 'idle' })}
      />

      {/* DOCKED MOBILE BOTTOM NAVIGATION BAR (<md) */}
      <CashierBottomNav
        activeTab={mobileTab}
        onSelectTab={handleSelectMobileTab}
        shiftTxCount={recentTxs.length}
      />
    </div>
  );
}


