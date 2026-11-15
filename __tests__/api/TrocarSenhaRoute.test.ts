/** @jest-environment node */

import { POST } from '@/app/api/auth/trocar-senha/route';
import { prisma } from '@/lib/prisma';
import { hashPasswordSync } from '@/lib/password';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    usuario: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      upsert: jest.fn(),
      delete: jest.fn()
    }
  }
}));

const mockFindUnique = prisma.usuario.findUnique as jest.Mock;
const mockUpsert = prisma.usuario.upsert as jest.Mock;

describe('POST /api/auth/trocar-senha', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve retornar 200 e alterar a senha com sucesso quando os dados forem válidos', async () => {
    const usuarioBanco = {
      id: 'usr-1',
      nome: 'Prof. Teste',
      email: 'teste@catolica.edu.br',
      senha: hashPasswordSync('SenhaAtual@123'),
      role: 'PROFESSOR',
      disciplina: 'Testes',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    mockFindUnique.mockResolvedValue(usuarioBanco);
    mockUpsert.mockResolvedValue({
      ...usuarioBanco,
      senha: hashPasswordSync('NovaSenhaForte@456')
    });

    const req = new Request('http://localhost/api/auth/trocar-senha', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        usuarioId: 'usr-1',
        senhaAtual: 'SenhaAtual@123',
        novaSenha: 'NovaSenhaForte@456',
        confirmacaoNovaSenha: 'NovaSenhaForte@456'
      })
    });

    const response = await POST(req);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.message).toContain('sucesso');
  });

  it('deve retornar 401 quando a senha atual informada for incorreta', async () => {
    const usuarioBanco = {
      id: 'usr-1',
      nome: 'Prof. Teste',
      email: 'teste@catolica.edu.br',
      senha: hashPasswordSync('SenhaAtual@123'),
      role: 'PROFESSOR'
    };

    mockFindUnique.mockResolvedValue(usuarioBanco);

    const req = new Request('http://localhost/api/auth/trocar-senha', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        usuarioId: 'usr-1',
        senhaAtual: 'SenhaIncorreta999',
        novaSenha: 'NovaSenhaForte@456',
        confirmacaoNovaSenha: 'NovaSenhaForte@456'
      })
    });

    const response = await POST(req);
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toContain('Senha atual incorreta');
  });

  it('deve retornar 400 quando a nova senha for a senha padrão proibida "admin"', async () => {
    const usuarioBanco = {
      id: 'usr-1',
      nome: 'Prof. Teste',
      email: 'teste@catolica.edu.br',
      senha: hashPasswordSync('SenhaAtual@123'),
      role: 'PROFESSOR'
    };

    mockFindUnique.mockResolvedValue(usuarioBanco);

    const req = new Request('http://localhost/api/auth/trocar-senha', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        usuarioId: 'usr-1',
        senhaAtual: 'SenhaAtual@123',
        novaSenha: 'admin',
        confirmacaoNovaSenha: 'admin'
      })
    });

    const response = await POST(req);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toContain('A senha padrão "admin" foi descontinuada');
  });

  it('deve retornar 400 quando as senhas de confirmação não coincidirem', async () => {
    const usuarioBanco = {
      id: 'usr-1',
      nome: 'Prof. Teste',
      email: 'teste@catolica.edu.br',
      senha: hashPasswordSync('SenhaAtual@123'),
      role: 'PROFESSOR'
    };

    mockFindUnique.mockResolvedValue(usuarioBanco);

    const req = new Request('http://localhost/api/auth/trocar-senha', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        usuarioId: 'usr-1',
        senhaAtual: 'SenhaAtual@123',
        novaSenha: 'NovaSenhaForte@456',
        confirmacaoNovaSenha: 'OutraSenhaNaoBate'
      })
    });

    const response = await POST(req);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toContain('confirmação');
  });
});
