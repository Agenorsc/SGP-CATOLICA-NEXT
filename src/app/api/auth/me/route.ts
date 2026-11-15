import { NextRequest, NextResponse } from 'next/server';
import { sessionFromRequest } from '@/lib/session';
export async function GET(request: NextRequest) {
  const session = await sessionFromRequest(request);
  if (!session) return NextResponse.json({ error: 'Sessão expirada.' }, { status: 401 });
  return NextResponse.json({ id: session.id, email: session.email, role: session.role }, { headers: { 'Cache-Control': 'no-store' } });
}
