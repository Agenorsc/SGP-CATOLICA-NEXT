/** @jest-environment node */

import { NextRequest } from 'next/server';
import { GET as profile } from '@/app/api/auth/me/route';
import { POST as logout } from '@/app/api/auth/logout/route';
import { createSession, SESSION_COOKIE } from '@/lib/session';
import { proxy } from '@/proxy';

const user = {
  id: 'prof-teste',
  name: 'Professor Teste',
  email: 'prof@example.test',
  role: 'PROFESSOR' as const,
  disciplina: 'Engenharia de Software'
};

function request(path: string, token?: string) {
  return new NextRequest('http://localhost' + path, {
    headers: token ? { cookie: SESSION_COOKIE + '=' + token } : undefined
  });
}

describe('Sessão nas APIs', () => {
  const originalSecret = process.env.SESSION_SECRET;

  beforeEach(() => {
    process.env.SESSION_SECRET = 'test-only-session-secret-for-proxy-tests';
  });

  afterEach(() => {
    jest.restoreAllMocks();
    if (originalSecret === undefined) delete process.env.SESSION_SECRET;
    else process.env.SESSION_SECRET = originalSecret;
  });

  it('permite login e exige sessão nas demais rotas', () => {
    expect(proxy(request('/api/auth/login')).headers.get('x-middleware-next')).toBe('1');
    for (const path of ['/api/turmas', '/api/auth/me', '/api/auth/logout', '/api/auth/trocar-senha']) {
      expect(proxy(request(path)).status).toBe(401);
    }
  });

  it('permite requisição autenticada e restaura o perfil completo', async () => {
    const token = createSession(user);
    expect(proxy(request('/api/turmas', token)).headers.get('x-middleware-next')).toBe('1');
    const response = profile(request('/api/auth/me', token));
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(await response.json()).toEqual(user);
  });

  it('rejeita sessão adulterada e expirada', () => {
    const token = createSession(user);
    expect(proxy(request('/api/turmas', token + 'a')).status).toBe(401);
    jest.spyOn(Date, 'now').mockReturnValue(Date.now() + 8 * 60 * 60 * 1000);
    expect(proxy(request('/api/turmas', token)).status).toBe(401);
  });

  it('expira o cookie no logout', () => {
    const response = logout();
    expect(response.status).toBe(200);
    expect(response.headers.get('set-cookie')).toContain(SESSION_COOKIE + '=;');
    expect(response.headers.get('set-cookie')).toContain('Max-Age=0');
  });
});
