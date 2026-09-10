'use client';

import { useState, useEffect, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles,
  Gift,
  Coins,
  Delete,
  Check,
  QrCode,
  Calculator,
  RefreshCw,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { posAudio } from '../lib/pos-audio';
import { createCookieAuthApiClient } from '@/lib/api-client';
import { AUTH_ROUTES } from '@/features/auth/services/auth-service';
import axios from 'axios';

interface StoreReward {
  id: string;
  name: string;
  description?: string | null;
  pointsCost: number;
}

interface TransactionPanelProps {
  storeId?: string;
  storeName?: string;
  pointsPerTnd?: number;
  onProcess: (type: 'issue' | 'redeem', amount: number, rewardId?: string, rewardName?: string) => void;
}

const PRESET_AMOUNTS = [5, 10, 15, 20, 30, 50, 100];

const baseURL = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000').replace(/\/$/, '');
let client: ReturnType<typeof createCookieAuthApiClient> | null = null;

function getApiClient() {
  if (client) return client;
  const refreshClient = axios.create({
    baseURL: baseURL.replace(/\/$/, ''),
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true,
  });
  client = createCookieAuthApiClient({
    baseURL,
    useCookies: true,
    refreshUrl: AUTH_ROUTES.refresh,
    onRefresh: async () => {
      await refreshClient.post(AUTH_ROUTES.refresh, {});
    },
  });
  return client;
}

export function TransactionPanel({
  storeId,
  storeName,
  pointsPerTnd = 10,
  onProcess,
}: TransactionPanelProps) {
  const [activeTab, setActiveTab] = useState<'issue' | 'redeem'>('issue');
  const [spendAmount, setSpendAmount] = useState('');
  const [showNumpad, setShowNumpad] = useState(false);

  // Rewards state
  const [rewards, setRewards] = useState<StoreReward[]>([]);
  const [isLoadingRewards, setIsLoadingRewards] = useState(false);
  const [selectedReward, setSelectedReward] = useState<StoreReward | null>(null);
  const [customRewardId, setCustomRewardId] = useState('');
  const [isManualRewardMode, setIsManualRewardMode] = useState(false);

  const fetchRewards = useCallback(async () => {
    if (!storeId) return;
    setIsLoadingRewards(true);
    try {
      const api = getApiClient();
      const { data } = await api.get<StoreReward[]>('/api/v1/transactions/store-rewards', {
        params: { storeId },
      });
      setRewards(data || []);
      if (data && data.length > 0) {
        setSelectedReward(data[0]);
      } else {
        setSelectedReward(null);
      }
    } catch (err) {
      console.error('Failed to load store rewards:', err);
    } finally {
      setIsLoadingRewards(false);
    }
  }, [storeId]);

  useEffect(() => {
    if (activeTab === 'redeem') {
      fetchRewards();
    }
  }, [activeTab, fetchRewards]);

  // Points preview calculation
  const parsedSpend = parseFloat(spendAmount) || 0;
  const estimatedPoints = Math.max(0, Math.round(parsedSpend * pointsPerTnd));

  // Quick preset button click
  const handleQuickAdd = (amount: number) => {
    posAudio.playClick();
    const current = parseFloat(spendAmount) || 0;
    setSpendAmount((current + amount).toString());
  };

  const handleSetExact = (amount: number) => {
    posAudio.playClick();
    setSpendAmount(amount.toString());
  };

  const handleClear = () => {
    posAudio.playClick();
    setSpendAmount('');
  };

  // Numpad key tap
  const handleNumpadTap = (val: string) => {
    posAudio.playClick();
    if (val === 'DEL') {
      setSpendAmount((prev) => prev.slice(0, -1));
    } else if (val === '.') {
      if (!spendAmount.includes('.')) {
        setSpendAmount((prev) => (prev === '' ? '0.' : prev + '.'));
      }
    } else {
      setSpendAmount((prev) => prev + val);
    }
  };

  const handleIssueSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!spendAmount || isNaN(Number(spendAmount)) || Number(spendAmount) <= 0) return;
    posAudio.playClick();
    onProcess('issue', Number(spendAmount));
  };

  const handleRedeemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetId = isManualRewardMode ? customRewardId : selectedReward?.id;
    const targetName = isManualRewardMode ? 'Custom Reward' : selectedReward?.name;

    if (!targetId) return;
    posAudio.playClick();
    onProcess('redeem', 0, targetId, targetName);
  };

  return (
    <div className="w-full bg-card border border-border/80 rounded-3xl shadow-xl overflow-hidden transition-all">
      <Tabs
        value={activeTab}
        onValueChange={(val) => {
          posAudio.playClick();
          setActiveTab(val as 'issue' | 'redeem');
        }}
        className="w-full"
      >
        <div className="p-4 sm:p-6 pb-2 border-b border-border/40 bg-muted/20">
          <TabsList className="grid w-full grid-cols-2 h-12 p-1 bg-muted rounded-2xl">
            <TabsTrigger
              value="issue"
              className="rounded-xl font-bold text-xs sm:text-sm data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm flex items-center gap-2"
            >
              <Coins className="w-4 h-4 text-emerald-500" />
              <span>Issue Points</span>
            </TabsTrigger>
            <TabsTrigger
              value="redeem"
              className="rounded-xl font-bold text-xs sm:text-sm data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm flex items-center gap-2"
            >
              <Gift className="w-4 h-4 text-primary" />
              <span>Redeem Reward</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* ISSUE POINTS TAB */}
        <TabsContent value="issue" className="p-5 sm:p-6 space-y-5 m-0">
          <form onSubmit={handleIssueSubmit} className="space-y-5">
            {/* Amount input field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="spend" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Transaction Amount (TND)
                </Label>
                <button
                  type="button"
                  onClick={() => setShowNumpad(!showNumpad)}
                  className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                >
                  <Calculator className="w-3.5 h-3.5" />
                  {showNumpad ? 'Hide Keypad' : 'Show Keypad'}
                </button>
              </div>

              <div className="relative">
                <Input
                  id="spend"
                  type="number"
                  step="any"
                  placeholder="0.00"
                  value={spendAmount}
                  onChange={(e) => setSpendAmount(e.target.value)}
                  className="text-2xl sm:text-3xl font-black tracking-tight text-center h-16 rounded-2xl bg-muted/40 border-border/70 pr-16"
                  required
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">
                  TND
                </span>
              </div>
            </div>

            {/* Live Calculation Preview Banner */}
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="text-xs font-medium text-emerald-800 dark:text-emerald-300">
                  Rate: 1 TND = {pointsPerTnd} pts
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs text-muted-foreground mr-1.5">Customer earns:</span>
                <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-base">
                  +{estimatedPoints} pts
                </span>
              </div>
            </div>

            {/* Quick Preset Chips */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-muted-foreground font-semibold">
                <span>Quick Add TND</span>
                {spendAmount && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="text-destructive hover:underline font-bold"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-4 gap-2">
                {PRESET_AMOUNTS.slice(0, 4).map((amt) => (
                  <Button
                    key={amt}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickAdd(amt)}
                    className="h-10 rounded-xl font-bold text-xs hover:bg-emerald-500/10 hover:text-emerald-600 hover:border-emerald-500/30"
                  >
                    +{amt}
                  </Button>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-2 pt-1">
                {PRESET_AMOUNTS.slice(4).map((amt) => (
                  <Button
                    key={amt}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleSetExact(amt)}
                    className="h-9 rounded-xl font-medium text-xs bg-muted/40"
                  >
                    Set {amt} TND
                  </Button>
                ))}
              </div>
            </div>

            {/* Optional Touch Screen Numpad */}
            {showNumpad && (
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/40 animate-in fade-in duration-200">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'DEL'].map((key) => (
                  <Button
                    key={key}
                    type="button"
                    variant="outline"
                    onClick={() => handleNumpadTap(key)}
                    className={`h-12 rounded-xl text-lg font-bold ${
                      key === 'DEL'
                        ? 'bg-destructive/10 text-destructive hover:bg-destructive/20 border-destructive/20'
                        : 'bg-muted/40 hover:bg-muted'
                    }`}
                  >
                    {key === 'DEL' ? <Delete className="w-5 h-5" /> : key}
                  </Button>
                ))}
              </div>
            )}

            {/* Launch Scanner Button */}
            <Button
              type="submit"
              disabled={!spendAmount || parsedSpend <= 0}
              className="w-full h-14 text-base font-bold rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 gap-2"
            >
              <QrCode className="w-5 h-5" />
              Scan Customer Pass ({parsedSpend > 0 ? `${parsedSpend} TND` : '0 TND'})
            </Button>
          </form>
        </TabsContent>

        {/* REDEEM REWARD TAB */}
        <TabsContent value="redeem" className="p-5 sm:p-6 space-y-5 m-0">
          <form onSubmit={handleRedeemSubmit} className="space-y-5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Select Store Reward
              </Label>
              <button
                type="button"
                onClick={() => setIsManualRewardMode(!isManualRewardMode)}
                className="text-xs font-semibold text-primary hover:underline"
              >
                {isManualRewardMode ? 'Choose from Catalog' : 'Enter Reward ID'}
              </button>
            </div>

            {!isManualRewardMode ? (
              <div className="space-y-3">
                {isLoadingRewards ? (
                  <div className="flex items-center justify-center p-8 bg-muted/30 rounded-2xl text-xs text-muted-foreground">
                    <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                    Loading available store perks...
                  </div>
                ) : rewards.length === 0 ? (
                  <div className="p-6 bg-muted/30 rounded-2xl text-center space-y-2 border border-dashed border-border">
                    <AlertCircle className="w-6 h-6 text-muted-foreground mx-auto" />
                    <p className="text-xs font-medium text-muted-foreground">
                      No active rewards configured for this store yet.
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsManualRewardMode(true)}
                      className="text-xs mt-2"
                    >
                      Enter Custom Reward Code
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                    {rewards.map((r) => {
                      const isSelected = selectedReward?.id === r.id;
                      return (
                        <div
                          key={r.id}
                          onClick={() => {
                            posAudio.playClick();
                            setSelectedReward(r);
                          }}
                          className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-primary/10 border-primary text-foreground shadow-sm'
                              : 'bg-card border-border hover:bg-muted/50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                                isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                              }`}
                            >
                              <Gift className="w-4 h-4" />
                            </div>
                            <div className="text-left">
                              <h4 className="text-sm font-bold leading-tight">{r.name}</h4>
                              {r.description && (
                                <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                                  {r.description}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <Badge
                              variant={isSelected ? 'default' : 'secondary'}
                              className="font-mono text-xs font-bold"
                            >
                              {r.pointsCost} pts
                            </Badge>
                            {isSelected && (
                              <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                                <Check className="w-3 h-3" />
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="reward-code" className="text-xs text-muted-foreground font-medium">
                  Custom Reward ID
                </Label>
                <Input
                  id="reward-code"
                  type="text"
                  placeholder="Paste reward UUID or voucher code"
                  value={customRewardId}
                  onChange={(e) => setCustomRewardId(e.target.value)}
                  className="h-12 rounded-xl"
                  required
                />
              </div>
            )}

            {/* Launch Scanner Button */}
            <Button
              type="submit"
              disabled={(!isManualRewardMode && !selectedReward) || (isManualRewardMode && !customRewardId)}
              className="w-full h-14 text-base font-bold rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 gap-2"
            >
              <QrCode className="w-5 h-5" />
              Scan Pass to Redeem {selectedReward ? `(${selectedReward.pointsCost} pts)` : ''}
            </Button>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
}
