import { NextRequest, NextResponse } from 'next/server';
import { sessionFromRequest } from '@/lib/session';

export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === '/api/auth/login') return NextResponse.next();

  if (!sessionFromRequest(request)) {
    return NextResponse.json(
      { error: 'Autenticação necessária.' },
      { status: 401, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  return NextResponse.next();
}

export const config = { matcher: ['/api/:path*'] };
