/**
 * @jest-environment node
 * 
 * TSK-57: Testes de Isolamento por Docente no Backend (Multi-Tenancy)
 * Valida o isolamento estrito de rotas por professor da sessão:
 * - Turmas, Alunos, Questões, Leituras OMR, Provas Montadas e Relatórios
 * - Turmas sem professor (órfãs) deixam de ser visíveis para professores (exclusivas do ADMIN)
 * - Tentativas de acesso, inserção ou exclusão em recursos de outros professores retornam 403 Forbidden
 * - ADMIN mantém visão global e permissão de gestão irrestrita
 */

import { NextRequest } from 'next/server';
import { createSession, SESSION_COOKIE } from '@/lib/session';
import { GET as getTurmas, POST as postTurmas } from '@/app/api/turmas/route';
import { DELETE as deleteTurma } from '@/app/api/turmas/[id]/route';
import { GET as getAlunos, POST as postAlunos } from '@/app/api/alunos/route';
import { DELETE as deleteAluno } from '@/app/api/alunos/[id]/route';
import { GET as getQuestoes, POST as postQuestoes } from '@/app/api/questoes/route';
import { DELETE as deleteQuestao } from '@/app/api/questoes/[id]/route';
import { GET as getOmr, POST as postOmr } from '@/app/api/omr/route';
import { GET as getExams } from '@/app/api/exams/route';
import { GET as getRelatorios } from '@/app/api/relatorios/route';
import { GET as getEstatisticasQuestoes } from '@/app/api/estatisticas/questoes/route';

// Mock de usuários para sessão
const prof1 = {
  id: 'usr-prof-1',
  name: 'Prof. Agenor Alvise',
  email: 'agenor@catolica.edu.br',
  role: 'PROFESSOR' as const,
  disciplina: 'Engenharia de Software'
};

const prof2 = {
  id: 'usr-prof-2',
  name: 'Prof. Marcos Silva',
  email: 'marcos@catolica.edu.br',
  role: 'PROFESSOR' as const,
  disciplina: 'Banco de Dados'
};

const admin = {
  id: 'usr-admin',
  name: 'Administrador Geral',
  email: 'admin@catolica.edu.br',
  role: 'ADMIN' as const
};

// Mock de banco de dados relacional (Prisma)
let mockTurmasDb: any[] = [];
let mockAlunosDb: any[] = [];
let mockQuestoesDb: any[] = [];
let mockAlternativasDb: any[] = [];
let mockLeiturasDb: any[] = [];
let mockProvasDb: any[] = [];

jest.mock('@/lib/prisma', () => ({
  prisma: {
    turma: {
      findMany: jest.fn(async (args?: any) => {
        let list = [...mockTurmasDb];
        if (args?.where?.id) {
          list = list.filter(t => t.id === args.where.id);
        }
        if (args?.where?.professorId !== undefined) {
          list = list.filter(t => t.professorId === args.where.professorId);
        }
        return list.map(t => ({
          ...t,
          professor: t.professorId ? { id: t.professorId, nome: t.professorNome || 'Professor' } : null
        }));
      }),
      findUnique: jest.fn(async ({ where }: any) => {
        const found = mockTurmasDb.find(t => t.id === where.id);
        return found ? {
          ...found,
          professor: found.professorId ? { id: found.professorId, nome: found.professorNome || 'Professor' } : null
        } : null;
      }),
      upsert: jest.fn(async ({ create, update, where }: any) => {
        const idx = mockTurmasDb.findIndex(t => t.id === where.id);
        if (idx >= 0) {
          mockTurmasDb[idx] = { ...mockTurmasDb[idx], ...update };
          return mockTurmasDb[idx];
        }
        const created = {
          ...create,
          professorNome: create.professorNome || (create.professorId === prof1.id ? prof1.name : undefined),
          createdAt: new Date(),
          updatedAt: new Date()
        };
        mockTurmasDb.push(created);
        return created;
      }),
      delete: jest.fn(async ({ where }: any) => {
        mockTurmasDb = mockTurmasDb.filter(t => t.id !== where.id);
        return { id: where.id };
      })
    },
    aluno: {
      findMany: jest.fn(async (args?: any) => {
        let list = [...mockAlunosDb];
        if (args?.where?.turmaId) {
          list = list.filter(a => a.turmaId === args.where.turmaId);
        }
        if (args?.where?.turma?.professorId) {
          const turmasDoProf = new Set(
            mockTurmasDb.filter(t => t.professorId === args.where.turma.professorId).map(t => t.id)
          );
          list = list.filter(a => turmasDoProf.has(a.turmaId));
        }
        return list;
      }),
      findUnique: jest.fn(async ({ where }: any) => {
        return mockAlunosDb.find(a => a.id === where.id || (where.ra && a.ra === where.ra)) || null;
      }),
      upsert: jest.fn(async ({ create, update, where }: any) => {
        const idx = mockAlunosDb.findIndex(a => a.id === where.id);
        if (idx >= 0) {
          mockAlunosDb[idx] = { ...mockAlunosDb[idx], ...update };
          return mockAlunosDb[idx];
        }
        const created = { ...create, createdAt: new Date(), updatedAt: new Date() };
        mockAlunosDb.push(created);
        return created;
      }),
      delete: jest.fn(async ({ where }: any) => {
        mockAlunosDb = mockAlunosDb.filter(a => a.id !== where.id);
        return { id: where.id };
      }),
      update: jest.fn(async ({ where, data }: any) => {
        const idx = mockAlunosDb.findIndex(a => a.id === where.id);
        if (idx >= 0) {
          mockAlunosDb[idx] = { ...mockAlunosDb[idx], ...data };
          return mockAlunosDb[idx];
        }
        return null;
      })
    },
    questao: {
      findMany: jest.fn(async (args?: any) => {
        let list = [...mockQuestoesDb];
        if (args?.where?.OR) {
          list = list.filter(q => {
            return args.where.OR.some((cond: any) => {
              if (cond.professorId && q.professorId === cond.professorId) return true;
              if (cond.turma?.professorId) {
                const turma = mockTurmasDb.find(t => t.id === q.turmaId);
                if (turma && turma.professorId === cond.turma.professorId) return true;
              }
              return false;
            });
          });
        }
        if (args?.where?.turmaId) {
          list = list.filter(q => q.turmaId === args.where.turmaId);
        }
        return list.map(q => ({
          ...q,
          alternativas: mockAlternativasDb.filter(a => a.questaoId === q.id)
        }));
      }),
      findUnique: jest.fn(async ({ where }: any) => {
        const q = mockQuestoesDb.find(q => q.id === where.id);
        if (!q) return null;
        return {
          ...q,
          alternativas: mockAlternativasDb.filter(a => a.questaoId === q.id)
        };
      }),
      upsert: jest.fn(async ({ create, update, where }: any) => {
        const idx = mockQuestoesDb.findIndex(q => q.id === where.id);
        if (idx >= 0) {
          mockQuestoesDb[idx] = { ...mockQuestoesDb[idx], ...update };
          return mockQuestoesDb[idx];
        }
        const created = { ...create, createdAt: new Date(), updatedAt: new Date() };
        mockQuestoesDb.push(created);
        return created;
      }),
      delete: jest.fn(async ({ where }: any) => {
        mockQuestoesDb = mockQuestoesDb.filter(q => q.id !== where.id);
        return { id: where.id };
      })
    },
    alternativa: {
      deleteMany: jest.fn(async ({ where }: any) => {
        mockAlternativasDb = mockAlternativasDb.filter(a => a.questaoId !== where.questaoId);
        return { count: 1 };
      }),
      create: jest.fn(async ({ data }: any) => {
        mockAlternativasDb.push(data);
        return data;
      })
    },
    leituraOMR: {
      findMany: jest.fn(async (args?: any) => {
        let list = [...mockLeiturasDb];
        if (args?.where?.alunoId) {
          list = list.filter(l => l.alunoId === args.where.alunoId);
        }
        if (args?.where?.turmaId) {
          list = list.filter(l => l.turmaId === args.where.turmaId);
        }
        if (args?.where?.OR) {
          list = list.filter(l => {
            return args.where.OR.some((cond: any) => {
              if (cond.professorId && l.professorId === cond.professorId) return true;
              if (cond.turma?.professorId) {
                const turma = mockTurmasDb.find(t => t.id === l.turmaId);
                if (turma && turma.professorId === cond.turma.professorId) return true;
              }
              return false;
            });
          });
        }
        return list;
      }),
      findUnique: jest.fn(async ({ where }: any) => {
        return mockLeiturasDb.find(l => l.id === where.id) || null;
      }),
      create: jest.fn(async ({ data }: any) => {
        const created = { ...data, createdAt: new Date() };
        mockLeiturasDb.push(created);
        return created;
      })
    },
    provaMontada: {
      findMany: jest.fn(async (args?: any) => {
        let list = [...mockProvasDb];
        if (args?.where?.turmaId) {
          list = list.filter(p => p.turmaId === args.where.turmaId);
        }
        if (args?.where?.OR) {
          list = list.filter(p => {
            return args.where.OR.some((cond: any) => {
              if (cond.professorId && p.professorId === cond.professorId) return true;
              if (cond.turma?.professorId) {
                const turma = mockTurmasDb.find(t => t.id === p.turmaId);
                if (turma && turma.professorId === cond.turma.professorId) return true;
              }
              return false;
            });
          });
        }
        return list.map(p => ({
          ...p,
          turma: mockTurmasDb.find(t => t.id === p.turmaId)
        }));
      }),
      findUnique: jest.fn(async ({ where }: any) => {
        const p = mockProvasDb.find(p => p.id === where.id);
        if (!p) return null;
        return {
          ...p,
          turma: mockTurmasDb.find(t => t.id === p.turmaId)
        };
      })
    },
    $transaction: jest.fn(async (callback: any) => {
      return callback({
        aluno: {
          findUnique: jest.fn(async ({ where }: any) => {
            return mockAlunosDb.find(a => a.id === where.id || (where.ra && a.ra === where.ra)) || null;
          }),
          update: jest.fn(async ({ where, data }: any) => {
            const idx = mockAlunosDb.findIndex(a => a.id === where.id);
            if (idx >= 0) {
              mockAlunosDb[idx] = { ...mockAlunosDb[idx], ...data };
              return mockAlunosDb[idx];
            }
            return null;
          })
        },
        turma: {
          findUnique: jest.fn(async ({ where }: any) => {
            return mockTurmasDb.find(t => t.id === where.id) || null;
          })
        },
        usuario: {
          findUnique: jest.fn(async ({ where }: any) => {
            if (where.id === prof1.id) return prof1;
            if (where.id === prof2.id) return prof2;
            if (where.id === admin.id) return admin;
            return null;
          })
        },
        provaMontada: {
          findUnique: jest.fn(async ({ where }: any) => {
            return mockProvasDb.find(p => p.id === where.id) || null;
          })
        },
        leituraOMR: {
          create: jest.fn(async ({ data }: any) => {
            const created = { ...data, createdAt: new Date() };
            mockLeiturasDb.push(created);
            return created;
          })
        }
      });
    })
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

describe('TSK-57: Isolamento por Docente no Backend (Multi-Tenancy)', () => {
  const originalSecret = process.env.SESSION_SECRET;

  beforeEach(() => {
    process.env.SESSION_SECRET = 'sgp-catolica-secret-key-32-bytes-test-isolation!';

    // Inicializa o banco com turmas de prof1, prof2 e uma turma órfã (sem professor)
    mockTurmasDb = [
      { id: 'turma-prof1', nome: 'Engenharia de Software IV', curso: 'Eng. Software', semestre: '2026/2', codigoConvite: 'ENG-101', professorId: 'usr-prof-1', professorNome: 'Prof. Agenor' },
      { id: 'turma-prof2', nome: 'Banco de Dados Avançado', curso: 'Eng. Software', semestre: '2026/2', codigoConvite: 'ENG-202', professorId: 'usr-prof-2', professorNome: 'Prof. Marcos' },
      { id: 'turma-orfa', nome: 'Turma Sem Professor Atribuído', curso: 'Geral', semestre: '2026/2', codigoConvite: 'ORF-999', professorId: null, professorNome: null }
    ];

    mockAlunosDb = [
      { id: 'aluno-prof1', nome: 'Aluno do Prof 1', ra: 'RA1001', turmaId: 'turma-prof1', curso: 'Eng. Software', turno: 'Noturno', n1: 8, n2: 9, n3: 8 },
      { id: 'aluno-prof2', nome: 'Aluno do Prof 2', ra: 'RA2002', turmaId: 'turma-prof2', curso: 'Eng. Software', turno: 'Noturno', n1: 7, n2: 6, n3: 7 },
      { id: 'aluno-orfa', nome: 'Aluno da Turma Órfã', ra: 'RA3003', turmaId: 'turma-orfa', curso: 'Geral', turno: 'Noturno', n1: 5, n2: 5, n3: 5 }
    ];

    mockQuestoesDb = [
      { id: 'q-prof1', tipo: 'objetiva', enunciado: 'Questão do Prof 1', pontuacao: 2.5, tags: ['TDD'], professorId: 'usr-prof-1', turmaId: 'turma-prof1', avaliacao: 'N2' },
      { id: 'q-prof2', tipo: 'objetiva', enunciado: 'Questão do Prof 2', pontuacao: 2.5, tags: ['SQL'], professorId: 'usr-prof-2', turmaId: 'turma-prof2', avaliacao: 'N2' },
      { id: 'q-orfa', tipo: 'objetiva', enunciado: 'Questão Órfã', pontuacao: 2.5, tags: ['Geral'], professorId: null, turmaId: null, avaliacao: 'N2' }
    ];

    mockAlternativasDb = [
      { id: 'alt-1', letraOriginal: 'A', texto: 'Correta 1', correta: true, questaoId: 'q-prof1' },
      { id: 'alt-2', letraOriginal: 'A', texto: 'Correta 2', correta: true, questaoId: 'q-prof2' },
      { id: 'alt-3', letraOriginal: 'A', texto: 'Correta 3', correta: true, questaoId: 'q-orfa' }
    ];

    mockLeiturasDb = [
      { id: 'leit-prof1', alunoId: 'aluno-prof1', alunoNome: 'Aluno do Prof 1', ra: 'RA1001', turmaId: 'turma-prof1', professorId: 'usr-prof-1', turmaNome: 'Engenharia de Software IV', materia: 'Engenharia', versao: 'A', acertos: 10, totalQuestoes: 10, notaCalculada: 10, dataLeitura: '2026-11-10', respostasDetectadas: {}, gabaritoOficial: {} },
      { id: 'leit-prof2', alunoId: 'aluno-prof2', alunoNome: 'Aluno do Prof 2', ra: 'RA2002', turmaId: 'turma-prof2', professorId: 'usr-prof-2', turmaNome: 'Banco de Dados', materia: 'BD', versao: 'A', acertos: 7, totalQuestoes: 10, notaCalculada: 7, dataLeitura: '2026-11-10', respostasDetectadas: {}, gabaritoOficial: {} }
    ];

    mockProvasDb = [
      { id: 'prova-prof1', titulo: 'Prova N2 ESIV', turmaId: 'turma-prof1', professorId: 'usr-prof-1', totalQuestoes: 10, pontuacaoTotal: 10, questoesSnapshot: [], createdAt: new Date() },
      { id: 'prova-prof2', titulo: 'Prova N2 BD', turmaId: 'turma-prof2', professorId: 'usr-prof-2', totalQuestoes: 10, pontuacaoTotal: 10, questoesSnapshot: [], createdAt: new Date() }
    ];
  });

  afterEach(() => {
    jest.clearAllMocks();
    if (originalSecret === undefined) delete process.env.SESSION_SECRET;
    else process.env.SESSION_SECRET = originalSecret;
  });

  describe('1. Rotas de Turmas (/api/turmas e /api/turmas/[id])', () => {
    it('Professor vê apenas suas próprias turmas e NUNCA turmas órfãs ou de outro professor', async () => {
      const req = createAuthRequest('/api/turmas', prof1);
      const res = await getTurmas(req);
      expect(res.status).toBe(200);
      const turmas = await res.json();

      expect(turmas).toHaveLength(1);
      expect(turmas[0].id).toBe('turma-prof1');
      expect(turmas.some((t: any) => t.id === 'turma-prof2')).toBe(false);
      expect(turmas.some((t: any) => t.id === 'turma-orfa')).toBe(false);
    });

    it('ADMIN tem visão global e visualiza turmas de todos os professores e turmas órfãs', async () => {
      const req = createAuthRequest('/api/turmas', admin);
      const res = await getTurmas(req);
      expect(res.status).toBe(200);
      const turmas = await res.json();

      expect(turmas).toHaveLength(3);
      expect(turmas.some((t: any) => t.id === 'turma-prof1')).toBe(true);
      expect(turmas.some((t: any) => t.id === 'turma-prof2')).toBe(true);
      expect(turmas.some((t: any) => t.id === 'turma-orfa')).toBe(true);
    });

    it('POST /api/turmas força o professorId da sessão quando criado por docente', async () => {
      const novaTurma = {
        nome: 'Nova Turma Criada',
        curso: 'Eng. Software',
        semestre: '2026/2',
        professorId: 'tentativa-de-forjar-outro-id'
      };
      const req = createAuthRequest('/api/turmas', prof1, {
        method: 'POST',
        body: JSON.stringify(novaTurma)
      });

      const res = await postTurmas(req);
      expect(res.status).toBe(201);
      const saved = await res.json();
      expect(saved.professorId).toBe(prof1.id);
      expect(saved.professorNome).toBe(prof1.name);
    });

    it('DELETE /api/turmas/[id] impede professor de excluir turma de outro docente ou órfã (403)', async () => {
      // Tentativa de excluir turma do prof 2
      const reqProf2 = createAuthRequest('/api/turmas/turma-prof2', prof1, { method: 'DELETE' });
      const resProf2 = await deleteTurma(reqProf2, { params: Promise.resolve({ id: 'turma-prof2' }) });
      expect(resProf2.status).toBe(403);

      // Tentativa de excluir turma órfã
      const reqOrfa = createAuthRequest('/api/turmas/turma-orfa', prof1, { method: 'DELETE' });
      const resOrfa = await deleteTurma(reqOrfa, { params: Promise.resolve({ id: 'turma-orfa' }) });
      expect(resOrfa.status).toBe(403);

      // Professor pode excluir sua própria turma
      const reqPropria = createAuthRequest('/api/turmas/turma-prof1', prof1, { method: 'DELETE' });
      const resPropria = await deleteTurma(reqPropria, { params: Promise.resolve({ id: 'turma-prof1' }) });
      expect(resPropria.status).toBe(200);
    });
  });

  describe('2. Rotas de Alunos (/api/alunos e /api/alunos/[id])', () => {
    it('GET /api/alunos lista apenas alunos matriculados nas turmas do docente', async () => {
      const req = createAuthRequest('/api/alunos', prof1);
      const res = await getAlunos(req);
      expect(res.status).toBe(200);
      const alunos = await res.json();

      expect(alunos).toHaveLength(1);
      expect(alunos[0].id).toBe('aluno-prof1');
      expect(alunos.some((a: any) => a.id === 'aluno-prof2')).toBe(false);
      expect(alunos.some((a: any) => a.id === 'aluno-orfa')).toBe(false);
    });

    it('GET /api/alunos?turmaId=... retorna 403 se a turma pertencer a outro professor', async () => {
      const req = createAuthRequest('/api/alunos?turmaId=turma-prof2', prof1);
      const res = await getAlunos(req);
      expect(res.status).toBe(403);
    });

    it('POST /api/alunos retorna 403 se o docente tentar cadastrar aluno em turma alheia ou órfã', async () => {
      const novoAluno = {
        nome: 'Tentativa Aluno Invasor',
        ra: 'RA9999',
        turmaId: 'turma-prof2'
      };
      const req = createAuthRequest('/api/alunos', prof1, {
        method: 'POST',
        body: JSON.stringify(novoAluno)
      });
      const res = await postAlunos(req);
      expect(res.status).toBe(403);
    });

    it('DELETE /api/alunos/[id] retorna 403 se o aluno pertencer a turma de outro professor', async () => {
      const req = createAuthRequest('/api/alunos/aluno-prof2', prof1, { method: 'DELETE' });
      const res = await deleteAluno(req, { params: Promise.resolve({ id: 'aluno-prof2' }) });
      expect(res.status).toBe(403);

      // Professor pode excluir aluno de sua própria turma
      const reqProprio = createAuthRequest('/api/alunos/aluno-prof1', prof1, { method: 'DELETE' });
      const resProprio = await deleteAluno(reqProprio, { params: Promise.resolve({ id: 'aluno-prof1' }) });
      expect(resProprio.status).toBe(200);
    });
  });

  describe('3. Rotas de Questões (/api/questoes e /api/questoes/[id])', () => {
    it('GET /api/questoes lista apenas questões do docente e exclui questões de outros e órfãs', async () => {
      const req = createAuthRequest('/api/questoes', prof1);
      const res = await getQuestoes(req);
      expect(res.status).toBe(200);
      const questoes = await res.json();

      expect(questoes).toHaveLength(1);
      expect(questoes[0].id).toBe('q-prof1');
      expect(questoes.some((q: any) => q.id === 'q-prof2')).toBe(false);
      expect(questoes.some((q: any) => q.id === 'q-orfa')).toBe(false);
    });

    it('POST /api/questoes vincula automaticamente o professorId e valida turmaId', async () => {
      const novaQuestao = {
        id: 'q-nova',
        enunciado: 'Nova Questão',
        tipo: 'objetiva',
        pontuacao: 2.0,
        turmaId: 'turma-prof2' // Turma de outro professor!
      };
      const reqInvalida = createAuthRequest('/api/questoes', prof1, {
        method: 'POST',
        body: JSON.stringify(novaQuestao)
      });
      const resInvalida = await postQuestoes(reqInvalida);
      expect(resInvalida.status).toBe(403);

      // Questão na turma própria
      novaQuestao.turmaId = 'turma-prof1';
      const reqValida = createAuthRequest('/api/questoes', prof1, {
        method: 'POST',
        body: JSON.stringify(novaQuestao)
      });
      const resValida = await postQuestoes(reqValida);
      expect(resValida.status).toBe(201);
      const saved = await resValida.json();
      expect(saved.teacherId).toBe(prof1.id);
    });

    it('DELETE /api/questoes/[id] retorna 403 para questões de outros professores', async () => {
      const req = createAuthRequest('/api/questoes/q-prof2', prof1, { method: 'DELETE' });
      const res = await deleteQuestao(req, { params: Promise.resolve({ id: 'q-prof2' }) });
      expect(res.status).toBe(403);

      // Exclusão da própria questão
      const reqPropria = createAuthRequest('/api/questoes/q-prof1', prof1, { method: 'DELETE' });
      const resPropria = await deleteQuestao(reqPropria, { params: Promise.resolve({ id: 'q-prof1' }) });
      expect(resPropria.status).toBe(200);
    });
  });

  describe('4. Rotas de OMR, Provas e Estatísticas', () => {
    it('GET /api/omr lista apenas leituras do docente', async () => {
      const req = createAuthRequest('/api/omr', prof1);
      const res = await getOmr(req);
      expect(res.status).toBe(200);
      const leituras = await res.json();

      expect(leituras).toHaveLength(1);
      expect(leituras[0].id).toBe('leit-prof1');
      expect(leituras.some((l: any) => l.id === 'leit-prof2')).toBe(false);
    });

    it('GET /api/omr?alunoId=... retorna 403 se o aluno for de outro docente', async () => {
      const req = createAuthRequest('/api/omr?alunoId=aluno-prof2', prof1);
      const res = await getOmr(req);
      expect(res.status).toBe(403);
    });

    it('POST /api/omr vincula o professorId do professor da sessão', async () => {
      const novaLeitura = {
        id: 'leit-nova',
        alunoId: 'aluno-prof1',
        alunoNome: 'Aluno do Prof 1',
        ra: 'RA1001',
        turmaId: 'turma-prof1',
        turmaNome: 'Engenharia de Software IV',
        materia: 'Engenharia',
        versao: 'A',
        acertos: 8,
        totalQuestoes: 10,
        notaCalculada: 8.0,
        dataLeitura: '2026-11-10',
        respostasDetectadas: {},
        stage: 'N2'
      };
      const req = createAuthRequest('/api/omr', prof1, {
        method: 'POST',
        body: JSON.stringify(novaLeitura)
      });
      const res = await postOmr(req);
      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.leitura.professorId).toBe(prof1.id);
    });

    it('GET /api/exams lista apenas provas montadas do docente', async () => {
      const req = createAuthRequest('/api/exams', prof1);
      const res = await getExams(req);
      expect(res.status).toBe(200);
      const provas = await res.json();

      expect(provas).toHaveLength(1);
      expect(provas[0].id).toBe('prova-prof1');
      expect(provas.some((p: any) => p.id === 'prova-prof2')).toBe(false);
    });

    it('GET /api/relatorios?turmaId=turma-prof2 retorna 403 para professor 1', async () => {
      const req = createAuthRequest('/api/relatorios?turmaId=turma-prof2', prof1);
      const res = await getRelatorios(req);
      expect(res.status).toBe(403);
    });

    it('GET /api/relatorios?turmaId=TODAS agrega apenas dados das turmas do professor da sessão', async () => {
      const req = createAuthRequest('/api/relatorios?turmaId=TODAS', prof1);
      const res = await getRelatorios(req);
      expect(res.status).toBe(200);
      const relatorio = await res.json();

      // Verifica que dados agregados no relatório pertencem apenas a prof 1
      expect(relatorio.metricas.totalAlunos).toBe(1);
      expect(relatorio.alunosConsolidado).toHaveLength(1);
      expect(relatorio.alunosConsolidado[0].alunoId).toBe('aluno-prof1');
    });

    it('GET /api/estatisticas/questoes?turmaId=turma-prof2 retorna 403 para professor 1', async () => {
      const req = createAuthRequest('/api/estatisticas/questoes?turmaId=turma-prof2', prof1);
      const res = await getEstatisticasQuestoes(req);
      expect(res.status).toBe(403);
    });
  });
});
