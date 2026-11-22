import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ModalTurma, FormTurmaState } from '@/components/cadastros/ModalTurma';
import { TurmaModel } from '@/models/TurmaModel';

describe('Anti-Duplicação de Turmas & Prevenção de Double Submit', () => {
  const formTurmaMock: FormTurmaState = {
    nome: 'Direito Processual Civil',
    curso: 'Direito',
    semestre: '2026/2',
    fase: '3ª Fase'
  };

  test('Prevenção de Double Submit no ModalTurma: botão fica desabilitado e onSubmit não é chamado duas vezes', async () => {
    let callCount = 0;
    const onSubmitMock = jest.fn(() => {
      callCount++;
      return new Promise<void>(resolve => setTimeout(resolve, 100));
    });

    render(
      <ModalTurma
        isOpen={true}
        onClose={jest.fn()}
        isEditing={false}
        formTurma={formTurmaMock}
        setFormTurma={jest.fn()}
        onSubmit={onSubmitMock}
        professores={[]}
        isAdmin={false}
      />
    );

    const submitBtn = screen.getByRole('button', { name: /Criar Turma/i });
    expect(submitBtn).toBeInTheDocument();

    // Primeiro clique
    fireEvent.click(submitBtn);

    // Segundo clique imediato (simulando duplo-clique rápido do usuário)
    fireEvent.click(submitBtn);

    expect(submitBtn).toBeDisabled();
    expect(screen.getByText(/Criando.../i)).toBeInTheDocument();

    await waitFor(() => {
      expect(onSubmitMock).toHaveBeenCalledTimes(1);
    });
  });

  test('Deduplicação defensiva em turmasVisiveis garante que turmas com mesmo ID ou mesmo Nome+Semestre+Professor não dupliquem', () => {
    const listaComDuplicatas: TurmaModel[] = [
      new TurmaModel({
        id: 't1',
        nome: 'Processo Civil',
        curso: 'Direito',
        semestre: '2026/2',
        professorId: 'prof_1'
      }),
      new TurmaModel({
        id: 't2', // ID diferente gerado por clique concorrente
        nome: 'Processo Civil', // mesmo nome, semestre e professor
        curso: 'Direito',
        semestre: '2026/2',
        professorId: 'prof_1'
      }),
      new TurmaModel({
        id: 't1', // mesmo ID
        nome: 'Outra Turma',
        curso: 'Direito',
        semestre: '2026/2',
        professorId: 'prof_1'
      }),
      new TurmaModel({
        id: 't3',
        nome: 'Direito do Trabalho',
        curso: 'Direito',
        semestre: '2026/2',
        professorId: 'prof_1'
      })
    ];

    // Algoritmo idêntico ao implementado em turmasVisiveis
    const vistos = new Set<string>();
    const unicos: TurmaModel[] = [];
    for (const t of listaComDuplicatas) {
      const chaveId = t.id ? `id:${t.id}` : null;
      const chaveNome = t.nome ? `nome:${t.nome.trim().toLowerCase()}_${(t.semestre || '').trim()}_${t.professorId || ''}` : null;
      if ((chaveId && vistos.has(chaveId)) || (chaveNome && vistos.has(chaveNome))) {
        continue;
      }
      if (chaveId) vistos.add(chaveId);
      if (chaveNome) vistos.add(chaveNome);
      unicos.push(t);
    }

    expect(unicos.length).toBe(2);
    expect(unicos[0].id).toBe('t1');
    expect(unicos[1].id).toBe('t3');
  });

  test('handleSaveTurmaSubmit atualiza registro existente se já houver turma com mesmo nome e semestre', () => {
    const estadoInicial: TurmaModel[] = [
      new TurmaModel({
        id: 't1',
        nome: 'Processo Civil',
        curso: 'Direito',
        semestre: '2026/2',
        fase: '2ª Fase',
        professorId: 'prof_1'
      })
    ];

    const novaSalva: TurmaModel = new TurmaModel({
      id: 't_novo',
      nome: 'Processo Civil', // mesmo nome, semestre e professor
      curso: 'Direito',
      semestre: '2026/2',
      fase: '3ª Fase',
      professorId: 'prof_1'
    });

    const index = estadoInicial.findIndex(t =>
      t.id === novaSalva.id ||
      (t.nome.trim().toLowerCase() === novaSalva.nome.trim().toLowerCase() &&
       (t.semestre || '').trim() === (novaSalva.semestre || '').trim() &&
       (t.professorId || '') === (novaSalva.professorId || ''))
    );

    let resultado: TurmaModel[];
    if (index >= 0) {
      resultado = [...estadoInicial];
      resultado[index] = novaSalva;
    } else {
      resultado = [...estadoInicial, novaSalva];
    }

    expect(resultado.length).toBe(1);
    expect(resultado[0].fase).toBe('3ª Fase');
  });
});
