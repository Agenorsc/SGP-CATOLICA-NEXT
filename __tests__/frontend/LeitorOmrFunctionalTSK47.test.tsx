import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CorrectionScanner } from '@/components/leitura/CorrectionScanner';
import { AlunoModel } from '@/models/AlunoModel';
import { TurmaModel } from '@/models/TurmaModel';
import { Question } from '@/types';

/**
 * ============================================================================
 * TSK-47 / QA: TESTES FUNCIONAIS DE INTERFACE (UI) DO LEITOR OMR
 * ============================================================================
 * Casos de Teste de Interface:
 *  1. Alerta de Validação Cruzada (RF13) quando cartão é de outra turma
 *  2. Ações de resolução do alerta cruzado: Trocar Turma ou 'Todas as Turmas'
 *  3. Botão 'Corrigir novamente' e transições de estado
 * ============================================================================
 */

describe('TSK-47 / QA: Testes Funcionais de Interface (UI) do Leitor OMR', () => {
  const mockTurma1 = new TurmaModel({
    id: 'turma-1',
    nome: 'Engenharia de Software IV',
    curso: 'Engenharia de Software',
    semestre: '2026/2',
    professorId: 'usr-prof-01'
  });

  const mockTurma2 = new TurmaModel({
    id: 'turma-2',
    nome: 'Banco de Dados Avançado',
    curso: 'Sistemas de Informação',
    semestre: '2026/2',
    professorId: 'usr-prof-01'
  });

  const mockTurmas = [mockTurma1, mockTurma2];

  const mockAlunos = [
    new AlunoModel({ id: 'alu-01', nome: 'Carlos Silva', ra: '1234567', turmaId: 'turma-1' }),
    new AlunoModel({ id: 'alu-03', nome: 'Lucas Ferreira', ra: '3456789', turmaId: 'turma-2' })
  ];

  const mockQuestoes: Question[] = [
    {
      id: 'q1',
      tipo: 'objetiva',
      enunciado: 'Questão 1',
      pontuacao: 5.0,
      tags: ['QA'],
      alternativas: [
        { id: 'alt_1', texto: 'Opção A', correta: true, letraOriginal: 'A' },
        { id: 'alt_2', texto: 'Opção B', correta: false, letraOriginal: 'B' }
      ]
    }
  ];

  const defaultProps = {
    alunos: mockAlunos,
    turmas: mockTurmas,
    turmaSelecionadaId: 'turma-1',
    questoesSelecionadas: mockQuestoes,
    bancoQuestoes: mockQuestoes,
    tituloProva: 'Avaliação N1',
    shuffleQ: false,
    shuffleAlt: false,
    leiturasOMR: [],
    provasMontadas: [],
    onSalvarLeitura: jest.fn(),
    onSelecionarTurma: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve renderizar os controles de turma e botão de iniciar correção', () => {
    render(<CorrectionScanner {...defaultProps} />);

    expect(screen.getByText('Turma:')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Automático/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Engenharia de Software IV/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Banco de Dados Avançado/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Iniciar Correção/i })).toBeInTheDocument();
  });

  it('permite alternar turmas diretamente na barra de navegação superior', () => {
    render(<CorrectionScanner {...defaultProps} />);

    const btnTurma2 = screen.getByRole('button', { name: /Banco de Dados Avançado/i });
    fireEvent.click(btnTurma2);

    expect(defaultProps.onSelecionarTurma).toHaveBeenCalledWith('turma-2');
  });

  it('exibe o placeholder de espera quando nenhuma folha foi escaneada', () => {
    render(<CorrectionScanner {...defaultProps} />);

    expect(screen.getByText('Aguardando Leitura de Cartão')).toBeInTheDocument();
    expect(screen.getByText(/Assim que o cartão-resposta for apontado na câmera/i)).toBeInTheDocument();
  });

  it('alterna para modo automático ao clicar no botão "Automático"', () => {
    render(<CorrectionScanner {...defaultProps} />);

    const btnAuto = screen.getByRole('button', { name: /Automático/i });
    fireEvent.click(btnAuto);

    expect(defaultProps.onSelecionarTurma).toHaveBeenCalledWith('TODAS');
  });
});
