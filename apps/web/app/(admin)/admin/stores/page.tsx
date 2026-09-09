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

export default function AdminStoresPage() {
  const { stores, loading, fetchStores } = useAdminStore()
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
    return stores.reduce((acc, s) => acc + (s._count?.memberships || 0), 0)
  }, [stores])

  const totalStaff = useMemo(() => {
    return stores.reduce((acc, s) => acc + (s._count?.staff || 0), 0)
  }, [stores])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Stores & Merchants</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Global directory of all registered store outlets, configurations, and associated merchants.
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
          Refresh
        </Button>
      </div>

      {/* Stats Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border border-border/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Outlets
            </CardTitle>
            <Store className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stores.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Registered businesses</p>
          </CardContent>
        </Card>

        <Card className="border border-border/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Customer Memberships
            </CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMemberships}</div>
            <p className="text-xs text-muted-foreground mt-1">Active customer links across all stores</p>
          </CardContent>
        </Card>

        <Card className="border border-border/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Cashier Staff
            </CardTitle>
            <UserCheck className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStaff}</div>
            <p className="text-xs text-muted-foreground mt-1">Assigned store cashiers</p>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search stores by name, slug, or owner email..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Stores Table */}
      <Card className="border border-border/60">
        <CardContent className="p-0">
          <div className="rounded-md overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[260px]">Store Details</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Loyalty Ratio</TableHead>
                  <TableHead>Network Metrics</TableHead>
                  <TableHead>Created Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && stores.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                      Loading stores directory...
                    </TableCell>
                  </TableRow>
                ) : filteredStores.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                      No stores found matching your criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStores.map((store) => (
                    <TableRow key={store.id} className="hover:bg-muted/40 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div
                            className="h-9 w-9 rounded-lg border flex items-center justify-center font-bold text-white shadow-xs shrink-0"
                            style={{ backgroundColor: store.primaryColor || '#6366f1' }}
                          >
                            {store.name.slice(0, 1).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-sm text-foreground truncate">{store.name}</p>
                            <p className="text-xs text-muted-foreground font-mono">/{store.slug}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {store.owner ? (
                          <div className="space-y-0.5">
                            <p className="text-xs font-medium text-foreground">{store.owner.fullName || 'Merchant'}</p>
                            <p className="text-[11px] text-muted-foreground flex items-center gap-1 font-mono">
                              <Mail className="h-3 w-3" />
                              {store.owner.email}
                            </p>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">Unassigned</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs font-medium">
                          1 TND = {store.pointsPerTnd} pts
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="gap-1 text-xs py-0.5">
                            <Users className="h-3 w-3 text-blue-500" />
                            {store._count?.memberships || 0}
                          </Badge>
                          <Badge variant="secondary" className="gap-1 text-xs py-0.5">
                            <UserCheck className="h-3 w-3 text-emerald-500" />
                            {store._count?.staff || 0}
                          </Badge>
                          <Badge variant="secondary" className="gap-1 text-xs py-0.5">
                            <Receipt className="h-3 w-3 text-amber-500" />
                            {store._count?.transactions || 0}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground/70" />
                          {new Date(store.createdAt).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
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
