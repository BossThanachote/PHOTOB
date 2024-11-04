import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const authToken = request.cookies.get('auth_token');
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin/dashboard');

  if (isAdminRoute && !authToken) {
    return NextResponse.redirect(new URL('/admin/signin', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
};