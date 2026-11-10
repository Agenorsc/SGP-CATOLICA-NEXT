import * as XLSX from 'xlsx';
import { ExportService } from '@/services/ExportService';
import { AlunoModel } from '@/models/AlunoModel';
import { TurmaModel } from '@/models/TurmaModel';
import { LeituraOMRRegistro, Question } from '@/types';

describe('ExportService - Exportação de Relatórios Excel (.xlsx) [TSK 40]', () => {
  const turmasMock: TurmaModel[] = [
    new TurmaModel({
      id: 'turma-1',
      nome: 'Direito Civil III',
      curso: 'Direito',
      semestre: '2026/2'
    }),
    new TurmaModel({
      id: 'turma-2',
      nome: 'Arquitetura de Software',
      curso: 'Engenharia de Software',
      semestre: '2026/2'
    })
  ];

  const alunosMock: AlunoModel[] = [
    new AlunoModel({
      id: 'aluno-1',
      nome: 'Mariana Silva',
      ra: '106975',
      turmaId: 'turma-1',
      curso: 'Direito',
      n1: 8.5,
      n2: 7.0,
      n3: 9.0,
      media: 8.2,
      status: 'Aprovado'
    }),
    new AlunoModel({
      id: 'aluno-2',
      nome: 'Carlos Eduardo',
      ra: '106976',
      turmaId: 'turma-1',
      curso: 'Direito',
      n1: 5.0,
      n2: 4.5,
      n3: 5.5,
      media: 5.0,
      status: 'Exame'
    }),
    new AlunoModel({
      id: 'aluno-3',
      nome: 'Beatriz Costa',
      ra: '106977',
      turmaId: 'turma-1',
      curso: 'Direito',
      n1: 2.0,
      n2: 3.0,
      n3: 2.5,
      media: 2.5,
      status: 'Reprovado'
    })
  ];

  const questoesMock: Question[] = [
    {
      id: 'q1',
      enunciado: 'Qual o marco inicial da personalidade civil?',
      tipo: 'objetiva',
      pontuacao: 1.25,
      tags: ['Direito Civil'],
      alternativas: [
        { id: 'a', letraOriginal: 'A', texto: 'Apenas após os 18 anos', correta: false },
        { id: 'b', letraOriginal: 'B', texto: 'Com o nascimento com vida', correta: true },
        { id: 'c', letraOriginal: 'C', texto: 'Com a concepção', correta: false },
        { id: 'd', letraOriginal: 'D', texto: 'Com o casamento', correta: false }
      ]
    },
    {
      id: 'q2',
      enunciado: 'São bens imóveis por acessão intelectual:',
      tipo: 'objetiva',
      pontuacao: 1.25,
      tags: ['Direito Civil'],
      alternativas: [
        { id: 'a', letraOriginal: 'A', texto: 'Tratores agrícolas', correta: false },
        { id: 'b', letraOriginal: 'B', texto: 'Títulos da dívida pública', correta: false },
        { id: 'c', letraOriginal: 'C', texto: 'Estátuas ornamentais do jardim', correta: true },
        { id: 'd', letraOriginal: 'D', texto: 'Direitos reais', correta: false }
      ]
    }
  ];

  const leiturasMock: LeituraOMRRegistro[] = [
    {
      id: 'leitura-1',
      alunoId: 'aluno-1',
      alunoNome: 'Mariana Silva',
      ra: '106975',
      turmaId: 'turma-1',
      turmaNome: 'Direito Civil III',
      materia: 'Direito Civil',
      versao: 'A',
      stage: 'N1',
      dataLeitura: '2026-11-10T14:30:00Z',
      acertos: 2,
      totalQuestoes: 2,
      notaCalculada: 10.0,
      respostasDetectadas: { 1: 'B', 2: 'C' },
      gabaritoOficial: { 1: 'B', 2: 'C' },
      detalhesQuestoes: [
        {
          numero: 1,
          respostaMarcada: 'B',
          respostaCorreta: 'B',
          status: 'CORRETA',
          correta: true,
          score: 1.25,
          maxScore: 1.25
        },
        {
          numero: 2,
          respostaMarcada: 'C',
          respostaCorreta: 'C',
          status: 'CORRETA',
          correta: true,
          score: 1.25,
          maxScore: 1.25
        }
      ]
    },
    {
      id: 'leitura-2',
      alunoId: 'aluno-2',
      alunoNome: 'Carlos Eduardo',
      ra: '106976',
      turmaId: 'turma-1',
      turmaNome: 'Direito Civil III',
      materia: 'Direito Civil',
      versao: 'A',
      stage: 'N1',
      dataLeitura: '2026-11-10T14:32:00Z',
      acertos: 1,
      totalQuestoes: 2,
      notaCalculada: 5.0,
      respostasDetectadas: { 1: 'C', 2: 'C' },
      gabaritoOficial: { 1: 'B', 2: 'C' },
      detalhesQuestoes: [
        {
          numero: 1,
          respostaMarcada: 'C',
          respostaCorreta: 'B',
          status: 'INCORRETA',
          correta: false,
          score: 0.0,
          maxScore: 1.25
        },
        {
          numero: 2,
          respostaMarcada: 'C',
          respostaCorreta: 'C',
          status: 'CORRETA',
          correta: true,
          score: 1.25,
          maxScore: 1.25
        }
      ]
    }
  ];

  it('constrói uma pasta de trabalho Excel (.xlsx) contendo exatamente as 3 abas especificadas', () => {
    const wb = ExportService.construirWorkbookRelatorio({
      alunos: alunosMock,
      turmas: turmasMock,
      leiturasOMR: leiturasMock,
      bancoQuestoes: questoesMock,
      turmaId: 'turma-1',
      filtroCiclo: 'N1',
      filtroSemestre: '2026/2',
      tituloProva: 'Direito Civil III - Avaliação Escrita N1'
    });

    expect(wb).toBeDefined();
    expect(wb.SheetNames).toHaveLength(3);
    expect(wb.SheetNames).toEqual([
      'Notas',
      'Espelho de Correção',
      'Estatística por Questão'
    ]);
  });

  it('preenche a aba "Notas" com colunas acadêmicas (N1, N2, N3, Média Final, Situação) e resumo consolidado', () => {
    const wb = ExportService.construirWorkbookRelatorio({
      alunos: alunosMock,
      turmas: turmasMock,
      leiturasOMR: leiturasMock,
      turmaId: 'turma-1'
    });

    const ws = wb.Sheets['Notas'];
    expect(ws).toBeDefined();

    const dados = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1 });
    expect(dados.length).toBeGreaterThan(4);

    const cabecalho = dados[0];
    expect(cabecalho).toContain('Matrícula (RA)');
    expect(cabecalho).toContain('Nome do Estudante');
    expect(cabecalho).toContain('Nota N1');
    expect(cabecalho).toContain('Nota N2');
    expect(cabecalho).toContain('Nota N3');
    expect(cabecalho).toContain('Média Final');
    expect(cabecalho).toContain('Situação Acadêmica');

    // Primeira aluna: Mariana Silva
    const linha1 = dados[1];
    expect(linha1[0]).toBe('106975');
    expect(linha1[1]).toBe('Mariana Silva');
    expect(linha1[5]).toBe(8.5); // N1
    expect(linha1[8]).toBe(8.2); // Média
    expect(linha1[9]).toBe('APROVADO');

    // Valida existência do bloco de resumo estatístico no rodapé
    const textoPlanilha = JSON.stringify(dados);
    expect(textoPlanilha).toContain('RESUMO CONSOLIDADO DA TURMA');
    expect(textoPlanilha).toContain('Média Geral da Turma:');
    expect(textoPlanilha).toContain('Taxa de Aprovação:');
  });

  it('preenche a aba "Espelho de Correção" com alternativa marcada, gabarito oficial e status por questão', () => {
    const wb = ExportService.construirWorkbookRelatorio({
      alunos: alunosMock,
      turmas: turmasMock,
      leiturasOMR: leiturasMock,
      turmaId: 'turma-1'
    });

    const ws = wb.Sheets['Espelho de Correção'];
    expect(ws).toBeDefined();

    const dados = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1 });
    expect(dados.length).toBe(3); // Cabecalho + 2 leituras

    const cabecalho = dados[0];
    expect(cabecalho).toContain('Matrícula (RA)');
    expect(cabecalho).toContain('Estudante');
    expect(cabecalho).toContain('Q.01 Marcada');
    expect(cabecalho).toContain('Q.01 Gabarito');
    expect(cabecalho).toContain('Q.01 Status');
    expect(cabecalho).toContain('Q.02 Marcada');
    expect(cabecalho).toContain('Q.02 Gabarito');
    expect(cabecalho).toContain('Q.02 Status');

    // Leitura 1: Mariana (acertou Q1 com B e Q2 com C)
    const rowMariana = dados.find(r => r[0] === '106975');
    expect(rowMariana).toBeDefined();
    expect(rowMariana![9]).toBe('B');       // Q1 Marcada
    expect(rowMariana![10]).toBe('B');      // Q1 Gabarito
    expect(rowMariana![11]).toBe('CORRETA'); // Q1 Status

    // Leitura 2: Carlos (marcou C na Q1 com gabarito B -> INCORRETA)
    const rowCarlos = dados.find(r => r[0] === '106976');
    expect(rowCarlos).toBeDefined();
    expect(rowCarlos![9]).toBe('C');         // Q1 Marcada
    expect(rowCarlos![10]).toBe('B');        // Q1 Gabarito
    expect(rowCarlos![11]).toBe('INCORRETA'); // Q1 Status
  });

  it('preenche a aba "Estatística por Questão" com acertos, erros, taxa de acerto e distratores', () => {
    const wb = ExportService.construirWorkbookRelatorio({
      alunos: alunosMock,
      turmas: turmasMock,
      leiturasOMR: leiturasMock,
      bancoQuestoes: questoesMock,
      turmaId: 'turma-1'
    });

    const ws = wb.Sheets['Estatística por Questão'];
    expect(ws).toBeDefined();

    const dados = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1 });
    expect(dados.length).toBeGreaterThanOrEqual(3); // Cabecalho + Q1 + Q2

    const cabecalho = dados[0];
    expect(cabecalho).toContain('Nº Questão');
    expect(cabecalho).toContain('Gabarito Oficial');
    expect(cabecalho).toContain('Total Respostas');
    expect(cabecalho).toContain('Acertos Absolutos');
    expect(cabecalho).toContain('Erros Absolutos');
    expect(cabecalho).toContain('Taxa de Acerto (%)');
    expect(cabecalho).toContain('Nível de Dificuldade');
    expect(cabecalho).toContain('Distrator Mais Assinalado');

    // Q.01: 1 acerto (Mariana) e 1 erro (Carlos marcou C)
    const q1 = dados.find(r => r[0] === 'Q.01');
    expect(q1).toBeDefined();
    expect(q1![1]).toBe('B'); // Gabarito
    expect(q1![2]).toBe(2);   // Total respostas
    expect(q1![3]).toBe(1);   // Acertos
    expect(q1![4]).toBe(1);   // Erros
    expect(q1![7]).toBe(50);  // 50% de acerto
    expect(q1![9]).toContain('C'); // Distrator C assinalado por Carlos
  });

  it('mantém compatibilidade retroativa com a exportação legada CSV via gerarCsvNotas', () => {
    // Cria spy do DOM para validar o trigger do download
    const appendChildSpy = jest.spyOn(document.body, 'appendChild').mockImplementation(() => null as any);
    const removeChildSpy = jest.spyOn(document.body, 'removeChild').mockImplementation(() => null as any);
    window.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
    window.URL.revokeObjectURL = jest.fn();

    expect(() => {
      ExportService.gerarCsvNotas(alunosMock, turmasMock, 'Direito Civil III');
    }).not.toThrow();

    expect(appendChildSpy).toHaveBeenCalled();
    expect(removeChildSpy).toHaveBeenCalled();

    appendChildSpy.mockRestore();
    removeChildSpy.mockRestore();
  });
});
