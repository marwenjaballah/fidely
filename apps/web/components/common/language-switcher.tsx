"use client"

import * as React from "react"
import { Globe, Check, ChevronDown } from "lucide-react"
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
  variant?: "outline" | "ghost" | "default" | "secondary"
  size?: "default" | "sm" | "lg" | "icon"
  showText?: boolean
  showFlagOnly?: boolean
}

export function LanguageSwitcher({
  className,
  variant = "outline",
  size = "sm",
  showText = true,
  showFlagOnly = false,
}: LanguageSwitcherProps) {
  const { locale, setLocale, locales, t } = useI18n()
  const current = locales[locale] || locales.en

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={showFlagOnly ? "icon" : size}
          className={cn(
            "rounded-xl border-border/70 font-semibold gap-1.5 transition-all text-xs h-9 px-2.5 shadow-xs hover:border-primary/40 hover:bg-muted/60",
            showFlagOnly && "w-9 px-0 justify-center",
            className
          )}
          aria-label={t('select_language')}
        >
          <span className="text-base leading-none select-none">{current.flag}</span>
          {!showFlagOnly && showText && (
            <span className="font-bold text-xs uppercase tracking-wider text-foreground">
              {current.code}
            </span>
          )}
          <ChevronDown className="h-3 w-3 opacity-60 shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[160px] rounded-xl p-1 shadow-lg border-border/80 z-50 bg-popover/95 backdrop-blur-md">
        {(Object.keys(locales) as Locale[]).map((code) => {
          const item = locales[code]
          const isSelected = locale === code
          return (
            <DropdownMenuItem
              key={code}
              onClick={() => setLocale(code)}
              className={cn(
                "flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg cursor-pointer transition-colors",
                isSelected ? "bg-primary/15 text-primary font-bold" : "hover:bg-muted"
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
