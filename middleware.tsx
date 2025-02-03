"use client";
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const token = req.cookies.get('authToken')?.value || '';
 
  // Check if the path doesn't start with '/login' or '/register' and no token is present
  if (
    !req.nextUrl.pathname.startsWith('/login') &&
    !req.nextUrl.pathname.startsWith('/register') &&
    !token
  ) {
    // Redirect to login if there's no token and the path is not login/register
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/report/:path*', ], 
};

