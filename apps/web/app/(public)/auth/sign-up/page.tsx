"use client"

import type React from "react"
import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  User,
  Store,
  Sparkles,
  CheckCircle2,
  Loader2,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Smartphone,
  TrendingUp,
  Gift,
  Printer,
  Zap,
} from "lucide-react"
import type { UserRole } from "@/lib/db-types"
import { ApiError } from "@/features/auth/services/auth-service"
import { FidelyLogo } from "@/components/common/fidely-logo"
import { useAuth } from "@/features/auth/hooks/use-auth"
import { useI18n } from "@/lib/i18n"
import { LanguageSwitcher } from "@/components/common/language-switcher"
import {
  validateEmail,
  validatePassword,
  validatePasswordConfirmation,
  validateFullName,
} from "@/features/auth/utils/auth-validation"

interface FieldErrors {
  fullName: string | null
  email: string | null
  password: string | null
  confirmPassword: string | null
}

function SignUpForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const searchRef = searchParams.get('ref') || searchParams.get('joinStore') || undefined
  const { t, isRtl } = useI18n()

  const [referralStoreId, setReferralStoreId] = useState<string | undefined>(searchRef)
  const [storeInfo, setStoreInfo] = useState<{ name: string; logoUrl?: string | null; welcomePoints?: number } | null>(null)
  
  // Step 1 = Role Selection, Step 2 = Details & Credentials Form
  const [step, setStep] = useState<1 | 2>(() => (searchRef ? 2 : 1))
  const [role, setRole] = useState<UserRole>(() => (searchRef ? 'CUSTOMER' : 'CUSTOMER'))

  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [repeatPassword, setRepeatPassword] = useState("")

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [touched, setTouched] = useState({
    fullName: false,
    email: false,
    password: false,
    confirmPassword: false,
  })

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({
    fullName: null,
    email: null,
    password: null,
    confirmPassword: null,
  })

  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  const { signUp, signInWithGoogle } = useAuth()

  // Sync and fetch store referral details if available
  useEffect(() => {
    let effectiveRef = searchRef
    if (!effectiveRef && typeof window !== 'undefined') {
      effectiveRef = localStorage.getItem('fidely_pending_join_store') || undefined
    }

    if (effectiveRef) {
      setReferralStoreId(effectiveRef)
      setRole('CUSTOMER')
      setStep(2)
      if (typeof window !== 'undefined') {
        localStorage.setItem('fidely_pending_join_store', effectiveRef)
      }

      const apiBase = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000').replace(/\/$/, '')
      fetch(`${apiBase}/api/v1/customer/store/${encodeURIComponent(effectiveRef)}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data) {
            setStoreInfo({
              name: data.name,
              logoUrl: data.logoUrl,
              welcomePoints: data.welcomePoints,
            })
          }
        })
        .catch(() => {})
    }
  }, [searchRef])

  const updateFieldError = (field: keyof FieldErrors, err: string | null) => {
    setFieldErrors((prev) => ({ ...prev, [field]: err }))
  }

  const handleFullNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setFullName(val)
    if (touched.fullName) {
      updateFieldError("fullName", validateFullName(val))
    }
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setEmail(val)
    if (touched.email) {
      updateFieldError("email", validateEmail(val))
    }
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setPassword(val)
    if (touched.password) {
      updateFieldError("password", validatePassword(val))
    }
    if (touched.confirmPassword && repeatPassword) {
      updateFieldError("confirmPassword", validatePasswordConfirmation(val, repeatPassword))
    }
  }

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setRepeatPassword(val)
    if (touched.confirmPassword) {
      updateFieldError("confirmPassword", validatePasswordConfirmation(password, val))
    }
  }

  const validateForm = () => {
    const errors: FieldErrors = {
      fullName: validateFullName(fullName),
      email: validateEmail(email),
      password: validatePassword(password),
      confirmPassword: validatePasswordConfirmation(password, repeatPassword),
    }

    setFieldErrors(errors)
    setTouched({
      fullName: true,
      email: true,
      password: true,
      confirmPassword: true,
    })

    return !errors.fullName && !errors.email && !errors.password && !errors.confirmPassword
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      await signUp({
        email,
        password,
        fullName,
        role,
        referredByStoreId: referralStoreId,
      })
      router.push("/auth/sign-up-success")
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError(t('auth_generic_error'))
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true)
    setError(null)
    try {
      const callbackUrl = `${window.location.origin}/auth/callback`
      await signInWithGoogle(callbackUrl)
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError(t('auth_generic_error'))
      }
      setIsGoogleLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex-1 flex">
        {/* Left Side: Dynamic Multi-Page / Step Container */}
        <div className="flex-1 flex flex-col p-4 sm:p-6 lg:p-10 xl:p-12 overflow-y-auto">
          {/* Top Navbar */}
          <div className="flex items-center justify-between mb-6 lg:mb-8">
            <Link href="/" className="flex items-center gap-2.5 group">
              <FidelyLogo size="md" variant="solid" className="transition-transform group-hover:scale-105" />
              <span className="font-extrabold text-xl tracking-tight text-foreground">
                {t('app_name')}
              </span>
            </Link>

            <div className="flex items-center gap-3">
              <LanguageSwitcher />
              <Link
                href={referralStoreId ? `/auth/login?ref=${encodeURIComponent(referralStoreId)}` : "/auth/login"}
                className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
              >
                {t('auth_signup_login_prompt')} <span className="text-primary font-bold">{t('auth_signup_login_link')}</span>
              </Link>
            </div>
          </div>

          {/* PAGE 1: ROLE SELECTION */}
          {step === 1 && (
            <div className="flex-1 flex items-center justify-center py-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-full max-w-xl space-y-7">
                {/* Header */}
                <div className="space-y-2 text-center">
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs font-bold uppercase tracking-wider px-3 py-1">
                    {t('auth_signup_step1_badge')}
                  </Badge>
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                    {t('auth_signup_step1_title')}
                  </h1>
                  <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
                    {t('auth_signup_step1_desc')}
                  </p>
                </div>

                {/* Role Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Card 1: Customer */}
                  <div
                    onClick={() => setRole("CUSTOMER")}
                    className={`relative p-5 sm:p-6 rounded-3xl border-2 text-left transition-all duration-200 flex flex-col justify-between space-y-4 cursor-pointer group ${
                      role === "CUSTOMER"
                        ? "border-primary bg-primary/5 ring-4 ring-primary/10 shadow-lg"
                        : "border-border/70 hover:border-primary/40 bg-card hover:bg-muted/30 shadow-xs"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                        role === "CUSTOMER" ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted text-muted-foreground group-hover:text-foreground"
                      }`}>
                        <User className="w-6 h-6" />
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        role === "CUSTOMER" ? "border-primary bg-primary text-primary-foreground shadow-xs" : "border-muted-foreground/30"
                      }`}>
                        {role === "CUSTOMER" && <CheckCircle2 className="w-4 h-4" />}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-base font-bold text-foreground flex items-center gap-1.5">
                        <span>{t('auth_signup_role_customer')}</span>
                      </h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {t('auth_signup_role_customer_desc')}
                      </p>
                    </div>

                    <ul className="space-y-2 text-[11px] text-muted-foreground border-t border-border/40 pt-3">
                      <li className="flex items-center gap-2 font-medium">
                        <Sparkles className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span>{t('auth_signup_perk_wallet')}</span>
                      </li>
                      <li className="flex items-center gap-2 font-medium">
                        <Gift className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span>{t('auth_signup_perk_points')}</span>
                      </li>
                      <li className="flex items-center gap-2 font-medium">
                        <Zap className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span>{t('auth_signup_perk_free')}</span>
                      </li>
                    </ul>

                    <Badge variant="outline" className={`text-[10px] font-bold self-start mt-1 ${
                      role === "CUSTOMER" ? "bg-primary/10 text-primary border-primary/20" : "text-muted-foreground"
                    }`}>
                      {t('auth_signup_role_customer_tagline')}
                    </Badge>
                  </div>

                  {/* Card 2: Merchant */}
                  <div
                    onClick={() => setRole("MERCHANT")}
                    className={`relative p-5 sm:p-6 rounded-3xl border-2 text-left transition-all duration-200 flex flex-col justify-between space-y-4 cursor-pointer group ${
                      role === "MERCHANT"
                        ? "border-primary bg-primary/5 ring-4 ring-primary/10 shadow-lg"
                        : "border-border/70 hover:border-primary/40 bg-card hover:bg-muted/30 shadow-xs"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                        role === "MERCHANT" ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted text-muted-foreground group-hover:text-foreground"
                      }`}>
                        <Store className="w-6 h-6" />
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        role === "MERCHANT" ? "border-primary bg-primary text-primary-foreground shadow-xs" : "border-muted-foreground/30"
                      }`}>
                        {role === "MERCHANT" && <CheckCircle2 className="w-4 h-4" />}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-base font-bold text-foreground flex items-center gap-1.5">
                        <span>{t('auth_signup_role_merchant')}</span>
                      </h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {t('auth_signup_role_merchant_desc')}
                      </p>
                    </div>

                    <ul className="space-y-2 text-[11px] text-muted-foreground border-t border-border/40 pt-3">
                      <li className="flex items-center gap-2 font-medium">
                        <Printer className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span>{t('auth_signup_perk_stand')}</span>
                      </li>
                      <li className="flex items-center gap-2 font-medium">
                        <TrendingUp className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span>{t('auth_signup_perk_pos')}</span>
                      </li>
                      <li className="flex items-center gap-2 font-medium">
                        <ShieldCheck className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span>{t('auth_signup_perk_analytics')}</span>
                      </li>
                    </ul>

                    <Badge variant="outline" className={`text-[10px] font-bold self-start mt-1 ${
                      role === "MERCHANT" ? "bg-primary/10 text-primary border-primary/20" : "text-muted-foreground"
                    }`}>
                      {t('auth_signup_role_merchant_tagline')}
                    </Badge>
                  </div>
                </div>

                {/* Continue CTA */}
                <div className="space-y-3 pt-2">
                  <Button
                    type="button"
                    onClick={() => setStep(2)}
                    className="w-full h-13 rounded-2xl text-sm font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 gap-2"
                  >
                    <span>{role === 'CUSTOMER' ? t('auth_signup_continue_customer') : t('auth_signup_continue_merchant')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>

                  <div className="text-center text-xs text-muted-foreground">
                    {t('auth_signup_login_prompt')}{" "}
                    <Link
                      href="/auth/login"
                      className="text-primary hover:underline font-bold"
                    >
                      {t('auth_signup_login_link')}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PAGE 2: REGISTRATION FORM & GOOGLE AUTH */}
          {step === 2 && (
            <div className="flex-1 flex items-center justify-center py-4 animate-in fade-in slide-in-from-right-4 duration-200">
              <div className="w-full max-w-md space-y-6">
                {/* Back Button & Role Chip */}
                <div className="flex items-center justify-between">
                  {!referralStoreId ? (
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors p-1 -ml-1 rounded-lg"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>{t('auth_signup_step2_change_role')}</span>
                    </button>
                  ) : <div />}

                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs font-bold gap-1.5 px-2.5 py-1">
                    {role === 'CUSTOMER' ? <User className="w-3.5 h-3.5" /> : <Store className="w-3.5 h-3.5" />}
                    <span>{role === 'CUSTOMER' ? t('auth_signup_step2_customer_badge') : t('auth_signup_step2_merchant_badge')}</span>
                  </Badge>
                </div>

                {/* Title */}
                <div className="space-y-1 text-center sm:text-left">
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                    {t('auth_signup_step2_title')}
                  </h1>
                  <p className="text-xs text-muted-foreground">
                    {role === 'CUSTOMER'
                      ? t('auth_signup_step2_customer_desc')
                      : t('auth_signup_step2_merchant_desc')}
                  </p>
                </div>

                {/* Store Referral Banner */}
                {storeInfo && (
                  <div className="bg-gradient-to-r from-primary/15 via-primary/10 to-indigo-500/15 border border-primary/30 rounded-2xl p-4 flex items-center gap-3.5 shadow-xs animate-in zoom-in-95">
                    <div className="h-11 w-11 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold overflow-hidden shrink-0 shadow-xs">
                      {storeInfo.logoUrl ? (
                        <img src={storeInfo.logoUrl} alt={storeInfo.name} className="h-full w-full object-cover" />
                      ) : (
                        <Store className="h-5 w-5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-foreground truncate">
                        {t('auth_signup_referral_joining', { storeName: storeInfo.name })}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {storeInfo.welcomePoints && storeInfo.welcomePoints > 0
                          ? t('auth_signup_referral_bonus', { points: storeInfo.welcomePoints })
                          : t('auth_signup_referral_no_bonus')}
                      </p>
                    </div>
                    {storeInfo.welcomePoints && storeInfo.welcomePoints > 0 && (
                      <Badge className="bg-primary text-primary-foreground font-mono font-bold text-xs shrink-0">
                        +{storeInfo.welcomePoints} {t('pts_short')}
                      </Badge>
                    )}
                  </div>
                )}

                {/* Form Fields */}
                <form onSubmit={handleSignUp} className="space-y-4">
                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <Label htmlFor="fullName" className="text-xs font-semibold text-foreground">
                      {t('auth_full_name_label')}
                    </Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder={t('auth_full_name_placeholder')}
                      required
                      value={fullName}
                      onChange={handleFullNameChange}
                      onBlur={() => {
                        setTouched((prev) => ({ ...prev, fullName: true }))
                        updateFieldError("fullName", validateFullName(fullName))
                      }}
                      className={`h-11 rounded-xl bg-muted/30 border-border/70 text-sm ${
                        fieldErrors.fullName && touched.fullName ? "border-destructive focus-visible:ring-destructive" : ""
                      }`}
                      maxLength={120}
                    />
                    {fieldErrors.fullName && touched.fullName && (
                      <p className="text-xs text-destructive font-medium">{fieldErrors.fullName}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-xs font-semibold text-foreground">
                      {t('auth_email_label')}
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder={t('auth_email_placeholder')}
                      required
                      value={email}
                      onChange={handleEmailChange}
                      onBlur={() => {
                        setTouched((prev) => ({ ...prev, email: true }))
                        updateFieldError("email", validateEmail(email))
                      }}
                      dir="ltr"
                      className={`h-11 rounded-xl bg-muted/30 border-border/70 text-sm text-left ${
                        fieldErrors.email && touched.email ? "border-destructive focus-visible:ring-destructive" : ""
                      }`}
                    />
                    {fieldErrors.email && touched.email && (
                      <p className="text-xs text-destructive font-medium">{fieldErrors.email}</p>
                    )}
                  </div>

                  {/* Password & Confirm Password */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="password" className="text-xs font-semibold text-foreground">
                        {t('auth_password_label')}
                      </Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          required
                          value={password}
                          onChange={handlePasswordChange}
                          onBlur={() => {
                            setTouched((prev) => ({ ...prev, password: true }))
                            updateFieldError("password", validatePassword(password))
                          }}
                          placeholder="••••••••"
                          className={`h-11 rounded-xl bg-muted/30 border-border/70 pr-10 text-sm ${
                            fieldErrors.password && touched.password ? "border-destructive focus-visible:ring-destructive" : ""
                          }`}
                          maxLength={72}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                          tabIndex={-1}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {fieldErrors.password && touched.password && (
                        <p className="text-[11px] text-destructive font-medium">{fieldErrors.password}</p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="repeat-password" className="text-xs font-semibold text-foreground">
                        {t('auth_password_confirm_label')}
                      </Label>
                      <div className="relative">
                        <Input
                          id="repeat-password"
                          type={showConfirmPassword ? "text" : "password"}
                          required
                          value={repeatPassword}
                          onChange={handleConfirmPasswordChange}
                          onBlur={() => {
                            setTouched((prev) => ({ ...prev, confirmPassword: true }))
                            updateFieldError("confirmPassword", validatePasswordConfirmation(password, repeatPassword))
                          }}
                          placeholder="••••••••"
                          className={`h-11 rounded-xl bg-muted/30 border-border/70 pr-10 text-sm ${
                            fieldErrors.confirmPassword && touched.confirmPassword ? "border-destructive focus-visible:ring-destructive" : ""
                          }`}
                          maxLength={72}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                          tabIndex={-1}
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {fieldErrors.confirmPassword && touched.confirmPassword && (
                        <p className="text-[11px] text-destructive font-medium">{fieldErrors.confirmPassword}</p>
                      )}
                    </div>
                  </div>

                  {error && (
                    <div className="bg-destructive/10 text-destructive border border-destructive/20 px-4 py-3 rounded-xl text-xs font-medium animate-in fade-in">
                      {error}
                    </div>
                  )}

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full h-12 rounded-xl text-sm font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/20 gap-2"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {t('auth_signup_loading')}
                      </>
                    ) : (
                      <>
                        <span>{role === 'CUSTOMER' ? t('auth_signup_button_customer') : t('auth_signup_button_merchant')}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>

                  {/* Google OAuth Section */}
                  <div className="relative py-1">
                    <div className="absolute inset-0 flex items-center">
                      <Separator />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-3 text-muted-foreground font-semibold">
                        {t('auth_signup_or_divider')}
                      </span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-12 rounded-xl text-xs sm:text-sm font-bold bg-card hover:bg-muted/50 border-border/80 gap-2.5 transition-all shadow-2xs"
                    disabled={isGoogleLoading || isLoading}
                    onClick={handleGoogleSignIn}
                  >
                    {isGoogleLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        {t('auth_google_loading')}
                      </>
                    ) : (
                      <>
                        <svg className="h-4 w-4" viewBox="0 0 24 24">
                          <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          />
                          <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          />
                        </svg>
                        <span>{t('auth_google_continue')}</span>
                      </>
                    )}
                  </Button>

                  {/* Terms & Sign in link */}
                  <div className="pt-2 text-center text-xs text-muted-foreground space-y-1">
                    <p>
                      {t('auth_signup_terms_agree')}{" "}
                      <Link href="/terms" className="underline hover:text-foreground">
                        {t('auth_signup_terms_link')}
                      </Link>{" "}
                      and{" "}
                      <Link href="/privacy" className="underline hover:text-foreground">
                        {t('auth_signup_privacy_link')}
                      </Link>
                      .
                    </p>
                    <p className="pt-1">
                      {t('auth_signup_login_prompt')}{" "}
                      <Link
                        href={referralStoreId ? `/auth/login?ref=${encodeURIComponent(referralStoreId)}` : "/auth/login"}
                        className="text-primary hover:underline font-bold"
                      >
                        {t('auth_signup_login_link')}
                      </Link>
                    </p>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Feature Highlights Showcase */}
        <div className="hidden lg:flex flex-1 bg-muted/30 border-l border-border/60 flex-col justify-between p-12">
          <div className="space-y-6 max-w-md">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs font-bold">
              Universal Digital Loyalty
            </Badge>

            <div className="space-y-2">
              <h2 className="text-3xl font-black tracking-tight text-foreground">
                Join thousands of businesses & smart shoppers.
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Fidely turns everyday shopping into rewarding habits with frictionless Apple Wallet passes, live counter QR scanning, and instant points.
              </p>
            </div>

            <div className="space-y-4 pt-4">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground">Zero App Downloads</h4>
                  <p className="text-xs text-muted-foreground">
                    Customers scan counter QR stands to instantly add their pass to Apple Wallet or mobile browser.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground">Instant Cashier POS</h4>
                  <p className="text-xs text-muted-foreground">
                    Cashiers issue points and validate voucher perks in under a second on any phone or tablet.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground">Secure & Fraud Proof</h4>
                  <p className="text-xs text-muted-foreground">
                    Cryptographically signed tokens and single-use redemption voucher receipts.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-border/40 text-xs text-muted-foreground flex items-center justify-between">
            <span>© {new Date().getFullYear()} Fidely Platform</span>
            <span>All rights reserved</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SignUpPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    }>
      <SignUpForm />
    </Suspense>
  )
}

