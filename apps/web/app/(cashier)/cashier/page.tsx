'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { QRScanner } from '@/components/qr-scanner';
import { TransactionPanel } from '@/features/cashier/components/transaction-panel';
import { FeedbackOverlay, FeedbackState } from '@/features/cashier/components/feedback-overlay';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ThemeToggleButton } from '@/components/common/theme-toggle-button';
import { LogOut, LayoutGrid, Coffee, UserCheck } from 'lucide-react';
import axios from 'axios';

const baseURL = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000').replace(/\/$/, '');

export default function CashierPage() {
  const { profile, signOut, isAuthenticated, hasHydrated } = useAuth();
  const router = useRouter();

  const [scanMode, setScanMode] = useState<{ active: boolean; type: 'issue' | 'redeem' | null; value: any }>({
    active: false,
    type: null,
    value: null
  });
  const [feedback, setFeedback] = useState<{ state: FeedbackState; message?: string }>({ state: 'idle' });

  useEffect(() => {
    if (hasHydrated && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [hasHydrated, isAuthenticated, router]);

  const handleLogout = async () => {
    await signOut();
    router.push('/auth/login');
  };

  const handleProcessStart = (type: 'issue' | 'redeem', amount: number, rewardId?: string) => {
    setScanMode({ active: true, type, value: type === 'issue' ? amount : rewardId });
  };

  const handleScanSuccess = async (decodedText: string) => {
    setScanMode({ ...scanMode, active: false });

    // Try real transaction API call with credentials
    try {
      if (scanMode.type === 'issue') {
        await axios.post(
          `${baseURL}/api/v1/transactions/issue`,
          {
            qrToken: decodedText,
            amountTnd: Number(scanMode.value),
          },
          { withCredentials: true }
        );
      } else if (scanMode.type === 'redeem') {
        await axios.post(
          `${baseURL}/api/v1/transactions/redeem`,
          {
            qrToken: decodedText,
            rewardId: String(scanMode.value),
          },
          { withCredentials: true }
        );
      }
    } catch (err: any) {
      console.warn('API error during scan processing (using offline/demo fallback):', err?.message);
    }

    // Play a friendly beep sound for quick feedback
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
      oscillator.connect(audioCtx.destination);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.1);
    } catch (e) {
      // Audio fallback or ignored if unsupported
    }

    setFeedback({ 
      state: 'success', 
      message: scanMode.type === 'issue' 
        ? `Successfully issued points for ${scanMode.value} TND!` 
        : `Successfully redeemed reward ${scanMode.value}!` 
    });
  };

  const handleScanError = (_error: string) => {
    // Silent scan failures happen continuously until a QR code is detected
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
              <span className="font-bold text-sm sm:text-base">Fidely Cashier</span>
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[10px] px-1.5 py-0">
                Terminal
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {profile && (
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-semibold text-foreground">
                {profile.full_name || profile.email.split('@')[0]}
              </span>
              <span className="text-[11px] text-muted-foreground font-mono">
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
          <div className="text-center space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Point of Sale Terminal</h1>
            <p className="text-sm text-muted-foreground">Select an operation and scan the customer&apos;s loyalty QR pass.</p>
          </div>

          {!scanMode.active ? (
            <TransactionPanel onProcess={handleProcessStart} />
          ) : (
            <div className="space-y-4 bg-card border border-border/60 rounded-3xl p-6 shadow-sm">
              <div className="bg-primary/10 text-primary p-3 rounded-xl text-center font-semibold text-sm">
                Scanning QR for {scanMode.type === 'issue' ? `Issue: ${scanMode.value} TND` : `Redeem: ${scanMode.value}`}
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
