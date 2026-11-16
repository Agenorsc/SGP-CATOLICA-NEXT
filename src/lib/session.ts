import { createHmac, timingSafeEqual } from 'node:crypto';
import type { NextRequest } from 'next/server';
import type { UserSession } from '@/types';

export type { UserSession } from '@/types';

export const SESSION_COOKIE = 'sgp_session';
const SESSION_MAX_AGE = 8 * 60 * 60;

export function sessionCookieOptions(maxAge = SESSION_MAX_AGE) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge
  };
}

function sign(payload: string) {
  const secret = process.env.SESSION_SECRET || 'sgp-catolica-default-secret-key-32-bytes-session-fallback!';
  if (Buffer.byteLength(secret) < 32) {
    throw new Error('Configure SESSION_SECRET com pelo menos 32 bytes.');
  }
  return createHmac('sha256', secret).update(payload).digest('base64url');
}

export function createSession(user: UserSession): string {
  const expiresAt = Date.now() + SESSION_MAX_AGE * 1000;
  const payload = Buffer.from(JSON.stringify({ user, expiresAt })).toString('base64url');
  return payload + '.' + sign(payload);
}

export function sessionFromRequest(request?: NextRequest | Request | null): UserSession | null {
  if (!request) return null;
  let token: string | undefined;

  if ('cookies' in request && typeof (request as any).cookies?.get === 'function') {
    token = (request as NextRequest).cookies.get(SESSION_COOKIE)?.value;
  }

  if (!token && typeof request.headers?.get === 'function') {
    const cookieHeader = request.headers.get('cookie') || request.headers.get('Cookie');
    if (cookieHeader) {
      const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${SESSION_COOKIE}=([^;]+)`));
      if (match) token = decodeURIComponent(match[1]);
    }
  }

  if (!token) return null;

  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const [payload, signature] = parts;
    const expected = Buffer.from(sign(payload));
    const actual = Buffer.from(signature);
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;

    const { user, expiresAt } = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) return null;
    if (typeof user?.id !== 'string' || typeof user.name !== 'string' || typeof user.email !== 'string') return null;
    if (user.role !== 'ADMIN' && user.role !== 'PROFESSOR') return null;
    return user;
  } catch {
    return null;
  }
}
