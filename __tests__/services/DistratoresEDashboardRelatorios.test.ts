import { RelatoriosService } from '@/services/RelatoriosService';
import { AlunoModel, TurmaModel } from '@/models';
import { LeituraOMRRegistro, Question } from '@/types';

describe('TSK-36: Dashboard de Relatórios e Painel de Análise de Distratores', () => {
  const turmaDireito = new TurmaModel({
    id: 'turma-direito-101',
    nome: 'Direito Constitucional II',
    curso: 'Direito',
    semestre: '2026/2'
  });

  const turmaSoftware = new TurmaModel({
    id: 'turma-software-202',
    nome: 'Engenharia de Software IV',
    curso: 'Sistemas de Informação',
    semestre: '2026/2'
  });

  const turmas: TurmaModel[] = [turmaDireito, turmaSoftware];

  const alunos: AlunoModel[] = [
    new AlunoModel({
      id: 'aluno-1',
      nome: 'Carlos Silva',
      ra: 'RA1001',
      turmaId: turmaDireito.id,
      n1: 8.0,
      n2: 7.0,
      n3: 9.0
    }),
    new AlunoModel({
      id: 'aluno-2',
      nome: 'Beatriz Costa',
      ra: 'RA1002',
      turmaId: turmaDireito.id,
      n1: 4.0,
      n2: 5.0,
      n3: 6.0
    }),
    new AlunoModel({
      id: 'aluno-3',
      nome: 'Daniela Rocha',
      ra: 'RA1003',
      turmaId: turmaDireito.id,
      n1: 9.0,
      n2: 9.5,
      n3: 10.0
    }),
    new AlunoModel({
      id: 'aluno-4',
      nome: 'Eduardo Lima',
      ra: 'RA1004',
      turmaId: turmaDireito.id,
      n1: 6.0,
      n2: 6.0,
      n3: 6.0
    })
  ];

  const questoesMock: Question[] = [
    {
      id: 'q1',
      enunciado: 'Qual o princípio fundamental previsto no art. 1º da CF/88?',
      tipo: 'objetiva',
      pontuacao: 2.5,
      tags: ['Direito Constitucional', 'CF88'],
      alternativas: [
        { id: 'alt1-a', letraOriginal: 'A', texto: 'Soberania', correta: true },
        { id: 'alt1-b', letraOriginal: 'B', texto: 'Monarquia', correta: false },
        { id: 'alt1-c', letraOriginal: 'C', texto: 'Autoritarismo', correta: false },
        { id: 'alt1-d', letraOriginal: 'D', texto: 'Oligarquia', correta: false }
      ]
    },
    {
      id: 'q2',
      enunciado: 'Sobre o controle de constitucionalidade difuso:',
      tipo: 'objetiva',
      pontuacao: 2.5,
      tags: ['Controle Constitucionalidade'],
      alternativas: [
        { id: 'alt2-a', letraOriginal: 'A', texto: 'Exclusivo do STF', correta: false },
        { id: 'alt2-b', letraOriginal: 'B', texto: 'Qualquer juiz ou tribunal', correta: true },
        { id: 'alt2-c', letraOriginal: 'C', texto: 'Apenas Senado Federal', correta: false },
        { id: 'alt2-d', letraOriginal: 'D', texto: 'Inexistente no Brasil', correta: false }
      ]
    }
  ];

  it('deve remover fallbacks fixos e utilizar dados dinâmicos da turma selecionada', () => {
    const relatorio = RelatoriosService.gerarRelatorioTurma({
      turmaId: turmaDireito.id,
      alunos,
      turmas,
      leiturasOMR: [],
      filtroCiclo: 'N1',
      filtroSemestre: '2026/2'
    });

    // Não deve conter valores fixos estáticos legados
    expect(relatorio.turmaNome).toBe('Direito Constitucional II');
    expect(relatorio.disciplina).toBe('Direito Constitucional II (Direito)');
    expect(relatorio.disciplina).not.toContain('Direito / Engenharia');
    expect(relatorio.turmaNome).not.toBe('Engenharia IV');
  });

  it('deve calcular adequadamente a distribuição de opções e a alternativa mais marcada (distrator crítico)', () => {
    // 4 leituras OMR:
    // Q1 (Gabarito A):
    // - Aluno 1: A (Acerto)
    // - Aluno 2: B (Erro - Distrator B)
    // - Aluno 3: B (Erro - Distrator B)
    // - Aluno 4: B (Erro - Distrator B)
    // Distrator B: 3 votos (100% dos erros, 75% de todas as opções) -> Distrator Crítico Forte!
    //
    // Q2 (Gabarito B):
    // - Aluno 1: B (Acerto)
    // - Aluno 2: B (Acerto)
    // - Aluno 3: C (Erro - Distrator C)
    // - Aluno 4: A (Erro - Distrator A)
    // Opção D: 0 votos (Distrator não funcional)

    const leiturasOMR: LeituraOMRRegistro[] = [
      {
        id: 'leit-1',
        alunoId: 'aluno-1',
        alunoNome: 'Carlos Silva',
        ra: 'RA1001',
        turmaId: turmaDireito.id,
        turmaNome: turmaDireito.nome,
        stage: 'N1',
        materia: 'Direito Constitucional II',
        versao: 'A',
        dataLeitura: '2026-11-10T10:00:00Z',
        totalQuestoes: 2,
        acertos: 2,
        notaCalculada: 10.0,
        gabaritoOficial: { 1: 'A', 2: 'B' },
        respostasDetectadas: { 1: 'A', 2: 'B' },
        detalhesQuestoes: [
          { numero: 1, respostaMarcada: 'A', respostaCorreta: 'A', status: 'CORRETA', correta: true, maxScore: 5.0, score: 5.0 },
          { numero: 2, respostaMarcada: 'B', respostaCorreta: 'B', status: 'CORRETA', correta: true, maxScore: 5.0, score: 5.0 }
        ]
      },
      {
        id: 'leit-2',
        alunoId: 'aluno-2',
        alunoNome: 'Beatriz Costa',
        ra: 'RA1002',
        turmaId: turmaDireito.id,
        turmaNome: turmaDireito.nome,
        stage: 'N1',
        materia: 'Direito Constitucional II',
        versao: 'A',
        dataLeitura: '2026-11-10T10:05:00Z',
        totalQuestoes: 2,
        acertos: 1,
        notaCalculada: 5.0,
        gabaritoOficial: { 1: 'A', 2: 'B' },
        respostasDetectadas: { 1: 'B', 2: 'B' },
        detalhesQuestoes: [
          { numero: 1, respostaMarcada: 'B', respostaCorreta: 'A', status: 'INCORRETA', correta: false, maxScore: 5.0, score: 0 },
          { numero: 2, respostaMarcada: 'B', respostaCorreta: 'B', status: 'CORRETA', correta: true, maxScore: 5.0, score: 5.0 }
        ]
      },
      {
        id: 'leit-3',
        alunoId: 'aluno-3',
        alunoNome: 'Daniela Rocha',
        ra: 'RA1003',
        turmaId: turmaDireito.id,
        turmaNome: turmaDireito.nome,
        stage: 'N1',
        materia: 'Direito Constitucional II',
        versao: 'A',
        dataLeitura: '2026-11-10T10:10:00Z',
        totalQuestoes: 2,
        acertos: 0,
        notaCalculada: 0,
        gabaritoOficial: { 1: 'A', 2: 'B' },
        respostasDetectadas: { 1: 'B', 2: 'C' },
        detalhesQuestoes: [
          { numero: 1, respostaMarcada: 'B', respostaCorreta: 'A', status: 'INCORRETA', correta: false, maxScore: 5.0, score: 0 },
          { numero: 2, respostaMarcada: 'C', respostaCorreta: 'B', status: 'INCORRETA', correta: false, maxScore: 5.0, score: 0 }
        ]
      },
      {
        id: 'leit-4',
        alunoId: 'aluno-4',
        alunoNome: 'Eduardo Lima',
        ra: 'RA1004',
        turmaId: turmaDireito.id,
        turmaNome: turmaDireito.nome,
        stage: 'N1',
        materia: 'Direito Constitucional II',
        versao: 'A',
        dataLeitura: '2026-11-10T10:15:00Z',
        totalQuestoes: 2,
        acertos: 0,
        notaCalculada: 0,
        gabaritoOficial: { 1: 'A', 2: 'B' },
        respostasDetectadas: { 1: 'B', 2: 'A' },
        detalhesQuestoes: [
          { numero: 1, respostaMarcada: 'B', respostaCorreta: 'A', status: 'INCORRETA', correta: false, maxScore: 5.0, score: 0 },
          { numero: 2, respostaMarcada: 'A', respostaCorreta: 'B', status: 'INCORRETA', correta: false, maxScore: 5.0, score: 0 }
        ]
      }
    ];

    const relatorio = RelatoriosService.gerarRelatorioTurma({
      turmaId: turmaDireito.id,
      alunos,
      turmas,
      leiturasOMR,
      bancoQuestoes: questoesMock,
      filtroCiclo: 'N1'
    });

    expect(relatorio.rankingQuestoes.length).toBe(2);

    // Questão 1: Acerto 25% (1/4), Erro 75% (3/4)
    const q1 = relatorio.rankingQuestoes.find(q => q.numero === 1)!;
    expect(q1).toBeDefined();
    expect(q1.totalSubmissoes).toBe(4);
    expect(q1.totalAcertos).toBe(1);
    expect(q1.taxaAcerto).toBe(25.0);
    expect(q1.taxaErro).toBe(75.0);
    expect(q1.gabaritoOficial).toBe('A');

    // Distrator Crítico de Q1 deve ser a alternativa B
    expect(q1.distratorCritico).toBeDefined();
    expect(q1.distratorCritico?.letra).toBe('B');
    expect(q1.distratorCritico?.quantidade).toBe(3);
    expect(q1.distratorCritico?.percentual).toBe(100.0); // 3 de 3 erros

    // Distribuição de Opções de Q1
    expect(q1.distribuicaoOpcoes).toBeDefined();
    expect(q1.distribuicaoOpcoes?.['A'].quantidade).toBe(1);
    expect(q1.distribuicaoOpcoes?.['A'].percentual).toBe(25.0);
    expect(q1.distribuicaoOpcoes?.['B'].quantidade).toBe(3);
    expect(q1.distribuicaoOpcoes?.['B'].percentual).toBe(75.0);
    expect(q1.distribuicaoOpcoes?.['C'].quantidade).toBe(0);
    expect(q1.distribuicaoOpcoes?.['C'].percentual).toBe(0.0);
    expect(q1.distribuicaoOpcoes?.['D'].quantidade).toBe(0);

    // Questão 2: Acertos 50% (2/4 - Aluno 1 e 2)
    const q2 = relatorio.rankingQuestoes.find(q => q.numero === 2)!;
    expect(q2).toBeDefined();
    expect(q2.taxaAcerto).toBe(50.0);
    expect(q2.gabaritoOficial).toBe('B');
    expect(q2.distribuicaoOpcoes?.['B'].quantidade).toBe(2);
    expect(q2.distribuicaoOpcoes?.['A'].quantidade).toBe(1);
    expect(q2.distribuicaoOpcoes?.['C'].quantidade).toBe(1);
    expect(q2.distribuicaoOpcoes?.['D'].quantidade).toBe(0); // Distrator Ineficaz (0%)

    // Questão Crítica detectada deve ser a Questão 1 (75% erro vs 50% erro)
    expect(relatorio.metricas.questaoCritica?.numero).toBe(1);
    expect(relatorio.metricas.questaoCritica?.taxaErro).toBe(75.0);
  });

  it('deve consolidar corretamente notas e histórico temporal de cada aluno no drilldown', () => {
    const relatorio = RelatoriosService.gerarRelatorioTurma({
      turmaId: turmaDireito.id,
      alunos,
      turmas,
      leiturasOMR: [],
      filtroCiclo: 'TODAS'
    });

    const carlos = relatorio.alunosConsolidado.find(a => a.ra === 'RA1001')!;
    expect(carlos).toBeDefined();
    expect(carlos.alunoNome).toBe('Carlos Silva');
    expect(carlos.n1).toBe(8.0);
    expect(carlos.n2).toBe(7.0);
    expect(carlos.n3).toBe(9.0);
    expect(carlos.mediaFinal).toBeCloseTo(8.0, 1);
    expect(carlos.evolucaoTemporal.length).toBe(3);
    expect(carlos.evolucaoTemporal[0].etapa).toBe('N1');
    expect(carlos.evolucaoTemporal[1].etapa).toBe('N2');
    expect(carlos.evolucaoTemporal[2].etapa).toBe('N3');
  });
});
