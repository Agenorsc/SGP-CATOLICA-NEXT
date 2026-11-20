import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MontadorTab } from '../../src/components/montador/MontadorTab';
import { ImpressaoTab } from '../../src/components/impressao/ImpressaoTab';
import { Question, AvaliacaoCiclo } from '../../src/types';
import { TurmaModel } from '../../src/models/TurmaModel';
import { AlunoModel } from '../../src/models/AlunoModel';
import { ContagemCiclos } from '../../src/services/QuestionService';

describe('TSK-60 — Frontend Integration: MontadorTab & ImpressaoTab (Gabarito, 10.0 pts, Limite 30q, Exame N-1)', () => {
  const mockTurma = new TurmaModel({
    id: 'turma-eng-01',
    nome: 'Engenharia de Software IV',
    curso: 'Engenharia de Software',
    semestre: '2026/2',
    professorId: 'prof-01'
  });

  const mockAlunos = [
    new AlunoModel({ id: 'alu-1', nome: 'Gabriel Menezes', ra: '20241001', turmaId: 'turma-eng-01' }),
    new AlunoModel({ id: 'alu-2', nome: 'Beatriz Ramos', ra: '20241002', turmaId: 'turma-eng-01' }),
    new AlunoModel({ id: 'alu-3', nome: 'Carlos Eduardo', ra: '20241003', turmaId: 'turma-eng-01' }),
    new AlunoModel({ id: 'alu-4', nome: 'Daniela Silva', ra: '20241004', turmaId: 'turma-eng-01' })
  ];

  const criarQuestao = (id: string, enunciado: string, pontuacao: number, ciclo: 'N1' | 'N2' | 'N3' | 'N-1' = 'N2'): Question => ({
    id,
    tipo: 'objetiva',
    type: 'OBJECTIVE',
    enunciado,
    pontuacao,
    avaliacao: ciclo,
    turmaId: 'turma-eng-01',
    tags: [ciclo, 'Engenharia'],
    alternativas: [
      { id: `alt_${id}_A`, letraOriginal: 'A', texto: 'Alternativa A', correta: true },
      { id: `alt_${id}_B`, letraOriginal: 'B', texto: 'Alternativa B', correta: false },
      { id: `alt_${id}_C`, letraOriginal: 'C', texto: 'Alternativa C', correta: false },
      { id: `alt_${id}_D`, letraOriginal: 'D', texto: 'Alternativa D', correta: false }
    ]
  });

  const mockQuestoesBase: Question[] = [
    criarQuestao('q1', 'Primeira questão sobre SOLID', 2.5, 'N1'),
    criarQuestao('q2', 'Segunda questão sobre Padrões de Projeto', 2.5, 'N1'),
    criarQuestao('q3', 'Terceira questão sobre Arquitetura em Camadas', 2.5, 'N2'),
    criarQuestao('q4', 'Quarta questão sobre Testes Unitários e CI/CD', 2.5, 'N3')
  ];

  const mockContagem: ContagemCiclos = {
    todas: 4,
    n1: 2,
    n2: 1,
    n3: 1,
    exame: 4,
    geral: 0
  };

  const defaultMontadorProps = {
    bancoQuestoes: mockQuestoesBase,
    questoesFiltradas: mockQuestoesBase,
    questoesSelecionadas: mockQuestoesBase,
    turmas: [mockTurma],
    turmaSelecionadaId: 'turma-eng-01',
    setTurmaSelecionadaId: jest.fn(),
    tituloProva: 'Exame de Engenharia',
    setTituloProva: jest.fn(),
    buscaQuestao: '',
    setBuscaQuestao: jest.fn(),
    cicloSelecionado: 'TODAS' as AvaliacaoCiclo | 'TODAS',
    setCicloSelecionado: jest.fn(),
    filtroApenasTurma: false,
    setFiltroApenasTurma: jest.fn(),
    contagemCiclos: mockContagem,
    shuffleQ: true,
    setShuffleQ: jest.fn(),
    shuffleAlt: true,
    setShuffleAlt: jest.fn(),
    withId: true,
    setWithId: jest.fn(),
    pontuacaoTotal: 10.0,
    provasMontadas: [],
    onSalvarProva: jest.fn(),
    onExcluirProva: jest.fn(),
    onCarregarProvaParaReimpressao: jest.fn(),
    onIrParaRelatorioDaTurma: jest.fn(),
    onOpenNovaQuestao: jest.fn(),
    onEditQuestao: jest.fn(),
    onDeleteQuestao: jest.fn(),
    onAdicionarNaProva: jest.fn(),
    onRemoverDaProva: jest.fn(),
    onIrParaImpressao: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('1. MontadorTab — Validações de Pontuação 10.0 e Limite de 30 Questões', () => {
    it('deve exibir aviso e bloquear envio quando a pontuação for diferente de 10.0 pontos', () => {
      render(<MontadorTab {...defaultMontadorProps} pontuacaoTotal={7.5} />);

      const gerarBtn = screen.getByRole('button', { name: /Salvar e Gerar Prova Montada/i });
      fireEvent.click(gerarBtn);

      expect(screen.getByText(/A soma das questões deve ser exatamente 10.0 pontos/i)).toBeInTheDocument();
      expect(defaultMontadorProps.onSalvarProva).not.toHaveBeenCalled();
      expect(defaultMontadorProps.onIrParaImpressao).not.toHaveBeenCalled();
    });

    it('deve exibir aviso e bloquear envio quando a prova exceder 30 questões', () => {
      const maisDe30 = Array.from({ length: 31 }, (_, i) => criarQuestao(`q_${i}`, `Questão ${i}`, 10 / 31));

      render(
        <MontadorTab
          {...defaultMontadorProps}
          questoesSelecionadas={maisDe30}
          pontuacaoTotal={10.0}
        />
      );

      const gerarBtn = screen.getByRole('button', { name: /Salvar e Gerar Prova Montada/i });
      fireEvent.click(gerarBtn);

      expect(screen.getByText(/O limite máximo permitido por prova é de 30 questões/i)).toBeInTheDocument();
      expect(defaultMontadorProps.onSalvarProva).not.toHaveBeenCalled();
      expect(defaultMontadorProps.onIrParaImpressao).not.toHaveBeenCalled();
    });

    it('deve autorizar e gerar prova quando contiver 4 questões somando exatamente 10.0 pontos', () => {
      render(<MontadorTab {...defaultMontadorProps} pontuacaoTotal={10.0} />);

      const gerarBtn = screen.getByRole('button', { name: /Salvar e Gerar Prova Montada/i });
      fireEvent.click(gerarBtn);

      expect(defaultMontadorProps.onSalvarProva).toHaveBeenCalledWith(
        expect.objectContaining({
          totalQuestoes: 4,
          pontuacaoTotal: 10.0,
          turmaId: 'turma-eng-01'
        })
      );
      expect(defaultMontadorProps.onIrParaImpressao).toHaveBeenCalled();
    });

    it('deve exibir o contador de questões no caderno mostrando X / 30', () => {
      render(<MontadorTab {...defaultMontadorProps} />);
      expect(screen.getByText(/Questões no Caderno \(4 \/ 30\):/i)).toBeInTheDocument();
    });
  });

  describe('2. MontadorTab — Agrupamento do Exame N-1', () => {
    it('deve renderizar a aba Exame (N-1) com badge contabilizando as questões agrupadas', () => {
      render(<MontadorTab {...defaultMontadorProps} />);

      const tabExame = screen.getByRole('button', { name: /Exame \(N-1\)/i });
      expect(tabExame).toBeInTheDocument();
      expect(tabExame).toHaveTextContent('4'); // 4 questões no mockContagem.exame
    });

    it('deve permitir selecionar a aba Exame (N-1) disparando setCicloSelecionado', () => {
      render(<MontadorTab {...defaultMontadorProps} />);

      const tabExame = screen.getByRole('button', { name: /Exame \(N-1\)/i });
      fireEvent.click(tabExame);

      expect(defaultMontadorProps.setCicloSelecionado).toHaveBeenCalledWith('N-1');
    });

    it('deve salvar a avaliação com ciclo N-1 quando gerada com a aba N-1 selecionada', () => {
      render(
        <MontadorTab
          {...defaultMontadorProps}
          cicloSelecionado="N-1"
          pontuacaoTotal={10.0}
        />
      );

      const gerarBtn = screen.getByRole('button', { name: /Salvar e Gerar Prova Montada/i });
      fireEvent.click(gerarBtn);

      expect(defaultMontadorProps.onSalvarProva).toHaveBeenCalledWith(
        expect.objectContaining({
          ciclo: 'N-1',
          pontuacaoTotal: 10.0
        })
      );
      expect(defaultMontadorProps.onIrParaImpressao).toHaveBeenCalled();
    });
  });

  describe('3. ImpressaoTab — Caderno Impresso x Gabarito/OMR (Seed e Versões)', () => {
    it('deve renderizar o subtítulo AVALIAÇÃO ESCRITA (EXAME / N-1) no cabeçalho quando stage for N-1', () => {
      render(
        <ImpressaoTab
          alunosDaTurmaSelecionada={mockAlunos}
          selectedVersionIdx={0}
          setSelectedVersionIdx={jest.fn()}
          alunoAtual={mockAlunos[0]}
          tituloProva="Exame Final"
          turmaSelecionadaId="turma-eng-01"
          withId={true}
          questoesEmbaralhadas={mockQuestoesBase}
          turmas={[mockTurma]}
          stage="N-1"
          questoesOriginais={mockQuestoesBase}
        />
      );

      expect(screen.getAllByText(/AVALIAÇÃO ESCRITA \(EXAME \/ N-1\)/i).length).toBeGreaterThanOrEqual(1);
    });

    it('deve renderizar o caderno impresso com as questões e alternativas a), b), c), d)', () => {
      render(
        <ImpressaoTab
          alunosDaTurmaSelecionada={mockAlunos}
          selectedVersionIdx={0}
          setSelectedVersionIdx={jest.fn()}
          alunoAtual={mockAlunos[0]}
          tituloProva="Prova de Engenharia"
          turmaSelecionadaId="turma-eng-01"
          withId={true}
          questoesEmbaralhadas={mockQuestoesBase}
          turmas={[mockTurma]}
          stage="N2"
          questoesOriginais={mockQuestoesBase}
        />
      );

      // Questões presentes no caderno impresso
      expect(screen.getAllByText(/Primeira questão sobre SOLID/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/Segunda questão sobre Padrões de Projeto/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/Terceira questão sobre Arquitetura em Camadas/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/Quarta questão sobre Testes Unitários e CI\/CD/i).length).toBeGreaterThanOrEqual(1);

      // Letras de alternativas a) b) c) d) renderizadas
      expect(screen.getAllByText('a)').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('b)').length).toBeGreaterThanOrEqual(1);
    });

    it('deve exibir a identificação nominal do estudante no QR Code e no cabeçalho quando withId for true', () => {
      render(
        <ImpressaoTab
          alunosDaTurmaSelecionada={mockAlunos}
          selectedVersionIdx={0}
          setSelectedVersionIdx={jest.fn()}
          alunoAtual={mockAlunos[0]}
          tituloProva="Prova Nominal"
          turmaSelecionadaId="turma-eng-01"
          withId={true}
          questoesEmbaralhadas={mockQuestoesBase}
          turmas={[mockTurma]}
          stage="N2"
          questoesOriginais={mockQuestoesBase}
        />
      );

      expect(screen.getAllByText(/Gabriel Menezes/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/RA: 20241001/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/Versão A • N2/i).length).toBeGreaterThanOrEqual(1);
    });
  });
});
