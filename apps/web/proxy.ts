import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
// Ensure to import your authentication utilities to verify user roles.
// For now, this is a scaffold to protect the new route groups.

export default function proxy(request: NextRequest) {
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
