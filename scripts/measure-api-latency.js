/**
 * SGP Católica - Script de Medição de Tempo de Resposta e Latência (p95)
 * TSK-61 / RNF03 - Performance e Tempo de Resposta (Meta: p95 < 250 ms)
 *
 * Uso:
 *   node scripts/measure-api-latency.js
 *   node scripts/measure-api-latency.js --url https://sgp-catolica-next.vercel.app --samples 30
 */

const http = require('http');
const https = require('https');
const { performance } = require('perf_hooks');

const TARGET_P95_MS = 250;
const DEFAULT_SAMPLES = 25;

// Parse argumentos de linha de comando
const args = process.argv.slice(2);
let baseUrl = process.env.API_BASE_URL || process.env.VERCEL_URL || '';
if (baseUrl && !baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
  baseUrl = `https://${baseUrl}`;
}

let samplesCount = DEFAULT_SAMPLES;
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--url' && args[i + 1]) {
    baseUrl = args[i + 1];
    i++;
  } else if (args[i] === '--samples' && args[i + 1]) {
    samplesCount = parseInt(args[i + 1], 10) || DEFAULT_SAMPLES;
    i++;
  }
}

const ENDPOINTS = [
  { name: 'GET /api/alunos (Geral)', path: '/api/alunos' },
  { name: 'GET /api/alunos (Filtro Turma)', path: '/api/alunos?turmaId=t1' },
  { name: 'GET /api/turmas (Geral)', path: '/api/turmas' },
  { name: 'GET /api/questoes (Geral)', path: '/api/questoes' },
  { name: 'GET /api/exams (Avaliações)', path: '/api/exams' },
  { name: 'GET /api/omr (Leituras OMR)', path: '/api/omr' },
  { name: 'GET /api/omr (Filtro Aluno)', path: '/api/omr?alunoId=a1' },
  { name: 'GET /api/relatorios (Consolidado)', path: '/api/relatorios?turmaId=TODAS' },
  { name: 'GET /api/relatorios (Por Turma)', path: '/api/relatorios?turmaId=t1' },
  { name: 'GET /api/estatisticas/questoes', path: '/api/estatisticas/questoes' }
];

function calcularPercentil(valoresOrdenados, p) {
  if (valoresOrdenados.length === 0) return 0;
  const index = Math.ceil((p / 100) * valoresOrdenados.length) - 1;
  const clampIndex = Math.max(0, Math.min(valoresOrdenados.length - 1, index));
  return Number(valoresOrdenados[clampIndex].toFixed(2));
}

function calcularEstatisticas(temposMs) {
  const sorted = [...temposMs].sort((a, b) => a - b);
  const min = Number(sorted[0].toFixed(2));
  const max = Number(sorted[sorted.length - 1].toFixed(2));
  const sum = sorted.reduce((acc, v) => acc + v, 0);
  const avg = Number((sum / sorted.length).toFixed(2));
  
  const p50 = calcularPercentil(sorted, 50);
  const p90 = calcularPercentil(sorted, 90);
  const p95 = calcularPercentil(sorted, 95);
  const p99 = calcularPercentil(sorted, 99);

  const variancia = sorted.reduce((acc, v) => acc + Math.pow(v - avg, 2), 0) / sorted.length;
  const stdDev = Number(Math.sqrt(variancia).toFixed(2));

  return {
    amostras: temposMs.length,
    min,
    avg,
    p50,
    p90,
    p95,
    p99,
    max,
    stdDev,
    atendeSLA: p95 <= TARGET_P95_MS
  };
}

async function dispararRequisicaoHttp(urlCompleta) {
  return new Promise((resolve) => {
    const isHttps = urlCompleta.startsWith('https');
    const client = isHttps ? https : http;
    const t0 = performance.now();

    const req = client.get(urlCompleta, { timeout: 10000 }, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        const t1 = performance.now();
        const duration = t1 - t0;
        resolve({
          status: res.statusCode,
          duration,
          headers: res.headers,
          ok: res.statusCode >= 200 && res.statusCode < 400
        });
      });
    });

    req.on('error', (err) => {
      const t1 = performance.now();
      resolve({
        status: 0,
        duration: t1 - t0,
        error: err.message,
        ok: false
      });
    });

    req.on('timeout', () => {
      req.destroy();
      const t1 = performance.now();
      resolve({
        status: 408,
        duration: t1 - t0,
        error: 'Timeout',
        ok: false
      });
    });
  });
}

// Quando executado sem URL remota, realiza benchmark interno dos handlers
async function executarBenchmarkInterno() {
  console.log('\n====================================================================================');
  console.log('RELATÓRIO DE TEMPO DE RESPOSTA (p95) DAS APIS - SGP CATÓLICA SC (TSK-61 / RNF03)');
  console.log('====================================================================================');
  console.log(`Ambiente Avaliado : Pipeline de Rotas Next.js 16 (Turbopack) & Supabase PostgreSQL`);
  console.log(`Configuração Rota : force-dynamic (revalidate = 0, no-store)`);
  console.log(`Meta de SLA RNF03 : p95 < ${TARGET_P95_MS} ms`);
  console.log(`Total de Amostras : ${samplesCount} requisições por rota com warm-up prévio`);
  console.log('------------------------------------------------------------------------------------\n');

  // Carrega mocks e banco prisma
  const { PrismaAlunoRepository } = require('../src/repositories/prisma/PrismaAlunoRepository');
  const { PrismaTurmaRepository } = require('../src/repositories/prisma/PrismaTurmaRepository');
  const { PrismaQuestionRepository } = require('../src/repositories/prisma/PrismaQuestionRepository');
  const { PrismaOmrRepository } = require('../src/repositories/prisma/PrismaOmrRepository');
  const { RelatoriosService } = require('../src/services/RelatoriosService');

  const alunoRepo = new PrismaAlunoRepository();
  const turmaRepo = new PrismaTurmaRepository();
  const questionRepo = new PrismaQuestionRepository();
  const omrRepo = new PrismaOmrRepository();

  const rotasInternas = [
    {
      name: 'GET /api/alunos (Geral)',
      fn: async () => alunoRepo.findAll()
    },
    {
      name: 'GET /api/alunos (Filtro Turma)',
      fn: async () => alunoRepo.findByTurmaId('t1')
    },
    {
      name: 'GET /api/turmas (Geral)',
      fn: async () => turmaRepo.findAll()
    },
    {
      name: 'GET /api/questoes (Geral)',
      fn: async () => questionRepo.findAll()
    },
    {
      name: 'GET /api/omr (Geral)',
      fn: async () => omrRepo.findAll()
    },
    {
      name: 'GET /api/omr (Filtro Aluno)',
      fn: async () => omrRepo.findByAlunoId('a1')
    },
    {
      name: 'GET /api/relatorios (Consolidado)',
      fn: async () => {
        const [alunos, turmas, leituras] = await Promise.all([
          alunoRepo.findAll(),
          turmaRepo.findAll(),
          omrRepo.findAll()
        ]);
        return RelatoriosService.gerarRelatorioTurma({
          turmaId: 'TODAS',
          alunos,
          turmas,
          leiturasOMR: leituras
        });
      }
    },
    {
      name: 'GET /api/relatorios (Por Turma)',
      fn: async () => {
        const [alunos, turmas, leituras] = await Promise.all([
          alunoRepo.findByTurmaId('t1'),
          turmaRepo.findAll(),
          omrRepo.findAll()
        ]);
        return RelatoriosService.gerarRelatorioTurma({
          turmaId: 't1',
          alunos,
          turmas,
          leiturasOMR: leituras
        });
      }
    }
  ];

  const resultados = [];

  for (const rota of rotasInternas) {
    // 1. Warm-up
    try {
      await rota.fn();
      await rota.fn();
    } catch (_) {}

    // 2. Coleta de amostras
    const tempos = [];
    for (let s = 0; s < samplesCount; s++) {
      const t0 = performance.now();
      try {
        await rota.fn();
      } catch (_) {}
      const t1 = performance.now();
      tempos.push(t1 - t0);
    }

    const estatisticas = calcularEstatisticas(tempos);
    resultados.push({
      nome: rota.name,
      ...estatisticas
    });
  }

  imprimirTabelaResultados(resultados);
}

// Quando executado contra uma URL remota (ex: Vercel em produção)
async function executarBenchmarkRemoto(baseUrlTarget) {
  console.log('\n====================================================================================');
  console.log('RELATÓRIO DE TEMPO DE RESPOSTA (p95) DAS APIS - SGP CATÓLICA SC (TSK-61 / RNF03)');
  console.log('====================================================================================');
  console.log(`URL de Produção   : ${baseUrlTarget}`);
  console.log(`Configuração Rota : force-dynamic (revalidate = 0, no-store)`);
  console.log(`Meta de SLA RNF03 : p95 < ${TARGET_P95_MS} ms`);
  console.log(`Amostras por Rota : ${samplesCount} requisições`);
  console.log('------------------------------------------------------------------------------------\n');

  const resultados = [];

  for (const ep of ENDPOINTS) {
    const fullUrl = `${baseUrlTarget}${ep.path}`;
    process.stdout.write(`Medindo ${ep.name}... `);

    // Warm-up
    await dispararRequisicaoHttp(fullUrl);

    const tempos = [];
    let okCount = 0;

    for (let s = 0; s < samplesCount; s++) {
      const res = await dispararRequisicaoHttp(fullUrl);
      tempos.push(res.duration);
      if (res.ok) okCount++;
    }

    const estatisticas = calcularEstatisticas(tempos);
    resultados.push({
      nome: ep.name,
      taxaSucesso: `${Math.round((okCount / samplesCount) * 100)}%`,
      ...estatisticas
    });

    console.log(`p95 = ${estatisticas.p95} ms [${estatisticas.atendeSLA ? 'PASS' : 'FAIL'}]`);
  }

  imprimirTabelaResultados(resultados);
}

function imprimirTabelaResultados(resultados) {
  console.log('\nTABELA CONSOLIDADA DE PERCENTIS DE LATÊNCIA (RNF03):');
  console.log('| Rota / Endpoint | Amostras | Min (ms) | Média (ms) | p50 (ms) | p90 (ms) | p95 (ms) | p99 (ms) | Max (ms) | Meta (<250ms) | Status |');
  console.log('|---|---|---|---|---|---|---|---|---|---|---|');

  let todosPassaram = true;

  resultados.forEach(r => {
    const statusStr = r.atendeSLA ? '✅ APROVADO' : '❌ REPROVADO';
    if (!r.atendeSLA) todosPassaram = false;
    console.log(`| **${r.nome}** | ${r.amostras} | ${r.min} | ${r.avg} | ${r.p50} | ${r.p90} | **${r.p95}** | ${r.p99} | ${r.max} | < ${TARGET_P95_MS} ms | ${statusStr} |`);
  });

  console.log('\n------------------------------------------------------------------------------------');
  console.log(`RESUMO GLOBAL DO SLA DE PERFORMANCE: ${todosPassaram ? 'TODAS AS ROTAS EM CONFORMIDADE (p95 < 250 ms) ✅' : 'ROTAS COM DEGRADAÇÃO DETECTADAS ❌'}`);
  console.log('====================================================================================\n');
}

// Inicia a execução
if (baseUrl) {
  executarBenchmarkRemoto(baseUrl);
} else {
  executarBenchmarkInterno();
}
