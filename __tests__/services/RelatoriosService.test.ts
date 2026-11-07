import { RelatoriosService } from '@/services/RelatoriosService';
import { AlunoModel, TurmaModel } from '@/models';
import { LeituraOMRRegistro, Question, ProvaMontadaRegistro } from '@/types';

describe('RelatoriosService - Pipeline de Agregação Estatística e Analítica', () => {
  const turmas: TurmaModel[] = [
    new TurmaModel({
      id: 't_direito',
      nome: 'Direito Civil',
      curso: 'Direito',
      semestre: '2026/2'
    })
  ];

  const alunos: AlunoModel[] = [
    new AlunoModel({
      id: 'alu_1',
      nome: 'Carlos Eduardo',
      ra: '100001',
      turmaId: 't_direito',
      n1: 8.0,
      n2: 9.0,
      n3: 7.0
    }),
    new AlunoModel({
      id: 'alu_2',
      nome: 'Mariana Silva',
      ra: '100002',
      turmaId: 't_direito',
      n1: 6.0,
      n2: 5.0,
      n3: 5.5
    }),
    new AlunoModel({
      id: 'alu_3',
      nome: 'João Pedro',
      ra: '100003',
      turmaId: 't_direito',
      n1: 3.0,
      n2: 2.0,
      n3: 2.5
    })
  ];

  const leiturasOMR: LeituraOMRRegistro[] = [
    {
      id: 'omr_1',
      alunoId: 'alu_1',
      alunoNome: 'Carlos Eduardo',
      ra: '100001',
      turmaId: 't_direito',
      turmaNome: 'Direito Civil',
      materia: 'Direito Civil',
      versao: 'A',
      acertos: 3,
      totalQuestoes: 3,
      notaCalculada: 10.0,
      dataLeitura: '07/11/2026',
      respostasDetectadas: { 1: 'B', 2: 'C', 3: 'A' },
      gabaritoOficial: { 1: 'B', 2: 'C', 3: 'A' },
      detalhesQuestoes: [
        { numero: 1, respostaMarcada: 'B', respostaCorreta: 'B', correta: true, status: 'CORRETA', score: 3.3, maxScore: 3.3 },
        { numero: 2, respostaMarcada: 'C', respostaCorreta: 'C', correta: true, status: 'CORRETA', score: 3.3, maxScore: 3.3 },
        { numero: 3, respostaMarcada: 'A', respostaCorreta: 'A', correta: true, status: 'CORRETA', score: 3.4, maxScore: 3.4 }
      ]
    },
    {
      id: 'omr_2',
      alunoId: 'alu_2',
      alunoNome: 'Mariana Silva',
      ra: '100002',
      turmaId: 't_direito',
      turmaNome: 'Direito Civil',
      materia: 'Direito Civil',
      versao: 'A',
      acertos: 1,
      totalQuestoes: 3,
      notaCalculada: 3.3,
      dataLeitura: '07/11/2026',
      respostasDetectadas: { 1: 'B', 2: 'D', 3: 'B' },
      gabaritoOficial: { 1: 'B', 2: 'C', 3: 'A' },
      detalhesQuestoes: [
        { numero: 1, respostaMarcada: 'B', respostaCorreta: 'B', correta: true, status: 'CORRETA', score: 3.3, maxScore: 3.3 },
        { numero: 2, respostaMarcada: 'D', respostaCorreta: 'C', correta: false, status: 'INCORRETA', score: 0, maxScore: 3.3 },
        { numero: 3, respostaMarcada: 'B', respostaCorreta: 'A', correta: false, status: 'INCORRETA', score: 0, maxScore: 3.4 }
      ]
    },
    {
      id: 'omr_3',
      alunoId: 'alu_3',
      alunoNome: 'João Pedro',
      ra: '100003',
      turmaId: 't_direito',
      turmaNome: 'Direito Civil',
      materia: 'Direito Civil',
      versao: 'A',
      acertos: 0,
      totalQuestoes: 3,
      notaCalculada: 0.0,
      dataLeitura: '07/11/2026',
      respostasDetectadas: { 1: 'A', 2: 'D', 3: null },
      gabaritoOficial: { 1: 'B', 2: 'C', 3: 'A' },
      detalhesQuestoes: [
        { numero: 1, respostaMarcada: 'A', respostaCorreta: 'B', correta: false, status: 'INCORRETA', score: 0, maxScore: 3.3 },
        { numero: 2, respostaMarcada: 'D', respostaCorreta: 'C', correta: false, status: 'INCORRETA', score: 0, maxScore: 3.3 },
        { numero: 3, respostaMarcada: null, respostaCorreta: 'A', correta: false, status: 'EM_BRANCO', score: 0, maxScore: 3.4 }
      ]
    }
  ];

  it('calcula métricas gerais da turma corretamente (média, desvio padrão e taxa de aprovação)', () => {
    const relatorio = RelatoriosService.gerarRelatorioTurma({
      turmaId: 't_direito',
      alunos,
      turmas,
      leiturasOMR
    });

    // Médias dos 3 alunos: 8.0, 5.5, 2.5
    // Média geral = (8.0 + 5.5 + 2.5) / 3 = 5.33 -> 5.3
    expect(relatorio.metricas.mediaGeral).toBeCloseTo(5.3, 1);
    expect(relatorio.metricas.desvioPadrao).toBeGreaterThan(0);
    expect(relatorio.metricas.taxaAprovacao).toBe(33); // 1 de 3 (33%)
    expect(relatorio.metricas.taxaExame).toBe(33); // 1 de 3 (33%)
    expect(relatorio.metricas.taxaReprovacao).toBe(33); // 1 de 3 (33%)
  });

  it('ordena o ranking de questões de forma estritamente decrescente por taxa de acerto', () => {
    const relatorio = RelatoriosService.gerarRelatorioTurma({
      turmaId: 't_direito',
      alunos,
      turmas,
      leiturasOMR
    });

    // Questão 1: 2 acertos de 3 (66.7%)
    // Questão 2: 1 acerto de 3 (33.3%)
    // Questão 3: 1 acerto de 3 (33.3%)
    const ranking = relatorio.rankingQuestoes;
    expect(ranking.length).toBe(3);
    expect(ranking[0].numero).toBe(1);
    expect(ranking[0].taxaAcerto).toBe(66.7);
    expect(ranking[0].totalAcertos).toBe(2);

    // O ranking deve estar ordenado descrescente
    for (let i = 1; i < ranking.length; i++) {
      expect(ranking[i - 1].taxaAcerto).toBeGreaterThanOrEqual(ranking[i].taxaAcerto);
    }
  });

  it('identifica corretamente os distratores mais assinalados e a questão crítica', () => {
    const relatorio = RelatoriosService.gerarRelatorioTurma({
      turmaId: 't_direito',
      alunos,
      turmas,
      leiturasOMR
    });

    // Na questão 2: 2 alunos erraram assinalando 'D' (distrator D com 100% dos erros)
    const q2 = relatorio.rankingQuestoes.find(q => q.numero === 2);
    expect(q2).toBeDefined();
    expect(q2!.distratorCritico).toBeDefined();
    expect(q2!.distratorCritico?.letra).toBe('D');
    expect(q2!.distratorCritico?.quantidade).toBe(2);

    // Questão Crítica deve ter a maior taxa de erro
    expect(relatorio.metricas.questaoCritica).toBeDefined();
    expect([2, 3]).toContain(relatorio.metricas.questaoCritica?.numero);
  });

  it('gera evolução temporal e mapa de calor individual para cada aluno', () => {
    const relatorio = RelatoriosService.gerarRelatorioTurma({
      turmaId: 't_direito',
      alunos,
      turmas,
      leiturasOMR
    });

    const alunoCarlos = relatorio.alunosConsolidado.find(a => a.ra === '100001');
    expect(alunoCarlos).toBeDefined();
    expect(alunoCarlos!.taxaAcertoIndividual).toBe(100);
    expect(alunoCarlos!.deltaRelativoTurma).toBeGreaterThan(0);
    expect(alunoCarlos!.evolucaoTemporal.length).toBe(3);
    expect(alunoCarlos!.evolucaoTemporal[0].etapa).toBe('N1');
    expect(alunoCarlos!.evolucaoTemporal[0].notaAluno).toBe(8.0);
    expect(alunoCarlos!.mapaDeQuestoes.length).toBe(3);
    expect(alunoCarlos!.mapaDeQuestoes[0].status).toBe('CORRETA');

    const alunoJoao = relatorio.alunosConsolidado.find(a => a.ra === '100003');
    expect(alunoJoao).toBeDefined();
    expect(alunoJoao!.mapaDeQuestoes.find(q => q.numero === 3)?.status).toBe('EM_BRANCO');
  });
});
