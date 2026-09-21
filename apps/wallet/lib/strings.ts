/**
 * Default strings and types for backward compatibility.
 * Prefer `useI18n()` hook inside components for full multi-language and RTL support.
 */
import { en, type TranslationKey } from '@repo/i18n'

export const strings = en
export type StringKey = TranslationKey
export * from './i18n'
