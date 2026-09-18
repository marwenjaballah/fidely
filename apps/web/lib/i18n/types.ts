export type Locale = 'en' | 'ar' | 'fr'
export type Direction = 'ltr' | 'rtl'

export interface LocaleConfig {
  code: Locale
  name: string
  nativeName: string
  flag: string
  dir: Direction
}

export const LOCALES: Record<Locale, LocaleConfig> = {
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    dir: 'ltr',
  },
  ar: {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    flag: '🇸🇦',
    dir: 'rtl',
  },
  fr: {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
    dir: 'ltr',
  },
}

export const DEFAULT_LOCALE: Locale = 'en'
