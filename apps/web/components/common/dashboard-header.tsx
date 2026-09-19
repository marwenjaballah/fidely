"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ThemeSwitcher } from "@/components/common/theme-switcher"
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
    router.push("/auth/login")
  }

  return (
    <header className="sticky top-0 z-40 border-b from-background/95 to-background/80 backdrop-blur-lg border-border/30 shadow-sm">
      <div className="flex h-12 sm:h-14 lg:h-16 items-center justify-between px-3 sm:px-6 lg:px-8 gap-2 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Badge
            variant="secondary"
            className="from-primary/10 to-primary/5 text-primary font-semibold px-2 sm:px-3 py-1 whitespace-nowrap text-xs"
          >
            {profile.role}
          </Badge>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 lg:gap-3 ml-auto">
          <div className="hidden sm:block">
            <LanguageSwitcher />
          </div>
          <ThemeSwitcher />

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
