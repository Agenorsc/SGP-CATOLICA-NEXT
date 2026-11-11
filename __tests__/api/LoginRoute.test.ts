/** @jest-environment node */

import { POST } from '@/app/api/auth/login/route';
import { prisma } from '@/lib/prisma';
import { hashPasswordSync } from '@/lib/password';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    usuario: {
      findUnique: jest.fn(),
      upsert: jest.fn()
    }
  }
}));

const mockFindUnique = prisma.usuario.findUnique as jest.Mock;
const mockUpsert = prisma.usuario.upsert as jest.Mock;

describe('POST /api/auth/login', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve autenticar com sucesso usuário com hash Bcrypt', async () => {
    const usuarioBanco = {
      id: 'usr-1',
      nome: 'Prof. Teste',
      email: 'teste@catolica.edu.br',
      senha: hashPasswordSync('SenhaForte@2026'),
      role: 'PROFESSOR',
      disciplina: 'Segurança'
    };

    mockFindUnique.mockResolvedValue(usuarioBanco);

    const req = new Request('http://localhost/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'teste@catolica.edu.br',
        senha: 'SenhaForte@2026'
      })
    });

    const response = await POST(req);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.email).toBe('teste@catolica.edu.br');
    expect(body.name).toBe('Prof. Teste');
    // Nunca deve vazar a senha na resposta
    expect(body.senha).toBeUndefined();
  });

  it('deve manter retrocompatibilidade com senha em texto plano e auto-migrar para Bcrypt', async () => {
    const usuarioBanco = {
      id: 'usr-legado',
      nome: 'Prof. Legado',
      email: 'legado@catolica.edu.br',
      senha: 'minhaSenhaPlana',
      role: 'PROFESSOR',
      disciplina: 'Física'
    };

    mockFindUnique.mockResolvedValue(usuarioBanco);
    mockUpsert.mockResolvedValue({
      ...usuarioBanco,
      senha: hashPasswordSync('minhaSenhaPlana')
    });

    const req = new Request('http://localhost/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'legado@catolica.edu.br',
        senha: 'minhaSenhaPlana'
      })
    });

    const response = await POST(req);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.email).toBe('legado@catolica.edu.br');
    expect(mockUpsert).toHaveBeenCalled();
  });

  it('deve retornar 401 quando a senha estiver incorreta', async () => {
    const usuarioBanco = {
      id: 'usr-1',
      nome: 'Prof. Teste',
      email: 'teste@catolica.edu.br',
      senha: hashPasswordSync('SenhaForte@2026'),
      role: 'PROFESSOR'
    };

    mockFindUnique.mockResolvedValue(usuarioBanco);

    const req = new Request('http://localhost/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'teste@catolica.edu.br',
        senha: 'SenhaErrada'
      })
    });

    const response = await POST(req);
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toContain('Senha incorreta');
  });

  it('deve retornar 400 se e-mail ou senha não forem informados', async () => {
    const req = new Request('http://localhost/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: '',
        senha: ''
      })
    });

    const response = await POST(req);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toContain('Informe e-mail e senha');
  });
});
