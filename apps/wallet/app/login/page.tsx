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
import { Loader2, Lock, Mail, User, Sparkles } from 'lucide-react'

export default function WalletLoginPage() {
  const router = useRouter()
  const { signIn, signUp, signInWithGoogle, authLoading, authError } = useAuth()
  const { t } = useI18n()
  const tt = t as (key: string) => string

  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [localError, setLocalError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError(null)

    if (!email || !password || (mode === 'signup' && !fullName)) {
      setLocalError(tt('auth_error_all_fields_required') || 'Please fill in all required fields')
      return
    }

    try {
      if (mode === 'signin') {
        await signIn({ email, password })
        router.push('/')
      } else {
        await signUp({
          email,
          password,
          fullName,
          role: 'CUSTOMER',
        })
        await signIn({ email, password })
        router.push('/')
      }
    } catch (err: any) {
      setLocalError(err.message || tt('auth_generic_error') || 'Authentication failed')
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between p-4 md:p-8">
      {/* Top Bar */}
      <header className="flex items-center justify-between max-w-md w-full mx-auto">
        <div className="flex items-center gap-2">
          <FidelyLogo className="h-8 w-auto" />
          <span className="font-semibold text-xs tracking-tight text-primary uppercase bg-primary/10 px-2 py-0.5 rounded-full">
            Pass Wallet
          </span>
        </div>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggleButton />
        </div>
      </header>

      {/* Main Form Card */}
      <main className="w-full max-w-md mx-auto my-auto py-6">
        <Card className="border-border/60 shadow-xl bg-card/80 backdrop-blur-md">
          <CardHeader className="space-y-2 text-center pb-4">
            <div className="mx-auto h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-1">
              <Sparkles className="h-6 w-6" />
            </div>
            <CardTitle className="text-2xl font-black tracking-tight">
              {mode === 'signin' ? 'Welcome to your Wallet' : 'Create your Wallet'}
            </CardTitle>
            <CardDescription className="text-xs">
              {mode === 'signin'
                ? 'Sign in to access your digital stamps, points, and rewards'
                : 'Join millions earning instant loyalty rewards and perks'}
            </CardDescription>

            {/* Mode Switcher */}
            <div className="grid grid-cols-2 gap-1 p-1 bg-muted rounded-xl mt-3">
              <button
                type="button"
                onClick={() => {
                  setMode('signin')
                  setLocalError(null)
                }}
                className={`text-xs font-semibold py-1.5 rounded-lg transition-all ${
                  mode === 'signin' ? 'bg-background shadow-xs text-foreground' : 'text-muted-foreground'
                }`}
              >
                {tt('login_tab') || 'Sign In'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('signup')
                  setLocalError(null)
                }}
                className={`text-xs font-semibold py-1.5 rounded-lg transition-all ${
                  mode === 'signup' ? 'bg-background shadow-xs text-foreground' : 'text-muted-foreground'
                }`}
              >
                {tt('sign_up_tab') || 'Create Account'}
              </button>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {(localError || authError) && (
              <div className="p-3 text-sm rounded-lg bg-destructive/10 text-destructive border border-destructive/20 text-center font-medium">
                {localError || authError}
              </div>
            )}

            {/* Google OAuth Button */}
            <Button
              type="button"
              variant="outline"
              onClick={() => signInWithGoogle()}
              className="w-full h-11 border-border/80 font-medium"
            >
              <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
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
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              Continue with Google
            </Button>

            <div className="relative text-center my-2">
              <span className="bg-card px-2 text-xs text-muted-foreground uppercase tracking-widest relative z-10">
                or
              </span>
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/60" />
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              {mode === 'signup' && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Jane Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="pl-9 h-11"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9 h-11"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 h-11"
                    autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11 text-base font-semibold mt-2"
                disabled={authLoading}
              >
                {authLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Connecting...
                  </>
                ) : mode === 'signin' ? (
                  'Open Wallet'
                ) : (
                  'Create Wallet'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-muted-foreground/60 py-2">
        {BRAND_NAME} Wallet • Digital loyalty passes for modern shoppers
      </footer>
    </div>
  )
}
