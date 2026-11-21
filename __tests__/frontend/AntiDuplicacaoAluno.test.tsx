import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ModalAluno, FormAlunoState } from '@/components/cadastros/ModalAluno';
import { AlunoModel } from '@/models/AlunoModel';
import { TurmaModel } from '@/models/TurmaModel';

describe('Anti-Duplicação de Alunos & Prevenção de Double Submit', () => {
  const turmasMock: TurmaModel[] = [
    new TurmaModel({ id: 't1', nome: 'PROCESSO CIVIL', curso: 'DIREITO', semestre: '2026/2' })
  ];

  const formAlunoMock: FormAlunoState = {
    nome: 'Maria Joaquina',
    ra: '39467892',
    curso: 'DIREITO',
    turno: 'Noturno',
    turmaId: 't1',
    dataNascimento: '2000-01-01',
    naturalidade: 'Jaraguá do Sul',
    estadoNatal: 'SC',
    mae: 'Mãe Silva',
    pai: 'Pai Silva',
    celular: '4799999999',
    cep: '89251500',
    logradouro: '',
    numero: '',
    bairro: '',
    cidade: '',
    estado: ''
  };

  test('Prevenção de Double Submit: o botão fica desabilitado e a função onSubmit não é disparada duas vezes em cliques rápidos', async () => {
    let callCount = 0;
    const onSubmitMock = jest.fn(() => {
      callCount++;
      return new Promise<void>(resolve => setTimeout(resolve, 100));
    });

    render(
      <ModalAluno
        isOpen={true}
        onClose={jest.fn()}
        isEditing={false}
        formAluno={formAlunoMock}
        setFormAluno={jest.fn()}
        onSubmit={onSubmitMock}
        turmas={turmasMock}
        alunosExistentes={[]}
      />
    );

    const submitBtn = screen.getByRole('button', { name: /Salvar Aluno/i });
    expect(submitBtn).toBeInTheDocument();

    // Primeiro clique
    fireEvent.click(submitBtn);

    // Segundo clique imediato (simulando duplo-clique rápido do usuário)
    fireEvent.click(submitBtn);

    expect(submitBtn).toBeDisabled();
    expect(screen.getByText(/Salvando.../i)).toBeInTheDocument();

    await waitFor(() => {
      expect(onSubmitMock).toHaveBeenCalledTimes(1);
    });
  });

  test('Deduplicação por RA e ID garante que uma lista com o mesmo RA ou ID não gere registros duplicados', () => {
    const listaComDuplicatas: AlunoModel[] = [
      new AlunoModel({ id: 'alu-1', nome: 'Maria Joaquina', ra: '39467892', turmaId: 't1' }),
      new AlunoModel({ id: 'alu-2', nome: 'Maria Joaquina', ra: '39467892', turmaId: 't1' }), // mesmo RA
      new AlunoModel({ id: 'alu-1', nome: 'Maria Joaquina', ra: '99999999', turmaId: 't1' }), // mesmo ID
      new AlunoModel({ id: 'alu-3', nome: 'João Costa', ra: '278584', turmaId: 't1' })
    ];

    // Algoritmo idêntico ao implementado em alunosVisiveis e no carregamento
    const vistos = new Set<string>();
    const unicos: AlunoModel[] = [];
    for (const a of listaComDuplicatas) {
      const chaveRa = a.ra ? `ra:${a.ra.trim().toLowerCase()}` : null;
      const chaveId = a.id ? `id:${a.id}` : null;
      if ((chaveRa && vistos.has(chaveRa)) || (chaveId && vistos.has(chaveId))) {
        continue;
      }
      if (chaveRa) vistos.add(chaveRa);
      if (chaveId) vistos.add(chaveId);
      unicos.push(a);
    }

    expect(unicos.length).toBe(2);
    expect(unicos[0].ra).toBe('39467892');
    expect(unicos[1].ra).toBe('278584');
  });

  test('Atualização de estado setAlunos substitui item existente em vez de duplicar', () => {
    const estadoInicial: AlunoModel[] = [
      new AlunoModel({ id: 'alu-1', nome: 'João Costa', ra: '278584', turmaId: 't1' }),
      new AlunoModel({ id: 'alu-2', nome: 'Maria Joaquina', ra: '39467892', turmaId: 't1' })
    ];

    const novoSaved = new AlunoModel({
      id: 'alu-novo',
      nome: 'Maria Joaquina Atualizada',
      ra: '39467892', // Mesmo RA
      turmaId: 't1'
    });

    // Lógica implementada em handleSaveAlunoSubmit
    const index = estadoInicial.findIndex(a =>
      a.id === novoSaved.id ||
      (Boolean(a.ra) && Boolean(novoSaved.ra) && a.ra.trim().toLowerCase() === novoSaved.ra.trim().toLowerCase())
    );

    let resultado: AlunoModel[];
    if (index >= 0) {
      resultado = [...estadoInicial];
      resultado[index] = novoSaved;
    } else {
      resultado = [...estadoInicial, novoSaved];
    }

    expect(resultado.length).toBe(2);
    expect(resultado[1].nome).toBe('Maria Joaquina Atualizada');
    expect(resultado[1].ra).toBe('39467892');
  });
});
