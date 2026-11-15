import { NextRequest, NextResponse } from 'next/server';
import { sessionFromRequest } from '@/lib/session';

export function GET(request: NextRequest) {
  const headers = { 'Cache-Control': 'no-store' };
  const session = sessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: 'Autenticação necessária.' }, { status: 401, headers });
  }
  return NextResponse.json(session, { headers });
}
