import React from 'react';
import { render } from '@testing-library/react';
import { ImpressaoTab } from '@/components/impressao/ImpressaoTab';

jest.mock('@/components/common/QRCodeWrapper', () => ({
  QRCodeWrapper: () => <div data-testid="qr-code-mock" />
}));

describe('TSK-37 — integração da impressão', () => {
  it('renderiza o painel de impressão sem alunos e sem questões', () => {
    const { container } = render(<ImpressaoTab
      alunosDaTurmaSelecionada={[]}
      selectedVersionIdx={0}
      setSelectedVersionIdx={jest.fn()}
      alunoAtual={{ id: 'a-1', nome: 'Aluno Teste' } as React.ComponentProps<typeof ImpressaoTab>['alunoAtual']}
      tituloProva="Prova N3"
      turmaSelecionadaId="turma-37"
      withId={false}
      questoesEmbaralhadas={[]}
    />);
    expect(container.querySelector('.sgp-answer-sheet')).toBeInTheDocument();
  });
});
