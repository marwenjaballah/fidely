'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { useMerchantStore } from '@/store/merchant-store'
import { useI18n } from '@/lib/i18n'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import {
  Users, Zap, TrendingUp, Award, Plus, Store, Check, Loader2,
  ArrowRight, Sparkles, Activity, BarChart3,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'
import { MerchantMobileOverview } from '@/features/merchant/components/mobile/merchant-mobile-overview'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

// ─── Resolve any CSS color (incl. oklch) to a hex string for recharts SVG ────
// recharts renders to SVG which doesn't handle oklch() in some browsers.
// We use a tiny off-screen canvas to let the browser resolve the color.
function resolveCSSColor(cssVar: string, fallback: string): string {
  try {
    const raw = getComputedStyle(document.documentElement)
      .getPropertyValue(cssVar)
      .trim()
    if (!raw) return fallback
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = 1
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = raw
    ctx.fillRect(0, 0, 1, 1)
    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data
    return `rgb(${r},${g},${b})`
  } catch {
    return fallback
  }
}

function useCSSColor(cssVar: string, fallback: string): string {
  const [color, setColor] = useState(fallback)
  useEffect(() => {
    setColor(resolveCSSColor(cssVar, fallback))
  }, [cssVar, fallback])
  return color
}

// ─── Custom Tooltip for charts ────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-border bg-background px-3 py-2 shadow-xl text-xs">
      {label && <p className="font-semibold text-foreground mb-1">{label}</p>}
      {payload.map((entry: any, i: number) => (
        <p key={i} style={{ color: entry.color }} className="font-medium">
          {entry.name}: <span className="font-bold">{entry.value?.toLocaleString()}</span>
        </p>
      ))}
    </div>
  )
}

// ─── Radial "Redemption Rate" mini-gauge ──────────────────────────────────────
function RedemptionGauge({ rate }: { rate: number }) {
  const clamped = Math.min(100, Math.max(0, rate))
  const color = clamped < 15 ? '#f97316' : clamped < 40 ? '#eab308' : '#22c55e'
  const data = [{ value: clamped }, { value: 100 - clamped }]
  return (
    <div className="relative flex items-center justify-center">
      <PieChart width={88} height={88}>
        <Pie
          data={data}
          cx={44}
          cy={44}
          innerRadius={30}
          outerRadius={40}
          startAngle={90}
          endAngle={-270}
          dataKey="value"
          strokeWidth={0}
        >
          <Cell fill={color} />
          <Cell fill="#e5e7eb" className="dark:fill-zinc-700" />
        </Pie>
      </PieChart>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-sm font-black" style={{ color }}>{clamped.toFixed(0)}%</span>
      </div>
    </div>
  )
}

export default function OverviewPage() {
  const { profile } = useAuth()
  const { fetchStores, activeStore, stores, createStore, setActiveStore, fetchAnalytics, analytics, loading, error } = useMerchantStore()
  const { toast } = useToast()
  const { t } = useI18n()

  // Resolve CSS variables to real colors for recharts
  const primaryColor = useCSSColor('--primary', '#6366f1')
  const destructiveColor = useCSSColor('--destructive', '#ef4444')

  const [isCreating, setIsCreating] = useState(false)
  const [storeName, setStoreName] = useState('')
  const [storeSlug, setStoreSlug] = useState('')

  useEffect(() => {
    fetchStores()
  }, [fetchStores])

  useEffect(() => {
    if (activeStore) {
      fetchAnalytics(activeStore.id)
    }
  }, [activeStore, fetchAnalytics])

  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!storeName.trim()) return
    try {
      const created = await createStore(storeName.trim(), storeSlug.trim() || undefined)
      toast({
        title: t('create_store_success'),
        description: `'${created.name}' (${created.slug}).`,
      })
      setIsCreating(false)
      setStoreName('')
      setStoreSlug('')
    } catch (err: any) {
      toast({
        title: t('auth_generic_error'),
        description: err.message || 'Could not create store.',
        variant: 'destructive',
      })
    }
  }

  const handleSwitchStore = (storeId: string) => {
    setActiveStore(storeId)
    const target = stores.find((s) => s.id === storeId)
    if (target) {
      toast({
        title: t('overview_managing'),
        description: target.name,
      })
    }
  }

  // ── Derived analytics values ──────────────────────────────────────────────
  const totalIssued = analytics?.totalPointsIssued ?? 0
  const totalRedeemed = analytics?.totalPointsRedeemed ?? 0
  const netOutstanding = totalIssued - totalRedeemed
  const redemptionRate = totalIssued > 0 ? (totalRedeemed / totalIssued) * 100 : 0
  const welcomePts = Number((activeStore as any)?.welcomePoints) || 0
  const hasWelcome = welcomePts > 0

  // Pie chart data: earn vs redeem split
  const earningPieData = [
    { name: t('analytics_issued_legend') || 'Issued', value: totalIssued },
    { name: t('analytics_redeemed_legend') || 'Redeemed', value: totalRedeemed },
  ]
  const PIE_COLORS = [primaryColor, destructiveColor]

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:gap-8 md:p-8 overflow-x-hidden">
      {/* ── MOBILE POCKET PULSE VIEW (<md) ── */}
      <div className="block md:hidden">
        <MerchantMobileOverview
          activeStore={activeStore}
          analytics={analytics}
          onCreateStoreClick={() => setIsCreating(true)}
        />
      </div>

      {/* ── DESKTOP DASHBOARD (md+) ── */}
      <div className="hidden md:flex flex-1 flex-col gap-6 md:gap-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t('nav_dashboard')}</h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 flex flex-wrap items-center gap-1.5">
              {activeStore ? (
                <>
                  <span>{t('overview_managing')}</span>
                  <span className="font-semibold text-foreground flex items-center gap-1.5 bg-primary/10 text-primary px-2.5 py-0.5 rounded-md text-xs">
                    <Store className="h-3.5 w-3.5" />
                    {activeStore.name}
                  </span>
                  <span className="text-xs text-muted-foreground font-mono">({activeStore.slug})</span>
                </>
              ) : (
                t('overview_welcome_subtitle')
              )}
            </p>
          </div>
          {stores.length > 0 && !isCreating && (
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <Button onClick={() => setIsCreating(true)} variant="default" size="sm" className="gap-2 text-xs sm:text-sm">
                <Plus className="h-4 w-4" /> {t('overview_add_store')}
              </Button>
            </div>
          )}
        </div>

        {/* Multi-Store Switcher */}
        {stores.length > 1 && !isCreating && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 p-3 rounded-2xl border border-border/70 bg-card/60 backdrop-blur-xs shadow-2xs">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 shrink-0">
              <Store className="h-3.5 w-3.5 text-primary" />
              {t('overview_active_store')}
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {stores.map((store) => {
                const isSelected = activeStore?.id === store.id
                return (
                  <button
                    key={store.id}
                    onClick={() => handleSwitchStore(store.id)}
                    type="button"
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all shrink-0 ${
                      isSelected
                        ? 'bg-primary text-primary-foreground shadow-xs font-bold'
                        : 'bg-muted/80 text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    {isSelected && <Check className="h-3.5 w-3.5 shrink-0" />}
                    <span>{store.name}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Empty / Create Store */}
        {!loading && stores.length === 0 && !isCreating && (
          <Card className="border border-border/60 max-w-md mx-auto sm:mx-0 mt-2">
            <CardHeader>
              <CardTitle className="text-lg">{t('overview_welcome_title')}</CardTitle>
              <CardDescription className="text-xs">{t('overview_welcome_desc')}</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button onClick={() => setIsCreating(true)} className="w-full sm:w-auto text-xs font-semibold">
                {t('overview_create_first_store')}
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* Store Creation Form */}
        {isCreating && (
          <Card className="border border-border/60 max-w-md mx-auto sm:mx-0 mt-2">
            <CardHeader>
              <CardTitle className="text-lg">
                {stores.length === 0 ? t('overview_create_first_store_title') : t('overview_create_new_store_title')}
              </CardTitle>
              <CardDescription className="text-xs">{t('overview_create_store_desc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateStore} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="storeName" className="text-xs font-semibold">{t('overview_store_name')}</Label>
                  <Input
                    id="storeName"
                    value={storeName}
                    onChange={(e) => {
                      setStoreName(e.target.value)
                      const normalized = e.target.value
                        .toLowerCase()
                        .normalize('NFKD')
                        .replace(/[\u0300-\u036f]/g, '')
                        .replace(/[^a-z0-9]+/g, '-')
                        .replace(/^-+|-+$/g, '')
                      if (!storeSlug || storeSlug === normalized.slice(0, storeSlug.length)) {
                        setStoreSlug(normalized)
                      }
                    }}
                    placeholder={t('overview_store_name_placeholder')}
                    className="text-xs"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="storeSlug" className="text-xs font-semibold">{t('overview_slug')}</Label>
                  <div className="flex items-center rounded-md border bg-muted/40 px-3 py-1 text-xs text-muted-foreground">
                    <span className="font-mono text-muted-foreground/80 select-none">fidely.app/store/</span>
                    <input
                      id="storeSlug"
                      type="text"
                      className="w-full bg-transparent p-1 text-foreground font-mono font-medium outline-none text-xs"
                      value={storeSlug}
                      onChange={(e) => setStoreSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                      placeholder="my-awesome-cafe"
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground">{t('overview_slug_desc')}</p>
                </div>
                {error && <p className="text-xs text-destructive">{error}</p>}
                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  <Button
                    type="submit"
                    disabled={loading || !storeName.trim() || !storeSlug.trim()}
                    className={`w-full sm:w-auto text-xs font-semibold ${!storeName.trim() || !storeSlug.trim() ? 'opacity-50 cursor-not-allowed bg-muted text-muted-foreground hover:bg-muted' : ''}`}
                  >
                    {loading ? t('saving') : t('overview_create_store_btn')}
                  </Button>
                  {stores.length > 0 && (
                    <Button type="button" variant="outline" onClick={() => setIsCreating(false)} className="w-full sm:w-auto text-xs">
                      {t('cancel')}
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {loading && !analytics && stores.length > 0 && !isCreating && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground py-4">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            {t('overview_loading_analytics')}
          </div>
        )}

        {analytics && (
          <>
            {/* ── KPI CARDS ─────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <Card className="border border-border/60 bg-gradient-to-br from-card to-primary/5">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('overview_kpi_total_members')}</CardTitle>
                  <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.totalMembers.toLocaleString()}</div>
                  <CardDescription className="text-[11px]">{t('overview_kpi_members_desc')}</CardDescription>
                </CardContent>
              </Card>

              <Card className="border border-border/60 bg-gradient-to-br from-card to-emerald-500/5">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('overview_kpi_points_issued')}</CardTitle>
                  <div className="h-8 w-8 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.totalPointsIssued.toLocaleString()}</div>
                  <CardDescription className="text-[11px]">{t('overview_kpi_issued_desc')}</CardDescription>
                </CardContent>
              </Card>

              <Card className="border border-border/60 bg-gradient-to-br from-card to-rose-500/5">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('overview_kpi_points_redeemed')}</CardTitle>
                  <div className="h-8 w-8 rounded-xl bg-rose-500/10 flex items-center justify-center">
                    <Award className="h-4 w-4 text-rose-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.totalPointsRedeemed.toLocaleString()}</div>
                  <CardDescription className="text-[11px]">{t('overview_kpi_redeemed_desc')}</CardDescription>
                </CardContent>
              </Card>

              <Card className="border border-border/60 bg-gradient-to-br from-card to-amber-500/5">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('overview_kpi_net_outstanding')}</CardTitle>
                  <div className="h-8 w-8 rounded-xl bg-amber-500/10 flex items-center justify-center">
                    <Zap className="h-4 w-4 text-amber-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{netOutstanding.toLocaleString()}</div>
                  <CardDescription className="text-[11px]">{t('overview_kpi_outstanding_desc')}</CardDescription>
                </CardContent>
              </Card>
            </div>

            {/* ── CHARTS ROW ────────────────────────────────────────────── */}
            {analytics.recentTransactions.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Area Chart — trend over time */}
                <Card className="lg:col-span-2 border border-border/60">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <Activity className="h-4 w-4 text-primary" />
                      {t('analytics_trend_title')}
                    </CardTitle>
                    <CardDescription className="text-xs">{t('analytics_trend_desc')}</CardDescription>
                  </CardHeader>
                  <CardContent className="px-2 sm:px-4">
                    <div className="h-[240px] w-full" dir="ltr">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={analytics.recentTransactions}
                          margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
                        >
                          <defs>
                            <linearGradient id="gradIssued" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={primaryColor} stopOpacity={0.25} />
                              <stop offset="95%" stopColor={primaryColor} stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="gradRedeemed" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={destructiveColor} stopOpacity={0.2} />
                              <stop offset="95%" stopColor={destructiveColor} stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
                          <XAxis dataKey="date" stroke="#888" fontSize={10} tickLine={false} axisLine={false} />
                          <YAxis stroke="#888" fontSize={10} tickLine={false} axisLine={false} />
                          <Tooltip content={<ChartTooltip />} />
                          <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                          <Area
                            type="monotone"
                            dataKey="issued"
                            name={t('analytics_issued_legend') || 'Issued'}
                            stroke={primaryColor}
                            strokeWidth={2}
                            fill="url(#gradIssued)"
                            dot={false}
                            activeDot={{ r: 4, strokeWidth: 0 }}
                          />
                          <Area
                            type="monotone"
                            dataKey="redeemed"
                            name={t('analytics_redeemed_legend') || 'Redeemed'}
                            stroke={destructiveColor}
                            strokeWidth={2}
                            fill="url(#gradRedeemed)"
                            dot={false}
                            activeDot={{ r: 4, strokeWidth: 0 }}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Donut — earn vs redeem split + redemption rate gauge */}
                <Card className="border border-border/60 flex flex-col">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-primary" />
                      {t('analytics_total_issued') || 'Points Split'}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {t('analytics_net_outstanding_desc') || 'Issued vs. Redeemed'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center justify-center gap-4 flex-1 py-4">
                    {/* Donut */}
                    <div dir="ltr" className="flex items-center justify-center">
                      <PieChart width={160} height={160}>
                        <Pie
                          data={earningPieData}
                          cx={80}
                          cy={80}
                          innerRadius={48}
                          outerRadius={72}
                          dataKey="value"
                          strokeWidth={0}
                          paddingAngle={3}
                        >
                          {earningPieData.map((_, index) => (
                            <Cell key={index} fill={PIE_COLORS[index]} />
                          ))}
                        </Pie>
                        <Tooltip content={<ChartTooltip />} />
                      </PieChart>
                    </div>
                    {/* Legend */}
                    <div className="flex flex-col gap-1 w-full px-2 text-xs">
                      {earningPieData.map((item, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-muted-foreground">
                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[i] }} />
                            {item.name}
                          </span>
                          <span className="font-bold font-mono text-foreground">{item.value.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                    {/* Redemption rate mini-gauge */}
                    <div className="w-full rounded-xl border border-border/60 bg-muted/30 p-3 flex items-center gap-3">
                      <RedemptionGauge rate={redemptionRate} />
                      <div>
                        <p className="text-xs font-bold text-foreground">{t('overview_insight_velocity_title') || 'Redemption Rate'}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {redemptionRate < 15 && totalIssued > 100
                            ? t('overview_insight_velocity_low')
                            : t('overview_insight_velocity_good')}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Bar Chart — daily breakdown */}
                <Card className="lg:col-span-3 border border-border/60">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-primary" />
                      {t('analytics_recent_activity_title') || 'Daily Breakdown'}
                    </CardTitle>
                    <CardDescription className="text-xs">{t('analytics_recent_activity_desc') || 'Earn vs. redeem per day'}</CardDescription>
                  </CardHeader>
                  <CardContent className="px-2 sm:px-4">
                    <div className="h-[200px] w-full" dir="ltr">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={analytics.recentTransactions}
                          margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
                          barGap={4}
                          barCategoryGap="30%"
                        >
                          <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
                          <XAxis dataKey="date" stroke="#888" fontSize={10} tickLine={false} axisLine={false} />
                          <YAxis stroke="#888" fontSize={10} tickLine={false} axisLine={false} />
                          <Tooltip content={<ChartTooltip />} />
                          <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                          <Bar dataKey="issued" name={t('analytics_issued_legend') || 'Issued'} fill={primaryColor} radius={[4, 4, 0, 0]} />
                          <Bar dataKey="redeemed" name={t('analytics_redeemed_legend') || 'Redeemed'} fill={destructiveColor} radius={[4, 4, 0, 0]} opacity={0.8} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              /* No-data empty state */
              <Card className="border border-border/60">
                <CardHeader>
                  <CardTitle className="text-sm">{t('analytics_recent_activity_title')}</CardTitle>
                  <CardDescription className="text-xs">{t('analytics_recent_activity_desc')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex h-40 items-center justify-center text-xs sm:text-sm text-muted-foreground">
                    {t('analytics_no_activity_recorded')}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* ── SMART INSIGHTS ────────────────────────────────────────── */}
            <div className="rounded-3xl border border-border/80 bg-gradient-to-r from-card via-card to-muted/40 p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">{t('overview_insights_title')}</h3>
                    <p className="text-[11px] text-muted-foreground">{t('overview_insights_desc')}</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-[10px] font-bold bg-primary/5 text-primary border-primary/20">
                  {t('overview_live_diagnostics')}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                <div className="p-3.5 rounded-2xl bg-background border border-border/60 flex flex-col justify-between space-y-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                      <Award className="w-3.5 h-3.5 text-primary" />
                      <span>{t('overview_insight_velocity_title')} ({redemptionRate.toFixed(0)}%)</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      {redemptionRate < 15 && totalIssued > 100
                        ? t('overview_insight_velocity_low')
                        : t('overview_insight_velocity_good')}
                    </p>
                  </div>
                  <Link href="/merchant/customizer" className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-1 pt-1">
                    {t('overview_insight_manage_perks')} <ArrowRight className="w-3 h-3 rtl:rotate-180" />
                  </Link>
                </div>

                <div className="p-3.5 rounded-2xl bg-background border border-border/60 flex flex-col justify-between space-y-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                      <Store className="w-3.5 h-3.5 text-primary" />
                      <span>{t('overview_insight_stand_title')}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">{t('overview_insight_stand_desc')}</p>
                  </div>
                  <Link href="/merchant/customizer" className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-1 pt-1">
                    {t('overview_insight_print_stand')} <ArrowRight className="w-3 h-3 rtl:rotate-180" />
                  </Link>
                </div>

                <div className="p-3.5 rounded-2xl bg-background border border-border/60 flex flex-col justify-between space-y-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>{t('overview_insight_welcome_title')}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      {hasWelcome
                        ? t('overview_insight_welcome_active', { pts: welcomePts })
                        : t('overview_insight_welcome_suggest')}
                    </p>
                  </div>
                  <Link href="/merchant/customizer" className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 pt-1">
                    {hasWelcome ? t('overview_insight_edit_welcome') : t('overview_insight_enable_welcome')} <ArrowRight className="w-3 h-3 rtl:rotate-180" />
                  </Link>
                </div>
              </div>
            </div>

            {/* ── QUICK ACTIONS ─────────────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <Link href="/merchant/customizer" className="p-4 rounded-2xl border border-border/60 bg-card hover:bg-muted/30 transition-all flex items-center justify-between group">
                <div>
                  <p className="font-semibold text-sm text-foreground">{t('overview_quick_customizer_title')}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{t('overview_quick_customizer_desc')}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors rtl:rotate-180" />
              </Link>

              <Link href="/merchant/crm" className="p-4 rounded-2xl border border-border/60 bg-card hover:bg-muted/30 transition-all flex items-center justify-between group">
                <div>
                  <p className="font-semibold text-sm text-foreground">{t('overview_quick_crm_title')}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{t('overview_quick_crm_desc')}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors rtl:rotate-180" />
              </Link>

              <Link href="/merchant/staff" className="p-4 rounded-2xl border border-border/60 bg-card hover:bg-muted/30 transition-all flex items-center justify-between group">
                <div>
                  <p className="font-semibold text-sm text-foreground">{t('overview_quick_staff_title')}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{t('overview_quick_staff_desc')}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors rtl:rotate-180" />
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
