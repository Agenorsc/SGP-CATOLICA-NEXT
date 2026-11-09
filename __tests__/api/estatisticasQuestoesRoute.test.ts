/** @jest-environment node */

import { GET } from '@/app/api/estatisticas/questoes/route';
import { prisma } from '@/lib/prisma';

jest.mock('@/lib/prisma', () => ({
  prisma: { leituraOMR: { findMany: jest.fn() } }
}));

const findMany = prisma.leituraOMR.findMany as jest.Mock;

describe('GET /api/estatisticas/questoes', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeAll(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  beforeEach(() => jest.clearAllMocks());
  afterAll(() => consoleErrorSpy.mockRestore());

  it('aplica os filtros e retorna as estatísticas agregadas', async () => {
    findMany.mockResolvedValue([{
      id: 'leitura-1', alunoId: 'aluno-1', alunoNome: 'Aluno 1', ra: '1', turmaId: 'turma-1',
      professorId: null, provaMontadaId: 'prova-1', turmaNome: 'Turma 1', materia: 'Matemática',
      versao: 'A', acertos: 1, totalQuestoes: 1, notaCalculada: 10, dataLeitura: '2026-11-09',
      respostasDetectadas: { 1: 'A' }, gabaritoOficial: { 1: 'A' }, fiduciaisDetectados: true,
      detalhesQuestoes: [{ numero: 1, respostaMarcada: 'A', respostaCorreta: 'A', correta: true, status: 'CORRETA' }]
    }]);

    const response = await GET(new Request('http://localhost/api/estatisticas/questoes?turmaId=turma-1&provaMontadaId=prova-1'));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { turmaId: 'turma-1', provaMontadaId: 'prova-1' }
    }));
    expect(body.questoes[0]).toMatchObject({ numero: 1, totalAcertos: 1, percentualAcerto: 100 });
  });

  it('retorna 500 quando a consulta falha', async () => {
    findMany.mockRejectedValue(new Error('banco indisponível'));

    const response = await GET(new Request('http://localhost/api/estatisticas/questoes'));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toBe('banco indisponível');
  });
});
