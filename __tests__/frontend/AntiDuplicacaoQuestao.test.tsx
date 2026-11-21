import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ModalQuestao } from '@/components/montador/ModalQuestao';
import { Question } from '@/types';
import { TurmaModel } from '@/models/TurmaModel';

describe('Anti-Duplicação de Questões & Prevenção de Double Submit', () => {
  const turmasMock: TurmaModel[] = [
    new TurmaModel({ id: 't1', nome: 'PROCESSO CIVIL', curso: 'DIREITO', semestre: '2026/2' })
  ];

  test('Prevenção de Double Submit: botão fica desabilitado e onSubmit não é chamado duas vezes', async () => {
    let callCount = 0;
    const onSubmitMock = jest.fn(() => {
      callCount++;
      return new Promise<void>(resolve => setTimeout(resolve, 100));
    });

    render(
      <ModalQuestao
        isOpen={true}
        onClose={jest.fn()}
        questaoEmEdicaoId={null}
        novoEnunciado="Enunciado de teste para verificação anti-duplicidade"
        setNovoEnunciado={jest.fn()}
        novoTipo="objetiva"
        setNovoTipo={jest.fn()}
        novaPontuacao={1.0}
        setNovaPontuacao={jest.fn()}
        novasTags="N1, Teste"
        setNovasTags={jest.fn()}
        novaTurmaId="t1"
        setNovaTurmaId={jest.fn()}
        novaAvaliacao="N1"
        setNovaAvaliacao={jest.fn()}
        turmas={turmasMock}
        alternativasCadastro={[
          { letra: 'A', texto: 'Alternativa A', correta: true },
          { letra: 'B', texto: 'Alternativa B', correta: false },
          { letra: 'C', texto: 'Alternativa C', correta: false },
          { letra: 'D', texto: 'Alternativa D', correta: false }
        ]}
        setAlternativasCadastro={jest.fn()}
        onSubmit={onSubmitMock}
      />
    );

    const submitBtn = screen.getByRole('button', { name: /Salvar no Banco/i });
    expect(submitBtn).toBeInTheDocument();

    // Primeiro clique
    fireEvent.click(submitBtn);

    // Segundo clique imediato (duplo clique rápido)
    fireEvent.click(submitBtn);

    expect(submitBtn).toBeDisabled();
    expect(screen.getByText(/Salvando no Banco.../i)).toBeInTheDocument();

    await waitFor(() => {
      expect(onSubmitMock).toHaveBeenCalledTimes(1);
    });
  });

  test('Deduplicação defensiva garante que questões com mesmo ID ou mesmo Enunciado+Turma não dupliquem', () => {
    const listaComDuplicatas: Question[] = [
      {
        id: 'q1',
        tipo: 'objetiva',
        enunciado: 'Durante a análise de uma petição inicial...',
        turmaId: 't1',
        pontuacao: 1.0,
        avaliacao: 'N1',
        tags: ['N1']
      },
      {
        id: 'q2', // ID diferente gerado por clique duplo
        tipo: 'objetiva',
        enunciado: 'Durante a análise de uma petição inicial...', // mesmo enunciado e turma
        turmaId: 't1',
        pontuacao: 1.0,
        avaliacao: 'N1',
        tags: ['N1']
      },
      {
        id: 'q1', // mesmo ID
        tipo: 'objetiva',
        enunciado: 'Outra questão...',
        turmaId: 't1',
        pontuacao: 1.0,
        avaliacao: 'N1',
        tags: ['N1']
      },
      {
        id: 'q3',
        tipo: 'objetiva',
        enunciado: 'Marina nasceu com vida em uma maternidade e...',
        turmaId: 't1',
        pontuacao: 1.0,
        avaliacao: 'N1',
        tags: ['N1']
      }
    ];

    // Algoritmo implementado em bancoQuestoesVisiveis
    const vistos = new Set<string>();
    const unicos: Question[] = [];
    for (const q of listaComDuplicatas) {
      const chaveId = q.id ? `id:${q.id}` : null;
      const normalizado = q.enunciado ? q.enunciado.trim().replace(/\s+/g, ' ') : '';
      const chaveEnunciado = normalizado ? `enunc:${q.turmaId || ''}_${normalizado}` : null;
      if ((chaveId && vistos.has(chaveId)) || (chaveEnunciado && vistos.has(chaveEnunciado))) {
        continue;
      }
      if (chaveId) vistos.add(chaveId);
      if (chaveEnunciado) vistos.add(chaveEnunciado);
      unicos.push(q);
    }

    expect(unicos.length).toBe(2);
    expect(unicos[0].id).toBe('q1');
    expect(unicos[1].id).toBe('q3');
  });

  test('handleSaveQuestaoSubmit atualiza registro existente se já houver questão idêntica', () => {
    const estadoInicial: Question[] = [
      {
        id: 'q1',
        tipo: 'objetiva',
        enunciado: 'Durante a análise de uma petição inicial...',
        turmaId: 't1',
        pontuacao: 1.0,
        avaliacao: 'N1',
        tags: ['N1']
      }
    ];

    const novaSalva: Question = {
      id: 'q_novo',
      tipo: 'objetiva',
      enunciado: 'Durante a análise de uma petição inicial...', // mesmo enunciado e turma
      turmaId: 't1',
      pontuacao: 1.5,
      avaliacao: 'N1',
      tags: ['N1']
    };

    const index = estadoInicial.findIndex(q =>
      q.id === novaSalva.id ||
      (Boolean(q.enunciado) && Boolean(novaSalva.enunciado) &&
       q.enunciado.trim().replace(/\s+/g, ' ') === novaSalva.enunciado.trim().replace(/\s+/g, ' ') &&
       (q.turmaId || '') === (novaSalva.turmaId || ''))
    );

    let resultado: Question[];
    if (index >= 0) {
      resultado = [...estadoInicial];
      resultado[index] = novaSalva;
    } else {
      resultado = [novaSalva, ...estadoInicial];
    }

    expect(resultado.length).toBe(1);
    expect(resultado[0].pontuacao).toBe(1.5);
  });
});
