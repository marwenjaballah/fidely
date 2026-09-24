'use client'

import React, { useState, useEffect } from 'react'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerClose,
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  User,
  LogOut,
  X,
  Check,
  Loader2,
  Coffee,
  Smartphone,
  Globe,
  Moon,
  ShieldCheck,
} from 'lucide-react'
import { ThemeToggleButton } from '@/components/common/theme-toggle-button'
import { LanguageSwitcher } from '@/components/common/language-switcher'
import { PwaInstallRow } from '@/components/pwa/pwa-install-row'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { useUserStore } from '@/store/user-store'
import { useCustomerStore } from '@/store/customer-store'
import { useToast } from '@/hooks/use-toast'
import { useI18n } from '@/lib/i18n'
import { posHaptics } from '@/lib/haptics'

interface CustomerProfileDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onLogout: () => void
}

export function CustomerProfileDrawer({
  open,
  onOpenChange,
  onLogout,
}: CustomerProfileDrawerProps) {
  const { profile, revalidateSession } = useAuth()
  const { updateProfile } = useUserStore()
  const { memberships, setActiveMembership } = useCustomerStore()
  const { toast } = useToast()
  const { t, dir } = useI18n()

  const [fullNameInput, setFullNameInput] = useState('')
  const [phoneInput, setPhoneInput] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (profile) {
      if (profile.full_name) setFullNameInput(profile.full_name)
      if (profile.phone) setPhoneInput(profile.phone)
    }
  }, [profile])

  const handleSaveProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setIsSaving(true)
    posHaptics.tap()

    try {
      await updateProfile({
        fullName: fullNameInput.trim() || undefined,
        phone: phoneInput.trim() || undefined,
      })
      await revalidateSession()
      toast({
        title: t('profile_saved_title') || 'Profile updated',
        description: t('profile_saved_desc') || 'Your details have been saved.',
      })
      onOpenChange(false)
    } catch (err: any) {
      const isDuplicate =
        err?.message?.toLowerCase().includes('already') ||
        err?.message?.toLowerCase().includes('registered') ||
        err?.message?.toLowerCase().includes('linked')
      const errorMessage = isDuplicate
        ? t('validation_phone_already_used') || err.message
        : err.message || t('settings_profile_error') || 'Failed to update profile'

      toast({
        title: t('auth_generic_error') || 'Error',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent
        dir={dir}
        className="max-w-lg mx-auto p-4 pb-8 rounded-t-3xl border-t border-border/80 bg-background/95 backdrop-blur-2xl"
      >
        <div className="mx-auto w-12 h-1.5 rounded-full bg-muted-foreground/30 mb-4" />

        <DrawerHeader className="p-0 mb-4 text-start">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-2xl bg-primary/15 text-primary flex items-center justify-center font-bold text-lg shadow-2xs">
                {profile?.full_name ? profile.full_name[0].toUpperCase() : <User className="w-5 h-5" />}
              </div>
              <div>
                <DrawerTitle className="text-base font-black tracking-tight">
                  {profile?.full_name || 'Customer Account'}
                </DrawerTitle>
                <DrawerDescription className="text-xs text-muted-foreground font-mono">
                  {profile?.email}
                </DrawerDescription>
              </div>
            </div>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                <X className="h-4 w-4" />
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        <div className="space-y-4 max-h-[70vh] overflow-y-auto pe-1">
          {/* Profile Form */}
          <form onSubmit={handleSaveProfile} className="space-y-3 p-3.5 rounded-2xl border border-border/60 bg-card">
            <div className="space-y-1 text-start">
              <Label htmlFor="drawer-name-input" className="text-xs font-bold text-foreground">
                {t('customer_profile_name') || 'Full Name'}
              </Label>
              <Input
                id="drawer-name-input"
                type="text"
                value={fullNameInput}
                onChange={(e) => setFullNameInput(e.target.value)}
                placeholder="John Doe"
                className="h-10 text-xs rounded-xl bg-background"
              />
            </div>

            <div className="space-y-1 text-start">
              <Label htmlFor="drawer-phone-input" className="text-xs font-bold text-foreground">
                {t('customer_profile_phone') || 'Phone Number'}
              </Label>
              <Input
                id="drawer-phone-input"
                type="tel"
                dir="ltr"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                placeholder="+216 55 123 456"
                className="h-10 text-xs rounded-xl bg-background font-mono text-start"
              />
              <p className="text-[10px] text-muted-foreground">
                {t('customer_phone_saved_desc') || 'Used by cashiers to award points if you forget your phone.'}
              </p>
            </div>

            <Button
              type="submit"
              disabled={isSaving}
              className="w-full h-10 rounded-xl text-xs font-bold gap-2 shadow-2xs"
            >
              {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
              <span>{t('save') || 'Save Details'}</span>
            </Button>
          </form>

          {/* Preferences (Theme & Language) */}
          <div className="p-3.5 rounded-2xl border border-border/60 bg-card space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-start">
                <p className="text-xs font-bold text-foreground">{t('theme_mode') || 'Appearance'}</p>
                <p className="text-[11px] text-muted-foreground">Toggle Dark or Light theme</p>
              </div>
              <ThemeToggleButton />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border/40">
              <div className="text-start">
                <p className="text-xs font-bold text-foreground">{t('language_selection') || 'Language'}</p>
                <p className="text-[11px] text-muted-foreground">English, Français, العربية</p>
              </div>
              <LanguageSwitcher />
            </div>

            <div className="pt-2 border-t border-border/40">
              <PwaInstallRow />
            </div>
          </div>

          {/* Logout Action */}
          <Button
            variant="destructive"
            onClick={() => {
              onOpenChange(false)
              onLogout()
            }}
            className="w-full h-11 rounded-2xl text-xs font-bold gap-2 shadow-xs"
          >
            <LogOut className="h-4 w-4 rtl:rotate-180" />
            <span>{t('logout') || 'Log Out'}</span>
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
