import { UserSession } from '@/types';

export class AuthService {
  async login(email: string, senha: string): Promise<UserSession> {
    const cleanEmail = (email || '').trim().toLowerCase();
    if (!cleanEmail || !senha) throw new Error('Informe o e-mail e a senha de acesso.');
    const response = await fetch('/api/auth/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cleanEmail, senha })
    });
    if (!response.ok) throw new Error('Credenciais inválidas ou serviço indisponível.');
    return response.json();
  }

  isAdmin(session: UserSession | null): boolean {
    return session?.role === 'ADMIN';
  }
}
