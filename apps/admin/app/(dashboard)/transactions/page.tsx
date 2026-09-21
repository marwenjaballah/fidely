/**
 * @file app/(admin)/admin/transactions/page.tsx
 *
 * Global Audit & Transaction Ledger for Super Admins.
 * Full parity with merchant UI:
 * - Real-time filtering & instant search
 * - One-click CSV ledger export
 * - Digital receipt inspection dialog
 * - High-speed desktop table & mobile card layouts
 */

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
  Download,
  Copy,
  Check,
  Calendar,
  X,
  CreditCard,
  CheckCircle2,
} from 'lucide-react'
import { useAdminStore, AdminTransaction } from '@/store/admin-store'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useI18n } from '@/lib/i18n'
import { useToast } from '@/hooks/use-toast'

export default function AdminTransactionsPage() {
  const { transactions, loading, fetchTransactions } = useAdminStore()
  const { t, dir } = useI18n()
  const { toast } = useToast()

  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [selectedTx, setSelectedTx] = useState<AdminTransaction | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  const copyTxId = (id: string) => {
    navigator.clipboard.writeText(id)
    setCopiedId(id)
    toast({
      title: 'Copied',
      description: 'Transaction ID copied to clipboard.',
    })
    setTimeout(() => setCopiedId(null), 2000)
  }

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const matchesType =
        typeFilter === 'ALL' || tx.type.toUpperCase() === typeFilter.toUpperCase()
      if (!matchesType) return false

      if (!searchQuery.trim()) return true
      const q = searchQuery.toLowerCase()
      return (
        tx.id.toLowerCase().includes(q) ||
        tx.storeName?.toLowerCase().includes(q) ||
        tx.customer?.email?.toLowerCase().includes(q) ||
        (tx.customer?.fullName && tx.customer.fullName.toLowerCase().includes(q))
      )
    })
  }, [transactions, searchQuery, typeFilter])

  const totalVolume = useMemo(() => {
    return filteredTransactions.reduce((sum, tx) => sum + (tx.amountTnd || 0), 0)
  }, [filteredTransactions])

  const totalPoints = useMemo(() => {
    return filteredTransactions.reduce((sum, tx) => sum + (tx.pointsAffected || 0), 0)
  }, [filteredTransactions])

  const handleExportCsv = () => {
    if (filteredTransactions.length === 0) {
      toast({
        title: 'No Data',
        description: 'No transactions match the current filter to export.',
        variant: 'destructive',
      })
      return
    }

    const headers = ['ID', 'Date', 'Type', 'Amount (TND)', 'Points', 'Store', 'Customer Email', 'Customer Name']
    const rows = filteredTransactions.map((tx) => [
      `"${tx.id}"`,
      `"${new Date(tx.createdAt).toISOString()}"`,
      `"${tx.type}"`,
      tx.amountTnd != null ? tx.amountTnd : '',
      tx.pointsAffected,
      `"${tx.storeName || ''}"`,
      `"${tx.customer?.email || ''}"`,
      `"${tx.customer?.fullName || ''}"`,
    ])

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `fidely-audit-ledger-${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast({
      title: 'Export Complete',
      description: `Exported ${filteredTransactions.length} transaction records to CSV.`,
    })
  }

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl" dir={dir}>
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-2 border-b border-border/40">
        <div className="text-start space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
            {t('admin_nav_transactions')}
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm">
            {t('admin_nav_transactions_desc')}
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            className="gap-2 rounded-xl h-9 text-xs font-semibold shadow-2xs hover:bg-muted/80"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchTransactions()}
            disabled={loading}
            className="gap-2 rounded-xl h-9 text-xs font-semibold shadow-2xs hover:bg-muted/80"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{t('refresh')}</span>
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 sm:grid-cols-3 text-start">
        <Card className="border border-border/60 rounded-2xl shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Filtered Records
            </CardTitle>
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Receipt className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-black tracking-tight font-mono text-foreground" dir="ltr">
              {filteredTransactions.length.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Out of {transactions.length} total platform events
            </p>
          </CardContent>
        </Card>

        <Card className="border border-border/60 rounded-2xl shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {t('admin_kpi_total_volume')}
            </CardTitle>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <span className="text-xs font-bold font-mono">TND</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-black tracking-tight font-mono text-emerald-600 dark:text-emerald-400" dir="ltr">
              {totalVolume.toLocaleString()} TND
            </div>
            <p className="text-xs text-muted-foreground mt-1">Aggregated monetary turnover</p>
          </CardContent>
        </Card>

        <Card className="border border-border/60 rounded-2xl shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Net Loyalty Points
            </CardTitle>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Sparkles className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-black tracking-tight font-mono text-foreground" dir="ltr">
              {totalPoints.toLocaleString()} pts
            </div>
            <p className="text-xs text-muted-foreground mt-1">Balance change across filtered events</p>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filters Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by ID, store, customer email..."
            className="ps-9 pe-9 rounded-xl h-10 border-border/60 focus-visible:ring-primary/20"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Select value={typeFilter} onValueChange={(val) => setTypeFilter(val)} dir={dir}>
            <SelectTrigger className="w-[180px] rounded-xl h-10 text-xs font-semibold">
              <SelectValue placeholder={t('filter')} />
            </SelectTrigger>
            <SelectContent dir={dir}>
              <SelectItem value="ALL">{t('all')} Types</SelectItem>
              <SelectItem value="EARN">EARN (+Points)</SelectItem>
              <SelectItem value="REDEEM">REDEEM (-Points)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Transactions Table & Mobile Cards */}
      <Card className="border border-border/60 rounded-2xl overflow-hidden shadow-2xs">
        <CardContent className="p-0">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[180px] text-start font-bold text-xs uppercase tracking-wider">Transaction ID</TableHead>
                  <TableHead className="text-start font-bold text-xs uppercase tracking-wider">{t('status')}</TableHead>
                  <TableHead className="text-start font-bold text-xs uppercase tracking-wider">{t('cashier_spend_amount_label')}</TableHead>
                  <TableHead className="text-start font-bold text-xs uppercase tracking-wider">{t('points')}</TableHead>
                  <TableHead className="text-start font-bold text-xs uppercase tracking-wider">{t('overview_active_store')}</TableHead>
                  <TableHead className="text-start font-bold text-xs uppercase tracking-wider">{t('crm_col_customer')}</TableHead>
                  <TableHead className="text-start font-bold text-xs uppercase tracking-wider">{t('date')}</TableHead>
                  <TableHead className="text-end font-bold text-xs uppercase tracking-wider">{t('actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && transactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-40 text-center text-muted-foreground text-xs">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <RefreshCw className="h-5 w-5 animate-spin text-primary" />
                        <span>{t('loading')}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-40 text-center text-muted-foreground text-xs">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Receipt className="h-8 w-8 text-muted-foreground/40" />
                        <span>{t('analytics_no_activity_recorded')}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTransactions.map((tx) => {
                    const isEarn = tx.type?.toLowerCase() === 'earn'
                    return (
                      <TableRow key={tx.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="text-start py-3.5">
                          <button
                            type="button"
                            onClick={() => copyTxId(tx.id)}
                            className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-foreground group"
                            dir="ltr"
                            title="Click to copy full ID"
                          >
                            <span>{tx.id.slice(0, 8)}...</span>
                            {copiedId === tx.id ? (
                              <Check className="h-3 w-3 text-emerald-500" />
                            ) : (
                              <Copy className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                            )}
                          </button>
                        </TableCell>

                        <TableCell className="text-start py-3.5">
                          {isEarn ? (
                            <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1 text-[10px] font-bold py-0.5">
                              <ArrowUpRight className="h-3 w-3 rtl:rotate-180" />
                              EARN
                            </Badge>
                          ) : (
                            <Badge className="bg-rose-600 hover:bg-rose-700 text-white gap-1 text-[10px] font-bold py-0.5">
                              <ArrowDownLeft className="h-3 w-3 rtl:rotate-180" />
                              REDEEM
                            </Badge>
                          )}
                        </TableCell>

                        <TableCell className="font-bold text-sm text-start font-mono py-3.5" dir="ltr">
                          {tx.amountTnd != null ? `${tx.amountTnd} TND` : '-'}
                        </TableCell>

                        <TableCell className="text-start py-3.5">
                          <span
                            className={`font-mono font-bold text-xs ${
                              tx.pointsAffected >= 0
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-rose-600 dark:text-rose-400'
                            }`}
                            dir="ltr"
                          >
                            {tx.pointsAffected > 0 ? `+${tx.pointsAffected}` : tx.pointsAffected} pts
                          </span>
                        </TableCell>

                        <TableCell className="text-start py-3.5">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                            <Store className="h-3.5 w-3.5 text-primary shrink-0" />
                            <span className="truncate">{tx.storeName || 'Unknown Store'}</span>
                          </div>
                        </TableCell>

                        <TableCell className="text-start py-3.5">
                          {tx.customer ? (
                            <div className="space-y-0.5 text-start">
                              <p className="text-xs font-bold text-foreground truncate">
                                {tx.customer.fullName || t('crm_anonymous_customer')}
                              </p>
                              <p className="text-[11px] text-muted-foreground font-mono truncate" dir="ltr">
                                {tx.customer.email}
                              </p>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground italic">{t('crm_anonymous_customer')}</span>
                          )}
                        </TableCell>

                        <TableCell className="text-xs text-muted-foreground text-start py-3.5">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5 text-muted-foreground/70 shrink-0" />
                            <span>{new Date(tx.createdAt).toLocaleDateString()}</span>
                          </div>
                        </TableCell>

                        <TableCell className="text-end py-3.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedTx(tx)}
                            className="h-8 px-2.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
                          >
                            Receipt
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Cards View */}
          <div className="md:hidden divide-y divide-border/60">
            {loading && transactions.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                <RefreshCw className="h-5 w-5 animate-spin text-primary mx-auto mb-2" />
                <span>{t('loading')}</span>
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                <Receipt className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                <span>{t('analytics_no_activity_recorded')}</span>
              </div>
            ) : (
              filteredTransactions.map((tx) => {
                const isEarn = tx.type?.toLowerCase() === 'earn'
                return (
                  <div
                    key={tx.id}
                    onClick={() => setSelectedTx(tx)}
                    className="p-4 space-y-2.5 hover:bg-muted/20 transition-colors text-start cursor-pointer"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {isEarn ? (
                          <Badge className="bg-emerald-600 text-white text-[10px] font-bold">EARN</Badge>
                        ) : (
                          <Badge className="bg-rose-600 text-white text-[10px] font-bold">REDEEM</Badge>
                        )}
                        <span className="font-mono text-xs text-muted-foreground" dir="ltr">
                          {tx.id.slice(0, 8)}...
                        </span>
                      </div>
                      <span
                        className={`font-mono font-bold text-xs ${
                          tx.pointsAffected >= 0 ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                        dir="ltr"
                      >
                        {tx.pointsAffected > 0 ? `+${tx.pointsAffected}` : tx.pointsAffected} pts
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-foreground truncate">{tx.storeName}</span>
                      {tx.amountTnd != null && (
                        <span className="font-mono font-semibold" dir="ltr">{tx.amountTnd} TND</span>
                      )}
                    </div>

                    <div className="flex justify-between items-center text-[11px] text-muted-foreground pt-1 border-t border-border/40">
                      <span className="truncate max-w-[180px]">{tx.customer?.email || 'Anonymous'}</span>
                      <span>{new Date(tx.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Digital Receipt Modal */}
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
                  {copiedId === selectedTx.id ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedId === selectedTx.id ? 'Copied' : 'Copy'}</span>
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
                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Verified Ledger
                </span>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
