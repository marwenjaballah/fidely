'use client'

import { useEffect } from 'react'
import { useMerchantStore } from '@/store/merchant-store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { format } from 'date-fns'

export default function CrmPage() {
  const { activeStore, fetchCustomers, customers, loading } = useMerchantStore()

  useEffect(() => {
    if (activeStore) {
      fetchCustomers(activeStore.id)
    }
  }, [activeStore, fetchCustomers])

  if (!activeStore) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <p className="text-muted-foreground">Please select a store or create one.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:gap-8 md:p-8 overflow-auto">
      <div>
        <h1 className="text-3xl font-bold">Customer CRM</h1>
        <p className="text-muted-foreground mt-1">
          Manage your loyalty members for {activeStore.name}
        </p>
      </div>

      <Card className="border border-border/60">
        <CardHeader>
          <CardTitle>Members</CardTitle>
          <CardDescription>
            A list of all customers who have joined your loyalty program.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading && customers.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">Loading members...</p>
          ) : customers.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">No members found yet.</p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Points Balance</TableHead>
                    <TableHead className="text-right">Joined Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.map((customer) => (
                    <TableRow key={customer.customerId}>
                      <TableCell className="font-medium">
                        {customer.fullName || 'Unknown'}
                      </TableCell>
                      <TableCell>{customer.email}</TableCell>
                      <TableCell className="font-bold text-primary">
                        {customer.pointsBalance} pts
                      </TableCell>
                      <TableCell className="text-right">
                        {format(new Date(customer.joinedAt), 'MMM d, yyyy')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
