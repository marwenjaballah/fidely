"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ThemeToggleButton } from "@/components/common/theme-toggle-button"
import { strings } from "@/lib/strings"
import { useAuth } from "@/features/auth/hooks/use-auth"

import { LanguageSwitcher } from "@/components/common/language-switcher"
import { useI18n } from "@/lib/i18n"

export function DashboardHeader() {
  const router = useRouter()
  const { profile, signOut } = useAuth()
  const { t } = useI18n()

  if (!profile) {
    return null
  }

  const handleLogout = () => {
    signOut()
    router.push("/login")
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 sm:h-16 items-center border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-3 sm:px-4 lg:px-6 transition-all duration-200">
      <div className="flex flex-1 items-center justify-between gap-2 min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs sm:text-sm font-semibold truncate text-foreground">
            {profile.full_name || profile.email}
          </span>
          <Badge
            variant="outline"
            className="text-[10px] sm:text-xs font-mono font-medium border-border/40 bg-background/50 text-foreground shrink-0"
          >
            {profile.role}
          </Badge>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 lg:gap-3 ml-auto">
          <div className="hidden sm:block">
            <LanguageSwitcher />
          </div>
          <ThemeToggleButton />

          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="hover:bg-destructive/10 hover:text-destructive transition-all duration-200 text-foreground/70 h-8 sm:h-9 px-2 sm:px-3"
          >
            <span className="hidden sm:inline">{t('logout')}</span>
            <LogOut className="w-4 h-4 sm:ml-2 shrink-0" />
          </Button>
        </div>
      </div>
    </header>
  )
}
