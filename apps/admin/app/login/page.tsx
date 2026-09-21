'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { useI18n } from '@/lib/i18n'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { LanguageSwitcher } from '@/components/common/language-switcher'
import { ThemeToggleButton } from '@/components/common/theme-toggle-button'
import { FidelyLogo } from '@/components/common/fidely-logo'
import { BRAND_NAME } from '@/lib/brand'
import { Loader2, Lock, Mail, ShieldAlert } from 'lucide-react'

export default function AdminLoginPage() {
  const router = useRouter()
  const { signIn, signOut, authLoading, authError } = useAuth()
  const { t } = useI18n()
  const tt = t as (key: string) => string

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [localError, setLocalError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError(null)

    if (!email || !password) {
      setLocalError(tt('auth_error_all_fields_required') || 'Please enter email and password')
      return
    }

    try {
      await signIn({ email, password })
      router.push('/overview')
    } catch (err: any) {
      setLocalError(err.message || tt('auth_generic_error') || 'Sign in failed')
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between p-4 md:p-8">
      {/* Top Header */}
      <header className="flex items-center justify-between max-w-md w-full mx-auto">
        <div className="flex items-center gap-2">
          <FidelyLogo className="h-8 w-auto" />
          <span className="font-semibold text-xs tracking-tight text-amber-500 uppercase bg-amber-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
            <ShieldAlert className="w-3 h-3" />
            Admin Console
          </span>
        </div>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggleButton />
        </div>
      </header>

      {/* Main Login Card */}
      <main className="w-full max-w-md mx-auto my-auto py-6">
        <Card className="border-border/60 shadow-xl bg-card/80 backdrop-blur-md">
          <CardHeader className="space-y-2 text-center pb-4">
            <div className="mx-auto h-12 w-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 mb-1">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <CardTitle className="text-2xl font-black tracking-tight">
              Platform Governance
            </CardTitle>
            <CardDescription className="text-xs">
              Super Admin authorization required to supervise platform tenants, stores, and audit transactions.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {(localError || authError) && (
                <div className="p-3 text-sm rounded-lg bg-destructive/10 text-destructive border border-destructive/20 text-center font-medium">
                  {localError || authError}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Admin Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="admin@fidely.app"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9 h-11"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Master Key Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 h-11"
                    autoComplete="current-password"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={authLoading}
                className="w-full h-11 font-bold rounded-xl shadow-md gap-2"
              >
                {authLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                Sign In to Console
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-xs text-muted-foreground">
        <p>
          &copy; {new Date().getFullYear()} {BRAND_NAME} Enterprise Security &middot; Protected System
        </p>
      </footer>
    </div>
  )
}
