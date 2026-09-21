"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useUserStore } from "@/store/user-store"
import { useToast } from "@/hooks/use-toast"
import { useI18n } from "@/lib/i18n"
import {
  User,
  Lock,
  Trash2,
  Mail,
  Phone,
  KeyRound,
  ShieldAlert,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react"

export default function AccountSettingsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { t, isRtl, dir } = useI18n()

  const user = useUserStore((state) => state.user)
  const loading = useUserStore((state) => state.loading)
  const error = useUserStore((state) => state.error)
  const fetchCurrentUser = useUserStore((state) => state.fetchCurrentUser)
  const updateProfile = useUserStore((state) => state.updateProfile)
  const changePassword = useUserStore((state) => state.changePassword)
  const deleteAccount = useUserStore((state) => state.deleteAccount)

  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [profileMessage, setProfileMessage] = useState<string | null>(null)

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null)

  const [confirmDelete, setConfirmDelete] = useState("")
  const [deleteError, setDeleteError] = useState<string | null>(null)

  useEffect(() => {
    fetchCurrentUser()
  }, [fetchCurrentUser])

  useEffect(() => {
    if (user) {
      setEmail(user.email)
      setFullName(user.profile?.fullName ?? "")
      setPhone(user.profile?.phone ?? "")
    }
  }, [user])

  const isLoadingProfile = loading && !user
  const isSavingProfile = loading && !!user
  const isChangingPassword = loading
  const isDeleting = loading

  const hasProfileChanges = Boolean(
    user &&
      (fullName.trim() !== (user.profile?.fullName || "").trim() ||
        phone.trim() !== (user.profile?.phone || "").trim())
  )

  const hasPasswordChanges = Boolean(
    newPassword.length >= 8 && newPassword === confirmPassword
  )

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileMessage(null)
    try {
      await updateProfile({
        fullName: fullName.trim() || undefined,
        phone: phone.trim() || undefined,
      })
      const currentError = useUserStore.getState().error
      if (!currentError) {
        setProfileMessage(t('settings_profile_success'))
        toast({
          title: t('settings_profile_success'),
          description: t('settings_profile_success'),
        })
      } else {
        toast({
          title: t('auth_generic_error'),
          description: currentError,
          variant: "destructive",
        })
      }
    } catch (err: any) {
      toast({
        title: t('auth_generic_error'),
        description: err.message || t('settings_profile_error'),
        variant: "destructive",
      })
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordMessage(null)

    if (!newPassword || newPassword.length < 8) {
      setPasswordMessage(t('settings_password_error_min_length'))
      toast({
        title: t('settings_password_error_min_length'),
        description: t('settings_password_error_min_length'),
        variant: "destructive",
      })
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage(t('settings_password_error_mismatch'))
      toast({
        title: t('settings_password_error_mismatch'),
        description: t('settings_password_error_mismatch'),
        variant: "destructive",
      })
      return
    }

    try {
      await changePassword(newPassword)
      const currentError = useUserStore.getState().error
      if (currentError) {
        setPasswordMessage(currentError)
        toast({
          title: t('auth_generic_error'),
          description: currentError,
          variant: "destructive",
        })
      } else {
        setPasswordMessage(t('settings_password_success'))
        toast({
          title: t('settings_password_success'),
          description: t('settings_password_success'),
        })
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
      }
    } catch (err: any) {
      toast({
        title: t('auth_generic_error'),
        description: err.message || t('settings_password_error'),
        variant: "destructive",
      })
    }
  }

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    setDeleteError(null)

    if (confirmDelete !== "DELETE") {
      setDeleteError(t('settings_delete_error_confirm'))
      toast({
        title: t('settings_delete_error_confirm'),
        description: t('settings_delete_error_confirm'),
        variant: "destructive",
      })
      return
    }

    await deleteAccount()
    const err = useUserStore.getState().error
    if (err) {
      setDeleteError(err)
      toast({
        title: t('settings_delete_error'),
        description: err,
        variant: "destructive",
      })
    } else {
      router.push("/auth/login")
    }
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-6 md:px-8 md:py-8">
        {/* Header Title Section */}
        <div className="text-start">
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl text-foreground">
            {t('merchant_settings_title')}
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {t('merchant_settings_subtitle')}
          </p>
        </div>

        {/* Settings Navigation Tabs */}
        <Tabs defaultValue="profile" dir={dir} className="w-full">
          <TabsList className="w-full justify-start overflow-x-auto p-1 bg-muted/60 border border-border/50 rounded-xl gap-1 h-auto">
            <TabsTrigger
              value="profile"
              className="gap-2 px-4 py-2 rounded-lg text-xs md:text-sm font-semibold transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs"
            >
              <User className="h-4 w-4 shrink-0 text-primary" />
              <span>{t('settings_tab_profile')}</span>
            </TabsTrigger>

            <TabsTrigger
              value="password"
              className="gap-2 px-4 py-2 rounded-lg text-xs md:text-sm font-semibold transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs"
            >
              <Lock className="h-4 w-4 shrink-0 text-amber-500" />
              <span>{t('settings_tab_password')}</span>
            </TabsTrigger>

            <TabsTrigger
              value="danger"
              className="gap-2 px-4 py-2 rounded-lg text-xs md:text-sm font-semibold transition-all data-[state=active]:bg-background data-[state=active]:text-destructive data-[state=active]:shadow-xs"
            >
              <Trash2 className="h-4 w-4 shrink-0 text-destructive" />
              <span>{t('settings_tab_danger')}</span>
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: Profile / Personal Information */}
          <TabsContent value="profile" className="mt-4 focus-visible:outline-none">
            <Card className="border border-border/60 bg-card/80 backdrop-blur-xs shadow-xs rounded-2xl">
              <CardContent className="flex flex-col gap-6 p-6 md:p-8">
                <div className="text-start space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <User className="h-4 w-4" />
                    </div>
                    <h2 className="text-lg font-bold text-foreground">
                      {t('settings_profile_title')}
                    </h2>
                  </div>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    {t('settings_profile_description')}
                  </p>
                </div>

                <Separator className="bg-border/60" />

                <form onSubmit={handleSaveProfile} className="space-y-5">
                  <div className="grid gap-5 md:grid-cols-2">
                    {/* Full Name */}
                    <div className="space-y-2 text-start">
                      <Label htmlFor="fullName" className="text-xs font-semibold text-foreground">
                        {t('settings_profile_full_name')}
                      </Label>
                      <div className="relative">
                        <User className="absolute start-3 top-2.5 h-4 w-4 text-muted-foreground/70" />
                        <Input
                          id="fullName"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder={t('settings_profile_full_name_placeholder')}
                          disabled={isLoadingProfile || isSavingProfile}
                          className="ps-9 h-10 rounded-xl"
                        />
                      </div>
                    </div>

                    {/* Phone Number */}
                    <div className="space-y-2 text-start">
                      <Label htmlFor="phone" className="text-xs font-semibold text-foreground">
                        {t('settings_profile_phone')}
                      </Label>
                      <div className="relative">
                        <Phone className="absolute start-3 top-2.5 h-4 w-4 text-muted-foreground/70" />
                        <Input
                          id="phone"
                          dir="ltr"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder={t('settings_profile_phone_placeholder')}
                          disabled={isLoadingProfile || isSavingProfile}
                          className="ps-9 h-10 rounded-xl text-start font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Email Address (Read-only) */}
                  <div className="space-y-2 text-start">
                    <Label htmlFor="email" className="text-xs font-semibold text-foreground">
                      {t('settings_profile_email')}
                    </Label>
                    <div className="relative">
                      <Mail className="absolute start-3 top-2.5 h-4 w-4 text-muted-foreground/70" />
                      <Input
                        id="email"
                        dir="ltr"
                        value={email}
                        disabled
                        className="ps-9 h-10 rounded-xl bg-muted/60 text-muted-foreground font-mono text-start cursor-not-allowed"
                      />
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      {t('settings_profile_email_note')}
                    </p>
                  </div>

                  {error && (
                    <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  {profileMessage && !error && (
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      <span>{profileMessage}</span>
                    </div>
                  )}

                  <div className="flex justify-end pt-2">
                    <Button
                      type="submit"
                      disabled={isSavingProfile || isLoadingProfile || !hasProfileChanges}
                      className={`gap-2 rounded-xl px-6 h-10 font-semibold transition-all ${
                        !hasProfileChanges
                          ? "opacity-50 cursor-not-allowed bg-muted text-muted-foreground hover:bg-muted"
                          : ""
                      }`}
                    >
                      {isSavingProfile ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          {t('settings_profile_saving')}
                        </>
                      ) : (
                        t('settings_profile_save')
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 2: Change Password */}
          <TabsContent value="password" className="mt-4 focus-visible:outline-none">
            <Card className="border border-border/60 bg-card/80 backdrop-blur-xs shadow-xs rounded-2xl">
              <CardContent className="flex flex-col gap-6 p-6 md:p-8">
                <div className="text-start space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
                      <KeyRound className="h-4 w-4" />
                    </div>
                    <h2 className="text-lg font-bold text-foreground">
                      {t('settings_password_title')}
                    </h2>
                  </div>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    {t('settings_password_description')}
                  </p>
                </div>

                <Separator className="bg-border/60" />

                <form onSubmit={handleChangePassword} className="space-y-5">
                  {/* Current Password */}
                  <div className="space-y-2 text-start">
                    <Label htmlFor="currentPassword" className="text-xs font-semibold text-foreground">
                      {t('settings_password_current')}
                    </Label>
                    <div className="relative">
                      <Lock className="absolute start-3 top-2.5 h-4 w-4 text-muted-foreground/70" />
                      <Input
                        id="currentPassword"
                        dir="ltr"
                        type={showCurrentPassword ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder={t('settings_password_current_placeholder')}
                        className="ps-9 pe-10 h-10 rounded-xl font-mono text-start"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute end-3 top-2.5 text-muted-foreground hover:text-foreground"
                      >
                        {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* New Password & Confirm Password Grid */}
                  <div className="grid gap-5 md:grid-cols-2">
                    <div className="space-y-2 text-start">
                      <Label htmlFor="newPassword" className="text-xs font-semibold text-foreground">
                        {t('settings_password_new')}
                      </Label>
                      <div className="relative">
                        <Lock className="absolute start-3 top-2.5 h-4 w-4 text-muted-foreground/70" />
                        <Input
                          id="newPassword"
                          dir="ltr"
                          type={showNewPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder={t('settings_password_new_placeholder')}
                          className="ps-9 pe-10 h-10 rounded-xl font-mono text-start"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute end-3 top-2.5 text-muted-foreground hover:text-foreground"
                        >
                          {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2 text-start">
                      <Label htmlFor="confirmPassword" className="text-xs font-semibold text-foreground">
                        {t('settings_password_confirm')}
                      </Label>
                      <div className="relative">
                        <Lock className="absolute start-3 top-2.5 h-4 w-4 text-muted-foreground/70" />
                        <Input
                          id="confirmPassword"
                          dir="ltr"
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder={t('settings_password_confirm_placeholder')}
                          className="ps-9 pe-10 h-10 rounded-xl font-mono text-start"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute end-3 top-2.5 text-muted-foreground hover:text-foreground"
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {passwordMessage && (
                    <div className="p-3 rounded-xl bg-muted border border-border/70 text-xs flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-primary shrink-0" />
                      <span>{passwordMessage}</span>
                    </div>
                  )}

                  <div className="flex justify-end pt-2">
                    <Button
                      type="submit"
                      disabled={isChangingPassword || !hasPasswordChanges}
                      className={`gap-2 rounded-xl px-6 h-10 font-semibold transition-all ${
                        !hasPasswordChanges
                          ? "opacity-50 cursor-not-allowed bg-muted text-muted-foreground hover:bg-muted"
                          : ""
                      }`}
                    >
                      {isChangingPassword ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          {t('settings_password_updating')}
                        </>
                      ) : (
                        t('settings_password_update')
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 3: Danger Zone / Delete Account */}
          <TabsContent value="danger" className="mt-4 focus-visible:outline-none">
            <Card className="border border-destructive/40 bg-destructive/5 shadow-xs rounded-2xl">
              <CardContent className="flex flex-col gap-6 p-6 md:p-8">
                <div className="text-start space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/15 text-destructive">
                      <ShieldAlert className="h-4 w-4" />
                    </div>
                    <h2 className="text-lg font-bold text-destructive">
                      {t('settings_delete_title')}
                    </h2>
                  </div>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    {t('settings_delete_description')}
                  </p>
                </div>

                <Separator className="bg-destructive/20" />

                <form onSubmit={handleDeleteAccount} className="space-y-5">
                  <div className="space-y-2 text-start">
                    <Label htmlFor="confirmDelete" className="text-xs font-semibold text-foreground">
                      {t('settings_delete_confirm_label')}{" "}
                      <span className="font-mono font-bold text-destructive bg-destructive/10 px-1.5 py-0.5 rounded-md">
                        DELETE
                      </span>{" "}
                      {t('settings_delete_confirm_suffix')}
                    </Label>
                    <Input
                      id="confirmDelete"
                      dir="ltr"
                      value={confirmDelete}
                      onChange={(e) => setConfirmDelete(e.target.value)}
                      placeholder={t('settings_delete_confirm_placeholder')}
                      className="h-10 rounded-xl font-mono text-start max-w-md border-destructive/40 focus-visible:ring-destructive"
                    />
                  </div>

                  {deleteError && (
                    <div className="p-3 rounded-xl bg-destructive/15 border border-destructive/30 text-destructive text-xs flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>{deleteError}</span>
                    </div>
                  )}

                  <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center pt-2">
                    <p className="text-xs text-muted-foreground max-w-md text-start">
                      {t('settings_delete_warning')}
                    </p>
                    <Button
                      type="submit"
                      variant="destructive"
                      disabled={isDeleting || confirmDelete !== "DELETE"}
                      className={`gap-2 rounded-xl px-6 h-10 font-semibold min-w-[180px] transition-all ${
                        confirmDelete !== "DELETE" ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      {isDeleting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          {t('settings_delete_deleting')}
                        </>
                      ) : (
                        t('settings_delete_button')
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

