/**
 * @jest-environment node
 */

import { ExamService } from '@/services/ExamService';
import { Question } from '@/types';
import { ForbiddenError } from '@/lib/errors';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    provaMontada: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      delete: jest.fn()
    },
    cadernoProva: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      upsert: jest.fn(),
      delete: jest.fn()
    }
  }
}));

describe('ExamService - Snapshots Imutáveis e Cadernos Embaralhados', () => {
  let examService: ExamService;

  const mockQuestoes: Question[] = [
    {
      id: 'q1',
      tipo: 'objetiva',
      enunciado: 'Qual a complexidade do algoritmo Dijkstra com min-heap?',
      pontuacao: 5.0,
      tags: ['Grafos'],
      alternativas: [
        { id: 'a1', letraOriginal: 'A', texto: 'O(V^2)', correta: false },
        { id: 'a2', letraOriginal: 'B', texto: 'O((V + E) log V)', correta: true },
        { id: 'a3', letraOriginal: 'C', texto: 'O(V * E)', correta: false },
        { id: 'a4', letraOriginal: 'D', texto: 'O(E^2)', correta: false }
      ]
    },
    {
      id: 'q2',
      tipo: 'objetiva',
      enunciado: 'Qual princípio SOLID prega que módulos devem depender de abstrações?',
      pontuacao: 5.0,
      tags: ['Arquitetura'],
      alternativas: [
        { id: 'a5', letraOriginal: 'A', texto: 'Single Responsibility Principle', correta: false },
        { id: 'a6', letraOriginal: 'B', texto: 'Open-Closed Principle', correta: false },
        { id: 'a7', letraOriginal: 'C', texto: 'Liskov Substitution Principle', correta: false },
        { id: 'a8', letraOriginal: 'D', texto: 'Dependency Inversion Principle', correta: true }
      ]
    }
  ];

  beforeEach(() => {
    examService = new ExamService();
  });

  it('deve gerar cadernos embaralhados com gabarito_oficial_json pré-calculado corretamente', () => {
    const cadernos = examService.gerarCadernosEmbaralhados(
      'prova-teste-1',
      mockQuestoes,
      {
        shuffleQuestoes: true,
        shuffleAlternativas: true,
        nominalQrCode: false
      }
    );

    expect(cadernos.length).toBe(4); // Caderno A, B, C, D
    const cadernoA = cadernos.find(c => c.codigoVersao === 'CADERNO-A');
    expect(cadernoA).toBeDefined();

    // O gabarito oficial deve conter as respostas de cada questão
    expect(cadernoA!.gabaritoOficialJson).toBeDefined();
    expect(cadernoA!.gabaritoOficialJson['1']).toMatch(/^[A-E]$/);
    expect(cadernoA!.gabaritoOficialJson['2']).toMatch(/^[A-E]$/);

    // O mapa de questões congelado deve ter as 2 questões
    expect(cadernoA!.mapaQuestoesJson.length).toBe(2);

    // Verifica que na questão 1 do caderno, a alternativa marcada como correta corresponde à letra do gabarito
    const q1Caderno = cadernoA!.mapaQuestoesJson[0];
    const letraGabarito = cadernoA!.gabaritoOficialJson['1'];
    const altCorreta = q1Caderno.alternativas?.find(a => a.correta);
    expect(altCorreta).toBeDefined();
    expect(altCorreta?.letraOriginal).toBe(letraGabarito);
  });

  it('deve gerar cadernos nominais quando nominalQrCode for verdadeiro e alunos forem informados', () => {
    const alunos = [
      { id: 'aluno-1', nome: 'Erick Andreas', ra: '2024101' },
      { id: 'aluno-2', nome: 'Johnatan Vargas', ra: '2024102' }
    ];

    const cadernos = examService.gerarCadernosEmbaralhados(
      'prova-nominal-1',
      mockQuestoes,
      {
        shuffleQuestoes: true,
        shuffleAlternativas: true,
        nominalQrCode: true
      },
      alunos
    );

    // Deve conter 2 cadernos nominais + 4 universais
    expect(cadernos.length).toBe(6);

    const cadernoErick = cadernos.find(c => c.alunoRa === '2024101');
    expect(cadernoErick).toBeDefined();
    expect(cadernoErick?.alunoNome).toBe('Erick Andreas');
    expect(cadernoErick?.gabaritoOficialJson['1']).toBeDefined();
  });

  it('deve bloquear acesso a caderno de outro professor (TSK-57 multi-tenancy)', async () => {
    // Mock do repositório de caderno
    const mockRepo = {
      findById: jest.fn().mockResolvedValue({
        id: 'cad-1',
        provaMontadaId: 'prova-alheia',
        codigoVersao: 'CADERNO-A',
        gabaritoOficialJson: { '1': 'B' }
      })
    };

    const serviceComMock = new ExamService(undefined, undefined, mockRepo as any);

    // Quando o professor logado tentar acessar caderno de outro professor
    const sessionProfessor = {
      id: 'prof-erick',
      name: 'Prof. Erick',
      nome: 'Prof. Erick',
      email: 'erick@catolica.br',
      role: 'PROFESSOR' as const
    };

    // Mock do prisma para findUnique da provaMontada retornando outro professor
    const prisma = require('@/lib/prisma').prisma;
    jest.spyOn((prisma as any).provaMontada, 'findUnique').mockResolvedValueOnce({
      id: 'prova-alheia',
      professorId: 'prof-outro',
      turma: { professorId: 'prof-outro' }
    });

    await expect(
      serviceComMock.obterCadernoPorId('cad-1', sessionProfessor)
    ).rejects.toThrow(ForbiddenError);
  });
});
