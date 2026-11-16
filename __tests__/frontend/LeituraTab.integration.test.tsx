import React from 'react';
import { render, screen } from '@testing-library/react';
import { LeituraTab } from '@/components/leitura/LeituraTab';

// Jest resolve o mesmo módulo para caminhos relativos e pelo alias @/.
jest.mock('@/components/leitura/CorrectionScanner', () => ({
  CorrectionScanner: ({ tituloProva, turmaSelecionadaId }: { tituloProva: string; turmaSelecionadaId: string }) => (
    <div data-testid="scanner-integrado">{tituloProva} / {turmaSelecionadaId}</div>
  )
}));

describe('TSK-37 — integração da aba Leitura', () => {
  it('encaminha o contexto da prova ao scanner', () => {
    render(<LeituraTab
      alunos={[]} turmas={[]} turmaSelecionadaId="turma-37"
      questoesSelecionadas={[]} tituloProva="Prova N3"
      shuffleQ={false} shuffleAlt={false} leiturasOMR={[]}
      onSalvarLeitura={jest.fn()}
    />);
    expect(screen.getByTestId('scanner-integrado')).toHaveTextContent('Prova N3 / turma-37');
  });
});
