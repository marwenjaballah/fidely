"use client"

import { Moon, Sun } from "lucide-react"
import { Toggle } from "@/components/ui/toggle"
import { usePreferencesStore } from "@/store/preferences-store"
import { strings } from "@/lib/strings"
import { useResolvedTheme } from "@/hooks/use-resolved-theme"
import { cn } from "@/lib/utils"

type ThemeToggleButtonProps = {
  className?: string
}

/**
 * Toggle between light and dark. Stored default is `system` (see preferences store); the control shows Sun/Moon for
 * resolved appearance (system follows the OS). First interaction sets an explicit light or dark preference.
 */
export function ThemeToggleButton({ className }: ThemeToggleButtonProps) {
  const setTheme = usePreferencesStore((s) => s.setTheme)
  const resolved = useResolvedTheme()

  const ariaLabel = resolved === "dark" ? strings.theme_switch_to_light : strings.theme_switch_to_dark

  return (
    <Toggle
      variant="outline"
      pressed={resolved === "dark"}
      onPressedChange={(on) => setTheme(on ? "dark" : "light")}
      aria-label={ariaLabel}
      className={cn(
        "h-9 w-9 shrink-0 rounded-md border-border/80 p-0 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground",
        className
      )}
    >
      {resolved === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
    </Toggle>
  )
}
