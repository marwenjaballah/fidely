'use client';

import React, { useState, useEffect } from 'react';
import {
  Wifi,
  WifiOff,
  RefreshCw,
  Database,
  CheckCircle2,
  AlertTriangle,
  SlidersHorizontal,
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  isOfflineModeEnabled,
  setOfflineModeEnabled,
  getPendingTransactions,
  syncOfflineQueue,
  subscribeToQueueChanges,
  QueuedTransaction,
} from '../lib/offline-queue';
import { useI18n } from '@/lib/i18n';

interface PosOfflineSettingsProps {
  apiClient: any;
  onSyncComplete?: () => void;
  triggerButton?: React.ReactNode;
}

export function PosOfflineSettings({
  apiClient,
  onSyncComplete,
  triggerButton,
}: PosOfflineSettingsProps) {
  const { t, dir } = useI18n();
  const [open, setOpen] = useState(false);
  const [enabled, setEnabled] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [pendingTxs, setPendingTxs] = useState<QueuedTransaction[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  useEffect(() => {
    setEnabled(isOfflineModeEnabled());
    setIsOnline(typeof navigator !== 'undefined' ? navigator.onLine : true);

    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    const unsubscribe = subscribeToQueueChanges((count) => {
      setPendingCount(count);
      getPendingTransactions().then(setPendingTxs).catch(() => {});
    });

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
      unsubscribe();
    };
  }, []);

  const handleToggle = (checked: boolean) => {
    setEnabled(checked);
    setOfflineModeEnabled(checked);
  };

  const handleManualSync = async () => {
    if (isSyncing || pendingCount === 0) return;
    setIsSyncing(true);
    setSyncStatus(t('cashier_syncing_label') || 'Syncing...');
    try {
      const result = await syncOfflineQueue(apiClient);
      setSyncStatus(
        result.failed > 0
          ? t('cashier_sync_partial_msg', { success: result.success, failed: result.failed })
          : t('cashier_sync_success_msg', { count: result.success })
      );
      if (onSyncComplete) onSyncComplete();
    } catch (e: any) {
      setSyncStatus(`Sync failed: ${e.message || 'Unknown error'}`);
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncStatus(null), 4000);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton || (
          <Button
            variant="outline"
            size="sm"
            className="h-8 rounded-xl text-xs font-semibold gap-1.5 border-border/70 shadow-2xs"
          >
            <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
            <span>{t('cashier_pos_settings_btn') || 'POS Settings'}</span>
            {pendingCount > 0 && (
              <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            )}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent dir={dir} className="max-w-md rounded-3xl p-6 bg-card border-border/80 shadow-2xl">
        <DialogHeader className="text-start space-y-1.5 pb-2 border-b border-border/50">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-black tracking-tight text-foreground flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              <span>{t('cashier_offline_settings_title') || 'Offline POS Settings'}</span>
            </DialogTitle>
            <Badge
              variant={isOnline ? 'outline' : 'destructive'}
              className="text-[10px] font-mono font-bold gap-1"
            >
              {isOnline ? (
                <>
                  <Wifi className="h-3 w-3 text-emerald-500" />
                  <span className="text-emerald-600 dark:text-emerald-400">
                    {t('cashier_online_status') || 'Online'}
                  </span>
                </>
              ) : (
                <>
                  <WifiOff className="h-3 w-3" />
                  <span>{t('cashier_offline_status') || 'Offline'}</span>
                </>
              )}
            </Badge>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            {t('cashier_offline_settings_desc')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 text-start">
          {/* Main Mode Toggle Switch */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-muted/40 border border-border/60">
            <div className="space-y-0.5 pe-4">
              <p className="text-xs font-bold text-foreground">
                {t('cashier_offline_point_earning')}
              </p>
              <p className="text-[11px] text-muted-foreground leading-snug">
                {t('cashier_offline_point_earning_desc')}
              </p>
            </div>
            <Switch checked={enabled} onCheckedChange={handleToggle} />
          </div>

          {/* Sync Status Banner */}
          <div className="p-3.5 rounded-2xl border border-border/60 bg-card space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  {t('cashier_queued_transactions')}
                </p>
                <p className="text-base font-black font-mono text-foreground">
                  {pendingCount}{' '}
                  <span className="text-xs font-normal text-muted-foreground">
                    {t('cashier_pending_tx_count', { count: pendingCount })}
                  </span>
                </p>
              </div>
              <Button
                size="sm"
                onClick={handleManualSync}
                disabled={isSyncing || pendingCount === 0 || !isOnline}
                className="h-8 rounded-xl text-xs font-bold gap-1.5 shadow-2xs"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>
                  {isSyncing
                    ? t('cashier_syncing_label') || 'Syncing...'
                    : t('cashier_sync_now_btn') || 'Sync Now'}
                </span>
              </Button>
            </div>

            {syncStatus && (
              <p className="text-[11px] font-mono text-primary animate-in fade-in">
                {syncStatus}
              </p>
            )}

            {/* Preview of pending transactions */}
            {pendingTxs.length > 0 && (
              <div className="max-h-36 overflow-y-auto space-y-1.5 pt-1 border-t border-border/40">
                {pendingTxs.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-2 rounded-xl bg-muted/30 text-[11px] font-mono"
                  >
                    <div>
                      <span className="font-bold text-foreground">+{tx.pointsToIssue} pts</span>
                      <span className="text-muted-foreground ms-2">({tx.amountTnd} TND)</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-700 dark:text-amber-400 space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
              <span>{t('admin_restricted_title') || 'Security Notice'}</span>
            </div>
            <p className="leading-snug">
              Point redemption (rewards) strictly requires live internet connectivity to prevent concurrent double-spending.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
