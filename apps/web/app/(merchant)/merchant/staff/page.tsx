'use client'

import { useEffect, useState } from 'react'
import { useMerchantStore, type Staff } from '@/store/merchant-store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'
import {
  Plus,
  Key,
  Edit,
  Trash2,
  MoreVertical,
  Copy,
  Check,
  Eye,
  EyeOff,
  Sparkles,
  Search,
  ShieldCheck,
  AlertTriangle,
  Loader2,
  Store,
  Users,
} from 'lucide-react'
import { useI18n } from '@/lib/i18n'

export default function StaffPage() {
  const {
    activeStore,
    fetchStaff,
    staff,
    availableStaff,
    fetchAvailableStaff,
    createStaff,
    assignExistingStaff,
    updateStaff,
    changeStaffPassword,
    deleteStaff,
    loading,
  } = useMerchantStore()
  const { toast } = useToast()
  const { t } = useI18n()

  // Search filter
  const [searchQuery, setSearchQuery] = useState('')

  // Dialog States
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [addTab, setAddTab] = useState<'new' | 'existing'>('new')
  const [existingSearchQuery, setExistingSearchQuery] = useState('')
  const [assigningStaffId, setAssigningStaffId] = useState<string | null>(null)
  const [editTarget, setEditTarget] = useState<Staff | null>(null)
  const [passwordTarget, setPasswordTarget] = useState<Staff | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Staff | null>(null)

  // Form States - Add
  const [addFullName, setAddFullName] = useState('')
  const [addEmail, setAddEmail] = useState('')
  const [addPassword, setAddPassword] = useState('')
  const [addPhone, setAddPhone] = useState('')
  const [showAddPassword, setShowAddPassword] = useState(false)

  // Form States - Edit
  const [editFullName, setEditFullName] = useState('')
  const [editPhone, setEditPhone] = useState('')

  // Form States - Change Password
  const [newPassword, setNewPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)

  // Action status / feedback
  const [actionLoading, setActionLoading] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    if (activeStore) {
      fetchStaff(activeStore.id)
      fetchAvailableStaff(activeStore.id)
    }
  }, [activeStore, fetchStaff, fetchAvailableStaff])

  const handleOpenAddModal = (tab: 'new' | 'existing' = 'new') => {
    setAddTab(tab)
    setActionError(null)
    setExistingSearchQuery('')
    setIsAddOpen(true)
    if (activeStore) {
      fetchAvailableStaff(activeStore.id)
    }
  }

  const filteredAvailableStaff = availableStaff.filter((s) => {
    if (!existingSearchQuery.trim()) return true
    const q = existingSearchQuery.toLowerCase()
    return (
      (s.fullName && s.fullName.toLowerCase().includes(q)) ||
      s.email.toLowerCase().includes(q) ||
      (s.phone && s.phone.toLowerCase().includes(q)) ||
      s.assignedStores.some((store) => store.name.toLowerCase().includes(q))
    )
  })

  const handleAssignExisting = async (staffId: string, staffName: string) => {
    if (!activeStore) return
    setAssigningStaffId(staffId)
    setActionError(null)

    try {
      await assignExistingStaff(activeStore.id, staffId)
      toast({
        title: t('staff_toast_assigned'),
        description: t('staff_toast_assigned_desc', { name: staffName, storeName: activeStore.name }),
      })
      setIsAddOpen(false)
    } catch (err: any) {
      setActionError(err.message || t('auth_generic_error'))
      toast({
        title: t('auth_generic_error'),
        description: err.message || 'Could not assign cashier.',
        variant: 'destructive',
      })
    } finally {
      setAssigningStaffId(null)
    }
  }

  const generateStrongPassword = () => {
    const chars = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%&*'
    let pass = ''
    for (let i = 0; i < 10; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return pass
  }

  // Handle Add Cashier
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeStore) return
    setActionLoading(true)
    setActionError(null)

    try {
      await createStaff(activeStore.id, {
        fullName: addFullName.trim(),
        email: addEmail.trim(),
        password: addPassword || undefined,
        phone: addPhone.trim() || undefined,
      })
      toast({
        title: t('staff_toast_created'),
        description: t('staff_toast_created_desc', { name: addFullName.trim() || addEmail.trim() }),
      })
      setIsAddOpen(false)
      setAddFullName('')
      setAddEmail('')
      setAddPassword('')
      setAddPhone('')
    } catch (err: any) {
      setActionError(err.message || t('auth_generic_error'))
      toast({
        title: t('auth_generic_error'),
        description: err.message || 'An error occurred.',
        variant: 'destructive',
      })
    } finally {
      setActionLoading(false)
    }
  }

  // Handle Edit Cashier
  const handleEditOpen = (member: Staff) => {
    setEditTarget(member)
    setEditFullName(member.fullName || '')
    setEditPhone(member.phone || '')
    setActionError(null)
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeStore || !editTarget) return
    setActionLoading(true)
    setActionError(null)

    try {
      await updateStaff(activeStore.id, editTarget.id, {
        fullName: editFullName.trim(),
        phone: editPhone.trim() || undefined,
      })
      toast({
        title: t('staff_toast_updated'),
        description: t('staff_toast_updated_desc', { name: editFullName.trim() }),
      })
      setEditTarget(null)
    } catch (err: any) {
      setActionError(err.message || t('auth_generic_error'))
      toast({
        title: t('auth_generic_error'),
        description: err.message || 'Could not save cashier profile.',
        variant: 'destructive',
      })
    } finally {
      setActionLoading(false)
    }
  }

  // Handle Change Password
  const handlePasswordOpen = (member: Staff) => {
    setPasswordTarget(member)
    setNewPassword('')
    setShowNewPassword(false)
    setActionError(null)
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeStore || !passwordTarget) return
    if (newPassword.length < 6) {
      setActionError(t('auth_password_min_length'))
      return
    }
    setActionLoading(true)
    setActionError(null)

    try {
      await changeStaffPassword(activeStore.id, passwordTarget.id, newPassword)
      toast({
        title: t('staff_toast_pwd_updated'),
        description: t('staff_toast_pwd_desc', { name: passwordTarget.fullName || passwordTarget.email }),
      })
      setPasswordTarget(null)
      setNewPassword('')
    } catch (err: any) {
      setActionError(err.message || t('auth_generic_error'))
      toast({
        title: t('auth_generic_error'),
        description: err.message || 'Could not update cashier password.',
        variant: 'destructive',
      })
    } finally {
      setActionLoading(false)
    }
  }

  // Handle Delete Cashier
  const handleDeleteSubmit = async () => {
    if (!activeStore || !deleteTarget) return
    setActionLoading(true)
    setActionError(null)

    try {
      const removedName = deleteTarget.fullName || deleteTarget.email
      await deleteStaff(activeStore.id, deleteTarget.id)
      toast({
        title: t('staff_toast_removed'),
        description: t('staff_toast_removed_desc', { name: removedName, storeName: activeStore.name }),
      })
      setDeleteTarget(null)
    } catch (err: any) {
      setActionError(err.message || t('auth_generic_error'))
      toast({
        title: t('auth_generic_error'),
        description: err.message || 'Could not remove cashier.',
        variant: 'destructive',
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handleCopyEmail = (email: string, id: string) => {
    navigator.clipboard.writeText(email)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  if (!activeStore) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <p className="text-muted-foreground">{t('customizer_no_active_store_desc')}</p>
      </div>
    )
  }

  const filteredStaff = staff.filter((member) => {
    const query = searchQuery.toLowerCase()
    return (
      (member.fullName && member.fullName.toLowerCase().includes(query)) ||
      member.email.toLowerCase().includes(query)
    )
  })

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:gap-8 md:p-8 overflow-auto">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('staff_title')}</h1>
          <p className="text-muted-foreground mt-1 flex items-center gap-2">
            <span>{t('staff_subtitle')}</span>
            <span className="font-semibold text-foreground flex items-center gap-1 bg-primary/10 text-primary px-2 py-0.5 rounded-md text-xs">
              <Store className="h-3 w-3" />
              {activeStore.name}
            </span>
          </p>
        </div>
        <Button onClick={() => handleOpenAddModal()} className="gap-2">
          <Plus className="h-4 w-4" /> {t('staff_add_cashier_btn')}
        </Button>
      </div>

      {/* Main Table Card */}
      <Card className="border border-border/60 shadow-xs">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4">
          <div>
            <CardTitle className="text-lg">{t('staff_authorized_title')}</CardTitle>
            <CardDescription>
              {t('staff_authorized_desc')}
            </CardDescription>
          </div>
          {staff.length > 0 && (
            <div className="relative w-full sm:w-64">
              <Search className="absolute start-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('staff_search_cashiers')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="ps-9 pe-3 h-9"
              />
            </div>
          )}
        </CardHeader>
        <CardContent>
          {loading && staff.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-sm text-muted-foreground gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              {t('staff_loading_team')}
            </div>
          ) : staff.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-base mb-1">{t('staff_empty_title')}</h3>
              <p className="text-sm text-muted-foreground max-w-sm mb-4">
                {t('staff_empty_desc')}
              </p>
              <Button onClick={() => handleOpenAddModal()} variant="outline" className="gap-2">
                <Plus className="h-4 w-4" /> {t('staff_add_first')}
              </Button>
            </div>
          ) : filteredStaff.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              {t('staff_no_results')}
            </p>
          ) : (
            <>
              {/* Desktop / Tablet Table View (hidden on mobile) */}
              <div className="hidden md:block rounded-md border border-border/60 overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/40">
                    <TableRow>
                      <TableHead>{t('staff_col_cashier')}</TableHead>
                      <TableHead>{t('staff_col_email_contact')}</TableHead>
                      <TableHead>{t('staff_col_role')}</TableHead>
                      <TableHead>{t('staff_col_added_on')}</TableHead>
                      <TableHead className="text-end">{t('staff_col_actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStaff.map((cashier) => (
                      <TableRow key={cashier.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9 border border-border/70">
                              <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                                {(cashier.fullName || cashier.email).charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="font-medium text-foreground">
                              {cashier.fullName || t('staff_unnamed')}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground font-mono">
                              {cashier.email}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopyEmail(cashier.email, cashier.id)}
                              title={t('staff_copy_email_title')}
                              className="text-muted-foreground hover:text-foreground transition-colors"
                            >
                              {copiedId === cashier.id ? (
                                <Check className="h-3.5 w-3.5 text-primary" />
                              ) : (
                                <Copy className="h-3.5 w-3.5" />
                              )}
                            </button>
                          </div>
                          {cashier.phone && (
                            <div className="text-xs text-muted-foreground/70 mt-0.5">
                              {cashier.phone}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs">
                            {t('staff_role_cashier')}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(cashier.createdAt), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell className="text-end">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                                <span className="sr-only">{t('staff_menu_title')}</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuLabel className="text-xs">{t('staff_menu_title')}</DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() => handleEditOpen(cashier)}
                                className="cursor-pointer gap-2"
                              >
                                <Edit className="h-4 w-4 text-muted-foreground" />
                                <span>{t('staff_action_edit')}</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handlePasswordOpen(cashier)}
                                className="cursor-pointer gap-2"
                              >
                                <Key className="h-4 w-4 text-amber-500" />
                                <span>{t('staff_action_change_pwd')}</span>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => { setDeleteTarget(cashier); setActionError(null); }}
                                className="cursor-pointer gap-2 text-destructive focus:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                                <span>{t('staff_action_remove')}</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card List View (hidden on desktop) */}
              <div className="md:hidden divide-y divide-border/60">
                {filteredStaff.map((cashier) => (
                  <div key={cashier.id} className="p-4 flex items-center justify-between gap-3 hover:bg-muted/20 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar className="h-10 w-10 border border-border/70 shrink-0">
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                          {(cashier.fullName || cashier.email).charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 space-y-0.5">
                        <p className="font-semibold text-sm text-foreground truncate">
                          {cashier.fullName || t('staff_unnamed')}
                        </p>
                        <p className="text-xs text-muted-foreground font-mono truncate">
                          {cashier.email}
                        </p>
                        <div className="flex items-center gap-2 pt-0.5">
                          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[10px] py-0 px-1.5 h-4">
                            {t('staff_role_cashier')}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground">
                            {format(new Date(cashier.createdAt), 'MMM d, yyyy')}
                          </span>
                        </div>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon" className="h-9 w-9 shrink-0">
                          <MoreVertical className="h-4 w-4" />
                          <span className="sr-only">{t('staff_menu_title')}</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel className="text-xs">{t('staff_menu_title')}</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() => handleEditOpen(cashier)}
                          className="cursor-pointer gap-2"
                        >
                          <Edit className="h-4 w-4 text-muted-foreground" />
                          <span>{t('staff_action_edit')}</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handlePasswordOpen(cashier)}
                          className="cursor-pointer gap-2"
                        >
                          <Key className="h-4 w-4 text-amber-500" />
                          <span>{t('staff_action_change_pwd')}</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => { setDeleteTarget(cashier); setActionError(null); }}
                          className="cursor-pointer gap-2 text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span>{t('staff_action_remove')}</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* 1. ADD / ASSIGN CASHIER DIALOG */}
      <Dialog
        open={isAddOpen}
        onOpenChange={(open) => {
          setIsAddOpen(open)
          if (open && activeStore) {
            fetchAvailableStaff(activeStore.id)
          }
        }}
      >
        <DialogContent className="sm:max-w-[540px]">
          <DialogHeader>
            <DialogTitle className="text-xl">{t('staff_dialog_add_title')}</DialogTitle>
            <DialogDescription>
              {t('staff_dialog_add_desc', { storeName: activeStore.name })}
            </DialogDescription>
          </DialogHeader>

          <Tabs
            value={addTab}
            onValueChange={(val) => {
              setAddTab(val as 'new' | 'existing')
              setActionError(null)
            }}
            className="w-full mt-2"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="new" className="gap-2">
                <Plus className="h-4 w-4" />
                <span>{t('staff_tab_new')}</span>
              </TabsTrigger>
              <TabsTrigger value="existing" className="gap-2">
                <Users className="h-4 w-4" />
                <span>{t('staff_tab_existing')}</span>
                {availableStaff.length > 0 && (
                  <span className="inline-flex items-center justify-center rounded-full px-1.5 py-0.2 text-[10px] font-semibold bg-primary/10 text-primary">
                    {availableStaff.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: NEW CASHIER */}
            <TabsContent value="new" className="mt-3">
              <form onSubmit={handleAddSubmit}>
                <div className="grid gap-4 py-2">
                  <div className="space-y-2">
                    <Label htmlFor="add-name">{t('staff_dialog_fullname')}</Label>
                    <Input
                      id="add-name"
                      placeholder={t('staff_dialog_fullname_placeholder')}
                      value={addFullName}
                      onChange={(e) => setAddFullName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="add-email">{t('staff_dialog_email')}</Label>
                    <Input
                      id="add-email"
                      type="email"
                      placeholder={t('staff_dialog_email_placeholder')}
                      value={addEmail}
                      onChange={(e) => setAddEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="add-password">{t('staff_dialog_password')}</Label>
                      <button
                        type="button"
                        onClick={() => setAddPassword(generateStrongPassword())}
                        className="text-xs text-primary hover:underline flex items-center gap-1"
                      >
                        <Sparkles className="h-3 w-3" /> {t('staff_dialog_auto_generate')}
                      </button>
                    </div>
                    <div className="relative">
                      <Input
                        id="add-password"
                        type={showAddPassword ? 'text' : 'password'}
                        placeholder={t('staff_dialog_password_placeholder')}
                        value={addPassword}
                        onChange={(e) => setAddPassword(e.target.value)}
                        className="pe-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowAddPassword(!showAddPassword)}
                        className="absolute end-3 top-2.5 text-muted-foreground hover:text-foreground"
                      >
                        {showAddPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      {t('staff_dialog_password_hint')}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="add-phone">{t('staff_dialog_phone')}</Label>
                    <Input
                      id="add-phone"
                      placeholder={t('staff_dialog_phone_placeholder')}
                      value={addPhone}
                      onChange={(e) => setAddPhone(e.target.value)}
                    />
                  </div>

                  {actionError && (
                    <p className="text-xs font-medium text-destructive">{actionError}</p>
                  )}
                </div>

                <DialogFooter className="gap-2 sm:gap-0 mt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddOpen(false)}
                    disabled={actionLoading}
                  >
                    {t('cancel')}
                  </Button>
                  <Button
                    type="submit"
                    disabled={
                      actionLoading ||
                      !addFullName.trim() ||
                      !addEmail.trim() ||
                      (!!addPassword && addPassword.length < 6)
                    }
                    className={`gap-2 transition-all ${
                      !addFullName.trim() ||
                      !addEmail.trim() ||
                      (!!addPassword && addPassword.length < 6)
                        ? 'opacity-50 cursor-not-allowed bg-muted text-muted-foreground hover:bg-muted'
                        : ''
                    }`}
                  >
                    {actionLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {t('saving')}
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4" />
                        {t('staff_dialog_create_btn')}
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </TabsContent>

            {/* TAB 2: FROM OTHER BRANCHES */}
            <TabsContent value="existing" className="mt-3">
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">
                  {t('staff_existing_desc', { storeName: activeStore.name })}
                </p>

                {availableStaff.length > 0 && (
                  <div className="relative">
                    <Search className="absolute start-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={t('staff_search_existing_placeholder')}
                      value={existingSearchQuery}
                      onChange={(e) => setExistingSearchQuery(e.target.value)}
                      className="ps-9 h-9 text-xs"
                    />
                  </div>
                )}

                {actionError && (
                  <p className="text-xs font-medium text-destructive">{actionError}</p>
                )}

                {filteredAvailableStaff.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border/80 p-6 text-center">
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground mb-2">
                      <Store className="h-5 w-5" />
                    </div>
                    <p className="text-sm font-semibold text-foreground">
                      {availableStaff.length === 0
                        ? t('staff_no_available_existing')
                        : t('staff_no_results')}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 max-w-[340px] mx-auto">
                      {availableStaff.length === 0
                        ? t('staff_no_available_existing_desc')
                        : t('staff_no_results')}
                    </p>
                  </div>
                ) : (
                  <div className="max-h-[300px] overflow-y-auto space-y-2 pe-1">
                    {filteredAvailableStaff.map((person) => {
                      const isAssigning = assigningStaffId === person.id
                      return (
                        <div
                          key={person.id}
                          className="flex items-center justify-between p-3 rounded-lg border border-border/60 bg-muted/20 hover:bg-muted/40 transition-colors gap-3"
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <Avatar className="h-9 w-9 border border-border/40 shrink-0">
                              <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
                                {person.fullName
                                  ? person.fullName.slice(0, 2).toUpperCase()
                                  : person.email.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-semibold text-foreground truncate">
                                {person.fullName || person.email}
                              </p>
                              <p className="text-[11px] text-muted-foreground truncate">
                                {person.email}
                                {person.phone && ` • ${person.phone}`}
                              </p>
                              {person.assignedStores.length > 0 && (
                                <div className="flex items-center gap-1 mt-1 flex-wrap">
                                  <span className="text-[10px] text-muted-foreground font-medium">
                                    {t('staff_currently_at')}:
                                  </span>
                                  {person.assignedStores.map((s) => (
                                    <Badge
                                      key={s.id}
                                      variant="outline"
                                      className="text-[10px] px-1.5 py-0 font-normal bg-background/50"
                                    >
                                      {s.name}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            disabled={assigningStaffId !== null}
                            onClick={() =>
                              handleAssignExisting(person.id, person.fullName || person.email)
                            }
                            className="gap-1.5 text-xs shrink-0"
                          >
                            {isAssigning ? (
                              <>
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                {t('staff_btn_assigning')}
                              </>
                            ) : (
                              <>
                                <Plus className="h-3.5 w-3.5" />
                                {t('staff_btn_assign')}
                              </>
                            )}
                          </Button>
                        </div>
                      )
                    })}
                  </div>
                )}

                <DialogFooter className="gap-2 sm:gap-0 pt-3 border-t mt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddOpen(false)}
                  >
                    {t('cancel')}
                  </Button>
                </DialogFooter>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* 2. EDIT CASHIER DIALOG */}
      <Dialog open={!!editTarget} onOpenChange={(open) => !open && setEditTarget(null)}>
        <DialogContent className="sm:max-w-[440px]">
          <form onSubmit={handleEditSubmit}>
            <DialogHeader>
              <DialogTitle className="text-xl">{t('staff_dialog_edit_title')}</DialogTitle>
              <DialogDescription>
                {t('staff_dialog_edit_desc', { email: editTarget?.email || '' })}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">{t('staff_dialog_fullname')}</Label>
                <Input
                  id="edit-name"
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-phone">{t('staff_dialog_phone')}</Label>
                <Input
                  id="edit-phone"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder={t('staff_dialog_phone_placeholder')}
                />
              </div>

              {actionError && (
                <p className="text-xs font-medium text-destructive">{actionError}</p>
              )}
            </div>

            {(() => {
              const hasEditChanges = Boolean(
                editTarget &&
                  (editFullName.trim() !== (editTarget.fullName || '').trim() ||
                    editPhone.trim() !== (editTarget.phone || '').trim()) &&
                  editFullName.trim().length > 0
              )
              return (
                <DialogFooter className="gap-2 sm:gap-0">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditTarget(null)}
                    disabled={actionLoading}
                  >
                    {t('cancel')}
                  </Button>
                  <Button
                    type="submit"
                    disabled={actionLoading || !hasEditChanges}
                    className={`gap-2 transition-all ${
                      !hasEditChanges
                        ? 'opacity-50 cursor-not-allowed bg-muted text-muted-foreground hover:bg-muted'
                        : ''
                    }`}
                  >
                    {actionLoading ? t('saving') : hasEditChanges ? t('staff_dialog_save_btn') : t('staff_dialog_no_changes')}
                  </Button>
                </DialogFooter>
              )
            })()}
          </form>
        </DialogContent>
      </Dialog>

      {/* 3. CHANGE PASSWORD DIALOG */}
      <Dialog open={!!passwordTarget} onOpenChange={(open) => !open && setPasswordTarget(null)}>
        <DialogContent className="sm:max-w-[440px]">
          <form onSubmit={handlePasswordSubmit}>
            <DialogHeader>
              <div className="flex items-center gap-2 mb-1">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
                  <Key className="h-4 w-4" />
                </div>
                <DialogTitle className="text-xl">{t('staff_dialog_pwd_title')}</DialogTitle>
              </div>
              <DialogDescription>
                {t('staff_dialog_pwd_desc', { name: passwordTarget?.fullName || passwordTarget?.email || '' })}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="change-pass">{t('staff_dialog_new_pwd')}</Label>
                  <button
                    type="button"
                    onClick={() => setNewPassword(generateStrongPassword())}
                    className="text-xs text-primary hover:underline flex items-center gap-1"
                  >
                    <Sparkles className="h-3 w-3" /> {t('staff_dialog_auto_generate')}
                  </button>
                </div>
                <div className="relative">
                  <Input
                    id="change-pass"
                    type={showNewPassword ? 'text' : 'password'}
                    placeholder={t('staff_dialog_new_pwd_placeholder')}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    autoFocus
                    className="pe-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute end-3 top-2.5 text-muted-foreground hover:text-foreground"
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {t('staff_dialog_new_pwd_hint')}
                </p>
              </div>

              {actionError && (
                <p className="text-xs font-medium text-destructive">{actionError}</p>
              )}
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setPasswordTarget(null)}
                disabled={actionLoading}
              >
                {t('cancel')}
              </Button>
              <Button
                type="submit"
                disabled={actionLoading || newPassword.length < 6}
                className={`gap-2 transition-all ${
                  newPassword.length < 6
                    ? 'opacity-50 cursor-not-allowed bg-muted text-muted-foreground hover:bg-muted'
                    : ''
                }`}
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t('saving')}
                  </>
                ) : (
                  <>
                    <Key className="h-4 w-4" />
                    {t('staff_dialog_update_pwd_btn')}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 4. DELETE / REMOVE CONFIRMATION DIALOG */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-1">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                <AlertTriangle className="h-4 w-4" />
              </div>
              <DialogTitle className="text-xl">{t('staff_dialog_remove_title')}</DialogTitle>
            </div>
            <DialogDescription>
              {t('staff_dialog_remove_desc', {
                name: deleteTarget?.fullName || deleteTarget?.email || '',
                storeName: activeStore.name,
              })}
            </DialogDescription>
          </DialogHeader>

          <div className="py-2">
            <p className="text-xs text-muted-foreground">
              {t('staff_dialog_remove_warning')}
            </p>
            {actionError && (
              <p className="text-xs font-medium text-destructive mt-2">{actionError}</p>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={actionLoading}
            >
              {t('cancel')}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteSubmit}
              disabled={actionLoading}
              className="gap-2"
            >
              {actionLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t('deleting')}
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  {t('staff_dialog_confirm_remove')}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
