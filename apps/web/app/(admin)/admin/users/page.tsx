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
  QrCode,
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

import { useI18n } from '@/lib/i18n'

export default function AdminUsersPage() {
  const { users, loading, fetchUsers, updateUserRole } = useAdminStore()
  const { toast } = useToast()
  const { t, dir } = useI18n()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('ALL')
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null)
  const [newRole, setNewRole] = useState<string>('')
  const [isUpdating, setIsUpdating] = useState(false)

  const roleOptions = [
    { value: 'SUPER_ADMIN', label: t('admin_badge_super_admin'), description: t('admin_restricted_desc') },
    { value: 'MERCHANT', label: t('auth_signup_role_merchant'), description: t('auth_signup_role_merchant_desc') },
    { value: 'CASHIER', label: t('auth_signup_perk_pos'), description: t('staff_authorized_desc') },
    { value: 'USER', label: t('auth_signup_role_customer'), description: t('auth_signup_role_customer_desc') },
  ]

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
            {t('admin_badge_super_admin')}
          </Badge>
        )
      case 'MERCHANT':
        return (
          <Badge className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs">
            {t('auth_signup_role_merchant')}
          </Badge>
        )
      case 'CASHIER':
        return (
          <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs">
            {t('staff_role_cashier')}
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="text-muted-foreground font-medium text-xs">
            {t('auth_signup_role_customer')}
          </Badge>
        )
    }
  }

  return (
    <div className="space-y-6" dir={dir}>
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-start">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{t('admin_nav_users')}</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {t('admin_nav_users_desc')}
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
          {t('refresh')}
        </Button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <form onSubmit={handleSearch} className="relative flex-1 w-full max-w-md">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('search')}
            className="ps-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>

        <div className="w-full sm:w-auto">
          <Select
            value={selectedRoleFilter}
            onValueChange={(val) => setSelectedRoleFilter(val)}
            dir={dir}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder={t('filter')} />
            </SelectTrigger>
            <SelectContent dir={dir}>
              <SelectItem value="ALL">{t('all')}</SelectItem>
              <SelectItem value="SUPER_ADMIN">{t('admin_badge_super_admin')}</SelectItem>
              <SelectItem value="MERCHANT">{t('auth_signup_role_merchant')}</SelectItem>
              <SelectItem value="CASHIER">{t('staff_role_cashier')}</SelectItem>
              <SelectItem value="USER">{t('auth_signup_role_customer')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Users Table */}
      <Card className="border border-border/60">
        <CardContent className="p-0">
          {/* Desktop Table View */}
          <div className="hidden md:block rounded-md overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[260px] text-start">{t('crm_col_customer')}</TableHead>
                  <TableHead className="text-start">{t('staff_col_role')}</TableHead>
                  <TableHead className="text-start">{t('admin_qr_stands_title')}</TableHead>
                  <TableHead className="text-start">{t('dashboard_navigation')}</TableHead>
                  <TableHead className="text-start">{t('crm_col_joined_date')}</TableHead>
                  <TableHead className="text-end">{t('actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                      {t('crm_loading_profiles')}
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                      {t('crm_no_members_title')}
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id} className="hover:bg-muted/40 transition-colors">
                      <TableCell className="text-start">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary text-xs shrink-0">
                            {user.email.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0 text-start">
                            <p className="font-semibold text-sm text-foreground truncate">
                              {user.fullName || t('crm_anonymous_customer')}
                            </p>
                            <p className="text-xs text-muted-foreground font-mono truncate" dir="ltr">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-start">{getRoleBadge(user.role)}</TableCell>
                      <TableCell className="text-start">
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
                      <TableCell className="text-start">
                        <div className="flex items-center gap-2 text-xs">
                          {user.stores && user.stores.length > 0 && (
                            <Badge variant="secondary" className="gap-1 py-0.5" dir="ltr">
                              <Store className="h-3 w-3 text-blue-500" />
                              {user.stores.length} Owned
                            </Badge>
                          )}
                          {user.cashierStores && user.cashierStores.length > 0 && (
                            <Badge variant="secondary" className="gap-1 py-0.5" dir="ltr">
                              <UserCheck className="h-3 w-3 text-emerald-500" />
                              Staff in {user.cashierStores.length}
                            </Badge>
                          )}
                          {user.membershipsCount > 0 && (
                            <Badge variant="secondary" className="gap-1 py-0.5" dir="ltr">
                              <CreditCard className="h-3 w-3 text-amber-500" />
                              {user.membershipsCount} Cards
                            </Badge>
                          )}
                          {(!user.stores || user.stores.length === 0) &&
                            (!user.cashierStores || user.cashierStores.length === 0) &&
                            user.membershipsCount === 0 && (
                              <span className="text-muted-foreground italic text-xs">None</span>
                            )}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground text-start">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground/70" />
                          <span>
                            {new Date(user.createdAt).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingUser(user)
                            setNewRole(user.role)
                          }}
                          className="text-xs h-8"
                        >
                          {t('edit')}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card List View */}
          <div className="md:hidden divide-y divide-border/60">
            {loading && users.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                {t('crm_loading_profiles')}
              </div>
            ) : users.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                {t('crm_no_members_title')}
              </div>
            ) : (
              users.map((user) => (
                <div key={user.id} className="p-4 space-y-3 hover:bg-muted/20 transition-colors text-start">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary text-xs shrink-0">
                        {user.email.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0 text-start">
                        <p className="font-semibold text-sm text-foreground truncate">
                          {user.fullName || t('crm_anonymous_customer')}
                        </p>
                        <p className="text-xs text-muted-foreground font-mono truncate" dir="ltr">{user.email}</p>
                      </div>
                    </div>
                    {getRoleBadge(user.role)}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-border/40 text-xs">
                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(user.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingUser(user)
                        setNewRole(user.role)
                      }}
                      className="text-xs h-7 px-2.5"
                    >
                      {t('edit')}
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Role Changer Dialog */}
      <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
        <DialogContent className="sm:max-w-[440px]" dir={dir}>
          <DialogHeader className="text-start">
            <DialogTitle>{t('staff_action_edit')}</DialogTitle>
            <DialogDescription>
              {t('staff_dialog_edit_desc', { email: editingUser?.email || '' })}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4 text-start">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('auth_role_label')}</label>
              <Select value={newRole} onValueChange={(val) => setNewRole(val)} dir={dir}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t('filter')} />
                </SelectTrigger>
                <SelectContent dir={dir}>
                  {roleOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <div className="py-0.5 text-start">
                        <p className="font-semibold text-sm">{opt.label}</p>
                        <p className="text-[11px] text-muted-foreground">{opt.description}</p>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {newRole === 'SUPER_ADMIN' && (
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 flex gap-2.5 items-start text-xs text-amber-700 dark:text-amber-400 text-start">
                <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                <span>
                  {t('admin_restricted_desc')}
                </span>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setEditingUser(null)} disabled={isUpdating}>
              {t('cancel')}
            </Button>
            <Button onClick={handleSaveRole} disabled={isUpdating || newRole === editingUser?.role}>
              {isUpdating ? t('saving') : t('save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

