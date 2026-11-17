import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { LeituraTab } from '@/components/leitura/LeituraTab';
import { MobileOmrScanner } from '@/components/leitura/MobileOmrScanner';
import { AlunoModel } from '@/models/AlunoModel';
import { TurmaModel } from '@/models/TurmaModel';
import { Question, LeituraOMRRegistro } from '@/types';

describe('Frontend Integration — LeituraTab & Scanner OMR (TSK-37)', () => {
  const mockAlunos = [
    new AlunoModel({ id: 'aluno-1', nome: 'Carlos Silva', ra: '1234567', turmaId: 'turma-1', curso: 'Engenharia', turno: 'Noturno' }),
    new AlunoModel({ id: 'aluno-2', nome: 'Mariana Santos', ra: '2345678', turmaId: 'turma-1', curso: 'Engenharia', turno: 'Noturno' })
  ];

  const mockTurmas: TurmaModel[] = [
    {
      id: 'turma-1',
      nome: 'Engenharia de Software IV',
      curso: 'Engenharia de Software',
      semestre: '2026/2',
      professorId: 'usr-prof-01',
      codigoConvite: 'ENG123'
    },
    {
      id: 'turma-2',
      nome: 'Banco de Dados',
      curso: 'Sistemas',
      semestre: '2026/2',
      professorId: 'usr-prof-01',
      codigoConvite: 'BD123'
    }
  ];

  const mockQuestoes: Question[] = [
    {
      id: 'q1',
      enunciado: 'Questão 1',
      tipo: 'objetiva',
      pontuacao: 5.0,
      tags: ['geral'],
      alternativas: [
        { id: 'a1', texto: 'A', correta: true, letraOriginal: 'A' },
        { id: 'a2', texto: 'B', correta: false, letraOriginal: 'B' }
      ]
    }
  ];

  const mockLeituras: LeituraOMRRegistro[] = [];

  const defaultProps = {
    alunos: mockAlunos,
    turmas: mockTurmas,
    turmaSelecionadaId: 'turma-1',
    questoesSelecionadas: mockQuestoes,
    bancoQuestoes: mockQuestoes,
    tituloProva: 'Avaliação N1',
    shuffleQ: true,
    shuffleAlt: true,
    leiturasOMR: mockLeituras,
    provasMontadas: [],
    onSalvarLeitura: jest.fn(),
    onSelecionarTurma: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renderiza o seletor de turmas e os controles da barra superior', () => {
    render(<LeituraTab {...defaultProps} />);

    expect(screen.getByText('Turma:')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Automático/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Engenharia de Software IV/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Banco de Dados/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Configurações/i })).toBeInTheDocument();
  });

  it('permite selecionar uma turma específica na barra de abas', () => {
    render(<LeituraTab {...defaultProps} />);

    const turmaBtn = screen.getByRole('button', { name: /Banco de Dados/i });
    fireEvent.click(turmaBtn);

    expect(defaultProps.onSelecionarTurma).toHaveBeenCalledWith('turma-2');
  });

  it('abre o painel de configurações avançadas e permite definir ciclo de contingência', () => {
    render(<LeituraTab {...defaultProps} />);

    const configBtn = screen.getByRole('button', { name: /Configurações/i });
    fireEvent.click(configBtn);

    expect(screen.getByText('Ciclo Avaliativo:')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'N1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'N2' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'N3' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'N-1' })).toBeInTheDocument();

    const n2Btn = screen.getByRole('button', { name: 'N2' });
    fireEvent.click(n2Btn);

    expect(screen.getByText(/Contingência ativa: Forçando registro das notas em N2/i)).toBeInTheDocument();
  });

  it('exibe o botão para iniciar a captura óptica de correção no estado IDLE', () => {
    render(<LeituraTab {...defaultProps} />);

    expect(screen.getByText('Câmera Desligada')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Iniciar Correção/i })).toBeInTheDocument();
  });

  it('renderiza o módulo de Scanner OMR Mobile dedicado com botão de retorno', () => {
    const mockOnVoltar = jest.fn();
    render(<MobileOmrScanner onVoltar={mockOnVoltar} alunos={mockAlunos} />);

    expect(screen.getByText('Scanner Mobile OMR')).toBeInTheDocument();
    const voltarBtn = screen.getByRole('button', { name: /Voltar/i });
    fireEvent.click(voltarBtn);

    expect(mockOnVoltar).toHaveBeenCalled();
  });
});
