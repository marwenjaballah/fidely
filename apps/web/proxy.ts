import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export default function proxy(request: NextRequest) {
  const url = request.nextUrl
  const hostname = request.headers.get('host') || ''
  const pathname = url.pathname

  // 1. Skip Next.js internals, APIs, static assets, and auth gateway
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/auth') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') // manifest.webmanifest, sw.js, images, icons, etc.
  ) {
    return NextResponse.next()
  }

  // 2. Extract Subdomain
  // Production hosts: pos.fidely.app, app.fidely.app, business.fidely.app, admin.fidely.app, fidely.app
  // Local development: pos.localhost:3001, app.localhost:3001, etc.
  let subdomain = ''
  const hostWithoutPort = hostname.split(':')[0].toLowerCase()

  if (hostWithoutPort.endsWith('.fidely.app')) {
    subdomain = hostWithoutPort.replace('.fidely.app', '')
  } else if (hostWithoutPort.endsWith('.localhost')) {
    subdomain = hostWithoutPort.replace('.localhost', '')
  }

  // 3. Subdomain Rewrites
  if (subdomain === 'pos') {
    if (!pathname.startsWith('/cashier')) {
      return NextResponse.rewrite(
        new URL(`/cashier${pathname === '/' ? '' : pathname}`, request.url)
      )
    }
  } else if (subdomain === 'app') {
    if (!pathname.startsWith('/customer')) {
      return NextResponse.rewrite(
        new URL(`/customer${pathname === '/' ? '/overview' : pathname}`, request.url)
      )
    }
  } else if (subdomain === 'business') {
    if (!pathname.startsWith('/merchant')) {
      return NextResponse.rewrite(
        new URL(`/merchant${pathname === '/' ? '/overview' : pathname}`, request.url)
      )
    }
  } else if (subdomain === 'admin') {
    if (!pathname.startsWith('/admin')) {
      return NextResponse.rewrite(
        new URL(`/admin${pathname === '/' ? '/overview' : pathname}`, request.url)
      )
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, images, icons, manifests, sw.js
     */
    '/((?!api|_next/static|_next/image|favicon.ico|manifest.*|sw.js|icon.*|apple-touch-icon.*).*)',
  ],
}
