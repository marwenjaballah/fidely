'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { QRScanner } from '@/components/qr-scanner';
import { TransactionPanel } from '@/features/cashier/components/transaction-panel';
import { FeedbackOverlay, FeedbackState } from '@/features/cashier/components/feedback-overlay';
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
import { LogOut, Coffee, Store, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';
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

  const [scanMode, setScanMode] = useState<{ active: boolean; type: 'issue' | 'redeem' | null; value: any }>({
    active: false,
    type: null,
    value: null,
  });
  const [feedback, setFeedback] = useState<{ state: FeedbackState; message?: string }>({ state: 'idle' });

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

  useEffect(() => {
    if (hasHydrated) {
      if (!isAuthenticated) {
        router.push('/auth/login');
      } else {
        fetchStores();
      }
    }
  }, [hasHydrated, isAuthenticated, router, fetchStores]);

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

  const handleProcessStart = (type: 'issue' | 'redeem', amount: number, rewardId?: string) => {
    setScanMode({ active: true, type, value: type === 'issue' ? amount : rewardId });
  };

  const handleScanSuccess = async (decodedText: string) => {
    setScanMode({ ...scanMode, active: false });

    if (!activeStore) {
      setFeedback({
        state: 'error',
        message: 'No store selected. Please select a store on the terminal first.',
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

        // Play pleasant beep sound
        try {
          const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const oscillator = audioCtx.createOscillator();
          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
          oscillator.connect(audioCtx.destination);
          oscillator.start();
          oscillator.stop(audioCtx.currentTime + 0.12);
        } catch {}

        setFeedback({
          state: 'success',
          message: `Issued +${data.pointsIssued} pts to ${data.customerName || 'Customer'}! (New Balance: ${data.newBalance} pts)`,
        });
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

        setFeedback({
          state: 'success',
          message: `Successfully redeemed '${data.rewardName}'! Voucher Code: ${data.voucherCode} (Remaining: ${data.newBalance} pts)`,
        });
      }
    } catch (err: any) {
      const message = err instanceof ApiError ? err.message : err.response?.data?.error || err.message || 'Transaction failed.';
      setFeedback({
        state: 'error',
        message,
      });
    }
  };

  const handleScanError = (_error: string) => {
    // Silent continuous scanner polling
  };

  return (
    <div className="min-h-screen bg-background flex flex-col text-foreground">
      {/* Cashier Top Navigation Bar */}
      <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between border-b border-border/60 bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 sm:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Coffee className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm sm:text-base">Fidely POS</span>
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[10px] px-1.5 py-0">
                Cashier Terminal
              </Badge>
            </div>
          </div>
        </div>

        {/* Store Selector & Operator Info */}
        <div className="flex items-center gap-3">
          {stores.length > 1 ? (
            <div className="flex items-center gap-1.5">
              <Store className="h-4 w-4 text-muted-foreground" />
              <Select value={activeStore?.id || ''} onValueChange={handleSelectStore}>
                <SelectTrigger className="h-8 text-xs font-semibold w-[160px] sm:w-[190px]">
                  <SelectValue placeholder="Select Store" />
                </SelectTrigger>
                <SelectContent>
                  {stores.map((s) => (
                    <SelectItem key={s.id} value={s.id} className="text-xs">
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : activeStore ? (
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted border border-border/60 text-xs font-medium">
              <Store className="h-3.5 w-3.5 text-primary" />
              <span>{activeStore.name}</span>
            </div>
          ) : null}

          {profile && (
            <div className="hidden md:flex flex-col text-right">
              <span className="text-xs font-semibold text-foreground">
                {profile.full_name || profile.email.split('@')[0]}
              </span>
              <span className="text-[10px] text-muted-foreground font-mono">
                {profile.email}
              </span>
            </div>
          )}

          <ThemeToggleButton />
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Log out</span>
          </Button>
        </div>
      </header>

      {/* Main Terminal Body */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md space-y-6">
          {/* Active Store Indicator Card */}
          {activeStore ? (
            <div className="text-center space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-1">
                <Store className="h-3.5 w-3.5" />
                Operating at: <span className="font-bold">{activeStore.name}</span>
                <span className="text-muted-foreground text-[11px]">(1 TND = {activeStore.pointsPerTnd} pts)</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Point of Sale Terminal</h1>
              <p className="text-sm text-muted-foreground">Select an operation and scan the customer&apos;s loyalty QR pass.</p>
            </div>
          ) : !isLoadingStores && stores.length === 0 ? (
            <div className="text-center p-8 bg-card border border-destructive/30 rounded-3xl space-y-3">
              <ShieldAlert className="h-10 w-10 text-destructive mx-auto" />
              <h2 className="text-lg font-bold text-foreground">No Store Assignment</h2>
              <p className="text-xs text-muted-foreground">
                Your account is not assigned to any active store. Please ask the merchant owner to invite your email as a cashier.
              </p>
            </div>
          ) : (
            <div className="text-center space-y-1">
              <h1 className="text-2xl font-bold">Loading Terminal...</h1>
            </div>
          )}

          {activeStore && (
            <>
              {!scanMode.active ? (
                <TransactionPanel onProcess={handleProcessStart} />
              ) : (
                <div className="space-y-4 bg-card border border-border/60 rounded-3xl p-6 shadow-sm">
                  <div className="bg-primary/10 text-primary p-3 rounded-xl text-center font-semibold text-sm">
                    Scanning pass for{' '}
                    {scanMode.type === 'issue'
                      ? `Awarding points for ${scanMode.value} TND`
                      : `Redeeming reward: ${scanMode.value}`}
                  </div>
                  <QRScanner onScanSuccess={handleScanSuccess} onScanError={handleScanError} />
                  <Button
                    variant="outline"
                    onClick={() => setScanMode({ active: false, type: null, value: null })}
                    className="w-full"
                  >
                    Cancel Scan
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <FeedbackOverlay
        state={feedback.state}
        message={feedback.message}
        onDismiss={() => setFeedback({ state: 'idle' })}
      />
    </div>
  );
}
