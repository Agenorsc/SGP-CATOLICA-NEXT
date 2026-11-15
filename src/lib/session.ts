import type { NextRequest } from 'next/server';

export const SESSION_COOKIE = 'sgp_session';
const encoder = new TextEncoder();
const TTL_SECONDS = 8 * 60 * 60;

export type SessionPayload = { id: string; name: string; email: string; role: 'ADMIN' | 'PROFESSOR'; exp: number };

function base64url(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}
function fromBase64url(value: string): Uint8Array {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '='));
  return Uint8Array.from(binary, c => c.charCodeAt(0));
}
async function key(): Promise<CryptoKey> {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) throw new Error('SESSION_SECRET deve ter pelo menos 32 caracteres.');
  return crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}
export async function createSession(user: Omit<SessionPayload, 'exp'>): Promise<string> {
  const payload: SessionPayload = { ...user, exp: Math.floor(Date.now() / 1000) + TTL_SECONDS };
  const encoded = base64url(encoder.encode(JSON.stringify(payload)));
  const signature = await crypto.subtle.sign('HMAC', await key(), encoder.encode(encoded));
  return encoded + '.' + base64url(new Uint8Array(signature));
}
export async function verifySession(token?: string): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const valid = await crypto.subtle.verify('HMAC', await key(), fromBase64url(parts[1]), encoder.encode(parts[0]));
    if (!valid) return null;
    const payload = JSON.parse(new TextDecoder().decode(fromBase64url(parts[0]))) as SessionPayload;
    if (!payload.id || !payload.email || !['ADMIN', 'PROFESSOR'].includes(payload.role) || !Number.isFinite(payload.exp) || payload.exp <= Date.now() / 1000) return null;
    return payload;
  } catch { return null; }
}
export function sessionFromRequest(request: NextRequest): Promise<SessionPayload | null> {
  return verifySession(request.cookies.get(SESSION_COOKIE)?.value);
}
export const SESSION_MAX_AGE = TTL_SECONDS;
