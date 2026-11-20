import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CockpitAnaliseQuestoes } from '@/components/relatorios/CockpitAnaliseQuestoes';
import { ItemEstatisticaQuestao } from '@/types';

describe('Frontend Component — CockpitAnaliseQuestoes', () => {
  const mockQuestoes: ItemEstatisticaQuestao[] = [
    {
      numero: 1,
      enunciado: 'Qual o princípio fundamental da legalidade administrativa?',
      tags: ['Direito', 'Administrativo'],
      pontuacao: 1.0,
      totalSubmissoes: 20,
      totalAcertos: 16,
      totalErros: 4,
      totalEmBranco: 0,
      totalAnuladas: 0,
      taxaAcerto: 80,
      taxaErro: 20,
      gabaritoOficial: 'B',
      distratores: [],
      distratorCritico: { letra: 'C', quantidade: 3, percentual: 15 },
      distribuicaoOpcoes: {
        A: { quantidade: 1, percentual: 5 },
        B: { quantidade: 16, percentual: 80 },
        C: { quantidade: 3, percentual: 15 },
        D: { quantidade: 0, percentual: 0 }
      }
    },
    {
      numero: 2,
      enunciado: 'Sobre os atos nulos e anuláveis, assinale a opção correta.',
      tags: ['Direito'],
      pontuacao: 1.0,
      totalSubmissoes: 20,
      totalAcertos: 6,
      totalErros: 14,
      totalEmBranco: 0,
      totalAnuladas: 0,
      taxaAcerto: 30,
      taxaErro: 70,
      gabaritoOficial: 'A',
      distratores: [],
      distratorCritico: { letra: 'D', quantidade: 10, percentual: 50 },
      distribuicaoOpcoes: {
        A: { quantidade: 6, percentual: 30 },
        B: { quantidade: 2, percentual: 10 },
        C: { quantidade: 2, percentual: 10 },
        D: { quantidade: 10, percentual: 50 }
      }
    }
  ];

  it('renderiza o título do Cockpit e o histograma com as questões', () => {
    render(<CockpitAnaliseQuestoes questoes={mockQuestoes} turmaNome="Turma A" />);

    expect(screen.getByText('Raio-X Pedagógico por Questão')).toBeInTheDocument();
    expect(screen.getByText('Histograma da Prova • Todas as Questões')).toBeInTheDocument();
    expect(screen.getByText('2 Questões')).toBeInTheDocument();
    expect(screen.getByText(/Média da Avaliação: 55%/i)).toBeInTheDocument();
  });

  it('exibe o guia pedagógico diferenciando Taxa de Acerto e Análise de Distratores', () => {
    render(<CockpitAnaliseQuestoes questoes={mockQuestoes} turmaNome="Turma A" />);

    expect(screen.getByText('Taxa de Acerto (Dificuldade do Item)')).toBeInTheDocument();
    expect(screen.getByText('Análise de Distratores (Pegadinhas)')).toBeInTheDocument();
  });

  it('permite alternar entre os modos de layout (Lista, Cards e Foco Individual)', () => {
    render(<CockpitAnaliseQuestoes questoes={mockQuestoes} turmaNome="Turma A" />);

    // Alternar para modo Cards
    const btnCards = screen.getByTitle('Layout em Grade de Cards');
    fireEvent.click(btnCards);
    expect(screen.getAllByText(/Taxa de Acerto:/i).length).toBeGreaterThan(0);

    // Alternar para modo Foco Individual
    const btnFoco = screen.getByTitle('Modo Foco em 1 Questão com Navegação Passo a Passo');
    fireEvent.click(btnFoco);
    expect(screen.getByText('Texto da Questão')).toBeInTheDocument();
    expect(screen.getByText('Distribuição das Respostas Assinaladas pelos Alunos')).toBeInTheDocument();
  });

  it('permite selecionar uma questão clicando na coluna do histograma', () => {
    render(<CockpitAnaliseQuestoes questoes={mockQuestoes} turmaNome="Turma A" />);

    // Q.02 tem rótulo Q.02 no histograma
    const rotulosQ2 = screen.getAllByText('Q.02');
    fireEvent.click(rotulosQ2[0]);

    // Deve expandir detalhes e exibir a gaveta pedagógica da questão 02
    expect(screen.getByText('Texto Integral da Questão 02:')).toBeInTheDocument();
    expect(screen.getAllByText(/Sobre os atos nulos e anuláveis/i).length).toBeGreaterThan(0);
  });
});
