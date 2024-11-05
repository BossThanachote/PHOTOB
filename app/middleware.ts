// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // ดึง token และ session
  const authToken = request.cookies.get('auth_token');
  const currentSession = request.cookies.get('currentSession');
  
  // ตรวจสอบทุกเส้นทางที่ต้องการการยืนยันตัวตน
  const protectedPaths = [
    '/admin/dashboard',
    '/admin/management',
    '/admin/machine',
    '/admin/photo'
  ];

  const isProtectedRoute = protectedPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  );

  // ตรวจสอบว่า token และ session ถูกต้องและมาจากการ login จริง
  const isAuthenticated = () => {
    if (!authToken || !currentSession) return false;

    try {
      // ตรวจสอบว่า currentSession มีรูปแบบที่ถูกต้อง
      const session = JSON.parse(currentSession.value);
      // ตรวจสอบว่ามี email ที่ถูกต้อง
      if (!session.email || session.email !== 'loginkoakod@hotmail.com') {
        return false;
      }
      // ตรวจสอบว่า token ตรงกับที่กำหนด
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
    // ลบ cookies ที่ไม่ถูกต้องทิ้ง
    const response = NextResponse.redirect(new URL('/admin/signin', request.url));
    response.cookies.delete('auth_token');
    response.cookies.delete('currentSession');
    return response;
  }

  // ถ้าเข้าสู่ระบบแล้วและพยายามเข้าหน้า signin/signup
  if (isAuthenticated() && (
    request.nextUrl.pathname === '/admin/signin' || 
    request.nextUrl.pathname === '/admin/signup'
  )) {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
  ],
};