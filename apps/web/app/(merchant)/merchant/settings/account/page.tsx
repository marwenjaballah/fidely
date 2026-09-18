"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useUserStore } from "@/store/user-store"
import { useToast } from "@/hooks/use-toast"
import { useI18n } from "@/lib/i18n"
import { Loader2 } from "lucide-react"

export default function AccountSettingsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { t } = useI18n()

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
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null)

  const [confirmDelete, setConfirmDelete] = useState("")
  const [deleteError, setDeleteError] = useState<string | null>(null)

  useEffect(() => {
    fetchCurrentUser()
  }, [fetchCurrentUser])

  useEffect(() => {
    if (user) {
      setEmail(user.email)
      setFullName(user.profile.fullName ?? "")
      setPhone(user.profile.phone ?? "")
    }
  }, [user])

  const isLoadingProfile = loading && !user
  const isSavingProfile = loading && !!user
  const isChangingPassword = loading
  const isDeleting = loading

  const hasProfileChanges = Boolean(
    user &&
      (fullName.trim() !== (user.profile.fullName || "").trim() ||
        phone.trim() !== (user.profile.phone || "").trim())
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
    <div className="flex-1 overflow-auto">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-6 md:px-8 md:py-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{t('merchant_settings_title')}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('merchant_settings_subtitle')}
          </p>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="profile">{t('settings_tab_profile')}</TabsTrigger>
            <TabsTrigger value="password">{t('settings_tab_password')}</TabsTrigger>
            <TabsTrigger value="danger">{t('settings_tab_danger')}</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-4">
            <Card className="border border-border/60 bg-card/60 shadow-sm">
              <div className="flex flex-col gap-6 p-6 md:p-8">
                <div>
                  <h2 className="text-lg font-semibold">{t('settings_profile_title')}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t('settings_profile_description')}
                  </p>
                </div>

                <Separator />

                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="fullName">{t('settings_profile_full_name')}</Label>
                      <Input
                        id="fullName"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder={t('settings_profile_full_name_placeholder')}
                        disabled={isLoadingProfile || isSavingProfile}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="phone">{t('settings_profile_phone')}</Label>
                      <Input
                        id="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder={t('settings_profile_phone_placeholder')}
                        disabled={isLoadingProfile || isSavingProfile}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="email">{t('settings_profile_email')}</Label>
                    <Input id="email" value={email} disabled className="bg-muted" />
                    <p className="text-xs text-muted-foreground">
                      {t('settings_profile_email_note')}
                    </p>
                  </div>

                  {error && <p className="text-sm text-destructive">{error}</p>}
                  {profileMessage && !error && (
                    <p className="text-sm text-muted-foreground">{profileMessage}</p>
                  )}

                  <div className="flex justify-end gap-2">
                    <Button
                      type="submit"
                      disabled={isSavingProfile || isLoadingProfile || !hasProfileChanges}
                      className={`transition-all ${
                        !hasProfileChanges
                          ? "opacity-50 cursor-not-allowed bg-muted text-muted-foreground hover:bg-muted"
                          : ""
                      }`}
                    >
                      {isSavingProfile ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t('settings_profile_saving')}
                        </>
                      ) : hasProfileChanges ? (
                        t('settings_profile_save')
                      ) : (
                        t('save')
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="password" className="mt-4">
            <Card className="border border-border/60 bg-card/60 shadow-sm">
              <div className="flex flex-col gap-6 p-6 md:p-8">
                <div>
                  <h2 className="text-lg font-semibold">{t('settings_password_title')}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t('settings_password_description')}
                  </p>
                </div>

                <Separator />

                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="currentPassword">{t('settings_password_current')}</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder={t('settings_password_current_placeholder')}
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="newPassword">{t('settings_password_new')}</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder={t('settings_password_new_placeholder')}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="confirmPassword">{t('settings_password_confirm')}</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder={t('settings_password_confirm_placeholder')}
                      />
                    </div>
                  </div>

                  {passwordMessage && (
                    <p className="text-sm text-muted-foreground">{passwordMessage}</p>
                  )}

                  <div className="flex justify-end gap-2">
                    <Button
                      type="submit"
                      disabled={isChangingPassword || !hasPasswordChanges}
                      className={`transition-all ${
                        !hasPasswordChanges
                          ? "opacity-50 cursor-not-allowed bg-muted text-muted-foreground hover:bg-muted"
                          : ""
                      }`}
                    >
                      {isChangingPassword ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t('settings_password_updating')}
                        </>
                      ) : (
                        t('settings_password_update')
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="danger" className="mt-4">
            <Card className="border-destructive/60 bg-destructive/5 shadow-sm">
              <div className="flex flex-col gap-6 p-6 md:p-8">
                <div>
                  <h2 className="text-lg font-semibold text-destructive">{t('settings_delete_title')}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t('settings_delete_description')}
                  </p>
                </div>

                <Separator />

                <form onSubmit={handleDeleteAccount} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="confirmDelete">
                      {t('settings_delete_confirm_label')}{" "}
                      <span className="font-mono font-semibold">DELETE</span>{" "}
                      {t('settings_delete_confirm_suffix')}.
                    </Label>
                    <Input
                      id="confirmDelete"
                      value={confirmDelete}
                      onChange={(e) => setConfirmDelete(e.target.value)}
                      placeholder={t('settings_delete_confirm_placeholder')}
                    />
                  </div>

                  {deleteError && <p className="text-sm text-destructive">{deleteError}</p>}

                  <div className="flex flex-col items-start justify-between gap-3 md:flex-row md:items-center">
                    <p className="text-xs text-muted-foreground">
                      {t('settings_delete_warning')}
                    </p>
                    <Button
                      type="submit"
                      variant="destructive"
                      disabled={isDeleting}
                      className="min-w-[200px]"
                    >
                      {isDeleting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t('settings_delete_deleting')}
                        </>
                      ) : (
                        t('settings_delete_button')
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
