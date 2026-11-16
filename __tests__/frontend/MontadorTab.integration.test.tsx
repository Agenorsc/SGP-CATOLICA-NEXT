import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MontadorTab } from '@/components/montador/MontadorTab';

jest.mock('@/components/montador/HistoricoProvasSection', () => ({ HistoricoProvasSection: () => <div>Histórico simulado</div> }));
jest.mock('@/components/montador/ModalEspelhoProva', () => ({ ModalEspelhoProva: () => null }));

describe('TSK-37 — integração do Montador', () => {
  const onOpenNovaQuestao = jest.fn();
  const onIrParaImpressao = jest.fn();
  const props = {
    bancoQuestoes: [], questoesFiltradas: [], questoesSelecionadas: [], turmas: [],
    turmaSelecionadaId: '', setTurmaSelecionadaId: jest.fn(),
    tituloProva: 'Prova de integração', setTituloProva: jest.fn(),
    buscaQuestao: '', setBuscaQuestao: jest.fn(),
    cicloSelecionado: 'TODAS' as const, setCicloSelecionado: jest.fn(),
    filtroApenasTurma: false, setFiltroApenasTurma: jest.fn(),
    contagemCiclos: { todas: 0, n1: 0, n2: 0, n3: 0, exame: 0, geral: 0 },
    shuffleQ: false, setShuffleQ: jest.fn(), shuffleAlt: false, setShuffleAlt: jest.fn(),
    withId: false, setWithId: jest.fn(), pontuacaoTotal: 0,
    onOpenNovaQuestao, onEditQuestao: jest.fn(), onDeleteQuestao: jest.fn(),
    onAdicionarNaProva: jest.fn(), onRemoverDaProva: jest.fn(), onIrParaImpressao,
  };
  beforeEach(() => jest.clearAllMocks());

  it('mostra estado vazio sem turmas e questões', () => {
    render(<MontadorTab {...props} />);
    expect(screen.getByText('Nenhuma turma atribuída ao professor.')).toBeInTheDocument();
    expect(screen.getByText('Nenhuma questão no caderno.')).toBeInTheDocument();
  });

  it('abre o cadastro de questão a partir do montador', () => {
    render(<MontadorTab {...props} />);
    fireEvent.click(screen.getByRole('button', { name: /nova questão/i }));
    expect(onOpenNovaQuestao).toHaveBeenCalledTimes(1);
  });
});
