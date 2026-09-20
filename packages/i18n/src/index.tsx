"use client"

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import { en, type TranslationKey } from './locales/en'
import { ar } from './locales/ar'
import { fr } from './locales/fr'
import { type Locale, type Direction, LOCALES, DEFAULT_LOCALE, type LocaleConfig } from './types'

export * from './types'
export { type TranslationKey } from './locales/en'

const dictionaries: Record<Locale, Record<TranslationKey, string>> = {
  en,
  ar,
  fr,
}

interface I18nContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  dir: Direction
  isRtl: boolean
  locales: Record<Locale, LocaleConfig>
  currentLocaleConfig: LocaleConfig
  t: (key: TranslationKey, params?: Record<string, string | number>) => string
}

const I18nContext = createContext<I18nContextType | null>(null)

const STORAGE_KEY = 'fidely_locale'
const COOKIE_KEY = 'NEXT_LOCALE'

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY) as Locale | null
      if (saved && (saved === 'en' || saved === 'ar' || saved === 'fr')) {
        return saved
      }
      // Check browser language
      const navLang = navigator.language?.toLowerCase()
      if (navLang?.startsWith('ar')) return 'ar'
      if (navLang?.startsWith('fr')) return 'fr'
    }
    return DEFAULT_LOCALE
  })

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale)
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, newLocale)
      document.cookie = `${COOKIE_KEY}=${newLocale}; path=/; max-age=31536000; SameSite=Lax`
      document.documentElement.lang = newLocale
      document.documentElement.dir = LOCALES[newLocale].dir
    }
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.lang = locale
      document.documentElement.dir = LOCALES[locale].dir
    }
  }, [locale])

  const dir = LOCALES[locale]?.dir || 'ltr'
  const isRtl = dir === 'rtl'
  const currentLocaleConfig = LOCALES[locale] || LOCALES.en

  const t = useCallback(
    (key: TranslationKey, params?: Record<string, string | number>): string => {
      const activeDict = dictionaries[locale] || dictionaries.en
      const fallbackDict = dictionaries.en
      let str = (activeDict && activeDict[key]) || (fallbackDict && fallbackDict[key]) || (key as string)

      if (params) {
        Object.entries(params).forEach(([paramKey, paramVal]) => {
          str = str.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramVal))
        })
      }

      return str
    },
    [locale]
  )

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      dir,
      isRtl,
      locales: LOCALES,
      currentLocaleConfig,
      t,
    }),
    [locale, setLocale, dir, isRtl, currentLocaleConfig, t]
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n(): I18nContextType {
  const context = useContext(I18nContext)
  if (!context) {
    // Return safe fallback if used outside provider (e.g. initial SSR before hydration)
    return {
      locale: DEFAULT_LOCALE,
      setLocale: () => {},
      dir: 'ltr',
      isRtl: false,
      locales: LOCALES,
      currentLocaleConfig: LOCALES.en,
      t: (key: TranslationKey, params?: Record<string, string | number>) => {
        const fallbackDict = dictionaries.en
        let str = (fallbackDict && fallbackDict[key]) || (key as string)
        if (params) {
          Object.entries(params).forEach(([paramKey, paramVal]) => {
            str = str.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramVal))
          })
        }
        return str
      },
    }
  }
  return context
}
