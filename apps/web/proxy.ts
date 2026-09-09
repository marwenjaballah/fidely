import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
// Ensure to import your authentication utilities to verify user roles.
// For now, this is a scaffold to protect the new route groups.

export default function proxy(request: NextRequest) {
  const url = request.nextUrl.clone();
  
  // Here you would extract the user's role from their token/session.
  // const role = await getUserRole(request);
  const role = request.cookies.get('user_role')?.value || 'UNAUTHENTICATED';

  // 1. Super Admin Routes
  if (url.pathname.startsWith('/admin')) {
    if (role !== 'SUPER_ADMIN') {
      url.pathname = '/auth/login';
      return NextResponse.redirect(url);
    }
  }

  // 2. Merchant Routes
  if (url.pathname.startsWith('/merchant')) {
    if (role !== 'MERCHANT' && role !== 'SUPER_ADMIN') {
      url.pathname = '/auth/login';
      return NextResponse.redirect(url);
    }
  }

  // 3. Cashier Routes
  if (url.pathname.startsWith('/cashier')) {
    if (role !== 'CASHIER' && role !== 'MERCHANT' && role !== 'SUPER_ADMIN') {
      url.pathname = '/auth/login';
      return NextResponse.redirect(url);
    }
  }

  // 4. Customer PWA - /store/[slug] is generally public for viewing, but actions require CUSTOMER
  // (We don't strictly block viewing the store page, but you can configure this as needed)

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets
     */
    '/((?!api|_next/static|_next/image|favicon.ico|manifest.ts|icon.svg|opengraph-image|docs|auth|privacy|terms).*)',
  ],
};
