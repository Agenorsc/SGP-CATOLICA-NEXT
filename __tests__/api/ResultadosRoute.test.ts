/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server';
import { createSession, SESSION_COOKIE } from '@/lib/session';
import { GET as getResultados, POST as postResultado } from '@/app/api/resultados/route';
import { DELETE as deleteResultadoById } from '@/app/api/resultados/[id]/route';
import { prisma } from '@/lib/prisma';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    provaMontada: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      delete: jest.fn()
    },
    resultadoAvaliacao: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      upsert: jest.fn(),
      delete: jest.fn()
    },
    aluno: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn()
    }
  }
}));

function createAuthRequest(path: string, user?: any, init?: RequestInit) {
  const token = user ? createSession(user) : undefined;
  const headers = new Headers(init?.headers || {});
  if (token) {
    headers.set('cookie', `${SESSION_COOKIE}=${token}`);
  }
  const requestInit: any = {
    method: init?.method,
    headers,
    body: init?.body
  };
  return new NextRequest(`http://localhost${path}`, requestInit);
}

describe('Resultados API - Módulo Mobile OMR e Exclusão de Notas', () => {
  const sessionProfessor = {
    id: 'prof-samuel-1',
    name: 'Prof. Samuel',
    email: 'samuel@catolica.br',
    role: 'PROFESSOR' as const
  };

  const sessionOutroProfessor = {
    id: 'prof-outro-2',
    name: 'Prof. Outro',
    email: 'outro@catolica.br',
    role: 'PROFESSOR' as const
  };

  beforeEach(() => {
    process.env.SESSION_SECRET = 'sgp-catolica-secret-key-32-bytes-test-isolation!';
    jest.clearAllMocks();
  });

  it('deve permitir que o professor registre uma nota via mobile (POST /api/resultados)', async () => {
    const payload = {
      provaMontadaId: 'prova-1',
      cadernoProvaId: 'cad-1',
      alunoNome: 'Agenor Alvise',
      alunoRa: '2024999',
      respostasMarcadasJson: { '1': 'C', '2': 'A' },
      acertos: 2,
      totalQuestoes: 2,
      notaFinal: 10.0,
      lidoViaMobile: true
    };

    jest.spyOn((prisma as any).provaMontada, 'findUnique').mockResolvedValueOnce({
      id: 'prova-1',
      professorId: 'prof-samuel-1',
      turma: { professorId: 'prof-samuel-1' },
      ciclo: 'N2'
    });

    jest.spyOn((prisma as any).resultadoAvaliacao, 'upsert').mockResolvedValueOnce({
      id: 'res-1',
      professorId: 'prof-samuel-1',
      provaMontadaId: 'prova-1',
      cadernoProvaId: 'cad-1',
      alunoNome: 'Agenor Alvise',
      alunoRa: '2024999',
      respostasMarcadasJson: { '1': 'C', '2': 'A' },
      acertos: 2,
      totalQuestoes: 2,
      notaFinal: 10.0,
      lidoViaMobile: true,
      createdAt: new Date()
    });

    const request = createAuthRequest('/api/resultados', sessionProfessor, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const response = await postResultado(request);
    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data.notaFinal).toBe(10.0);
    expect(data.alunoNome).toBe('Agenor Alvise');
  });

  it('deve listar os resultados filtrados por professor (GET /api/resultados)', async () => {
    jest.spyOn((prisma as any).resultadoAvaliacao, 'findMany').mockResolvedValueOnce([
      {
        id: 'res-1',
        professorId: 'prof-samuel-1',
        provaMontadaId: 'prova-1',
        alunoNome: 'Agenor Alvise',
        alunoRa: '2024999',
        respostasMarcadasJson: {},
        acertos: 10,
        totalQuestoes: 10,
        notaFinal: 10.0,
        lidoViaMobile: true,
        createdAt: new Date()
      }
    ]);

    const request = createAuthRequest('/api/resultados?provaMontadaId=prova-1', sessionProfessor);
    const response = await getResultados(request);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.length).toBe(1);
    expect(data[0].alunoNome).toBe('Agenor Alvise');
  });

  it('deve excluir a nota do aluno e retornar sucesso (DELETE /api/resultados/[id])', async () => {
    jest.spyOn((prisma as any).resultadoAvaliacao, 'findUnique').mockResolvedValueOnce({
      id: 'res-1',
      professorId: 'prof-samuel-1',
      alunoNome: 'Agenor Alvise',
      alunoRa: '2024999',
      notaFinal: 10.0,
      provaMontada: { ciclo: 'N2' }
    });

    jest.spyOn((prisma as any).resultadoAvaliacao, 'delete').mockResolvedValueOnce({
      id: 'res-1'
    });

    const request = createAuthRequest('/api/resultados/res-1', sessionProfessor, {
      method: 'DELETE'
    });

    const response = await deleteResultadoById(request, { params: Promise.resolve({ id: 'res-1' }) });
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.alunoNome).toBe('Agenor Alvise');
  });

  it('deve rejeitar exclusão de nota de outro professor com 403 Forbidden', async () => {
    jest.spyOn((prisma as any).resultadoAvaliacao, 'findUnique').mockResolvedValueOnce({
      id: 'res-alheio',
      professorId: 'prof-samuel-1', // pertence ao Prof. Samuel!
      alunoNome: 'Aluno Teste',
      notaFinal: 8.0,
      provaMontada: { ciclo: 'N2' }
    });

    const request = createAuthRequest('/api/resultados/res-alheio', sessionOutroProfessor, {
      method: 'DELETE'
    });

    const response = await deleteResultadoById(request, { params: Promise.resolve({ id: 'res-alheio' }) });
    expect(response.status).toBe(403);
    const data = await response.json();
    expect(data.error).toMatch(/Você só pode excluir notas lançadas por você/i);
  });
});
