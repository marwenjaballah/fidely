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

export default function AdminOverviewPage() {
  const { metrics, transactions, loading, fetchMetrics, fetchTransactions } = useAdminStore()

  useEffect(() => {
    fetchMetrics()
    fetchTransactions()
  }, [fetchMetrics, fetchTransactions])

  const kpis = [
    {
      title: 'Total Platform Volume',
      value: metrics?.kpis?.totalVolumeTnd != null ? `${Number(metrics.kpis.totalVolumeTnd).toLocaleString()} TND` : '...',
      description: 'Cumulative transaction volume',
      icon: DollarSign,
      gradient: 'from-emerald-500/10 to-teal-500/10 text-emerald-600 dark:text-emerald-400',
    },
    {
      title: 'Registered Stores',
      value: metrics?.kpis?.totalStores != null ? metrics.kpis.totalStores.toString() : '...',
      description: 'Active merchant outlets',
      icon: Store,
      gradient: 'from-blue-500/10 to-indigo-500/10 text-blue-600 dark:text-blue-400',
    },
    {
      title: 'Platform Users',
      value: metrics?.kpis?.totalUsers != null ? metrics.kpis.totalUsers.toString() : '...',
      description: `${metrics?.kpis?.totalMerchants ?? 0} Merchants, ${metrics?.kpis?.totalCashiers ?? 0} Cashiers, ${metrics?.kpis?.totalCustomers ?? 0} Customers`,
      icon: Users,
      gradient: 'from-purple-500/10 to-pink-500/10 text-purple-600 dark:text-purple-400',
    },
    {
      title: 'Points Issued Pool',
      value: metrics?.kpis?.totalPointsIssued != null ? `${metrics.kpis.totalPointsIssued.toLocaleString()} pts` : '...',
      description: `${metrics?.kpis?.totalPointsRedeemed ?? 0} redeemed`,
      icon: Coins,
      gradient: 'from-amber-500/10 to-orange-500/10 text-amber-600 dark:text-amber-400',
    },
  ]

  const chartData = metrics?.dailyTrends || []
  const recentFeed = (transactions || []).slice(0, 6)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Platform Command Center</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Real-time ecosystem metrics, health indicators, and cross-store activity.
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
            Refresh Data
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon
          return (
            <Card key={kpi.title} className="relative overflow-hidden border border-border/60 hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {kpi.title}
                </CardTitle>
                <div className={`p-2 rounded-xl ${kpi.gradient}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpi.value}</div>
                <p className="text-xs text-muted-foreground mt-1 truncate">{kpi.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Analytics Chart & Quick Stats */}
      <div className="grid gap-6 lg:grid-cols-7">
        {/* 14-Day Volume Chart */}
        <Card className="lg:col-span-4 border border-border/60">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                14-Day Platform Volume (TND)
              </CardTitle>
              <CardDescription>Daily aggregated transaction spend across all stores</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] w-full mt-2">
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
                  {loading ? 'Crunching analytics...' : 'No transaction data for this period.'}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Live Activity Stream */}
        <Card className="lg:col-span-3 border border-border/60 flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Activity className="h-4 w-4 text-emerald-500" />
                Live Platform Feed
              </CardTitle>
              <CardDescription>Recent transactions across all merchants</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild className="text-xs">
              <Link href="/admin/transactions">
                View all
                <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto max-h-[300px] space-y-3 pr-1">
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
                    <div className="min-w-0">
                      <p className="text-xs font-semibold truncate text-foreground">
                        {act.customer?.fullName || act.customer?.email || 'Anonymous Customer'}
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        at <span className="font-medium text-foreground">{act.storeName}</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
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
                No recent activity recorded.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Link
          href="/admin/stores"
          className="group p-5 rounded-xl border border-border/60 bg-card hover:border-primary/50 hover:shadow-md transition-all flex items-center justify-between"
        >
          <div>
            <div className="flex items-center gap-2 font-semibold text-sm">
              <Store className="h-4 w-4 text-primary" />
              Store Directory
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Inspect store owners, loyalty multipliers, and cashier staff.
            </p>
          </div>
          <ArrowUpRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
        </Link>

        <Link
          href="/admin/users"
          className="group p-5 rounded-xl border border-border/60 bg-card hover:border-primary/50 hover:shadow-md transition-all flex items-center justify-between"
        >
          <div>
            <div className="flex items-center gap-2 font-semibold text-sm">
              <Users className="h-4 w-4 text-purple-500" />
              User Directory & Roles
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Promote administrators, manage merchant accounts and customers.
            </p>
          </div>
          <ArrowUpRight className="h-5 w-5 text-muted-foreground group-hover:text-purple-500 transition-colors" />
        </Link>

        <Link
          href="/admin/transactions"
          className="group p-5 rounded-xl border border-border/60 bg-card hover:border-primary/50 hover:shadow-md transition-all flex items-center justify-between"
        >
          <div>
            <div className="flex items-center gap-2 font-semibold text-sm">
              <Activity className="h-4 w-4 text-emerald-500" />
              Global Audit Ledger
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Full transactional audit stream with real-time timestamps.
            </p>
          </div>
          <ArrowUpRight className="h-5 w-5 text-muted-foreground group-hover:text-emerald-500 transition-colors" />
        </Link>
      </div>
    </div>
  )
}
