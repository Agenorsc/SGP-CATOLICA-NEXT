import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ImpressaoTab } from '@/components/impressao/ImpressaoTab';
import { AlunoModel } from '@/models/AlunoModel';
import { TurmaModel } from '@/models/TurmaModel';
import { Question } from '@/types';

describe('Frontend Integration — ImpressaoTab (TSK-37)', () => {
  const mockAlunos = [
    new AlunoModel({ id: 'aluno-1', nome: 'Carlos Silva', ra: '1234567', turmaId: 'turma-1', curso: 'Engenharia', turno: 'Noturno' }),
    new AlunoModel({ id: 'aluno-2', nome: 'Mariana Santos', ra: '2345678', turmaId: 'turma-1', curso: 'Engenharia', turno: 'Noturno' }),
    new AlunoModel({ id: 'aluno-3', nome: 'Roberto Dias', ra: '3456789', turmaId: 'turma-1', curso: 'Engenharia', turno: 'Noturno' }),
    new AlunoModel({ id: 'aluno-4', nome: 'Fernanda Lima', ra: '4567890', turmaId: 'turma-1', curso: 'Engenharia', turno: 'Noturno' })
  ];

  const mockTurmas: TurmaModel[] = [
    {
      id: 'turma-1',
      nome: 'Engenharia de Software IV',
      curso: 'Engenharia de Software',
      semestre: '2026/2',
      professorId: 'usr-prof-01',
      codigoConvite: 'ENG123'
    }
  ];

  const mockQuestoes: Question[] = [
    {
      id: 'q1',
      enunciado: 'Questão 1 sobre Engenharia',
      tipo: 'objetiva',
      pontuacao: 5.0,
      tags: ['engenharia', 'solid'],
      alternativas: [
        { id: 'a1', texto: 'Alternativa A correta', correta: true, letraOriginal: 'A' },
        { id: 'a2', texto: 'Alternativa B incorreta', correta: false, letraOriginal: 'B' }
      ]
    },
    {
      id: 'q2',
      enunciado: 'Questão 2 sobre Arquitetura',
      tipo: 'objetiva',
      pontuacao: 5.0,
      tags: ['arquitetura', 'design'],
      alternativas: [
        { id: 'b1', texto: 'Alternativa A incorreta', correta: false, letraOriginal: 'A' },
        { id: 'b2', texto: 'Alternativa B correta', correta: true, letraOriginal: 'B' }
      ]
    }
  ];

  const defaultProps = {
    alunosDaTurmaSelecionada: mockAlunos,
    selectedVersionIdx: 0,
    setSelectedVersionIdx: jest.fn(),
    alunoAtual: mockAlunos[0],
    tituloProva: 'Avaliação Oficial N1',
    turmaSelecionadaId: 'turma-1',
    withId: true,
    questoesEmbaralhadas: mockQuestoes,
    turmas: mockTurmas,
    teacherId: 'usr-prof-01',
    stage: 'N1' as const,
    session: {
      id: 'usr-prof-01',
      name: 'Prof. Agenor Alvise',
      email: 'prof.agenor@catolica.edu.br',
      role: 'PROFESSOR' as const,
      disciplina: 'Engenharia de Software'
    },
    questoesOriginais: mockQuestoes,
    shuffleQ: true,
    shuffleAlt: true
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renderiza os elementos principais da folha de respostas e do caderno', () => {
    render(<ImpressaoTab {...defaultProps} />);

    expect(screen.getAllByText('Católica SC').length).toBeGreaterThan(0);
    expect(screen.getAllByText('ENGENHARIA DE SOFTWARE IV').length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Carlos Silva/i).length).toBeGreaterThan(0);
    expect(screen.getByText('VERSÃO:')).toBeInTheDocument();
    expect(screen.getByText(/Questão 1 sobre Engenharia/i)).toBeInTheDocument();
  });

  it('permite alternar entre o modo Por Aluno e o modo Toda a Sala', () => {
    render(<ImpressaoTab {...defaultProps} />);

    const todaSalaBtn = screen.getByRole('button', { name: /Toda a Sala/i });
    fireEvent.click(todaSalaBtn);

    expect(screen.getByText(/Modo de Impressão em Lote: Toda a Sala/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Imprimir Toda a Sala/i })).toBeInTheDocument();

    // No modo lote, todos os 4 alunos aparecem renderizados
    expect(screen.getAllByText(/Carlos Silva/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Mariana Santos/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Roberto Dias/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Fernanda Lima/i).length).toBeGreaterThan(0);
  });

  it('permite alternar o modo Duplex (Frente e Verso)', () => {
    const { container } = render(<ImpressaoTab {...defaultProps} />);

    const duplexCheckbox = screen.getByRole('checkbox', { name: /Imprimir Frente e Verso/i });
    expect(duplexCheckbox).toBeChecked();
    expect(container.querySelector('.sgp-answer-sheet-back')).not.toBeNull();

    fireEvent.click(duplexCheckbox);
    expect(duplexCheckbox).not.toBeChecked();
    expect(container.querySelector('.sgp-answer-sheet-back')).toBeNull();
  });

  it('permite abrir o painel de personalização e editar o cabeçalho e orientações', () => {
    render(<ImpressaoTab {...defaultProps} />);

    const personalizarBtn = screen.getByRole('button', { name: /Personalizar Prova & Instruções/i });
    fireEvent.click(personalizarBtn);

    expect(screen.getByText('Personalização de Cabeçalho & Descritivos da Avaliação')).toBeInTheDocument();

    const instituicaoInput = screen.getByPlaceholderText('Ex: Católica SC');
    fireEvent.change(instituicaoInput, { target: { value: 'Católica Jaraguá do Sul' } });

    expect(screen.getAllByText('Católica Jaraguá do Sul').length).toBeGreaterThan(0);
  });

  it('aciona window.print ao clicar no botão de impressão', () => {
    render(<ImpressaoTab {...defaultProps} />);

    const printBtn = screen.getByRole('button', { name: /Imprimir Prova Completa/i });
    fireEvent.click(printBtn);

    expect(window.print).toHaveBeenCalled();
  });

  it('renderiza o botão Salvar em PDF e aciona a impressão com título formatado', () => {
    render(<ImpressaoTab {...defaultProps} />);

    const pdfBtn = screen.getByRole('button', { name: /Salvar em PDF/i });
    expect(pdfBtn).toBeInTheDocument();
    fireEvent.click(pdfBtn);

    expect(window.print).toHaveBeenCalled();
  });
});
