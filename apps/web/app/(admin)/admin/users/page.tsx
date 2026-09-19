/**
 * @file app/(admin)/admin/users/page.tsx
 *
 * User Directory & Role Management for Super Admins.
 * Full parity with merchant UI:
 * - Role filter tabs (All, Super Admin, Merchant, Cashier, Customer) with live counts
 * - Instant search by name, email, phone
 * - Role promotion/demotion modal with safety explanations
 * - Detailed user profile & memberships inspector dialog
 * - High-polish table & mobile card layouts
 */

'use client'

import { useEffect, useState, useMemo } from 'react'
import {
  Users,
  Search,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Store,
  UserCheck,
  CreditCard,
  Calendar,
  MoreVertical,
  CheckCircle2,
  QrCode,
  X,
  Phone,
  Mail,
  User,
  Info,
  Shield,
  Smartphone,
  ExternalLink,
} from 'lucide-react'
import { useAdminStore, AdminUser } from '@/store/admin-store'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useToast } from '@/hooks/use-toast'
import { useI18n } from '@/lib/i18n'

export default function AdminUsersPage() {
  const { users, loading, fetchUsers, updateUserRole } = useAdminStore()
  const { toast } = useToast()
  const { t, dir } = useI18n()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('ALL')
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null)
  const [inspectingUser, setInspectingUser] = useState<AdminUser | null>(null)
  const [newRole, setNewRole] = useState<string>('')
  const [isUpdating, setIsUpdating] = useState(false)

  const roleOptions = [
    {
      value: 'SUPER_ADMIN',
      label: t('admin_badge_super_admin'),
      description: 'Unrestricted root access to all platform stores, users, and audit logs.',
      icon: ShieldAlert,
    },
    {
      value: 'MERCHANT',
      label: t('auth_signup_role_merchant'),
      description: 'Access to store customization, loyalty rewards, staff management, and CRM.',
      icon: Store,
    },
    {
      value: 'CASHIER',
      label: t('staff_role_cashier'),
      description: 'Access to the high-speed live counter POS scanner and points validation.',
      icon: Smartphone,
    },
    {
      value: 'USER',
      label: t('auth_signup_role_customer'),
      description: 'Standard consumer account for collecting points and redeeming rewards.',
      icon: User,
    },
  ]

  useEffect(() => {
    fetchUsers(searchQuery, selectedRoleFilter)
  }, [fetchUsers, selectedRoleFilter])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    fetchUsers(searchQuery, selectedRoleFilter)
  }

  const handleOpenRoleModal = (user: AdminUser) => {
    setEditingUser(user)
    setNewRole(user.role)
  }

  const handleSaveRole = async () => {
    if (!editingUser || !newRole) return
    setIsUpdating(true)
    try {
      await updateUserRole(editingUser.id, newRole)
      toast({
        title: 'Role Updated',
        description: `Changed role for ${editingUser.email} to ${newRole}.`,
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

  // Count metrics
  const counts = useMemo(() => {
    return {
      total: users.length,
      superAdmins: users.filter((u) => u.role === 'SUPER_ADMIN').length,
      merchants: users.filter((u) => u.role === 'MERCHANT').length,
      cashiers: users.filter((u) => u.role === 'CASHIER').length,
      customers: users.filter((u) => u.role === 'USER' || !u.role).length,
    }
  }, [users])

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return (
          <Badge className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs gap-1 py-0.5">
            <ShieldCheck className="w-3 h-3" />
            {t('admin_badge_super_admin')}
          </Badge>
        )
      case 'MERCHANT':
        return (
          <Badge className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs gap-1 py-0.5">
            <Store className="w-3 h-3" />
            {t('auth_signup_role_merchant')}
          </Badge>
        )
      case 'CASHIER':
        return (
          <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1 py-0.5">
            <Smartphone className="w-3 h-3" />
            {t('staff_role_cashier')}
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="text-muted-foreground font-semibold text-xs gap-1 py-0.5">
            <User className="w-3 h-3" />
            {t('auth_signup_role_customer')}
          </Badge>
        )
    }
  }

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl" dir={dir}>
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-2 border-b border-border/40">
        <div className="text-start space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
            {t('admin_nav_users')}
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm">
            {t('admin_nav_users_desc')}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchUsers(searchQuery, selectedRoleFilter)}
          disabled={loading}
          className="gap-2 rounded-xl h-9 text-xs font-semibold shadow-2xs hover:bg-muted/80 self-start sm:self-auto"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>{t('refresh')}</span>
        </Button>
      </div>

      {/* Role Filter Pills / Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'ALL', label: t('all'), count: counts.total },
          { id: 'SUPER_ADMIN', label: t('admin_badge_super_admin'), count: counts.superAdmins },
          { id: 'MERCHANT', label: t('auth_signup_role_merchant'), count: counts.merchants },
          { id: 'CASHIER', label: t('staff_role_cashier'), count: counts.cashiers },
          { id: 'USER', label: t('auth_signup_role_customer'), count: counts.customers },
        ].map((tab) => {
          const isActive = selectedRoleFilter === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedRoleFilter(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
                isActive
                  ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                  : 'bg-card text-muted-foreground border-border/60 hover:text-foreground hover:bg-muted/50'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  isActive ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}
              >
                {tab.count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Search Input */}
      <form onSubmit={handleSearchSubmit} className="relative max-w-md">
        <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, email, or phone..."
          className="ps-9 pe-9 rounded-xl h-10 border-border/60 focus-visible:ring-primary/20"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => {
              setSearchQuery('')
              fetchUsers('', selectedRoleFilter)
            }}
            className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </form>

      {/* Users Table & Mobile Cards */}
      <Card className="border border-border/60 rounded-2xl overflow-hidden shadow-2xs">
        <CardContent className="p-0">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[280px] text-start font-bold text-xs uppercase tracking-wider">{t('crm_col_customer')}</TableHead>
                  <TableHead className="text-start font-bold text-xs uppercase tracking-wider">{t('staff_col_role')}</TableHead>
                  <TableHead className="text-start font-bold text-xs uppercase tracking-wider">Acquisition Channel</TableHead>
                  <TableHead className="text-start font-bold text-xs uppercase tracking-wider">Affiliations</TableHead>
                  <TableHead className="text-start font-bold text-xs uppercase tracking-wider">{t('crm_col_joined_date')}</TableHead>
                  <TableHead className="text-end font-bold text-xs uppercase tracking-wider">{t('actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-40 text-center text-muted-foreground text-xs">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <RefreshCw className="h-5 w-5 animate-spin text-primary" />
                        <span>{t('crm_loading_profiles')}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-40 text-center text-muted-foreground text-xs">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Users className="h-8 w-8 text-muted-foreground/40" />
                        <span>{t('crm_no_members_title')}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="text-start py-3.5">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 rounded-xl border border-primary/20 bg-primary/10 text-primary shrink-0">
                            <AvatarFallback className="rounded-xl font-bold text-xs bg-primary/10 text-primary">
                              {user.email.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 text-start">
                            <p className="font-bold text-sm text-foreground truncate">
                              {user.fullName || t('crm_anonymous_customer')}
                            </p>
                            <p className="text-xs text-muted-foreground font-mono truncate" dir="ltr">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="text-start py-3.5">
                        {getRoleBadge(user.role)}
                      </TableCell>

                      <TableCell className="text-start py-3.5">
                        {user.referredByStore ? (
                          <Badge
                            variant="outline"
                            className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 gap-1 text-[11px] font-semibold"
                          >
                            <QrCode className="w-3 h-3" />
                            {user.referredByStore.name} QR
                          </Badge>
                        ) : user.memberships && user.memberships.some((m) => m.joinSource === 'STORE_QR') ? (
                          <Badge
                            variant="outline"
                            className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30 gap-1 text-[11px] font-semibold"
                          >
                            <QrCode className="w-3 h-3" />
                            Store QR Stand
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground font-medium">{t('admin_direct_organic')}</span>
                        )}
                      </TableCell>

                      <TableCell className="text-start py-3.5">
                        <div className="flex items-center gap-1.5 text-xs flex-wrap">
                          {user.stores && user.stores.length > 0 && (
                            <Badge variant="secondary" className="gap-1 py-0.5 text-xs" dir="ltr" title="Stores Owned">
                              <Store className="h-3 w-3 text-blue-500" />
                              {user.stores.length} store{user.stores.length > 1 ? 's' : ''}
                            </Badge>
                          )}
                          {user.cashierStores && user.cashierStores.length > 0 && (
                            <Badge variant="secondary" className="gap-1 py-0.5 text-xs" dir="ltr" title="Cashier Outlets">
                              <UserCheck className="h-3 w-3 text-emerald-500" />
                              POS ({user.cashierStores.length})
                            </Badge>
                          )}
                          {user.membershipsCount > 0 && (
                            <Badge variant="secondary" className="gap-1 py-0.5 text-xs" dir="ltr" title="Joined Memberships">
                              <CreditCard className="h-3 w-3 text-purple-500" />
                              {user.membershipsCount} passes
                            </Badge>
                          )}
                          {!user.stores?.length && !user.cashierStores?.length && !user.membershipsCount && (
                            <span className="text-xs text-muted-foreground italic">None</span>
                          )}
                        </div>
                      </TableCell>

                      <TableCell className="text-xs text-muted-foreground text-start py-3.5">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground/70 shrink-0" />
                          <span>
                            {new Date(user.createdAt).toLocaleDateString(undefined, {
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
                            onClick={() => setInspectingUser(user)}
                            className="h-8 px-2.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
                          >
                            <Info className="h-3.5 w-3.5 me-1" />
                            Details
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenRoleModal(user)}
                            className="h-8 px-2.5 text-xs font-semibold"
                          >
                            <Shield className="h-3.5 w-3.5 me-1" />
                            Role
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Cards View */}
          <div className="md:hidden divide-y divide-border/60">
            {loading && users.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                <RefreshCw className="h-5 w-5 animate-spin text-primary mx-auto mb-2" />
                <span>{t('crm_loading_profiles')}</span>
              </div>
            ) : users.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                <Users className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                <span>{t('crm_no_members_title')}</span>
              </div>
            ) : (
              users.map((user) => (
                <div key={user.id} className="p-4 space-y-3 hover:bg-muted/20 transition-colors text-start">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar className="h-10 w-10 rounded-xl border border-primary/20 bg-primary/10 text-primary shrink-0">
                        <AvatarFallback className="rounded-xl font-bold text-xs bg-primary/10 text-primary">
                          {user.email.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-bold text-sm text-foreground truncate">
                          {user.fullName || t('crm_anonymous_customer')}
                        </p>
                        <p className="text-xs text-muted-foreground font-mono truncate" dir="ltr">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    {getRoleBadge(user.role)}
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/40">
                    <span>Joined: {new Date(user.createdAt).toLocaleDateString()}</span>
                    <span>{user.membershipsCount} passes</span>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setInspectingUser(user)}
                      className="flex-1 h-8 text-xs font-semibold"
                    >
                      <Info className="h-3.5 w-3.5 me-1" />
                      Details
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleOpenRoleModal(user)}
                      className="flex-1 h-8 text-xs font-semibold"
                    >
                      <Shield className="h-3.5 w-3.5 me-1" />
                      Edit Role
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Role Modification Dialog */}
      {editingUser && (
        <Dialog open={Boolean(editingUser)} onOpenChange={(open) => !open && setEditingUser(null)}>
          <DialogContent className="sm:max-w-md rounded-2xl" dir={dir}>
            <DialogHeader className="text-start">
              <DialogTitle className="flex items-center gap-2 text-base font-bold">
                <Shield className="h-4 w-4 text-primary" />
                Change User Role
              </DialogTitle>
              <DialogDescription className="text-xs">
                Update account authority for <span className="font-semibold text-foreground font-mono" dir="ltr">{editingUser.email}</span>.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-3 text-start">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Select New Role
                </label>
                <Select value={newRole} onValueChange={(v) => setNewRole(v)} dir={dir}>
                  <SelectTrigger className="w-full rounded-xl h-11 text-xs font-semibold">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent dir={dir}>
                    {roleOptions.map((opt) => {
                      const Icon = opt.icon
                      return (
                        <SelectItem key={opt.value} value={opt.value}>
                          <div className="flex items-center gap-2">
                            <Icon className="h-3.5 w-3.5 text-primary" />
                            <span>{opt.label}</span>
                          </div>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>

              {/* Role explanation */}
              {newRole && (
                <div className="p-3.5 rounded-xl border border-border/60 bg-muted/30 space-y-1 text-xs">
                  <span className="font-bold text-foreground block">
                    {roleOptions.find((r) => r.value === newRole)?.label} Permissions
                  </span>
                  <p className="text-muted-foreground leading-relaxed text-[11px]">
                    {roleOptions.find((r) => r.value === newRole)?.description}
                  </p>
                </div>
              )}
            </div>

            <DialogFooter className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditingUser(null)}
                className="rounded-xl"
              >
                {t('cancel')}
              </Button>
              <Button
                size="sm"
                onClick={handleSaveRole}
                disabled={isUpdating || newRole === editingUser.role}
                className="rounded-xl gap-1.5"
              >
                {isUpdating && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                {t('save')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* User Details Inspector Modal */}
      {inspectingUser && (
        <Dialog open={Boolean(inspectingUser)} onOpenChange={(open) => !open && setInspectingUser(null)}>
          <DialogContent className="sm:max-w-md rounded-2xl" dir={dir}>
            <DialogHeader className="text-start">
              <div className="flex items-center gap-3 mb-1">
                <Avatar className="h-12 w-12 rounded-xl border border-primary/20 bg-primary/10 text-primary">
                  <AvatarFallback className="font-bold text-sm bg-primary/10 text-primary">
                    {inspectingUser.email.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <DialogTitle className="text-base font-bold text-foreground">
                    {inspectingUser.fullName || t('crm_anonymous_customer')}
                  </DialogTitle>
                  <DialogDescription className="text-xs font-mono" dir="ltr">
                    {inspectingUser.email}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-3 py-2 text-start text-xs">
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 rounded-xl border border-border/60 bg-card space-y-1">
                  <span className="text-muted-foreground text-[10px] block">Current Role</span>
                  {getRoleBadge(inspectingUser.role)}
                </div>
                <div className="p-3 rounded-xl border border-border/60 bg-card space-y-1">
                  <span className="text-muted-foreground text-[10px] block">Joined Date</span>
                  <span className="font-semibold text-foreground">
                    {new Date(inspectingUser.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Owned Stores */}
              {inspectingUser.stores && inspectingUser.stores.length > 0 && (
                <div className="p-3.5 rounded-xl border border-border/60 bg-muted/20 space-y-2">
                  <span className="font-bold text-xs text-foreground uppercase tracking-wider block">
                    Merchant Stores ({inspectingUser.stores.length})
                  </span>
                  <div className="space-y-1.5">
                    {inspectingUser.stores.map((st) => (
                      <div key={st.id} className="flex justify-between items-center text-xs">
                        <span className="font-medium text-foreground">{st.name}</span>
                        <span className="text-muted-foreground font-mono text-[11px]" dir="ltr">/{st.slug}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cashier Outlets */}
              {inspectingUser.cashierStores && inspectingUser.cashierStores.length > 0 && (
                <div className="p-3.5 rounded-xl border border-border/60 bg-muted/20 space-y-2">
                  <span className="font-bold text-xs text-foreground uppercase tracking-wider block">
                    Assigned Cashier Outlets ({inspectingUser.cashierStores.length})
                  </span>
                  <div className="space-y-1.5">
                    {inspectingUser.cashierStores.map((st) => (
                      <div key={st.id} className="flex justify-between items-center text-xs">
                        <span className="font-medium text-foreground">{st.name}</span>
                        <Badge variant="outline" className="text-[10px]">POS Terminal</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Memberships */}
              {inspectingUser.memberships && inspectingUser.memberships.length > 0 && (
                <div className="p-3.5 rounded-xl border border-border/60 bg-muted/20 space-y-2">
                  <span className="font-bold text-xs text-foreground uppercase tracking-wider block">
                    Enrolled Loyalty Cards ({inspectingUser.memberships.length})
                  </span>
                  <div className="space-y-1.5">
                    {inspectingUser.memberships.map((m) => (
                      <div key={m.id} className="flex justify-between items-center text-xs">
                        <span className="font-medium text-foreground">{m.store.name}</span>
                        <Badge variant="secondary" className="text-[10px]">
                          {m.joinSource === 'STORE_QR' ? 'QR Stand' : 'Direct'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
