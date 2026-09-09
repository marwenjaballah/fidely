'use client'

import { useEffect, useState } from 'react'
import {
  Users,
  Search,
  RefreshCw,
  ShieldAlert,
  Store,
  UserCheck,
  CreditCard,
  Calendar,
  MoreVertical,
  CheckCircle2,
} from 'lucide-react'
import { useAdminStore, AdminUser } from '@/store/admin-store'
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { useToast } from '@/hooks/use-toast'

const ROLE_OPTIONS = [
  { value: 'SUPER_ADMIN', label: 'Super Admin', description: 'Unrestricted system and platform access' },
  { value: 'MERCHANT', label: 'Merchant / Owner', description: 'Owns and manages stores, analytics, cashiers' },
  { value: 'CASHIER', label: 'Cashier / Staff', description: 'POS scanner & point awarding operator' },
  { value: 'USER', label: 'Customer / User', description: 'Cardholder and loyalty participant' },
]

export default function AdminUsersPage() {
  const { users, loading, fetchUsers, updateUserRole } = useAdminStore()
  const { toast } = useToast()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('ALL')
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null)
  const [newRole, setNewRole] = useState<string>('')
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    fetchUsers(searchQuery, selectedRoleFilter)
  }, [fetchUsers, selectedRoleFilter])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchUsers(searchQuery, selectedRoleFilter)
  }

  const handleSaveRole = async () => {
    if (!editingUser || !newRole) return
    setIsUpdating(true)
    try {
      await updateUserRole(editingUser.id, newRole)
      toast({
        title: 'Role Updated',
        description: `Successfully changed role for ${editingUser.email} to ${newRole}.`,
      })
      setEditingUser(null)
    } catch (err: any) {
      toast({
        title: 'Update Failed',
        description: err.message || 'Could not update user role.',
        variant: 'destructive',
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return (
          <Badge className="bg-purple-600 hover:bg-purple-700 text-white font-medium text-xs">
            SUPER ADMIN
          </Badge>
        )
      case 'MERCHANT':
        return (
          <Badge className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs">
            MERCHANT
          </Badge>
        )
      case 'CASHIER':
        return (
          <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs">
            CASHIER
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="text-muted-foreground font-medium text-xs">
            CUSTOMER
          </Badge>
        )
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Browse accounts, audit account types, and grant administrative access across the platform.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchUsers(searchQuery, selectedRoleFilter)}
          disabled={loading}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <form onSubmit={handleSearch} className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by email or name..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>

        <div className="w-full sm:w-auto">
          <Select
            value={selectedRoleFilter}
            onValueChange={(val) => setSelectedRoleFilter(val)}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Roles</SelectItem>
              <SelectItem value="SUPER_ADMIN">Super Admins</SelectItem>
              <SelectItem value="MERCHANT">Merchants</SelectItem>
              <SelectItem value="CASHIER">Cashiers</SelectItem>
              <SelectItem value="USER">Customers</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Users Table */}
      <Card className="border border-border/60">
        <CardContent className="p-0">
          <div className="rounded-md overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[280px]">User Account</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Entities & Affiliations</TableHead>
                  <TableHead>Registered</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                      Loading users list...
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                      No users found.
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id} className="hover:bg-muted/40 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary text-xs shrink-0">
                            {user.email.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-sm text-foreground truncate">
                              {user.fullName || 'No Name Set'}
                            </p>
                            <p className="text-xs text-muted-foreground font-mono truncate">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-xs">
                          {user.ownedStoresCount > 0 && (
                            <Badge variant="secondary" className="gap-1 py-0.5">
                              <Store className="h-3 w-3 text-blue-500" />
                              {user.ownedStoresCount} Owned
                            </Badge>
                          )}
                          {user.staffStoreCount > 0 && (
                            <Badge variant="secondary" className="gap-1 py-0.5">
                              <UserCheck className="h-3 w-3 text-emerald-500" />
                              Staff in {user.staffStoreCount}
                            </Badge>
                          )}
                          {user.storeMembershipsCount > 0 && (
                            <Badge variant="secondary" className="gap-1 py-0.5">
                              <CreditCard className="h-3 w-3 text-amber-500" />
                              {user.storeMembershipsCount} Cards
                            </Badge>
                          )}
                          {user.ownedStoresCount === 0 &&
                            user.staffStoreCount === 0 &&
                            user.storeMembershipsCount === 0 && (
                              <span className="text-muted-foreground italic text-xs">None</span>
                            )}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground/70" />
                          {new Date(user.createdAt).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingUser(user)
                            setNewRole(user.role)
                          }}
                          className="text-xs h-8"
                        >
                          Modify Role
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Role Changer Dialog */}
      <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle>Update User Role</DialogTitle>
            <DialogDescription>
              Assign new system permissions for <span className="font-semibold text-foreground">{editingUser?.email}</span>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Role</label>
              <Select value={newRole} onValueChange={(val) => setNewRole(val)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose a role" />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <div className="py-0.5">
                        <p className="font-semibold text-sm">{opt.label}</p>
                        <p className="text-[11px] text-muted-foreground">{opt.description}</p>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {newRole === 'SUPER_ADMIN' && (
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 flex gap-2.5 items-start text-xs text-amber-700 dark:text-amber-400">
                <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                <span>
                  Super Admins have root access across all merchant stores, audit logs, and user roles.
                </span>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUser(null)} disabled={isUpdating}>
              Cancel
            </Button>
            <Button onClick={handleSaveRole} disabled={isUpdating || newRole === editingUser?.role}>
              {isUpdating ? 'Saving...' : 'Apply Role Change'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
