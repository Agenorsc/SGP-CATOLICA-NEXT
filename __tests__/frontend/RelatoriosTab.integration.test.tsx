import React from 'react';
import { render, screen } from '@testing-library/react';
import { RelatoriosTab } from '@/components/relatorios/RelatoriosTab';

jest.mock('@/components/relatorios/GraficoDificuldadeQuestoes', () => ({ GraficoDificuldadeQuestoes: () => null }));
jest.mock('@/components/relatorios/PainelAnaliseDistratores', () => ({ PainelAnaliseDistratores: () => null }));
jest.mock('@/components/relatorios/ModalDetalheAluno', () => ({ ModalDetalheAluno: () => null }));

describe('TSK-37 — integração dos relatórios', () => {
  it('renderiza indicadores com dados vazios sem disparar exportação', () => {
    const onExportarExcel = jest.fn();
    render(<RelatoriosTab
      alunos={[]} leiturasOMR={[]} turmas={[]}
      buscaRelatorio="" setBuscaRelatorio={jest.fn()}
      alunosFiltradosRelatorio={[]}
      onExportarExcel={onExportarExcel}
    />);
    expect(screen.getByText('Média Geral da Turma')).toBeInTheDocument();
    expect(screen.getByText('Provas Corrigidas')).toBeInTheDocument();
    expect(onExportarExcel).not.toHaveBeenCalled();
  });
});
