'use client'

import { useEffect, useState, useMemo } from 'react'
import { useMerchantStore } from '@/store/merchant-store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { format } from 'date-fns'
import { Users, Search, RefreshCw, Coffee, Mail, Calendar, Coins, Loader2 } from 'lucide-react'

export default function CrmPage() {
  const { activeStore, fetchCustomers, customers, loading } = useMerchantStore()
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (activeStore) {
      fetchCustomers(activeStore.id)
    }
  }, [activeStore, fetchCustomers])

  const filteredCustomers = useMemo(() => {
    if (!searchQuery.trim()) return customers
    const q = searchQuery.toLowerCase()
    return customers.filter(
      (c) =>
        (c.fullName && c.fullName.toLowerCase().includes(q)) ||
        (c.email && c.email.toLowerCase().includes(q))
    )
  }, [customers, searchQuery])

  const totalPointsBalance = useMemo(() => {
    return customers.reduce((sum, c) => sum + (c.pointsBalance || 0), 0)
  }, [customers])

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

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:gap-8 md:p-8 overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Customer CRM</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
            <span>Loyalty members for</span>
            <span className="font-semibold text-foreground bg-primary/10 text-primary px-2 py-0.5 rounded text-xs">
              {activeStore.name}
            </span>
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => activeStore && fetchCustomers(activeStore.id)}
          disabled={loading}
          className="gap-2 self-start sm:self-auto text-xs"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Members
        </Button>
      </div>

      {/* CRM Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <Card className="border border-border/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Enrolled Members
            </CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customers.length}</div>
            <p className="text-[11px] text-muted-foreground mt-0.5">Cardholders in this program</p>
          </CardContent>
        </Card>

        <Card className="border border-border/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Points Held
            </CardTitle>
            <Coins className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPointsBalance.toLocaleString()} pts</div>
            <p className="text-[11px] text-muted-foreground mt-0.5">Active customer wallet balances</p>
          </CardContent>
        </Card>

        <Card className="border border-border/60 sm:col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Avg Balance per Member
            </CardTitle>
            <Coins className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {customers.length > 0 ? Math.round(totalPointsBalance / customers.length).toLocaleString() : 0} pts
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">Per enrolled customer</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Members Card */}
      <Card className="border border-border/60 shadow-xs">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4">
          <div>
            <CardTitle className="text-lg">Members Directory</CardTitle>
            <CardDescription className="text-xs">
              Search and manage customer loyalty passes and collected points.
            </CardDescription>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0 sm:p-6 sm:pt-0">
          {loading && customers.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-sm text-muted-foreground gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              Loading member profiles...
            </div>
          ) : customers.length === 0 ? (
            <div className="text-center py-12 px-4 space-y-2">
              <Users className="h-10 w-10 text-muted-foreground/50 mx-auto" />
              <h3 className="font-semibold text-base">No loyalty members yet</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Customers will appear here when they scan your in-store QR stand card or join via your store link.
              </p>
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="text-center py-10 text-sm text-muted-foreground">
              No members found matching &quot;{searchQuery}&quot;.
            </div>
          ) : (
            <>
              {/* Desktop / Tablet Table View (hidden on mobile) */}
              <div className="hidden md:block rounded-md border border-border/60 overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/40">
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Points Balance</TableHead>
                      <TableHead className="text-right">Joined Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCustomers.map((customer) => (
                      <TableRow key={customer.customerId} className="hover:bg-muted/30 transition-colors">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8 border border-border/70">
                              <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                                {(customer.fullName || customer.email || 'U').charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium text-sm text-foreground">
                              {customer.fullName || 'Anonymous Customer'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm font-mono text-muted-foreground">
                          {customer.email}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 font-mono font-bold text-xs">
                            {customer.pointsBalance.toLocaleString()} pts
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right text-xs text-muted-foreground">
                          {format(new Date(customer.joinedAt), 'MMM d, yyyy')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card List View (hidden on desktop) */}
              <div className="md:hidden divide-y divide-border/60">
                {filteredCustomers.map((customer) => (
                  <div key={customer.customerId} className="p-4 flex items-center justify-between gap-3 hover:bg-muted/20 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar className="h-10 w-10 border border-border/70 shrink-0">
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                          {(customer.fullName || customer.email || 'U').charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-foreground truncate">
                          {customer.fullName || 'Anonymous Customer'}
                        </p>
                        <p className="text-xs text-muted-foreground font-mono truncate">
                          {customer.email}
                        </p>
                        <p className="text-[11px] text-muted-foreground/80 flex items-center gap-1 mt-0.5">
                          <Calendar className="h-3 w-3" />
                          Joined {format(new Date(customer.joinedAt), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>

                    <Badge className="bg-primary/10 text-primary border-primary/20 font-mono font-bold text-xs shrink-0 px-2.5 py-1">
                      {customer.pointsBalance.toLocaleString()} pts
                    </Badge>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
