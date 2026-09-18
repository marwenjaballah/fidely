'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, Sparkles, Gift, Copy, Check, ArrowRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export type FeedbackState = 'idle' | 'success' | 'error';

export interface FeedbackData {
  state: FeedbackState;
  title?: string;
  message?: string;
  type?: 'issue' | 'redeem';
  points?: number;
  newBalance?: number;
  customerName?: string;
  rewardName?: string;
  voucherCode?: string;
  storeName?: string;
}

interface FeedbackOverlayProps {
  data: FeedbackData;
  onDismiss: () => void;
}

export function FeedbackOverlay({ data, onDismiss }: FeedbackOverlayProps) {
  const [copied, setCopied] = useState(false);
  const [progress, setProgress] = useState(100);
  const [remainingSecs, setRemainingSecs] = useState(3);

  const isSuccess = data.state === 'success';
  const totalDuration = isSuccess ? 3000 : 5000;

  useEffect(() => {
    if (data.state === 'idle') return;

    setProgress(100);
    setRemainingSecs(Math.ceil(totalDuration / 1000));
    const startTime = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, totalDuration - elapsed);
      setProgress((remaining / totalDuration) * 100);
      setRemainingSecs(Math.ceil(remaining / 1000));

      if (remaining <= 0) {
        clearInterval(interval);
        onDismiss();
      }
    }, 50);

    return () => clearInterval(interval);
  }, [data.state, onDismiss, totalDuration]);

  if (data.state === 'idle') return null;

  const copyVoucher = () => {
    if (data.voucherCode) {
      navigator.clipboard.writeText(data.voucherCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`relative w-full max-w-md overflow-hidden rounded-3xl border p-6 sm:p-8 shadow-2xl transition-all duration-300 animate-in zoom-in-95 ${
          isSuccess
            ? 'bg-card border-primary/30 text-card-foreground shadow-primary/10'
            : 'bg-card border-destructive/40 text-card-foreground shadow-destructive/10'
        }`}
      >
        {/* Countdown Progress Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-muted overflow-hidden">
          <div
            className={`h-full transition-all duration-75 ease-linear ${
              isSuccess ? 'bg-primary' : 'bg-destructive'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Ambient Top Glow */}
        <div
          className={`absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full blur-3xl opacity-30 pointer-events-none ${
            isSuccess ? 'bg-primary' : 'bg-destructive'
          }`}
        />

        {/* Close Button */}
        <button
          onClick={onDismiss}
          className="absolute top-4 right-4 p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center space-y-4 pt-1">
          {/* Status Icon */}
          <div
            className={`w-20 h-20 rounded-2xl flex items-center justify-center shadow-inner ${
              isSuccess
                ? 'bg-primary/10 text-primary border border-primary/20'
                : 'bg-destructive/10 text-destructive border border-destructive/20'
            }`}
          >
            {isSuccess ? (
              data.type === 'redeem' ? (
                <Gift className="w-10 h-10 animate-bounce" />
              ) : (
                <Sparkles className="w-10 h-10 animate-pulse" />
              )
            ) : (
              <XCircle className="w-10 h-10" />
            )}
          </div>

          {/* Heading & Subtitle */}
          <div className="space-y-1">
            <h2 className="text-2xl font-black tracking-tight">
              {data.title || (isSuccess ? 'Transaction Completed!' : 'Scan Issue')}
            </h2>
            {data.message && (
              <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
                {data.message}
              </p>
            )}
          </div>

          {/* Transaction Summary Card */}
          {isSuccess && (
            <div className="w-full bg-muted/60 border border-border/60 rounded-2xl p-4 space-y-3 text-left">
              {data.customerName && (
                <div className="flex justify-between items-center text-xs pb-2 border-b border-border/40">
                  <span className="text-muted-foreground">Customer</span>
                  <span className="font-semibold text-foreground">{data.customerName}</span>
                </div>
              )}

              {data.type === 'issue' && data.points !== undefined && (
                <div className="flex justify-between items-center text-sm py-1">
                  <span className="font-medium text-muted-foreground">Points Issued</span>
                  <Badge className="bg-primary text-primary-foreground font-mono text-sm px-2.5 py-0.5">
                    +{data.points} pts
                  </Badge>
                </div>
              )}

              {data.type === 'redeem' && data.rewardName && (
                <div className="space-y-2 py-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Claimed Perk</span>
                    <span className="font-bold text-foreground">{data.rewardName}</span>
                  </div>

                  {data.voucherCode && (
                    <div className="flex items-center justify-between bg-background border border-border rounded-xl px-3 py-2">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                          Voucher Code
                        </span>
                        <span className="font-mono font-bold text-sm text-primary tracking-wider">
                          {data.voucherCode}
                        </span>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={copyVoucher}
                        className="h-8 px-2 text-xs gap-1 text-muted-foreground hover:text-foreground"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5" />}
                        {copied ? 'Copied' : 'Copy'}
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {data.newBalance !== undefined && (
                <div className="flex justify-between items-center text-xs pt-2 border-t border-border/40">
                  <span className="text-muted-foreground">Updated Balance</span>
                  <span className="font-mono font-semibold text-foreground">{data.newBalance} pts</span>
                </div>
              )}
            </div>
          )}

          {/* Action Button & Auto-countdown hint */}
          <div className="w-full space-y-2 pt-1">
            <Button
              onClick={onDismiss}
              className={`w-full h-12 text-sm font-bold rounded-2xl gap-2 shadow-md ${
                isSuccess
                  ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/20'
                  : 'bg-destructive hover:bg-destructive/90 text-white shadow-destructive/20'
              }`}
            >
              <span>{isSuccess ? 'Next Customer (Instant)' : 'Dismiss & Try Again'}</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
            <p className="text-[11px] text-muted-foreground font-medium">
              Auto-resetting in <span className="font-mono font-bold text-foreground">{remainingSecs}s</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
