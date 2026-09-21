/**
 * Helper to compute the destination URL for each role across the multi-app ecosystem.
 */
export function getRoleRedirectUrl(role?: string | null): string {
  const isLocal =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1')

  switch (role) {
    case 'SUPER_ADMIN':
      return isLocal ? 'http://localhost:3005/overview' : 'https://admin.fidely.app/overview'
    case 'CASHIER':
      return isLocal ? 'http://localhost:3003' : 'https://pos.fidely.app'
    case 'CUSTOMER':
      return isLocal ? 'http://localhost:3002/overview' : 'https://app.fidely.app/overview'
    case 'MERCHANT':
    default:
      return isLocal ? 'http://localhost:3004/overview' : 'https://business.fidely.app/overview'
  }
}
