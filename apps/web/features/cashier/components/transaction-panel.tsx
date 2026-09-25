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
  Phone,
  Search,
  UserCheck,
  X,
} from 'lucide-react';
import { posAudio } from '../lib/pos-audio';
import { posHaptics } from '@/lib/haptics';
import { createCookieAuthApiClient, refreshAuthSession } from '@/lib/api-client';
import { AUTH_ROUTES } from '@/features/auth/services/auth-service';
import { useI18n } from '@/lib/i18n';

interface StoreReward {
  id: string;
  name: string;
  description?: string | null;
  pointsCost: number;
  active?: boolean;
}

export interface SearchedCustomer {
  id: string;
  fullName: string;
  phone: string;
  qrToken: string;
  pointsBalance: number;
}

interface TransactionPanelProps {
  storeId?: string;
  storeName?: string;
  currency?: string;
  pointsPerTnd?: number;
  controlledTab?: 'issue' | 'redeem';
  onTabChange?: (tab: 'issue' | 'redeem') => void;
  onProcess: (
    type: 'issue' | 'redeem',
    amount: number,
    rewardId?: string,
    rewardName?: string,
    customerQrToken?: string,
    customerName?: string
  ) => Promise<boolean>;
}

const PRESET_AMOUNTS = [5, 10, 15, 20, 30, 50, 100];

const baseURL = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000').replace(/\/$/, '');
let client: ReturnType<typeof createCookieAuthApiClient> | null = null;

function getApiClient() {
  if (client) return client;
  client = createCookieAuthApiClient({
    baseURL,
    useCookies: true,
    refreshUrl: AUTH_ROUTES.refresh,
    onRefresh: () => refreshAuthSession(baseURL),
  });
  return client;
}

export function TransactionPanel({
  storeId,
  storeName,
  currency = 'TND',
  pointsPerTnd = 10,
  controlledTab,
  onTabChange,
  onProcess,
}: TransactionPanelProps) {
  const { t, dir } = useI18n();
  const [internalTab, setInternalTab] = useState<'issue' | 'redeem'>('issue');
  const activeTab = controlledTab ?? internalTab;
  const setActiveTab = (tab: 'issue' | 'redeem') => {
    if (tab === 'redeem') {
      setMatchedCustomer(null);
      setShowPhoneLookup(false);
      setPhoneQuery('');
      setPhoneSearchError(null);
    }
    setInternalTab(tab);
    onTabChange?.(tab);
  };
  const [spendAmount, setSpendAmount] = useState('');
  const [showNumpad, setShowNumpad] = useState(false);


  // Phone lookup state
  const [phoneQuery, setPhoneQuery] = useState('');
  const [isSearchingPhone, setIsSearchingPhone] = useState(false);
  const [phoneSearchError, setPhoneSearchError] = useState<string | null>(null);
  const [matchedCustomer, setMatchedCustomer] = useState<SearchedCustomer | null>(null);
  const [showPhoneLookup, setShowPhoneLookup] = useState(false);

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

  // Handle phone search
  const handleSearchCustomerPhone = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanPhone = phoneQuery.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 4 || !storeId) return;

    setIsSearchingPhone(true);
    setPhoneSearchError(null);
    posHaptics.tap();

    try {
      const api = getApiClient();
      const { data } = await api.get<any>('/api/v1/transactions/lookup-by-phone', {
        params: { phone: cleanPhone, storeId },
      });
      const results = Array.isArray(data) ? data : data ? [data] : [];
      if (results.length === 0) {
        setMatchedCustomer(null);
        setPhoneSearchError(t('cashier_customer_not_found') || 'No customer found with this phone number');
        posHaptics.error();
        return;
      }
      const raw = results[0];
      const customer: SearchedCustomer = {
        id: raw.customerId || raw.id,
        fullName: raw.fullName || raw.phone || 'Customer',
        phone: raw.phone || cleanPhone,
        qrToken: raw.qrToken || raw.qrCodeToken || `${raw.customerId || raw.id}:${storeId}`,
        pointsBalance: typeof raw.pointsBalance === 'number' ? raw.pointsBalance : 0,
      };
      setMatchedCustomer(customer);
      posHaptics.scan();
    } catch (err: any) {
      setMatchedCustomer(null);
      setPhoneSearchError(err?.message || t('cashier_customer_not_found') || 'Customer not found');
      posHaptics.error();
    } finally {
      setIsSearchingPhone(false);
    }
  };

  // Points preview calculation
  const parsedSpend = parseFloat(spendAmount) || 0;
  const estimatedPoints = Math.max(0, Math.round(parsedSpend * pointsPerTnd));

  // Quick preset button click
  const handleQuickAdd = (amount: number) => {
    posAudio.playClick();
    posHaptics.tap();
    const current = parseFloat(spendAmount) || 0;
    setSpendAmount((current + amount).toString());
  };

  const handleSetExact = (amount: number) => {
    posAudio.playClick();
    posHaptics.tap();
    setSpendAmount(amount.toString());
  };

  const handleClear = () => {
    posAudio.playClick();
    posHaptics.tap();
    setSpendAmount('');
  };

  // Numpad key tap
  const handleNumpadTap = (val: string) => {
    posAudio.playClick();
    posHaptics.tap();
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

  const handleIssueSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!spendAmount || isNaN(Number(spendAmount)) || Number(spendAmount) <= 0) return;
    posAudio.playClick();
    posHaptics.tap();
    if (matchedCustomer) {
      const success = await onProcess('issue', Number(spendAmount), undefined, undefined, matchedCustomer.qrToken, matchedCustomer.fullName);
      if (success) {
        setSpendAmount('');
        setMatchedCustomer(null);
      }
    } else {
      await onProcess('issue', Number(spendAmount));
    }
  };

  const handleRedeemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetId = isManualRewardMode ? customRewardId.trim() : selectedReward?.id;
    const targetName = isManualRewardMode ? `${customRewardId.trim()} pts deduction` : selectedReward?.name;

    if (!targetId) return;
    posAudio.playClick();
    posHaptics.tap();
    // Redeeming rewards or deducting points ALWAYS requires scanning the customer's QR pass
    await onProcess('redeem', 0, targetId, targetName);
  };

  return (
    <div className="w-full bg-card border border-border/80 rounded-3xl shadow-xl overflow-hidden transition-all" dir={dir}>
      {/* PHONE LOOKUP DOCK / DRAWER (ONLY FOR AWARDING POINTS) */}
      {activeTab === 'issue' && (
        <div className="border-b border-border/40 bg-muted/40 p-3 sm:p-4">
          {!showPhoneLookup && !matchedCustomer ? (
            <button
              type="button"
              onClick={() => {
                setShowPhoneLookup(true);
                posHaptics.tap();
              }}
              className="w-full flex items-center justify-between px-4 py-2.5 rounded-2xl bg-background border border-border/60 hover:border-primary/50 text-xs font-semibold text-muted-foreground hover:text-foreground transition-all shadow-xs"
            >
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary" />
                <span>{t('cashier_forgot_phone_prompt')}</span>
              </div>
              <Search className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          ) : (
            <div className="space-y-3 bg-background border border-border rounded-2xl p-3.5 animate-in fade-in-50 duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-primary" />
                  <span className="text-xs font-bold uppercase tracking-wider">{t('cashier_phone_lookup_title')}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setShowPhoneLookup(false);
                    setMatchedCustomer(null);
                    setPhoneQuery('');
                    setPhoneSearchError(null);
                    posHaptics.tap();
                  }}
                  className="w-6 h-6 rounded-full"
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>

              <form onSubmit={handleSearchCustomerPhone} className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    type="tel"
                    placeholder={t('cashier_digits_only_placeholder')}
                    value={phoneQuery}
                    onChange={(e) => {
                      // Strictly numbers only
                      const digits = e.target.value.replace(/\D/g, '');
                      setPhoneQuery(digits);
                    }}
                    className="h-10 text-xs rounded-xl font-mono tracking-wider ps-8"
                    dir="ltr"
                  />
                  <Phone className="w-3.5 h-3.5 text-muted-foreground absolute start-3 top-1/2 -translate-y-1/2" />
                </div>
                <Button
                  type="submit"
                  disabled={isSearchingPhone || !phoneQuery}
                  size="sm"
                  className="h-10 px-4 rounded-xl text-xs font-bold gap-1.5"
                >
                  {isSearchingPhone ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                  {t('cashier_find_btn')}
                </Button>
              </form>

              {phoneSearchError && (
                <p className="text-[11px] text-destructive font-medium">{phoneSearchError}</p>
              )}

              {matchedCustomer && (
                <div className="p-3 bg-primary/10 border border-primary/30 rounded-xl flex items-center justify-between animate-in zoom-in-95">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center">
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <div className="text-start">
                      <div className="text-xs font-bold text-foreground">{matchedCustomer.fullName}</div>
                      <div className="text-[10px] text-muted-foreground font-mono" dir="ltr">
                        {matchedCustomer.phone} • <strong className="text-primary">{matchedCustomer.pointsBalance} pts</strong>
                      </div>
                    </div>
                  </div>
                  <Badge className="bg-primary text-primary-foreground text-[10px] font-bold">
                    {t('cashier_active_customer_badge')}
                  </Badge>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <Tabs
        value={activeTab}
        onValueChange={(val) => {
          posAudio.playClick();
          posHaptics.tap();
          setActiveTab(val as 'issue' | 'redeem');
        }}
        className="w-full"
        dir={dir}
      >
        <div className="p-4 sm:p-6 pb-2 border-b border-border/40 bg-muted/20">
          <TabsList className="grid w-full grid-cols-2 h-12 p-1 bg-muted rounded-2xl">
            <TabsTrigger
              value="issue"
              className="rounded-xl font-bold text-xs sm:text-sm data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm flex items-center gap-2"
            >
              <Coins className="w-4 h-4 text-primary" />
              <span>{t('pos_award_points_tab')}</span>
            </TabsTrigger>
            <TabsTrigger
              value="redeem"
              className="rounded-xl font-bold text-xs sm:text-sm data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm flex items-center gap-2"
            >
              <Gift className="w-4 h-4 text-primary" />
              <span>{t('pos_redeem_reward_tab')}</span>
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
                  {t('cashier_spend_amount_label')}
                </Label>
                <button
                  type="button"
                  onClick={() => {
                    setShowNumpad(!showNumpad);
                    posHaptics.tap();
                  }}
                  className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                >
                  <Calculator className="w-3.5 h-3.5" />
                  {showNumpad ? t('cashier_keypad_hide') : t('cashier_keypad_show')}
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
                  className="text-2xl sm:text-3xl font-black tracking-tight text-center h-16 rounded-2xl bg-muted/40 border-border/70 pe-16 font-mono"
                  dir="ltr"
                  required
                />
                <span className="absolute end-4 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground font-mono">
                  {currency}
                </span>
              </div>
            </div>

            {/* Live Calculation Preview Banner */}
            <div className="bg-primary/10 border border-primary/20 rounded-2xl p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary shrink-0" />
                <span className="text-xs font-medium text-foreground">
                  {t('cashier_earning_multiplier', { points: pointsPerTnd })}
                </span>
              </div>
              <div className="text-end">
                <span className="text-xs text-muted-foreground me-1.5">{t('overview_kpi_points_issued')}:</span>
                <span className="font-mono font-black text-primary text-base" dir="ltr">
                  +{estimatedPoints} pts
                </span>
              </div>
            </div>

            {/* Quick Preset Chips */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-muted-foreground font-semibold">
                <span>{t('cashier_quick_add_title')}</span>
                {spendAmount && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="text-destructive hover:underline font-bold"
                  >
                    {t('cashier_clear_btn')}
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
                    className="h-10 rounded-xl font-bold text-xs hover:bg-primary/10 hover:text-primary hover:border-primary/30 font-mono"
                    dir="ltr"
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
                    className="h-9 rounded-xl font-medium text-xs bg-muted/40 font-mono"
                  >
                    {t('cashier_set_exact_btn', { amount: amt })}
                  </Button>
                ))}
              </div>
            </div>

            {/* Optional Touch Screen Numpad */}
            {showNumpad && (
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/40 animate-in fade-in duration-200" dir="ltr">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'DEL'].map((key) => (
                  <Button
                    key={key}
                    type="button"
                    variant="outline"
                    onClick={() => handleNumpadTap(key)}
                    className={`h-12 rounded-xl text-lg font-bold font-mono ${
                      key === 'DEL'
                        ? 'bg-destructive/10 text-destructive hover:bg-destructive/20 border-destructive/20'
                        : 'bg-muted/40 hover:bg-muted'
                    }`}
                  >
                    {key === 'DEL' ? <Delete className="w-5 h-5 rtl:rotate-180" /> : key}
                  </Button>
                ))}
              </div>
            )}

            {/* Submit / Action Button */}
            <Button
              type="submit"
              disabled={!spendAmount || parsedSpend <= 0}
              className="w-full h-14 text-base font-bold rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 gap-2"
            >
              {matchedCustomer ? (
                <>
                  <UserCheck className="w-5 h-5" />
                  {t('cashier_award_to_customer', {
                    points: estimatedPoints,
                    name: (matchedCustomer.fullName || 'Customer').split(' ')[0],
                    amount: parsedSpend,
                  })}
                </>
              ) : (
                <>
                  <QrCode className="w-5 h-5" />
                  {t('cashier_scan_pass_action', { amount: parsedSpend > 0 ? `${parsedSpend} ${currency}` : `0 ${currency}` })}
                </>
              )}
            </Button>
          </form>
        </TabsContent>

        {/* REDEEM REWARD TAB */}
        <TabsContent value="redeem" className="p-5 sm:p-6 space-y-5 m-0">
          <form onSubmit={handleRedeemSubmit} className="space-y-5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {t('cashier_select_perk_prompt')}
              </Label>
              <button
                type="button"
                onClick={() => {
                  setIsManualRewardMode(!isManualRewardMode);
                  posHaptics.tap();
                }}
                className="text-xs font-semibold text-primary hover:underline"
              >
                {isManualRewardMode ? t('cashier_choose_catalog') : t('cashier_enter_reward_id')}
              </button>
            </div>

            {!isManualRewardMode ? (
              <div className="space-y-3">
                {isLoadingRewards ? (
                  <div className="flex items-center justify-center p-8 bg-muted/30 rounded-2xl text-xs text-muted-foreground">
                    <RefreshCw className="w-4 h-4 animate-spin me-2" />
                    {t('cashier_loading_rewards')}
                  </div>
                ) : rewards.length === 0 ? (
                  <div className="p-6 bg-muted/30 rounded-2xl text-center space-y-2 border border-dashed border-border">
                    <AlertCircle className="w-6 h-6 text-muted-foreground mx-auto" />
                    <p className="text-xs font-medium text-muted-foreground">
                      {t('cashier_no_rewards_configured')}
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsManualRewardMode(true)}
                      className="text-xs mt-2"
                    >
                      {t('cashier_custom_reward_code_btn')}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[260px] overflow-y-auto pe-1">
                    {rewards.map((r) => {
                      const isSelected = selectedReward?.id === r.id;
                      const canAfford = !matchedCustomer || matchedCustomer.pointsBalance >= r.pointsCost;
                      return (
                        <div
                          key={r.id}
                          onClick={() => {
                            posAudio.playClick();
                            posHaptics.tap();
                            setSelectedReward(r);
                          }}
                          className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-primary/10 border-primary text-foreground shadow-sm'
                              : canAfford
                              ? 'bg-card border-border hover:bg-muted/50'
                              : 'bg-muted/20 border-border/50 opacity-60'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                                isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                              }`}
                            >
                              <Gift className="w-4 h-4" />
                            </div>
                            <div className="text-start">
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
                              variant={isSelected ? 'default' : canAfford ? 'secondary' : 'outline'}
                              className="font-mono text-xs font-bold"
                              dir="ltr"
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
                  {t('cashier_custom_reward_label') || 'Points to Deduct or Voucher Code'}
                </Label>
                <Input
                  id="reward-code"
                  type="text"
                  placeholder="e.g. 50 (to deduct 50 pts) or VOUCHER-XXXX"
                  value={customRewardId}
                  onChange={(e) => setCustomRewardId(e.target.value)}
                  className="h-12 rounded-xl font-mono text-center text-sm font-bold"
                  dir="ltr"
                  required
                />
                <p className="text-[11px] text-muted-foreground">
                  Enter a number of points to remove directly or paste a customer voucher code
                </p>
              </div>
            )}

            {/* Submit / Action Button */}
            <Button
              type="submit"
              disabled={
                Boolean(
                  (!isManualRewardMode && !selectedReward) ||
                  (isManualRewardMode && !customRewardId.trim())
                )
              }
              className="w-full h-14 text-base font-bold rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 gap-2"
            >
              <QrCode className="w-5 h-5" />
              {t('cashier_scan_to_redeem', {
                pts: selectedReward ? `(${selectedReward.pointsCost} pts)` : '',
              })}
            </Button>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
}

