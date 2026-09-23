/**
 * Helper to compute the absolute destination URL for each role across subdomains.
 * Supports both local development (*.localhost with port preservation) and production (*.fidely.app).
 * Optionally attaches cross-subdomain SSO tokens for instantaneous, zero-friction auth handoff.
 */
export interface RoleRedirectOptions {
  tokens?: {
    accessToken?: string | null
    refreshToken?: string | null
  }
}

export function getRoleRedirectUrl(role?: string | null, options?: RoleRedirectOptions): string {
  const isBrowser = typeof window !== 'undefined'
  const hostname = isBrowser ? window.location.hostname.toLowerCase() : ''
  const port = isBrowser ? window.location.port : ''
  const protocol = isBrowser ? window.location.protocol : 'http:'

  const isLocal =
    isBrowser
      ? hostname === 'localhost' ||
        hostname === '127.0.0.1' ||
        hostname.endsWith('.localhost')
      : process.env.NODE_ENV !== 'production'

  const portSuffix = port && port !== '80' && port !== '443' ? `:${port}` : ''

  // Determine base origin per role
  let targetOrigin = ''
  let defaultPath = '/'

  if (isLocal) {
    switch (role) {
      case 'SUPER_ADMIN':
        targetOrigin = `http://admin.localhost${portSuffix}`
        defaultPath = '/overview'
        break
      case 'CASHIER':
        targetOrigin = `http://pos.localhost${portSuffix}`
        defaultPath = '/'
        break
      case 'CUSTOMER':
        targetOrigin = `http://app.localhost${portSuffix}`
        defaultPath = '/overview'
        break
      case 'MERCHANT':
      default:
        targetOrigin = `http://business.localhost${portSuffix}`
        defaultPath = '/overview'
        break
    }
  } else {
    // Production subdomains
    switch (role) {
      case 'SUPER_ADMIN':
        targetOrigin = 'https://admin.fidely.app'
        defaultPath = '/overview'
        break
      case 'CASHIER':
        targetOrigin = 'https://pos.fidely.app'
        defaultPath = '/'
        break
      case 'CUSTOMER':
        targetOrigin = 'https://app.fidely.app'
        defaultPath = '/overview'
        break
      case 'MERCHANT':
      default:
        targetOrigin = 'https://business.fidely.app'
        defaultPath = '/overview'
        break
    }
  }

  // Cross-subdomain SSO token handoff:
  // If tokens are provided and target origin is different from current origin,
  // hand off via /auth/callback on the target domain to hydrate localStorage.
  const currentOrigin = isBrowser ? `${protocol}//${hostname}${portSuffix}` : ''
  const isCrossDomain = isBrowser && targetOrigin && targetOrigin !== currentOrigin

  if (isCrossDomain && options?.tokens?.accessToken) {
    const params = new URLSearchParams()
    params.set('sso', '1')
    params.set('access_token', options.tokens.accessToken)
    if (options.tokens.refreshToken) {
      params.set('refresh_token', options.tokens.refreshToken)
    }
    return `${targetOrigin}/auth/callback?${params.toString()}`
  }

  // If already on target origin or no tokens to hand off, redirect to default path on target
  if (isBrowser && targetOrigin === currentOrigin) {
    return defaultPath
  }

  return `${targetOrigin}${defaultPath}`
}
