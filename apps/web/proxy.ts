import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const AUTH_PATHS = ['/auth/login', '/auth/sign-up', '/auth/forgot-password', '/auth/reset-password'];

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const role = request.cookies.get('user_role')?.value;
  const accessToken = request.cookies.get('access_token')?.value;
  const isAuthenticated = Boolean(role || accessToken);

  // 1. If authenticated user tries to access login or sign-up, redirect to appropriate portal
  if (isAuthenticated && AUTH_PATHS.some((p) => pathname.startsWith(p))) {
    if (role === 'SUPER_ADMIN') {
      return NextResponse.redirect(new URL('/admin/overview', request.url));
    }
    if (role === 'CASHIER') {
      return NextResponse.redirect(new URL('/cashier', request.url));
    }
    if (role === 'CUSTOMER') {
      return NextResponse.redirect(new URL('/customer/overview', request.url));
    }
    return NextResponse.redirect(new URL('/merchant/overview', request.url));
  }

  // 2. Merchant routes guard
  if (pathname.startsWith('/merchant')) {
    if (!isAuthenticated) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (role !== 'MERCHANT' && role !== 'SUPER_ADMIN') {
      if (role === 'CASHIER') {
        return NextResponse.redirect(new URL('/cashier', request.url));
      }
      return NextResponse.redirect(new URL('/customer/overview', request.url));
    }
  }

  // 3. Cashier routes guard
  if (pathname.startsWith('/cashier')) {
    if (!isAuthenticated) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (role !== 'CASHIER' && role !== 'MERCHANT' && role !== 'SUPER_ADMIN') {
      return NextResponse.redirect(new URL('/customer/overview', request.url));
    }
  }

  // 4. Customer routes guard
  if (pathname.startsWith('/customer')) {
    if (!isAuthenticated) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 5. Admin routes guard
  if (pathname.startsWith('/admin')) {
    if (!isAuthenticated) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (role !== 'SUPER_ADMIN') {
      return NextResponse.redirect(new URL('/overview', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api routes (/api/*)
     * - static files (_next/static, _next/image, favicon.ico, icons, etc.)
     * - public manifest and assets
     */
    '/((?!api|_next/static|_next/image|favicon.ico|manifest.webmanifest|sw.js|icon.svg|icon-.*|apple-touch-icon.png|opengraph-image|docs|terms|privacy).*)',
  ],
};
