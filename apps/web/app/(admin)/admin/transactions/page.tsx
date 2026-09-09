'use client'

import { useEffect, useState, useMemo } from 'react'
import {
  Receipt,
  Search,
  RefreshCw,
  Store,
  User,
  Clock,
  ArrowDownLeft,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react'
import { useAdminStore } from '@/store/admin-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function AdminTransactionsPage() {
  const { transactions, loading, fetchTransactions } = useAdminStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('ALL')

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const matchesType = typeFilter === 'ALL' || tx.type === typeFilter
      if (!matchesType) return false

      if (!searchQuery.trim()) return true
      const q = searchQuery.toLowerCase()
      return (
        tx.id.toLowerCase().includes(q) ||
        tx.store?.name.toLowerCase().includes(q) ||
        tx.customer?.email.toLowerCase().includes(q) ||
        (tx.customer?.fullName && tx.customer.fullName.toLowerCase().includes(q))
      )
    })
  }, [transactions, searchQuery, typeFilter])

  const totalVolume = useMemo(() => {
    return transactions.reduce((sum, tx) => sum + (tx.amount || 0), 0)
  }, [transactions])

  const totalPoints = useMemo(() => {
    return transactions.reduce((sum, tx) => sum + (tx.points || 0), 0)
  }, [transactions])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Global Audit Log</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Real-time transactional ledger across all merchants and customer cards.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchTransactions()}
          disabled={loading}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border border-border/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Recent Transactions Loaded
            </CardTitle>
            <Receipt className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{transactions.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Audit log entries</p>
          </CardContent>
        </Card>

        <Card className="border border-border/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Audit Stream Volume
            </CardTitle>
            <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">TND</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalVolume.toLocaleString()} TND</div>
            <p className="text-xs text-muted-foreground mt-1">Total value in log</p>
          </CardContent>
        </Card>

        <Card className="border border-border/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Points Impact
            </CardTitle>
            <Sparkles className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPoints.toLocaleString()} pts</div>
            <p className="text-xs text-muted-foreground mt-1">Loyalty points processed</p>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by store, customer, or transaction ID..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="w-full sm:w-auto">
          <Select value={typeFilter} onValueChange={(val) => setTypeFilter(val)}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Types</SelectItem>
              <SelectItem value="EARN">EARN (Points Issued)</SelectItem>
              <SelectItem value="REDEEM">REDEEM (Reward Used)</SelectItem>
              <SelectItem value="ADJUST">ADJUST (Manual Correction)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Transactions Table */}
      <Card className="border border-border/60">
        <CardContent className="p-0">
          <div className="rounded-md overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[180px]">Transaction ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount (TND)</TableHead>
                  <TableHead>Points</TableHead>
                  <TableHead>Merchant Store</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && transactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                      Loading global audit ledger...
                    </TableCell>
                  </TableRow>
                ) : filteredTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                      No audit log records found matching your filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTransactions.map((tx) => (
                    <TableRow key={tx.id} className="hover:bg-muted/40 transition-colors">
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {tx.id.slice(0, 8)}...
                      </TableCell>
                      <TableCell>
                        {tx.type === 'EARN' ? (
                          <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1 text-[10px] py-0.5">
                            <ArrowUpRight className="h-3 w-3" />
                            EARN
                          </Badge>
                        ) : tx.type === 'REDEEM' ? (
                          <Badge className="bg-destructive hover:bg-destructive/90 text-white gap-1 text-[10px] py-0.5">
                            <ArrowDownLeft className="h-3 w-3" />
                            REDEEM
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-[10px] py-0.5">
                            {tx.type}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="font-semibold text-sm">
                        {tx.amount > 0 ? `${tx.amount} TND` : '-'}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`font-semibold text-xs ${
                            tx.points >= 0
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-destructive'
                          }`}
                        >
                          {tx.points > 0 ? `+${tx.points}` : tx.points} pts
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                          <Store className="h-3.5 w-3.5 text-primary" />
                          <span>{tx.store?.name || 'Unknown Store'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {tx.customer ? (
                          <div className="space-y-0.5">
                            <p className="text-xs font-medium text-foreground">
                              {tx.customer.fullName || 'Customer'}
                            </p>
                            <p className="text-[11px] text-muted-foreground font-mono">
                              {tx.customer.email}
                            </p>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">Anonymous</span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground/70" />
                          {new Date(tx.createdAt).toLocaleString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
