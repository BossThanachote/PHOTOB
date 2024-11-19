// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const authToken = request.cookies.get('auth_token');
  const currentSession = request.cookies.get('currentSession');
  
  const protectedPaths = [
    '/admin/dashboard',
    '/admin/management',
    '/admin/machine',
    '/admin/photo'
  ];

  const isProtectedRoute = protectedPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  );

  const isAuthenticated = () => {
    if (!authToken || !currentSession) return false;

    try {
      const session = JSON.parse(currentSession.value);
      if (!session.email || session.email !== 'loginkoakod@hotmail.com') {
        return false;
      }
      if (authToken.value !== 'mock_jwt_token') {
        return false;
      }
      return true;
    } catch {
      return false;
    }
  };

  // ถ้าเป็น protected route และไม่ผ่านการตรวจสอบ
  if (isProtectedRoute && !isAuthenticated()) {
    const response = NextResponse.redirect(new URL('/admin/signin', request.url));
    // ลบ cookies ที่ไม่ถูกต้องทิ้ง
    response.cookies.delete('auth_token');
    response.cookies.delete('currentSession');
    return response;
  }

  // ถ้า login แล้วพยายามเข้าหน้า signin/signup
  if (isAuthenticated() && (
    request.nextUrl.pathname === '/admin/signin' || 
    request.nextUrl.pathname === '/admin/signup'
  )) {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};