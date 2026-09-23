import type { UserRole } from '@/lib/db-types'

export interface OAuthContext {
  intent: 'login' | 'signup'
  role?: UserRole
  referredByStoreId?: string
}

const OAUTH_CONTEXT_KEY = 'fidely_oauth_context'

export function saveOAuthContext(context: OAuthContext): void {
  if (typeof window === 'undefined') return
  try {
    const raw = JSON.stringify(context)
    sessionStorage.setItem(OAUTH_CONTEXT_KEY, raw)
    localStorage.setItem(OAUTH_CONTEXT_KEY, raw)
  } catch {}
}

export function getOAuthContext(): OAuthContext | null {
  if (typeof window === 'undefined') return null
  try {
    const sessionData = sessionStorage.getItem(OAUTH_CONTEXT_KEY)
    if (sessionData) return JSON.parse(sessionData) as OAuthContext

    const localData = localStorage.getItem(OAUTH_CONTEXT_KEY)
    if (localData) return JSON.parse(localData) as OAuthContext
  } catch {}
  return null
}

export function clearOAuthContext(): void {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.removeItem(OAUTH_CONTEXT_KEY)
    localStorage.removeItem(OAUTH_CONTEXT_KEY)
  } catch {}
}
