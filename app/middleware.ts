// import { NextResponse } from 'next/server';
// import type { NextRequest } from 'next/server';

// export function middleware(request: NextRequest) {
//   const authToken = request.cookies.get('auth_token')?.value;

//   const protectedPaths = [
//     '/admin/dashboard',
//     '/admin/management',
//     '/admin/machine',
//     '/admin/photo'
//   ];

//   const isProtectedRoute = protectedPaths.some(path => 
//     request.nextUrl.pathname.startsWith(path)
//   );

//   if (isProtectedRoute && !authToken) {
//     return NextResponse.redirect(new URL('/admin/signin', request.url));
//   }

//   // ถ้ามี token และพยายามเข้าหน้า signin/signup
//   if (authToken && (
//     request.nextUrl.pathname === '/admin/signin' || 
//     request.nextUrl.pathname === '/admin/signup'
//   )) {
//     return NextResponse.redirect(new URL('/admin/dashboard', request.url));
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: ['/admin/:path*']
// };

// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // ลบหรือ Comment Logic การเช็ก Token ออกให้หมด
  return NextResponse.next(); 
}

// ลบ matcher ออกด้วยเพื่อให้ไม่มีการดักจับหน้าไหนเลย
export const config = {
  matcher: [], 
};