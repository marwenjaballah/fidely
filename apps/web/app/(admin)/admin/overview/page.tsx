'use client'

import { useEffect } from 'react'
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
} from 'lucide-react'
import { useAdminStore } from '@/store/admin-store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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

export default function AdminOverviewPage() {
  const { metrics, transactions, loading, fetchMetrics, fetchTransactions } = useAdminStore()
  const { t, dir } = useI18n()

  useEffect(() => {
    fetchMetrics()
    fetchTransactions()
  }, [fetchMetrics, fetchTransactions])

  const kpis = [
    {
      title: t('admin_kpi_total_volume'),
      value: metrics?.kpis?.totalVolumeTnd != null ? `${Number(metrics.kpis.totalVolumeTnd).toLocaleString()} TND` : '...',
      description: t('admin_kpi_total_volume_desc'),
      icon: DollarSign,
      gradient: 'from-emerald-500/10 to-teal-500/10 text-emerald-600 dark:text-emerald-400',
    },
    {
      title: t('admin_kpi_reg_stores'),
      value: metrics?.kpis?.totalStores != null ? metrics.kpis.totalStores.toString() : '...',
      description: t('admin_kpi_reg_stores_desc'),
      icon: Store,
      gradient: 'from-blue-500/10 to-indigo-500/10 text-blue-600 dark:text-blue-400',
    },
    {
      title: t('admin_kpi_platform_users'),
      value: metrics?.kpis?.totalUsers != null ? metrics.kpis.totalUsers.toString() : '...',
      description: t('admin_kpi_users_breakdown', {
        merchants: metrics?.kpis?.totalMerchants ?? 0,
        cashiers: metrics?.kpis?.totalCashiers ?? 0,
        customers: metrics?.kpis?.totalCustomers ?? 0,
      }),
      icon: Users,
      gradient: 'from-purple-500/10 to-pink-500/10 text-purple-600 dark:text-purple-400',
    },
    {
      title: t('admin_kpi_points_pool'),
      value: metrics?.kpis?.totalPointsIssued != null ? `${metrics.kpis.totalPointsIssued.toLocaleString()} pts` : '...',
      description: t('admin_kpi_points_pool_desc', { redeemed: metrics?.kpis?.totalPointsRedeemed ?? 0 }),
      icon: Coins,
      gradient: 'from-amber-500/10 to-orange-500/10 text-amber-600 dark:text-amber-400',
    },
  ]

  const chartData = metrics?.dailyTrends || []
  const recentFeed = (transactions || []).slice(0, 6)

  return (
    <div className="space-y-6 sm:space-y-8 overflow-x-hidden" dir={dir}>
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-start">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t('admin_overview_cmd_center')}</h1>
          <p className="text-muted-foreground text-xs sm:text-sm mt-1">
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
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            {t('admin_refresh_data')}
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon
          return (
            <Card key={kpi.title} className="relative overflow-hidden border border-border/60 hover:shadow-md transition-shadow text-start">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {kpi.title}
                </CardTitle>
                <div className={`p-2 rounded-xl ${kpi.gradient}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" dir="ltr">{kpi.value}</div>
                <p className="text-xs text-muted-foreground mt-1 truncate">{kpi.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Analytics Chart & Quick Stats */}
      <div className="grid gap-6 lg:grid-cols-7">
        {/* 14-Day Volume Chart */}
        <Card className="lg:col-span-4 border border-border/60 text-start">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                {t('admin_chart_14day_title')}
              </CardTitle>
              <CardDescription>{t('admin_chart_14day_desc')}</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] w-full mt-2" dir="ltr">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={chartData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="adminVolumeGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
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
                      tickFormatter={(v) => `${v}`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        borderColor: 'hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '12px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      }}
                      formatter={(val: any) => [`${Number(val).toLocaleString()} TND`, 'Volume']}
                    />
                    <Area
                      type="monotone"
                      dataKey="volumeTnd"
                      name="Volume"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#adminVolumeGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                  {loading ? t('loading') : t('crm_no_members_desc')}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Live Activity Stream */}
        <Card className="lg:col-span-3 border border-border/60 flex flex-col text-start">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Activity className="h-4 w-4 text-emerald-500" />
                {t('admin_live_feed_title')}
              </CardTitle>
              <CardDescription>{t('admin_live_feed_desc')}</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild className="text-xs">
              <Link href="/admin/transactions" className="flex items-center gap-1">
                <span>{t('admin_view_all_link')}</span>
                <ArrowUpRight className="h-3.5 w-3.5 rtl:rotate-180" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto max-h-[300px] space-y-3 pe-1">
            {recentFeed.length > 0 ? (
              recentFeed.map((act) => (
                <div
                  key={act.id}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-muted/40 border border-border/40 hover:bg-muted/70 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                      <ShoppingBag className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 text-start">
                      <p className="text-xs font-semibold truncate text-foreground">
                        {act.customer?.fullName || act.customer?.email || t('crm_anonymous_customer')}
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {t('overview_active_store')} <span className="font-medium text-foreground">{act.storeName}</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-end shrink-0">
                    <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono" dir="ltr">
                      {act.amountTnd != null ? `+${act.amountTnd} TND` : `${act.pointsAffected} pts`}
                    </div>
                    <Badge variant="secondary" className="text-[9px] px-1 py-0 h-4 uppercase">
                      {act.type}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-40 flex items-center justify-center text-muted-foreground text-sm">
                {t('analytics_no_activity_recorded')}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Customer Acquisition & In-Store QR Stand Performance */}
      <Card className="border border-border/60 text-start">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Users className="h-4 w-4 text-emerald-500" />
              {t('admin_qr_stands_title')}
            </CardTitle>
            <CardDescription>
              {t('admin_qr_stands_desc')}
            </CardDescription>
          </div>
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-xs font-bold">
            {t('admin_qr_signups_badge', { count: metrics?.kpis?.totalQrReferrals ?? 0 })}
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-12 items-start">
            <div className="md:col-span-4 space-y-3 p-4 rounded-2xl bg-muted/30 border border-border/50 text-start">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {t('admin_acquisition_summary')}
              </span>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">{t('admin_total_cust_base')}</span>
                  <span className="font-bold text-foreground font-mono">{metrics?.kpis?.totalCustomers ?? 0}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">{t('admin_via_store_qr')}</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                    {metrics?.kpis?.totalQrReferrals ?? 0}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">{t('admin_direct_organic')}</span>
                  <span className="font-bold text-foreground font-mono">
                    {Math.max(0, (metrics?.kpis?.totalCustomers ?? 0) - (metrics?.kpis?.totalQrReferrals ?? 0))}
                  </span>
                </div>
              </div>
            </div>

            <div className="md:col-span-8 space-y-2 text-start">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                {t('admin_top_qr_outlets')}
              </span>
              {metrics?.storeAcquisitions && metrics.storeAcquisitions.length > 0 ? (
                <div className="grid gap-2 sm:grid-cols-2">
                  {metrics.storeAcquisitions.map((st) => (
                    <div
                      key={st.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-card border border-border/60 hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
                          style={{ backgroundColor: st.primaryColor || '#10b981' }}
                        >
                          <Store className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0 text-start">
                          <p className="text-xs font-semibold truncate text-foreground">{st.name}</p>
                          <p className="text-[10px] text-muted-foreground">{t('admin_members_count_label', { count: st.totalMembersCount })}</p>
                        </div>
                      </div>
                      <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[11px] font-mono font-bold shrink-0">
                        {t('admin_qr_signups_count', { count: st.referredUsersCount })}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-muted-foreground bg-muted/20 rounded-xl">
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
          href="/admin/stores"
          className="group p-5 rounded-xl border border-border/60 bg-card hover:border-primary/50 hover:shadow-md transition-all flex items-center justify-between text-start"
        >
          <div>
            <div className="flex items-center gap-2 font-semibold text-sm">
              <Store className="h-4 w-4 text-primary" />
              {t('admin_store_directory_card')}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t('admin_store_directory_desc')}
            </p>
          </div>
          <ArrowUpRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors rtl:rotate-180 shrink-0 ms-2" />
        </Link>

        <Link
          href="/admin/users"
          className="group p-5 rounded-xl border border-border/60 bg-card hover:border-primary/50 hover:shadow-md transition-all flex items-center justify-between text-start"
        >
          <div>
            <div className="flex items-center gap-2 font-semibold text-sm">
              <Users className="h-4 w-4 text-purple-500" />
              {t('admin_user_directory_card')}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t('admin_user_directory_desc')}
            </p>
          </div>
          <ArrowUpRight className="h-5 w-5 text-muted-foreground group-hover:text-purple-500 transition-colors rtl:rotate-180 shrink-0 ms-2" />
        </Link>

        <Link
          href="/admin/transactions"
          className="group p-5 rounded-xl border border-border/60 bg-card hover:border-primary/50 hover:shadow-md transition-all flex items-center justify-between text-start"
        >
          <div>
            <div className="flex items-center gap-2 font-semibold text-sm">
              <Activity className="h-4 w-4 text-emerald-500" />
              {t('admin_audit_ledger_card')}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t('admin_audit_ledger_desc')}
            </p>
          </div>
          <ArrowUpRight className="h-5 w-5 text-muted-foreground group-hover:text-emerald-500 transition-colors rtl:rotate-180 shrink-0 ms-2" />
        </Link>
      </div>
    </div>
  )
}

