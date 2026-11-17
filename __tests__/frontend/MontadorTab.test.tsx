import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MontadorTab } from '@/components/montador/MontadorTab';
import { Question, AvaliacaoCiclo, ProvaMontadaRegistro } from '@/types';
import { TurmaModel } from '@/models/TurmaModel';
import { ContagemCiclos } from '@/services/QuestionService';

describe('Frontend Integration — MontadorTab (TSK-37)', () => {
  const mockTurmas: TurmaModel[] = [
    {
      id: 'turma-1',
      nome: 'Engenharia de Software IV',
      curso: 'Engenharia de Software',
      semestre: '2026/2',
      professorId: 'prof-1',
      codigoConvite: 'ENG123'
    },
    {
      id: 'turma-2',
      nome: 'Banco de Dados Avançado',
      curso: 'Sistemas de Informação',
      semestre: '2026/2',
      professorId: 'prof-1',
      codigoConvite: 'BD123'
    }
  ];

  const mockQuestoes: Question[] = [
    {
      id: 'q1',
      enunciado: 'Qual o princípio do SOLID representado pela letra S?',
      tipo: 'objetiva',
      avaliacao: 'N1',
      pontuacao: 5.0,
      tags: ['solid'],
      alternativas: [
        { id: 'a1', texto: 'Single Responsibility Principle', correta: true, letraOriginal: 'A' },
        { id: 'a2', texto: 'Shared State Pattern', correta: false, letraOriginal: 'B' }
      ]
    },
    {
      id: 'q2',
      enunciado: 'O que caracteriza uma transação ACID em bancos de dados?',
      tipo: 'objetiva',
      avaliacao: 'N2',
      pontuacao: 5.0,
      tags: ['banco-de-dados'],
      alternativas: [
        { id: 'b1', texto: 'Atomicidade, Consistência, Isolamento, Durabilidade', correta: true, letraOriginal: 'A' },
        { id: 'b2', texto: 'Acesso Controlado e Indexação Direta', correta: false, letraOriginal: 'B' }
      ]
    }
  ];

  const mockContagemCiclos: ContagemCiclos = {
    todas: 2,
    n1: 1,
    n2: 1,
    n3: 0,
    exame: 0,
    geral: 0
  };

  const defaultProps = {
    bancoQuestoes: mockQuestoes,
    questoesFiltradas: mockQuestoes,
    questoesSelecionadas: [mockQuestoes[0]],
    turmas: mockTurmas,
    turmaSelecionadaId: 'turma-1',
    setTurmaSelecionadaId: jest.fn(),
    tituloProva: 'Avaliação de Engenharia',
    setTituloProva: jest.fn(),
    buscaQuestao: '',
    setBuscaQuestao: jest.fn(),
    cicloSelecionado: 'TODAS' as AvaliacaoCiclo | 'TODAS',
    setCicloSelecionado: jest.fn(),
    filtroApenasTurma: false,
    setFiltroApenasTurma: jest.fn(),
    contagemCiclos: mockContagemCiclos,
    shuffleQ: true,
    setShuffleQ: jest.fn(),
    shuffleAlt: true,
    setShuffleAlt: jest.fn(),
    withId: true,
    setWithId: jest.fn(),
    pontuacaoTotal: 5.0,
    provasMontadas: [] as ProvaMontadaRegistro[],
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

  it('renderiza o cabeçalho, seletor de turmas e botões de ação', () => {
    render(<MontadorTab {...defaultProps} />);

    expect(screen.getByText('Montador de Avaliações')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Nova Questão/i })).toBeInTheDocument();
    expect(screen.getByText('Engenharia de Software IV')).toBeInTheDocument();
    expect(screen.getByText('Banco de Dados Avançado')).toBeInTheDocument();
  });

  it('permite alternar entre turmas do professor', () => {
    render(<MontadorTab {...defaultProps} />);

    const turmaBtn = screen.getByText('Banco de Dados Avançado').closest('button');
    expect(turmaBtn).not.toBeNull();
    fireEvent.click(turmaBtn!);

    expect(defaultProps.setTurmaSelecionadaId).toHaveBeenCalledWith('turma-2');
  });

  it('permite abrir modal de criação de nova questão', () => {
    render(<MontadorTab {...defaultProps} />);

    const novaQuestaoBtn = screen.getByRole('button', { name: /Nova Questão/i });
    fireEvent.click(novaQuestaoBtn);

    expect(defaultProps.onOpenNovaQuestao).toHaveBeenCalled();
  });

  it('permite adicionar e remover questões do caderno de avaliação', () => {
    render(<MontadorTab {...defaultProps} />);

    // q2 não está selecionada, botão "Adicionar"
    const addBtn = screen.getByRole('button', { name: /Adicionar/i });
    fireEvent.click(addBtn);
    expect(defaultProps.onAdicionarNaProva).toHaveBeenCalledWith(mockQuestoes[1]);

    // q1 está no caderno selecionado, botão "Remover do Caderno"
    const removerBtn = screen.getByTitle('Remover do Caderno');
    fireEvent.click(removerBtn);
    expect(defaultProps.onRemoverDaProva).toHaveBeenCalledWith('q1');
  });

  it('bloqueia geração de prova e exibe aviso quando a pontuação total for diferente de 10.0', () => {
    render(<MontadorTab {...defaultProps} pontuacaoTotal={5.0} />);

    const gerarBtn = screen.getByRole('button', { name: /Salvar e Gerar Prova Montada/i });
    fireEvent.click(gerarBtn);

    expect(screen.getByText(/A soma das questões deve ser exatamente 10.0 pontos/i)).toBeInTheDocument();
    expect(defaultProps.onSalvarProva).not.toHaveBeenCalled();
    expect(defaultProps.onIrParaImpressao).not.toHaveBeenCalled();
  });

  it('gera caderno e gabarito com sucesso quando a pontuação soma exatamente 10.0 pontos', () => {
    const propsCom10Pontos = {
      ...defaultProps,
      questoesSelecionadas: mockQuestoes,
      pontuacaoTotal: 10.0
    };

    render(<MontadorTab {...propsCom10Pontos} />);

    const gerarBtn = screen.getByRole('button', { name: /Salvar e Gerar Prova Montada/i });
    fireEvent.click(gerarBtn);

    expect(defaultProps.onSalvarProva).toHaveBeenCalledWith(expect.objectContaining({
      titulo: 'Avaliação de Engenharia',
      turmaId: 'turma-1',
      totalQuestoes: 2,
      pontuacaoTotal: 10.0
    }));
    expect(defaultProps.onIrParaImpressao).toHaveBeenCalled();
  });

  it('permite alternar para a sub-aba de Histórico de Provas Geradas', () => {
    render(<MontadorTab {...defaultProps} />);

    const historicoTabBtn = screen.getByRole('button', { name: /Histórico de Provas Geradas/i });
    fireEvent.click(historicoTabBtn);

    expect(screen.getByText(/Nenhuma avaliação arquivada para/i)).toBeInTheDocument();
  });
});
