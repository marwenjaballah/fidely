"use client"

import * as React from "react"
import { Globe, Check } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { useI18n, type Locale } from "@/lib/i18n"
import { cn } from "@/lib/utils"

interface LanguageSwitcherProps {
  className?: string
  variant?: "outline" | "ghost" | "default"
  size?: "default" | "sm" | "lg" | "icon"
  showText?: boolean
}

export function LanguageSwitcher({
  className,
  variant = "outline",
  size = "sm",
  showText = false,
}: LanguageSwitcherProps) {
  const { locale, setLocale, locales, t } = useI18n()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={showText ? size : "icon"}
          className={cn(
            "rounded-xl border-border/70 font-semibold gap-1.5 transition-all text-xs",
            !showText && "h-9 w-9 p-0",
            className
          )}
          aria-label={t('select_language')}
        >
          <Globe className="h-4 w-4 shrink-0 text-muted-foreground" />
          {showText && (
            <span className="truncate flex items-center gap-1.5">
              <span>{locales[locale]?.flag}</span>
              <span>{locales[locale]?.nativeName}</span>
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[150px] rounded-xl p-1 shadow-lg border-border/80">
        {(Object.keys(locales) as Locale[]).map((code) => {
          const item = locales[code]
          const isSelected = locale === code
          return (
            <DropdownMenuItem
              key={code}
              onClick={() => setLocale(code)}
              className={cn(
                "flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg cursor-pointer transition-colors",
                isSelected ? "bg-primary/10 text-primary font-bold" : "hover:bg-muted"
              )}
            >
              <div className="flex items-center gap-2">
                <span className="text-base leading-none">{item.flag}</span>
                <span>{item.nativeName}</span>
              </div>
              {isSelected && <Check className="h-3.5 w-3.5 text-primary" />}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
