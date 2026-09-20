'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { useI18n } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LanguageSwitcher } from '@/components/common/language-switcher';
import { ThemeToggleButton } from '@/components/common/theme-toggle-button';
import { FidelyLogo } from '@/components/common/fidely-logo';
import { BRAND_NAME } from '@/lib/brand';
import { Loader2, Lock, Mail } from 'lucide-react';

export default function CashierLoginPage() {
  const router = useRouter();
  const { signIn, authLoading, authError } = useAuth();
  const { t } = useI18n();
  const tt = t as (key: string) => string;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (!email || !password) {
      setLocalError(tt('auth_error_all_fields_required') || 'Please enter email and password');
      return;
    }

    try {
      await signIn({ email, password });
      router.push('/');
    } catch (err: any) {
      setLocalError(err.message || tt('auth_generic_error') || 'Sign in failed');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between p-4 md:p-8">
      {/* Top Bar */}
      <header className="flex items-center justify-between max-w-md w-full mx-auto">
        <div className="flex items-center gap-2">
          <FidelyLogo className="h-8 w-auto" />
          <span className="font-semibold text-sm tracking-tight text-muted-foreground uppercase">
            POS Terminal
          </span>
        </div>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggleButton />
        </div>
      </header>

      {/* Login Card */}
      <main className="w-full max-w-md mx-auto my-auto py-6">
        <Card className="border-border/60 shadow-lg bg-card/80 backdrop-blur-md">
          <CardHeader className="space-y-1 text-center pb-4">
            <CardTitle className="text-2xl font-bold tracking-tight">
              {tt('cashier_login_title') || `${BRAND_NAME} POS`}
            </CardTitle>
            <CardDescription>
              {tt('cashier_login_desc') || 'Enter your staff credentials to open the checkout register'}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {(localError || authError) && (
                <div className="p-3 text-sm rounded-lg bg-destructive/10 text-destructive border border-destructive/20 text-center font-medium">
                  {localError || authError}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {tt('email') || 'Staff Email'}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="cashier@store.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9 h-11"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {tt('password') || 'Passcode / Password'}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="••••••••"
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
                className="w-full h-11 text-base font-semibold transition-all mt-2"
                disabled={authLoading}
              >
                {authLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    {tt('loading') || 'Opening Register...'}
                  </>
                ) : (
                  tt('login_submit') || 'Open Register'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-muted-foreground/60 py-2">
        {BRAND_NAME} POS Terminal • Secure Handheld Checkout
      </footer>
    </div>
  );
}
