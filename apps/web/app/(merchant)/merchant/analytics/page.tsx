'use client'

import { useEffect } from 'react'
import { useMerchantStore } from '@/store/merchant-store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { TrendingUp, Award, Zap, Coffee, Activity, Loader2 } from 'lucide-react'

export default function AnalyticsPage() {
  const { activeStore, fetchAnalytics, analytics, loading } = useMerchantStore()

  useEffect(() => {
    if (activeStore) {
      fetchAnalytics(activeStore.id)
    }
  }, [activeStore, fetchAnalytics])

  if (!activeStore) {
    return (
      <div className="flex flex-1 items-center justify-center p-6 text-center">
        <div className="space-y-2">
          <Coffee className="h-8 w-8 text-muted-foreground mx-auto" />
          <p className="text-sm text-muted-foreground">Please select or create a coffee shop.</p>
        </div>
      </div>
    )
  }

  const totalIssued = analytics?.totalPointsIssued ?? 0
  const totalRedeemed = analytics?.totalPointsRedeemed ?? 0
  const netOutstanding = totalIssued - totalRedeemed

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:gap-8 md:p-8 overflow-x-hidden">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
          <span>Performance metrics for</span>
          <span className="font-semibold text-foreground bg-primary/10 text-primary px-2 py-0.5 rounded text-xs">
            {activeStore.name}
          </span>
        </p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <Card className="border border-border/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Points Issued
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{totalIssued.toLocaleString()}</div>
            <p className="text-[11px] text-muted-foreground mt-0.5">Awarded across all sales</p>
          </CardContent>
        </Card>

        <Card className="border border-border/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Points Redeemed
            </CardTitle>
            <Award className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{totalRedeemed.toLocaleString()}</div>
            <p className="text-[11px] text-muted-foreground mt-0.5">Claimed for rewards</p>
          </CardContent>
        </Card>

        <Card className="border border-border/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Net Outstanding
            </CardTitle>
            <Zap className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{netOutstanding.toLocaleString()}</div>
            <p className="text-[11px] text-muted-foreground mt-0.5">Unredeemed in customer wallets</p>
          </CardContent>
        </Card>
      </div>

      {/* Chart Section */}
      {loading && !analytics ? (
        <Card className="border border-border/60">
          <CardContent className="h-64 flex flex-col items-center justify-center gap-2 text-muted-foreground text-sm">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <p>Loading chart data...</p>
          </CardContent>
        </Card>
      ) : analytics && analytics.recentTransactions.length > 0 ? (
        <Card className="border border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              Activity Trend (Issued vs Redeemed)
            </CardTitle>
            <CardDescription className="text-xs">
              Points movement over recent customer transactions
            </CardDescription>
          </CardHeader>
          <CardContent className="px-2 sm:px-6">
            <div className="h-[260px] sm:h-[340px] md:h-[400px] w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={analytics.recentTransactions}
                  margin={{
                    top: 10,
                    right: 10,
                    left: -20,
                    bottom: 0,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                  <XAxis
                    dataKey="date"
                    stroke="#888888"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '12px',
                      fontSize: '12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600 }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Bar dataKey="issued" name="Points Issued" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="redeemed" name="Points Redeemed" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border border-border/60">
          <CardHeader>
            <CardTitle className="text-base">Recent Activity</CardTitle>
            <CardDescription className="text-xs">
              Points Issued vs Redeemed over recent transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-40 items-center justify-center text-xs sm:text-sm text-muted-foreground">
              No recent transaction activity recorded yet.
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
