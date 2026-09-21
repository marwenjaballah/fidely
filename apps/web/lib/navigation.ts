/**
 * Helper to compute the destination URL for each role.
 * In local development: routes directly within the same server (zero port mismatch).
 * In production: routes to the respective custom subdomain (pos.fidely.app, business.fidely.app, etc.).
 */
export function getRoleRedirectUrl(role?: string | null): string {
  const isLocal =
    typeof window !== 'undefined'
      ? window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        window.location.hostname.endsWith('.localhost')
      : process.env.NODE_ENV !== 'production'

  if (isLocal) {
    switch (role) {
      case 'SUPER_ADMIN':
        return '/admin/overview'
      case 'CASHIER':
        return '/cashier'
      case 'CUSTOMER':
        return '/customer/overview'
      case 'MERCHANT':
      default:
        return '/merchant/overview'
    }
  }

  // Production subdomains
  switch (role) {
    case 'SUPER_ADMIN':
      return 'https://admin.fidely.app'
    case 'CASHIER':
      return 'https://pos.fidely.app'
    case 'CUSTOMER':
      return 'https://app.fidely.app'
    case 'MERCHANT':
    default:
      return 'https://business.fidely.app'
  }
}
