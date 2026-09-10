'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { QRScanner } from '@/components/qr-scanner';
import { TransactionPanel } from '@/features/cashier/components/transaction-panel';
import { FeedbackOverlay, FeedbackData } from '@/features/cashier/components/feedback-overlay';
import { posAudio } from '@/features/cashier/lib/pos-audio';
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
import { createCookieAuthApiClient, ApiError } from '@/lib/api-client';
import { AUTH_ROUTES } from '@/features/auth/services/auth-service';
import axios from 'axios';

interface CashierStoreInfo {
  id: string;
  name: string;
  slug: string;
  primaryColor: string;
  pointsPerTnd: number;
  isOwner: boolean;
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
  const refreshClient = axios.create({
    baseURL: baseURL.replace(/\/$/, ''),
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true,
  });
  apiClient = createCookieAuthApiClient({
    baseURL,
    useCookies: true,
    refreshUrl: AUTH_ROUTES.refresh,
    onRefresh: async () => {
      await refreshClient.post(AUTH_ROUTES.refresh, {});
    },
  });
  return apiClient;
}

export default function CashierPage() {
  const { profile, signOut, isAuthenticated, hasHydrated } = useAuth();
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
      } else {
        fetchStores();
      }
    }
  }, [hasHydrated, isAuthenticated, router, fetchStores]);

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

  const handleProcessStart = (
    type: 'issue' | 'redeem',
    amount: number,
    rewardId?: string,
    rewardName?: string
  ) => {
    setScanMode({
      active: true,
      type,
      value: type === 'issue' ? amount : rewardId,
      rewardName,
    });
  };

  const handleScanSuccess = async (decodedText: string) => {
    setScanMode((prev) => ({ ...prev, active: false }));

    if (!activeStore) {
      posAudio.playError();
      setFeedback({
        state: 'error',
        title: 'Store Not Selected',
        message: 'Please select an active store on your cashier terminal first.',
      });
      return;
    }

    try {
      const client = getCashierApiClient();

      if (scanMode.type === 'issue') {
        const { data } = await client.post<{
          newBalance: number;
          pointsIssued: number;
          storeName: string;
          customerName: string;
        }>('/api/v1/transactions/issue', {
          qrToken: decodedText,
          amountTnd: Number(scanMode.value),
          storeId: activeStore.id,
        });

        posAudio.playSuccess();
        setFeedback({
          state: 'success',
          type: 'issue',
          title: 'Points Awarded!',
          message: `Successfully issued +${data.pointsIssued} points for ${scanMode.value} TND.`,
          points: data.pointsIssued,
          customerName: data.customerName || 'Customer',
          newBalance: data.newBalance,
          storeName: data.storeName,
        });

        // Refresh recent activity feed
        fetchRecentTransactions(activeStore.id);
      } else if (scanMode.type === 'redeem') {
        const { data } = await client.post<{
          newBalance: number;
          voucherCode: string;
          rewardName: string;
          storeName: string;
        }>('/api/v1/transactions/redeem', {
          qrToken: decodedText,
          rewardId: String(scanMode.value),
          storeId: activeStore.id,
        });

        posAudio.playSuccess();
        setFeedback({
          state: 'success',
          type: 'redeem',
          title: 'Reward Redeemed!',
          message: `Claimed '${data.rewardName}' voucher successfully.`,
          rewardName: data.rewardName,
          voucherCode: data.voucherCode,
          newBalance: data.newBalance,
          storeName: data.storeName,
        });

        // Refresh recent activity feed
        fetchRecentTransactions(activeStore.id);
      }
    } catch (err: any) {
      posAudio.playError();
      const message =
        err instanceof ApiError
          ? err.message
          : err.response?.data?.error || err.message || 'Transaction failed.';

      setFeedback({
        state: 'error',
        title: 'Transaction Declined',
        message,
      });
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
    <div className="min-h-screen bg-background flex flex-col text-foreground">
      {/* CASHIER TOP BAR */}
      <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between border-b border-border/60 bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 sm:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-sm">
            <Coffee className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm sm:text-base tracking-tight">Fidely POS</span>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] font-bold px-2 py-0.5">
                ● Live Terminal
              </Badge>
            </div>
          </div>
        </div>

        {/* Store Selector & Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {stores.length > 1 ? (
            <div className="flex items-center gap-1.5">
              <Store className="h-4 w-4 text-muted-foreground hidden sm:inline" />
              <Select value={activeStore?.id || ''} onValueChange={handleSelectStore}>
                <SelectTrigger className="h-9 text-xs font-semibold w-[150px] sm:w-[200px] rounded-xl">
                  <SelectValue placeholder="Select Store" />
                </SelectTrigger>
                <SelectContent>
                  {stores.map((s) => (
                    <SelectItem key={s.id} value={s.id} className="text-xs font-medium">
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : activeStore ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted border border-border/60 text-xs font-bold">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: activeStore.primaryColor || '#10b981' }}
              />
              <span>{activeStore.name}</span>
            </div>
          ) : null}

          {profile && (
            <div className="hidden lg:flex flex-col text-right pr-2">
              <span className="text-xs font-bold text-foreground">
                {profile.full_name || profile.email.split('@')[0]}
              </span>
              <span className="text-[10px] text-muted-foreground font-mono">
                {profile.email}
              </span>
            </div>
          )}

          <ThemeToggleButton />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="gap-1.5 text-xs text-muted-foreground hover:text-foreground h-9 rounded-xl"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Log out</span>
          </Button>
        </div>
      </header>

      {/* MAIN TERMINAL BODY */}
      <main className="flex-1 flex flex-col items-center justify-start p-4 sm:p-8 max-w-5xl mx-auto w-full space-y-6">
        {/* SHIFT STATS & STORE BRAND BAR */}
        {activeStore && (
          <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-3xl bg-muted/40 border border-border/60">
            <div className="flex items-center gap-3">
              <div
                className="w-3 h-10 rounded-full"
                style={{ backgroundColor: activeStore.primaryColor || '#10b981' }}
              />
              <div>
                <h2 className="text-base font-black tracking-tight">{activeStore.name} Terminal</h2>
                <p className="text-xs text-muted-foreground">
                  Earning Multiplier: <strong className="text-foreground">1 TND = {activeStore.pointsPerTnd} points</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5 bg-background border border-border/60 px-3 py-1.5 rounded-xl shadow-xs">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-muted-foreground">Shift:</span>
                <span className="font-bold text-foreground">{totalEarnTxs} txns</span>
                <span className="text-muted-foreground font-mono">({totalPointsIssued} pts)</span>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowHistoryModal(true)}
                className="h-8 text-xs font-semibold rounded-xl gap-1.5 bg-background"
              >
                <History className="w-3.5 h-3.5" />
                <span>Shift History ({recentTxs.length})</span>
              </Button>
            </div>
          </div>
        )}

        {/* SCANNER / INPUT WORKSPACE */}
        <div className="w-full max-w-lg space-y-6">
          {activeStore ? (
            <>
              {!scanMode.active ? (
                <TransactionPanel
                  storeId={activeStore.id}
                  storeName={activeStore.name}
                  pointsPerTnd={activeStore.pointsPerTnd}
                  onProcess={handleProcessStart}
                />
              ) : (
                <div className="space-y-4 bg-card border border-border/80 rounded-3xl p-6 shadow-xl animate-in zoom-in-95 duration-200">
                  <div className="bg-primary/10 border border-primary/20 text-primary p-3.5 rounded-2xl text-center space-y-1">
                    <span className="text-xs font-medium uppercase tracking-wider block opacity-80">
                      Awaiting Customer Loyalty Pass
                    </span>
                    <h3 className="font-bold text-base">
                      {scanMode.type === 'issue'
                        ? `Award points for ${scanMode.value} TND (+${Math.round(Number(scanMode.value) * activeStore.pointsPerTnd)} pts)`
                        : `Redeem Perk: ${scanMode.rewardName || 'Reward'}`}
                    </h3>
                  </div>

                  <QRScanner onScanSuccess={handleScanSuccess} onScanError={handleScanError} />

                  <Button
                    variant="outline"
                    onClick={() => setScanMode({ active: false, type: null, value: null })}
                    className="w-full h-12 rounded-2xl text-sm font-semibold hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                  >
                    Cancel Scan
                  </Button>
                </div>
              )}
            </>
          ) : !isLoadingStores && stores.length === 0 ? (
            <div className="text-center p-8 bg-card border border-destructive/30 rounded-3xl space-y-4 shadow-sm">
              <ShieldAlert className="h-12 w-12 text-destructive mx-auto" />
              <div className="space-y-1">
                <h2 className="text-lg font-bold text-foreground">No Store Assignment</h2>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  Your account is not assigned to any active store. Please contact your store manager or owner to invite your email as a cashier.
                </p>
              </div>
              <Button onClick={() => fetchStores()} variant="outline" size="sm" className="rounded-xl text-xs gap-1.5">
                <RefreshCw className="w-3.5 h-3.5" />
                Retry Connection
              </Button>
            </div>
          ) : (
            <div className="text-center p-12 space-y-3">
              <RefreshCw className="w-8 h-8 animate-spin text-primary mx-auto" />
              <h2 className="text-base font-bold text-muted-foreground">Initializing POS Terminal...</h2>
            </div>
          )}

          {/* RECENT ACTIVITY COMPONENT UNDER PANEL */}
          {activeStore && recentTxs.length > 0 && !scanMode.active && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  Recent Activity
                </span>
                <button
                  onClick={() => setShowHistoryModal(true)}
                  className="text-xs font-semibold text-primary hover:underline flex items-center gap-0.5"
                >
                  View All ({recentTxs.length})
                  <ChevronRight className="w-3.5 h-3.5" />
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
                          <ArrowUpRight className="w-4 h-4" />
                        ) : (
                          <ArrowDownLeft className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <span className="text-xs font-bold block">{tx.customerName}</span>
                        <span className="text-[10px] text-muted-foreground">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-card border border-border/80 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-black tracking-tight">Shift Transaction Log</h3>
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

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {recentTxs.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted-foreground">
                  No transactions processed during this shift yet.
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
                      <div>
                        <div className="text-xs font-bold">{tx.customerName}</div>
                        <div className="text-[10px] text-muted-foreground">
                          {new Date(tx.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                          })}
                          {tx.amountTnd ? ` • Spent ${tx.amountTnd} TND` : ' • Reward Redemption'}
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
              Close Log
            </Button>
          </div>
        </div>
      )}

      {/* MODERN FEEDBACK MODAL OVERLAY */}
      <FeedbackOverlay
        data={feedback}
        onDismiss={() => setFeedback({ state: 'idle' })}
      />
    </div>
  );
}
