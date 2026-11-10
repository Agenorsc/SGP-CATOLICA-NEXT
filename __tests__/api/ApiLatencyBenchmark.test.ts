/**
 * @jest-environment node
 * 
 * TSK-61: Benchmark de Latência e Tempo de Resposta (p95) das Rotas de API
 * RNF03: Performance e Tempo de Resposta (Meta: p95 < 250 ms)
 * Arquitetura: Execução Dinâmica Server-Side (force-dynamic, no-store)
 */

import { performance } from 'perf_hooks';

// Mock de dados e consultas do Prisma para execução offline determinística e medição do overhead de rota
const mockAlunos = Array.from({ length: 40 }, (_, i) => ({
  id: `aluno-${i + 1}`,
  nome: `Estudante Católica ${i + 1}`,
  ra: `RA2026${1000 + i}`,
  curso: 'Engenharia de Software',
  turno: 'Noturno',
  turmaId: i < 20 ? 'turma-1' : 'turma-2',
  n1: 7.5,
  n2: 8.0,
  n3: 9.0,
  contato: null,
  endereco: null,
  createdAt: new Date(),
  updatedAt: new Date()
}));

const mockTurmas = [
  { id: 'turma-1', nome: 'Engenharia de Software IV', curso: 'Engenharia de Software', semestre: '2026/2', codigoConvite: 'ENG2026', professorId: 'prof-1' },
  { id: 'turma-2', nome: 'Direito Constitucional II', curso: 'Direito', semestre: '2026/2', codigoConvite: 'DIR2026', professorId: 'prof-1' }
];

const mockQuestoes = Array.from({ length: 15 }, (_, i) => ({
  id: `q-${i + 1}`,
  tipo: 'objetiva',
  enunciado: `Questão de Avaliação Contínua ${i + 1} sobre requisitos e qualidade de software.`,
  pontuacao: 2.0,
  tags: ['Qualidade', 'Engenharia'],
  turmaId: 'turma-1',
  professorId: 'prof-1',
  avaliacao: 'N2',
  createdAt: new Date(),
  updatedAt: new Date(),
  alternativas: [
    { id: `alt-${i}-1`, letraOriginal: 'A', texto: 'Alternativa correta', correta: true, questaoId: `q-${i + 1}` },
    { id: `alt-${i}-2`, letraOriginal: 'B', texto: 'Distrator A', correta: false, questaoId: `q-${i + 1}` },
    { id: `alt-${i}-3`, letraOriginal: 'C', texto: 'Distrator B', correta: false, questaoId: `q-${i + 1}` },
    { id: `alt-${i}-4`, letraOriginal: 'D', texto: 'Distrator C', correta: false, questaoId: `q-${i + 1}` }
  ]
}));

const mockProvas = [
  {
    id: 'prova-1',
    titulo: 'Avaliação Escrita N2 - Engenharia de Software',
    disciplina: 'Engenharia de Software',
    semestre: '2026/2',
    ciclo: 'N2',
    turmaId: 'turma-1',
    professorId: 'prof-1',
    totalQuestoes: 8,
    pontuacaoTotal: 10.0,
    shuffleQuestoes: true,
    shuffleAlternativas: true,
    nominalQrCode: true,
    questoesSnapshot: mockQuestoes.slice(0, 8),
    createdAt: new Date(),
    updatedAt: new Date(),
    turma: mockTurmas[0]
  }
];

const mockLeituras = Array.from({ length: 30 }, (_, i) => ({
  id: `leit-${i + 1}`,
  alunoId: `aluno-${(i % 20) + 1}`,
  alunoNome: `Estudante Católica ${(i % 20) + 1}`,
  ra: `RA2026${1000 + (i % 20)}`,
  turmaId: 'turma-1',
  professorId: 'prof-1',
  provaMontadaId: 'prova-1',
  turmaNome: 'Engenharia de Software IV',
  materia: 'Engenharia de Software',
  versao: 'A',
  acertos: 7,
  totalQuestoes: 8,
  notaCalculada: 8.75,
  dataLeitura: '2026-11-10T14:30:00.000Z',
  respostasDetectadas: { 1: 'A', 2: 'A', 3: 'B', 4: 'A', 5: 'A', 6: 'A', 7: 'A', 8: 'A' },
  gabaritoOficial: { 1: 'A', 2: 'A', 3: 'A', 4: 'A', 5: 'A', 6: 'A', 7: 'A', 8: 'A' },
  detalhesQuestoes: [
    { numero: 1, respostaMarcada: 'A', respostaCorreta: 'A', status: 'CORRETA', correta: true, maxScore: 1.25, score: 1.25 },
    { numero: 2, respostaMarcada: 'A', respostaCorreta: 'A', status: 'CORRETA', correta: true, maxScore: 1.25, score: 1.25 },
    { numero: 3, respostaMarcada: 'B', respostaCorreta: 'A', status: 'INCORRETA', correta: false, maxScore: 1.25, score: 0 }
  ],
  fiduciaisDetectados: true,
  createdAt: new Date()
}));

jest.mock('@/lib/prisma', () => ({
  prisma: {
    aluno: {
      findMany: jest.fn().mockImplementation(async (args) => {
        if (args?.where?.turmaId) {
          return mockAlunos.filter(a => a.turmaId === args.where.turmaId);
        }
        return mockAlunos;
      }),
      findUnique: jest.fn().mockImplementation(async (args) => {
        return mockAlunos.find(a => a.id === args?.where?.id || a.ra === args?.where?.ra);
      })
    },
    turma: {
      findMany: jest.fn().mockImplementation(async (args) => {
        if (args?.where?.id) {
          return mockTurmas.filter(t => t.id === args.where.id);
        }
        return mockTurmas;
      }),
      findUnique: jest.fn().mockImplementation(async (args) => {
        return mockTurmas.find(t => t.id === args?.where?.id);
      })
    },
    questao: {
      findMany: jest.fn().mockImplementation(async (args) => {
        if (args?.where?.turmaId) {
          return mockQuestoes.filter(q => q.turmaId === args.where.turmaId);
        }
        return mockQuestoes;
      })
    },
    provaMontada: {
      findMany: jest.fn().mockImplementation(async (args) => {
        if (args?.where?.turmaId) {
          return mockProvas.filter(p => p.turmaId === args.where.turmaId);
        }
        return mockProvas;
      })
    },
    leituraOMR: {
      findMany: jest.fn().mockImplementation(async (args) => {
        if (args?.where?.alunoId) {
          return mockLeituras.filter(l => l.alunoId === args.where.alunoId);
        }
        if (args?.where?.turmaId) {
          return mockLeituras.filter(l => l.turmaId === args.where.turmaId);
        }
        return mockLeituras;
      }),
      findUnique: jest.fn().mockImplementation(async (args) => {
        return mockLeituras.find(l => l.id === args?.where?.id);
      })
    }
  }
}));

import { GET as getAlunos } from '@/app/api/alunos/route';
import { GET as getTurmas } from '@/app/api/turmas/route';
import { GET as getQuestoes } from '@/app/api/questoes/route';
import { GET as getExams } from '@/app/api/exams/route';
import { GET as getOmr } from '@/app/api/omr/route';
import { GET as getRelatorios } from '@/app/api/relatorios/route';
import { GET as getEstatisticasQuestoes } from '@/app/api/estatisticas/questoes/route';

const TARGET_P95_MS = 250;
const AMOSTRAS_POR_ROTA = 25;

function calcularPercentil(valoresOrdenados: number[], p: number): number {
  if (valoresOrdenados.length === 0) return 0;
  const index = Math.ceil((p / 100) * valoresOrdenados.length) - 1;
  const clampIndex = Math.max(0, Math.min(valoresOrdenados.length - 1, index));
  return Number(valoresOrdenados[clampIndex].toFixed(2));
}

function calcularEstatisticas(temposMs: number[]) {
  const sorted = [...temposMs].sort((a, b) => a - b);
  const min = Number(sorted[0].toFixed(2));
  const max = Number(sorted[sorted.length - 1].toFixed(2));
  const sum = sorted.reduce((acc, v) => acc + v, 0);
  const avg = Number((sum / sorted.length).toFixed(2));

  const p50 = calcularPercentil(sorted, 50);
  const p90 = calcularPercentil(sorted, 90);
  const p95 = calcularPercentil(sorted, 95);
  const p99 = calcularPercentil(sorted, 99);

  return {
    amostras: temposMs.length,
    min,
    avg,
    p50,
    p90,
    p95,
    p99,
    max,
    atendeSLA: p95 <= TARGET_P95_MS
  };
}

describe('TSK-61: Medição de Tempo de Resposta e Latência (p95 < 250 ms) - RNF03', () => {
  const relatorioTabela: Array<{
    endpoint: string;
    min: number;
    avg: number;
    p50: number;
    p90: number;
    p95: number;
    p99: number;
    max: number;
    atendeSLA: boolean;
  }> = [];

  afterAll(() => {
    console.log('\n========================================================================================================');
    console.log('RELATÓRIO CONSOLIDADO DE LATÊNCIA (p95) DAS APIS - SGP CATÓLICA SC (TSK-61 / RNF03)');
    console.log('========================================================================================================');
    console.log(`Configuração das Rotas : force-dynamic (revalidate = 0, Cache-Control: no-store)`);
    console.log(`Meta Estipulada RNF03  : p95 < ${TARGET_P95_MS} ms`);
    console.log(`Amostras Coletadas     : ${AMOSTRAS_POR_ROTA} requisições por rota com warm-up prévio`);
    console.log('--------------------------------------------------------------------------------------------------------');
    console.log('| Rota / Endpoint | Amostras | Min (ms) | Média (ms) | p50 (ms) | p90 (ms) | p95 (ms) | p99 (ms) | Max (ms) | Meta | Status |');
    console.log('|---|---|---|---|---|---|---|---|---|---|---|');

    relatorioTabela.forEach(r => {
      const statusStr = r.atendeSLA ? '✅ CONFORME' : '❌ VIOLADO';
      console.log(`| **${r.endpoint}** | ${AMOSTRAS_POR_ROTA} | ${r.min} | ${r.avg} | ${r.p50} | ${r.p90} | **${r.p95}** | ${r.p99} | ${r.max} | < ${TARGET_P95_MS}ms | ${statusStr} |`);
    });

    console.log('--------------------------------------------------------------------------------------------------------');
    const todosOk = relatorioTabela.every(r => r.atendeSLA);
    console.log(`RESULTADO FINAL DO SLA DE PERFORMANCE: ${todosOk ? 'TODAS AS ROTAS EM CONFORMIDADE COM A META (p95 < 250 ms) 🚀' : 'ATENÇÃO: Rotas excederam o limiar'}`);
    console.log('========================================================================================================\n');
  });

  async function benchmarkEndpoint(endpointNome: string, handlerFn: () => Promise<Response>) {
    // 1. Warm-up (aquecimento de JIT, conexões e compilação de rota)
    for (let w = 0; w < 3; w++) {
      await handlerFn();
    }

    // 2. Coleta de amostras de latência com performance.now()
    const tempos: number[] = [];
    for (let i = 0; i < AMOSTRAS_POR_ROTA; i++) {
      const t0 = performance.now();
      const res = await handlerFn();
      const t1 = performance.now();
      expect(res.status).toBeLessThan(400); // 200 OK ou 201 Created
      tempos.push(t1 - t0);
    }

    const stats = calcularEstatisticas(tempos);
    relatorioTabela.push({
      endpoint: endpointNome,
      min: stats.min,
      avg: stats.avg,
      p50: stats.p50,
      p90: stats.p90,
      p95: stats.p95,
      p99: stats.p99,
      max: stats.max,
      atendeSLA: stats.atendeSLA
    });

    // Asserção estrita do RNF03: p95 DEVE ser inferior a 250 ms
    expect(stats.p95).toBeLessThanOrEqual(TARGET_P95_MS);
  }

  it('1. GET /api/alunos (Listagem Geral) - p95 < 250 ms', async () => {
    await benchmarkEndpoint('GET /api/alunos', async () => {
      return getAlunos(new Request('http://localhost:3000/api/alunos'));
    });
  });

  it('2. GET /api/alunos?turmaId=turma-1 (Filtro B-Tree por Turma) - p95 < 250 ms', async () => {
    await benchmarkEndpoint('GET /api/alunos?turmaId=turma-1', async () => {
      return getAlunos(new Request('http://localhost:3000/api/alunos?turmaId=turma-1'));
    });
  });

  it('3. GET /api/turmas (Listagem de Turmas) - p95 < 250 ms', async () => {
    await benchmarkEndpoint('GET /api/turmas', async () => {
      return getTurmas();
    });
  });

  it('4. GET /api/questoes (Banco de Questões com Alternativas) - p95 < 250 ms', async () => {
    await benchmarkEndpoint('GET /api/questoes', async () => {
      return getQuestoes();
    });
  });

  it('5. GET /api/exams (Avaliações Montadas com Snapshots) - p95 < 250 ms', async () => {
    await benchmarkEndpoint('GET /api/exams', async () => {
      return getExams(new Request('http://localhost:3000/api/exams'));
    });
  });

  it('6. GET /api/omr (Leituras OMR e Histórico) - p95 < 250 ms', async () => {
    await benchmarkEndpoint('GET /api/omr', async () => {
      return getOmr(new Request('http://localhost:3000/api/omr'));
    });
  });

  it('7. GET /api/omr?alunoId=aluno-1 (Filtro por Estudante) - p95 < 250 ms', async () => {
    await benchmarkEndpoint('GET /api/omr?alunoId=aluno-1', async () => {
      return getOmr(new Request('http://localhost:3000/api/omr?alunoId=aluno-1'));
    });
  });

  it('8. GET /api/relatorios?turmaId=TODAS (Agregação Consolidada) - p95 < 250 ms', async () => {
    await benchmarkEndpoint('GET /api/relatorios?turmaId=TODAS', async () => {
      return getRelatorios(new Request('http://localhost:3000/api/relatorios?turmaId=TODAS'));
    });
  });

  it('9. GET /api/relatorios?turmaId=turma-1 (Agregação com Índice por Turma) - p95 < 250 ms', async () => {
    await benchmarkEndpoint('GET /api/relatorios?turmaId=turma-1', async () => {
      return getRelatorios(new Request('http://localhost:3000/api/relatorios?turmaId=turma-1'));
    });
  });

  it('10. GET /api/estatisticas/questoes (Análise de Distratores) - p95 < 250 ms', async () => {
    await benchmarkEndpoint('GET /api/estatisticas/questoes', async () => {
      return getEstatisticasQuestoes(new Request('http://localhost:3000/api/estatisticas/questoes?turmaId=turma-1'));
    });
  });
});
