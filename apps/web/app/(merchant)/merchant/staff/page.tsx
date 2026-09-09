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
  Coffee,
} from 'lucide-react'

export default function StaffPage() {
  const {
    activeStore,
    fetchStaff,
    staff,
    createStaff,
    updateStaff,
    changeStaffPassword,
    deleteStaff,
    loading,
    error,
  } = useMerchantStore()

  // Search filter
  const [searchQuery, setSearchQuery] = useState('')

  // Dialog States
  const [isAddOpen, setIsAddOpen] = useState(false)
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
    }
  }, [activeStore, fetchStaff])

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
      setIsAddOpen(false)
      setAddFullName('')
      setAddEmail('')
      setAddPassword('')
      setAddPhone('')
    } catch (err: any) {
      setActionError(err.message || 'Failed to create cashier.')
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
      setEditTarget(null)
    } catch (err: any) {
      setActionError(err.message || 'Failed to update cashier.')
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
      setActionError('Password must be at least 6 characters long.')
      return
    }
    setActionLoading(true)
    setActionError(null)

    try {
      await changeStaffPassword(activeStore.id, passwordTarget.id, newPassword)
      setPasswordTarget(null)
      setNewPassword('')
    } catch (err: any) {
      setActionError(err.message || 'Failed to change password.')
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
      await deleteStaff(activeStore.id, deleteTarget.id)
      setDeleteTarget(null)
    } catch (err: any) {
      setActionError(err.message || 'Failed to remove cashier.')
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
        <p className="text-muted-foreground">Please select a store or create one.</p>
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
          <h1 className="text-3xl font-bold tracking-tight">Staff Management</h1>
          <p className="text-muted-foreground mt-1 flex items-center gap-2">
            <span>Cashier permissions for</span>
            <span className="font-semibold text-foreground flex items-center gap-1 bg-primary/10 text-primary px-2 py-0.5 rounded-md text-xs">
              <Coffee className="h-3 w-3" />
              {activeStore.name}
            </span>
          </p>
        </div>
        <Button onClick={() => { setIsAddOpen(true); setActionError(null); }} className="gap-2">
          <Plus className="h-4 w-4" /> Add New Cashier
        </Button>
      </div>

      {/* Main Table Card */}
      <Card className="border border-border/60 shadow-xs">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4">
          <div>
            <CardTitle className="text-lg">Authorized Cashiers</CardTitle>
            <CardDescription>
              Cashiers can log in at <code className="text-xs bg-muted px-1.5 py-0.5 rounded">/cashier</code> to issue points and redeem customer loyalty rewards.
            </CardDescription>
          </div>
          {staff.length > 0 && (
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search cashiers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
          )}
        </CardHeader>
        <CardContent>
          {loading && staff.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-sm text-muted-foreground gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading cashier team...
            </div>
          ) : staff.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-base mb-1">No cashiers added yet</h3>
              <p className="text-sm text-muted-foreground max-w-sm mb-4">
                Add cashier staff accounts so your team can scan customer QR codes and issue points.
              </p>
              <Button onClick={() => { setIsAddOpen(true); setActionError(null); }} variant="outline" className="gap-2">
                <Plus className="h-4 w-4" /> Add First Cashier
              </Button>
            </div>
          ) : filteredStaff.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No cashiers match your search query.
            </p>
          ) : (
            <div className="rounded-md border border-border/60 overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead>Cashier</TableHead>
                    <TableHead>Email & Contact</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Added On</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
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
                            {cashier.fullName || 'Unnamed Cashier'}
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
                            title="Copy Email"
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
                          Cashier
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(cashier.createdAt), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel className="text-xs">Cashier Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => handleEditOpen(cashier)}
                              className="cursor-pointer gap-2"
                            >
                              <Edit className="h-4 w-4 text-muted-foreground" />
                              <span>Edit Details</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handlePasswordOpen(cashier)}
                              className="cursor-pointer gap-2"
                            >
                              <Key className="h-4 w-4 text-amber-500" />
                              <span>Change Password</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => { setDeleteTarget(cashier); setActionError(null); }}
                              className="cursor-pointer gap-2 text-destructive focus:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span>Remove Cashier</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 1. ADD CASHIER DIALOG */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <form onSubmit={handleAddSubmit}>
            <DialogHeader>
              <DialogTitle className="text-xl">Add New Cashier</DialogTitle>
              <DialogDescription>
                Create a cashier login for <span className="font-semibold">{activeStore.name}</span>.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="add-name">Full Name</Label>
                <Input
                  id="add-name"
                  placeholder="e.g. Sarah Jenkins"
                  value={addFullName}
                  onChange={(e) => setAddFullName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="add-email">Email Address</Label>
                <Input
                  id="add-email"
                  type="email"
                  placeholder="cashier@example.com"
                  value={addEmail}
                  onChange={(e) => setAddEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="add-password">Login Password</Label>
                  <button
                    type="button"
                    onClick={() => setAddPassword(generateStrongPassword())}
                    className="text-xs text-primary hover:underline flex items-center gap-1"
                  >
                    <Sparkles className="h-3 w-3" /> Auto-generate
                  </button>
                </div>
                <div className="relative">
                  <Input
                    id="add-password"
                    type={showAddPassword ? 'text' : 'password'}
                    placeholder="Min 6 characters (default: Cashier@123456)"
                    value={addPassword}
                    onChange={(e) => setAddPassword(e.target.value)}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAddPassword(!showAddPassword)}
                    className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                  >
                    {showAddPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  The cashier will use this password to log in to the Cashier Terminal.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="add-phone">Phone Number (Optional)</Label>
                <Input
                  id="add-phone"
                  placeholder="+216 55 123 456"
                  value={addPhone}
                  onChange={(e) => setAddPhone(e.target.value)}
                />
              </div>

              {actionError && (
                <p className="text-xs font-medium text-destructive">{actionError}</p>
              )}
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddOpen(false)}
                disabled={actionLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={actionLoading} className="gap-2">
                {actionLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Create Cashier
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 2. EDIT CASHIER DIALOG */}
      <Dialog open={!!editTarget} onOpenChange={(open) => !open && setEditTarget(null)}>
        <DialogContent className="sm:max-w-[440px]">
          <form onSubmit={handleEditSubmit}>
            <DialogHeader>
              <DialogTitle className="text-xl">Edit Cashier</DialogTitle>
              <DialogDescription>
                Update profile details for <span className="font-semibold">{editTarget?.email}</span>.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Full Name</Label>
                <Input
                  id="edit-name"
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-phone">Phone Number</Label>
                <Input
                  id="edit-phone"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="+216 55 123 456"
                />
              </div>

              {actionError && (
                <p className="text-xs font-medium text-destructive">{actionError}</p>
              )}
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditTarget(null)}
                disabled={actionLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={actionLoading}>
                {actionLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
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
                <DialogTitle className="text-xl">Change Cashier Password</DialogTitle>
              </div>
              <DialogDescription>
                Set a new password for <span className="font-semibold text-foreground">{passwordTarget?.fullName || passwordTarget?.email}</span>.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="change-pass">New Password</Label>
                  <button
                    type="button"
                    onClick={() => setNewPassword(generateStrongPassword())}
                    className="text-xs text-primary hover:underline flex items-center gap-1"
                  >
                    <Sparkles className="h-3 w-3" /> Auto-generate
                  </button>
                </div>
                <div className="relative">
                  <Input
                    id="change-pass"
                    type={showNewPassword ? 'text' : 'password'}
                    placeholder="Enter new password (min 6 chars)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    autoFocus
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  The cashier will immediately need this new password to access the terminal.
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
                Cancel
              </Button>
              <Button type="submit" disabled={actionLoading} className="gap-2">
                {actionLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Key className="h-4 w-4" />
                    Update Password
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
              <DialogTitle className="text-xl">Remove Cashier</DialogTitle>
            </div>
            <DialogDescription>
              Are you sure you want to remove <span className="font-semibold text-foreground">{deleteTarget?.fullName || deleteTarget?.email}</span> from <span className="font-semibold text-foreground">{activeStore.name}</span>?
            </DialogDescription>
          </DialogHeader>

          <div className="py-2">
            <p className="text-xs text-muted-foreground">
              They will immediately lose access to scan QR codes and issue loyalty points for this store.
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
              Cancel
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
                  Removing...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  Remove Cashier
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
