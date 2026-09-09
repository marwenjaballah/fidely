"use client"

import { useEffect, useState } from "react"
import { usePreferencesStore } from "@/store/preferences-store"

function computeResolved(theme: "light" | "dark" | "system"): "light" | "dark" {
  if (theme === "dark") return "dark"
  if (theme === "light") return "light"
  if (typeof window === "undefined") return "light"
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

/**
 * Effective light/dark appearance: follows `system` via `prefers-color-scheme` until the user sets an explicit theme.
 */
export function useResolvedTheme(): "light" | "dark" {
  const theme = usePreferencesStore((s) => s.theme)
  const [resolved, setResolved] = useState<"light" | "dark">("light")

  useEffect(() => {
    setResolved(computeResolved(theme))
  }, [theme])

  useEffect(() => {
    if (theme !== "system") return
    const mq = window.matchMedia("(prefers-color-scheme: dark)")
    const onChange = () => setResolved(computeResolved("system"))
    mq.addEventListener("change", onChange)
    return () => mq.removeEventListener("change", onChange)
  }, [theme])

  return resolved
}
