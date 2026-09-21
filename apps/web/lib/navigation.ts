/**
 * Helper to compute the destination URL for each role across the multi-app ecosystem.
 * Works seamlessly in both Client Components and Server Components.
 */
export function getRoleRedirectUrl(role?: string | null): string {
  const isLocal =
    typeof window !== 'undefined'
      ? window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      : process.env.NODE_ENV !== 'production'

  switch (role) {
    case 'SUPER_ADMIN':
      return isLocal ? 'http://localhost:3005/overview' : 'https://admin.fidely.app/overview'
    case 'CASHIER':
      return isLocal ? 'http://localhost:3003' : 'https://pos.fidely.app'
    case 'CUSTOMER':
      return isLocal ? 'http://localhost:3002' : 'https://app.fidely.app'
    case 'MERCHANT':
    default:
      return isLocal ? 'http://localhost:3004/overview' : 'https://business.fidely.app/overview'
  }
}
