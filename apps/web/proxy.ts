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
  // Local development: pos.localhost, app.localhost, business.localhost, admin.localhost (with optional ports)
  let subdomain = ''
  const hostWithoutPort = hostname.split(':')[0].toLowerCase()

  if (hostWithoutPort.endsWith('.fidely.app')) {
    subdomain = hostWithoutPort.replace('.fidely.app', '')
  } else if (hostWithoutPort.endsWith('.localhost')) {
    subdomain = hostWithoutPort.replace('.localhost', '')
  }

  // 3. Subdomain Rewrites & Clean URL Enforcement
  if (subdomain === 'pos') {
    if (pathname.startsWith('/cashier')) {
      const cleanPath = pathname.replace(/^\/cashier/, '') || '/'
      return NextResponse.redirect(new URL(cleanPath, request.url))
    }
    return NextResponse.rewrite(
      new URL(`/cashier${pathname === '/' ? '' : pathname}`, request.url)
    )
  } else if (subdomain === 'app') {
    if (pathname.startsWith('/customer')) {
      const cleanPath = pathname.replace(/^\/customer/, '') || '/overview'
      return NextResponse.redirect(new URL(cleanPath, request.url))
    }
    return NextResponse.rewrite(
      new URL(`/customer${pathname === '/' ? '/overview' : pathname}`, request.url)
    )
  } else if (subdomain === 'business') {
    if (pathname.startsWith('/merchant')) {
      const cleanPath = pathname.replace(/^\/merchant/, '') || '/overview'
      return NextResponse.redirect(new URL(cleanPath, request.url))
    }
    return NextResponse.rewrite(
      new URL(`/merchant${pathname === '/' ? '/overview' : pathname}`, request.url)
    )
  } else if (subdomain === 'admin') {
    if (pathname.startsWith('/admin')) {
      const cleanPath = pathname.replace(/^\/admin/, '') || '/overview'
      return NextResponse.redirect(new URL(cleanPath, request.url))
    }
    return NextResponse.rewrite(
      new URL(`/admin${pathname === '/' ? '/overview' : pathname}`, request.url)
    )
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
