import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { RelatoriosTab } from '@/components/relatorios/RelatoriosTab';
import { AlunoModel, TurmaModel } from '@/models';
import { LeituraOMRRegistro } from '@/types';

describe('Frontend Integration — RelatoriosTab (TSK-37)', () => {
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

  const mockAlunos: AlunoModel[] = [
    new AlunoModel({
      id: 'aluno-1',
      nome: 'Carlos Silva',
      ra: '1234567',
      turmaId: 'turma-1',
      curso: 'Engenharia de Software',
      turno: 'Noturno',
      n1: 8.5,
      n2: 9.0,
      n3: 0
    }),
    new AlunoModel({
      id: 'aluno-2',
      nome: 'Mariana Santos',
      ra: '2345678',
      turmaId: 'turma-1',
      curso: 'Engenharia de Software',
      turno: 'Noturno',
      n1: 4.0,
      n2: 5.5,
      n3: 0
    })
  ];

  const mockLeituras: LeituraOMRRegistro[] = [
    {
      id: 'leit-1',
      provaMontadaId: 'prova-1',
      alunoId: 'aluno-1',
      alunoNome: 'Carlos Silva',
      ra: '1234567',
      turmaId: 'turma-1',
      turmaNome: 'Engenharia de Software IV',
      stage: 'N1',
      materia: 'Engenharia de Software IV',
      versao: 'Versão A',
      notaCalculada: 8.5,
      acertos: 8,
      totalQuestoes: 10,
      respostasDetectadas: { 1: 'A', 2: 'B' },
      dataLeitura: new Date().toISOString()
    }
  ];

  const defaultProps = {
    alunos: mockAlunos,
    leiturasOMR: mockLeituras,
    turmas: mockTurmas,
    provasMontadas: [],
    bancoQuestoes: [],
    buscaRelatorio: '',
    setBuscaRelatorio: jest.fn(),
    alunosFiltradosRelatorio: mockAlunos,
    onExportarCsv: jest.fn(),
    onExportarExcel: jest.fn(),
    onExcluirNota: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renderiza os cards de métricas (Média Geral, Taxa de Aprovação, Provas Corrigidas)', () => {
    render(<RelatoriosTab {...defaultProps} />);

    expect(screen.getByText('Filtrar por:')).toBeInTheDocument();
    expect(screen.getByText('Média Geral da Turma')).toBeInTheDocument();
    expect(screen.getByText('Taxa de Aprovação')).toBeInTheDocument();
    expect(screen.getByText('Provas Corrigidas')).toBeInTheDocument();
  });

  it('permite alternar filtros de escopo por ciclo e por turma via seletores', () => {
    render(<RelatoriosTab {...defaultProps} />);

    const selects = screen.getAllByRole('combobox');
    expect(selects.length).toBeGreaterThanOrEqual(3);

    // O terceiro select é a etapa avaliativa (TODAS, N1, N2, N3)
    const selectCiclo = selects[2];
    fireEvent.change(selectCiclo, { target: { value: 'N1' } });

    expect(screen.getAllByText(/Avaliação N1/i).length).toBeGreaterThan(0);
  });

  it('aciona o callback de exportação Excel', () => {
    render(<RelatoriosTab {...defaultProps} />);

    const excelBtn = screen.getByRole('button', { name: /Excel \(\.xlsx\)/i });
    fireEvent.click(excelBtn);
    expect(defaultProps.onExportarExcel).toHaveBeenCalledWith(expect.objectContaining({
      semestre: '2026/2'
    }));
  });

  it('permite alternar para Lançamentos OMR e abrir modal de exclusão', async () => {
    render(<RelatoriosTab {...defaultProps} />);

    const abaLeituras = screen.getByRole('button', { name: /Lançamentos OMR & Exclusão de Notas/i });
    fireEvent.click(abaLeituras);

    // O aluno avaliado na leitura deve estar na tabela
    expect(screen.getAllByText(/Carlos Silva/i).length).toBeGreaterThan(0);

    // Botão de excluir nota
    const btnExcluir = screen.getByTitle('Excluir Nota');
    fireEvent.click(btnExcluir);

    // Modal de confirmação deve aparecer
    expect(screen.getByText('Excluir Nota do Aluno')).toBeInTheDocument();
    expect(screen.getByText(/Deseja realmente excluir a nota de/i)).toBeInTheDocument();

    // Confirmar exclusão
    const btnConfirmar = screen.getByRole('button', { name: /Confirmar Exclusão/i });
    fireEvent.click(btnConfirmar);

    await waitFor(() => {
      expect(defaultProps.onExcluirNota).toHaveBeenCalledWith('leit-1');
    });
  });

  it('abre ModalDetalheAluno (Print 2) ao clicar no nome do aluno', () => {
    render(<RelatoriosTab {...defaultProps} />);

    // Clicar no nome do aluno Carlos Silva ou no botão Detalhes
    const elAluno = screen.getByText('Carlos Silva');
    fireEvent.click(elAluno);

    // ModalDetalheAluno deve exibir a evolução temporal e mapa de calor
    expect(screen.getByText(/Evolução Temporal do Desempenho/i)).toBeInTheDocument();
    expect(screen.getByText(/Mapa de Calor das Questões Realizadas/i)).toBeInTheDocument();
  });

  it('abre ModalStatusProvaOmr (Print 1) ao clicar na nota N1 do aluno', () => {
    render(<RelatoriosTab {...defaultProps} />);

    // O badge da nota N1 de Carlos Silva tem title 'Ver conferência e gabarito da Etapa N1 de Carlos Silva'
    const badgeN1 = screen.getByTitle('Ver conferência e gabarito da Etapa N1 de Carlos Silva');
    fireEvent.click(badgeN1);

    // ModalStatusProvaOmr deve exibir o cabeçalho idêntico ao scanner móvel
    expect(screen.getByText(/Leitor OMR Unificado/i)).toBeInTheDocument();
    expect(screen.getByText(/Prova corrigida e nota registrada/i)).toBeInTheDocument();
    expect(screen.getByText('Duplicadas')).toBeInTheDocument();
    expect(screen.getByText('Em Branco')).toBeInTheDocument();
  });
});
