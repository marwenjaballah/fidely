/**
 * @file app/(admin)/admin/stores/page.tsx
 *
 * Stores & Outlets Management for Super Admins.
 * Full parity with merchant-level UI:
 * - Real-time search & sorting (by members, transactions, creation date)
 * - Detailed store inspection modal with QR stand & owner diagnostics
 * - Direct shortcut to test / inspect store public loyalty stand
 * - Mobile responsive cards & desktop table with clean status badges
 */

'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import {
  Store,
  Search,
  RefreshCw,
  Users,
  UserCheck,
  Receipt,
  Mail,
  Calendar,
  ExternalLink,
  Info,
  X,
  Sparkles,
  ArrowUpDown,
  Coins,
  QrCode,
  Copy,
  Check,
} from 'lucide-react'
import { useAdminStore, AdminStore } from '@/store/admin-store'
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useI18n } from '@/lib/i18n'
import { useToast } from '@/hooks/use-toast'

export default function AdminStoresPage() {
  const { stores, loading, fetchStores } = useAdminStore()
  const { t, dir } = useI18n()
  const { toast } = useToast()

  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'newest' | 'members' | 'txs' | 'name'>('newest')
  const [selectedStore, setSelectedStore] = useState<AdminStore | null>(null)
  const [copiedSlug, setCopiedSlug] = useState(false)

  useEffect(() => {
    fetchStores()
  }, [fetchStores])

  const copyUrl = (slug: string) => {
    const url = `${window.location.origin}/store/${slug}`
    navigator.clipboard.writeText(url)
    setCopiedSlug(true)
    toast({
      title: 'Link Copied',
      description: 'Store public URL copied to clipboard.',
    })
    setTimeout(() => setCopiedSlug(false), 2000)
  }

  const filteredStores = useMemo(() => {
    let result = [...stores]

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.slug.toLowerCase().includes(q) ||
          s.owner?.email?.toLowerCase().includes(q) ||
          (s.owner?.fullName && s.owner.fullName.toLowerCase().includes(q))
      )
    }

    result.sort((a, b) => {
      if (sortBy === 'members') {
        return (b.stats?.membersCount || 0) - (a.stats?.membersCount || 0)
      }
      if (sortBy === 'txs') {
        return (b.stats?.transactionsCount || 0) - (a.stats?.transactionsCount || 0)
      }
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name)
      }
      // default: newest
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

    return result
  }, [stores, searchQuery, sortBy])

  const totalMemberships = useMemo(() => {
    return stores.reduce((acc, s) => acc + (s.stats?.membersCount || 0), 0)
  }, [stores])

  const totalStaff = useMemo(() => {
    return stores.reduce((acc, s) => acc + (s.stats?.cashiersCount || 0), 0)
  }, [stores])

  const totalTxs = useMemo(() => {
    return stores.reduce((acc, s) => acc + (s.stats?.transactionsCount || 0), 0)
  }, [stores])

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl" dir={dir}>
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-2 border-b border-border/40">
        <div className="text-start space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
            {t('admin_nav_stores')}
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm">
            {t('admin_nav_stores_desc')}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchStores()}
          disabled={loading}
          className="gap-2 rounded-xl h-9 text-xs font-semibold shadow-2xs hover:bg-muted/80 self-start sm:self-auto"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>{t('refresh')}</span>
        </Button>
      </div>

      {/* Stats Summary Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 text-start">
        <Card className="border border-border/60 rounded-2xl shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {t('admin_kpi_reg_stores')}
            </CardTitle>
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Store className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-black tracking-tight font-mono text-foreground" dir="ltr">
              {stores.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{t('admin_kpi_reg_stores_desc')}</p>
          </CardContent>
        </Card>

        <Card className="border border-border/60 rounded-2xl shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {t('overview_kpi_total_members')}
            </CardTitle>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Users className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-black tracking-tight font-mono text-foreground" dir="ltr">
              {totalMemberships.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Cross-store membership enrollments</p>
          </CardContent>
        </Card>

        <Card className="border border-border/60 rounded-2xl shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {t('staff_title')}
            </CardTitle>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <UserCheck className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-black tracking-tight font-mono text-foreground" dir="ltr">
              {totalStaff}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{t('staff_authorized_title')}</p>
          </CardContent>
        </Card>

        <Card className="border border-border/60 rounded-2xl shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Total Transactions
            </CardTitle>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Receipt className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-black tracking-tight font-mono text-foreground" dir="ltr">
              {totalTxs.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Total point issuance & redemptions</p>
          </CardContent>
        </Card>
      </div>

      {/* Search & Sort Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('search')}
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
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <ArrowUpDown className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Sort:</span>
          </div>
          <Select value={sortBy} onValueChange={(val: any) => setSortBy(val)} dir={dir}>
            <SelectTrigger className="w-[170px] rounded-xl h-10 text-xs font-semibold">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent dir={dir}>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="members">Most Members</SelectItem>
              <SelectItem value="txs">Most Activity</SelectItem>
              <SelectItem value="name">Store Name (A-Z)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stores Table & Mobile Cards */}
      <Card className="border border-border/60 rounded-2xl overflow-hidden shadow-2xs">
        <CardContent className="p-0">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[280px] text-start font-bold text-xs uppercase tracking-wider">{t('overview_store_name')}</TableHead>
                  <TableHead className="text-start font-bold text-xs uppercase tracking-wider">Merchant Owner</TableHead>
                  <TableHead className="text-start font-bold text-xs uppercase tracking-wider">{t('customizer_multiplier_label')}</TableHead>
                  <TableHead className="text-start font-bold text-xs uppercase tracking-wider">Activity Counters</TableHead>
                  <TableHead className="text-start font-bold text-xs uppercase tracking-wider">{t('staff_col_added_on')}</TableHead>
                  <TableHead className="text-end font-bold text-xs uppercase tracking-wider">{t('actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && stores.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-40 text-center text-muted-foreground text-xs">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <RefreshCw className="h-5 w-5 animate-spin text-primary" />
                        <span>{t('loading')}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredStores.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-40 text-center text-muted-foreground text-xs">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Store className="h-8 w-8 text-muted-foreground/40" />
                        <span>{t('staff_no_results')}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStores.map((store) => (
                    <TableRow key={store.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="text-start py-3.5">
                        <div className="flex items-center gap-3">
                          <div
                            className="h-10 w-10 rounded-xl border flex items-center justify-center font-bold text-white shadow-xs shrink-0 text-sm"
                            style={{ backgroundColor: store.primaryColor || '#6366f1' }}
                          >
                            {store.name.slice(0, 1).toUpperCase()}
                          </div>
                          <div className="min-w-0 text-start">
                            <p className="font-bold text-sm text-foreground truncate">{store.name}</p>
                            <p className="text-xs text-muted-foreground font-mono" dir="ltr">
                              fidely.app/{store.slug}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="text-start py-3.5">
                        {store.owner ? (
                          <div className="space-y-0.5 text-start">
                            <p className="text-xs font-bold text-foreground truncate">
                              {store.owner.fullName || t('auth_signup_role_merchant')}
                            </p>
                            <p className="text-[11px] text-muted-foreground flex items-center gap-1 font-mono" dir="ltr">
                              <Mail className="h-3 w-3 shrink-0" />
                              <span className="truncate">{store.owner.email}</span>
                            </p>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">Unassigned</span>
                        )}
                      </TableCell>

                      <TableCell className="text-start py-3.5">
                        <Badge variant="outline" className="text-xs font-semibold font-mono" dir="ltr">
                          1 TND = {store.pointsPerTnd} pts
                        </Badge>
                      </TableCell>

                      <TableCell className="text-start py-3.5">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="gap-1 text-xs py-0.5 font-medium" dir="ltr" title="Enrolled Members">
                            <Users className="h-3 w-3 text-blue-500" />
                            {store.stats?.membersCount ?? 0}
                          </Badge>
                          <Badge variant="secondary" className="gap-1 text-xs py-0.5 font-medium" dir="ltr" title="Active Cashiers">
                            <UserCheck className="h-3 w-3 text-emerald-500" />
                            {store.stats?.cashiersCount ?? 0}
                          </Badge>
                          <Badge variant="secondary" className="gap-1 text-xs py-0.5 font-medium" dir="ltr" title="Total Transactions">
                            <Receipt className="h-3 w-3 text-amber-500" />
                            {store.stats?.transactionsCount ?? 0}
                          </Badge>
                        </div>
                      </TableCell>

                      <TableCell className="text-xs text-muted-foreground text-start py-3.5">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground/70 shrink-0" />
                          <span>
                            {new Date(store.createdAt).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="text-end py-3.5">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedStore(store)}
                            className="h-8 px-2.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
                          >
                            <Info className="h-3.5 w-3.5 me-1" />
                            Inspect
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="h-8 px-2.5 text-xs font-semibold"
                          >
                            <Link href={`/store/${store.slug}`} target="_blank">
                              <ExternalLink className="h-3.5 w-3.5 me-1" />
                              Stand
                            </Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden divide-y divide-border/60">
            {loading && stores.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                <RefreshCw className="h-5 w-5 animate-spin text-primary mx-auto mb-2" />
                <span>{t('loading')}</span>
              </div>
            ) : filteredStores.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                <Store className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                <span>{t('staff_no_results')}</span>
              </div>
            ) : (
              filteredStores.map((store) => (
                <div key={store.id} className="p-4 space-y-3 hover:bg-muted/20 transition-colors text-start">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="h-10 w-10 rounded-xl border flex items-center justify-center font-bold text-white shadow-xs shrink-0 text-sm"
                        style={{ backgroundColor: store.primaryColor || '#6366f1' }}
                      >
                        {store.name.slice(0, 1).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-sm text-foreground truncate">{store.name}</p>
                        <p className="text-xs text-muted-foreground font-mono" dir="ltr">/{store.slug}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[11px] font-mono shrink-0" dir="ltr">
                      1 TND = {store.pointsPerTnd} pts
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/40">
                    <span className="truncate max-w-[180px]">Owner: {store.owner?.email || 'N/A'}</span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Badge variant="secondary" className="gap-1 text-[10px] px-1.5 py-0">
                        <Users className="h-2.5 w-2.5 text-blue-500" />
                        {store.stats?.membersCount ?? 0}
                      </Badge>
                      <Badge variant="secondary" className="gap-1 text-[10px] px-1.5 py-0">
                        <Receipt className="h-2.5 w-2.5 text-amber-500" />
                        {store.stats?.transactionsCount ?? 0}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedStore(store)}
                      className="flex-1 h-8 text-xs font-semibold"
                    >
                      <Info className="h-3.5 w-3.5 me-1" />
                      Inspect Store
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      asChild
                      className="flex-1 h-8 text-xs font-semibold"
                    >
                      <Link href={`/store/${store.slug}`} target="_blank">
                        <ExternalLink className="h-3.5 w-3.5 me-1" />
                        View Stand
                      </Link>
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Store Inspection Modal */}
      {selectedStore && (
        <Dialog open={Boolean(selectedStore)} onOpenChange={(open) => !open && setSelectedStore(null)}>
          <DialogContent className="sm:max-w-lg rounded-2xl" dir={dir}>
            <DialogHeader className="text-start">
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="h-12 w-12 rounded-xl flex items-center justify-center font-bold text-white text-lg shadow-md"
                  style={{ backgroundColor: selectedStore.primaryColor || '#6366f1' }}
                >
                  {selectedStore.name.slice(0, 1).toUpperCase()}
                </div>
                <div>
                  <DialogTitle className="text-lg font-black text-foreground">
                    {selectedStore.name}
                  </DialogTitle>
                  <DialogDescription className="text-xs font-mono" dir="ltr">
                    fidely.app/{selectedStore.slug}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-4 py-2 text-start">
              {/* Quick Link Card */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border/60">
                <div className="min-w-0 pe-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                    Counter QR Stand URL
                  </span>
                  <p className="text-xs font-mono truncate text-foreground" dir="ltr">
                    /store/{selectedStore.slug}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyUrl(selectedStore.slug)}
                    className="h-8 gap-1 text-xs rounded-lg"
                  >
                    {copiedSlug ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedSlug ? 'Copied' : 'Copy'}</span>
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    asChild
                    className="h-8 text-xs rounded-lg"
                  >
                    <Link href={`/store/${selectedStore.slug}`} target="_blank">
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Store Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                <div className="p-3 rounded-xl border border-border/60 bg-card text-center space-y-1">
                  <Users className="h-4 w-4 text-blue-500 mx-auto" />
                  <span className="text-muted-foreground text-[10px] block">Members</span>
                  <span className="font-bold text-foreground text-sm font-mono block">
                    {selectedStore.stats?.membersCount ?? 0}
                  </span>
                </div>
                <div className="p-3 rounded-xl border border-border/60 bg-card text-center space-y-1">
                  <UserCheck className="h-4 w-4 text-emerald-500 mx-auto" />
                  <span className="text-muted-foreground text-[10px] block">Cashiers</span>
                  <span className="font-bold text-foreground text-sm font-mono block">
                    {selectedStore.stats?.cashiersCount ?? 0}
                  </span>
                </div>
                <div className="p-3 rounded-xl border border-border/60 bg-card text-center space-y-1">
                  <Receipt className="h-4 w-4 text-amber-500 mx-auto" />
                  <span className="text-muted-foreground text-[10px] block">Activity</span>
                  <span className="font-bold text-foreground text-sm font-mono block">
                    {selectedStore.stats?.transactionsCount ?? 0}
                  </span>
                </div>
                <div className="p-3 rounded-xl border border-border/60 bg-card text-center space-y-1">
                  <Coins className="h-4 w-4 text-purple-500 mx-auto" />
                  <span className="text-muted-foreground text-[10px] block">Rewards</span>
                  <span className="font-bold text-foreground text-sm font-mono block">
                    {selectedStore.stats?.rewardsCount ?? 0}
                  </span>
                </div>
              </div>

              {/* Owner Diagnostics */}
              <div className="p-4 rounded-xl border border-border/60 bg-muted/20 space-y-2 text-xs">
                <span className="font-bold text-xs text-foreground uppercase tracking-wider block">
                  Merchant Account
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground text-[11px] block">Owner Name:</span>
                    <span className="font-semibold text-foreground">{selectedStore.owner?.fullName || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-[11px] block">Owner Email:</span>
                    <span className="font-mono text-foreground" dir="ltr">{selectedStore.owner?.email || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-[11px] block">Loyalty Multiplier:</span>
                    <span className="font-mono font-bold text-primary" dir="ltr">1 TND = {selectedStore.pointsPerTnd} pts</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-[11px] block">Created Date:</span>
                    <span className="text-foreground">{new Date(selectedStore.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
