'use client'

import { useEffect, useState, useMemo } from 'react'
import {
  Store,
  Search,
  RefreshCw,
  Users,
  UserCheck,
  Receipt,
  Mail,
  Calendar,
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

import { useI18n } from '@/lib/i18n'

export default function AdminStoresPage() {
  const { stores, loading, fetchStores } = useAdminStore()
  const { t, dir } = useI18n()
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchStores()
  }, [fetchStores])

  const filteredStores = useMemo(() => {
    if (!searchQuery.trim()) return stores
    const q = searchQuery.toLowerCase()
    return stores.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.slug.toLowerCase().includes(q) ||
        s.owner?.email.toLowerCase().includes(q) ||
        (s.owner?.fullName && s.owner.fullName.toLowerCase().includes(q))
    )
  }, [stores, searchQuery])

  const totalMemberships = useMemo(() => {
    return stores.reduce((acc, s) => acc + (s.stats?.membersCount || 0), 0)
  }, [stores])

  const totalStaff = useMemo(() => {
    return stores.reduce((acc, s) => acc + (s.stats?.cashiersCount || 0), 0)
  }, [stores])

  return (
    <div className="space-y-6" dir={dir}>
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-start">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{t('admin_nav_stores')}</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {t('admin_nav_stores_desc')}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchStores()}
          disabled={loading}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          {t('refresh')}
        </Button>
      </div>

      {/* Stats Summary */}
      <div className="grid gap-4 sm:grid-cols-3 text-start">
        <Card className="border border-border/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t('admin_kpi_reg_stores')}
            </CardTitle>
            <Store className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" dir="ltr">{stores.length}</div>
            <p className="text-xs text-muted-foreground mt-1">{t('admin_kpi_reg_stores_desc')}</p>
          </CardContent>
        </Card>

        <Card className="border border-border/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t('overview_kpi_total_members')}
            </CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" dir="ltr">{totalMemberships}</div>
            <p className="text-xs text-muted-foreground mt-1">{t('overview_kpi_members_desc')}</p>
          </CardContent>
        </Card>

        <Card className="border border-border/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t('staff_title')}
            </CardTitle>
            <UserCheck className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" dir="ltr">{totalStaff}</div>
            <p className="text-xs text-muted-foreground mt-1">{t('staff_authorized_title')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('search')}
            className="ps-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Stores Table */}
      <Card className="border border-border/60">
        <CardContent className="p-0">
          {/* Desktop Table View */}
          <div className="hidden md:block rounded-md overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[260px] text-start">{t('overview_store_name')}</TableHead>
                  <TableHead className="text-start">{t('staff_col_cashier')}</TableHead>
                  <TableHead className="text-start">{t('customizer_multiplier_label')}</TableHead>
                  <TableHead className="text-start">{t('analytics_title')}</TableHead>
                  <TableHead className="text-start">{t('staff_col_added_on')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && stores.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                      {t('loading')}
                    </TableCell>
                  </TableRow>
                ) : filteredStores.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                      {t('staff_no_results')}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStores.map((store) => (
                    <TableRow key={store.id} className="hover:bg-muted/40 transition-colors">
                      <TableCell className="text-start">
                        <div className="flex items-center gap-3">
                          <div
                            className="h-9 w-9 rounded-lg border flex items-center justify-center font-bold text-white shadow-xs shrink-0"
                            style={{ backgroundColor: store.primaryColor || '#6366f1' }}
                          >
                            {store.name.slice(0, 1).toUpperCase()}
                          </div>
                          <div className="min-w-0 text-start">
                            <p className="font-semibold text-sm text-foreground truncate">{store.name}</p>
                            <p className="text-xs text-muted-foreground font-mono" dir="ltr">/{store.slug}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-start">
                        {store.owner ? (
                          <div className="space-y-0.5 text-start">
                            <p className="text-xs font-medium text-foreground">{store.owner.fullName || t('auth_signup_role_merchant')}</p>
                            <p className="text-[11px] text-muted-foreground flex items-center gap-1 font-mono" dir="ltr">
                              <Mail className="h-3 w-3" />
                              {store.owner.email}
                            </p>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">Unassigned</span>
                        )}
                      </TableCell>
                      <TableCell className="text-start">
                        <Badge variant="outline" className="text-xs font-medium" dir="ltr">
                          1 TND = {store.pointsPerTnd} pts
                        </Badge>
                      </TableCell>
                      <TableCell className="text-start">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="gap-1 text-xs py-0.5" dir="ltr">
                            <Users className="h-3 w-3 text-blue-500" />
                            {store.stats?.membersCount ?? 0}
                          </Badge>
                          <Badge variant="secondary" className="gap-1 text-xs py-0.5" dir="ltr">
                            <UserCheck className="h-3 w-3 text-emerald-500" />
                            {store.stats?.cashiersCount ?? 0}
                          </Badge>
                          <Badge variant="secondary" className="gap-1 text-xs py-0.5" dir="ltr">
                            <Receipt className="h-3 w-3 text-amber-500" />
                            {store.stats?.transactionsCount ?? 0}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground text-start">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground/70" />
                          <span>
                            {new Date(store.createdAt).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
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
                {t('loading')}
              </div>
            ) : filteredStores.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                {t('staff_no_results')}
              </div>
            ) : (
              filteredStores.map((store) => (
                <div key={store.id} className="p-4 space-y-3 hover:bg-muted/20 transition-colors text-start">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="h-10 w-10 rounded-xl border flex items-center justify-center font-bold text-white shadow-xs shrink-0"
                        style={{ backgroundColor: store.primaryColor || '#6366f1' }}
                      >
                        {store.name.slice(0, 1).toUpperCase()}
                      </div>
                      <div className="min-w-0 text-start">
                        <p className="font-semibold text-sm text-foreground truncate">{store.name}</p>
                        <p className="text-xs text-muted-foreground font-mono" dir="ltr">/{store.slug}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs font-mono font-bold shrink-0" dir="ltr">
                      1 TND = {store.pointsPerTnd} pts
                    </Badge>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                    <div className="text-muted-foreground">
                      {t('auth_signup_role_merchant')}: <span className="font-medium text-foreground">{store.owner?.fullName || store.owner?.email || 'Unassigned'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Badge variant="secondary" className="gap-1 text-[11px] py-0.5" dir="ltr">
                        <Users className="h-3 w-3 text-blue-500" />
                        {store.stats?.membersCount ?? 0}
                      </Badge>
                      <Badge variant="secondary" className="gap-1 text-[11px] py-0.5" dir="ltr">
                        <UserCheck className="h-3 w-3 text-emerald-500" />
                        {store.stats?.cashiersCount ?? 0}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

