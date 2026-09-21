/**
 * @file app/(admin)/admin/overview/page.tsx
 *
 * Platform Command Center for Super Admins.
 * High-aesthetic executive dashboard with live KPI counters, interactive
 * volume & points trend charting, real-time activity stream, and in-store
 * counter QR stand acquisition performance analytics.
 */

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  DollarSign,
  Store,
  Users,
  Coins,
  ArrowUpRight,
  RefreshCw,
  TrendingUp,
  Activity,
  ShoppingBag,
  Award,
  Ticket,
  QrCode,
  ArrowDownLeft,
  Copy,
  Receipt,
  Check,
  Calendar,
  ExternalLink,
} from 'lucide-react'
import { useAdminStore, AdminTransaction } from '@/store/admin-store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { useI18n } from '@/lib/i18n'
import { useToast } from '@/hooks/use-toast'

export default function AdminOverviewPage() {
  const { metrics, transactions, loading, fetchMetrics, fetchTransactions } = useAdminStore()
  const { t, dir } = useI18n()
  const { toast } = useToast()

  const [activeMetricTab, setActiveMetricTab] = useState<'volume' | 'points'>('volume')
  const [selectedTx, setSelectedTx] = useState<AdminTransaction | null>(null)
  const [copiedId, setCopiedId] = useState(false)

  useEffect(() => {
    fetchMetrics()
    fetchTransactions()
  }, [fetchMetrics, fetchTransactions])

  const copyTxId = (id: string) => {
    navigator.clipboard.writeText(id)
    setCopiedId(true)
    toast({
      title: 'Copied',
      description: 'Transaction ID copied to clipboard.',
    })
    setTimeout(() => setCopiedId(false), 2000)
  }

  const kpis = [
    {
      title: t('admin_kpi_total_volume'),
      value: metrics?.kpis?.totalVolumeTnd != null ? `${Number(metrics.kpis.totalVolumeTnd).toLocaleString()} TND` : '...',
      description: t('admin_kpi_total_volume_desc'),
      icon: DollarSign,
      gradient: 'from-emerald-500/15 to-teal-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      tag: 'GMV',
    },
    {
      title: t('admin_kpi_reg_stores'),
      value: metrics?.kpis?.totalStores != null ? metrics.kpis.totalStores.toString() : '...',
      description: t('admin_kpi_reg_stores_desc'),
      icon: Store,
      gradient: 'from-blue-500/15 to-indigo-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
      tag: 'Outlets',
    },
    {
      title: t('admin_kpi_platform_users'),
      value: metrics?.kpis?.totalUsers != null ? metrics.kpis.totalUsers.toLocaleString() : '...',
      description: t('admin_kpi_users_breakdown', {
        merchants: metrics?.kpis?.totalMerchants ?? 0,
        cashiers: metrics?.kpis?.totalCashiers ?? 0,
        customers: metrics?.kpis?.totalCustomers ?? 0,
      }),
      icon: Users,
      gradient: 'from-purple-500/15 to-pink-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
      tag: 'Accounts',
    },
    {
      title: t('admin_kpi_points_pool'),
      value: metrics?.kpis?.totalPointsIssued != null ? `${metrics.kpis.totalPointsIssued.toLocaleString()} pts` : '...',
      description: t('admin_kpi_points_pool_desc', { redeemed: metrics?.kpis?.totalPointsRedeemed ?? 0 }),
      icon: Coins,
      gradient: 'from-amber-500/15 to-orange-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      tag: 'Loyalty Pool',
    },
  ]

  const chartData = metrics?.dailyTrends || []
  const recentFeed = (transactions || []).slice(0, 7)

  // Acquisition calculations
  const totalCustomers = metrics?.kpis?.totalCustomers ?? 0
  const qrReferrals = metrics?.kpis?.totalQrReferrals ?? 0
  const organicCustomers = Math.max(0, totalCustomers - qrReferrals)
  const qrPercentage = totalCustomers > 0 ? Math.round((qrReferrals / totalCustomers) * 100) : 0

  return (
    <div className="space-y-6 sm:space-y-8 overflow-x-hidden max-w-7xl" dir={dir}>
      {/* Executive Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-2 border-b border-border/40">
        <div className="text-start space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              {t('admin_overview_cmd_center')}
            </h1>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[11px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </div>
          </div>
          <p className="text-muted-foreground text-xs sm:text-sm">
            {t('admin_overview_cmd_desc')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              fetchMetrics()
              fetchTransactions()
            }}
            disabled={loading}
            className="gap-2 rounded-xl h-9 text-xs font-semibold shadow-2xs hover:bg-muted/80"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{t('admin_refresh_data')}</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon
          return (
            <Card
              key={kpi.title}
              className="relative overflow-hidden border border-border/60 hover:shadow-md hover:border-primary/40 transition-all text-start rounded-2xl group"
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  {kpi.title}
                </span>
                <div className={`p-2 rounded-xl border ${kpi.gradient} transition-transform group-hover:scale-105`}>
                  <Icon className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent className="space-y-1">
                <div className="text-2xl sm:text-3xl font-black tracking-tight text-foreground font-mono" dir="ltr">
                  {kpi.value}
                </div>
                <p className="text-xs text-muted-foreground truncate font-medium">
                  {kpi.description}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Analytics Chart & Live Activity Stream */}
      <div className="grid gap-6 lg:grid-cols-7">
        {/* Interactive Platform Trend Chart */}
        <Card className="lg:col-span-4 border border-border/60 text-start rounded-2xl flex flex-col shadow-2xs">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2 text-foreground">
                <TrendingUp className="h-4 w-4 text-primary" />
                {activeMetricTab === 'volume' ? t('admin_chart_14day_title') : '14-Day Loyalty Points Activity'}
              </CardTitle>
              <CardDescription className="text-xs">
                {activeMetricTab === 'volume' ? t('admin_chart_14day_desc') : 'Daily aggregated points issuance across merchants'}
              </CardDescription>
            </div>

            {/* Metric Mode Switcher Tabs */}
            <div className="flex items-center p-1 rounded-xl bg-muted/60 border border-border/60 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setActiveMetricTab('volume')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  activeMetricTab === 'volume'
                    ? 'bg-background text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Volume (TND)
              </button>
              <button
                type="button"
                onClick={() => setActiveMetricTab('points')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  activeMetricTab === 'points'
                    ? 'bg-background text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Points (pts)
              </button>
            </div>
          </CardHeader>

          <CardContent className="flex-1 pt-4">
            <div className="h-[290px] w-full" dir="ltr">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={chartData}
                    margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="adminVolumeGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="adminPointsGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.12} vertical={false} />
                    <XAxis
                      dataKey="date"
                      stroke="#888888"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#888888"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`)}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        borderColor: 'hsl(var(--border))',
                        borderRadius: '12px',
                        fontSize: '12px',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                        padding: '8px 12px',
                      }}
                      formatter={(val: any) => [
                        activeMetricTab === 'volume'
                          ? `${Number(val).toLocaleString()} TND`
                          : `${Number(val).toLocaleString()} pts`,
                        activeMetricTab === 'volume' ? 'Transaction Volume' : 'Points Issued',
                      ]}
                    />
                    {activeMetricTab === 'volume' ? (
                      <Area
                        type="monotone"
                        dataKey="volumeTnd"
                        name="Volume"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#adminVolumeGrad)"
                      />
                    ) : (
                      <Area
                        type="monotone"
                        dataKey="issued"
                        name="Points"
                        stroke="#f59e0b"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#adminPointsGrad)"
                      />
                    )}
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground text-xs">
                  {loading ? t('loading') : t('analytics_no_activity_recorded')}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Live Activity Stream */}
        <Card className="lg:col-span-3 border border-border/60 flex flex-col text-start rounded-2xl shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2 text-foreground">
                <Activity className="h-4 w-4 text-emerald-500" />
                {t('admin_live_feed_title')}
              </CardTitle>
              <CardDescription className="text-xs">{t('admin_live_feed_desc')}</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild className="text-xs h-8 px-2 text-muted-foreground hover:text-foreground">
              <Link href="/transactions" className="flex items-center gap-1 font-semibold">
                <span>{t('admin_view_all_link')}</span>
                <ArrowUpRight className="h-3.5 w-3.5 rtl:rotate-180" />
              </Link>
            </Button>
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto max-h-[340px] space-y-2.5 pe-1">
            {recentFeed.length > 0 ? (
              recentFeed.map((act) => {
                const isEarn = act.type?.toLowerCase() === 'earn'
                return (
                  <div
                    key={act.id}
                    onClick={() => setSelectedTx(act)}
                    className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/40 hover:bg-muted/70 hover:border-primary/30 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`p-2 rounded-xl shrink-0 ${
                          isEarn
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {isEarn ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownLeft className="h-4 w-4" />}
                      </div>
                      <div className="min-w-0 text-start">
                        <p className="text-xs font-bold truncate text-foreground group-hover:text-primary transition-colors">
                          {act.customer?.fullName || act.customer?.email || t('crm_anonymous_customer')}
                        </p>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {act.storeName}
                        </p>
                      </div>
                    </div>

                    <div className="text-end shrink-0 ps-2">
                      <div
                        className={`text-xs font-bold font-mono ${
                          isEarn ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                        }`}
                        dir="ltr"
                      >
                        {act.amountTnd != null ? `${act.amountTnd} TND` : `${act.pointsAffected} pts`}
                      </div>
                      <Badge
                        variant="secondary"
                        className="text-[9px] px-1.5 py-0 h-4 font-bold uppercase tracking-wider"
                      >
                        {act.type}
                      </Badge>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="h-44 flex flex-col items-center justify-center text-muted-foreground text-xs gap-2">
                <ShoppingBag className="h-8 w-8 text-muted-foreground/40" />
                <span>{t('analytics_no_activity_recorded')}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Customer Acquisition & In-Store QR Stand Performance */}
      <Card className="border border-border/60 text-start rounded-2xl shadow-2xs">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2 text-foreground">
              <QrCode className="h-4 w-4 text-emerald-500" />
              {t('admin_qr_stands_title')}
            </CardTitle>
            <CardDescription className="text-xs">
              {t('admin_qr_stands_desc')}
            </CardDescription>
          </div>
          <Badge
            variant="outline"
            className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-xs font-bold px-3 py-1 self-start sm:self-auto"
          >
            {t('admin_qr_signups_badge', { count: qrReferrals })}
          </Badge>
        </CardHeader>

        <CardContent>
          <div className="grid gap-6 md:grid-cols-12 items-start">
            {/* Summary Box */}
            <div className="md:col-span-5 space-y-4 p-5 rounded-2xl bg-muted/40 border border-border/60 text-start">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {t('admin_acquisition_summary')}
                </span>
                <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                  {qrPercentage}% via QR
                </span>
              </div>

              {/* Progress bar visual */}
              <div className="space-y-1.5">
                <Progress value={qrPercentage} className="h-2.5 bg-muted" />
                <div className="flex justify-between text-[11px] text-muted-foreground">
                  <span>Physical QR Stands</span>
                  <span>Direct & Organic</span>
                </div>
              </div>

              <div className="space-y-2.5 pt-2 border-t border-border/40">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">{t('admin_total_cust_base')}</span>
                  <span className="font-bold text-foreground font-mono">{totalCustomers.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    {t('admin_via_store_qr')}
                  </span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                    {qrReferrals.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-primary/60" />
                    {t('admin_direct_organic')}
                  </span>
                  <span className="font-bold text-foreground font-mono">
                    {organicCustomers.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Top QR Outlets */}
            <div className="md:col-span-7 space-y-3 text-start">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                {t('admin_top_qr_outlets')}
              </span>
              {metrics?.storeAcquisitions && metrics.storeAcquisitions.length > 0 ? (
                <div className="grid gap-2.5 sm:grid-cols-2">
                  {metrics.storeAcquisitions.map((st) => (
                    <div
                      key={st.id}
                      className="flex items-center justify-between p-3.5 rounded-xl bg-card border border-border/60 hover:border-primary/40 hover:shadow-xs transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold shadow-xs shrink-0"
                          style={{ backgroundColor: st.primaryColor || '#10b981' }}
                        >
                          {st.name.slice(0, 1).toUpperCase()}
                        </div>
                        <div className="min-w-0 text-start">
                          <p className="text-xs font-bold truncate text-foreground">{st.name}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {t('admin_members_count_label', { count: st.totalMembersCount })}
                          </p>
                        </div>
                      </div>
                      <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-mono font-bold shrink-0">
                        +{st.referredUsersCount}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-muted-foreground bg-muted/20 rounded-2xl border border-dashed border-border/60">
                  {t('analytics_no_activity_recorded')}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Navigation Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Link
          href="/stores"
          className="group p-5 rounded-2xl border border-border/60 bg-card hover:border-primary/50 hover:shadow-md transition-all flex items-center justify-between text-start"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2 font-bold text-sm text-foreground">
              <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                <Store className="h-4 w-4" />
              </div>
              {t('admin_store_directory_card')}
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t('admin_store_directory_desc')}
            </p>
          </div>
          <ArrowUpRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors rtl:rotate-180 shrink-0 ms-3" />
        </Link>

        <Link
          href="/users"
          className="group p-5 rounded-2xl border border-border/60 bg-card hover:border-purple-500/50 hover:shadow-md transition-all flex items-center justify-between text-start"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2 font-bold text-sm text-foreground">
              <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
                <Users className="h-4 w-4" />
              </div>
              {t('admin_user_directory_card')}
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t('admin_user_directory_desc')}
            </p>
          </div>
          <ArrowUpRight className="h-5 w-5 text-muted-foreground group-hover:text-purple-500 transition-colors rtl:rotate-180 shrink-0 ms-3" />
        </Link>

        <Link
          href="/transactions"
          className="group p-5 rounded-2xl border border-border/60 bg-card hover:border-emerald-500/50 hover:shadow-md transition-all flex items-center justify-between text-start"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2 font-bold text-sm text-foreground">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Activity className="h-4 w-4" />
              </div>
              {t('admin_audit_ledger_card')}
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t('admin_audit_ledger_desc')}
            </p>
          </div>
          <ArrowUpRight className="h-5 w-5 text-muted-foreground group-hover:text-emerald-500 transition-colors rtl:rotate-180 shrink-0 ms-3" />
        </Link>
      </div>

      {/* Transaction Details Modal */}
      {selectedTx && (
        <Dialog open={Boolean(selectedTx)} onOpenChange={(open) => !open && setSelectedTx(null)}>
          <DialogContent className="sm:max-w-md rounded-2xl" dir={dir}>
            <DialogHeader className="text-start">
              <DialogTitle className="flex items-center gap-2 text-base font-bold">
                <Receipt className="h-4 w-4 text-primary" />
                Transaction Receipt
              </DialogTitle>
              <DialogDescription className="text-xs">
                Audited ledger event recorded on Fidely platform.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-3 text-start">
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border/60">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Transaction ID
                  </span>
                  <p className="text-xs font-mono font-medium truncate max-w-[200px]" dir="ltr">
                    {selectedTx.id}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyTxId(selectedTx.id)}
                  className="h-8 gap-1.5 text-xs rounded-lg"
                >
                  {copiedId ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedId ? 'Copied' : 'Copy'}</span>
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl border border-border/60 bg-card space-y-1">
                  <span className="text-muted-foreground text-[11px] block">Outlet</span>
                  <span className="font-bold text-foreground truncate block">{selectedTx.storeName}</span>
                </div>
                <div className="p-3 rounded-xl border border-border/60 bg-card space-y-1">
                  <span className="text-muted-foreground text-[11px] block">Event Type</span>
                  <Badge
                    variant={selectedTx.type.toLowerCase() === 'earn' ? 'default' : 'secondary'}
                    className="text-[10px] font-bold uppercase"
                  >
                    {selectedTx.type}
                  </Badge>
                </div>
                <div className="p-3 rounded-xl border border-border/60 bg-card space-y-1">
                  <span className="text-muted-foreground text-[11px] block">Customer</span>
                  <span className="font-semibold text-foreground truncate block">
                    {selectedTx.customer?.fullName || selectedTx.customer?.email || 'Anonymous'}
                  </span>
                </div>
                <div className="p-3 rounded-xl border border-border/60 bg-card space-y-1">
                  <span className="text-muted-foreground text-[11px] block">Points Affected</span>
                  <span
                    className={`font-mono font-bold block ${
                      selectedTx.pointsAffected >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'
                    }`}
                    dir="ltr"
                  >
                    {selectedTx.pointsAffected > 0 ? `+${selectedTx.pointsAffected}` : selectedTx.pointsAffected} pts
                  </span>
                </div>
              </div>

              {selectedTx.amountTnd != null && (
                <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 flex justify-between items-center text-xs">
                  <span className="font-medium text-foreground">Amount Spent</span>
                  <span className="font-mono font-bold text-primary text-sm" dir="ltr">
                    {selectedTx.amountTnd} TND
                  </span>
                </div>
              )}

              <div className="text-[11px] text-muted-foreground flex items-center justify-between pt-2 border-t border-border/40">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(selectedTx.createdAt).toLocaleString()}
                </span>
                <Link
                  href="/transactions"
                  className="text-primary hover:underline font-semibold flex items-center gap-1"
                >
                  Full Ledger <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
