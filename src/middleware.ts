import { NextRequest, NextResponse } from 'next/server';
import { sessionFromRequest } from './lib/session';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  // Apenas login é público. Logout exige sessão válida.
  if (path === '/api/auth/login') return NextResponse.next();
  const session = await sessionFromRequest(request);
  if (!session) return NextResponse.json({ error: 'Autenticação necessária.' }, { status: 401 });
  const headers = new Headers(request.headers);
  headers.delete('x-sgp-user-id');
  headers.delete('x-sgp-user-role');
  headers.set('x-sgp-user-id', session.id);
  headers.set('x-sgp-user-role', session.role);
  return NextResponse.next({ request: { headers } });
}
export const config = { matcher: ['/api/:path*'] };
